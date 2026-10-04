/** Tipos de lo que expone electron/preload.cjs como window.bgOverlay. */

export interface LogMinion {
  entityId: number
  cardId: string
  golden: boolean
}

export interface BgState {
  phase: 'recruit' | 'combat'
  tavern: LogMinion[]
  board: LogMinion[]
  hand: LogMinion[]
  /** Turno según el juego: cuenta reclutamiento y combate por separado. */
  turn: number
}

export type BgUpdate =
  | { status: 'no-install' | 'no-log-config' | 'waiting' }
  | { status: 'game'; state: BgState }

interface OverlayBridge {
  onUpdate: (callback: (update: BgUpdate) => void) => () => void
  enableLogConfig: () => Promise<void>
  close: () => void
}

declare global {
  interface Window {
    /** Solo existe dentro de Electron. */
    bgOverlay?: OverlayBridge
  }
}

export const bridge = () => window.bgOverlay
