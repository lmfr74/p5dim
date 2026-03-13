import Component from './Component';

export default class StarComponent extends Component {
  private color: number = 255;
  private opacity: number = 1.0;

  update() {
    this.velocity.z = this.game.zVelocity;
    super.update();
    // Calculate opacity based on z position
    this.opacity = this.p5.map(
      this.position.z,
      this.game.settings.minZ,
      this.game.settings.maxZ,
      1.0,
      0.0,
      true
    );

    this.color = this.p5.random(150, 255);
  }

  render() {
    // Convert world position to screen position
    const screenPos = this.game.toScreen(this.position);

    // Size based on depth (z position)
    const size = 10 * this.opacity;

    // Draw a simple star at the component's position
    this.p5.fill(this.color, this.opacity * 255);
    this.p5.ellipse(screenPos.x, screenPos.y, size, size);
  }
}
