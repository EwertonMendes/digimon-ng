import { ChangeDetectorRef, Component, computed, DestroyRef, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { BaseDigimon } from 'app/core/interfaces/digimon.interface';
import { DigimonService } from 'app/services/digimon.service';
import { ButtonComponent } from 'app/shared/components/button/button.component';
import { DigimonSelectionModalComponent } from 'app/shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { EvolutionTreeModalComponent } from 'app/shared/components/evolution-tree-modal/evolution-tree-modal.component';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InputComponent } from 'app/shared/components/input/input.component';

@Component({
  selector: 'app-see-evolution-tree-modal',
  imports: [DigimonSelectionModalComponent, ButtonComponent, TranslocoModule, CheckboxComponent, FormsModule, ReactiveFormsModule, InputComponent],
  templateUrl: './see-evolution-tree-modal.component.html',
  styleUrl: './see-evolution-tree-modal.component.scss'
})
export class SeeEvolutionTreeModalComponent {
  id = input.required<string>();

  private evolutionTreeModalId = 'evolution-tree-modal-debug';

  protected selectedEvolutionLineDigimon = signal<BaseDigimon>({} as BaseDigimon);
  protected selectableDigimonList = signal<BaseDigimon[]>([]);
  protected totalDigimonAmount = signal<number>(0);

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

  private modalService = inject(ModalService)

  private digimonService = inject(DigimonService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.modalService.onOpen$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
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

  onOpen() {
    if (this.selectableDigimonList().length !== 0) return;
    this.digimonService.baseDigimonData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.selectableDigimonList.set(
          data.sort((a, b) => a.name.localeCompare(b.name))
        );
        this.totalDigimonAmount.set(data.length);
      });
  }

  async refreshDigimonList() {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDetectorRef.detectChanges();
  }

  openEvolutionTreeModal(digimon: BaseDigimon) {
    this.selectedEvolutionLineDigimon.set(digimon);
    this.changeDetectorRef.detectChanges();
    this.modalService.open(this.evolutionTreeModalId, EvolutionTreeModalComponent, {
      mainDigimon: digimon
    });
  }
}
