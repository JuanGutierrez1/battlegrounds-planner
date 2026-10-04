// Overlay de escritorio: una ventana chica, transparente y siempre arriba del juego,
// que muestra la taberna actual y marca los esbirros clave de cada composición.
import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { enableLogConfig, watchPowerLog } from './logwatcher.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const DEV_URL = process.env.VITE_DEV_URL
const BOUNDS_FILE = join(app.getPath('userData'), 'overlay-bounds.json')

function loadBounds() {
  try {
    return JSON.parse(readFileSync(BOUNDS_FILE, 'utf8'))
  } catch {
    // Primera vez: arriba a la derecha de la pantalla principal.
    const { workArea } = screen.getPrimaryDisplay()
    return { width: 340, height: 620, x: workArea.x + workArea.width - 360, y: workArea.y + 80 }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    ...loadBounds(),
    minWidth: 260,
    minHeight: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    title: 'BG Planner Overlay',
    webPreferences: {
      preload: join(here, 'preload.cjs'),
      contextIsolation: true,
    },
  })
  // Nivel alto para quedar por encima del juego en modo ventana / pantalla completa sin bordes.
  win.setAlwaysOnTop(true, 'screen-saver')

  const saveBounds = () => writeFileSync(BOUNDS_FILE, JSON.stringify(win.getBounds()))
  win.on('moved', saveBounds)
  win.on('resized', saveBounds)

  if (DEV_URL) win.loadURL(`${DEV_URL}/overlay.html`)
  else win.loadFile(join(here, '..', 'dist', 'overlay.html'))
  return win
}

app.whenReady().then(() => {
  const win = createWindow()
  const watcher = watchPowerLog((event) => {
    if (!win.isDestroyed()) win.webContents.send('bg-update', event)
  })

  ipcMain.on('overlay-ready', () => watcher.resend())
  ipcMain.on('overlay-close', () => app.quit())
  ipcMain.handle('enable-log-config', () => enableLogConfig())

  app.on('window-all-closed', () => {
    watcher.stop()
    app.quit()
  })
})
