// Sigue el Power.log de la sesión de Hearthstone más reciente y avisa cuando cambia el estado de BG.
import { existsSync } from 'node:fs'
import { open, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createPowerLogParser } from './powerlog.mjs'

const DEFAULT_INSTALL = 'C:\\Program Files (x86)\\Hearthstone'
const LOG_CONFIG = join(process.env.LOCALAPPDATA ?? '', 'Blizzard', 'Hearthstone', 'log.config')
const POWER_SECTION = '[Power]\nLogLevel=1\nFilePrinting=True\nConsolePrinting=False\nScreenPrinting=False\nVerbose=True\n'

const POLL_MS = 400
const RESCAN_MS = 5000
const CHUNK = 4 * 1024 * 1024
/** Los esbirros de la taberna llegan de a uno: esperamos a que el estado se estabilice. */
const SETTLE_MS = 150

export const installPath = () => process.env.HEARTHSTONE_PATH || DEFAULT_INSTALL

/** ¿El log.config tiene la sección [Power] con FilePrinting y Verbose activados? */
export async function isLogConfigOk() {
  try {
    const text = await readFile(LOG_CONFIG, 'utf8')
    const section = text.match(/\[Power\]([^[]*)/i)?.[1] ?? ''
    return /FilePrinting\s*=\s*true/i.test(section) && /Verbose\s*=\s*true/i.test(section)
  } catch {
    return false
  }
}

/** Agrega o reemplaza la sección [Power] del log.config. Hearthstone tiene que reiniciarse después. */
export async function enableLogConfig() {
  let text = ''
  try {
    text = await readFile(LOG_CONFIG, 'utf8')
  } catch {
    // No existe todavía: lo creamos.
  }
  const withoutPower = text.replace(/\[Power\][^[]*/i, '').trimEnd()
  await writeFile(LOG_CONFIG, `${withoutPower ? `${withoutPower}\n` : ''}${POWER_SECTION}`)
}

async function latestPowerLog() {
  const logs = join(installPath(), 'Logs')
  if (!existsSync(logs)) return null
  const sessions = (await readdir(logs, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && d.name.startsWith('Hearthstone_'))
    .map((d) => d.name)
    .sort()
  // Versiones viejas escriben directo en Logs/Power.log.
  const candidates = [...sessions.reverse().map((s) => join(logs, s, 'Power.log')), join(logs, 'Power.log')]
  return candidates.find((p) => existsSync(p)) ?? null
}

/**
 * @param {(event: { status: string, state?: object }) => void} onUpdate
 *   status: 'no-install' | 'no-log-config' | 'waiting' | 'game'
 */
export function watchPowerLog(onUpdate) {
  let file = null
  let offset = 0
  let remainder = ''
  let parser = createPowerLogParser()
  let lastSent = ''
  let settleTimer = null
  let lastRescan = 0
  let stopped = false

  const emit = (event) => {
    const key = JSON.stringify(event)
    if (key === lastSent) return
    lastSent = key
    onUpdate(event)
  }

  const emitState = () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      const state = parser.snapshot()
      emit(state ? { status: 'game', state } : { status: 'waiting' })
    }, SETTLE_MS)
  }

  async function readNew() {
    const { size } = await stat(file)
    if (size < offset) {
      // El archivo se reinició: empezamos de cero.
      offset = 0
      remainder = ''
      parser = createPowerLogParser()
    }
    if (size === offset) return false

    const handle = await open(file, 'r')
    try {
      while (offset < size) {
        const length = Math.min(CHUNK, size - offset)
        const buffer = Buffer.alloc(length)
        const { bytesRead } = await handle.read(buffer, 0, length, offset)
        offset += bytesRead
        const lines = (remainder + buffer.toString('utf8', 0, bytesRead)).split(/\r?\n/)
        remainder = lines.pop() ?? ''
        for (const line of lines) parser.feedLine(line)
      }
    } finally {
      await handle.close()
    }
    return true
  }

  async function tick() {
    if (stopped) return
    try {
      if (!existsSync(installPath())) {
        emit({ status: 'no-install' })
      } else if (!(await isLogConfigOk())) {
        emit({ status: 'no-log-config' })
      } else {
        if (Date.now() - lastRescan > RESCAN_MS || !file) {
          lastRescan = Date.now()
          const latest = await latestPowerLog()
          if (latest !== file) {
            file = latest
            offset = 0
            remainder = ''
            parser = createPowerLogParser()
          }
        }
        if (!file) emit({ status: 'waiting' })
        else if (await readNew()) emitState()
      }
    } catch (err) {
      console.error('[logwatcher]', err)
    }
    setTimeout(tick, POLL_MS)
  }

  tick()
  return {
    stop: () => {
      stopped = true
      clearTimeout(settleTimer)
    },
    /** Reenvía el último estado (por ejemplo, cuando la ventana recarga). */
    resend: () => {
      const last = lastSent
      lastSent = ''
      if (last) emit(JSON.parse(last))
    },
  }
}
