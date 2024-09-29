import { Injectable } from '@angular/core';
import { AudioEffects, AudioTracks } from '../core/enums/audio-tracks.enum';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioMap: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    this.preloadAllAudios();
  }

  private preloadAllAudios(): void {
    Object.values(AudioTracks).forEach((trackUrl) => {
      this.preloadAudio(trackUrl);
    });

    Object.values(AudioEffects).forEach((trackUrl) => {
      this.preloadAudio(trackUrl);
    });
  }

  private preloadAudio(trackUrl: string): void {
    if (!this.audioMap[trackUrl]) {
      const audio = new Audio(trackUrl);
      audio.load();
      this.audioMap[trackUrl] = audio;
    }
  }

  async playAudio(trackUrl: string, loop: boolean = false): Promise<void> {
    const audio = this.audioMap[trackUrl];
    if (!audio) {
      console.error(`Audio track ${trackUrl} not preloaded`);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.loop = loop;

    return new Promise((resolve) => {
      audio.onended = () => resolve();
      audio.play().catch((error) => {
        console.error(`Error playing audio track ${trackUrl}:`, error);
        resolve();
      });
    });
  }
}
