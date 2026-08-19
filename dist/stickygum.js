/*!
* stickygum v0.0.2
* (c) 2026 Hemanta Gayen and other contributors
*
* Released under the GPL-3.0 License
* Date: 2026-08-19
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.StickyGum = factory());
})(this, (function () { 'use strict';

  const DEFAULTS = {
    elements: "",
    containerSelector: "",
    containerElement: null,
    additionalMarginTop: 0,
    additionalMarginBottom: 0,
    updateSidebarHeight: true,
    minWidth: 0,
    disableOnResponsiveLayouts: true,
    sidebarBehavior: "modern",
    defaultPosition: "relative",
    verbose: false
  };

  function floor(value) {
    return Math.floor(value);
  }

  function resolveElements(elements) {
    if (elements instanceof HTMLElement) {
      return [elements];
    }
    if (Array.isArray(elements)) {
      return elements;
    }
    return Array.from(document.querySelectorAll(elements));
  }
  function mergeOptions(options) {
    const merged = { ...DEFAULTS, ...options };
    if (options.sidebar !== void 0) {
      merged.elements = options.sidebar;
    }
    if (typeof options.container === "string") {
      merged.containerSelector = options.container;
      merged.containerElement = null;
    } else if (options.container instanceof HTMLElement) {
      merged.containerSelector = "";
      merged.containerElement = options.container;
    }
    merged.additionalMarginTop = floor(options.offsetTop ?? options.additionalMarginTop ?? 0);
    merged.additionalMarginBottom = floor(options.offsetBottom ?? options.additionalMarginBottom ?? 0);
    return merged;
  }
  function injectStylesheet(id, css) {
    if (!document.querySelector(`#${id}`)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }
  function removeScriptTags(container) {
    const scriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
    const scripts = container.querySelectorAll("script");
    for (const script of scripts) {
      if (script.type.length === 0 || script.type.match(scriptMIMETypes)) {
        script.remove();
      }
    }
  }

  function on(target, type, listener) {
    target.addEventListener(type, listener);
  }
  function off(target, type, listener) {
    target.removeEventListener(type, listener);
  }

  function getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY - document.documentElement.clientTop,
      left: rect.left + window.scrollX - document.documentElement.clientLeft
    };
  }
  function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }
  function getOuterWidth(element) {
    const style = getComputedStyle(element);
    return element.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  }
  function getClearedHeight(element) {
    let height = element.getBoundingClientRect().height;
    for (const child of element.children) {
      height = Math.max(height, child.getBoundingClientRect().height);
    }
    return height;
  }

  function setStyles(element, styles) {
    Object.assign(element.style, styles);
  }
  function getFloat(element) {
    return getComputedStyle(element).float;
  }

  class Layout {
    static measure(sidebar, container, stickySidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const stickyRect = stickySidebar.getBoundingClientRect();
      return {
        sidebarOffset: {
          top: sidebarRect.top + window.scrollY,
          left: sidebarRect.left + window.scrollX
        },
        containerTop: sidebarRect.top,
        containerBottom: containerRect.top + window.scrollY + getClearedHeight(container),
        containerHeight: containerRect.height,
        sidebarHeight: sidebarRect.height,
        stickyHeight: stickyRect.height
      };
    }
    static updateSidebarMinHeight(sidebar, stickySidebar, paddingBottom) {
      const offsetTop = stickySidebar.getBoundingClientRect().top + window.scrollY;
      const sidebarOffsetTop = sidebar.getBoundingClientRect().top + window.scrollY;
      sidebar.style.minHeight = `${stickySidebar.offsetHeight + offsetTop - sidebarOffsetTop + paddingBottom}px`;
    }
    static resetSidebarMinHeight(sidebar) {
      sidebar.style.minHeight = "1px";
    }
  }

  class Sidebar {
    static create(element, options) {
      const state = {};
      state.sidebar = element;
      state.options = options;
      const matchedContainer = options.containerElement ?? (options.containerSelector ? document.querySelector(options.containerSelector) : null);
      state.container = matchedContainer ?? state.sidebar.parentNode;
      setStyles(state.sidebar, {
        position: options.defaultPosition,
        overflow: "visible",
        boxSizing: "border-box"
      });
      state.stickySidebar = state.sidebar.querySelector(".stickySidebar");
      if (!state.stickySidebar) {
        removeScriptTags(state.sidebar);
        state.stickySidebar = document.createElement("div");
        state.stickySidebar.classList.add("stickySidebar");
        state.stickySidebar.append(...state.sidebar.children);
        state.sidebar.append(state.stickySidebar);
      } else {
        state.stickySidebar.classList.add("stickySidebar");
      }
      const computedStyle = getComputedStyle(state.sidebar);
      state.marginBottom = parseFloat(computedStyle.marginBottom);
      state.paddingTop = parseFloat(computedStyle.paddingTop);
      state.paddingBottom = parseFloat(computedStyle.paddingBottom);
      let collapsedTopHeight = getOffset(state.stickySidebar).top;
      let collapsedBottomHeight = state.stickySidebar.offsetHeight;
      state.stickySidebar.style.paddingTop = "1px";
      state.stickySidebar.style.paddingBottom = "1px";
      collapsedTopHeight -= getOffset(state.stickySidebar).top;
      collapsedBottomHeight = state.stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
      state.stickySidebarPaddingTop = collapsedTopHeight === 0 ? 0 : 1;
      state.stickySidebarPaddingBottom = collapsedBottomHeight === 0 ? 0 : 1;
      if (collapsedTopHeight === 0) {
        state.stickySidebar.style.paddingTop = "0px";
      }
      if (collapsedBottomHeight === 0) {
        state.stickySidebar.style.paddingBottom = "0px";
      }
      state.previousScrollTop = 0;
      state.fixedScrollTop = 0;
      Sidebar.reset(state);
      return state;
    }
    static applyPosition(state, result, sidebarOffset) {
      const scrollTop = window.scrollY;
      if (result.position === "fixed") {
        setStyles(state.stickySidebar, {
          position: "fixed",
          width: `${state.stickySidebar.getBoundingClientRect().width}px`,
          transform: `translateY(${result.top}px)`,
          left: `${sidebarOffset.left + parseFloat(getComputedStyle(state.sidebar).paddingLeft) - window.scrollX}px`,
          top: "0px"
        });
      } else if (result.position === "absolute") {
        const css = {};
        if (getComputedStyle(state.stickySidebar).position !== "absolute") {
          css.position = "absolute";
          css.transform = `translateY(${scrollTop + result.top - sidebarOffset.top - state.stickySidebarPaddingTop - state.stickySidebarPaddingBottom}px)`;
          css.top = "0px";
        }
        css.width = `${state.stickySidebar.getBoundingClientRect().width}px`;
        css.left = "";
        setStyles(state.stickySidebar, css);
      } else {
        Sidebar.reset(state);
      }
      if (result.position !== "static") {
        if (state.options.updateSidebarHeight) {
          Layout.updateSidebarMinHeight(state.sidebar, state.stickySidebar, state.paddingBottom);
        }
      }
      state.previousScrollTop = scrollTop;
    }
    static reset(state) {
      state.fixedScrollTop = 0;
      Layout.resetSidebarMinHeight(state.sidebar);
      setStyles(state.stickySidebar, {
        position: "static",
        width: "",
        transform: "none"
      });
    }
    static cleanup(state) {
      state.resizeObserver.disconnect();
    }
  }

  class Position {
    static calculate(sidebar, container, stickySidebar, options, paddingTop, paddingBottom, marginBottom, previousScrollTop) {
      const scrollTop = window.scrollY;
      let position = "static";
      const sidebarOffset = getOffset(sidebar);
      let top = 0;
      if (scrollTop >= sidebarOffset.top + (paddingTop - options.additionalMarginTop)) {
        const offsetTop = paddingTop + options.additionalMarginTop;
        const offsetBottom = paddingBottom + marginBottom + options.additionalMarginBottom;
        const containerTop = sidebarOffset.top;
        const containerBottom = sidebarOffset.top + Position.getClearedContainerHeight(container);
        const windowOffsetTop = options.additionalMarginTop;
        let windowOffsetBottom;
        const sidebarSmallerThanWindow = stickySidebar.offsetHeight + offsetTop + offsetBottom < window.innerHeight;
        if (sidebarSmallerThanWindow) {
          windowOffsetBottom = windowOffsetTop + stickySidebar.offsetHeight;
        } else {
          windowOffsetBottom = window.innerHeight - marginBottom - paddingBottom - options.additionalMarginBottom;
        }
        const staticLimitTop = containerTop - scrollTop + paddingTop;
        const staticLimitBottom = containerBottom - scrollTop - paddingBottom - marginBottom;
        top = getOffset(stickySidebar).top - scrollTop;
        const scrollTopDiff = previousScrollTop - scrollTop;
        if (getComputedStyle(stickySidebar).position === "fixed") {
          if (options.sidebarBehavior === "modern") {
            top += scrollTopDiff;
          }
        }
        if (options.sidebarBehavior === "stick-to-top") {
          top = options.additionalMarginTop;
        }
        if (options.sidebarBehavior === "stick-to-bottom") {
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
          position = "fixed";
        } else if (!sidebarSameHeightAsContainer && top === windowOffsetBottom - stickySidebar.offsetHeight) {
          position = "fixed";
        } else if (scrollTop + top - sidebarOffset.top - paddingTop <= options.additionalMarginTop) {
          position = "static";
        } else {
          position = "absolute";
        }
      }
      return { position, top };
    }
    static shouldDisableOnResponsive(sidebar, container, options) {
      if (!options.disableOnResponsiveLayouts) return false;
      const sidebarWidth = getFloat(sidebar) === "none" ? getOuterWidth(sidebar) : sidebar.offsetWidth;
      return sidebarWidth + 50 > container.getBoundingClientRect().width;
    }
    static shouldSkip(scrollTop, sidebarOffsetTop, paddingTop, additionalMarginTop) {
      return scrollTop < sidebarOffsetTop + (paddingTop - additionalMarginTop);
    }
    static getClearedContainerHeight(container) {
      let height = container.getBoundingClientRect().height;
      for (const child of container.children) {
        height = Math.max(height, child.getBoundingClientRect().height);
      }
      return height;
    }
  }

  class Scroll {
    constructor(state) {
      this.state = state;
    }
    handle() {
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
        o.previousScrollTop
      );
      Sidebar.applyPosition(o, result, sidebarOffset);
    }
  }

  class SidebarResizeObserver {
    constructor(callback) {
      this.observer = null;
      this.callback = callback;
    }
    observe(target) {
      if (typeof ResizeObserver === "undefined") return;
      this.observer = new ResizeObserver(() => {
        this.callback();
      });
      this.observer.observe(target);
    }
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  const STYLESHEET_ID = "codehemu-sticky-sidebar-stylesheet";
  const STYLESHEET_CONTENT = '.stickySidebar:after {content: ""; display: table; clear: both;}';
  class StickyGum {
    constructor(options) {
      this.initialized = false;
      this.sidebarStates = [];
      this.delayedInit = () => {
        if (this.tryInit()) {
          off(document, "scroll", this.delayedInit);
          off(window, "resize", this.delayedInit);
        }
      };
      this.options = mergeOptions(options);
      this.elements = resolveElements(this.options.elements);
      this.tryInitOrHookIntoEvents();
    }
    tryInitOrHookIntoEvents() {
      if (this.tryInit()) return;
      if (this.options.verbose) {
        console.warn("StickyGum: Body width smaller than options.minWidth. Init is delayed.");
      }
      on(document, "scroll", this.delayedInit);
      on(window, "resize", this.delayedInit);
    }
    tryInit() {
      if (this.initialized) return true;
      if (document.body.getBoundingClientRect().width < this.options.minWidth) return false;
      this.init();
      return true;
    }
    init() {
      this.initialized = true;
      injectStylesheet(STYLESHEET_ID, STYLESHEET_CONTENT);
      for (const element of this.elements) {
        const state = Sidebar.create(element, this.options);
        const scroll = new Scroll(state);
        state.onScroll = () => scroll.handle();
        state.resizeObserver = new SidebarResizeObserver(state.onScroll);
        state.onScroll();
        on(document, "scroll", state.onScroll);
        on(window, "resize", state.onScroll);
        state.resizeObserver.observe(state.stickySidebar);
        this.sidebarStates.push(state);
      }
    }
    unbind() {
      off(document, "scroll", this.delayedInit);
      off(window, "resize", this.delayedInit);
      for (const state of this.sidebarStates) {
        off(document, "scroll", state.onScroll);
        off(window, "resize", state.onScroll);
        Sidebar.cleanup(state);
      }
      this.sidebarStates = [];
      this.initialized = false;
    }
  }

  return StickyGum;

}));

