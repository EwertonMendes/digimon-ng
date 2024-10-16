import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Toast, ToastService } from './toast.service';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('void', style({ opacity: 0, transform: 'translateY(100%)' })),
      transition(':enter', [
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(100%)' })
        ),
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];
  maxToasts: number = 5;

  toastService = inject(ToastService);
  changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.toastService.toasts$.subscribe((toast) => {
      if (this.toasts.length >= this.maxToasts) {
        this.toasts.shift();
      }
      this.toasts.push(toast);
      this.changeDetectorRef.detectChanges();
      setTimeout(() => this.removeToast(0), 5000);
    });
  }

  removeToast(index: number) {
    this.toasts.splice(index, 1);
  }
}
