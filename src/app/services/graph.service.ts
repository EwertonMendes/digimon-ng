import Graph from 'graphology';
import Sigma from 'sigma';
import { inject, Injectable } from '@angular/core';
import { createNodeImageProgram } from '@sigma/node-image';
import { Settings } from 'sigma/settings';
import { NodeDisplayData, PartialButFor } from 'sigma/types';
import { BaseDigimon, Digimon } from '../core/interfaces/digimon.interface';
import { DigimonService } from './digimon.service';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  public NODE_COLOR = getComputedStyle(document.body).getPropertyValue('--dark');
  public EVOLUTION_ROUTE_NODE_COLOR = getComputedStyle(document.body).getPropertyValue('--accent');
  public EDGE_COLOR = getComputedStyle(document.body).getPropertyValue('--primary-light');
  public NODE_SIZE = 40;
  public EDGE_SIZE = 4;
  public EVOLUTION_ROUTE_EDGE_SIZE = 10;

  private digimonService = inject(DigimonService);

  createGraph(
    container: HTMLElement,
    mainDigimon: Digimon | BaseDigimon,
    evolutionRouteDigimons?: BaseDigimon[]
  ): Sigma {
    const graph = new Graph();

    this.NODE_COLOR = getComputedStyle(document.body).getPropertyValue('--dark-hover');
    this.EVOLUTION_ROUTE_NODE_COLOR = getComputedStyle(document.body).getPropertyValue('--accent');
    this.EDGE_COLOR = getComputedStyle(document.body).getPropertyValue('--dark-active');

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
    evolutionRouteDigimons?: BaseDigimon[]
  ) {
    evolutionRouteDigimons?.forEach((digimon, index) => {
      if (!digimon) return;

      graph.addNode(digimon.seed, {
        label: `${digimon.name} (${digimon.rank})`,
        x: index,
        y: 0,
        size: 40,
        color: this.EVOLUTION_ROUTE_NODE_COLOR,
        type: 'image',
        image: digimon.img,
        seed: digimon.seed,
        rank: digimon.rank,
      });

      if (index > 0) {
        graph.addEdge(evolutionRouteDigimons[index - 1]?.seed, digimon.seed, {
          size: this.EVOLUTION_ROUTE_EDGE_SIZE,
          color: this.EVOLUTION_ROUTE_NODE_COLOR,
          sourceSeed: evolutionRouteDigimons[index - 1]?.seed,
          targetSeed: digimon.seed,
        });
      }
    });
  }

  private addMainDigimonNode(
    graph: Graph,
    mainDigimon: Digimon | BaseDigimon,
    evolutionRouteDigimons?: BaseDigimon[]
  ) {
    graph.addNode(mainDigimon.seed, {
      label: `${mainDigimon.name} (${mainDigimon.rank})`,
      x: evolutionRouteDigimons?.length ?? 0,
      y: 0,
      size: 40,
      color: this.EVOLUTION_ROUTE_NODE_COLOR,
      type: 'image',
      image: mainDigimon.img,
      seed: mainDigimon.seed,
      rank: mainDigimon.rank,
    });

    if (evolutionRouteDigimons?.length) {
      const previousEvolutionSeed =
        evolutionRouteDigimons[evolutionRouteDigimons.length - 1]?.seed;
      graph.addEdge(previousEvolutionSeed, mainDigimon.seed, {
        size: this.EVOLUTION_ROUTE_EDGE_SIZE,
        color: this.EVOLUTION_ROUTE_NODE_COLOR,
        sourceSeed: previousEvolutionSeed,
        targetSeed: mainDigimon.seed,
      });
    }
  }

  private addPossibleDegenerations(
    graph: Graph,
    mainDigimon: Digimon | BaseDigimon,
    evolutionRouteDigimons?: BaseDigimon[]
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
      const { newNodeX, newNodeY } = this.calculateNewNodePosition(
        graph,
        { x: (evolutionRouteDigimons?.length ?? 0) + 1, y: index },
        -1
      );
      graph.addNode(degeneration.seed, {
        label: `${degeneration.name} (${degeneration.rank})`,
        x: newNodeX,
        y: newNodeY,
        size: this.NODE_SIZE,
        color: this.NODE_COLOR,
        type: 'image',
        image: degeneration.img,
        seed: degeneration.seed,
        rank: degeneration.rank,
      });

      graph.addEdge(degeneration.seed, mainDigimon.seed, {
        size: this.EDGE_SIZE,
        color: this.EDGE_COLOR,
        sourceSeed: degeneration.seed,
        targetSeed: mainDigimon.seed,
      });
    });
  }

  private addPossibleEvolutions(
    graph: Graph,
    mainDigimon: Digimon | BaseDigimon,
    evolutionRouteDigimons?: BaseDigimon[]
  ) {
    const possibleEvolutions =
      this.digimonService.getDigimonEvolutions(mainDigimon);

    possibleEvolutions.forEach((evolution, index) => {
      graph.addNode(evolution.seed, {
        label: `${evolution.name} (${evolution.rank})`,
        x: (evolutionRouteDigimons?.length ?? 0) + 1,
        y: index,
        size: this.NODE_SIZE,
        color: this.NODE_COLOR,
        type: 'image',
        image: evolution.img,
        seed: evolution.seed,
        rank: evolution.rank,
      });

      graph.addEdge(mainDigimon.seed, evolution.seed, {
        size: this.EDGE_SIZE,
        color: this.EDGE_COLOR,
        sourceSeed: mainDigimon.seed,
        targetSeed: evolution.seed,
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

    const labelColor = getComputedStyle(document.body).getPropertyValue('--dark');
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-on-dark');

    const size = settings.labelSize,
      font = settings.labelFont,
      weight = settings.labelWeight;

    context.font = `${weight} ${size}px ${font}`;
    const textWidth = context.measureText(data.label).width + 8;
    const textHeight = size + 3;

    const rectWidth = textWidth + 4;
    const rectHeight = textHeight + 10;

    const xPosition = data.x - rectWidth / 2;
    const yPosition = data.y + 50;

    const radius = 8;
    context.beginPath();
    context.moveTo(xPosition + radius, yPosition);
    context.lineTo(xPosition + rectWidth - radius, yPosition);
    context.quadraticCurveTo(xPosition + rectWidth, yPosition, xPosition + rectWidth, yPosition + radius);
    context.lineTo(xPosition + rectWidth, yPosition + rectHeight - radius);
    context.quadraticCurveTo(xPosition + rectWidth, yPosition + rectHeight, xPosition + rectWidth - radius, yPosition + rectHeight);
    context.lineTo(xPosition + radius, yPosition + rectHeight);
    context.quadraticCurveTo(xPosition, yPosition + rectHeight, xPosition, yPosition + rectHeight - radius);
    context.lineTo(xPosition, yPosition + radius);
    context.quadraticCurveTo(xPosition, yPosition, xPosition + radius, yPosition);
    context.closePath();

    context.fillStyle = labelColor;
    context.fill();

    context.shadowColor = 'transparent';

    context.fillStyle = textColor;
    context.fillText(
      data.label,
      xPosition + 6,
      yPosition + rectHeight / 2 + size / 3
    );
  }


  private calculateNewNodePosition(
    graph: any,
    position: { x: number; y: number },
    direction: number
  ) {
    let newNodeX = position.x + direction - 1;
    let newNodeY = position.y;

    if (this.hasNodeInPosition(graph, newNodeX, newNodeY)) {
      newNodeY++;
    }

    return { newNodeX, newNodeY };
  }

  private hasNodeInPosition(graph: any, x: number, y: number): boolean {
    return !!graph.findNode((node: string) => {
      const nodeAttributes = graph.getNodeAttributes(node);
      return nodeAttributes['x'] === x && nodeAttributes['y'] === y;
    });
  }
}
