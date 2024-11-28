import { AdcEvents, AvionicsSystemState, AvionicsSystemStateEvent, ConsumerSubject, ControlSurfacesEvents, EventBus, MappedSubject, Subscription } from '@microsoft/msfs-sdk';
import { AdcSystemEvents } from '@microsoft/msfs-garminsdk';
import { ConfigurationVSpeedGroup, TakeoffVSpeedGroup, VSpeedGroupType, VSpeedUserSettingManager } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager of reference V-speed bugs.
 * 
 * The manager will optionally hide takeoff V-speed bugs when gear or flaps are extended from a fully retracted state
 * (the latter only when in the air). The manager will also optionally hide takeoff V-speed bugs when indicated
 * airspeed exceeds a threshold value, if such a value is defined.
 * 
 * Finally, the manager will control the visibility of configuration V-speed bugs based on whether pressure altitude is
 * less than a threshold value, if such a value is defined.
 */
export class VSpeedBugManager {
  private static readonly FLAPS_RETRACTED_THRESHOLD = 1; // degrees
  private static readonly ALTITUDE_HYSTERESIS = 100; // feet

  private readonly takeoffVSpeedDefs = this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff)?.vSpeedDefinitions ?? [];
  private readonly configurationVSpeedDefs = this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Configuration)?.vSpeedDefinitions ?? [];

  private readonly isOnGround = ConsumerSubject.create(null, false);

  private readonly flapsLeftAngle = ConsumerSubject.create(null, 0);
  private readonly flapsRightAngle = ConsumerSubject.create(null, 0);

  private readonly flapsState = MappedSubject.create(
    this.isOnGround,
    this.flapsLeftAngle,
    this.flapsRightAngle
  );

  private readonly gearNosePosition = ConsumerSubject.create(null, 0);
  private readonly gearLeftPosition = ConsumerSubject.create(null, 0);
  private readonly gearRightPosition = ConsumerSubject.create(null, 0);

  private readonly gearState = MappedSubject.create(
    this.gearNosePosition,
    this.gearLeftPosition,
    this.gearRightPosition
  );

  private readonly adcStates: ConsumerSubject<AvionicsSystemStateEvent>[] = [];
  private adcIndex?: MappedSubject<AvionicsSystemStateEvent[], number>;

  private readonly ias = ConsumerSubject.create(null, 0);
  private readonly pressureAlt = ConsumerSubject.create(null, 0);

  private flapsExtendArmed = false;
  private gearExtendArmed = false;
  private iasArmed = false;

  private configurationBugsShow = false;

  private isAlive = true;
  private isInit = false;
  private isPaused = false;

  private flapsStateSub?: Subscription;
  private gearStateSub?: Subscription;
  private adcIndexSub?: Subscription;
  private iasSub?: Subscription;
  private pressureAltSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param vSpeedSettingManager A manager for reference V-speed user settings.
   * @param adcCount The number of ADC sensors available on the airplane.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly vSpeedSettingManager: VSpeedUserSettingManager,
    private readonly adcCount: number
  ) {
  }

  /**
   * Initializes this manager.
   * @param paused Whether to initialize this manager as paused. Defaults to `false`.
   * @throws Error if this manager has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('VSpeedBugManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const takeoffGroup = this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Takeoff) as TakeoffVSpeedGroup | undefined;
    const configGroup = this.vSpeedSettingManager.vSpeedGroups.get(VSpeedGroupType.Configuration) as ConfigurationVSpeedGroup | undefined;

    const sub = this.bus.getSubscriber<ControlSurfacesEvents & AdcEvents & AdcSystemEvents>();

    if (this.takeoffVSpeedDefs.length > 0 && takeoffGroup?.hideWhenConfiguredForApproach) {
      this.isOnGround.setConsumer(sub.on('on_ground'));

      this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
      this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));

      this.gearNosePosition.setConsumer(sub.on('gear_position_0'));
      this.gearLeftPosition.setConsumer(sub.on('gear_position_1'));
      this.gearRightPosition.setConsumer(sub.on('gear_position_2'));

      this.flapsStateSub = this.flapsState.sub(([isOnGround, left, right]) => {
        if (!isOnGround && left <= VSpeedBugManager.FLAPS_RETRACTED_THRESHOLD && right <= VSpeedBugManager.FLAPS_RETRACTED_THRESHOLD) {
          this.flapsExtendArmed = true;
        } else if (this.flapsExtendArmed && left > VSpeedBugManager.FLAPS_RETRACTED_THRESHOLD && right > VSpeedBugManager.FLAPS_RETRACTED_THRESHOLD) {
          this.flapsExtendArmed = false;
          this.hideTakeoffBugs();
        }
      }, true);

      this.gearStateSub = this.gearState.sub(([nose, left, right]) => {
        if (nose === 0 && left === 0 && right === 0) {
          this.gearExtendArmed = true;
        } else if (this.gearExtendArmed) {
          this.gearExtendArmed = false;
          this.hideTakeoffBugs();
        }
      }, true);
    }

    const maxIas = takeoffGroup?.maxIas;
    const maxAltitude = configGroup?.maxAltitude;
    if (maxIas !== undefined || maxAltitude !== undefined) {
      // Choose the first ADC system that is working and grab IAS/pressure altitude from that system.

      for (let i = 0; i < this.adcCount; i++) {
        this.adcStates[i] = ConsumerSubject.create(sub.on(`adc_state_${i + 1}`), { previous: undefined, current: undefined });
      }

      this.adcIndex = MappedSubject.create(
        (states: readonly AvionicsSystemStateEvent[]) => {
          for (let i = 0; i < states.length; i++) {
            const state = states[i];
            if (state.current === undefined || state.current === AvionicsSystemState.On) {
              return i + 1;
            }
          }

          return -1;
        },
        ...this.adcStates
      );

      if (maxIas !== undefined) {
        this.iasSub = this.ias.sub(ias => {
          if (ias <= maxIas) {
            this.iasArmed = true;
          } else if (this.iasArmed && ias > maxIas) {
            this.iasArmed = false;
            this.hideTakeoffBugs();
          }
        }, false, true);
      }

      if (maxAltitude !== undefined) {
        this.pressureAltSub = this.pressureAlt.sub(alt => {
          const threshold = maxAltitude + VSpeedBugManager.ALTITUDE_HYSTERESIS * (this.configurationBugsShow ? 1 : 0);
          if (alt <= threshold && !this.configurationBugsShow) {
            this.setConfigurationBugsVisible(true);
          } else if (alt > threshold && this.configurationBugsShow) {
            this.setConfigurationBugsVisible(false);
          }
        }, false, true);
      }

      this.adcIndexSub = this.adcIndex.sub(index => {
        if (index <= 0) {
          this.ias.setConsumer(null);
          this.pressureAlt.setConsumer(null);
          this.iasSub?.pause();
          this.pressureAltSub?.pause();
          this.iasArmed = false;
          this.setConfigurationBugsVisible(true);
        } else {
          this.ias.setConsumer(sub.on(`adc_ias_${index}`).withPrecision(0));
          this.pressureAlt.setConsumer(sub.on(`adc_pressure_alt_${index}`).withPrecision(-1));
          this.iasSub?.resume(true);
          this.pressureAltSub?.resume(true);
        }
      }, true);
    }

    if (paused) {
      this.pause();
    }
  }

  /**
   * Hides all takeoff V-speed bugs.
   */
  private hideTakeoffBugs(): void {
    for (let i = 0; i < this.takeoffVSpeedDefs.length; i++) {
      const name = this.takeoffVSpeedDefs[i].name;
      this.vSpeedSettingManager.getSetting(`vSpeedShow_${name}`).value = false;
    }
  }

  /**
   * Sets the visibility of all configuration V-speed bugs.
   * @param show Whether to show the bugs.
   */
  private setConfigurationBugsVisible(show: boolean): void {
    this.configurationBugsShow = show;
    for (let i = 0; i < this.configurationVSpeedDefs.length; i++) {
      const name = this.configurationVSpeedDefs[i].name;
      this.vSpeedSettingManager.getSetting(`vSpeedShow_${name}`).value = show;
    }
  }

  /**
   * Resumes this manager. Once resumed, this manager will automatically hide takeoff V-speed bugs once certain
   * conditions are met.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('VSpeedBugManager: cannot resume a dead manager');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.isOnGround.resume();

    this.flapsLeftAngle.resume();
    this.flapsRightAngle.resume();

    this.gearNosePosition.resume();
    this.gearLeftPosition.resume();
    this.gearRightPosition.resume();

    this.adcStates.forEach(state => { state.resume(); });

    this.gearStateSub?.resume(true);
    this.flapsStateSub?.resume(true);
    this.adcIndexSub?.resume(true);
  }

  /**
   * Pauses this manager. Once paused, this manager will no longer automatically hide takeoff V-speed bugs.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('VSpeedBugManager: cannot pause a dead manager');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.isOnGround.pause();

    this.flapsLeftAngle.pause();
    this.flapsRightAngle.pause();

    this.gearNosePosition.pause();
    this.gearLeftPosition.pause();
    this.gearRightPosition.pause();

    this.adcStates.forEach(state => { state.pause(); });

    this.gearStateSub?.pause();
    this.flapsStateSub?.pause();
    this.adcIndexSub?.pause();
    this.iasSub?.pause();
    this.pressureAltSub?.pause();

    this.flapsExtendArmed = false;
    this.gearExtendArmed = false;
    this.iasArmed = false;
  }

  /**
   * Resets all V-speed values to their defaults and hides all V-speed bugs.
   * @throws Error if this manager has been destroyed.
   */
  public reset(): void {
    if (!this.isAlive) {
      throw new Error('VSpeedBugManager: cannot reset a dead manager');
    }

    for (const group of this.vSpeedSettingManager.vSpeedGroups.values()) {
      for (const vSpeed of group.vSpeedDefinitions) {
        this.vSpeedSettingManager.getSetting(`vSpeedShow_${vSpeed.name}`).resetToDefault();
        this.vSpeedSettingManager.getSetting(`vSpeedUserValue_${vSpeed.name}`).resetToDefault();
        this.vSpeedSettingManager.getSetting(`vSpeedFmsValue_${vSpeed.name}`).resetToDefault();
        this.vSpeedSettingManager.getSetting(`vSpeedFmsConfigMiscompare_${vSpeed.name}`).resetToDefault();
      }
    }

    this.configurationBugsShow = false;
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isOnGround.destroy();

    this.flapsLeftAngle.destroy();
    this.flapsRightAngle.destroy();

    this.gearNosePosition.destroy();
    this.gearLeftPosition.destroy();
    this.gearRightPosition.destroy();

    this.adcStates.forEach(state => { state.destroy(); });

    this.ias.destroy();
    this.pressureAlt.destroy();
  }
}
