import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from "@tauri-apps/api/event";

export const TEXT_CHANGED = "text_changed";
export const IMAGE_CHANGED = "image_changed";

export function writeText(text: string): Promise<void> {
  return invoke("plugin:clipboard|write_text", { text });
}

export function readText(): Promise<string> {
  return invoke("plugin:clipboard|read_text");
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function readImage(): Promise<string> {
  return invoke("plugin:clipboard|read_image");
}

/**
 * write image to clipboard
 * @param data image data in base64 encoded string
 * @returns Promise<void>
 */
export function writeImage(data: string): Promise<void> {
  return invoke("plugin:clipboard|write_image", { base64Image: data });
}

export async function listenText(delay: number = 500) {
  let prevText = await readText();
  setTimeout(async function x() {
    const text = await readText();
    if (prevText !== text) {
      await emit(TEXT_CHANGED, { value: text });
    }
    prevText = text;
    setTimeout(x, delay);
  }, delay);
}

export async function listenImage(delay: number = 1000) {
  let prevImg: string = "";

  setTimeout(async function x() {
    try {
      const img = await readImage();
      if (prevImg !== img) {
        await emit(IMAGE_CHANGED, { value: img });
      }
      prevImg = img;
    } catch (error) {
      // ! when there is no image in clipboard, there may be error thrown, we ignore the error
    }
    setTimeout(x, delay);
  }, delay);
}
