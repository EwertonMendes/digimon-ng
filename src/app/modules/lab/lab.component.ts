import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { LocalizedNumberPipe } from 'app/pipes/localized-number.pipe';
import { BaseDigimon } from '@core/interfaces/digimon.interface';
import { DigimonService } from '@services/digimon.service';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { ModalService } from '@shared/components/modal/modal.service';
import { EvolutionTreeModalComponent } from '@shared/components/evolution-tree-modal/evolution-tree-modal.component';

type LabDigimon = BaseDigimon & { amount: number; cost: number; obtained: boolean };
type SortKey = 'name' | 'rank' | 'amount';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TranslocoModule,
    IconComponent,
    TooltipDirective,
    FormsModule,
    ReactiveFormsModule,
    CheckboxComponent,
    SelectComponent,
    LocalizedNumberPipe
  ],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabComponent {
  protected readonly globalState = inject(GlobalStateDataSource);
  private readonly digimonService = inject(DigimonService);
  private readonly fb = inject(FormBuilder);
  private readonly transloco = inject(TranslocoService);
  private readonly modalService = inject(ModalService);

  protected labDigimons = signal<LabDigimon[]>([]);
  protected obtainedDigimonsAmount = computed(
    () => this.labDigimons().filter(d => d.obtained).length
  );

  protected sortBy = model<SortKey>('name');
  protected filterObtained = model(false);
  protected sortDirection = signal<SortDirection>('asc');
  protected selectedRanks = signal<string[]>([]);
  protected rankForm = signal<FormGroup>(new FormGroup({}));
  protected sortOptions = signal<{ label: string; value: SortKey }[]>([]);

  protected uniqueRanks = computed(() => {
    const ranks = new Set(this.labDigimons().map(d => d.rank));
    return Array.from(ranks).sort(this.rankComparator.bind(this));
  });

  protected filteredDigimons = computed(() => {
    let digimons = [...this.labDigimons()];

    if (this.selectedRanks().length > 0) {
      digimons = digimons.filter(d => this.selectedRanks().includes(d.rank));
    }
    if (this.filterObtained()) {
      digimons = digimons.filter(d => d.obtained);
    }

    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    digimons.sort((a, b) => {
      switch (this.sortBy()) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'rank':
          return direction * (this.getRankOrder(a.rank) - this.getRankOrder(b.rank));
        case 'amount':
          return direction * (a.amount - b.amount);
      }
    });

    return digimons;
  });

  private lastDigimonSnapshot = '';

  constructor() {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed()).subscribe(() => {
      this.sortOptions.set([
        { label: this.transloco.translate('MODULES.LAB.SORT_ALPHA'), value: 'name' },
        { label: this.transloco.translate('MODULES.LAB.SORT_RANK'), value: 'rank' },
        { label: this.transloco.translate('MODULES.LAB.SORT_AMOUNT'), value: 'amount' }
      ]);
    });

    this.populateLabDigimons();
    this.initializeRankForm();

    effect(() => {
      const currentList = this.filteredDigimons();
      this.handleListChange(currentList);
    });
  }

  private handleListChange(digimons: LabDigimon[]): void {
    const snapshot = digimons.map(d => d.seed).join(',');
    if (snapshot !== this.lastDigimonSnapshot) {
      this.lastDigimonSnapshot = snapshot;
      setTimeout(() => this.resetAnimations(), 0);
    }
  }

  private resetAnimations(): void {
    const cards = document.querySelectorAll<HTMLElement>('.lab__content-card');
    cards.forEach(card => {
      card.classList.remove('lab__content-card--enter');
      void card.offsetWidth;
      card.classList.add('lab__content-card--enter');
    });
  }

  private populateLabDigimons(): void {
    const digimons: LabDigimon[] = [];
    Object.entries(this.globalState.playerDataView().digiData).forEach(([seed, digiData]) => {
      const digimon = this.digimonService.getBaseDigimonDataBySeed(seed) as LabDigimon | undefined;
      if (!digimon) return;
      digimons.push({
        ...digimon,
        amount: digiData.amount,
        cost: this.globalState.getBitCost(digimon.rank),
        obtained: digiData.obtained
      });
    });
    this.labDigimons.set(digimons);
  }

  private initializeRankForm(): void {
    const ranks = this.uniqueRanks();
    const formGroup = this.fb.group({});
    ranks.forEach(rank => {
      const control = new FormControl(this.selectedRanks().includes(rank));
      formGroup.addControl(rank, control);
      control.valueChanges.subscribe(value => this.updateSelectedRanks(rank, value ?? false));
    });
    this.rankForm.set(formGroup);
  }

  private updateSelectedRanks(rank: string, isSelected: boolean): void {
    const current = new Set(this.selectedRanks());
    if (isSelected) {
      current.add(rank);
    } else {
      current.delete(rank);
    }
    this.selectedRanks.set(Array.from(current));
  }

  private getRankOrder(rank: string): number {
    return this.digimonService.getRankOrder(rank);
  }

  private rankComparator(a: string, b: string): number {
    return this.getRankOrder(a) - this.getRankOrder(b);
  }

  convertDigiData(digimon: LabDigimon): void {
    const newDigimon = this.digimonService.generateDigimonBySeed(digimon.seed);
    if (newDigimon) {
      this.globalState.convertDigiData(newDigimon);
    }
  }

  showEvolutionsForDigimon(digimon: LabDigimon): void {
    this.modalService.open('evolution-tree-lab', EvolutionTreeModalComponent, {
      mainDigimon: digimon
    });
  }

  resetFilters(): void {
    this.sortBy.set('name');
    this.filterObtained.set(false);
    this.sortDirection.set('asc');
    this.selectedRanks.set([]);
    const form = this.rankForm();
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setValue(false, { emitEvent: false });
    });
    this.resetAnimations();
  }
}
