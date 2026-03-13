import Game from './Game';
import StarComponent from './StarComponent';
import SymmetricMeshComponent from './SymmetricMeshComponent';

export default class Factory {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public addStars(): void {
    // Create a grid of stars
    const count = this.game.settings.stars || 10;
    const dx = 2 / count;
    const dy = 2 / count;

    for (let x = -1; x <= 1; x += dx) {
      for (let y = -1; y <= 1; y += dy) {
        const min_z = this.game.settings.minZ;
        const max_z = this.game.settings.maxZ;
        const z = this.game.p5.random(min_z, max_z);
        const p = this.game.p5.createVector(x, y, z);

        this.game.components.push(new StarComponent(this.game, p));
      }
    }
  }

  public addMesh(): void {
    // Update mesh vertices to fit bounds
    const factors = this.game.settings.mesh!.factors;
    this.game.settings.mesh!.vertices.forEach((v) => {
      v[0] *= factors[0];
      v[1] *= factors[1];
      v[2] *= factors[2];
    });
    const mesh = new SymmetricMeshComponent(this.game);
    this.game.components.push(mesh);
  }
}
