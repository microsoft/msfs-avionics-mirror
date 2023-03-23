import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { SpeedBug, SpeedBugProps } from './SpeedBug';

/**
 * The properties for the DonutSpeedBug component.
 */
type DonutSpeedBugProps = SpeedBugProps

/**
 * The DonutSpeedBug component.
 */
export class DonutSpeedBug extends SpeedBug<DonutSpeedBugProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="donut-bug hidden" ref={this.bugContainerRef} >
        <svg width="28" height="28">
          <circle cx="14" cy="14" r="6" stroke="var(--wt21-colors-black)" fill="none" stroke-width="2.75"></circle>
          <circle cx="14" cy="14" r="5.5" stroke="var(--wt21-colors-green)" fill="none" stroke-width="2.25"></circle>
        </svg>
      </div>
    );
  }
}