# Tauri Plugin clipboard

> A Tauri plugin for clipboard IO. Support both text and image.
>
> The reason I built this plugin is becasue official Tauri API only supports clipboard with text, not image. So you can still use the official API for text.


> One thing about clipboard image io is that the input and output is always base64 png string.

## Installation

Crate: https://crates.io/crates/tauri-plugin-clipboard

`cargo add tauri-plugin-clipboard` to add the package.

Or add the following to your `Cargo.toml` for the latest unpublished version (not recommanded).

```toml
tauri-plugin-clipboard = { git = "https://github.com/CrossCopy/tauri-plugin-clipboard-api", branch = "dev" }
```

Run the following to install JavaScript/TypeScript API package.

```bash
npm i tauri-plugin-clipboard-api
# npm add https://github.com/CrossCopy/tauri-plugin-clipboard-api # or this for latest unpublished version (not recommended)
```

In `main.rs`, add the following to your `tauri::Builder`:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_clipboard::init())
    .run(tauri::generate_context!())
    .expect("failed to run app");
```

Read more in the [official doc](https://tauri.app/v1/guides/features/plugin/#using-a-plugin) about how to use.

## Example

```bash
npm run build
cd examples/svelte-app
npm run tauri dev
# there are a few buttons you can click to test the clipboard plugin
```

See [App.svelte](examples/svelte-app/src/App.svelte) for an example of how to use the plugin in JS/TS.

It works the same with other frontend frameworks like Vue, React, etc.


## Sample Usage (TypeScript API)

```ts
readText().then((text) => {
    // TODO
});

writeText("huakun zui shuai").then(() => {});

readImage()
.then((base64Img) => {
    imageStr = `data:image/png;base64, ${base64Img}`
})
.catch((err) => {
    alert(err);
});

writeImage(sample_base64_image).then(() => {
    // TODO
});
```

The base64 image string can be converted to `Uint8Array` and written to file system using tauri's fs API. 

```ts
writeBinaryFile('tmp/avatar.png', new Uint8Array(atob(base64Img).split('').map(char => char.charCodeAt(0))), { dir: BaseDirectory.Cache })
```