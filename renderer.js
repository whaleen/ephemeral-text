// renderer.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const editor = document.getElementById('editor');
    const downloadMarkdownBtn = document.getElementById('download-markdown');
    const downloadTxtBtn = document.getElementById('download-txt');

    // Focus on the editor when the page loads
    editor.focus();

    function wrapText(before, after, defaultText) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const textToWrap = selectedText || defaultText;
        const newText = before + textToWrap + after;

        editor.focus();
        editor.setSelectionRange(start, end);
        document.execCommand('insertText', false, newText);

        const newCursorPos = selectedText ? start + newText.length : start + before.length + defaultText.length;
        editor.setSelectionRange(newCursorPos, newCursorPos);
    }

    // Keyboard shortcuts for markdown formatting
    editor.addEventListener('keydown', (e) => {
        // Bold
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            wrapText('**', '**', 'strong text');
        }
        // Italic
        if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
            e.preventDefault();
            wrapText('_', '_', 'emphasized text');
        }
        // Headings (h1-h6)
        if ((e.metaKey || e.ctrlKey) && /^[1-6]$/.test(e.key)) {
            e.preventDefault();
            const level = e.key;
            const hashes = '#'.repeat(parseInt(level));
            wrapText(`${hashes} `, '', 'heading');
        }
        // Link
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            wrapText('[', '](url)', 'link text');
        }
        // Code block
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            wrapText('```\n', '\n```', 'code');
        }
        // Blockquote
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Q') {
            e.preventDefault();
            wrapText('> ', '', 'quote');
        }
    });

    // List and markdown auto-completion
    let lastChar = '';
    editor.addEventListener('input', (e) => {
        const cursorPos = editor.selectionStart;
        const text = editor.value;
        const currentLine = text.substring(0, cursorPos).split('\n').pop();

        if (e.inputType === 'insertText') {
            // Handle unordered lists
            if (currentLine === '- ') {
                const start = cursorPos - 2;
                editor.setSelectionRange(start, cursorPos);
                document.execCommand('insertText', false, '• ');
            }

            // Handle ordered lists
            if (lastChar === '.' && /^\d+\.$/.test(currentLine)) {
                const paddedNum = currentLine.slice(0, -1).padStart(2, ' ');
                const start = cursorPos - currentLine.length;
                editor.setSelectionRange(start, cursorPos);
                document.execCommand('insertText', false, `${paddedNum}. `);
            }

            // Handle italic (*text*)
            if (e.data === '*' && cursorPos > 1) {
                const text = editor.value;
                const beforeCursor = text.substring(0, cursorPos - 1);
                const matchStart = beforeCursor.lastIndexOf('*');
                if (matchStart >= 0 && beforeCursor[matchStart - 1] !== '*') {
                    const content = text.substring(matchStart + 1, cursorPos - 1);
                    if (content && !content.includes('\n')) {
                        const start = matchStart;
                        editor.setSelectionRange(start, cursorPos);
                        document.execCommand('insertText', false, content);
                        editor.classList.add('flash');
                        setTimeout(() => editor.classList.remove('flash'), 150);
                    }
                }
            }

            // Handle code blocks (```language\ncode\n```)
            if (e.data === '`' && cursorPos > 4) {
                const beforeCursor = text.substring(0, cursorPos - 1);
                if (beforeCursor.endsWith('```')) {
                    const matchStart = beforeCursor.lastIndexOf('```');
                    if (matchStart >= 0) {
                        const codeContent = text.substring(matchStart + 3, cursorPos - 3);
                        if (codeContent && codeContent.includes('\n')) {
                            const firstNewline = codeContent.indexOf('\n');
                            const language = codeContent.substring(0, firstNewline).trim();
                            const code = codeContent.substring(firstNewline + 1).trim();
                            if (language && code) {
                                const start = matchStart;
                                editor.setSelectionRange(start, cursorPos);
                                document.execCommand('insertText', false, code);
                                editor.setSelectionRange(start, start + code.length);
                                flashSelection(start, start + code.length);
                            }
                        }
                    }
                }
            }

            // Handle links [text](url)
            if (e.data === ')' && cursorPos > 5) {
                const beforeCursor = text.substring(0, cursorPos);
                const linkRegex = /\[([^\]]+)\]\([^)]+\)/;
                const lastLink = beforeCursor.match(linkRegex);
                if (lastLink && lastLink.index !== -1) {
                    const start = lastLink.index;
                    const matched = lastLink[0];
                    const linkText = lastLink[1];
                    if (beforeCursor.endsWith(matched)) {
                        editor.setSelectionRange(start, cursorPos);
                        document.execCommand('insertText', false, linkText);
                        editor.setSelectionRange(start, start + linkText.length);
                    }
                }
            }

            // Handle blockquotes
            if (currentLine === '> ') {
                const start = cursorPos - 2;
                editor.setSelectionRange(start, cursorPos);
                document.execCommand('insertText', false, '│ ');
            }
        }

        lastChar = e.data || '';
    });

    // Theme toggle logic (existing code)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    }

    themeToggle.addEventListener('click', () => {
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            console.log('Switched to light mode');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            console.log('Switched to dark mode');
        }
    });

    // Info overlay toggle
    const infoToggle = document.getElementById('info-toggle');
    const infoOverlay = document.getElementById('info-overlay');

    infoToggle.addEventListener('click', () => {
        infoOverlay.classList.toggle('hidden');
    });

    // Click outside to close
    infoOverlay.addEventListener('click', (e) => {
        if (e.target === infoOverlay) {
            infoOverlay.classList.add('hidden');
        }
    });

    // Save file to export directory
    let lastExportInterval;
    let lastExportPath;

    async function checkLastExportExists() {
        if (lastExportPath) {
            const exists = await window.electron.checkFileExists(lastExportPath);
            const lastExportContainer = document.getElementById('last-export-container');
            const lastExportDot = document.getElementById('last-export-dot');

            if (!exists) {
                lastExportContainer.classList.add('hidden');
                lastExportDot.classList.add('hidden');
                if (lastExportInterval) {
                    clearInterval(lastExportInterval);
                    lastExportInterval = null;
                }
            }
        }
    }

    async function saveFile(extension, content) {
        try {
            // Clear previous file check interval
            if (lastExportInterval) {
                clearInterval(lastExportInterval);
                lastExportInterval = null;
            }

            const exportDir = await window.electron.getExportDirectory();
            if (!exportDir) {
                throw new Error('No export directory selected');
            }

            const filenameInput = document.getElementById('filename-input');
            const filename = `${filenameInput.value}${extension}`;

            const response = await window.electron.saveFile(exportDir, filename, content);
            const savedPath = response.path || `${exportDir}/${filename}`;
            console.log(`File saved successfully: ${filename}`);

            // Update last export display
            const lastExportContainer = document.getElementById('last-export-container');
            const lastExportEl = document.getElementById('last-export');
            const lastExportDot = document.getElementById('last-export-dot');

            lastExportEl.textContent = `Last export: ${truncatePath(savedPath)}`;
            lastExportContainer.classList.remove('hidden'); // Show the entire container
            lastExportDot.classList.remove('hidden'); // Show the green dot

            // Update last export path and start checking if it exists
            lastExportPath = savedPath;
            lastExportInterval = setInterval(checkLastExportExists, 2000);

            lastExportContainer.onclick = async () => {
                await window.electron.showItemInFolder(savedPath);
            };

        } catch (error) {
            console.error('Failed to save file:', error);
        }
    }

    downloadMarkdownBtn.addEventListener('click', async () => {
        const content = editor.value;
        await saveFile('.md', content);
    });

    downloadTxtBtn.addEventListener('click', async () => {
        const content = editor.value;
        await saveFile('.txt', content);
    });


    // Export directory functionality
    const exportDirBtn = document.getElementById('export-dir-btn');
    const exportDirDisplay = document.getElementById('export-dir-display');

    // Path truncation utility
    function truncatePath(path, maxLength = 40) {
        if (path.length <= maxLength) {
            return path;
        }

        const ellipsis = '...';
        const charsToShow = maxLength - ellipsis.length;
        const frontChars = Math.ceil(charsToShow / 2);
        const backChars = Math.floor(charsToShow / 2);

        return path.substring(0, frontChars) +
            ellipsis +
            path.substring(path.length - backChars);
    }

    // Update export directory display
    async function updateExportDirDisplay() {
        const dir = await window.electron.getExportDirectory();
        const truncatedPath = truncatePath(dir);
        exportDirDisplay.textContent = `Export to: ${truncatedPath}`;
    }

    exportDirBtn.addEventListener('click', async () => {
        const newDir = await window.electron.selectExportDirectory();
        if (newDir) {
            await window.electron.setExportDirectory(newDir);
            await updateExportDirDisplay();
        }
    });

    // Initialize export directory display
    updateExportDirDisplay();

    // Window controls
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');

    minimizeBtn.addEventListener('click', () => {
        window.electron.windowControls.minimize();
    });

    maximizeBtn.addEventListener('click', () => {
        window.electron.windowControls.maximize();
    });

    closeBtn.addEventListener('click', () => {
        window.electron.windowControls.close();
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Save shortcut
        if ((event.metaKey || event.ctrlKey) && event.key === 's') {
            event.preventDefault();
            const saveModal = document.getElementById('save-modal');
            const saveAsMdBtn = document.getElementById('save-as-md');
            const saveAsTxtBtn = document.getElementById('save-as-txt');

            saveModal.classList.remove('hidden');
            saveAsMdBtn.tabIndex = 1;
            saveAsTxtBtn.tabIndex = 2;

            // Auto-focus first button
            saveAsMdBtn.focus();

            const closeModal = () => {
                saveModal.classList.add('hidden');
                saveAsMdBtn.removeEventListener('click', handleMdSave);
                saveAsTxtBtn.removeEventListener('click', handleTxtSave);
                document.removeEventListener('keydown', handleKeyNav);
                saveModal.removeEventListener('click', handleOutsideClick);
            };

            const handleMdSave = async () => {
                await saveFile('.md', editor.value);
                closeModal();
            };

            const handleTxtSave = async () => {
                await saveFile('.txt', editor.value);
                closeModal();
            };

            const handleKeyNav = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    return;
                }

                const currentFocus = document.activeElement;

                // Arrow keys or Tab
                if (e.key === 'Tab' || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                    if (currentFocus === saveAsMdBtn) {
                        saveAsTxtBtn.focus();
                    } else {
                        saveAsMdBtn.focus();
                    }
                }

                // Enter triggers click
                if (e.key === 'Enter' && (currentFocus === saveAsMdBtn || currentFocus === saveAsTxtBtn)) {
                    currentFocus.click();
                }
            };

            const handleOutsideClick = (e) => {
                if (e.target === saveModal) {
                    closeModal();
                }
            };

            saveAsMdBtn.addEventListener('click', handleMdSave);
            saveAsTxtBtn.addEventListener('click', handleTxtSave);
            document.addEventListener('keydown', handleKeyNav);
            saveModal.addEventListener('click', handleOutsideClick);
        }

        // Fullscreen shortcut (Cmd/Ctrl + Shift + F)
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
            event.preventDefault();
            window.electron.windowControls.toggleFullScreen();
        }

        // Handle ESC key for overlays
        if (event.key === 'Escape') {
            event.preventDefault();
            const infoOverlay = document.getElementById('info-overlay');
            const saveModal = document.getElementById('save-modal');

            if (!infoOverlay.classList.contains('hidden')) {
                infoOverlay.classList.add('hidden');
            } else if (!saveModal.classList.contains('hidden')) {
                saveModal.classList.add('hidden');
            }
        }
    });
});
