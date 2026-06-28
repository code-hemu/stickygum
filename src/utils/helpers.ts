import type { ElementInput, Options, StickyGumOptions } from '../defaults.js';
import { DEFAULTS } from '../defaults.js';
import { floor } from './math.js';

export function resolveElements(elements: ElementInput): HTMLElement[] {
  if (elements instanceof HTMLElement) {
    return [elements];
  }
  if (Array.isArray(elements)) {
    return elements;
  }
  return Array.from(document.querySelectorAll<HTMLElement>(elements));
}

export function mergeOptions(options: StickyGumOptions): Options {
  const merged: Options = { ...DEFAULTS, ...options };

  if (options.sidebar !== undefined) {
    merged.elements = options.sidebar;
  }

  if (typeof options.container === 'string') {
    merged.containerSelector = options.container;
    merged.containerElement = null;
  } else if (options.container instanceof HTMLElement) {
    merged.containerSelector = '';
    merged.containerElement = options.container;
  }

  merged.additionalMarginTop = floor(options.offsetTop ?? options.additionalMarginTop ?? 0);
  merged.additionalMarginBottom = floor(options.offsetBottom ?? options.additionalMarginBottom ?? 0);
  return merged;
}

export function injectStylesheet(id: string, css: string): void {
  if (!document.querySelector(`#${id}`)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

export function removeScriptTags(container: HTMLElement): void {
  const scriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
  const scripts = container.querySelectorAll('script');
  for (const script of scripts) {
    if (script.type.length === 0 || script.type.match(scriptMIMETypes)) {
      script.remove();
    }
  }
}
