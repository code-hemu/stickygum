import type { Options } from '../defaults.js';
import { getOffset } from '../utils/dom.js';
import { setStyles } from '../utils/css.js';
import { removeScriptTags } from '../utils/helpers.js';
import { SidebarResizeObserver } from '../observers/ResizeObserver.js';
import type { PositionResult } from './Position.js';
import { Layout } from './Layout.js';
export interface SidebarState {
  sidebar: HTMLElement;
  stickySidebar: HTMLElement;
  container: HTMLElement;
  options: Options;
  onScroll: () => void;
  previousScrollTop: number;
  fixedScrollTop: number;
  stickySidebarPaddingTop: number;
  stickySidebarPaddingBottom: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
  resizeObserver: SidebarResizeObserver;
}

export class Sidebar {
  static create(element: HTMLElement, options: Options): SidebarState {
    const state = {} as SidebarState;
    state.sidebar = element;
    state.options = options;

    const matchedContainer = options.containerElement ?? (options.containerSelector
      ? document.querySelector<HTMLElement>(options.containerSelector)
      : null);
    state.container = matchedContainer ?? (state.sidebar.parentNode as HTMLElement);

    setStyles(state.sidebar, {
      position: options.defaultPosition as CSSStyleDeclaration['position'],
      overflow: 'visible',
      boxSizing: 'border-box',
    });

    state.stickySidebar = state.sidebar.querySelector<HTMLElement>('.stickySidebar')!;
    if (!state.stickySidebar) {
      removeScriptTags(state.sidebar);
      state.stickySidebar = document.createElement('div');
      state.stickySidebar.classList.add('stickySidebar');
      state.stickySidebar.append(...state.sidebar.children);
      state.sidebar.append(state.stickySidebar);
    } else {
      state.stickySidebar.classList.add('stickySidebar');
    }

    const computedStyle = getComputedStyle(state.sidebar);
    state.marginBottom = parseFloat(computedStyle.marginBottom);
    state.paddingTop = parseFloat(computedStyle.paddingTop);
    state.paddingBottom = parseFloat(computedStyle.paddingBottom);

    let collapsedTopHeight = getOffset(state.stickySidebar).top;
    let collapsedBottomHeight = state.stickySidebar.offsetHeight;
    state.stickySidebar.style.paddingTop = '1px';
    state.stickySidebar.style.paddingBottom = '1px';
    collapsedTopHeight -= getOffset(state.stickySidebar).top;
    collapsedBottomHeight = state.stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
    state.stickySidebarPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
    state.stickySidebarPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
    if (collapsedTopHeight === 0) {
      state.stickySidebar.style.paddingTop = '0px';
    }
    if (collapsedBottomHeight === 0) {
      state.stickySidebar.style.paddingBottom = '0px';
    }

    state.previousScrollTop = 0;
    state.fixedScrollTop = 0;
    Sidebar.reset(state);

    return state;
  }

  static applyPosition(state: SidebarState, result: PositionResult, sidebarOffset: { top: number; left: number }): void {
    const scrollTop = window.scrollY;

    if (result.position === 'fixed') {
      setStyles(state.stickySidebar, {
        position: 'fixed',
        width: `${state.stickySidebar.getBoundingClientRect().width}px`,
        transform: `translateY(${result.top}px)`,
        left: `${sidebarOffset.left + parseFloat(getComputedStyle(state.sidebar).paddingLeft) - window.scrollX}px`,
        top: '0px',
      });
    } else if (result.position === 'absolute') {
      const css: Partial<CSSStyleDeclaration> = {};

      if (getComputedStyle(state.stickySidebar).position !== 'absolute') {
        css.position = 'absolute';
        css.transform = `translateY(${scrollTop + result.top - sidebarOffset.top - state.stickySidebarPaddingTop - state.stickySidebarPaddingBottom}px)`;
        css.top = '0px';
      }

      css.width = `${state.stickySidebar.getBoundingClientRect().width}px`;
      css.left = '';

      setStyles(state.stickySidebar, css);
    } else {
      Sidebar.reset(state);
    }

    if (result.position !== 'static') {
      if (state.options.updateSidebarHeight) {
        Layout.updateSidebarMinHeight(state.sidebar, state.stickySidebar, state.paddingBottom);
      }
    }

    state.previousScrollTop = scrollTop;
  }

  static reset(state: SidebarState): void {
    state.fixedScrollTop = 0;
    Layout.resetSidebarMinHeight(state.sidebar);
    setStyles(state.stickySidebar, {
      position: 'static',
      width: '',
      transform: 'none',
    });
  }

  static cleanup(state: SidebarState): void {
    state.resizeObserver.disconnect();
  }
}

