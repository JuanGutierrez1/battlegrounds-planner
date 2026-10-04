import type { Localized } from '../i18n'
import type { Tribe } from '../types'

/** Filtro especial para esbirros sin tipo. */
export const NEUTRAL = 'NEUTRAL' as const

export type TribeFilter = Exclude<Tribe, 'ALL'> | typeof NEUTRAL

export const TRIBE_INFO: Record<TribeFilter, { label: Localized; color: string }> = {
  BEAST: { label: { es: 'Bestia', en: 'Beast' }, color: '#8b5a2b' },
  DEMON: { label: { es: 'Demonio', en: 'Demon' }, color: '#7b2fbe' },
  DRAGON: { label: { es: 'Dragón', en: 'Dragon' }, color: '#c0392b' },
  ELEMENTAL: { label: { es: 'Elemental', en: 'Elemental' }, color: '#2e86c1' },
  MECHANICAL: { label: { es: 'Meca', en: 'Mech' }, color: '#7f8c8d' },
  MURLOC: { label: { es: 'Múrloc', en: 'Murloc' }, color: '#17a589' },
  NAGA: { label: { es: 'Naga', en: 'Naga' }, color: '#1f618d' },
  PIRATE: { label: { es: 'Pirata', en: 'Pirate' }, color: '#b9770e' },
  QUILBOAR: { label: { es: 'Jabaespín', en: 'Quilboar' }, color: '#c2185b' },
  UNDEAD: { label: { es: 'No-muerto', en: 'Undead' }, color: '#5d6d7e' },
  ABERRATION: { label: { es: 'Aberración', en: 'Aberration' }, color: '#6c3483' },
  NEUTRAL: { label: { es: 'Neutral', en: 'Neutral' }, color: '#566573' },
}

export const TRIBE_FILTERS: TribeFilter[] = [
  'BEAST',
  'DEMON',
  'DRAGON',
  'ELEMENTAL',
  'MECHANICAL',
  'MURLOC',
  'NAGA',
  'PIRATE',
  'QUILBOAR',
  'UNDEAD',
  'ABERRATION',
  NEUTRAL,
]
