import type { Options } from '../defaults.js';
import { getOffset, getOuterWidth } from '../utils/dom.js';
import { getFloat } from '../utils/css.js';

export type PositionType = 'static' | 'fixed' | 'absolute';

export interface PositionResult {
  position: PositionType;
  top: number;
}

export class Position {
  static calculate(
    sidebar: HTMLElement,
    container: HTMLElement,
    stickySidebar: HTMLElement,
    options: Options,
    paddingTop: number,
    paddingBottom: number,
    marginBottom: number,
    previousScrollTop: number,
  ): PositionResult {
    const scrollTop = window.scrollY;
    let position: PositionType = 'static';
    const sidebarOffset = getOffset(sidebar);
    let top = 0;

    if (scrollTop >= sidebarOffset.top + (paddingTop - options.additionalMarginTop)) {
      const offsetTop = paddingTop + options.additionalMarginTop;
      const offsetBottom = paddingBottom + marginBottom + options.additionalMarginBottom;

      const containerTop = sidebarOffset.top;
      const containerBottom = sidebarOffset.top + Position.getClearedContainerHeight(container);

      const windowOffsetTop = options.additionalMarginTop;
      let windowOffsetBottom: number;

      const sidebarSmallerThanWindow = (stickySidebar.offsetHeight + offsetTop + offsetBottom) < window.innerHeight;
      if (sidebarSmallerThanWindow) {
        windowOffsetBottom = windowOffsetTop + stickySidebar.offsetHeight;
      } else {
        windowOffsetBottom = window.innerHeight - marginBottom - paddingBottom - options.additionalMarginBottom;
      }

      const staticLimitTop = containerTop - scrollTop + paddingTop;
      const staticLimitBottom = containerBottom - scrollTop - paddingBottom - marginBottom;

      top = getOffset(stickySidebar).top - scrollTop;
      const scrollTopDiff = previousScrollTop - scrollTop;

      if (getComputedStyle(stickySidebar).position === 'fixed') {
        if (options.sidebarBehavior === 'modern') {
          top += scrollTopDiff;
        }
      }

      if (options.sidebarBehavior === 'stick-to-top') {
        top = options.additionalMarginTop;
      }

      if (options.sidebarBehavior === 'stick-to-bottom') {
        top = windowOffsetBottom - stickySidebar.offsetHeight;
      }

      if (scrollTopDiff > 0) {
        top = Math.min(top, windowOffsetTop);
      } else {
        top = Math.max(top, windowOffsetBottom - stickySidebar.offsetHeight);
      }

      top = Math.max(top, staticLimitTop);
      top = Math.min(top, staticLimitBottom - stickySidebar.offsetHeight);

      const sidebarSameHeightAsContainer = container.getBoundingClientRect().height === stickySidebar.offsetHeight;

      if (!sidebarSameHeightAsContainer && top === windowOffsetTop) {
        position = 'fixed';
      } else if (!sidebarSameHeightAsContainer && top === windowOffsetBottom - stickySidebar.offsetHeight) {
        position = 'fixed';
      } else if (scrollTop + top - sidebarOffset.top - paddingTop <= options.additionalMarginTop) {
        position = 'static';
      } else {
        position = 'absolute';
      }
    }

    return { position, top };
  }

  static shouldDisableOnResponsive(sidebar: HTMLElement, container: HTMLElement, options: Options): boolean {
    if (!options.disableOnResponsiveLayouts) return false;
    const sidebarWidth = getFloat(sidebar) === 'none' ? getOuterWidth(sidebar) : sidebar.offsetWidth;
    return sidebarWidth + 50 > container.getBoundingClientRect().width;
  }

  static shouldSkip(scrollTop: number, sidebarOffsetTop: number, paddingTop: number, additionalMarginTop: number): boolean {
    return scrollTop < sidebarOffsetTop + (paddingTop - additionalMarginTop);
  }

  private static getClearedContainerHeight(container: HTMLElement): number {
    let height = container.getBoundingClientRect().height;
    for (const child of container.children) {
      height = Math.max(height, child.getBoundingClientRect().height);
    }
    return height;
  }
}

