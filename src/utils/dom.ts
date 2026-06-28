export function getOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY - document.documentElement.clientTop,
    left: rect.left + window.scrollX - document.documentElement.clientLeft,
  };
}

export function isVisible(element: HTMLElement): boolean {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

export function getOuterWidth(element: HTMLElement): number {
  const style = getComputedStyle(element);
  return element.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
}

export function getClearedHeight(element: HTMLElement): number {
  let height = element.getBoundingClientRect().height;
  for (const child of element.children) {
    height = Math.max(height, child.getBoundingClientRect().height);
  }
  return height;
}
