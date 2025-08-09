import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  imports: [FormsModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() options: Array<{ label: string; value: any; icon?: string }> = [];
  @Input() disabled = false;
  @Input() placeholder?: string;

  @Output() valueChange = new EventEmitter<any>();

  value: any;
  dropdownOpen = false;

  onChangeFn: any = () => { };
  onTouchedFn: any = () => { };

  constructor(private eRef: ElementRef) { }

  get selectedOption() {
    return this.options.find(opt => opt.value === this.value);
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
    this.onTouchedFn();
  }

  selectOption(option: { label: string; value: any; icon?: string }) {
    if (this.disabled) return;
    this.value = option.value;
    this.onChangeFn(this.value);
    this.valueChange.emit(this.value);
    this.dropdownOpen = false;
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
