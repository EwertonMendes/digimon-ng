import { Component, inject, input } from '@angular/core';
import { ModalComponent } from "../modal/modal.component";
import { ButtonComponent } from '../button/button.component';
import { ModalService } from '../modal/modal.service';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  imports: [ModalComponent, ButtonComponent, TranslocoModule, CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  public id = input.required<string>();
  public title = input<string>('');
  public text = input<string>('');
  public confirmText = input<string>('Confirm');
  public cancelText = input<string>('Cancel');
  public backgroundColor = input<string>('dark');
  public confirmButtonColor = input<string>('success');
  public cancelButtonColor = input<string>('info');

  private modalService = inject(ModalService);

  cancel() {
    this.modalService.close(this.id(), false);
  }

  confirm() {
    this.modalService.close(this.id(), true);
  }
}
