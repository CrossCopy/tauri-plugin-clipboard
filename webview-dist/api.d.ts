import { z } from "zod";
import { UnlistenFn } from "@tauri-apps/api/event";
export declare const START_MONITOR_COMMAND = "plugin:clipboard|start_monitor";
export declare const STOP_MONITOR_COMMAND = "plugin:clipboard|stop_monitor";
export declare const SOMETHING_CHANGED = "plugin:clipboard://something-changed";
export declare const TEXT_CHANGED = "plugin:clipboard://text-changed";
export declare const HTML_CHANGED = "plugin:clipboard://html-changed";
export declare const RTF_CHANGED = "plugin:clipboard://rtf-changed";
export declare const FILES_CHANGED = "plugin:clipboard://files-changed";
export declare const IMAGE_CHANGED = "plugin:clipboard://image-changed";
export declare const IS_MONITOR_RUNNING_COMMAND = "plugin:clipboard|is_monitor_running";
export declare const HAS_TEXT_COMMAND = "plugin:clipboard|has_text";
export declare const HAS_IMAGE_COMMAND = "plugin:clipboard|has_image";
export declare const HAS_HTML_COMMAND = "plugin:clipboard|has_html";
export declare const HAS_RTF_COMMAND = "plugin:clipboard|has_rtf";
export declare const HAS_FILES_COMMAND = "plugin:clipboard|has_files";
export declare const WRITE_TEXT_COMMAND = "plugin:clipboard|write_text";
export declare const WRITE_HTML_COMMAND = "plugin:clipboard|write_html";
export declare const WRITE_HTML_AND_TEXT_COMMAND = "plugin:clipboard|write_html_and_text";
export declare const WRITE_RTF_COMMAND = "plugin:clipboard|write_rtf";
export declare const WRITE_FILES_URIS_COMMAND = "plugin:clipboard|write_files_uris";
export declare const WRITE_FILES_COMMAND = "plugin:clipboard|write_files";
export declare const CLEAR_COMMAND = "plugin:clipboard|clear";
export declare const READ_TEXT_COMMAND = "plugin:clipboard|read_text";
export declare const READ_HTML_COMMAND = "plugin:clipboard|read_html";
export declare const READ_RTF_COMMAND = "plugin:clipboard|read_rtf";
export declare const READ_FILES_COMMAND = "plugin:clipboard|read_files";
export declare const READ_FILES_URIS_COMMAND = "plugin:clipboard|read_files_uris";
export declare const READ_IMAGE_BINARY_COMMAND = "plugin:clipboard|read_image_binary";
export declare const READ_IMAGE_BASE64_COMMAND = "plugin:clipboard|read_image_base64";
export declare const WRITE_IMAGE_BINARY_COMMAND = "plugin:clipboard|write_image_binary";
export declare const WRITE_IMAGE_BASE64_COMMAND = "plugin:clipboard|write_image_base64";
export declare const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT = "plugin:clipboard://clipboard-monitor/status";
export declare const MONITOR_UPDATE_EVENT = "plugin:clipboard://clipboard-monitor/update";
export declare const ClipboardChangedPayloadSchema: z.ZodObject<{
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
}, {
    value: string;
}>;
export declare const ClipboardChangedFilesPayloadSchema: z.ZodObject<{
    value: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    value: string[];
}, {
    value: string[];
}>;
export declare type ClipboardChangedPayload = z.infer<typeof ClipboardChangedPayloadSchema>;
export declare function hasText(): Promise<boolean>;
export declare function hasHTML(): Promise<boolean>;
export declare function hasRTF(): Promise<boolean>;
export declare function hasImage(): Promise<boolean>;
export declare function hasFiles(): Promise<boolean>;
export declare function writeText(text: string): Promise<void>;
export declare function writeHtml(html: string): Promise<void>;
/**
 * Write html and text to clipboard.
 * writeHtml API only writes html, readText will return nothing.
 * This API writes both html and text, so readText will return the text.
 */
export declare function writeHtmlAndText(html: string, text: string): Promise<void>;
export declare function writeRtf(rtf: string): Promise<void>;
/**
 * Write files uris to clipboard. The files should be in uri format: `file:///path/to/file` on Mac and Linux. File path is absolute path.
 * On Windows, the path should be in the format `C:\\path\\to\\file`.
 * @param filesUris
 * @returns
 */
export declare function writeFilesURIs(filesUris: string[]): Promise<void>;
export declare function writeFiles(filesPaths: string[]): Promise<void>;
export declare function clear(): Promise<void>;
export declare function readText(): Promise<string>;
export declare function readHtml(): Promise<string>;
export declare function readRtf(): Promise<string>;
export declare function readFiles(): Promise<string[]>;
export declare function readFilesURIs(): Promise<string[]>;
/**
 * read clipboard image
 * @returns image in base64 string
 */
export declare function readImageBase64(): Promise<string>;
/**
 * Read clipboard image, get the data in binary format
 * int_array (Array<number>) is received from Tauri core, Uint8Array and Blob are transformed from int_array
 * @param format data type of returned value, "int_array" is the fastest
 * @returns
 */
export declare function readImageBinary(format: "int_array" | "Uint8Array" | "Blob"): Promise<Uint8Array | Blob | number[]>;
/**
 * Here is the transformation flow,
 * read clipboard image as Array<number> (int_array) -> int_array -> Uint8Array -> Blob -> ObjectURL
 * There are many layers which could make this function slow for large images.
 * @returns ObjectURL for clipboard image
 */
export declare function readImageObjectURL(): Promise<string>;
/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
export declare function writeImageBase64(base64: string): Promise<void>;
export declare function writeImageBinary(bytes: number[]): Promise<void>;
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
export declare function startBruteForceTextMonitor(delay?: number): () => void;
/**
 * @deprecated since version v0.5.x
 * Brute force monitor clipboard image update by comparing current value with previous value.
 * When there is a update, "plugin:clipboard://image-changed" is emitted.
 * You still need to listen to the event.
 *
 * @param delay check interval delay
 * @returns stop running function that can be called to stop the monitor
 */
export declare function startBruteForceImageMonitor(delay?: number): () => void;
declare type UpdatedTypes = {
    text: boolean;
    html: boolean;
    rtf: boolean;
    image: boolean;
    files: boolean;
};
/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * The corresponding clipboard type event will be emitted when there is clipboard update.
 * @returns unlisten function
 */
export declare function listenToClipboard(): Promise<UnlistenFn>;
/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * However from this event we don't know whether it's text or image, no real data is returned.
 * Use with listenToClipboard function.
 * @param cb callback
 * @returns unlisten function
 */
export declare function onClipboardUpdate(cb: () => void): Promise<UnlistenFn>;
export declare function onTextUpdate(cb: (text: string) => void): Promise<UnlistenFn>;
/**
 * Listen to clipboard update event and get the updated types in a callback.
 * This listener tells you what types of data are updated.
 * This relies on `listenToClipboard()` who emits events this function listens to.
 * You can run `listenToClipboard()` or `startListening()` before calling this function.
 * When HTML is copied, this will be passed to callback: {files: false, image: false, html: true, rtf: false, text: true}
 * @param cb
 * @returns
 */
export declare function onSomethingUpdate(cb: (updatedTypes: UpdatedTypes) => void): Promise<UnlistenFn>;
export declare function onHTMLUpdate(cb: (text: string) => void): Promise<UnlistenFn>;
export declare function onRTFUpdate(cb: (text: string) => void): Promise<UnlistenFn>;
export declare function onFilesUpdate(cb: (files: string[]) => void): Promise<UnlistenFn>;
export declare function onImageUpdate(cb: (base64ImageStr: string) => void): Promise<UnlistenFn>;
/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
export declare function isMonitorRunning(): Promise<boolean>;
/**
 * Start running mointor thread in Tauri core. This feature is added in v0.5.x.
 * Before v0.5.x, the monitor is started during setup when app starts.
 * After v0.5.x, this function must be called first to start monitor.
 * After monitor is started, events "plugin:clipboard://clipboard-monitor/update" will be emitted when there is clipboard update.
 * "plugin:clipboard://clipboard-monitor/status" event is also emitted when monitor status updates
 * Still have to listen to these events.
 */
export declare function startMonitor(): Promise<void>;
/**
 * Stop clipboard monitor thread.
 */
export declare function stopMonitor(): Promise<void>;
/**
 * Listen to monitor status update. Instead of calling isMonitorRunning to get status of monitor,
 * "plugin:clipboard://clipboard-monitor/status" event is emitted from Tauri core when monitor status updates.
 * @param cb callback to be called when there is monitor status update
 */
export declare function listenToMonitorStatusUpdate(cb: (running: boolean) => void): Promise<UnlistenFn>;
export declare function startListening(): Promise<() => Promise<void>>;
export {};
//# sourceMappingURL=api.d.ts.map