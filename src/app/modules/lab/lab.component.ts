import {
  AfterViewInit,
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

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

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
    let digimons = [...this.labDigimons()];

    if (this.selectedRanks().length > 0) {
      digimons = digimons.filter(d => this.selectedRanks().includes(d.rank));
    }

    if (this.filterObtained()) {
      digimons = digimons.filter(d => d.obtained);
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
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('labContent', { read: ElementRef }) labContent!: ElementRef<HTMLElement>;
  @ViewChildren('labCard', { read: ElementRef }) labCards!: QueryList<ElementRef>;

  private createdTriggers: ScrollTrigger[] = [];
  private resizeObs?: ResizeObserver;
  private refreshTimer: any;

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

  async ngAfterViewInit(): Promise<void> {
    const scroller = this.labContent?.nativeElement;
    const all = this.labCards.map(c => c.nativeElement as Element);

    if (!scroller || !all.length) {
      return;
    }

    gsap.set(all, { opacity: 0, y: 24 });

    await this.waitImages(scroller);

    this.createdTriggers.push(
      ...this.createBatch(all, scroller)
    );

    this.refreshSoon();

    this.labCards.changes.subscribe((q: QueryList<ElementRef>) => {
      const els = q.map(c => c.nativeElement as Element);
      if (!els.length) return;

      gsap.set(els, { opacity: 0, y: 24 });

      this.createdTriggers.push(
        ...this.createBatch(els, scroller)
      );

      this.refreshSoon();
    });

    this.resizeObs = new ResizeObserver(() => this.refreshSoon());
    this.resizeObs.observe(scroller);

    this.destroyRef.onDestroy(() => {
      this.resizeObs?.disconnect();
      this.createdTriggers.forEach(t => t.kill());
      this.createdTriggers = [];
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.globalTimeline.clear();
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
    });
  }

  private createBatch(targets: Element[], scroller: HTMLElement): ScrollTrigger[] {
    const triggers = ScrollTrigger.batch(targets, {
      start: 'top 85%',
      scroller,
      onEnter: (els: Element[]) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.08,
          overwrite: 'auto'
        });
      },
      onEnterBack: (els: Element[]) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    });

    return Array.isArray(triggers) ? triggers : [triggers];
  }

  private async waitImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (!imgs.length) return;
    await Promise.allSettled(
      imgs.map(img => {
        try {
          if ('decode' in img && typeof (img as HTMLImageElement).decode === 'function') {
            return (img as HTMLImageElement).decode();
          }
        } catch { }
        return Promise.resolve();
      })
    );
  }

  private refreshSoon(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    requestAnimationFrame(() => {
      this.refreshTimer = setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch { }
      }, 0);
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
  }
}
