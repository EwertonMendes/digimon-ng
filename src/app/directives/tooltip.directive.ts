import { Directive, ElementRef, HostListener, Input, Injector, OnDestroy } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef, OverlayPositionBuilder, ConnectedPosition } from '@angular/cdk/overlay';
import { TooltipComponent } from 'app/shared/components/tooltip/tooltip.component';

type TooltipDirection = 'top' | 'bottom' | 'left' | 'right';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text = '';
  @Input() tooltipDirection: TooltipDirection = 'top';
  @Input() tooltipPanelClass = 'app-tooltip-overlay-pane';
  @Input() tooltipZIndex?: number;

  private overlayRef?: OverlayRef;
  private readonly overlayContainerSelector = '.cdk-overlay-container';
  private readonly modalSelector = '.modal-container, .modal-background';
  private readonly overlayPaneSelector = '.cdk-overlay-pane';

  constructor(
    private readonly elementRef: ElementRef,
    private readonly injector: Injector,
    private readonly overlay: Overlay,
    private readonly positionBuilder: OverlayPositionBuilder
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.overlayRef) return;

    const position = this.mapDirectionToPosition(this.tooltipDirection);
    const positionStrategy = this.positionBuilder.flexibleConnectedTo(this.elementRef).withPositions([position]);
    const baseZ = this.calculateBaseZIndex();
    this.setOverlayContainerZIndex(baseZ);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: this.tooltipPanelClass
    });

    this.attachTooltipPortal();
    this.applyPanelZIndexToOverlayOrFallback(baseZ);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.removeTooltip();
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  onPointerDown(): void {
    this.removeTooltip();
  }

  ngOnDestroy(): void {
    this.removeTooltip();
  }

  private mapDirectionToPosition(direction: TooltipDirection): ConnectedPosition {
    const positions: Record<TooltipDirection, ConnectedPosition> = {
      top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
      bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
      left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
      right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 }
    };
    return positions[direction] ?? positions.top;
  }

  private calculateBaseZIndex(): number {
    const modalElements = Array.from(document.querySelectorAll<HTMLElement>(this.modalSelector));
    const modalZs = modalElements
      .map(el => parseInt(window.getComputedStyle(el).zIndex || '0', 10))
      .filter(n => !isNaN(n));
    const maxModalZ = modalZs.length ? Math.max(...modalZs) : 0;
    return this.tooltipZIndex ?? Math.max(20000, maxModalZ + 20);
  }

  private findOverlayContainer(): HTMLElement | null {
    return document.querySelector<HTMLElement>(this.overlayContainerSelector);
  }

  private setOverlayContainerZIndex(zIndex: number): void {
    const container = this.findOverlayContainer();
    if (!container) return;
    container.style.zIndex = String(zIndex);
  }

  private attachTooltipPortal(): void {
    if (!this.overlayRef) return;
    const portal = new ComponentPortal(TooltipComponent, null, this.injector);
    const ref = this.overlayRef.attach(portal);
    ref.instance.text = this.text;
    ref.instance.direction = this.tooltipDirection;
  }

  private getOverlayElement(): HTMLElement | null {
    const el = (this.overlayRef as any)?.overlayElement as HTMLElement | undefined;
    if (!el) return null;
    return el;
  }

  private findLastOverlayPane(): HTMLElement | null {
    const panes = Array.from(document.querySelectorAll<HTMLElement>(this.overlayPaneSelector));
    if (!panes.length) return null;
    return panes[panes.length - 1];
  }

  private applyPanelZIndexToOverlayOrFallback(baseZIndex: number): void {
    setTimeout(() => {
      const overlayEl = this.getOverlayElement();
      if (!overlayEl) {
        const fallbackPane = this.findLastOverlayPane();
        if (!fallbackPane) return;
        fallbackPane.style.zIndex = String(baseZIndex + 1);
        if (this.tooltipPanelClass) fallbackPane.classList.add(this.tooltipPanelClass);
        return;
      }
      overlayEl.style.zIndex = String(baseZIndex + 1);
      if (this.tooltipPanelClass) overlayEl.classList.add(this.tooltipPanelClass);
    }, 0);
  }

  private removeTooltip(): void {
    if (!this.overlayRef) return;
    try {
      this.overlayRef.detach();
      this.overlayRef.dispose();
    } finally {
      this.overlayRef = undefined;
    }
  }
}
