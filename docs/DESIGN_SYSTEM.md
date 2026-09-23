# Jarz Digital — Design System

Tokens live in [`src/app/globals.css`](../src/app/globals.css) (`@theme`). Tailwind utilities are generated from them (e.g. `bg-brand-500`, `text-mist-600`, `font-display`, `shadow-lift`).

**Direction:** premium technology + creative agency. Dark ink hero surfaces with a restrained teal glow, generous white space, large display typography, and motion used to communicate hierarchy — never decoration for its own sake.

## Color

The brand hue **#00AFB9 (“Jarz Teal”)** is sampled from the original logo. All scales are built around it.

| Token | Hex | Use |
|---|---|---|
| `brand-300` | `#52D4DC` | Accents on dark surfaces, eyebrows on dark |
| `brand-400` | `#1EC1CA` | Primary buttons (ink text on teal — 8:1 contrast) |
| `brand-500` | `#00AFB9` | Logo teal, active states, marks |
| `brand-600` / `700` | `#008D96` / `#05707A` | Teal text on white (700 passes AA) |
| `ink-950` → `ink-500` | `#03060B` → `#2A415E` | Dark surfaces (hero, footer, sidebars) |
| `mist-25` → `mist-900` | `#FBFCFD` → `#151C23` | Cool neutrals: light surfaces, borders, body text |
| `azure-400/500` | `#5C9CFF` / `#2F7BFF` | Only inside gradients paired with teal |
| `success/warning/danger/info` | — | Status (always with a text label) |

**Semantic tokens** (requested in the brief, remapped automatically inside `.theme-dark`):
`--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-background`, `--color-surface`, `--color-surface-raised`, `--color-text`, `--color-muted`, `--color-border`, `--color-ring`.

**Charts** use `#00A0AA` — validated for lightness, chroma and ≥3:1 contrast on white.

Rules: teal is an accent, not a fill for large areas · gradients only teal→azure and only on small elements or glows · text never uses brand-400/500 on white (contrast) · status is never color-only.

## Typography

| Role | Family | Notes |
|---|---|---|
| Display | Space Grotesk (variable) | Headlines, numbers, card titles. Tracking `-0.04em` (`tracking-display`). |
| Body / UI | Geist | Paragraphs, forms, navigation. |
| Mono | Geist Mono | Eyebrows (`.eyebrow`: 0.72rem, uppercase, 0.18em tracking), section indices, code. |

Fluid display sizes: `text-display-lg` (2.75→5.5rem, lh 0.94), `text-display-md` (2.5→4.5rem, lh 0.98), `text-display-sm` (2.25→3.5rem, lh 1.02). Body 1.0625rem/1.8 in long-form (`.prose-jarz`). Headings use `text-wrap: balance`.

## Spacing, layout & grid

- Container: `container-page` — max 1320px, gutters 16 / 24 / 40px.
- 12-column grid on desktop (`lg:grid-cols-12`); sections use 7/5 and 4/8 splits.
- Section rhythm: `py-24 md:py-32` (hero `pt-36 md:pt-44`).
- Breakpoints: Tailwind defaults (`sm 640`, `md 768`, `lg 1024`, `xl 1280`). Mobile layouts are designed, not shrunk (swipe carousels, stacked forms, drawers).

## Radius & elevation

| Token | Value | Use |
|---|---|---|
| `rounded-xl` | 24px | Controls, small cards |
| `rounded-3xl` / `rounded-[28px]` | 24–28px | Cards, images, panels |
| `rounded-full` | — | Buttons, pills |
| `shadow-soft` | subtle | Resting cards |
| `shadow-lift` | deeper | Hover / modals / toasts |
| `shadow-glow` | teal ring | Primary button hover |

## Motion

| Token | Value |
|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` — default easing |
| `--duration-fast / base / slow` | 150 / 250 / 500ms |
| Reveals | 0.8–1.1s, 24–28px travel, staggered 40–90ms |

- Above-the-fold text uses CSS keyframes (`animate-reveal-up`, `animate-fade-up`) so it animates on first paint without JavaScript.
- Below-the-fold reveals, counters, magnetic buttons, parallax and image reveals are Motion components in `src/components/animations`.
- **`prefers-reduced-motion`** is honoured globally (CSS) and in Motion (`MotionConfig reducedMotion="user"`); counters show final values immediately.

## Components

- **Buttons** (`ui/button.tsx`): variants `primary` (teal/ink), `dark`, `light`, `outline`, `outline-light`, `ghost`, `ghost-light`, `danger`, `link`; sizes `sm/md/lg`; optional animated arrow; loading state.
- **Forms** (`ui/form.tsx`): `Field` wires label, help and error ids; 48px inputs, 14px radius, teal focus ring; errors use icon + text.
- **Cards**: 28px radius, 1px `mist-200` border, lift + border-darken on hover.
- **Section header**: mono eyebrow with index → display title → muted description → optional action.
- **Badges**: tone + dot + text (never color alone).
- **Dialog / toast / accordion**: accessible (focus trap, Escape, aria wiring).

## Admin vs. public

The admin deliberately looks like a SaaS tool, not the marketing site: ink sidebar, mist-50 canvas, white cards with 16px radius, compact type, data tables, command palette (Ctrl/⌘K). The client portal sits between the two — it keeps the public brand’s display type and 24px-radius panels.
