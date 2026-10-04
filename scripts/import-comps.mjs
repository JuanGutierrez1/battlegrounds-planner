// Importa la tier list de comps de HSReplay desde la página guardada en el navegador.
// 1. Abrí https://hsreplay.net/battlegrounds/comps/ y guardala con Ctrl+S.
// 2. npm run import-comps -- "<ruta al .html guardado>"
// El resultado (src/data/comps.json) está en el .gitignore: es para uso personal, no se sube al repo.
import { readFile, writeFile } from 'node:fs/promises'

const file = process.argv[2]
if (!file) {
  console.error('Uso: npm run import-comps -- "<ruta a la página de comps de HSReplay guardada>"')
  process.exit(1)
}

const MINIONS = new URL('../src/data/minions.json', import.meta.url)
const OUTPUT = new URL('../src/data/comps.json', import.meta.url)

const html = await readFile(file, 'utf8')
const json = html.match(/<script[^>]*id="react_context"[^>]*>([\s\S]*?)<\/script>/)?.[1]
const raw = json && JSON.parse(json).comps
if (!Array.isArray(raw)) {
  console.error('No encontré los comps en ese archivo. ¿Es la página https://hsreplay.net/battlegrounds/comps/?')
  process.exit(1)
}

const byDbfId = new Map(JSON.parse(await readFile(MINIONS, 'utf8')).map((m) => [m.dbfId, m.id]))
const missing = new Set()

const comps = raw
  .map((c) => {
    const key = c.comp_core_cards.map((dbfId) => {
      const id = byDbfId.get(dbfId)
      if (!id) missing.add(dbfId)
      return id
    })
    return {
      id: c.comp_slug,
      name: c.comp_name,
      summary: c.comp_summary,
      tier: c.comp_tier,
      tierRank: c.comp_tier_rank,
      difficulty: c.comp_difficulty,
      url: `https://hsreplay.net/battlegrounds/comps/${c.comp_id}/${c.comp_slug}/`,
      key: key.filter(Boolean),
      updatedAt: c.comp_last_updated,
    }
  })
  .sort((a, b) => a.tier - b.tier || a.tierRank - b.tierRank)

const updatedAt = comps.map((c) => c.updatedAt).sort().at(-1) ?? new Date().toISOString()
await writeFile(OUTPUT, JSON.stringify({ source: 'hsreplay', updatedAt, comps }))

console.log(`Importados ${comps.length} comps en src/data/comps.json`)
if (missing.size) {
  console.warn(
    `${missing.size} cartas no están en el pool actual (dbfId ${[...missing].join(', ')}). ` +
      'Si hubo parche, corré npm run fetch-minions y volvé a importar.',
  )
}
