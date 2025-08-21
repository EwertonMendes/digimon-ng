import { ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { BaseDigimon } from 'app/core/interfaces/digimon.interface';
import { DigimonService } from 'app/services/digimon.service';
import { ButtonComponent } from 'app/shared/components/button/button.component';
import { CheckboxComponent } from 'app/shared/components/checkbox/checkbox.component';
import { DigimonSelectionModalComponent } from 'app/shared/components/digimon-selection-modal/digimon-selection-modal.component';
import { ModalService } from 'app/shared/components/modal/modal.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { GlobalStateDataSource } from 'app/state/global-state.datasource';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-give-selected-digimon-modal',
  imports: [
    DigimonSelectionModalComponent,
    TranslocoModule,
    FormsModule,
    CheckboxComponent,
    ButtonComponent,
  ],
  templateUrl: './give-selected-digimon-modal.component.html',
  styleUrl: './give-selected-digimon-modal.component.scss',
})
export class GiveSelectedDigimonModalComponent implements OnInit {
  id = input.required<string>();
  selectableDigimonList = signal<BaseDigimon[]>([]);

  generateEvolutionLine = false;

  selectedLevel = 1;
  totalDigimonAmount = 0;

  $OnDestroy = new Subject<void>();

  private globalState = inject(GlobalStateDataSource);
  private digimonService = inject(DigimonService);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
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
        this.totalDigimonAmount = data.length;
      });
  }

  giveSelectedDigimon(digimon: BaseDigimon) {
    const newDigimon = this.globalState.generateDigimonBySeed(
      digimon.seed,
      this.selectedLevel,
      this.generateEvolutionLine
    );

    this.globalState.addDigimonToStorage(newDigimon);

    this.toastService.showToast(
      this.globalState.translocoService.translate(
        'SHARED.COMPONENTS.DEBUG_MODAL.ADDED_TO_STORAGE_LEVEL',
        { name: digimon.name, level: this.selectedLevel }
      ),
      'success'
    );
  }

  async refreshDigimonList() {
    await this.digimonService.readBaseDigimonDatabase();
    this.changeDetectorRef.detectChanges();
  }

  validateLevel(value: number): void {
    this.selectedLevel = Math.max(1, Math.min(value, 100));
  }
}
