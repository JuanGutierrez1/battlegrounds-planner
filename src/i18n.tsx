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
} satisfies Record<string, Localized>

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
