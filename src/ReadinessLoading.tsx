import { useEffect, useMemo, useRef, useState } from 'react'
import { IconCheckMarkSolid, Spinner, Text } from '@instructure/ui/v11_7'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'
import { CRITERIA, CRITERIA_NAME } from './CriteriaModal'
import { DESIGN_RULES } from './designCheckData'

// The course readiness check at work: it goes through one area at a time, and inside the area through each criterion in
// order, with a spinner on the one it is on and a check on the ones that are done. When the last one is done, `onDone`
// runs. Step 3 and step 5 both use it, and so does the wait between step 2 and step 3 and the Course check of the summary.

// The time on one criterion. The whole check takes about ten seconds, so there is time to read what is checked.
const STEP_MS = 420

// What an area checks: the criteria of the account that are on, and for the checks of the copy itself, its own rules.
const checksOf = (area: string): string[] => {
  const criteria = CRITERIA.find((a) => a.title === area)
  if (criteria) return criteria.settings.filter((s) => s.on).map((s) => s.title)
  return DESIGN_RULES.filter((r) => r.dimension === area).map((r) => r.title.replace(/\.$/, ''))
}

export default function ReadinessLoading({ areas, onDone }: { areas: string[]; onDone: () => void }) {
  const t = useSurfaceTokens()
  const legacy = useAppThemeKey() === 'legacy'
  const groups = useMemo(() => areas.map((area) => ({ area, checks: checksOf(area) })), [areas])
  const total = groups.reduce((n, g) => n + Math.max(1, g.checks.length), 0)
  // How many criteria are done, counted over all areas in order.
  const [done, setDone] = useState(0)
  const finish = useRef(onDone)
  useEffect(() => {
    finish.current = onDone
  })

  useEffect(() => {
    if (done >= total) {
      const end = setTimeout(() => finish.current(), 600)
      return () => clearTimeout(end)
    }
    const next = setTimeout(() => setDone((n) => n + 1), STEP_MS)
    return () => clearTimeout(next)
  }, [done, total])

  let offset = 0
  return (
    <div role="status">
      <Text as="div" color="secondary" size="small">Criteria</Text>
      <Text as="div" weight="bold">{CRITERIA_NAME}</Text>
      <div style={{ height: t.space.sm }} />
      <Text as="div" color="secondary">This can take some time. Keep this page open.</Text>
      {/* One card with a row for each area: the name and status on the left, its criteria beside it. */}
      <ul
        style={{
          listStyle: 'none',
          margin: `${t.space.md} 0 0`,
          padding: 0,
          background: legacy ? undefined : t.containerColor,
          borderRadius: legacy ? undefined : t.radiusCardMd,
          boxShadow: legacy ? undefined : t.shadowResting,
          overflow: 'hidden',
        }}
      >
        {groups.map(({ area, checks }, n) => {
          const list = checks.length ? checks : [area]
          const start = offset
          offset += list.length
          const areaDone = done >= start + list.length
          const areaActive = !areaDone && done >= start
          return (
            <li
              key={area}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(9rem, 12rem) 1fr',
                gap: t.space.lg,
                padding: t.space.lg,
                borderBlockStart: n ? `${t.borderWidth} solid ${t.borderColor}` : undefined,
                opacity: areaDone || areaActive ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.space.sm }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <Text as="div" weight="bold">{area}</Text>
                  {/* A finished area says so in text, with the same green check as the criteria. */}
                  {areaDone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm, color: t.successTextColor }}>
                      <span aria-hidden="true" style={{ display: 'inline-flex', flex: '0 0 1.25rem', justifyContent: 'center' }}><IconCheckMarkSolid /></span>
                      <Text size="small">Checked</Text>
                    </div>
                  ) : (
                    <Text as="div" size="small" color="secondary">{areaActive ? 'Checking' : 'Waiting'}</Text>
                  )}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
                {list.map((title, k) => {
                  const state = done > start + k ? 'done' : done === start + k ? 'active' : 'waiting'
                  return (
                    <li key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: t.space.sm, opacity: state === 'waiting' ? 0.6 : 1 }}>
                      <span aria-hidden={state !== 'active'} style={{ display: 'inline-flex', flex: '0 0 1.25rem', justifyContent: 'center', color: t.successTextColor }}>
                        {state === 'done' ? <IconCheckMarkSolid /> : state === 'active' ? <Spinner renderTitle={`Checking ${title}`} size="x-small" /> : null}
                      </span>
                      <Text size="small" color={state === 'waiting' ? 'secondary' : undefined}>{title}</Text>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
