import * as v from "valibot";
import { UnlistenFn } from "@tauri-apps/api/event";
export declare const START_MONITOR_COMMAND: string;
export declare const STOP_MONITOR_COMMAND: string;
export declare const SOMETHING_CHANGED: string;
export declare const TEXT_CHANGED: string;
export declare const HTML_CHANGED: string;
export declare const RTF_CHANGED: string;
export declare const FILES_CHANGED: string;
export declare const IMAGE_CHANGED: string;
export declare const IMAGE_BINARY_CHANGED: string;
export declare const IS_MONITOR_RUNNING_COMMAND: string;
export declare const HAS_TEXT_COMMAND: string;
export declare const HAS_IMAGE_COMMAND: string;
export declare const HAS_HTML_COMMAND: string;
export declare const HAS_RTF_COMMAND: string;
export declare const HAS_FILES_COMMAND: string;
export declare const AVAILABLE_TYPES_COMMAND: string;
export declare const WRITE_TEXT_COMMAND: string;
export declare const WRITE_HTML_COMMAND: string;
export declare const WRITE_HTML_AND_TEXT_COMMAND: string;
export declare const WRITE_RTF_COMMAND: string;
export declare const WRITE_FILES_URIS_COMMAND: string;
export declare const WRITE_FILES_COMMAND: string;
export declare const CLEAR_COMMAND: string;
export declare const READ_TEXT_COMMAND: string;
export declare const READ_HTML_COMMAND: string;
export declare const READ_RTF_COMMAND: string;
export declare const READ_FILES_COMMAND: string;
export declare const READ_FILES_URIS_COMMAND: string;
export declare const READ_IMAGE_BINARY_COMMAND: string;
export declare const READ_IMAGE_BASE64_COMMAND: string;
export declare const WRITE_IMAGE_BINARY_COMMAND: string;
export declare const WRITE_IMAGE_BASE64_COMMAND: string;
export declare const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT: string;
export declare const MONITOR_UPDATE_EVENT: string;
export declare const ClipboardChangedPayloadSchema: v.ObjectSchema<{
    readonly value: v.StringSchema<undefined>;
}, undefined>;
export declare const ClipboardBinaryChangedPayloadSchema: v.ObjectSchema<{
    readonly value: v.ArraySchema<v.NumberSchema<undefined>, undefined>;
}, undefined>;
export declare const ClipboardChangedFilesPayloadSchema: v.ObjectSchema<{
    readonly value: v.ArraySchema<v.StringSchema<undefined>, undefined>;
}, undefined>;
export type ClipboardChangedPayload = v.InferOutput<typeof ClipboardChangedPayloadSchema>;
export interface ClipboardState {
    text: boolean;
    html: boolean;
    rtf: boolean;
    image: boolean;
    files: boolean;
}
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
export declare function readImageBinary(format: "int_array" | "Uint8Array" | "Blob"): Promise<number[] | Uint8Array | Blob>;
export declare function convertIntArrToUint8Array(intArr: number[]): Uint8Array;
export declare function convertUint8ArrayToBlob(uintArr: Uint8Array): Blob;
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
export type UpdatedTypes = {
    text?: boolean;
    html?: boolean;
    rtf?: boolean;
    image?: boolean;
    imageBinary?: boolean;
    files?: boolean;
};
export type AvailableTypes = {
    text: boolean;
    html: boolean;
    rtf: boolean;
    image: boolean;
    files: boolean;
};
export declare function getAvailableTypes(): Promise<AvailableTypes>;
/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * The corresponding clipboard type event will be emitted when there is clipboard update.
 * @param listenTypes types of clipboard data to listen to
 * @returns unlisten function
 */
export declare function listenToClipboard(listenTypes?: UpdatedTypes): Promise<UnlistenFn>;
/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * @param cb callback
 * @returns unlisten function
 */
export declare function onClipboardUpdate(cb: (state: ClipboardState) => void): Promise<UnlistenFn>;
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
export declare function onImageBinaryUpdate(cb: (image: number[]) => void): Promise<UnlistenFn>;
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
export declare function startListening(listenTypes?: UpdatedTypes): Promise<() => Promise<void>>;
//# sourceMappingURL=api.d.ts.map