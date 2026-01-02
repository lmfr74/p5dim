import p5 from "p5";

// Manages the game state.
export default class Game {
  p5: p5;

  constructor(p5: p5) {
    this.p5 = p5;

    p5.setup = () => {
    };

    p5.draw = () => {
    };
  }
}
