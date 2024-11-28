import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { SpeedBugComponent } from './SpeedTape';

import './VSpeedBug.css';

/** Props for the vspeed bug. */
export interface VSpeedBugProps extends ComponentProps {
  /** The bug airspeed in knots, or null if none (bug will be hidden). */
  bugAirspeed: Subscribable<number | null>;

  /** The bugs display label. */
  label: string | Subscribable<string>;

  /** The X value offset of the bugs label. */
  labelXOffset?: number | Subscribable<number>;

  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** Vspeed bug. */
export class VSpeedBug extends DisplayComponent<VSpeedBugProps> implements SpeedBugComponent<VSpeedBugProps> {
  private static readonly LABEL_BASE_OFFSET = 14;
  private readonly labelXOffset = SubscribableUtils.toSubscribable(this.props.labelXOffset ?? 0, true);
  public readonly bugAirspeed = this.props.bugAirspeed;

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <svg
        class={{
          'vspeed-bug': true,
          'hidden': this.props.declutter,
        }}
        viewBox="3 0 35 20"
        style={{
          'width': '35px',
          'height': '20px',
        }}
      >
        <path d="M 10 3 L 10 17 M 10 10 L 5 10" />
        <text
          x={this.labelXOffset.map(v => v + VSpeedBug.LABEL_BASE_OFFSET)}
          y='17.5'
        >
          {this.props.label}
        </text>
      </svg>
    );
  }
}
