import { z } from "zod";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";

export const START_MONITOR_COMMAND = "plugin:clipboard|start_monitor";
export const STOP_MONITOR_COMMAND = "plugin:clipboard|stop_monitor";
export const TEXT_CHANGED = "plugin:clipboard://text-changed";
export const FILES_CHANGED = "plugin:clipboard://files-changed";
export const IMAGE_CHANGED = "plugin:clipboard://image-changed";
export const IS_MONITOR_RUNNING_COMMAND = "plugin:clipboard|is_monitor_running";
export const WRITE_TEXT_COMMAND = "plugin:clipboard|write_text";
export const WRITE_HTML_COMMAND = "plugin:clipboard|write_html";
export const WRITE_RTF_COMMAND = "plugin:clipboard|write_rtf";
export const CLEAR_COMMAND = "plugin:clipboard|clear";
export const READ_TEXT_COMMAND = "plugin:clipboard|read_text";
export const READ_HTML_COMMAND = "plugin:clipboard|read_html";
export const READ_RTF_COMMAND = "plugin:clipboard|read_rtf";
export const READ_FILES_COMMAND = "plugin:clipboard|read_files";
export const READ_IMAGE_BINARY_COMMAND = "plugin:clipboard|read_image_binary";
export const READ_IMAGE_BASE64_COMMAND = "plugin:clipboard|read_image_base64";
export const WRITE_IMAGE_BINARY_COMMAND = "plugin:clipboard|write_image_binary";
export const WRITE_IMAGE_BASE64_COMMAND = "plugin:clipboard|write_image_base64";
export const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT =
  "plugin:clipboard://clipboard-monitor/status";
export const MONITOR_UPDATE_EVENT =
  "plugin:clipboard://clipboard-monitor/update";
export const ClipboardChangedPayloadSchema = z.object({ value: z.string() });
export const ClipboardChangedFilesPayloadSchema = z.object({
  value: z.string().array(),
});
export type ClipboardChangedPayload = z.infer<
  typeof ClipboardChangedPayloadSchema
>;

export function writeText(text: string): Promise<void> {
  return invoke(WRITE_TEXT_COMMAND, { text });
}

export function writeHtml(html: string): Promise<void> {
  return invoke(WRITE_HTML_COMMAND, { html });
}

export function writeRtf(rtf: string): Promise<void> {
  return invoke(WRITE_RTF_COMMAND, { rtf });
}

export function clear(): Promise<void> {
  return invoke(CLEAR_COMMAND);
}

export function readText(): Promise<string> {
  return invoke(READ_TEXT_COMMAND);
}

export function readHtml(): Promise<string> {
  return invoke(READ_HTML_COMMAND);
}

export function readRtf(): Promise<string> {
  return invoke(READ_RTF_COMMAND);
}

export function readFiles(): Promise<string[]> {
  return invoke(READ_FILES_COMMAND);
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function readImageBase64(): Promise<string> {
  return invoke(READ_IMAGE_BASE64_COMMAND);
}

// export const readImageBase64 = readImage;

export function readImageBinary(
  format: "int_array" | "Uint8Array" | "Blob"
): Promise<number[] | Uint8Array | Blob> {
  return (invoke(READ_IMAGE_BINARY_COMMAND) as Promise<number[]>).then(
    (img_arr: number[]) => {
      switch (format) {
        case "int_array":
          return img_arr;
        case "Uint8Array":
          return new Uint8Array(img_arr);
        case "Blob":
          return new Blob([new Uint8Array(img_arr)]);
        default:
          return img_arr;
      }
    }
  );
}

export function readImageObjectURL(): Promise<string> {
  return readImageBinary("Blob").then((blob) => {
    return URL.createObjectURL(blob as Blob);
  });
}

/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
export function writeImageBase64(base64: string): Promise<void> {
  return invoke(WRITE_IMAGE_BASE64_COMMAND, { base64Image: base64 });
}

export function writeImageBinary(bytes: number[]): Promise<void> {
  throw new Error("Not Implemented");
  // return invoke(WRITE_IMAGE_BINARY_COMMAND, { base64Image: base64 });
}

/**
 * @deprecated since version v0.5.x
 * Brute force listen to clipboard text update.
 * Detect update by comparing current value with previous value every delay ms.
 * When there is a update, "plugin:clipboard://text-changed" is emitted.
 * You still need to listen to the event.
 *
 * @param delay check interval delay
 * @returns a stop running function that can be called when component unmounts
 */
export function startBruteForceTextMonitor(delay: number = 500) {
  let prevText: string = "";
  let active: boolean = true; // whether the listener should be running
  setTimeout(async function x() {
    try {
      const text = await readText();
      if (prevText !== text) {
        await emit(TEXT_CHANGED, { value: text });
      }
      prevText = text;
    } catch (error) {}
    if (active) setTimeout(x, delay);
  }, delay);
  return function () {
    active = false;
  };
}

/**
 * @deprecated since version v0.5.x
 * Brute force monitor clipboard image update by comparing current value with previous value.
 * When there is a update, "plugin:clipboard://image-changed" is emitted.
 * You still need to listen to the event.
 *
 * @param delay check interval delay
 * @returns stop running function that can be called to stop the monitor
 */
export function startBruteForceImageMonitor(delay: number = 1000) {
  let prevImg: string = "";
  let active: boolean = true; // whether the listener should be running
  setTimeout(async function x() {
    try {
      const img = await readImageBase64();
      if (prevImg !== img) {
        await emit(IMAGE_CHANGED, { value: img });
      }
      prevImg = img;
    } catch (error) {
      // ! when there is no image in clipboard, there may be error thrown, we ignore the error
    }
    if (active) setTimeout(x, delay);
  }, delay);
  return function () {
    active = false;
  };
}

/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * But this event doesn't tell us whether text or image is updated,
 * so this function will detect which is changed and emit the corresponding event
 * Event constant variables: TEXT_CHANGED or IMAGE_CHANGED
 * @returns unlisten function
 */
export function listenToClipboard(): Promise<UnlistenFn> {
  return listen(MONITOR_UPDATE_EVENT, async (e) => {
    if (e.payload === "clipboard update") {
      try {
        const files = await readFiles();
        await emit(FILES_CHANGED, { value: files });
      } catch (error) {
        try {
          const text = await readText();
          if (text) {
            await emit(TEXT_CHANGED, { value: text });
          }
        } catch (error) {
          try {
            const img = await readImageBase64();
            if (img) await emit(IMAGE_CHANGED, { value: img });
          } catch (error) {
            console.error(error);
          }
        }
      }
    }
  });
}

/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * However from this event we don't know whether it's text or image, no real data is returned.
 * Use with listenToClipboard function.
 * @param cb callback
 * @returns unlisten function
 */
export function onClipboardUpdate(cb: () => void) {
  return listen(MONITOR_UPDATE_EVENT, cb);
}

export async function onTextUpdate(
  cb: (text: string) => void
): Promise<UnlistenFn> {
  return await listen(TEXT_CHANGED, (event) => {
    const text = ClipboardChangedPayloadSchema.parse(event.payload).value;
    cb(text);
  });
}

export async function onFilesUpdate(
  cb: (files: string[]) => void
): Promise<UnlistenFn> {
  return await listen(FILES_CHANGED, (event) => {
    const files = ClipboardChangedFilesPayloadSchema.parse(event.payload).value;
    cb(files);
  });
}

export async function onImageUpdate(
  cb: (base64ImageStr: string) => void
): Promise<UnlistenFn> {
  return await listen(IMAGE_CHANGED, (event) => {
    const base64ImageStr = ClipboardChangedPayloadSchema.parse(
      event.payload
    ).value;
    cb(base64ImageStr);
  });
}

/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
export function isMonitorRunning(): Promise<boolean> {
  return invoke(IS_MONITOR_RUNNING_COMMAND).then((res) =>
    z.boolean().parse(res)
  );
}

/**
 * Start running mointor thread in Tauri core. This feature is added in v0.5.x.
 * Before v0.5.x, the monitor is started during setup when app starts.
 * After v0.5.x, this function must be called first to start monitor.
 * After monitor is started, events "plugin:clipboard://clipboard-monitor/update" will be emitted when there is clipboard update.
 * "plugin:clipboard://clipboard-monitor/status" event is also emitted when monitor status updates
 * Still have to listen to these events.
 */
export function startMonitor(): Promise<void> {
  return invoke(START_MONITOR_COMMAND);
}

/**
 * Stop clipboard monitor thread.
 */
export function stopMonitor(): Promise<void> {
  return invoke(STOP_MONITOR_COMMAND);
}
/**
 * Listen to monitor status update. Instead of calling isMonitorRunning to get status of monitor,
 * "plugin:clipboard://clipboard-monitor/status" event is emitted from Tauri core when monitor status updates.
 * @param cb callback to be called when there is monitor status update
 */
export async function listenToMonitorStatusUpdate(
  cb: (running: boolean) => void
): Promise<UnlistenFn> {
  return await listen(CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT, (event) => {
    const newStatus = z.boolean().parse(event.payload);
    cb(newStatus);
  });
}

export function startListening(): Promise<() => Promise<void>> {
  return startMonitor()
    .then(() => listenToClipboard())
    .then((unlistenClipboard) => {
      // return an unlisten function that stop listening to clipboard update and stop the monitor
      return async () => {
        console.log("stop listening");

        unlistenClipboard();
        await stopMonitor();
      };
    });
}
