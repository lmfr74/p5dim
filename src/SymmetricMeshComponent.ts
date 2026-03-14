import Game, { IMeshSettings } from './Game';
import p5 from 'p5';
import MeshComponent from './MeshComponent';

export default class SymmetricMeshComponent extends MeshComponent {
  constructor(game: Game, meshSettings: IMeshSettings) {
    super(game, meshSettings);
    const mirroredIndexBySource = new Map<number, number>();

    meshSettings.vertices.forEach((v, i) => {
      if (v[0] === 0) {
        mirroredIndexBySource.set(i, i);
        return;
      }

      mirroredIndexBySource.set(i, this.vertices.length);
      this.vertices.push(this.p5.createVector(-v[0], v[1], v[2]) as p5.Vector);
    });

    const mirroredTriangles = meshSettings.triangles.map(([a, b, c]) => [
      mirroredIndexBySource.get(a)!,
      mirroredIndexBySource.get(c)!,
      mirroredIndexBySource.get(b)!,
    ]);

    this.triangles = [...this.triangles, ...mirroredTriangles];
  }
}
