import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import {
  AirGroundDataProvider, AirspeedDataProvider, AutopilotDataProvider, AutothrottleDataProvider, AutothrottleState, Epic2ApVerticalMode
} from '@microsoft/msfs-epic2-shared';

import { SpeedBugComponent } from './SpeedTape';

import './AfcsSpeedBug.css';

/** Props for the dynamic speed bug. */
export interface AfcsSpeedBugProps extends ComponentProps {
  /** An airspeed data provider. */
  airspeedDataProvider: AirspeedDataProvider;

  /** An air ground data provider. */
  airGroundDataProvider: AirGroundDataProvider;

  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;

  /** Am autothrottle data provider. */
  autothrottleDataProvider: AutothrottleDataProvider;
}

/** Dynamic speed bug. */
export class AfcsSpeedBug extends DisplayComponent<AfcsSpeedBugProps> implements SpeedBugComponent<AfcsSpeedBugProps> {
  private static readonly AFCS_AUTOPILOT_MODES = [Epic2ApVerticalMode.FlightLevelChange, Epic2ApVerticalMode.VnavFlightLevelChange];

  public readonly bugAirspeed = this.props.airspeedDataProvider.cautionSpeed;

  private readonly isAvailable = MappedSubject.create(
    ([onGround, verticalApMode, atState, isFmsSpeedSelected]) => {
      if (!onGround && (AfcsSpeedBug.AFCS_AUTOPILOT_MODES.includes(verticalApMode) || atState === AutothrottleState.Active) && !isFmsSpeedSelected) {
        return true;
      } else {
        return false;
      }
    },
    this.props.airGroundDataProvider.isOnGround,
    this.props.autopilotDataProvider.verticalActive,
    this.props.autothrottleDataProvider.state,
    this.props.autopilotDataProvider.isFmsModeSelected
  );

  public readonly isHidden = MappedSubject.create(SubscribableMapFunctions.nand(),
    this.isAvailable,
    this.props.airspeedDataProvider.isAfcsBugVisible
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <svg class={{ 'afcs-speed-bug': true, 'hidden': this.isHidden }} width="25" height="18" viewBox="0 0 27 18">
        <path d="M17.5588 1C15.9804 0.99999 13.951 2.02439 13.951 2.02439L2 8L13.951 13.9756C13.951 13.9756 15.9804 15 17.5588 15C20.1345 15 24.6425 12.7249 25 7.99999C24.6425 3.27506 20.1345 1.00002 17.5588 1Z" stroke="black"></path>
      </svg>
    );
  }
}
