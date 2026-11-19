import { Checkbox, DateInput, SimpleSelect, Text } from '@instructure/ui/v11_7'
import RadioWithContent from './RadioWithContent'
import type { Opening } from './reviewCopyData'
import { useAppThemeKey, useSurfaceTokens } from './appTheme'

// When students see the course: publish on a day and time, or publish by hand. It is the first card of the review and copy
// step, above the course preview. The way is chosen first, and the day and time show under it when publishing is scheduled.

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
  // Legacy is flat: the publishing options sit on the page, not in a card.
  const card = useAppThemeKey() !== 'legacy'
  return (
    <div
      style={{
        ...(card ? { background: t.containerColor, borderRadius: t.radiusCardMd, boxShadow: t.shadowResting, padding: t.space.lg } : {}),
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: t.space.md,
        flex: 1,
      }}
    >
      <Text weight="bold" size="large">Course publishing</Text>
      <RadioWithContent
        name="publish-mode"
        legend="Publishing method"
        value={opening.mode}
        onChange={(value) => setOpening({ ...opening, mode: value as Opening['mode'] })}
        choices={[
          {
            value: 'self',
            label: 'Publish manually',
            content: <Text as="div" color="secondary">The course stays unpublished and hidden from students until you publish it.</Text>,
          },
          {
            value: 'open',
            label: 'Schedule publishing',
            content: (
              <>
                <Text as="div" color="secondary">The course is published automatically at the date and time you set. Until then it is not visible to students.</Text>
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
                {/* Only a scheduled publish can be held, so a manual publish has no checkbox. */}
                <Checkbox
                  label="Hold publishing if a required readiness check still fails at the scheduled time"
                  checked={opening.hold}
                  onChange={() => setOpening({ ...opening, hold: !opening.hold })}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  )
}
