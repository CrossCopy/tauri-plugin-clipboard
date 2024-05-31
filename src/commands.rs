use crate::{desktop::ClipboardMonitor, Clipboard};
use clipboard_rs::{ClipboardWatcher, ClipboardWatcherContext};
use tauri::{command, AppHandle, Manager, Runtime, State, Window};

#[command]
pub fn has_text<R: Runtime>(
    _app: AppHandle<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<bool, String> {
    clipboard.has_text()
}

#[command]
pub fn has_image<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<bool, String> {
    clipboard.has_image()
}

#[command]
pub fn has_html<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<bool, String> {
    clipboard.has_html()
}

#[command]
pub fn has_rtf<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<bool, String> {
    clipboard.has_rtf()
}

#[command]
pub fn has_files<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<bool, String> {
    clipboard.has_files()
}

#[command]
pub fn read_text<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<String, String> {
    clipboard.read_text()
}

#[command]
pub fn read_html<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<String, String> {
    clipboard.read_html()
}

#[command]
pub fn read_rtf<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<String, String> {
    clipboard.read_rtf()
}

#[command]
pub fn read_files<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<Vec<String>, String> {
    clipboard.read_files()
}

#[command]
pub fn read_files_uris<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<Vec<String>, String> {
    clipboard.read_files_uris()
}

#[command]
pub fn write_files_uris<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    files_uris: Vec<String>,
) -> Result<(), String> {
    clipboard.write_files_uris(files_uris)
}

#[command]
pub fn write_text<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    text: String,
) -> Result<(), String> {
    clipboard.write_text(text)
}

#[command]
pub fn write_html<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    html: String,
) -> Result<(), String> {
    clipboard.write_html(html)
}

#[command]
pub fn write_html_and_text<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    html: String,
    text: String,
) -> Result<(), String> {
    clipboard.write_html_and_text(html, text)
}

#[command]
pub fn write_rtf<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    rtf_content: String,
) -> Result<(), String> {
    clipboard.write_rtf(rtf_content)
}

/// read image from clipboard and return a base64 string
#[command]
pub async fn read_image_base64<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<String, String> {
    clipboard.read_image_base64()
}

#[command]
pub async fn read_image_binary<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<Vec<u8>, String> {
    clipboard.read_image_binary()
}

/// write base64 image to clipboard
#[command]
pub async fn write_image_base64<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    base64_image: String,
) -> Result<(), String> {
    clipboard.write_image_base64(base64_image)
}

#[command]
pub async fn write_image_binary<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
    bytes: Vec<u8>,
) -> Result<(), String> {
    clipboard.write_image_binary(bytes)
}

#[command]
pub fn clear<R: Runtime>(
    _app: AppHandle<R>,
    _window: Window<R>,
    clipboard: State<'_, Clipboard<R>>,
) -> Result<(), String> {
    clipboard.clear()
}

#[command]
pub async fn start_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, Clipboard<R>>,
) -> Result<(), String> {
    let _ = app.emit("plugin:clipboard://clipboard-monitor/status", true);
    let clipboard = ClipboardMonitor::new(app);
    let mut watcher: ClipboardWatcherContext<ClipboardMonitor<R>> =
        ClipboardWatcherContext::new().unwrap();
    let watcher_shutdown = watcher.add_handler(clipboard).get_shutdown_channel();
    let mut watcher_shutdown_state = state.watcher_shutdown.lock().unwrap();
    if (*watcher_shutdown_state).is_some() {
        return Ok(());
    }
    *watcher_shutdown_state = Some(watcher_shutdown);
    std::thread::spawn(move || {
        watcher.start_watch();
    });
    Ok(())
}

#[command]
pub async fn stop_monitor<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, Clipboard<R>>,
) -> Result<(), String> {
    let _ = app.emit("plugin:clipboard://clipboard-monitor/status", false);
    let mut watcher_shutdown_state = state.watcher_shutdown.lock().unwrap();
    if let Some(watcher_shutdown) = (*watcher_shutdown_state).take() {
        watcher_shutdown.stop();
    }
    *watcher_shutdown_state = None;
    Ok(())
}

#[command]
pub fn is_monitor_running<R: Runtime>(
    _app: tauri::AppHandle<R>,
    state: tauri::State<'_, Clipboard<R>>,
) -> bool {
    (*state.watcher_shutdown.lock().unwrap()).is_some()
}
