# Modular Instructions for Claude (Next.js + TypeScript Project)

This project is built with **Next.js (App Router)** and **TypeScript (.tsx)**. The structure uses modular layout and components under `src/app` and `src/components`.

---

## 🧠 Claude Instruction Goals
Claude, your task is to assist with modular content development and placeholder scaffolding in this active project. The objective is to:

1. **Modularize content** to prevent hallucination or file bloat.
2. **Create new sections** (e.g., GPT, Claude, Windsurf) by scaffolding their layout and placeholder components.
3. **Support drop-in authoring** for new content inside well-isolated `.tsx` files.

---

## 🗂️ Existing Folder Structure (Relevant)
```
src/
├── app/
│   └── about/              ➝ Informational page (Next.js route)
│       └── page.tsx        ➝ Page-level component
├── components/             ➝ Shared reusable components
│   ├── Navigation.tsx
│   ├── PortfolioSections.tsx
│   ├── ThemeSwitcher.tsx
│   ├── TrendingBar.tsx
│   ├── VideoPlayer.tsx
```

---

## 🛠️ Instructions to Claude

### 1. 🔧 Create Placeholders for Key Content Areas
Add subfolders and starter `page.tsx` files for the following:

- `/src/app/gpt/page.tsx`
- `/src/app/windsurf/page.tsx`
- `/src/app/claude/page.tsx`
- `/src/app/zscripts/page.tsx`
- `/src/app/projects/page.tsx`
- `/src/app/devsetup/page.tsx`

Each `page.tsx` file should:
- Use the existing `layout.tsx` wrapper.
- Import and render a placeholder React component (e.g. `<GPTIntro />`).
- Put that component in `/src/components/` for modular editing.

Example:
```tsx
// src/app/gpt/page.tsx
import GPTIntro from '@/components/GPTIntro';

export default function Page() {
  return <GPTIntro />;
}
```

Then create the placeholder:
```tsx
// src/components/GPTIntro.tsx
export default function GPTIntro() {
  return <div>🚀 GPT Placeholder – content to be inserted here</div>;
}
```

---

### 2. 📄 When We Provide Content
When content is shared in Markdown or HTML snippets:
- Identify which section (e.g. GPT, Windsurf) it belongs to.
- Append or insert that content into the corresponding component (like `GPTIntro.tsx`).
- If content is rich (with `details`, `code`, or `media`), structure it using semantic HTML.

---

### 3. 💡 General Claude Guidelines
- Avoid touching global files like `layout.tsx` unless requested.
- Always use relative imports (e.g., `@/components/FooBar`)
- Maintain consistent file naming with PascalCase for components.

---

## ✅ Deliverables Checklist
Claude should:

- [ ] Create folder structure for each major section.
- [ ] Create modular components for each.
- [ ] Insert placeholder content as starter.
- [ ] Accept future content blocks and insert them into correct file.
- [ ] Avoid long files – break large content logically.

---

Once scaffolded, we will start inserting authored sections. Begin with `GPTIntro.tsx` as our first block.