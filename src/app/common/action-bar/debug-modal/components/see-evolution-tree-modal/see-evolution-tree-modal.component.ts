import { ChangeDetectorRef, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import { BaseDigimon } from 'app/core/interfaces/digimon.interface';
import { DigimonService } from 'app/services/digimon.service';
import { ButtonComponent } from 'app/shared/components/button/button.component';
import { DigimonSelectionModalComponent } from 'app/shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { EvolutionTreeModalComponent } from 'app/shared/components/evolution-tree-modal/evolution-tree-modal.component';
import { ModalV2Service } from 'app/shared/components/modalV2/modal.service';

@Component({
  selector: 'app-see-evolution-tree-modal',
  imports: [DigimonSelectionModalComponent, ButtonComponent, TranslocoModule],
  templateUrl: './see-evolution-tree-modal.component.html',
  styleUrl: './see-evolution-tree-modal.component.scss'
})
export class SeeEvolutionTreeModalComponent {
  id = input.required<string>();

  evolutionTreeModalId = 'evolution-tree-modal-debug';

  selectedEvolutionLineDigimon = signal<BaseDigimon>({} as BaseDigimon);
  selectableDigimonList = signal<BaseDigimon[]>([]);
  totalDigimonAmount = signal<number>(0);

  private modalService = inject(ModalV2Service)

  private digimonService = inject(DigimonService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.modalService.onOpen$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.onOpen();
    })
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
