import { LANGS, useI18n } from '../i18n'

const LABELS = { es: 'ES', en: 'EN' } as const
const NAMES = { es: 'Español', en: 'English' } as const

export function LangSwitch() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="lang-switch" role="group" aria-label={t('language')}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'is-active' : undefined}
          aria-pressed={l === lang}
          title={NAMES[l]}
          lang={l}
          onClick={() => setLang(l)}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  )
}
