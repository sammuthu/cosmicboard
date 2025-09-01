# Portfolio Implementation Guide

This guide tracks common patterns, ESLint rules, and implementation standards for the portfolio site.

## Pre-Commit Checklist (CRITICAL - DO THIS BEFORE EVERY COMMIT!)

**ALWAYS run these checks before committing:**

```bash
# 1. Check for linting errors
npm run lint

# 2. Check for TypeScript errors and build issues
npm run build

# 3. If errors found, fix them BEFORE committing
```

## Common ESLint/Build Errors & Solutions

### 1. Unescaped Quotes in JSX
**Error**: `react/no-unescaped-entities`

**Solutions**:
- **Option 1**: Add `/* eslint-disable react/no-unescaped-entities */` at the top of the file
- **Option 2**: Escape quotes properly:
  - `"` → `&ldquo;` (left) or `&rdquo;` (right)
  - `'` → `&apos;`
  - `<` → `&lt;`
  - `>` → `&gt;`

**Common locations**: 
- Hero text with contractions (I'm, don't, etc.)
- Quotes in testimonials or descriptions
- Code examples in text

### 2. TypeScript Type Errors
**Error**: `Cannot find namespace 'JSX'`

**Solution**: Import types properly
```typescript
import type { ReactElement } from 'react'
// Use ReactElement instead of JSX.Element
```

### 3. Unused Variables/Imports
**Error**: `@typescript-eslint/no-unused-vars`

**Solution**: Remove unused imports and variables

### 4. Explicit Any Types
**Error**: `@typescript-eslint/no-explicit-any`

**Solution**: Replace with proper types or unions
```typescript
// Bad
onClick={() => setSelectedLanguage(lang.id as any)}

// Good
onClick={() => setSelectedLanguage(lang.id as 'javascript' | 'java' | 'python')}
```

## Component Structure

### Main Components
- `src/components/PortfolioSections.tsx` - Main portfolio sections
- `src/app/mastery/page.tsx` - Technical Mastery Hub
- `src/app/page.tsx` - Main app entry

### Key Features Implemented

#### 1. Collapsible Category Previews (Portfolio Page)
- State management with `useState` for expanded categories
- Click handlers for toggling categories
- Smooth transitions with Tailwind classes
- Links to specific mastery page sections using hash anchors

#### 2. Standout Sections Pattern
All hero sections follow this pattern:
```tsx
<div className="relative overflow-hidden mt-12 mb-12">
  {/* Animated background gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-[color1] via-[color2] to-[color3] opacity-90 animate-gradient-x rounded-3xl"></div>
  
  {/* Content container */}
  <div className="relative z-10 p-10 rounded-3xl backdrop-blur-sm">
    {/* Badge */}
    <div className="inline-flex items-center bg-[color] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
      <span className="mr-2">[emoji]</span> [BADGE TEXT]
    </div>
    
    {/* Title and content */}
    ...
  </div>
</div>
```

#### 3. Interactive Elements
- Hover effects with `group` and `group-hover`
- Transform animations on hover
- Gradient overlays for visual appeal
- Responsive grid layouts

## File Structure Best Practices

### Images
- Use Next.js `<Image />` component for optimization
- For external images or when `<img>` is required, add eslint comment

### Links
- Internal links: Use Next.js `<Link>`
- External links: Add `target="_blank" rel="noopener noreferrer"`
- PDF downloads: Use `download` attribute

### State Management
- Use `'use client'` directive for interactive components
- Keep state close to where it's used
- Use TypeScript for all state types

## Styling Guidelines

### Tailwind Classes Order
1. Layout (display, position, grid/flex)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Visual (bg, border, shadow)
6. States (hover, focus)
7. Responsive (sm:, md:, lg:)

### Dark Mode Considerations
- Use gray-950 for darkest backgrounds
- Use gray-900 for cards
- Use gray-800 for borders
- Text: white for primary, gray-400 for secondary

## Performance Considerations

### Code Splitting
- Dynamic imports for heavy components
- Lazy loading for below-fold content

### SEO
- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive link text
- Alt text for images

## Testing Before Deploy

1. Run `npm run lint` - Fix all warnings/errors
2. Run `npm run build` - Ensure successful build
3. Test all interactive elements:
   - Collapsible categories
   - Hover effects
   - Links (internal and external)
   - PDF downloads
4. Check responsive design on mobile/tablet
5. Verify all animations work smoothly

## Common Gotchas

1. **String literals in JSX**: Always check for unescaped quotes
2. **Type imports**: Use `import type` for TypeScript types
3. **Array keys**: Ensure unique keys in mapped components
4. **Z-index stacking**: Test overlapping elements
5. **Absolute positioning**: Check on different screen sizes
6. **Dropdown positioning**: For bottom-row items, use `bottom-full mb-2` instead of `top-full mt-2` to prevent cutoff

## Future Enhancements Tracking

- [ ] Add animation on scroll
- [ ] Implement dark/light mode toggle
- [ ] Add analytics tracking
- [ ] Optimize bundle size
- [ ] Add unit tests for interactive components

## Git Commit Standards

- feat: New feature
- fix: Bug fix
- style: Styling changes
- refactor: Code restructuring
- docs: Documentation updates
- perf: Performance improvements

Always reference this guide before making changes to ensure consistent quality and avoid build failures!