---
outline: deep
---

# API Examples

A full example app can be found in the `examples/demo` directory of the repository.

```bash
npm run build
cd examples/demo
npm i
npm run tauri dev
# there are a few buttons you can click to test the clipboard plugin
```

## Sample Usage (TypeScript API)

```ts
import clipboard from "tauri-plugin-clipboard-api";

await clipboard.readText();
await clipboard.writeText("huakun zui shuai");

clipboard
  .readImageBase64()
  .then((base64Img) => {
    imageStr = `data:image/png;base64, ${base64Img}`;
  })
  .catch((err) => {
    alert(err);
  });

await clipboard.writeImageBase64(sample_base64_image);
const files: string[] = await readFiles();

clipboard.readHtml().then((t: string) => {
  // todo
});
```

## Sample Usage (Rust API)

`ClipboardManager` contains the state state as well as the API functions.

```rust
use tauri::Manager;
use tauri_plugin_clipboard::ManagerExt;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_clipboard::init())
    .setup(|app| {
        let handle = app.handle();
        let clipboard = handle.state::<tauri_plugin_clipboard::ClipboardManager>();
        clipboard.write_text("huakun zui shuai".to_string()).unwrap();
        Ok(())
    })
    .build(tauri::generate_context!())
    .expect("failed to run app");
}
```

## Listener Example

We use Tauri's event system. Start a listener with Tauri's `listen()` function to start listening for event, and call `listenImage()` and `listenText()` to listen for clipboard update. When clipboard is updated, event will be emitted.

The following example is in svelte.

```ts
import type { UnlistenFn } from "@tauri-apps/api/event";
import { onDestroy, onMount } from "svelte";
import {
  onClipboardUpdate,
  onImageUpdate,
  onTextUpdate,
  onHTMLUpdate,
  onRTFUpdate,
  onFilesUpdate,
  startListening,
  listenToMonitorStatusUpdate,
  isMonitorRunning,
  hasHTML,
  hasImage,
  hasText,
  hasRTF,
  hasFiles,
} from "tauri-plugin-clipboard-api";

let text = "";
let files: string[] = [];
let base64Image = "";
let htmlMonitorContent = "";
let monitorRunning = false;
let rtf = "";
let unlistenTextUpdate: UnlistenFn;
let unlistenImageUpdate: UnlistenFn;
let unlistenHtmlUpdate: UnlistenFn;
let unlistenRTF: UnlistenFn;
let unlistenClipboard: () => Promise<void>;
let unlistenFiles: UnlistenFn;
const has = {
  hasHTML: false,
  hasImage: false,
  hasText: false,
  hasRTF: false,
  hasFiles: false,
};
onMount(async () => {
  unlistenTextUpdate = await onTextUpdate((newText) => {
    text = newText;
  });
  unlistenHtmlUpdate = await onHTMLUpdate((newHtml) => {
    htmlMonitorContent = newHtml;
  });
  unlistenImageUpdate = await onImageUpdate((b64Str) => {
    base64Image = b64Str;
  });
  unlistenFiles = await onFilesUpdate((newFiles) => {
    files = newFiles;
  });
  unlistenRTF = await onRTFUpdate((newRTF) => {
    rtf = newRTF;
  });
  unlistenClipboard = await startListening();

  onClipboardUpdate(async () => {
    has.hasHTML = await hasHTML();
    has.hasImage = await hasImage();
    has.hasText = await hasText();
    has.hasRTF = await hasRTF();
    has.hasFiles = await hasFiles();
    console.log("plugin:clipboard://clipboard-monitor/update event received");
  });

  // setInterval(async () => {
  // 	console.log("Running:", await isMonitorRunning());
  // }, 1000);
});

listenToMonitorStatusUpdate((running) => {
  monitorRunning = running;
});

onDestroy(() => {
  if (unlistenTextUpdate) unlistenTextUpdate();
  if (unlistenImageUpdate) unlistenImageUpdate();
  if (unlistenHtmlUpdate) unlistenHtmlUpdate();
  if (unlistenFiles) unlistenFiles();
  if (unlistenClipboard) unlistenClipboard();
});
```
