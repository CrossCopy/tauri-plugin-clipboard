import * as v from "valibot"
import { invoke } from "@tauri-apps/api/core"
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event"

const buildCmd = (cmd: string) => `plugin:clipboard|${cmd}`
const buildEventUrl = (event: string) => `plugin:clipboard://${event}`

export const START_MONITOR_COMMAND = buildCmd("start_monitor")
export const STOP_MONITOR_COMMAND = buildCmd("stop_monitor")
export const SOMETHING_CHANGED = buildEventUrl("something-changed")
export const TEXT_CHANGED = buildEventUrl("text-changed")
export const HTML_CHANGED = buildEventUrl("html-changed")
export const RTF_CHANGED = buildEventUrl("rtf-changed")
export const FILES_CHANGED = buildEventUrl("files-changed")
export const IMAGE_CHANGED = buildEventUrl("image-changed")
export const IMAGE_BINARY_CHANGED = buildEventUrl("image-changed-binary")
export const IS_MONITOR_RUNNING_COMMAND = buildCmd("is_monitor_running")
export const HAS_TEXT_COMMAND = buildCmd("has_text")
export const HAS_IMAGE_COMMAND = buildCmd("has_image")
export const HAS_HTML_COMMAND = buildCmd("has_html")
export const HAS_RTF_COMMAND = buildCmd("has_rtf")
export const HAS_FILES_COMMAND = buildCmd("has_files")
export const AVAILABLE_TYPES_COMMAND = buildCmd("available_types")
export const WRITE_TEXT_COMMAND = buildCmd("write_text")
export const WRITE_HTML_COMMAND = buildCmd("write_html")
export const WRITE_HTML_AND_TEXT_COMMAND = buildCmd("write_html_and_text")
export const WRITE_RTF_COMMAND = buildCmd("write_rtf")
export const WRITE_FILES_URIS_COMMAND = buildCmd("write_files_uris")
export const WRITE_FILES_COMMAND = buildCmd("write_files")
export const CLEAR_COMMAND = buildCmd("clear")
export const READ_TEXT_COMMAND = buildCmd("read_text")
export const READ_HTML_COMMAND = buildCmd("read_html")
export const READ_RTF_COMMAND = buildCmd("read_rtf")
export const READ_FILES_COMMAND = buildCmd("read_files")
export const READ_FILES_URIS_COMMAND = buildCmd("read_files_uris")
export const READ_IMAGE_BINARY_COMMAND = buildCmd("read_image_binary")
export const READ_IMAGE_BASE64_COMMAND = buildCmd("read_image_base64")
export const WRITE_IMAGE_BINARY_COMMAND = buildCmd("write_image_binary")
export const WRITE_IMAGE_BASE64_COMMAND = buildCmd("write_image_base64")
export const CLIPBOARD_MONITOR_STATUS_UPDATE_EVENT = buildEventUrl("clipboard-monitor/status")
export const MONITOR_UPDATE_EVENT = buildEventUrl("clipboard-monitor/update")
export const ClipboardChangedPayloadSchema = v.object({ value: v.string() })
export const ClipboardBinaryChangedPayloadSchema = v.object({
  value: v.array(v.number())
})
export const ClipboardChangedFilesPayloadSchema = v.object({
  value: v.array(v.string())
})
export type ClipboardChangedPayload = v.InferOutput<typeof ClipboardChangedPayloadSchema>

export function hasText() {
  return invoke<boolean>(HAS_TEXT_COMMAND)
}

export function hasHTML() {
  return invoke<boolean>(HAS_HTML_COMMAND)
}

export function hasRTF() {
  return invoke<boolean>(HAS_RTF_COMMAND)
}

export function hasImage() {
  return invoke<boolean>(HAS_IMAGE_COMMAND)
}

export function hasFiles() {
  return invoke<boolean>(HAS_FILES_COMMAND)
}

export function writeText(text: string) {
  return invoke<void>(WRITE_TEXT_COMMAND, { text })
}

export function writeHtml(html: string) {
  return invoke<void>(WRITE_HTML_COMMAND, { html })
}

/**
 * Write html and text to clipboard.
 * writeHtml API only writes html, readText will return nothing.
 * This API writes both html and text, so readText will return the text.
 */
export function writeHtmlAndText(html: string, text: string) {
  return invoke<void>(WRITE_HTML_AND_TEXT_COMMAND, { html, text })
}

export function writeRtf(rtf: string) {
  return invoke<void>(WRITE_RTF_COMMAND, { rtf })
}

export function writeFilesURIs(filesUris: string[]) {
  return invoke<void>(WRITE_FILES_URIS_COMMAND, { filesUris })
}

export function writeFiles(filesPaths: string[]) {
  return invoke<void>(WRITE_FILES_COMMAND, { filesPaths })
}

export function clear() {
  return invoke<void>(CLEAR_COMMAND)
}

export function readText() {
  return invoke<string>(READ_TEXT_COMMAND)
}

export function readHtml() {
  return invoke<string>(READ_HTML_COMMAND)
}

export function readRtf() {
  return invoke<string>(READ_RTF_COMMAND)
}

export function readFiles() {
  return invoke<string[]>(READ_FILES_COMMAND)
}

export function readFilesURIs() {
  return invoke<string[]>(READ_FILES_URIS_COMMAND)
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function readImageBase64() {
  return invoke<string>(READ_IMAGE_BASE64_COMMAND)
}

// export const readImageBase64 = readImage;

/**
 * Read clipboard image, get the data in binary format
 * int_array (Array<number>) is received from Tauri core, Uint8Array and Blob are transformed from int_array
 * @param format data type of returned value, "int_array" is the fastest
 * @returns
 */
export function readImageBinary(format: "int_array" | "Uint8Array" | "Blob") {
  return (
    invoke<number[] | Uint8Array | Blob>(READ_IMAGE_BINARY_COMMAND) as Promise<number[]>
  ).then((img_arr: number[]) => {
    switch (format) {
      case "int_array":
        return img_arr
      case "Uint8Array":
        return new Uint8Array(img_arr)
      case "Blob":
        return new Blob([new Uint8Array(img_arr)])
      default:
        return img_arr
    }
  })
}

export function convertIntArrToUint8Array(intArr: number[]): Uint8Array {
  return new Uint8Array(intArr)
}

export function convertUint8ArrayToBlob(uintArr: Uint8Array): Blob {
  return new Blob([uintArr])
}

/**
 * Here is the transformation flow,
 * read clipboard image as Array<number> (int_array) -> int_array -> Uint8Array -> Blob -> ObjectURL
 * There are many layers which could make this function slow for large images.
 * @returns ObjectURL for clipboard image
 */
export function readImageObjectURL(): Promise<string> {
  return readImageBinary("Blob").then((blob) => {
    return URL.createObjectURL(blob as Blob)
  })
}

/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
export function writeImageBase64(base64: string) {
  return invoke<void>(WRITE_IMAGE_BASE64_COMMAND, { base64Image: base64 })
}

export function writeImageBinary(bytes: number[]) {
  return invoke<void>(WRITE_IMAGE_BINARY_COMMAND, { bytes: bytes })
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
  let prevText: string = ""
  let active: boolean = true // whether the listener should be running
  setTimeout(async function x() {
    try {
      const text = await readText()
      if (prevText !== text) {
        await emit(TEXT_CHANGED, { value: text })
      }
      prevText = text
    } catch (error) {}
    if (active) setTimeout(x, delay)
  }, delay)
  return function () {
    active = false
  }
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
  let prevImg: string = ""
  let active: boolean = true // whether the listener should be running
  setTimeout(async function x() {
    try {
      const img = await readImageBase64()
      if (prevImg !== img) {
        await emit(IMAGE_CHANGED, { value: img })
      }
      prevImg = img
    } catch (error) {
      // ! when there is no image in clipboard, there may be error thrown, we ignore the error
    }
    if (active) setTimeout(x, delay)
  }, delay)
  return function () {
    active = false
  }
}

export type UpdatedTypes = {
  text?: boolean
  html?: boolean
  rtf?: boolean
  image?: boolean
  imageBinary?: boolean // get image in binary format
  files?: boolean
}

export type AvailableTypes = {
  text: boolean
  html: boolean
  rtf: boolean
  image: boolean
  files: boolean
}

export function getAvailableTypes(): Promise<AvailableTypes> {
  return invoke<AvailableTypes>(AVAILABLE_TYPES_COMMAND)
}

/**
 * Listen to "plugin:clipboard://clipboard-monitor/update" from Tauri core.
 * The corresponding clipboard type event will be emitted when there is clipboard update.
 * @param listenTypes types of clipboard data to listen to
 * @returns unlisten function
 */
export function listenToClipboard(
  listenTypes: UpdatedTypes = {
    text: true,
    html: true,
    rtf: true,
    image: true,
    imageBinary: false,
    files: true
  }
): Promise<UnlistenFn> {
  return listen(MONITOR_UPDATE_EVENT, async (e) => {
    if (e.payload === "clipboard update") {
      const hasData = await Promise.all([hasFiles(), hasImage(), hasHTML(), hasRTF(), hasText()])
      const flags: UpdatedTypes = {
        files: hasData[0],
        image: hasData[1],
        imageBinary: hasData[1],
        html: hasData[2],
        rtf: hasData[3],
        text: hasData[4]
      }
      await emit(SOMETHING_CHANGED, flags)
      if (listenTypes.files && flags.files) {
        const files = await readFiles()
        if (files && files.length > 0) {
          await emit(FILES_CHANGED, { value: files })
        }
        // flags.files = true;
        return // ! this return is necessary, copying files also update clipboard text, but we don't want text update to be triggered
      }
      if (listenTypes.image && flags.image) {
        const img = await readImageBase64()
        if (img) await emit(IMAGE_CHANGED, { value: img })
        // flags.image = true;
      }
      if (listenTypes.imageBinary && flags.imageBinary) {
        const img = await readImageBinary("int_array")
        if (img) await emit(IMAGE_BINARY_CHANGED, { value: img })
        // flags.imageBinary = true;
      }
      if (listenTypes.html && flags.html) {
        await emit(HTML_CHANGED, { value: await readHtml() })
        // flags.html = true;
      }
      if (listenTypes.rtf && flags.rtf) {
        await emit(RTF_CHANGED, { value: await readRtf() })
        // flags.rtf = true;
      }
      if (listenTypes.text && flags.text) {
        await emit(TEXT_CHANGED, { value: await readText() })
        // flags.text = true;
      }
      // when clear() is called, this error is thrown, let ignore it
      // if (!success) {
      //   throw new Error("Unexpected Error: No proper clipboard type");
      // }
    }
  })
}

/**
 * This listen to clipboard monitor update event, and trigger the callback function.
 * However from this event we don't know whether it's text or image, no real data is returned.
 * Use with listenToClipboard function.
 * @param cb callback
 * @returns unlisten function
 */
export function onClipboardUpdate(cb: () => void) {
  return listen(MONITOR_UPDATE_EVENT, cb)
}

export async function onTextUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return await listen(TEXT_CHANGED, (event) => {
    const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value
    cb(text)
  })
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
export function onSomethingUpdate(cb: (updatedTypes: UpdatedTypes) => void) {
  return listen(SOMETHING_CHANGED, (event) => {
    cb(event.payload as UpdatedTypes)
  })
}

export function onHTMLUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return listen(HTML_CHANGED, (event) => {
    const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value
    cb(text)
  })
}

export function onRTFUpdate(cb: (text: string) => void): Promise<UnlistenFn> {
  return listen(RTF_CHANGED, (event) => {
    const text = v.parse(ClipboardChangedPayloadSchema, event.payload).value
    cb(text)
  })
}

export function onFilesUpdate(cb: (files: string[]) => void): Promise<UnlistenFn> {
  return listen(FILES_CHANGED, (event) => {
    const files = v.parse(ClipboardChangedFilesPayloadSchema, event.payload).value
    cb(files)
  })
}

export function onImageUpdate(cb: (base64ImageStr: string) => void): Promise<UnlistenFn> {
  return listen(IMAGE_CHANGED, (event) => {
    const base64ImageStr = v.parse(ClipboardChangedPayloadSchema, event.payload).value
    cb(base64ImageStr)
  })
}

export function onImageBinaryUpdate(cb: (image: number[]) => void) {
  return listen(IMAGE_BINARY_CHANGED, (event) => {
    cb(v.parse(ClipboardBinaryChangedPayloadSchema, event.payload).value)
  })
}

/**
 * Used to check the status of clipboard monitor
 * @returns Whether the monitor is running
 */
export function isMonitorRunning() {
  return invoke<boolean>(IS_MONITOR_RUNNING_COMMAND).then((res: unknown) =>
    v.parse(v.boolean(), res)
  )
}

/**
 * Start running mointor thread in Tauri core. This feature is added in v0.5.x.
 * Before v0.5.x, the monitor is started during setup when app starts.
 * After v0.5.x, this function must be called first to start monitor.
 * After monitor is started, events "plugin:clipboard://clipboard-monitor/update" will be emitted when there is clipboard update.
 * "plugin:clipboard://clipboard-monitor/status" event is also emitted when monitor status updates
 * Still have to listen to these events.
 */
export function startMonitor() {
  return invoke<void>(START_MONITOR_COMMAND)
}

/**
 * Stop clipboard monitor thread.
 */
export function stopMonitor() {
  return invoke<void>(STOP_MONITOR_COMMAND)
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
    const newStatus = v.parse(v.boolean(), event.payload)
    cb(newStatus)
  })
}

export function startListening(
  listenTypes: UpdatedTypes = {
    text: true,
    html: true,
    rtf: true,
    image: true,
    imageBinary: false,
    files: true
  }
): Promise<() => Promise<void>> {
  return startMonitor()
    .then(() => listenToClipboard(listenTypes))
    .then((unlistenClipboard) => {
      // return an unlisten function that stop listening to clipboard update and stop the monitor
      return async () => {
        unlistenClipboard()
        await stopMonitor()
      }
    })
}
