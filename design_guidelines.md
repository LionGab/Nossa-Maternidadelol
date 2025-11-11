# Design Guidelines: Nossa Maternidade / Mundo Nath

## Design Approach
**Reference-Based:** Drawing inspiration from health/wellness apps like Headspace (calm, approachable) and Calm (nurturing, gentle), combined with the content organization of Instagram and the conversational UI of messaging apps. Creating a maternal sanctuary that feels personal, warm, and judgment-free.

## Brand-Specified Color Palette
- **Primary Blues:** #6DA9E4 (calm sky), #DCEBFA (soft powder)
- **Background:** #FFF8F3 (warm cream)
- **Text:** #6A5450 (warm brown/mauve)
- **Accent:** #FF8BA3 (gentle pink for CTAs, highlights, achievements)

## Typography Hierarchy

**Font Families:**
- **Headings:** 'Quicksand' (Google Fonts) - soft, rounded, maternal
- **Body/UI:** 'Inter' (Google Fonts) - clean, highly readable

**Scale:**
- Hero/Page Titles: text-3xl to text-4xl, font-bold
- Section Headers: text-xl to text-2xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Captions/Metadata: text-sm, text-[#6A5450]/70

## Layout & Spacing System

**Tailwind Spacing Primitives:** 2, 3, 4, 6, 8, 12, 16 units
- Component padding: p-4 (mobile), p-6 (tablet+)
- Section spacing: space-y-6 (mobile), space-y-8 (desktop)
- Card gaps: gap-4
- Screen margins: px-4 (mobile), px-6 (tablet), max-w-7xl mx-auto (desktop)

**Mobile-First Containers:**
- Tab content: Full-width with px-4 safe area
- Cards/Components: Rounded corners (rounded-2xl)
- Maximum content width: max-w-2xl for readability

## Core UI Components

### Navigation
**Bottom Tab Bar (Fixed):**
- 5 icons with labels below (Home, NathIA, MundoNath, MãeValente, Hábitos)
- Active state: Pink accent (#FF8BA3) with subtle scale
- Inactive: Muted warm brown (#6A5450)/60
- Height: h-16 with safe-area padding
- Background: White with subtle shadow

### Cards & Content Blocks
**Action Cards (Home):**
- White background, rounded-2xl, shadow-sm
- Padding: p-6
- Icon (top-left, size-8, accent pink) + Title + Brief description
- Subtle hover lift (shadow-md transition)

**Content Cards (MundoNath):**
- Image thumbnail (aspect-video, rounded-t-2xl)
- Content overlay gradient for text readability
- Category tag (top-right, rounded-full badge, primary blue)
- Premium lock icon when gated
- Duration/metadata in muted text

**Chat Bubbles (NathIA/MãeValente):**
- User messages: Align right, bg-[#6DA9E4], text-white, rounded-2xl with tail
- AI responses: Align left, bg-white, text-[#6A5450], rounded-2xl with shadow
- Suggested prompts: Chips with border-2 border-[#DCEBFA], rounded-full, horizontal scroll

### Forms & Inputs
**Text Inputs:**
- Border: border-2 border-[#DCEBFA]
- Focus: border-[#6DA9E4], ring-2 ring-[#6DA9E4]/20
- Rounded: rounded-xl
- Padding: px-4 py-3
- Placeholder: text-[#6A5450]/50

**Primary Buttons:**
- Background: bg-[#FF8BA3] (pink accent)
- Text: text-white, font-semibold
- Padding: px-6 py-3
- Rounded: rounded-full
- Shadow: shadow-md
- States handled by component

**Secondary Buttons:**
- Border: border-2 border-[#6DA9E4]
- Text: text-[#6DA9E4]
- Background: transparent or bg-white
- Rounded: rounded-full

### Habit Tracker Components
**Habit Check Items:**
- List items with checkbox (left), icon, title, streak counter
- Checked state: Pink checkmark with subtle glow
- Unchecked: Border circle in light blue
- Streak badges: Rounded-full, small, bg-[#6DA9E4]/10, text-[#6DA9E4]

**Achievement Badges:**
- Circular medals with gradient backgrounds (blue to pink)
- Size: 20-24 units
- Drop shadow for depth
- Display in horizontal scrollable row

### Subscription Paywall
**Modal/Card:**
- Centered overlay with blur backdrop
- White card, rounded-3xl, p-8
- Pink accent for pricing (text-4xl, font-bold)
- Feature list with checkmark icons
- CTA: Large pink button
- Dismissible "Close" link in muted text

### Content Player
**Video/Audio Embedded:**
- aspect-video container with rounded-xl
- Custom controls in brand colors
- Progress bar: bg-[#DCEBFA], fill-[#FF8BA3]
- Play/pause icons in primary blue
- Minimalist, clean interface

## Page-Specific Layouts

### Home Dashboard
**Structure:**
- Hero section: Daily featured tip card (gradient bg from #DCEBFA to #FFF8F3, p-6)
- Quote/inspiration (centered, italic, text-xl, max-w-md)
- Quick action grid: 2-column on mobile, 3-column on tablet+
- Vertical spacing: space-y-6

### NathIA/MãeValente Chat
**Layout:**
- Chat messages scrollable area (flex-1)
- Suggested prompts row (sticky below header, horizontal scroll)
- Input bar fixed at bottom (with send button, pink accent)
- Background: Subtle texture or gradient (#FFF8F3 to white)

### MundoNath Feed
**Grid:**
- Single column on mobile
- 2-column on tablet (md:grid-cols-2)
- Card-based with consistent aspect ratios
- Category filters: Horizontal pill navigation (sticky)

### Meus Hábitos
**List View:**
- Grouped by completion status
- Daily date header (text-sm, uppercase, text-[#6A5450]/60)
- Habit items with large touch targets (min-h-16)
- Streak visualization at top (progress ring or bar chart)

## Images
- **Home Hero:** Soft, abstract maternal imagery (mother-child silhouette, gentle hands, warm lighting) - aspect-video, rounded-2xl
- **MundoNath Thumbnails:** Video/article preview images - 16:9 ratio, quality imagery of Nathália or relevant maternal topics
- **Onboarding:** Welcoming illustration of mother figure - full-width, top of screen
- **Empty States:** Gentle, encouraging illustrations (not photos) in pastel colors

## Accessibility & Polish
- Touch targets minimum 44x44px
- Sufficient color contrast (WCAG AA)
- Loading states: Skeleton screens in #DCEBFA/20
- Error states: Gentle messaging with light pink background
- Success feedback: Subtle pink glow or checkmark animation

## Animation Principles
**Minimal, purposeful motion:**
- Tab transitions: Gentle fade + slide (200ms)
- Habit check: Satisfying scale + checkmark draw
- Card interactions: Subtle lift on press
- NO distracting scroll effects or excessive parallax