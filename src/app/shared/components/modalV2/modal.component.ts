import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { AudioService } from '../../../services/audio.service';
import { ModalV2Service } from './modal.service';
import { AudioEffects } from 'app/core/enums/audio-tracks.enum';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalV2Component implements OnInit, OnDestroy {
  id = input.required<string>();
  closable = input<boolean>(true);

  element: HTMLElement;

  openEvent = output<void>();
  closeEvent = output<void>();

  private readonly modalService = inject(ModalV2Service);
  private readonly audioService = inject(AudioService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.openEvent.emit();
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.close(true, true);
  }

  ngOnDestroy(): void {
    this.element.remove();
  }

  close(playClickSound = false, closeLast = false): void {
    if (!this.closable()) return;

    if (playClickSound) {
      this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    }

    this.closeEvent.emit();

    closeLast ? this.modalService.closeLast() : this.modalService.close(this.id());
  }
}
