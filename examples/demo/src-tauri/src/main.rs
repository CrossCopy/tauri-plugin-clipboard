// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard::init())
        .setup(|app| {
            let handle = app.handle();
            let clipboard = handle.state::<tauri_plugin_clipboard::ClipboardManager>();
            clipboard
                .write_text("huakun zui shuai".to_string())
                .unwrap();
            // #[cfg(debug_assertions)] // only include this code on debug builds
            // {
            //     let window = app.get_window("main").unwrap();
            //     window.open_devtools();
            // }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
