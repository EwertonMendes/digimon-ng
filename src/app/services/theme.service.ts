import { inject, Injectable } from '@angular/core';
import { THEMES } from 'app/core/consts/themes';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

export interface Theme {
  name: string;
  className: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themes = THEMES;

  private currentThemeSubject = new BehaviorSubject<Theme>(this.themes[0]);
  currentTheme$ = this.currentThemeSubject.asObservable();

  private configService = inject(ConfigService);

  getThemes(): Theme[] {
    return this.themes;
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(themeName: string): void {
    const newTheme = this.themes.find(t => t.name === themeName);
    if (!newTheme) return;

    this.currentThemeSubject.next(newTheme);
    this.applyTheme(newTheme.name);
    this.configService.updateConfig("theme", newTheme.name);
  }

  private applyTheme(themeName: string): void {
    const themeToRemove = document.body.className.match(/theme-[a-z0-9]+(?:-[a-z0-9]+)*/);
    if (themeToRemove) {
      document.body.classList.remove(themeToRemove[0]);
    }

    const themeClass = this.themes.find(t => t.name === themeName)?.className ?? '';
    if (themeClass) {
      document.body.classList.add(themeClass);
    }
  }
}
