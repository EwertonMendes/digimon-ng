import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { ButtonComponent } from "@shared/components/button/button.component";
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { IconComponent } from "@shared/components/icon/icon.component";
import { SelectComponent } from '@shared/components/select/select.component';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { BaseDigimon } from '@core/interfaces/digimon.interface';
import { DigimonService } from '@services/digimon.service';
import { GlobalStateDataSource } from '@state/global-state.datasource';

type LabDigimon = BaseDigimon & { amount: number; cost: number; obtained: boolean };
type SortKey = 'name' | 'rank' | 'amount';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslocoModule, IconComponent, TooltipDirective, FormsModule, ReactiveFormsModule, CheckboxComponent, SelectComponent],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss',
})
export class LabComponent {
  protected labDigimons = signal<LabDigimon[]>([]);
  protected obtainedDigimonsAmount = computed(() => this.labDigimons().filter(d => d.obtained).length);

  protected sortBy = signal<SortKey>('name');
  protected sortDirection = signal<SortDirection>('asc');
  protected selectedRanks = signal<string[]>([]);
  protected uniqueRanks = computed(() => {
    const ranks = new Set(this.labDigimons().map(d => d.rank));
    return Array.from(ranks).sort(this.rankComparator.bind(this));
  });

  protected rankForm = signal<FormGroup>(new FormGroup({}));
  protected sortOptions = signal<{ label: string; value: SortKey }[]>([]);

  get sortByValue(): SortKey {
    return this.sortBy();
  }

  set sortByValue(value: SortKey) {
    this.sortBy.set(value);
  }

  protected filteredDigimons = computed(() => {
    let digimons = [...this.labDigimons()];

    if (this.selectedRanks().length > 0) {
      digimons = digimons.filter(d => this.selectedRanks().includes(d.rank));
    }

    const directionMultiplier = this.sortDirection() === 'asc' ? 1 : -1;
    digimons.sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (this.sortBy()) {
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          return directionMultiplier * compareA.localeCompare(compareB);
        case 'rank':
          compareA = this.getRankOrder(a.rank);
          compareB = this.getRankOrder(b.rank);
          return directionMultiplier * (compareA - compareB);
        case 'amount':
          compareA = a.amount;
          compareB = b.amount;
          return directionMultiplier * (compareA - compareB);
        default:
          return 0;
      }
    });

    return digimons;
  });

  protected globalState = inject(GlobalStateDataSource);
  private digimonService = inject(DigimonService);
  private fb = inject(FormBuilder);
  private transloco = inject(TranslocoService);

  constructor() {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed()).subscribe(() => {
      this.sortOptions.set([
        { label: this.transloco.translate('MODULES.LAB.SORT_ALPHA'), value: 'name' },
        { label: this.transloco.translate('MODULES.LAB.SORT_RANK'), value: 'rank' },
        { label: this.transloco.translate('MODULES.LAB.SORT_AMOUNT'), value: 'amount' }
      ]);
    });

    effect(() => {
      this.populateLabDigimons();
    });

    effect(() => {
      this.initializeRankForm();
    });
  }

  private populateLabDigimons(): void {
    const digimons: LabDigimon[] = [];

    Object.entries(this.globalState.playerDataView().digiData).forEach(([seed, digiData]) => {
      const digimon = this.digimonService.getBaseDigimonDataBySeed(seed) as LabDigimon | undefined;
      if (digimon) {
        digimon.amount = digiData.amount;
        digimon.cost = this.globalState.getBitCost(digimon.rank);
        digimon.obtained = digiData.obtained;
        digimons.push(digimon);
      }
    });

    this.labDigimons.set(digimons);
  }

  private initializeRankForm(): void {
    const ranks = this.uniqueRanks();
    const formGroup = this.fb.group({});

    ranks.forEach(rank => {
      const isSelected = this.selectedRanks().includes(rank);
      const control = new FormControl(isSelected);
      formGroup.addControl(rank, control);

      control.valueChanges.subscribe(value => {
        this.updateSelectedRanks(rank, value!);
      });
    });

    this.rankForm.set(formGroup);
  }

  private updateSelectedRanks(rank: string, value: boolean): void {
    const currentRanks = [...this.selectedRanks()];
    if (value && !currentRanks.includes(rank)) {
      currentRanks.push(rank);
    } else if (!value && currentRanks.includes(rank)) {
      currentRanks.splice(currentRanks.indexOf(rank), 1);
    }
    this.selectedRanks.set(currentRanks);
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

  resetFilters(): void {
    this.sortBy.set('name');
    this.sortDirection.set('asc');
    this.selectedRanks.set([]);

    const form = this.rankForm();
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setValue(false, { emitEvent: false });
    });
  }
}
