/**
 * Generates simple PNG app icons (192 & 512) without external deps.
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  const crc = crc32(Buffer.concat([typeBuf, data]))
  crcBuf.writeUInt32BE(crc)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function createPng(size) {
  const rows = []
  const cx = size / 2
  const cy = size / 2
  const outer = size * 0.38
  const inner = size * 0.28

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    row[0] = 0
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      const d = Math.sqrt(dx * dx + dy * dy)
      let r = 22,
        g = 18,
        b = 16,
        a = 255
      if (d < outer && d > inner) {
        // sage ring
        r = 126
        g = 184
        b = 168
      } else if (d <= inner) {
        r = 30
        g = 25
        b = 21
      }
      // soft vignette outside
      if (d > outer && d < outer + size * 0.04) {
        const t = 1 - (d - outer) / (size * 0.04)
        r = Math.round(22 + (126 - 22) * t * 0.35)
        g = Math.round(18 + (184 - 18) * t * 0.35)
        b = Math.round(16 + (168 - 16) * t * 0.35)
      }
      const i = 1 + x * 4
      row[i] = r
      row[i + 1] = g
      row[i + 2] = b
      row[i + 3] = a
    }
    rows.push(row)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const compressed = zlib.deflateSync(Buffer.concat(rows), { level: 9 })
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(file, createPng(size))
  console.log('wrote', path.basename(file))
}
