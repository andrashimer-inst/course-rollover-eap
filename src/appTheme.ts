import { createContext, useContext } from 'react'
import { canvas, dark, light } from '@instructure/ui/v11_7'

// The three themes the template can show. "legacy" is InstUI's `canvas` theme.
export const THEMES = { legacy: canvas, light, dark }
export type ThemeKey = keyof typeof THEMES

// Lets custom components (wrapper, nav, FigmaAlert) read the active theme's own tokens.
export const AppThemeContext = createContext<ThemeKey>('light')
export const useAppThemeKey = () => useContext(AppThemeContext)

type Shadow = Record<string, { x: string; y: string; blur: string; spread: string; color: string }>
export const shadowCss = (shadow: Shadow) =>
  Object.values(shadow)
    .map((s) => `${s.x} ${s.y} ${s.blur} ${s.spread} ${s.color}`)
    .join(', ')

// Colors, radius and shadows from the theme's own shared tokens (the same ones Figma uses),
// so custom surfaces follow Legacy, Light and Dark without hard-coded values.
export function useSurfaceTokens() {
  const key = useAppThemeKey()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nt = (THEMES[key] as any).newTheme
  const semantic = nt.semantics(nt.primitives)
  const shared = nt.sharedTokens(semantic)
  // The Figma Global Nav tokens. The beta GlobalNav isn't in the package, but its tokens are in the
  // theme (as "SideNavBarNew"). Used by the Light and Dark nav.
  const nav = nt.components.SideNavBarNew(semantic, shared)
  const navItem = nav.item ?? {}
  const navOption = nav.drilldownOption ?? {}
  const space = shared.spacing.general
  return {
    key,
    pageColor: shared.background.pageColor as string, // page background (light grey in Light)
    containerColor: shared.background.containerColor as string, // cards, nav, panels
    inverseColor: shared.background.inverseColor as string, // dark navy bar in Legacy
    onColor: shared.background.onColor as string, // text and icons on dark surfaces
    linkColor: semantic.color.text.info as string,
    fontFamily: semantic.fontFamily.base as string,
    borderColor: shared.stroke.mutedColor as string,
    borderWidth: shared.strokeWidth.sm as string,
    radius: shared.borderRadius.lg as string,
    shadowResting: shadowCss(shared.boxShadow.elevation1),
    shadowRaised: shadowCss(shared.boxShadow.elevation2),

    // Light and Dark wrapper
    textColor: semantic.color.text.base as string,
    mutedTextColor: semantic.color.text.muted as string,
    successTextColor: semantic.color.text.success as string,
    warningTextColor: semantic.color.text.warning as string,
    strokeBase: shared.stroke.baseColor as string,
    aiTopColor: shared.background.aiTopGradientColor as string, // IgniteAI gradient
    aiBottomColor: shared.background.aiBottomGradientColor as string,
    radiusMd: shared.borderRadius.md as string, // 8px
    radiusCardSm: shared.borderRadius.card.sm as string, // 12px
    radiusCardMd: shared.borderRadius.card.md as string, // 16px
    // Spacing tokens (rem). space2xl is the 32px wrapper padding.
    space: {
      xs: space.spaceXs as string, // 4
      sm: space.spaceSm as string, // 8
      md: space.spaceMd as string, // 12
      lg: space.spaceLg as string, // 16
      xl: space.spaceXl as string, // 24
      xxl: space.space2xl as string, // 32
    },
    gapButtons: shared.spacing.gap.buttons as string, // 12
    gapInputs: shared.spacing.gap.inputs.horizontal as string, // 12
    gapCards: shared.spacing.gap.cards.lg as string, // 24 (between wrapper areas)
    paddingCardSm: shared.spacing.padding.card.sm as string, // 8
    paddingCardMd: shared.spacing.padding.card.md as string, // 12
    nav: {
      margin: nav.margin as string, // 12px around the nav card
      minimizedMargin: nav.minimizedMargin as string, // 6px when collapsed
      minimizedBorderRadius: nav.minimizedBorderRadius as string,
      iconWrapperHeight: navItem.iconWrapperHeight as string, // 36px
      itemVerticalPadding: navItem.verticalPadding as string, // 4px
      mainNavMargin: nav.mainNavMargin as string, // 12px inside the main navigation
      mainNavGap: nav.mainNavGap as string, // 8px
      navItemsGap: nav.navItemsGap as string, // 4px
      backgroundColor: nav.backgroundColor as string,
      borderColor: nav.borderColor as string,
      textColor: nav.textColor as string,
      itemHoverBackground: navItem.hoverBackgroundColor as string,
      itemCurrentBackground: navItem.currentBackgroundColor as string, // the page you are on
      itemCurrentText: navItem.currentTextColor as string,
      itemSelectedBackground: navItem.selectedBackgroundColor as string, // sub navigation open
      optionHoverBackground: navOption.hoverBackgroundColor as string,
      optionSelectedBackground: navOption.selectedBackgroundColor as string,
      optionSelectedText: navOption.selectedTextColor as string,
    },
  }
}
