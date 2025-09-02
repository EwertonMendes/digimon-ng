
import { Injectable } from '@angular/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

@Injectable({
  providedIn: 'root',
})
export class WindowService {

  async toggleFullscreen() {
    const isFullscreen = await getCurrentWindow().isFullscreen();
    await getCurrentWindow().setFullscreen(!isFullscreen);
  }

  async setFullscreen(value: boolean) {
    await getCurrentWindow().setFullscreen(value);
  }

  async isFullscreen() {
    return await getCurrentWindow().isFullscreen();
  }
}
