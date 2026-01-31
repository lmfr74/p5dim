import Game from './Game';
import p5 from 'p5';

export default class Component {
  game: Game;
  p5: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  opacity: number = 1.0;
  visible: boolean = false;

  private static DEFAULT_Z_VELOCITY: number = 0.01;
  private static vz: number = Component.DEFAULT_Z_VELOCITY;

  constructor(game: Game, position?: p5.Vector, velocity?: p5.Vector) {
    this.game = game;
    this.p5 = game.p5;
    this.position = position || this.p5.createVector(0, 0);
    this.velocity = velocity || this.p5.createVector(0, 0, Component.vz);
  }

  update() {
    this.velocity.z = Component.vz;
    this.position.add(this.velocity);
    this.visible =
      this.position.x > -1 &&
      this.position.x < 1 &&
      this.position.y > -1 &&
      this.position.y < 1 &&
      this.position.z > this.game.settings.min_z &&
      this.position.z < this.game.settings.max_z;

    if (!this.visible) return;

    this.opacity = this.p5.map(
      this.position.z,
      this.game.settings.min_z,
      this.game.settings.max_z,
      1.0,
      0.0,
      true
    );
  }

  render() {
    // Base render does nothing
  }

  keyPressed(key: string) {
    // increase/decrease z velocity on cursor key press
    if (key === 'ArrowUp') {
      Component.vz = Component.DEFAULT_Z_VELOCITY;
    } else if (key === 'ArrowDown') {
      Component.vz = -Component.DEFAULT_Z_VELOCITY;
    }
  }
}
