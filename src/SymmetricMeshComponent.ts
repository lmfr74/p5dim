import Game from './Game';
import p5 from 'p5';
import MeshComponent from './MeshComponent';

export default class SymmetricMeshComponent extends MeshComponent {
  constructor(game: Game) {
    super(game);
    const mirroredIndexBySource = new Map<number, number>();

    game.settings.mesh!.vertices.forEach((v, i) => {
      if (v[0] === 0) {
        mirroredIndexBySource.set(i, i);
        return;
      }

      mirroredIndexBySource.set(i, this.vertices.length);
      this.vertices.push(this.p5.createVector(-v[0], v[1], v[2]) as p5.Vector);
    });

    const mirroredTriangles = game.settings.mesh!.triangles.map(([a, b, c]) => [
      mirroredIndexBySource.get(a)!,
      mirroredIndexBySource.get(c)!,
      mirroredIndexBySource.get(b)!,
    ]);

    this.triangles = [...this.triangles, ...mirroredTriangles];
  }
}
