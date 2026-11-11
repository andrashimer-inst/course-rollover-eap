import { Button, IconArrowOpenEndSolid, IconArrowOpenStartSolid, IconButton, ScreenReaderContent, Text } from '@instructure/ui/v11_7'
import { useSurfaceTokens } from './appTheme'

// Previous and next arrows with the page numbers between them. The arrows are always there. Nothing shows when there is one page.
export default function Pager({ label, page, pageCount, onPage }: { label: string; page: number; pageCount: number; onPage: (n: number) => void }) {
  const t = useSurfaceTokens()
  if (pageCount <= 1) return null
  const current = Math.min(page, pageCount)
  const numbers: (number | 'gap')[] = []
  for (let n = 1; n <= pageCount; n++) {
    if (n === 1 || n === pageCount || Math.abs(n - current) <= 1 || pageCount <= 7) numbers.push(n)
    else if (numbers[numbers.length - 1] !== 'gap') numbers.push('gap')
  }
  return (
    <nav aria-label={label} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: t.space.sm }}>
      <IconButton screenReaderLabel="Previous page" size="small" interaction={current > 1 ? 'enabled' : 'disabled'} onClick={() => onPage(current - 1)}>
        <IconArrowOpenStartSolid />
      </IconButton>
      {numbers.map((n, i) =>
        n === 'gap' ? (
          <Text key={`gap-${i}`} color="secondary">…</Text>
        ) : (
          <Button key={n} size="small" color={n === current ? 'primary' : 'secondary'} aria-current={n === current ? 'page' : undefined} onClick={() => onPage(n)}>
            <ScreenReaderContent>Page </ScreenReaderContent>
            {n}
          </Button>
        ),
      )}
      <IconButton screenReaderLabel="Next page" size="small" interaction={current < pageCount ? 'enabled' : 'disabled'} onClick={() => onPage(current + 1)}>
        <IconArrowOpenEndSolid />
      </IconButton>
    </nav>
  )
}
