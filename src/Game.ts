import p5 from 'p5';
import Component from './Component';
import Factory from './Factory';

// Interface for mesh settings, defining vertices and triangles (clock-wise).
export interface IMeshSettings {
  dx: number;
  dy: number;
  dz: number;
  scale: number;
  vertices: number[][];
  triangles: number[][];
}

export interface IGameMesh {
  vertices: p5.Vector[];
  triangles: number[][];
}

// Interface for game settings.
interface ISettings {
  name: string;
  description: string;
  pauseKey: string;
  centerKey: string;
  fps: number;
  debug: boolean;
  minZ: number;
  maxZ: number;
  maxAngle?: number;
  stars?: number;
  fieldOfView?: number;
  zFar?: number;
  zNear?: number;
  meshes?: IMeshSettings[];
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
  components: Component[] = [];
  isPaused: boolean = false;
  angle: number = 0;
  maxAngle: number = Math.PI / 4;
  angleVelocity: number = 0;

  zVelocity: number = -this.DEFAULT_Z_VELOCITY * this.EASING_FACTOR;

  xFactor: number = 1.0;
  fFactor: number = 1.0;
  zFactor: number = 1.0;

  directionMap: { [key: string]: number } = {
    ArrowUp: -this.DEFAULT_Z_VELOCITY,
    ArrowDown: 0,
  };

  rotateMap: { [key: string]: number } = {
    ArrowRight: -this.DEFAULT_Y_ANGLE,
    ArrowLeft: this.DEFAULT_Y_ANGLE,
  };

  constructor(p5: p5) {
    this.p5 = p5;

    p5.setup = async () => {
      await this.p5.loadJSON('game.json', (data: ISettings) => {
        this.settings = data;
        this.maxAngle = this.settings.maxAngle ?? Math.PI / 4;
        this.p5.frameRate(this.settings.fps);

        console.debug('Game Settings:', this.settings);

        this.onWindowResize();

        // Initialize components
        const factory = new Factory(this);
        factory.addStars();
        factory.addFighter();

        console.info(`Game "${this.settings.name}" initialized.`);
      });
    };

    p5.draw = () => {
      // Update all components if the game is not paused
      if (!this.isPaused) {
        const nextAngle = this.angle + this.angleVelocity;
        if (nextAngle <= this.maxAngle && nextAngle >= -this.maxAngle) {
          this.angle = nextAngle;
        }
        this.components.forEach((component) => component.update());
      }

      // Render all components, skipping those not visible
      this.p5.background(0);
      this.components.forEach((component) => {
        if (component.visible) component.render();
      });
    };

    p5.keyPressed = () => {
      const key = this.p5.key;
      console.debug(`Key pressed: ${key}`);

      if (key === this.settings.pauseKey) {
        this.isPaused = !this.isPaused;
        console.info(`Game ${this.isPaused ? 'paused' : 'resumed'}.`);
        return;
      }
      if (key === this.settings.centerKey) {
        this.angle = 0;
        console.info('View centered.');
        return;
      }

      // Apply velocity on cursor key press
      if (key in this.directionMap) {
        this.zVelocity = this.directionMap[key];
      } else if (key in this.rotateMap) {
        this.angleVelocity = this.rotateMap[key];
      }

      // Notify all components of the key press
      this.components.forEach((component) => component.keyPressed(key));
    };

    p5.keyReleased = () => {
      const key = this.p5.key;
      console.debug(`Key released: ${key}`);

      if (key in this.directionMap) {
        // Smoothly slow down instead of stopping abruptly
        this.zVelocity *= this.EASING_FACTOR;
      } else if (key in this.rotateMap) {
        // Stop rotation immediately for better control
        this.angleVelocity = 0;
      }

      // Notify all components of the key release
      this.components.forEach((component) => component.keyReleased(key));
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
  public toScreen(p: p5.Vector, ignoreXFactor: boolean = false): p5.Vector {
    const rotated = this.rotateAroundY(p, this.angle);
    const projected = this.project(rotated, ignoreXFactor);
    const x = ((projected.x + 1) * this.p5.width) / 2;
    const y = (1 - (projected.y + 1) / 2) * this.p5.height;
    return this.p5.createVector(x, y);
  }

  public rotate(
    v: p5.Vector,
    angleX: number,
    angleY: number,
    angleZ: number
  ): p5.Vector {
    let rotated = this.rotateAroundX(v, angleX);
    rotated = this.rotateAroundY(rotated, angleY);
    rotated = this.rotateAroundZ(rotated, angleZ);
    return rotated;
  }

  private rotateAroundX(v: p5.Vector, angle: number): p5.Vector {
    const c = this.p5.cos(angle);
    const s = this.p5.sin(angle);
    const ry = v.y * c - v.z * s;
    const rz = v.y * s + v.z * c;
    return this.p5.createVector(v.x, ry, rz);
  }

  private rotateAroundY(v: p5.Vector, angle: number): p5.Vector {
    const c = this.p5.cos(angle);
    const s = this.p5.sin(angle);
    const rx = v.x * c - v.z * s;
    const rz = v.x * s + v.z * c;
    return this.p5.createVector(rx, v.y, rz);
  }

  private rotateAroundZ(v: p5.Vector, angle: number): p5.Vector {
    const c = this.p5.cos(angle);
    const s = this.p5.sin(angle);
    const rx = v.x * c - v.y * s;
    const ry = v.x * s + v.y * c;
    return this.p5.createVector(rx, ry, v.z);
  }

  private project(p: p5.Vector, ignoreXFactor: boolean = false): p5.Vector {
    const x = ignoreXFactor
      ? p.x * this.fFactor
      : p.x * this.xFactor * this.fFactor;
    const y = p.y * this.fFactor;
    const z = p.z * this.zFactor;
    if (p.z !== 0) {
      return this.p5.createVector(x / p.z, y / p.z, z / p.z);
    } else {
      return this.p5.createVector(x, y, z);
    }
  }
}
