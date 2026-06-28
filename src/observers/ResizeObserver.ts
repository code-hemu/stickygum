export class SidebarResizeObserver {
  private observer: ResizeObserver | null = null;
  private callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  observe(target: HTMLElement): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.observer = new ResizeObserver(() => {
      this.callback();
    });
    this.observer.observe(target);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}


