export function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

export function getComputedNumber(element: HTMLElement, property: string): number {
  return parseFloat(getComputedStyle(element).getPropertyValue(property));
}

export function getPosition(element: HTMLElement): string {
  return getComputedStyle(element).position;
}

export function getFloat(element: HTMLElement): string {
  return getComputedStyle(element).float;
}
