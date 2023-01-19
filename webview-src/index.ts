import { invoke } from '@tauri-apps/api/tauri'

export async function execute() {
  return await invoke('plugin:clipboard|execute')
}
