import {
  Button,
  IconButton,
  IconEditLine,
  IconMoreLine,
  IconNoteLine,
  IconPublishSolid,
  IconStudentViewLine,
  IconUserAssignLine,
} from '@instructure/ui/v11_7'
import StatusPill from './StatusPill'

// Buttons the educator sees on a page or assignment (Canvas today): Front Page tag, Published, Assign To,
// Edit and a menu. They are for show in this prototype. Only the Notebook button does something.

export function ItemButtons({ frontPage }: { frontPage?: boolean }) {
  return (
    <>
      {frontPage && <StatusPill size="md">Front Page</StatusPill>}
      <Button color="success" renderIcon={<IconPublishSolid />}>
        Published
      </Button>
      <Button renderIcon={<IconUserAssignLine />}>Assign To</Button>
      <Button renderIcon={<IconEditLine />}>Edit</Button>
      <IconButton screenReaderLabel="More options">
        <IconMoreLine />
      </IconButton>
    </>
  )
}

export function ViewAsStudent() {
  return <Button renderIcon={<IconStudentViewLine />}>View as Student</Button>
}

// The Notebook icon button. Light and Dark put it in the header next to the other icons, Legacy puts it in the top bar.
export function NotebookButton({ onClick, pressed }: { onClick: () => void; pressed: boolean }) {
  return (
    <IconButton screenReaderLabel="Notebook" aria-expanded={pressed} onClick={onClick}>
      <IconNoteLine />
    </IconButton>
  )
}
