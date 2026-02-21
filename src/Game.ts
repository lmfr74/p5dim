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
  minZ: number;
  maxZ: number;
  stars?: number;
  fieldOfView?: number;
  zFar?: number;
  zNear?: number;
}

// Manages the game state.
export default class Game {
  private DEFAULT_Z_VELOCITY: number = 0.01;
  private DEFAULT_Y_ANGLE: number = 0.01;
  private DEFAULT_Z_FAR: number = 1000;
  private DEFAULT_Z_NEAR: number = 0.1;
  private DEFAULT_FOV: number = 90;
  private EASING_FACTOR: number = 0.1;

  p5: p5;
  settings!: ISettings;
  isPaused: boolean = false;
  angle: number = 0;
  components: Component[] = [];
  zVelocity: number = this.DEFAULT_Z_VELOCITY * this.EASING_FACTOR;
  angleVelocity: number = 0;

  xFactor: number = 1.0;
  fFactor: number = 1.0;
  zFactor: number = 1.0;

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
        this.angle += this.angleVelocity;
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
          this.p5.width >> 1,
          this.p5.height >> 1
        );
        console.info('All components are out of view. Reversing direction.');

        // Reverse direction to bring them back into view
        this.zVelocity = -this.zVelocity;
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
        this.zVelocity = this.directionMap[key];
      }
      if (key in this.rotateMap) {
        this.angleVelocity = this.rotateMap[key];
      }

      // Notify all components of the key press
      this.components.forEach((component) => component.keyPressed(key));
    };

    p5.keyReleased = () => {
      console.debug(`Key released: ${this.p5.key}`);

      const key = this.p5.key;
      if (key in this.directionMap) {
        // Smoothly slow down instead of stopping abruptly
        this.zVelocity *= this.EASING_FACTOR;
      }
      if (key in this.rotateMap) {
        // Stop rotation immediately for better control
        this.angleVelocity = 0;
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
    // Calculate aspect ratio
    const a = this.p5.width / this.p5.height;
    this.xFactor = a;
    // Calculate field of view factor
    const fov = this.settings.fieldOfView ?? this.DEFAULT_FOV;
    const f = 1 / Math.tan((fov * (Math.PI / 180)) / 2);
    this.fFactor = f;
    // Calculate z factor for depth scaling
    const zFar = this.settings.zFar ?? this.DEFAULT_Z_FAR;
    const zNear = this.settings.zNear ?? this.DEFAULT_Z_NEAR;
    const zDistance = zFar - zNear;
    const zScale = zFar / zDistance;
    this.zFactor = zScale - (zFar * zNear) / zDistance;
  }

  // Converts world coordinates (-1..1) to screen coordinates (0..width/height).
  public toScreen(p: p5.Vector): p5.Vector {
    const rotated = this.rotateAroundY(p);
    const projected = this.project(rotated);
    const x = ((projected.x + 1) * this.p5.width) / 2;
    const y = (1 - (projected.y + 1) / 2) * this.p5.height;
    return this.p5.createVector(x, y);
  }

  private rotateAroundY(v: p5.Vector): p5.Vector {
    const c = this.p5.cos(this.angle);
    const s = this.p5.sin(this.angle);
    const rx = v.x * c - v.z * s;
    const rz = v.x * s + v.z * c;
    return this.p5.createVector(rx, v.y, rz);
  }

  private project(p: p5.Vector): p5.Vector {
    const x = p.x * this.xFactor * this.fFactor;
    const y = p.y * this.fFactor;
    const z = p.z * this.zFactor;
    if (p.z !== 0) {
      return this.p5.createVector(x / p.z, y / p.z, z / p.z);
    } else {
      return this.p5.createVector(x, y, z);
    }
  }
}
