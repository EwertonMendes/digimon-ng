import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import {
  BaseDigimon,
  Digimon,
} from '../../../core/interfaces/digimon.interface';
import { DigimonService } from '../../../services/digimon.service';
import { GraphService } from '../../../services/graph.service';
import Sigma from 'sigma';
import { ButtonComponent } from '../button/button.component';
import { GlobalStateDataSource } from '../../../state/global-state.datasource';
import '@phosphor-icons/web/light';
import '@phosphor-icons/web/bold';
import { AudioEffects } from '../../../core/enums/audio-tracks.enum';
import { AudioService } from '../../../services/audio.service';
import { ModalComponent } from '../modalV2/modal.component';
import { ModalService } from '../modalV2/modal.service';
import { EvolutionConfirmationModalCloseEvent, EvolutionConfirmationModalComponent } from './components/evolution-confirmation-modal/evolution-confirmation-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-evolution-tree-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, TranslocoModule],
  templateUrl: './evolution-tree-modal.component.html',
  styleUrls: ['./evolution-tree-modal.component.scss'],
})
export class EvolutionTreeModalComponent implements AfterViewInit {
  @HostListener('window:resize', [])
  onResize() {
    this.adjustEvolutionTreeZoom();
  }

  ngAfterViewInit() {
    this.adjustEvolutionTreeZoom();
  }

  private static readonly NODE_SIZE = 40;
  private static readonly EDGE_SIZE = 2;
  private static readonly NODE_COLOR = '#191919';
  private static readonly EDGE_COLOR = 'black';

  id = input<string>('evolution-tree-modal');
  mainDigimon = input<Digimon | BaseDigimon>();
  sigma!: Sigma;
  currentRank: string = 'Fresh';
  evolutionRouteDigimons: BaseDigimon[] = [];
  canEvolve = signal<boolean>(false);
  selectedDigimon = signal<BaseDigimon | null>(null);
  selectedPossibleEvolutionStats = signal<any | null>(null);

  private digimonService = inject(DigimonService);
  private graphService = inject(GraphService);
  protected globalState = inject(GlobalStateDataSource);
  private modalService = inject(ModalService);
  private audioService = inject(AudioService);
  private elementRef = inject(ElementRef<HTMLElement>);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(
      () => {
        if (!this.isDigimon(this.mainDigimon())) return;
        if (
          !this.mainDigimon() ||
          !this.digimonService.checkRequirements(
            this.mainDigimon()!,
            this.selectedDigimon()!
          )
        ) {
          this.canEvolve.set(false);
          return;
        }

        this.canEvolve.set(
          this.mainDigimon()?.digiEvolutionSeedList?.some(
            (seed) => seed === this.selectedDigimon()?.seed
          ) ?? false
        );
      }
    );
  }

  onOpen() {
    const container = this.elementRef.nativeElement.querySelector('#evolutionTreeWrapper')!;

    if (!container) return;

    this.evolutionRouteDigimons = this.getEvolutionRouteDigimons();

    setTimeout(() => {
      this.sigma = this.graphService.createGraph(
        container,
        this.mainDigimon()!,
        this.evolutionRouteDigimons
      );
      this.setupGraphEventHandlers(container);
    }, 0)
  }

  private setupGraphEventHandlers(container: HTMLElement) {
    this.sigma.on('enterNode', () => {
      container.style.cursor = 'pointer';
    });
    this.sigma.on('leaveNode', () => {
      container.style.cursor = 'default';
    });
    this.sigma.on('clickNode', (data) => this.handleNodeClick(data));
  }

  private getEvolutionRouteDigimons(): BaseDigimon[] {
    return this.mainDigimon()
      ?.currentEvolutionRoute?.map((evolution: { seed: string; }) =>
        this.digimonService.getBaseDigimonDataBySeed(evolution.seed)
      )
      .filter((digimon: Digimon | BaseDigimon) => digimon !== undefined) as BaseDigimon[];
  }

  private handleNodeClick(data: any) {
    const clickedNode = this.sigma.getGraph().getNodeAttributes(data.node);
    this.currentRank = clickedNode['rank'];

    if (this.isMainOrEvolutionRouteNode(clickedNode)) {
      this.removeAllNonEvolutionRouteNodes(clickedNode);
    } else {
      this.removeUpperRankNodes();
    }

    const digimon = this.digimonService.getBaseDigimonDataBySeed(
      clickedNode['seed']
    );
    this.selectedDigimon.set(digimon);

    if (this.isPartOfCurrentEvolutionRoute(digimon!)) {
      this.addPossibleDegenerations(digimon!, clickedNode);
    }
    this.addPossibleEvolutions(digimon!, clickedNode);
  }

  private isMainOrEvolutionRouteNode(nodeAttributes: any): boolean {
    return (
      (nodeAttributes['seed'] === this.mainDigimon()?.seed ||
        this.mainDigimon()?.currentEvolutionRoute?.some(
          (evolution: { seed: string; }) => evolution.seed === nodeAttributes['seed']
        )) ??
      false
    );
  }

  private isPartOfCurrentEvolutionRoute(digimon: BaseDigimon): boolean {
    return (
      this.evolutionRouteDigimons?.some(
        (routeDigimon) => routeDigimon.seed === digimon.seed
      ) || digimon.seed === this.mainDigimon()?.seed
    );
  }

  private addPossibleEvolutions(digimon: BaseDigimon, clickedNode: any) {
    const possibleEvolutions =
      this.digimonService.getDigimonEvolutions(digimon);

    possibleEvolutions?.forEach((evolution: BaseDigimon, index: number) => {
      if (this.sigma.getGraph().findNode((node) => node === evolution.seed)) {
        return;
      }

      const { newNodeX, newNodeY } = this.calculateNewNodePosition(
        clickedNode,
        index,
        1
      );

      this.addNodeToGraph(evolution, newNodeX, newNodeY);
      this.addEdgeToGraph(clickedNode['seed'], evolution.seed);
    });
  }

  private addPossibleDegenerations(digimon: BaseDigimon, clickedNode: any) {
    const possibleDegenerations =
      this.digimonService.getDigimonDegenerations(digimon);

    possibleDegenerations?.forEach(
      (degeneration: BaseDigimon, index: number) => {
        if (
          this.sigma.getGraph().findNode((node) => node === degeneration.seed)
        ) {
          return;
        }

        const { newNodeX, newNodeY } = this.calculateNewNodePosition(
          clickedNode,
          index,
          -1
        );

        this.addNodeToGraph(degeneration, newNodeX, newNodeY);
        this.addEdgeToGraph(degeneration.seed, clickedNode['seed']);
      }
    );
  }

  private calculateNewNodePosition(
    clickedNode: any,
    index: number,
    direction: number
  ) {
    let newNodeX = clickedNode['x'] + direction;
    let newNodeY = clickedNode['y'] + index;

    if (this.hasNodeInPosition(newNodeX, newNodeY)) {
      newNodeY++;
    }

    return { newNodeX, newNodeY };
  }

  private addNodeToGraph(digimon: BaseDigimon, x: number, y: number) {
    this.sigma.getGraph().addNode(digimon.seed, {
      label: `${digimon.name} (${digimon.rank})`,
      x,
      y,
      size: EvolutionTreeModalComponent.NODE_SIZE,
      color: EvolutionTreeModalComponent.NODE_COLOR,
      type: 'image',
      image: digimon.img,
      seed: digimon.seed,
      rank: digimon.rank,
    });
  }

  private addEdgeToGraph(sourceSeed: string, targetSeed: string) {
    this.sigma.getGraph().addEdge(sourceSeed, targetSeed, {
      size: EvolutionTreeModalComponent.EDGE_SIZE,
      color: EvolutionTreeModalComponent.EDGE_COLOR,
      sourceSeed,
      targetSeed,
    });
  }

  private removeAllNonEvolutionRouteNodes(clickedNode: any) {
    const nodesToDrop = this.sigma
      .getGraph()
      .nodes()
      .filter((node) => {
        const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);

        return (
          nodeAttributes['seed'] !== clickedNode['seed'] &&
          !this.evolutionRouteDigimons?.some(
            (evolution) => evolution.seed === nodeAttributes['seed']
          ) &&
          this.mainDigimon()?.seed !== nodeAttributes['seed']
        );
      });

    nodesToDrop.forEach((node) => {
      this.sigma.getGraph().dropNode(node);
    });
  }

  private removeUpperRankNodes() {
    const nodesToDrop = this.sigma
      .getGraph()
      .nodes()
      .filter((node) => {
        const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);
        return (
          nodeAttributes['seed'] !== this.mainDigimon()?.seed &&
          !this.evolutionRouteDigimons?.some(
            (evolution) => evolution.seed === nodeAttributes['seed']
          ) &&
          this.digimonService.getRankOrder(nodeAttributes['rank']) >
          this.digimonService.getRankOrder(this.currentRank)
        );
      });

    nodesToDrop.forEach((node) => {
      this.sigma.getGraph().dropNode(node);
    });
  }

  private hasNodeInPosition(x: number, y: number): boolean {
    return !!this.sigma.getGraph().findNode((node) => {
      const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);
      return nodeAttributes['x'] === x && nodeAttributes['y'] === y;
    });
  }

  onClose() {
    this.selectedDigimon.set(null);
    if (!this.sigma) return;
    this.sigma.kill();
  }

  isDigimon(digimon: Digimon | BaseDigimon | undefined): digimon is Digimon {
    if (!digimon) return false;
    return digimon.hasOwnProperty('id');
  }

  showEvolutionConfirmationModal() {
    this.audioService.playAudio(AudioEffects.CLICK);

    this.selectedPossibleEvolutionStats.set(
      this.digimonService.getPossibleEvolutionStats(
        this.mainDigimon()!,
        this.selectedDigimon()!
      )
    );

    this.modalService.open('evolution-confirmation-modal', EvolutionConfirmationModalComponent, {
      mainDigimon: this.mainDigimon(),
      selectedDigimon: this.selectedDigimon(),
      selectedPossibleEvolutionStats: this.selectedPossibleEvolutionStats()
    });

    this.modalService.onClose('evolution-confirmation-modal')
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(async (result: EvolutionConfirmationModalCloseEvent) => {

        if (!this.mainDigimon() || !this.selectedDigimon() || !this.isDigimon(this.mainDigimon()) || !result.refreshGraph) return;

        this.onClose();
        this.onOpen();
      });
  }

  adjustEvolutionTreeZoom() {
    const appRoot = document.getElementsByTagName('app-root')[0];
    const evolutionTreeWrapper = document.getElementById('evolutionTreeWrapper');

    if (!appRoot || !evolutionTreeWrapper) return;

    const zoom = Number(getComputedStyle(appRoot).zoom || '1');

    const adjustedZoom = 1 / zoom;
    evolutionTreeWrapper.style.zoom = `${adjustedZoom}`;
  }
}
