import { AeroMath, ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider, AutothrottleDataProvider, AutothrottleState, Epic2ApVerticalMode } from '@microsoft/msfs-epic2-shared';

import { SpeedBugComponent } from './SpeedTape';

import './SelectedSpeedBug.css';

/** Props for the selected speed bug. */
export interface SelectedSpeedBugProps extends ComponentProps {
  /** An altitude data provider. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider,
}

/** Selected speed bug. */
export class SelectedSpeedBug extends DisplayComponent<SelectedSpeedBugProps> implements SpeedBugComponent<SelectedSpeedBugProps> {
  private selectedMachAsCas = MappedSubject.create(
    ([mach, ambientPressure]) => mach !== null && ambientPressure !== null ? UnitType.KNOT.convertFrom(AeroMath.machToCas(mach, ambientPressure), UnitType.MPS) : null,
    this.props.autopilotDataProvider.targetMach,
    this.props.altitudeDataProvider.ambientPressureHpa,
  ).pause();

  public readonly bugAirspeed = Subject.create(null);
  public readonly parksAtBottom = true;
  public readonly parksAtTop = true;

  // we can use the AP/AT target speeds as our bug is only shown when the target is from the MAN source
  private selectedCasPipe = this.props.autopilotDataProvider.targetCas.pipe(this.bugAirspeed, (v) => v !== null && v >= 30 ? v : null, true);
  private selectedMachPipe = this.selectedMachAsCas.pipe(this.bugAirspeed, (v) => v !== null && v >= 30 ? v : null, true);

  private readonly isMagenta = MappedSubject.create(
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

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.autopilotDataProvider.targetSpeedIsMach.sub((isMach) => {
      if (isMach) {
        this.selectedCasPipe.pause();
        this.selectedMachAsCas.resume();
        this.selectedMachPipe.resume(true);
      } else {
        this.selectedMachPipe.pause();
        this.selectedMachAsCas.pause();
        this.selectedCasPipe.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <svg
      class={{
        'selected-speed-bug': true,
        'hidden': this.props.autopilotDataProvider.isFmsModeSelected.map((fmsModeOn) => !!fmsModeOn),
        'magenta': this.isMagenta
      }}
      viewBox="2 -18 24 36"
    >
      <path class="shadow" d="M 12 0 l -8 -8 l 0 -8 l 20 0 l 0 32 l -20 0 l 0 -8 z" />
      <path d="M 12 0 l -8 -8 l 0 -8 l 20 0 l 0 32 l -20 0 l 0 -8 z" />
    </svg>;
  }
}
