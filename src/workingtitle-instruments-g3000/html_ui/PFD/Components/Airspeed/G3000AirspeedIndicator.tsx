import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode
} from '@microsoft/msfs-sdk';

import {
  AirspeedIndicator, AirspeedIndicatorDataProvider, DefaultVSpeedAnnunciationDataProvider, VSpeedBugDefinition
} from '@microsoft/msfs-garminsdk';

import { VSpeedGroupType, VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';

import { AirspeedIndicatorConfig } from './AirspeedIndicatorConfig';

import './G3000AirspeedIndicator.css';

/**
 * Component props for {@link G3000AirspeedIndicator}.
 */
export interface G3000AirspeedIndicatorProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the indicator. */
  config: AirspeedIndicatorConfig;

  /** A data provider for the altimeter. */
  dataProvider: AirspeedIndicatorDataProvider;

  /** A manager for reference V-speed settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** Whether the indicator should be decluttered due to unusual attitudes. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 airspeed indicator.
 */
export class G3000AirspeedIndicator extends DisplayComponent<G3000AirspeedIndicatorProps> {
  private readonly ref = FSComponent.createRef<AirspeedIndicator>();

  private readonly vSpeedAnnunciationDataProvider?: DefaultVSpeedAnnunciationDataProvider;

  private isAlive = true;
  private isAwake = false;

  /**
   * Creates a new instance of G3000AirspeedIndicator.
   * @param props The properties of the component.
   */
  public constructor(props: G3000AirspeedIndicatorProps) {
    super(props);

    if (this.props.config.vSpeedAnnuncOptions.enabled) {
      const takeoffVSpeedGroup = this.props.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff);
      const landingVSpeedGroup = this.props.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Landing);

      const takeoffVSpeeds = takeoffVSpeedGroup
        ? takeoffVSpeedGroup.vSpeedDefinitions.map(def => def.name)
        : [];

      const landingVSpeeds = landingVSpeedGroup
        ? landingVSpeedGroup.vSpeedDefinitions.map(def => def.name)
        : [];

      if (takeoffVSpeeds.length > 0 || landingVSpeeds.length > 0) {
        this.vSpeedAnnunciationDataProvider = new DefaultVSpeedAnnunciationDataProvider(
          this.props.bus,
          this.props.vSpeedSettingManager,
          takeoffVSpeeds,
          landingVSpeeds
        );
      }
    }
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.vSpeedAnnunciationDataProvider?.init();

    if (this.isAwake) {
      this.ref.instance.wake();
    }
  }

  /**
   * Wakes this indicator. While awake, this indicator will automatically update its appearance.
   * @throws Error if this indicator is dead.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('G3000AirspeedIndicator: cannot wake a dead component');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.ref.getOrDefault()?.wake();
  }

  /**
   * Puts this indicator to sleep. While asleep, this indicator will not automatically update its appearance.
   * @throws Error if this indicator is dead.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('G3000AirspeedIndicator: cannot sleep a dead component');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.ref.getOrDefault()?.sleep();
  }

  /** @inheritDoc */
  public render(): VNode {
    const vSpeedBugDefinitions = this.props.config.vSpeedBugConfigs?.map(config => config.resolve()(this.props.vSpeedSettingManager.vSpeedGroups))
      .filter(def => def !== undefined) as VSpeedBugDefinition[] ?? [];

    return (
      <AirspeedIndicator
        ref={this.ref}
        dataProvider={this.props.dataProvider}
        vSpeedAnnunciationDataProvider={this.vSpeedAnnunciationDataProvider}
        declutter={this.props.declutter}
        tapeScaleOptions={this.props.config.tapeScaleOptions}
        colorRanges={this.props.config.colorRangeDefinitions ?? []}
        bottomDisplayOptions={this.props.config.bottomDisplayOptions}
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
        approachCueBugOptions={this.props.config.approachCueBugOptions}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}
