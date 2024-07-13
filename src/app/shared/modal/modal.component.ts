import { Component, ElementRef, HostListener, inject, Input, OnDestroy, OnInit, output, ViewEncapsulation } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) id!: string;
  element: HTMLElement;

  openEvent = output<void>();
  closeEvent = output<void>();

  modalService = inject(ModalService);
  elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.close();
  }

  constructor() {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
  }

  public open(): void {
    this.element.style.display = 'block';
    this.openEvent.emit();
  }

  public close(): void {
    this.element.style.display = 'none';
    this.closeEvent.emit();
  }
}
