# Implementation Guide - Segment Loop Master Design System

## Overview
This guide documents the unified design system inspired by the Segment Loop Master page, applied consistently across the portfolio site for a cohesive visual experience.

## Core Design Principles

### 1. Prismatic/Marble Background Effects
- **Implementation**: Semi-transparent gradient backgrounds (30-40% opacity) with backdrop blur
- **Pattern**: `bg-gradient-to-br from-[color]-900/30 to-[color]-900/30`
- **Purpose**: Creates depth and visual interest without overwhelming content

### 2. Gradient Borders with Blur
- **Structure**: Two-div pattern with absolute positioning
- **Outer div**: `absolute -inset-0.5 bg-gradient-to-r from-[color]-500 to-[color]-500 rounded-2xl opacity-75 blur`
- **Inner div**: `relative` with prismatic background
- **Hover effect**: `group-hover:opacity-100` on the border for enhanced interactivity

### 3. Interactive Hover Animations
- **Scale effect**: `transition-all duration-500 hover:scale-[1.02]`
- **Group hover**: Use `group` and `group-hover` for coordinated animations
- **Smooth transitions**: Always include `transition-all` or specific transition properties

### 4. Typography Enhancement
- **Font weight**: Use `font-medium` for body text and `font-bold` for headings
- **Text color**: Primary text in white, secondary in `text-gray-300`
- **Gradient text**: Headers use `bg-gradient-to-r from-[color]-400 to-[color]-400 bg-clip-text text-transparent`

## Color Palette

### Preferred Gradients
- **Blue/Cyan**: `from-blue-500 to-cyan-500` (primary actions, highlights)
- **Green/Emerald**: `from-green-500 to-emerald-500` (success, nature themes)
- **Purple/Pink**: `from-purple-500 to-pink-500` (creative, innovative sections)
- **Teal/Cyan**: `from-teal-500 to-cyan-500` (data, analytics)
- **Indigo/Purple**: `from-indigo-500 to-purple-500` (vision, future-focused)

### Avoid
- Orange/Red gradients (except for specific branding like Segment Loop Master)
- Overly bright or saturated colors that hurt readability

## Component Patterns

### 1. Card with Gradient Border
```tsx
<div className="relative group transition-all duration-500 hover:scale-[1.02]">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
  <div className="relative bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
    {/* Content */}
  </div>
</div>
```

### 2. Centered Tab Navigation
```tsx
<div className="flex justify-center py-4">
  <div className="relative inline-flex">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-75 blur"></div>
    <div className="relative bg-gradient-to-r from-gray-900/90 to-gray-800/90 p-1 rounded-xl inline-flex gap-1 backdrop-blur-sm shadow-lg">
      {/* Tab buttons */}
    </div>
  </div>
</div>
```

### 3. Badge/Pill with Glow
```tsx
<div className="inline-flex relative">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-50 blur"></div>
  <div className="relative inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm">
    <span className="text-yellow-400 font-bold">Badge Text</span>
  </div>
</div>
```

## Page-Specific Implementations

### Resume Page (`/resume`)
- Hero stats cards with individual gradient borders
- Experience cards with expandable sections
- Skills categories with dynamic gradient colors
- Projects with alternating gradient schemes

### Founders Page (`/founders`)
- Key stats with prismatic card design
- Offerings with indexed gradient rotation
- Industry cards with unique color per category
- Must-haves/Nice-to-haves in unified bordered container

### Mastery Hub (`/mastery`)
- Live section with enhanced glow effect
- Category cards with gradient overlays
- Vision statement with indigo/purple theme

### LeetCode Index (`/mastery/leetcode`)
- Problem cards with prismatic styling and rotating gradient colors
- Each problem card has gradient border and semi-transparent background
- Gradient rotation pattern: cyan/blue, green/emerald, purple/pink, teal/cyan
- IDE setup guide with distinct indigo/purple gradient
- Difficulty badges maintaining original colors
- Typography enhanced with font-bold for problem numbers and titles

### IDE Setup Page (`/mastery/leetcode/ide-setup`)
- IDE selection card: cyan/blue gradient (from-cyan-500 to-blue-500)
- Language selection card: purple/pink gradient (from-purple-500 to-pink-500)
- Setup instructions card: green/emerald gradient (from-green-500 to-emerald-500)
- General tips card: indigo/purple gradient (from-indigo-500 to-purple-500)
- All tip boxes within instructions have matching gradient glows with 40% opacity backgrounds
- Typography enhanced with font-bold for all headings and font-medium for content

## Best Practices

1. **Consistency**: Use the same hover scale (`hover:scale-[1.02]`) across all interactive elements
2. **Accessibility**: Ensure sufficient contrast between text and prismatic backgrounds
3. **Performance**: Use `backdrop-blur-sm` sparingly on mobile devices
4. **Responsiveness**: Test gradient borders on different screen sizes
5. **Animation**: Keep transitions smooth but not distracting (500ms duration is ideal)

## Data Consistency Updates

- User count: Standardized to **30M+** across all pages
- Revenue: Changed from "Generated" to "Enabled" with **$50M+** figure
- Maintains credibility while being defensible

## LeetCode Problem Pages

### Individual Problem Design
- **Tab Navigation**: Centered with gradient border, matching segment-loop-master style
- **Problem Content**: Cyan/blue prismatic background
- **Solution Section**: Purple/pink background for complexity analysis
- **Visualization**: Green/emerald background for input controls
- **Typography**: Enhanced with proper font weights throughout

### Styled Components
1. **Collapsible Cards**: Thinking and VisualizationThinking components with prismatic backgrounds
2. **All Tab Components**: CodeRunner, CodeTabs, RunInIDE with centered gradient borders
3. **Content Sections**: All informational cards with appropriate gradient themes
4. **Input Labels**: Use `text-sm text-white font-medium` for readability on prismatic backgrounds

### Critical: Input Field Labels
Input labels inside prismatic backgrounds (especially green/emerald) must use white text:
```tsx
<label className="block text-sm text-white font-medium mb-1">Label Text</label>
```

### LeetCode Problem Cards Template
When adding new problems to the LeetCode index, follow this pattern:
```tsx
const gradients = [
  'from-cyan-500 to-blue-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-teal-500 to-cyan-500'
];
const bgGradients = [
  'from-cyan-900/30 to-blue-900/30',
  'from-green-900/30 to-emerald-900/30',
  'from-purple-900/30 to-pink-900/30',
  'from-teal-900/30 to-cyan-900/30'
];

// Structure for each problem card:
<div className="relative group transition-all duration-500 hover:scale-[1.01]">
  <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur`}></div>
  <div className={`relative bg-gradient-to-br ${bgGradient} rounded-xl p-6 shadow-xl backdrop-blur-sm`}>
    {/* Problem content */}
  </div>
</div>
```

Key points:
- Use rotating gradients based on problem index
- Problem numbers and titles use `font-bold text-white`
- Topic tags use `bg-gray-800/60 text-gray-300 font-medium`
- Maintain original difficulty badge colors
- Gap between cards: `gap-6`

For detailed instructions on adding new LeetCode problems, see `enhancement_README.md`.

## Future Enhancements

1. Consider adding subtle animations to gradient borders (pulse, rotate)
2. Implement theme variations for different sections
3. Create reusable React components for common patterns
4. Add dark/light mode support while maintaining the design system

---

*Last updated: [Current Date]*
*Design system inspired by the Segment Loop Master's prismatic aesthetic*