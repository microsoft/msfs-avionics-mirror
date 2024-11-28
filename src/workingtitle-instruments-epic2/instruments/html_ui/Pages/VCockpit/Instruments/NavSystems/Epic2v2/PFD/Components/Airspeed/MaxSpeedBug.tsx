import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from '@microsoft/msfs-epic2-shared';

import { SpeedBugComponent } from './SpeedTape';

import './MaxSpeedBug.css';

/** Props for the max speed bug. */
export interface MaxSpeedBugProps extends ComponentProps {
  /** An airspeed data provider. */
  airspeedDataProvider: AirspeedDataProvider;
}

/** Max speed bug. */
export class MaxSpeedBug extends DisplayComponent<MaxSpeedBugProps> implements SpeedBugComponent<MaxSpeedBugProps> {
  public readonly bugAirspeed = this.props.airspeedDataProvider.maxOperatingSpeed;

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="max-speed-bug" />;
  }
}
