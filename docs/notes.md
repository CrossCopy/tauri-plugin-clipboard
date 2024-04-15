# Notes

## Files

Clipboard Files has the following APIs, check the source code for more details (`./webview-src/api.ts`).

1. `writeFilesURIs`
   1. On Linux and MacOS, the URIs should start with `files://`. Otherwise the code will throw an error. See the docstring in the source code for more details ([./src/lib.rs](./src/lib.rs)).
2. `readFiles`
3. `readFilesURIs`

Difference between URI and no-URI is that URI starts with `files://` on Linux and MacOS. On Windows `readFiles` and `readFilesURIs` have no difference.

## Clipboard Watcher

> You don't really need to read this section if you are just using the plugin.

The logic of tauri's listen API is encapsulated in `onTextUpdate`, `onFilesUpdate`, `startListening`.

You can also listen to the events directly using Tauri's `listen()` function.

```ts
import {
  TEXT_CHANGED,
  FILES_CHANGED,
  IMAGE_CHANGED,
} from "tauri-plugin-clipboard-api";

await listen(TEXT_CHANGED, (event) => {
  const text = event.payload.value;
});
```

The listener `startListening` function contains two parts:

1. Start monitor thread in Tauri core (rust). (Invoke `start_monitor` command)
2. Run `listenToClipboard` function.
   1. The rust code only emit event (`plugin:clipboard://clipboard-monitor/update`) when clipboard is updated without the clipboard content because we don't always need the content.
   2. In order to distinguish content type, `listenToClipboard` detects the data type and emit new events.`onTextUpdate`, `onFilesUpdate`, `startListening` listen to these events.
      1. `plugin:clipboard://text-changed`
      2. `plugin:clipboard://files-changed`
      3. `plugin:clipboard://image-changed`
      4. `plugin:clipboard://html-changed`
      5. `plugin:clipboard://rtf-changed`

The returned unlisten function from `startListening` also does two things:

1. Stop monitor thread by invoking `stop_monitor` command to Tauri core.
2. Stop listener started in `listenToClipboard`.

For more details read the source code from [./webview-src/api.ts](./webview-src/api.ts).

## Image

The base64 image string can be converted to `Uint8Array` and written to file system using tauri's fs API. (We also provide a `readImageBinary` function to read image as binary data (`Uint8Array` is one of the available return type).

```ts
import { writeBinaryFile, BaseDirectory } from "@tauri-apps/api/fs";

writeBinaryFile(
  "tmp/avatar.png",
  new Uint8Array(
    atob(base64Img)
      .split("")
      .map((char) => char.charCodeAt(0))
  ),
  { dir: BaseDirectory.Cache }
);
```

## Performance

If you experience slow clipboard read/write on large screenshots/images, try again in release mode.

For example, for me a large screenshot (5MB) takes 7 seconds to be loaded to screen under debug mode, but only 0.8 second under release mode.

See this issue https://github.com/CrossCopy/tauri-plugin-clipboard/issues/25
