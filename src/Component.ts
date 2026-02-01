import Game from './Game';
import p5 from 'p5';

export default class Component {
  game: Game;
  p5: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  opacity: number = 1.0;
  visible: boolean = false;

  private static DEFAULT_Z_VELOCITY: number = 0.005;

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

    // wrap around z position
    if (this.velocity.z > 0) {
      if (this.position.z > this.game.settings.max_z) {
        this.position.z = this.game.settings.min_z;
      }
    } else if (this.velocity.z < 0) {
      if (this.position.z < this.game.settings.min_z) {
        this.position.z = this.game.settings.max_z;
      }
    }

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
    if (key === 'ArrowUp') {
      Component.z_velocity = Component.DEFAULT_Z_VELOCITY;
    } else if (key === 'ArrowDown') {
      Component.z_velocity = -Component.DEFAULT_Z_VELOCITY;
    }
  }
}
