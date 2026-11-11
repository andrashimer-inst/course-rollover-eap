# Component comparison: Figma, code, and the InstUI site

How the 103 documented InstUI components line up across the three sources. Generated on 2026-10-14
from `docs/components.md` (Figma), the installed package `@instructure/ui` 11.7.8, and the site docs in
`docs/instui-site/` (InstUI 11.7.9).

## Which source decides what

| Question | Source that decides |
| --- | --- |
| How it should look, which variants exist, when to use it | **Figma.** The Figma components are the go-to for design. |
| What can actually be built today, and the real prop names | **The installed package types.** The code is the latest library, so it decides what exists. |
| Prop behavior, examples, accessibility details | The site docs, with care. They mostly describe the legacy components and the 11.7.9 release, so check them against the package types. |

When Figma and code disagree, design from Figma and build with the closest package component. Say
what the code can't do, and don't invent it. Prefer the `v2` (new theme) version of a component, since
only `v2` works in Light and Dark. A component marked "Legacy only" will look wrong in Dark.

## What to remember

**Not in the package yet (compose from other components):**
- **Card** is new in 11.7.9 and not installed. Figma has a Card (base, nested, with image; sm, md, lg). Build it from `View` with `padding="padding.card.md"` and a border, and follow Figma's sizes and spacing.
- **Banner, Switch, Wrapper, GlobalNav, UtilityPanel, ContentTabList, TrailingContentArea** exist in Figma but not in the package. Switch is `Checkbox variant="toggle"`. The others are rebuilt in this repo (see CLAUDE.md).
- **ColorPalette, RGBAInput, Slider, SearchPanel, AISpinnerIcon** have site pages but aren't public. Use `ColorMixer` or `ColorPicker`, `RangeInput`, the `searchConfig` prop of `SourceCodeEditor`, and `Spinner variant="ai"`.

**Legacy only (avoid in new designs):** `DateInput2` (use `DateInput`), `Pages` (use `Drilldown` or Tabs), `Editable`, `Expandable`, `Overlay`, `Responsive` (the last four have no visuals, so Dark is not a concern). `InlineSVG` and `SVGIcon` color presets may not adapt in Dark, so leave their `color` unset.

**Figma name vs code name** (the ones that trip people up):

| Component | Figma | Code |
| --- | --- | --- |
| Alert | `color`; `type` floating or inline | `variant`; `hasShadow` (inline has no shadow). Dismissible needs `renderCloseButtonLabel`. The package Alert draws the old layout with new colors, so in this repo use `src/FigmaAlert.tsx` (`variant`, `type`, `dismissible`) for the Figma look in Light and Dark. |
| Badge | `type` dot or number; `color` info, success, error, onColor | `type` notification or count; `variant` primary, success, danger, inverse. Cap with `formatOverflowText` (the default text is "N +"). |
| Pill | 12 colors, 4 sizes | `color` primary, success, info, warning, error only. No size. The extra colors and sizes are design-only. |
| Checkbox, Checkbox Group, Radio Group | `isDisabled`, `isReadOnly`, `validation` | `disabled`, `readOnly`, and errors through `messages` |
| Tray | `size` xsmall, base; `dropShadow` | `size` x-small, regular; `shadow` |
| Tooltip | `color` base, onColor; `showArrow` | `color` primary, primary-inverse; no `showArrow` |
| Toggle Details | `variant` unfilled | `variant` default |
| Tabs | primaryTab, secondaryTab | `variant` default, secondary |
| Text Area | `resizable`; `validation` | `resize`; errors through `messages` |
| Breadcrumb | `iconPlacement` before, after | `start`, `end` |
| Calendar | `isVisibleMonth` | `isOutsideMonth` (the inverse) |
| Date-Time Input | layout columns is the default | code default is `inline`, so set `layout="columns"` |
| Progress Bar, Progress Circle | `percentageText`; Circle `type` text or slot | `renderValue` with `formatScreenReaderValue`. No indeterminate Circle: put a Spinner in the slot. |
| Heading | colors base, muted, baseOnColor, mutedOnColor, inverseColor | `primary`, `secondary`, `primary-on`, `secondary-on`, `primary-inverse`, `secondary-inverse`. Always pass `level`. |
| Table | `showSelection`, `columnAmount`, cell types | no props for these. Compose selection by hand. `caption` is a function. |
| Tag | link, icon, color options | renders a button or a span only, with no `href`, icon, or color |
| Link | v1 `variant` inline-small, standalone-small | v2 `variant` inline, standalone, plus `size` |

**Where Figma and the docs disagree:** Tabs. Figma allows 2 to 8 tabs with 1 to 3 word labels and says primary tabs wrap secondary. The docs say at most 5 tabs and 20 characters, and don't nest tabbed content in a tab. Design from Figma, and flag it to the owner if a design uses more than 5.

**Deprecated or in transition:** `DateInput2`; overflowing (ellipsized) text in `Pill` and `Tag`; `Text` sizes descriptionPage, descriptionSection, content, contentSmall, legend (use the matching `variant`); `Pagination.Page` children (use `totalPageNumber`, `currentPage`, `onPageChange`); `DeterministicIdContextProvider`'s `instanceCounterMap`; `TruncateText` `shouldTruncateWhenInvisible`.

**Not yet in the Figma summaries:** Banner, Button, Modal, Select, TextInput, and 9 unread pages (see `docs/components.md`). For these there is no Figma spec in our files, so follow the site docs and ask the owner when a design depends on one.

## Lookup

76 of 103 are in the package as new-theme (v2) components.

| Component | In package 11.7.8 | Figma page |
| --- | --- | --- |
| AccessibleContent | Yes, no theme versions | No |
| AiInformation | Yes, new theme (v2) | Yes |
| AISpinnerIcon | Not in package | No |
| Alert | Yes, new theme (v2) | Yes |
| ApplyLocale | Yes, no theme versions | No |
| AppNav | Yes, new theme (v2) | No |
| Avatar | Yes, new theme (v2) | Partly |
| Badge | Yes, new theme (v2) | Yes |
| BaseButton | Yes, new theme (v2) | No |
| Billboard | Yes, new theme (v2) | No |
| Breadcrumb | Yes, new theme (v2) | Yes |
| Button | Yes, new theme (v2) | No |
| Byline | Yes, new theme (v2) | No |
| Calendar | Yes, new theme (v2) | Yes |
| Card | Not in package | Yes |
| Checkbox | Yes, new theme (v2) | Yes |
| CheckboxGroup | Yes, new theme (v2) | Yes |
| CloseButton | Yes, new theme (v2) | No |
| ColorContrast | Yes, new theme (v2) | No |
| ColorIndicator | Yes, new theme (v2) | No |
| ColorMixer | Yes, new theme (v2) | No |
| ColorPalette | Not in package | No |
| ColorPicker | Yes, new theme (v2) | No |
| ColorPreset | Yes, new theme (v2) | No |
| CondensedButton | Yes, new theme (v2) | No |
| ContextView | Yes, new theme (v2) | No |
| DataPermissionLevels | Yes, new theme (v2) | Yes |
| DateInput | Yes, new theme (v2) | Yes |
| DateInput2 | Legacy only (v1) | No |
| DateTimeInput | Yes, new theme (v2) | Yes |
| DeterministicIdContextProvider | Not in package | No |
| Dialog | Yes, no theme versions | No |
| DrawerLayout | Yes, new theme (v2) | No |
| Drilldown | Yes, new theme (v2) | Yes |
| Editable | Legacy only (v1) | No |
| Expandable | Legacy only (v1) | No |
| FileDrop | Yes, new theme (v2) | Yes |
| Flex | Yes, new theme (v2) | No |
| Focusable | Yes, no theme versions | No |
| FormField | Yes, new theme (v2) | No |
| FormFieldGroup | Yes, new theme (v2) | No |
| Grid | Yes, new theme (v2) | No |
| Heading | Yes, new theme (v2) | Yes |
| IconButton | Yes, new theme (v2) | No |
| Img | Yes, new theme (v2) | No |
| InlineList | Yes, new theme (v2) | No |
| InlineSVG | Yes, no theme versions | No |
| InPlaceEdit | Yes, new theme (v2) | No |
| InstUISettingsProvider | Yes, no theme versions | No |
| Link | Yes, new theme (v2) | No |
| List | Yes, new theme (v2) | No |
| Mask | Yes, new theme (v2) | No |
| Menu | Yes, new theme (v2) | No |
| Metric | Yes, new theme (v2) | Yes |
| MetricGroup | Yes, new theme (v2) | No |
| Modal | Yes, new theme (v2) | No |
| NumberInput | Yes, new theme (v2) | No |
| NutritionFacts | Yes, new theme (v2) | Yes |
| Options | Yes, new theme (v2) | No |
| Overlay | Legacy only (v1) | No |
| Pages | Legacy only (v1) | No |
| Pagination | Yes, new theme (v2) | Yes |
| Pill | Yes, new theme (v2) | Yes |
| Popover | Yes, new theme (v2) | No |
| Portal | Yes, no theme versions | No |
| Position | Yes, no theme versions | No |
| PresentationContent | Yes, no theme versions | No |
| ProgressBar | Yes, new theme (v2) | Yes |
| ProgressCircle | Yes, new theme (v2) | Yes |
| RadioInput | Yes, new theme (v2) | No |
| RadioInputGroup | Yes, new theme (v2) | Yes |
| RangeInput | Yes, new theme (v2) | Yes |
| Rating | Yes, new theme (v2) | No |
| Responsive | Legacy only (v1) | No |
| RGBAInput | Not in package | No |
| ScreenReaderContent | Yes, no theme versions | No |
| SearchPanel | Not in package | No |
| Select | Yes, new theme (v2) | No |
| SegmentedControl | Not in the package (built in `src/SegmentedControl.tsx`) | Yes (38283:40156) |
| Selectable | Yes, no theme versions | No |
| SideNavBar | Yes, new theme (v2) | No |
| SimpleSelect | Yes, new theme (v2) | No |
| Slider | Not in package | No |
| SourceCodeEditor | Yes, new theme (v2) | No |
| Spinner | Yes, new theme (v2) | Partly |
| SVGIcon | Yes, no theme versions | No |
| Table | Yes, new theme (v2) | Yes |
| Tabs | Yes, new theme (v2) | Yes |
| Tag | Yes, new theme (v2) | Partly |
| Text | Yes, new theme (v2) | Yes |
| TextArea | Yes, new theme (v2) | Yes |
| TextInput | Yes, new theme (v2) | No |
| TimeSelect | Yes, new theme (v2) | No |
| ToggleButton | Yes, new theme (v2) | No |
| ToggleDetails | Yes, new theme (v2) | Yes |
| ToggleGroup | Yes, new theme (v2) | No |
| Tooltip | Yes, new theme (v2) | Yes |
| TopNavBar | Yes, new theme (v2) | Yes |
| Transition | Yes, no theme versions | No |
| Tray | Yes, new theme (v2) | Yes |
| TreeBrowser | Yes, new theme (v2) | Yes |
| TruncateList | Yes, no theme versions | No |
| TruncateText | Yes, new theme (v2) | No |
| View | Yes, new theme (v2) | No |

## Details per component

Short notes, one block per component. Treat prop names here as a guide and confirm them in
`node_modules/@instructure/ui-*/types/<Component>/v2/props.d.ts` before relying on them.

### AccessibleContent
- Package 11.7.8: in package, no v1/v2 split (ui-a11y-content, single props.d.ts). No theming, so Light and Dark are not a concern.
- Figma: none.
- Docs status: current. Props `alt` (string), `as` (default 'span'), `children`. It hides children from screen readers (aria-hidden) and reads `alt` instead.
- Use: not a visual component. Wrap visual-only content (for example an abbreviated weekday "Sun" with `alt="Sunday"`) in `AccessibleContent`. Docs point to PresentationContent for decorative content.

### AiInformation
- Package 11.7.8: in package as v2 (ui-instructure, `AiInformation/v2`; v1 also present).
- Figma: has a page summary ("AI components", 14220:3119). AI Information is a popover. Nutrition Facts and Data Permission Levels are modals that open from links in that popover. No variants or guidelines in the summary.
- Docs status: current. v2 adds optional `privacyNoticeScreenReaderLabel` on each `data` item (not in v1).
- Differences: the Figma summary lists no props. Code is data-driven: required `trigger`, `title`, `data[]` (featureName, privacyNoticeText, privacyNoticeUrl, permissionLevel, modelName and more) plus 14 prefixed props (`dataPermissionLevels*`, `nutritionFacts*`), all i18n strings required. Code-only: `fullscreenModals` (for small viewports). The Figma "base and current" Data Permission Levels types are not mapped to a prop in the summary (docs example uses `highlighted: true` on a level).
- Use: design from the Figma AI components page; build with `AiInformation` and pass every i18n string. Set `fullscreenModals` on mobile. Standalone `NutritionFacts` and `DataPermissionLevels` also exist in ui-instructure v2.

### AISpinnerIcon
- Package 11.7.8: not a public export. A private helper file exists only in ui-spinner v2 (`Spinner/v2/AISpinnerIcon`, made with wrapCustomIcon). The ui-spinner exports list only `Spinner`.
- Figma: none. The Spinner page (38789:136556) is only partly read and mentions no AI spinner.
- Docs status: page is titled "AISpinnerPaths" with one prop `color` (string, default 'currentColor'). It describes the star path from igniteai-logo.svg. It is an internal helper and lists an import from `@instructure/ui-spinner/v11_7` that the installed package does not export. The user-facing page is Spinner.md.
- Use: do not build with it. Use `Spinner` v2 with `variant="ai"` or `"ai-on-color"`, `size` x-small|small|medium|large, `renderTitle` for the screen-reader title. v1 Spinner only has `variant` default|inverse.

### Alert
- Package 11.7.8: in package as v2 (ui-alerts, `Alert/v2`). Its theme is a frozen DesignTokensV1 snapshot (only Alert and Pill use this) with light, dark and canvas tokens, so Dark works.
- Figma: has a page summary (Alert, 13704:5434).
- Docs status: current.
- Differences: Figma `color` = info|success|warning|error is `variant` in code (same values). Figma `type` floating|inline has no prop; `hasShadow` (default true) is the closest, docs say set false for inline alerts. Figma `width` auto|manual has no prop (size with the container and `margin`). Figma `dismissible` is a close button shown only when `renderCloseButtonLabel` is set, plus `onDismiss`, `open`, `transition`, `timeout`. Figma `showButtonGroup` has no prop (buttons would go in `children`, not stated in docs).
- Differences (code-only): `variantScreenReaderLabel`, `liveRegion`, `liveRegionPoliteness`, `isLiveRegionAtomic`, `screenReaderOnly`, `renderCustomIcon`, `margin` (default 'x-small 0'). Docs say keep text to two lines.
- Use: design from Figma; build with `Alert variant=... renderCloseButtonLabel=... hasShadow={false}` for inline. Figma sends promotions to Banner, which is not in the package or site docs.

### ApplyLocale
- Package 11.7.8: in package, no v1/v2 split (ui-i18n, `ApplyLocale/props.d.ts`). Not themed.
- Figma: none.
- Docs status: current. Props `locale`, `timezone`, `children` (all optional strings). Sets locale and timezone context for children such as TimeSelect.
- Use: a code-only wrapper, nothing to design. Wrap a section so date and time components read one locale and timezone. Calendar docs say its own `locale` and `timezone` props override this context.

### AppNav
- Package 11.7.8: in package as v2 (ui-navigation, `AppNav/v2` and `AppNav/v2/Item`).
- Figma: none. The only Figma nav page is TopNavBar (15806:563), a different component.
- Docs status: current. Described as intended for LTI apps. Overflow items collapse into a "More" menu.
- Use: build with `AppNav` (required `screenReaderLabel`; `renderBeforeItems`, `renderAfterItems`, `renderTruncateLabel`, `visibleItemsCount`, `onUpdate`) and `AppNav.Item` (required `renderLabel`; `href` or `onClick`, `isSelected`, `isDisabled`, `renderIcon`, `renderAfter`). Children must be `AppNav.Item`. No Figma design to follow.

### Avatar
- Package 11.7.8: in package as v2 (ui-avatar, `Avatar/v2`; v1 also present).
- Figma: has a partly read page summary (Avatar, 0:1). Only an accessibility note: a standalone avatar needs screen-reader text naming the person.
- Docs status: current. v2 changed from v1: `color` is now accent1 to accent6 plus `ai` (v1 had default, shamrock, barney, crimson, fire, licorice, ash), `size` lost 'auto', `display` is 'inline'|'block' (v1 'inline-block').
- Differences: Figma variants not read, so not stated. The a11y note matches docs (Avatar is aria-hidden; pair with ScreenReaderContent when standalone).
- Use: build `Avatar` with required `name` (becomes initials), `src`, `size` xx-small|x-small|small|medium (default)|large|x-large|xx-large, `color`, `shape` circle|rectangle, `hasInverseColor`, `showBorder`, `renderIcon`. AI avatar: `color="ai"` with `renderIcon={IgniteaiLogoInstUIIcon}` (docs example; icon is in ui-icons custom). Docs: use circle in Canvas; don't use inline in a sentence.

### Badge
- Package 11.7.8: in package as v2 (ui-badge, `Badge/v2`; v1 also present, same props).
- Figma: has a page summary (Badge, 5580:7136).
- Docs status: current.
- Differences: Figma `type` dot|number is `type` 'notification'|'count' in code. Figma `color` info|success|error|onColor is `variant` 'primary'|'success'|'danger'|'inverse' in code (info is primary, error is danger, onColor is inverse; the mapping is by meaning, not stated in a source). Figma says cap at "99+" but the default `formatOverflowText` returns `${countUntil - 1} +` (with a space), so pass your own function. Code-only: `standalone` (Figma says always attach to a host), `pulse`, `placement` (6 values; Figma says top-right), `formatOutput` (use for accessible text), `countUntil`.
- Use: design from Figma; build `Badge count=... countUntil={100} formatOverflowText={...}` or `type="notification"`, wrapped around the host control, with `formatOutput` giving screen-reader text.

### BaseButton
- Package 11.7.8: in package as v2 (ui-buttons, `BaseButton/v2`; v1 also present).
- Figma: none.
- Docs status: current, but docs say do not use directly. Use Button, CloseButton, IconButton or CondensedButton.
- Use: build with Button or IconButton instead. Extra props only here: `shape` rectangle|circle, `withBorder`, `isCondensed`, `withFocusOutline`, `tabIndex`, `onKeyDown`.

### Billboard
- Package 11.7.8: in package as v2 (ui-billboard, `Billboard/v2`; v1 also present).
- Figma: none.
- Docs status: current. For empty states, 404 pages, redirects. With `href` it renders as a link, with `onClick` as a button.
- Use: build with `Billboard`: `hero` (element, or function receiving icon size), `heading`, `headingAs`, `headingLevel`, `message` (call to action text; no interactive content when `href` or `onClick` is set), `size` small|medium|large, `disabled`, `readOnly`. v2 allows `hero` function with optional size argument. No Figma page to follow.

### Breadcrumb
- Package 11.7.8: in package as v2 (ui-breadcrumb, `Breadcrumb/v2` and `BreadcrumbLink`; v1 also present).
- Figma: has a page summary (Breadcrumb, 2205:107).
- Docs status: current. Docs say best for tablet width (about 768px) and up; below that use a Link back to the previous view.
- Differences: Figma `levels` 2 to 6 has no prop (count = number of `Breadcrumb.Link` children, no maximum stated). Figma `showIcon` is `renderIcon` on a link; `iconPlacement` before|after is 'start'|'end'. Figma shows the icon on the current level only (off by default); code allows an icon on any link. Code-only: required `label` (nav name), `isCurrentPage` (aria-current; defaults to the last link). Figma `size` small|medium|large matches.
- Use: design from Figma; build `Breadcrumb label=... size=...` with `Breadcrumb.Link` children; last link without `href` is the current page. Auto-truncates to one line (docs); middle truncation not stated.

### Button
- Package 11.7.8: in package as v2 (ui-buttons, `Button/v2`). v2 adds `size` condensedSmall|condensedMedium; v1 has only small|medium|large.
- Figma: none in the summaries (a Button page may be among the unread node ids).
- Docs status: current. Guidelines: Title Case text, 20 characters maximum, one `primary` per section, `primary-inverse` with `focusColor="info"` on colored or dark backgrounds, backgroundless (`withBackground={false}`) sparingly.
- Use: build with `Button` `color` primary|primary-inverse|secondary (default)|success|danger|ai-primary|ai-secondary, `size`, `renderIcon`, `display`, `textAlign`, `interaction` enabled|disabled|readonly, `href`. No `withBorder` on Button. Icon-only buttons use IconButton with `screenReaderLabel`.

### Byline
- Package 11.7.8: in package as v2 (ui-byline, `Byline/v2`; v1 also present, same props).
- Figma: none.
- Docs status: current.
- Use: build with `Byline`: required `children` (the visual, for example an Avatar), `title`, `description`, `alignContent` top|center (default), `size` small|medium|large (limits width), `margin`. No Figma page to follow.

### Calendar
- Package 11.7.8: in package as v2 (ui-calendar, `Calendar/v2` and `Day`; v1 also present). v2 makes `selectedLabel` required on Calendar and Calendar.Day (optional in v1).
- Figma: has a page summary (Calendar, 12371:6675).
- Docs status: current. A bare `<Calendar />` uses a default config; custom months need exactly 42 `Calendar.Day` children.
- Differences: Figma day `state` enabled|disabled is `interaction` on `Calendar.Day`. Figma `isVisibleMonth` is the inverse `isOutsideMonth`. `isSelected`, `isToday` match. Figma `withYearPicker` true|false is an object in code (`screenReaderLabel`, `startYear`, `endYear`, optional `onRequestYearChange`). Code-only: `disabledDates` (array or function), `visibleMonth`, `currentDate`, `role` table|listbox, `locale`, `timezone`, render props for navigation and weekday labels.
- Use: design from Figma; build `Calendar` with `selectedLabel`, `selectedDate` + `onDateSelected`, `visibleMonth` + `onRequestRenderNextMonth`/`PrevMonth`, `currentDate`, `disabledDates`, optional `withYearPicker`.

### Card
- Package 11.7.8: not in package. No ui-card folder and no Card export in `@instructure/ui` v11_6 or v11_7 (only card theme token files exist in ui-themes).
- Figma: has a page summary (Card, 16597:632). The older "Card" page marked deprecated in Figma should not be used.
- Docs status: new in 11.7.9 only (imports from `@instructure/ui-card/v11_7`).
- Differences: Figma `variant` base|nested|withImage and `size` sm|md|lg. Docs Card has only `variant` base|nested and `children`. No `size` (padding and radius scale from the card's own width, two breakpoints, width fills the container), no image variant, no title or action slots.
- Use: design from Figma (base, nested; withImage and sizes have no code match). Upgrade to 11.7.9 or later to get Card; until then compose from `View` with `background`, `shadow`, `borderWidth`, `borderRadius`, `padding` (all appear in docs examples). Rules agree: nested inside base, never base in base.

### Checkbox
- Package 11.7.8: in package as v2 (ui-checkbox, `Checkbox/v2` plus CheckboxFacade and ToggleFacade; v1 also present). v2 adds `margin`.
- Figma: has a page summary (Checkbox, 5248:5114).
- Docs status: current.
- Differences: Figma `isChecked`/`isIndeterminate` are `checked` (or `defaultChecked`) and `indeterminate`. Figma state readonly is `readOnly`; disabled is `disabled`; hover and focus are automatic. Figma `validation`/`isInvalid` has no prop; use `messages` with type 'error'|'newError'|'success'|'hint'|'screenreader-only'. Figma `size` small|medium|large matches. Code-only: `variant` 'simple'|'toggle', `labelPlacement`, `inline`, `isRequired`, `value`.
- Use: design from Figma; build `Checkbox label=... size=... indeterminate messages=...`. Figma Switch has no component of its own in the package; closest is `variant="toggle"` (`labelPlacement` top|start|end, no description prop, `size` only changes label text per docs).

### CheckboxGroup
- Package 11.7.8: in package as v2 (ui-checkbox, `CheckboxGroup/v2`; v1 also present). v2 adds `margin`.
- Figma: has a page summary ("Checkbox Group", 12036:2934).
- Docs status: current.
- Differences: Figma `isDisabled`/`isReadOnly` are `disabled`/`readOnly`. Figma `validation` is group-level `messages`. `layout` stacked|inline|columns (default stacked) and `size` match. Code requires `name` and `description` (Figma also wants a description; hide it with ScreenReaderContent if needed). Code-only: `value`/`defaultValue`/`onChange(value[])`; children must be `Checkbox`.
- Use: design from Figma; build `CheckboxGroup name=... description=... layout=... messages=...` with `Checkbox` children. Docs and Figma agree: stack when more than 2 options, inline for 2 at most.

### CloseButton
- Package 11.7.8: in package as v2 (ui-buttons, `CloseButton/v2`; v1 also present, same props).
- Figma: none.
- Docs status: current. Docs guideline says set `color` to `primary` on dark backgrounds, but the allowed values are 'primary'|'primary-inverse' and Button docs use `primary-inverse` for dark. Treat `primary-inverse` as the on-dark choice (unverified wording clash in docs).
- Use: build `CloseButton` with required `screenReaderLabel`, `size` small (default)|medium|large, `placement` start|end|static, `offset` none|x-small|small|medium (offset only works with start or end and a positioned parent), `color`, `interaction`. No Figma page to follow.

### ColorContrast
- Package 11.7.8: v2 (ui-color-picker/types/ColorContrast/v2). v1 also present (legacy theme).
- Figma: none.
- Docs status: current. Intro cites WCAG 2.1; the `validationLevel` prop text cites WCAG 2.2.
- Differences: skipped (no Figma page).
- Use: build with `ColorContrast`. Required props: `label`, `firstColor`, `secondColor` (hex), `successLabel`, `failureLabel`, `normalTextLabel`, `largeTextLabel`, `graphicsTextLabel`. `firstColorLabel` and `secondColorLabel` are needed unless `withoutColorPreview`. Optional: `validationLevel` ('AA' | 'AAA', default 'AA'), `labelLevel` (h1 to h6, renders a Heading), `onContrastChange`. AA thresholds: 4.5 normal, 3 large and graphics.

### ColorIndicator
- Package 11.7.8: v2 (ui-color-picker/types/ColorIndicator/v2). v1 also present.
- Figma: none.
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: build with `ColorIndicator`. Props: `color` (any CSS color string, empty string allowed, shows a checkerboard behind transparency), `shape` ('circle' default | 'rectangle'), `elementRef`. For a clickable swatch, wrap it in `IconButton` with `screenReaderLabel`.

### ColorMixer
- Package 11.7.8: v2 (ui-color-picker/types/ColorMixer/v2, with internal Slider, RGBAInput and ColorPalette). v1 also present.
- Figma: none.
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: build with `ColorMixer`. `onChange(hex)` is required. Props: `value` (default '#000'), `withAlpha`, `disabled`. Seven screen reader label props are required: `rgbRedInputScreenReaderLabel`, `rgbGreenInputScreenReaderLabel`, `rgbBlueInputScreenReaderLabel`, `rgbAlphaInputScreenReaderLabel`, `colorSliderNavigationExplanationScreenReaderLabel`, `alphaSliderNavigationExplanationScreenReaderLabel`, `colorPaletteNavigationExplanationScreenReaderLabel`. Docs describe keyboard use as A and D for the sliders and W, A, S, D for the palette.

### ColorPalette
- Package 11.7.8: internal sub-component of ColorMixer only (ui-color-picker/types/ColorMixer/v2/ColorPalette, v1 too). Not exported from `exports/a` or `exports/b`, so it cannot be imported from the package.
- Figma: none.
- Docs status: has a page with a props table (all descriptions blank) and a `/v11_7` import line, but the installed package does not export it. Treat as internal.
- Differences: skipped (no Figma page).
- Use: do not build with it. Use `ColorMixer` instead. Props, if ever needed: `hue`, `color` (HSVType), `width`, `height`, `indicatorRadius`, `onChange`, `navigationExplanationScreenReaderLabel` (all required), `disabled`.

### ColorPicker
- Package 11.7.8: v2 (ui-color-picker/types/ColorPicker/v2). v1 also present.
- Figma: none (the Figma "Color" guide page 2508:239 was too large to read; its content is not stated).
- Docs status: current. Works controlled (`value` and `onChange`) or uncontrolled.
- Differences: skipped (no Figma page).
- Use: build with `ColorPicker`. Required: `label`, `placeholderText`. Key props: `withAlpha`, `isRequired`, `disabled`, `tooltip`, `width` (default '22.5rem'), `checkContrast` ({ isStrict, contrastStrength 'min' | 'mid' | 'max', contrastAgainst, renderContrastSuccessMessage, renderContrastErrorMessage }), `colorMixerSettings` (default popover with mixer, preset and contrast), or a `children` render function for custom popover content. Messages: `renderInvalidColorMessage`, `renderIsRequiredMessage`, `renderMessages`. Popover: `popoverMaxHeight`, `popoverButtonScreenReaderLabel`.

### ColorPreset
- Package 11.7.8: v2 (ui-color-picker/types/ColorPreset/v2). v1 also present.
- Figma: none.
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: build with `ColorPreset`. Required: `colors` (hex strings, 8-digit hex with alpha allowed), `onSelect`. Optional: `selected`, `label`, `disabled`, `colorScreenReaderLabel(hexCode, isSelected)`. `colorMixerSettings` adds a plus button to add or remove presets (needs `onPresetChange`, `addNewPresetButtonScreenReaderLabel`, `selectColorLabel`, `removeColorLabel`, `popoverAddButtonLabel`, `popoverCloseButtonLabel`, and a `colorMixer` block).

### CondensedButton
- Package 11.7.8: v2 (ui-buttons/types/CondensedButton/v2). v1 also present.
- Figma: none (no Button page in the summaries).
- Docs status: current. Docs size list matches v2.
- Differences: skipped (no Figma page). Code-only change: v2 `size` adds 'condensedSmall' and 'condensedMedium'; v1 had only 'small' | 'medium' | 'large'.
- Use: build with `CondensedButton` for padding-free text actions in tight spaces such as table cells. Props: `color` ('primary' default | 'primary-inverse' | 'secondary'), `size` (default 'medium'), `interaction` ('enabled' | 'disabled' | 'readonly'), `renderIcon`, `href`, `display` ('inline-block' default | 'block'), `onClick`, `type`, `as`, `margin`.

### ContextView
- Package 11.7.8: v2 (ui-view/types/ContextView/v2). v1 also present.
- Figma: none (Tooltip page 7621:17062 exists but is a different component).
- Docs status: current. Docs say it is used inside Popover and can sit inline with an arrow.
- Differences: skipped (no Figma page). Code-only change: v2 `shadow` is a theme `Shadow` token; v1 allowed 'resting' | 'above' | 'topmost' | 'none'.
- Use: build with `ContextView` for an inline callout with an arrow. Props: `placement` (default 'center end'), `background` ('default' | 'inverse'), `padding` (none by default), `margin`, `textAlign` ('start' | 'center' | 'end'), `shadow` (default 'above'), `width`, `maxWidth`, `borderColor`, `debug`.

### DataPermissionLevels
- Package 11.7.8: v2 (ui-instructure/types/DataPermissionLevels/v2, next to AiInformation and NutritionFacts). v1 also present.
- Figma: has one bullet on "AI components (14220:3119)": a modal listing the AI data permission levels with short descriptions (base and current types). It opens from a link in the AI Information popover.
- Docs status: current. Described as AI related data display for Instructure products.
- Differences: Figma "current type" maps to `data[].highlighted`. Code renders its own trigger (`triggerText`) while Figma shows the modal opened from the AI Information popover. Code-only: `fullscreen` (small viewports), `currentFeatureText` and `currentFeature`. Figma gives no prop names, spacing or variants (not stated).
- Use: design from the Figma AI components page; build with `DataPermissionLevels`. All text is passed in as props: `modalLabel`, `title`, `data` ({ level, title, description, highlighted? }[]), `closeButtonText`, `closeIconButtonScreenReaderLabel`, `currentFeatureText`, `currentFeature`, `triggerText` (all required). The product must supply the official level copy.

### DateInput
- Package 11.7.8: v2 (ui-date-input/types/DateInput/v2, new theming, simple API). v1 is the old API (manual calendar wiring, `size`, `isShowingCalendar`, `onRequestShowCalendar`, `children`) with the legacy theme.
- Figma: has a page summary, "Date Input (12371:2934)".
- Docs status: current and recommended. The 11.6 DateInput and 11.6 DateInput2 are deprecated; docs say switching from DateInput2 needs no code change.
- Differences: Figma `state` base/hover/readonly/disabled maps to `interaction` ('enabled' | 'disabled' | 'readonly'); hover is styling only. Figma `validation` none/error/success maps to `messages` (FormMessage[]) plus `invalidDateErrorMessage` (validation runs only if this is set; empty string still validates). Figma "placeholderText" is `placeholder` in code (left undefined it shows a locale format hint). Figma "disable invalid days" is `disabledDates` (string[] or function), which affects the calendar only; typed dates need `onRequestValidateDate`. Figma `filled`, `isOpen`, `focus`, `showMessage`, `showCalendar` are design states, not props. Code-only: required `screenReaderLabels` (calendarIcon, prevMonthButton, nextMonthButton, datePickerDialog, selectedLabel), `withYearPicker`, `dateFormat`, `locale`, `timezone`, `isRequired`, `isInline`, `renderCalendarIcon`, `width`, `margin`; `onChange(event, inputValue, utcDateString)`. No `size` prop in v2.
- Use: design from the Figma Date Input page; build with `DateInput` (v11_7 / v2), never `DateInput2`. Always pass `renderLabel` and all five `screenReaderLabels`.

### DateInput2
- Package 11.7.8: v1 only (ui-date-input/types/DateInput2/v1, legacy theme, avoid). Even `exports/b` still points to v1.
- Figma: none by this name; the Figma "Date Input" page applies to `DateInput`.
- Docs status: deprecated. No more updates; replaced by `DateInput` (11.7, same API, new theming).
- Differences: skipped (no separate Figma page). Code difference from DateInput v2: `screenReaderLabels.datePickerDialog` and `selectedLabel` are optional here but required in DateInput.
- Use: do not use. Build with `DateInput` from the 11.7 (v2) export. Migrating needs no prop changes (add the two now-required `screenReaderLabels` keys if missing).

### DateTimeInput
- Package 11.7.8: v2 (ui-date-time-input/types/DateTimeInput/v2). v1 also present; v1 uses `prevMonthLabel` and `nextMonthLabel` instead of `screenReaderLabels`, has no `withYearPicker`, and `dateFormat` is a string only.
- Figma: has a page summary, "Date-Time Input (18262:6438)".
- Docs status: current, no deprecation note. Composition of DateInput and TimeSelect; props prefixed `date` and `time` go to those parts.
- Differences: Figma `layout` columns | stacked, "columns by default"; code adds 'inline' and defaults to 'inline', so set `layout="columns"` explicitly. Figma `isDisabled` maps to `interaction` (also allows 'readonly'). Figma `validation` none/error/success maps to `messages` plus required `invalidDateTimeMessage` and optional `disabledDateTimeMessage`. Figma `showGroupLabel` maps to required `description` (wrap in ScreenReaderContent to hide it). Code-only: `timeStep` (5 | 10 | 15 | 20 | 30 | 60, default 30), `timeFormat`, `allowNonStepInput`, `initialTimeForNewDate`, `withYearPicker`, `showMessages` (default true), `messageFormat`, `rowSpacing`, `colSpacing`, `reset`, `locale`, `timezone`, `disabledDates`. Figma "default date to today, time empty": `value` and `defaultValue` are ISO 8601 date-time strings; a date-only default is not stated in the docs.
- Use: design from the Figma Date-Time Input page; build with `DateTimeInput` (v2). Required: `description`, `dateRenderLabel`, `timeRenderLabel`, `screenReaderLabels` (five keys), `invalidDateTimeMessage`. `onChange(event, isoValue?)` gives undefined when invalid.

### DeterministicIdContextProvider
- Package 11.7.8: in ui-react-utils (types/DeterministicIdContext/DeterministicIdContextProvider.d.ts), no v1/v2 split, non-visual.
- Figma: none.
- Docs status: current component; its only prop `instanceCounterMap` is deprecated ("DO NOT USE", the component manages it internally).
- Differences: skipped (no Figma page).
- Use: no design work. Build by wrapping the app (or a module federation or SSR boundary) in `<DeterministicIdContextProvider>` with no props, so generated ids are stable. Docs point to InstUISettingsProvider for details. Import from '@instructure/ui-react-utils' (no version path).

### Dialog
- Package 11.7.8: in package (ui-dialog/types/Dialog/props.d.ts), single unversioned folder, headless with no theme, so no Dark issue.
- Figma: none (Tray page 9531:244 exists but has no guidelines; there is no Modal or Popover page in the summaries).
- Docs status: current utility. Docs say Popover, Modal and Tray use it for keyboard accessibility.
- Differences: skipped (no Figma page). Docs show `shouldContainFocus`, `shouldReturnFocus` and similar props with blank types; the d.ts types `shouldContainFocus` as boolean or an array of 'keyboard' | 'screenreader'.
- Use: do not design with it; use Modal, Tray or Popover. Use `Dialog` only for a custom overlay (with Portal and Mask). Props: `open`, `label` (also sets role="dialog"), `shouldContainFocus` (default false), `shouldReturnFocus` (default false), `shouldFocusOnOpen` (true), `shouldCloseOnDocumentClick` (true), `shouldCloseOnEscape` (true), `defaultFocusElement`, `liveRegion`, `contentElement`, `onDismiss`, `as`, `display`. Docs a11y: start with a heading, support Esc, click away and a close button.

### DrawerLayout
- Package 11.7.8: v2 (ui-drawer-layout/types/DrawerLayout/v2, with DrawerContent and DrawerTray). v1 also present.
- Figma: none (the Tray page 9531:244 is a different component: size xsmall to large, placement start/end/top/bottom, border, dropShadow; no guidelines).
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: build with `DrawerLayout` containing exactly one `DrawerLayout.Content` (required `label`) and one `DrawerLayout.Tray` (required `label`). Layout props: `minWidth` (default '30rem', below it the tray overlays), `onOverlayTrayChange`. Tray props: `placement` ('start' default | 'end' only), `open`, `border` (true), `shadow` (true), `onDismiss`, `shouldContainFocus` (true), `shouldReturnFocus` (true), `mountNode`, transition callbacks. No size or top/bottom placement. Show a Mask yourself when the tray overlays.

### Drilldown
- Package 11.7.8: v2 (ui-drilldown/types/Drilldown/v2; Group, Option, Page and Separator also v2). v1 also present. v1 vs v2 prop names are the same (theming change only).
- Figma: has a page summary, "Drilldown (15052:3131)".
- Docs status: current, no deprecation note.
- Differences: Figma `placement` has 12 positions and "topCenter default"; docs default is 'bottom center', so set `placement` explicitly. Figma "arrow visibility" is `withArrow` (default true, only with `trigger`). Figma first page vs sub-page is `rootPageId` and `subPageId`. Figma says each Page needs a `renderTitle`; code marks it optional. Back option stays enabled in both. Code-only (not in the Figma summary): Option `description`, `renderBeforeLabel`, `renderAfterLabel`, `renderLabelInfo`, `href`, `value`; Group `selectableType` ('single' | 'multiple'), `renderGroupTitle`, `withoutSeparators`; Page `renderActionLabel`, `onHeaderActionClicked`, `renderBackButtonLabel`, `withoutHeaderSeparator`.
- Use: design from the Figma Drilldown page; build with `Drilldown` (v2). Needs `rootPageId` and Pages with unique `id`; children only Option, Group, Separator. With `trigger` it renders in a Popover; set `shouldHideOnSelect={false}` for multi-select, and set `width` and `maxHeight`.

### Editable
- Package 11.7.8: v1 folder only (ui-editable/types/Editable/v1); both exports map to it. Headless, no style or theme types, so no Dark issue. A ready-made layout, InPlaceEdit, exists in the same package (v1 and v2).
- Figma: none.
- Docs status: current. Docs send readers to InPlaceEdit for the standard layout and examples.
- Differences: skipped (no Figma page).
- Use: build with `InPlaceEdit` when possible. Use `Editable` only for a custom look. Required: `mode` ('view' | 'edit'), `onChangeMode`. Others: `render` or `children` (gets `mode`, `getContainerProps`, `getViewerProps`, `getEditorProps`, `getEditButtonProps`), `value`, `onChange`, `readOnly`, `elementRef`. You provide the view, editor and edit button.

### Expandable
- Package 11.7.8: v1 folder only (ui-expandable/types/Expandable/v1); only an `a` export. Headless, no style or theme types, so no Dark issue.
- Figma: none by this name. The visual comes from "Toggle Details / accordion (13490:801)", since docs say Expandable powers ToggleDetails and ToggleGroup.
- Docs status: current.
- Differences: skipped (no Figma page for Expandable itself). Typing note: the d.ts marks `defaultExpanded` as required; docs list it as optional (default false).
- Use: design from the Figma Toggle Details page; build with ToggleDetails or ToggleGroup. Use `Expandable` only for a custom disclosure. Props: `expanded` (controlled, needs `onToggle`), `defaultExpanded`, `onToggle(event, expanded)`, `children` or `render` (gets `expanded`, `getToggleProps`, `getDetailsProps`; spread both for correct ARIA).

### FileDrop
- Package 11.7.8: v2 (ui-file-drop, FileDrop/v2; v1 also ships). v2 props equal v1 apart from the theme type.
- Figma: has a page summary, "File Drop (11608:654)".
- Docs status: current.
- Differences: Figma `state` = base, hover, disabled, rejected, accepted. Code has only `interaction` = 'enabled' | 'disabled' | 'readonly'. Hover is not a prop. Accepted and rejected come from the drag: `isDragAccepted` / `isDragRejected` are arguments passed into `renderLabel` (the docs call them props). An error entry in `messages` turns the border to the rejected color. Code has things Figma doesn't mention: `maxSize`, `minSize`, `shouldEnablePreview`, `shouldAllowRepeats`, `display`, `width`, `height`, `maxWidth`, `minWidth`, `inputRef`, `onDrop`, `onDragEnter`, `onDragOver`, `onDragLeave`. Figma's "about 6rem tall" has no prop; use `height`.
- Use: Design from the Figma File Drop page. Build with `FileDrop` with `renderLabel` (required), `accept`, `shouldAllowMultiple`, `messages`, `onDropAccepted`, `onDropRejected`, `interaction`. Show the uploaded file list outside the component. Drag feedback works only in Chrome and Firefox.

### Flex
- Package 11.7.8: v2 (ui-flex; Flex/v2 and Flex/v2/Item). v2 props equal v1 apart from the theme type.
- Figma: none.
- Docs status: current.
- Use: No Figma page; it is a code layout helper. Use spacing token names such as `general.spaceMd` in `gap`, `padding`, `margin`. Build with `Flex` (`direction`, `wrap`, `gap`, `alignItems`, `justifyItems`, `padding`, `margin`, `withVisualDebug`) and `Flex.Item` (`shouldGrow`, `shouldShrink`, `size`, `align`, `order`, `overflowX`, `overflowY`). Docs say to prefer stacked `View display="block"` over `direction="column"` unless the height is fixed, and to add Flex.Item padding so focus rings are not clipped (column items get `overflowY: auto`).

### Focusable
- Package 11.7.8: present but unversioned (ui-focusable, types/Focusable/props.d.ts, no v1 or v2 folder). Behavior only, no visuals, so theme is not an issue.
- Figma: none.
- Docs status: current. Import path in the docs has no version suffix (`@instructure/ui-focusable`).
- Use: Build with `Focusable` and a render function (`children` or `render`) that gets `focused`, `focusVisible`, `focusable`, `attachRef`. The content must hold exactly one focusable element. Docs example: a skip-to-content link that appears on focus. It draws nothing itself.

### FormField
- Package 11.7.8: v2 (ui-form-field, FormField/v2; also FormFieldLayout, FormFieldMessage, FormFieldMessages in v2). v2 adds `labelId`, `isRequired`, `disabled`, `readOnly` over v1.
- Figma: none.
- Docs status: current, but a helper ("in most cases it shouldn't be used directly"). Docs describe `children` as a function receiving `{ describedBy }` for `aria-describedby`; the installed 11.7.8 types only accept `React.ReactNode` and contain no `describedBy`, so that looks new in 11.7.9.
- Use: No Figma page. Prefer the real inputs (TextInput, Select, etc.). For a custom control build with `FormField` (`id` and `label` required, `messages`, `layout` 'stacked' | 'inline', `labelAlign`, `vAlign`, `width`, `isRequired`). Message types: 'newError' | 'error' | 'hint' | 'success' | 'screenreader-only'. On 11.7.8, wire `aria-describedby` yourself via `messagesId`.

### FormFieldGroup
- Package 11.7.8: v2 (ui-form-field, FormFieldGroup/v2). v2 adds `readOnly` and `margin` over v1.
- Figma: none (Checkbox Group and Radio Group pages exist but are separate components).
- Docs status: current. Same 11.7.9-only note as FormField: function `children` with `{ describedBy }` is documented but not in the 11.7.8 types.
- Use: No Figma page. Build with `FormFieldGroup` (`description` required, `layout` 'stacked' | 'columns' | 'inline', `rowSpacing`, `colSpacing` 'none' | 'small' | 'medium' | 'large', `vAlign`, `startAt`, `messages`, `disabled`, `readOnly`, `margin`). Renders a fieldset. Docs rule: when any child is required, add the text "Fields marked with an asterisk (*) are required." Avoid placeholder text.

### Grid
- Package 11.7.8: v2 (ui-grid; Grid, GridRow, GridCol each have v1 and v2). v2 Grid equals v1 apart from the theme type (v2 has no theme).
- Figma: none.
- Docs status: current.
- Use: No Figma page. Build with `Grid` > `Grid.Row` > `Grid.Col`. 12-column system. Grid props: `colSpacing`, `rowSpacing`, `hAlign`, `vAlign` ('top' | 'middle' | 'bottom' | 'stretch'), `startAt` ('small' | 'medium' | 'large' | 'x-large' | null), `visualDebug`. Grid.Col: `width` (number, 'auto', or per breakpoint small/medium/large/xLarge), `offset`, `textAlign`. `startAt` overrides column widths below that breakpoint. Flex is simpler for one-row layouts.

### Heading
- Package 11.7.8: v2 (ui-heading, Heading/v2). v2 changes `color` (drops 'ai', adds 'primary-on' and 'secondary-on').
- Figma: has a page summary, "Heading (9871:951)".
- Docs status: current. Deprecated behavior: a `variant` that silently sets the DOM level. Docs say always pass `level`; `as` is ignored when `variant` is set. One h1 per page, no skipped levels.
- Differences: `variant` = titlePageDesktop, titlePageMobile, titleSection, titleCardSection, titleModule, titleCardLarge, titleCardRegular, titleCardMini, label match. Code adds `labelInline`, Figma doesn't list it. Colors: Figma base, muted, baseOnColor, mutedOnColor, inverseColor; code 'primary', 'secondary', 'primary-on', 'secondary-on', 'primary-inverse', 'secondary-inverse', 'inherit' (name mapping is by meaning; Figma has one inverse, code has two). `aiVariant`: Figma "ignite inline" and "ignite stacked"; code 'stacked' | 'horizontal' | 'iconOnly'. Figma has no iconOnly look.
- Use: Design from the Figma Heading page. Build with `Heading` `variant` for style plus an explicit `level`, `color`, `renderIcon`, `border` ('top' | 'bottom' | 'none'), `aiVariant` only on AI surfaces. Use TruncateText for one-line truncation.

### IconButton
- Package 11.7.8: v2 (ui-buttons, IconButton/v2). v2 adds sizes 'condensedSmall' and 'condensedMedium' over v1's small, medium, large.
- Figma: none (no Button page in the summaries).
- Docs status: current.
- Use: No Figma page. Build with `IconButton` (`screenReaderLabel` required, `renderIcon` or children, `size`, `color` 'primary' | 'primary-inverse' | 'secondary' | 'success' | 'danger' | 'ai-primary' | 'ai-secondary', `shape` 'rectangle' | 'circle', `withBackground`, `withBorder`, `interaction`, `href`, `focusColor`). Condensed sizes are for inside inputs (for example a TextInput show-password button). Pair with Tooltip when the icon alone isn't clear. Don't set the icon size inside it.

### Img
- Package 11.7.8: v2 (ui-img, Img/v2). v2 equals v1 apart from the theme type.
- Figma: none.
- Docs status: current.
- Use: No Figma page. Build with `Img` (`src` required, `alt` default '', `display` 'inline-block' | 'block', `loading`, `constrain` 'cover' | 'contain', `overlay` {color, opacity 0 to 10, blend}, `withGrayscale`, `withBlur`, `width`, `height`, `margin`). Docs a11y: informative images need `alt`; decorative images use alt="". Blur and grayscale are presentational only.

### InlineList
- Package 11.7.8: v2 (ui-list, InlineList/v2 and InlineListItem/v2). v2 differs from v1 only in the item's theme type.
- Figma: none.
- Docs status: current.
- Use: No Figma page. Build with `InlineList` (`as` 'ul' | 'ol', `size` 'small' | 'medium' | 'large', `delimiter` 'none' | 'pipe' | 'slash' | 'arrow', `itemSpacing` 'none' | 'xxx-small' to 'xx-large', `margin`) and `InlineList.Item`. Only Items as children. `itemSpacing` is ignored when a delimiter is set. `itemSpacing` still uses the old size names, not the `general.space*` tokens used by `margin`.

### InlineSVG
- Package 11.7.8: unversioned legacy code (ui-svg-images, types/InlineSVG, no v1 or v2 folder). It still uses the old `withStyle` and a theme.ts built from `colors.contrasts`, so the `color` options ('primary', 'brand', 'error' and so on) are legacy tokens. Not checked whether they resolve in the new Dark theme; default `color="inherit"` avoids the question.
- Figma: none.
- Docs status: current. `allowUseElement` is in the 11.7.8 types too, so not 11.7.9-only. Import has no version suffix.
- Use: Build with `InlineSVG` (`src` or children, `title`, `description`, `width`, `height` default '1em', `inline`, `focusable`, `color`, `allowUseElement` for same-document `<use>` references). The docs say to use SVGIcon for square icons.

### InPlaceEdit
- Package 11.7.8: v2 (ui-editable, InPlaceEdit/v2). v2 props are identical to v1; v2 uses the new-theme IconButton, Flex and View inside. The `Editable` helper stays v1 only (behavior only).
- Figma: none.
- Docs status: current.
- Use: No Figma page. Build with `InPlaceEdit` (`renderViewer`, `renderEditor`, `renderEditButton`, `mode` 'view' | 'edit', `onChangeMode` all required; `value`, `onChange`, `readOnly`, `editButtonPlacement` 'start' | 'end', `inline`, `showFocusRing`). Controlled: the app owns `mode` and `value`. Use `InPlaceEdit.renderDefaultEditButton(props)` with a `label`. For matching styles, edit `Text` or `Heading` via `as="input"`.

### InstUISettingsProvider
- Package 11.7.8: present, unversioned, in `@instructure/emotion` (types/InstUISettingsProvider). Not a visual component.
- Figma: none (Theming page 8110:35817 was too large to read, so there is no summary).
- Docs status: current. `theme` overrides only work for legacy (11.6 and earlier) themes; for new themes use `themeOverride`. `instanceCounterMap` is deprecated. The docs props table leaves out `dir` ('ltr' | 'rtl'), but the types and the text both have it.
- Use: Wrap the app once; nest to scope a theme or direction. Build with `theme`, `themeOverride` (primitives, semantics, components, sharedTokens), `dir`. The Link docs also show a per-component `themeOverride` prop.

### Link
- Package 11.7.8: v2 (ui-link, Link/v2). v2 changes `variant` to 'inline' | 'standalone' (v1 had 'inline-small' and 'standalone-small') and adds `size`; drops v1 `isWithinText`.
- Figma: none (no Link page). Breadcrumb and Card summaries mention Link use only.
- Docs status: current. Matches v2. Anything using `variant="inline-small"` or `isWithinText` is v1 legacy.
- Use: No Figma page. Build with `Link` (`href`, `variant` 'inline' for text, 'standalone' otherwise, `size` 'small' | 'medium' | 'large', `color` 'link' | 'link-inverse' on dark backgrounds, `renderIcon`, `iconPlacement`, `display`, `interaction`, `margin`). No `href` and no `onClick` renders plain text. Link text names the destination. Top and bottom margin don't work (inline).

### List
- Package 11.7.8: v2 (ui-list, List/v2 and ListItem/v2). v2 differs from v1 only in the theme type.
- Figma: none.
- Docs status: current. Docs point to InlineList for horizontal lists.
- Use: No Figma page. Build with `List` (`as` 'ul' | 'ol', `delimiter` 'none' | 'dashed' | 'solid', `isUnstyled`, `size`, `itemSpacing`, `margin`) and `List.Item`. Only Items as children; `itemSpacing` is ignored when a delimiter is set. Docs example text for `itemSpacing="small"` says "xx-small" (docs typo).

### Mask
- Package 11.7.8: v2 (ui-overlays, Mask/v2). v2 differs from v1 only in the theme type.
- Figma: none.
- Docs status: current.
- Use: No Figma page. Build with `Mask` (`placement` 'top' | 'center' | 'bottom' | 'stretch', `fullscreen`, `onClick`, children). It covers the closest positioned parent; for full screen render it inside a `Portal` with `fullscreen`.

### Menu
- Package 11.7.8: v2 (ui-menu; Menu, MenuItem, MenuItemGroup, MenuItemSeparator, each v2). v2 differs from v1 only in theme types (MenuItem state adds hover and focus flags).
- Figma: none. Drilldown and Tabs summaries mention Menu only as an alternative (flat lists, more than 8 sections).
- Docs status: current. Guidance: not for navigation, not a form input, no more than two nested levels, only Menu.Item, Menu.Group, Menu.Separator or Menu as children (use Popover for richer content).
- Use: No Figma page. Build with `Menu` (`trigger`, `placement`, `label`, `show` / `defaultShow`, `onSelect`, `onToggle`, `shouldHideOnSelect`, `maxHeight`, `withArrow`, `mountNode`, `constrain`). `Menu.Item` `type` 'button' | 'checkbox' | 'radio' | 'flyout', plus `href`, `target`, `value`, `renderLabelInfo`. `Menu.Group` has `allowMultiple` and `selected`. Docs tension: Menu.Item takes `href`, yet Menu is not for navigation.

### Metric
- Package 11.7.8: v2 (ui-metric, Metric/v2; MetricGroup also there). v2 makes all props optional and drops the old `withStyle` props type for a new-theme override.
- Figma: has a page summary, "Metric (2380:947)".
- Docs status: current. Docs oddity: the default alignment is said to be center, but the examples look swapped (the one with `textAlign="start"` sits under the default-is-center text, the one with no prop sits under the "align start" text), and the props table shows no default.
- Differences: Figma `textAlign` = start, center, end, same as code. Figma has no guideline text, so the code props `renderLabel`, `renderValue`, `isGroupChild` are not covered there.
- Use: Design from the Figma Metric page. Build with `Metric` (`renderLabel`, `renderValue`, `textAlign`, `isGroupChild` when inside MetricGroup). Other Figma pages say to use Metric for a static number or score (not ProgressBar or ProgressCircle).

### MetricGroup
- Package 11.7.8: v2 (ui-metric, MetricGroup/v2, with Metric/v2).
- Figma: none for MetricGroup. The "Metric (2380:947)" page covers one Metric only (textAlign = start, center, end; no guideline text).
- Docs status: current. Only prop is `children` (Metric items), shown in rows.
- Differences: Figma Metric textAlign matches Metric v2 `textAlign` ('start' | 'center' | 'end'). Figma has no group layout; code Metric also has `isGroupChild`.
- Use: design one metric from the Figma Metric page; build rows with `<MetricGroup><Metric renderLabel renderValue /></MetricGroup>`. The grouped layout has no Figma spec (gap).

### Modal
- Package 11.7.8: v2 (ui-modal; Modal plus ModalHeader, ModalBody, ModalFooter, all v2).
- Figma: none. Only mentions: AI components page (Nutrition Facts and Data Permission Levels are modals), Alert ("when the user must respond first, use Modal"), Drilldown ("rich content: Modal"), File Drop ("pair with Modal").
- Docs status: current. Guidelines: header starts with a heading (usually h2); allow close via x, ESC and click-away; primary button far right in the footer; `variant="inverse"` for media only.
- Use: no Figma spec, design from docs. Build `<Modal open label onDismiss size variant constrain overflow>` (`label` and `children` required; `size` 'auto' | 'small' | 'medium' | 'large' | 'fullscreen'; `variant` 'default' | 'inverse'; `overflow` 'scroll' | 'fit').
- Small screens: `size="fullscreen"` with `spacing="compact"` on Modal.Header and Modal.Footer (Header, Body and Footer all have `spacing` 'default' | 'compact').

### NumberInput
- Package 11.7.8: v2 (ui-number-input).
- Figma: none (the Range Input page only says to use NumberInput for precise numbers).
- Docs status: current. Controlled only: you must pass `onChange`; the value it returns is always a string.
- Use: no Figma spec. Build `<NumberInput renderLabel value onChange onIncrement onDecrement showArrows size interaction messages isRequired />`. `size` 'medium' | 'large'; `interaction` enabled, disabled or readonly; `textAlign` 'start' | 'center'; `inputMode`; `renderIcons` for custom arrows.
- Docs rules: label above or left, never right. `allowStringValue` exists but docs say avoid it (screen reader confusion).

### NutritionFacts
- Package 11.7.8: v2 (ui-instructure; same package has AiInformation and DataPermissionLevels, also v2).
- Figma: has a page summary, "AI components (14220:3119)": Nutrition Facts is a modal of AI info, opened from a link in the AI Information popover.
- Docs status: current.
- Differences: code NutritionFacts renders its own trigger (CondensedButton with `triggerText`) and its own Modal (compact header, Close button in the footer), so it is not opened from an AI Information link by default. Figma summary gives no content structure; code data is `data: BlockType[]` ({ blockTitle, segmentData: [{ segmentTitle, description, value, valueDescription? }] }). Code only: `fullscreen` (small viewports).
- Use: design from the Figma AI components page; build `<NutritionFacts modalLabel title featureName data closeButtonText closeIconButtonScreenReaderLabel triggerText />` (all required except `fullscreen`). Docs example blocks: Model & Data, Privacy & Compliance, Outputs. Linking it from AiInformation is app wiring, not stated in docs.

### Options
- Package 11.7.8: v2 (ui-options; exports Options, OptionItem, OptionSeparator).
- Figma: none (Drilldown (15052:3131) is the closest page, a different component).
- Docs status: current, no deprecation. View-only: holds no state, you set each item's `variant` yourself. Docs say use it only when Select or Menu can't give the customization.
- Use: prefer Select, Menu or Drilldown. If custom: `Options.Item` `variant` 'default' | 'highlighted' | 'selected' | 'disabled' | 'highlighted-disabled' | 'selected-highlighted'; `renderBeforeLabel`, `renderAfterLabel`, `description`, `href`, `isSelected`; nest an `Options` with `renderLabel` for sub menus.
- Set `role` (menu/menuitem or listbox/option) and keyboard handling yourself; a disabled link item also needs `aria-disabled` and a blocked click.

### Overlay
- Package 11.7.8: v1 only (ui-overlays, Overlay/v1; `/v11_7` exports it as v1). Mask in the same package is v2. Overlay has no theme or styles files (index and props only), so it has no visual theme of its own.
- Figma: none.
- Docs status: current, no deprecation. Popover docs add "don't use a Popover with an Overlay".
- Use: behavior only (Portal plus transition plus focus dialog); nothing to design. Build `<Overlay open label transition shouldContainFocus shouldReturnFocus shouldCloseOnEscape onDismiss>` with a `Mask` child for the scrim. `label` is required; `shouldCloseOnEscape` defaults true, `shouldCloseOnDocumentClick` false. For a normal dialog use Modal (v2).

### Pages
- Package 11.7.8: v1 only (ui-pages, Pages/v1 and Pages/Page; `/v11_7` maps to v1). Legacy theme (theme.ts reads legacy `colors.contrasts` for text and background), so avoid and check in Dark.
- Figma: none (Drilldown's "Page" is Drilldown.Page, unrelated).
- Docs status: current, no deprecation notice. Examples still import legacy icons (IconArrowOpenStartLine, IconXLine) instead of the *InstUIIcon names used elsewhere.
- Use: no Figma spec. Props: Pages `activePageIndex`, `defaultPageIndex`, `onPageIndexChange`, `margin`; Pages.Page `defaultFocusElement`, `padding`, `textAlign`, and children may be a function `(history, navigateToPreviousPage)`. Each page needs a focusable element (back button) or focus is lost.
- Gap: no v2, so theme risk in Dark. Workaround for in-place hierarchy: Drilldown (v2 exists, Figma page 15052:3131). Not stated in docs: any other replacement.

### Pagination
- Package 11.7.8: v2 (ui-pagination; PaginationButton, PaginationArrowButton, PaginationPageInput all v2).
- Figma: has a page summary, "Pagination (12460:583)": variants and parts only, no guideline text.
- Docs status: current but "in transition". Prefer the new API (`totalPageNumber`, `currentPage`, `onPageChange`, `siblingCount`, `boundaryCount`). The old API (Pagination.Page children with `current` and `onClick`) still works but may be deprecated.
- Differences: variant compact, full, input matches `variant` 'full' | 'compact' | 'input' (default 'full'). Figma parts map to code: jump-to = `withFirstAndLastButton` with `labelFirst`/`labelLast`; disabled control = `showDisabledButtons`; hidden numbers = `ellipsis`; custom input = variant 'input' (always shows first/last and disabled buttons).
- Code only (not in Figma): `renderPageIndicator`, `disabled`, `screenReaderLabelPageButton`, `screenReaderLabelNumberInput`, `labelNumberInput`, `as`, `margin`.
- Use: design from Figma; build `<Pagination as="nav" variant currentPage totalPageNumber onPageChange labelNext labelPrev />`. Docs: use above 20 items; full variant shows at most 1000 pages.

### Pill
- Package 11.7.8: v2 (ui-pill). v1 had `color` danger and alert; v2 renamed to `error`.
- Figma: has a page summary, "Pill (5570:566)", with use rules (static status; not removable, use Tag).
- Docs status: current, with one DEPRECATED note: do not make Pills with overflowing (ellipsized) text; it is an a11y anti-pattern. Docs don'ts: more than 2 words in text or `statusLabel`; dismissible (use Tag); counts (use Badge); actions next to the text.
- Differences: Figma `color` = neutral, info, warning, success, error, plum, aurora, sky, stone, sea, orange, violet. Code `color` = 'primary' | 'success' | 'info' | 'warning' | 'error' (default 'primary'). No code for plum, aurora, sky, stone, sea, orange, violet; no `neutral` name (neutral to primary mapping not stated).
- Figma `size` = xs, sm, md, lg: no `size` prop in code. Optional icon and label match `renderIcon` and `statusLabel`.
- Use: design from Figma, but only five colors can be built today; the 7 decorative colors and the 4 sizes are gaps. Build `<Pill color statusLabel renderIcon margin>`; no hover or focus states.

### Popover
- Package 11.7.8: v2 (ui-popover).
- Figma: none. Only mentions: choose guide ("interactive or long content: Popover"), Tooltip page ("essential, long or interactive content: Popover"), AI Information is a popover, Drilldown renders in a Popover.
- Docs status: current. Docs don'ts: several Popovers open at once; replacing Tooltip or Menu; using with an Overlay; content on the same row as the close x. Use Tray for content larger than a mobile screen.
- Use: no Figma spec. Build `<Popover renderTrigger on placement withArrow color shadow screenReaderLabel>`: `on` default ['hover','focus'], use "click" for interactive content; controlled via `isShowingContent`, `onShowContent`, `onHideContent`; `color` 'primary' | 'primary-inverse'; `placement` default 'bottom center'.
- For forms or dialogs add `shouldContainFocus` and `shouldReturnFocus` (default true) plus a close button. `shouldScrollContent` handles tall content.

### Portal
- Package 11.7.8: not versioned (ui-portal, Portal, no v1/v2 folders, no theme). Docs import from `@instructure/ui-portal` (no `/v11_7`).
- Figma: none (non-visual).
- Docs status: current.
- Use: nothing to design. Utility to render children into another DOM node: `open`, `mountNode`, `insertAt` ('bottom' | 'top'), `onOpen`, `onClose`, `elementRef`. Modal and Overlay expose the same mount props (`mountNode`, `insertAt`, `onOpen`, `onClose`).

### Position
- Package 11.7.8: not versioned (ui-position, Position). Its theme only sets `zIndex` from `stacking.topmost`; no colors. Import from `@instructure/ui-position`.
- Figma: none (non-visual).
- Docs status: current. Supports RTL via `mirrorHorizontalPlacement` and TextDirectionContext.
- Use: nothing to design. Build `<Position renderTarget placement offsetX offsetY constrain mountNode shouldPositionOverTarget>`; `placement` default 'bottom center'. Figma pages (Tooltip, Drilldown) name 12 placements like topCenter, topStart, bottomEnd; code strings are 'top center', 'top start', 'bottom end'. Code also has bare edges, 'stretch' values, 'center start/end' and 'offscreen'.

### PresentationContent
- Package 11.7.8: not versioned (ui-a11y-content, PresentationContent, no theme). Renders `aria-hidden="true"`. Import from `@instructure/ui-a11y-content`.
- Figma: none (non-visual).
- Docs status: current. Use is discouraged unless there is no alternative (for example data visualizations); VoiceOver "Say-All" can still read it, so always give an accessible version (ScreenReaderContent). Docs list `as` as optional (default 'span'); the types list `as` as required (defaultProps supplies it).
- Use: nothing to design. Wrap visual-only content: `<PresentationContent as elementRef>`.

### ProgressBar
- Package 11.7.8: v2 (ui-progress).
- Figma: has a page summary, "Progress Bar (10541:5968)", with use rules, sizes and a11y.
- Docs status: current.
- Differences: `size` matches (x-small, small, medium, large). Figma `color` primary or inverse = code 'primary' | 'primary-inverse'. Figma says show `percentageText`: no such prop; use `renderValue` (not read aloud, so also set `formatScreenReaderValue`).
- Code only: `meterColor` ('info' | 'warning' | 'danger' | 'alert' | 'success' | 'brand'; default brand, success at 100%), `shouldAnimate`, `renderValueInside`, `valueNow`/`valueMax` (0 and 100). Figma's error state (inline error plus retry) has no code state.
- Use: design from Figma; build `<ProgressBar screenReaderLabel size color valueNow valueMax renderValue formatScreenReaderValue shouldAnimate />` (`screenReaderLabel` required). Completion and error messages are built around it.

### ProgressCircle
- Package 11.7.8: v2 (ui-progress).
- Figma: has a page summary, "Progress Circle (14357:3119)", with use rules and a11y.
- Docs status: current.
- Differences: sizes match; Figma `color` primary or inverse = code 'primary' | 'primary-inverse'. Figma `type` = text or slot and fraction or percentage text: no `type` prop; centre content is `renderValue` (any node) with `formatScreenReaderValue`. Figma indeterminate (Spinner in the slot): code has no indeterminate mode (`valueNow` defaults 0).
- Code only: `meterColor` (same values as ProgressBar), `shouldAnimateOnMount`, `animationDelay`.
- Use: design from Figma; build `<ProgressCircle screenReaderLabel size color valueNow valueMax renderValue />`. For unknown duration, use Spinner (Figma also lists it for plain loading); docs don't show Spinner inside the circle.

### RadioInput
- Package 11.7.8: v2 (ui-radio-input).
- Figma: has a page summary, "Radio Group (12817:2574)", which covers the group and its options.
- Docs status: current.
- Differences: `size` matches (small, medium, large); Figma disabled and read-only = code `disabled` and `readOnly`. Code only: `variant` 'simple' | 'toggle', `context` 'success' | 'warning' | 'danger' | 'off' (toggle background), `inline`. The Figma summary doesn't mention the toggle look.
- Use: design from the Figma Radio Group page. Build as children of RadioInputGroup: `<RadioInput label value />`; don't set `name` yourself. Docs don'ts: a single radio, long labels, more than two inline.

### RadioInputGroup
- Package 11.7.8: v2 (ui-radio-input).
- Figma: has a page summary, "Radio Group (12817:2574)": one choice from about 2 to 7 options (over 7: Select).
- Docs status: current.
- Differences: Figma `isDisabled`, `isReadOnly` = code `disabled`, `readOnly`. Figma `validation` plus `showMessage` = code `messages` (FormMessage[], types 'error' | 'newError' | 'hint' | 'success' | 'screenreader-only'). `layout` (stacked, columns, inline) and `size` match.
- Code only: `variant="toggle"`, `isRequired` (asterisk and aria-required, no native validation), `defaultValue`/`value`. `description` and `name` are required (name must be unique in the DOM; hide the description with ScreenReaderContent). Docs: `layout="inline"` puts the description in its own column at medium width and up; Figma limits inline to toolbars and filter bars.
- Use: design from Figma; build `<RadioInputGroup name description layout size messages isRequired onChange>` with `<RadioInput label value />` children. The toggle look is code-only (no Figma).

### RangeInput
- Package 11.7.8: v2 (ui-range-input; v1 also installed). v2 dropped v1's `thumbVariant` ('deprecated' | 'accessible') and added `margin`.
- Figma: Range Input (11527:5370).
- Docs status: current. Docs list `min` and `max` as optional (default 0); the types mark both required and the default `max` is 0, so always set both.
- Differences:
  - Figma size = small, medium, large with handle states; code `size` only changes the value-label font size (the handle size is a theme token). Figma wants min and max labels; code has none, only `displayValue` (default true) and `formatValue` (also feeds aria-valuetext).
  - Figma says there is no disabled or read-only state (use a read-only TextInput); code has `disabled` and `readOnly`. Code also has `layout` ('stacked' | 'inline') and `inline`, not in Figma.
- Use: Design from the Figma page. Build with `RangeInput` (`label`, `min`, `max`, `step`, `defaultValue` or `value` + `onChange`, `formatValue`); add min/max labels yourself. Single handle only.

### Rating
- Package 11.7.8: v2 (ui-rating; v1 also installed). Prop types identical in v1 and v2.
- Figma: none.
- Docs status: current. Display-only stars (no onChange). Accessibility guideline: show a text value next to the stars (WCAG use of color).
- Use: No Figma page, so follow the docs. Build with `Rating` (`label` required, `valueNow`, `valueMax`, `iconCount` 3 | 5, `size` small | medium | large, `animateFill`, `formatValueText`). Not an input; use another control if users must set a rating.

### Responsive
- Package 11.7.8: ui-responsive has a v1 folder only, but it is a layout utility with no theme or visuals, so v1-only is fine. `/v11_7` import works.
- Figma: none.
- Docs status: current. Warns against many instances on one page (render cost).
- Use: Code-only helper, nothing to design. `Responsive` takes `query` (required; keys minWidth, maxWidth, minHeight, maxHeight), `match` 'element' (default) | 'media', `props`, and `render` or `children` as a function `(props, matches)`; `display` sets the wrapper's display.

### RGBAInput
- Package 11.7.8: v2 exists only as an internal part of ColorMixer (ui-color-picker, ColorMixer/v2/RGBAInput). It is not exported from the package (neither `a` nor `b` entry), so the docs import `@instructure/ui-color-picker/v11_7` does not work for it.
- Figma: none.
- Docs status: current but props-only (no description or examples), and the import line is not valid in 11.7.8.
- Use: don't build from RGBAInput directly. Use ColorMixer or ColorPicker (both v2, exported), which include it. Props if ever needed: `value` (RGBAType) and `onChange`, `width` (number), `withAlpha`, `label`, `disabled`, and four required screen reader labels (`rgbRedInputScreenReaderLabel`, `rgbGreenInputScreenReaderLabel`, `rgbBlueInputScreenReaderLabel`, `rgbAlphaInputScreenReaderLabel`).

### ScreenReaderContent
- Package 11.7.8: ui-a11y-content, unversioned, no theme (visually hidden, so Dark does not matter).
- Figma: none.
- Docs status: current.
- Use: Annotate hidden accessible text in design specs; in code wrap it in `ScreenReaderContent` (`as` default 'span', `children`, `elementRef`). Table `caption` is rendered through it.

### SearchPanel
- Package 11.7.8: internal to SourceCodeEditor (SearchPanel.d.ts in v1 and v2 folders). Not in the public exports of `ui-source-code-editor` (v11_7 exports only `SourceCodeEditor`).
- Figma: none.
- Docs status: props-only page with no description. It lists `view` (CodeMirror `EditorView`) and `searchConfig` { placeholder, nextResultLabel, prevResultLabel }, and shows an import that the installed package does not export.
- Use: Don't import it. Turn it on with the `searchConfig` prop on SourceCodeEditor (Cmd/Ctrl+F; it always opens at the bottom of the editor).

### SegmentedControl
- Package 11.7.8: not in the package. The theme tokens for it exist (`SegmentedControl` in the light, dark and canvas themes), so the custom build reads them.
- Figma: "instUI segmentedControl" (38283:40156). style text, icon, text + icon; size sm, md, lg; isDisabled. Item height 32, 40, 48 inside a 4px padded bar; item radius 12, bar radius 16; selected item has a small shadow.
- Use: `src/SegmentedControl.tsx`. Props: `label`, `options` ({ value, label, icon, screenReaderLabel, disabled }), `value`, `onChange`, `size` (default md), `disabled`. It is a radio group: one tab stop, arrow keys, Home and End.
- Gap: Legacy (canvas) tokens draw it as separate blue buttons with no bar, and have no disabled colors, so Legacy is dimmed when disabled.

### Select
- Package 11.7.8: v2 (ui-select; Select, Select.Option, Select.Group; v1 also installed). v2 has `renderBeforeInputElementGap` ('default' | 'even'), which v1 lacks.
- Figma: none (Figma only says "long or searchable list" and "more than about 7 options" go to Select).
- Docs status: current. Controlled only. Docs say try SimpleSelect first. Always give autocomplete; set `assistiveText`; for multi-select render Tag + AccessibleContent in `renderBeforeInput` with `renderBeforeInputElementGap="even"` and an explicit `aria-label`. iOS VoiceOver and Safari group-plus-autocomplete workarounds are in the docs.
- Use: Build with `Select` (`renderLabel`, `inputValue`, `onInputChange`, `isShowingOptions`, `onRequestShowOptions/HideOptions/HighlightOption/SelectOption`, `size`, `interaction`, `messages`). Option `id` must be globally unique; use `isHighlighted`, `isSelected`, `isDisabled`. No Figma page, so design from the docs.

### Selectable
- Package 11.7.8: ui-selectable, unversioned, no visuals (behavior and ARIA only).
- Figma: none.
- Docs status: current, low-level utility. Docs say to check whether Select can be adapted before composing your own.
- Use: Only for custom combobox widgets. Render-prop with prop getters (`getRootProps`, `getLabelProps`, `getTriggerProps`, `getInputProps`, `getListProps`, `getOptionProps`, `getDisabledOptionProps`, `getDescriptionProps`) plus controlled `highlightedOptionId`, `selectedOptionId`, `isShowingOptions` and `onRequest*` callbacks. Select is built on it.

### SideNavBar
- Package 11.7.8: v2 (ui-side-nav-bar; v1 also installed). Item is `SideNavBar.Item` in code (the docs props table calls it SideNavBarItem).
- Figma: none. The TopNavBar page only mentions a preset Canvas side nav on mobile.
- Docs status: current. Do: top-level nav only, remember institutions can theme it, give an Avatar `showBorder="always"`. Don't: add LTI links to the main area.
- Use: No Figma page. Build with `SideNavBar` (`label`, `toggleLabel` { expandedLabel, minimizedLabel } both required, `minimized` / `defaultMinimized` / `onMinimized`) and `SideNavBar.Item` (`icon`, `label`, `href` or `onClick`, `selected`). Minimized shows icons only, with the label as a tooltip.

### SimpleSelect
- Package 11.7.8: v2 (ui-simple-select; SimpleSelect, .Option, .Group; v1 also installed, props identical).
- Figma: none.
- Docs status: current. The recommended first choice over Select: native-select behavior, no autocomplete.
- Use: Build with `SimpleSelect` (`renderLabel`, `defaultValue` or `value` + `onChange(event, { value, id })`, `size`, `interaction`, `messages`, `renderEmptyOption`). `SimpleSelect.Option` needs unique `id` and `value`; children must be a string. No multi-select or autocomplete: use Select for those.

### Slider
- Package 11.7.8: not a public component. Only `ColorMixer/Slider` exists (v1 and v2 folders in ui-color-picker types) as an internal part of ColorMixer; `ui-color-picker` v11_7 exports ColorPicker, ColorMixer, ColorPreset, ColorContrast, ColorIndicator only.
- Figma: none.
- Docs status: props-only page that shows `import { Slider } from '@instructure/ui-color-picker/v11_7'`, which the installed 11.7.8 does not export (11.7.9 not checked). Required props: `onChange(position)`, `width`, `height`, `value`, `minValue`, `maxValue`, `indicatorRadius`, `navigationExplanationScreenReaderLabel`.
- Use: Don't use for general sliders. Use RangeInput (Figma: Range Input). `Slider` here is only the color-picker hue and alpha control.

### SourceCodeEditor
- Package 11.7.8: v2 (ui-source-code-editor; v1 also installed, props identical). CodeMirror wrapper.
- Figma: none.
- Docs status: current. Prose says `indentUnitCount` but the real prop is `indentUnit`. Uncontrolled (`defaultValue`) is recommended. Accessibility: with `indentWithTab` on, Escape then Tab moves focus; document that for users.
- Use: Build with `SourceCodeEditor` (`label` required, `language` sh | js | json | javascript | jsx | shell | css | html | markdown | yaml | yml | bash, default jsx; `readOnly`, `editable`, `lineNumbers`, `foldGutter`, `lineWrapping`, `attachment` top | bottom, `height`, `width`, `searchConfig`). No Figma page; design from the docs.

### Spinner
- Package 11.7.8: v2 (ui-spinner; v1 also installed). v2 adds variants 'ai' and 'ai-on-color'; v2 drops v1's `as` and `elementRef`.
- Figma: Spinner (38789:136556), partly read: one theme-preview frame only.
- Docs status: current. `renderTitle` is read by screen readers; `delay` (ms) avoids flicker; `ai` variants show the AI icon.
- Differences:
  - Figma sizes 24, 48, 80, 112 px match code x-small, small, medium, large (container 1.5, 3, 5, 7 rem in the v2 light tokens; the ring itself is smaller).
  - Code has `variant` 'default' | 'inverse' | 'ai' | 'ai-on-color', `delay`, `renderTitle`, `margin`; the Figma frame read shows none of them, and no guideline text was read.
- Use: Build with `Spinner` (`renderTitle`, `size`, `variant`, `delay`, `margin`). Figma: Spinner is for loading one region; Progress Circle is for compact or indeterminate progress and Progress Bar for known full-width progress.

### SVGIcon
- Package 11.7.8: ui-svg-images, unversioned (no v1/v2 folders). It still uses the old theme generator; the `color` presets read `colors.contrasts`, and the dark theme reuses the same canvas palette, so `color` does not adapt in Dark (inferred from the source, not run). Leaving `color` unset inherits the parent text color.
- Figma: none for SVGIcon. The Figma "Icons" page (2106:6124) covers the icon set (sizes xs to 2xl, Lucide names); related, not a component page.
- Docs status: current. Role is `presentation` unless `title` is set (then `img`); `description` adds a description. `allowUseElement` is already in the installed InlineSVG props.
- Use: For custom or one-off SVGs. Build with `SVGIcon` (`src` or children with `viewBox`, `size` x-small to x-large = 1.125, 2, 3, 5, 10 rem, `rotate`, `bidirectional`, `title`). For standard icons use the InstUI icon components instead.

### Table
- Package 11.7.8: v2 (ui-table: Table, Head, Body, Row, ColHeader, RowHeader, Cell; v1 also installed). v2 `caption` must be a function `(sortByHeader, sortDirection) => string`; v1 also accepted a ReactNode.
- Figma: Table (17819:940), no guideline text.
- Docs status: current. Guidelines: sortable column headers; CondensedButton and small inputs in cells; row-only actions; start-align text, dates and currency, end-align quantities and decimals; no zebra stripes, no bottom align, not for page layout.
- Differences:
  - Figma showSelection, columnAmount 2 to 8 and cell types (text, slot, rowHeader, checkbox, button) have no code props; build selection and checkbox or button cells yourself (docs add an aria-label to the select-all `Table.ColHeader`). Figma sort order base | ascending | descending = `sortDirection` 'none' | 'ascending' | 'descending'. Figma hover = `hover` on Table (`setHoverStateTo` on Row).
  - Code-only: `layout` 'auto' | 'fixed' | 'stacked', `textAlign` start | center | end, ColHeader `width`, `minWidth`, `renderSortLabel`, `stackedSortByLabel`.
- Use: Design from Figma, add alignment and a stacked small-screen layout from the docs. Build with Table + Head/Body/Row/ColHeader/RowHeader/Cell, `caption` required, `layout="stacked"` plus `Responsive` for narrow widths.

### Tabs
- Package 11.7.8: v2 (ui-tabs: Tabs, Tabs.Panel, Tabs.Tab; v1 also installed, props identical).
- Figma: Tabs (13100:9684).
- Docs status: current. Use `tabIndex={0}` on text-only panels, leave unset on panels with controls.
- Differences:
  - Figma primaryTab and secondaryTab = code `variant` 'default' | 'secondary'. Conflicts: Figma allows 2 to 8 tabs, labels of 1 to 3 words, and says primary always wraps secondary; docs say no more than 5 tabs, no more than 20 characters (one word preferred), do not nest tabbed content in a tab, no icons or pills in tabs.
  - Code-only: `tabOverflow` 'stack' | 'scroll' (docs: not with secondary), `fixHeight`, `maxWidth`, `minHeight`, `maxHeight`, Panel `padding` (default small), `isDisabled`, `unmountOnExit`, `active`.
- Use: Design from Figma, but check the stricter docs limits (5 tabs, no nesting) and resolve the conflict with the team. Build with `Tabs` (`variant`, `onRequestTabChange`) and `Tabs.Panel` (`renderTitle`, `isSelected`).

### Tag
- Package 11.7.8: v2 (ui-tag; v1 also installed). v2 drops v1's `title` and `variant` ('default' | 'inline').
- Figma: Tag (5580:7135), partly read, no guideline text.
- Docs status: current, with a DEPRECATED Max-width section: don't make Tags with overflowing text. No `maxWidth` prop in the table or the installed types. Dismissible tags need AccessibleContent.
- Differences:
  - Figma size sm | md | lg = code `size` 'small' | 'medium' | 'large' (default medium). Figma states base, hover, disabled = `disabled` plus code-only `readOnly`.
  - Figma "can be a link" and instance options for icons and colors: code renders a `button` when `onClick` is set, else a `span`; no `href`, icon or color prop (`text` accepts a ReactNode; `dismissible` adds the X, needs `onClick`).
- Use: Design from Figma. Build with `Tag` (`text`, `size`, `onClick`, `dismissible`, `disabled`). Use Pill for static status. The Figma link option has no code equivalent (gap); ask before designing linked Tags.

### Text
- Package 11.7.8: v2 (ui-text; v1 also installed). v2 color adds 'inherit', 'primary-on', 'secondary-on', drops 'alert'; v2 adds `margin`.
- Figma: Text (7076:4850), shows text styles, not variants.
- Docs status: current, with deprecated legacy values: `size` descriptionPage, descriptionSection, content, contentSmall, legend; `weight` weightRegular, weightImportant; `lineHeight` lineHeight100, lineHeight125, lineHeight150. Use `variant`; when set it ignores size, weight, fontStyle and lineHeight.
- Differences: Figma styles map one to one to `variant`: Description Page = descriptionPage, Description Section = descriptionSection, Content = content, Content Important = contentImportant, Content quote = contentQuote, Content Small = contentSmall, Legend = legend. Figma shows only the most-used colors; code `color` has 12 values incl. 'ai-highlight'. Code-only: `transform`, `letterSpacing`, `wrap`, `as`.
- Use: Pick the Figma style, build with `Text variant=...` and `color`. Use `as="p"` for vertical `margin`. Don't use the deprecated size, weight or lineHeight values.

### TextArea
- Package 11.7.8: v2 (ui-text-area; v1 also installed, props identical).
- Figma: Text Area (3437:9532).
- Docs status: current. Don't: rich text, resizing that breaks the layout, labels on the right, repeating label as placeholder. Extra props go to the native `textarea`.
- Differences:
  - Figma `validation` none | error | success with showMessage = code `messages` with `type` 'error' | 'newError' | 'success' | 'hint' (no validation prop). Figma `resizable` = code `resize` 'none' | 'both' | 'horizontal' | 'vertical'. Figma size small | medium | large matches (code `size` sets font size). Figma `loading`, `filled`, character count: no code equivalent.
  - Code-only: `autoGrow`, `maxHeight`, `height`, `width`, `inline`, `required`, `textareaRef`. States map to `disabled` and `readOnly`.
- Use: Design from Figma. Build with `TextArea` (`label`, `size`, `layout`, `messages`, `resize`, `autoGrow`, `disabled`, `readOnly`, `required`). Add any character counter yourself in a `messages` hint.

### TextInput
- Package 11.7.8: v2 (ui-text-input, import `/v11_7`). v1 also ships (legacy theme).
- Figma: none. The Text Area page (3437:9532) only names TextInput as the single-line alternative. Nine unnamed page ids sit in "Pages not read yet", so a page may exist but is unread.
- Docs status: current. The docs props table omits `layout` ('stacked' | 'inline'), which the v2 types accept through FormField.
- Differences: skipped (no Figma page).
- Use: no Figma spec, so the Text Area page is the nearest sibling reference (not verified for TextInput). Build with `renderLabel`, `size` (small|medium|large), `interaction` (enabled|disabled|readonly), `messages` (types error, hint, success, screenreader-only), `isRequired`, `renderBeforeInput`/`renderAfterInput`, `layout`. v2-only vs v1: `labelId`, `renderBeforeInputElementGap`, `forcePlaceholder`, `forceMessages`.

### TimeSelect
- Package 11.7.8: v2 (ui-time-select, import `/v11_7`). v1 also ships; props identical.
- Figma: none. Date-Time Input (18262:6438) covers time only as half of one combined value.
- Docs status: current. Docs list the `messages` type 'newError' in addition to error, hint, success, screenreader-only.
- Differences: skipped (no Figma page).
- Use: no Figma spec. Build with required `renderLabel`; `step` (5|10|15|20|30|60, default 30), `format` (default 'LT'), `value`/`defaultValue` as ISO strings, `allowNonStepInput`, `allowClearingSelection`, `locale`, `timezone`, `isInline`, `visibleOptionsCount` (default 8). Docs guideline: default to 11:59 pm for due dates. For date plus time use DateTimeInput (Figma page exists).

### ToggleButton
- Package 11.7.8: v2 (in ui-buttons, import `/v11_7`). v1 also ships. v2 adds `margin`.
- Figma: none. The choosing list says instant on/off belongs to Switch (7109:4048), a different component.
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: no Figma spec; design from the docs examples. It is an icon-only two-state button with a built-in tooltip. Required props: `screenReaderLabel`, `renderTooltipContent`, `renderIcon`, `status` ('pressed'|'unpressed'). Optional: `color` (primary|primary-inverse|secondary|success|danger, default secondary), `size` (small|medium|large), `placement`. Use `primary-inverse` on dark backgrounds. Docs: no text inside the button.

### ToggleDetails
- Package 11.7.8: v2 (ui-toggle-details, import `/v11_7`). v1 also ships; props identical.
- Figma: has a page summary, "Toggle Details / accordion (13490:801)".
- Docs status: current. Docs guidelines: use for text longer than a short phrase, never nest.
- Differences: Figma `variant = unfilled (default), filled` vs code `variant` 'default' | 'filled'. Names match for `size`, `iconPosition` (start|end), `fluidWidth`, `expanded` (code also has `defaultExpanded`). Code `size` is documented as the icon size; Figma does not say what size changes. Code-only: `icon`, `iconExpanded` (defaults ChevronRight/ChevronDown), `onToggle`, `summary` accepts any node. Figma builds an accordion by stacking instances; code has no Accordion component.
- Use: design from the Figma page. Build `ToggleDetails` with `summary`, `variant="filled"`, `size`, `iconPosition`, `fluidWidth`, and `expanded` + `onToggle` for controlled use. Stack several for an accordion.

### ToggleGroup
- Package 11.7.8: v2 (in ui-toggle-details, import `/v11_7`). v1 also ships; props identical.
- Figma: none. Nearest is Toggle Details / accordion (13490:801).
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: same job as ToggleDetails, but the summary is separate from the toggle button, with built-in padding and a border. Required: `summary`, `toggleLabel` (screen reader label, string or function of `expanded`), `children`. Optional: `border` (default true; set false to nest), `transition` (default true), `icon`/`iconExpanded`, `size`, `expanded`/`defaultExpanded`/`onToggle`. Gap: the Figma summaries show no bordered layout, so design from the docs examples and the Toggle Details page.

### Tooltip
- Package 11.7.8: v2 (ui-tooltip, import `/v11_7`). v1 also ships; props identical.
- Figma: has a page summary, "Tooltip (7621:17062)".
- Docs status: current. Docs guidelines: stay within 50 characters, no icons, no links or focusable content, not a Popover or Menu substitute.
- Differences: Figma `color = base, onColor` vs code `color` 'primary' (default) | 'primary-inverse'; mapping is not stated. Figma `placement` has 12 positions (topCenter style); code accepts 23 values ('top', 'top start', 'start center', 'bottom stretch', etc., default 'top'). Figma `showArrow` has no Tooltip prop; Popover's `withArrow` (default true) passes through the types but the docs never mention it. Code-only: `on`, `offsetX`/`offsetY`, `preventTooltip`, `isShowingContent`, `positionTarget`.
- Use: design from Figma (onColor on branded or dark surfaces, labels for icon-only buttons). Build `<Tooltip renderTip=... color placement>` around a single focusable child. Verify the arrow behavior before promising showArrow.

### TopNavBar
- Package 11.7.8: v2 (ui-top-nav-bar, import `/v11_7`). Sub-parts: Layout, Brand, Breadcrumb, MenuItems, ActionItems, User, Item. v1 also ships.
- Figma: has a page summary, "TopNavBar (15806:563)": variants only, no guideline text.
- Docs status: current. v1 desktop layout had `hideActionsUserSeparator`; it is gone in v2 and not in the docs.
- Differences: Figma "actions 1 to 5, menu items 1 to 8"; code sets no limit and moves overflow into an "N more" menu (`renderHiddenItemsMenuTriggerLabel` required on MenuItems and ActionItems). Figma user button "avatar, name, or both" = Item `variant` 'avatar' or default/button with `renderAvatar`. Figma "selected or not" = `status` 'active' or `currentPageId`. Figma "menu items or breadcrumb" = `renderBreadcrumb`. Figma "inverse color" and "preset Canvas side nav" are mobile-only; code has `inverseColor` for both layouts and no side-nav preset. Figma brand list (Mastery, Studio, Commons, and others) has no code equivalent; code only takes `Brand` `renderIcon`, `iconBackground`, `screenReaderLabel`. Code-only: Item `variant` 'icon' and 'forceIconWithLabel', `tooltip`, `renderSubmenu` (Drilldown), `customPopoverConfig`, `breakpoint` (default 1024), `smallViewportConfig` (`dropdownMenuToggleButtonLabel` required, `alternativeTitle`).
- Use: design from Figma frames. Build `<TopNavBar>{() => <TopNavBar.Layout navLabel smallViewportConfig renderBrand renderMenuItems renderActionItems renderUser />}</TopNavBar>`. Brand logos and colors are design-only assets passed in as `renderIcon` and `iconBackground`.

### Transition
- Package 11.7.8: unversioned (ui-motion has no v1/v2 folders; import from the package root, not `/v11_7`). Its theme supplies only duration and timing, no colors, so it behaves the same in Light and Dark.
- Figma: none (motion wrapper, not a visual component).
- Docs status: current.
- Differences: skipped (no Figma page).
- Use: build only. `<Transition type in unmountOnExit transitionOnMount>` with `type` fade (default) | scale | slide-up | slide-down | slide-left | slide-right, plus `transitionEnter`, `transitionExit` and onEnter/onEntered/onExit/onExited callbacks. Docs: slide-left and slide-right do not flip for RTL on their own; mirror them with TextDirectionContext.

### Tray
- Package 11.7.8: v2 (ui-tray, import `/v11_7`). v1 also ships; props identical.
- Figma: has a page summary, "Tray (9531:244)": partly read, variants only, no guideline text.
- Docs status: current. Docs guidelines: enter from end on desktop and from bottom on mobile; not over a Modal; not for alerts, confirmations, sub nav or Drawer Layout; close button before the heading; focus contained and returned.
- Differences: Figma `size` xsmall, small, base, medium, large vs code `size` 'x-small' | 'small' | 'regular' | 'medium' | 'large' (default 'small'; width only for start/end). Figma `dropShadow` vs code `shadow` (default true). `border` matches (default false). Figma `placement` start, end, top, bottom; code also has 'center'. Code-only: `label` (required), `enableMask` (default false), `shouldCloseOnDocumentClick` (default false), `shouldContainFocus`, `shouldReturnFocus`, transition callbacks.
- Use: design from Figma variants plus the docs rules. Build `<Tray label open onDismiss placement size border shadow>` with a CloseButton and heading inside.

### TreeBrowser
- Package 11.7.8: v2 (ui-tree-browser, import `/v11_7`). v1 also ships. v2 adds `selection`, `defaultSelection`, `onSelectionChange` and `hoverable` (TreeButton, TreeNode); v1 lacks them.
- Figma: has a page summary, "TreeBrowser (39952:403)".
- Docs status: current.
- Differences: names match (`size` small|medium|large default medium; `variant` folderTree|indent default folderTree; `treeLabel`; keyboard map). Figma row states default, hover, selected, focus map to `selected`, `focused`, `hoverable`. Figma does not mention `descriptor`, `thumbnail`, custom icons (`collectionIcon`, `collectionIconExpanded`, `itemIcon`), `renderBeforeItems`/`renderAfterItems`, `sortOrder`, `showRootCollection`, `animation`, or `selectionType` ('none'|'single'; Figma says "optional selection").
- Use: design from Figma. Build with a normalized `collections` and `items` map, `rootId`, `treeLabel`, `size`, `variant`, and `selectionType="single"` with `selection` + `onSelectionChange` for controlled selection.

### TruncateList
- Package 11.7.8: unversioned (ui-truncate-list has no v1/v2 folders; import from the package root). No theme (`WithStyleProps<null>`) and no color styles, so Light and Dark are not an issue.
- Figma: none.
- Docs status: current. Described as a utility for nav items that overflow.
- Differences: skipped (no Figma page).
- Use: build only. Controlled: `visibleItemsCount` + `onUpdate({ visibleItemsCount })`; `renderHiddenItemMenu(hiddenChildren)` returns the overflow control (docs use Drilldown with a Button); `itemSpacing` (default '0'), `fixMenuTriggerWidth`, `debounce` (default 300). Design the overflow trigger and menu with Drilldown or Menu and Button specs.

### TruncateText
- Package 11.7.8: v2 (ui-truncate-text, import `/v11_7`). v1 also ships; public props identical.
- Figma: none. Related notes: Breadcrumb says truncate the middle; Heading says wrap in a truncating utility instead of shrinking.
- Docs status: current. `shouldTruncateWhenInvisible` is flagged as a hack that will be removed.
- Differences: skipped (no Figma page); the Breadcrumb "truncate the middle" rule maps to `position="middle"`.
- Use: build only. `maxLines` (number | 'auto', default 1), `position` ('end'|'middle'), `truncate` ('character'|'word'), `ellipsis`, `ignore`, `onUpdate(isTruncated, text)`, `debounce`. Docs: show full text in a Tooltip when truncated; avoid inside Buttons, nav items and tabs; avoid inline parents.

### View
- Package 11.7.8: v2 (ui-view, import `/v11_7`). v1 also ships. v2 adds token values: `shadow` also accepts elevation1 to elevation4 (v1: resting, above, topmost, none), `borderColor` accepts strongColor, visualSeparator and the accent* palette, `borderWidth` accepts sm|md|lg. v1's `focusRingBorderRadius` is gone.
- Figma: none (layout primitive). Related: Spacing (16391:860) for gaps between cards; "Using the Library" says always use tokens because hard-coded values break theme switching.
- Docs status: current. v2 types include `dir` ('ltr'|'rtl'), which the docs props table omits.
- Differences: skipped (no Figma page).
- Use: build only, and only for what a component's own props can't do (docs: don't wrap a Button in View just for margin). Key props: `as`, `display`, `background`, `margin`/`padding` with tokens such as `general.spaceMd`, `borderWidth`, `borderColor`, `borderRadius` (xs to full, card.* tokens), `shadow`, `position` with `insetInline*`/`insetBlock*`, `withFocusOutline`, `focusColor`.
