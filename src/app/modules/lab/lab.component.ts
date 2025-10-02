import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  model,
  QueryList,
  signal,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { TooltipDirective } from 'app/directives/tooltip.directive';
import { BaseDigimon } from '@core/interfaces/digimon.interface';
import { DigimonService } from '@services/digimon.service';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { ModalService } from '@shared/components/modal/modal.service';
import { EvolutionTreeModalComponent } from '@shared/components/evolution-tree-modal/evolution-tree-modal.component';
import { LocalizedNumberPipe } from 'app/pipes/localized-number.pipe';
import { setupLabCardAnimations } from './lab.animations';
import { startLabLayoutController } from './lab.layout';

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
    LocalizedNumberPipe,
    ScrollingModule
  ],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabComponent implements AfterViewInit {
  protected labDigimons = signal<LabDigimon[]>([]);
  protected obtainedDigimonsAmount = computed(() => this.labDigimons().filter(d => d.obtained).length);
  protected sortBy = model<SortKey>('name');
  protected filterObtained = model<boolean>(false);
  protected sortDirection = signal<SortDirection>('asc');
  protected selectedRanks = signal<string[]>([]);
  protected uniqueRanks = computed(() => {
    const ranks = new Set(this.labDigimons().map(d => d.rank));
    return Array.from(ranks).sort(this.rankComparator.bind(this));
  });
  protected rankForm = signal<FormGroup>(new FormGroup({}));
  protected sortOptions = signal<{ label: string; value: SortKey }[]>([]);
  protected filteredDigimons = computed(() => {
    let digimons = this.labDigimons();
    if (this.selectedRanks().length > 0) digimons = digimons.filter(d => this.selectedRanks().includes(d.rank));
    if (this.filterObtained()) digimons = digimons.filter(d => d.obtained);
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return [...digimons].sort((a, b) => {
      switch (this.sortBy()) {
        case 'name': return dir * a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'rank': return dir * (this.getRankOrder(a.rank) - this.getRankOrder(b.rank));
        case 'amount': return dir * (a.amount - b.amount);
        default: return 0;
      }
    });
  });
  protected columns = signal<number>(3);
  protected virtualRows = computed(() => {
    const cols = Math.max(1, this.columns());
    const src = this.filteredDigimons();
    const out: LabDigimon[][] = [];
    for (let i = 0; i < src.length; i += cols) out.push(src.slice(i, i + cols));
    return out;
  });
  protected globalState = inject(GlobalStateDataSource);
  private digimonService = inject(DigimonService);
  private fb = inject(FormBuilder);
  private transloco = inject(TranslocoService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('viewport', { read: ElementRef }) viewportRef!: ElementRef<HTMLElement>;
  @ViewChildren('labCard', { read: ElementRef }) labCards!: QueryList<ElementRef>;

  constructor() {
    this.transloco.selectTranslation().pipe(takeUntilDestroyed()).subscribe(() => {
      this.sortOptions.set([
        { label: this.transloco.translate('MODULES.LAB.SORT_ALPHA'), value: 'name' },
        { label: this.transloco.translate('MODULES.LAB.SORT_RANK'), value: 'rank' },
        { label: this.transloco.translate('MODULES.LAB.SORT_AMOUNT'), value: 'amount' }
      ]);
    });
    effect(() => { this.populateLabDigimons(); });
    effect(() => { this.initializeRankForm(); });
  }

  ngAfterViewInit(): void {
    startLabLayoutController(this.viewportRef, this.columns, this.destroyRef);
    setupLabCardAnimations(this.labCards, this.viewportRef, this.destroyRef);
  }

  protected trackBySeed = (_: number, d: LabDigimon) => d.seed;
  protected trackByRow = (index: number, row: LabDigimon[]) => row?.[0]?.seed ?? index;

  private populateLabDigimons(): void {
    const digimons: LabDigimon[] = [];
    const view = this.globalState.playerDataView();
    const entries = Object.entries(view.digiData);
    for (let i = 0; i < entries.length; i++) {
      const [seed, digiData] = entries[i];
      const digimon = this.digimonService.getBaseDigimonDataBySeed(seed) as LabDigimon | undefined;
      if (!digimon) continue;
      digimons.push({
        ...digimon,
        amount: digiData.amount,
        cost: this.globalState.getBitCost(digimon.rank),
        obtained: digiData.obtained
      });
    }
    this.labDigimons.set(digimons);
  }

  private initializeRankForm(): void {
    const ranks = this.uniqueRanks();
    const formGroup = this.fb.group({});
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      const control = new FormControl(this.selectedRanks().includes(rank));
      formGroup.addControl(rank, control);
      control.valueChanges.subscribe(value => this.updateSelectedRanks(rank, value!));
    }
    this.rankForm.set(formGroup);
  }

  private updateSelectedRanks(rank: string, value: boolean): void {
    const current = this.selectedRanks().slice();
    const idx = current.indexOf(rank);
    if (value && idx === -1) current.push(rank);
    if (!value && idx !== -1) current.splice(idx, 1);
    this.selectedRanks.set(current);
  }

  private getRankOrder(rank: string): number {
    return this.digimonService.getRankOrder(rank);
  }

  private rankComparator(a: string, b: string): number {
    return this.getRankOrder(a) - this.getRankOrder(b);
  }

  convertDigiData(digimon: LabDigimon): void {
    const newDigimon = this.digimonService.generateDigimonBySeed(digimon.seed);
    if (newDigimon) this.globalState.convertDigiData(newDigimon);
  }

  showEvolutionsForDigimon(digimon: LabDigimon): void {
    this.modalService.open('evolution-tree-lab', EvolutionTreeModalComponent, { mainDigimon: digimon });
  }

  resetFilters(): void {
    this.sortBy.set('name');
    this.filterObtained.set(false);
    this.sortDirection.set('asc');
    this.selectedRanks.set([]);
    const form = this.rankForm();
    const keys = Object.keys(form.controls);
    for (let i = 0; i < keys.length; i++) form.get(keys[i])?.setValue(false, { emitEvent: false });
  }
}
