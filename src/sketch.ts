import p5 from "p5";
import Game from "./Game";

new p5((engine: p5) => {
  const game = new Game(engine);
});
