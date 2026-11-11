# Wrapper (beta): layout and navigation for Light and Dark

Summarized from the Figma page "→ Wrapper (beta) | Not yet available in code" (node `22967:72736`, file `5WFqF3HVlNdfcJooCaiFoh`), read in full on 2026-10-15. Open it at
`https://www.figma.com/design/5WFqF3HVlNdfcJooCaiFoh/InstUI-Component-Library?node-id=22967-72736`.

This describes the **Light and Dark** wrapper. It is built in `src/ModernWrapper.tsx`, `src/GlobalNav.tsx` (`ModernNav`), `src/ContentTabList.tsx` and `src/UtilityPanels.tsx`.
**Legacy is the Canvas shell as it is today** (`src/LegacyWrapper.tsx`, `src/LegacyNav.tsx`, `src/LegacyCourseMenu.tsx`, see the Legacy section at the end) and ignores the Light and Dark options below.
The Figma page is too large for one connector call: read it one section at a time (the section node ids are listed here).

## Sections of the Figma page

| Section | Node | What it shows |
|---|---|---|
| Wrapper Example Layouts & Theming | `23002:87182` | Variants (`expanded` true or false) and the four theme modes: light, dark, legacyCanvas, legacyCanvasHighContrast. Same layout in every mode, only tokens change. |
| Wrapper components | `25285:7291` | The Desktop wrapper component (fullWidth true or false x utilityPanel none, aIAgent, notifications, filters), the Mobile wrapper, the three UtilityPanel cards, ContentTabList (open, minimized), TrailingContentArea, the AI agent input. |
| Test Area | `25303:5316` | Designers' review notes (for example "show only the primary action, put the rest behind a context button"). Not rules. |
| Wrapper guidelines | `26976:134014` | Usage, best practices, panel combinations, required and optional areas, accessibility. |
| Layout examples | `27602:62324` | 5 rows at 1920, 1440 and 1024 px: reading layout, dashboard (fullWidth), max chrome (filters panel), left panel (ContentTabList), right panel (AI agent plus trailing area). |
| Dismiss & collapse behavior | `27623:36481` | Global Nav expanded to collapsed, ContentTabList open to minimized, Utility Panel open to dismissed (and switched), Trailing Content Area (no dismiss). |
| Anatomy | `29855:46428` | Six numbered parts: GlobalNav, HeaderArea, ContentTabList, ContentArea, TrailingContentArea, Utility Panel, each with use and don't-use lists. |
| Desktop to Mobile Layout | `30074:320972` | How each part changes on mobile (not built here, the template is desktop). |

## Rules

- One wrapper per page, never nested. It owns the outermost layout. Don't use it for a Modal, Tray or Drawer, for a region of a page, or for a mobile layout.
- **Required:** Global Nav (never hidden), header area (page title always; breadcrumb, description, actions and metadata are configurable), content area. The utility panel is always available but closed until the user opens it.
- **Optional:** ContentTabList (in-page anchor links only, not a replacement for the Global Nav or Tabs), TrailingContentArea (persistent contextual content, cannot be minimized; if it should be dismissible use a Drawer or a UtilityPanel).
- `fullWidth` false is a readable column up to 1100px (forms, reading). true fills the space between the panels (dashboards, tables).
- Container padding is 32px. The areas inside the content row are 24px apart. The content area is at least 360px wide.
- Utility panels: AI assistant and Notifications are global, Filters is only for pages with filterable content. One open at a time, opening another replaces it. The user opens them from the header buttons or the filter button.
- When the viewport is narrow an open panel overflows: it covers the trailing area first, then the content. Users can minimize the ContentTabList or collapse the Global Nav to get width back.
- Accessibility: main landmark with a skip link; ContentTabList is a navigation with the label "Page navigation"; the trailing area is a complementary landmark with a label; each panel has its own label ("AI assistant", "Notifications", "Filters"); focus moves into a panel when it opens and back to its trigger when it closes.

## Measurements (Figma, 1440px frame)

- **Global Nav** expanded: 256px wide in the layout = 12px margin + 232px card (200px main navigation + 32px sub navigation strip). Collapsed: 104px = 6px margin + 92px card (60px main navigation + the strip). Card radius 12px (8px collapsed), 1px border, elevation 1 shadow.
  - Expanded main navigation: 12px padding, 8px gap. Institution logo 176x56 (40px square avatar, name semibold 16px). Account 176x48, bordered (32px avatar, name 14px, role 12px). Items 176x44 (36px icon container, 24px icon, 16px label, 8px side padding, 8px gap, 4px between items). Collapse button 176x40. Product logo area 176x56 with a line above.
  - Collapsed main navigation: institution logo 60x60 with a line under it, account and items 44x44 (8px side padding), the Inbox badge sits on the icon corner, expand button 40x40, product logo area 60x60 with a line above (mark only).
  - Item states from the theme: the page you are on is filled (navy in Light, pale in Dark), an item whose sub navigation is open is tinted, hover is a light tint. Icons are the new (lucide) set: dashboard, book-text, calendar-days, inbox, clock, circle-question-mark, plus.
- **Container** starts right of the nav. The main container is centered, 1100px at most, 32px padding around.
- **Header area** (24px between rows): a 40px row (breadcrumb centered left, three 40px icon buttons right, 12px apart), then 8px, the page title (36px, 45px tall), 4px, the description (20px, 30px tall). Then the optional custom slot (8px under the title block), the actions row (primary and secondary buttons, 40px, 12px apart), the optional page tabs, the optional filtering row (search input 300px wide on the left; on the right a 200px "Order by" select, 12px, a 40px filter button).
- **Header icon buttons**: AI agent (the AI gradient, IgniteAI logo), notifications (bell), expand (the content width toggle; the Figma variant `expanded` is "full width" versus 1100px). The first two open a utility panel.
- **Content row** (24px gaps): ContentTabList (300px card), content area (flexible, 360px minimum), TrailingContentArea (300px). The row fills the page down to the 32px bottom padding, and the open ContentTabList and the trailing area are always as tall as the row, not as tall as their content. A minimized ContentTabList stays a 56px card.
- **ContentTabList**: card with 8px padding (radius 12px, elevation 1), another 8px inside. Title 20px bold with a collapse button, 12px, then 48px rows (12px padding, 16px text); the current row is filled with a check. Minimized: a 56px card with a menu button.
- **Utility panel**: a 420px column that takes width from the container. The card has a 12px margin and is 396px wide, full height, radius 16px, elevation 1.
  - Filters and Notifications: 12px card padding plus 12px content padding. Header: title (24px bold), description, close button. Filters: checkbox groups 24px apart and a large "Apply filters" button at the bottom. Notifications: bordered items (16px padding, 8px radius, 12px apart).
  - AI agent: a 60px gradient header ("IgniteAI Agent", new chat, history, close), the conversation, suggested prompts, and a prompt box at the bottom (course select, attachment tags, text area, plus, AI and send buttons).
- Colors, radius, shadows and spacing come from theme tokens (`useSurfaceTokens()`, which also carries the Global Nav tokens from the theme's `SideNavBarNew`). The Figma Dark mode uses a near black page, a slate nav and a light primary button.

## What the code does

- `DesktopWrapper` picks the layout from the theme: Legacy gets `LegacyWrapper`, Light and Dark get `ModernWrapper`.
- New props (Light and Dark only): `description`, `headerSlot`, `actions`, `tabs`, `showFilters`, `contentTabList` ({ title, items, current, onSelect }), plus the existing `trailingContent`, `trailingLabel`, `filterContent`, `fullWidth`, `course`, `activeNav`, `breadcrumb`.
- `App.tsx` has a Layout box under the theme switcher to try the filter row, content tab list, trailing area and full width. The box moves left of an open panel.
- Not built: the Mobile wrapper, notifications or AI content that comes from real data, and the Canvas wordmark (the package only has the mark, so the nav shows the mark and the word "Canvas").

## Legacy (Canvas today)

Not from the Figma page. Built from three screenshots of the real Canvas flow: a dashboard-style page, the Courses tray open, a course page. Sample text is generic on purpose.

- **Global nav** (`LegacyNav`): InstUI `SideNavBar` in the Legacy theme. 84px wide (54px minimized), flush, full height, navy (`SideNavBar` token `backgroundColor`). Canvas logo, Account (avatar), Admin, Dashboard, Courses, Calendar, Inbox, History, Portfolio, Help (badge). The current page is a white tab with blue icon and label. Items are about 64px tall.
- **Courses tray**: InstUI `Tray`, `placement="start"`, 23rem wide, to the right of the bar, full height, shadow, no mask. Its content: a 22px bold title and a close button, a line, a link "All courses", a line, groups with a 16px bold title and course links (each with code and term below in small grey text), a short help text. It is mounted in a transformed box on the bar's right edge so it opens beside the bar (and follows it when minimized). Closes with Escape, a click outside, the close button or Courses again.
- **Top bar** (course pages, or when a breadcrumb is passed): padding 16px, a line under it inset 32px from both sides. Hamburger (blue, shows or hides the course menu), the breadcrumb, then `barActions` at the end.
- **Course menu**: a 13rem column, links about 38px apart, eye icon on unpublished items, current item dark and bold with a 2px bar at its start edge.
- **Title row**: `h1` (38px bold) with the page's `actions` at the end. Pages without a course menu draw a line under it.
- **Side column**: 248px, plain content on the page, 48px from the main column. A footer (Instructure mark plus name, policy links) closes the page.
- **Props that only Legacy reads:** `barActions`, `courseList`, `onNavigate`, `onOpenCourse`. `actions` and `trailingContent` work in both layouts but look different (Legacy: end of the title row and plain side column).
- **Not in Legacy:** AI agent and notification buttons, the three utility panels, the filter row, the content tab list, the description line.
