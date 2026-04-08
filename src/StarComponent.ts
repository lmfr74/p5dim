import Component from './Component';

export default class StarComponent extends Component {
  private color: number = 255;
  private opacity: number = 1.0;

  update() {
    // Stars move towards the camera at a constant speed defined in game settings
    this.velocity.z = this.game.zVelocity;

    // Update position based on velocity
    this.position.add(this.velocity);

    // Wrap around if the star goes beyond the maximum z distance
    if (this.position.z < this.game.settings.minZ) {
      this.position.z = this.game.settings.maxZ;
    }

    // Determine visibility based on position and game settings
    this.visible =
      this.position.x > -1 &&
      this.position.x < 1 &&
      this.position.y > -1 &&
      this.position.y < 1 &&
      this.position.z > this.game.settings.minZ &&
      this.position.z < this.game.settings.maxZ;

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
    this.p5.noStroke();
    this.p5.fill(this.color, this.opacity * 255);
    this.p5.ellipse(screenPos.x, screenPos.y, size, size);
  }
}
