# ephemeral-text

A minimalist, ephemeral text editor built with Tauri. It intentionally never auto-saves and never prompts you to save on close. Your text only persists when you explicitly export it.

## Core Philosophy

- No auto-saving
- No save prompts on close/quit
- Manual export only
- Non-destructive exports (auto-incremented filenames)
- Zero configuration to start writing

## Features

- Dark/light theme toggle
- Markdown-first editor (CodeMirror)
- Rich keyboard shortcuts for formatting
- Export to `.txt` or `.md`
- Configurable export directory
- Non-destructive file exports
- Last export display with quick reveal in Finder
- Custom title bar controls (minimize/maximize/close)
- Harper grammar checks with inline suggestions

## Keyboard Shortcuts

- Save: `Cmd/Ctrl + S`
- Bold: `Cmd/Ctrl + B`
- Italic: `Cmd/Ctrl + I`
- Headings: `Cmd/Ctrl + 1-6`
- Links: `Cmd/Ctrl + K`
- Code Block: `Cmd/Ctrl + Shift + C`
- Blockquote: `Cmd/Ctrl + Shift + Q`
- Strikethrough: `Cmd/Ctrl + Shift + S`
- List: `Cmd/Ctrl + Shift + L`
- Ordered List: `Cmd/Ctrl + Shift + O`
- Task List: `Cmd/Ctrl + Shift + T`
- Horizontal Rule: `Cmd/Ctrl + Shift + H`
- Image: `Cmd/Ctrl + Shift + I`
- Table: `Cmd/Ctrl + Shift + X`

## Development

### Prerequisites

- Node.js (LTS)
- npm
- Rust toolchain (for Tauri)

### Install

```bash
bun install
```

### Run (Tauri)

```bash
bun run tauri dev
```

### Run (Web only)

```bash
bun run dev
```

## Bun Notes

- This project uses Bun for JS deps and scripts.
- If you prefer npm, re-create `package-lock.json` with `npm install`.

## Notes

- Export directory selection currently uses a manual path prompt.

## Project Structure

```
.
├── index.html
├── src/
│   ├── main.ts
│   ├── components/
│   └── services/
└── src-tauri/
    └── src/
```
