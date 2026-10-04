// Descarga los esbirros del pool de Battlegrounds desde HearthstoneJSON (en inglés y español)
// y genera una versión reducida en src/data/minions.json.
// Uso: npm run fetch-minions
import { writeFile } from 'node:fs/promises'

/** Idioma de la app → locale de HearthstoneJSON. Mantener en sync con src/i18n.tsx. */
const LOCALES = { en: 'enUS', es: 'esMX' }
const OUTPUT = new URL('../src/data/minions.json', import.meta.url)

const cleanText = (text = '') =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(/^\[x\]/, '')
    .replace(/\s+/g, ' ')
    .trim()

async function fetchCards(locale) {
  const url = `https://api.hearthstonejson.com/v1/latest/${locale}/cards.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`)
  return res.json()
}

const byLang = Object.fromEntries(
  await Promise.all(
    Object.entries(LOCALES).map(async ([lang, locale]) => {
      const cards = await fetchCards(locale)
      return [lang, new Map(cards.map((c) => [c.id, c]))]
    }),
  ),
)

const localized = (id, field, clean = (v) => v) =>
  Object.fromEntries(Object.keys(LOCALES).map((lang) => [lang, clean(byLang[lang].get(id)?.[field] ?? '')]))

const minions = [...byLang.en.values()]
  .filter((c) => c.isBattlegroundsPoolMinion && c.type === 'MINION')
  .map((c) => ({
    id: c.id,
    dbfId: c.dbfId,
    name: localized(c.id, 'name'),
    tier: c.techLevel,
    attack: c.attack ?? 0,
    health: c.health ?? 0,
    tribes: c.races ?? [],
    text: localized(c.id, 'text', cleanText),
  }))
  .sort((a, b) => a.tier - b.tier || a.name.en.localeCompare(b.name.en))

await writeFile(OUTPUT, JSON.stringify(minions))
console.log(`Guardados ${minions.length} esbirros en src/data/minions.json`)
