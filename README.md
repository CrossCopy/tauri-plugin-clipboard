# Tauri Plugin clipboard

> A Tauri plugin for clipboard IO. Support both text and image.
>
> The reason I built this plugin is becasue official Tauri API only supports clipboard with text, not image. So you can still use the official API for text.


> One thing about clipboard image io is that the input and output is always base64 png string.

## Installation

Add the following to your `Cargo.toml`:

```toml
tauri-plugin-clipboard = { git = "https://github.com/HuakunShen/tauri-plugin-clipboard", branch = "dev" }
```

Run the following to install JavaScript/TypeScript API package.

```bash
npm add https://github.com/HuakunShen/tauri-plugin-clipboard
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