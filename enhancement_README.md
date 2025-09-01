# Enhancement Guide for LeetCode Problems

This guide provides instructions for adding new LeetCode problems with the unified segment-loop-master design system.

## Design System Overview

The segment-loop-master design creates a cohesive visual experience with:
- Prismatic/marble backgrounds using semi-transparent gradients
- Gradient borders with blur effects
- Centered tab navigation with gradient borders
- Enhanced typography with proper font weights
- Smooth hover animations

## Adding a New LeetCode Problem

### 1. Problem List Entry

Add your problem to `/src/app/mastery/leetcode/problemsData.ts`:

```typescript
{
  number: 3,
  title: "Longest Substring Without Repeating Characters",
  slug: "3_Longest_Substring",
  difficulty: "Medium",
  topics: ["Hash Table", "String", "Sliding Window"],
  completed: true
}
```

The problem will automatically appear in the LeetCode index page with prismatic styling:
- Gradient borders that rotate through: cyan/blue, green/emerald, purple/pink, teal/cyan
- Semi-transparent prismatic backgrounds matching the border gradients
- Enhanced typography with font-bold for problem numbers and titles
- Topic tags with semi-transparent backgrounds
- Smooth hover animations with scale effect

### 2. Create Problem Directory

Create a new directory: `/src/app/mastery/leetcode/[problem_slug]/`

### 3. Create page.tsx

```tsx
import { Suspense } from 'react'
import YourProblemComponent from './index'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YourProblemComponent />
    </Suspense>
  )
}
```

### 4. Problem Component Structure (index.tsx)

Use this template for consistent styling:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProblemLayout from '../../shared/ProblemLayout'
import CodeRunner from '../../shared/CodeRunner'
import YourVisualizer from './YourVisualizer'
import ReactMarkdown from 'react-markdown'

export default function YourProblem() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as 'problem' | 'solution' | 'visual' | null
  const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'visual'>(tabParam || 'problem')

  return (
    <ProblemLayout
      problemNumber={3}
      problemTitle="Your Problem Title"
      difficulty="Medium"
    >
      {/* Tab Navigation with Segment-Loop-Master Design */}
      <div className="flex justify-center mb-8">
        <div className="relative inline-flex">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-75 blur"></div>
          <div className="relative bg-gradient-to-r from-gray-900/90 to-gray-800/90 p-1 rounded-xl inline-flex gap-1 backdrop-blur-sm shadow-lg">
            {(['problem', 'solution', 'visual'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-8 py-3 rounded-lg font-semibold capitalize whitespace-nowrap transition-all text-sm
                  ${activeTab === tab 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                {tab === 'problem' && '📋 '}
                {tab === 'solution' && '💡 '}
                {tab === 'visual' && '🎨 '}
                {tab === 'visual' ? 'Visualization' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Problem Tab */}
        {activeTab === 'problem' && (
          <div className="relative group transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
            <div className="relative bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-white mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-300 mb-4 font-medium">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 font-medium">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 font-medium">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code(props: any) {
                      const {className, children, ...rest} = props
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <code className="block bg-gray-900/80 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 font-mono backdrop-blur-sm">{children}</code>
                      ) : (
                        <code className="bg-gray-800/60 px-1 py-0.5 rounded text-sm text-gray-300 font-mono" {...rest}>{children}</code>
                      )
                    },
                    pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                    strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                  }}
                >
                  {problemContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Solution Tab */}
        {activeTab === 'solution' && (
          <div className="space-y-8">
            {/* Solution Code */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Optimal Solution</h2>
              <CodeRunner
                code={solutionCode}
                language="JavaScript"
                testCases={testCases}
              />
            </div>

            {/* Complexity Analysis with Prismatic Background */}
            <div className="relative group transition-all duration-500 hover:scale-[1.01]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Complexity Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">Time Complexity</h4>
                    <p className="text-gray-300 font-medium">O(n) - Explanation here</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-300">Space Complexity</h4>
                    <p className="text-gray-300 font-medium">O(n) - Explanation here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualization Tab */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            {/* Custom Input Controls with Prismatic Background */}
            <div className="relative group transition-all duration-500 hover:scale-[1.01]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 shadow-xl backdrop-blur-sm">
                <h3 className="text-sm font-bold text-gray-300 mb-3">Try Your Own Input</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white font-medium mb-1">Your Input Label</label>
                    <input
                      type="text"
                      className="w-full bg-gray-900 text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm font-mono"
                      placeholder="Your placeholder"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization Component */}
            <YourVisualizer />
          </div>
        )}
      </div>
    </ProblemLayout>
  )
}
```

## Color Palette for Different Sections

### Problem Content
- Border: `from-cyan-500 to-blue-500`
- Background: `from-cyan-900/30 to-blue-900/30`

### Complexity Analysis
- Border: `from-purple-500 to-pink-500`
- Background: `from-purple-900/30 to-pink-900/30`

### Input Controls
- Border: `from-green-500 to-emerald-500`
- Background: `from-green-900/30 to-emerald-900/30`

### Additional Sections (rotate through these)
- `from-teal-500 to-cyan-500` / `from-teal-900/30 to-cyan-900/30`
- `from-indigo-500 to-purple-500` / `from-indigo-900/30 to-purple-900/30`
- `from-blue-500 to-cyan-500` / `from-blue-900/30 to-cyan-900/30`

## Typography Guidelines

1. **Headings**: Use `font-bold` for all headings
2. **Body Text**: Use `font-medium` and `text-gray-300`
3. **Code**: Use `font-mono` with semi-transparent backgrounds
4. **Input Labels**: Use `text-sm text-white font-medium` for high contrast on prismatic backgrounds
5. **Other Labels**: Use `font-bold` with `text-gray-300`

### Important: Input Field Labels
When adding input fields inside prismatic backgrounds (especially green/emerald), always use:
```tsx
<label className="block text-sm text-white font-medium mb-1">Your Label</label>
```
This ensures labels are readable against the semi-transparent colored backgrounds.

## Animation Guidelines

1. **Hover Scale**: Use `hover:scale-[1.01]` for subtle lift effect
2. **Transitions**: Use `transition-all duration-500`
3. **Group Hover**: Increase border opacity on hover from 75% to 100%

## Required Components to Style

When adding a new LeetCode problem, ensure ALL of these components get the segment-loop-master design:

### 1. Collapsible Components
- **Thinking Component** (Solution tab): Already styled with prismatic background
- **VisualizationThinking Component** (Visualization tab): Already styled with prismatic background
- Both use gradient borders and enhanced typography

### 2. Tab Navigation Components
All tab navigations must be centered with gradient borders:

- **Main Problem Tabs** (Problem/Solution/Visualization)
- **CodeRunner Tabs** (Solution Code/Test Cases)
- **CodeTabs** (JavaScript/Java/Python in visualization)
- **RunInIDE Tabs** (JavaScript/Java/Python language selection)

### 3. Content Sections
Apply prismatic backgrounds to these sections:

- **Problem Content**: Cyan/blue gradient
- **Complexity Analysis**: Purple/pink gradient
- **Custom Input Controls**: Green/emerald gradient
- **All other informational cards**: Rotate through available gradients

## Component Reusability

For common patterns, consider creating shared components:

```tsx
// Prismatic Card Component
export function PrismaticCard({ 
  gradientFrom, 
  gradientTo, 
  bgFrom, 
  bgTo, 
  children 
}) {
  return (
    <div className="relative group transition-all duration-500 hover:scale-[1.01]">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur`}></div>
      <div className={`relative bg-gradient-to-br ${bgFrom} ${bgTo} rounded-xl p-6 shadow-xl backdrop-blur-sm`}>
        {children}
      </div>
    </div>
  )
}
```

## Testing Your Implementation

1. **Visual Consistency**: Ensure all sections follow the prismatic design
2. **Hover Effects**: Test all hover animations work smoothly
3. **Typography**: Verify font weights are applied correctly
4. **Responsive Design**: Test on different screen sizes
5. **Tab Navigation**: Ensure tab styling matches other problem pages

## Common Pitfalls to Avoid

1. Don't use orange/red gradients (reserved for specific branding)
2. Don't forget the `font-medium` on body text
3. Don't use solid backgrounds - always use semi-transparent gradients
4. Don't forget the blur effect on gradient borders
5. Don't use different hover scales - stick to `hover:scale-[1.01]`

---

*Last updated: [Current Date]*
*For questions or updates to this guide, refer to IMPLEMENTATION_GUIDE.md*