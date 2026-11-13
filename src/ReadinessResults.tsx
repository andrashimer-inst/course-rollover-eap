import { Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import { STATUS_LABEL } from './reviewCopyData'
import type { ReadyStatus } from './reviewCopyData'
import { useSurfaceTokens } from './appTheme'

// The result of the course readiness check: one block for each area, one line for each criterion with how it stands.
// The last step and the summary page both show it.

const STATUS_PILL: Record<ReadyStatus, 'success' | 'warning' | 'error'> = {
  pass: 'success',
  fixed: 'success',
  later: 'warning',
  open: 'warning',
}

export type CheckGroup = { dimension: string; rules: { title: string; status: ReadyStatus; note: string }[] }

export default function ReadinessResults({ groups }: { groups: CheckGroup[] }) {
  const t = useSurfaceTokens()
  return (
    <div>
      {groups.map((g) => (
        <div key={g.dimension} style={{ marginTop: t.space.lg }}>
          <div style={{ background: t.pageColor, padding: t.space.md }}>
            <Text weight="bold">{g.dimension}</Text>
          </div>
          {g.rules.map((x) => (
            <div
              key={x.title}
              style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'center', justifyContent: 'space-between', padding: t.space.md, borderTop: `${t.borderWidth} solid ${t.borderColor}` }}
            >
              <div style={{ flex: '1 1 20rem', minWidth: 0 }}>
                <Text as="div" weight="bold">{x.title}</Text>
                <Text as="div" color="secondary">{x.note}</Text>
              </div>
              <StatusPill size="sm" color={STATUS_PILL[x.status]}>{STATUS_LABEL[x.status]}</StatusPill>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
