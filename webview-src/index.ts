import { invoke } from "@tauri-apps/api/tauri";
import {
  createDir,
  writeBinaryFile,
  readBinaryFile
} from "@tauri-apps/api/fs";

export type Image = {
  width: number;
  height: number;
  bytes: number[];
};

export async function execute() {
  return await invoke("plugin:clipboard|execute");
}

export function write_text(text: string): Promise<void> {
  return invoke("plugin:clipboard|write_text", { text });
}

export function read_text(): Promise<string> {
  return invoke("plugin:clipboard|read_text");
}

/**
 * read clipboard image
 * @returns image in base64 string
 */
export function read_image(): Promise<string> {
  return invoke("plugin:clipboard|read_image");
}

export function write_image(data: any): Promise<void> {
  return invoke("plugin:clipboard|write_image", { data });
}
