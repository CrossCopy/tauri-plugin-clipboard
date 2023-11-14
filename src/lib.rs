use arboard::{Clipboard, ImageData};
use base64::{engine::general_purpose, Engine as _};
use clipboard_master::{CallbackResult, ClipboardHandler, Master};
use image::GenericImageView;
use std::borrow::Cow;
use std::sync::Mutex;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
mod util;
// type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

struct ClipboardMonitor<R>
where
    R: Runtime,
{
    // window: tauri::Window,
    app_handle: tauri::AppHandle<R>,
    running: Mutex<bool>,
}

impl<R> ClipboardMonitor<R>
where
    R: Runtime,
{
    fn new(app_handle: tauri::AppHandle<R>, running: Mutex<bool>) -> Self {
        Self {
            app_handle: app_handle,
            running,
        }
    }
}

impl<R> ClipboardHandler for ClipboardMonitor<R>
where
    R: Runtime,
{
    fn on_clipboard_change(&mut self) -> CallbackResult {
        // println!("Clipboard change happened!");
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
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}

pub struct ClipboardManager {
    terminate_flag: Mutex<bool>,
    running: Mutex<bool>,
    clipboard: Mutex<Clipboard>,
}

impl ClipboardManager {
    pub fn default() -> Self {
        return ClipboardManager {
            terminate_flag: Mutex::default(),
            running: Mutex::default(),
            clipboard: Mutex::from(Clipboard::new().unwrap()),
        };
    }

    pub fn read_text(&self) -> Result<String, String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_text()
            .map_err(|err| err.to_string())
    }

    pub fn write_text(&self, text: String) -> Result<(), String> {
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_text(text)
            .map_err(|err| err.to_string())
    }

    pub fn read_image(&self) -> Result<String, String> {
        let img = self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_image()
            .map_err(|err| err.to_string())?;
        let base64_str = util::image_data_to_base64(&img);
        Ok(base64_str)
    }

    pub fn read_image_binary(&self) -> Result<Vec<u8>, String> {
        let image = self
            .clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .get_image()
            .map_err(|err| err.to_string())?;
        let bytes = util::image_data_to_bytes(&image);
        Ok(bytes)
    }

    pub fn write_image(&self, base64_image: String) -> Result<(), String> {
        let decoded = general_purpose::STANDARD_NO_PAD
            .decode(base64_image)
            .map_err(|err| err.to_string())?;
        // println!("base64_image: {:?}", decoded);
        let img = image::load_from_memory(&decoded).map_err(|err| err.to_string())?;
        let pixels = img
            .pixels()
            .into_iter()
            .map(|(_, _, pixel)| pixel.0)
            .flatten()
            .collect::<Vec<_>>();
        let img_data = ImageData {
            height: img.height() as usize,
            width: img.width() as usize,
            bytes: Cow::Owned(pixels),
        };
        self.clipboard
            .lock()
            .map_err(|err| err.to_string())?
            .set_image(img_data)
            .map_err(|err| err.to_string())?;
        Ok(())
    }
}

/// write text to clipboard
#[tauri::command]
fn read_text(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_text()
}

#[tauri::command]
fn write_text(manager: State<'_, ClipboardManager>, text: String) -> Result<(), String> {
    manager.write_text(text)
}

/// read image from clipboard and return a base64 string
#[tauri::command]
fn read_image(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_image()
}

#[tauri::command]
fn read_image_binary(manager: State<'_, ClipboardManager>) -> Result<Vec<u8>, String> {
    manager.read_image_binary()
}

/// write base64 image to clipboard
#[tauri::command]
fn write_image(manager: State<'_, ClipboardManager>, base64_image: String) -> Result<(), String> {
    manager.write_image(base64_image)
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            read_text,
            write_text,
            read_image,
            write_image,
            read_image_binary,
        ])
        .setup(|app| {
            app.manage(ClipboardManager::default());
            let app_handle = app.app_handle();
            let running = Mutex::new(true);
            tauri::async_runtime::spawn(async move {
                let _ = Master::new(ClipboardMonitor::new(app_handle, running)).run();
            });
            Ok(())
        })
        .build()
}
