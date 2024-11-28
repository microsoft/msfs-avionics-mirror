import {
  ComponentProps, DisplayComponent, FSComponent, Subscribable, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { Altimeter, AltimeterDataProvider, AltitudeAlertState, MinimumsAlertState } from '@microsoft/msfs-garminsdk';

import { PfdAliasedUserSettingTypes, PfdGduConfig } from '@microsoft/msfs-wtg3000-common';

import { AltimeterConfig } from './AltimeterConfig';

import './G3000Altimeter.css';

/**
 * Component props for {@link G3000Altimeter}.
 */
export interface G3000AltimeterProps extends ComponentProps {
  /** The configuration object for the altimeter. */
  config: AltimeterConfig;

  /** Configuration options for the altimeter's parent PFD GDU. */
  pfdGduConfig: PfdGduConfig;

  /** A data provider for the altimeter. */
  dataProvider: AltimeterDataProvider;

  /** The current altitude alert state. */
  altitudeAlertState: Subscribable<AltitudeAlertState>;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** Whether the indicator should be decluttered due to unusual attitudes. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 altimeter.
 */
export class G3000Altimeter extends DisplayComponent<G3000AltimeterProps> {
  private readonly ref = FSComponent.createRef<Altimeter>();

  private isAlive = true;
  private isAwake = false;

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.isAwake) {
      this.ref.instance.wake();
    }
  }

  /**
   * Wakes this altimeter. While awake, this altimeter will automatically update its appearance.
   * @throws Error if this altimeter is dead.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('G3000Altimeter: cannot wake a dead component');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.ref.getOrDefault()?.wake();
  }

  /**
   * Puts this altimeter to sleep. While asleep, this altimeter will not automatically update its appearance.
   * @throws Error if this altimeter is dead.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('G3000Altimeter: cannot sleep a dead component');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.ref.getOrDefault()?.sleep();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <Altimeter
        ref={this.ref}
        dataProvider={this.props.dataProvider}
        altitudeAlertState={this.props.altitudeAlertState}
        minimumsAlertState={this.props.minimumsAlertState}
        declutter={this.props.declutter}
        tapeScaleOptions={this.props.config.tapeScaleOptions}
        trendVectorOptions={{ trendThreshold: 1 }}
        supportBaroPreselect={this.props.pfdGduConfig.supportBaroPreselect}
        showMetricAltitude={this.props.pfdSettingManager.getSetting('altMetric')}
        showMetricBaroSetting={this.props.pfdSettingManager.getSetting('altimeterBaroMetric')}
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
