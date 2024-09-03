import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
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
  closable = input<boolean>(true);
  element: HTMLElement;

  openEvent = output<void>();
  closeEvent = output<void>();

  modalService = inject(ModalService);
  elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
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

  open(): void {
    this.element.style.display = 'block';
    this.openEvent.emit();
  }

  close(): void {
    if (!this.closable()) return;
    if (this.modalService.getLastOpenModal() !== this) return;
    this.modalService.removeLastOpenModal();
    this.element.style.display = 'none';
    this.closeEvent.emit();
  }
}
