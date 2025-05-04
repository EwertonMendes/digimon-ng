import { Injectable } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modals: ModalComponent[] = [];
  private openModals: ModalComponent[] = [];

  add(modal: ModalComponent) {
    if (this.modals.find((m) => m.id === modal.id)) {
      if (modal.isUnique()) return;
      throw new Error(`A modal with id ${modal.id} already exists`);
    }
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  open(id: string) {
    const modal = this.modals.find((x) => x.id === id);
    if (modal) {
      this.openModals.push(modal);
      modal.open();
    }
  }

  close(id: string) {
    const modal = this.modals.find((x) => x.id === id);
    if (modal) {
      modal.close();
    }
  }

  getOpenModals(): ModalComponent[] {
    return this.openModals;
  }

  getLastOpenModal(): ModalComponent {
    return this.openModals[this.openModals.length - 1];
  }

  removeLastOpenModal() {
    this.openModals.pop();
  }
}
