import { ApplicationRef, Injectable, Type, ComponentRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalV2Service {
  private modals: Map<string, ComponentRef<any>> = new Map();
  private modalStack: string[] = [];

  constructor(private appRef: ApplicationRef) { }

  open<T extends object>(id: string, component: Type<T>, data?: Partial<T>): void {
    if (this.modals.has(id)) {
      console.warn(`Modal with ID '${id}' is already opened.`);
      return;
    }

    const componentRef = this.appRef.bootstrap(component, document.createElement('div'));

    if (data) {
      Object.assign(componentRef.instance, data);
    }

    componentRef.changeDetectorRef.detectChanges();

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

    (domElem.querySelector(`#${id}`) as HTMLElement).style.display = "block"
    document.body.appendChild(domElem);

    this.modals.set(id, componentRef);
    this.modalStack.push(id);
  }

  close(id: string): void {
    const componentRef = this.modals.get(id);
    if (!componentRef) return;

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.removeChild(domElem);

    componentRef.destroy();

    this.modals.delete(id);

    const index = this.modalStack.indexOf(id);

    if (index <= -1) return;

    this.modalStack.splice(index, 1);
  }

  closeAll(): void {
    while (this.modalStack.length > 0) {
      this.closeLast();
    }
  }

  closeLast() {
    if (this.modalStack.length === 0) return;

    const lastModalId = this.modalStack.pop();

    if (lastModalId) {
      this.close(lastModalId);
    }
  }

}
