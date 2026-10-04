import type { Localized } from './i18n'

export type Tribe =
  | 'BEAST'
  | 'DEMON'
  | 'DRAGON'
  | 'ELEMENTAL'
  | 'MECHANICAL'
  | 'MURLOC'
  | 'NAGA'
  | 'PIRATE'
  | 'QUILBOAR'
  | 'UNDEAD'
  | 'ABERRATION'
  | 'ALL'

export interface Minion {
  id: string
  /** Id numérico de la carta; HSReplay referencia las cartas así. */
  dbfId: number
  name: Localized
  tier: number
  attack: number
  health: number
  tribes: Tribe[]
  text: Localized
}

/** Un slot del tablero: el id del esbirro o null si está vacío. */
export type BoardSlot = string | null
