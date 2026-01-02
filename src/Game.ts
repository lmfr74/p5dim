import p5 from "p5";

// Interface for game settings.
interface ISettings {
  name: string;
  description: string;
  pauseKey: string;
  fps: number;
  debug: boolean;
}

// Manages the game state.
export default class Game {
  p5: p5;
  settings!: ISettings;

  constructor(p5: p5) {
    this.p5 = p5;

    p5.setup = async () => {
      await this.p5.loadJSON("/game.json", (data: ISettings) => {
        this.settings = data;
        this.p5.frameRate(this.settings.fps);
      });
      if (this.settings.debug) {
        console.debug("Game Settings:", this.settings);
      }
      console.info(`Game "${this.settings.name}" initialized.`);
    };

    p5.draw = () => {
      const deltaTime = this.p5.deltaTime;
      if (this.settings.debug) {
        console.debug(`Delta Time: ${deltaTime} ms`);
      }
      this.p5.noLoop();
    };
  }
}
