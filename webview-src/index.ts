import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen, UnlistenFn } from "@tauri-apps/api/event";

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

export function readImageBinary(
  format: "int_array" | "Uint8Array" | "Blob"
): Promise<number[] | Uint8Array | Blob> {
  return (
    invoke("plugin:clipboard|read_image_binary") as Promise<number[]>
  ).then((img_arr: number[]) => {
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
export function writeImage(data: string): Promise<void> {
  return invoke("plugin:clipboard|write_image", { base64Image: data });
}

export function listenText(delay: number = 500) {
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

export function listenImage(delay: number = 1000) {
  let prevImg: string = "";
  let active: boolean = true; // whether the listener should be running
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
    if (active) setTimeout(x, delay);
  }, delay);
  return function () {
    active = false;
  };
}

export function listenToClipboard(): Promise<UnlistenFn> {
  return listen("plugin:clipboard://clipboard-monitor/update", async (e) => {
    if (e.payload === "clipboard update") {
      try {
        const text = await readText();
        if (text) {
          await emit(TEXT_CHANGED, { value: text });
        }
      } catch (error) {
        try {
          const img = await readImage();
          if (img) await emit(IMAGE_CHANGED, { value: img });
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
}
