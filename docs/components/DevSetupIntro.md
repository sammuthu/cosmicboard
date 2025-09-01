# DevSetupIntro Component Documentation

## Overview
The `DevSetupIntro.tsx` component is a showcase section that presents the developer's tooling setup and workflow optimizations. It serves as both an informational display and a visual demonstration of the developer's technical environment.

## Location
`src/components/DevSetupIntro.tsx`

## Purpose
- Display the developer's technology stack and tools
- Showcase dotfiles configuration
- Provide a visual terminal simulation
- Create an engaging introduction to the developer's workflow

## Component Structure

### Main Section
- **ID**: `dev-setup`
- **Styling**: Full-height section with gradient background (gray-50 to slate-50)
- **Layout**: Responsive grid with two columns on large screens

### Left Column Content
1. **Header**: "💻 Dev Setup That Makes Me 10x Faster"
2. **Introduction paragraph**: Personal note about 20+ years of optimization
3. **Three info cards**:
   - **My Stack** (`#my-stack`): 2x2 grid showing Editor, Terminal, AI, and Deploy tools
   - **Dotfiles** (`#dotfiles`): Description and GitHub link
   - **Tools Review** (`#tools-review`): Teaser about honest tool reviews

### Right Column Content
- **Terminal Simulation**: Mock iTerm2 window showing:
  - Zsh prompt with user/path display
  - Morning routine script execution
  - Status messages for various checks
  - Animated cursor

## Current Implementation Details

### Technologies Displayed
- **Editor**: Cursor + Windsurf
- **Terminal**: iTerm + Oh My Zsh
- **AI**: Claude + GPT-4
- **Deploy**: Vercel + Railway

### Styling Classes
- Cards: `bg-white p-6 rounded-xl shadow-lg`
- Terminal: `bg-gray-900 text-green-400 p-8 rounded-2xl font-mono text-sm`
- Category labels: Color-coded (blue, green, purple, orange)

## Future Enhancement Opportunities

Based on the dev-setup-README.md instructions, the component should be enhanced to include:

### 1. Code Blocks Integration
- Add `<CodeBlock>` components with `language="bash"` or `language="zsh"`
- Display actual installation commands from the README

### 2. Expanded Tool Coverage
Add sections for:
- **Package Management**: Homebrew, asdf
- **Productivity Tools**: Keyboard Maestro, Alfred
- **IDE Integration**: IntelliJ IDEA Ultimate with Claude Code terminal
- **Data Storage**: MongoDB with Compass

### 3. Interactive Elements
- Video player containers for future screen recordings
- Hero sections with call-to-action titles
- Demos for:
  - Claude Code in IntelliJ terminal
  - Windsurf prompts
  - Keyboard Maestro macros
  - `~/zScripts` folder structure

### 4. Dynamic Content
- Search and display content from:
  - `~/.zshrc`
  - `.aliases`
  - `.gitconfig`
  - `.tool-versions`
- Detect and visualize CLI tools (fig, bat, fzf)

### 5. Grid Layout Enhancement
- Implement icon-based grid for each tool category
- Add visual highlights for different sections
- Create expandable sections for detailed configurations

## Dependencies
- Next.js 13+ (uses 'use client' directive)
- React
- Tailwind CSS for styling

## Accessibility Considerations
- Semantic HTML with proper heading hierarchy
- Contrast ratios for terminal simulation
- Responsive design for mobile devices

## Performance Notes
- Client-side component (may impact initial load)
- Consider lazy loading for future video content
- Static content could be optimized with server components

## Related Components
- Should integrate with `CodeBlock` component for code display
- May require `VideoPlayer` component for future demos
- Could benefit from tooltip/popover components for tool details