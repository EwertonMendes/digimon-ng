import { ToastComponent } from './../../../shared/components/toast/toast.component';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private _snackBar: MatSnackBar) {}

  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' | 'other' | 'negative',
    durationInSeconds = 3,
    position?: 'bottom' | 'top',
    panelClass?: string[],
    dynamicMessage?: string | number
  ): void {
    let className = '';
    let icon = '';

    switch (type) {
      case 'success':
        className = this.getClassName('success');
        icon = this.getIcon('success');
        break;
      case 'error':
        className = this.getClassName('error');
        icon = this.getIcon('error');
        break;
      case 'info':
        className = this.getClassName('info');
        icon = this.getIcon('info');
        break;
      case 'warning':
        className = this.getClassName('warning');
        icon = this.getIcon('warning');
        break;
      case 'negative':
        className = this.getClassName('negative');
        icon = this.getIcon('negative');
        break;
      default:
        className = this.getClassName('info');
        icon = this.getIcon('info');
        break;
    }

    this._snackBar.openFromComponent(ToastComponent, {
      data: { message, icon, dynamicMessage },
      horizontalPosition: 'end',
      verticalPosition: position == 'top' ? 'top' : 'bottom',
      duration: durationInSeconds ? durationInSeconds * 1000 : undefined,
      panelClass: panelClass ? [...panelClass, className] : className,
    });
  }

  getClassName(
    type: 'success' | 'error' | 'info' | 'warning' | 'negative'
  ): string {
    if (type === 'success') return 'bg-color-success';
    if (type === 'error') return 'bg-color-error';
    if (type === 'info') return 'bg-color-info';
    if (type === 'warning') return 'bg-color-warning';
    if (type === 'negative') return 'bg-color-secondary';

    return 'bg-color-info';
  }

  getIcon(type: 'success' | 'error' | 'info' | 'warning' | 'negative'): string {
    if (type === 'success') return 'done';
    if (type === 'error') return 'error';
    if (type === 'info') return 'info';
    if (type === 'warning') return 'warning';
    if (type === 'negative') return 'warning';

    return 'info';
  }
}
