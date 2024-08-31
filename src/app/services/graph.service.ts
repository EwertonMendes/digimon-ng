import Graph from 'graphology';
import Sigma from 'sigma';
import { Injectable } from '@angular/core';
import { createNodeImageProgram } from '@sigma/node-image';
import { Settings } from 'sigma/settings';
import { NodeDisplayData, PartialButFor } from 'sigma/types';
import { Digimon } from '../core/interfaces/digimon.interface';
import { DigimonService } from './digimon.service';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  constructor(private digimonService: DigimonService) {}

  createGraph(
    container: HTMLElement,
    mainDigimon: Digimon,
    evolutionRouteDigimons?: Digimon[]
  ): Sigma {
    const graph = new Graph();

    this.addEvolutionRouteNodes(graph, evolutionRouteDigimons);
    this.addMainDigimonNode(graph, mainDigimon, evolutionRouteDigimons);
    this.addPossibleDegenerations(graph, mainDigimon, evolutionRouteDigimons);
    this.addPossibleEvolutions(graph, mainDigimon, evolutionRouteDigimons);

    return new Sigma(graph, container, {
      nodeProgramClasses: {
        image: createNodeImageProgram({
          objectFit: 'contain',
          padding: 0.1,
          keepWithinCircle: true,
        }),
      },
      minCameraRatio: 0.5,
      maxCameraRatio: 2,
      defaultDrawNodeLabel: this.drawLabel,
    });
  }

  private addEvolutionRouteNodes(
    graph: Graph,
    evolutionRouteDigimons?: Digimon[]
  ) {
    evolutionRouteDigimons?.forEach((digimon, index) => {
      if (!digimon) return;

      graph.addNode(digimon.seed, {
        label: `${digimon.name} (${digimon.rank})`,
        x: index,
        y: 0,
        size: 40,
        color: '#C0E5C8',
        type: 'image',
        image: digimon.img,
        seed: digimon.seed,
        rank: digimon.rank,
      });

      if (index > 0) {
        graph.addEdge(evolutionRouteDigimons[index - 1]?.seed, digimon.seed, {
          size: 5,
          color: '#C0E5C8',
        });
      }
    });
  }

  private addMainDigimonNode(
    graph: Graph,
    mainDigimon: Digimon,
    evolutionRouteDigimons?: Digimon[]
  ) {
    graph.addNode(mainDigimon.seed, {
      label: `${mainDigimon.name} (${mainDigimon.rank})`,
      x: evolutionRouteDigimons?.length ?? 0,
      y: 0,
      size: 40,
      color: '#C0E5C8',
      type: 'image',
      image: mainDigimon.img,
      seed: mainDigimon.seed,
      rank: mainDigimon.rank,
    });

    if (evolutionRouteDigimons?.length) {
      graph.addEdge(
        evolutionRouteDigimons[evolutionRouteDigimons.length - 1]?.seed,
        mainDigimon.seed,
        {
          size: 5,
          color: '#C0E5C8',
        }
      );
    }
  }

  private addPossibleDegenerations(
    graph: Graph,
    mainDigimon: Digimon,
    evolutionRouteDigimons?: Digimon[]
  ) {
    const possibleDegenerations = this.digimonService
      .getDigimonDegenerations(mainDigimon)
      .filter(
        (degeneration) =>
          !evolutionRouteDigimons?.find(
            (routeDigimon) => routeDigimon.seed === degeneration.seed
          )
      );

    possibleDegenerations.forEach((degeneration, index) => {
      graph.addNode(degeneration.seed, {
        label: `${degeneration.name} (${degeneration.rank})`,
        x: (evolutionRouteDigimons?.length ?? 0) - 1,
        y: index,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: degeneration.img,
        seed: degeneration.seed,
        rank: degeneration.rank,
      });

      graph.addEdge(degeneration.seed, mainDigimon.seed, {
        size: 2,
        color: 'black',
      });
    });
  }

  private addPossibleEvolutions(
    graph: Graph,
    mainDigimon: Digimon,
    evolutionRouteDigimons?: Digimon[]
  ) {
    const possibleEvolutions =
      this.digimonService.getDigimonEvolutions(mainDigimon);

    possibleEvolutions.forEach((evolution, index) => {
      graph.addNode(evolution.seed, {
        label: `${evolution.name} (${evolution.rank})`,
        x: (evolutionRouteDigimons?.length ?? 0) + 1,
        y: index,
        size: 40,
        color: '#D95D39',
        type: 'image',
        image: evolution.img,
        seed: evolution.seed,
        rank: evolution.rank,
      });

      graph.addEdge(mainDigimon.seed, evolution.seed, {
        size: 2,
        color: 'black',
      });
    });
  }

  private drawLabel(
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
  }
}
