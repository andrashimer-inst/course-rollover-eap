import { useState } from 'react'
import {
  Button,
  Checkbox,
  CloseButton,
  Heading,
  IconAddressBookLine,
  IconAIInfoLine,
  IconAttachMediaLine,
  IconButton,
  IconPaperclipLine,
  IconSearchLine,
  Modal,
  RadioInput,
  SimpleSelect,
  Text,
  TextArea,
  TextInput,
} from '@instructure/ui/v11_7'
// What the message is about: a title and what is wrong or left to do. Review rows and to-do entries both fit.
export type HelpItem = { title: string; detail: string }
// The recipient, subject and text of a message that is not the one to the admin. `message` gets the list of items.
export type MessageDraft = { to: string; subject: string; message: (list: string) => string }

// One message to the admin about the whole review. It opens from the "Message admin" button above the table.
// It is the Canvas "Compose Message" window, without the course and the individual-message checkbox: the "To" field is
// open (the admin is filled in, and it can be changed), and the subject and message are filled in from the items that
// still need help. Nothing is sent anywhere: this is a prototype.

const LANGUAGES = ['Spanish', 'French', 'German', 'Portuguese', 'Hungarian', 'Arabic', 'Simplified Chinese']

export default function AdminHelpModal({
  open, items, onClose, onSend, draft,
}: {
  open: boolean
  // The items the message is about: the ones with a finding.
  items: HelpItem[]
  onClose: () => void
  onSend: () => void
  // Another message in the same window, like the to-do list sent to the educator. The message to the admin when not set.
  draft?: MessageDraft
}) {
  return (
    <Modal open={open} onDismiss={onClose} size="medium" label="Compose Message" shouldCloseOnDocumentClick={false}>
      {open && <Form items={items} onClose={onClose} onSend={onSend} draft={draft} />}
    </Modal>
  )
}

function Form({ items, onClose, onSend, draft }: { items: HelpItem[]; onClose: () => void; onSend: () => void; draft?: MessageDraft }) {
  const list = items
    .map((r) => `- ${r.title}: ${r.detail || 'Needs a look.'}`)
    .join('\n')
  const [to, setTo] = useState(draft?.to ?? 'Your admin')
  const [subject, setSubject] = useState(draft?.subject ?? 'Help with the course copy')
  const [message, setMessage] = useState(
    draft ? draft.message(list) : `Hi,\n\nI am copying content into my course and the review found problems I need help with.\n\n${list}\n\nCan you help me fix them before the term starts?\n\nThank you`,
  )
  const [translate, setTranslate] = useState(false)
  const [language, setLanguage] = useState('')
  const [placement, setPlacement] = useState('')
  return (
    <>
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={onClose} screenReaderLabel="Close" />
        <Heading variant="titleSection" level="h2">Compose Message</Heading>
      </Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextInput
                renderLabel={<Text weight="bold">To</Text>}
                isRequired
                placeholder="Insert or Select Names"
                renderBeforeInput={<IconSearchLine />}
                value={to}
                onChange={(_e, v) => setTo(v)}
              />
            </div>
            <IconButton screenReaderLabel="Open the address book" onClick={() => {}}>
              <IconAddressBookLine />
            </IconButton>
          </div>
          <TextInput renderLabel={<Text weight="bold">Subject</Text>} placeholder="Insert Subject" value={subject} onChange={(_e, v) => setSubject(v)} />
          <TextArea label={<Text weight="bold">Message</Text>} required height="14rem" value={message} onChange={(e) => setMessage(e.target.value)} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Checkbox
              variant="toggle"
              label="Include translated version of this message"
              checked={translate}
              onChange={() => setTranslate(!translate)}
            />
            <span style={{ display: 'inline-flex' }} role="img" aria-label="Uses AI"><IconAIInfoLine /></span>
          </div>

          {translate && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SimpleSelect
                    renderLabel={<Text weight="bold">Translate To</Text>}
                    placeholder="Select a language..."
                    value={language}
                    onChange={(_e, { value }) => setLanguage(String(value))}
                  >
                    {/* Until a language is chosen the field shows the hint, not the first language. */}
                    {!language && <SimpleSelect.Option id="lang-none" value="">Select a language...</SimpleSelect.Option>}
                    {LANGUAGES.map((l) => (
                      <SimpleSelect.Option key={l} id={`lang-${l}`} value={l}>{l}</SimpleSelect.Option>
                    ))}
                  </SimpleSelect>
                </div>
                <Button color="ai-primary" interaction={language ? 'enabled' : 'disabled'} onClick={() => {}}>
                  Translate
                </Button>
              </div>
              <div role="radiogroup" aria-labelledby="placement-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Text weight="bold" id="placement-label">Choose placement</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ flex: '0 0 auto' }}>
                    <RadioInput name="placement" value="second" label="Show translation second" checked={placement === 'second'} onChange={() => setPlacement('second')} />
                  </div>
                  <div style={{ flex: '0 0 auto' }}>
                    <RadioInput name="placement" value="first" label="Show translation first" checked={placement === 'first'} onChange={() => setPlacement('first')} />
                  </div>
                </div>
              </div>
              <Text color="secondary">This translation is generated by AI. Please note that the output may not always be accurate.</Text>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <IconButton screenReaderLabel="Attach a file" onClick={() => {}}>
              <IconPaperclipLine />
            </IconButton>
            <IconButton screenReaderLabel="Attach media" onClick={() => {}}>
              <IconAttachMediaLine />
            </IconButton>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              color="primary"
              interaction={to.trim() && message.trim() ? 'enabled' : 'disabled'}
              onClick={() => { onSend(); onClose() }}
            >
              Send
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </>
  )
}
