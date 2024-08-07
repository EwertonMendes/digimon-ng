import { Injectable } from '@angular/core';

export enum AudioTrack {
  VICTORY = 'assets/audio/victory-theme.mp3',
  DEFEAT = 'assets/audio/defeat-theme.mp3',
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio = new Audio();
  private currentTrack: string | null = null;

  playAudio(trackUrl: string, loop: boolean = false): void {
    if (this.currentTrack !== trackUrl) {
      this.stopAudio();
      this.audio.src = trackUrl;
      this.audio.load();
      this.currentTrack = trackUrl;
    }
    this.audio.loop = loop;
    this.audio.play();
  }

  pauseAudio(): void {
    this.audio.pause();
  }

  stopAudio(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTrack = null;
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }
}
