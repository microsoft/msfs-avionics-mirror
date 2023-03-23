/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ArraySubject, AvionicsSystemState, BasicNavAngleSubject, BasicNavAngleUnit, ClockEvents, ConsumerSubject, EventBus,
  GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, GPSSatellite, GPSSatelliteState, GPSSystemSBASState,
  GPSSystemState, NavAngleUnitFamily, NumberUnitInterface, NumberUnitSubject, ReadonlySubEvent, SubEvent, Subject,
  Subscribable, SubscribableArray, SubscribableUtils, Subscription, UnitFamily, UnitType
} from '@microsoft/msfs-sdk';

import { GpsReceiverSystemEvents } from '@microsoft/msfs-garminsdk';

import { DynamicListData } from '../List/DynamicListData';

/**
 * Data about a GPS satellite from the provider.
 */
export class GpsSatelliteData implements DynamicListData {
  /** @inheritdoc */
  public readonly isVisible = Subject.create<boolean>(true);

  /**
   * Creates an instance of GpsSatelliteData.
   * @param sat The satellite to track.
   */
  constructor(public readonly sat: GPSSatellite) { }
}

/**
 * A data provider that provides GPS status.
 */
export class GpsStatusDataProvider {
  private readonly _receiverState = Subject.create<AvionicsSystemState | undefined>(undefined);
  /** The current GPS receiver state. */
  public readonly receiverState = this._receiverState as Subscribable<AvionicsSystemState>;

  private readonly _systemState = Subject.create(GPSSystemState.Searching);
  /** The current GPS system state. */
  public readonly systemState = this._systemState as Subscribable<GPSSystemState>;

  private readonly _sbasState = Subject.create(GPSSystemSBASState.Inactive);
  /** The current GPS system SBAS state. */
  public readonly sbasState = this._sbasState as Subscribable<GPSSystemSBASState>;

  private readonly _activeSatellites = ArraySubject.create<GpsSatelliteData>();
  /** The current satellites. */
  public readonly activeSatellites = this._activeSatellites as SubscribableArray<GpsSatelliteData>;

  private readonly _numInUseSatellites = Subject.create(0);
  /** The number of active tracking satellites. */
  public readonly numInUseSatellites = this._numInUseSatellites as Subscribable<number>;

  private readonly _positionsCalculated = new SubEvent<this, void>();
  /** An event that fires when the satellite positions are calculated. */
  public readonly positionsCalculated = this._positionsCalculated as ReadonlySubEvent<this, void>;

  private readonly _pdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The current GPS receiver PDOP. */
  public readonly pdop = this._pdop as Subscribable<number>;

  private readonly _hdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The current GPS receiver HDOP. */
  public readonly hdop = this._hdop as Subscribable<number>;

  private readonly _vdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The current GPS receiver VDOP. */
  public readonly vdop = this._vdop as Subscribable<number>;

  private readonly _position = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  /** The current GPS position. Both lat and lon will be `NaN` if a GPS fix is not available. */
  public readonly position = this._position as Subscribable<GeoPointInterface>;

  private readonly _time = ConsumerSubject.create(null, 0);
  /** The current time, as a UNIX timestamp in milliseconds. */
  public readonly time = this._time as Subscribable<number>;

  private readonly _altitude = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  /** The current GPS altitude, or `NaN` if a GPS fix is not available. */
  public readonly altitude = this._altitude as Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  private readonly _groundSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  /** The current GPS ground speed, or `NaN` if a GPS fix is not available. */
  public readonly groundSpeed = this._groundSpeed as Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  private readonly _groundTrack = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  /** The current GPS ground track, or `NaN` if a GPS fix is not available. */
  public readonly groundTrack = this._groundTrack as Subscribable<NumberUnitInterface<NavAngleUnitFamily>>;

  private isAlive = true;
  private isInit = false;

  private posSub?: Subscription;
  private gsSub?: Subscription;
  private trackSub?: Subscription;
  private magVarSub?: Subscription;
  private receiverStateSub?: Subscription;
  private systemStateSub?: Subscription;
  private sbasStateSub?: Subscription;
  private satPosCalculatedSub?: Subscription;
  private satStateSub?: Subscription;
  private pdopSub?: Subscription;
  private hdopSub?: Subscription;
  private vdopSub?: Subscription;

  /**
   * Creates an instance of the GpsDataProvider.
   * @param bus The event bus to use with this instance.
   * @param index The GPS system index that this provider will track.
   */
  constructor(private readonly bus: EventBus, public readonly index: number) {
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @throws Error if this data provider is dead.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('GpsStatusDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & GNSSEvents & GpsReceiverSystemEvents>();

    this.posSub = sub.on('gps-position').handle(lla => {
      this._position.set(lla.lat, lla.long);
      this._altitude.set(lla.alt);
    }, true);
    this.gsSub = sub.on('ground_speed').handle(gs => {
      this._groundSpeed.set(gs);
    }, true);
    this.trackSub = sub.on('track_deg_true').handle(track => {
      this._groundTrack.set(track);
    }, true);
    this.magVarSub = sub.on('magvar').handle(magVar => {
      this._groundTrack.set(this._groundTrack.get().number, magVar);
    }, true);

    this._time.setConsumer(sub.on('simTime'));

    this.receiverStateSub = sub.on(`gps_rec_state_${this.index}`).handle(s => this._receiverState.set(s.current));
    this.systemStateSub = sub.on(`gps_rec_gps_system_state_changed_${this.index}`).handle(s => {
      this._systemState.set(s);
      if (s === GPSSystemState.SolutionAcquired || s === GPSSystemState.DiffSolutionAcquired) {
        this.posSub!.resume(true);
        this.gsSub!.resume(true);
        this.trackSub!.resume(true);
        this.magVarSub!.resume(true);
      } else {
        this.posSub!.pause();
        this.gsSub!.pause();
        this.trackSub!.pause();
        this._position.set(NaN, NaN);
        this._altitude.set(NaN);
        this._groundSpeed.set(NaN);
        this._groundTrack.set(NaN);
      }
    });

    this.sbasStateSub = sub.on(`gps_rec_gps_system_sbas_state_changed_${this.index}`).handle(s => this._sbasState.set(s));
    this.satPosCalculatedSub = sub.on(`gps_rec_gps_sat_pos_calculated_${this.index}`).handle(() => this._positionsCalculated.notify(this));
    this.satStateSub = sub.on(`gps_rec_gps_sat_state_changed_${this.index}`).handle(this.onSatStateChanged.bind(this));

    this.pdopSub = sub.on(`gps_rec_gps_system_pdop_${this.index}`).handle(p => this._pdop.set(p <= 0 ? NaN : p));
    this.hdopSub = sub.on(`gps_rec_gps_system_hdop_${this.index}`).handle(p => this._hdop.set(p <= 0 ? NaN : p));
    this.vdopSub = sub.on(`gps_rec_gps_system_vdop_${this.index}`).handle(p => this._vdop.set(p <= 0 ? NaN : p));
  }

  /**
   * A handler that runs when the state of a satellite changes.
   * @param sat The satellite that changed state.
   */
  private onSatStateChanged(sat: GPSSatellite): void {
    const satState = sat.state.get();
    if (satState === GPSSatelliteState.None || satState === GPSSatelliteState.Unreachable) {
      const index = this.activeSatellites.getArray().findIndex(s => s.sat.prn === sat.prn);
      if (index !== -1) {
        this._activeSatellites.removeAt(index);
      }
    } else {
      const index = this.activeSatellites.getArray().findIndex(s => s.sat.prn === sat.prn);
      if (index === -1) {
        this._activeSatellites.insert(new GpsSatelliteData(sat));
      }
    }

    let inUseSatellites = 0;
    this._activeSatellites
      .getArray()
      .forEach(s => (s.sat.state.get() === GPSSatelliteState.InUse || s.sat.state.get() === GPSSatelliteState.InUseDiffApplied) && inUseSatellites++);

    this._numInUseSatellites.set(inUseSatellites);
  }

  /**
   * Destroys the data provider.
   */
  public destroy(): void {
    this.isAlive = false;

    this._time.destroy();

    this.receiverStateSub?.destroy();
    this.systemStateSub?.destroy();
    this.sbasStateSub?.destroy();
    this.satPosCalculatedSub?.destroy();
    this.satStateSub?.destroy();
    this.pdopSub?.destroy();
    this.hdopSub?.destroy();
    this.vdopSub?.destroy();

    this.posSub?.destroy();
    this.gsSub?.destroy();
    this.trackSub?.destroy();
    this.magVarSub?.destroy();
  }
}