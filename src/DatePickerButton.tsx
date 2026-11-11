import { useState } from 'react'
import { Button, CalendarInstUIIcon, DateTimeInput, IconButton, Popover, ScreenReaderContent, Text } from '@instructure/ui/v11_7'

// A secondary icon button that opens a small window with InstUI DateTimeInput: a date (with its calendar) and a time.
// Due times are in UTC, so the field works in UTC too. `value` is an ISO date (YYYY-MM-DD) and `time` is HH:MM in UTC.
// The choice is only handed back when the educator chooses Apply.

export default function DatePickerButton({
  value, time, label, onPick, onReset, canReset = false,
}: {
  value: string
  time: string
  // Screen reader label of the button, like "Change the date of Quiz 1".
  label: string
  onPick: (iso: string, time: string) => void
  // Takes the date and time back to what they were before they were changed by hand.
  onReset?: () => void
  canReset?: boolean
}) {
  const [open, setOpen] = useState(false)
  // The value being edited, as a UTC date-time. Not valid while the date or the time is incomplete.
  const startValue = `${value}T${time}:00.000Z`
  const [draft, setDraft] = useState<string | undefined>(startValue)
  const close = () => setOpen(false)
  return (
    <Popover
      on="click"
      isShowingContent={open}
      onShowContent={() => {
        setDraft(startValue)
        setOpen(true)
      }}
      onHideContent={close}
      shouldContainFocus
      shouldReturnFocus
      placement="bottom end"
      screenReaderLabel="Date and time picker"
      renderTrigger={
        <IconButton size="small" screenReaderLabel={label}>
          <CalendarInstUIIcon />
        </IconButton>
      }
    >
      <div style={{ padding: '1rem', width: '18rem', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <DateTimeInput
          description={<ScreenReaderContent>Date and time</ScreenReaderContent>}
          dateRenderLabel={<Text weight="bold">Date</Text>}
          timeRenderLabel={<Text weight="bold">Time (UTC)</Text>}
          invalidDateTimeMessage="Enter a valid date and time"
          screenReaderLabels={{
            calendarIcon: 'Open calendar',
            prevMonthButton: 'Previous month',
            nextMonthButton: 'Next month',
            datePickerDialog: 'Date picker',
            selectedLabel: 'Selected',
          }}
          layout="stacked"
          timezone="UTC"
          allowNonStepInput
          value={draft}
          onChange={(_e, iso) => setDraft(iso)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {onReset && (
            <span style={{ marginInlineEnd: 'auto' }}>
              <Button size="small" interaction={canReset ? 'enabled' : 'disabled'} onClick={() => { onReset(); close() }}>Reset</Button>
            </span>
          )}
          <Button size="small" onClick={close}>Cancel</Button>
          <Button
            size="small"
            color="primary"
            interaction={draft ? 'enabled' : 'disabled'}
            onClick={() => {
              if (!draft) return
              const at = new Date(draft)
              const pad = (n: number) => String(n).padStart(2, '0')
              onPick(`${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`, `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`)
              close()
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Popover>
  )
}
