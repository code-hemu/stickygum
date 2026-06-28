export type ElementInput = string | HTMLElement | HTMLElement[];

export interface Options {
  elements: ElementInput;
  containerSelector: string;
  containerElement: HTMLElement | null;
  additionalMarginTop: number;
  additionalMarginBottom: number;
  updateSidebarHeight: boolean;
  minWidth: number;
  disableOnResponsiveLayouts: boolean;
  sidebarBehavior: string;
  defaultPosition: string;
  verbose: boolean;
}

export type StickyGumOptions = Partial<Options> & {
  container?: string | HTMLElement;
  sidebar?: ElementInput;
  offsetTop?: number;
  offsetBottom?: number;
};

export const DEFAULTS: Options = {
  elements: '',
  containerSelector: '',
  containerElement: null,
  additionalMarginTop: 0,
  additionalMarginBottom: 0,
  updateSidebarHeight: true,
  minWidth: 0,
  disableOnResponsiveLayouts: true,
  sidebarBehavior: 'modern',
  defaultPosition: 'relative',
  verbose: false,
};
