import Graph from 'graphology';
import Sigma from 'sigma';
import { Component, inject, input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { Digimon } from '../../../core/interfaces/digimon.interface';
import { NodeImageProgram } from '@sigma/node-image';
import { Settings } from 'sigma/settings';
import { NodeDisplayData, PartialButFor } from 'sigma/types';
import { DigimonService } from '../../../services/digimon.service';

@Component({
  selector: 'app-evolution-tree-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './evolution-tree-modal.component.html',
  styleUrl: './evolution-tree-modal.component.scss',
})
export class EvolutionTreeModalComponent {
  evolutionTreeModalId = 'evolution-tree-modal';

  mainDigimon = input<Digimon>();
  sigma!: Sigma;
  currentRank: string = 'Fresh';
  evolutionRouteDigimons: Digimon[] = [];

  digimonService = inject(DigimonService);

  onOpen() {
    const container = document.getElementById('evolutionTreeWrapper')!;
    if (!container) return;

    const graph = new Graph();

    this.evolutionRouteDigimons = this.mainDigimon()
      ?.currentEvolutionRoute?.map((evolution) => {
        const digimon = this.digimonService.getBaseDigimonDataBySeed(
          evolution.seed
        );

        if (!digimon) return;

        return digimon;
      })
      .filter((digimon) => digimon !== undefined) as Digimon[];

    this.evolutionRouteDigimons?.forEach((digimon, index) => {
      if (!digimon) return;

      graph.addNode(digimon.name, {
        label: digimon.name,
        x: index,
        y: 0,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: digimon.img,
        seed: digimon.seed,
        rank: digimon.rank,
      });

      if (index > 0) {
        graph.addEdge(
          this.evolutionRouteDigimons[index - 1]?.name,
          digimon.name,
          {
            size: 2,
            color: 'black',
          }
        );
      }
    });

    graph.addNode(this.mainDigimon()?.name, {
      label: this.mainDigimon()?.name,
      x: this.evolutionRouteDigimons?.length ?? 0,
      y: 0,
      size: 40,
      color: '#D95D39',
      type: 'image',
      image: this.mainDigimon()?.img,
      seed: this.mainDigimon()?.seed,
      rank: this.mainDigimon()?.rank,
    });

    if (this.evolutionRouteDigimons?.length) {
      graph.addEdge(
        this.evolutionRouteDigimons[this.evolutionRouteDigimons.length - 1]
          ?.name,
        this.mainDigimon()?.name,
        { size: 2, color: 'black' }
      );
    }

    const possibleEvolutions = this.digimonService.getDigimonEvolutions(
      this.mainDigimon()
    );

    possibleEvolutions.forEach((evolution, index) => {
      graph.addNode(evolution.name, {
        label: evolution.name,
        x: this.evolutionRouteDigimons?.length! + 1,
        y: index,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: evolution.img,
        seed: evolution.seed,
        rank: evolution.rank,
      });

      graph.addEdge(this.mainDigimon()?.name, evolution.name, {
        size: 2,
        color: 'black',
      });
    });

    this.currentRank = this.mainDigimon()?.rank ?? 'Fresh';

    this.sigma = new Sigma(graph, container, {
      nodeProgramClasses: {
        image: NodeImageProgram,
      },
      minCameraRatio: 0.5,
      maxCameraRatio: 2,
      defaultDrawNodeLabel: function drawLabel(
        context: CanvasRenderingContext2D,
        data: PartialButFor<
          NodeDisplayData,
          'x' | 'y' | 'size' | 'label' | 'color'
        >,
        settings: Settings
      ): void {
        if (!data.label) return;

        const size = settings.labelSize,
          font = settings.labelFont,
          weight = settings.labelWeight;

        context.font = `${weight} ${size}px ${font}`;
        const textWidth = context.measureText(data.label).width + 8;
        const textHeight = size;

        const rectWidth = textWidth + 4;
        const rectHeight = textHeight + 10;

        const xPosition = data.x - rectWidth / 2;
        const yPosition = data.y + 50;

        context.fillStyle = '#ffffffcc';
        context.fillRect(xPosition, yPosition, rectWidth, rectHeight);

        context.fillStyle = '#000';
        context.fillText(
          data.label,
          xPosition + 4,
          yPosition + rectHeight / 2 + size / 3
        );
      },
    });

    this.sigma.on('clickNode', (data) => {
      const clickedNode = this.sigma.getGraph().getNodeAttributes(data.node);

      this.currentRank = clickedNode['rank'];

      const digimon = this.digimonService.getBaseDigimonDataBySeed(
        clickedNode['seed']
      );
      const possibleEvolutions =
        this.digimonService.getDigimonEvolutions(digimon);

      const upperRankNodeToDrop = this.sigma
        .getGraph()
        .nodes()
        .filter((node) => {
          const nodeAttributes = this.sigma.getGraph().getNodeAttributes(node);
          return (
            nodeAttributes['seed'] !== this.mainDigimon()?.seed &&
            !this.evolutionRouteDigimons.find(
              (evolution) => evolution.seed === nodeAttributes['seed']
            ) &&
            this.digimonService.getRankOrder(nodeAttributes['rank']) >
              this.digimonService.getRankOrder(this.currentRank)
          );
        });

      upperRankNodeToDrop.forEach((node) => {
        this.sigma.getGraph().dropNode(node);
      });

      possibleEvolutions.forEach((evolution: Digimon, index: number) => {
        if (this.sigma.getGraph().findNode((node) => node === evolution.name))
          return;
        this.sigma.getGraph().addNode(evolution.name, {
          label: evolution.name,
          x: clickedNode['x'] + 1,
          y: clickedNode['y'] + index,
          size: 40,
          color: '#D95D39',
          type: 'image',
          image: evolution.img,
          seed: evolution.seed,
          rank: evolution.rank,
        });
        this.sigma.getGraph().addEdge(clickedNode['label'], evolution.name, {
          size: 2,
          color: 'black',
        });
      });
    });
  }

  onClose() {
    if (!this.sigma) return;
    this.sigma.kill();
  }
}
