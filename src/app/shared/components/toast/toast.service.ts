import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts$ = this.toastSubject.asObservable();

  constructor() {}

  showToast(
    message: string,
    type: 'success' | 'error' | 'info',
    icon?: string,
    position: 'top' | 'bottom' = 'bottom'
  ) {
    const iconMap: Record<string, string> = {
      success: 'check-fat',
      error: 'x-circle',
      info: 'info',
    };

    if (!icon) {
      icon = iconMap[type];
    }

    this.toastSubject.next({ message, type, position, icon });
  }
}
