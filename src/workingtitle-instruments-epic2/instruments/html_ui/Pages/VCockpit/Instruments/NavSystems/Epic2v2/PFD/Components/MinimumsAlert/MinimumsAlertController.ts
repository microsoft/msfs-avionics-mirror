import { BasePublisher, EventBus, MappedSubject, MinimumsMode, Subject } from '@microsoft/msfs-sdk';

import { AirGroundDataProvider, AltitudeDataProvider, CockpitUserSettings, RadioAltimeterDataProvider } from '@microsoft/msfs-epic2-shared';

/** The state of the minimums controller. */
export enum MinimumsAlerterState {
  DISARMED = 'DISARMED', // on ground - HIDE BOX HIDE TEXT
  ARMED = 'ARMED', // altitude > mins + 50 -  HIDE BOX HIDE TEXT
  PREALERT = 'PREALERT', // altitude < mins + 50 SHOW BOX HIDE TEXT
  ALERT = 'ALERT' // altitude > mins SHOW BOX SHOW TEXT
}

/**
 *
 */
export interface Epic2MinimumsEvents {
  /** Event indicating an active minimums alert */
  minimums_alert: boolean;

  /** Indicates whether there is an active radio minimums alert */
  radio_minimums_alert: boolean;

  /** Indicates current minimums display state */
  minimums_alerter_state: MinimumsAlerterState;
}

/**
 * A controller to contain the logic for Minimums Alert
 */
export class MinimumsAlertController extends BasePublisher<Epic2MinimumsEvents> {
  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.bus);
  private readonly modeSetting = this.cockpitUserSettings.getSetting('minimumsMode');

  private readonly alertValue = MappedSubject.create(
    ([mode, baroMins, radioMins]) => {
      switch (mode) {
        case MinimumsMode.BARO:
          return baroMins;
        case MinimumsMode.RA:
          return radioMins;
        default:
          return null;
      }
    },
    this.modeSetting,
    this.cockpitUserSettings.getSetting('decisionAltitudeFeet'),
    this.cockpitUserSettings.getSetting('decisionHeightFeet')
  );

  private readonly alerterState = Subject.create<MinimumsAlerterState>(MinimumsAlerterState.DISARMED);
  private readonly isOnGround = this.airGroundDataProvider.isOnGround;
  private readonly planeAltitude = Subject.create<number | null>(0);

  protected readonly baroPlaneAltitudePipe = this.altitudeDataProvider.altitude.pipe(this.planeAltitude, true);
  protected readonly radioPlaneAltitudePipe = this.radioAltimeterDataProvider.radioAltitude.pipe(this.planeAltitude, true);

  /**
   * Constructor.
   * @param bus The event bus.
   * @param airGroundDataProvider The air/ground system data provider to use.
   * @param altitudeDataProvider The altitude data provider to use.
   * @param radioAltimeterDataProvider The radio altimeter data provider to use.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly airGroundDataProvider: AirGroundDataProvider,
    protected readonly altitudeDataProvider: AltitudeDataProvider,
    protected readonly radioAltimeterDataProvider: RadioAltimeterDataProvider,
  ) {
    super(bus);

    const updateAlerterState = this.updateAlerterState.bind(this);

    this.modeSetting.sub(this.onModeChanged.bind(this), true);
    this.alertValue.sub(this.onMinimumsChanged.bind(this), true);
    this.planeAltitude.sub(updateAlerterState, true);
    this.isOnGround.sub(updateAlerterState, true);

    updateAlerterState();

    this.alerterState.sub(this.onAlerterStateChanged.bind(this), true);
    this.startPublish();
  }

  /**
   * Called when the minimums mode changes.
   * @param mode The new minimums mode.
   */
  private onModeChanged(mode: MinimumsMode): void {
    this.alerterState.set(MinimumsAlerterState.DISARMED);

    switch (mode) {
      case MinimumsMode.BARO:
        this.radioPlaneAltitudePipe.pause();
        this.baroPlaneAltitudePipe.resume(true);
        break;
      case MinimumsMode.RA:
        this.baroPlaneAltitudePipe.pause();
        this.radioPlaneAltitudePipe.resume(true);
        break;
      default:
        this.baroPlaneAltitudePipe.pause();
        this.radioPlaneAltitudePipe.pause();
        this.planeAltitude.set(null);
    }

    this.updateAlerterState();
  }

  /**
   * Called when the minimums value changes.
   */
  private onMinimumsChanged(): void {
    this.alerterState.set(MinimumsAlerterState.DISARMED);
    this.updateAlerterState();
  }

  /**
   * Called when the alerter state changes.
   * @param state The new alerter state.
   */
  private onAlerterStateChanged(state: MinimumsAlerterState): void {
    this.publish('minimums_alert', state === MinimumsAlerterState.ALERT, false, true);
    this.publish('radio_minimums_alert', state === MinimumsAlerterState.ALERT && this.modeSetting.value === MinimumsMode.RA, false, true);
    this.publish('minimums_alerter_state', state);
  }

  /**
   * Updates the alert state.
   */
  private updateAlerterState(): void {
    const minimums = this.alertValue.get();
    const altitude = this.planeAltitude.get();

    if (minimums === null || this.isOnGround.get() || altitude === null || minimums < 20) {
      this.alerterState.set(MinimumsAlerterState.DISARMED);
      return;
    }

    switch (this.alerterState.get()) {
      case MinimumsAlerterState.DISARMED:
        if (altitude > minimums + 50) {
          this.alerterState.set(MinimumsAlerterState.ARMED);
        }
        break;
      case MinimumsAlerterState.ARMED:
        if (altitude < minimums + 50) {
          this.alerterState.set(MinimumsAlerterState.PREALERT);
        }
        break;
      case MinimumsAlerterState.PREALERT:
        if (altitude < minimums) {
          this.alerterState.set(MinimumsAlerterState.ALERT);
        } else if (altitude > minimums + 50) {
          this.alerterState.set(MinimumsAlerterState.ARMED);
        }
        break;
      case MinimumsAlerterState.ALERT:
        if (altitude < minimums + 50 && altitude > minimums) {
          this.alerterState.set(MinimumsAlerterState.PREALERT);
        }
        break;
    }
  }
}
