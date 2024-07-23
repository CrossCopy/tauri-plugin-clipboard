import { readFileSync } from "fs"
import { join } from "path"
import { cwd } from "process"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"

const pkg = JSON.parse(readFileSync(join(cwd(), "package.json"), "utf8"))

export default {
  input: "guest-js/index.ts",
  output: [
    {
      file: pkg.exports.import,
      format: "esm"
    },
    {
      file: pkg.exports.require,
      format: "cjs"
    }
  ],
  plugins: [
    typescript()
    // terser()
  ],
  external: [
    /^@tauri-apps\/api/,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
}
