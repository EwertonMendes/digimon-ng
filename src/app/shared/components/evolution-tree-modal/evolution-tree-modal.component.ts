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

    this.removeUpperRankNodes(clickedNode);

    const digimon = this.digimonService.getBaseDigimonDataBySeed(
      clickedNode['seed']
    );
    this.selectedDigimon.set(digimon);

    if (this.isPartOfCurrentEvolutionRoute(digimon!)) {
      this.addPossibleDegenerations(digimon!, clickedNode);
    }
    this.addPossibleEvolutions(digimon!, clickedNode);
  }

  private isPartOfCurrentEvolutionRoute(digimon: Digimon): boolean {
    return (
      !!this.evolutionRouteDigimons?.find(
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

      let newNodeX = clickedNode['x'] + 1;
      let newNodeY = clickedNode['y'] + index;

      if (this.hasNodeInPosition(newNodeX, newNodeY)) {
        newNodeY++;
      }

      this.sigma.getGraph().addNode(evolution.seed, {
        label: `${evolution.name} (${evolution.rank})`,
        x: newNodeX,
        y: newNodeY,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: evolution.img,
        seed: evolution.seed,
        rank: evolution.rank,
      });
      this.sigma.getGraph().addEdge(clickedNode['seed'], evolution.seed, {
        size: 2,
        color: 'black',
      });
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

      let newNodeX = clickedNode['x'] - 1;
      let newNodeY = clickedNode['y'] + index;

      if (this.hasNodeInPosition(newNodeX, newNodeY)) {
        newNodeY++;
      }

      this.sigma.getGraph().addNode(degeneration.seed, {
        label: `${degeneration.name} (${degeneration.rank})`,
        x: newNodeX,
        y: newNodeY,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: degeneration.img,
        seed: degeneration.seed,
        rank: degeneration.rank,
      });
      this.sigma.getGraph().addEdge(degeneration.seed, clickedNode['seed'], {
        size: 2,
        color: 'black',
      });
    });
  }

  private removeUpperRankNodes(clickedNode: any) {
    const upperRankNodeToDrop = this.sigma
      .getGraph()
      .nodes()
      .filter((node) => {
        const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);
        return (
          nodeAttributes['seed'] !== this.mainDigimon()?.seed &&
          !this.evolutionRouteDigimons?.find(
            (evolution) => evolution.seed === nodeAttributes['seed']
          ) &&
          this.digimonService.getRankOrder(nodeAttributes['rank']) >
            this.digimonService.getRankOrder(this.currentRank)
        );
      });

    upperRankNodeToDrop.forEach((node) => {
      this.sigma.getGraph().dropNode(node);
    });
  }

  private hasNodeInPosition(x: number, y: number) {
    const node = this.sigma.getGraph().findNode((node) => {
      const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);
      return nodeAttributes['x'] === x && nodeAttributes['y'] === y;
    });
    return node;
  }

  onClose() {
    this.selectedDigimon.set(undefined);
    if (!this.sigma) return;
    this.sigma.kill();
  }
}
