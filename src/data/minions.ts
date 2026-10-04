import { HS_LOCALE, type Lang } from '../i18n'
import type { Minion } from '../types'
import raw from './minions.json'

export const MINIONS = raw as Minion[]

export const MINIONS_BY_ID = new Map(MINIONS.map((m) => [m.id, m]))

export const TIERS = [1, 2, 3, 4, 5, 6, 7]

/** Arte recortado del esbirro, ideal para íconos circulares. */
export const minionArt = (id: string) => `https://art.hearthstonejson.com/v1/256x/${id}.jpg`

/** Carta completa renderizada (versión Battlegrounds) en el idioma pedido. */
export const cardRender = (id: string, lang: Lang) =>
  `https://art.hearthstonejson.com/v1/bgs/latest/${HS_LOCALE[lang]}/512x/${id}.png`

/** Tipo MIME usado para arrastrar esbirros entre la lista y el tablero. */
export const DRAG_TYPE = 'application/x-bg-minion'
