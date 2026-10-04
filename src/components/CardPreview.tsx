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
import { MINIONS_BY_ID } from '../data/minions'
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

/** Calcula dónde ubicar la carta: a la derecha del elemento, si no entra a la izquierda. */
function position(anchor: DOMRect) {
  let left = anchor.right + GAP
  if (left + CARD_WIDTH > window.innerWidth - MARGIN) left = anchor.left - GAP - CARD_WIDTH
  left = Math.max(MARGIN, left)

  const centered = anchor.top + anchor.height / 2 - CARD_HEIGHT / 2
  const top = Math.min(Math.max(MARGIN, centered), window.innerHeight - CARD_HEIGHT - MARGIN)
  return { left, top }
}

function CardPreview({ id, anchor }: PreviewState) {
  const minion = MINIONS_BY_ID.get(id)
  if (!minion) return null

  return (
    <div
      className="card-preview"
      style={{ ...position(anchor), width: CARD_WIDTH, height: CARD_HEIGHT }}
      role="tooltip"
    >
      <CardImage minion={minion} />
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
