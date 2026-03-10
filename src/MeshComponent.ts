import Component from './Component';
import Game from './Game';
import p5 from 'p5';

export default class MeshComponent extends Component {
  vertices: p5.Vector[];
  triangles: number[][];
  angle: number = 0;
  angleVelocity: number = 0;
  points: p5.Vector[] = [];

  rotateMap: { [key: string]: number } = {
    ArrowRight: 0.01,
    ArrowLeft: -0.01,
  };

  constructor(game: Game) {
    super(game);
    this.vertices = game.settings.mesh!.vertices.map(
      (v) => this.p5.createVector(...v) as p5.Vector
    );
    this.triangles = game.settings.mesh!.triangles;
  }

  update(): void {
    super.update();
    // Ensure it's in front of the camera
    const z = this.position.z + this.game.settings.minZ + 1;
    // Rotate and project vertices
    this.angle += this.angleVelocity;
    this.points = this.vertices.map((v) => {
      const rotated = this.game.rotateAroundY(v, this.angle);
      const projected = this.game.toScreen(rotated.add(0, 0, z));
      return projected;
    });
  }

  render(): void {
    this.p5.push();
    this.triangles.forEach((tri) => {
      const v1 = this.points[tri[0]];
      const v2 = this.points[tri[1]];
      const v3 = this.points[tri[2]];

      /*
      this.p5.noStroke();
      this.p5.fill(255, 255, 255, this.opacity * 255);
      this.p5.triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
      */
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
}
