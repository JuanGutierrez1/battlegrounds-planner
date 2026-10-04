import { useEffect, useState } from 'react'
import { MINIONS_BY_ID } from '../data/minions'
import type { BoardSlot } from '../types'

export const BOARD_SIZE = 7
const STORAGE_KEY = 'bg-planner:board'

const emptyBoard = (): BoardSlot[] => Array(BOARD_SIZE).fill(null)

function loadBoard(): BoardSlot[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(saved) && saved.length === BOARD_SIZE) {
      return saved.map((id) => (typeof id === 'string' && MINIONS_BY_ID.has(id) ? id : null))
    }
  } catch {
    // Storage no disponible o corrupto: arrancamos vacío.
  }
  return emptyBoard()
}

export function useBoard() {
  const [board, setBoard] = useState<BoardSlot[]>(loadBoard)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
    } catch {
      // Ignorado: el tablero simplemente no se recuerda.
    }
  }, [board])

  /** Agrega en el primer slot libre; no hace nada si el tablero está lleno. */
  const add = (id: string) =>
    setBoard((b) => {
      const index = b.indexOf(null)
      return index === -1 ? b : b.map((slot, i) => (i === index ? id : slot))
    })

  const place = (id: string, index: number) =>
    setBoard((b) => b.map((slot, i) => (i === index ? id : slot)))

  const remove = (index: number) => setBoard((b) => b.map((slot, i) => (i === index ? null : slot)))

  const move = (from: number, to: number) =>
    setBoard((b) => {
      const next = [...b]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })

  const clear = () => setBoard(emptyBoard())

  /** Reemplaza el tablero por estos esbirros (los que sobren de 7 se ignoran). */
  const load = (ids: string[]) =>
    setBoard(emptyBoard().map((_, i) => (ids[i] && MINIONS_BY_ID.has(ids[i]) ? ids[i] : null)))

  return { board, add, place, remove, move, clear, load }
}
