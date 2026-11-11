# Learning FDE Theme Design System

## Design Direction

Learning FDE uses a Warm Editorial + Technical Learning visual language:

- Warm neutral paper surfaces for long reading sessions.
- Terracotta as the primary action and link accent.
- Deep ink for headings and dense technical content.
- Teal, blue, green, amber, and red only for meaningful semantic states.
- Borders, spacing, and typography create hierarchy; gradients, glow, and heavy shadows are avoided.
- Light and Dark share the same semantic token names and component mappings.

The design system is implemented in `docs/.vitepress/theme/styles/custom.css`.

## Token Roles

### Background and Surface

| Token | Light | Dark |
| --- | --- | --- |
| `--lf-bg` | `#F7F6F3` | `#191816` |
| `--lf-bg-soft` | `#EAE6DE` | `#211F1C` |
| `--lf-bg-elv` | `#FFFEFB` | `#292621` |
| `--lf-surface` | `#FFFEFB` | `#211F1C` |
| `--lf-surface-raised` | `#FFFFFF` | `#302C27` |
| `--lf-hover-bg` | `#F1EDE6` | `#302C27` |
| `--lf-selected-bg` | `#F5E5DC` | `#402A22` |

### Text and Borders

| Token | Light | Dark |
| --- | --- | --- |
| `--lf-text` | `#1D2733` | `#F5F2EC` |
| `--lf-text-2` | `#4B5664` | `#C4BDB2` |
| `--lf-text-3` | `#6B6760` | `#9D968B` |
| `--lf-text-disabled` | `#6B6760` | `#AAA59B` |
| `--lf-divider` | `#E6E2DA` | `#403C36` |
| `--lf-border-strong` | `#B8B2A7` | `#5C574F` |
| `--lf-border-control` | `#8A857C` | `#777066` |

`--lf-divider` is for visual separation. `--lf-border-control` is the stronger token required to identify interactive controls and reaches at least 3:1 against page and elevated surfaces.

### Brand and Interactive

| Token | Light | Dark |
| --- | --- | --- |
| `--lf-brand` | `#A94F32` | `#E08B6B` |
| `--lf-brand-hover` | `#8E402A` | `#F0A080` |
| `--lf-brand-strong` | `#7D3824` | `#C76F52` |
| `--lf-brand-soft` | `#F5E5DC` | `#402A22` |
| `--lf-brand-soft-text` | `#8E402A` | `#F0A080` |
| `--lf-on-brand` | `#FFFFFF` | `#191816` |
| `--lf-link` | `#8E402A` | `#F0A080` |
| `--lf-link-hover` | `#6F2F1C` | `#FFC0A3` |
| `--lf-focus` | `#7D3824` | `#F0A080` |

`--lf-brand` is a solid fill. `--lf-link` is a text-safe foreground. Components must not use one role for the other.

### Status

| Token pair | Light | Dark |
| --- | --- | --- |
| Success / soft | `#3F6F4E` / `#E2EFE5` | `#9BB58A` / `#293426` |
| Warning / soft | `#745616` / `#F5EBD2` | `#D8B66E` / `#39301F` |
| Danger / soft | `#A63D32` / `#F7E2DE` | `#E58E82` / `#3D2926` |
| Info / soft | `#2F6383` / `#E0EBF2` | `#8FB8DF` / `#26323D` |
| Teal / soft | `#2C6F69` / `#DDF0EC` | `#7AC8BE` / `#1E3A36` |

Every solid status fill has a paired `--lf-on-*` foreground. Status information must also include text, an icon, a pattern, or another non-color cue.

### Code and Charts

Code blocks use `--lf-code-*` and inline code uses `--lf-inline-code-*`. Charts use:

- `--lf-chart-line`
- `--lf-chart-{core|data|tool|output}-fill`
- `--lf-chart-{core|data|tool|output}-stroke`
- `--lf-mermaid-primary`
- `--lf-mermaid-primary-border`
- `--lf-mermaid-secondary`
- `--lf-mermaid-tertiary`
- `--lf-mermaid-line`
- `--lf-mermaid-text`

## VitePress Mapping

The design system maps VitePress's color contract to Learning FDE roles:

- `--vp-c-brand-1` → `--lf-link`
- `--vp-c-brand-2` → `--lf-brand-hover`
- `--vp-c-brand-3` → `--lf-brand`
- `--vp-c-brand-soft` → `--lf-brand-soft`
- Background, text, divider, default, green, yellow, red, success, warning, danger, custom block, badge, button, input, code, search, and local-search tokens use matching FDE semantic values.

Business components should prefer `--lf-*` tokens. VitePress mappings provide compatibility for built-in theme content.

## Component Mapping

| Component type | Required tokens |
| --- | --- |
| Page background | `--lf-bg` |
| Card / panel | `--lf-bg-elv`, `--lf-divider`, `--lf-shadow-card` |
| Body text | `--lf-text` |
| Secondary text | `--lf-text-2` or verified `--lf-text-3` |
| Primary action | `--lf-brand`, `--lf-brand-hover`, `--lf-on-brand` |
| Secondary action | `--lf-bg-elv`, `--lf-border-control`, `--lf-hover-bg` |
| Dangerous action | `--lf-danger`, `--lf-danger-hover`, `--lf-on-danger` |
| Input | `--lf-bg-elv`, `--lf-border-control`, `--lf-text` |
| Selected option | `--lf-brand-soft`, `--lf-selected-text`, `--lf-brand` |
| Status badge | Tone plus tone-soft pair |
| Focus ring | `--lf-focus` |
| Disabled control | `--lf-disabled-bg`, `--lf-text-disabled`, `--lf-disabled-border` |
| Footer | `--lf-footer-bg`, `--lf-footer-text`, `--lf-footer-link` |

## WCAG Contrast Results

The automated contrast test is `tests/unit/theme-contrast.test.ts`.

| Pair | Light | Dark |
| --- | ---: | ---: |
| Primary text / page | 13.98:1 | 15.88:1 |
| Secondary text / page | 6.90:1 | 9.52:1 |
| Tertiary text / page | 5.20:1 | 6.06:1 |
| Tertiary text / soft surface | 4.52:1 | 5.61:1 |
| On-brand / brand | 5.45:1 | 6.82:1 |
| On-brand / hover | 7.20:1 | 8.49:1 |
| Success / soft | 4.93:1 | 5.81:1 |
| Warning / soft | 5.74:1 | 6.70:1 |
| Danger / soft | 5.06:1 | 5.52:1 |
| Info / soft | 5.36:1 | 6.28:1 |
| Teal / soft | 4.95:1 | 6.32:1 |
| Control border / elevated surface | 3.64:1 | 3.08:1 |
| Focus ring / soft surface | 6.85:1 | 7.86:1 |
| Disabled text / disabled surface | 4.64:1 | 6.07:1 |

Normal-size text targets 4.5:1. Large text, control boundaries, focus indicators, and meaningful non-text graphics target 3:1.

## Development Rules

1. Add new visual meaning through semantic tokens, not component-local hex values.
2. Do not use a solid-fill token as text or a text token as a fill.
3. Do not communicate status only through color; include text, an icon, a shape, or a pattern.
4. Do not use opacity as the only disabled or selected treatment.
5. Keep ordinary cards at 8px radius or less.
6. Use warm neutrals for layout and reserve saturated colors for actions and status.
7. Every new token pair must be added to the contrast test.
8. Every new interactive component must have hover, focus-visible, selected, and disabled states.
9. Mermaid and SVG colors must come from computed theme tokens.
10. Theme changes must preserve localStorage, IndexedDB mirroring, System mode, and cross-tab consistency.
