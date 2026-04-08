import Game, { IGameMesh } from './Game';
import MeshComponent from './MeshComponent';

export default class FighterComponent extends MeshComponent {
  angleX: number = 0;
  angleY: number = 0;
  angleZ: number = 0;
  angleVelocity: number = 0;

  rotateMap: { [key: string]: number } = {
    ArrowRight: 0.01,
    ArrowLeft: -0.01,
  };

  constructor(game: Game, mesh: IGameMesh) {
    super(game, mesh);
  }

  update() {
    // Rotate and project vertices
    this.angleY += this.angleVelocity;
    this.points = this.mesh.vertices.map((v) => {
      const rotated = this.game.rotate(
        v,
        this.angleX,
        this.angleY,
        this.angleZ
      );
      const projected = this.game.toScreen(rotated.add(this.position), true);
      return projected;
    });
  }

  keyPressed(key: string): void {
    if (this.rotateMap[key]) {
      this.angleVelocity = this.rotateMap[key];
    }
  }

  keyReleased(key: string): void {
    if (this.rotateMap[key]) {
      this.angleVelocity = 0;
    }
  }
}
