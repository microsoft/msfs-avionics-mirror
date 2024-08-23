import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './FlapPositionDisplay.css';

/**
 * The FlapPositionDisplay component.
 */
export class FlapPositionDisplay extends DisplayComponent<ComponentProps> {

  private readonly flapsRef = FSComponent.createRef<HTMLDivElement>();

  /**
   * Updates the flap position pointer
   * @param deg The flaps angle
   */
  public update(deg: number): void {
    this.flapsRef.instance.classList.toggle('hidden', deg < 0);

    //Flaps 15 actually needs to be rotated to 20 degrees
    //Flaps 35 actually needs to be rotated to 45 degrees
    //built the lines to not equal the actual flap deflection degrees.
    const correction = deg > 15 ? 1.285 : 1.333;
    if (this.flapsRef.instance !== null) {
      this.flapsRef.instance.style.transform = `rotate3d(0, 0, 1, ${deg * correction}deg)`;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flight-control-flaps">
        <div class="flight-control-flaps-pointer" ref={this.flapsRef}>
          <svg height="10" width="40">
            <path d="M 5 0 a 1 1 0 0 0 0 10 l 32 -4 c 1.7 -0.4 1.7 -1.8 0 -2 l -32 -4" fill="var(--wt21-colors-white)" />
          </svg>
        </div>
        <div class="flight-control-flaps-markings">
          <svg height="60" width="190">
            <text x="50" y="40" fill="var(--wt21-colors-white)" font-size="20">FLAPS</text>
            <text x="165" y="16" fill="var(--wt21-colors-white)" font-size="20">0</text>
            <text x="162" y="38" fill="var(--wt21-colors-white)" font-size="20">15</text>
            <text x="153" y="60" fill="var(--wt21-colors-white)" font-size="20">35</text>
            <line x1="150" y1="15" x2="160" y2="15" stroke="var(--wt21-colors-white)" stroke-width="1px" />
            <line x1="148" y1="27" x2="158" y2="31" stroke="var(--wt21-colors-white)" stroke-width="1px" />
            <line x1="141" y1="41" x2="148" y2="48" stroke="var(--wt21-colors-white)" stroke-width="1px" />
          </svg>
        </div>
      </div>
    );
  }
}