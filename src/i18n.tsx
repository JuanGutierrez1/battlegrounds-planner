import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'

export const LANGS: Lang[] = ['es', 'en']

/** Idioma de la app → locale de HearthstoneJSON. Mantener en sync con scripts/fetch-minions.mjs. */
export const HS_LOCALE: Record<Lang, string> = { es: 'esMX', en: 'enUS' }

/** Texto en todos los idiomas soportados. */
export type Localized = Record<Lang, string>

const MESSAGES = {
  searchPlaceholder: { es: 'Buscar por nombre o texto…', en: 'Search by name or text…' },
  minionCount: { es: '{n} esbirros', en: '{n} minions' },
  clearFilters: { es: 'Limpiar filtros', en: 'Clear filters' },
  noResults: { es: 'Ningún esbirro coincide.', en: 'No minions match.' },
  tier: { es: 'Nivel {n}', en: 'Tier {n}' },
  filterByTier: { es: 'Filtrar por nivel', en: 'Filter by tier' },
  filterByTribe: { es: 'Filtrar por tipo', en: 'Filter by type' },
  board: { es: 'Tablero', en: 'Board' },
  clearBoard: { es: 'Vaciar tablero', en: 'Clear board' },
  remove: { es: 'Quitar {name}', en: 'Remove {name}' },
  boardHint: {
    es: 'Hacé click en un esbirro de la lista para agregarlo, o arrastralo a un slot. Arrastrá entre slots para reordenar, o fuera del tablero para quitarlo.',
    en: 'Click a minion in the list to add it, or drag it onto a slot. Drag between slots to reorder, or off the board to remove it.',
  },
  dropToRemove: { es: 'Soltá para quitar la carta del tablero.', en: 'Release to remove the card from the board.' },
  language: { es: 'Idioma', en: 'Language' },
  comps: { es: 'Composiciones', en: 'Comps' },
  compsSource: {
    es: 'Tier list de HSReplay · actualizada el {date}',
    en: 'HSReplay tier list · updated {date}',
  },
  compsEmpty: {
    es: 'Todavía no importaste comps. Abrí hsreplay.net/battlegrounds/comps, guardala con Ctrl+S y corré: npm run import-comps -- "<archivo guardado>"',
    en: 'No comps imported yet. Open hsreplay.net/battlegrounds/comps, save it with Ctrl+S and run: npm run import-comps -- "<saved file>"',
  },
  difficulty1: { es: 'Fácil', en: 'Easy' },
  difficulty2: { es: 'Media', en: 'Medium' },
  difficulty3: { es: 'Difícil', en: 'Hard' },
  viewGuide: { es: 'Ver guía', en: 'View guide' },
  keyCards: { es: 'Clave', en: 'Key' },
  loadComp: { es: 'Cargar en el tablero', en: 'Load on board' },
  keyIn: { es: 'Clave en', en: 'Key in' },
  overlayTavern: { es: 'Taberna', en: 'Tavern' },
  overlayRecruit: { es: 'Reclutamiento', en: 'Recruit' },
  overlayCombat: { es: 'Combate', en: 'Combat' },
  overlayTurn: { es: 'turno {n}', en: 'turn {n}' },
  overlayCombatHint: {
    es: 'En combate: la taberna se actualiza en el próximo turno.',
    en: 'In combat: the tavern updates next turn.',
  },
  overlayForYou: { es: 'tu comp', en: 'your comp' },
  overlayMoreComps: { es: '+{n} comps más', en: '+{n} more comps' },
  overlayYourComps: { es: 'Tus comps posibles', en: 'Your possible comps' },
  overlayYourCompsEmpty: {
    es: 'Cuando tengas esbirros en el tablero o la mano, te sugiero comps.',
    en: 'Once you have minions on board or in hand, comps will be suggested.',
  },
  overlayKeyCount: { es: '{owned}/{total} clave', en: '{owned}/{total} key' },
  overlayWaiting: { es: 'Esperando una partida de Battlegrounds…', en: 'Waiting for a Battlegrounds game…' },
  overlayNoInstall: {
    es: 'No encontré Hearthstone. Si está en otra carpeta, definí la variable HEARTHSTONE_PATH.',
    en: 'Hearthstone not found. If it is installed elsewhere, set the HEARTHSTONE_PATH variable.',
  },
  overlayNoLogConfig: {
    es: 'Hearthstone no está guardando el log de la partida, que es lo que lee el overlay.',
    en: 'Hearthstone is not writing the game log the overlay reads.',
  },
  overlayEnableLogs: { es: 'Activar el log', en: 'Enable the log' },
  overlayRestartHint: {
    es: 'Después reiniciá Hearthstone para que tome el cambio.',
    en: 'Then restart Hearthstone for the change to apply.',
  },
  overlayClose: { es: 'Cerrar overlay', en: 'Close overlay' },} satisfies Record<string, Localized>

export type MessageKey = keyof typeof MESSAGES

const STORAGE_KEY = 'bg-planner:lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') return saved
  } catch {
    // Storage no disponible: seguimos con el idioma del navegador.
  }
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
}

interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Texto de la interfaz, con reemplazo de {variables}. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Ignorado: el idioma simplemente no se recuerda.
    }
  }, [lang])

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, vars = {}) =>
        MESSAGES[key][lang].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)),
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n requiere <I18nProvider>')
  return ctx
}
