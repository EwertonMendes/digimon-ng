import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import '@phosphor-icons/web/light';
import '@phosphor-icons/web/bold';
import { IconComponent } from '../icon/icon.component';

type IconPosition = 'left' | 'right' | 'top' | 'bottom';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  text = input<string>();
  icon = input<string>();
  iconPosition = input<IconPosition>('left');
  weight = input<string>('light');
  color = input<string>('primary');
  disabled = input<boolean>(false);
  size = input<ButtonSize>('md');
  iconSize = input<string>('32px');
  iconScale = input<string>('1');

  onClick = output();

  performClick() {
    if (this.disabled()) return;
    this.onClick.emit();
  }
}
