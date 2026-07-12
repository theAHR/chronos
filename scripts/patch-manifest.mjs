import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest')

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

manifest.start_url = `${basePath}/`
manifest.icons = manifest.icons.map((icon) => ({
  ...icon,
  src: `${basePath}${icon.src}`,
}))

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
