pub use models::*;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;
mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
pub use desktop::Clipboard;
#[cfg(mobile)]
pub use mobile::Clipboard;

// #[derive(Default)]
// struct MyState(Mutex<HashMap<String, String>>);

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the clipboard APIs.
pub trait ClipboardExt<R: Runtime> {
    fn clipboard(&self) -> &Clipboard<R>;
}

impl<R: Runtime, T: Manager<R>> crate::ClipboardExt<R> for T {
    fn clipboard(&self) -> &Clipboard<R> {
        self.state::<Clipboard<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            commands::stop_monitor,
            commands::start_monitor,
            commands::is_monitor_running,
            commands::has_text,
            commands::has_image,
            commands::has_html,
            commands::has_rtf,
            commands::has_files,
            commands::read_text,
            commands::read_files,
            commands::read_files_uris,
            commands::read_html,
            commands::read_image_base64,
            commands::read_image_binary,
            commands::read_rtf,
            commands::write_text,
            commands::write_html,
            commands::write_html_and_text,
            commands::write_rtf,
            commands::write_image_binary,
            commands::write_image_base64,
            commands::write_files_uris,
            commands::write_files,
            commands::clear
        ])
        .setup(|app, api| {
            #[cfg(mobile)]
            let clipboard = mobile::init(app, api)?;
            #[cfg(desktop)]
            let clipboard = desktop::init(app, api)?;
            app.manage(clipboard);

            // manage state so it is accessible by the commands
            // app.manage(MyState::default());
            Ok(())
        })
        .build()
}
