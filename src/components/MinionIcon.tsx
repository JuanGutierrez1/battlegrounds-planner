import { COMPS_BY_MINION } from '../data/comps'
import { minionArt } from '../data/minions'
import { useI18n } from '../i18n'
import type { Minion } from '../types'

interface Props {
  minion: Minion
  /** Versión chica, para los paneles de comps. */
  small?: boolean
  /** Marca con una gema si el esbirro es clave en alguna composición. */
  markKey?: boolean
}

/** Retrato ovalado del esbirro con marco de piedra. */
export function MinionIcon({ minion, small = false, markKey = false }: Props) {
  const { lang } = useI18n()
  const isKey = markKey && COMPS_BY_MINION.has(minion.id)

  return (
    <div className={`minion-icon${small ? ' minion-icon--small' : ''}`}>
      <div className="minion-icon__frame">
        <img src={minionArt(minion.id)} alt={minion.name[lang]} loading="lazy" draggable={false} />
      </div>
      {isKey && <span className="minion-icon__key" aria-hidden="true" />}
    </div>
  )
}
