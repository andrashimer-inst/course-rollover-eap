import { useState } from 'react'
import { Select, Text } from '@instructure/ui/v11_7'

// A field you can type in. The list narrows to the options that match what is typed (InstUI Select, with autocomplete).
export default function AutoSelect({
  label, assistiveText, noMatch, options, value, onChange,
}: {
  label: string
  assistiveText: string
  noMatch: string
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  const current = options.find((o) => o.id === value)!.label
  const [text, setText] = useState(current)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState(false)
  const [highlight, setHighlight] = useState<string | null>(null)
  const shown = typed ? options.filter((o) => o.label.toLowerCase().includes(text.trim().toLowerCase())) : options
  return (
    <Select
      renderLabel={<Text weight="bold">{label}</Text>}
      assistiveText={assistiveText}
      placeholder={options[0].label}
      inputValue={text}
      isShowingOptions={open}
      onInputChange={(e) => {
        setText(e.target.value)
        setTyped(true)
        setOpen(true)
      }}
      onRequestShowOptions={() => setOpen(true)}
      onRequestHideOptions={() => {
        // Closing without a choice puts the chosen name back in the field.
        setOpen(false)
        setTyped(false)
        setText(current)
      }}
      onRequestHighlightOption={(_e, { id }) => setHighlight(id ?? null)}
      onRequestSelectOption={(_e, { id }) => {
        if (!id) return
        setText(options.find((o) => o.id === id)!.label)
        setTyped(false)
        setOpen(false)
        onChange(String(id))
      }}
    >
      {shown.length > 0 ? (
        shown.map((o) => (
          <Select.Option key={o.id} id={o.id} isHighlighted={highlight === o.id} isSelected={value === o.id}>
            {o.label}
          </Select.Option>
        ))
      ) : (
        <Select.Option id={`no-${label}`} isDisabled>{noMatch}</Select.Option>
      )}
    </Select>
  )
}
