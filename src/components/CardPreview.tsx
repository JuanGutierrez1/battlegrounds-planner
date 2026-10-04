import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { compName, COMPS_BY_MINION, tierLabel } from '../data/comps'
import { MINIONS_BY_ID } from '../data/minions'
import { useI18n } from '../i18n'
import { CardImage } from './CardImage'

const CARD_WIDTH = 250
const CARD_HEIGHT = Math.round((CARD_WIDTH * 776) / 512)
const GAP = 8
const MARGIN = 8

interface PreviewState {
  id: string
  anchor: DOMRect
}

interface PreviewApi {
  show: (id: string, el: HTMLElement) => void
  hide: () => void
}

const PreviewContext = createContext<PreviewApi | null>(null)

/** Alto aproximado de cada línea de comps bajo la carta, para calcular la posición. */
const COMP_LINE_HEIGHT = 22

/** Calcula dónde ubicar la carta: a la derecha del elemento, si no entra a la izquierda. */
function position(anchor: DOMRect, height: number) {
  let left = anchor.right + GAP
  if (left + CARD_WIDTH > window.innerWidth - MARGIN) left = anchor.left - GAP - CARD_WIDTH
  left = Math.max(MARGIN, left)

  const centered = anchor.top + anchor.height / 2 - height / 2
  const top = Math.min(Math.max(MARGIN, centered), window.innerHeight - height - MARGIN)
  return { left, top }
}

function CardPreview({ id, anchor }: PreviewState) {
  const { lang, t } = useI18n()
  const minion = MINIONS_BY_ID.get(id)
  if (!minion) return null

  const comps = COMPS_BY_MINION.get(id) ?? []
  const height = CARD_HEIGHT + (comps.length ? 16 + comps.length * COMP_LINE_HEIGHT : 0)

  return (
    <div className="card-preview" style={{ ...position(anchor, height), width: CARD_WIDTH }} role="tooltip">
      <div style={{ height: CARD_HEIGHT }}>
        <CardImage minion={minion} />
      </div>
      {comps.length > 0 && (
        <ul className="card-preview__comps">
          {comps.map((comp) => (
            <li key={comp.id} className="card-preview__comp">
              <span>{t('keyIn')}</span> {compName(comp, lang)}
              <span className="card-preview__tier">{tierLabel(comp.tier)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CardPreviewProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const show = useCallback(
    (id: string, el: HTMLElement) => setPreview({ id, anchor: el.getBoundingClientRect() }),
    [],
  )
  const hide = useCallback(() => setPreview(null), [])
  const api = useMemo(() => ({ show, hide }), [show, hide])

  // Al scrollear la posición guardada queda vieja: ocultamos.
  useEffect(() => {
    if (!preview) return
    window.addEventListener('scroll', hide, true)
    return () => window.removeEventListener('scroll', hide, true)
  }, [preview, hide])

  return (
    <PreviewContext.Provider value={api}>
      {children}
      {preview && <CardPreview key={preview.id} {...preview} />}
    </PreviewContext.Provider>
  )
}

/** Handlers para mostrar la carta completa al pasar el mouse sobre un elemento. */
export function useCardPreview() {
  const api = useContext(PreviewContext)
  if (!api) throw new Error('useCardPreview requiere <CardPreviewProvider>')

  return {
    hover: (id: string) => ({
      onMouseEnter: (e: MouseEvent<HTMLElement>) => api.show(id, e.currentTarget),
      onMouseLeave: api.hide,
    }),
    hide: api.hide,
  }
}
