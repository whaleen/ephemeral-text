type PromptOptions = {
  placeholder?: string;
  initialValue?: string;
};

export class PromptModal {
  private modal: HTMLElement;
  private inputEl: HTMLInputElement;
  private resolve?: (value: string | null) => void;

  constructor() {
    this.modal = document.getElementById('prompt-modal')!;
    this.inputEl = document.getElementById('prompt-input') as HTMLInputElement;
    this.initialize();
  }

  private initialize() {
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.cancel();
      }
    });

    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.confirm();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.cancel();
      }
    });
  }

  async show(options: PromptOptions): Promise<string | null> {
    this.inputEl.placeholder = options.placeholder ?? '';
    this.inputEl.value = options.initialValue ?? '';

    this.modal.classList.remove('hidden');
    this.inputEl.focus();
    this.inputEl.select();

    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  private cleanup() {
    this.modal.classList.add('hidden');
    if (this.resolve) {
      this.resolve = undefined;
    }
  }

  private confirm() {
    const value = this.inputEl.value.trim();
    const resolver = this.resolve;
    this.cleanup();
    resolver?.(value ? value : null);
  }

  private cancel() {
    const resolver = this.resolve;
    this.cleanup();
    resolver?.(null);
  }
}
