import { CommonModule } from '@angular/common';
import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  imports: [CommonModule],
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  @Input() text = '';
  @Input() direction: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @HostBinding('attr.role') role = 'tooltip';
  @HostBinding('style.pointerEvents') pointerEvents = 'none';
  @HostBinding('attr.data-direction') get dataDirection() { return this.direction; }
}
