import Component from './Component';
import Game from './Game';
import p5 from 'p5';

export default class MeshComponent extends Component {
  vertices: p5.Vector[];
  triangles: number[][];
  angleX: number = 1;
  angleY: number = 0;
  angleZ: number = 0;
  angleVelocity: number = 0;
  points: p5.Vector[] = [];

  rotateMap: { [key: string]: number } = {
    ArrowRight: 0.01,
    ArrowLeft: -0.01,
  };

  constructor(game: Game) {
    super(game);
    // Frame and ensure it's in front of the camera
    this.position.x = this.game.settings.mesh!.dx;
    this.position.y = this.game.settings.mesh!.dy;
    this.position.z = this.game.settings.minZ + this.game.settings.mesh!.dz;

    // Initialize vertices and triangles from game settings
    this.vertices = game.settings.mesh!.vertices.map(
      (v) => this.p5.createVector(...v) as p5.Vector
    );
    this.triangles = game.settings.mesh!.triangles;
  }

  update(): void {
    super.update();
    // Rotate and project vertices
    this.angleY += this.angleVelocity;
    this.points = this.vertices.map((v) => {
      const rotated = this.game.rotate(
        v,
        this.angleX,
        this.angleY,
        this.angleZ
      );
      const projected = this.game.toScreen(rotated.add(this.position), false);
      return projected;
    });
  }

  render(): void {
    this.p5.push();
    this.triangles.forEach((tri) => {
      const v1 = this.points[tri[0]];
      const v2 = this.points[tri[1]];
      const v3 = this.points[tri[2]];

      this.p5.noStroke();
      this.p5.fill(255);
      this.p5.triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);

      this.p5.stroke(128);
      this.p5.noFill();
      this.p5.triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
    });
    this.p5.pop();
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
