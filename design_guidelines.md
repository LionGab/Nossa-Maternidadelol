# Design Guidelines: Nossa Maternidade / Mundo Nath

## Design Approach
**Reference-Based:** Claude.ai's minimalist aesthetic (generous whitespace, serif typography, subtle depth) combined with maternal warmth. Clean sidebar navigation on desktop, mobile-first with sophisticated simplicity that respects the mother's mental space.

## Typography Hierarchy

**Font Families:**
- **Headings:** Georgia (serif) - elegant, trustworthy, maternal authority
- **Body/UI:** Open Sans (sans-serif) - highly readable, approachable

**Scale:**
- Hero/Page Titles: text-4xl to text-5xl, font-serif, font-bold
- Section Headers: text-2xl to text-3xl, font-serif, font-semibold
- Card Titles: text-xl, font-serif, font-medium
- Body Text: text-base, font-sans
- Captions/Metadata: text-sm, font-sans, opacity-70

## Layout & Spacing System

**Tailwind Spacing Primitives:** 4, 6, 8, 12, 16, 20, 24 units
- Component padding: p-6 (mobile), p-8 (tablet+), p-12 (desktop)
- Section spacing: space-y-12 (mobile), space-y-16 (desktop)
- Card gaps: gap-6 to gap-8
- Screen margins: px-6 (mobile), px-8 (tablet), max-w-7xl mx-auto (desktop)

**Generous Whitespace:**
- Section padding: py-16 to py-24
- Content max-width: max-w-3xl for readability
- Card spacing: More breathing room than typical designs

## Core UI Components

### Navigation

**Desktop Sidebar (Fixed Left):**
- Width: w-64, background: sidebar, border-r
- Logo/Brand at top (p-6)
- Navigation items: Vertical list, py-3 px-4, rounded-lg
- Active state: sidebar-accent background with sidebar-accent-foreground text
- Icons: Heroicons outline (size-5)
- Profile/Settings at bottom

**Mobile Bottom Tab Bar:**
- Fixed bottom, h-16, background with border-top
- 5 icons with labels (text-xs)
- Active: primary with scale-105 transition
- Safe area padding

### Cards & Content Blocks

**Primary Cards:**
- Background: card with card-foreground
- Border radius: rounded-lg (less rounded per spec)
- Padding: p-6 to p-8
- Shadow: shadow-sm (subtle)
- Border: border with 1px solid

**Content Cards (MundoNath):**
- Image: aspect-video, rounded-t-lg
- Content: p-6
- Category badge: Inline text with primary text, small caps
- Premium indicator: Lock icon (Heroicons)
- Metadata: Flex row with gap-4, text-sm, muted-foreground

**Embedded Social Posts:**
- iframe containers with max-w-xl mx-auto
- Wrapper: card background, p-1, rounded-lg
- Maintain native aspect ratios
- Loading skeleton: animate-pulse with muted background

### Chat Interface (NathIA/MãeValente)

**Message Bubbles:**
- User: ml-auto, max-w-2xl, bg-primary, text-primary-foreground, rounded-lg, p-4
- AI: mr-auto, max-w-2xl, bg-card, rounded-lg, p-4, shadow-sm
- Spacing: space-y-4 between messages
- No message tails (Claude-style simplicity)

**Suggested Prompts:**
- Horizontal scroll container, pb-4
- Chips: border, rounded-lg, px-4 py-2, hover:bg-accent

**Input Bar:**
- Fixed bottom, border-t, bg-background
- Textarea: border-0, focus:ring-0, resize-none
- Send button: primary background, rounded-lg, p-2.5, icon only

### Forms & Inputs

**Text Inputs:**
- Border: border input
- Focus: ring-2 ring-ring
- Rounded: rounded-lg
- Padding: px-4 py-3
- Background: input

**Primary Buttons:**
- Background: bg-primary, text-primary-foreground
- Padding: px-6 py-3
- Rounded: rounded-lg
- Font: font-semibold
- Shadow: shadow-sm

**Secondary Buttons:**
- Background: bg-secondary, text-secondary-foreground
- Border: border
- Rounded: rounded-lg

### Habit Tracker

**Habit Items:**
- List: space-y-3
- Item: Flex row, p-4, rounded-lg, border, hover:bg-accent
- Checkbox: Custom with primary accent when checked
- Streak badge: bg-primary/10, text-primary, rounded-full, px-2.5 py-0.5, text-xs

**Progress Visualization:**
- Progress bar: h-2, bg-muted, rounded-full
- Fill: bg-primary, transition-all
- Stats: Grid of metric cards (2-col mobile, 4-col desktop)

## Page-Specific Layouts

### Home Dashboard
- Hero card: p-12, rounded-lg, border-l-4 border-l-primary, mb-8
- Daily tip: text-2xl font-serif, mb-4
- Quote: Italic, text-muted-foreground, max-w-2xl
- Quick actions: Grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Each action card: Icon (size-8), title (text-xl font-serif), description

### MundoNath Feed
- Filter tabs: Sticky top, flex gap-2, pb-4, border-b
- Content grid: grid-cols-1 lg:grid-cols-2, gap-6
- Embedded posts: Full width within card, maintain aspect ratio
- Load more: Centered button at bottom

### Meus Hábitos
- Header stats: Grid of completion metrics, mb-8
- Date grouping: text-sm uppercase tracking-wide, mb-4, text-muted-foreground
- Habit list: Grouped by date, space-y-2
- Achievement section: Horizontal scroll, gap-4, rounded-lg badges

## Dark Mode
- Background: #0A0A0A (deep black per spec)
- Elevated surfaces: Subtle card color
- Text: High contrast foreground
- Primary blue maintains vibrancy
- Borders: Subtle, low opacity

## Images
- **Home Hero Card:** Soft maternal imagery (mother-child, gentle hands) - integrate within card, not full-bleed
- **MundoNath:** Video thumbnails 16:9, quality lifestyle/maternal content
- **Empty States:** Minimalist illustrations in primary blue tones
- **Profile/Settings:** User avatar, circular, size-12 to size-16

## Accessibility & Polish
- Touch targets: min-h-11 (44px)
- Focus rings: ring-2 ring-ring
- Loading: Skeleton screens with animate-pulse
- Error states: destructive background with destructive-foreground
- Success: Subtle primary glow effect
- Contrast: WCAG AA compliant

## Animation Principles
**Minimal, refined motion:**
- Transitions: 200ms ease-in-out
- Hover states: Subtle scale or background shift
- No scroll-triggered animations
- Micro-interactions: Check animations, button presses only