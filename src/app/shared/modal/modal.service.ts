import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  modals: ModalComponent[] = [];

  public add(modal: ModalComponent) {
    if (this.modals.find((m) => m.id === modal.id)) {
      throw new Error(`A modal with id ${modal.id} already exists`);
    }
    this.modals.push(modal);
  }

  public remove(id: string) {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  public open(id: string) {
    const modal = this.modals.find((x) => x.id === id);
    modal?.open();
  }

  public close(id: string) {
    const modal = this.modals.find((x) => x.id === id);
    modal?.close();
  }
}
