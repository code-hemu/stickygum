import type { Options, StickyGumOptions } from './defaults.js';
import { mergeOptions, resolveElements, injectStylesheet } from './utils/helpers.js';
import { on, off } from './utils/events.js';
import { Sidebar, type SidebarState } from './core/Sidebar.js';
import { Scroll } from './core/Scroll.js';
import { SidebarResizeObserver } from './observers/ResizeObserver.js';

const STYLESHEET_ID = 'codehemu-sticky-sidebar-stylesheet';
const STYLESHEET_CONTENT = '.stickySidebar:after {content: ""; display: table; clear: both;}';

export default class StickyGum {
  private options: Options;
  private elements: HTMLElement[];
  private initialized = false;
  private sidebarStates: SidebarState[] = [];

  constructor(options: StickyGumOptions) {
    this.options = mergeOptions(options);
    this.elements = resolveElements(this.options.elements);
    this.tryInitOrHookIntoEvents();
  }

  private tryInitOrHookIntoEvents(): void {
    if (this.tryInit()) return;

    if (this.options.verbose) {
      console.warn('StickyGum: Body width smaller than options.minWidth. Init is delayed.');
    }

    on(document, 'scroll', this.delayedInit);
    on(window, 'resize', this.delayedInit);
  }

  private delayedInit = (): void => {
    if (this.tryInit()) {
      off(document, 'scroll', this.delayedInit);
      off(window, 'resize', this.delayedInit);
    }
  };

  private tryInit(): boolean {
    if (this.initialized) return true;
    if (document.body.getBoundingClientRect().width < this.options.minWidth) return false;
    this.init();
    return true;
  }

  private init(): void {
    this.initialized = true;
    injectStylesheet(STYLESHEET_ID, STYLESHEET_CONTENT);

    for (const element of this.elements) {
      const state = Sidebar.create(element, this.options);
      const scroll = new Scroll(state);

      state.onScroll = () => scroll.handle();
      state.resizeObserver = new SidebarResizeObserver(state.onScroll);

      state.onScroll();
      on(document, 'scroll', state.onScroll);
      on(window, 'resize', state.onScroll);
      state.resizeObserver.observe(state.stickySidebar);

      this.sidebarStates.push(state);
    }
  }

  unbind(): void {
    off(document, 'scroll', this.delayedInit);
    off(window, 'resize', this.delayedInit);

    for (const state of this.sidebarStates) {
      off(document, 'scroll', state.onScroll);
      off(window, 'resize', state.onScroll);
      Sidebar.cleanup(state);
    }

    this.sidebarStates = [];
    this.initialized = false;
  }
}

export { StickyGum as CodehemuStickySidebar };
