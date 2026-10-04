import { COMPS, type Comp } from '../data/comps'

export interface CompMatch {
  comp: Comp
  keyOwned: number
}

/** Las composiciones a las que más se parece lo que ya tenés (tablero + mano). */
export function rankComps(ownedIds: string[], limit = 3): CompMatch[] {
  const owned = new Set(ownedIds)
  return COMPS.map((comp) => ({ comp, keyOwned: comp.key.filter((id) => owned.has(id)).length }))
    .filter((m) => m.keyOwned > 0)
    // Más cartas core primero; a igualdad, el comp con mejor tier (COMPS ya viene ordenado por tier).
    .sort((a, b) => b.keyOwned - a.keyOwned || a.comp.tier - b.comp.tier)
    .slice(0, limit)
}
