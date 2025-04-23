import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import '@phosphor-icons/web/light';
import '@phosphor-icons/web/bold';

type IconPosition = 'left' | 'right' | 'top' | 'bottom';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
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

  onClick = output();

  performClick() {
    if(this.disabled()) return;
    this.onClick.emit();
  }
}
