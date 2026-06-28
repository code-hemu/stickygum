import { isVisible, getOffset } from '../utils/dom.js';
import { Position } from './Position.js';
import { Sidebar, type SidebarState } from './Sidebar.js';

export class Scroll {
  private state: SidebarState;

  constructor(state: SidebarState) {
    this.state = state;
  }

  handle(): void {
    const o = this.state;

    if (!isVisible(o.stickySidebar)) return;

    if (document.body.getBoundingClientRect().width < o.options.minWidth) {
      Sidebar.reset(o);
      return;
    }

    if (Position.shouldDisableOnResponsive(o.sidebar, o.container, o.options)) {
      Sidebar.reset(o);
      return;
    }

    const sidebarOffset = getOffset(o.sidebar);
    const result = Position.calculate(
      o.sidebar,
      o.container,
      o.stickySidebar,
      o.options,
      o.paddingTop,
      o.paddingBottom,
      o.marginBottom,
      o.previousScrollTop,
    );

    Sidebar.applyPosition(o, result, sidebarOffset);
  }
}
