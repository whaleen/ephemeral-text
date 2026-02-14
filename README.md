# ephemeral-text

A minimalist, ephemeral text editor built with Tauri. It intentionally never auto-saves and never prompts you to save on close. Your text only persists when you explicitly export it.

Legacy Electron version lives on `legacy-electron`:
- https://github.com/whaleen/ephemeral-text/tree/legacy-electron

## Core Philosophy

- No auto-saving
- No save prompts on close/quit
- Manual export only
- Non-destructive exports (auto-incremented filenames)
- Zero configuration to start writing

## Features

- Dark/light theme toggle
- Rich Markdown editor with live formatting (TipTap)
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
- Bun
- Rust toolchain (for Tauri)

### Install

```bash
bun install
```

### Run (Desktop)

```bash
bun run tauri dev
```

### Run (Web only)

```bash
bun run dev
```

### Build (Desktop)

```bash
bun run tauri build
```

## Bun Notes

- This project uses Bun for JS deps and scripts.

## Notes

- Export directory selection uses a native folder picker.

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
