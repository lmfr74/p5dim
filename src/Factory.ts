import Game from './Game';
import StarComponent from './StarComponent';

export default class Factory {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public addStars(count: number): void {
    // Create a grid of stars
    const dx = 2 / count;
    const dy = 2 / count;

    for (let x = -1; x <= 1; x += dx) {
      for (let y = -1; y <= 1; y += dy) {
        const min_z = -this.game.settings.max_z;
        const max_z = 1;
        const z = this.game.p5.random(min_z, max_z);
        const p = this.game.p5.createVector(x, y, z);

        this.game.components.push(new StarComponent(this.game, p));
      }
    }
  }
}
