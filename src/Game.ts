import p5 from 'p5';
import Component from './Component';
import Factory from './Factory';

// Interface for game settings.
interface ISettings {
  name: string;
  description: string;
  pauseKey: string;
  fps: number;
  debug: boolean;
  min_z: number;
  max_z: number;
  stars?: number;
}

// Manages the game state.
export default class Game {
  p5: p5;
  settings!: ISettings;
  isPaused: boolean = false;
  angle: number = 0;
  components: Component[] = [];
  z_velocity: number = 0;
  angle_velocity: number = 0;

  private DEFAULT_Z_VELOCITY: number = 0.01;
  private DEFAULT_Y_ANGLE: number = 0.01;

  directionMap: { [key: string]: number } = {
    ArrowUp: this.DEFAULT_Z_VELOCITY,
    ArrowDown: -this.DEFAULT_Z_VELOCITY,
  };

  rotateMap: { [key: string]: number } = {
    ArrowRight: this.DEFAULT_Y_ANGLE,
    ArrowLeft: -this.DEFAULT_Y_ANGLE,
  };

  constructor(p5: p5) {
    this.p5 = p5;

    p5.setup = async () => {
      await this.p5.loadJSON('game.json', (data: ISettings) => {
        this.settings = data;
        this.p5.frameRate(this.settings.fps);

        console.debug('Game Settings:', this.settings);

        this.onWindowResize();

        // Initialize components using the Factory
        const factory = new Factory(this);
        factory.addStars(this.settings.stars || 10);

        console.info(`Game "${this.settings.name}" initialized.`);
      });
    };

    p5.draw = () => {
      // If paused, skip update
      if (!this.isPaused) {
        this.angle += this.angle_velocity;
        this.components.forEach((component) => component.update());
      }

      // Render all components, skipping those not visible
      let live = false;

      this.p5.background(0);
      this.components.forEach((component) => {
        if (component.visible) component.render();
        live = live || component.visible;
      });

      if (!live) {
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.fill(255);
        this.p5.textSize(24);
        this.p5.text(
          'All components are out of view.',
          this.p5.width / 2,
          this.p5.height / 2
        );
        console.info('All components are out of view.');
      }
    };

    p5.keyPressed = () => {
      console.debug(`Key pressed: ${this.p5.key}`);

      if (this.p5.key === this.settings.pauseKey) {
        this.isPaused = !this.isPaused;
        console.info(`Game ${this.isPaused ? 'paused' : 'resumed'}.`);
        return;
      }

      // Apply velocity on cursor key press
      const key = this.p5.key;
      if (key in this.directionMap) {
        this.z_velocity = this.directionMap[key];
      }
      if (key in this.rotateMap) {
        this.angle_velocity = this.rotateMap[key];
      }

      // Notify all components of the key press
      this.components.forEach((component) => component.keyPressed(key));
    };

    p5.keyReleased = () => {
      console.debug(`Key released: ${this.p5.key}`);

      // Remove velocity on key released
      const key = this.p5.key;
      if (key in this.directionMap) {
        this.z_velocity *= 0.1; // Smoothly slow down instead of stopping abruptly
      }
      if (key in this.rotateMap) {
        this.angle_velocity = 0;
      }

      // Notify all components of the key release
      this.components.forEach((component) =>
        component.keyReleased(this.p5.key)
      );
    };

    p5.windowResized = () => {
      this.onWindowResize();
    };
  }

  private onWindowResize(): void {
    this.p5.resizeCanvas(this.p5.windowWidth, this.p5.windowHeight);
  }

  // Converts world coordinates (-1..1) to screen coordinates (0..width/height).
  public toScreen(p: p5.Vector): p5.Vector {
    const rotated = this.rotateAroundY(p);
    const projected = this.project(rotated);
    return this.p5.createVector(
      (projected.x + 1) * 0.5 * this.p5.width,
      (1 - (projected.y + 1) * 0.5) * this.p5.height
    );
  }

  private rotateAroundY(v: p5.Vector): p5.Vector {
    const c = this.p5.cos(this.angle);
    const s = this.p5.sin(this.angle);
    const rx = v.x * c - v.z * s;
    const rz = v.x * s + v.z * c;
    return this.p5.createVector(rx, v.y, rz);
  }

  private project(p: p5.Vector): p5.Vector {
    return this.p5.createVector(p.x / p.z, p.y / p.z);
  }
}
