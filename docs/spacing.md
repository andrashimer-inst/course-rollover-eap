# Spacing between components

From the InstUI "Layout Spacing" guide (`docs/instui-site/layout-spacing.md`, source:
https://instructure.design/). Needs InstUI 11.7 or newer; this repo uses 11.7.8. The tokens type-check
and work on `margin` and `padding` props, for example `margin="general.spaceMd"`.

Pick the token by meaning. Some share a value, so use the semantic one for its job (for example
`gap.buttons` between buttons, not `general.spaceMd`).

## Gaps between things

| Between | Token | Pixels |
| --- | --- | --- |
| Page sections | `gap.sections` | 48 |
| Buttons | `gap.buttons` | 12 |
| Small cards | `gap.cards.sm` | 12 |
| Medium cards | `gap.cards.md` | 16 |
| Large cards | `gap.cards.lg` | 24 |
| Nested cards inside a small card | `gap.cards.nestedContainers.sm` | 8 |
| Nested cards inside a medium card | `gap.cards.nestedContainers.md` | 12 |
| Nested cards inside a large card | `gap.cards.nestedContainers.lg` | 16 |
| Inputs side by side | `gap.inputs.horizontal` | 12 |
| Inputs stacked | `gap.inputs.vertical` | 16 |

Mixed card sizes use the gap for the larger card (Figma Spacing guide).

## Padding

| Where | Token | Pixels |
| --- | --- | --- |
| Small card | `padding.card.sm` | 8 |
| Medium card | `padding.card.md` | 12 |
| Large card | `padding.card.lg` | 16 |

## General scale

`general.spaceNone` 0 · `general.space2xs` 2 · `general.spaceXs` 4 · `general.spaceSm` 8 ·
`general.spaceMd` 12 · `general.spaceLg` 16 · `general.spaceXl` 24 · `general.space2xl` 32

## How to use

- `margin` and `padding` props accept tokens and the CSS-style 1 to 4 value shorthand:
  `margin="0 gap.buttons 0 0"`, `padding="padding.card.lg"`.
- `View` ignores layout styles such as `flex` and `gap`, but its `margin` and `padding` props work.
  For flex gaps in plain `div` boxes, use the pixel value from the tables above.
- Don't use the older `space0` to `space60`, `sections`, `buttons` names or the `xxSmall`, `small`,
  `medium`, `large` keywords in new layouts. They only exist so old pages keep working.
