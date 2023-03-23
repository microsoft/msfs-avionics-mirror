import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { SpeedBug, SpeedBugProps } from './SpeedBug';

/**
 * The properties for the FlapSpeedBug component.
 */
interface FlapSpeedBugProps extends SpeedBugProps {
  /** The speed bug's text label */
  label: string;
}

/**
 * The FlapSpeedBug component.
 */
export class FlapSpeedBug extends SpeedBug<FlapSpeedBugProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
    this.setIsVisible(true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="flap-bug hidden" ref={this.bugContainerRef} >
        <svg width="42" height="30">
          <line x1="0" y1="9" x2="8" y2="9" stroke="var(--wt21-colors-white)" stroke-width="2px" />
          <text x="11" y="16" fill="var(--wt21-colors-white)" font-size="19">{this.props.label}</text>
        </svg>
      </div>
    );
  }
}