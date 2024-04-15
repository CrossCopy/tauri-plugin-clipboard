# Installation

> If you are installing from npm and crate.io package registry, make sure the versions for both packages are the same, otherwise, the API may not match.
> 
> I will make sure the latest version is published to both npm and crates.io.


## Short Instructions

Crate: https://crates.io/crates/tauri-plugin-clipboard

NPM Package: https://www.npmjs.com/package/tauri-plugin-clipboard-api

```bash
cargo add tauri-plugin-clipboard # in src-tauri folder
npm i tauri-plugin-clipboard-api
```

<details>
<summary>More Installation Options</summary>

Crate: https://crates.io/crates/tauri-plugin-clipboard

`cargo add tauri-plugin-clipboard` to add the package.

Or add the following to your `Cargo.toml` for the latest unpublished version (not recommanded).

```toml
tauri-plugin-clipboard = { git = "https://github.com/CrossCopy/tauri-plugin-clipboard" }
```

You can also add a tag to github url.

```toml
# for tag v0.6.5, this may not be the latest version, check the tag on github
tauri-plugin-clipboard = { git = "https://github.com/CrossCopy/tauri-plugin-clipboard", tag = "v0.6.6" }
```

NPM Package: https://www.npmjs.com/package/tauri-plugin-clipboard-api

Run the following to install JavaScript/TypeScript API package.

```bash
npm i tauri-plugin-clipboard-api

# or this for latest unpublished version (not recommended)
npm i https://github.com/CrossCopy/tauri-plugin-clipboard

# or this for tag, e.g. v0.6.5 (this may not be the latest version, check the tag on github)
npm i https://github.com/CrossCopy/tauri-plugin-clipboard#v0.6.6
```

</details>

In `main.rs`, add the following to your `tauri::Builder`:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_clipboard::init()) // add this line
    .run(tauri::generate_context!())
    .expect("failed to run app");
```

Read more in the [official doc](https://tauri.app/v1/guides/features/plugin/#using-a-plugin) about how to use.
