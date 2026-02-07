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

  private static directionMap: { [key: string]: number } = {
    ArrowUp: Component.DEFAULT_Z_VELOCITY,
    ArrowDown: -Component.DEFAULT_Z_VELOCITY,
  };

  // shared z velocity for all components. new instances use these values.
  private static z_velocity: number = this.DEFAULT_Z_VELOCITY;

  constructor(game: Game, position?: p5.Vector, velocity?: p5.Vector) {
    this.game = game;
    this.p5 = game.p5;
    this.position = position || this.p5.createVector(0, 0);
    this.velocity =
      velocity || this.p5.createVector(0, 0, Component.z_velocity);
  }

  update() {
    // update position based on velocity
    this.velocity.z = Component.z_velocity;
    this.position.add(this.velocity);

    // determine visibility based on position and game settings
    this.visible =
      this.position.x > -1 &&
      this.position.x < 1 &&
      this.position.y > -1 &&
      this.position.y < 1 &&
      this.position.z > this.game.settings.min_z &&
      this.position.z < this.game.settings.max_z;

    if (!this.visible) return;

    // calculate opacity based on z position
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
    // increase/decrease z velocity and theta velocity on cursor key press
    if (key in Component.directionMap) {
      Component.z_velocity = Component.directionMap[key];
    }
  }

  keyReleased(key: string) {
    if (key in Component.directionMap) {
      Component.z_velocity = 0;
    }
  }

  private rotateAroundY(v: p5.Vector, angle: number): p5.Vector {
    const c = this.p5.cos(angle);
    const s = this.p5.sin(angle);
    const rx = v.x * c - v.z * s;
    const rz = v.x * s + v.z * c;
    return this.p5.createVector(rx, v.y, rz);
  }
}
