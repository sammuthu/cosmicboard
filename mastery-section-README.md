# 🧠 Programming Mastery Section

This README serves as a detailed guide for generating the `Programming Mastery` section of the portfolio site. It outlines the folder structure, conventions, and reusable components required for building visually engaging, deeply educational walkthroughs of problem-solving exercises — starting with Leetcode problems.

---

## 🗂️ Folder Structure

```txt
src/
└── app/
    └── mastery/
        ├── index.tsx                  # Landing page for Programming Mastery
        ├── java/                      # Java mastery pages (lightweight, conceptual)
        ├── javascript/                # JavaScript mastery pages
        ├── python/                    # Python mastery pages
        ├── leetcode/                  # Problem-by-problem walkthrough
        │   ├── 1_Two_Sum_Problem/
        │   │   ├── Problem.md         # Markdown explanation of the problem
        │   │   ├── solution.ts        # Solution code
        │   │   ├── Visual.tsx         # React visualizer (Claude-generated)
        │   │   └── index.tsx          # Unified problem page
        └── shared/
            ├── ProblemLayout.tsx
            ├── CodeRunner.tsx
            └── VisualCanvas.tsx       # Reusable canvas/framer-motion animation base
```

---

## 📦 Problem Folder Naming Convention

Each Leetcode problem should have a unique folder named:

```
<number>_<kebab_or_title_cased_name>
```

Examples:
- `1_Two_Sum_Problem`
- `17_Letter_Combinations_Phone`
- `111_Balanced_Binary_Tree`

---

## 📋 What Claude Code Should Do Per Problem

For each problem, Claude Code should generate:

1. `Problem.md`
   - Restate the prompt with examples and constraints.
   - Optional: Include thinking strategy and edge case discussion.

2. `solution.ts`
   - Type-safe, readable code implementation.
   - Clear comments for each decision step.

3. `Visual.tsx`
   - Uses canvas or Framer Motion to animate:
     - Loop iterations
     - Array highlighting
     - Pointer movement
     - Conditional branches

4. `index.tsx`
   - Imports and arranges:
     - `Problem.md` as description
     - Solution code via `CodeBlock`
     - `Visual.tsx` animation
     - Optional hint or notes section

---

## 🔁 Reusable Animation System

Located at `shared/VisualCanvas.tsx`, this should:

- Accept an array of `ExecutionStep` objects like:

```ts
interface ExecutionStep {
  line: number; // source line number
  variables: Record<string, number>; // variable states
  highlights: number[]; // array indices being accessed
}
```

- Animate these steps with:
  - Timeline scrubber
  - Play/pause loop
  - Variable state display
  - Highlighted array visualization

---

## ✨ UI Theme and Feel

- Use intuitive styles:
  - Dark mode friendly
  - Programmer-themed fonts (e.g. Fira Code, JetBrains Mono)
  - Simple intuitive visuals that would interest a software engineer

---

## ✅ Future Expansion

- New problems can be added as new folders with a numbered prefix.
- Claude can be prompted to work on specific problems like:

```
"Please generate Leetcode/111_Container_With_Most_Water using the Mastery README specs"
```

- This makes the system scalable to 500–1000+ problems, and supports continuous learning.

---

Built with ❤️ by Sam Muthu
