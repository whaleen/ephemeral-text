import { TitleBar } from './components/TitleBar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { ThemeManager } from './components/ThemeManager';
import { InfoModal } from './components/InfoModal';
import { SaveModal } from './components/SaveModal';
import { FileExportService } from './services/FileExportService';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';

class EphemeralTextApp {
  private editor: MarkdownEditor;
  private infoModal: InfoModal;
  private saveModal: SaveModal;
  private fileExportService: FileExportService;

  constructor() {
    new TitleBar();
    this.editor = new MarkdownEditor('editor');
    new ThemeManager();
    this.infoModal = new InfoModal();
    this.saveModal = new SaveModal();
    this.fileExportService = new FileExportService();
    
    this.initializeKeyboardShortcuts();
    this.initializeExportButtons();
    this.fileExportService.setupExportDirectoryButton();
    this.initializeExternalLinks();
  }

  private initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      const isCmd = event.metaKey || event.ctrlKey;

      // Save shortcut
      if (isCmd && event.key === 's') {
        event.preventDefault();
        this.showSaveModal();
      }

      // Close window shortcut
      if (isCmd && event.key === 'w') {
        event.preventDefault();
        this.closeWindow();
      }

      // New window shortcut
      if (isCmd && event.key === 'n') {
        event.preventDefault();
        this.createNewWindow();
      }


      // Fullscreen toggle
      if (isCmd && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        this.toggleFullscreen();
      }

      // Handle ESC key for overlays
      if (event.key === 'Escape') {
        event.preventDefault();
        this.exitFullscreenIfNeeded();
        this.infoModal.hide();
        this.saveModal.hide();
      }
    });
  }


  private async toggleFullscreen() {
    try {
      const window = getCurrentWindow();
      const isFullscreen = await window.isFullscreen();
      await window.setFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  }

  private async closeWindow() {
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  }

  private async exitFullscreenIfNeeded() {
    try {
      const window = getCurrentWindow();
      const isFullscreen = await window.isFullscreen();
      if (isFullscreen) {
        await window.setFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }

  private async createNewWindow() {
    try {
      await invoke('create_window');
    } catch (error) {
      console.error('Failed to create new window:', error);
    }
  }

  private initializeExportButtons() {
    const downloadMdBtn = document.getElementById('download-markdown');
    const downloadTxtBtn = document.getElementById('download-txt');

    downloadMdBtn?.addEventListener('click', () => {
      this.exportFile('.md');
    });

    downloadTxtBtn?.addEventListener('click', () => {
      this.exportFile('.txt');
    });
  }

  private showSaveModal() {
    this.saveModal.show((extension) => {
      this.exportFile(extension);
    });
  }

  private async exportFile(extension: '.md' | '.txt') {
    const content = this.editor.getValue();
    const filenameInput = document.getElementById('filename-input') as HTMLInputElement;
    const filename = (filenameInput.value || 'ephemeral-text') + extension;
    
    const result = await this.fileExportService.saveFile(filename, content);
    
    if (result) {
      console.log(`Successfully exported file: ${result}`);
    } else {
      console.error('Failed to export file');
    }
  }

  private initializeExternalLinks() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('[data-external]') as HTMLAnchorElement | null;
      if (!link) return;

      event.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        open(href);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new EphemeralTextApp();
});
