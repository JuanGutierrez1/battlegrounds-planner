// Parser incremental del Power.log de Hearthstone, enfocado en Battlegrounds.
// Solo usa las líneas de GameState (el estado lógico, que llega antes que las animaciones).
// No depende de Electron: se puede probar con Node puro (ver scripts/test-powerlog.mjs).

const LINE = /^D [\d:.]+ GameState\.DebugPrint(Power|Game)\(\) - (.*)$/
const ENTITY_ID = /\bid=(\d+)/

/** Fases del tablero según el tag BOARD_VISUAL_STATE del GameEntity. */
export const PHASE = { RECRUIT: 'recruit', COMBAT: 'combat' }

export function createPowerLogParser() {
  let game = null
  /** Entidad cuyos tags indentados estamos leyendo (después de FULL_ENTITY / SHOW_ENTITY / CHANGE_ENTITY). */
  let current = null

  const reset = () => {
    game = {
      isBattlegrounds: false,
      entities: new Map(),
      gameTags: {},
      /** PlayerID → nombre */
      players: new Map(),
    }
    current = null
  }

  const entity = (id) => {
    let e = game.entities.get(id)
    if (!e) {
      e = { id, cardId: '', tags: {} }
      game.entities.set(id, e)
    }
    return e
  }

  /** Resuelve "[entityName=... id=62 ...]", "62" o "GameEntity". Los nombres de jugador se ignoran. */
  const resolve = (ref) => {
    if (ref === 'GameEntity') return 'game'
    const bracket = ref.match(ENTITY_ID)
    if (ref.startsWith('[') && bracket) return entity(Number(bracket[1]))
    if (/^\d+$/.test(ref)) return entity(Number(ref))
    return null
  }

  const setTag = (target, tag, value) => {
    if (target === 'game') game.gameTags[tag] = value
    else if (target) target.tags[tag] = value
  }

  function feedLine(line) {
    const m = LINE.exec(line)
    if (!m) return
    const [, kind, body] = m
    const text = body.trim()

    if (kind === 'Game') {
      const type = text.match(/^GameType=(\S+)/)
      if (type && game) game.isBattlegrounds = type[1].startsWith('GT_BATTLEGROUNDS')
      const player = text.match(/^PlayerID=(\d+), PlayerName=(.*)$/)
      if (player && game) game.players.set(Number(player[1]), player[2])
      return
    }

    if (text === 'CREATE_GAME') {
      reset()
      return
    }
    if (!game) return

    let match
    if ((match = text.match(/^tag=(\S+) value=(\S+)$/))) {
      if (current) setTag(current, match[1], match[2])
      return
    }

    current = null
    if ((match = text.match(/^FULL_ENTITY - Creating ID=(\d+) CardID=(\S*)/))) {
      current = entity(Number(match[1]))
      current.cardId = match[2]
    } else if ((match = text.match(/^(?:FULL_ENTITY|SHOW_ENTITY|CHANGE_ENTITY) - Updating (?:Entity=)?(.+?) CardID=(\S*)$/))) {
      const target = resolve(match[1])
      if (target && target !== 'game') {
        current = target
        current.cardId = match[2]
      }
    } else if ((match = text.match(/^TAG_CHANGE Entity=(.+?) tag=(\S+) value=(\S+)/))) {
      setTag(resolve(match[1]), match[2], match[3])
    }
  }

  /** Estado de Battlegrounds listo para mostrar, o null si no hay una partida de BG en curso. */
  function snapshot() {
    // STATE=COMPLETE en el GameEntity: la partida terminó.
    if (!game?.isBattlegrounds || game.gameTags.STATE === 'COMPLETE') return null

    const all = [...game.entities.values()]
    // Bob es un "jugador" propio: el dueño de la entidad TB_BaconShopBob.
    const bob = all.find((e) => e.cardId.startsWith('TB_BaconShopBob'))
    const bobController = bob ? Number(bob.tags.CONTROLLER ?? NaN) : NaN
    const localPlayer = [...game.players.keys()].find((id) => id !== bobController)

    const minionsOf = (controller, zone) =>
      all
        .filter(
          (e) =>
            e.tags.CARDTYPE === 'MINION' &&
            e.tags.ZONE === zone &&
            Number(e.tags.CONTROLLER) === controller &&
            e.cardId,
        )
        .sort((a, b) => Number(a.tags.ZONE_POSITION ?? 0) - Number(b.tags.ZONE_POSITION ?? 0))
        .map((e) => ({ entityId: e.id, cardId: e.cardId.replace(/_G$/, ''), golden: e.cardId.endsWith('_G') }))

    const phase = game.gameTags.BOARD_VISUAL_STATE === '2' ? PHASE.COMBAT : PHASE.RECRUIT

    return {
      phase,
      // En combate los esbirros "de Bob" son en realidad el tablero del rival: no es la taberna.
      tavern: phase === PHASE.RECRUIT ? minionsOf(bobController, 'PLAY') : [],
      board: minionsOf(localPlayer, 'PLAY'),
      hand: minionsOf(localPlayer, 'HAND'),
      turn: Number(game.gameTags.TURN ?? 0),
    }
  }

  reset()
  game = null
  return { feedLine, snapshot }
}
