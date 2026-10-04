import type { Lang } from '../i18n'

export interface Comp {
  /** Slug de HSReplay, p. ej. "mechs-apm-magnetic". */
  id: string
  name: string
  summary: string
  /** 1 = S, 2 = A, 3 = B… */
  tier: number
  /** 1 fácil, 2 media, 3 difícil. */
  difficulty: number
  url: string
  /** Cartas core del comp según HSReplay. */
  key: string[]
}

interface CompsData {
  source: string
  updatedAt: string
  comps: Comp[]
}

// comps.json se genera con `npm run import-comps` y no está en el repo: si falta, no hay comps.
const files = import.meta.glob<CompsData>('./comps.json', { eager: true, import: 'default' })
const DATA: CompsData | undefined = Object.values(files)[0]

export const COMPS: Comp[] = DATA?.comps ?? []
export const COMPS_UPDATED_AT = DATA ? new Date(DATA.updatedAt) : null

export const TIER_LABELS = ['S', 'A', 'B', 'C', 'D']
export const tierLabel = (tier: number) => TIER_LABELS[tier - 1] ?? '?'

/** Tablero sugerido: las cartas core del comp (hasta 7). */
export const compBoard = (comp: Comp) => comp.key.slice(0, 7)

/** Para cada esbirro, los comps en los que es core. */
export const COMPS_BY_MINION = new Map<string, Comp[]>()
for (const comp of COMPS) {
  for (const id of comp.key) {
    COMPS_BY_MINION.set(id, [...(COMPS_BY_MINION.get(id) ?? []), comp])
  }
}

// HSReplay nombra los comps en inglés ("Mechs - APM Magnetic"): traducimos la tribu del principio.
const TRIBES_ES: Record<string, string> = {
  Aberrations: 'Aberraciones',
  Beasts: 'Bestias',
  Demons: 'Demonios',
  Dragons: 'Dragones',
  Elementals: 'Elementales',
  Mechs: 'Mecas',
  Murlocs: 'Múrlocs',
  Naga: 'Nagas',
  Pirates: 'Piratas',
  Quilboar: 'Jabaespines',
  Undead: 'No-muertos',
}

export function compName(comp: Comp, lang: Lang) {
  const [tribe, ...rest] = comp.name.split(' - ')
  const translated = lang === 'es' ? (TRIBES_ES[tribe] ?? tribe) : tribe
  return rest.length ? `${translated} – ${rest.join(' - ')}` : translated
}
