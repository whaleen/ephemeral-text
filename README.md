# ephemeral-text

A minimalist text editor that respects ephemerality. It's designed as a TextEdit alternative that intentionally doesn't auto-save files or prompt for saving. Your text remains ephemeral until you explicitly choose to export it.

## Core Philosophy

- **No Auto-saving**: The editor never automatically saves your work
- **No Save Prompts**: Closing windows or quitting never triggers save dialogs
- **Manual Export Only**: Text persists only when you explicitly export it
- **Non-destructive**: Exports never overwrite existing files (auto-incrementing suffixes)
- **Zero Configuration**: No settings to manage, just pure text editing

## Features

- 🌙 Dark/Light theme support
- ✍️ Markdown shortcuts and formatting
- 💾 Export to .txt or .md
- ⌨️ Rich keyboard shortcuts
- 📁 Configurable export directory
- 🔄 Non-destructive file exports

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd ephemeral-text

# Install dependencies
npm install
```

### Development Scripts

```bash
# Start development environment with hot reload
npm run dev

# Build CSS only
npm run build:css

# Watch CSS changes
npm run watch:css

# Build the application for distribution
npm run build

# Build macOS distribution
npm run dist
```

### Project Structure

```
.
├── main.js           # Electron main process
├── preload.js        # Preload script for secure IPC
├── renderer.js       # Renderer process logic
├── index.html        # Main application window
├── src/
│   └── input.css    # Tailwind CSS input
├── public/
│   └── tailwind.css # Generated CSS
```

## Architecture

### Main Process (`main.js`)

- Window management
- File system operations
- IPC event handling
- Export directory management
- Native OS dialog integration

### Preload Script (`preload.js`)

- Secure bridge between renderer and main processes
- Exposes controlled subset of Electron APIs
- Handles window controls and file operations

### Renderer Process (`renderer.js`)

- Text editor functionality
- Theme management
- Markdown shortcuts
- UI event handling
- Export operations

## Key Features Implementation

### Export System

- Uses a designated export directory
- Never overwrites existing files
- Auto-increments filenames (e.g., `note.md`, `note (1).md`)
- Supports both .txt and .md formats
- Maintains export history with clickable links

### Theme Support

- System-based auto-detection
- Manual toggle available
- Persists across sessions
- Tailwind CSS dark mode integration

### Markdown Support

- Keyboard shortcuts for common formatting
- Auto-completion for lists and code blocks
- Preview mode (to be implemented)
- Common shortcuts:
  - **Bold**: ⌘/Ctrl + B
  - _Italic_: ⌘/Ctrl + I
  - Headers: ⌘/Ctrl + 1-6
  - Links: ⌘/Ctrl + K
  - Code Blocks: ⌘/Ctrl + Shift + C
  - Blockquotes: ⌘/Ctrl + Shift + Q

### Window Management

- Frameless window with custom controls
- Draggable regions
- Minimize/Maximize/Close functionality
- Full-screen support

## Contributing

### Development Workflow

1. Create a feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request
5. Address review feedback

### Code Style

- Use ES6+ features
- Maintain consistent indentation (2 spaces)
- Follow existing naming conventions
- Comment complex logic
- Use JSDoc for function documentation

### Testing

- Test export functionality thoroughly
- Verify theme switching
- Check keyboard shortcuts
- Validate file name conflict handling
- Test window controls

## Building for Distribution

```bash
# Build for macOS
npm run dist

# Outputs:
# - DMG installer
# - ZIP archive
```

### Distribution Configuration

- Configured in `package.json` under `build` key
- Includes:
  - App icon
  - Bundle ID
  - macOS category
  - Target formats
  - Dark mode support

## Roadmap

### Planned Features

- Markdown preview
- File drag-and-drop support
- Custom export templates
- Extended keyboard shortcuts
- Search/Replace functionality
- Word count statistics

### Under Consideration

- Multi-window support
- Custom themes
- Plugin system
- Collaborative editing
- Cloud export integration

## Technical Notes

### Security Considerations

- Uses contextIsolation for renderer process
- Implements secure IPC communication
- Restricts file system access to export directory
- Validates all user inputs

### Performance

- Lightweight core functionality
- Efficient file handling
- Minimal resource usage
- No background processes

## Support

### Known Issues

- Document and track known issues here
- Include workarounds where available
- Update as issues are resolved

### Troubleshooting

- List common problems and solutions
- Include debugging steps
- Provide contact information for support
