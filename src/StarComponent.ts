import Component from './Component';

export default class StarComponent extends Component {
  update() {
    super.update();
  }

  render() {
    // Convert world position to screen position
    const screenPos = this.game.toScreen(this.position);

    console.log(
      `Rendering component at screen position: ${screenPos.x}, ${screenPos.y}`
    );

    // Draw a simple rectangle at the component's position
    this.p5.fill(255);
    this.p5.rect(screenPos.x, screenPos.y, 5, 5);
  }
}
