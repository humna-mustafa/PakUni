# PakUni Clean Design System 2025

## Overview

This design system prioritizes **clarity, usability, and accessibility** over decorative elements. It follows modern design principles inspired by Google Material Design 3, Apple Human Interface Guidelines, and leading tech products like Linear, Stripe, and Notion.

---

## Core Design Principles

### 1. Content First
The UI should **support content, never compete with it**. Every visual element must serve a purpose. If an element doesn't improve comprehension or usability, remove it.

### 2. Purposeful Color
Use color with **intention, not decoration**:
- **Primary color**: Key actions, links, active states ONLY
- **Neutral palette**: 90% of UI (backgrounds, text, borders)
- **Semantic colors**: Status indicators ONLY (success/warning/error)

### 3. Clear Hierarchy
Typography and whitespace create natural visual flow:
- Use **size** and **weight** to establish hierarchy
- **Spacing** should be consistent and predictable
- Avoid competing visual elements

### 4. Subtle Depth
Minimal shadows, focused elevation:
- **Prefer borders over shadows** for most cards
- Use shadows sparingly for truly elevated elements
- Dark mode relies more on borders than shadows

### 5. Accessibility
WCAG 2.1 AA compliance minimum:
- **4.5:1** contrast ratio for normal text
- **44px minimum** touch targets
- Clear focus indicators
- Meaningful labels and hints

---

## Color System

### Light Theme Primary Colors
```typescript
primary: {
  50: '#F0F7FF',    // Subtle backgrounds
  100: '#E0EFFF',   // Hover states, badges
  500: '#0066DC',   // Primary action color
  600: '#0052B0',   // Pressed/active states
}
```

### Neutral Palette
```typescript
neutral: {
  0: '#FFFFFF',     // Card backgrounds
  50: '#F9FAFB',    // Page background
  100: '#F3F4F6',   // Surfaces
  200: '#E5E7EB',   // Borders, dividers
  500: '#6B7280',   // Secondary text
  700: '#374151',   // Primary text
  800: '#1F2937',   // Headlines
}
```

### Semantic Colors
```typescript
semantic: {
  success: { main: '#059669', light: '#F0FDF4' },
  warning: { main: '#D97706', light: '#FFFBEB' },
  error:   { main: '#DC2626', light: '#FEF2F2' },
  info:    { main: '#0284C7', light: '#F0F9FF' },
}
```

---

## Typography

### Type Scale
| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| Display | 36px | Bold | Hero text (rare) |
| Headline | 24px | Bold | Page titles |
| Title | 20px | Semibold | Section headers |
| Subtitle | 17px | Medium | Card titles |
| Body | 15px | Regular | Default text |
| Small | 13px | Regular | Secondary text |
| Caption | 11px | Regular | Labels, timestamps |

### Guidelines
- **Headlines**: Tight line height (1.25), negative letter spacing
- **Body text**: Relaxed line height (1.5) for readability
- Use **weight** (not size) for emphasis within body text

---

## Spacing

Based on a **4px grid**:

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Tight spacing, badges |
| sm | 8px | Icon gaps, chip padding |
| md | 16px | Card padding, section margins |
| lg | 24px | Section gaps |
| xl | 32px | Large sections |
| screenPadding | 20px | Horizontal page margins |

---

## Components

### Cards

**Variants:**
1. **Default**: Border + no shadow (most common)
2. **Outlined**: Border only, transparent background
3. **Elevated**: Subtle shadow (use sparingly)
4. **Interactive**: Designed for press states

**Guidelines:**
- Use borders instead of shadows where possible
- Cards should be content containers, not decorations
- Consistent corner radius (12px default)

```tsx
// Recommended usage
<CleanCard variant="outlined">
  {content}
</CleanCard>

// For clickable cards
<InteractiveCard onPress={handlePress}>
  {content}
</InteractiveCard>
```

### Buttons

**Variants:**
1. **Primary**: Filled, high emphasis (one per screen)
2. **Secondary**: Outlined, medium emphasis
3. **Tertiary**: Text only, low emphasis
4. **Ghost**: Invisible until hover/press
5. **Danger**: Destructive actions (red)

**Sizes:**
- **sm**: 36px height
- **md**: 44px height (default, meets touch targets)
- **lg**: 52px height

```tsx
// Primary action
<CleanButton title="Get Started" onPress={handlePress} />

// Secondary action
<CleanButton title="Learn More" variant="secondary" onPress={handlePress} />
```

### Chips

**Use Cases:**
- Filter selections
- Category tags
- Status indicators

**Guidelines:**
- Use pill shape (full border radius)
- Clear selected vs. unselected states
- Keep labels concise

```tsx
<CleanChipGroup
  options={[
    { label: 'All', value: 'all' },
    { label: 'Medical', value: 'medical' },
    { label: 'Engineering', value: 'engineering' },
  ]}
  selectedValue={selected}
  onSelect={setSelected}
/>
```

### Search Bar

**Variants:**
1. **Default**: Border with white background
2. **Filled**: Gray background, no border (until focused)
3. **Outlined**: Transparent background, prominent border

```tsx
<CleanSearchBar
  value={query}
  onChangeText={setQuery}
  placeholder="Search..."
  variant="filled"
/>
```

### Section Headers

**Guidelines:**
- Clear hierarchy with title/subtitle
- Optional action button aligned right
- Consistent spacing (24px bottom margin)

```tsx
<CleanSectionHeader
  title="Top Universities"
  subtitle="Highest ranked institutions"
  action="See All"
  onActionPress={handleSeeAll}
/>
```

---

## Shadows

**Philosophy:**
- Use shadows sparingly
- Prefer subtle, diffuse shadows
- Dark mode uses less shadow, more borders

| Level | Use Case |
|-------|----------|
| xs | Barely visible lift |
| sm | Default card shadow |
| md | Dropdowns, popovers |
| lg | Modals only |

```typescript
sm: {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
}
```

---

## Animation

**Principles:**
- Animations should be **quick** and **meaningful**
- Never delay user interactions
- Use spring physics for natural feel

**Durations:**
- **Fast**: 150ms (micro-interactions)
- **Normal**: 250ms (standard transitions)
- **Slow**: 350ms (large movements)

**Spring Configurations:**
```typescript
snappy: { damping: 28, stiffness: 350 }  // Buttons, toggles
default: { damping: 24, stiffness: 200 } // Cards, panels
gentle: { damping: 20, stiffness: 150 }  // Page transitions
```

---

## Icons

**Guidelines:**
- Use outlined icons for most cases
- Filled icons for selected/active states
- Consistent sizing within context
- Ensure adequate touch targets (44px minimum)

**Sizes:**
| Size | Value | Use Case |
|------|-------|----------|
| xs | 14px | Badges, inline |
| sm | 18px | List items |
| md | 22px | Default |
| lg | 26px | Primary actions |
| xl | 32px | Feature highlights |

---

## Dark Mode

**Guidelines:**
- True dark backgrounds (#0F0F11)
- Slightly elevated surfaces for depth
- Adjusted text contrast (not pure white)
- More reliance on borders than shadows
- Semantic colors adjusted for dark backgrounds

---

## Don'ts

❌ **Don't** use gradients for decoration
❌ **Don't** add shadows to every card
❌ **Don't** use color without purpose
❌ **Don't** create competing visual hierarchies
❌ **Don't** animate everything
❌ **Don't** use glassmorphism for critical UI
❌ **Don't** sacrifice readability for aesthetics
❌ **Don't** use low contrast text
❌ **Don't** make touch targets smaller than 44px

---

## Do's

✅ **Do** prioritize content legibility
✅ **Do** use consistent spacing
✅ **Do** provide clear visual hierarchy
✅ **Do** ensure accessible contrast ratios
✅ **Do** use subtle, purposeful animations
✅ **Do** test in both light and dark modes
✅ **Do** consider users with different abilities
✅ **Do** keep the interface predictable
✅ **Do** use borders for card definition

---

## Migration Guide

To migrate from the existing Premium components to Clean 2025 components:

### Cards
```tsx
// Before
<PremiumCard variant="glass" shadowLevel="lg" glowColor="#667eea">

// After
<CleanCard variant="outlined">
```

### Buttons
```tsx
// Before
<PremiumButton color="primary" rounded hapticEnabled>

// After
<CleanButton variant="primary">
```

### Section Headers
```tsx
// Before
<PremiumSectionHeader 
  title="Title" 
  subtitle="Subtitle"
  action="See All"
  gradient
/>

// After
<CleanSectionHeader
  title="Title"
  subtitle="Subtitle"
  action="See All"
  onActionPress={handlePress}
/>
```

---

## File Structure

```
src/
├── constants/
│   └── clean-design-2025.ts    # Design tokens
├── components/
│   ├── CleanCard.tsx           # Card components
│   ├── CleanButton.tsx         # Button components
│   ├── CleanChip.tsx           # Chip/tag components
│   ├── CleanSearchBar.tsx      # Search components
│   └── CleanSectionHeader.tsx  # Header components
└── screens/
    └── CleanHomeScreen.tsx     # Example implementation
```

---

## Summary

This design system represents a shift from **decorative UI** to **functional UI**. The goal is to create interfaces that users don't notice—they just work. Every element should serve the user's goals, not showcase design capabilities.

Remember: **The best interface is no interface.**
