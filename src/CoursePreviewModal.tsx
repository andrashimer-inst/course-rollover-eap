import { useState } from 'react'
import type { ReactNode } from 'react'
import { CloseButton, Heading, IconArrowOpenStartSolid, IconButton, Modal, Tabs } from '@instructure/ui/v11_7'
import { CoursePreview, ItemPreviewBody, ObjectsPreview } from './ContentStep'
import type { PreviewItem } from './ContentStep'
import { withPulledIn } from './contentHelpers'
import type { Picked, Scope } from './contentHelpers'
import { useSurfaceTokens } from './appTheme'

// The course as it will look after the copy, in a window: the modules on one tab and the learning objects on the other.
// Pages, assignments, quizzes and files open inside the same window, view only, with a back arrow. Step 3 and step 4 both use it.
// `noteFor` puts a small pill on each item, like what was chosen for it in the review or how its date checks out.

export type PreviewSource = {
  moduleIds: string[]
  // A merge keeps the modules from earlier copies. Content added by hand always stays.
  keepCurrent: boolean
  hidden?: Set<string>
  scope: Scope
  picked: Picked
}

export default function CoursePreviewModal({
  open, onClose, source, noteFor,
}: {
  open: boolean
  onClose: () => void
  source: PreviewSource
  noteFor: (itemId: string) => ReactNode
}) {
  const t = useSurfaceTokens()
  const [tab, setTab] = useState(0)
  const [item, setItem] = useState<PreviewItem | null>(null)
  const close = () => {
    onClose()
    setItem(null)
  }
  return (
    <Modal open={open} onDismiss={close} size="large" label={item ? `Preview of ${item.title}` : 'Course preview'}>
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={close} screenReaderLabel="Close" />
        <div style={{ display: 'flex', alignItems: 'center', gap: t.space.md }}>
          {/* Back to the course preview, on the tab that was open. */}
          {item && (
            <IconButton screenReaderLabel="Back to the course preview" withBackground={false} withBorder={false} onClick={() => setItem(null)}>
              <IconArrowOpenStartSolid />
            </IconButton>
          )}
          <Heading variant="titleSection" level="h2">{item ? item.title : 'Course preview'}</Heading>
        </div>
      </Modal.Header>
      <Modal.Body>
        {item ? (
          <ItemPreviewBody item={item} />
        ) : (
          <Tabs onRequestTabChange={(_e, { index }) => setTab(index)}>
            <Tabs.Panel id="preview-modules" renderTitle="Modules" isSelected={tab === 0} padding="general.spaceMd 0 0 0">
              <CoursePreview bare moduleIds={source.moduleIds} keepCurrent={source.keepCurrent} highlightNew hidden={source.hidden} noteFor={noteFor} onOpenItem={setItem} />
            </Tabs.Panel>
            <Tabs.Panel id="preview-objects" renderTitle="Learning objects" isSelected={tab === 1} padding="general.spaceMd 0 0 0">
              <ObjectsPreview bare scope={source.scope} picked={withPulledIn(source.picked)} keepCurrent={source.keepCurrent} noteFor={noteFor} onOpenItem={setItem} />
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  )
}
