import {
  AirportFacility, AirportFacilityDataFlags, EventBus, FacilityType, ICAO, IcaoType, IcaoValue, OneWayRunway,
  ReadonlySubEvent, RunwayUtils, SubEvent, Subject, Subscribable, Subscription, UnitType, UserSetting, Value
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId, ToldControlEvents, ToldResetType, ToldUserSettings } from '@microsoft/msfs-wtg3000-common';

/**
 * A manager of takeoff/landing (TOLD) data. The manager automatically sets the TOLD origin and destination based on
 * changes to the primary flight plan and populates the TOLD runway parameter settings (length, elevation, heading,
 * gradient) with database values when an origin or destination runway is selected. The manager also responds to
 * commands published to event bus topics defined in `ToldControlEvents`.
 */
export class ToldManager {
  private readonly toldSettingManager = ToldUserSettings.getManager(this.bus);

  private readonly originIcaoSetting = this.toldSettingManager.getSetting('toldOriginIcao');

  private readonly destinationIcaoSetting = this.toldSettingManager.getSetting('toldDestinationIcao');

  private fplOriginIcao: IcaoValue | undefined;
  private fplDestinationIcao: IcaoValue | undefined;

  private readonly _originAirport = Subject.create<AirportFacility | null>(null);
  /** The selected TOLD origin airport. */
  public readonly originAirport = this._originAirport as Subscribable<AirportFacility | null>;
  private readonly _originRunway = Subject.create<OneWayRunway | null>(null);
  /** The selected TOLD origin runway. */
  public readonly originRunway = this._originRunway as Subscribable<OneWayRunway | null>;
  private readonly originOpId = Value.create(0);

  private readonly _destinationAirport = Subject.create<AirportFacility | null>(null);
  /** The selected TOLD destination airport. */
  public readonly destinationAirport = this._destinationAirport as Subscribable<AirportFacility | null>;
  private readonly _destinationRunway = Subject.create<OneWayRunway | null>(null);
  /** The selected TOLD destination airport. */
  public readonly destinationRunway = this._destinationRunway as Subscribable<OneWayRunway | null>;
  private readonly destinationOpId = Value.create(0);

  private readonly _onReset = new SubEvent<this, ToldResetType>();
  /** An event that is triggered when this manager is reset. The event's data is the type of reset that was executed. */
  public readonly onReset = this._onReset as ReadonlySubEvent<this, ToldResetType>;

  private isAlive = true;
  private isInit = false;
  private isResumed = false;

  private fplOriginDestSub?: Subscription;
  private fplProcDetailsSub?: Subscription;
  private originIcaoSub?: Subscription;
  private destinationIcaoSub?: Subscription;
  private resetSub?: Subscription;

  /**
   * Creates a new instance of ToldManager.
   * @param bus The event bus.
   * @param fms The FMS.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms<G3000FlightPlannerId>
  ) {
  }

  /**
   * Initializes this manager. Once initialized, the manager will perform its automatic functions unless it is paused.
   * @param paused Whether to initialize this manager as paused. Defaults to `false`.
   * @throws Error if this manager has been destroyed.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('ToldManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.initOriginDestAutoUpdateLogic();

    // Initialize origin/dest logic.

    this.originIcaoSub = this.originIcaoSetting.sub(this.onOriginDestIcaoChanged.bind(
      this, this.originOpId, this.originIcaoSetting, this._originAirport, this._originRunway,
    ), false, true);

    this.destinationIcaoSub = this.destinationIcaoSetting.sub(this.onOriginDestIcaoChanged.bind(
      this, this.destinationOpId, this.destinationIcaoSetting, this._destinationAirport, this._destinationRunway,
    ), false, true);

    // Initialize runway logic.

    this._originRunway.sub(this.onRunwayChanged.bind(this, true), true);
    this._destinationRunway.sub(this.onRunwayChanged.bind(this, false), true);

    // Initialize control event listeners.

    const sub = this.bus.getSubscriber<ToldControlEvents>();

    this.resetSub = sub.on('told_reset').handle(this.reset.bind(this), true);

    if (!paused) {
      this.resume();
    }
  }

  /**
   * Initializes the logic that automatically updates the TOLD origin and destination settings based on the primary
   * flight plan origin and destination.
   */
  private initOriginDestAutoUpdateLogic(): void {
    this.fplOriginDestSub = this.fms.flightPlanner.onEvent('fplOriginDestChanged').handle(e => {
      if (e.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.onFlightPlanOriginDestChanged();
      }
    }, true);

    this.fplProcDetailsSub = this.fms.flightPlanner.onEvent('fplProcDetailsChanged').handle(e => {
      if (e.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.onFlightPlanOriginDestChanged();
      }
    }, true);
  }

  /**
   * Resumes this manager. Once resumed, this computer will perform its automatic functions.
   * @throws Error if this manager has been destroyed.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('ToldManager: cannot resume a dead computer');
    }

    if (!this.isInit || this.isResumed) {
      return;
    }

    this.isResumed = true;

    this.onFlightPlanOriginDestChanged();
    this.fplOriginDestSub!.resume();
    this.fplProcDetailsSub!.resume();
    this.originIcaoSub!.resume(true);
    this.destinationIcaoSub!.resume(true);
    this.resetSub!.resume();
  }

  /**
   * Pauses this manager. Once paused, this computer will not perform its automatic functions until it is resumed.
   * @throws Error if this manager has been destroyed.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('ToldManager: cannot pause a dead computer');
    }

    if (!this.isInit || !this.isResumed) {
      return;
    }

    this.isResumed = false;

    this.fplOriginDestSub!.pause();
    this.fplProcDetailsSub!.pause();
    this.originIcaoSub!.pause();
    this.destinationIcaoSub!.pause();
    this.resetSub!.pause();
  }

  /**
   * Resets this manager. Reverts TOLD origin, destination, and runway parameter settings to their defaults. Has no
   * effect if this manager is not initialized.
   * @param type The type of reset to execute.
   * @throws Error if this manager has been destroyed.
   */
  public reset(type: ToldResetType): void {
    if (!this.isAlive) {
      throw new Error('ToldManager: cannot reset a dead manager');
    }

    if (!this.isInit) {
      return;
    }

    if (type === ToldResetType.All || type === ToldResetType.Takeoff) {
      this.originIcaoSetting.resetToDefault();
      this.toldSettingManager.getSetting('toldTakeoffDistanceRequired').resetToDefault();
    }

    if (type === ToldResetType.All || type === ToldResetType.Landing) {
      this.toldSettingManager.getSetting('toldDestinationDefaultApplied').resetToDefault();
      this.destinationIcaoSetting.resetToDefault();
      this.toldSettingManager.getSetting('toldLandingDistanceRequired').resetToDefault();
    }

    this._onReset.notify(this, type);
  }

  /**
   * Responds to when the origin or destination of the primary flight plan changes.
   */
  private onFlightPlanOriginDestChanged(): void {
    if (!this.fms.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.fms.getPrimaryFlightPlan();

    // ---- Origin ----

    const originAirportIcao = plan.originAirportIcao;
    const originRunway = plan.procedureDetails.originRunway;

    let originIcao: IcaoValue | undefined;

    if (originAirportIcao !== undefined && ICAO.isValueFacility(originAirportIcao, FacilityType.Airport)) {
      if (originRunway !== undefined) {
        originIcao = RunwayUtils.getRunwayFacilityIcaoValue(originAirportIcao, originRunway);
      } else {
        originIcao = originAirportIcao;
      }
    }

    // Note: originIcao at this point cannot be the empty ICAO. It is either undefined or an airport/runway ICAO.

    if (
      !!originIcao !== !!this.fplOriginIcao
      || (this.fplOriginIcao && !ICAO.valueEquals(this.fplOriginIcao, originIcao!))
    ) {
      this.fplOriginIcao = originIcao;
      this.originIcaoSetting.value = originIcao ? ICAO.tryValueToStringV2(originIcao) : '';
    }

    // ---- Destination ----

    const destinationAirportIcao = plan.destinationAirportIcao;
    const destinationRunway = plan.procedureDetails.destinationRunway;

    let destinationIcao: IcaoValue | undefined;

    if (destinationAirportIcao !== undefined && ICAO.isValueFacility(destinationAirportIcao, FacilityType.Airport)) {
      if (destinationRunway !== undefined) {
        destinationIcao = RunwayUtils.getRunwayFacilityIcaoValue(destinationAirportIcao, destinationRunway);
      } else {
        destinationIcao = destinationAirportIcao;
      }
    }

    // Note: destinationIcao at this point cannot be the empty ICAO. It is either undefined or an airport/runway ICAO.

    if (
      !!destinationIcao !== !!this.fplDestinationIcao
      || (this.fplDestinationIcao && !ICAO.valueEquals(this.fplDestinationIcao, destinationIcao!))
    ) {
      this.fplDestinationIcao = destinationIcao;
      this.destinationIcaoSetting.value = destinationIcao ? ICAO.tryValueToStringV2(destinationIcao) : '';
    }
  }

  /**
   * Responds to when the origin/destination ICAO changes.
   * @param opIdValue A value containing the current operation ID for responding to the ICAO change.
   * @param setting The ICAO setting.
   * @param airportSubject The airport subject associated with the ICAO.
   * @param runwaySubject The runway subject associated with the ICAO.
   * @param icao The new origin/destination ICAO string (V2).
   */
  private async onOriginDestIcaoChanged(
    opIdValue: Value<number>,
    setting: UserSetting<string>,
    airportSubject: Subject<AirportFacility | null>,
    runwaySubject: Subject<OneWayRunway | null>,
    icao: string,
  ): Promise<void> {
    const airport = airportSubject.get();

    const icaoValue = ICAO.stringV2ToValue(icao);

    const isRunway = ICAO.isValueFacility(icaoValue, FacilityType.RWY);
    const isAirport = !isRunway && ICAO.isValueFacility(icaoValue, FacilityType.Airport);

    if (!isRunway && !isAirport) {
      airportSubject.set(null);
      runwaySubject.set(null);
      return;
    }

    const airportIcao = isAirport ? icaoValue : ICAO.value(IcaoType.Airport, '', '', icaoValue.airport);
    let airportFacility: AirportFacility | null = null;

    if (!airport || !ICAO.valueEquals(airport.icaoStruct, airportIcao)) {
      const opId = opIdValue.get() + 1;
      opIdValue.set(opId);

      airportFacility = await this.fms.facLoader.tryGetFacility(FacilityType.Airport, airportIcao, AirportFacilityDataFlags.Runways);

      if (opId !== opIdValue.get()) {
        return;
      }

      if (!airportFacility) {
        console.warn(`ToldManager: could not retrieve airport facility for ICAO: ${icao}`);
        setting.value = '';
        return;
      }

      airportSubject.set(airportFacility);
    } else {
      airportFacility = airport;
    }

    if (isRunway) {
      const runway = RunwayUtils.matchOneWayRunwayFromIdent(airportFacility, icaoValue.ident);
      if (runway === undefined) {
        console.warn(`ToldManager: could not retrieve runway for ICAO: ${icao}`);
        setting.value = ICAO.tryValueToStringV2(airportFacility.icaoStruct);
      } else {
        runwaySubject.set(runway);
      }
    } else {
      runwaySubject.set(null);
    }
  }

  /**
   * Responds to when a takeoff/landing runway changes.
   *
   * If the new runway is `null`, then the associated runway parameters are reset to their uninitialized states. If the
   * new runway is not `null`, then the associated runway parameters are loaded from the database values for the
   * runway.
   * @param isTakeoff Whether the changed runway was the takeoff runway.
   * @param runway The new runway.
   */
  private onRunwayChanged(isTakeoff: boolean, runway: OneWayRunway | null): void {
    const settingString = isTakeoff ? 'Takeoff' : 'Landing';

    const lengthSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayLength`);
    const elevationSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayElevation`);
    const headingSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayHeading`);
    const gradientSetting = this.toldSettingManager.getSetting(`told${settingString}RunwayGradient`);

    if (runway === null) {
      lengthSetting.value = -1;
      elevationSetting.value = Number.MIN_SAFE_INTEGER;
      headingSetting.value = -1;
      gradientSetting.value = Number.MIN_SAFE_INTEGER;
    } else {
      lengthSetting.value = UnitType.METER.convertTo(runway.length - (isTakeoff ? 0 : runway.startThresholdLength), UnitType.FOOT);
      elevationSetting.value = UnitType.METER.convertTo(runway.elevation, UnitType.FOOT);
      headingSetting.value = runway.course;
      gradientSetting.value = runway.gradient * 100;
    }
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer perform its automatic functions and cannot be
   * paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.fplOriginDestSub?.destroy();
    this.fplProcDetailsSub?.destroy();
    this.originIcaoSub?.destroy();
    this.destinationIcaoSub?.destroy();
    this.resetSub?.destroy();
  }
}
