import { DestroyRef, ElementRef, WritableSignal } from '@angular/core';

function getCssVarNumber(el: Element, name: string): number {
  const raw = getComputedStyle(el as HTMLElement).getPropertyValue(name).trim();
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function getLabRoot(viewport: HTMLElement): HTMLElement {
  return (viewport.closest('.lab') as HTMLElement) || viewport;
}

function computeColumnCount(viewport: HTMLElement): { count: number; root: HTMLElement } {
  const root = getLabRoot(viewport);
  const cardWidth = getCssVarNumber(root, '--card-w');
  const gap = getCssVarNumber(root, '--gap');
  const viewportWidth = viewport.clientWidth;
  const count = Math.max(1, Math.floor((viewportWidth + gap) / (cardWidth + gap)));
  return { count, root };
}

export function startLabLayoutController(
  viewportRef: ElementRef<HTMLElement>,
  columnsSignal: WritableSignal<number>,
  destroyRef: DestroyRef
): void {
  const viewport = viewportRef?.nativeElement;
  if (!viewport) return;

  const apply = () => {
    const { count, root } = computeColumnCount(viewport);
    if (count !== columnsSignal()) columnsSignal.set(count);
    root.style.setProperty('--cols', String(count));
  };

  apply();

  const resizeObserver = new ResizeObserver(apply);
  resizeObserver.observe(viewport);

  destroyRef.onDestroy(() => {
    resizeObserver.disconnect();
  });
}
