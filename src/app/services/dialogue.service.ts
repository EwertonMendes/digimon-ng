import { Injectable } from '@angular/core';
import { DialogueLine, DialoguePayload } from '@core/interfaces/dialogue.interface';
import { DialogueStreamEvent } from '@core/types/ai.type';
import { BehaviorSubject, Observable, Subscription, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogueService {
  private readonly currentLineSubject = new BehaviorSubject<DialogueLine | null>(null);
  readonly currentLine$ = this.currentLineSubject.asObservable();

  private readonly streamingTextSubject = new BehaviorSubject<string>('');
  readonly streamingText$ = this.streamingTextSubject.asObservable();

  private readonly isStreamingSubject = new BehaviorSubject<boolean>(false);
  readonly isStreaming$ = this.isStreamingSubject.asObservable();

  private readonly activeParticipantsSubject = new BehaviorSubject<string[]>([]);
  readonly activeParticipants$ = this.activeParticipantsSubject.asObservable();

  public lastActiveParticipantId: string | null = null;

  private streamingSubscription?: Subscription;
  private lineQueue: DialogueLine[] = [];
  private isPlaying = false;
  private readonly lineDisplayMs = 6000;

  beginStreaming(participantIds: string[]): void {
    const ids = (participantIds || []).filter(Boolean);
    this.setActiveParticipants(ids);
    this.isStreamingSubject.next(true);
    this.streamingTextSubject.next('');
    this.lineQueue = [];
    this.isPlaying = false;
    this.currentLineSubject.next(null);
  }

  endStreaming(): void {
    this.isStreamingSubject.next(false);
    this.activeParticipantsSubject.next([]);
    this.streamingTextSubject.next('');
  }

  setActiveParticipants(participantIds: string[]): void {
    const ids = (participantIds || []).filter(Boolean);
    this.activeParticipantsSubject.next(ids);
    this.lastActiveParticipantId = ids[ids.length - 1] ?? null;
  }

  async playDialogue(dialogue: DialoguePayload, delayMs = this.lineDisplayMs): Promise<void> {
    if (!dialogue?.dialogue?.length) return;
    for (const line of dialogue.dialogue) {
      this.currentLineSubject.next(line);
      await this.sleep(delayMs);
    }
    this.currentLineSubject.next(null);
  }

  playStreamingDialogue(stream$: Observable<DialogueStreamEvent>): void {
    this.stopStreaming(false);

    this.streamingSubscription = stream$
      .pipe(
        finalize(() => {
          this.streamingTextSubject.next('');
          void this.waitForQueueToFinish();
          this.endStreaming();
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'partial') {
            const chunk = String(event.data ?? '');
            this.streamingTextSubject.next(this.streamingTextSubject.value + chunk);
            return;
          }
          const completed = event.data as DialogueLine;
          this.streamingTextSubject.next('');
          this.enqueueLine(completed);
        },
        error: () => {
          this.streamingTextSubject.next('[Erro ao carregar diálogo]');
          this.endStreaming();
        },
        complete: () => { }
      });
  }

  stopStreaming(resetSignals = true): void {
    if (this.streamingSubscription) {
      this.streamingSubscription.unsubscribe();
      this.streamingSubscription = undefined;
    }
    this.lineQueue = [];
    this.isPlaying = false;
    this.streamingTextSubject.next('');
    this.currentLineSubject.next(null);
    if (resetSignals) this.endStreaming();
  }

  private enqueueLine(line: DialogueLine): void {
    this.lineQueue.push(line);
    if (this.isPlaying) return;
    this.isPlaying = true;
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.lineQueue.length > 0) {
      const nextLine = this.lineQueue.shift();
      if (!nextLine) break;
      this.currentLineSubject.next(nextLine);
      await this.sleep(this.lineDisplayMs);
    }
    this.isPlaying = false;
    this.currentLineSubject.next(null);
  }

  private async waitForQueueToFinish(): Promise<void> {
    while (this.isPlaying || this.lineQueue.length > 0) {
      await this.sleep(50);
    }
    this.streamingTextSubject.next('');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
