import { compBoard, compName, COMPS, COMPS_UPDATED_AT, tierLabel } from '../data/comps'
import { MINIONS_BY_ID } from '../data/minions'
import { useI18n, type MessageKey } from '../i18n'
import { useCardPreview } from './CardPreview'
import { MinionIcon } from './MinionIcon'

interface Props {
  onAdd: (id: string) => void
  onLoad: (ids: string[]) => void
}

export function CompsPanel({ onAdd, onLoad }: Props) {
  const { lang, t } = useI18n()
  const preview = useCardPreview()
  const date = COMPS_UPDATED_AT?.toLocaleDateString(lang, { day: 'numeric', month: 'short' })

  return (
    <section className="comps">
      <header className="comps__header">
        <h2>{t('comps')}</h2>
        {date && <p>{t('compsSource', { date })}</p>}
      </header>

      {COMPS.length === 0 && <p className="comps__empty">{t('compsEmpty')}</p>}

      <div className="comps__grid">
        {COMPS.map((comp) => (
          <article key={comp.id} className="comp">
            <header className="comp__header">
              <span className={`comp__tier comp__tier--${tierLabel(comp.tier)}`}>{tierLabel(comp.tier)}</span>
              <h3>{compName(comp, lang)}</h3>
              <span className="comp__difficulty">{t(`difficulty${comp.difficulty}` as MessageKey)}</span>
            </header>
            <p className="comp__summary">{comp.summary}</p>

            <ul className="comp__cards">
              {comp.key.map((id) => {
                const minion = MINIONS_BY_ID.get(id)
                if (!minion) return null
                return (
                  <li key={id} className="comp__card" onClick={() => onAdd(id)} {...preview.hover(id)}>
                    <MinionIcon minion={minion} small />
                  </li>
                )
              })}
            </ul>

            <footer className="comp__footer">
              <button type="button" className="link-button" onClick={() => onLoad(compBoard(comp))}>
                {t('loadComp')}
              </button>
              <a className="link-button" href={comp.url} target="_blank" rel="noreferrer">
                {t('viewGuide')} ↗
              </a>
            </footer>
          </article>
        ))}
      </div>
    </section>
  )
}
