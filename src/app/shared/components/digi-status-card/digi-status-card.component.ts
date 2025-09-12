import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { Digimon } from '@core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
  keyframes,
} from '@angular/animations';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../modal/modal.service';
import { DeletionConfirmationModalComponent } from '@shared/deletion-confirmation-modal/deletion-confirmation-modal.component';
import { IconComponent } from "../icon/icon.component";

@Component({
  selector: 'app-digi-status-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './digi-status-card.component.html',
  styleUrls: ['./digi-status-card.component.scss'],
  animations: [
    trigger('damage', [
      state('normal', style({ transform: 'translateX(0)' })),
      state('attacked', style({ transform: 'translateX(10px)' })),
      transition('normal => attacked', [
        animate('0.1s ease-in', style({ transform: 'translateX(20px)' })),
        animate('0.1s ease-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        animate(
          '4s ease-out',
          keyframes([
            style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
            style({ opacity: 0, transform: 'translateY(-60px)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})

export class DigiStatusCardComponent {
  digimon = input.required<Digimon>();
  globalState = inject(GlobalStateDataSource);
  hpChange = signal<any>({
    hpChangeValue: 0,
    changeType: 'none',
  });
  showHpChange = signal(false);

  protected isHovered = signal(false);
  protected isDeletable = signal(false);

  private change = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private modalService = inject(ModalService);

  damageState = computed(() => {
    return this.globalState.currentDefendingDigimon()?.id === this.digimon().id
      ? 'attacked'
      : 'normal';
  });

  changedName = computed(() => {
    if (this.isThisDigimon()) return;

    return this.globalState.getDigimonById(this.globalState.selectedDigimonOnDetails()?.id!)?.nickName;
  })

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovered.set(true);
    const allPlayerDigimons = this.globalState.allPlayerDigimonList();
    const isPlayerDigimon = allPlayerDigimons.some(digimon => digimon.id === this.digimon().id);
    const hasMultipleDigimons = allPlayerDigimons.length > 1;
    this.isDeletable.set(isPlayerDigimon && hasMultipleDigimons && !this.globalState.isBattleActive);
  }

  @HostListener('mouseleave')
  public mouseleaveListener(): void {
    this.isHovered.set(false);
    this.isDeletable.set(false);
  }

  constructor() {
    effect(() => {

      if (this.isThisDigimon()) return;
      this.change.markForCheck();

      if (this.changedName()) {
        this.digimon().nickName = this.changedName();
      }
    });


    this.globalState.digimonHpChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((current) => {
        this.change.markForCheck();
        if (current?.digimonId !== this.digimon().id) return;

        if (this.showHpChange()) {
          this.showHpChange.set(false);
        }

        setTimeout(() => {
          this.showHpChange.set(true);
          const changeType = current.isPositive ? 'healing' : 'damage';
          this.hpChange.set({
            hpChangeValue: current.difference,
            changeType,
          });
        }, 100);
      });
  }

  isThisDigimon(): boolean {
    return this.digimon().id !== this.globalState.selectedDigimonOnDetails()?.id;
  }

  resetDamageState() {
    this.globalState.currentDefendingDigimon.set(null);
  }

  onHpChangeAnimationDone() {
    this.showHpChange.set(false);
    this.hpChange.set({
      hpChangeValue: 0,
      changeType: 'none',
    });
  }

  openDeleteConfirmationModal() {
    this.modalService.open('deletion-confirmation-modal', DeletionConfirmationModalComponent, {
      digimon: this.digimon()
    });
  }
}
