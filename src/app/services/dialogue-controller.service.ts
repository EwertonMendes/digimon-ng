import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { DialogueService } from '@services/dialogue.service';
import { AiService } from '@services/ai.service';
import { ConfigStateDataSource } from '@state/config-state.datasource';
import { DigimonListLocation } from '@core/enums/digimon-list-location.enum';
import {
  Subject,
  Subscription,
  defer,
  timer,
  concatMap,
  takeUntil,
  catchError,
  map,
  of,
  take,
  repeat,
  Observable,
  exhaustMap,
  filter,
  pairwise,
  from,
  tap,
} from 'rxjs';
import { Digimon } from '@core/interfaces/digimon.interface';
import { StreamOut } from '@core/types/ai.type';

export enum LocalAiErrorCode {
  RuntimeMissing = 'RuntimeMissing',
  ModelMissing = 'ModelMissing',
  Unknown = 'Unknown',
}

export interface LocalAiError {
  code: LocalAiErrorCode;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DialogueControllerService {
  private readonly globalState = inject(GlobalStateDataSource);
  private readonly aiService = inject(AiService);
  private readonly dialogueService = inject(DialogueService);
  private readonly configState = inject(ConfigStateDataSource);

  private readonly localAiEnabled$ = toObservable(this.configState.localAiEnabled);
  private readonly localAiErrorSubject = new Subject<LocalAiError>();
  readonly errors$ = this.localAiErrorSubject.asObservable();

  private readonly eligibleLists = [
    DigimonListLocation.TEAM,
    DigimonListLocation.IN_TRAINING,
    DigimonListLocation.HOSPITAL,
  ];

  private stop$ = new Subject<void>();
  private sub: Subscription | null = null;
  private lastList: DigimonListLocation | null = null;
  private minDelayMs = 25_000;
  private maxDelayMs = 60_000;

  start(initialDelayMs = 10_000, minDelayMs?: number, maxDelayMs?: number): void {
    if (this.sub) return;

    if (minDelayMs && maxDelayMs && maxDelayMs >= minDelayMs) {
      this.minDelayMs = minDelayMs;
      this.maxDelayMs = maxDelayMs;
    }

    this.sub = new Subscription();

    const cycleSub = defer(() => timer(initialDelayMs).pipe(concatMap(() => this.runOnce())))
      .pipe(
        repeat({ delay: () => timer(this.randomBetween(this.minDelayMs, this.maxDelayMs)) }),
        takeUntil(this.stop$)
      )
      .subscribe();
    this.sub.add(cycleSub);

    const kickOnEnableSub = this.localAiEnabled$
      .pipe(
        pairwise(),
        filter(([prev, curr]) => !prev && !!curr),
        takeUntil(this.stop$),
        exhaustMap(() =>
          this.ensureLocalAiReady().pipe(
            concatMap((ready) => (ready ? this.runOnce() : of(void 0)))
          )
        )
      )
      .subscribe();
    this.sub.add(kickOnEnableSub);
  }

  stop(): void {
    if (!this.sub) return;
    this.stop$.next();
    this.sub.unsubscribe();
    this.sub = null;
    this.stop$ = new Subject<void>();
  }

  private runOnce(): Observable<void> {
    if (!this.configState.localAiEnabled()) return of(void 0);
    const location = this.pickNextLocation();
    const digimons = this.getDigimonsByList(location);
    if (!digimons.length) {
      const nextAvailable = this.findNextAvailableLocation(location);
      if (!nextAvailable) return of(void 0);
      return this.triggerDialogue(nextAvailable);
    }
    return this.triggerDialogue(location);
  }

  private triggerDialogue(location: DigimonListLocation): Observable<void> {
    const digimons = this.getDigimonsByList(location);
    if (!digimons.length) return of(void 0);

    const context = this.getContextForList(location);
    this.lastList = location;

    const dialogue$ = this.aiService.generateDialogueStream(context, digimons);
    if (!dialogue$) return of(void 0);
    this.dialogueService.playStreamingDialogue(dialogue$ as Observable<StreamOut>);

    return this.dialogueService.onDialogueComplete$.pipe(
      take(1),
      catchError(() => of(void 0)),
      map(() => void 0)
    );
  }

  private ensureLocalAiReady(): Observable<boolean> {
    return from(this.aiService.checkOllamaInstalled()).pipe(
      concatMap((installed) => {
        if (installed) return of(true);
        this.localAiErrorSubject.next({
          code: LocalAiErrorCode.RuntimeMissing,
          message: 'Ollama não está instalado neste sistema.',
        });
        this.configState.setLocalAiEnabled(false);
        return of(false);
      }),
      concatMap((ok) => (ok ? from(this.aiService['ensureOllamaRunning']()) : of(false))),
      concatMap((serverOk) => (serverOk ? from(this.aiService.isModelInstalled()) : of(false))),
      tap((modelOk) => {
        if (!modelOk) {
          this.localAiErrorSubject.next({
            code: LocalAiErrorCode.ModelMissing,
            message: 'O modelo local de IA não foi encontrado.',
          });
          this.configState.setLocalAiEnabled(false);
        }
      })
    );
  }

  private pickNextLocation(): DigimonListLocation {
    const options = this.eligibleLists.filter((l) => l !== this.lastList);
    const chosen = this.randomFrom(options);
    return chosen ?? this.eligibleLists[0];
  }

  private findNextAvailableLocation(start: DigimonListLocation): DigimonListLocation | null {
    const available = this.eligibleLists.filter(
      (l) => l !== start && this.getDigimonsByList(l).length > 0
    );
    return available.length ? this.randomFrom(available) : null;
  }

  private getDigimonsByList(location: DigimonListLocation): Digimon[] {
    const p = this.globalState.playerDataView();
    const mapping: Record<string, Digimon[]> = {
      [DigimonListLocation.TEAM]: p.digimonList,
      [DigimonListLocation.IN_TRAINING]: p.inTrainingDigimonList,
      [DigimonListLocation.HOSPITAL]: p.hospitalDigimonList,
    };
    return mapping[location] ?? [];
  }

  private getContextForList(location: DigimonListLocation): string {
    const name = this.globalState.playerDataView().name;
    const contexts: Record<string, string> = {
      [DigimonListLocation.TEAM]: `Digimons from ${name}'s main battle team are chatting while preparing for their next fight.`,
      [DigimonListLocation.IN_TRAINING]: `Digimons are training hard, cheering for each other's progress as ${name} supervises proudly.`,
      [DigimonListLocation.HOSPITAL]: `Some Digimons are resting in the hospital, recovering and sharing stories, getting better, recovering HP.`,
    };
    return contexts[location] ?? '';
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
