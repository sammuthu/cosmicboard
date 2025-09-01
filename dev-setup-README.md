
# Developer Setup - sammuthu.dev

Welcome to the Dev Setup that keeps me in the flow state. This README documents the exact tools, configurations, and optimizations used in my daily development environment.

## ⚙️ Core Package Management

### 🍺 Homebrew
I use [Homebrew](https://brew.sh) to install and manage all my CLI and GUI tools.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 📦 asdf
[asdf](https://asdf-vm.com) lets me manage multiple runtime versions of Java, Python, Node, and more.

```bash
brew install asdf
asdf plugin add java
asdf install java <version>
```

---

## 🎛️ Productivity Tools

### 🎹 Keyboard Maestro
Custom macros to automate:
- Video/audio processing
- Git workflows
- Launching projects
- AI-assisted context pasting

### 🧠 Alfred
Alfred replaces Spotlight with:
- Snippet expansion
- Clipboard history
- Web/Dev bookmarks
- Script automation

---

## 🖥️ Terminal & Shell

### 🧮 iTerm2 + Oh My Zsh + Powerlevel10k
Configured with:
- Git-aware prompt
- Aliases from `~/.zshrc`
- Color themes
- Claude integration

### 🧪 Terminal Claude Code
Claude is available via CLI using `claude-shell` inside terminal or via Windsurf agent.

---

## 🧰 IDE and AI Tools

### 🧠 IntelliJ IDEA (Ultimate)
- Claude Code terminal
- Windsurf plugin for AI pair programming
- FastAPI, Spring Boot, MongoDB plugins

### 🧠 Claude + GPT
- Claude 3.5 for documentation and insight generation
- GPT-4o for coding and automation logic

---

## 🗃️ Data Storage & Backend

### 🛢️ MongoDB
Installed locally with `/data/db` bind.
- Used for all hobby and POC projects.

### 🧭 MongoDB Compass
GUI for managing and visualizing MongoDB collections.

---

## 🔐 Dotfiles and Hidden Productivity

Dotfiles located in [`~/dotfiles`](https://github.com/sammuthuy/dotfiles):

- `.zshrc`: contains aliases, Claude CLI integration, git helpers.
- `.gitconfig`: includes prompt-enhancing features and ignore rules.
- `.tool-versions`: used by asdf to lock versions.
- `.aliases`: split and sourced into zshrc for clarity.
- `.keyboardmaestro`: syncs with backup Git repo.

---

## 📼 Future Integration Plan

When screen recordings are available, Claude Code should:

- Add `<VideoPlayer>` containers to `DevSetupIntro.tsx`.
- Use `hero` sections with call-to-action titles.
- Embed demos like:
  - 🖥️ Claude Code in IntelliJ terminal
  - 🧪 Prompt through Windsurf
  - 🎛️ Keyboard Maestro macros
  - 📂 Folder tree of `~/zScripts`

---

## 🧠 Claude Instructions

Claude, while rendering `DevSetupIntro.tsx`, please do the following:
1. Use headings + `<CodeBlock>` with `language="bash"` or `language="zsh"`.
2. Add grid layout with icons and section highlights.
3. Search `~/.zshrc`, `.aliases`, `.gitconfig`, and `.tool-versions` for relevant insight.
4. Detect CLI tools and display visually (e.g., fig, bat, fzf if found).
5. Look for synced script folders: `~/zScripts`, `~/dotfiles`, and include in output if present.
