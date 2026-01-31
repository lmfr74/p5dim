import p5 from 'p5';
import Component from './Component';
import StarComponent from './StarComponent';
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
}

// Manages the game state.
export default class Game {
  p5: p5;
  settings!: ISettings;
  isPaused: boolean = false;
  components: Component[] = [];

  constructor(p5: p5) {
    this.p5 = p5;

    p5.setup = async () => {
      await this.p5.loadJSON('/game.json', (data: ISettings) => {
        this.settings = data;
        this.p5.frameRate(this.settings.fps);

        console.debug('Game Settings:', this.settings);

        this.onWindowResize();

        // Initialize components using the Factory
        const factory = new Factory(this);
        factory.addStars(50);

        console.info(`Game "${this.settings.name}" initialized.`);
      });
    };

    p5.draw = () => {
      // if paused, skip update
      if (!this.isPaused) {
        this.components.forEach((component) => component.update());
      }
      // render all components, skipping those not visible
      this.p5.background(0);
      this.components.forEach((component) => {
        if (component.visible) component.render();
      });
    };

    p5.keyPressed = () => {
      if (this.p5.key === this.settings.pauseKey) {
        this.isPaused = !this.isPaused;

        console.info(`Game ${this.isPaused ? 'paused' : 'resumed'}.`);
      }
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
    const projected = this.project(p);
    return this.p5.createVector(
      (projected.x + 1) * 0.5 * this.p5.width,
      (1 - (projected.y + 1) * 0.5) * this.p5.height
    );
  }

  private project(p: p5.Vector): p5.Vector {
    return this.p5.createVector(p.x / p.z, p.y / p.z);
  }
}
