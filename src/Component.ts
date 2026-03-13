import Game from './Game';
import p5 from 'p5';

export default class Component {
  game: Game;
  p5: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  visible: boolean = true;

  constructor(game: Game, position?: p5.Vector, velocity?: p5.Vector) {
    this.game = game;
    this.p5 = game.p5;
    this.position = position || this.p5.createVector(0, 0, 0);
    this.velocity = velocity || this.p5.createVector(0, 0, 0);
  }

  update() {}

  render() {}

  keyPressed(key: string) {}

  keyReleased(key: string) {}
}
