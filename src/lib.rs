use arboard::{Clipboard, ImageData};
use base64::{engine::general_purpose, Engine as _};
use image::GenericImageView;
use image::{ImageBuffer, RgbaImage};
use serde::Serialize;
use std::borrow::Cow;
use std::error::Error;
use std::fs::File;
use std::io::Read;
use std::{collections::HashMap, sync::Mutex};
use tauri;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State
};
use tempfile;

#[derive(Default)]
pub struct ClipboardManager(Mutex<HashMap<String, String>>);

impl ClipboardManager {
    pub fn read_text(&self) -> Result<String, Box<dyn Error + Sync + Send>> {
        let mut clipboard = arboard::Clipboard::new()?;
        clipboard.get_text().map_err(Into::into)
    }

    pub fn write_text(&self, text: String) -> Result<(), Box<dyn Error + Sync + Send>> {
        let mut clipboard = Clipboard::new()?;
        clipboard.set_text(text).map_err(Into::into)
    }

    pub fn read_image(&self) -> Result<String, Box<dyn Error + Sync + Send>> {
        let mut clipboard = Clipboard::new()?;
        let image = clipboard.get_image()?;
        let tmp_dir = tempfile::Builder::new()
            .prefix("clipboard-img")
            .tempdir()?;
        let fname = tmp_dir.path().join("clipboard-img.png");
        let image2: RgbaImage = ImageBuffer::from_raw(
            image.width.try_into().unwrap(),
            image.height.try_into().unwrap(),
            image.bytes.into_owned(),
        )
        .unwrap();
        image2.save(fname.clone())?;
        let mut file = File::open(fname.clone())?;
        let mut buffer = vec![];
        file.read_to_end(&mut buffer)?;
        let base64_str = general_purpose::STANDARD_NO_PAD.encode(buffer);
        Ok(base64_str)
    }

    pub fn write_image(&self, base64_image: String) -> Result<(), Box<dyn Error + Sync + Send>> {
        let mut clipboard = Clipboard::new()?;
        let decoded = general_purpose::STANDARD_NO_PAD
            .decode(base64_image)?;
        // println!("base64_image: {:?}", decoded);
        let img = image::load_from_memory(&decoded)?;
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
        clipboard.set_image(img_data)?;
        Ok(())
    }
}

pub trait ManagerExt<R: Runtime> {
  fn clipboard_manager_ex(&self) -> State<'_, ClipboardManager>;
}

impl<R: Runtime, T: Manager<R>> ManagerExt<R> for T {
  fn clipboard_manager_ex(&self) -> State<'_, ClipboardManager> {
    self.state::<ClipboardManager>()
  }
}

#[tauri::command]
fn read_text(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_text().map_err(|err| err.to_string())
}

#[tauri::command]
fn write_text(manager: State<'_, ClipboardManager>, text: String) -> Result<(), String> {
    manager.write_text(text).map_err(|err| err.to_string())
}

#[derive(Serialize)]
struct MyImage {
    width: usize,
    height: usize,
    bytes: Cow<'static, [u8]>,
}

#[tauri::command]
fn read_image(manager: State<'_, ClipboardManager>) -> Result<String, String> {
    manager.read_image().map_err(|err| err.to_string())
}

#[tauri::command]
fn write_image(manager: State<'_, ClipboardManager>, base64_image: String) -> Result<(), String> {
    manager.write_image(base64_image).map_err(|err| err.to_string())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .invoke_handler(tauri::generate_handler![
            read_text,
            write_text,
            read_image,
            write_image
        ])
        .setup(|app| {
            app.manage(ClipboardManager::default());
            Ok(())
        })
        .build()
}
