use arboard::ImageData;
use base64::{engine::general_purpose, Engine as _};
use image::ImageEncoder;
use std::io::{BufWriter, Cursor};

/// Reference: https://github.com/ChurchTao/Lanaya/blob/d67dc8b0c7c6aa4fd5ca5e80982525d03a66082f/src-tauri/src/utils/img_util.rs
pub fn image_data_to_bytes(img: &ImageData) -> Vec<u8> {
    let mut bytes: Vec<u8> = Vec::new();
    image::codecs::png::PngEncoder::new(BufWriter::new(Cursor::new(&mut bytes)))
        .write_image(
            &img.bytes,
            img.width as u32,
            img.height as u32,
            image::ColorType::Rgba8,
        )
        .unwrap();
    bytes
}

pub fn image_data_to_base64(img: &ImageData) -> String {
    general_purpose::STANDARD.encode(image_data_to_bytes(img).as_slice())
}
