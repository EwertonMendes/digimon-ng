import { Injectable } from '@angular/core';
import { AudioTracks } from '../core/enums/audio-tracks.enum';
@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioMap: { [key: string]: HTMLAudioElement } = {};
  private currentTrack: string | null = null;

  constructor() {
    this.preloadAllAudios();
  }

  private preloadAllAudios(): void {
    Object.values(AudioTracks).forEach((trackUrl) => {
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

  playAudio(trackUrl: string, loop: boolean = false): void {
    const audio = this.audioMap[trackUrl];
    if (!audio) {
      console.error(`Audio track ${trackUrl} not preloaded`);
      return;
    }
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (this.currentTrack !== trackUrl) {
      this.stopAudio();
      this.currentTrack = trackUrl;
    }
    audio.loop = loop;
    audio.play();
  }

  pauseAudio(): void {
    if (this.currentTrack && this.audioMap[this.currentTrack]) {
      this.audioMap[this.currentTrack].pause();
    }
  }

  stopAudio(): void {
    if (this.currentTrack && this.audioMap[this.currentTrack]) {
      const audio = this.audioMap[this.currentTrack];
      audio.pause();
      audio.currentTime = 0;
      this.currentTrack = null;
    }
  }

  setVolume(volume: number): void {
    if (this.currentTrack && this.audioMap[this.currentTrack]) {
      this.audioMap[this.currentTrack].volume = volume;
    }
  }

  isPlaying(): boolean {
    return this.currentTrack ? !this.audioMap[this.currentTrack].paused : false;
  }
}
