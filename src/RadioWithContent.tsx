import { useId } from 'react'
import type { ReactNode } from 'react'
import { RadioInput, Text } from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// A group of radio buttons where what belongs to a choice shows right under that choice, indented, while it is chosen.
// InstUI's RadioInputGroup only takes the radio buttons themselves, so this puts standalone RadioInputs in a radio group.
export type RadioChoice = { value: string; label: string; content?: ReactNode }

export default function RadioWithContent({
  name, legend, value, onChange, choices,
}: {
  name: string
  legend: string
  value: string
  onChange: (value: string) => void
  choices: RadioChoice[]
}) {
  const t = useSurfaceTokens()
  const legendId = useId()
  return (
    <div role="radiogroup" aria-labelledby={legendId} style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
      <Text weight="bold" id={legendId}>{legend}</Text>
      {choices.map((c) => {
        const checked = c.value === value
        return (
          <div key={c.value} style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
            <RadioInput name={name} value={c.value} label={c.label} checked={checked} onChange={() => onChange(c.value)} />
            {checked && c.content && (
              // The content lines up with the label of its radio button, not with the circle.
              <div style={{ marginInlineStart: t.space.xl, display: 'flex', flexDirection: 'column', gap: t.space.md }}>{c.content}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
