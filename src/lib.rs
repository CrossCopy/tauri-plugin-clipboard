use arboard::{Clipboard, Error as ArboardError, ImageData};
use base64::{engine::general_purpose, Engine as _};
use image::GenericImageView;
use image::{ImageBuffer, RgbaImage};
use serde::Serialize;
use std::borrow::Cow;
use std::fs::File;
use std::io::Read;
use std::{collections::HashMap, sync::Mutex};
use tauri;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use tempfile;

#[derive(Default)]
struct MyState(Mutex<HashMap<String, String>>);

#[tauri::command]
fn read_text() -> Result<String, String> {
    let mut clipboard = arboard::Clipboard::new().unwrap();
    clipboard.get_text().map_err(|err| err.to_string())
}

#[tauri::command]
fn write_text(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().unwrap();
    clipboard.set_text(text).map_err(|err| err.to_string())
}

#[derive(Serialize)]
struct MyImage {
    width: usize,
    height: usize,
    bytes: Cow<'static, [u8]>,
}

#[tauri::command]
fn read_image() -> Result<String, String> {
    let mut clipboard = Clipboard::new().unwrap();
    let image = clipboard.get_image().map_err(|err| err.to_string())?;
    let tmp_dir = tempfile::Builder::new()
        .prefix("clipboard-img")
        .tempdir()
        .map_err(|err| err.to_string())?;
    let fname = tmp_dir.path().join("clipboard-img.png");

    let image2: RgbaImage = ImageBuffer::from_raw(
        image.width.try_into().unwrap(),
        image.height.try_into().unwrap(),
        image.bytes.into_owned(),
    )
    .unwrap();
    image2.save(fname.clone()).map_err(|err| err.to_string())?;
    let mut file = File::open(fname.clone()).unwrap();
    let mut buffer = vec![];
    file.read_to_end(&mut buffer).unwrap();
    let base64_str = general_purpose::STANDARD_NO_PAD.encode(buffer);
    Ok(base64_str)
}

#[tauri::command]
fn write_image(base64_image: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().unwrap();
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
    clipboard
        .set_image(img_data)
        .map_err(|err| err.to_string())?;
    Ok(())
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            read_text,
            write_text,
            read_image,
            write_image
        ])
        .setup(|app| {
            app.manage(MyState::default());
            Ok(())
        })
        .build()
}
