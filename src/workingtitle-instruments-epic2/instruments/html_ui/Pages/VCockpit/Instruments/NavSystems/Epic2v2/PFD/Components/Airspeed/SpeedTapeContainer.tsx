import { ComponentProps, DisplayComponent, EventBus, FSComponent, SimVarValueType, Subscribable, VNode } from '@microsoft/msfs-sdk';

import {
  AirframeConfig, AirGroundDataProvider, AirspeedDataProvider, AltitudeDataProvider, AutopilotDataProvider, AutothrottleDataProvider, ConfigurationLimit,
  ConfigurationLimitType, FlapWarningDataProvider, StallWarningDataProvider, VSpeedDataProvider
} from '@microsoft/msfs-epic2-shared';

import { AfcsSpeedBug } from './AfcsSpeedBug';
import { ConfigurationLimitBug } from './ConfigurationLimitBug';
import { DynamicSpeedBug } from './DynamicSpeedBug';
import { FmsSpeedBug } from './FmsSpeedBug';
import { MaxSpeedBug } from './MaxSpeedBug';
import { SelectedSpeedBug } from './SelectedSpeedBug';
import { SpeedDigitalReadout } from './SpeedDigitalReadout';
import { SpeedTape } from './SpeedTape';
import { TakeoffVSpeedDisplay } from './TakeoffVSpeedDisplay';
import { VSpeedBug } from './VSpeedBug';

import './SpeedTapeContainer.css';

/** Props for the speed tape container area. */
export interface SpeedTapeContainerProps extends ComponentProps {
  /** The event bus. */
  readonly bus: EventBus,
  /** The air/ground system data provider to use. */
  readonly airGroundDataProvider: AirGroundDataProvider;
  /** The airspeed data provider to use. */
  readonly airspeedDataProvider: AirspeedDataProvider;
  /** The altitude data provider to use. */
  readonly altitudeDataProvider: AltitudeDataProvider;
  /** An autopilot data provider. */
  readonly autopilotDataProvider: AutopilotDataProvider;
  /** The flap warning data provider to use. */
  readonly flapWarningDataProvider: FlapWarningDataProvider;
  /** The stall warning data provider to use. */
  readonly stallWarningDataProvider: StallWarningDataProvider;
  /** The vspeed data provider to use. */
  readonly vSpeedDataProvider: VSpeedDataProvider;
  /** An autothrottle data provider. */
  readonly autothrottleDataProvider: AutothrottleDataProvider;
  /** Airframe config */
  readonly airframeConfig: AirframeConfig;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** Speed tape area container (including ref speed markers etc.). */
export class SpeedTapeContainer extends DisplayComponent<SpeedTapeContainerProps> {
  private readonly combinedConfigBugs = new Map<number, ConfigurationLimit[]>();

  /** @inheritdoc */
  constructor(props: SpeedTapeContainerProps) {
    super(props);

    for (const limit of this.props.airframeConfig.configurationLimits) {
      const bugsAtAirspeed = this.combinedConfigBugs.get(limit.airspeed) ?? [];
      bugsAtAirspeed.push(limit);

      this.combinedConfigBugs.set(limit.airspeed, bugsAtAirspeed);
    }
  }

  /**
   * Gets the labels from a set of configuration limits
   * @param limits The configuration limits to interpret
   * @returns An array of labels to use
   */
  private getConfigLimitLabels(limits: ConfigurationLimit[]): string[] {
    return limits.map((limit) => {
      if (limit.type === ConfigurationLimitType.GearExtended && this.props.airframeConfig.vmo !== limit.airspeed) {
        return undefined;
      }

      switch (limit.type) {
        case ConfigurationLimitType.Flaps: {
          const angle = SimVar.GetGameVarValue('AIRCRAFT FLAPS HANDLE ANGLE', SimVarValueType.Degree, limit.flapHandleIndex ?? 0);
          return angle.toFixed(0).padStart(2, '0') ?? 'NA';
        }
        case ConfigurationLimitType.GearOperating:
        case ConfigurationLimitType.GearExtention:
        case ConfigurationLimitType.GearExtended:
          return 'G ';
        case ConfigurationLimitType.GearRetraction:
          return 'Gr';
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="speed-tape-container">
      <SpeedTape
        bus={this.props.bus}
        airGroundDataProvider={this.props.airGroundDataProvider}
        airspeedDataProvider={this.props.airspeedDataProvider}
        flapWarningDataProvider={this.props.flapWarningDataProvider}
        stallWarningDataProvider={this.props.stallWarningDataProvider}
        autothrottleDataProvider={this.props.autothrottleDataProvider}
      >
        {...this.props.vSpeedDataProvider.speedBugs.map(props => <VSpeedBug declutter={this.props.declutter} {...props} />)}
        <DynamicSpeedBug
          airspeedDataProvider={this.props.airspeedDataProvider}
          airGroundDataProvider={this.props.airGroundDataProvider}
          stallWarningDataProvider={this.props.stallWarningDataProvider}
        />
        {...Array.from(this.combinedConfigBugs.values()).map((limits: ConfigurationLimit[]) =>
          <ConfigurationLimitBug airspeedDataProvider={this.props.airspeedDataProvider} airspeed={limits[0].airspeed} labels={this.getConfigLimitLabels(limits)} />)
        }
        <FmsSpeedBug
          altitudeDataProvider={this.props.altitudeDataProvider}
          autopilotDataProvider={this.props.autopilotDataProvider}
          autothrottleDataProvider={this.props.autothrottleDataProvider}
        />
        <SelectedSpeedBug altitudeDataProvider={this.props.altitudeDataProvider} autopilotDataProvider={this.props.autopilotDataProvider}
          autothrottleDataProvider={this.props.autothrottleDataProvider} />
        <MaxSpeedBug airspeedDataProvider={this.props.airspeedDataProvider} />
        {
          this.props.autothrottleDataProvider.speedProtectionAvailable &&
          <AfcsSpeedBug
            airGroundDataProvider={this.props.airGroundDataProvider}
            airspeedDataProvider={this.props.airspeedDataProvider}
            autopilotDataProvider={this.props.autopilotDataProvider}
            autothrottleDataProvider={this.props.autothrottleDataProvider}
          />
        }
      </SpeedTape >
      <TakeoffVSpeedDisplay
        vSpeedDataProvider={this.props.vSpeedDataProvider}
      />
      <SpeedDigitalReadout airspeedDataProvider={this.props.airspeedDataProvider} />
      <svg
        class="speed-failed-overlay"
        viewBox="0 0 83 362"
        style={{
          width: '83px',
          height: '362px',
          display: this.props.airspeedDataProvider.cas.map((v) => v === null ? 'block' : 'none')
        }}
      >
        <path d="M 1 0 l 81 362 m -81 0 l 81 -362" />
      </svg>
    </div >;
  }
}
