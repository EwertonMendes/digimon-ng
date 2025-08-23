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
import { AudioService } from '@services/audio.service';
import { ModalService } from './modal.service';
import { AudioEffects } from 'app/core/enums/audio-tracks.enum';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.modalService.isLastModal(this.id()!)) {
      this.close(true);
    }
  }

  id = input.required<string>();
  closable = input<boolean>(true);

  element: HTMLElement;

  openEvent = output<void>();
  closeEvent = output<void>();

  private readonly modalService = inject(ModalService);
  private readonly audioService = inject(AudioService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.openEvent.emit();
  }

  ngOnDestroy(): void {
    this.element.remove();
  }

  close(playClickSound = false): void {
    if (!this.closable()) return;

    if (playClickSound) {
      this.audioService.playAudio(AudioEffects.CLICK_ALTERNATIVE);
    }

    this.closeEvent.emit();
    this.modalService.close(this.id()!);
  }
}
