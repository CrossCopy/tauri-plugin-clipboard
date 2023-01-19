use arboard::{Clipboard, Error as ArboardError, ImageData};
use base64::{engine::general_purpose, Engine as _};
use image::{DynamicImage, EncodableLayout, ImageBuffer, Rgba, RgbaImage};
use serde::{ser::Serializer, Serialize};
use std::borrow::Cow;
use std::fs::File;
use std::io::Read;
use std::{collections::HashMap, sync::Mutex};
use tauri;
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State, Window,
};
use tempfile;

// type Result<T> = std::result::Result<T, Error>;

// #[derive(Debug, thiserror::Error)]
// pub enum Error {
//   #[error(transparent)]
//   Io(#[from] std::io::Error),
// }

// impl Serialize for Error {
//   fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
//   where
//     S: Serializer,
//   {
//     serializer.serialize_str(self.to_string().as_ref())
//   }
// }

#[derive(Default)]
struct MyState(Mutex<HashMap<String, String>>);

// #[command]
// async fn execute<R: Runtime>(
//   _app: AppHandle<R>,
//   _window: Window<R>,
//   state: State<'_, MyState>,
// ) -> Result<String> {
//   state.0.lock().unwrap().insert("key".into(), "value".into());
//   Ok("success".to_string())
// }

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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

// #[tauri::command]
// fn read_image() -> Result<MyImage, String> {
//     let mut clipboard = Clipboard::new().unwrap();
//     let result = clipboard.get_image();
//     let image_data = result.map_err(|err| err.to_string())?;
//     let img = MyImage{
//       width: image_data.width,
//       height: image_data.height,
//       bytes: image_data.bytes};
//     Ok(img)
// }

// #[derive(Serialize)]
// struct MyImageBuffer {
//     buf: std::io::Bytes<'static, &[u8]>
// }


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
    // image2 to base64 string
    // let bytes = image2.to_vec();
    // let base64_str = general_purpose::STANDARD_NO_PAD.encode(bytes);
    // Ok(base64_str)
    // let image = DynamicImage::ImageRgba8(image2);
    // image.save(fname.clone()).map_err(|err| err.to_string())?;
    // let mut f = File::open(&fname).expect("Error Reading File");
    // let metadata = fs::metadata(&fname).expect("unable to read metadata");
    // let mut buffer = vec![0; metadata.len() as usize];
    // f.read(&mut buffer).expect("buffer overflow");
    // Ok(buffer)
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            greet, read_text, write_text, read_image
        ])
        .setup(|app| {
            app.manage(MyState::default());
            Ok(())
        })
        .build()
}
