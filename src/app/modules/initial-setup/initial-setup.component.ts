import { Component, inject, model, OnInit, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { GlobalStateDataSource } from '../../state/global-state.datasource';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { BaseDigimon, Digimon } from '../../core/interfaces/digimon.interface';
import { CommonModule } from '@angular/common';
import { DigimonSeeds } from '../../core/enums/digimon-seeds.enum';
import { SelectComponent } from 'app/shared/components/select/select.component';

type InitialTeam = {
  name: string;
  members: BaseDigimon[];
}

@Component({
  selector: 'app-initial-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, TranslocoModule, SelectComponent],
  templateUrl: './initial-setup.component.html',
  styleUrl: './initial-setup.component.scss'
})
export class InitialSetupComponent implements OnInit {
  tamerName = model('');
  teams: InitialTeam[] = [];
  selectableTeams = [
    {
      name: 'Dragon Force',
      seeds: [
        DigimonSeeds.KOROMON,
        DigimonSeeds.AGUMON,
        DigimonSeeds.AIRDRAMON,
      ]
    },
    {
      name: 'Aqua Guardians',
      seeds: [
        DigimonSeeds.PUKAMON,
        DigimonSeeds.BETAMON,
        DigimonSeeds.SEADRAMON,
      ]
    },
    {
      name: 'Storm Strikers',
      seeds: [
        DigimonSeeds.DORIMON,
        DigimonSeeds.ARMADILLOMON,
        DigimonSeeds.BLUE_GREYMON,
      ]
    },
    {
      name: 'Beast Brigade',
      seeds: [
        DigimonSeeds.PUTTIMON,
        DigimonSeeds.GOBURIMON,
        DigimonSeeds.APEMON,
      ]
    },
    {
      name: 'Claw Masters',
      seeds: [
        DigimonSeeds.GIGIMON,
        DigimonSeeds.GABUMON,
        DigimonSeeds.GEO_GREYMON,
      ]
    },
    {
      name: 'Mystic Warriors',
      seeds: [
        DigimonSeeds.MINOMON,
        DigimonSeeds.FALCOMON,
        DigimonSeeds.GARURUMON,
      ]
    }
  ]
  selectedTeam = signal<BaseDigimon[]>([]);
  languageOptions = [
    { label: 'English', value: 'en', icon: 'assets/flags/en.svg' },
    { label: 'Español', value: 'es', icon: 'assets/flags/es.svg' },
    { label: 'Português Brasil', value: 'pt-br', icon: 'assets/flags/pt-br.svg' },
  ];
  selectedLanguage = model('en');

  globalState = inject(GlobalStateDataSource);
  translocoService = inject(TranslocoService);

  ngOnInit(): void {
    this.teams = this.selectableTeams.map((team) => {
      return {
        name: team.name,
        members: team.seeds.map((seed) => {
          const digimon = this.globalState.getBaseDigimonDataBySeed(seed);
          if (!digimon) throw Error('Digimon not found');
          return digimon;
        })
      }
    });
  }

  selectTeam(team: BaseDigimon[]) {
    this.selectedTeam.set(team);
  }

  confirmInitialSetup() {
    let selectedDigimons: Digimon[] = [];
    this.selectedTeam().forEach((digimon) => {
      selectedDigimons.push(this.globalState.generateDigimonBySeed(digimon.seed));
    });
    this.globalState.confirmInitialSetup(this.tamerName(), selectedDigimons);
  }

  changeLanguage(language: string): void {
    this.translocoService.setActiveLang(language);
    this.selectedLanguage.set(language);
  }

  protected getTeamKey(name: string): string {
    return `MODULES.INITIAL_SETUP.TEAMS.${name.replace(/\s/g, '_').toUpperCase()}`;
  }
}
