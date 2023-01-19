import { invoke } from "@tauri-apps/api/tauri";

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

export function writeImage(data: string): Promise<void> {
  return invoke("plugin:clipboard|write_image", { base64Image: data });
}
