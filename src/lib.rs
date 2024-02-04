use arboard::{Clipboard as ArboardClipboard, ImageData};
use base64::{engine::general_purpose, Engine as _};
use clipboard_files;
use clipboard_master::{CallbackResult, ClipboardHandler, Master};
use clipboard_rs::{common::RustImage, Clipboard, ClipboardContext};
use clipboard_rs::{ContentFormat, RustImageData};
use image::{EncodableLayout, GenericImageView};
use std::sync::Mutex;
use std::{borrow::Cow, sync::Arc};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
mod util;

struct ClipboardMonitor<R>
where
    R: Runtime,
{
    app_handle: tauri::AppHandle<R>,
    running: Arc<Mutex<bool>>,
}

impl<R> ClipboardMonitor<R>
where
    R: Runtime,
{
    fn new(app_handle: tauri::AppHandle<R>, running: Arc<Mutex<bool>>) -> Self {
        Self {
            app_handle,
            running,
        }
    }
}

impl<R> ClipboardHandler for ClipboardMonitor<R>
where
    R: Runtime,
{
    fn on_clipboard_change(&mut self) -> CallbackResult {
        if !*self.running.lock().unwrap() {
            let _ = self
                .app_handle
                .emit_all("plugin:clipboard://clipboard-monitor/status", false);
            return CallbackResult::Stop;
        }
        let _ = self.app_handle.emit_all(
            "plugin:clipboard://clipboard-monitor/update",
            format!("clipboard update"),
        );
        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: std::io::Error) -> CallbackResult {
        let _ = self.app_handle.emit_all(
            "plugin:clipboard://clipboard-monitor/error",
            error.to_string(),
        );
        if !*self.running.lock().unwrap() {
            let _ = self
                .app_handle
                .emit_all("plugin:clipboard://clipboard-monitor/status", false);
            return CallbackResult::Stop;
        }
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}

pub struct ClipboardManager {
    running: Arc<Mutex<bool>>,
    clipboard: Arc<Mutex<ClipboardContext>>,
}

impl ClipboardManager {
    pub fn default() -> Self {
        return ClipboardManager {
            running: Arc::default(),
            clipboard: Arc::new(Mutex::from(ClipboardContext::new().unwrap())),
        };
    }

    pub fn has(&self, format: ContentFormat) -> Result<bool, String> {
        Ok(self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .has(format))
    }

    pub fn has_text(&self) -> Result<bool, String> {
        self.has(ContentFormat::Text)
    }

    pub fn has_rtf(&self) -> Result<bool, String> {
        self.has(ContentFormat::Rtf)
    }

    pub fn has_image(&self) -> Result<bool, String> {
        self.has(ContentFormat::Image)
    }

    pub fn has_html(&self) -> Result<bool, String> {
        self.has(ContentFormat::Html)
    }

    // Read from Clipboard APIs

    /// read text from clipboard
    pub fn read_text(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_text()
            .map_err(|err| err.to_string())
    }

    pub fn read_html(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_html()
            .map_err(|err| err.to_string())
    }

    pub fn read_rtf(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_rich_text()
            .map_err(|err| err.to_string())
    }

    /// read files from clipboard and return a `Vec<String>`
    pub fn read_files(&self) -> Result<Vec<String>, String> {
        let res = clipboard_files::read();
        match res {
            Ok(files) => {
                let files_str = files
                    .iter()
                    .map(|file| file.to_str().unwrap().to_string())
                    .collect::<Vec<_>>();
                Ok(files_str)
            }
            Err(err) => match err {
                clipboard_files::Error::NoFiles => Err("No files in clipboard".to_string()),
                _ => Err("Unknown error".to_string()),
            },
        }
    }

    /// read image from clipboard and return a base64 string
    pub fn read_image_base64(&self) -> Result<String, String> {
        let image_bytes = self.read_image_binary()?;
        let base64_str = general_purpose::STANDARD_NO_PAD.encode(&image_bytes);
        Ok(base64_str)
    }

    /// read image from clipboard and return a `Vec<u8>`
    pub fn read_image_binary(&self) -> Result<Vec<u8>, String> {
        let image = self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_image()
            .map_err(|err| err.to_string())?;
        let bytes = image
            .to_png()
            .map_err(|err| err.to_string())?
            .get_bytes()
            .to_vec();
        // let bytes = util::image_data_to_bytes(&image);
        Ok(bytes)
    }

    // Write to Clipboard APIs
    pub fn write_text(&self, text: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_text(text)
            .map_err(|err| err.to_string())
    }

    pub fn write_html(&self, html: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_html(html)
            .map_err(|err| err.to_string())
    }

    pub fn write_rtf(&self, rtf: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_rich_text(rtf)
            .map_err(|err| err.to_string())
    }

    /// write base64 png image to clipboard
    pub fn write_image_base64(&self, base64_image: String) -> Result<(), String> {
        let decoded = general_purpose::STANDARD_NO_PAD
            .decode(base64_image)
            .map_err(|err| err.to_string())?;
        self.write_image_binary(decoded).map_err(|err| err.to_string())?;
        Ok(())
    }

    pub fn write_image_binary(&self, image_bytes: Vec<u8>) -> Result<(), String> {
        let img =
            RustImageData::from_bytes(image_bytes.as_bytes()).map_err(|err| err.to_string())?;
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_image(img)
            .unwrap();
        Ok(())
    }

    pub fn clear(&self) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .clear()
            .map_err(|err| err.to_string())
    }
}

/// write text to clipboard
#[tauri::command]
fn read_text(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_text()
}

#[tauri::command]
fn read_html(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_html()
}

#[tauri::command]
fn read_rtf(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_rtf()
}

#[tauri::command]
fn read_files(manager: State<'_, ClipboardManager>) -> Result<Vec<String>, String> {
    manager.read_files()
}

#[tauri::command]
fn write_text(manager: State<'_, ClipboardManager>, text: String) -> Result<(), String> {
    manager.write_text(text)
}

#[tauri::command]
fn write_html(manager: State<'_, ClipboardManager>, html: String) -> Result<(), String> {
    manager.write_html(html)
}

#[tauri::command]
fn write_rtf(manager: State<'_, ClipboardManager>, rtf_content: String) -> Result<(), String> {
    manager.write_rtf(rtf_content)
}

/// read image from clipboard and return a base64 string
#[tauri::command]
fn read_image_base64(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_image_base64()
}

#[tauri::command]
fn read_image_binary(manager: State<'_, ClipboardManager>) -> Result<Vec<u8>, String> {
    manager.read_image_binary()
}

/// write base64 image to clipboard
#[tauri::command]
fn write_image_base64(manager: State<'_, ClipboardManager>, base64_image: String) -> Result<(), String> {
    manager.write_image_base64(base64_image)
}

#[tauri::command]
fn write_image_binary(manager: State<'_, ClipboardManager>, bytes: Vec<u8>) -> Result<(), String> {
    manager.write_image_binary(bytes)
}

#[tauri::command]
fn clear(manager: State<'_, ClipboardManager>) -> Result<(), String> {
    manager.clear()
}

#[tauri::command]
async fn start_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    let _ = app.emit_all("plugin:clipboard://clipboard-monitor/status", true);
    let mut running = state.running.lock().unwrap();
    if *running {
        return Ok(());
    }
    *running = true;
    let running = state.running.clone();
    std::thread::spawn(move || {
        let _ = Master::new(ClipboardMonitor::new(app, running)).run();
    });
    Ok(())
}

#[tauri::command]
async fn stop_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, ClipboardManager>,
) -> Result<(), String> {
    *state.running.lock().unwrap() = false;
    let _ = app.emit_all("plugin:clipboard://clipboard-monitor/status", false);
    Ok(())
}

#[tauri::command]
fn is_monitor_running(state: tauri::State<'_, ClipboardManager>) -> bool {
    *state.running.lock().unwrap()
}

/// Initializes the plugin.
/// * `auto_start` - Whether to start the clipboard listener automatically at app startup.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            stop_monitor,
            start_monitor,
            is_monitor_running,
            read_text,
            read_files,
            read_html,
            read_image_base64,
            read_image_binary,
            read_rtf,
            write_text,
            write_html,
            write_rtf,
            write_image_binary,
            write_image_base64,
            clear
        ])
        .setup(move |app| {
            let state = ClipboardManager::default();
            app.manage(state);
            Ok(())
        })
        .build()
}
