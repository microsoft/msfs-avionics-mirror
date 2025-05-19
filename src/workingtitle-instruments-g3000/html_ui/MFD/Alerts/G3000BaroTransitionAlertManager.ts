import { AirportFacility, EventBus, MappedSubject, Subscription, UnitType, UserSettingManager } from '@microsoft/msfs-sdk';

import { BaroTransitionAlertManager } from '@microsoft/msfs-garminsdk';

import {
  AvionicsConfig, BaroTransitionAlertUserSettings, FlightPlanStore, G3000BaroTransitionAlertUserSettingTypes,
  PfdSensorsUserSettingManager
} from '@microsoft/msfs-wtg3000-common';

/**
 * A manager that controls the state of barometric transition alerts for the G3000. The manager controls alerts for
 * all configured PFDs, updates the automatically defined alert thresholds based on the primary flight plan's origin
 * and destination airports, and updates the in-use alert thresholds based on the values of the manuallly and
 * automatically defined alert thresholds.
 */
export class G3000BaroTransitionAlertManager {
  private readonly settingManager: UserSettingManager<G3000BaroTransitionAlertUserSettingTypes>;

  private readonly managers: BaroTransitionAlertManager[];

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of G3000BaroTransitionAlertManager. The manager is created in an uninitialized and paused
   * state.
   * @param bus The event bus.
   * @param config The avionics configuration object.
   * @param pfdSensorsSettingManager A manager for PFD sensors user settings.
   * @param flightPlanStore The flight plan store.
   */
  public constructor(
    bus: EventBus,
    config: AvionicsConfig,
    pfdSensorsSettingManager: PfdSensorsUserSettingManager,
    private readonly flightPlanStore: FlightPlanStore
  ) {
    this.settingManager = BaroTransitionAlertUserSettings.getManager(bus);

    this.managers = config.gduDefs.pfds.slice(1).map(pfdConfig => {
      return new BaroTransitionAlertManager(
        bus,
        this.settingManager,
        {
          id: `${pfdConfig.index}`,
          adcIndex: pfdSensorsSettingManager.getAliasedManager(pfdConfig.index).getSetting('pfdAdcIndex'),
        }
      );
    });
  }

  /**
   * Initializes this manager. Once initialized, the manager will be ready to automatically control the states of
   * barometric transition alerts.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('G3000BaroTransitionAlertManager::init(): cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.subscriptions.push(
      this.flightPlanStore.originFacility.sub(this.onOriginAirportChanged.bind(this), false, true),
      this.flightPlanStore.destinationFacility.sub(this.onDestinationAirportChanged.bind(this), false, true),
    );

    const altitudeThresholdInputs = MappedSubject.create(
      this.settingManager.getSetting('baroTransitionAlertAltitudeManualThreshold'),
      this.settingManager.getSetting('baroTransitionAlertAltitudeAutoThreshold')
    ).pause();

    const levelThresholdInputs = MappedSubject.create(
      this.settingManager.getSetting('baroTransitionAlertLevelManualThreshold'),
      this.settingManager.getSetting('baroTransitionAlertLevelAutoThreshold')
    ).pause();

    this.subscriptions.push(
      altitudeThresholdInputs,
      levelThresholdInputs
    );

    const thresholdPipeFunc = ([manual, auto]: readonly [number, number]): number => manual >= 0 ? manual : auto;

    altitudeThresholdInputs.pipe(this.settingManager.getSetting('baroTransitionAlertAltitudeThreshold'), thresholdPipeFunc);
    levelThresholdInputs.pipe(this.settingManager.getSetting('baroTransitionAlertLevelThreshold'), thresholdPipeFunc);

    for (const manager of this.managers) {
      manager.init();
    }
  }

  /**
   * Resets this manager such that its managed alerts are deactivated. This method has no effect if the manager is not
   * initialized.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('G3000BaroTransitionAlertManager::reset(): cannot reset a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    for (const manager of this.managers) {
      manager.reset();
    }
  }

  /**
   * Resumes this manager. When the manager is resumed, it will automatically control the states of barometric
   * transition alerts. This method has no effect if the manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('G3000BaroTransitionAlertManager::resume(): cannot resume a dead manager');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    for (const sub of this.subscriptions) {
      sub.resume(true);
    }

    for (const manager of this.managers) {
      manager.resume();
    }
  }

  /**
   * Pauses this manager. When the manager is paused, it will not change the states of barometric transition alerts,
   * and the alerts will remain in the state they were in when the manager was paused. This method has no effect
   * if the manager is not initialized.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('G3000BaroTransitionAlertManager::pause(): cannot pause a dead manager');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    for (const sub of this.subscriptions) {
      sub.pause();
    }

    for (const manager of this.managers) {
      manager.pause();
    }
  }

  /**
   * Responds to when the primary flight plan's origin airport has changed.
   * @param facility The new origin airport facility, or `undefined` if there is no origin airport.
   */
  private onOriginAirportChanged(facility: AirportFacility | undefined): void {
    const autoThresholdSetting = this.settingManager.getSetting('baroTransitionAlertAltitudeAutoThreshold');

    if (facility) {
      autoThresholdSetting.set(
        facility.transitionAlt === 0
          ? -1
          : Math.round(UnitType.METER.convertTo(facility.transitionAlt, UnitType.FOOT))
      );
    } else {
      autoThresholdSetting.set(-1);
    }
  }

  /**
   * Responds to when the primary flight plan's destination airport has changed.
   * @param facility The new destination airport facility, or `undefined` if there is no destination airport.
   */
  private onDestinationAirportChanged(facility: AirportFacility | undefined): void {
    const autoThresholdSetting = this.settingManager.getSetting('baroTransitionAlertLevelAutoThreshold');

    if (facility) {
      autoThresholdSetting.set(
        facility.transitionLevel === 0
          ? -1
          : Math.round(UnitType.METER.convertTo(facility.transitionAlt, UnitType.FOOT))
      );
    } else {
      autoThresholdSetting.set(-1);
    }
  }

  /**
   * Destroys this manager. Destroying the manager stops it from automatically controlling the states of barometric
   * transition alerts and allows resources used by the manager to be freed.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const manager of this.managers) {
      manager.destroy();
    }
  }
}
