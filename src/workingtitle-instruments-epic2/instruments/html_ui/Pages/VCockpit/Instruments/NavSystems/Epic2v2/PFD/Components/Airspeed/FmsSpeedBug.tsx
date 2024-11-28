import { AeroMath, ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider, AutothrottleDataProvider, AutothrottleState, Epic2ApVerticalMode } from '@microsoft/msfs-epic2-shared';

import { SpeedBugComponent } from './SpeedTape';

import './FmsSpeedBug.css';

/** Props for the FMS computed speed bug. */
export interface FmsSpeedBugProps extends ComponentProps {
  /** An altitude data provider. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider,
}

/** FMS computed speed bug. */
export class FmsSpeedBug extends DisplayComponent<FmsSpeedBugProps> implements SpeedBugComponent<FmsSpeedBugProps> {
  private fmsTargetMachAsCas = MappedSubject.create(
    ([mach, ambientPressure]) => mach !== null && ambientPressure !== null ? UnitType.KNOT.convertFrom(AeroMath.machToCas(mach, ambientPressure), UnitType.MPS) : null,
    this.props.autopilotDataProvider.fmsTargetMach,
    this.props.altitudeDataProvider.ambientPressureHpa,
  ).pause();

  public readonly bugAirspeed = Subject.create(null);
  public readonly parksAtBottom = true;
  public readonly parksAtTop = true;

  private fmsTargetCasPipe = this.props.autopilotDataProvider.fmsTargetCas.pipe(this.bugAirspeed, (v) => v !== null && v >= 30 ? v : null, true);
  private fmsTargetMachPipe = this.fmsTargetMachAsCas.pipe(this.bugAirspeed, (v) => v !== null && v >= 30 ? v : null, true);

  private readonly isMagenta = MappedSubject.create(
    ([atState, verticalMode, fmsModeActive]) => {
      switch (true) {
        case verticalMode === Epic2ApVerticalMode.VnavFlightLevelChange:
        case verticalMode === Epic2ApVerticalMode.VnavSpeed:
        case verticalMode === Epic2ApVerticalMode.FlightLevelChange:
        case verticalMode === Epic2ApVerticalMode.Speed:
        case atState === AutothrottleState.Armed && fmsModeActive:
        case atState === AutothrottleState.Active && fmsModeActive:
          return true;
        default:
          return false;
      }
    },
    this.props.autothrottleDataProvider.state,
    this.props.autopilotDataProvider.verticalActive,
    this.props.autopilotDataProvider.isFmsModeSelected,
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.autopilotDataProvider.fmsTargetSpeedIsMach.sub((isMach) => {
      if (isMach) {
        this.fmsTargetCasPipe.pause();
        this.fmsTargetMachAsCas.resume();
        this.fmsTargetMachPipe.resume(true);
      } else {
        this.fmsTargetMachPipe.pause();
        this.fmsTargetMachAsCas.pause();
        this.fmsTargetCasPipe.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return <svg
      class={{
        'fms-speed-bug': true,
        'magenta': this.isMagenta,
      }}
      viewBox="2 -18 24 36"
    >
      <path class="shadow" d="M25 6.2l-8.5-4.4c-2.9-1.8-2.9-1.8 0-3.5l8.5-4.1q-2.7 5.9 0 12.1" />
      <path d="M25 6.2l-8.5-4.4c-2.9-1.8-2.9-1.8 0-3.5l8.5-4.1q-2.7 5.9 0 12.1" />
    </svg>;
  }
}
