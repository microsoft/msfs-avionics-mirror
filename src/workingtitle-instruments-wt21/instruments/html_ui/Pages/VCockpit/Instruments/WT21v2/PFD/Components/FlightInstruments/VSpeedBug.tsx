import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { SpeedBug, SpeedBugProps } from './SpeedBug';

/**
 * The properties for the VSpeedBug component.
 */
interface VSpeedBugProps extends SpeedBugProps {
  /** The speed bug's text label */
  label: string;
  /**
   * The length of the svg line on the speed tape (in pixels).
   */
  lineLength: number;
}

/**
 * The VSpeedBug component.
 */
export class VSpeedBug extends SpeedBug<VSpeedBugProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="airspeed-bug hidden" ref={this.bugContainerRef} >
        <svg width="42" height="30">
          <line x1="0" y1="9" x2={this.props.lineLength} y2="9" stroke-width="2px" />
          <text x={this.props.lineLength} y="24" font-size="20">{this.props.label}</text>
        </svg>
      </div>
    );
  }
}