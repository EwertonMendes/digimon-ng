import { Component, ElementRef, forwardRef, input, signal, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  maxlength = input<number>(255);
  label = input<string | undefined>(undefined);

  focused = input<boolean>(false);

  protected value = signal('');
  protected disabled = signal(false);

  private inputEl?: HTMLInputElement;

  constructor(private host: ElementRef) {
    effect(() => {
      if (this.focused()) {
        this.inputEl ??= this.host.nativeElement.querySelector('input');
        queueMicrotask(() => this.inputEl?.focus());
      }
    });
  }

  onChange = (_: any) => { };
  onTouched = () => { };

  writeValue(value: any): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(this.value());
  }
}
