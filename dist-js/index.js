import * as v from 'valibot';
import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';

const buildCmd = (cmd) => `plugin:clipboard|${cmd}`;
const buildEventUrl = (event) => `plugin:clipboard://${event}`;
const START_MONITOR_COMMAND = buildCmd("start_monitor");
const STOP_MONITOR_COMMAND = buildCmd("stop_monitor");
const SOMETHING_CHANGED = buildEventUrl("something-changed");
const TEXT_CHANGED = buildEventUrl("text-changed");
const HTML_CHANGED = buildEventUrl("html-changed");
const RTF_CHANGED = buildEventUrl("rtf-changed");
const FILES_CHANGED = buildEventUrl("files-changed");
const IMAGE_CHANGED = buildEventUrl("image-changed");
const IMAGE_BINARY_CHANGED = buildEventUrl("image-changed-binary");
const IS_MONITOR_RUNNING_COMMAND = buildCmd("is_monitor_running");
const HAS_TEXT_COMMAND = buildCmd("has_text");
const HAS_IMAGE_COMMAND = buildCmd("has_image");
const HAS_HTML_COMMAND = buildCmd("has_html");
const HAS_RTF_COMMAND = buildCmd("has_rtf");
const HAS_FILES_COMMAND = buildCmd("has_files");
const AVAILABLE_TYPES_COMMAND = buildCmd("available_types");
const WRITE_TEXT_COMMAND = buildCmd("write_text");
const WRITE_HTML_COMMAND = buildCmd("write_html");
const WRITE_HTML_AND_TEXT_COMMAND = buildCmd("write_html_and_text");
const WRITE_RTF_COMMAND = buildCmd("write_rtf");
const WRITE_FILES_URIS_COMMAND = buildCmd("write_files_uris");
const WRITE_FILES_COMMAND = buildCmd("write_files");
const CLEAR_COMMAND = buildCmd("clear");
const READ_TEXT_COMMAND = buildCmd("read_text");
const READ_HTML_COMMAND = buildCmd("read_html");
const READ_RTF_COMMAND = buildCmd("read_rtf");
const READ_FILES_COMMAND = buildCmd("read_files");
const READ_FILES_URIS_COMMAND = buildCmd("read_files_uris");
const READ_IMAGE_BINARY_COMMAND = buildCmd("read_image_binary");
const READ_IMAGE_BASE64_COMMAND = buildCmd("read_image_base64");
const WRITE_IMAGE_BINARY_COMMAND = buildCmd("write_image_binary");
const WRITE_IMAGE_BASE64_COMMAND = buildCmd("write_image_base64");
const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT = buildEventUrl("clipboard-monitor/status");
const MONITOR_UPDATE_EVENT = buildEventUrl("clipboard-monitor/update");
const ClipboardChangedPayloadSchema = v.object({ value: v.string() });
const ClipboardBinaryChangedPayloadSchema = v.object({
    value: v.array(v.number())
});
const ClipboardChangedFilesPayloadSchema = v.object({
    value: v.array(v.string())
});
function hasText() {
    return invoke(HAS_TEXT_COMMAND);
}
function hasHTML() {
    return invoke(HAS_HTML_COMMAND);
}
function hasRTF() {
    return invoke(HAS_RTF_COMMAND);
}
function hasImage() {
    return invoke(HAS_IMAGE_COMMAND);
}
function hasFiles() {
    return invoke(HAS_FILES_COMMAND);
}
function writeText(text) {
    return invoke(WRITE_TEXT_COMMAND, { text });
}
function writeHtml(html) {
    return invoke(WRITE_HTML_COMMAND, { html });
}
/**
 * Write html and text to clipboard.
 * writeHtml API only writes html, readText will return nothing.
 * This API writes both html and text, so readText will return the text.
 */
function writeHtmlAndText(html, text) {
    return invoke(WRITE_HTML_AND_TEXT_COMMAND, { html, text });
}
function writeRtf(rtf) {
    return invoke(WRITE_RTF_COMMAND, { rtf });
}
function writeFilesURIs(filesUris) {
    return invoke(WRITE_FILES_URIS_COMMAND, { filesUris });
}
function writeFiles(filesPaths) {
    return invoke(WRITE_FILES_COMMAND, { filesPaths });
}
function clear() {
    return invoke(CLEAR_COMMAND);
}
function readText() {
    return invoke(READ_TEXT_COMMAND);
}
function readHtml() {
    return invoke(READ_HTML_COMMAND);
}
function readRtf() {
    return invoke(READ_RTF_COMMAND);
}
function readFiles() {
    return invoke(READ_FILES_COMMAND);
}
function readFilesURIs() {
    return invoke(READ_FILES_URIS_COMMAND);
}
/**
 * read clipboard image
 * @returns image in base64 string
 */
function readImageBase64() {
    return invoke(READ_IMAGE_BASE64_COMMAND);
}
// export const readImageBase64 = readImage;
/**
 * Read clipboard image, get the data in binary format
 * int_array (Array<number>) is received from Tauri core, Uint8Array and Blob are transformed from int_array
 * @param format data type of returned value, "int_array" is the fastest
 * @returns
 */
function readImageBinary(format) {
    return invoke(READ_IMAGE_BINARY_COMMAND).then((img_arr) => {
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
    });
}
function convertIntArrToUint8Array(intArr) {
    return new Uint8Array(intArr);
}
function convertUint8ArrayToBlob(uintArr) {
    return new Blob([uintArr]);
}
/**
 * Here is the transformation flow,
 * read clipboard image as Array<number> (int_array) -> int_array -> Uint8Array -> Blob -> ObjectURL
 * There are many layers which could make this function slow for large images.
 * @returns ObjectURL for clipboard image
 */
function readImageObjectURL() {
    return readImageBinary("Blob").then((blob) => {
        return URL.createObjectURL(blob);
    });
}
/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
function writeImageBase64(base64) {
    return invoke(WRITE_IMAGE_BASE64_COMMAND, { base64Image: base64 });
}
function writeImageBinary(bytes) {
    return invoke(WRITE_IMAGE_BINARY_COMMAND, { bytes: bytes });
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
function startBruteForceTextMonitor(delay = 500) {
    let prevText = "";
    let active = true; // whether the listener should be running
    setTimeout(async function x() {
        try {
            const text = await readText();
            if (prevText !== text) {
                await emit(TEXT_CHANGED, { value: text });
            }
            prevText = text;
        }
        catch (error) { }
        if (active)
            setTimeout(x, delay);
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
function startBruteForceImageMonitor(delay = 1000) {
    let prevImg = "";
    let active = true; // whether the listener should be running
    setTimeout(async function x() {
        try {
            const img = await readImageBase64();
            if (prevImg !== img) {
                await emit(IMAGE_CHANGED, { value: img });
            }
            prevImg = img;
        }
        catch (error) {
            // ! when there is no image in clipboard, there may be error thrown, we ignore the error
        }
        if (active)
            setTimeout(x, delay);
    }, delay);
    return function () {
        active = false;
    };
}
function getAvailableTypes() {
    return invoke(AVAILABLE_TYPES_COMMAND);
}
/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * The corresponding clipboard type event will be emitted when there is clipboard update.
 * @param listenTypes types of clipboard data to listen to
 * @returns unlisten function
 */
function listenToClipboard(listenTypes = {
    text: true,
    html: true,
    rtf: true,
    image: true,
    imageBinary: false,
    files: true
}) {
    return listen(MONITOR_UPDATE_EVENT, async (e) => {
        if (e.payload === "clipboard update") {
            const hasData = await Promise.all([hasFiles(), hasImage(), hasHTML(), hasRTF(), hasText()]);
            const flags = {
                files: hasData[0],
                image: hasData[1],
                imageBinary: hasData[1],
                html: hasData[2],
                rtf: hasData[3],
                text: hasData[4]
            };
            await emit(SOMETHING_CHANGED, flags);
            if (listenTypes.files && flags.files) {
                const files = await readFiles();
                if (files && files.length > 0) {
                    await emit(FILES_CHANGED, { value: files });
                }
                // flags.files = true;
                return; // ! this return is necessary, copying files also update clipboard text, but we don't want text update to be triggered
            }
            if (listenTypes.image && flags.image) {
                const img = await readImageBase64();
                if (img)
                    await emit(IMAGE_CHANGED, { value: img });
                // flags.image = true;
            }
            if (listenTypes.imageBinary && flags.imageBinary) {
                const img = await readImageBinary("int_array");
                if (img)
                    await emit(IMAGE_BINARY_CHANGED, { value: img });
                // flags.imageBinary = true;
            }
            if (listenTypes.html && flags.html) {
                await emit(HTML_CHANGED, { value: await readHtml() });
                // flags.html = true;
            }
            if (listenTypes.rtf && flags.rtf) {
                await emit(RTF_CHANGED, { value: await readRtf() });
                // flags.rtf = true;
            }
            if (listenTypes.text && flags.text) {
                await emit(TEXT_CHANGED, { value: await readText() });
                // flags.text = true;
            }
            // when clear() is called, this error is thrown, let ignore it
            // if (!success) {
            //   throw new Error("Unexpected Error: No proper clipboard type");
            // }
        }
    });
}
/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * @param cb callback
 * @returns unlisten function
 */
async function onClipboardUpdate(cb) {
    return await listen(MONITOR_UPDATE_EVENT, (event) => {
        cb(event.payload);
    });
}
async function onTextUpdate(cb) {
    return await listen(TEXT_CHANGED, (event) => {
        const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value;
        cb(text);
    });
}
/**
 * Listen to clipboard update event and get the updated types in a callback.
 * This listener tells you what types of data are updated.
 * This relies on `listenToClipboard()` who emits events this function listens to.
 * You can run `listenToClipboard()` or `startListening()` before calling this function.
 * When HTML is copied, this will be passed to callback: {files: false, image: false, html: true, rtf: false, text: true}
 * @param cb
 * @returns
 */
function onSomethingUpdate(cb) {
    return listen(SOMETHING_CHANGED, (event) => {
        cb(event.payload);
    });
}
function onHTMLUpdate(cb) {
    return listen(HTML_CHANGED, (event) => {
        const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value;
        cb(text);
    });
}
function onRTFUpdate(cb) {
    return listen(RTF_CHANGED, (event) => {
        const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value;
        cb(text);
    });
}
function onFilesUpdate(cb) {
    return listen(FILES_CHANGED, (event) => {
        const files = v.parse(ClipboardChangedFilesPayloadSchema, event.payload).value;
        cb(files);
    });
}
function onImageUpdate(cb) {
    return listen(IMAGE_CHANGED, (event) => {
        const base64ImageStr = v.parse(ClipboardChangedPayloadSchema, event.payload).value;
        cb(base64ImageStr);
    });
}
function onImageBinaryUpdate(cb) {
    return listen(IMAGE_BINARY_CHANGED, (event) => {
        cb(v.parse(ClipboardBinaryChangedPayloadSchema, event.payload).value);
    });
}
/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
function isMonitorRunning() {
    return invoke(IS_MONITOR_RUNNING_COMMAND).then((res) => v.parse(v.boolean(), res));
}
/**
 * Start running mointor thread in Tauri core. This feature is added in v0.5.x.
 * Before v0.5.x, the monitor is started during setup when app starts.
 * After v0.5.x, this function must be called first to start monitor.
 * After monitor is started, events "plugin:clipboard://clipboard-monitor/update" will be emitted when there is clipboard update.
 * "plugin:clipboard://clipboard-monitor/status" event is also emitted when monitor status updates
 * Still have to listen to these events.
 */
function startMonitor() {
    return invoke(START_MONITOR_COMMAND);
}
/**
 * Stop clipboard monitor thread.
 */
function stopMonitor() {
    return invoke(STOP_MONITOR_COMMAND);
}
/**
 * Listen to monitor status update. Instead of calling isMonitorRunning to get status of monitor,
 * "plugin:clipboard://clipboard-monitor/status" event is emitted from Tauri core when monitor status updates.
 * @param cb callback to be called when there is monitor status update
 */
async function listenToMonitorStatusUpdate(cb) {
    return await listen(CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT, (event) => {
        const newStatus = v.parse(v.boolean(), event.payload);
        cb(newStatus);
    });
}
function startListening(listenTypes = {
    text: true,
    html: true,
    rtf: true,
    image: true,
    imageBinary: false,
    files: true
}) {
    return startMonitor()
        .then(() => listenToClipboard(listenTypes))
        .then((unlistenClipboard) => {
        // return an unlisten function that stop listening to clipboard update and stop the monitor
        return async () => {
            unlistenClipboard();
            await stopMonitor();
        };
    });
}

var api = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AVAILABLE_TYPES_COMMAND: AVAILABLE_TYPES_COMMAND,
    CLEAR_COMMAND: CLEAR_COMMAND,
    CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT: CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT,
    ClipboardBinaryChangedPayloadSchema: ClipboardBinaryChangedPayloadSchema,
    ClipboardChangedFilesPayloadSchema: ClipboardChangedFilesPayloadSchema,
    ClipboardChangedPayloadSchema: ClipboardChangedPayloadSchema,
    FILES_CHANGED: FILES_CHANGED,
    HAS_FILES_COMMAND: HAS_FILES_COMMAND,
    HAS_HTML_COMMAND: HAS_HTML_COMMAND,
    HAS_IMAGE_COMMAND: HAS_IMAGE_COMMAND,
    HAS_RTF_COMMAND: HAS_RTF_COMMAND,
    HAS_TEXT_COMMAND: HAS_TEXT_COMMAND,
    HTML_CHANGED: HTML_CHANGED,
    IMAGE_BINARY_CHANGED: IMAGE_BINARY_CHANGED,
    IMAGE_CHANGED: IMAGE_CHANGED,
    IS_MONITOR_RUNNING_COMMAND: IS_MONITOR_RUNNING_COMMAND,
    MONITOR_UPDATE_EVENT: MONITOR_UPDATE_EVENT,
    READ_FILES_COMMAND: READ_FILES_COMMAND,
    READ_FILES_URIS_COMMAND: READ_FILES_URIS_COMMAND,
    READ_HTML_COMMAND: READ_HTML_COMMAND,
    READ_IMAGE_BASE64_COMMAND: READ_IMAGE_BASE64_COMMAND,
    READ_IMAGE_BINARY_COMMAND: READ_IMAGE_BINARY_COMMAND,
    READ_RTF_COMMAND: READ_RTF_COMMAND,
    READ_TEXT_COMMAND: READ_TEXT_COMMAND,
    RTF_CHANGED: RTF_CHANGED,
    SOMETHING_CHANGED: SOMETHING_CHANGED,
    START_MONITOR_COMMAND: START_MONITOR_COMMAND,
    STOP_MONITOR_COMMAND: STOP_MONITOR_COMMAND,
    TEXT_CHANGED: TEXT_CHANGED,
    WRITE_FILES_COMMAND: WRITE_FILES_COMMAND,
    WRITE_FILES_URIS_COMMAND: WRITE_FILES_URIS_COMMAND,
    WRITE_HTML_AND_TEXT_COMMAND: WRITE_HTML_AND_TEXT_COMMAND,
    WRITE_HTML_COMMAND: WRITE_HTML_COMMAND,
    WRITE_IMAGE_BASE64_COMMAND: WRITE_IMAGE_BASE64_COMMAND,
    WRITE_IMAGE_BINARY_COMMAND: WRITE_IMAGE_BINARY_COMMAND,
    WRITE_RTF_COMMAND: WRITE_RTF_COMMAND,
    WRITE_TEXT_COMMAND: WRITE_TEXT_COMMAND,
    clear: clear,
    convertIntArrToUint8Array: convertIntArrToUint8Array,
    convertUint8ArrayToBlob: convertUint8ArrayToBlob,
    getAvailableTypes: getAvailableTypes,
    hasFiles: hasFiles,
    hasHTML: hasHTML,
    hasImage: hasImage,
    hasRTF: hasRTF,
    hasText: hasText,
    isMonitorRunning: isMonitorRunning,
    listenToClipboard: listenToClipboard,
    listenToMonitorStatusUpdate: listenToMonitorStatusUpdate,
    onClipboardUpdate: onClipboardUpdate,
    onFilesUpdate: onFilesUpdate,
    onHTMLUpdate: onHTMLUpdate,
    onImageBinaryUpdate: onImageBinaryUpdate,
    onImageUpdate: onImageUpdate,
    onRTFUpdate: onRTFUpdate,
    onSomethingUpdate: onSomethingUpdate,
    onTextUpdate: onTextUpdate,
    readFiles: readFiles,
    readFilesURIs: readFilesURIs,
    readHtml: readHtml,
    readImageBase64: readImageBase64,
    readImageBinary: readImageBinary,
    readImageObjectURL: readImageObjectURL,
    readRtf: readRtf,
    readText: readText,
    startBruteForceImageMonitor: startBruteForceImageMonitor,
    startBruteForceTextMonitor: startBruteForceTextMonitor,
    startListening: startListening,
    startMonitor: startMonitor,
    stopMonitor: stopMonitor,
    writeFiles: writeFiles,
    writeFilesURIs: writeFilesURIs,
    writeHtml: writeHtml,
    writeHtmlAndText: writeHtmlAndText,
    writeImageBase64: writeImageBase64,
    writeImageBinary: writeImageBinary,
    writeRtf: writeRtf,
    writeText: writeText
});

export { AVAILABLE_TYPES_COMMAND, CLEAR_COMMAND, CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT, ClipboardBinaryChangedPayloadSchema, ClipboardChangedFilesPayloadSchema, ClipboardChangedPayloadSchema, FILES_CHANGED, HAS_FILES_COMMAND, HAS_HTML_COMMAND, HAS_IMAGE_COMMAND, HAS_RTF_COMMAND, HAS_TEXT_COMMAND, HTML_CHANGED, IMAGE_BINARY_CHANGED, IMAGE_CHANGED, IS_MONITOR_RUNNING_COMMAND, MONITOR_UPDATE_EVENT, READ_FILES_COMMAND, READ_FILES_URIS_COMMAND, READ_HTML_COMMAND, READ_IMAGE_BASE64_COMMAND, READ_IMAGE_BINARY_COMMAND, READ_RTF_COMMAND, READ_TEXT_COMMAND, RTF_CHANGED, SOMETHING_CHANGED, START_MONITOR_COMMAND, STOP_MONITOR_COMMAND, TEXT_CHANGED, WRITE_FILES_COMMAND, WRITE_FILES_URIS_COMMAND, WRITE_HTML_AND_TEXT_COMMAND, WRITE_HTML_COMMAND, WRITE_IMAGE_BASE64_COMMAND, WRITE_IMAGE_BINARY_COMMAND, WRITE_RTF_COMMAND, WRITE_TEXT_COMMAND, clear, convertIntArrToUint8Array, convertUint8ArrayToBlob, api as default, getAvailableTypes, hasFiles, hasHTML, hasImage, hasRTF, hasText, isMonitorRunning, listenToClipboard, listenToMonitorStatusUpdate, onClipboardUpdate, onFilesUpdate, onHTMLUpdate, onImageBinaryUpdate, onImageUpdate, onRTFUpdate, onSomethingUpdate, onTextUpdate, readFiles, readFilesURIs, readHtml, readImageBase64, readImageBinary, readImageObjectURL, readRtf, readText, startBruteForceImageMonitor, startBruteForceTextMonitor, startListening, startMonitor, stopMonitor, writeFiles, writeFilesURIs, writeHtml, writeHtmlAndText, writeImageBase64, writeImageBinary, writeRtf, writeText };
