import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [innerHTML]="svgContent() || fallbackSvg" class="icon-container" [ngStyle]="{'width': size(), 'height': size(), scale: scale()}" [attr.aria-label]="ariaLabel()"></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }
    div {
      line-height: 0;
    }
    div > svg {
      width: 100%;
      height: 100%;
    }
    .icon-container {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
      overflow: visible;
      position: relative;
    }
  `
})
export class IconComponent {
  name = input.required<string>();
  size = input<string>('24px');
  scale = input<string>('1');
  color = input<string>('currentColor');
  ariaLabel = input<string>('icon');

  svgContent = signal<SafeHtml>('');
  protected fallbackSvg: SafeHtml;

  private static iconCache: { [key: string]: SafeHtml } = {};

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.fallbackSvg = this.sanitizer.bypassSecurityTrustHtml(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect fill="gray" x="2" y="2" width="20" height="20"/></svg>'
    );

    effect(() => {
      const iconName = this.name();
      if (iconName) {
        this.loadSvg(iconName);
      }
    });
  }

  private loadSvg(iconName: string) {
    if (IconComponent.iconCache[iconName]) {
      this.svgContent.set(IconComponent.iconCache[iconName]);
    } else {
      this.http
        .get(`assets/icons/${iconName}.svg`, { responseType: 'text' })
        .pipe(takeUntilDestroyed(this.destroyRef),
          map(svg => {
            const safeSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
            IconComponent.iconCache[iconName] = safeSvg;
            return safeSvg;
          }),
          catchError(() => {
            return EMPTY;
          }),
        )
        .subscribe(safeSvg => {
          this.svgContent.set(safeSvg);
        });
    }
  }
}
