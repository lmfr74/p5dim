import Game from './Game';
import p5 from 'p5';
import MeshComponent from './MeshComponent';

export default class SymmetricMeshComponent extends MeshComponent {
  constructor(game: Game) {
    super(game);
    const mirroredIndexBySource = new Map<number, number>();

    game.settings.mesh!.vertices.forEach((vertex, index) => {
      if (vertex[0] === 0) {
        mirroredIndexBySource.set(index, index);
        return;
      }

      mirroredIndexBySource.set(index, this.vertices.length);
      this.vertices.push(
        this.p5.createVector(-vertex[0], vertex[1], vertex[2]) as p5.Vector
      );
    });

    const mirroredTriangles = game.settings.mesh!.triangles.map(([a, b, c]) => [
      mirroredIndexBySource.get(a)!,
      mirroredIndexBySource.get(c)!,
      mirroredIndexBySource.get(b)!,
    ]);

    this.triangles = [...this.triangles, ...mirroredTriangles];
  }
}
