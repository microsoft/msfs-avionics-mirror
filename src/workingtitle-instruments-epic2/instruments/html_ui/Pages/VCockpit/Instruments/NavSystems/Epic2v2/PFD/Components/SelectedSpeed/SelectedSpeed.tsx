import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  AirGroundDataProvider, AirspeedDataProvider, AltitudeDataProvider, AutopilotDataProvider, AutothrottleDataProvider, AutothrottleState, Epic2ApVerticalMode,
  SpeedReferenceConfig
} from '@microsoft/msfs-epic2-shared';

import { SelectedSpeedBug } from '../Airspeed';
import { AfcsSpeedBug } from '../Airspeed/AfcsSpeedBug';
import { FmsSpeedBug } from '../Airspeed/FmsSpeedBug';

import './SelectedSpeed.css';

/** The selected speed props. */
export interface SelectedSpeedProps extends ComponentProps {
  /** The provider of airspeed data. */
  airspeedDataProvider: AirspeedDataProvider;

  /** A provider of altitude data. */
  altitudeDataProvider: AltitudeDataProvider;

  /** A provider of air and ground data. */
  airGroundDataProvider: AirGroundDataProvider;

  /** A provider of auto pilot data. */
  autopilotDataProvider: AutopilotDataProvider;

  /** A provider of autothrottle data. */
  autothrottleDataProvider: AutothrottleDataProvider;

  /** The speed reference configuration */
  readoutConfig: SpeedReferenceConfig;
}

/** The selected speed component. */
export class SelectedSpeed extends DisplayComponent<SelectedSpeedProps> {
  private readonly afcsBugRef = FSComponent.createRef<AfcsSpeedBug>();

  private readonly isHidden = this.props.autopilotDataProvider.verticalActive.map(apMode => apMode !== Epic2ApVerticalMode.FlightLevelChange && this.noAutoThrottle);

  private readonly isAfcsBugHidden = Subject.create(true);
  private readonly isFmsBugHidden = this.props.autopilotDataProvider.isFmsModeSelected.map((v) => v !== null ? !v : false);
  private readonly isSelectedBugHidden = MappedSubject.create(
    ([isFmsModeSelected, isAfcsHidden]) => isFmsModeSelected !== null && isFmsModeSelected !== true && !isAfcsHidden,
    this.props.autopilotDataProvider.isFmsModeSelected,
    this.isAfcsBugHidden
  );

  private readonly speedText = MappedSubject.create(
    ([selectedCas, selectedMach, isMach, isCasAboveMaxOperating, maxOperatingLimit]) => {
      if (isCasAboveMaxOperating) {
        return maxOperatingLimit;
      } else if (isMach && selectedMach !== null) {
        return `.${(selectedMach * 1000).toFixed(0).padStart(3, '0')}`;
      } else {
        return selectedCas !== null ? selectedCas.toFixed(0) : '---';
      }
    },
    this.props.autopilotDataProvider.targetCas,
    this.props.autopilotDataProvider.targetMach,
    this.props.autopilotDataProvider.targetSpeedIsMach,
    this.props.airspeedDataProvider.isSpeedAboveMaxOperating,
    this.props.airspeedDataProvider.maxOperatingSpeedLimiter
  );

  private readonly isMagenta = this.props.readoutConfig.alwaysMagenta ? Subject.create(true) : MappedSubject.create(
    ([atState, verticalMode]) => {
      switch (true) {
        case verticalMode === Epic2ApVerticalMode.VnavFlightLevelChange:
        case verticalMode === Epic2ApVerticalMode.VnavSpeed:
        case verticalMode === Epic2ApVerticalMode.Speed:
        case verticalMode === Epic2ApVerticalMode.FlightLevelChange:
        case atState === AutothrottleState.Active:
        case atState === AutothrottleState.Armed:
          return true;
        default:
          return false;
      }
    },
    this.props.autothrottleDataProvider.state,
    this.props.autopilotDataProvider.verticalActive,
  );

  private noAutoThrottle = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    const afcsBug = this.afcsBugRef.getOrDefault();

    if (afcsBug) {
      afcsBug.isHidden.pipe(this.isAfcsBugHidden);
    }
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'selected-speed': true,
          'border-box': true,
          'shaded-box': true,
          'hidden': this.isHidden,
          'bug-icon': this.props.readoutConfig.bugAvailable,
        }}
      >
        {this.props.readoutConfig.bugAvailable &&
          <div class={{ 'bug-icon-container': true }}>
            <div class={{ 'hidden': this.isSelectedBugHidden }}>
              <SelectedSpeedBug
                altitudeDataProvider={this.props.altitudeDataProvider}
                autopilotDataProvider={this.props.autopilotDataProvider}
                autothrottleDataProvider={this.props.autothrottleDataProvider}
              />
            </div>
            {this.props.autothrottleDataProvider.speedProtectionAvailable &&
              <div>
                <AfcsSpeedBug
                  ref={this.afcsBugRef}
                  airspeedDataProvider={this.props.airspeedDataProvider}
                  airGroundDataProvider={this.props.airGroundDataProvider}
                  autopilotDataProvider={this.props.autopilotDataProvider}
                  autothrottleDataProvider={this.props.autothrottleDataProvider}
                />
              </div>
            }
            <div class={{ 'hidden': this.isFmsBugHidden }}>
              <FmsSpeedBug
                altitudeDataProvider={this.props.altitudeDataProvider}
                autopilotDataProvider={this.props.autopilotDataProvider}
                autothrottleDataProvider={this.props.autothrottleDataProvider}
              />
            </div>
          </div>
        }
        <span
          class={{
            'speed-value': true,
            'invalid': this.speedText.map(v => v === '---'),
            'magenta': this.isMagenta,
          }}
        >
          {this.speedText}
        </span>
      </div>
    );
  }
}
