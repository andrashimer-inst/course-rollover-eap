import { Checkbox, DateInput, SimpleSelect, Text } from '@instructure/ui/v11_7'
import type { Opening } from './reviewCopyData'
import { useSurfaceTokens } from './appTheme'

// When students see the course: publish on a day and time, or publish by hand. It is one card in the dates step, under the
// date placement. A dropdown picks the way, and the day and time show under it when the course publishes by itself.

// Every half hour of the day, for the publish time.
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? 0 : 30
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const label = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return { value, label }
})

export default function PublishCards({ opening, setOpening }: { opening: Opening; setOpening: (o: Opening) => void }) {
  const t = useSurfaceTokens()
  const auto = opening.mode === 'open'
  return (
    <div
      style={{
        background: t.containerColor,
        borderRadius: t.radiusCardMd,
        boxShadow: t.shadowResting,
        padding: t.space.lg,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
      }}
    >
      <Text weight="bold" size="large">Course publishing</Text>
      <SimpleSelect
        renderLabel={<Text weight="bold">Publish</Text>}
        value={opening.mode}
        onChange={(_e, { value }) => setOpening({ ...opening, mode: value as Opening['mode'] })}
      >
        <SimpleSelect.Option id="publish-open" value="open">Automatically, on a set day</SimpleSelect.Option>
        <SimpleSelect.Option id="publish-self" value="self">Manually</SimpleSelect.Option>
      </SimpleSelect>
      <Text as="div" color="secondary">
        {auto ? 'Hidden from students until the day and time below.' : 'The course stays hidden until you publish it.'}
      </Text>
      {auto && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.md, alignItems: 'flex-start' }}>
          <div style={{ width: '14rem', maxWidth: '100%' }}>
            <DateInput
              screenReaderLabels={{
                calendarIcon: 'Open calendar',
                prevMonthButton: 'Previous month',
                nextMonthButton: 'Next month',
                datePickerDialog: 'Date picker',
                selectedLabel: 'Selected',
              }}
              width="100%"
              placeholder="Select a date"
              invalidDateErrorMessage="Enter a valid date"
              renderLabel={<Text weight="bold">Publish date</Text>}
              value={opening.date}
              onChange={(_e, v) => setOpening({ ...opening, date: v })}
              messages={Number.isNaN(new Date(opening.date).getTime()) ? [{ type: 'newError', text: 'Enter a valid date' }] : []}
            />
          </div>
          <div style={{ width: '14rem', maxWidth: '100%' }}>
            <SimpleSelect
              renderLabel={<Text weight="bold">Publish time</Text>}
              value={opening.time}
              onChange={(_e, { value }) => setOpening({ ...opening, time: String(value) })}
            >
              {TIMES.map((tm) => (
                <SimpleSelect.Option key={tm.value} id={`publish-${tm.value}`} value={tm.value}>{tm.label}</SimpleSelect.Option>
              ))}
            </SimpleSelect>
          </div>
        </div>
      )}
      {/* Only an automatic publish can be held, so a manual publish has no checkbox. */}
      {auto && (
        <Checkbox
          label="Do not publish automatically if a required check still fails on that day"
          checked={opening.hold}
          onChange={() => setOpening({ ...opening, hold: !opening.hold })}
        />
      )}
    </div>
  )
}
