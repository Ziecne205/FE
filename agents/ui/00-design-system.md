# Design System - Parking Building Management System

Create a comprehensive design system for the Parking Building Management System.

## TECHNICAL:
- React with Next.js and TypeScript
- Tailwind CSS v4 for styling
- shadcn/ui component library
- Responsive design (desktop, tablet, mobile)
- Vietnamese language labels

## DESIGN PRINCIPLES:

### Visual Style
- **Professional & Clean:** Dashboard-focused aesthetic (think modern SaaS admin panels)
- **High Contrast:** Easy to read in bright parking facility environments
- **Status-Driven:** Heavy use of color coding for slot states
- **Data-Dense:** Information-rich layouts for operational efficiency

### Color Palette

**Primary Colors:**
- Primary Blue: `#3B82F6` (actions, links, primary buttons)
- Dark Blue: `#1E40AF` (hover states, emphasis)

**Status Colors:**
- Available (Green): `#10B981` - slots ready for use
- Occupied (Red): `#EF4444` - slots currently in use
- Reserved (Yellow): `#F59E0B` - slots booked
- Maintenance (Gray): `#6B7280` - slots under maintenance

**Neutral Colors:**
- Background: `#F9FAFB` (light gray)
- Card Background: `#FFFFFF`
- Border: `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`

**Semantic Colors:**
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

### Typography
- **Font Family:** Inter or System UI stack
- **Headings:** 
  - H1: 2rem (32px), font-weight 700
  - H2: 1.5rem (24px), font-weight 600
  - H3: 1.25rem (20px), font-weight 600
  - H4: 1rem (16px), font-weight 600
- **Body:** 0.875rem (14px), font-weight 400
- **Small:** 0.75rem (12px), font-weight 400
- **Vietnamese Support:** Ensure proper rendering of Vietnamese diacritics

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Border Radius
- Small: 0.375rem (6px) - buttons, badges
- Medium: 0.5rem (8px) - cards, inputs
- Large: 0.75rem (12px) - modals, large cards

### Shadows
- Small: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- Medium: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- Large: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

## COMPONENTS:

### 1. Buttons
**Primary Button:**
- Background: Primary Blue
- Text: White
- Padding: 0.5rem 1rem
- Border radius: Small
- Hover: Darker blue with subtle shadow

**Secondary Button:**
- Background: White
- Border: 1px solid Border color
- Text: Text Primary
- Hover: Light gray background

**Danger Button:**
- Background: Error Red
- Text: White
- Use for destructive actions (cancel booking, delete)

**Icon Button:**
- Square, icon only
- Minimal padding
- Hover: Light background

### 2. Status Badges
- Pill-shaped (fully rounded)
- Small text (12px)
- Color-coded by status:
  - Available: Green background, dark green text
  - Occupied: Red background, dark red text
  - Reserved: Yellow background, dark yellow text
  - Maintenance: Gray background, dark gray text

### 3. Cards
- White background
- Medium border radius
- Medium shadow
- Padding: lg (24px)
- Border: 1px solid Border color

### 4. Data Tables
- Striped rows (alternating light gray)
- Hover: Subtle highlight
- Sticky header
- Sortable columns with icons
- Pagination at bottom
- Search/filter bar at top

### 5. Forms
**Input Fields:**
- Border: 1px solid Border color
- Border radius: Medium
- Padding: 0.5rem 0.75rem
- Focus: Blue border, subtle shadow
- Error state: Red border

**Labels:**
- Font weight: 500
- Margin bottom: 0.5rem
- Required indicator: Red asterisk

**Select Dropdowns:**
- Same styling as input fields
- Chevron icon on right

### 6. Modals
- Overlay: Semi-transparent dark background
- Content: White card with large border radius
- Max width: 600px (medium), 800px (large)
- Close button: Top right corner
- Actions: Bottom right (Cancel + Confirm)

### 7. Navigation
**Sidebar:**
- Fixed left side
- Dark background (`#1F2937`)
- White text
- Active item: Primary blue background
- Icons + labels
- Collapsible on mobile

**Top Bar:**
- White background
- Shadow: Small
- User profile on right
- Breadcrumbs on left
- Height: 64px

### 8. Slot Map Visualization
- Grid layout
- Each slot: Square card (60px × 60px on desktop, 40px × 40px on mobile)
- Color-coded by status
- Slot name centered
- Hover: Enlarge slightly, show tooltip
- Click: Open slot details modal

### 9. Stats Cards
- White card background
- Icon on left (colored circle background)
- Large number (2rem, bold)
- Label below (small, gray)
- Optional trend indicator (up/down arrow with percentage)

### 10. Toast Notifications
- Position: Top right
- Auto-dismiss after 5 seconds
- Color-coded by type (success, error, warning, info)
- Close button
- Icon on left

## LAYOUT PATTERNS:

### Dashboard Layout
```
┌─────────────────────────────────────┐
│ Top Bar (breadcrumbs, user)        │
├──────┬──────────────────────────────┤
│      │ Stats Cards Row              │
│ Side │ (4 cards: total, available,  │
│ Nav  │  occupied, revenue)          │
│      ├──────────────────────────────┤
│      │ Main Content Area            │
│      │ (Slot Map / Table / Form)    │
│      │                              │
└──────┴──────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 640px (sidebar collapses to hamburger menu)
- Tablet: 640px - 1024px (sidebar visible, content adjusts)
- Desktop: > 1024px (full layout)

## ACCESSIBILITY:
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for screen readers
- Sufficient color contrast (4.5:1 for text)
- Vietnamese language support for all labels

## INTERACTIONS:
- Smooth transitions (200ms ease-in-out)
- Loading states: Skeleton screens or spinners
- Hover states: Subtle background change or shadow
- Active states: Slightly darker color
- Disabled states: 50% opacity, no pointer events

## ICONS:
- Use Lucide React or Heroicons
- Size: 20px (default), 16px (small), 24px (large)
- Stroke width: 2px
- Color: Inherit from parent or use semantic colors

Include sample implementations for all components using shadcn/ui and Tailwind CSS v4.
