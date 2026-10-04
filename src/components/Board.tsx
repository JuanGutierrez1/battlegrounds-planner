import { useEffect, useRef, useState, type DragEvent } from 'react'
import { DRAG_TYPE, MINIONS_BY_ID } from '../data/minions'
import { useI18n } from '../i18n'
import type { BoardSlot } from '../types'
import { CardImage } from './CardImage'

type DragPayload = { source: 'list'; id: string } | { source: 'board'; index: number }

interface Props {
  board: BoardSlot[]
  onPlace: (id: string, index: number) => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onClear: () => void
}

function readPayload(e: DragEvent): DragPayload | null {
  try {
    return JSON.parse(e.dataTransfer.getData(DRAG_TYPE))
  } catch {
    return null
  }
}

export function Board({ board, onPlace, onMove, onRemove, onClear }: Props) {
  const [dragOver, setDragOver] = useState<number | null>(null)
  /** Slot cuya carta se está arrastrando, y si el puntero está fuera del tablero. */
  const [dragging, setDragging] = useState<number | null>(null)
  const [outside, setOutside] = useState(false)
  const slotsRef = useRef<HTMLOListElement>(null)
  const { lang, t } = useI18n()
  const filled = board.filter(Boolean).length

  const isOutsideBoard = (x: number, y: number) => {
    const r = slotsRef.current?.getBoundingClientRect()
    return !r || x < r.left || x > r.right || y < r.top || y > r.bottom
  }

  // Seguimos el puntero a nivel ventana: dragend no trae coordenadas confiables en todos los navegadores.
  const lastPointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (dragging === null) return
    const track = (e: globalThis.DragEvent) => {
      lastPointer.current = { x: e.clientX, y: e.clientY }
      setOutside(isOutsideBoard(e.clientX, e.clientY))
    }
    window.addEventListener('dragover', track)
    return () => window.removeEventListener('dragover', track)
  }, [dragging])

  const handleDragEnd = (e: DragEvent, index: number) => {
    setDragging(null)
    setOutside(false)
    // Si cayó en un slot ya se movió; si se soltó fuera del tablero, se quita.
    const { x, y } = lastPointer.current
    if (e.dataTransfer.dropEffect === 'none' && isOutsideBoard(x, y)) onRemove(index)
  }

  const handleDrop = (e: DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(null)
    const payload = readPayload(e)
    if (payload?.source === 'list') onPlace(payload.id, index)
    if (payload?.source === 'board' && payload.index !== index) onMove(payload.index, index)
  }

  return (
    <section className="board">
      <header className="board__header">
        <h2>{t('board')}</h2>
        <span className="board__count">{filled} / {board.length}</span>
        <button type="button" className="link-button" onClick={onClear} disabled={filled === 0}>
          {t('clearBoard')}
        </button>
      </header>

      <ol className="board__slots" ref={slotsRef}>
        {board.map((id, index) => {
          const minion = id ? MINIONS_BY_ID.get(id) : undefined
          return (
            <li
              key={index}
              className={`board-slot${minion ? ' is-filled' : ''}${dragOver === index ? ' is-drag-over' : ''}`}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
                e.preventDefault()
                setDragOver(index)
              }}
              onDragLeave={() => setDragOver((cur) => (cur === index ? null : cur))}
              onDrop={(e) => handleDrop(e, index)}
            >
              {minion ? (
                <div
                  className={`board-slot__card${dragging === index ? (outside ? ' is-removing' : ' is-dragging') : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ source: 'board', index }))
                    e.dataTransfer.effectAllowed = 'move'
                    lastPointer.current = { x: e.clientX, y: e.clientY }
                    setDragging(index)
                  }}
                  onDragEnd={(e) => handleDragEnd(e, index)}
                >
                  <CardImage key={minion.id} minion={minion} />
                  <button
                    type="button"
                    className="board-slot__remove"
                    aria-label={t('remove', { name: minion.name[lang] })}
                    onClick={() => onRemove(index)}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="board-slot__empty">{index + 1}</span>
              )}
            </li>
          )
        })}
      </ol>

      {/* Los dos textos ocupan la misma celda: el alto no cambia al alternar y la página no salta. */}
      <p className="board__hint">
        <span className={outside ? 'is-hidden' : undefined}>{t('boardHint')}</span>
        <span className={`board__hint-warning${outside ? '' : ' is-hidden'}`}>{t('dropToRemove')}</span>
      </p>
    </section>
  )
}
