# Design System - Mainsail CNC Extension

## Color Strategy
**Restrained with functional accents.** Tinted neutrals with orange/red for critical actions and state indicators. Inherits Mainsail's dark theme.

### Palette
- **Background**: `#1e1e1e` (near black with blue tint)
- **Surface**: `#2d2d2d` (elevated cards)
- **Text**: `#e0e0e0` (off-white for legibility)
- **Accent (Orange)**: `#ff6b35` (buttons, active states, warnings)
- **Success (Green)**: `#2ecc71` (homed state, ready)
- **Muted**: `#666666` (disabled, inactive)

## Typography
- **Display**: IBM Plex Mono (monospace for numbers, G-code)
- **Body**: IBM Plex Sans (sans-serif for labels)
- **Scale**: 12px (small), 14px (body), 16px (labels), 18px (headings)

## Spacing & Layout
- **Padding**: 12px, 16px, 24px (vary for rhythm)
- **Gap**: 8px (tight), 12px (medium), 16px (loose)
- **Card border-radius**: 4px (minimal)
- **Button height**: 36px, 40px (vary slightly)

## Components
- **Buttons**: Orange on dark, white text, 4px radius. Disabled: muted gray.
- **Inputs**: Dark border (1px), orange focus ring, monospace for numbers
- **Status chips**: Inline background color (green for homed, orange for standby)
- **Panels**: Card with collapse button, title on top

## Motion
- Transitions: 200ms ease-out-quart for state changes
- Button feedback: instant visual (no delay)
- No animations on layout properties
