const COMMANDS: &[&str] = &[
    "stop_monitor",
    "start_monitor",
    "is_monitor_running",
    "has_text",
    "has_image",
    "has_html",
    "has_rtf",
    "has_files",
    "read_text",
    "read_files",
    "read_files_uris",
    "read_html",
    "read_image_base64",
    "read_image_binary",
    "read_rtf",
    "write_text",
    "write_html",
    "write_html_and_text",
    "write_rtf",
    "write_image_binary",
    "write_image_base64",
    "write_files_uris",
    "clear",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
