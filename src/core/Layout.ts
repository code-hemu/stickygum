import { getClearedHeight } from '../utils/dom.js';

export interface LayoutDimensions {
  sidebarOffset: { top: number; left: number };
  containerTop: number;
  containerBottom: number;
  containerHeight: number;
  sidebarHeight: number;
  stickyHeight: number;
}

export class Layout {
  static measure(sidebar: HTMLElement, container: HTMLElement, stickySidebar: HTMLElement): LayoutDimensions {
    const sidebarRect = sidebar.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const stickyRect = stickySidebar.getBoundingClientRect();

    return {
      sidebarOffset: {
        top: sidebarRect.top + window.scrollY,
        left: sidebarRect.left + window.scrollX,
      },
      containerTop: sidebarRect.top,
      containerBottom: containerRect.top + window.scrollY + getClearedHeight(container),
      containerHeight: containerRect.height,
      sidebarHeight: sidebarRect.height,
      stickyHeight: stickyRect.height,
    };
  }

  static updateSidebarMinHeight(sidebar: HTMLElement, stickySidebar: HTMLElement, paddingBottom: number): void {
    const offsetTop = stickySidebar.getBoundingClientRect().top + window.scrollY;
    const sidebarOffsetTop = sidebar.getBoundingClientRect().top + window.scrollY;
    sidebar.style.minHeight = `${stickySidebar.offsetHeight + offsetTop - sidebarOffsetTop + paddingBottom}px`;
  }

  static resetSidebarMinHeight(sidebar: HTMLElement): void {
    sidebar.style.minHeight = '1px';
  }
}
