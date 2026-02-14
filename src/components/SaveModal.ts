export class SaveModal {
  private saveModal: HTMLElement;
  private saveAsMdBtn: HTMLElement;
  private saveAsTxtBtn: HTMLElement;
  private onSaveCallback?: (extension: '.md' | '.txt') => void;

  constructor() {
    this.saveModal = document.getElementById('save-modal')!;
    this.saveAsMdBtn = document.getElementById('save-as-md')!;
    this.saveAsTxtBtn = document.getElementById('save-as-txt')!;
    this.saveModal.setAttribute('tabindex', '-1');
    this.initializeModal();
  }

  private initializeModal() {
    this.saveModal.addEventListener('click', (e) => {
      if (e.target === this.saveModal) {
        this.hide();
      }
    });
  }

  public show(onSave: (extension: '.md' | '.txt') => void) {
    this.onSaveCallback = onSave;
    this.saveModal.classList.remove('hidden');
    (this.saveModal as HTMLElement).focus();
    this.saveAsMdBtn.focus();

    // Set up event listeners
    const handleMdSave = () => {
      this.onSaveCallback?.('.md');
      this.hide();
    };

    const handleTxtSave = () => {
      this.onSaveCallback?.('.txt');
      this.hide();
    };

    const handleKeyNav = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        return;
      }

      const currentFocus = document.activeElement;

      // Arrow keys or Tab
      if (e.key === 'Tab' || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (currentFocus === this.saveAsMdBtn) {
          this.saveAsTxtBtn.focus();
        } else {
          this.saveAsMdBtn.focus();
        }
      }

      // Enter triggers click
      if (e.key === 'Enter' && (currentFocus === this.saveAsMdBtn || currentFocus === this.saveAsTxtBtn)) {
        (currentFocus as HTMLElement).click();
      }
    };

    const cleanup = () => {
      this.saveAsMdBtn.removeEventListener('click', handleMdSave);
      this.saveAsTxtBtn.removeEventListener('click', handleTxtSave);
      this.saveModal.removeEventListener('keydown', handleKeyNav);
    };

    this.saveAsMdBtn.addEventListener('click', handleMdSave);
    this.saveAsTxtBtn.addEventListener('click', handleTxtSave);
    this.saveModal.addEventListener('keydown', handleKeyNav);

    // Store cleanup function for later use
    (this.saveModal as any)._cleanup = cleanup;
  }

  public hide() {
    this.saveModal.classList.add('hidden');
    // Clean up event listeners
    if ((this.saveModal as any)._cleanup) {
      (this.saveModal as any)._cleanup();
      (this.saveModal as any)._cleanup = null;
    }
  }
}
