import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Digimon } from '@core/interfaces/digimon.interface';
import { GlobalStateDataSource } from '@state/global-state.datasource';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../modal/modal.service';
import { DeletionConfirmationModalComponent } from '@shared/components/deletion-confirmation-modal/deletion-confirmation-modal.component';
import { IconComponent } from '../icon/icon.component';
import gsap from 'gsap';

type BadgeType = 'healing' | 'damage' | 'miss' | 'none';

@Component({
  selector: 'app-digi-status-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './digi-status-card.component.html',
  styleUrls: ['./digi-status-card.component.scss'],
})
export class DigiStatusCardComponent implements AfterViewInit {
  digimon = input.required<Digimon>();

  private hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private change = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private modalService = inject(ModalService);
  globalState = inject(GlobalStateDataSource);

  badgeText = signal<string>('');
  badgeType = signal<BadgeType>('none');
  showBadge = signal(false);

  protected isHovered = signal(false);
  protected isDeletable = signal(false);

  private elCard!: HTMLElement;
  private elSlash: HTMLElement | null = null;
  private elSpark: HTMLElement | null = null;

  private tlHit!: gsap.core.Timeline;
  private tlBadge?: gsap.core.Timeline;

  changedName = computed(() => {
    if (this.isThisDigimon()) return;
    return this.globalState.getDigimonById(this.globalState.selectedDigimonOnDetails()?.id!)?.nickName;
  });

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
      .subscribe((evt) => {
        if (evt?.digimonId !== this.digimon().id) return;
        if (evt.difference === 0) {
          this.animateFloatingBadge('Miss', 'miss');
          return;
        }
        const isHeal = evt.isPositive && evt.difference > 0;
        const isDamage = !evt.isPositive && evt.difference > 0;
        if (isHeal) this.animateFloatingBadge(`+ ${evt.difference} HP`, 'healing');
        if (isDamage) {
          this.animateFloatingBadge(`- ${evt.difference} HP`, 'damage');
          this.playHitAnimation();
        }
      });
  }

  ngAfterViewInit(): void {
    this.elCard = this.hostRef.nativeElement;
    this.elSlash = this.elCard.querySelector<HTMLElement>('.hit-slash');
    this.elSpark = this.elCard.querySelector<HTMLElement>('.hit-spark');
    gsap.defaults({ overwrite: 'auto' });
    this.buildHitTimeline();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovered.set(true);
    const allPlayerDigimons = this.globalState.allPlayerDigimonList();
    const isPlayerDigimon = allPlayerDigimons.some((d) => d.id === this.digimon().id);
    const hasMultipleDigimons = allPlayerDigimons.length > 1;
    this.isDeletable.set(isPlayerDigimon && hasMultipleDigimons && !this.globalState.isBattleActive());
    this.onBadgeAnimationDone();
  }

  @HostListener('mouseleave')
  mouseleaveListener(): void {
    this.isHovered.set(false);
    this.isDeletable.set(false);
  }

  isThisDigimon(): boolean {
    return this.digimon().id !== this.globalState.selectedDigimonOnDetails()?.id;
  }

  openDeleteConfirmationModal() {
    this.modalService.open('deletion-confirmation-modal', DeletionConfirmationModalComponent, {
      digimon: this.digimon(),
    });
  }

  private animateFloatingBadge(text: string, type: BadgeType) {
    this.tlBadge?.kill();
    this.tlBadge = undefined;
    this.showBadge.set(false);

    setTimeout(() => {
      this.badgeText.set(text);
      this.badgeType.set(type);
      this.showBadge.set(true);

      requestAnimationFrame(() => {
        const el = this.elCard.querySelector<HTMLElement>('.modifications-item');
        if (!el) return;

        gsap.set(el, { opacity: 0, y: 10, scale: 0.98, transformOrigin: '50% 50%' });

        this.tlBadge = gsap.timeline({ onComplete: () => this.onBadgeAnimationDone() })
          .to(el, { opacity: 1, y: -8, scale: 1, duration: 0.35, ease: 'power2.out' })
          .to(el, { y: -96, opacity: 0, duration: 1.9, ease: 'power1.out', delay: 0.3 });
      });
    }, 0);
  }

  private onBadgeAnimationDone() {
    this.showBadge.set(false);
    this.badgeType.set('none');
    this.badgeText.set('');
  }

  private effectiveScaleX(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    const ow = el.offsetWidth || 1;
    return rect.width / ow;
  }
  private effectiveScaleY(el: HTMLElement): number {
    const rect = el.getBoundingClientRect();
    const oh = el.offsetHeight || 1;
    return rect.height / oh;
  }
  private ampX(px: number): number {
    const sx = this.effectiveScaleX(this.elCard) || 1;
    return px / sx;
  }
  private ampY(px: number): number {
    const sy = this.effectiveScaleY(this.elCard) || 1;
    return px / sy;
  }

  private buildHitTimeline() {
    const card = this.elCard;
    const slash = this.elSlash;
    const spark = this.elSpark;

    gsap.set(card, { x: 0, y: 0, rotation: 0, boxShadow: 'none', filter: 'none', transformOrigin: '50% 50%' });
    if (slash) {
      gsap.set(slash, { opacity: 0, scaleX: 0.2, scaleY: 0.9, rotate: -18, xPercent: -30, yPercent: -10, transformOrigin: '50% 50%' });
    }
    if (spark) {
      gsap.set(spark, { opacity: 0, scale: 0.6, rotate: 0, transformOrigin: '50% 50%' });
    }

    this.tlHit = gsap.timeline({ paused: true, smoothChildTiming: true });

    this.tlHit.add(() => { (card.style as any).transition = 'none'; }, 0);

    if (slash) {
      this.tlHit
        .to(slash, { opacity: 1, duration: 0.05, ease: 'power1.out' }, 0)
        .to(slash, { scaleX: 1.25, xPercent: 42, duration: 0.1, ease: 'power2.in' }, 0.02)
        .to(slash, { opacity: 0, duration: 0.1, ease: 'power2.out' }, 0.16)
        .add(() => { gsap.set(slash, { opacity: 0, scaleX: 0.2, xPercent: -30 }); }, 0.28);
    }

    if (spark) {
      this.tlHit
        .to(spark, { opacity: 1, scale: 1.12, duration: 0.08, ease: 'back.out(4)' }, 0.04)
        .to(spark, { rotate: 45, duration: 0.1, ease: 'power2.out' }, 0.06)
        .to(spark, { opacity: 0, scale: 0.9, duration: 0.12, ease: 'power1.in' }, 0.18)
        .add(() => { gsap.set(spark, { opacity: 0, scale: 0.6, rotate: 0 }); }, 0.32);
    }

    this.tlHit
      .to(card, { x: () => this.ampX(12), y: () => this.ampY(-3), rotation: 1.2, duration: 0.05, ease: 'power2.in' }, 0)
      .to(card, { x: () => this.ampX(-14), y: () => this.ampY(3), rotation: -1.2, duration: 0.06, ease: 'power2.inOut' })
      .to(card, { x: () => this.ampX(10), y: () => this.ampY(-2), rotation: 0.8, duration: 0.05, ease: 'power2.inOut' })
      .to(card, { x: () => this.ampX(-8), y: () => this.ampY(2), rotation: -0.8, duration: 0.05, ease: 'power2.inOut' })
      .to(card, { x: () => this.ampX(4), y: () => this.ampY(-1), rotation: 0.4, duration: 0.04, ease: 'power2.inOut' })
      .to(card, { x: 0, y: 0, rotation: 0, duration: 0.06, ease: 'power2.out' });

    this.tlHit
      .to(card, { boxShadow: '0 0 0.7rem rgba(255, 64, 64, 0.38)', filter: 'brightness(1.1) contrast(1.03)', duration: 0.12 }, 0.02)
      .to(card, { boxShadow: 'none', filter: 'none', duration: 0.18, ease: 'power1.out' }, 0.18);

    this.tlHit.add(() => { (card.style as any).transition = ''; }, '>');
  }

  private resetHitVisuals() {
    const card = this.elCard;
    const slash = this.elSlash;
    const spark = this.elSpark;

    gsap.set(card, { x: 0, y: 0, rotation: 0, boxShadow: 'none', filter: 'none' });
    if (slash) gsap.set(slash, { opacity: 0, scaleX: 0.2, xPercent: -30, yPercent: -10, rotate: -18 });
    if (spark) gsap.set(spark, { opacity: 0, scale: 0.6, rotate: 0 });
  }

  private playHitAnimation(): void {
    this.resetHitVisuals();

    this.resetHitVisuals();
    this.globalState.isBattleAnimationPlaying.set(true);

    this.tlHit.eventCallback('onComplete', () => {
      this.globalState.isBattleAnimationPlaying.set(false);
    });

    this.tlHit.pause(0).play(0);
  }
}
