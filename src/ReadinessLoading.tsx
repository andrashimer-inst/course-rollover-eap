import { useEffect, useRef, useState } from 'react'
import { IconCheckMarkSolid, Spinner, Text } from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// The course readiness check at work: it goes through one design area at a time, with a spinner on the area it is
// on and a check on the ones that are done. When the last area is done, `onDone` runs. Step 3 and step 5 both use it,
// and so does the wait between step 2 and step 3.

const STEP_MS = 450

export default function ReadinessLoading({ areas, onDone }: { areas: string[]; onDone: () => void }) {
  const t = useSurfaceTokens()
  const [doneAreas, setDoneAreas] = useState(0)
  const finish = useRef(onDone)
  useEffect(() => {
    finish.current = onDone
  })

  useEffect(() => {
    if (doneAreas >= areas.length) {
      const end = setTimeout(() => finish.current(), 300)
      return () => clearTimeout(end)
    }
    const next = setTimeout(() => setDoneAreas((n) => n + 1), STEP_MS)
    return () => clearTimeout(next)
  }, [doneAreas, areas.length])

  return (
    <div role="status">
      <Text as="div" color="secondary">This can take some time. Keep this page open.</Text>
      <ul style={{ listStyle: 'none', margin: `${t.space.md} 0 0`, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))', gap: t.space.md }}>
        {areas.map((area, i) => (
          <li
            key={area}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.space.md,
              padding: t.space.md,
              background: t.containerColor,
              borderRadius: t.radiusCardSm,
              boxShadow: t.shadowResting,
              opacity: i <= doneAreas ? 1 : 0.5,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <Text as="div" weight="bold">{area}</Text>
              <Text as="div" size="small" color="secondary">{i < doneAreas ? 'Checked' : i === doneAreas ? 'Checking' : 'Waiting'}</Text>
            </span>
            <span style={{ display: 'inline-flex', color: t.successTextColor }}>
              {i < doneAreas ? <IconCheckMarkSolid /> : i === doneAreas ? <Spinner renderTitle={`Checking ${area}`} size="x-small" /> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
