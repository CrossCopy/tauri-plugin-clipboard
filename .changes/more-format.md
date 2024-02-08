---
"tauri-plugin-clipboard": minor
---

Bump version to 0.6.0

Introduced more clipboard formats. We used to support text, files and image.

Switch from [arboard](https://crates.io/crates/arboard) to [clipboard-rs](https://crates.io/crates/clipboard-rs) (https://crates.io/crates/clipboard-rs)


Now we support text, image, files, HTML, and rich text.

The function name of `readImage` APIs have been renamed. `readImage` is removed (used to return base64 string).

Now we have `readImageBinary` (returns binary data), `readImageObjectURL` (returns object URL), and `readImageBase64` (returns base64 string).

