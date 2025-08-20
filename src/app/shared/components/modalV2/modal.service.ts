import { ApplicationRef, Injectable, Type, ComponentRef, createComponent, reflectComponentType } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { filter, shareReplay, distinctUntilChanged, map } from 'rxjs/operators';

interface ModalCloseEvent {
  id: string;
  result?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modals: Map<string, ComponentRef<any>> = new Map();
  private modalStack: string[] = [];

  private _openModalId$ = new BehaviorSubject<string | null>(null);

  private _onOpen$ = new Subject<string>();
  private _onClose$ = new Subject<ModalCloseEvent>();

  public openModalId$ = this._openModalId$.asObservable().pipe(distinctUntilChanged(), shareReplay(1));
  public onOpen$ = this._onOpen$.asObservable();

  constructor(private appRef: ApplicationRef) { }

  onClose(id: string): Observable<any> {
    return this._onClose$.asObservable().pipe(
      filter(event => event.id === id),
      map(event => event.result)
    );
  }

  open<T extends object>(id: string, component: Type<T>, data?: any): void {
    if (this.modals.has(id)) {
      console.warn(`Modal with ID '${id}' is already opened.`);
      return;
    }

    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
    });

    this.appRef.attachView(componentRef.hostView);

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        const inputDescriptor = Object.getOwnPropertyDescriptor(componentRef.instance, key);
        if (inputDescriptor && typeof inputDescriptor.value === 'function') {
          componentRef.setInput(key, value);
        } else {
          (componentRef.instance as any)[key] = value;
        }
      }
    }

    this.appRef.attachView(componentRef.hostView);

    const domElement = ((componentRef.hostView as any).rootNodes[0] as HTMLElement);
    const modalElement = domElement.getElementsByTagName("app-modal")[0] as HTMLElement

    const componentMetadata = reflectComponentType(component);
    const hasIdInput = componentMetadata?.inputs.some(input => input.propName === 'id');

    if (hasIdInput) componentRef.setInput('id', id);

    modalElement.id = id;

    modalElement.style.display = 'block';
    document.body.appendChild(domElement);

    this.modals.set(id, componentRef);
    this.modalStack.push(id);
    this._openModalId$.next(id);
    this._onOpen$.next(id);
  }

  close(id: string, result?: unknown): void {
    const componentRef = this.modals.get(id);
    if (!componentRef) return;

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.removeChild(domElem);

    componentRef.destroy();

    this.modals.delete(id);

    const index = this.modalStack.indexOf(id);
    if (index > -1) {
      this.modalStack.splice(index, 1);
    }

    this._onClose$.next({ id, result });

    if (this._openModalId$.getValue() === id) {
      const lastModalId = this.modalStack[this.modalStack.length - 1] || null;
      this._openModalId$.next(lastModalId);
    }
  }

  closeAll(): void {
    while (this.modalStack.length > 0) {
      this.closeLast();
    }
  }

  closeLast(): void {
    const lastModalId = this.modalStack.pop();
    if (lastModalId) {
      this.close(lastModalId, false);
    }
  }
}
