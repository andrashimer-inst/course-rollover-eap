# InstUI component reference

Summarized from the Figma file "InstUI Component Library" (key `5WFqF3HVlNdfcJooCaiFoh`), read on 2026-10-14. Node ids are in brackets; open one with
`https://www.figma.com/design/5WFqF3HVlNdfcJooCaiFoh/InstUI-Component-Library?node-id=<id with - instead of :>`.

These are paraphrased summaries, not the full guidelines. Check the Figma page when a detail matters.

Every component page shows four themes. Some pages name them light, dark, legacyCanvas and legacyCanvasHighContrast; others name them rebrandLight, rebrandDark, canvas and canvasHighContrast. In this repo, Light, Dark and Legacy map to `light`, `dark` and `canvas`.

## Choosing between similar components

- System status → Alert. Promotion or announcement → Banner. Count or dot on a control → Badge. Static status label → Pill. Removable value → Tag.
- One choice, 2 to 7 options → Radio Group. Many choices → Checkbox Group. Instant on/off → Switch. On/off saved with a form → Checkbox. Long or searchable list → Select. Hierarchy in a popover → Drilldown.
- Known progress, full width → Progress Bar. Compact or indeterminate → Progress Circle. Loading one region → Spinner. Static number → Metric.
- One date → Date Input. Date and time → Date-Time Input. Dates in context on the page → Calendar.
- Short help on hover or focus → Tooltip. Interactive or long content → Popover. Hidden optional content → Toggle Details. Same-level sections → Tabs.

## Components

### AI components (14220:3119)
- AI Information: a popover. Nutrition Facts: a modal of AI-related information. Data Permission Levels: a modal listing the AI data permission levels with short descriptions (base and current types).
- Both modals open from links in the AI Information popover.

### Alert (13704:5434)
- Variants: color = info, success, warning, error. type = floating, inline. width = auto, manual. dismissible. showButtonGroup.
- Use when: system events, status changes or validation results for a page or region, that matter but don't block, and stay until dismissed or resolved.
- Don't use: brief success confirmations (keep them next to the control); when the user must respond first (Modal); single-field feedback (the field's own message); promotions (Banner).
- Best practices: page-level Alert at the top of the content, near the H1. Lead with what happened, then what to do. Every warning and error gets a next step. One Alert per region. Turn off dismissible only when the issue must be fixed first. auto width in flexible containers, manual for fixed columns. floating for page-level, inline inside cards and panels. Buttons: one primary and at most one secondary, never for navigation.
- Accessibility: write full sentences, lead with the most important word, make the message stand on its own. Color never carries meaning alone.

### Avatar (0:1)
- Partly read (large page). When the avatar stands alone with no visible name, wrap it with screen-reader text naming the person.

### Badge (5580:7136)
- Variants: type = dot, number. color = info, success, error, onColor.
- Use when: flagging unread, new or pending items on a control; presence or status without extra space.
- Don't use: when the message needs words (Alert, Pill or Tag); counts that routinely pass two digits (cap at "99+"); as the click target itself.
- Best practices: always attached to a host control, top-right. dot when existence matters, number when the count matters. Don't badge everything. Never two Badges on one host. onColor on brand or saturated surfaces.
- Accessibility: fold the Badge into the host control's name ("Notifications, 3 unread"). Don't rely on color alone.

### Banner (32177:2410)
- Variants: color = violet, sea. density = relaxed, compact.
- Use when: promotional content (feature, offer, event, announcement) the user didn't ask for but may care about. It shouldn't block, and stays until dismissed. System status belongs in Alert.
- Best practices: page-level Banner at the top of main content, near the H1. One per region. Don't overlap fixed headers. Relaxed where space is generous, compact in small or nested containers. Violet and sea are both defaults. Dismissible by default, and remember the dismissal for the session. Keep persistent banners rare; auto-expire time-bound ones. showCTA only for a clear next step: one primary and at most one secondary, no buttons that navigate away (link inline).
- Accessibility: images are decorative. The dismiss control needs keyboard access, visible focus and an accessible label.
- Note: the page's "don't use" text is copied from Alert.

### Breadcrumb (2205:107)
- Variants: levels = 2 to 6. size = small, medium, large. Current level: iconPlacement = before, after; showIcon.
- Use when: the page sits in a nested hierarchy and users may jump back to a parent that isn't obvious from the page.
- Don't use: for one parent level (Link or back action); flat siblings (Tabs); paging (Pagination); hierarchies deeper than 6 (truncate the middle or rethink).
- Best practices: below the global nav, above the page heading. Show every level from root to current. Every parent is a Link; the current level isn't interactive. Reuse the label the user clicked, keep labels short, truncate the middle if it wraps. small for dense surfaces and modal headers, medium default, large for landing pages; one size per surface. Current-level icon off by default.
- Accessibility: labels match the destination. Style the current level differently (weight or color). Don't rely on the separator to show hierarchy.

### Calendar (12371:6675)
- Variants: withYearPicker = true, false. Day: isSelected, isToday, isVisibleMonth, state = enabled, disabled. Header: base, year picker.
- Use when: dates in context help (weekday, nearby days, distance from today), the date choice lives on the page, or Date Input doesn't fit.
- Don't use: user already knows the date (Date Input); date plus time (Date-Time Input); showing events or availability; picking only a month or year (Select).
- Best practices: always pass currentDate. Open on the likely month (visibleMonth). Disable unpickable dates up front. Year picker for multi-year ranges with realistic bounds. At most one selected day, only for a real value. Exactly one today. The grid always shows 6 weeks; padding days are outside the month (isOutsideMonth in code), don't delete or restyle them.
- Accessibility: handles focus and keyboard itself. Label each day with its full date. Weekday labels 3 characters or fewer. Nav buttons "Previous month" and "Next month". Year picker needs a screenReaderLabel.

### Card (16597:632)
- Variants: variant = base, nested, withImage. size = sm, md, lg. The older "Card 🛑" is deprecated, don't use it.
- Use when: grouping related content (title, description, actions); list or grid layouts; summary tiles linking to details; varied slotted content.
- Don't use: for a single line or label (Text or Heading). Don't stack two base cards; use nested for an inner card.
- Best practices: consistent sizes in a layout. Key info (title or metric) at the top. Compose through the content slot. sm for dense dashboards and sidebars, md default, lg for hero or media-heavy. Respect each size's min and max widths. Nested goes inside a base Card; pick its size for its own content. Static, no hover or focus states.
- Accessibility: descriptive heading per card. Link text names the destination, not "Read more". Inner controls tabbable individually; don't make the whole card one click target. Focus order: heading, body, actions.

### Checkbox (5248:5114)
- Variants: state = base, hover, disabled, readonly. size = small, medium, large. validation, isChecked, isIndeterminate, isInvalid.
- Use when: zero, one or many options; one independent on/off option; agreeing to terms; multi-selecting table rows.
- Don't use: single choice (Radio); instant-effect settings (Switch); actions (Button); long or searchable lists (Select).
- Best practices: short, positive labels, no double negatives. Group related boxes in CheckboxGroup, stacked. isIndeterminate on a parent with some children checked, never with isChecked; define what clicking the parent does. small for dense forms and tables, medium default, large for touch-first; one size per group. Disabled when not available yet (explain why); readonly for a value the user can't change (name the source). Validation only for real errors, with a message.
- Accessibility: handles focus and keyboard itself. Clear label per box; groups need a description. Placeholder or nearby text isn't a label.

### Checkbox Group (12036:2934)
- Variants: layout = stacked, inline, columns. isDisabled, isReadOnly. size = small, medium, large. validation.
- Use when: picking any number from a related set that shares one description and one error.
- Don't use: mutually exclusive options (Radio Group); single yes/no (Checkbox); immediate-effect choices (Switch); unrelated options.
- Best practices: description is the question the options answer. Stack when more than 2 options; parallel labels. One size per group, matching neighbors. stacked default, columns to shorten long lists, inline for at most 2 short options. Disable when a prerequisite isn't met (explain). Prefer read-only when users still need the values. Validate the group with one message that names the fix.
- Accessibility: always a description, visually hidden if needed. Errors as group messages.

### Date Input (12371:2934)
- Variants: validation = none, error, success. state = base, hover, readonly, disabled. filled, isOpen. Also focus, showMessage, showCalendar.
- Use when: entering one specific date, especially when typing is faster, with no time part.
- Don't use: date plus time (DateTimeInput); ranges (two Date Inputs); display-only dates (Text); short preset lists (Select or buttons).
- Best practices: align with other inputs. placeholderText shows a typeable format and isn't a label. Useful defaults (today for start, empty for end). Disable invalid days up front. showMessage for format and constraint help. Disabled can't be focused, explain why; read-only stays focusable. Error with a message, success sparingly, none until validation runs. filled=false normally.
- Accessibility: visible label phrased as the question. Don't add a second label inside the calendar.

### Date-Time Input (18262:6438)
- Variants: layout = columns, stacked. validation = none, error, success. isDisabled. showGroupLabel.
- Use when: date and time form one value (appointment, event start, hour-precise deadline).
- Don't use: date only (DateInput); independent date and time fields; ranges (pair two).
- Best practices: columns by default, stacked in narrow spaces like a Tray. showGroupLabel when both parts are one decision. Default the date to today, leave time empty. State the timezone when it matters. Block invalid combinations at render time. Disabled applies to both fields.
- Accessibility: always labeled, phrased as the question. Say which part failed on error.

### Desktop Wrapper (26976:134014, 29855:46428, whole page 22967:72736)
- Built in `src/LegacyWrapper.tsx` (Legacy, the Canvas shell from screenshots, not Figma) and `src/ModernWrapper.tsx` (Light and Dark), chosen by `src/DesktopWrapper.tsx`. The full summary of the Figma page, with measurements, is in `docs/wrapper.md`. Rules are in CLAUDE.md.
- Variants: fullWidth (false is a readable column up to 1100px, true fills the space) x utilityPanel (none, aIAgent, notifications, filters). Optional: ContentTabList, TrailingContentArea, page tabs, filtering row.
- Use when: a full product page that needs the Global Nav, side panels and consistent container padding. Don't use: for a Modal, Tray, Drawer, a region of a page, or mobile (use the Mobile wrapper).
- Best practices: one wrapper per page, never nested. Keep the real page title. Design content to stay usable when an open utility panel overlaps the trailing area.

### Drilldown (15052:3131)
- Variants: placement = 12 positions (topCenter default; topStart or bottomEnd near screen edges). Arrow visibility; first page or sub-page.
- Use when: navigating a hierarchy in place (categories, contacts, folders); radio or checkbox selection in a navigable list; behind a trigger button (renders in a Popover).
- Don't use: short flat lists (Menu or Select); rich content (Modal); single-value picks (Select); a visible expandable tree. Children are only Option, Group and Separator.
- Best practices: direct labels, short descriptions. Unique Page ids linked with subPageId and rootPageId. Group with a title and Separator for related sets. Back option only goes back and stays enabled. Set width and maxHeight. shouldHideOnSelect=false for multi-select. Explain disabled options with a Tooltip or helper text.
- Accessibility: handles roles, keyboard and focus. Each Page needs a renderTitle. The trigger's name describes its purpose. Don't repeat the label in the description.

### File Drop (11608:654)
- Variants: state = base, hover, disabled, rejected, accepted
- Use when: the user must provide files from their computer; drag and drop is a shortcut alongside click-to-browse; you can limit file types and count; the upload sits inline in a form or page.
- Don't use: for short text (TextInput); alone when upload is the whole screen (pair with Modal); for camera capture; to list uploaded files (show those in a separate list or table).
- Best practices: renderLabel names the action plainly with an "or browse" hint. Set `accept` to supported types. Match `shouldAllowMultiple` to the back end and say so when only one file is allowed. Use onDropRejected to show an error via `messages`. List uploaded files outside FileDrop. Keep it at least about 6rem tall. Drag feedback works only in Chrome and Firefox, so always back it with a clear label. Clear stale errors after a successful retry. `interaction="disabled"` when uploads aren't possible yet (explain why); `readonly` for an unchangeable value.
- Accessibility: renderLabel is the input's accessible name. Pair icons with text. Use `messages` for errors and hints so screen readers announce them. Don't rely on color alone.

### Heading (9871:951)
- Variants: variant = titlePageDesktop, titlePageMobile, titleSection, titleCardSection, titleModule, titleCardLarge, titleCardRegular, titleCardMini, label. color = base, muted, baseOnColor, mutedOnColor, inverseColor. AI Heading aiVariant = ignite inline, ignite stacked, plus the same title sizes.
- Use when: page and card titles. Heading with Icon (renderIcon) for a leading icon. AI Heading (aiVariant) on AI surfaces with the gradient and sparkles icon.
- Don't use: for paragraphs or labels (use Text); for emphasis only; shrunk to truncate (wrap with a truncating utility); where a Card or Modal already has a title slot.
- Best practices: each variant maps to one place (page title, section, card hierarchy, Canvas module, small label). Use heading color tokens. Name the level (h1 to h6) at handoff; variant sets the style, level sets the structure. Colors: primary default, secondary de-emphasized, "on" colors on alert or brand surfaces, inverse on dark surfaces. Use a top or bottom border only to separate two regions, never both, and not inside Card or Modal.
- Accessibility: exactly one h1 per page; don't skip levels; match level to outline role, not size.
- Note: the AI Heading text mentions stacked, horizontal and iconOnly variants that don't match the component names.

### Icons (2106:6124)
- Lucide icon set (1,705 icons), plus 61 custom and 21 solid icons. size = xs, sm, md, lg, xl, 2xl. color = base, muted, success, error, warning, info, onColor, inverse, plus accent colors. AI icon colors = ignite, base, onColor.
- Don't use the "DO NOT USE" group (40 duplicate-meaning icons).
- Note: the InstUI package used here ships the older Instructure icon names (for example IconDashboardLine), not the Lucide names in Figma. Match by meaning.

### Logos (2280:6956)
- Instructure wordmark and mark; Canvas logo (red, navy, colored, onColor; horizontal, mark, vertical); brand logos for Instructure products and common services.
- No guideline text on the page.

### Metric (2380:947)
- Variants: textAlign = start, center, end
- No guideline text on the page.

### Pagination (12460:583)
- Variants: variant = compact, full, input. Parts: page item (selected or not), control (disabled or not), custom input, back and forward controls, hidden numbers, jump-to.
- No guideline text on the page.

### Pill (5570:566)
- Variants: color = neutral, info, warning, success, error, plum, aurora, sky, stone, sea, orange, violet. size = xs, sm, md, lg. Optional icon and label.
- Use when: a static status next to an item (order status, online state, lifecycle stage).
- Don't use: when the user can remove it (use Tag); when it needs immediate attention (use Alert).
- Best practices: pick color by meaning, not contrast. One or two words. Don't stack several pills on one item. Meanings: neutral = offline or inactive, info = active, loading or pending, warning = needs attention, success = complete, error = failed. No hover, focus or pressed states.

### Progress Bar (10541:5968)
- Variants: size = x-small, small, medium, large. color = primary, inverse.
- Use when: determinate processes with measurable progress (uploads, exports, installs) that run while the user stays on the view.
- Don't use: unknown duration (indeterminate ProgressCircle); loading one region (Spinner); scores or static amounts (Metric or a chart); processes under one second; user-controlled ranges (RangeInput).
- Best practices: always label the process and show percentageText. Update smoothly. On completion give clear feedback, don't leave it at 100%. Avoid stacked sub-task bars. Sizes: x-small in table rows and card footers, small in list rows, medium as page default, large when progress is the focus. Inverse only on surfaces that run against the theme base. Mock in-progress with a non-round value and present-tense label. On error, replace with an inline error and a retry action.
- Accessibility: the label is announced with the value. The component sets the progressbar role and values automatically; don't override. Update the label on completion or error. Don't use it for static values.

### Progress Circle (14357:3119)
- Variants: type = text, slot. size = x-small, small, medium, large. color = primary, inverse. Progress text: fraction or percentage.
- Use when: a measurable process in compact form (course completion, upload in a card, quota); unknown duration with type=slot as an indeterminate indicator; no room for a Progress Bar.
- Don't use: full-width linear progress (Progress Bar); plain loading (Spinner); a static score (Metric). No centre text at x-small.
- Best practices: pair with an external label naming the process. Update smoothly; resolve clearly at 100%. Minimal slot content. x-small in table cells, small in list rows and sidebars, medium default, large as main focus. Percentage when the total doesn't matter, fraction when it does. Inverse only on surfaces against the theme base. Indeterminate: Spinner in the slot, no made-up percentage. On error, replace with an inline error and a retry.
- Accessibility: needs an external label. Progressbar role and values are automatic. Indeterminate needs a hidden label or an aria-live "Loading" message. Meaningful slot content needs its own label.

### Radio Group (12817:2574)
- Variants: layout = stacked, inline, columns. isDisabled, isReadOnly. size = small, medium, large. validation, showMessage.
- Use when: exactly one choice from about 2 to 7 visible, mutually exclusive options. For optional choices, add a "None" option.
- Don't use: multi-select (CheckboxGroup); more than about 7 options (Select); binary toggle (Switch); numeric range (RangeInput).
- Best practices: group label describes the decision; short, parallel options in logical order. Pre-select a safe default only when it makes sense. Validation with an actionable message, cleared once valid. Don't disable items without explanation. stacked for long labels, columns (two at most) for short labels, inline only in toolbars and filter bars. Disabled = can't yet (give a reason); read-only = already decided.
- Accessibility: group label is the fieldset's name. Each option makes sense alone. Errors visible and announced.

### Range Input (11527:5370)
- Variants: size = small, medium, large. Handle states base, hover, focus (automatic).
- Use when: an approximate number within a real min, max and step, where seeing the range helps.
- Don't use: precise numbers (NumberInput); named options (RadioGroup or Select); progress (Progress Bar); min and max ranges (single handle only).
- Best practices: always labeled with the current value shown. Show min and max labels when meaningful. Step matches the natural granularity; real bounds, not a default 0 to 100. Pre-set to a common value. Consistent decimals. No disabled or read-only state; use a read-only TextInput instead.
- Accessibility: label is the name. Slider role and values automatic; arrow keys step the value. Add a readable aria-valuetext when the number alone isn't meaningful. Touch target at least 44x44.

### Spacing (16391:860)
- Gaps between cards match card size: small gap for small cards, medium for medium, large for large. Mixed sizes use the larger card's gap. Section gaps separate distinct groups and signal a bigger structural break than gaps within a group.

### Spinner (38789:136556)
- Partly read: this link is one theme-preview frame (sizes 24, 48, 80 and 112 px), not the full Spinner page.

### Switch (7109:4048)
- Variants: state = base, hover, disabled, readonly. size = small, medium, large. isChecked. validation = none, success, error. labelPlacement = end (default), start. showDescription.
- Use when: one independent on/off setting that applies immediately.
- Don't use: when there's a Save step (Checkbox); one of several options (RadioGroup); more than two states; when the label would change between on and off; destructive actions (Button plus a confirmation Modal).
- Best practices: labels are 1 to 4 word nouns naming what's enabled. Don't mix label placements in a group; give related switches a heading. Don't use to navigate or open a modal. Opt-in features default to off. Don't mix sizes. Descriptions are 1 to 2 sentences that add to the label. Error for failed validation with a message.
- Accessibility: label stands alone. On and off are announced automatically, so don't put the state in the label. Group under a visible heading.

### Segmented Control (38283:40156)
- Variants: style = text, icon, text + icon. size = sm, md, lg. isDisabled = false, true. One option is selected (dark navy in Light, light in Dark) on a tinted bar.
- Use when: choosing one of a few options that should all stay visible (a view, a range, a mode), and the choice changes what you see now.
- Don't use: for many options (SimpleSelect), for switching page content (Tabs), for an on or off setting (Checkbox toggle).
- Not in the InstUI package. Built in `src/SegmentedControl.tsx` from buttons and the theme's SegmentedControl tokens (see `docs/compare.md`).

### Table (17819:940)
- Variants: showSelection. columnAmount = 2 to 8. Cell types = text, slot, rowHeader, checkbox, button. Sort order = base, ascending, descending. Head and row hover states.
- No guideline text on the page.

### Tabs (13100:9684)
- Variants: primaryTab and secondaryTab, 2 to 8 tabs each. Panel selected states; secondary has hover.
- Use when: 2 to 8 same-level sections in one context, for exploring rather than workflows. primaryTab (underline) for top-level page sections; secondaryTab (pill) for sub-sections in a card or panel. Primary always wraps secondary.
- Don't use: sequential steps (wizard); a single section; side-by-side comparison; more than 8 sections (Drilldown or Menu); decoration. Don't nest a variant inside itself.
- Best practices: labels are short parallel nouns of 1 to 3 words. Exactly one tab selected. Order by frequency or logic, never reorder dynamically. No icon-only labels. No empty tabs. Disabled tabs get a tooltip reason; remove tabs the user lacks permission for; never disable all tabs.
- Accessibility: tab roles and keyboard handled automatically (arrow keys between tabs). Each panel needs a heading. Don't show the selected tab by color alone.

### Tag (5580:7135)
- Variants: size = sm, md, lg. state = base, hover, disabled. Can be a link. Dismiss button. Icons and colors are instance options.
- Partly read: no guideline text on the page.

### Text (7076:4850)
- Text styles, not variants: Description Page (page intro), Description Section (section intro), Content (body), Content Important (key statements in body), Content quote (quoted text), Content Small (notes, disclaimers), Legend (short text next to data viz, icons or UI).
- The theme section shows only the most-used text colors; the full list is in the library variables.

### Text Area (3437:9532)
- Variants: size = small, medium, large. layout = stacked, inline. validation = none, error, success. state = base, hover, readonly, disabled. filled. resizable. Also focus, loading, showMessage.
- Use when: multi-line, open-ended input (comments, descriptions, bios, feedback). stacked for standard forms, inline for compact settings or table edit rows. resizable when length is unpredictable.
- Don't use: single line (TextInput); formatted input like phone, date or URL; choosing options; numbers; rich text.
- Best practices: always a short noun-phrase label. Placeholder is an example, not the label, never required info. Show a count when there's a limit. Initial height fits the expected length. Helper text for format or length. small for dense or inline, medium default, large for long-form; don't mix sizes or layouts in one section. Not resizable inside a scrolling container. Disabled needs a reason; readonly for read-or-copy content. Error and success need showMessage; error says what to fix. Resolve loading. Realistic mock content, not lorem ipsum.
- Accessibility: visible, descriptive label. Visible error messages. State limits up front. Readonly stays in tab order; disabled doesn't.

### Toggle Details / accordion (13490:801)
- Variants: expanded. size = small, medium, large. fluidWidth. variant = unfilled (default), filled. Summary iconPosition = start, end.
- Use when: supplementary content only some users need. Stack instances to build an accordion.
- Don't use: critical or required content; trivially short content; navigation (Tabs); always-visible content (section or Card); confirm or cancel (Modal or Button).
- Best practices: summary labels are unique 1 to 8 word phrases or questions. One topic per panel. Don't nest. If most users need it, don't hide it. small for dense lists and sidebars, medium default, large for primary sections. filled on non-white surfaces. iconPosition start is standard, end suits settings panels. Don't mix sizes, variants, icon positions or widths in a group. Mocks show one collapsed and one expanded.
- Accessibility: summary label is the name. Disclosure ARIA is automatic. Enter and Space toggle. Never hide errors, required notices or legal text inside.

### Tooltip (7621:17062)
- Variants: color = base, onColor. placement = 12 positions. showArrow.
- Use when: a short clarification, especially labeling icon-only buttons. One phrase or sentence. onColor on branded or dark surfaces.
- Don't use: essential, long or interactive content (Popover); self-explanatory labels; disabled elements unless it explains why; errors or validation.
- Best practices: one concise idea, don't repeat the visible label, avoid touch-only surfaces. Start with topCenter or bottomCenter; corner placements near edges; keep it in the viewport. showArrow when the target could be ambiguous.
- Accessibility: the trigger must be focusable. Text becomes the trigger's description. Shows on hover and focus; Escape closes it. No interactive content. Never the only source of critical info.

### TopNavBar (15806:563)
- Desktop: actions (1 to 5), menu items (1 to 8, selected or not), user section (logged in or not), menu items or breadcrumb, user button (avatar, name, or both).
- Mobile: open or closed menu, inverse color, preset Canvas side nav, account and LTI menus, submenus.
- Brands: Mastery, Studio, Commons, New Quizzes, Canvas Catalog, Impact, Elevate, LearnPlatform, Parchment Digital Badges, custom.
- No guideline text on the page.

### Tray (9531:244)
- Variants: size = xsmall, small, base, medium, large. placement = start, end, top, bottom. border. dropShadow.
- Partly read: no guideline text on the page.

### TreeBrowser (39952:403)
- Variants: size = small, medium (default), large. variant = folderTree (default), indent. Rows are collections or items with default, hover, selected and focus states.
- Use when: showing collections and nested items as a tree, with expand and optional selection, and keyboard navigation. Not without a collection-and-item hierarchy.
- Best practices: pick size and variant first. Nested rows match the tree's size and variant.
- Accessibility: pass treeLabel. Up and Down move focus, Right expands, Left collapses (swapped in RTL), Home and End jump. Enter or Space toggles or selects depending on selectionType.

### Using the Library (15931:1235)
- Use library components as instances; customize through exposed properties, don't detach. Hybrid components may add custom pieces only if those use InstUI variables. Always use tokens: hard-coded values break theme switching. Keep Text and Heading styles and colors separate.

## Pages not read yet

These links were too large for the Figma connector. Send links to smaller frames inside them to read them.

- 2633:1827, 2841:2498, 2943:9029, 3313:7297, 6771:3002, 7741:12636, 7921:8240, 23345:195039, 28690:11666
- Partly read: Avatar (0:1), Spinner (38789:136556, only one theme preview), Tag (no guidelines on the page), Tray (no guidelines on the page)
- Too large earlier: Color (2508:239), Theming (8110:35817). The Wrapper page (22967:72736, includes the examples 23002:87182) was read section by section on 2026-10-15.
