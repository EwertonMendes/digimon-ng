import {
  Directive, ElementRef, HostListener, Input, Injector
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef, OverlayPositionBuilder, ConnectedPosition } from '@angular/cdk/overlay';
import { TooltipComponent } from 'app/shared/components/tooltip/tooltip.component';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') text = '';
  @Input() tooltipDirection: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private overlayRef?: OverlayRef;

  constructor(
    private el: ElementRef,
    private injector: Injector,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) { }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.overlayRef) return;

    const positions: ConnectedPosition[] = [
      {
        originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8
      },
      {
        originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8
      },
      {
        originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8
      },
      {
        originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8
      }
    ];

    let position: ConnectedPosition;
    switch (this.tooltipDirection) {
      case 'top': position = positions[0]; break;
      case 'bottom': position = positions[1]; break;
      case 'left': position = positions[2]; break;
      case 'right': position = positions[3]; break;
      default: position = positions[0];
    }

    const overlayPosition = this.positionBuilder
      .flexibleConnectedTo(this.el)
      .withPositions([position]);

    this.overlayRef = this.overlay.create({
      positionStrategy: overlayPosition,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false
    });

    const tooltipPortal = new ComponentPortal(TooltipComponent, null, this.injector);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.text = this.text;
    tooltipRef.instance.direction = this.tooltipDirection;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeTooltip();
  }

  @HostListener('mousedown')
  @HostListener('touchstart')
  onPointerDown() {
    this.removeTooltip();
  }

  ngOnDestroy() {
    this.removeTooltip();
  }

  private removeTooltip() {
    if (!this.overlayRef) return;
    this.overlayRef.detach();
    this.overlayRef.dispose();
    this.overlayRef = undefined;

  }
}
