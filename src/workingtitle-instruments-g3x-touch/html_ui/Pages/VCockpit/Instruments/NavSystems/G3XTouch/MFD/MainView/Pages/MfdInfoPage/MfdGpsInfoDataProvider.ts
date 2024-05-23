import {
  ArraySubject, BasicNavAngleSubject, BasicNavAngleUnit, ClockEvents, ConsumerSubject, EventBus,
  GeoPoint, GeoPointInterface, GeoPointSubject, GNSSEvents, GPSSatComputer, GPSSatellite, GPSSatelliteState, GPSSystemSBASState,
  GPSSystemState, NavAngleUnitFamily, NumberUnitInterface, NumberUnitSubject, Subject,
  Subscribable, SubscribableArray, SubscribableUtils, Subscription, UnitFamily, UnitType
} from '@microsoft/msfs-sdk';

import { FmsPositionSystemEvents, GpsReceiverSystemEvents } from '@microsoft/msfs-garminsdk';

/**
 * A data item that describes the satellite tracked by a single GPS receiver channel.
 */
export interface GpsInfoChannelData {
  /** The satellite tracked by this item's channel, or `null` if the channel is not tracking a satellite. */
  readonly satellite: GPSSatellite | null;
}

/**
 * A provider of status information for a GDU's selected GPS system.
 */
export class MfdGpsInfoDataProvider {

  /** UERE in meters */
  private readonly UERE = 3.23;

  private readonly _gpsIndex = Subject.create(0);
  /** The index of the GDU's selected GPS system. */
  public readonly gpsIndex = this._gpsIndex as Subscribable<number>;

  private readonly _channelCount = Subject.create(0);
  /** The total number of channels supported by the GDU's selected GPS system. */
  public readonly channelCount = this._channelCount as Subscribable<number>;

  private readonly _systemState = Subject.create(GPSSystemState.Searching);
  /** The state of the GDU's selected GPS system. */
  public readonly systemState = this._systemState as Subscribable<GPSSystemState>;

  private readonly _sbasState = Subject.create(GPSSystemSBASState.Inactive);
  /** The SBAS state of the GDU's selected GPS system. */
  public readonly sbasState = this._sbasState as Subscribable<GPSSystemSBASState>;

  private readonly _channelArray = ArraySubject.create<GpsInfoChannelDataClass>();
  /**
   * An array of data items describing the satellites tracked by each of the selected GPS system's receiver channels.
   * The items are presented in no particular order.
   */
  public readonly channelArray = this._channelArray as SubscribableArray<GpsInfoChannelData>;

  private readonly _pdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The PDOP value of the GDU's selected GPS system's position solution, or `NaN` if a position solution is not available. */
  public readonly pdop = this._pdop as Subscribable<number>;

  public readonly accuracy = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly _hdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The HDOP value of the GDU's selected GPS system's position solution, or `NaN` if a position solution is not available. */
  public readonly hdop = this._hdop as Subscribable<number>;

  private readonly _vdop = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);
  /** The VDOP value of the GDU's selected GPS system's position solution, or `NaN` if a position solution is not available. */
  public readonly vdop = this._vdop as Subscribable<number>;

  private readonly _position = GeoPointSubject.create(new GeoPoint(NaN, NaN));
  /**
   * The latitude/longitude of the the GDU's selected GPS system's position solution. Latitude/longitude values will be
   * equal to `NaN` if a position solution is not available.
   */
  public readonly position = this._position as Subscribable<GeoPointInterface>;

  private readonly _altitude = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  /**
   * The geometric altitude of the the GDU's selected GPS system's position solution, or `NaN` if a position solution
   * is not available.
   */
  public readonly altitude = this._altitude as Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  private readonly _groundSpeed = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  /**
   * The ground speed of the the GDU's selected GPS system's position solution, or `NaN` if a position solution
   * is not available.
   */
  public readonly groundSpeed = this._groundSpeed as Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  private readonly _groundTrack = BasicNavAngleSubject.create(BasicNavAngleUnit.create(false).createNumber(NaN));
  /**
   * The ground track of the the GDU's selected GPS system's position solution, or `NaN` if a position solution
   * is not available.
   */
  public readonly groundTrack = this._groundTrack as Subscribable<NumberUnitInterface<NavAngleUnitFamily>>;

  private readonly _time = ConsumerSubject.create(null, 0).pause();
  /** The current time, as a Javascript timestamp. */
  public readonly time = this._time as Subscribable<number>;

  private readonly gpsSatComputers: (GPSSatComputer | undefined)[];

  private gpsIndexSub: Subscription | undefined;
  private readonly gpsSystemSubs: Subscription[] = [];

  private isAlive = true;
  private isInit = false;
  private isPaused = true;

  private posSub?: Subscription;
  private gsSub?: Subscription;
  private trackSub?: Subscription;
  private magVarSub?: Subscription;
  private satPosCalculatedSub?: Subscription;

  /**
   * Creates a new instance of MfdGpsInfoDataProvider.
   * @param bus The event bus to use with this instance.
   * @param gduIndex The index of the GDU associated with this data provider.
   * @param gpsSatComputers An array of the GPS computers used by the GPS receiver systems connected to the G3X Touch,
   * indexed by GPS receiver system index.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly gduIndex: number,
    gpsSatComputers: readonly (GPSSatComputer | undefined)[]
  ) {
    this.gpsSatComputers = Array.from(gpsSatComputers);
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('MfdGpsInfoDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<ClockEvents & GNSSEvents & GpsReceiverSystemEvents & FmsPositionSystemEvents>();

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

    /**
     * Calculates GPS position accuracy.
     *
     * Formula: SE = UERE * DOP
     * - SE (Standard Error) indicates GPS position accuracy.
     * - UERE (User Equivalent Range Error) is the receiver's intrinsic error, which includes satellite, atmospheric,
     * and receiver errors.
     * - DOP (Dilution of Precision) reflects satellite geometry quality.
     *
     * A 95% confidence interval for GPS accuracy is calculated as 1.96 * SE.
     * To convert SE from meters to feet (for Imperial system applications),
     * multiply by 3.28084 (1 meter ≈ 3.28084 feet).
     */
    this.hdop.sub(hdop => this.accuracy.set(hdop * 1.96 * this.UERE, UnitType.METER));

    this.gpsIndexSub = sub.on(`fms_pos_gps_index_${this.gduIndex}`).handle(this.onGpsIndexChanged.bind(this), true);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('MfdGpsInfoDataProvider: cannot resume a dead provider');
    }

    if (!this.isInit || !this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._time.resume();
    this.gpsIndexSub!.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('MfdGpsInfoDataProvider: cannot pause a dead provider');
    }

    if (!this.isInit || this.isPaused) {
      return;
    }

    this.isPaused = true;

    this._time.pause();
    this.gpsIndexSub!.pause();
    this.posSub!.pause();
    this.gsSub!.pause();
    this.trackSub!.pause();

    for (const sub of this.gpsSystemSubs) {
      sub.pause();
    }
  }

  /**
   * Responds to when the index of the selected GPS system changes.
   * @param index The index of the new selected GPS system.
   */
  private onGpsIndexChanged(index: number): void {
    this._gpsIndex.set(index);

    for (const sub of this.gpsSystemSubs) {
      sub.destroy();
    }
    this.gpsSystemSubs.length = 0;

    this.posSub!.pause();
    this.gsSub!.pause();
    this.trackSub!.pause();
    this._position.set(NaN, NaN);
    this._altitude.set(NaN);
    this._groundSpeed.set(NaN);
    this._groundTrack.set(NaN);

    this._channelArray.clear();
    this._channelCount.set(0);
    this._systemState.set(GPSSystemState.Searching);
    this._sbasState.set(GPSSystemSBASState.Inactive);
    this._pdop.set(NaN);
    this._hdop.set(NaN);
    this._vdop.set(NaN);

    const gpsSatComputer = this.gpsSatComputers[index];
    if (!gpsSatComputer) {
      return;
    }

    this.initChannelsFromGpsSystem(gpsSatComputer);

    const sub = this.bus.getSubscriber<GpsReceiverSystemEvents>();

    this.gpsSystemSubs.push(
      sub.on(`gps_rec_gps_system_state_changed_${index}`).handle(this.onGpsSystemStateChanged.bind(this)),
      sub.on(`gps_rec_gps_system_sbas_state_changed_${index}`).handle(this._sbasState.set.bind(this._sbasState)),
      sub.on(`gps_rec_gps_sat_state_changed_${index}`).handle(this.onSatStateChanged.bind(this)),
      sub.on(`gps_rec_gps_system_pdop_${index}`).handle(pdop => this._pdop.set(pdop <= 0 ? NaN : pdop)),
      sub.on(`gps_rec_gps_system_hdop_${index}`).handle(hdop => this._hdop.set(hdop <= 0 ? NaN : hdop)),
      sub.on(`gps_rec_gps_system_vdop_${index}`).handle(vdop => this._vdop.set(vdop <= 0 ? NaN : vdop))
    );
  }

  /**
   * Initializes this provider's channel array from a GPS system.
   * @param gpsSatComputer The GPS computer used by the GPS system from which to initialize the channel array.
   */
  private initChannelsFromGpsSystem(gpsSatComputer: GPSSatComputer): void {
    this._channelCount.set(gpsSatComputer.nominalChannelCount ?? 15);

    this._channelArray.clear();

    const satellites = gpsSatComputer.sats;
    for (let i = 0; i < satellites.length; i++) {
      const sat = satellites[i];
      const state = sat.state.get();
      if (state !== GPSSatelliteState.None && state !== GPSSatelliteState.Unreachable) {
        this._channelArray.insert(new GpsInfoChannelDataClass(sat));
      }
    }

    this.reconcileChannelArrayLength();
  }

  /**
   * Responds to when the state of the selected GPS system changes.
   * @param state The new state of the selected GPS system.
   */
  private onGpsSystemStateChanged(state: GPSSystemState): void {
    this._systemState.set(state);
    if (state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired) {
      this.posSub?.resume(true);
      this.gsSub?.resume(true);
      this.trackSub?.resume(true);
      this.magVarSub?.resume(true);
    } else {
      this.posSub?.pause();
      this.gsSub?.pause();
      this.trackSub?.pause();
      this._position.set(NaN, NaN);
      this._altitude.set(NaN);
      this._groundSpeed.set(NaN);
      this._groundTrack.set(NaN);
    }
  }

  /**
   * Responds to when the state of a GPS satellite changes.
   * @param sat The satellite that changed state.
   */
  private onSatStateChanged(sat: GPSSatellite): void {
    const channelArray = this._channelArray.getArray();

    const satState = sat.state.get();
    if (satState === GPSSatelliteState.None || satState === GPSSatelliteState.Unreachable) {
      const index = channelArray.findIndex(s => s.satellite?.prn === sat.prn);
      if (index >= 0) {
        this._channelArray.removeAt(index);
      }
    } else {
      const index = channelArray.findIndex(s => s.satellite?.prn === sat.prn);
      if (index < 0) {
        this._channelArray.insert(new GpsInfoChannelDataClass(sat));
      }
    }

    this.reconcileChannelArrayLength();
  }

  /**
   * Adds or removes data items from this provider's channel array
   */
  private reconcileChannelArrayLength(): void {
    const channelCount = this._channelCount.get();

    if (this._channelArray.length > channelCount) {
      // Remove extra null channel data items until the array length equals the channel count.
      for (let i = this._channelArray.length - 1; i >= 0 && this._channelArray.length > channelCount; i--) {
        if (this._channelArray.get(i).satellite === null) {
          this._channelArray.removeAt(i);
        }
      }
    } else {
      // Add null channel data items until the array length equals the channel count.
      for (let i = this._channelArray.length; i < channelCount; i++) {
        this._channelArray.insert(new GpsInfoChannelDataClass(null));
      }
    }
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.isAlive = false;

    this._time.destroy();

    this.satPosCalculatedSub?.destroy();
    this.posSub?.destroy();
    this.gsSub?.destroy();
    this.trackSub?.destroy();
    this.magVarSub?.destroy();
    this.gpsIndexSub?.destroy();

    this.gpsSystemSubs.forEach(s => s.destroy());
  }
}

/**
 * An implementation of {@link GpsInfoChannelData} used by {@link MfdGpsInfoDataProvider}.
 */
class GpsInfoChannelDataClass implements GpsInfoChannelData {
  /**
   * Creates a new instance of GpsInfoChannelDataClass.
   * @param satellite The satellite tracked by this item's channel, or `null` if the channel is not tracking a
   * satellite.
   */
  public constructor(public readonly satellite: GPSSatellite | null) {
  }
}