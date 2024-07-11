import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  text = input.required<string>();
  color = input<string>('primary');
  disabled = input<boolean>(false);

  click = output();


  onClick() {
    this.click.emit();
  }
}
