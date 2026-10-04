import { minionArt } from '../data/minions'
import { useI18n } from '../i18n'
import type { Minion } from '../types'

/** Retrato ovalado del esbirro con marco de piedra. */
export function MinionIcon({ minion }: { minion: Minion }) {
  const { lang } = useI18n()

  return (
    <div className="minion-icon">
      <div className="minion-icon__frame">
        <img src={minionArt(minion.id)} alt={minion.name[lang]} loading="lazy" draggable={false} />
      </div>
    </div>
  )
}
