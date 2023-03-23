import {
  AuralAlertControlEvents, AuralAlertRegistrationManager, ComponentProps, DisplayComponent, EventBus, FSComponent,
  Subscribable, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';
import {
  Altimeter as BaseAltimeter, AltimeterDataProvider, AltimeterDataProviderOptions, AltimeterTapeScaleOptions, AltitudeAlerter, AltitudeAlertState,
  MinimumsAlertState
} from '@microsoft/msfs-garminsdk';
import { G3000AuralAlertIds, G3000AuralAlertUtils, IauConfig, IauUserSettingTypes, PfdAliasedUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { AltimeterConfig } from './AltimeterConfig';

import './Altimeter.css';

/**
 * Component props for AirspeedIndicator.
 */
export interface AltimeterProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The index of the PFD instrument to which the altimeter belongs. */
  pfdIndex: number;

  /** The configuration object for the altimeter. */
  config: AltimeterConfig;

  /** Configuration options for the IAU used by the altimeter. */
  iauConfig: IauConfig;

  /** A data provider for the altimeter. */
  dataProvider: AltimeterDataProvider;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** A manager for IAU user settings. */
  iauSettingManager: UserSettingManager<IauUserSettingTypes>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 altimeter.
 */
export class Altimeter extends DisplayComponent<AltimeterProps> {
  private static readonly DEFAULT_OPTIONS = {
    dataProvider: {
      trendLookahead: 6,
      supportRadarAlt: true
    } as AltimeterDataProviderOptions,

    tapeScale: {
      minimum: -9999,
      maximum: 99999,
      window: 1000,
      majorTickInterval: 100,
      minorTickFactor: 5
    } as AltimeterTapeScaleOptions
  };

  private readonly ref = FSComponent.createRef<BaseAltimeter>();

  private readonly auralAlertPublisher = this.props.bus.getPublisher<AuralAlertControlEvents>();
  private auralAlertManager?: AuralAlertRegistrationManager;

  private readonly altitudeAlerter: AltitudeAlerter;

  /** @inheritdoc */
  constructor(props: AltimeterProps) {
    super(props);

    const dataProviderOptions = { ...Altimeter.DEFAULT_OPTIONS.dataProvider };
    if (this.props.config.dataProviderOptions.trendLookahead !== undefined) {
      dataProviderOptions.trendLookahead = this.props.config.dataProviderOptions.trendLookahead;
    }

    const adcIndex = this.props.iauSettingManager.getSetting('iauAdcIndex');

    this.altitudeAlerter = new AltitudeAlerter(this.props.pfdIndex, this.props.bus, adcIndex);

    if (this.props.pfdIndex === 1) {
      this.auralAlertManager = new AuralAlertRegistrationManager(this.props.bus);
      this.auralAlertManager.register({
        uuid: G3000AuralAlertIds.AltitudeAlert,
        queue: G3000AuralAlertUtils.PRIMARY_QUEUE,
        priority: G3000AuralAlertUtils.PRIORITIES[G3000AuralAlertIds.AltitudeAlert],
        sequence: 'tone_altitude_alert_default',
        continuous: false,
        repeat: false,
        timeout: 5000
      });
    }
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    if (this.props.pfdIndex === 1) {
      this.altitudeAlerter.state.sub(v => {
        if (v === AltitudeAlertState.Within1000 || v === AltitudeAlertState.Deviation) {
          this.auralAlertPublisher.pub('aural_alert_activate', G3000AuralAlertIds.AltitudeAlert, true, false);
        } else {
          this.auralAlertPublisher.pub('aural_alert_deactivate', G3000AuralAlertIds.AltitudeAlert, true, false);
        }
      });
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    this.altitudeAlerter.init();

    const tapeScaleOptions = { ...Altimeter.DEFAULT_OPTIONS.tapeScale };
    for (const key in tapeScaleOptions) {
      const configOption = this.props.config.tapeScaleOptions[key as keyof typeof tapeScaleOptions];
      if (configOption !== undefined) {
        tapeScaleOptions[key as keyof typeof tapeScaleOptions] = configOption as any;
      }
    }

    return (
      <BaseAltimeter
        ref={this.ref}
        bus={this.props.bus}
        dataProvider={this.props.dataProvider}
        altitudeAlertState={this.altitudeAlerter.state}
        minimumsAlertState={this.props.minimumsAlertState}
        declutter={this.props.declutter}
        tapeScaleOptions={tapeScaleOptions}
        trendVectorOptions={{ trendThreshold: 1 }}
        supportBaroPreselect={this.props.iauConfig.supportBaroPreselect}
        settingManager={this.props.pfdSettingManager}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();
    this.altitudeAlerter.destroy();

    this.auralAlertManager?.destroy();

    super.destroy();
  }
}