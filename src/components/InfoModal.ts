export class InfoModal {
  private infoToggle: HTMLElement;
  private infoOverlay: HTMLElement;

  constructor() {
    this.infoToggle = document.getElementById('info-toggle')!;
    this.infoOverlay = document.getElementById('info-overlay')!;
    this.initializeModal();
  }

  private initializeModal() {
    this.infoToggle.addEventListener('click', () => this.toggleModal());
    this.infoOverlay.addEventListener('click', (e) => {
      if (e.target === this.infoOverlay) {
        this.hideModal();
      }
    });
  }

  private toggleModal() {
    this.infoOverlay.classList.toggle('hidden');
  }

  private hideModal() {
    this.infoOverlay.classList.add('hidden');
  }

  public hide() {
    this.hideModal();
  }

  public show() {
    this.infoOverlay.classList.remove('hidden');
  }
}