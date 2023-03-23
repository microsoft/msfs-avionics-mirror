import { EventBus, IndexedEventType } from '../data/EventBus';
import { GeoPoint } from '../geo/GeoPoint';
import { UnitType } from '../math/NumberUnit';
import { ReadonlyFloat64Array, Vec2Math, Vec3Math } from '../math/VecMath';
import { Vec2Subject, Vec3Subject } from '../math/VectorSubject';
import { SetSubject } from '../sub/SetSubject';
import { Subject } from '../sub/Subject';
import { SubscribableSet } from '../sub/SubscribableSet';
import { ResourceHeap } from '../utils/resource/ResourceHeap';
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
 * Data used to sync satellite state from primary to replica GPS satellite systems.
 */
type GPSSatStateSyncData = {
  /** The PRN of the satellite. */
  prn: number;

  /** The state of the satellite. */
  state: GPSSatelliteState;
}

/**
 * Events used to sync state between GPSSatComputer instances.
 */
interface GPSSatComputerSyncEvents {
  /** A primary GPS satellite system has recalculated the positions of its satellites. */
  [gps_system_sync_sat_calc: IndexedEventType<'gps_system_sync_sat_calc'>]: void;

  /** A primary GPS satellite system has changed the state of one of its satellites. */
  [gps_system_sync_sat_state_changed: IndexedEventType<'gps_system_sync_sat_state_changed'>]: Readonly<GPSSatStateSyncData>;

  /** A primary GPS satellite system has been reset. */
  [gps_system_sync_reset: IndexedEventType<'gps_system_sync_reset'>]: void;

  /** A full satellite state record has been requested from a replica GPS satellite system. */
  [gps_system_sync_sat_state_request: IndexedEventType<'gps_system_sync_sat_state_request'>]: void;

  /** A response by a primary GPS satellite system to a full satellite state record request. */
  [gps_system_sync_sat_state_response: IndexedEventType<'gps_system_sync_sat_state_response'>]: readonly Readonly<GPSSatStateSyncData>[];
}

/**
 * Events published by the GPSSatComputer system.
 */
export interface GPSSatComputerEvents {
  /** An event published when a GPS satellite changes state. */
  [gps_sat_state_changed: IndexedEventType<'gps_sat_state_changed'>]: GPSSatellite;

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
 * An instrument that computes GPS satellite information.
 */
export class GPSSatComputer implements Instrument {
  private readonly publisher = this.bus.getPublisher<GPSSatComputerEvents>();
  private readonly syncPublisher = this.bus.getPublisher<GPSSatComputerSyncEvents>();

  private readonly stateChangedTopic = `gps_system_state_changed_${this.index}` as const;
  private readonly satStateChangedTopic = `gps_sat_state_changed_${this.index}` as const;
  private readonly satPosCalcTopic = `gps_sat_pos_calculated_${this.index}` as const;

  private readonly sbasStateChangedTopic = `gps_system_sbas_state_changed_${this.index}` as const;

  private readonly pdopTopic = `gps_system_pdop_${this.index}` as const;
  private readonly hdopTopic = `gps_system_hdop_${this.index}` as const;
  private readonly vdopTopic = `gps_system_vdop_${this.index}` as const;

  private readonly satCalcSyncTopic = `gps_system_sync_sat_calc_${this.index}` as const;
  private readonly satStateSyncTopic = `gps_system_sync_sat_state_changed_${this.index}` as const;
  private readonly resetSyncTopic = `gps_system_sync_reset_${this.index}` as const;
  private readonly satStateRequestSyncTopic = `gps_system_sync_sat_state_request_${this.index}` as const;
  private readonly satStateResponseSyncTopic = `gps_system_sync_sat_state_response_${this.index}` as const;

  private ephemerisData: GPSEphemerisRecords = {};
  private sbasData: SBASGroupDefinition[] = [];
  private readonly sbasServiceAreas = new Map<string, ReadonlyFloat64Array[]>();
  private readonly currentSbasGroupsInView = new Set<string>();

  private readonly satellites: GPSSatellite[] = [];

  private readonly ppos = new GeoPoint(0, 0);
  private readonly pposVec = new Float64Array(2);

  private readonly vecHeap = new ResourceHeap(() => Vec3Math.create(), () => { });

  private altitude = 0;
  private previousSimTime = 0;
  private previousUpdate = 0;
  private simTime = 0;
  private _state = GPSSystemState.Searching;
  private _sbasState = GPSSystemSBASState.Disabled;

  private readonly enabledSBASGroups: SubscribableSet<string>;

  private readonly dops = Vec3Math.create();
  private _pdop = -1;
  private _hdop = -1;
  private _vdop = -1;

  private isInit = false;
  private needAcquireAndUse = false;

  private needSatCalc = false;
  private readonly pendingSatStateUpdates = new Map<number, Readonly<GPSSatStateSyncData>>();

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
   * Creates an instance of GPSSat.
   * @param index The index of this GPSSat.
   * @param bus An instance of the event bus.
   * @param ephemerisFile The HTTP path to the ephemeris file to use for computations.
   * @param sbasFile The HTTP path to the SBAS definitions file.
   * @param updateInterval The interval in milliseconds to update the satellite positions.
   * @param enabledSBASGroups The names of the SBAS satellite groups for which signal reception is enabled.
   * @param syncRole This system's sync role. A `primary` system will broadcast sync events through the event bus when
   * satellite positions are calculated, satellite states change, or the system is reset. A `replica` system will
   * listen for the aforementioned sync events on the event bus and set its state accordingly. A system with a sync
   * role of `none` does neither; it maintains its own independent state and does not sync it to other systems.
   */
  constructor(
    public readonly index: number,
    private readonly bus: EventBus,
    private readonly ephemerisFile: string,
    private readonly sbasFile: string,
    private readonly updateInterval: number,
    enabledSBASGroups: Iterable<string> | SubscribableSet<string>,
    public readonly syncRole: 'primary' | 'replica' | 'none' = 'none'
  ) {
    this.enabledSBASGroups = 'isSubscribableSet' in enabledSBASGroups ? enabledSBASGroups : SetSubject.create(enabledSBASGroups);

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
        const sat = new GPSSatellite(satDef.prn, sbasDef.group);

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
    this.publisher.pub(this.stateChangedTopic, this._state, false, true);
    this.publisher.pub(this.sbasStateChangedTopic, this._sbasState, false, true);
    this.publisher.pub(this.pdopTopic, this._pdop, false, true);
    this.publisher.pub(this.hdopTopic, this._hdop, false, true);
    this.publisher.pub(this.vdopTopic, this._vdop, false, true);

    this.loadEphemerisData().then(() => this.loadSbasData()).then(() => {
      this.isInit = true;

      // Setup sync logic.
      if (this.syncRole === 'replica') {
        const sub = this.bus.getSubscriber<GPSSatComputerSyncEvents>();

        sub.on(this.satCalcSyncTopic).handle(() => { this.needSatCalc = true; });
        sub.on(this.satStateSyncTopic).handle(data => { this.pendingSatStateUpdates.set(data.prn, data); });
        sub.on(this.resetSyncTopic).handle(() => { this.reset(); });
        sub.on(this.satStateResponseSyncTopic).handle(response => {
          this.needSatCalc = true;
          response.forEach(data => { this.pendingSatStateUpdates.set(data.prn, data); });
        });

        // Request initial state.
        this.syncPublisher.pub(this.satStateRequestSyncTopic, undefined, true, false);
      } else if (this.syncRole === 'primary') {
        const sub = this.bus.getSubscriber<GPSSatComputerSyncEvents>();

        sub.on(this.satStateRequestSyncTopic).handle(() => {
          this.syncPublisher.pub(this.satStateResponseSyncTopic, this.satellites.map(sat => { return { prn: sat.prn, state: sat.state.get() }; }), true, false);
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
              this.satellites.push(new GPSSatellite(parseInt(prn), undefined, this.ephemerisData[prn]));
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
   * Instantly acquires and starts using all satellites with sufficient signal strength. If signal strength allows,
   * SBAS satellites are instantly promoted to the {@link GPSSatelliteState.Acquired} state, and GPS satellites are
   * instantly promoted to the {@link GPSSatelliteState.InUse}/{@link GPSSatelliteState.InUseDiffApplied} state.
   * 
   * If this system is not initialized, the operation will be delayed until just after initialization, unless `reset()`
   * is called between now and then.
   * 
   * Has no effect if this system is a replica.
   */
  public acquireAndUseSatellites(): void {
    if (this.syncRole === 'replica') {
      return;
    }

    if (this.isInit) {
      this.updateSatellites(0, true, true);
    } else {
      this.needAcquireAndUse = true;
    }
  }

  /**
   * Resets the GPSSatComputer system. This will set the of the system to {@link GPSSystemState.Searching} and the
   * state of every satellite to {@link GPSSatelliteState.None}.
   * 
   * If this system is not initialized, this method has no effect other than to cancel any pending operations triggered
   * by previous calls to `acquireAndUseSatellites()`.
   */
  public reset(): void {
    this.needAcquireAndUse = false;

    if (!this.isInit) {
      return;
    }

    this.satellites.forEach(sat => {
      const currentState = sat.state.get();
      sat.state.set(GPSSatelliteState.None);

      if (currentState !== GPSSatelliteState.None) {
        this.publisher.pub(this.satStateChangedTopic, sat, false, false);
      }
    });

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
        this.previousUpdate = this.simTime;

        return;
      }
    }

    const shouldUpdatePositions = this.syncRole === 'replica'
      ? this.needSatCalc
      : this.simTime >= this.previousUpdate + this.updateInterval;

    this.needSatCalc = false;

    this.updateSatellites(deltaTime, shouldUpdatePositions, false);
  }

  /**
   * Updates the states and optionally the orbital positions of all satellites.
   * @param deltaTime The time elapsed, in milliseconds, since the last satellite update.
   * @param shouldUpdatePositions Whether to update the orbital positions of the satellites.
   * @param forceAcquireAndUse Whether to immediately force satellites to the highest possible use state
   * ({@link GPSSatelliteState.Acquired} for SBAS satellites and {@link GPSSatelliteState.InUse}/
   * {@link GPSSatelliteState.InUseDiffApplied} for GPS satellites) if signal strength is sufficient.
   */
  private updateSatellites(deltaTime: number, shouldUpdatePositions: boolean, forceAcquireAndUse: boolean): void {
    let numAcquiring = 0;
    let numActiveSbas = 0;

    let shouldUpdateDop = shouldUpdatePositions;

    if (shouldUpdatePositions && this.syncRole === 'primary') {
      this.syncPublisher?.pub(this.satCalcSyncTopic, undefined, true, false);
    }

    this.currentSbasGroupsInView.clear();
    const enabledSBASGroups = this.enabledSBASGroups.get();

    for (let i = 0; i < this.satellites.length; i++) {
      const sat = this.satellites[i];

      if (shouldUpdatePositions) {
        sat.computeSatellitePositions(this.simTime);
        sat.applyProjection(this.ppos, this.altitude);
      }

      sat.calculateSignalStrength(this.altitude);

      const updatedState = this.syncRole === 'replica'
        ? sat.forceUpdateState(this.pendingSatStateUpdates.get(sat.prn)?.state ?? sat.state.get())
        : sat.updateState(deltaTime, this._state === GPSSystemState.DiffSolutionAcquired, forceAcquireAndUse);

      if (updatedState) {
        this.publisher.pub(this.satStateChangedTopic, sat, false, false);
        if (this.syncRole === 'primary') {
          this.syncPublisher.pub(this.satStateSyncTopic, { prn: sat.prn, state: sat.state.get() }, true, false);
        }
        shouldUpdateDop = true;
      }

      const satState = sat.state.get();
      if (satState === GPSSatelliteState.Acquired || satState === GPSSatelliteState.DataCollected) {
        numAcquiring++;

        if (sat.sbasGroup !== undefined && enabledSBASGroups.has(sat.sbasGroup)) {
          numActiveSbas++;
          this.currentSbasGroupsInView.add(sat.sbasGroup);
        }
      }
    }

    this.pendingSatStateUpdates.clear();

    let withinSbasArea = false;
    for (const group of this.currentSbasGroupsInView) {
      const coverage = this.sbasServiceAreas.get(group);
      if (coverage !== undefined) {
        withinSbasArea = Vec2Math.pointWithinPolygon(coverage, this.pposVec) ?? false;
      }

      if (withinSbasArea) {
        break;
      }
    }

    const newSBASState = withinSbasArea
      ? GPSSystemSBASState.Active
      : enabledSBASGroups.size === 0 ? GPSSystemSBASState.Disabled : GPSSystemSBASState.Inactive;

    let newSystemState = GPSSystemState.Searching;
    if (numAcquiring > 0) {
      newSystemState = GPSSystemState.Acquiring;
    }

    let pdop = this._pdop, hdop = this._hdop, vdop = this._vdop;

    if (shouldUpdateDop) {
      [pdop, hdop, vdop] = this.calculateDop(this.dops);
    }

    const is3dSolutionPossible = pdop >= 0;

    if (is3dSolutionPossible) {
      newSystemState = numActiveSbas > 0 && withinSbasArea ? GPSSystemState.DiffSolutionAcquired : GPSSystemState.SolutionAcquired;
    }

    if (this._state !== newSystemState) {
      this._state = newSystemState;
      this.publisher.pub(this.stateChangedTopic, newSystemState, false, true);
    }

    if (this._sbasState !== newSBASState) {
      this._sbasState = newSBASState;
      this.publisher.pub(this.sbasStateChangedTopic, newSBASState, false, true);
    }

    if (shouldUpdatePositions) {
      this.previousUpdate = this.simTime;
      this.publisher.pub(this.satPosCalcTopic, undefined, false, false);
    }

    this.setDop(pdop, hdop, vdop);

    this.previousSimTime = this.simTime;
  }

  /**
   * Gets the current satellites that are being tracked by this computer.
   * @returns The collection of current satellites.
   */
  public get sats(): readonly GPSSatellite[] {
    return this.satellites;
  }

  /**
   * Calculates the horizon zenith angle.
   * @returns The calculated horizon zenith angle based on the current altitude.
   */
  public calcHorizonAngle(): number {
    return Math.acos(6378100 / (6378100 + this.altitude));
  }

  /**
   * Calculates dilution of precision values (PDOP, HDOP, VDOP) for the current satellite constellation.
   * @param out The vector to which to write the results.
   * @returns Dilution of precision values for the current satellite constellation, as `[PDOP, HDOP, VDOP]`.
   */
  private calculateDop(out: Float64Array): Float64Array {
    Vec3Math.set(-1, -1, -1, out);

    const satsInUse = this.satellites.filter(sat => {
      const state = sat.state.get();
      return state === GPSSatelliteState.InUse || state === GPSSatelliteState.InUseDiffApplied;
    });

    if (satsInUse.length < 4) {
      return out;
    }

    // Get unit line-of-sight vectors for each satellite
    for (let i = 0; i < satsInUse.length; i++) {
      const [zenith, hour] = satsInUse[i].position.get();
      satsInUse[i] = Vec3Math.setFromSpherical(1, zenith, hour, this.vecHeap.allocate()) as any;
    }

    const satVecs = satsInUse as unknown as Float64Array[];

    // First define line-of-sight matrix L composed of row vectors Si = [xi, yi, zi, 1], where xi, yi, zi are the
    // components of the unit line-of-sight vector for satellite i. Then compute the covariance matrix as C = (LᵀL)⁻¹.

    // P = LᵀL is guaranteed to be symmetric, so we need only compute the upper triangular part of the product.

    const P11 = satVecs.reduce((sum, vec) => sum + vec[0] * vec[0], 0);
    const P12 = satVecs.reduce((sum, vec) => sum + vec[0] * vec[1], 0);
    const P13 = satVecs.reduce((sum, vec) => sum + vec[0] * vec[2], 0);
    const P14 = satVecs.reduce((sum, vec) => sum + vec[0], 0);

    const P22 = satVecs.reduce((sum, vec) => sum + vec[1] * vec[1], 0);
    const P23 = satVecs.reduce((sum, vec) => sum + vec[1] * vec[2], 0);
    const P24 = satVecs.reduce((sum, vec) => sum + vec[1], 0);

    const P33 = satVecs.reduce((sum, vec) => sum + vec[2] * vec[2], 0);
    const P34 = satVecs.reduce((sum, vec) => sum + vec[2], 0);

    const P44 = satVecs.length;

    for (let i = 0; i < satVecs.length; i++) {
      this.vecHeap.free(satVecs[i]);
    }

    // Perform block-wise inversion of LᵀL (which is 4x4, so neatly decomposes into four 2x2 matrices) with optimizations
    // presented in Ingemarsson, C and Gustafsson O, 2015.

    // P = [A  B]
    //     [Bᵀ D]

    // C = P⁻¹ = [E  F]
    //           [Fᵀ H]

    // Since we only care about the variance terms along the diagonal of C, we can skip calculating F.

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

    // Z = XH
    const Z11 = X11 * H11 + X12 * H12;
    const Z12 = X11 * H12 + X12 * H22;
    const Z21 = X21 * H11 + X22 * H12;
    const Z22 = X21 * H12 + X22 * H22;

    // E = V + ZXᵀ (We can skip calculating E12 and E21 since we only care about the diagonal)
    const E11 = V11 + Z11 * X11 + Z12 * X12;
    const E22 = V22 + Z21 * X21 + Z22 * X22;

    // Grab the variance terms var(x), var(y), var(z) along the diagonal of C
    const varX = E11;
    const varY = E22;
    const varZ = H11;

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
   * Sets this system's dilution of precision values, and if they are different from the current values, publishes the
   * new values to the event bus.
   * @param pdop The position DOP value to set.
   * @param hdop The horizontal DOP value to set.
   * @param vdop The vertical DOP valu to set.
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
  private readonly stateChangeTime = (5 + (10 * Math.random())) * 1000;
  private stateChangeTimeRemaining = 0;
  private readonly vec3Cache = [new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3), new Float64Array(3)];

  /** The current satellite state. */
  public readonly state = Subject.create<GPSSatelliteState>(GPSSatelliteState.None);

  /** The current satellite position, in zenith angle radians and hour angle radians. */
  public readonly position = Vec2Subject.create(new Float64Array(2));

  /** The current satellite position, in cartesian coordinates. */
  public readonly positionCartesian = Vec3Subject.create(new Float64Array(3));

  /** The current satellite signal strength. */
  public readonly signalStrength = Subject.create(0);

  private isApplyingDiffCorrections = false;
  private hasComputedPosition = false;

  /**
   * Creates an instance of a GPSSatellite.
   * @param prn The GPS PRN number for this satellite.
   * @param sbasGroup Whether or not this satellite is a SBAS satellite.
   * @param ephemeris The ephemeris data to use for position calculation.
   */
  constructor(public readonly prn: number, public readonly sbasGroup?: string, private readonly ephemeris?: GPSEphemeris) { }

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
   * @param altitude The current plane altitude in meters.
   */
  public calculateSignalStrength(altitude: number): void {
    if (this.hasComputedPosition) {
      const maxZenithAngle = GPSSatellite.calcHorizonAngle(altitude) + (Math.PI / 2);
      const signalStrength = Math.max(0, 1 - (this.position.get()[0] / maxZenithAngle));

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
   * Updates the state of the satellite.
   * @param deltaTime The amount of sim time that has passed, in milliseconds.
   * @param applyDiffCorrections Whether or not to apply differential corrections to this GPS satellite.
   * @param forceAcquireAndUse Whether to force this satellite to the highest possible use state
   * ({@link GPSSatelliteState.Acquired} if this is an SBAS satellite or {@link GPSSatelliteState.InUse}/
   * {@link GPSSatelliteState.InUseDiffApplied} if this is a GPS satellite) if signal strength is sufficient.
   * @returns True if the satellite state changed, false otherwise.
   */
  public updateState(deltaTime: number, applyDiffCorrections: boolean, forceAcquireAndUse: boolean): boolean {
    const reachable = this.signalStrength.get() > 0.05;
    if (this.stateChangeTimeRemaining >= 0) {
      this.stateChangeTimeRemaining -= deltaTime;
    }

    if (forceAcquireAndUse) {
      this.isApplyingDiffCorrections = applyDiffCorrections;

      const state = this.state.get();
      if (reachable) {
        const targetState = this.sbasGroup === undefined
          ? applyDiffCorrections ? GPSSatelliteState.InUseDiffApplied : GPSSatelliteState.InUse
          : GPSSatelliteState.Acquired;

        if (state !== targetState) {
          this.state.set(targetState);
          return true;
        }
      } else {
        if (state !== GPSSatelliteState.Unreachable) {
          this.state.set(GPSSatelliteState.Unreachable);
          return true;
        }
      }
    } else {
      switch (this.state.get()) {
        case GPSSatelliteState.None:
          if (reachable) {
            this.state.set(GPSSatelliteState.Acquired);
            this.stateChangeTimeRemaining = this.stateChangeTime;
            return true;
          } else {
            this.state.set(GPSSatelliteState.Unreachable);
            this.stateChangeTimeRemaining = this.stateChangeTime;
            return true;
          }
        case GPSSatelliteState.Unreachable:
          if (reachable) {
            this.state.set(GPSSatelliteState.Acquired);
            this.stateChangeTimeRemaining = this.stateChangeTime;
            return true;
          }
          break;
        case GPSSatelliteState.Acquired:
          if (!reachable) {
            this.state.set(GPSSatelliteState.Unreachable);
            return true;
          } else if (this.stateChangeTimeRemaining <= 0 && this.sbasGroup === undefined) {
            this.state.set(GPSSatelliteState.DataCollected);
            this.stateChangeTimeRemaining = this.stateChangeTime;
            return true;
          }
          break;
        case GPSSatelliteState.DataCollected:
          if (!reachable) {
            this.state.set(GPSSatelliteState.Unreachable);
            return true;
          } else if (this.stateChangeTimeRemaining <= 0) {
            this.state.set(GPSSatelliteState.InUse);
            this.stateChangeTimeRemaining = this.stateChangeTime;
            return true;
          }
          break;
        case GPSSatelliteState.InUse:
          if (!reachable) {
            this.state.set(GPSSatelliteState.Unreachable);
            return true;
          } else if (applyDiffCorrections) {
            if (this.isApplyingDiffCorrections && this.stateChangeTimeRemaining <= 0) {
              this.state.set(GPSSatelliteState.InUseDiffApplied);
              return true;
            } else if (!this.isApplyingDiffCorrections) {
              this.isApplyingDiffCorrections = true;
              this.stateChangeTimeRemaining = this.stateChangeTime;
            }
          }
          break;
        case GPSSatelliteState.InUseDiffApplied:
          if (!reachable) {
            this.state.set(GPSSatelliteState.Unreachable);
            return true;
          } else if (!applyDiffCorrections) {
            this.isApplyingDiffCorrections = false;
            this.state.set(GPSSatelliteState.InUse);
            return true;
          }
          break;
      }
    }

    return false;
  }

  /**
   * Forces an update of this satellite's state to a specific value.
   * @param state The state to which to update this satellite.
   * @returns Whether the satellite's state was changed as a result of the forced update.
   */
  public forceUpdateState(state: GPSSatelliteState): boolean {
    this.stateChangeTimeRemaining = 0;
    this.isApplyingDiffCorrections = state === GPSSatelliteState.InUseDiffApplied;

    if (this.state.get() !== state) {
      this.state.set(state);
      return true;
    } else {
      return false;
    }
  }
}

/**
 * Possible state on GPS satellites.
 */
export enum GPSSatelliteState {
  /** There is no current valid state. */
  None = 'None',

  /** The satellite is out of view and cannot be reached. */
  Unreachable = 'Unreachable',

  /** The satellite has been found and data is being downloaded. */
  Acquired = 'Acquired',

  /** The satellite is faulty. */
  Faulty = 'Faulty',

  /** The satellite has been found, data is downloaded, but is not presently used in the GPS solution. */
  DataCollected = 'DataCollected',

  /** The satellite is being active used in the GPS solution. */
  InUse = 'InUse',

  /** The satellite is being active used in the GPS solution and SBAS differential corrections are being applied. */
  InUseDiffApplied = 'InUseDiffApplied'
}

/**
 * Possible {@link GPSSatComputer} states.
 */
export enum GPSSystemState {
  /** The GPS receiver is trying to locate satellites. */
  Searching = 'Searching',

  /** The GPS receiver has found satellites and is acquiring a solution. */
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