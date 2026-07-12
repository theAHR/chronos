/**
 * Generates seamless-ish ambient WAV loops for Chronos (no external assets required).
 * These are procedural stand-ins — swap files in /public/sounds for higher-fidelity loops anytime.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'sounds')
fs.mkdirSync(outDir, { recursive: true })

const SAMPLE_RATE = 22050
const DURATION = 4

function writeWav(filename, samples) {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2)
  }
  fs.writeFileSync(path.join(outDir, filename), buffer)
}

function noise() {
  return Math.random() * 2 - 1
}

function lowpassFactory() {
  let y = 0
  return (x, alpha) => {
    y += alpha * (x - y)
    return y
  }
}

function fadeLoop(samples) {
  const n = Math.floor(SAMPLE_RATE * 0.08)
  for (let i = 0; i < n; i++) {
    const w = i / n
    samples[i] *= w
    samples[samples.length - 1 - i] *= w
  }
  // Crossfade edges for softer loops
  for (let i = 0; i < n; i++) {
    const a = samples[i]
    const b = samples[samples.length - n + i]
    const t = i / n
    samples[i] = a * t + b * (1 - t)
    samples[samples.length - n + i] = b * (1 - t) + a * t
  }
  return samples
}

function genRain() {
  const lp = lowpassFactory()
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  for (let i = 0; i < samples.length; i++) {
    const n = lp(noise(), 0.12)
    const drops = Math.random() > 0.995 ? noise() * 0.35 : 0
    samples[i] = n * 0.35 + drops
  }
  return fadeLoop(samples)
}

function genCafe() {
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    const murmur =
      Math.sin(2 * Math.PI * 110 * t) * 0.04 +
      Math.sin(2 * Math.PI * 146.8 * t + 0.3) * 0.03 +
      Math.sin(2 * Math.PI * 220 * t * (1 + 0.002 * Math.sin(t))) * 0.025
    const chatter = (Math.random() > 0.992 ? noise() * 0.08 : 0) + noise() * 0.015
    samples[i] = murmur + chatter
  }
  return fadeLoop(samples)
}

function genNoise() {
  const lp = lowpassFactory()
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = lp(noise(), 0.35) * 0.28
  }
  return fadeLoop(samples)
}

function genForest() {
  const lp = lowpassFactory()
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    const wind = lp(noise(), 0.05) * 0.18
    const bird =
      Math.random() > 0.998
        ? Math.sin(2 * Math.PI * (1800 + Math.random() * 800) * t) * 0.12 * Math.exp(-(i % 2000) / 400)
        : 0
    samples[i] = wind + bird + Math.sin(2 * Math.PI * 0.2 * t) * 0.02
  }
  return fadeLoop(samples)
}

function genLofi() {
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  const bpm = 72
  const beat = 60 / bpm
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    const phase = (t % beat) / beat
    const kick = phase < 0.08 ? Math.sin(2 * Math.PI * 55 * t) * (1 - phase / 0.08) * 0.35 : 0
    const hat = phase > 0.5 && phase < 0.55 ? noise() * 0.08 : 0
    const chord =
      Math.sin(2 * Math.PI * 196 * t) * 0.04 +
      Math.sin(2 * Math.PI * 246.9 * t) * 0.03 +
      Math.sin(2 * Math.PI * 293.7 * t) * 0.025
    const vinyl = noise() * 0.01
    samples[i] = kick + hat + chord + vinyl
  }
  return fadeLoop(samples)
}

function genFireplace() {
  const lp = lowpassFactory()
  const samples = new Float32Array(SAMPLE_RATE * DURATION)
  for (let i = 0; i < samples.length; i++) {
    const crackle = Math.random() > 0.97 ? noise() * 0.45 : noise() * 0.05
    samples[i] = lp(crackle, 0.2) * 0.55 + lp(noise(), 0.04) * 0.12
  }
  return fadeLoop(samples)
}

const gens = {
  'rain.wav': genRain,
  'cafe.wav': genCafe,
  'noise.wav': genNoise,
  'forest.wav': genForest,
  'lofi.wav': genLofi,
  'fireplace.wav': genFireplace,
}

for (const [name, gen] of Object.entries(gens)) {
  writeWav(name, gen())
  console.log('wrote', name)
}
