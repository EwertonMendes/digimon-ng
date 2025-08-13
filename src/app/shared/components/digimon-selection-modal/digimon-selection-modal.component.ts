import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { BaseDigimon } from '../../../core/interfaces/digimon.interface';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-digimon-selection-modal',
  standalone: true,
  imports: [ModalComponent, TranslocoModule],
  templateUrl: './digimon-selection-modal.component.html',
  styleUrl: './digimon-selection-modal.component.scss',
})
export class DigimonSelectionModalComponent {
  id = input<string>('digimon-selection-modal');

  digimonList = input<BaseDigimon[]>();

  onSelectDigimon = output<BaseDigimon>();

  get groupedDigimonList() {
    const digimonList = this.digimonList();
    if (!digimonList || digimonList.length === 0) return [];

    const groups = this.groupDigimonsByFirstLetter(digimonList);
    return this.convertGroupsToArray(groups);
  }

  private groupDigimonsByFirstLetter(digimonList: BaseDigimon[]): Record<string, BaseDigimon[]> {
    return digimonList.reduce((acc, digimon) => {
      const firstLetter = this.getFirstLetter(digimon.name);
      if (!firstLetter) return acc;

      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(digimon);
      return acc;
    }, {} as Record<string, BaseDigimon[]>);
  }

  private getFirstLetter(name: string | undefined): string | null {
    if (!name || name.length === 0) return null;
    return name[0].toUpperCase();
  }

  private convertGroupsToArray(groups: Record<string, BaseDigimon[]>): { letter: string; digimons: BaseDigimon[] }[] {
    return Object.entries(groups).map(([letter, digimons]) => ({
      letter,
      digimons,
    }));
  }
}
