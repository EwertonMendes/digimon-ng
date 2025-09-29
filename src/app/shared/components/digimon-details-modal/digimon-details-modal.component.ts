import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { CommonModule } from '@angular/common';
import { EvolutionRouteComponent } from '../evolution-route/evolution-route.component';
import { ButtonComponent } from '../button/button.component';
import { EvolutionTreeModalComponent } from '../evolution-tree-modal/evolution-tree-modal.component';
import { BaseDigimon } from '@core/interfaces/digimon.interface';
import { AudioEffects } from '@core/enums/audio-tracks.enum';
import { AudioService } from '@services/audio.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../modal/modal.service';
import { InputComponent } from '../input/input.component';
import { FormsModule } from '@angular/forms';
import { IconComponent } from "../icon/icon.component";
import { TooltipDirective } from "app/directives/tooltip.directive";
import { getDefaultPotential } from '@core/utils/digimon.utils';
import { LocalizedNumberPipe } from 'app/pipes/localized-number.pipe';

@Component({
  standalone: true,
  selector: 'app-digimon-details-modal',
  templateUrl: './digimon-details-modal.component.html',
  styleUrl: './digimon-details-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ModalComponent,
    CommonModule,
    EvolutionRouteComponent,
    ButtonComponent,
    TranslocoModule,
    InputComponent,
    FormsModule,
    IconComponent,
    TooltipDirective,
    LocalizedNumberPipe
  ],
})
export class DigimonDetailsModalComponent {
  protected digimonDetailsModalId = signal('digimon-details-modal');
  private evolutionTreeModalId = 'evolution-tree-modal';

  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private translocoService = inject(TranslocoService);

  protected digimonDetailedAge = computed(() => {
    if (!this.globalState.selectedDigimonOnDetails()) return;

    return this.formatAge(
      this.calculateDetailedAge(
        this.globalState.selectedDigimonOnDetails()?.birthDate ??
        new Date()
      )
    );
  });

  protected neededExpForNextLevel = computed(() =>
    this.globalState.getDigimonNeededExpForNextLevel()
  );

  protected maxLevelForCurrentRank = computed(() => getDefaultPotential(this.globalState.selectedDigimonOnDetails()!.rank));

  protected evolutionRoute = signal<BaseDigimon[]>([]);

  protected isEditingName = signal<boolean>(false);

  protected digimonNickname = model<string>(this.globalState.selectedDigimonOnDetails()?.nickName ?? '')

  constructor() {
    effect(
      () => {
        const evolutionList = this.globalState.getDigimonCurrentEvolutionRoute(
          this.globalState.selectedDigimonOnDetails()!
        );

        if (!evolutionList) {
          this.evolutionRoute.set([]);
          return;
        }

        this.evolutionRoute.set(evolutionList);
      }
    );
  }

  calculateDetailedAge(birthDate: Date): {
    years: number;
    months: number;
    days: number;
    hours: number;
  } {
    const currentDate = new Date();
    const birth = new Date(birthDate);

    let years = currentDate.getFullYear() - birth.getFullYear();
    let months = currentDate.getMonth() - birth.getMonth();
    let days = currentDate.getDate() - birth.getDate();
    let hours = currentDate.getHours() - birth.getHours();

    const HOURS_IN_A_DAY = 24;
    const MONTHS_IN_A_YEAR = 12;

    if (hours < 0) {
      hours += HOURS_IN_A_DAY;
      days--;
    }

    if (days < 0) {
      const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += MONTHS_IN_A_YEAR;
      years--;
    }

    return { years, months, days, hours };
  }

  formatAge(age: { years: number; months: number; days: number; hours: number }): string {
    const t = this.translocoService;
    const parts: string[] = [];

    const addPart = (value: number, key: string) => {
      if (value > 0) {
        const pluralKey = value === 1
          ? `SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.${key}`
          : `SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.${key}_PLURAL`;
        parts.push(t.translate(pluralKey, { count: value }));
      }
    };

    addPart(age.years, 'YEAR');
    addPart(age.months, 'MONTH');
    addPart(age.days, 'DAY');
    addPart(age.hours, 'HOUR');

    return parts.length > 0
      ? parts.join(', ')
      : t.translate('SHARED.COMPONENTS.DIGIMON_DETAILS_MODAL.LESS_THAN_HOUR');
  }

  openEvolutionTreeModal() {
    this.audioService.playAudio(AudioEffects.CLICK);
    this.modalService.open(this.evolutionTreeModalId, EvolutionTreeModalComponent, {
      mainDigimon: this.globalState.selectedDigimonOnDetails()
    });
  }

  showChangeNameField() {
    this.isEditingName.set(true);
  }

  saveNewDigimonName() {
    this.isEditingName.set(false);

    if (!this.digimonNickname() || !this.globalState.selectedDigimonOnDetails() || this.digimonNickname() === this.globalState.selectedDigimonOnDetails()?.nickName) return;

    this.globalState.changeDigimonName(this.digimonNickname());
  }

  onCloseModal() {
    this.globalState.selectedDigimonOnDetails.set(undefined);
  }
}
