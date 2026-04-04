import Game, { IMeshSettings, IGameMesh } from './Game';
import p5 from 'p5';

export default class SymmetricMeshBuilder {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  build(meshSettings: IMeshSettings): IGameMesh {
    let vertices: number[][] = meshSettings.vertices;
    let mirroredTriangles: number[][];
    let mirroredIndexBySource: Map<number, number> = new Map();

    meshSettings.vertices.forEach((v, i) => {
      if (v[0] === 0) {
        mirroredIndexBySource.set(i, i);
        return;
      }
      mirroredIndexBySource.set(i, vertices.length);
      vertices.push([-v[0], v[1], v[2]]);
    });

    mirroredTriangles = meshSettings.triangles.map(([a, b, c]) => [
      mirroredIndexBySource.get(a)!,
      mirroredIndexBySource.get(c)!,
      mirroredIndexBySource.get(b)!,
    ]);

    const newVertices = vertices.map(
      (v) => this.game.p5.createVector(...v).mult(10) as p5.Vector
    ) as p5.Vector[];

    const newTriangles = [...meshSettings.triangles, ...mirroredTriangles];

    return {
      vertices: newVertices,
      triangles: newTriangles,
    } as IGameMesh;
  }
}
