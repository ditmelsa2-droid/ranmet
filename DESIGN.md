# DESIGN.md — RanMet Design System

## Visual World: Neo Kinpaku (漆黒と金箔)
A fusion of ancient Japanese Urushi dark lacquer surfaces with modern precision metallic Kinpaku gold and verdigris patina accents.

### Typography
- **Display & Headlines:** `Syne` / `Cabinet Grotesk` (expressive, sculptural, high character)
- **Body & Controls:** `Instrument Sans` / `General Sans` (sharp, neutral, highly legible)
- **Data & Tabular Metrics:** `JetBrains Mono` with `tabular-nums` (clock, stats, compatibility %)

### Color Palette (OKLCH Precision)
- **Page Ground:** `oklch(6.5% 0.005 95)` (`#0b0a0d`)
- **Deep Inset / Media Void:** `oklch(3.5% 0.003 95)` (`#050507`)
- **Raised Surfaces (Cards, Panels):** `oklch(10.5% 0.006 95)` (`#131117`)
- **Elevated Inset / Control Inputs:** `oklch(8.5% 0.005 95)` (`#0f0d13`)
- **Accent Primary (Kinpaku Gold):** `oklch(84% 0.19 80.46)` (`#f5c042`)
- **Text on Primary:** `oklch(13% 0.015 95)` (`#17120b`) — Dark Ink (AAA contrast)
- **Text Champagne (Headings):** `oklch(95% 0.01 85)` (`#f8f4ec`)
- **Text Muted (Secondary):** `oklch(70% 0.01 85)` (`#ada69d`)
- **Text Faint (Meta):** `oklch(50% 0.01 85)` (`#767069`)
- **Status / Live / Voice:** `oklch(72% 0.12 188)` (`#38bdf8`) & `oklch(75% 0.14 155)` (`#34d399`)
- **Warning / 18+ Lock:** `oklch(65% 0.22 25)` (`#f43f5e`)

### Structural Layout Rules
- **Desktop Theater Split View:**
  - RanVideo uses a 2-column split player on desktop (Video Stage on left, interactive creator & comments panel on right), completely eliminating the awkward centered mobile box.
- **RanNews 3-Column Timeline:**
  - Standard social media layout (Nav Left, Feed Center, Trends/Discover Right).
- **Match Radar Console:**
  - Full-screen interactive radar dashboard with concentric rings, interactive filters, and profile comparison cards.
- **No Side-Tab Borders:** Never use thick single-side stripes on cards or links.
- **Hairline Dividers:** Use 1px subtle hairline rules `oklch(80% 0.01 90 / 0.08)` to `0.12` opacity.
- **Transform-Based Animations:** Scale and opacity only, no layout property animations.
