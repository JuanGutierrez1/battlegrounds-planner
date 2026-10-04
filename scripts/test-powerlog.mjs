// Corre el parser sobre un Power.log real y muestra la taberna en cada cambio de fase.
// Uso: node scripts/test-powerlog.mjs "<ruta al Power.log>"
import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { createPowerLogParser } from '../electron/powerlog.mjs'

const file = process.argv[2]
if (!file) throw new Error('Pasá la ruta a un Power.log')

const minions = JSON.parse(await readFile(new URL('../src/data/minions.json', import.meta.url), 'utf8'))
const name = new Map(minions.map((m) => [m.id, m.name.es]))
const label = (m) => `${name.get(m.cardId) ?? m.cardId}${m.golden ? ' (dorado)' : ''}`

const parser = createPowerLogParser()
let last = ''
for await (const line of createInterface({ input: createReadStream(file) })) {
  parser.feedLine(line)
  const s = parser.snapshot()
  if (!s) continue
  const key = `${s.phase}|${s.tavern.map((m) => m.entityId).join(',')}`
  if (key === last) continue
  last = key
  if (s.phase === 'recruit' && s.tavern.length) {
    console.log(`T${s.turn} taberna: ${s.tavern.map(label).join(' | ')}`)
    console.log(`    tablero: ${s.board.map(label).join(' | ') || '-'}`)
  } else if (s.phase === 'combat') {
    console.log(`T${s.turn} — combate`)
  }
}
