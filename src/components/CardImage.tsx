import { useState } from 'react'
import { cardRender } from '../data/minions'
import { useI18n } from '../i18n'
import type { Minion } from '../types'

/** Carta completa renderizada, con un resumen en texto mientras carga la imagen. */
export function CardImage({ minion }: { minion: Minion }) {
  const { lang, t } = useI18n()
  const src = cardRender(minion.id, lang)
  // Guardamos qué imagen terminó de cargar, así al cambiar de idioma vuelve a mostrar el resumen.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === src

  return (
    <div className="card-image">
      {!loaded && (
        <div className="card-image__fallback">
          <strong>{minion.name[lang]}</strong>
          <span>
            {t('tier', { n: minion.tier })} · {minion.attack}/{minion.health}
          </span>
          {minion.text[lang] && <p>{minion.text[lang]}</p>}
        </div>
      )}
      <img
        src={src}
        alt={minion.name[lang]}
        draggable={false}
        onLoad={() => setLoadedSrc(src)}
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}
