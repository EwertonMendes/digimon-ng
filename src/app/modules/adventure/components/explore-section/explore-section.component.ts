import { Component, inject, signal } from '@angular/core';
import { GlobalStateDataSource } from '../../../../state/global-state.datasource';
import { BattleModalComponent } from '../../../../shared/components/battle-modal/battle-modal.component';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { Digimon } from '../../../../core/interfaces/digimon.interface';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { DigimonSeeds } from '../../../../core/enums/digimon-seeds.enum';
import { AudioService } from '../../../../services/audio.service';
import { AudioEffects } from '../../../../core/enums/audio-tracks.enum';

interface Location {
  name: string;
  img: string;
  possibleEcounterDigimonSeeds: string[];
  levelRange: { min: number; max: number };
}

@Component({
  selector: 'app-explore-section',
  standalone: true,
  imports: [BattleModalComponent],
  templateUrl: './explore-section.component.html',
  styleUrl: './explore-section.component.scss',
})
export class ExploreSectionComponent {
  globalState = inject(GlobalStateDataSource);
  modalService = inject(ModalService);
  toastService = inject(ToastService);
  audioService = inject(AudioService);

  locations: Location[] = [
    {
      name: 'Login Mountain',
      img: 'assets/environments/loginmountain.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.BOTAMON,
        DigimonSeeds.KOROMON,
        DigimonSeeds.PITCHMON,
        DigimonSeeds.PUTTIMON,
        DigimonSeeds.MINOMON,
        DigimonSeeds.AGUMON,
        DigimonSeeds.GREYMON,
        DigimonSeeds.FALCOMON,
        DigimonSeeds.GOBURIMON,
      ],
      levelRange: { min: 1, max: 10 },
    },
    {
      name: 'Pixel Desert',
      img: 'assets/environments/pixeldesert.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.KOROMON,
        DigimonSeeds.AGUMON,
        DigimonSeeds.GEO_GREYMON,
        DigimonSeeds.APEMON,
        DigimonSeeds.SKULL_GREYMON,
        DigimonSeeds.METAL_GREYMON,
        DigimonSeeds.GROWLMON,
        DigimonSeeds.KUNEMON,
        DigimonSeeds.GABUMON,
        DigimonSeeds.GUILMON,
      ],
      levelRange: { min: 5, max: 15 },
    },
    {
      name: 'Label Forest',
      img: 'assets/environments/labelforest.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.TENTOMON,
        DigimonSeeds.KABUTERIMON,
        DigimonSeeds.MEGA_KABUTERIMON_RED,
        DigimonSeeds.MEGA_KABUTERIMON_BLUE,
        DigimonSeeds.KUNEMON,
        DigimonSeeds.MINOMON,
        DigimonSeeds.GATOMON,
        DigimonSeeds.SALAMON,
        DigimonSeeds.DOKUGUMON,
      ],
      levelRange: { min: 10, max: 20 },
    },
    {
      name: 'Register Jungle',
      img: 'assets/environments/registerjungle.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.GABUMON,
        DigimonSeeds.GARURUMON,
        DigimonSeeds.WAR_GARURUMON,
        DigimonSeeds.METAL_GARURUMON,
        DigimonSeeds.MINOMON,
        DigimonSeeds.GOBURIMON,
        DigimonSeeds.DODOMON,
        DigimonSeeds.FUGAMON,
        DigimonSeeds.OGREMON,
      ],
      levelRange: { min: 15, max: 25 },
    },
    {
      name: 'Proxy Island',
      img: 'assets/environments/proxyisland.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.GOMAMON,
        DigimonSeeds.IKKAKUMON,
        DigimonSeeds.GIGIMON,
        DigimonSeeds.GUILMON,
        DigimonSeeds.GROWLMON,
        DigimonSeeds.WAR_GROWLMON,
        DigimonSeeds.GEO_GREYMON,
      ],
      levelRange: { min: 20, max: 30 },
    },
    {
      name: 'Limit Valley',
      img: 'assets/environments/limitvalley.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.AGUMON,
        DigimonSeeds.GREYMON,
        DigimonSeeds.GEO_GREYMON,
        DigimonSeeds.RIZE_GREYMON,
        DigimonSeeds.SHINE_GREYMON,
        DigimonSeeds.BLUE_GREYMON,
        DigimonSeeds.DOKUGUMON,
        DigimonSeeds.KABUTERIMON,
        DigimonSeeds.MEGA_KABUTERIMON_BLUE,
        DigimonSeeds.MEGA_KABUTERIMON_RED,
      ],
      levelRange: { min: 25, max: 35 },
    },
    {
      name: 'Loop Swamp',
      img: 'assets/environments/loopswamp.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.BETAMON,
        DigimonSeeds.SEADRAMON,
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.GOMAMON,
        DigimonSeeds.IKKAKUMON,
        DigimonSeeds.GOMAMON,
        DigimonSeeds.IKKAKUMON,
        DigimonSeeds.ZUDOMON,
        DigimonSeeds.KYUKIMON,
      ],
      levelRange: { min: 30, max: 40 },
    },
    {
      name: 'Access Glacier',
      img: 'assets/environments/accessglacier.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.GABUMON,
        DigimonSeeds.GARURUMON,
        DigimonSeeds.WAR_GARURUMON,
        DigimonSeeds.METAL_GARURUMON,
        DigimonSeeds.ZUDOMON,
        DigimonSeeds.VIKEMON,
      ],
      levelRange: { min: 35, max: 45 },
    },
    {
      name: 'Angler Tunnel',
      img: 'assets/environments/anglertunnel.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.KOKUWAMON,
        DigimonSeeds.BLUE_METAL_GREYMON,
        DigimonSeeds.SHINE_GREYMON,
        DigimonSeeds.SKULL_GREYMON,
        DigimonSeeds.MACHINEDRAMON,
      ],
      levelRange: { min: 40, max: 50 },
    },
    {
      name: 'Magnet Mine',
      img: 'assets/environments/magnetmine.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.RIZE_GREYMON,
        DigimonSeeds.METAL_GREYMON,
        DigimonSeeds.WAR_GREYMON,
        DigimonSeeds.SKULL_GREYMON,
        DigimonSeeds.MACHINEDRAMON,
      ],
      levelRange: { min: 45, max: 55 },
    },
    {
      name: 'Packet Coast',
      img: 'assets/environments/packetcoast.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.TSUNOMON,
        DigimonSeeds.ARMADILLOMON,
        DigimonSeeds.GOMAMON,
        DigimonSeeds.IKKAKUMON,
        DigimonSeeds.GREYMON,
        DigimonSeeds.GEO_GREYMON,
        DigimonSeeds.RIZE_GREYMON,
        DigimonSeeds.SHINE_GREYMON,
      ],
      levelRange: { min: 50, max: 60 },
    },
    {
      name: 'Pallete Amazon',
      img: 'assets/environments/paletteamazon.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.BETAMON,
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.OGREMON,
        DigimonSeeds.KOROMON,
        DigimonSeeds.IKKAKUMON,
        DigimonSeeds.KABUTERIMON,
        DigimonSeeds.MEGA_KABUTERIMON_BLUE,
        DigimonSeeds.MEGA_KABUTERIMON_RED,
        DigimonSeeds.HERCULES_KABUTERIMON,
      ],
      levelRange: { min: 55, max: 65 },
    },
    {
      name: 'Thriller Ruins',
      img: 'assets/environments/thrillerruins.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.KUZUHAMON,
        DigimonSeeds.BLACK_WAR_GREYMON,
        DigimonSeeds.MEGIDRAMON,
        DigimonSeeds.DOKUGUMON,
        DigimonSeeds.KOKUWAMON,
      ],
      levelRange: { min: 60, max: 70 },
    },
    {
      name: 'Risk Factory',
      img: 'assets/environments/riskfactory.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.AIRDRAMON,
        DigimonSeeds.METAL_GREYMON,
        DigimonSeeds.BLUE_METAL_GREYMON,
        DigimonSeeds.WAR_GREYMON,
        DigimonSeeds.SKULL_GREYMON,
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.DOKUGUMON,
        DigimonSeeds.KOKUWAMON,
      ],
      levelRange: { min: 65, max: 75 },
    },
    {
      name: 'Shadow Abyss',
      img: 'assets/environments/shadowabyss.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.BETAMON,
        DigimonSeeds.SEADRAMON,
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.MEGIDRAMON,
        DigimonSeeds.AIRDRAMON,
        DigimonSeeds.GUILMON,
        DigimonSeeds.GROWLMON,
        DigimonSeeds.WAR_GROWLMON,
        DigimonSeeds.GEO_GREYMON,
        DigimonSeeds.ZEKE_GREYMON
      ],
      levelRange: { min: 70, max: 85 },
    },
    {
      name: 'Wizard Temple',
      img: 'assets/environments/wizardtemple.png',
      possibleEcounterDigimonSeeds: [
        DigimonSeeds.ANGEWOMON,
        DigimonSeeds.OPHANIMON,
        DigimonSeeds.HOLYDRAMON,
        DigimonSeeds.KYUKIMON,
        DigimonSeeds.KUZUHAMON,
        DigimonSeeds.DOKUGUMON,
        DigimonSeeds.MEGIDRAMON,
        DigimonSeeds.MACHINEDRAMON,
        DigimonSeeds.BLACK_WAR_GREYMON,
        DigimonSeeds.SKULL_GREYMON
      ],
      levelRange: { min: 75, max: 100 },
    },
  ];
  currentLocation = signal<Location | null>(null)

  baseTurnOrder: Digimon[] = [];
  actualTurnOrder: Digimon[] = [];
  showPlayerAttackButton = false;

  exploreLocation(location: Location) {
    this.currentLocation.set(location);
    this.audioService.playAudio(AudioEffects.CLICK);
    this.log(`Exploring location ${location.name}`);

    if (this.isPlayerTeamEmpty()) {
      this.log('No Digimon to explore with.');
      this.toastService.showToast('No Digimon to explore with.', 'error');
      return;
    }

    this.generateOpponentsOnExploreLocation(location);
    this.modalService.open('battle-modal');

    this.startBattle();
  }

  private isPlayerTeamEmpty(): boolean {
    const playerTeam = this.globalState.playerDataAcessor.digimonList;
    return playerTeam.length === 0 || playerTeam.every((d) => d.currentHp <= 0);
  }

  private generateOpponentsOnExploreLocation(location: Location) {
    const randomNumber = Math.round(Math.random() * 3) + 1;

    if (
      !location.possibleEcounterDigimonSeeds ||
      location.possibleEcounterDigimonSeeds.length === 0
    ) {
      for (let i = 0; i < randomNumber; i++) {
        const randomLevel = Math.floor(
          Math.random() * (location.levelRange.max - location.levelRange.min) +
            location.levelRange.min
        );
        const opponentDigimon =
          this.globalState.generateRandomDigimon(randomLevel);
        this.globalState.enemyTeamAccessor.push(opponentDigimon);
        this.log(`(Enemy) ${opponentDigimon.name} was found!`);
      }
      return;
    }

    for (let i = 0; i < randomNumber; i++) {
      const randomLevel = Math.floor(
        Math.random() * (location.levelRange.max - location.levelRange.min) +
          location.levelRange.min
      );
      const randomPossibleSeedIndex = Math.floor(
        Math.random() * location.possibleEcounterDigimonSeeds.length
      );
      const opponentDigimon = this.globalState.generateDigimonBySeed(
        location.possibleEcounterDigimonSeeds[randomPossibleSeedIndex],
        randomLevel
      );
      if (!opponentDigimon) return;
      this.globalState.enemyTeamAccessor.push(opponentDigimon);
      this.log(`(Enemy) ${opponentDigimon.name} was found!`);
    }
  }

  private startBattle() {
    this.globalState.startBattle();
  }

  private log(message: string) {
    this.globalState.log(message);
  }
}
