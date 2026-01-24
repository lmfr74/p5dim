import Game from './Game';
import p5 from 'p5';

export default class Component {
  game: Game;
  p5: p5;
  position: p5.Vector;
  velocity: p5.Vector;

  constructor(game: Game, position?: p5.Vector, velocity?: p5.Vector) {
    this.game = game;
    this.p5 = game.p5;
    this.position = position || this.p5.createVector(0, 0);
    this.velocity = velocity || this.p5.createVector(0, 0);
  }

  update() {
    this.position.add(this.velocity);
  }

  notVisible(): boolean {
    // ignore if out of bounds (-1..1)
    return (
      this.position.x < -1 ||
      this.position.x > 1 ||
      this.position.y < -1 ||
      this.position.y > 1
    );
  }

  render() {
    // Default render does nothing
  }
}
