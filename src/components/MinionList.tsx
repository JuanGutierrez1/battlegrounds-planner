import { useMemo, useState } from 'react'
import { DRAG_TYPE, MINIONS, TIERS } from '../data/minions'
import { NEUTRAL, TRIBE_FILTERS, type TribeFilter } from '../data/tribes'
import { useI18n } from '../i18n'
import type { Minion } from '../types'
import { useCardPreview } from './CardPreview'
import { MinionIcon } from './MinionIcon'
import { TribeBadge } from './TribeBadge'

interface Props {
  onAdd: (id: string) => void
}

function matchesTribe(minion: Minion, tribe: TribeFilter) {
  if (tribe === NEUTRAL) return minion.tribes.length === 0
  return minion.tribes.includes(tribe) || minion.tribes.includes('ALL')
}

/** Busca en nombre y texto en todos los idiomas, así funciona aunque la carta esté en otro idioma. */
function matchesSearch(minion: Minion, query: string) {
  return [...Object.values(minion.name), ...Object.values(minion.text)].some((s) =>
    s.toLowerCase().includes(query),
  )
}

const toggle = <T,>(set: Set<T>, value: T) => {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function MinionList({ onAdd }: Props) {
  const [tribes, setTribes] = useState<Set<TribeFilter>>(new Set())
  const [tiers, setTiers] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const preview = useCardPreview()
  const { lang, t } = useI18n()

  const tribeCounts = useMemo(
    () => new Map(TRIBE_FILTERS.map((t) => [t, MINIONS.filter((m) => matchesTribe(m, t)).length])),
    [],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return MINIONS.filter(
      (m) =>
        (tribes.size === 0 || [...tribes].some((t) => matchesTribe(m, t))) &&
        (tiers.size === 0 || tiers.has(m.tier)) &&
        (!query || matchesSearch(m, query)),
    )
  }, [tribes, tiers, search])

  // Agrupado por nivel de taberna, omitiendo los niveles sin resultados.
  const byTier = useMemo(
    () =>
      TIERS.map((tier) => [tier, filtered.filter((m) => m.tier === tier)] as const).filter(
        ([, minions]) => minions.length > 0,
      ),
    [filtered],
  )

  const hasFilters = tribes.size > 0 || tiers.size > 0 || search !== ''

  return (
    <aside className="minion-list">
      <div className="minion-list__filters">
        <input
          className="minion-list__search"
          type="search"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-group" aria-label={t('filterByTier')}>
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className={`tier-button${tiers.has(tier) ? ' is-active' : ''}`}
              aria-pressed={tiers.has(tier)}
              onClick={() => setTiers((s) => toggle(s, tier))}
            >
              {tier}★
            </button>
          ))}
        </div>

        <div className="filter-group" aria-label={t('filterByTribe')}>
          {TRIBE_FILTERS.map((tribe) => (
            <TribeBadge
              key={tribe}
              tribe={tribe}
              active={tribes.has(tribe)}
              count={tribeCounts.get(tribe) ?? 0}
              onClick={() => setTribes((s) => toggle(s, tribe))}
            />
          ))}
        </div>

        <div className="minion-list__summary">
          <span>{t('minionCount', { n: filtered.length })}</span>
          {hasFilters && (
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setTribes(new Set())
                setTiers(new Set())
                setSearch('')
              }}
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      <div className="minion-list__items">
        {byTier.map(([tier, minions]) => (
          <section key={tier} className="tier-group">
            <h3 className="tier-group__label">
              <span className="tier-group__medal">{tier}</span>
              {t('tier', { n: tier })}
              <span className="tier-group__count">{minions.length}</span>
            </h3>
            <ul className="tier-group__grid">
              {minions.map((m) => (
                <li
                  key={m.id}
                  className="minion-cell"
                  aria-label={m.name[lang]}
                  draggable
                  onDragStart={(e) => {
                    preview.hide()
                    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ source: 'list', id: m.id }))
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => onAdd(m.id)}
                  {...preview.hover(m.id)}
                >
                  <MinionIcon minion={m} markKey />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 && <p className="minion-list__empty">{t('noResults')}</p>}
      </div>
    </aside>
  )
}
