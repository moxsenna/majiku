---
name: Bunayo
description: SaaS daycare/preschool/bimbel Indonesia — warm paper-and-ink "Papan Kelas" kit with a cheerful crayon layer on the Parent & Tutor mobile portals
colors:
  # dasar — paper & ink (light scheme is canonical; .dark inverts hues, see Colors)
  kertas: "#FFFCF5"            # --background · page canvas
  surface: "#F7F2E9"           # --surface · mobile app background + themeColor (light)
  card: "#FFFFFF"              # --card
  tinta: "#1D1A2D"             # --foreground · ink text, active nav, mobile primary
  tinta-isi: "#39364F"         # --foreground-2 · body copy on cards
  pensil: "#5D5A6D"            # --muted-foreground · secondary text (6.4:1)
  muted: "#F0EBE0"             # --muted · soft fills, unselected chips
  garis: "#EAE4D7"             # --border · card outlines
  garis-halus: "#F0EBE0"       # --border-subtle · row separators
  input-line: "#8B8579"        # --input · field strokes (3.6:1)
  placeholder: "#8A8698"       # --placeholder
  kanvas: "#EDE6D9"            # --kanvas · desktop canvas
  skeleton: "#ECE7DA"          # --skeleton · .sk loading bars
  disabled: "#CAC7D6"          # --disabled
  # aksi
  biru-bunayo: "#2046C4"       # --primary · the single blue action (7.7:1)
  biru-bunayo-hover: "#1A39A6" # --primary-hover
  biru-bunayo-soft: "#DFE6FA"  # --primary-soft · focus rings, selected rows
  # semantik
  stabilo: "#FFD23D"           # --highlight · one most-important thing per screen
  merah-status: "#C4271C"      # --destructive · status red (not Tomat)
  merah-status-soft: "#FFE5E0" # --destructive-soft
  hijau-success: "#1A7A4A"     # --success
  hijau-tiba: "#1F9E5E"        # --success-ring · "sudah tiba" dot & ring
  warning: "#8A5A00"           # --warning (= Matahari ink)
  info: "#1663A7"              # --info (= Langit ink)
  # krayon — dasar / soft / ink (six crayons, no more)
  tomat: "#FF6B4A"
  tomat-soft: "#FFE7E0"
  tomat-ink: "#B7371A"
  matahari: "#FFC233"
  matahari-soft: "#FFF3D1"
  matahari-ink: "#8A5A00"
  daun: "#33C17A"
  daun-soft: "#DFF6E9"
  daun-ink: "#1A7A4A"
  langit: "#42A5F0"
  langit-soft: "#DDF0FD"
  langit-ink: "#1663A7"
  anggur: "#9C69E8"
  anggur-soft: "#F0E7FD"
  anggur-ink: "#6234B7"
  permen: "#FF80AE"
  permen-soft: "#FFE5EF"
  permen-ink: "#B22E61"
  # brand logo (aksen & ilustrasi saja — never a UI action colour)
  brand-yellow: "#F8B81C"
  brand-green: "#207438"
  brand-leaf: "#64B034"
  # mode gelap — the few tokens that shift character
  dark-background: "#13121C"
  dark-surface: "#0F0E16"      # themeColor dark ships as #100F15
  dark-card: "#1D1B28"
  dark-foreground: "#FBF7EF"
  dark-primary: "#5F81F2"      # dark blue carries Kertas-tinted text (5.2:1)
  dark-success-ring: "#2EB873"
  dark-destructive: "#EC5F55"
typography:
  display-hero:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: "1"
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "-0.025em"
  heading-sub:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.45"
  label:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "1.4"
    letterSpacing: "0.02em"
  numeral-mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 400
    fontFeature: "tabular-nums"
  numeral-mobile:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
rounded:
  xs: "4px"
  input: "8px"
  md: "12px"      # --radius · kit default (panels, desktop buttons)
  inner: "16px"   # nested tiles, textareas, photo thumbs, class tiles
  sheet: "20px"   # --radius-sheet · mobile cards, active tab pill
  hero: "28px"    # crayon field hero cards (cheerful layer)
  full: "999px"   # pills: ink button, chips, tab bar, composer
spacing:
  gutter: "16px"          # page gutters on mobile (px-4)
  section: "16px"         # gap between sections (gap-4, gap-5)
  intra-card: "10px"      # gap-2.5 inside cards
  card-padding: "16px"    # p-4
  card-padding-lg: "20px" # p-5
  panel-padding: "18px"   # px-[18px] desktop panel rhythm
  touch: "44px"           # minimum touch target
  button: "44px"          # --btn-h
  button-sm: "36px"       # --btn-h-sm
  button-lg: "52px"       # --btn-h-lg · mobile primary pill
  input: "44px"           # --input-h
  chip: "32px"            # --chip-h
  tabbar: "68px"          # FloatingTabBar height
components:
  button-primary:
    backgroundColor: "{colors.biru-bunayo}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 18px"
  button-primary-hover:
    backgroundColor: "{colors.biru-bunayo-hover}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    height: "44px"
  ink-pill:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.kertas}"
    rounded: "{rounded.full}"
    height: "52px"
  ink-pill-soft:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.full}"
    height: "44px"
  crayon-field-card:
    backgroundColor: "{colors.matahari}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.hero}"
    padding: "20px"
  mobile-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sheet}"
    padding: "16px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.full}"
    height: "32px"
  chip-active:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.kertas}"
  input:
    backgroundColor: "{colors.kertas}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.input}"
    height: "44px"
  status-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.full}"
    height: "32px"
  kid-avatar:
    backgroundColor: "{colors.langit-soft}"
    textColor: "{colors.langit-ink}"
    rounded: "{rounded.full}"
  tab-item-active:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.kertas}"
    rounded: "{rounded.sheet}"
---

# Design System: Bunayo

## Overview

**Creative North Star: "Papan Kelas Ceria" (The Cheerful Classroom Board)**

Bunayo looks like a well-kept classroom wall: warm paper instead of sterile white, ink instead of pure black, and six crayon colours pinned up by the children's own names. The system is "premium yang ceria" — premium-plain structure (bordered panels, tabular numbers, one action colour) carrying a cheerful layer (whole cards painted in a child's or class's crayon colour, one authored motion vocabulary, a photo-led hero). The foundation is the desktop admin kit ("Arah B — Papan Kelas", exported from `design/_kit/kit.css` into `src/app/globals.css`); the Parent/Tutor portals mount it inside `.app-mobile` and add the cheerful layer as a documented sub-system, without touching the kit tokens themselves.

Every number on screen is real data from the classroom — no invented balances, promos, or testimonials — because parents read this app at pickup time and teachers operate it one-handed mid-class. Warmth comes from colour fields and language, never from decoration: no gradients-as-design, no emoji standing in for icons, no coloured stripes bolted onto list rows. Cheerfulness is structural: the crayon field *is* the card.

**Key Characteristics:**
- Warm paper base (`#FFFCF5`/`#F7F2E9`) with ink text (`#1D1A2D`); dark mode is a hue-faithful inversion, not a separate design.
- One blue action (`#2046C4`) on desktop; on mobile portals the primary action is the Tinta ink pill.
- Six crayons (Tomat, Matahari, Daun, Langit, Anggur, Permen) in three steps each — base / soft / ink — assigned deterministically per child, class, and activity type.
- Bricolage Grotesque display over IBM Plex Sans body; mono numerals on desktop, tabular sans numerals inside `.app-mobile`.
- Line-first depth: 1px borders for cards, three shadow tokens reserved for things that float.
- One motion vocabulary: rise-in entrances, press scale-down, tiba-dot ping — all silenced by `prefers-reduced-motion`.
- PWA polish: per-scheme theme-color, safe-area padding, pill composer, 68px floating tab bar.

## Colors

The palette is a warm paper-and-ink pair with exactly one action blue and six crayons; every crayon carries a soft fill and an ink text step so colour can own a whole card or just a 16px icon. All values below are the light scheme; dark mode keeps every hue and swaps the roles (Tinta becomes the background, Kertas the text, and crayon soft/ink steps invert so fields stay legible at night — parents read kabar after bedtime).

### Primary
- **Biru Bunayo** (#2046C4, hover #1A39A6, soft #DFE6FA): the single primary action colour and focus-ring colour of the desktop kit — one blue button per screen. On the Parent/Tutor mobile portals it retreats to links and selection states; the mobile primary action is the ink pill instead.

### Secondary — the krayon set
Six crayons, each in base / soft / ink. Base fills whole cards (with Tinta text), soft fills avatars, icon tiles, and chips, ink colours icons and status text on paper.
- **Tomat** (#FF6B4A / #FFE7E0 / #B7371A): mealtime crayon — makan rows, unread dots, warning accents on the tab bar.
- **Matahari** (#FFC233 / #FFF3D1 / #8A5A00): the sun crayon — mood, toilet training, "Terlambat" status; also the welcome-field colour when no class colour exists.
- **Daun** (#33C17A / #DFF6E9 / #1A7A4A): growth crayon — attendance success, kegiatan, payment-paid states.
- **Langit** (#42A5F0 / #DDF0FD / #1663A7): the default crayon (`krayonDari(null)`) — photos, catatan guru, izin/sakit status, the KPI score field.
- **Anggur** (#9C69E8 / #F0E7FD / #6234B7): nap time crayon — tidur rows, trial observation tasks.
- **Permen** (#FF80AE / #FFE5EF / #B22E61): the sweet crayon — medication (obat) and momen spesial.

### Tertiary
- **Brand logo colours** (#F8B81C, #207438, #64B034, plus Biru Bunayo itself): from the Bunayo logo; reserved for illustration and brand moments, never UI actions or status semantics.

### Neutral
- **Kertas** (#FFFCF5): page canvas; warm, never pure white — pure white is reserved for cards.
- **Surface** (#F7F2E9): mobile app background under the cards; also the light theme-color.
- **Card** (#FFFFFF): every card, sheet, and pill.
- **Tinta** (#1D1A2D): headings, body emphasis, active nav pills, the mobile primary button.
- **Tinta isi** (#39364F): body copy on cards.
- **Pensil** (#5D5A6D): secondary text, 6.4:1 on Kertas.
- **Muted** (#F0EBE0): soft fills, unselected chips, secondary-button hover.
- **Garis** (#EAE4D7) / **Garis halus** (#F0EBE0): card outlines and row separators — cards get outlines, rows get hairlines.
- **Input line** (#8B8579) / **Placeholder** (#8A8698): field strokes and empty-state text.
- **Kanvas** (#EDE6D9): desktop admin canvas behind panels.
- **Skeleton** (#ECE7DA / light #F4EFE6): per-section loading shapes.

### Status colours
- **Stabilo** (#FFD23D): highlighter marker for the single most important number or phrase per screen (`.hl`).
- **Merah status** (#C4271C, soft #FFE5E0): destructive states — deliberately distinct from Tomat so alarms never look cheerful.
- **Hijau tiba** (#1F9E5E ring / #1A7A4A text): "sudah tiba" — the arrival dot, roster ring, and check-in text.
- **Warning** (#8A5A00 = Matahari ink) / **Info** (#1663A7 = Langit ink): status text reuses the crayon ink steps rather than new hues.

### Named Rules
**The One Ink Pill Rule.** On Parent/Tutor mobile portals there is one primary action per screen and it is the Tinta ink pill (52px tall, fully rounded, press-scale). Biru Bunayo is the desktop primary, never a mobile CTA.

**The Ink-on-Crayon Rule.** Text on a base crayon field is always Tinta (`#1D1A2D`, via `.field-ink`, ≥6:1, both schemes); white text appears only over photos, under the Tinta scrim gradient. Secondary text on crayon fields is Tinta at 72% opacity (`.field-sub`), never grey.

**The Six-Crayon Rule.** Only six crayons exist. Entity colour is derived, not chosen: `krayonDari(id)` hashes the child/class ID, `KRAYON_KEGIATAN` maps activity types — the same child is the same colour on every screen. A new category must map onto an existing crayon, not add a seventh.

**The Stabilo Rule.** Stabilo marks exactly one thing per screen — the number or phrase the user must not miss. A screen with two highlights has none.

## Typography

**Display Font:** Bricolage Grotesque (700/800, via `next/font`, fallback system-ui) — headings and big numerals only.
**Body Font:** IBM Plex Sans (400–700, fallback system-ui) — all UI text.
**Numeral Fonts:** IBM Plex Mono (400/500) for desktop/admin ledger numerals; IBM Plex Sans with `tabular-nums` inside `.app-mobile`.

**Character:** A friendly grotesque over a workmanlike sans — display type carries the cheer (tight, chunky, slightly quirky), body type stays calm and legible at 14–15px so a one-handed teacher never misreads it. The display scale was deliberately reduced from the kit's 34px mockup sizes for real 390px phones.

### Hierarchy
- **Display hero** (800, 30px, lh 1, -0.03em): the child's name on the parent home hero.
- **Display** (700, 26px, lh 1.1, -0.025em): page titles (MobileHeader, greetings, big Rupiah figures on crayon fields).
- **Heading sub** (700, 22px): MobileSubHeader titles on pushed pages; class names take 28px extrabold on their crayon field.
- **Title** (700, 18px, -0.01em): section titles ("Kabar hari ini", "Tugas hari ini"); desktop panel headers use 19px.
- **Body** (400–700, 15px/1.45; base 14px): list titles are 15px semibold, detail lines 13px.
- **Label** (600, 13px, +0.02em, uppercase): iOS-style group titles (`MobileGroupTitle`); inline labels are 13px medium without caps.
- **Numerals**: every time, date, count, and Rupiah figure gets `.tabular`. Desktop/admin renders it in IBM Plex Mono (ledger feel); inside `.app-mobile` the same class renders IBM Plex Sans with `tabular-nums` and -0.01em — the mobile portals keep alignment but drop the bookkeeping look.

### Named Rules
**The Two-Numeral Rule.** `.tabular` is the only numeral treatment, and the scheme switches by context, not per-screen: mono on desktop/admin, tabular sans inside `.app-mobile`. Never hand-pick a font for a number.

**The Reduced-Scale Rule.** Mobile display type tops out at 30px (child name). The kit's 34px stat scale belongs to desktop admin screens only.

## Layout

Mobile-first, designed against a 390px viewport; the Parent and Tutor portals are standalone PWA surfaces with four bottom tabs each. Desktop admin is a separate kit surface (sidebar 232px / rail 76px, 1400px max container) sharing the same tokens.

- **Page rhythm (mobile):** 16px gutters (`px-4`), 16–20px between sections (`gap-4`/`gap-5`), 10px inside cards (`gap-2.5`), card padding 16–20px.
- **Bottom navigation:** FloatingTabBar — fixed, inset 16px (plus `env(safe-area-inset-bottom)`), 68px tall, max 440px wide, fully rounded, `bg-card/90` with backdrop blur; content reserves 110px (`pb-[110px]`).
- **Safe areas:** `.app-mobile` pads the top with `env(safe-area-inset-top)`; tap highlight disabled.
- **Breakpoints:** base 390px target; rows and stacked panels wrap below 560px (`max-[560px]`, the desktop content max for row text); stat cards go 2×2 below 1000px; container caps at 1400px (2xl).
- **Density:** touch targets ≥44px (`--touch`), rows ≥52px on desktop panels, ≥56px tab targets, list rows 56–64px on mobile.
- **Scroll behaviour:** horizontal snap carousels for photos (42% width tiles), sticky primary action 86px above the bottom (just over the tab bar).

## Elevation & Depth

Line-first. Cards, panels, and lists are flat surfaces separated by 1px Garis borders; depth is expressed by position and hairlines, not by stacking shadows. Shadows exist solely for elements that physically float above scrolling content, and they deepen (higher alpha, black) in dark mode.

### Shadow Vocabulary
- **Soft** (`0 1px 2px hsl(249 26% 14% / .06)`; dark `0 1px 2px hsl(0 0% 0% / .3)`): hairline lift for pills that hover over content — status pill, back button, round icon button, check-in capsule, KidSwitcher.
- **Float** (`0 8px 24px hsl(249 26% 14% / .14)`; dark `0 8px 24px hsl(0 0% 0% / .45)`): the floating tab bar, sticky primary action, and anything permanently above the scroll.
- **Sheet** (`0 -12px 32px hsl(249 26% 14% / .18)`; dark `0 -12px 32px hsl(0 0% 0% / .5)`): bottom sheets and modals, casting upward.
- **Focus ring** (`0 0 0 4px hsl(var(--primary-soft))`): the only "glow" — focus-visible on every interactive element.

### Named Rules
**The Line-First Rule.** A card gets a Garis border, not a shadow. Shadows are earned by leaving the document flow (nav, sheets, sticky actions) — a card that merely sits on the page stays flat.

## Shapes

Rounded, never sharp: the radius ramp is xs 4px → input 8px → 12px kit default → 16px nested tiles → 20px sheet (mobile cards) → 28px hero (crayon fields) → full pill. Mobile portals lean pill-heavy — primary buttons, chips, tab bar, composer, and status pills are all `999px` — while desktop admin keeps 12px rectangles with 1.5px borders. Secondary buttons wear a 1.5px Tinta outline; destructive elements a 1.5px Merah outline. Recurring geometry: the crayon timeline rail is a 6px rounded-full bar; the "belum tiba" roster state is a 3px dashed outline ring (offset 4px) instead of a filled badge; the tiba-dot and unread dots are 8–9px circles. Photos clip to their container (4:5 hero, 4:5 carousel tiles, square grid thumbs) with no radius of their own beyond the card they sit in.

## Components

### Buttons
- **Shape:** desktop kit = 12px radius, 1.5px transparent border (so destructive/secondary outlines align); mobile portals = full pill.
- **Primary (desktop kit):** Biru Bunayo fill (#2046C4), white text, 44px tall, 18px side padding; hover #1A39A6; focus ring 4px #DFE6FA. One per screen.
- **Primary (mobile portals):** Tinta ink pill — `h-btn-lg` (52px), `rounded-full`, 16px semibold, press-scale on tap; disabled = #CAC7D6 fill. On crayon fields the pill is literal Tinta `hsl(249 26% 14%)` with Kertas-tinted text so it reads identically in both schemes.
- **Secondary:** 1.5px Tinta outline on Card; hover fills Kertas. On crayon fields the soft twin is a 60%-alpha white pill with Tinta text.
- **Soft/ghost/text:** Muted fill, text-only Pensil, and Tinta-tinted link variants round out the kit; success/warning/info actions are Tinta fills — status colour never becomes button colour.
- **Motion:** every tappable card and pill carries `.press` (transform scale .97 over .18s).

### Chips
- **Style:** 32px pills, 13–14px semibold; unselected = Muted fill with Tinta text (hover Garis), selected = Tinta fill ("nav-active") with Kertas text.
- **State:** choice chips (mood, makan, tidur) toggle with `aria-pressed`; filter pills (per child, message folders) use the same states; kit chips on desktop share the geometry. The unread badge is a Tomat 8px dot, never a coloured chip.

### Cards / Containers
- **Corner Style:** 20px sheet radius on mobile cards; 12px on desktop panels.
- **Background:** Card white on Surface/Kertas; the crayon field card replaces the whole surface with a base crayon (`rounded-[28px]`, `.field-ink` text).
- **Shadow Strategy:** none at rest — see Line-First Rule; borders only.
- **Border:** Garis 1px on desktop panels; mobile cards are borderless (the Surface-vs-Card contrast does the separating) with Garis halus hairlines between rows.
- **Internal Padding:** 16–20px mobile, 18px desktop panel rhythm; row min-height 52–64px.

### Inputs / Fields
- **Style:** 44px tall, 8px radius, Input-line stroke (#8B8579) on Card/Kertas fill; textareas use 16px radius and relaxed leading.
- **Focus:** 4px Biru-soft ring, never a colour swap.
- **Error / Disabled:** destructive banner per section with a 1.5px Merah outline; stale data stays visible at 42% opacity, desaturated, non-interactive (`.stale`); disabled fields 60% opacity.
- **Composer:** chat input is a 44px full-pill field beside a 44px round Tinta send button — the pill composer pattern.

### Navigation
- **FloatingTabBar:** four tabs, 24px Lucide icon over an 11px semibold label; active tab is a Tinta sheet-radius pill (`bg-nav-active`), inactive is Pensil; Tomat dot marks unread; `aria-current="page"`.
- **MobileSubHeader:** 44px round back button (Card fill, Soft shadow, ChevronLeft) beside a 22px display title and optional 13px eyebrow (tabular for dates).
- **KidSwitcher:** avatar strip in a Card pill; the active child opens a Muted pill showing their first name in display type; overflow folds into "+N".
- **Desktop admin:** same tokens, sidebar navigation with `nav-active` = Tinta.

### Signature: KidAvatar & the tiba system
The child's face is the recurring signature. Avatar = 7 sizes (28–96px), soft crayon fill with ink-coloured display initials, replaced by the R2 photo when present; staff take an ink (`bg-foreground`) avatar instead. Arrival is shown three ways, consistently: a 14px Hijau-tiba dot with 3px Card border on the avatar (`tiba`), a 4px/8px concentric ring around the 96px roster face (green tiba, Matahari terlambat, Langit izin/sakit, Merah alpa, dashed "belum"), and the `.tiba-dot` ping (two soft pulses of the current colour, then silence) on the parent home status pill. An allergy raises a Merah triangle on the roster face.

### Signature: Crayon field card
The cheerful layer's hero: a whole card filled with the entity's base crayon (child on parent home, class on tutor home, active invoice, attendance clock, KPI score). Structure is always the same — status pill or eyebrow (`.field-sub`, Tinta 72%), display headline (28–30px), then actions as ink/white pills — and content inside stays Tinta in both schemes, with a slight brightness/saturate dampening (`.dark .app-mobile .field-ink` → brightness .9, saturate .88) so fields don't glare at bedtime. A white/55% inset tile (`rounded-[16px]`) carries inline warnings inside the field.

### States, stats, and feed
- **Empty state:** bordered Card, three krayon dots (Tomat/Matahari/Daun), 18–24px display title, 15px next-step description (max 560px), one action — it must teach what to do next, never just apologize.
- **Error:** per-section Merah-outlined banner with retry; stale rows remain visible beneath.
- **Loading:** per-section skeleton shapes (`sk`, 1.6s pulse) — never a full-screen spinner.
- **Stat cards (desktop):** bordered cells, 13px label + period, 24px tabular numeral (34px display for hero stats), Stabilo on at most one, always linked to their source list.
- **Feed rows (desktop kit):** 6px crayon rail by activity type with ink-coloured icon; the mobile portal reports instead use ink-coloured 24px icons on Card with no rail (see Don'ts).
- **Dark mode:** every rule above holds; only the token layer changes, plus the crayon-field dampening and deeper shadow alphas.

## Do's and Don'ts

### Do:
- **Do** derive every entity colour through `krayonDari(id)` / `KRAYON_KEGIATAN` — same child, class, or activity = same crayon on every screen, both schemes.
- **Do** wrap crayon-field content in `.field-ink` so text stays Tinta ≥6:1; use `.field-sub` (Tinta/72%) for secondary lines.
- **Do** make the mobile primary action the ink pill (`h-btn-lg rounded-full bg-foreground text-background` + `.press`); keep Biru Bunayo for the desktop kit's primary and for links/selection on mobile.
- **Do** put `.tabular` on every numeral — it resolves to mono on desktop and tabular sans inside `.app-mobile` automatically.
- **Do** animate with the three moves only: `.rise` (0.5s `cubic-bezier(.16,1,.3,1)`, stagger `.rise-2`/`.rise-3` at 60/120ms), `.press` (scale .97, 0.18s), `.tiba-dot` (ping ×2, 1.6s).
- **Do** honour `prefers-reduced-motion` (rise, press, tiba, skeletons all switch off) and keep targets ≥44px.
- **Do** ship the PWA pair: theme-color #F7F2E9 (light) / #100F15 (dark), safe-area padding, content reserved above the 68px tab bar.
- **Do** mark demo/simulated sessions with a labelled banner and keep real data the only content.

### Don't:
- **Don't** use emoji as icons — icons are inline Lucide SVGs at 16–24px.
- **Don't** ship blue rectangle CTAs on the Parent/Tutor mobile portals; the ink pill is the primary. (Biru Bunayo kit buttons on desktop keep their 12px radius.)
- **Don't** add coloured side-stripes to mobile list rows — colour arrives through icon ink, soft avatar fills, or whole crayon fields. The desktop kit's Feed crayon rail is legacy kit, not the mobile vocabulary.
- **Don't** invent a seventh crayon, a new status hue, or a hardcoded entity colour.
- **Don't** put white text on base crayon fields; white appears only over photos, under the Tinta scrim.
- **Don't** fake data — no invented bank accounts, promos, testimonials, or user counts; hide unfinished features instead.
- **Don't** resurrect the 34px mockup display scale on mobile (page title 26, child name 30, class name 28, section title 18).
- **Don't** use more than one blue primary, one Stabilo highlight, or one ink pill per screen.
