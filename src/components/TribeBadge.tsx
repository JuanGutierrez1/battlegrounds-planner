import type { CSSProperties } from 'react'
import { TRIBE_INFO, type TribeFilter } from '../data/tribes'
import { useI18n } from '../i18n'

interface Props {
  tribe: TribeFilter
  active: boolean
  count: number
  onClick: () => void
}

export function TribeBadge({ tribe, active, count, onClick }: Props) {
  const { lang } = useI18n()
  const { label, color } = TRIBE_INFO[tribe]

  return (
    <button
      type="button"
      className={`tribe-badge${active ? ' is-active' : ''}`}
      style={{ '--tribe-color': color } as CSSProperties}
      aria-pressed={active}
      onClick={onClick}
    >
      {label[lang]}
      <span className="tribe-badge__count">{count}</span>
    </button>
  )
}
