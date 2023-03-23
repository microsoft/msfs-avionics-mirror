import { ComponentProps, DisplayComponent, EventBus, FSComponent, SimVarValueType, Subscribable, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  AirspeedAoaDataProvider, AirspeedIndicator as BaseAirspeedIndicator, AirspeedIndicatorBottomDisplayMode, AirspeedIndicatorDataProviderOptions,
  DefaultAirspeedIndicatorDataProvider, DefaultVSpeedAnnunciationDataProvider, VSpeedBugDefinition
} from '@microsoft/msfs-garminsdk';
import { IauUserSettingTypes, VSpeedGroupType, VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';

import { AirspeedIndicatorConfig } from './AirspeedIndicatorConfig';

import './AirspeedIndicator.css';

/**
 * Component props for AirspeedIndicator.
 */
export interface AirspeedIndicatorProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the indicator. */
  config: AirspeedIndicatorConfig;

  /**
   * Whether airspeed hold is active. If not defined, airspeed hold is considered active if and only if the flight
   * director is in FLC mode.
   */
  isAirspeedHoldActive?: boolean | Subscribable<boolean>;

  /** A provider of angle of attack data. */
  aoaDataProvider: AirspeedAoaDataProvider;

  /** A manager for IAU user settings. */
  iauSettingManager: UserSettingManager<IauUserSettingTypes>;

  /** A manager for reference V-speed settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;

  /** The index of the PFD. */
  pfdIndex: 1 | 2;
}

/**
 * A G3000 airspeed indicator.
 */
export class AirspeedIndicator extends DisplayComponent<AirspeedIndicatorProps> {
  private static readonly DEFAULT_OPTIONS = {
    dataProvider: {
      trendLookahead: 6,
      overspeedThreshold: (): number => Number.POSITIVE_INFINITY,
      underspeedThreshold: (): number => Number.NEGATIVE_INFINITY
    },

    tapeScale: {
      minimum: 20,
      maximum: 999,
      window: 60,
      majorTickInterval: 10,
      minorTickFactor: 2
    },

    bottomDisplay: {
      mode: AirspeedIndicatorBottomDisplayMode.TrueAirspeed,
      machThreshold: undefined as number | Subscribable<number> | undefined
    }
  };

  private readonly ref = FSComponent.createRef<BaseAirspeedIndicator>();

  private readonly dataProvider: DefaultAirspeedIndicatorDataProvider;
  private readonly vSpeedAnnunciationDataProvider?: DefaultVSpeedAnnunciationDataProvider;

  /** @inheritdoc */
  constructor(props: AirspeedIndicatorProps) {
    super(props);

    const dataProviderOptions: AirspeedIndicatorDataProviderOptions = {
      isAirspeedHoldActive: this.props.isAirspeedHoldActive,
      ...AirspeedIndicator.DEFAULT_OPTIONS.dataProvider
    };

    for (const key in dataProviderOptions) {
      const configOption = this.props.config.dataProviderOptions[key as keyof AirspeedIndicatorDataProviderOptions];
      if (configOption !== undefined) {
        dataProviderOptions[key as keyof AirspeedIndicatorDataProviderOptions] = configOption as any;
      }
    }

    this.dataProvider = new DefaultAirspeedIndicatorDataProvider(
      this.props.bus,
      this.props.iauSettingManager.getSetting('iauAdcIndex'),
      dataProviderOptions,
      this.props.aoaDataProvider
    );

    const takeoffVSpeedGroup = this.props.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff);
    const landingVSpeedGroup = this.props.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Landing);
    if ((takeoffVSpeedGroup?.vSpeedDefinitions.length ?? 0) > 0 || (landingVSpeedGroup?.vSpeedDefinitions.length ?? 0) > 0) {
      this.vSpeedAnnunciationDataProvider = new DefaultVSpeedAnnunciationDataProvider(
        this.props.bus,
        this.props.vSpeedSettingManager,
        takeoffVSpeedGroup?.vSpeedDefinitions.map(def => def.name) ?? [],
        landingVSpeedGroup?.vSpeedDefinitions.map(def => def.name) ?? []
      );
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.dataProvider.init();
    this.vSpeedAnnunciationDataProvider?.init();

    if (this.props.pfdIndex === 1) {
      this.dataProvider.overspeedThreshold.sub(v => {
        SimVar.SetGameVarValue('AIRCRAFT_MAXSPEED_OVERRIDE', SimVarValueType.Knots, v);
      });
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    const tapeScaleOptions = { ...AirspeedIndicator.DEFAULT_OPTIONS.tapeScale };
    for (const key in tapeScaleOptions) {
      const configOption = this.props.config.tapeScaleOptions[key as keyof typeof tapeScaleOptions];
      if (configOption !== undefined) {
        tapeScaleOptions[key as keyof typeof tapeScaleOptions] = configOption as any;
      }
    }

    const bottomDisplayOptions = { ...AirspeedIndicator.DEFAULT_OPTIONS.bottomDisplay };
    for (const key in bottomDisplayOptions) {
      const configOption = this.props.config.bottomDisplayOptions[key as keyof typeof bottomDisplayOptions];
      if (configOption !== undefined) {
        bottomDisplayOptions[key as keyof typeof bottomDisplayOptions] = configOption as any;
      }
    }

    const vSpeedBugDefinitions = this.props.config.vSpeedBugConfigs?.map(config => config.resolve()(this.props.vSpeedSettingManager.vSpeedGroups))
      .filter(def => def !== undefined) as VSpeedBugDefinition[] ?? [];

    return (
      <BaseAirspeedIndicator
        ref={this.ref}
        bus={this.props.bus}
        dataProvider={this.dataProvider}
        vSpeedAnnunciationDataProvider={this.vSpeedAnnunciationDataProvider}
        declutter={this.props.declutter}
        tapeScaleOptions={tapeScaleOptions}
        colorRanges={this.props.config.colorRangeDefinitions ?? []}
        bottomDisplayOptions={bottomDisplayOptions}
        trendVectorOptions={{ trendThreshold: 1 }}
        airspeedAlertOptions={{
          supportOverspeed: true,
          supportTrendOverspeed: true,
          supportUnderspeed: true,
          supportTrendUnderspeed: true
        }}
        vSpeedBugOptions={{
          vSpeedSettingManager: this.props.vSpeedSettingManager,
          vSpeedBugDefinitions
        }}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.ref.getOrDefault()?.destroy();
    this.dataProvider.destroy();
  }
}