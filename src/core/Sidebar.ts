import type { Options } from '../defaults.js';
import { getOffset } from '../utils/dom.js';
import { setStyles } from '../utils/css.js';
import { removeScriptTags } from '../utils/helpers.js';
import type { SidebarResizeObserver } from '../observers/ResizeObserver.js';
import type { PositionResult } from './Position.js';
import { Layout } from './Layout.js';
export interface SidebarState {
  sidebar: HTMLElement;
  stickGum: HTMLElement;
  container: HTMLElement;
  options: Options;
  onScroll: () => void;
  previousScrollTop: number;
  fixedScrollTop: number;
  stickGumPaddingTop: number;
  stickGumPaddingBottom: number;
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

    state.stickGum = state.sidebar.querySelector<HTMLElement>('.stickGum')!;
    if (!state.stickGum) {
      removeScriptTags(state.sidebar);
      state.stickGum = document.createElement('div');
      state.stickGum.classList.add('stickGum');
      state.stickGum.append(...state.sidebar.children);
      state.sidebar.append(state.stickGum);
    } else {
      state.stickGum.classList.add('stickGum');
    }

    const computedStyle = getComputedStyle(state.sidebar);
    state.marginBottom = parseFloat(computedStyle.marginBottom);
    state.paddingTop = parseFloat(computedStyle.paddingTop);
    state.paddingBottom = parseFloat(computedStyle.paddingBottom);

    let collapsedTopHeight = getOffset(state.stickGum).top;
    let collapsedBottomHeight = state.stickGum.offsetHeight;
    state.stickGum.style.paddingTop = '1px';
    state.stickGum.style.paddingBottom = '1px';
    collapsedTopHeight -= getOffset(state.stickGum).top;
    collapsedBottomHeight = state.stickGum.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
    state.stickGumPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
    state.stickGumPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
    if (collapsedTopHeight === 0) {
      state.stickGum.style.paddingTop = '0px';
    }
    if (collapsedBottomHeight === 0) {
      state.stickGum.style.paddingBottom = '0px';
    }

    state.previousScrollTop = 0;
    state.fixedScrollTop = 0;
    Sidebar.reset(state);

    return state;
  }

  static applyPosition(state: SidebarState, result: PositionResult, sidebarOffset: { top: number; left: number }): void {
    const scrollTop = window.scrollY;

    if (result.position === 'fixed') {
      setStyles(state.stickGum, {
        position: 'fixed',
        width: `${state.stickGum.getBoundingClientRect().width}px`,
        transform: `translateY(${result.top}px)`,
        left: `${sidebarOffset.left + parseFloat(getComputedStyle(state.sidebar).paddingLeft) - window.scrollX}px`,
        top: '0px',
      });
    } else if (result.position === 'absolute') {
      const css: Partial<CSSStyleDeclaration> = {};

      if (getComputedStyle(state.stickGum).position !== 'absolute') {
        css.position = 'absolute';
        css.transform = `translateY(${scrollTop + result.top - sidebarOffset.top - state.stickGumPaddingTop - state.stickGumPaddingBottom}px)`;
        css.top = '0px';
      }

      css.width = `${state.stickGum.getBoundingClientRect().width}px`;
      css.left = '';

      setStyles(state.stickGum, css);
    } else {
      Sidebar.reset(state);
    }

    if (result.position !== 'static') {
      if (state.options.updateSidebarHeight) {
        Layout.updateSidebarMinHeight(state.sidebar, state.stickGum, state.paddingBottom);
      }
    }

    state.previousScrollTop = scrollTop;
  }

  static reset(state: SidebarState): void {
    state.fixedScrollTop = 0;
    Layout.resetSidebarMinHeight(state.sidebar);
    setStyles(state.stickGum, {
      position: 'static',
      width: '',
      transform: 'none',
    });
  }

  static cleanup(state: SidebarState): void {
    state.resizeObserver.disconnect();
  }
}

