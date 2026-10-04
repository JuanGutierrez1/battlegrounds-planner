// Modo desarrollo del overlay: levanta Vite y abre Electron apuntando al dev server.
// Uso: npm run overlay:dev
import { spawn } from 'node:child_process'
import electron from 'electron'
import { createServer } from 'vite'

const server = await createServer()
await server.listen()
const url = server.resolvedUrls.local[0].replace(/\/$/, '')
console.log(`Vite en ${url} — abriendo el overlay…`)

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DEV_URL: url },
})
child.on('exit', async (code) => {
  await server.close()
  process.exit(code ?? 0)
})
