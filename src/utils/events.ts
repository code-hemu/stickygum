export function on(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject): void {
  target.addEventListener(type, listener);
}

export function off(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject): void {
  target.removeEventListener(type, listener);
}
