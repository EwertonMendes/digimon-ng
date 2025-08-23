import { Injectable } from '@angular/core';
import { AudioEffects, AudioTracks } from '@core/enums/audio-tracks.enum';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioMap: { [key: string]: HTMLAudioElement } = {};
  private shouldPlayAudio!: boolean;

  constructor() {
    this.preloadAllAudios();
  }

  get isAudioEnabled(): boolean {
    return this.shouldPlayAudio;
  }

  set isAudioEnabled(value: boolean) {
    this.shouldPlayAudio = value;
    if (!value) {
      Object.values(this.audioMap).forEach((audio) => audio.pause());
    }
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

    if (!this.shouldPlayAudio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.loop = loop;

    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`Error playing audio track ${trackUrl}`));

      audio.play().catch((error) => {
        if (error.name === 'AbortError') {
          resolve();
          return;
        }
        console.error(`Error playing audio track ${trackUrl}:`, error);
        reject(error);
      });
    });
  }
}
