use clipboard_rs::{Clipboard, ClipboardContext, ContentFormat};

fn main() {
    let ctx = ClipboardContext::new().unwrap();

    // change the file paths to your own
    // let files = vec![
    //     "file:///home/parallels/clipboard-rs/Cargo.toml".to_string(),
    //     "file:///home/parallels/clipboard-rs/CHANGELOG.md".to_string(),
    // ];

    // ctx.set_files(files).unwrap();

    let types = ctx.available_formats().unwrap();
    println!("{:?}", types);

    let has = ctx.has(ContentFormat::Files);
    println!("has_files={}", has);

    let files = ctx.get_files().unwrap_or(vec![]);
    println!("{:?}", files);
}
