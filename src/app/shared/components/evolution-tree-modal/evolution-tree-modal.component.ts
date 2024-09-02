import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { DigimonService } from '../../../services/digimon.service';
import { GraphService } from '../../../services/graph.service';
import Sigma from 'sigma';

@Component({
  selector: 'app-evolution-tree-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './evolution-tree-modal.component.html',
  styleUrls: ['./evolution-tree-modal.component.scss'],
})
export class EvolutionTreeModalComponent {
  private static readonly NODE_SIZE = 40;
  private static readonly EDGE_SIZE = 2;
  private static readonly NODE_COLOR = '#D95D39';
  private static readonly EDGE_COLOR = 'black';

  evolutionTreeModalId = 'evolution-tree-modal';
  mainDigimon = input<Digimon>();
  sigma!: Sigma;
  currentRank: string = 'Fresh';
  evolutionRouteDigimons: Digimon[] = [];
  selectedDigimon = signal<Digimon | undefined>(undefined);

  digimonService = inject(DigimonService);
  graphService = inject(GraphService);

  onOpen() {
    const container = document.getElementById('evolutionTreeWrapper')!;
    if (!container) return;

    this.evolutionRouteDigimons = this.getEvolutionRouteDigimons();
    this.sigma = this.graphService.createGraph(
      container,
      this.mainDigimon()!,
      this.evolutionRouteDigimons
    );

    this.setupGraphEventHandlers(container);
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

  private getEvolutionRouteDigimons(): Digimon[] {
    return this.mainDigimon()
      ?.currentEvolutionRoute?.map((evolution) =>
        this.digimonService.getBaseDigimonDataBySeed(evolution.seed)
      )
      .filter((digimon) => digimon !== undefined) as Digimon[];
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
      nodeAttributes['seed'] === this.mainDigimon()?.seed ||
      this.mainDigimon()?.currentEvolutionRoute?.some(
        (evolution) => evolution.seed === nodeAttributes['seed']
      )
    ) ?? false;
  }

  private isPartOfCurrentEvolutionRoute(digimon: Digimon): boolean {
    return (
      this.evolutionRouteDigimons?.some(
        (routeDigimon) => routeDigimon.seed === digimon.seed
      ) || digimon.seed === this.mainDigimon()?.seed
    );
  }

  private addPossibleEvolutions(digimon: Digimon, clickedNode: any) {
    const possibleEvolutions =
      this.digimonService.getDigimonEvolutions(digimon);

    possibleEvolutions?.forEach((evolution: Digimon, index: number) => {
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

  private addPossibleDegenerations(digimon: Digimon, clickedNode: any) {
    const possibleDegenerations =
      this.digimonService.getDigimonDegenerations(digimon);

    possibleDegenerations?.forEach((degeneration: Digimon, index: number) => {
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
    });
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

  private addNodeToGraph(digimon: Digimon, x: number, y: number) {
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
          )
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
    this.selectedDigimon.set(undefined);
    if (!this.sigma) return;
    this.sigma.kill();
  }
}
