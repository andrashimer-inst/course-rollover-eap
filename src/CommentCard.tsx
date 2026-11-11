import { SimpleSelect, Text } from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'
import { useSurfaceTokens } from './appTheme'
import { DECISION_LABEL } from './rolloverData'
import type { Decision, EducatorComment } from './rolloverData'

// One comment the teaching team left, with the choice for what to do with the item when it is copied.
// It shows in the comments list and, under the item it is about, in the course design results.
// `scope` keeps the select option ids apart when the same comment is on the page twice.
export default function CommentCard({
  comment,
  decision,
  onDecide,
  scope,
}: {
  comment: EducatorComment
  decision: Decision
  onDecide: (id: string, d: Decision) => void
  scope: string
}) {
  const t = useSurfaceTokens()
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 15rem',
        gap: t.space.xl,
        alignItems: 'start',
        padding: t.space.lg,
        background: t.containerColor,
        border: `${t.borderWidth} solid ${t.borderColor}`,
        borderRadius: t.radiusMd,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
        <div style={{ display: 'flex', gap: t.space.sm, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusPill size="sm">{comment.area}</StatusPill>
          <Text weight="bold">{comment.item}</Text>
        </div>
        <Text as="p">“{comment.text}”</Text>
        <Text size="small" color="secondary">
          {comment.author}, {comment.term}
        </Text>
      </div>
      <SimpleSelect
        renderLabel={`What to do with ${comment.item}`}
        value={decision}
        onChange={(_e, { value }) => onDecide(comment.id, value as Decision)}
      >
        {(Object.keys(DECISION_LABEL) as Decision[]).map((d) => (
          <SimpleSelect.Option key={d} id={`${scope}-${comment.id}-${d}`} value={d}>
            {DECISION_LABEL[d]}
          </SimpleSelect.Option>
        ))}
      </SimpleSelect>
    </li>
  )
}
