import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AudioService } from '@services/audio.service';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { StorageModalComponent } from '@shared/components/storage-modal/storage-modal.component';
import { PlayerInfoModalComponent } from '@shared/components/player-info-modal/player-info-modal.component';
import { DebugModalComponent } from './debug-modal/debug-modal.component';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { environment } from 'app/environments/environment';
import { ConfigModalComponent } from './config-modal/config-modal.component';
import { TranslocoModule } from '@jsverse/transloco';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { IconComponent } from "@shared/components/icon/icon.component";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AiService } from '@services/ai.service';
import { DialogueService } from '@services/dialogue.service';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [
    TranslocoModule,
    TooltipDirective,
    IconComponent,
    CommonModule
  ],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ActionBarComponent implements OnInit {
  playerInfoModalId = 'player-info-modal';
  digimonStorageModalId = 'digimon-storage-modal';
  debugModalId = 'debug-modal';
  configModalId = 'config-modal';

  protected isDebugMenuUnlocked = signal<boolean>(!environment.production);

  protected currentRoute = signal<string>('');

  private modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private router = inject(Router);
  protected globalState = inject(GlobalStateDataSource);
  private aiService = inject(AiService);
  private destroyRef = inject(DestroyRef);
  private readonly dialogueService = inject(DialogueService)

  private numberOfClicks = signal<number>(0);
  private clickTimeout: NodeJS.Timeout | null = null;

  @HostListener('click')
  async onClick() {

    const dialogueStream$ = this.aiService.generateDialogueStream(
      `Digimons are in battle team list, waiting for the next battle,
      where they will fight together. They are in a friendly
      and relaxed atmosphere, chatting and teasing each other while
      waiting for the battle to start.
      They are excited and a bit nervous about the upcoming battle,
      but they are also confident in their abilities and trust in their teammates.
      They are discussing strategies, sharing tips, and trying to lighten the mood with jokes and playful banter.
      ]The battles occur when the player ${this.globalState.playerDataView().name}
      selects a location to explore on Adventure route.`,
      this.globalState.playerDataView().digimonList
    );

    this.dialogueService.playStreamingDialogue(dialogueStream$);

    if (this.isDebugMenuUnlocked()) return;
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.numberOfClicks.set(this.numberOfClicks() + 1);
    if (this.numberOfClicks() >= 15) {
      this.isDebugMenuUnlocked.set(true);
    }
    this.clickTimeout = setTimeout(() => {
      this.numberOfClicks.set(0);
    }, 500);
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.urlAfterRedirects.split('/')[1]);
    });
  }

  openDigimonStorageModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.digimonStorageModalId, StorageModalComponent);
  }

  openPlayerInfoModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.playerInfoModalId, PlayerInfoModalComponent);
  }

  openDebugModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.debugModalId, DebugModalComponent);
  }

  openConfigModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.configModalId, ConfigModalComponent);
  }

  navigateTo(url: string) {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.router.navigate([url]);
  }

  async saveGame() {
    this.globalState.saveCurrentPlayerData();
  }
}
