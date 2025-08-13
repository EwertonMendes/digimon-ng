import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  imports: [CommonModule],
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  @Input() text = '';
  @Input() direction: 'top' | 'bottom' | 'left' | 'right' = 'top';
}
