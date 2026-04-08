import Game from './Game';
import StarComponent from './StarComponent';
import FighterComponent from './FighterComponent';
import SymmetricMeshBuilder from './SymmetricMeshBuilder';

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

  public addFighter(): void {
    // Update mesh vertices to fit bounds
    const mesh = this.game.settings.meshes![0];
    if (!mesh) {
      console.error('No mesh settings found in game configuration.');
      return;
    }
    const symmetricMeshBuilder = new SymmetricMeshBuilder(this.game);
    const symmetricMesh = symmetricMeshBuilder.build(mesh);
    const meshComponent = new FighterComponent(this.game, symmetricMesh);
    this.game.components.push(meshComponent);
  }
}
