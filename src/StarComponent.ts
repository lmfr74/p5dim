import Component from './Component';
import p5 from 'p5';

export default class StarComponent extends Component {
  private color: number = 255;

  update() {
    super.update();
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
