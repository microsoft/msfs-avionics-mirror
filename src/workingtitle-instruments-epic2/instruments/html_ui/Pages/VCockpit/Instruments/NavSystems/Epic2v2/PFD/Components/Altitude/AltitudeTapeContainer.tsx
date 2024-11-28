import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider, PfdAliasedUserSettingTypes, RadioAltimeterDataProvider } from '@microsoft/msfs-epic2-shared';

import { AltitudeDigitalReadout } from './AltitudeDigitalReadout';
import { AltitudeTape } from './AltitudeTape';
import { BaroMinimumBug } from './BaroMinimumBug';
import { MetricAltitude } from './MetricAltitude';
import { SelectedAltitudeBug } from './SelectedAltitudeBug';
import { VnavTargetAltitudeBug } from './VnavTargetAltitudeBug';

import './AltitudeTapeContainer.css';

/** Props for the altitude tape container area. */
export interface AltitudeTapeContainerProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus,
  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider,
  /** The aliased PFD settings manager. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;
  /** The radio altimeter data provider to use. */
  radioAltimeterDataProvider: RadioAltimeterDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** Altitude tape area container (including bugs etc.). */
export class AltitudeTapeContainer extends DisplayComponent<AltitudeTapeContainerProps> {
  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="altitude-tape-container">
      <AltitudeTape
        bus={this.props.bus}
        altitude={this.props.altitudeDataProvider.altitude}
        altitudeTrend={this.props.altitudeDataProvider.altitudeTrend}
        radioAltitude={this.props.radioAltimeterDataProvider.radioAltitude}
      >
        <SelectedAltitudeBug autopilotDataProvider={this.props.autopilotDataProvider} altitudeDataProvider={this.props.altitudeDataProvider} declutter={this.props.declutter} />
        <BaroMinimumBug bus={this.props.bus} autopilotDataProvider={this.props.autopilotDataProvider} declutter={this.props.declutter} />
        <VnavTargetAltitudeBug autopilotDataProvider={this.props.autopilotDataProvider} altitudeDataProvider={this.props.altitudeDataProvider} />
      </AltitudeTape>
      <AltitudeDigitalReadout altitude={this.props.altitudeDataProvider.altitude} />
      <svg
        class="altitude-failed-overlay"
        viewBox="0 0 89 362"
        style={{
          width: '89px',
          height: '362px',
          display: this.props.altitudeDataProvider.altitude.map((v) => v === null ? 'block' : 'none'),
        }}
      >
        <path d="M 1 0 l 87 362 m -87 0 l 87 -362" />
      </svg>
      <div class="altitude-miscompare-flag altitude-miscompare-flag-alt" style={{ display: this.props.altitudeDataProvider.altitudeMiscompare.map((v) => v ? 'block' : 'none') }}>A L T ?</div>
      <div class="altitude-miscompare-flag altitude-miscompare-flag-baro" style={{ display: this.props.altitudeDataProvider.baroMiscompare.map((v) => v ? 'block' : 'none') }}>B A R O ?</div>
      <MetricAltitude metricAltitude={this.props.altitudeDataProvider.metricAltitude} pfdSettingsManager={this.props.pfdSettingsManager} />
    </div>;
  }
}
