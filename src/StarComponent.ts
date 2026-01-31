import Component from './Component';

export default class StarComponent extends Component {
  update() {
    super.update();
  }

  render() {
    // Convert world position to screen position
    const screenPos = this.game.toScreen(this.position);

    // Size based on depth (z position)
    const size = 10 * this.opacity;

    // Draw a simple star at the component's position
    this.p5.fill(255, this.opacity * 255);
    this.p5.ellipse(screenPos.x, screenPos.y, size, size);
  }
}
