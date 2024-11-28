import { EventBus, IndexedEventType } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { LatLonInterface } from '../geo/GeoInterfaces';
import { GeoPoint } from '../geo/GeoPoint';
import { MathUtils } from '../math/MathUtils';
import { UnitType } from '../math/NumberUnit';
import { ReadonlyFloat64Array, Vec2Math, Vec3Math, VecNMath } from '../math/VecMath';
import { Vec2Subject, Vec3Subject } from '../math/VectorSubject';
import { Accessible } from '../sub/Accessible';
import { SetSubject } from '../sub/SetSubject';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { SubscribableSet } from '../sub/SubscribableSet';
import { SubscribableUtils } from '../sub/SubscribableUtils';
import { Value } from '../sub/Value';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { Instrument } from './Backplane';
import { ClockEvents } from './Clock';
import { GNSSEvents } from './GNSS';

/**
 * SBAS group names.
 */
export enum SBASGroupName {
  /** Wide Area Augmentation System (USA). */
  WAAS = 'WAAS',

  /** European Geostationary Navigation Overlay Service (EU). */
  EGNOS = 'EGNOS',

  /** GPS Aided Geo Augmented Navigation System (India). */
  GAGAN = 'GAGAN',

  /** Multi-functional Satellite Augmentation System (Japan). */
  MSAS = 'MSAS'
}

/**
 * A definition of a SBAS geostationary satellite.
 */
interface SBASSatelliteDefinition {
  /** The PRN of the satellite. */
  prn: number;

  /** The satellite longitude. */
  lon: number;
}

/**
 * A definition of a SBAS differential corrections area group.
 */
interface SBASGroupDefinition {
  /** The SBAS satellite group that this definition is for. */
  group: string;

  /** The SBAS differential coverage area for the SBAS group. */
  coverage: ReadonlyFloat64Array[];

  /** The constellation of satellites in this SBAS group. */
  constellation: SBASSatelliteDefinition[];
}

/**
 * Possible state on GPS satellites.
 */
export enum GPSSatelliteState {
  /** There is no current valid state. */
  None,

  /** The satellite is out of view and cannot be reached. */
  Unreachable,

  /** The satellite has been found and data is being downloaded. */
  Acquired,

  /** The satellite is faulty. */
  Faulty,

  /** The satellite has been found, data is downloaded, but is not presently used in the GPS solution. */
  DataCollected,

  /** The satellite is being active used in the GPS solution. */
  InUse,

  /** The satellite is being active used in the GPS solution and SBAS differential corrections are being applied. */
  InUseDiffApplied
}

/**
 * Possible {@link GPSSatComputer} states.
 */
export enum GPSSystemState {
  /** The GPS receiver is searching for any visible satellites to acquire. */
  Searching = 'Searching',

  /** The GPS receiver is in the process of acquiring satellites. */
  Acquiring = 'Acquiring',

  /** A 3D solution has been acquired. */
  SolutionAcquired = 'SolutionAcquired',

  /** A 3D solution using differential computations has been acquired. */
  DiffSolutionAcquired = 'DiffSolutionAcquired'
}

/**
 * Possible SBAS connection states.
 */
export enum GPSSystemSBASState {
  /** SBAS is disabled. */
  Disabled = 'Disabled',

  /** SBAS is enabled but not receiving differential corrections. */
  Inactive = 'Inactive',

  /** SBAS is enabled and is receiving differential corrections. */
  Active = 'Active'
}

/**
 * Data used to sync receiver channel state from primary to replica GPS satellite systems.
 */
type GPSChannelStateSyncData = {
  /** The index of the channel. */
  index: number;

  /** The PRN of the satellite assigned to the channel, or `null` if no satellite is assigned to the channel. */
  prn: number | null;
}

/**
 * Data used to sync satellite state from primary to replica GPS satellite systems.
 */
type GPSSatStateSyncData = {
  /** The PRN of the satellite. */
  prn: number;

  /** The state of the satellite. */
  state: GPSSatelliteState;

  /** Whether differential corrections have been downloaded from the satellite. */
  areDiffCorrectionsDownloaded: boolean;
}

/**
 * Data used to sync the entire {@link GPSSatComputer} state from primary to replica GPS satellite systems.
 */
type GPSStateSyncData = {
  /** The states of the computer's receiver channels. */
  channels: readonly Readonly<GPSChannelStateSyncData>[];

  /** The states of the satellites. */
  satStates: readonly Readonly<GPSSatStateSyncData>[];

  /** The names of the SBAS satellite groups for which signal reception is enabled. */
  enabledSbasGroups: readonly string[];
};

/**
 * Events used to sync state between GPSSatComputer instances.
 */
interface GPSSatComputerSyncEvents {
  /** A primary GPS satellite system has recalculated the positions of its satellites. */
  [gps_system_sync_channel_state_changed: IndexedEventType<'gps_system_sync_channel_state_changed'>]: Readonly<GPSChannelStateSyncData>;

  /** A primary GPS satellite system has recalculated the positions of its satellites. */
  [gps_system_sync_sat_calc: IndexedEventType<'gps_system_sync_sat_calc'>]: void;

  /** A primary GPS satellite system has changed the state of one of its satellites. */
  [gps_system_sync_sat_state_changed: IndexedEventType<'gps_system_sync_sat_state_changed'>]: Readonly<GPSSatStateSyncData>;

  /** A primary GPS satellite system has changed its enabled SBAS groups. */
  [gps_system_sync_enabled_sbas_changed: IndexedEventType<'gps_system_sync_enabled_sbas_changed'>]: readonly string[];

  /** A primary GPS satellite system has been reset. */
  [gps_system_sync_reset: IndexedEventType<'gps_system_sync_reset'>]: void;

  /** A full satellite state record has been requested from a replica GPS satellite system. */
  [gps_system_sync_state_request: IndexedEventType<'gps_system_sync_state_request'>]: void;

  /** A response by a primary GPS satellite system to a full satellite state record request. */
  [gps_system_sync_state_response: IndexedEventType<'gps_system_sync_state_response'>]: Readonly<GPSStateSyncData>;
}

/**
 * Events published by the GPSSatComputer system.
 */
export interface GPSSatComputerEvents {
  /** An event published when a GPS satellite changes state. */
  [gps_sat_state_changed: IndexedEventType<'gps_sat_state_changed'>]: GPSSatellite;

  /**
   * The nominal total number of receiver channels supported by the GPS system, or `null` if the system supports an
   * unlimited number of channels.
   */
  [gps_system_nominal_channel_count: IndexedEventType<'gps_system_nominal_channel_count'>]: number | null;

  /** An event published when the GPS satellite system changes state. */
  [gps_system_state_changed: IndexedEventType<'gps_system_state_changed'>]: GPSSystemState;

  /** An event published when the GPS satellite positions have been updated. */
  [gps_sat_pos_calculated: IndexedEventType<'gps_sat_pos_calculated'>]: void;

  /** An event published when the GPS system SBAS state changes. */
  [gps_system_sbas_state_changed: IndexedEventType<'gps_system_sbas_state_changed'>]: GPSSystemSBASState;

  /**
   * The current position dilution of precision (PDOP) calculated by the GPS system, or `-1` if this system has not
   * acquired a position solution.
   */
  [gps_system_pdop: IndexedEventType<'gps_system_pdop'>]: number;

  /**
   * The current horizontal dilution of precision (HDOP) calculated by the GPS system, or `-1` if this system has not
   * acquired a position solution.
   */
  [gps_system_hdop: IndexedEventType<'gps_system_hdop'>]: number;

  /**
   * The current horizontal dilution of precision (VDOP) calculated by the GPS system, or `-1` if this system has not
   * acquired a position solution.
   */
  [gps_system_vdop: IndexedEventType<'gps_system_vdop'>]: number;
}

/**
 * Options describing the timings of {@link GPSSatellite} state changes.
 */
export type GPSSatelliteTimingOptions = {
  /**
   * The amount of elapsed time (bidirectional) required for a downloaded almanac to expire, in milliseconds. Defaults
   * to `7776000000` (90 days).
   */
  almanacExpireTime?: number;

  /**
   * The amount of elapsed time (bidirectional) required for ephemeris data to expire, in milliseconds. Defaults to
   * `7200000` (2 hours).
   */
  ephemerisExpireTime?: number;

  /**
   * The amount of time spent searching for a satellite signal, in milliseconds, before the satellite is declared
   * unreachable. Defaults to `60000`.
   */
  acquisitionTimeout?: number;

  /**
   * The average time required to acquire a satellite signal without valid ephemeris data, in milliseconds. Defaults to
   * `30000`.
   */
  acquisitionTime?: number;

  /**
   * The difference between the maximum and minimum time required to acquire a satellite signal without valid ephemeris
   * data, in milliseconds. The range is centered on the average (`acquisitionTime`). Defaults to `15000`.
   */
  acquisitionTimeRange?: number;

  /**
   * The average time required to acquire a satellite signal with valid ephemeris data, in milliseconds. Defaults to
   * `15000`.
   */
  acquisitionTimeWithEphemeris?: number;

  /**
   * The difference between the maximum and minimum time required to acquire a satellite signal with valid ephemeris
   * data, in milliseconds. The range is centered on the average (`acquisitionTimeWithEphemeris`). Defaults to `5000`.
   */
  acquisitionTimeRangeWithEphemeris?: number;

  /**
   * The amount of elapsed time (bidirectional), in milliseconds, required for a satellite that was previously declared
   * unreachable to be considered eligible for tracking again. Defaults to `3600000` (1 hour).
   */
  unreachableExpireTime?: number;

  /** The time required to download ephemeris data from a non-SBAS satellite, in milliseconds. Defaults to `30000`. */
  ephemerisDownloadTime?: number;

  /**
   * The time required to download a complete almanac from a non-SBAS satellite, in milliseconds. Defaults to `750000`
   * (12.5 minutes).
   */
  almanacDownloadTime?: number;

  /**
   * The average time required to download ephemeris data from an SBAS satellite, in milliseconds. Defaults to
   * `60500`.
   */
  sbasEphemerisDownloadTime?: number;

  /**
   * The difference between the maximum and minimum time required to download ephemeris data from an SBAS satellite,
   * in milliseconds. The range is centered on the average (`sbasEphemerisDownloadTime`). Defaults to `59500`.
   */
  sbasEphemerisDownloadTimeRange?: number;

  /**
   * The average time required to download differential correction data from an SBAS satellite, in milliseconds.
   * Defaults to `150500`.
   */
  sbasCorrectionDownloadTime?: number;

  /**
   * The difference between the maximum and minimum time required to download differential correction data from an SBAS
   * satellite, in milliseconds. The range is centered on the average (`sbasCorrectionDownloadTime`). Defaults to
   * `149500`.
   */
  sbasCorrectionDownloadTimeRange?: number;
};

/**
 * Options for {@link GPSSatComputer}.
 */
export type GPSSatComputerOptions = {
  /**
   * The number of receiver channels supported by the computer. The computer can acquire and track one satellite per
   * channel. Must be greater than or equal to `4`. Defaults to the total number of satellites.
   */
  channelCount?: number;

  /**
   * The maximum number of satellites to use for position solution calculations. Must be greater than or equal to `4`.
   * Defaults to `Infinity`.
   */
  satInUseMaxCount?: number | Subscribable<number>;

  /**
   * The maximum PDOP to target when selecting satellites to use for position solution calculations. Additional
   * satellites will be selected while PDOP is greater than the target or the number of selected satellites is less
   * than the optimum count (`satInUseOptimumCount`). Values less than or equal to zero will cause all possible
   * satellites to be selected up to the maximum count (`satInUseMaxCount`). Defaults to `-1`.
   */
  satInUsePdopTarget?: number | Subscribable<number>;

  /**
   * The optimum number of satellites to use for position solution calculations when targeting a maximum PDOP value.
   * Must be greater than or equal to `4`. Additional satellites will be selected while PDOP is greater than the target
   * (`satInUsePdopTarget`) or the number of selected satellites is less than the optimum count. Defaults to `4`.
   */
  satInUseOptimumCount?: number | Subscribable<number>;

  /** Options with which to configure the timings of satellite state changes. */
  timingOptions?: Readonly<GPSSatelliteTimingOptions>;
};

/**
 * An instrument that computes GPS satellite information.
 */
export class GPSSatComputer implements Instrument {
  private readonly publisher = this.bus.getPublisher<GPSSatComputerEvents>();
  private readonly syncPublisher = this.bus.getPublisher<GPSSatComputerSyncEvents>();

  private readonly nominalChannelCountTopic = `gps_system_nominal_channel_count_${this.index}` as const;
  private readonly stateChangedTopic = `gps_system_state_changed_${this.index}` as const;
  private readonly satStateChangedTopic = `gps_sat_state_changed_${this.index}` as const;
  private readonly satPosCalcTopic = `gps_sat_pos_calculated_${this.index}` as const;

  private readonly sbasStateChangedTopic = `gps_system_sbas_state_changed_${this.index}` as const;

  private readonly pdopTopic = `gps_system_pdop_${this.index}` as const;
  private readonly hdopTopic = `gps_system_hdop_${this.index}` as const;
  private readonly vdopTopic = `gps_system_vdop_${this.index}` as const;

  private readonly channelStateSyncTopic = `gps_system_sync_channel_state_changed_${this.index}` as const;
  private readonly satCalcSyncTopic = `gps_system_sync_sat_calc_${this.index}` as const;
  private readonly satStateSyncTopic = `gps_system_sync_sat_state_changed_${this.index}` as const;
  private readonly enabledSbasSyncTopic = `gps_system_sync_enabled_sbas_changed_${this.index}` as const;
  private readonly resetSyncTopic = `gps_system_sync_reset_${this.index}` as const;
  private readonly stateRequestSyncTopic = `gps_system_sync_state_request_${this.index}` as const;
  private readonly stateResponseSyncTopic = `gps_system_sync_state_response_${this.index}` as const;

  private ephemerisData: GPSEphemerisRecords = {};
  private sbasData: SBASGroupDefinition[] = [];
  private readonly sbasServiceAreas = new Map<string, ReadonlyFloat64Array[]>();
  private readonly currentAvailableSbasGroups = new Set<string>();

  private readonly satellites: GPSSatellite[] = [];
  private readonly publishedSatStates: GPSSatStateSyncData[] = [];

  private readonly channels: (GPSSatellite | null)[] = [];

  private readonly ppos = new GeoPoint(0, 0);
  private readonly pposVec = new Float64Array(2);

  private readonly lastKnownPosition = new GeoPoint(NaN, NaN);
  private distanceFromLastKnownPos = 0;

  private altitude = 0;
  private simTime = 0;
  private previousSimTime = 0;
  private lastUpdateTime: number | undefined = undefined;

  private _state = GPSSystemState.Searching;
  private _sbasState = GPSSystemSBASState.Disabled;

  private readonly enabledSBASGroupsSet?: Set<string>;
  private readonly enabledSBASGroups: Accessible<ReadonlySet<string>>;

  private readonly dops = Vec3Math.create();
  private _pdop = -1;
  private _hdop = -1;
  private _vdop = -1;

  private isInit = false;
  private needAcquireAndUse = false;

  private needSatCalc = false;
  private readonly pendingChannelStateUpdates = new Map<number, Readonly<GPSChannelStateSyncData>>();
  private readonly pendingSatStateUpdates = new Map<number, Readonly<GPSSatStateSyncData>>();

  private almanacProgress = 0;
  private lastAlamanacTime: number | undefined = undefined;
  private _isAlmanacValid = false;

  /**
   * The nominal total number of receiver channels supported by this computer, or `null` if this computer supports an
   * unlimited number of channels.
   */
  public readonly nominalChannelCount: number | null;

  private _channelCount: number;
  private readonly satInUseMaxCount: Subscribable<number>;
  private readonly satInUsePdopTarget: Subscribable<number>;
  private readonly satInUseOptimumCount: Subscribable<number>;

  private readonly satelliteTimingOptions: Required<GPSSatelliteTimingOptions>;

  /**
   * Gets the current satellites that are being tracked by this computer.
   * @returns The collection of current satellites.
   */
  public get sats(): readonly GPSSatellite[] {
    return this.satellites;
  }

  /**
   * Gets the current GPS system state.
   * @returns The current GPS system state.
   */
  public get state(): GPSSystemState {
    return this._state;
  }

  /**
   * Gets the current GPS system SBAS state.
   * @returns The current GPS system SBAS state.
   */
  public get sbasState(): GPSSystemSBASState {
    return this._sbasState;
  }

  /**
   * Gets this system's current position dilution of precision value (PDOP), or `-1` if this system has not acquired a
   * position solution.
   * @returns This system's current position dilution of precision value (PDOP), or `-1` if this system has not
   * acquired a position solution.
   */
  public get pdop(): number {
    return this._pdop;
  }

  /**
   * Gets this system's current horizontal dilution of precision value (HDOP), or `-1` if this system has not acquired a
   * position solution.
   * @returns This system's current horizontal dilution of precision value (HDOP), or `-1` if this system has not
   * acquired a position solution.
   */
  public get hdop(): number {
    return this._hdop;
  }

  /**
   * Gets this system's current vertical dilution of precision value (VDOP), or `-1` if this system has not acquired a
   * position solution.
   * @returns This system's current vertical dilution of precision value (VDOP), or `-1` if this system has not
   * acquired a position solution.
   */
  public get vdop(): number {
    return this._vdop;
  }

  /**
   * Creates an instance of GPSSatComputer.
   * @param index The index of this computer.
   * @param bus An instance of the event bus.
   * @param ephemerisFile The HTTP path to the ephemeris file to use for computations.
   * @param sbasFile The HTTP path to the SBAS definitions file.
   * @param updateInterval The interval in milliseconds to update the satellite positions.
   * @param enabledSBASGroups The names of the SBAS satellite groups for which signal reception is enabled. If the
   * computer's sync role is `replica`, then this parameter is ignored and the computer will sync enabled SBAS groups
   * from the primary instance.
   * @param syncRole This computer's sync role. A `primary` computer will broadcast sync events through the event bus
   * that allow corresponding `replica` computers to sync their state with the primary. A computer with a sync role of
   * `none` neither broadcasts sync events nor receives them; it maintains its own independent state. Defaults to
   * `none`.
   * @param options Options with which to configure the computer.
   */
  constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly ephemerisFile: string,
    private readonly sbasFile: string,
    private readonly updateInterval: number,
    enabledSBASGroups: Iterable<string> | SubscribableSet<string> | undefined,
    public readonly syncRole: 'primary' | 'replica' | 'none' = 'none',
    options?: Readonly<GPSSatComputerOptions>
  ) {
    const desiredChannelCount = Math.max(options?.channelCount ?? Infinity, 4);
    this.nominalChannelCount = isFinite(desiredChannelCount) ? desiredChannelCount : null;
    this._channelCount = desiredChannelCount;

    this.satInUseMaxCount = SubscribableUtils.toSubscribable(options?.satInUseMaxCount ?? Infinity, true);
    this.satInUsePdopTarget = SubscribableUtils.toSubscribable(options?.satInUsePdopTarget ?? -1, true);
    this.satInUseOptimumCount = SubscribableUtils.toSubscribable(options?.satInUseOptimumCount ?? 4, true);

    this.satelliteTimingOptions = { ...options?.timingOptions } as Required<GPSSatelliteTimingOptions>;
    this.satelliteTimingOptions.almanacExpireTime ??= 7776000000;
    this.satelliteTimingOptions.ephemerisExpireTime ??= 7200000;
    this.satelliteTimingOptions.acquisitionTimeout ??= 30000;
    this.satelliteTimingOptions.acquisitionTime ??= 30000;
    this.satelliteTimingOptions.acquisitionTimeRange ??= 15000;
    this.satelliteTimingOptions.acquisitionTimeWithEphemeris ??= 15000;
    this.satelliteTimingOptions.acquisitionTimeRangeWithEphemeris ??= 5000;
    this.satelliteTimingOptions.unreachableExpireTime ??= 3600000;
    this.satelliteTimingOptions.ephemerisDownloadTime ??= 30000;
    this.satelliteTimingOptions.almanacDownloadTime ??= 750000;
    this.satelliteTimingOptions.sbasEphemerisDownloadTime ??= 60500;
    this.satelliteTimingOptions.sbasEphemerisDownloadTimeRange ??= 59500;
    this.satelliteTimingOptions.sbasCorrectionDownloadTime ??= 150500;
    this.satelliteTimingOptions.sbasCorrectionDownloadTimeRange ??= 149500;

    if (syncRole === 'replica') {
      this.enabledSBASGroups = Value.create(this.enabledSBASGroupsSet = new Set<string>());
    } else {
      this.enabledSBASGroups = enabledSBASGroups !== undefined && 'isSubscribableSet' in enabledSBASGroups
        ? enabledSBASGroups
        : SetSubject.create(enabledSBASGroups);
    }

    // Initialize these properties directly from SimVars in case the computer is created before values are published
    // to the bus.
    this.ppos.set(
      SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree),
      SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree)
    );
    this.altitude = SimVar.GetSimVarValue('PLANE ALTITUDE', SimVarValueType.Meters);
    this.simTime = (SimVar.GetSimVarValue('E:ABSOLUTE TIME', SimVarValueType.Seconds) - 62135596800) * 1000;

    this.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(pos => {
      this.ppos.set(pos.lat, pos.long);
      Vec2Math.set(pos.lat, pos.long, this.pposVec);

      this.altitude = pos.alt;
    });

    this.bus.getSubscriber<ClockEvents>().on('simTime').handle(time => this.simTime = time);
  }

  /**
   * Adds the defined SBAS satellites to the tracked satellites.
   */
  private addSbasSatellites(): void {
    const tempVec = new Float64Array(3);
    const tempGeoPoint = new GeoPoint(0, 0);
    const orbitHeight = UnitType.KILOMETER.convertTo(35785, UnitType.GA_RADIAN);

    for (let i = 0; i < this.sbasData.length; i++) {
      const sbasDef = this.sbasData[i];
      this.sbasServiceAreas.set(sbasDef.group, sbasDef.coverage);

      for (const satDef of sbasDef.constellation) {
        const sat = new GPSSatellite(satDef.prn, sbasDef.group, undefined, this.satelliteTimingOptions);

        tempGeoPoint.set(0, satDef.lon);
        const positionCartesian = Vec3Math.multScalar(tempGeoPoint.toCartesian(tempVec), orbitHeight, tempVec);
        sat.positionCartesian.set(positionCartesian);

        this.satellites.push(sat);
      }
    }
  }

  /** @inheritdoc */
  public init(): void {
    // Publish initial state.
    this.publisher.pub(this.nominalChannelCountTopic, this.nominalChannelCount, false, true);
    this.publisher.pub(this.stateChangedTopic, this._state, false, true);
    this.publisher.pub(this.sbasStateChangedTopic, this._sbasState, false, true);
    this.publisher.pub(this.pdopTopic, this._pdop, false, true);
    this.publisher.pub(this.hdopTopic, this._hdop, false, true);
    this.publisher.pub(this.vdopTopic, this._vdop, false, true);

    this.loadEphemerisData().then(() => this.loadSbasData()).then(() => {
      this.publishedSatStates.length = this.satellites.length;
      for (let i = 0; i < this.satellites.length; i++) {
        const sat = this.satellites[i];
        this.publishedSatStates[i] = { prn: sat.prn, state: GPSSatelliteState.None, areDiffCorrectionsDownloaded: false };
      }

      this._channelCount = Math.min(this._channelCount, this.satellites.length);
      this.channels.length = this._channelCount;
      this.channels.fill(null);

      this.isInit = true;

      // Setup sync logic.
      if (this.syncRole === 'replica') {
        const sub = this.bus.getSubscriber<GPSSatComputerSyncEvents>();

        const copyEnabledSbasGroups = (groups: readonly string[]): void => {
          this.enabledSBASGroupsSet!.clear();
          for (const group of groups) {
            this.enabledSBASGroupsSet!.add(group);
          }
        };

        sub.on(this.channelStateSyncTopic).handle(data => { this.pendingChannelStateUpdates.set(data.index, data); });
        sub.on(this.satCalcSyncTopic).handle(() => { this.needSatCalc = true; });
        sub.on(this.satStateSyncTopic).handle(data => { this.pendingSatStateUpdates.set(data.prn, data); });
        sub.on(this.enabledSbasSyncTopic).handle(copyEnabledSbasGroups);
        sub.on(this.resetSyncTopic).handle(() => { this.reset(); });
        sub.on(this.stateResponseSyncTopic).handle(response => {
          this.needSatCalc = true;
          for (const channelState of response.channels) {
            this.pendingChannelStateUpdates.set(channelState.index, channelState);
          }
          for (const satState of response.satStates) {
            this.pendingSatStateUpdates.set(satState.prn, satState);
          }

          copyEnabledSbasGroups(response.enabledSbasGroups);
        });

        // Request initial state.
        this.syncPublisher.pub(this.stateRequestSyncTopic, undefined, true, false);
      } else if (this.syncRole === 'primary') {
        const sub = this.bus.getSubscriber<GPSSatComputerSyncEvents>();

        sub.on(this.stateRequestSyncTopic).handle(() => {
          this.syncPublisher.pub(this.stateResponseSyncTopic, {
            channels: this.channels.map((sat, index) => { return { index, prn: sat === null ? null : sat.prn }; }),
            satStates: this.satellites.map(sat => { return { prn: sat.prn, state: sat.state.get(), areDiffCorrectionsDownloaded: sat.areDiffCorrectionsDownloaded }; }),
            enabledSbasGroups: Array.from(this.enabledSBASGroups.get())
          }, true, false);
        });

        (this.enabledSBASGroups as SubscribableSet<string>).sub(groups => {
          this.syncPublisher.pub(this.enabledSbasSyncTopic, Array.from(groups), true, false);
        });
      }

      if (this.needAcquireAndUse) {
        this.needAcquireAndUse = false;
        this.acquireAndUseSatellites();
      } else {
        this.reset();
      }
    });
  }

  /**
   * Loads the GPS ephemeris data file.
   */
  private loadEphemerisData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            this.ephemerisData = JSON.parse(request.responseText);
            for (const prn in this.ephemerisData) {
              this.satellites.push(new GPSSatellite(parseInt(prn), undefined, this.ephemerisData[prn], this.satelliteTimingOptions));
            }

            resolve();
          } else {
            reject(`Could not initialize sat computer system with ephemeris data: ${request.responseText}`);
          }
        }
      };

      request.open('GET', this.ephemerisFile);
      request.send();
    });
  }

  /**
   * Loads the GPS SBAS data file.
   */
  private loadSbasData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (request.status === 200) {
            this.sbasData = JSON.parse(request.responseText);
            this.addSbasSatellites();

            resolve();
          } else {
            reject(`Could not initialize sat computer system with sbas data: ${request.responseText}`);
          }
        }
      };

      request.open('GET', this.sbasFile);
      request.send();
    });
  }

  /**
   * Gets the index of a satellite with a given PRN identifier.
   * @param prn The PRN identifier for which to get the satellite index.
   * @returns The index of the satellite with the specified PRN identifier, or `-1` if the PRN does not belong to any
   * satellite.
   */
  private getSatelliteIndexFromPrn(prn: number): number {
    for (let i = 0; i < this.satellites.length; i++) {
      if (this.satellites[i].prn === prn) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Calculates the horizon zenith angle.
   * @returns The calculated horizon zenith angle based on the current altitude.
   */
  public calcHorizonAngle(): number {
    return Math.acos(6378100 / (6378100 + this.altitude));
  }

  /**
   * Syncs this computer's last known position with a given value.
   * @param pos The position with which to sync the last known position. Defaults to the airplane's current position.
   */
  public syncLastKnownPosition(pos: LatLonInterface = this.ppos): void {
    this.lastKnownPosition.set(pos);
  }

  /**
   * Erases this computer's last known position.
   */
  public eraseLastKnownPosition(): void {
    this.lastKnownPosition.set(NaN, NaN);
  }

  /**
   * Checks whether this computer's downloaded almanac data is valid at a given simulation time.
   * @param simTime The simulation time at which to check for almanac validity, as a Javascript timestamp. Defaults to
   * the current simulation time.
   * @returns Whether this computer's downloaded almanac data is valid at the specified simulation time.
   */
  public isAlmanacValid(simTime = this.simTime): boolean {
    return this.lastAlamanacTime !== undefined && Math.abs(simTime - this.lastAlamanacTime) < this.satelliteTimingOptions.almanacExpireTime;
  }

  /**
   * Forces this computer to immediately download a complete alamanac.
   * @param simTime The simulation time at which the almanac is considered to have been downloaded, as a Javascript
   * timestamp. Defaults to the current simulation time.
   */
  public downloadAlamanac(simTime = this.simTime): void {
    this.almanacProgress = 0;
    this.lastAlamanacTime = simTime;
  }

  /**
   * Erases this computer's downloaded almanac and any partial download progress.
   */
  public eraseAlamanac(): void {
    this.almanacProgress = 0;
    this.lastAlamanacTime = undefined;
  }

  /**
   * Erases this computer's cached ephemeris data for all satellites.
   */
  public eraseCachedEphemeris(): void {
    for (let i = 0; i < this.satellites.length; i++) {
      this.satellites[i].eraseCachedEphemeris();
    }
  }

  /**
   * Instantly chooses the optimal satellites to track for all receiver channels, then acquires and downloads all data
   * (ephemeris, almanac, and differential corrections) from tracked satellites with sufficient signal strength. If
   * this system is not initialized, the operation will be delayed until just after initialization, unless `reset()` is
   * called in the interim.
   *
   * Has no effect if this system is a replica.
   */
  public acquireAndUseSatellites(): void {
    if (this.syncRole === 'replica') {
      return;
    }

    if (this.isInit) {
      this.updateSatellites(this.simTime, 0, true, true);
    } else {
      this.needAcquireAndUse = true;
    }
  }

  /**
   * Resets the GPSSatComputer system. This will set the state of the system to {@link GPSSystemState.Searching},
   * unassign all receiver channels, and set the state of every satellite to {@link GPSSatelliteState.None}.
   *
   * If this system is not initialized, this method has no effect other than to cancel any pending operations triggered
   * by previous calls to `acquireAndUseSatellites()`.
   */
  public reset(): void {
    this.needAcquireAndUse = false;

    if (!this.isInit) {
      return;
    }

    for (let i = 0; i < this.channels.length; i++) {
      this.channels[i] = null;
    }

    for (const sat of this.satellites) {
      const oldState = sat.state.get();
      sat.setTracked(false);
      sat.state.set(GPSSatelliteState.None);

      if (oldState !== GPSSatelliteState.None) {
        this.publisher.pub(this.satStateChangedTopic, sat, false, false);
      }
    }

    const currentState = this._state;
    this._state = GPSSystemState.Searching;

    if (currentState !== GPSSystemState.Searching) {
      this.publisher.pub(this.stateChangedTopic, GPSSystemState.Searching, false, true);
    }

    this.setDop(-1, -1, -1);

    if (this.syncRole === 'primary') {
      this.syncPublisher.pub(this.resetSyncTopic, undefined, true, false);
    }
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (!this.isInit) {
      return;
    }

    const deltaTime = this.simTime - this.previousSimTime;

    if (this.syncRole !== 'replica') {
      if (deltaTime < 0 || deltaTime > (this.updateInterval * 2)) {
        this.previousSimTime = this.simTime;

        if (this.lastUpdateTime !== undefined) {
          this.lastUpdateTime = this.simTime;
        }

        return;
      }
    }

    const shouldUpdatePositions = this.syncRole === 'replica'
      ? this.needSatCalc
      : this.lastUpdateTime === undefined || this.simTime >= this.lastUpdateTime + this.updateInterval;

    this.needSatCalc = false;

    this.updateSatellites(this.simTime, deltaTime, shouldUpdatePositions, false);
  }

  /**
   * Updates the states and optionally the orbital positions of all satellites.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param deltaTime The time elapsed, in milliseconds, since the last satellite update.
   * @param shouldUpdatePositions Whether to update the orbital positions of the satellites.
   * @param forceAcquireAndUse Whether to immediately choose the optimal satellites to track for all receiver channels,
   * then acquire and download all data (ephemeris, almanac, and differential corrections) from tracked satellites with
   * sufficient signal strength.
   */
  private updateSatellites(simTime: number, deltaTime: number, shouldUpdatePositions: boolean, forceAcquireAndUse: boolean): void {
    let numAcquiring = 0;
    let canApplyDiffCorrections = false;

    let shouldUpdateDop = shouldUpdatePositions;

    if (shouldUpdatePositions && this.syncRole === 'primary') {
      this.syncPublisher?.pub(this.satCalcSyncTopic, undefined, true, false);
    }

    if (forceAcquireAndUse) {
      this.lastKnownPosition.set(this.ppos);
    }

    this.distanceFromLastKnownPos = isNaN(this.lastKnownPosition.lat) || isNaN(this.lastKnownPosition.lon)
      ? Infinity
      : this.ppos.distance(this.lastKnownPosition);

    this._isAlmanacValid = this.isAlmanacValid();

    this.updateAvailableSbasGroups();

    const enabledSBASGroups = this.enabledSBASGroups.get();
    const invMaxZenithAngle = 1.0 / (GPSSatellite.calcHorizonAngle(this.altitude) + (Math.PI / 2));

    for (let i = 0; i < this.satellites.length; i++) {
      const sat = this.satellites[i];

      if (shouldUpdatePositions) {
        sat.computeSatellitePositions(this.simTime);
        sat.applyProjection(this.ppos, this.altitude);
      }

      sat.calculateSignalStrength(invMaxZenithAngle);
    }

    if (this.syncRole === 'replica') {
      for (const update of this.pendingChannelStateUpdates.values()) {
        const sat = update.prn === null ? null : (this.satellites[this.getSatelliteIndexFromPrn(update.prn)] ?? null);
        this.assignSatelliteToChannel(update.index, sat);
      }
    } else if (shouldUpdatePositions) {
      this.updateChannelAssignments(forceAcquireAndUse);
    }

    this.pendingChannelStateUpdates.clear();

    for (let i = 0; i < this.satellites.length; i++) {
      const sat = this.satellites[i];

      let updatedState: boolean;
      if (this.syncRole === 'replica') {
        const stateUpdate = this.pendingSatStateUpdates.get(sat.prn);
        updatedState = sat.forceUpdateState(simTime, stateUpdate?.state, stateUpdate?.areDiffCorrectionsDownloaded);
      } else {
        updatedState = sat.updateState(simTime, deltaTime, this.distanceFromLastKnownPos, forceAcquireAndUse);
      }

      if (updatedState) {
        shouldUpdateDop = true;
      }

      const satState = sat.state.get();
      if (
        satState === GPSSatelliteState.DataCollected
        || satState === GPSSatelliteState.InUse
        || satState === GPSSatelliteState.InUseDiffApplied
      ) {
        numAcquiring++;

        if (sat.areDiffCorrectionsDownloaded && this.currentAvailableSbasGroups.has(sat.sbasGroup as string)) {
          canApplyDiffCorrections = true;
        }
      } else if (satState === GPSSatelliteState.Acquired) {
        numAcquiring++;
      }
    }

    this.pendingSatStateUpdates.clear();

    const newSBASState = canApplyDiffCorrections
      ? GPSSystemSBASState.Active
      : enabledSBASGroups.size === 0 ? GPSSystemSBASState.Disabled : GPSSystemSBASState.Inactive;

    let pdop = this._pdop, hdop = this._hdop, vdop = this._vdop;

    if (shouldUpdateDop) {
      if (this.syncRole !== 'replica') {
        [pdop, hdop, vdop] = this.selectSatellites(this.dops);
      } else if (shouldUpdateDop) {
        [pdop, hdop, vdop] = this.calculateDop(this.dops);
      }
    }

    let newSystemState = GPSSystemState.Searching;
    if (pdop >= 0) {
      newSystemState = canApplyDiffCorrections ? GPSSystemState.DiffSolutionAcquired : GPSSystemState.SolutionAcquired;
      this.lastKnownPosition.set(this.ppos);
    } else if (numAcquiring > 0) {
      newSystemState = GPSSystemState.Acquiring;
    } else if (this.distanceFromLastKnownPos < 0.0290367 /* 100 nautical miles */) {
      // Set system state to 'Acquiring' if we are attempting to acquire at least one satellite for which we have
      // predicted geometry data (either from the almanac or cached ephemeris data).
      for (let i = 0; i < this.channels.length; i++) {
        const sat = this.channels[i];
        if (sat && sat.state.get() === GPSSatelliteState.None && (this._isAlmanacValid || sat.isCachedEphemerisValid(this.simTime))) {
          newSystemState = GPSSystemState.Acquiring;
          break;
        }
      }
    }

    if (this.syncRole !== 'replica') {
      for (let i = 0; i < this.channels.length; i++) {
        const sat = this.channels[i];
        if (sat) {
          sat.updateDiffCorrectionsApplied(canApplyDiffCorrections);
        }
      }

      this.updateAlmanacState(simTime, deltaTime, forceAcquireAndUse);
    }

    this.diffAndPublishSatelliteStates();

    if (this._state !== newSystemState) {
      this._state = newSystemState;
      this.publisher.pub(this.stateChangedTopic, newSystemState, false, true);
    }

    if (this._sbasState !== newSBASState) {
      this._sbasState = newSBASState;
      this.publisher.pub(this.sbasStateChangedTopic, newSBASState, false, true);
    }

    if (shouldUpdatePositions) {
      this.lastUpdateTime = this.simTime;
      this.publisher.pub(this.satPosCalcTopic, undefined, false, false);
    }

    this.setDop(pdop, hdop, vdop);

    this.previousSimTime = this.simTime;
  }

  /**
   * Updates which SBAS groups are enabled and whose coverage area contain the airplane's current position.
   */
  private updateAvailableSbasGroups(): void {
    const enabledSBASGroups = this.enabledSBASGroups.get();

    for (let i = 0; i < this.sbasData.length; i++) {
      const sbasData = this.sbasData[i];
      if (enabledSBASGroups.has(sbasData.group) && Vec2Math.pointWithinPolygon(sbasData.coverage, this.pposVec)) {
        this.currentAvailableSbasGroups.add(sbasData.group);
      } else {
        this.currentAvailableSbasGroups.delete(sbasData.group);
      }
    }
  }

  private readonly covarMatrix = [
    new Float64Array(4),
    new Float64Array(4),
    new Float64Array(4),
    new Float64Array(4),
  ];

  private static readonly EPHEMERIS_COLLECTED_SATELLITE_STATES = new Set([GPSSatelliteState.DataCollected, GPSSatelliteState.InUse, GPSSatelliteState.InUseDiffApplied]);

  private readonly ephemerisCollectedSatelliteFilter = (sat: GPSSatellite): boolean => {
    return GPSSatComputer.EPHEMERIS_COLLECTED_SATELLITE_STATES.has(sat.state.get());
  };

  private readonly losSatelliteFilter = (sat: GPSSatellite): boolean => {
    return sat.signalStrength.get() > 0.05
      && (
        (
          this.distanceFromLastKnownPos < 0.0290367 // 100 nautical miles
          && (this._isAlmanacValid || sat.isCachedEphemerisValid(this.simTime))
        )
        || GPSSatComputer.EPHEMERIS_COLLECTED_SATELLITE_STATES.has(sat.state.get())
      );
  };

  private readonly losSatelliteFilterOmniscient = (sat: GPSSatellite): boolean => {
    return sat.signalStrength.get() > 0.05;
  };

  private readonly untrackedSatelliteFilter = (sat: GPSSatellite): boolean => {
    return !this.channels.includes(sat) && sat.state.get() !== GPSSatelliteState.Unreachable;
  };

  /**
   * Updates the satellites assigned to be tracked by this computer's receiver channels.
   * @param forceAcquireAndUse Whether to immediately choose the optimal satellites to track and acquire all data from
   * tracked satellites if signal strength is sufficient.
   */
  private updateChannelAssignments(forceAcquireAndUse: boolean): void {
    // If we have at least one channel for every satellite, then we will simply assign each satellite to its own
    // channel.
    if (this._channelCount >= this.satellites.length) {
      const end = Math.min(this._channelCount, this.satellites.length);
      for (let i = 0; i < end; i++) {
        if (this.channels[i] === null) {
          this.assignSatelliteToChannel(i, this.satellites[i]);
        }
      }
      return;
    }

    const losSatellites = this.satellites.filter(forceAcquireAndUse ? this.losSatelliteFilterOmniscient : this.losSatelliteFilter);

    let losSatellitesNotTrackedIndexes: number[];
    let openChannelIndexes: number[];

    let isTrackingSbasSatelliteInLos = false;

    if (forceAcquireAndUse) {
      losSatellitesNotTrackedIndexes = ArrayUtils.range(losSatellites.length);
      openChannelIndexes = ArrayUtils.range(this._channelCount, this._channelCount - 1, -1);
    } else {
      losSatellitesNotTrackedIndexes = [];

      for (let i = 0; i < losSatellites.length; i++) {
        const sat = losSatellites[i];
        if (this.channels.includes(sat)) {
          if (sat.sbasGroup !== undefined && this.currentAvailableSbasGroups.has(sat.sbasGroup)) {
            isTrackingSbasSatelliteInLos = true;
          }
        } else {
          losSatellitesNotTrackedIndexes.push(i);
        }
      }

      openChannelIndexes = [];

      for (let i = this.channels.length - 1; i >= 0; i--) {
        const sat = this.channels[i];

        if (!sat || sat.state.get() === GPSSatelliteState.Unreachable) {
          openChannelIndexes.push(i);
        }
      }
    }

    if (openChannelIndexes.length === 0 && (this.channels as GPSSatellite[]).every(this.ephemerisCollectedSatelliteFilter)) {
      // There are no open channels and we have collected ephemeris data from every tracked satellite.

      const trackedLosMatrix = GPSSatComputer.getLosMatrix(this.channels as GPSSatellite[]);
      const trackedCovarMatrix = GPSSatComputer.calculateCovarMatrix(trackedLosMatrix, this.covarMatrix);

      if (!isFinite(trackedCovarMatrix[0][0]) || !isFinite(trackedCovarMatrix[1][1]) || !isFinite(trackedCovarMatrix[2][2])) {
        // The currently tracked satellites are not sufficient to produce a 3D position solution. In this case we
        // will replace a random tracked satellite with an untracked.

        openChannelIndexes.push(Math.trunc(Math.random() * this._channelCount));
      } else {
        // The currently tracked satellites are sufficient to produce a 3D position solution. In this case we will
        // only try to replace a tracked satellite if we are tracking at least one redundant satellite, we are not
        // tracking an SBAS satellite within LOS, and there is a SBAS satellite within LOS available for us to track.
        // If the above is true, then we will replace the tracked satellite with the smallest contribution to reducing
        // PDOP with the SBAS satellite with highest signal strength.

        if (this._channelCount > 4 && !isTrackingSbasSatelliteInLos) {
          let highestSbasSignal = 0;
          let highestSbasSignalIndex = -1;

          for (let i = 0; i < losSatellitesNotTrackedIndexes.length; i++) {
            const index = losSatellitesNotTrackedIndexes[i];
            const sat = losSatellites[index];
            const signalStrength = sat.signalStrength.get();
            if (sat.sbasGroup !== undefined && this.currentAvailableSbasGroups.has(sat.sbasGroup) && signalStrength > highestSbasSignal) {
              highestSbasSignal = signalStrength;
              highestSbasSignalIndex = index;
            }
          }

          if (highestSbasSignalIndex >= 0) {
            const sTranspose = this.channels.map(GPSSatComputer.createVec4);
            GPSSatComputer.calculateDowndateSTranspose(trackedLosMatrix, trackedCovarMatrix, sTranspose);
            const pDiag = GPSSatComputer.calculateDowndatePDiag(trackedLosMatrix, sTranspose, new Float64Array(trackedLosMatrix.length));
            GPSSatComputer.calculateSatelliteCosts(sTranspose, pDiag, this.satelliteCosts);

            let satToReplaceCost = Infinity;
            let satToReplaceChannelIndex = -1;

            for (let i = 0; i < this.channels.length; i++) {
              const cost = this.satelliteCosts[i];
              if (cost < satToReplaceCost) {
                satToReplaceCost = cost;
                satToReplaceChannelIndex = i;
              }
            }

            if (satToReplaceChannelIndex >= 0) {
              this.assignSatelliteToChannel(satToReplaceChannelIndex, losSatellites[highestSbasSignalIndex]);
            }
          }
        }

        return;
      }
    }

    if (openChannelIndexes.length > 0) {
      if (openChannelIndexes.length < losSatellitesNotTrackedIndexes.length) {
        // We don't have enough open channels to begin tracking all satellites currently within line-of-sight.
        // Therefore, we will choose those with the largest contribution to reducing PDOP.

        const losMatrix = GPSSatComputer.getLosMatrix(losSatellites);
        const covarMatrix = GPSSatComputer.calculateCovarMatrix(losMatrix, this.covarMatrix);
        const sTranspose = losSatellites.map(GPSSatComputer.createVec4);
        GPSSatComputer.calculateDowndateSTranspose(losMatrix, covarMatrix, sTranspose);
        const pDiag = GPSSatComputer.calculateDowndatePDiag(losMatrix, sTranspose, new Float64Array(losMatrix.length));
        GPSSatComputer.calculateSatelliteCosts(sTranspose, pDiag, this.satelliteCosts);

        // If we are not already tracking an SBAS satellite within LOS, we will prioritize adding the SBAS satellite
        // with the highest cost over non-SBAS satellites.
        if (!isTrackingSbasSatelliteInLos) {
          let highestSbasCost = -Infinity;
          let highestSbasCostIndex = -1;

          for (let i = 0; i < this.satelliteCosts.length; i++) {
            const sbasGroup = losSatellites[i].sbasGroup;
            if (sbasGroup !== undefined && this.currentAvailableSbasGroups.has(sbasGroup)) {
              const cost = this.satelliteCosts[i];
              if (cost > highestSbasCost) {
                highestSbasCost = cost;
                highestSbasCostIndex = i;
              }
            }
          }

          if (highestSbasCostIndex >= 0) {
            this.satelliteCosts[highestSbasCostIndex] = Infinity;
          }
        }

        const satelliteIndexes = ArrayUtils.range(losSatellites.length);
        satelliteIndexes.sort(this.satelliteCostCompare);

        for (let i = satelliteIndexes.length - 1; i >= 0; i--) {
          const satIndex = satelliteIndexes[i];
          if (losSatellitesNotTrackedIndexes.includes(satIndex)) {
            const sat = losSatellites[satIndex];
            const channelIndex = openChannelIndexes.pop() as number;
            this.assignSatelliteToChannel(channelIndex, sat);

            if (openChannelIndexes.length === 0) {
              break;
            }
          }
        }
      } else {
        // We have enough open channels to begin tracking all satellites currently within LOS.
        for (let i = 0; i < losSatellitesNotTrackedIndexes.length; i++) {
          const satIndex = losSatellitesNotTrackedIndexes[i];
          const channelIndex = openChannelIndexes.pop() as number;
          this.assignSatelliteToChannel(channelIndex, losSatellites[satIndex]);
        }
      }

      // If we still have open channels available, fill them with random satellites that have not been marked as
      // unreachable.
      if (openChannelIndexes.length > 0) {
        const untrackedSatellites = this.satellites.filter(this.untrackedSatelliteFilter);

        let untrackedIndex = 0;
        while (openChannelIndexes.length > 0 && untrackedIndex < untrackedSatellites.length) {
          const channelIndex = openChannelIndexes.pop() as number;
          this.assignSatelliteToChannel(channelIndex, untrackedSatellites[untrackedIndex++]);
        }
      }
    }
  }

  /**
   * Assigns a satellite to a receiver channel.
   * @param channelIndex The index of the receiver channel.
   * @param sat The satellite to assign, or `null` if the channel is to be assigned no satellite.
   */
  private assignSatelliteToChannel(channelIndex: number, sat: GPSSatellite | null): void {
    const oldSat = this.channels[channelIndex];

    if (oldSat === sat) {
      return;
    }

    if (oldSat) {
      oldSat.setTracked(false);
    }

    this.channels[channelIndex] = sat;

    if (sat) {
      sat.setTracked(true);
    }

    if (this.syncRole === 'primary') {
      this.syncPublisher.pub(this.channelStateSyncTopic, { index: channelIndex, prn: sat === null ? null : sat.prn }, true, false);
    }
  }

  private static readonly inUseSatelliteFilter = (sat: GPSSatellite): boolean => {
    const state = sat.state.get();
    return state === GPSSatelliteState.InUse || state === GPSSatelliteState.InUseDiffApplied;
  };

  /**
   * Calculates dilution of precision values (PDOP, HDOP, VDOP) for the satellite constellation consisting of all
   * satellites that are currently in-use.
   * @param out The vector to which to write the results.
   * @returns Dilution of precision values for the current in-use satellite constellation, as `[PDOP, HDOP, VDOP]`. If
   * the constellation is insufficient to provide a 3D position solution, then `[-1, -1, -1]` will be returned.
   */
  private calculateDop(out: Float64Array): Float64Array {
    Vec3Math.set(-1, -1, -1, out);

    const satsInUse = this.satellites.filter(GPSSatComputer.inUseSatelliteFilter);

    if (satsInUse.length < 4) {
      return out;
    }

    const losMatrix = GPSSatComputer.getLosMatrix(satsInUse);
    const covarMatrix = GPSSatComputer.calculateCovarMatrix(losMatrix, this.covarMatrix);

    // Grab the variance terms var(x), var(y), var(z) along the diagonal of the covariance matrix
    const varX = covarMatrix[0][0];
    const varY = covarMatrix[1][1];
    const varZ = covarMatrix[2][2];

    if (!isFinite(varX) || !isFinite(varY) || !isFinite(varZ)) {
      return out;
    }

    const horizSumVar = varX + varY;

    const pdop = Math.sqrt(horizSumVar + varZ);
    const hdop = Math.sqrt(horizSumVar);
    const vdop = Math.sqrt(varZ);

    return Vec3Math.set(pdop, hdop, vdop, out);
  }

  private static readonly readySatelliteFilter = (sat: GPSSatellite): boolean => {
    const state = sat.state.get();
    return state === GPSSatelliteState.DataCollected || state === GPSSatelliteState.InUse || state === GPSSatelliteState.InUseDiffApplied;
  };

  private static readonly createVec4 = (): Float64Array => new Float64Array(4);

  private readonly satelliteCosts: number[] = [];
  private readonly satelliteCostCompare = (indexA: number, indexB: number): number => {
    return this.satelliteCosts[indexA] - this.satelliteCosts[indexB];
  };

  /**
   * Selects satellites to use for calculating position solutions and returns the dilution of precision values for
   * the selected constellation.
   * @param out The vector to which to write the dilution of precision values.
   * @returns Dilution of precision values for the selected satellite constellation, as `[PDOP, HDOP, VDOP]`. If the
   * constellation is insufficient to provide a 3D position solution, then `[-1, -1, -1]` will be returned.
   */
  private selectSatellites(out: Float64Array): Float64Array {
    Vec3Math.set(-1, -1, -1, out);

    const satellitesToUse = this.satellites.filter(GPSSatComputer.readySatelliteFilter);

    if (satellitesToUse.length < 4) {
      this.updateSatelliteInUseStates(satellitesToUse, []);
      return out;
    }

    const losMatrix = GPSSatComputer.getLosMatrix(satellitesToUse);
    const covarMatrix = GPSSatComputer.calculateCovarMatrix(losMatrix, this.covarMatrix);

    const maxCount = MathUtils.clamp(this.satInUseMaxCount.get(), 4, this._channelCount);

    if (
      !VecNMath.isFinite(covarMatrix[0])
      || !VecNMath.isFinite(covarMatrix[1])
      || !VecNMath.isFinite(covarMatrix[2])
      || !VecNMath.isFinite(covarMatrix[3])
    ) {
      const satellitesToDiscard = satellitesToUse.splice(maxCount);
      this.updateSatelliteInUseStates(satellitesToUse, satellitesToDiscard);
      return out;
    }

    const satellitesToDiscard: GPSSatellite[] = [];

    const pdopTarget = this.satInUsePdopTarget.get();
    const optimumCount = Math.max(this.satInUseOptimumCount.get(), 4);
    const pdopTargetSq = pdopTarget < 0 ? -1 : pdopTarget * pdopTarget;
    let pdopSq = covarMatrix[0][0] + covarMatrix[1][1] + covarMatrix[2][2];

    if (satellitesToUse.length > maxCount || (satellitesToUse.length > optimumCount && pdopSq < pdopTargetSq)) {
      // There are more in-sight satellites than we can select. Therefore we will attempt to discard excess satellites
      // in manner that minimizes the increase to PDOP relative to selecting all in-sight satellites.

      // We will use the "downdate" selection algorithm presented in Walter, T, Blanch, J and Kropp, V, 2016.
      // Define Sᵀ = LC and P = I - LCLᵀ, where L is the line-of-sight matrix and C is the covariance matrix.
      // Then Ci = C + (Si)(Si)ᵀ / P(i, i), where Ci is the covariance matrix after removing the ith satellite and
      // Si is the ith column of S.

      // If PDOP = sqrt(C(1, 1) + C(2, 2) + C(3, 3)), then from the above it can be seen that removing the ith
      // satellite increases PDOP² by (S(1, i)² + S(2, i)² + S(3, i)²) / P(i, i). Defining this to be the cost of
      // removing satellite i, we are then guaranteed that removing the satellite with the lowest cost will result
      // in the smallest increase to PDOP.

      const sTranspose = satellitesToUse.map(GPSSatComputer.createVec4);
      GPSSatComputer.calculateDowndateSTranspose(losMatrix, covarMatrix, sTranspose);
      const pDiag = GPSSatComputer.calculateDowndatePDiag(losMatrix, sTranspose, new Float64Array(losMatrix.length));
      GPSSatComputer.calculateSatelliteCosts(sTranspose, pDiag, this.satelliteCosts);

      const satelliteIndexes = ArrayUtils.range(satellitesToUse.length);
      satelliteIndexes.sort(this.satelliteCostCompare);

      pdopSq = covarMatrix[0][0] + covarMatrix[1][1] + covarMatrix[2][2];
      let indexToRemove = satelliteIndexes[0];

      while (
        satellitesToUse.length > maxCount
        || (
          satellitesToUse.length > optimumCount
          && pdopSq + this.satelliteCosts[indexToRemove] <= pdopTargetSq
        )
      ) {

        satellitesToDiscard.push(satellitesToUse[indexToRemove]);
        satellitesToUse.splice(indexToRemove, 1);
        losMatrix.splice(indexToRemove, 1);

        // Reset satellite index array.
        satelliteIndexes.length--;
        for (let i = 0; i < satelliteIndexes.length; i++) {
          satelliteIndexes[i] = i;
        }

        // Update covariance matrix after removing a satellite.
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            covarMatrix[i][j] += sTranspose[indexToRemove][i] * sTranspose[indexToRemove][j] / pDiag[indexToRemove];
          }
        }

        // Recompute satellite costs.
        sTranspose.length--;
        GPSSatComputer.calculateDowndateSTranspose(losMatrix, covarMatrix, sTranspose);
        GPSSatComputer.calculateDowndatePDiag(losMatrix, sTranspose, pDiag);
        GPSSatComputer.calculateSatelliteCosts(sTranspose, pDiag, this.satelliteCosts);
        satelliteIndexes.sort(this.satelliteCostCompare);

        pdopSq = covarMatrix[0][0] + covarMatrix[1][1] + covarMatrix[2][2];
        indexToRemove = satelliteIndexes[0];
      }
    }

    this.updateSatelliteInUseStates(satellitesToUse, satellitesToDiscard);

    // Grab the variance terms var(x), var(y), var(z) along the diagonal of the covariance matrix
    const varX = covarMatrix[0][0];
    const varY = covarMatrix[1][1];
    const varZ = covarMatrix[2][2];

    if (!isFinite(varX) || !isFinite(varY) || !isFinite(varZ)) {
      return out;
    }

    const horizSumVar = varX + varY;

    const pdop = Math.sqrt(horizSumVar + varZ);
    const hdop = Math.sqrt(horizSumVar);
    const vdop = Math.sqrt(varZ);

    return Vec3Math.set(pdop, hdop, vdop, out);
  }

  /**
   * Updates the in-use state of satellites.
   * @param satellitesToUse The satellites to use for position solution calculations.
   * @param satellitesToNotUse The satellites to not use for position solution calculations.
   */
  private updateSatelliteInUseStates(satellitesToUse: readonly GPSSatellite[], satellitesToNotUse: readonly GPSSatellite[]): void {
    for (let i = 0; i < satellitesToUse.length; i++) {
      satellitesToUse[i].updateInUse(true);
    }

    for (let i = 0; i < satellitesToNotUse.length; i++) {
      satellitesToNotUse[i].updateInUse(false);
    }
  }

  private static readonly COLLECTING_DATA_SATELLITE_STATES = new Set([
    GPSSatelliteState.Acquired,
    GPSSatelliteState.DataCollected,
    GPSSatelliteState.InUse,
    GPSSatelliteState.InUseDiffApplied
  ]);

  private readonly collectingDataSatelliteFilter = (sat: GPSSatellite | null): boolean => {
    return sat !== null && GPSSatComputer.COLLECTING_DATA_SATELLITE_STATES.has(sat.state.get());
  };

  /**
   * Updates the almanac download state.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param deltaTime The time elapsed, in milliseconds, since the last update.
   * @param forceDownload Whether to force the entire almanac to be instantly downloaded.
   */
  private updateAlmanacState(simTime: number, deltaTime: number, forceDownload: boolean): void {
    if (forceDownload) {
      this.lastAlamanacTime = simTime;
      this.almanacProgress = 0;
    } else {
      const isCollectingData = this.channels.some(this.collectingDataSatelliteFilter);

      if (isCollectingData) {
        this.almanacProgress += deltaTime / this.satelliteTimingOptions.almanacDownloadTime;
        if (this.almanacProgress >= 1) {
          this.lastAlamanacTime = simTime;
          this.almanacProgress -= 1;
        }
      } else {
        this.almanacProgress = 0;
      }
    }
  }

  /**
   * For each satellite, checks if its state is different from the most recently published state, and if so publishes
   * the new state. If this computer's sync role is `primary`, then a satellite state sync event will be published
   * alongside any regular state events.
   */
  private diffAndPublishSatelliteStates(): void {
    for (let i = 0; i < this.satellites.length; i++) {
      const publishedState = this.publishedSatStates[i];
      const sat = this.satellites[i];
      const state = sat.state.get();
      const areDiffCorrectionsDownloaded = sat.areDiffCorrectionsDownloaded;

      const needPublishState = publishedState.state !== state;
      const needSyncState = needPublishState || publishedState.areDiffCorrectionsDownloaded !== areDiffCorrectionsDownloaded;

      if (needSyncState) {
        publishedState.state = state;
        publishedState.areDiffCorrectionsDownloaded = areDiffCorrectionsDownloaded;

        if (needPublishState) {
          this.publisher.pub(this.satStateChangedTopic, sat, false, false);
        }

        if (this.syncRole === 'primary') {
          this.syncPublisher.pub(this.satStateSyncTopic, { prn: sat.prn, state, areDiffCorrectionsDownloaded }, true, false);
        }
      }
    }
  }

  /**
   * Sets this system's dilution of precision values, and if they are different from the current values, publishes the
   * new values to the event bus.
   * @param pdop The position DOP value to set.
   * @param hdop The horizontal DOP value to set.
   * @param vdop The vertical DOP value to set.
   */
  private setDop(pdop: number, hdop: number, vdop: number): void {
    if (this._pdop !== pdop) {
      this._pdop = pdop;
      this.publisher.pub(this.pdopTopic, pdop, false, true);
    }

    if (this._hdop !== hdop) {
      this._hdop = hdop;
      this.publisher.pub(this.hdopTopic, hdop, false, true);
    }

    if (this._vdop !== vdop) {
      this._vdop = vdop;
      this.publisher.pub(this.vdopTopic, vdop, false, true);
    }
  }

  /**
   * Creates a line-of-sight position matrix for a satellite constellation. Each row in the matrix is a 4-vector of
   * a satellite's position relative to the airplane, as `[x, y, z, 1]`. The index of the matrix row containing a
   * satellite's position vector matches the index of the satellite in the provided array.
   * @param satellites The satellites in the constellation.
   * @returns The line-of-sight position matrix for the specified satellite constellation.
   */
  private static getLosMatrix(satellites: readonly GPSSatellite[]): Float64Array[] {
    const los: Float64Array[] = [];

    // Get unit line-of-sight vectors for each satellite
    for (let i = 0; i < satellites.length; i++) {
      const [zenith, hour] = satellites[i].position.get();
      los[i] = Vec3Math.setFromSpherical(1, zenith, hour, new Float64Array(4));
      los[i][3] = 1;
    }

    return los;
  }

  private static readonly covarMultiplyFuncs = [
    [0, 1, 2, 3].map(col => (sum: number, vec: ArrayLike<number>): number => sum + vec[0] * vec[col]),
    [1, 2, 3].map(col => (sum: number, vec: ArrayLike<number>): number => sum + vec[1] * vec[col]),
    [2, 3].map(col => (sum: number, vec: ArrayLike<number>): number => sum + vec[2] * vec[col])
  ];

  /**
   * Calculates a position-covariance matrix for a satellite constellation.
   * @param los The line-of-sight position matrix for the satellite constellation.
   * @param out The matrix to which to write the result.
   * @returns The position-covariance matrix for the specified satellite constellation.
   */
  private static calculateCovarMatrix(los: readonly ReadonlyFloat64Array[], out: Float64Array[]): Float64Array[] {
    if (los.length < 4) {
      for (let i = 0; i < 4; i++) {
        out[i].fill(NaN, 0, 4);
      }

      return out;
    }

    // The covariance matrix is defined as C = (LᵀL)⁻¹, where L is the satellite line-of-sight matrix.
    // P = LᵀL is guaranteed to be symmetric, so we need only compute the upper triangular part of the product.

    const P11 = los.reduce(GPSSatComputer.covarMultiplyFuncs[0][0], 0);
    const P12 = los.reduce(GPSSatComputer.covarMultiplyFuncs[0][1], 0);
    const P13 = los.reduce(GPSSatComputer.covarMultiplyFuncs[0][2], 0);
    const P14 = los.reduce(GPSSatComputer.covarMultiplyFuncs[0][3], 0);

    const P22 = los.reduce(GPSSatComputer.covarMultiplyFuncs[1][0], 0);
    const P23 = los.reduce(GPSSatComputer.covarMultiplyFuncs[1][1], 0);
    const P24 = los.reduce(GPSSatComputer.covarMultiplyFuncs[1][2], 0);

    const P33 = los.reduce(GPSSatComputer.covarMultiplyFuncs[2][0], 0);
    const P34 = los.reduce(GPSSatComputer.covarMultiplyFuncs[2][1], 0);

    const P44 = los.length;

    // Perform block-wise inversion of LᵀL (which is 4x4, so neatly decomposes into four 2x2 matrices) with optimizations
    // presented in Ingemarsson, C and Gustafsson O, 2015.

    // P = [A  B]
    //     [Bᵀ D]

    // C = P⁻¹ = [E  F]
    //           [Fᵀ H]

    // V = A⁻¹ (A is symmetric, therefore V is also symmetric, so we only need to compute the upper triangular part)
    const detA = 1 / (P11 * P22 - P12 * P12);
    const V11 = P22 * detA;
    const V12 = -P12 * detA;
    const V22 = P11 * detA;

    // X = VB
    const X11 = V11 * P13 + V12 * P23;
    const X12 = V11 * P14 + V12 * P24;
    const X21 = V12 * P13 + V22 * P23;
    const X22 = V12 * P14 + V22 * P24;

    // H = (D - BᵀX)⁻¹ (H and D are symmetric, which means BᵀX is also symmetric)
    const Hi11 = P33 - (P13 * X11 + P23 * X21);
    const Hi12 = P34 - (P13 * X12 + P23 * X22);
    const Hi22 = P44 - (P14 * X12 + P24 * X22);

    const detHi = 1 / (Hi11 * Hi22 - Hi12 * Hi12);
    const H11 = Hi22 * detHi;
    const H12 = -Hi12 * detHi;
    const H22 = Hi11 * detHi;

    // Z = XH, F = -Z
    const Z11 = X11 * H11 + X12 * H12;
    const Z12 = X11 * H12 + X12 * H22;
    const Z21 = X21 * H11 + X22 * H12;
    const Z22 = X21 * H12 + X22 * H22;

    // E = V + ZXᵀ (E is symmetric, so we only need to compute the upper triangular part)
    const E11 = V11 + Z11 * X11 + Z12 * X12;
    const E12 = V12 + Z11 * X21 + Z12 * X22;
    const E22 = V22 + Z21 * X21 + Z22 * X22;

    out[0][0] = E11;
    out[0][1] = E12;
    out[0][2] = -Z11;
    out[0][3] = -Z12;
    out[1][0] = E12; // E is symmetric, so E21 = E12
    out[1][1] = E22;
    out[1][2] = -Z21;
    out[1][3] = -Z22;
    out[2][0] = -Z11;
    out[2][1] = -Z21;
    out[2][2] = H11;
    out[2][3] = H12;
    out[3][0] = -Z12;
    out[3][1] = -Z22;
    out[3][2] = H12; // H is symmetric, so H21 = H12
    out[3][3] = H22;

    return out;
  }

  /**
   * Calculates the transpose of the `S` matrix in the downdate satellite selection algorithm for a satellite
   * constellation. The index of a satellite's corresponding row in the `Sᵀ` matrix matches the index of its position
   * vector in the provided line-of-sight position matrix.
   * @param los The line-of-sight position matrix for the satellite constellation.
   * @param covar The position-covariance matrix for the satellite constellation.
   * @param out The matrix to which to write the result.
   * @returns The transpose of the `S` matrix in the downdate satellite selection algorithm for the specified satellite
   * constellation.
   */
  private static calculateDowndateSTranspose(los: readonly ReadonlyFloat64Array[], covar: readonly ReadonlyFloat64Array[], out: Float64Array[]): Float64Array[] {
    for (let i = 0; i < los.length; i++) {
      for (let j = 0; j < 4; j++) {
        out[i][j] = 0;
        for (let k = 0; k < 4; k++) {
          out[i][j] += los[i][k] * covar[k][j];
        }
      }
    }

    return out;
  }

  /**
   * Calculates the diagonal of the `P` matrix in the downdate satellite selection algorithm for a satellite
   * constellation.
   * @param los The line-of-sight position matrix for the satellite constellation.
   * @param sTranspose The transpose of the `S` matrix in the downdate satellite selection algorithm for the satellite
   * constellation.
   * @param out The vector to which to write the result.
   * @returns The diagonal of the `P` matrix in the downdate satellite selection algorithm for the specified satellite
   * constellation.
   */
  private static calculateDowndatePDiag(los: readonly ReadonlyFloat64Array[], sTranspose: readonly ReadonlyFloat64Array[], out: Float64Array): Float64Array {
    out.fill(1);

    for (let i = 0; i < los.length; i++) {
      for (let j = 0; j < 4; j++) {
        out[i] -= sTranspose[i][j] * los[i][j];
      }
    }

    return out;
  }

  /**
   * Calculates the costs of removing each satellite from a constellation. The cost of removing a satellite is defined
   * as the amount by which `PDOP²` will increase when the satellite is removed relative to the full constellation. The
   * index of a satellite's cost in the returned array matches the index of the satellite's corresponding row in the
   * provided `Sᵀ` matrix.
   * @param sTranspose The transpose of the `S` matrix in the downdate satellite selection algorithm for the satellite
   * constellation.
   * @param pDiag The diagonal of the `P` matrix in the downdate satellite selection algorithm for the satellite
   * constellation.
   * @param out The array to which to write the results.
   * @returns The costs of removing each satellite from a constellation.
   */
  private static calculateSatelliteCosts(sTranspose: readonly ReadonlyFloat64Array[], pDiag: Float64Array, out: number[]): number[] {
    out.length = sTranspose.length;

    for (let i = 0; i < sTranspose.length; i++) {
      out[i] = (sTranspose[i][0] * sTranspose[i][0] + sTranspose[i][1] * sTranspose[i][1] + sTranspose[i][2] * sTranspose[i][2]) / pDiag[i];
    }

    return out;
  }
}

/**
 * The GPS ephemeris data epoch.
 */
export interface GPSEpoch {
  /** The epoch year. */
  year: number;

  /** The epoch month. */
  month: number;

  /** The epoch day. */
  day: number;

  /** The epoch hour. */
  hour: number;

  /** The epoch minute. */
  minute: number;

  /** The epoch second. */
  second: number;
}

/**
 * Data about the GPS satellite clock.
 */
export interface GPSSVClock {
  /** The current clock bias. */
  bias: number,

  /** The current amount of clock drift. */
  drift: number,

  /** The current rate of clock drift. */
  driftRate: number
}

/**
 * A GPS ephemeris data record.
 */
export interface GPSEphemeris {
  /** The GPS epoch for this ephemeris record. */
  epoch: GPSEpoch;

  /** The GPS satellite clock metadata at the time of the record. */
  svClock: GPSSVClock;

  /** IODE Issue of Data, Ephemeris */
  iodeIssueEphemeris: number;

  /** Crs */
  crs: number;

  /** Delta N */
  deltaN: number;

  /** M0 */
  m0: number;

  /** Cuc */
  cuc: number;

  /** e */
  eEccentricity: number;

  /** Cus */
  cus: number;

  /** Square root of A */
  sqrtA: number;

  /** toe */
  toeTimeEphemeris: number;

  /** Cic */
  cic: number;

  /** OMEGA */
  omegaL: number;

  /** Cis */
  cis: number;

  /** i0 */
  i0: number;

  /** Crc */
  crc: number;

  /** omega */
  omegaS: number;

  /** OMEGA dot */
  omegaLDot: number;

  /** IDOT */
  idot: number;

  /** Codes on the GPS L2 channel */
  codesOnL2Channel: number;

  /** The GPS week number */
  gpsWeekNumber: number;

  /** LP2 Data flag */
  l2PDataFlag: number;

  /** Accuracy metadata */
  svAccuracy: number;

  /** Health metadata */
  svHealth: number;

  /** tgd */
  tgd: number;

  /** IODE Issue of Data, Clock */
  iodeIssueClock: number;

  /** Transmission time of the ephemeris message */
  transmissionTimeOfMessage: number;
}

/**
 * A collection of GPS ephemeris records.
 */
export interface GPSEphemerisRecords {
  [index: string]: GPSEphemeris
}

/**
 * A tracked GPS satellite.
 */
export class GPSSatellite {
  private readonly vec3Cache = [new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3)];

  /** The current satellite state. */
  public readonly state = Subject.create<GPSSatelliteState>(GPSSatelliteState.None);

  /** The current satellite position, in zenith angle radians and hour angle radians. */
  public readonly position = Vec2Subject.create(new Float64Array(2));

  /** The current satellite position, in cartesian coordinates. */
  public readonly positionCartesian = Vec3Subject.create(new Float64Array(3));

  /** The current satellite signal strength. */
  public readonly signalStrength = Subject.create(0);

  private isTracked = false;
  private hasComputedPosition = false;

  private _lastEphemerisTime: number | undefined = undefined;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The most recent simulation time at which this satellite's ephemeris was downloaded, as a Javascript timestamp, or
   * `undefined` if this satellite's ephemeris has not yet been downloaded.
   */
  public get lastEphemerisTime(): number | undefined {
    return this._lastEphemerisTime;
  }

  private _lastUnreachableTime: number | undefined = undefined;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The most recent simulation time at which this satellite was confirmed to be unreachable, as a Javascript
   * timestamp, or `undefined` if this satellite has not been confirmed to be unreachable.
   */
  public get lastUnreachableTime(): number | undefined {
    return this._lastUnreachableTime;
  }

  private _areDiffCorrectionsDownloaded = false;
  // eslint-disable-next-line jsdoc/require-returns
  /** Whether SBAS differential correction data have been downloaded from this satellite. */
  public get areDiffCorrectionsDownloaded(): boolean {
    return this._areDiffCorrectionsDownloaded;
  }

  private timeSpentAcquiring: number | undefined = undefined;
  private timeToAcquire: number | undefined = undefined;
  private timeToDownloadEphemeris: number | undefined = undefined;
  private timeToDownloadCorrections: number | undefined = undefined;

  /**
   * Creates an instance of a GPSSatellite.
   * @param prn The GPS PRN number for this satellite.
   * @param sbasGroup Whether or not this satellite is a SBAS satellite.
   * @param ephemeris The ephemeris data to use for position calculation.
   * @param timingOptions Options with which to configure the timing of this satellite's state changes.
   */
  constructor(
    public readonly prn: number,
    public readonly sbasGroup: string | undefined,
    private readonly ephemeris: GPSEphemeris | undefined,
    private readonly timingOptions: Readonly<Required<GPSSatelliteTimingOptions>>
  ) { }

  /**
   * Computes the current satellite positions given the loaded ephemeris data.
   * @param simTime The current simulator time, in milliseconds UNIX epoch
   */
  public computeSatellitePositions(simTime: number): void {
    const record = this.ephemeris;
    if (record !== undefined) {
      const mu = 3.986005e14; //WGS84 gravitational constant for GPS user (meters3/sec2)
      const omegae_dot = 7.2921151467e-5; //WGS84 earth rotation rate (rad/sec)

      // Restore semi-major axis
      const a = record.sqrtA * record.sqrtA;

      // Computed mean motion
      const n0 = Math.sqrt(mu / (a * a * a));

      // Time from ephemeris reference epoch
      const now = simTime / 1000;

      const t = (now - (86400 * 3) + 1735) % 604800;
      let tk = t - record.toeTimeEphemeris;
      if (tk > 302400) {
        tk -= 604800;
      } else if (tk < -302400) {
        tk += 604800;
      }

      // Corrected mean motion
      const n = n0 + record.deltaN;

      // Mean anomaly
      const M = record.m0 + n * tk;

      // Initial guess of eccentric anomaly
      let E = M;
      let E_old;
      let dE;

      // Iterative computation of eccentric anomaly
      for (let i = 1; i < 20; i++) {
        E_old = E;
        E = M + record.eEccentricity * Math.sin(E);
        dE = E - E_old % (2.0 * Math.PI);
        if (Math.abs(dE) < 1e-12) {
          // Necessary precision is reached, exit from the loop
          break;
        }
      }

      const sek = Math.sin(E);
      const cek = Math.cos(E);
      const OneMinusecosE = 1.0 - record.eEccentricity * cek;
      const sq1e2 = Math.sqrt(1.0 - record.eEccentricity * record.eEccentricity);

      // Compute the true anomaly
      const tmp_Y = sq1e2 * sek;
      const tmp_X = cek - record.eEccentricity;
      const nu = Math.atan2(tmp_Y, tmp_X);

      // Compute angle phi (argument of Latitude)
      const phi = nu + record.omegaS;

      // Reduce phi to between 0 and 2*pi rad
      const s2pk = Math.sin(2.0 * phi);
      const c2pk = Math.cos(2.0 * phi);

      // Correct argument of latitude
      const u = phi + record.cuc * c2pk + record.cus * s2pk;
      const suk = Math.sin(u);
      const cuk = Math.cos(u);

      // Correct radius
      const r = a * OneMinusecosE + record.crc * c2pk + record.crs * s2pk;

      // Correct inclination
      const i = record.i0 + record.idot * tk + record.cic * c2pk + record.cis * s2pk;
      const sik = Math.sin(i);
      const cik = Math.cos(i);

      // Compute the angle between the ascending node and the Greenwich meridian
      const Omega_dot = record.omegaLDot - omegae_dot;
      const Omega = record.omegaL + Omega_dot * tk - omegae_dot * record.toeTimeEphemeris;

      const sok = Math.sin(Omega);
      const cok = Math.cos(Omega);

      //Compute satellite coordinates in Earth-fixed coordinates
      const xprime = r * cuk;
      const yprime = r * suk;

      const x = xprime * cok - yprime * cik * sok;
      const y = xprime * sok + yprime * cik * cok;
      const z = yprime * sik;

      this.positionCartesian.set(
        UnitType.METER.convertTo(x, UnitType.GA_RADIAN),
        UnitType.METER.convertTo(y, UnitType.GA_RADIAN),
        UnitType.METER.convertTo(z, UnitType.GA_RADIAN)
      );
    }
  }

  /**
   * Applies a projection to the satellite cartesian coordinates to convert to zenith and hour angles.
   * @param ppos The current plane position.
   * @param altitude The current plane altitude in meters.
   */
  public applyProjection(ppos: GeoPoint, altitude: number): void {
    const satPos = this.positionCartesian.get();

    const altRadians = UnitType.METER.convertTo(altitude, UnitType.GA_RADIAN);
    const pposCartesian = Vec3Math.multScalar(ppos.toCartesian(this.vec3Cache[0]), 1 + altRadians, this.vec3Cache[0]);
    const delta = Vec3Math.normalize(Vec3Math.sub(satPos, pposCartesian, this.vec3Cache[1]), this.vec3Cache[1]);

    const zenithAngle = Math.acos(Vec3Math.dot(delta, Vec3Math.normalize(pposCartesian, this.vec3Cache[2])));

    const satPos0 = Vec3Math.normalize(satPos, this.vec3Cache[1]);
    const northPole = Vec3Math.set(0, 0, 1, this.vec3Cache[2]);

    if (Math.abs(zenithAngle) < 1e-8 || Math.abs(zenithAngle - 180) < 1e-8) {
      this.position.set(zenithAngle, 0);
    } else {
      const A = Vec3Math.normalize(Vec3Math.cross(pposCartesian, northPole, this.vec3Cache[3]), this.vec3Cache[3]);
      const B = Vec3Math.normalize(Vec3Math.cross(pposCartesian, satPos0, this.vec3Cache[4]), this.vec3Cache[4]);

      const signBz = B[2] >= 0 ? 1 : -1;
      const hourAngle = Math.acos(Vec3Math.dot(A, B)) * signBz;

      this.position.set(zenithAngle, -hourAngle);
    }

    this.hasComputedPosition = true;
  }

  /**
   * Calculates the current signal strength.
   * @param invMaxZenithAngle The inverse of the maximum zenith angle at which a satellite can still have line of sight, in radians.
   */
  public calculateSignalStrength(invMaxZenithAngle: number): void {
    if (this.hasComputedPosition) {
      const signalStrength = Math.max(0, 1 - (this.position.get()[0] * invMaxZenithAngle));

      this.signalStrength.set(signalStrength);
    }
  }

  /**
   * Calculates the horizon zenith angle.
   * @param altitude The altitude, in meters.
   * @returns The calculated horizon zenith angle based on the current altitude.
   */
  public static calcHorizonAngle(altitude: number): number {
    return Math.acos(6378100 / (6378100 + Math.max(altitude, 0)));
  }

  /**
   * Checks whether this satellite's cached ephemeris data is valid at a given simulation time.
   * @param simTime The simulation time at which to check for ephemeris validity, as a Javascript timestamp.
   * @returns Whether this satellite's cached ephemeris data is valid at the specified simulation time.
   */
  public isCachedEphemerisValid(simTime: number): boolean {
    return this._lastEphemerisTime !== undefined && Math.abs(simTime - this._lastEphemerisTime) < this.timingOptions.ephemerisExpireTime;
  }

  /**
   * Erases this satellite's cached ephemeris data.
   */
  public eraseCachedEphemeris(): void {
    this._lastEphemerisTime = undefined;
  }

  /**
   * Sets whether this satellite is being tracked by a receiver channel.
   * @param tracked Whether this satellite is being tracked by a receiver channel.
   */
  public setTracked(tracked: boolean): void {
    if (this.isTracked === tracked) {
      return;
    }

    this.isTracked = tracked;

    this.timeSpentAcquiring = undefined;
    this.timeToAcquire = undefined;
    this.timeToDownloadEphemeris = undefined;
    this._areDiffCorrectionsDownloaded = false;
    this.timeToDownloadCorrections = undefined;

    if (tracked || this.state.get() !== GPSSatelliteState.Unreachable) {
      this.state.set(GPSSatelliteState.None);
    }
  }

  /**
   * Updates the state of the satellite.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param deltaTime The amount of sim time that has elapsed since the last update, in milliseconds.
   * @param distanceFromLastKnownPos The distance, in great-arc radians, from the airplane's current actual position to
   * its last known position.
   * @param forceAcquireAndUse Whether to force this satellite to the highest possible use state
   * ({@link GPSSatelliteState.DataCollected}) if signal strength is sufficient.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  public updateState(simTime: number, deltaTime: number, distanceFromLastKnownPos: number, forceAcquireAndUse: boolean): boolean {
    const stateChanged = this.isTracked
      ? this.updateStateTracked(simTime, deltaTime, distanceFromLastKnownPos, forceAcquireAndUse)
      : this.updateStateUntracked(simTime);

    switch (this.state.get()) {
      case GPSSatelliteState.Unreachable:
        if (this.isTracked) {
          this._lastUnreachableTime = simTime;
        }
        break;
      case GPSSatelliteState.DataCollected:
      case GPSSatelliteState.InUse:
      case GPSSatelliteState.InUseDiffApplied:
        this._lastEphemerisTime = simTime;
        break;
    }

    return stateChanged;
  }

  /**
   * Updates the state of the satellite while it is being tracked.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param deltaTime The amount of sim time that has elapsed since the last update, in milliseconds.
   * @param distanceFromLastKnownPos The distance, in great-arc radians, from the airplane's current actual position to
   * its last known position.
   * @param forceAcquireAndUse Whether to force this satellite to the highest possible use state
   * ({@link GPSSatelliteState.DataCollected}) if signal strength is sufficient.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  private updateStateTracked(simTime: number, deltaTime: number, distanceFromLastKnownPos: number, forceAcquireAndUse: boolean): boolean {
    const reachable = this.signalStrength.get() > 0.05;

    if (forceAcquireAndUse) {
      const state = this.state.get();
      if (reachable) {
        if (this.sbasGroup !== undefined) {
          this._areDiffCorrectionsDownloaded = true;
          this.timeToDownloadCorrections = undefined;
        }

        if (state !== GPSSatelliteState.DataCollected) {
          this.timeSpentAcquiring = undefined;
          this.timeToAcquire = undefined;
          this.timeToDownloadEphemeris = undefined;

          this.state.set(GPSSatelliteState.DataCollected);
          return true;
        }
      } else {
        if (state !== GPSSatelliteState.Unreachable) {
          this.timeSpentAcquiring = undefined;
          this.timeToAcquire = undefined;
          this.timeToDownloadEphemeris = undefined;
          this._areDiffCorrectionsDownloaded = false;
          this.timeToDownloadCorrections = undefined;
          this.state.set(GPSSatelliteState.Unreachable);
          return true;
        }
      }
    } else {
      switch (this.state.get()) {
        case GPSSatelliteState.None:
          if (this.timeSpentAcquiring === undefined) {
            this.timeSpentAcquiring = 0;
          }

          this.timeSpentAcquiring += deltaTime;

          if (reachable) {
            if (this.timeToAcquire === undefined) {
              this.timeToAcquire = distanceFromLastKnownPos < 5.80734e-4 /* 2 nautical miles */ && this.isCachedEphemerisValid(simTime)
                ? this.timingOptions.acquisitionTimeWithEphemeris + (Math.random() - 0.5) * this.timingOptions.acquisitionTimeRangeWithEphemeris
                : this.timingOptions.acquisitionTime + (Math.random() - 0.5) * this.timingOptions.acquisitionTimeRange;
            }

            this.timeToAcquire -= deltaTime;

            if (this.timeToAcquire <= 0) {
              this.timeSpentAcquiring = undefined;
              this.timeToAcquire = undefined;

              // If we have valid cached ephemeris data for this satellite, then we can use the cached data for
              // calculating position solutions immediately instead of having to wait to download new ephemeris data.
              if (this.isCachedEphemerisValid(simTime)) {
                this.state.set(GPSSatelliteState.DataCollected);
              } else {
                this.state.set(GPSSatelliteState.Acquired);
              }

              return true;
            }
          } else {
            this.timeToAcquire = undefined;

            if (this.timeSpentAcquiring >= this.timingOptions.acquisitionTimeout) {
              this.timeSpentAcquiring = undefined;
              this.state.set(GPSSatelliteState.Unreachable);
              return true;
            }
          }
          break;
        case GPSSatelliteState.Unreachable:
          if (this._lastUnreachableTime === undefined) {
            this._lastUnreachableTime = simTime;
          } else if (Math.abs(simTime - this._lastUnreachableTime) >= this.timingOptions.unreachableExpireTime) {
            this._lastUnreachableTime = undefined;
            this.state.set(GPSSatelliteState.None);
            return true;
          }
          break;
        case GPSSatelliteState.Acquired:
          if (!reachable) {
            this.timeToDownloadEphemeris = undefined;
            this._areDiffCorrectionsDownloaded = false;
            this.timeToDownloadCorrections = undefined;
            this.state.set(GPSSatelliteState.None);
            return true;
          } else {
            if (this.timeToDownloadEphemeris === undefined) {
              this.timeToDownloadEphemeris = this.sbasGroup === undefined
                ? this.timingOptions.ephemerisDownloadTime
                : this.timingOptions.sbasEphemerisDownloadTime + (Math.random() - 0.5) * this.timingOptions.sbasEphemerisDownloadTimeRange;
            }

            this.timeToDownloadEphemeris -= deltaTime;

            this.updateSbasCorrectionsDownload(deltaTime);

            if (this.timeToDownloadEphemeris <= 0) {
              this.timeToDownloadEphemeris = undefined;
              this.state.set(GPSSatelliteState.DataCollected);
              return true;
            }
          }
          break;
        case GPSSatelliteState.DataCollected:
          if (!reachable) {
            this._areDiffCorrectionsDownloaded = false;
            this.timeToDownloadCorrections = undefined;
            this.state.set(GPSSatelliteState.None);
            return true;
          } else {
            this.updateSbasCorrectionsDownload(deltaTime);
          }
          break;
        case GPSSatelliteState.InUse:
          if (!reachable) {
            this._areDiffCorrectionsDownloaded = false;
            this.timeToDownloadCorrections = undefined;
            this.state.set(GPSSatelliteState.None);
            return true;
          } else {
            this.updateSbasCorrectionsDownload(deltaTime);
          }
          break;
        case GPSSatelliteState.InUseDiffApplied:
          if (!reachable) {
            this._areDiffCorrectionsDownloaded = false;
            this.timeToDownloadCorrections = undefined;
            this.state.set(GPSSatelliteState.None);
            return true;
          } else {
            this.updateSbasCorrectionsDownload(deltaTime);
          }
          break;
      }
    }

    return false;
  }

  /**
   * Updates the download state of SBAS differential corrections from this satellite.
   * @param deltaTime The amount of sim time that has elapsed since the last update, in milliseconds.
   */
  private updateSbasCorrectionsDownload(deltaTime: number): void {
    if (this.sbasGroup === undefined || this._areDiffCorrectionsDownloaded) {
      return;
    }

    if (this.timeToDownloadCorrections === undefined) {
      this.timeToDownloadCorrections = this.timingOptions.sbasCorrectionDownloadTime + (Math.random() - 0.5) * this.timingOptions.sbasCorrectionDownloadTimeRange;
    }

    this.timeToDownloadCorrections -= deltaTime;
    if (this.timeToDownloadCorrections <= 0) {
      this._areDiffCorrectionsDownloaded = true;
      this.timeToDownloadCorrections = undefined;
    }
  }

  /**
   * Updates the state of the satellite while it is not being tracked.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  private updateStateUntracked(simTime: number): boolean {
    if (this.state.get() === GPSSatelliteState.Unreachable) {
      if (this._lastUnreachableTime === undefined) {
        this._lastUnreachableTime = simTime;
      } else if (Math.abs(simTime - this._lastUnreachableTime) >= this.timingOptions.unreachableExpireTime) {
        this._lastUnreachableTime = undefined;
        this.state.set(GPSSatelliteState.None);
        return true;
      }
    }

    return false;
  }

  /**
   * Forces an update of this satellite's state to a specific value.
   * @param simTime The current simulation time, as a Javascript timestamp.
   * @param state The state to which to update this satellite. Defaults to this satellite's current state.
   * @param areDiffCorrectionsDownloaded Whether to force differential corrections to be downloaded. Defaults to the
   * satellite's current differential corrections download state.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  public forceUpdateState(simTime: number, state = this.state.get(), areDiffCorrectionsDownloaded = this._areDiffCorrectionsDownloaded): boolean {
    switch (state) {
      case GPSSatelliteState.Unreachable:
        this.timeSpentAcquiring = undefined;
        this.timeToAcquire = undefined;

        if (this.isTracked) {
          this._lastUnreachableTime = simTime;
        }
      // fallthrough
      case GPSSatelliteState.None:
        this.timeToDownloadEphemeris = undefined;
        this._areDiffCorrectionsDownloaded = false;
        this.timeToDownloadCorrections = undefined;
        break;
      case GPSSatelliteState.DataCollected:
      case GPSSatelliteState.InUse:
      case GPSSatelliteState.InUseDiffApplied:
        this.timeToDownloadEphemeris = undefined;
        this._lastEphemerisTime = simTime;
        break;
    }

    this._areDiffCorrectionsDownloaded = this.sbasGroup !== undefined && areDiffCorrectionsDownloaded;

    if (this.state.get() !== state) {
      this.state.set(state);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Updates whether this satellite is being used to calculate a position solution.
   * @param inUse Whether the satellite is being used to calculate a position solution.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  public updateInUse(inUse: boolean): boolean {
    if (inUse) {
      if (this.state.get() === GPSSatelliteState.DataCollected) {
        this.state.set(GPSSatelliteState.InUse);
        return true;
      }
    } else {
      switch (this.state.get()) {
        case GPSSatelliteState.InUse:
        case GPSSatelliteState.InUseDiffApplied:
          this.state.set(GPSSatelliteState.DataCollected);
          return true;
      }
    }

    return false;
  }

  /**
   * Updates whether differential corrections are applied to this satellite's ranging data when they are used to
   * calculate a position solution.
   * @param apply Whether differential corrections are applied.
   * @returns Whether this satellite's state changed as a result of the update.
   */
  public updateDiffCorrectionsApplied(apply: boolean): boolean {
    switch (this.state.get()) {
      case GPSSatelliteState.InUse:
        if (apply) {
          this.state.set(GPSSatelliteState.InUseDiffApplied);
          return true;
        }
        break;
      case GPSSatelliteState.InUseDiffApplied:
        if (!apply) {
          this.state.set(GPSSatelliteState.InUse);
          return true;
        }
        break;
    }

    return false;
  }
}
