import { DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode } from '@microsoft/msfs-epic2-shared';

import './SelectedHeading.css';

/** The properties for the selected heading component. */
interface SelectedHeadingProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider,
}

/** The selected heading indicator. */
export class SelectedHeading extends DisplayComponent<SelectedHeadingProps> {

  private readonly selectedHeadingOrTrack = this.props.autopilotDataProvider.selectedHeadingOrTrack;

  private readonly hdgTrkText = this.props.autopilotDataProvider.isTrackModeSelected.map((v) => v ? 'TRK' : 'HDG');

  private readonly apHdgTrkActive = this.props.autopilotDataProvider.lateralActive.map(v => v === Epic2ApLateralMode.HeadingSelect || v === Epic2ApLateralMode.TrackSelect);

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          'selected-heading-container': true,
          'magenta': this.apHdgTrkActive,
          'amber': this.selectedHeadingOrTrack.map(v => v === null),
        }}
      >
        <div>{this.hdgTrkText}</div>
        <div>{this.selectedHeadingOrTrack.map((v) => v === null ? '---' : (v < 0.5 ? 360 : v).toFixed(0).padStart(3, '0'))}</div>
      </div>
    );
  }
}
