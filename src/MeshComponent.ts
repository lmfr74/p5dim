import Component from './Component';
import Game, { IGameMesh, IMeshPosition } from './Game';
import p5 from 'p5';

export default class MeshComponent extends Component {
  mesh: IGameMesh;
  points: p5.Vector[] = [];

  constructor(game: Game, mesh: IGameMesh) {
    super(game);
    this.mesh = mesh;
    // Frame and ensure it's in front of the camera
    this.position.x = mesh.x;
    this.position.y = mesh.y;
    this.position.z = this.game.settings.minZ + mesh.z;

    console.log('Mesh position:', mesh.x, mesh.y, mesh.z);
  }

  render(): void {
    this.p5.push();
    this.mesh.triangles.forEach((tri) => {
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
}
