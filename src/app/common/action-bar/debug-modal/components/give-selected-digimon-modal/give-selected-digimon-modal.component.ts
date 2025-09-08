import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  computed,
  signal,
  model,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { InputComponent } from '@shared/components/input/input.component';
import { BaseDigimon } from 'app/core/interfaces/digimon.interface';
import { DigimonService } from 'app/services/digimon.service';
import { ButtonComponent } from 'app/shared/components/button/button.component';
import { CheckboxComponent } from 'app/shared/components/checkbox/checkbox.component';
import { DigimonSelectionModalComponent } from 'app/shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { GlobalStateDataSource } from 'app/state/global-state.datasource';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-give-selected-digimon-modal',
  imports: [
    DigimonSelectionModalComponent,
    TranslocoModule,
    FormsModule,
    CheckboxComponent,
    ButtonComponent,
    ReactiveFormsModule,
    InputComponent
  ],
  templateUrl: './give-selected-digimon-modal.component.html',
  styleUrl: './give-selected-digimon-modal.component.scss',
})
export class GiveSelectedDigimonModalComponent implements OnInit {
  id = input.required<string>();

  protected selectableDigimonList = signal<BaseDigimon[]>([]);

  protected generateEvolutionLine = false;
  protected selectedLevel = 1;

  protected showFreshDigimons = model<boolean>(true);
  protected showInTrainingDigimons = model<boolean>(true);
  protected showRookieDigimons = model<boolean>(true);
  protected showChampionDigimons = model<boolean>(true);
  protected showUltimateDigimons = model<boolean>(true);
  protected showMegaDigimons = model<boolean>(true);

  private readonly rankSignalMap: Record<string, () => boolean> = {
    Fresh: () => this.showFreshDigimons(),
    'In-Training': () => this.showInTrainingDigimons(),
    Rookie: () => this.showRookieDigimons(),
    Champion: () => this.showChampionDigimons(),
    Ultimate: () => this.showUltimateDigimons(),
    Mega: () => this.showMegaDigimons(),
  };

  protected searchControl = new FormControl('');
  protected searchTerm = signal<string>('');

  protected filteredDigimonList = computed(() => {
    const all = this.selectableDigimonList();
    if (!all?.length) return [];

    const lowerSearch = this.searchTerm().toLowerCase();

    return all.filter((d) => {
      const rank = d.rank.toString();
      return this.rankSignalMap[rank]() && (!lowerSearch || d.name.toLowerCase().includes(lowerSearch));
    });
  });

  private readonly globalState = inject(GlobalStateDataSource);
  private readonly digimonService = inject(DigimonService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly translocoService = inject(TranslocoService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.modalService.onOpen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onOpen();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.searchTerm.set(value || '');
    });
  }

  onOpen(): void {
    if (this.selectableDigimonList().length !== 0) return;

    this.digimonService.baseDigimonData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const sorted = (data ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
        this.selectableDigimonList.set(sorted);
      });
  }

  giveSelectedDigimon(digimon: BaseDigimon): void {
    const newDigimon = this.globalState.generateDigimonBySeed(
      digimon.seed,
      this.selectedLevel,
      this.generateEvolutionLine
    );

    this.globalState.addDigiData(digimon.seed, 10, true);

    this.globalState.addDigimonToStorage(newDigimon);

    this.toastService.showToast(
      this.translocoService.translate('SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE_LEVEL', {
        name: digimon.name,
        level: newDigimon.level,
      }),
      'success'
    );
  }

  async refreshDigimonList(): Promise<void> {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDetectorRef.detectChanges();
  }

  validateLevel(value: number): void {
    this.selectedLevel = Math.max(1, Math.min(value, 100));
  }
}
