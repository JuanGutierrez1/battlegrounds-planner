import { useEffect, useMemo, useState } from 'react'
import { MinionIcon } from '../components/MinionIcon'
import { compName, COMPS_BY_MINION, tierLabel } from '../data/comps'
import { MINIONS_BY_ID } from '../data/minions'
import { useI18n } from '../i18n'
import { LangSwitch } from '../components/LangSwitch'
import { bridge, type BgState, type BgUpdate, type LogMinion } from './bridge'
import { rankComps } from './ranking'

/** Fuera de Electron (abriendo overlay.html en el navegador) mostramos una taberna de ejemplo. */
const DEMO: BgUpdate = {
  status: 'game',
  state: {
    phase: 'recruit',
    turn: 9,
    tavern: ['BG36_367', 'BG31_803', 'BG36_506', 'BG32_236', 'BG_LOE_077'].map((cardId, i) => ({
      entityId: i,
      cardId,
      golden: false,
    })),
    board: ['BG33_823', 'BG33_825', 'BG36_851'].map((cardId, i) => ({ entityId: 100 + i, cardId, golden: false })),
    hand: [],
  },
}

function TavernRow({ minion, targetComps }: { minion: LogMinion; targetComps: Set<string> }) {
  const { lang, t } = useI18n()
  const data = MINIONS_BY_ID.get(minion.cardId)
  if (!data) return null

  const comps = COMPS_BY_MINION.get(minion.cardId) ?? []
  const forYou = comps.some((c) => targetComps.has(c.id))
  const level = forYou ? 'target' : comps.length ? 'key' : 'none'
  // Primero los comps hacia los que vas; el resto ya viene ordenado por tier. Mostramos hasta 3.
  const shown = [...comps].sort((a, b) => Number(targetComps.has(b.id)) - Number(targetComps.has(a.id))).slice(0, 3)

  return (
    <li className={`ov-minion ov-minion--${level}`}>
      <MinionIcon minion={data} small />
      <div className="ov-minion__info">
        <span className="ov-minion__name">
          {data.name[lang]}
          {forYou && <span className="ov-badge">★ {t('overlayForYou')}</span>}
        </span>
        {shown.map((comp) => (
          <span key={comp.id} className={`ov-comp ov-comp--key${targetComps.has(comp.id) ? ' is-target' : ''}`}>
            {t('keyIn')} {compName(comp, lang)} · {tierLabel(comp.tier)}
          </span>
        ))}
        {comps.length > shown.length && (
          <span className="ov-comp">{t('overlayMoreComps', { n: comps.length - shown.length })}</span>
        )}
      </div>
    </li>
  )
}

function GameView({ state }: { state: BgState }) {
  const { lang, t } = useI18n()
  const owned = useMemo(() => [...state.board, ...state.hand].map((m) => m.cardId), [state.board, state.hand])
  const matches = useMemo(() => rankComps(owned), [owned])
  const targetComps = useMemo(() => new Set(matches.map((m) => m.comp.id)), [matches])

  return (
    <>
      <section className="ov-section">
        <h2>
          {t('overlayTavern')}
          <span className={`ov-phase ov-phase--${state.phase}`}>
            {t(state.phase === 'recruit' ? 'overlayRecruit' : 'overlayCombat')} · {t('overlayTurn', { n: Math.ceil(state.turn / 2) || 1 })}
          </span>
        </h2>
        {state.phase === 'combat' ? (
          <p className="ov-muted">{t('overlayCombatHint')}</p>
        ) : (
          <ul className="ov-list">
            {state.tavern.map((m) => (
              <TavernRow key={m.entityId} minion={m} targetComps={targetComps} />
            ))}
          </ul>
        )}
      </section>

      <section className="ov-section">
        <h2>{t('overlayYourComps')}</h2>
        {matches.length === 0 ? (
          <p className="ov-muted">{t('overlayYourCompsEmpty')}</p>
        ) : (
          <ul className="ov-comps">
            {matches.map(({ comp, keyOwned }) => (
              <li key={comp.id}>
                <span>
                  <span className={`comp__tier comp__tier--${tierLabel(comp.tier)}`}>{tierLabel(comp.tier)}</span>{' '}
                  {compName(comp, lang)}
                </span>
                <span className="ov-muted">{t('overlayKeyCount', { owned: keyOwned, total: comp.key.length })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export function OverlayApp() {
  const { t } = useI18n()
  const api = bridge()
  const [update, setUpdate] = useState<BgUpdate | null>(api ? null : DEMO)
  const [enabling, setEnabling] = useState(false)

  useEffect(() => api?.onUpdate(setUpdate), [api])

  let body
  if (update?.status === 'game') body = <GameView state={update.state} />
  else if (update?.status === 'no-install') body = <p className="ov-muted">{t('overlayNoInstall')}</p>
  else if (update?.status === 'no-log-config')
    body = (
      <div className="ov-setup">
        <p>{t('overlayNoLogConfig')}</p>
        <button
          type="button"
          disabled={enabling}
          onClick={async () => {
            setEnabling(true)
            await api?.enableLogConfig()
            setEnabling(false)
          }}
        >
          {t('overlayEnableLogs')}
        </button>
        <p className="ov-muted">{t('overlayRestartHint')}</p>
      </div>
    )
  else body = <p className="ov-muted">{t('overlayWaiting')}</p>

  return (
    <div className="ov">
      <header className="ov-header">
        <span className="ov-title">BG Planner</span>
        <LangSwitch />
        {api && (
          <button type="button" className="ov-close" aria-label={t('overlayClose')} onClick={api.close}>
            ×
          </button>
        )}
      </header>
      <main className="ov-body">{body}</main>
    </div>
  )
}
