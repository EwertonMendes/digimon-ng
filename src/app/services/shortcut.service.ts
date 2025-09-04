import { inject, Injectable } from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { invoke } from '@tauri-apps/api/core';

interface ShortcutConfig {
  key: string;
  modifiers: string[];
  action: () => Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {

  private readonly globalState = inject(GlobalStateDataSource);

  private shortcuts: Record<string, ShortcutConfig> = {
    'exitApp': {
      key: 'F4',
      modifiers: ['Alt'],
      action: async () => invoke('exit_app')
    },
    'preventReload': {
      key: 'F5',
      modifiers: [],
      action: async () => { }
    },
    'saveGame': { key: 'S', modifiers: ['Ctrl'], action: () => this.saveGame() }
  };

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private async saveGame() {
    await this.globalState.saveCurrentPlayerData();
  }

  private async handleKeyDown(event: KeyboardEvent) {
    for (const config of Object.values(this.shortcuts)) {
      if (event.key.toUpperCase() === config.key.toUpperCase() &&
        this.checkModifiers(event, config.modifiers)) {
        event.preventDefault();
        await config.action();
      }
    }
  }

  private checkModifiers(event: KeyboardEvent, requiredModifiers: string[]): boolean {
    const modifiersMap: Record<string, boolean> = {
      'Alt': event.altKey,
      'Ctrl': event.ctrlKey,
      'Shift': event.shiftKey,
      'Meta': event.metaKey
    };

    return requiredModifiers.every(mod => modifiersMap[mod]) &&
      Object.keys(modifiersMap).every(mod => requiredModifiers.includes(mod) || !modifiersMap[mod]);
  }
}
