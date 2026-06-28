---
name: CodeFlow
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c0c1ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: 22px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '450'
    lineHeight: 18px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style
The design system is engineered for high-performance developer environments. It prioritizes focus, clarity, and technical precision. The brand personality is professional, modern, and efficient, avoiding unnecessary decorative elements in favor of functional aesthetics.

The style is **Corporate / Modern** with a lean towards **Technical Minimalism**. It utilizes a dark-mode first approach to reduce eye strain during long coding sessions. The interface relies on subtle tonal shifts and crisp borders rather than heavy shadows to define structure, ensuring the UI remains lightweight and responsive.

## Colors
This design system utilizes a "Deep Slate" foundation to provide a sophisticated, low-fatigue backdrop for development work. 

- **Primary (Electric Blue):** Reserved for high-priority actions, focus states, and progress indicators.
- **Secondary (Emerald Green):** Dedicated to success states, completed tasks, and streak visualizations.
- **Neutral (Slate/Navy):** A range of cool grays used for surfaces, borders, and secondary text to maintain a calm, professional environment.
- **Semantic Colors:** Destructive actions use a muted Coral (#F43F5E), while warnings use an Amber (#F59E0B) to ensure critical information is never missed.

## Typography
The typography strategy separates UI interaction from technical content. 

- **UI Elements:** **Hanken Grotesk** is used for its sharp, contemporary feel and excellent legibility in dark environments. Headlines feature tighter tracking to appear more "engineered."
- **Code & Data:** **JetBrains Mono** is the standard for all code snippets, terminal outputs, and metadata. Its increased x-height and clear character distinction are vital for error reduction.
- **Scalability:** On mobile devices, `headline-xl` should scale down to 30px to prevent excessive wrapping.

## Layout & Spacing
The design system employs a **Fixed Grid** model for the main dashboard and editor views to maximize predictable screen real estate for code.

- **Desktop:** A 12-column grid with a maximum content width of 1440px. Gutters are fixed at 24px to ensure distinct separation between IDE panels.
- **Tablet:** 8-column grid with 16px gutters. Panels usually collapse into a sidebar drawer or bottom sheet.
- **Mobile:** 4-column grid with 16px margins.
- **Spacing Logic:** All spacing is based on a 4px baseline. Components use `sm` (8px) or `md` (16px) internal padding to maintain a dense, professional "pro-tool" density.

## Elevation & Depth
In this dark-themed environment, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines**.

- **Background:** The deepest layer (#020617) acts as the workbench floor.
- **Surfaces:** Panels and cards use #0F172A. 
- **Borders:** Instead of shadows, 1px solid borders (#1E293B) define component boundaries. 
- **Active State:** Elements that are focused or "raised" use a slightly lighter surface (#1E293B) and a subtle 2px glow of the primary color for interactive elements like buttons.
- **Overlays:** Modals use a darker backdrop blur (12px) with a more pronounced border (#334155) to separate them from the editor background.

## Shapes
The shape language is disciplined and consistent. 

- **Standard Radius:** 8px (`rounded-md`) is the default for buttons, cards, and input fields, providing a modern feel without being overly playful.
- **Small Radius:** 4px is used for nested elements like chips and checkboxes.
- **Pill Shapes:** Used exclusively for status indicators (e.g., "Online", "Live") to differentiate them from interactive buttons.

## Components
- **Buttons:** Primary buttons are solid Electric Blue with white text. Secondary buttons use a ghost style (border only) to maintain hierarchy. Use a 200ms transition for hover states.
- **Inputs:** Darker than the surface color, with a 1px border. On focus, the border changes to Primary Blue with a 2px outer ring at 20% opacity.
- **Chips/Tags:** Use the Monospace font (`code-sm`). For language tags, use subtle background tints of the primary color.
- **Cards:** No shadows. Use the surface-to-border contrast to define the container. Header sections within cards should have a subtle bottom border.
- **Code Editor:** The core component. It should use a theme-matched syntax highlighting palette, emphasizing the Emerald Green for strings and Electric Blue for keywords.
- **Status Streaks:** Use the Emerald Green for "active" days in a grid-style contribution graph, similar to GitHub, but with rounded-sm (2px) corners on the individual nodes.
