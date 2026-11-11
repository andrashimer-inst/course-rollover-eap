import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowUpInstUIIcon,
  Button,
  Checkbox,
  CheckboxGroup,
  ChevronRightInstUIIcon,
  CircleCheckBigInstUIIcon,
  CopyInstUIIcon,
  Heading,
  HistoryInstUIIcon,
  IconButton,
  IgniteaiLogoInstUIIcon,
  PlusInstUIIcon,
  ScreenReaderContent,
  SimpleSelect,
  SquarePenInstUIIcon,
  Tag,
  Text,
  TextArea,
  ThumbsDownInstUIIcon,
  ThumbsUpInstUIIcon,
  XInstUIIcon,
} from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// Figma "UtilityPanel/Desktop": the user-opened panels of the Light and Dark wrapper. Each one is a
// 396px card inside a 420px column that sits beside the content (12px margin). The wrapper owns
// the column, the landmark and the focus; these are the cards.

type PanelProps = { onClose: () => void }

function useCardStyle(): CSSProperties {
  const t = useSurfaceTokens()
  return {
    height: '100%',
    boxSizing: 'border-box',
    overflowY: 'auto',
    background: t.containerColor,
    borderRadius: t.radiusCardMd,
    boxShadow: t.shadowResting,
  }
}

// Title, short description and a close button. The panel's heading gets the label.
function PanelHeader({ title, description, onClose }: { title: string; description: string } & PanelProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Heading level="h2" variant="titleCardLarge">
          {title}
        </Heading>
        <Text as="div" variant="content" color="secondary">{description}</Text>
      </div>
      <IconButton
        screenReaderLabel={`Close ${title.toLowerCase()} panel`}
        size="large"
        withBackground={false}
        withBorder={false}
        onClick={onClose}
      >
        <XInstUIIcon />
      </IconButton>
    </div>
  )
}

// --- Filters -------------------------------------------------------------------------------------

// Sample filter controls. A page passes its own through `filterContent`.
export function SampleFilters() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <CheckboxGroup name="category" description="Category" size="small" defaultValue={[]}>
        <Checkbox label="Science and Technology" value="sci" />
        <Checkbox label="Arts and Humanities" value="arts" />
        <Checkbox label="Business and Management" value="biz" />
        <Checkbox label="Health and Medicine" value="health" />
      </CheckboxGroup>
      <CheckboxGroup name="subject" description="Subject" size="small" defaultValue={[]}>
        <Checkbox label="Natural Sciences and Tech Innovations" value="nat" />
        <Checkbox label="Creative Arts and Cultural Studies" value="creative" />
        <Checkbox label="Entrepreneurship and Corporate Strategy" value="entre" />
        <Checkbox label="Wellness and Medical Sciences" value="wellness" />
      </CheckboxGroup>
    </div>
  )
}

export function FiltersPanel({ onClose, children }: PanelProps & { children?: ReactNode }) {
  const t = useSurfaceTokens()
  return (
    <div style={{ ...useCardStyle(), padding: t.paddingCardMd }}>
      <div style={{ height: '100%', boxSizing: 'border-box', padding: t.space.md, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <PanelHeader title="Filters" description="Narrow down what the page shows" onClose={onClose} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children ?? <SampleFilters />}</div>
        <Button color="primary" size="large" display="block" onClick={onClose}>
          Apply filters
        </Button>
      </div>
    </div>
  )
}

// --- Notifications -------------------------------------------------------------------------------

const SAMPLE_NOTIFICATIONS = [
  { title: 'Grade posted', text: 'Your quiz 3 score in CS101 is ready to view.', when: '10 minutes ago' },
  { title: 'Assignment due tomorrow', text: 'Lab report 2 for BIO110 is due at 11:59 PM.', when: '1 hour ago' },
  { title: 'New announcement', text: 'The study session for Calculus moved to room 204.', when: 'Yesterday' },
  { title: 'Discussion reply', text: 'A classmate replied to your post in the HIST101 forum.', when: '2 days ago' },
  { title: 'Course published', text: 'ENG1: College Writing is now open for enrollment.', when: '3 days ago' },
]

export function NotificationsPanel({ onClose, children }: PanelProps & { children?: ReactNode }) {
  const t = useSurfaceTokens()
  return (
    <div style={{ ...useCardStyle(), padding: t.paddingCardMd }}>
      <div style={{ boxSizing: 'border-box', padding: t.space.md, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <PanelHeader title="Notifications" description="Recent updates from your courses" onClose={onClose} />
        {children ?? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
            {SAMPLE_NOTIFICATIONS.map((n) => (
              <div
                key={n.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: t.space.xs,
                  padding: t.space.lg,
                  border: `${t.borderWidth} solid ${t.borderColor}`,
                  borderRadius: t.radiusMd,
                }}
              >
                <Text variant="contentImportant">{n.title}</Text>
                <Text variant="contentSmall">{n.text}</Text>
                <Text variant="legend" color="secondary">
                  {n.when}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- A panel the page fills itself ----------------------------------------------------------------

export function CustomPanel({ title, description, onClose, children }: PanelProps & { title: string; description: string; children: ReactNode }) {
  const t = useSurfaceTokens()
  return (
    <div style={{ ...useCardStyle(), padding: t.paddingCardMd }}>
      <div style={{ boxSizing: 'border-box', padding: t.space.md, display: 'flex', flexDirection: 'column', gap: t.space.lg }}>
        <PanelHeader title={title} description={description} onClose={onClose} />
        {children}
      </div>
    </div>
  )
}

// --- AI agent ------------------------------------------------------------------------------------

export function AiAgentPanel({ onClose }: PanelProps) {
  const t = useSurfaceTokens()
  return (
    <div style={{ ...useCardStyle(), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Windowed header: the IgniteAI gradient, a title and three small actions */}
      <div
        style={{
          height: '3.75rem',
          flexShrink: 0,
          boxSizing: 'border-box',
          padding: `0 ${t.space.lg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: t.onColor,
          background: `linear-gradient(125deg, ${t.aiTopColor} 34%, ${t.aiBottomColor} 134%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm }}>
          <IgniteaiLogoInstUIIcon />
          <Heading level="h2" variant="titleCardRegular" color="primary-inverse">
            IgniteAI Agent
          </Heading>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm }}>
          <IconButton screenReaderLabel="New chat" size="small" color="primary-inverse" withBackground={false}>
            <SquarePenInstUIIcon />
          </IconButton>
          <IconButton screenReaderLabel="Chat history" size="small" color="primary-inverse" withBackground={false}>
            <HistoryInstUIIcon />
          </IconButton>
          <IconButton
            screenReaderLabel="Close AI assistant panel"
            size="small"
            color="primary-inverse"
            withBackground={false}
            withBorder={false}
            onClick={onClose}
          >
            <XInstUIIcon />
          </IconButton>
        </div>
      </div>

      {/* Conversation */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: t.space.xl,
          display: 'flex',
          flexDirection: 'column',
          gap: t.space.xl,
        }}
      >
        <div
          style={{
            alignSelf: 'flex-end',
            padding: `${t.space.md} ${t.space.lg}`,
            border: `${t.borderWidth} solid ${t.borderColor}`,
            borderRadius: t.radiusCardSm,
            boxShadow: t.shadowResting,
          }}
        >
          <Text>Summarize this week's announcements</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.space.sm, color: t.successTextColor }}>
            <CircleCheckBigInstUIIcon />
            <Text variant="contentImportant" color="success">
              Agent thought for 27 seconds
            </Text>
            <ChevronRightInstUIIcon size="md" />
          </div>
          <Text as="div" variant="content">
            Three announcements were posted this week. The CS101 study session moved to room 204, the BIO110 lab
            report is due Friday, and the Calculus midterm review opens on Monday.
          </Text>
          <div style={{ display: 'flex', gap: t.space.sm }}>
            <IconButton screenReaderLabel="Copy response" size="small">
              <CopyInstUIIcon />
            </IconButton>
            <IconButton screenReaderLabel="Good response" size="small">
              <ThumbsUpInstUIIcon />
            </IconButton>
            <IconButton screenReaderLabel="Poor response" size="small">
              <ThumbsDownInstUIIcon />
            </IconButton>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.space.sm }}>
          <Button display="block">Suggest a study plan</Button>
          <Button display="block">List upcoming due dates</Button>
          <Button display="block">Draft a reply to my instructor</Button>
        </div>
        <Text variant="contentSmall" color="secondary">
          AI can make mistakes. Consider checking important information.
        </Text>
      </div>

      {/* Prompt box */}
      <div style={{ flexShrink: 0, padding: `${t.space.md} ${t.space.lg} ${t.space.lg}` }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: t.space.md,
            padding: t.space.lg,
            border: `${t.borderWidth} solid ${t.strokeBase}`,
            borderRadius: t.radiusCardSm,
          }}
        >
          <SimpleSelect
            size="small"
            width="9rem"
            defaultValue="bio"
            renderLabel={<ScreenReaderContent>Course context</ScreenReaderContent>}
          >
            <SimpleSelect.Option id="bio" value="bio">
              Biology 101
            </SimpleSelect.Option>
            <SimpleSelect.Option id="cs" value="cs">
              CS101
            </SimpleSelect.Option>
          </SimpleSelect>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.space.sm }}>
            {['Syllabus.pdf', 'Notes week 3', 'Lab report'].map((name) => (
              <Tag key={name} size="small" text={name} dismissible onClick={() => {}} />
            ))}
          </div>
          <TextArea label="Enter a prompt" placeholder="Help me..." height="3.5rem" resize="none" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: t.space.sm }}>
              <IconButton screenReaderLabel="Add attachment" size="small">
                <PlusInstUIIcon />
              </IconButton>
              <IconButton screenReaderLabel="AI tools" size="small" color="ai-secondary">
                <IgniteaiLogoInstUIIcon />
              </IconButton>
            </div>
            <IconButton screenReaderLabel="Send prompt" size="small" color="primary">
              <ArrowUpInstUIIcon />
            </IconButton>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: t.space.sm }}>
          <Text variant="legend" color="secondary">
            AI can make mistakes. Consider checking important information.
          </Text>
        </div>
      </div>
    </div>
  )
}
