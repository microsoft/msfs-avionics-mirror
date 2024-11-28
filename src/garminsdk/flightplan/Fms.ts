import {
  Accessible, ActiveLegType, AdcEvents, AdditionalApproachType, AirportFacility, AirwayData,
  AltitudeConstraintAdvanced, AltitudeConstraintSimple, AltitudeRestrictionType, ApproachProcedure, ApproachUtils,
  ArrivalProcedure, BaseCdiControlEvents, BaseLNavControlEvents, BaseLNavObsControlEvents, BaseVNavControlEvents,
  BitFlags, CdiControlEvents, CdiEvents, CdiUtils, Consumer, ConsumerSubject, ConsumerValue, ControlEvents,
  DebounceTimer, DepartureProcedure, EventBus, EventSubscriber, Facility, FacilityLoader, FacilityRepository, FacilityType,
  FixTypeFlags, FlightPathCalculator, FlightPathUtils, FlightPlan, FlightPlanLeg, FlightPlanner, FlightPlanSegment,
  FlightPlanSegmentType, FlightPlanUtils, GeoCircle, GeoPoint, GeoPointInterface, GNSSEvents, ICAO, IcaoValue,
  IntersectionFacility, LatLonInterface, LegDefinition, LegDefinitionFlags, LegTurnDirection, LegType,
  LNavControlEvents, LNavEvents, LNavObsControlEvents, LNavObsEvents, LNavUtils, MathUtils, NavComSimVars, NavEvents,
  NavRadioIndex, NavSourceId, NavSourceType, ObjectSubject, OneWayRunway, RnavTypeFlags, RunwayUtils, SimVarValueType,
  SpeedConstraint, SpeedRestrictionType, SpeedUnit, UnitType, UserFacility, VerticalData, VerticalFlightPhase,
  VisualFacility, VNavControlEvents, VNavPathCalculator, VNavUtils, VorFacility, Wait
} from '@microsoft/msfs-sdk';

import { GarminVNavUtils } from '../autopilot/vnav/GarminVNavUtils';
import { GarminControlEvents } from '../instruments/GarminControlEvents';
import { BaseFmsEvents, FmsEvents, FmsEventsForId } from './FmsEvents';
import { FmsFplUserDataKey, FmsFplVfrApproachData, FmsFplVisualApproachData } from './FmsFplUserDataTypes';
import {
  AirwayLegType, ApproachDetails, DirectToState, FmsFlightPhase, GarminAdditionalApproachType, GarminApproachType,
  ProcedureType
} from './FmsTypes';
import { FmsUtils } from './FmsUtils';

/**
 * Options for visual approach procedures.
 */
export type FmsVisualApproachOptions = {
  /** The distance from the FINAL fix to the runway fix, in nautical miles. */
  finalFixDistance: number;

  /** The distance from the STRGHT fix to the FINAL fix, in nautical miles. */
  strghtFixDistance: number;
};

/**
 * Configuration options for {@link Fms}.
 */
export type FmsOptions = {
  /** The index of the LNAV associated with the FMS's active flight plan. Defaults to `0`. */
  lnavIndex?: number;

  /**
   * Whether to use the sim's native OBS state. If `true`, then the sim's OBS state as exposed through the event bus
   * topics defined in `NavEvents` will be used, and standard sim OBS key events will be used to control the state. If
   * `false`, then the OBS state exposed through the event bus topics defined in `LNavObsEvents` will be used, and
   * control events defined in `LNavObsControlEvents` will be used to control the state. Defaults to `true`.
   */
  useSimObsState?: boolean;

  /**
   * The index of the VNAV associated with the FMS's flight plans. Defaults to `0`. If a vertical path calculator is
   * not provided to the FMS, then this option will be ignored.
   */
  vnavIndex?: number;

  /** The ID of the CDI associated with the FMS. Defaults to the empty string (`''`). */
  cdiId?: string;

  /** Whether advanced VNAV is supported. Defaults to `false`. */
  isAdvancedVnav?: boolean;

  /**
   * A function that maps flight plan legs in a procedure to flight plan legs to insert into a flight plan when loading
   * the procedure. If the function returns `undefined`, then the corresponding procedure leg will be omitted from the
   * flight plan entirely. If not defined, then all procedure flight plan legs are inserted into the flight plan
   * without modification.
   */
  procedureLegMapper?: (leg: FlightPlanLeg) => undefined | FlightPlanLeg;

  /**
   * Options for visual approach procedures. If not defined, then visual approach fix distances will default to 2.5
   * nautical miles for both runway to FINAL and FINAL to STRGHT.
   */
  visualApproachOptions?: Readonly<FmsVisualApproachOptions>;

  /**
   * The indexes of the sim NAV radios for which the FMS automatically tunes approach frequencies. The FMS will respect
   * changes made to the iterable after the FMS is created. Defaults to `[1, 2]`.
   */
  navRadioIndexes?: Iterable<NavRadioIndex>;

  /**
   * Whether to prevent the FMS from publishing the FMS flight phase approach active status to the `approach_available`
   * event bus topic. Defaults to `false`.
   */
  disableApproachAvailablePublish?: boolean;
};

/** Interface for inverting the plan */
interface LegListItem {
  /** the leg icao */
  icao: IcaoValue;
  /** the airway to this leg, if any */
  airway?: string;
}

/**
 * A leg in an insert procedure object.
 */
type InsertProcedureObjectLeg = FlightPlanLeg & {
  /** Leg definition flags to apply when adding the leg to the flight plan. */
  legDefinitionFlags?: number;
};

/**
 * A type definition for inserting procedure legs and runway, if it exists.
 */
type InsertProcedureObject = {
  /** The Procedure Legs */
  procedureLegs: InsertProcedureObjectLeg[],
  /** The OneWayRunway Object if it exists */
  runway?: OneWayRunway
};

/**
 * Events published by `Fms` to sync data across instruments keyed by base topic names.
 */
interface BaseFmsSyncEvents {
  /** Approach details sync event. */
  fms_approach_details_sync: Readonly<ApproachDetails>;
}

/**
 * All possible events published by `Fms` to sync data across instruments.
 */
type FmsSyncEvents = {
  [P in keyof BaseFmsSyncEvents as P | `${P}_${string}`]: BaseFmsSyncEvents[P];
};

/**
 * A Garmin flight management system.
 */
export class Fms<ID extends string = any> {
  /** The index of the primary flight plan. */
  public static readonly PRIMARY_PLAN_INDEX = FmsUtils.PRIMARY_PLAN_INDEX;

  /** The index of the off-route direct-to flight plan. */
  public static readonly DTO_RANDOM_PLAN_INDEX = FmsUtils.DTO_RANDOM_PLAN_INDEX;

  /** The index of the procedure preview flight plan. */
  public static readonly PROC_PREVIEW_PLAN_INDEX = FmsUtils.PROC_PREVIEW_PLAN_INDEX;

  /** Amount to offset runway leg altitude constraints from runway elevation, in meters. */
  private static readonly RUNWAY_LEG_ALTITUDE_OFFSET = 15;

  private static readonly DEFAULT_VISUAL_APPROACH_OPTIONS: Readonly<FmsVisualApproachOptions> = {
    finalFixDistance: 2.5,
    strghtFixDistance: 2.5
  };

  private static readonly VTF_FAF_DATA_KEY = 'vtf_faf_data';

  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly fmsTopicMap: {
    [P in keyof (BaseFmsEvents & BaseFmsSyncEvents)]: P | `${P}_${string}`
  };

  private readonly eventSubscriber = this.bus.getSubscriber<FmsEventsForId<ID>>();

  private readonly publisher = this.bus.getPublisher<
    FmsEvents & FmsSyncEvents & LNavControlEvents & LNavObsControlEvents & VNavControlEvents & CdiControlEvents
    & Pick<ControlEvents, 'approach_available'>
  >();

  /** The index of the LNAV associated with the FMS's active flight plan. */
  public readonly lnavIndex: number;

  private readonly useSimObsState: boolean;

  private readonly lnavControlTopicMap: {
    [P in keyof BaseLNavControlEvents]: P | `${P}_${number}`
  };
  private readonly obsControlTopicMap: {
    [P in keyof Pick<BaseLNavObsControlEvents, 'lnav_obs_set_active'>]: P | `${P}_${number}`
  };

  /** The index of the VNAV associated with the FMS's flight plans, or `-1` if this FMS does not support VNAV functionality. */
  public readonly vnavIndex: number;

  private readonly vnavControlTopicMap?: {
    [P in keyof Pick<BaseVNavControlEvents, 'vnav_set_vnav_direct_to'>]: P | `${P}_${number}`
  };

  /** The ID of the CDI associated with this FMS. */
  public readonly cdiId: string;

  private readonly cdiControlTopicMap: {
    [P in keyof Pick<BaseCdiControlEvents, 'cdi_src_set'>]: P | `${P}_${string}`
  };

  /** Whether advanced VNAV is supported. */
  public readonly isAdvancedVnav: boolean;

  private readonly procedureLegMapFunc: (leg: FlightPlanLeg) => undefined | FlightPlanLeg;

  private readonly visualApproachOptions: Readonly<FmsVisualApproachOptions>;

  private readonly navRadioIndexes: Iterable<NavRadioIndex>;

  private readonly disableApproachAvailablePublish: boolean;

  public readonly ppos = new GeoPoint(0, 0);

  private readonly facRepo = FacilityRepository.getRepository(this.bus);
  /** A facility loader instance. */
  public readonly facLoader = new FacilityLoader(this.facRepo);

  private readonly approachDetails = ObjectSubject.create<ApproachDetails>(FmsUtils.createEmptyApproachDetails());
  private needPublishApproachDetails = false;
  private updateApproachDetailsOpId = 0;

  private readonly flightPhase = ObjectSubject.create<FmsFlightPhase>(FmsUtils.createEmptyFlightPhase());
  private needPublishFlightPhase = false;

  private readonly flightPhaseDebounceTimer = new DebounceTimer();
  private readonly updateFlightPhaseFunc = this.updateFlightPhase.bind(this);

  private readonly activateMaprState = ConsumerSubject.create(null, false);

  private readonly navActiveFreqs: Record<NavRadioIndex, Accessible<number>>;

  private cdiSource: Readonly<NavSourceId> = { type: NavSourceType.Gps, index: 1 };

  private readonly indicatedAlt: ConsumerValue<number>;
  private readonly lnavTrackedLegIndex = ConsumerSubject.create(null, 0);
  private readonly lnavLegDistanceRemaining: ConsumerValue<number>;

  private readonly isObsActive = ConsumerSubject.create(null, false);
  private readonly obsCourse = ConsumerSubject.create(null, 0);
  private readonly needConvertObsToDtoSimVar = `L:Garmin_Need_OBS_Convert_DirectTo${this.flightPlanner.id === '' ? '' : `_${this.flightPlanner.id}`}`;

  /**
   * Creates an instance of the FMS.
   * @param isPrimary Whether this FMS is the primary instance. Only the primary FMS will execute certain operations
   * that have global effects across the entire airplane.
   * @param bus The event bus.
   * @param flightPlanner The flight planner.
   * @param verticalPathCalculator The vertical path calculator. Required to support the vertical direct-to
   * functionality.
   * @param options Options with which to configure the FMS.
   */
  public constructor(
    isPrimary: boolean,
    bus: EventBus,
    flightPlanner: FlightPlanner<ID>,
    verticalPathCalculator?: VNavPathCalculator,
    options?: Readonly<FmsOptions>
  );
  /**
   * Creates an instance of the FMS.
   * @param isPrimary Whether this FMS is the primary instance. Only the primary FMS will execute certain operations
   * that have global effects across the entire airplane.
   * @param bus The event bus.
   * @param flightPlanner The flight planner.
   * @param verticalPathCalculator The vertical path calculator. Required to support the vertical direct-to
   * functionality.
   * @param isAdvancedVnav Whether advanced VNAV is supported. Defaults to `false`.
   * @param procedureLegMapper A function which transforms unsupported leg types in procedures to supported leg types.
   * If not defined, all legs in procedures will retain their original types.
   * @param visualApproachOptions Options for visual approach procedures. If not defined, then visual approach fix
   * distances will default to 2.5 nautical miles for both runway to FINAL and FINAL to STRGHT.
   */
  public constructor(
    isPrimary: boolean,
    bus: EventBus,
    flightPlanner: FlightPlanner<ID>,
    verticalPathCalculator?: VNavPathCalculator,
    isAdvancedVnav?: boolean,
    procedureLegMapper?: (leg: FlightPlanLeg) => undefined | FlightPlanLeg,
    visualApproachOptions?: Readonly<FmsVisualApproachOptions>
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    public readonly isPrimary: boolean,
    public readonly bus: EventBus,
    public readonly flightPlanner: FlightPlanner<ID>,
    public readonly verticalPathCalculator?: VNavPathCalculator,
    arg5?: Readonly<FmsOptions> | boolean,
    procedureLegMapper?: (leg: FlightPlanLeg) => undefined | FlightPlanLeg,
    visualApproachOptions?: Readonly<FmsVisualApproachOptions>
  ) {
    let options: FmsOptions;

    if (typeof arg5 === 'object') {
      options = arg5;
    } else {
      options = {
        isAdvancedVnav: arg5,
        procedureLegMapper,
        visualApproachOptions
      };
    }

    const fmsTopicSuffix = this.flightPlanner.id === '' ? '' : `_${this.flightPlanner.id}` as `_${string}`;
    this.fmsTopicMap = {
      'fms_approach_details': `fms_approach_details${fmsTopicSuffix}`,
      'fms_flight_phase': `fms_flight_phase${fmsTopicSuffix}`,
      'fms_approach_activate': `fms_approach_activate${fmsTopicSuffix}`,
      'approach_supports_gp': `approach_supports_gp${fmsTopicSuffix}`,
      'fms_approach_details_sync': `fms_approach_details_sync${fmsTopicSuffix}`
    };

    this.lnavIndex = options.lnavIndex ?? 0;
    if (!LNavUtils.isValidLNavIndex(this.lnavIndex)) {
      throw new Error(`Fms: invalid LNAV index (${this.lnavIndex}) specified (must be a non-negative integer)`);
    }

    this.useSimObsState = options.useSimObsState ?? true;

    const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.lnavIndex);
    this.lnavControlTopicMap = {
      'suspend_sequencing': `suspend_sequencing${lnavTopicSuffix}`,
      'lnav_inhibit_next_sequence': `lnav_inhibit_next_sequence${lnavTopicSuffix}`,
      'activate_missed_approach': `activate_missed_approach${lnavTopicSuffix}`
    };
    this.obsControlTopicMap = {
      'lnav_obs_set_active': `lnav_obs_set_active${lnavTopicSuffix}`,
    };

    this.vnavIndex = this.verticalPathCalculator ? options.vnavIndex ?? 0 : -1;
    if (this.verticalPathCalculator && !VNavUtils.isValidVNavIndex(this.vnavIndex)) {
      throw new Error(`Fms: invalid VNAV index (${this.vnavIndex}) specified (must be a non-negative integer)`);
    }

    if (this.vnavIndex >= 0) {
      const vnavTopicSuffix = VNavUtils.getEventBusTopicSuffix(this.vnavIndex);
      this.vnavControlTopicMap = {
        'vnav_set_vnav_direct_to': `vnav_set_vnav_direct_to${vnavTopicSuffix}`,
      };
    }

    this.cdiId = options.cdiId ?? '';

    const cdiTopicSuffix = CdiUtils.getEventBusTopicSuffix(this.cdiId);
    this.cdiControlTopicMap = {
      'cdi_src_set': `cdi_src_set${cdiTopicSuffix}`,
    };

    this.isAdvancedVnav = options.isAdvancedVnav ?? false;
    this.procedureLegMapFunc = options.procedureLegMapper ?? (leg => leg);
    this.visualApproachOptions = Object.assign({}, options.visualApproachOptions ?? Fms.DEFAULT_VISUAL_APPROACH_OPTIONS);

    this.navRadioIndexes = options.navRadioIndexes ?? [1, 2];

    this.disableApproachAvailablePublish = options.disableApproachAvailablePublish ?? false;

    const sub = this.bus.getSubscriber<
      AdcEvents & GNSSEvents & NavEvents & CdiEvents & FmsEvents & FmsSyncEvents & NavComSimVars & LNavEvents & LNavObsEvents
      & LNavControlEvents & ControlEvents & GarminControlEvents
    >();

    sub.on('gps-position').atFrequency(1).handle(pos => this.ppos.set(pos.lat, pos.long));
    sub.on(`cdi_select${cdiTopicSuffix}`).handle(source => this.cdiSource = source);

    this.flightPlanner.onEvent('fplIndexChanged').handle(() => { this.scheduleUpdateFlightPhase(); });
    this.flightPlanner.onEvent('fplActiveLegChange').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex && e.type === ActiveLegType.Lateral) {
        this.scheduleUpdateFlightPhase();
      }
    });
    this.flightPlanner.onEvent('fplSegmentChange').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex) {
        this.scheduleUpdateFlightPhase();
      }
    });
    this.flightPlanner.onEvent('fplLegChange').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex) {
        this.scheduleUpdateFlightPhase();
      }
    });
    this.flightPlanner.onEvent('fplLoaded').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex) {
        this.updateApproachDetails();
        this.scheduleUpdateFlightPhase();
      }
    });
    this.flightPlanner.onEvent('fplCopied').handle(e => {
      if (e.planIndex === this.flightPlanner.activePlanIndex) {
        this.updateApproachDetails();
        this.scheduleUpdateFlightPhase();
      }
    });

    if (this.isPrimary) {
      this.initObsDeactivationListener();
    }

    this.navActiveFreqs = {
      1: ConsumerValue.create(sub.on('nav_active_frequency_1'), 0),
      2: ConsumerValue.create(sub.on('nav_active_frequency_2'), 0),
      3: ConsumerValue.create(sub.on('nav_active_frequency_3'), 0),
      4: ConsumerValue.create(sub.on('nav_active_frequency_3'), 0)
    };

    this.activateMaprState.setConsumer(sub.on(this.lnavControlTopicMap['activate_missed_approach']));

    this.activateMaprState.sub(activate => {
      if (activate) {
        this.publisher.pub(this.lnavControlTopicMap['suspend_sequencing'], false, true, false);
      }
    }, true);

    this.indicatedAlt = ConsumerValue.create(sub.on('indicated_alt'), 0);
    this.lnavTrackedLegIndex.setConsumer(sub.on(`lnav_tracked_leg_index${lnavTopicSuffix}`));
    this.lnavLegDistanceRemaining = ConsumerValue.create(sub.on(`lnav_leg_distance_remaining${lnavTopicSuffix}`), 0);

    this.isObsActive.setConsumer(sub.on(this.useSimObsState ? 'gps_obs_active' : `lnav_obs_active${lnavTopicSuffix}`));
    this.obsCourse.setConsumer(sub.on(this.useSimObsState ? 'gps_obs_value' : `lnav_obs_course${lnavTopicSuffix}`));

    this.approachDetails.sub(() => { this.needPublishApproachDetails = true; });
    this.flightPhase.sub(() => { this.needPublishFlightPhase = true; });

    // Publish initial approach details and flight phase to have cached values available.
    this.publisher.pub(this.fmsTopicMap['fms_approach_details'], this.approachDetails.get(), false, true);
    this.publisher.pub(this.fmsTopicMap['fms_flight_phase'], this.flightPhase.get(), false, true);

    sub.on(this.fmsTopicMap['fms_approach_details_sync']).handle(this.onApproachDetailsSet.bind(this));
  }

  /**
   * Initializes a listener which listens for OBS deactivation and converts the deactivated OBS to an on-route
   * Direct-To.
   */
  private initObsDeactivationListener(): void {
    this.isObsActive.sub(isActive => {
      if (isActive) {
        SimVar.SetSimVarValue(this.needConvertObsToDtoSimVar, SimVarValueType.Bool, true);
      } else if (SimVar.GetSimVarValue(this.needConvertObsToDtoSimVar, SimVarValueType.Bool) !== 0) {
        SimVar.SetSimVarValue(this.needConvertObsToDtoSimVar, SimVarValueType.Bool, false);
        this.convertObsToDirectTo();
      }
    }, true);
  }

  /**
   * Gets an event bus subscriber for topics published by this FMS.
   * @returns An event bus subscriber for topics published by this flight planner.
   */
  public getEventSubscriber(): EventSubscriber<FmsEventsForId<ID>> {
    return this.eventSubscriber;
  }

  /**
   * Subscribes to one of the event bus topics published by this FMS.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public onEvent<K extends keyof BaseFmsEvents>(baseTopic: K): Consumer<BaseFmsEvents[K]> {
    return this.eventSubscriber.on(
      this.fmsTopicMap[baseTopic] as keyof FmsEventsForId<ID>
    ) as unknown as Consumer<BaseFmsEvents[K]>;
  }

  /**
   * Initializes the primary flight plan. Does nothing if the primary flight plan already exists.
   *
   * @param force Whether to force a new primary flight plan to be created, even if one already exists
   */
  public async initPrimaryFlightPlan(force = false): Promise<void> {
    if (!force && this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
      return;
    }

    this.flightPlanner.createFlightPlan(Fms.PRIMARY_PLAN_INDEX);
    await this.emptyPrimaryFlightPlan();
  }

  /**
   * Checks whether an indexed flight plan exists.
   * @param index A flight plan index.
   * @returns Whether a flight plan at the specified index exists.
   */
  public hasFlightPlan(index: number): boolean {
    return this.flightPlanner.hasFlightPlan(index);
  }

  /**
   * Gets a specified flightplan, or by default the primary flight plan.
   * @param index The index of the flight plan.
   * @returns the requested flight plan
   * @throws Error if no flight plan exists at the specified index.
   */
  public getFlightPlan(index = Fms.PRIMARY_PLAN_INDEX): FlightPlan {
    return this.flightPlanner.getFlightPlan(index);
  }

  /**
   * Checks whether the primary flight plan exists.
   * @returns Whether the primary flight plan exists.
   */
  public hasPrimaryFlightPlan(): boolean {
    return this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX);
  }

  /**
   * Gets the primary flight plan.
   * @returns The primary flight plan.
   * @throws Error if the primary flight plan does not exist.
   */
  public getPrimaryFlightPlan(): FlightPlan {
    return this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);
  }

  /**
   * Checks whether the Direct To Random flight plan exists.
   * @returns Whether the Direct To Random flight plan exists.
   */
  public hasDirectToFlightPlan(): boolean {
    return this.flightPlanner.hasFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
  }

  /**
   * Gets the Direct To Random flight plan.
   * @returns The Direct To Random flight plan.
   * @throws Error if the Direct To Random flight plan does not exist.
   */
  public getDirectToFlightPlan(): FlightPlan {
    return this.flightPlanner.getFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
  }


  /**
   * Gets the approach runway:
   * @returns Selected approach runway
   */
  public getApproachRunway(): OneWayRunway | null {
    return this.approachDetails.get().runway;
  }

  /**
   * Sets the name of the flight plan.
   * @param planIndex The index of the plan the change the name for.
   * @param name The new name for the flight plan.
   */
  public setFlightPlanName(planIndex: number, name: string): void {
    this.getFlightPlan(planIndex).setUserData(FmsFplUserDataKey.Name, name);
  }

  /**
   * Clears the name of the flight plan.
   * @param planIndex The index of the plan the clear the name for.
   */
  public deleteFlightPlanName(planIndex: number): void {
    this.getFlightPlan(planIndex).deleteUserData(FmsFplUserDataKey.Name);
  }

  /**
   * Schedules a flight phase update operation if one is not already pending.
   */
  private scheduleUpdateFlightPhase(): void {
    // Debounce the update so we aren't spamming it every time we get a long sequence of consecutive flight plan events.

    if (this.flightPhaseDebounceTimer.isPending()) {
      return;
    }

    this.flightPhaseDebounceTimer.schedule(this.updateFlightPhaseFunc, 0);
  }

  /**
   * Updates flight phase information.
   */
  private updateFlightPhase(): void {
    let isApproachActive = false;
    let isToFaf = false;
    let isPastFaf = false;
    let isInMissedApproach = false;

    if (this.flightPlanner.hasActiveFlightPlan()) {
      const activePlan = this.flightPlanner.getActiveFlightPlan();
      if (activePlan.length > 0) {
        const activeSegment = activePlan.getSegment(activePlan.getSegmentIndex(Math.min(activePlan.length - 1, activePlan.activeLateralLeg)));
        if (activeSegment.segmentType === FlightPlanSegmentType.Approach && activePlan.activeLateralLeg - activeSegment.offset > 0) {
          isApproachActive = true;

          if (
            activePlan.activeLateralLeg - activeSegment.offset < activeSegment.legs.length
              ? BitFlags.isAll(activeSegment.legs[activePlan.activeLateralLeg - activeSegment.offset]?.flags ?? 0, LegDefinitionFlags.MissedApproach)
              : BitFlags.isAll(activeSegment.legs[activeSegment.legs.length - 1]?.flags ?? 0, LegDefinitionFlags.MissedApproach)
          ) {
            isPastFaf = true;
            isInMissedApproach = true;
          } else {
            // Find the faf

            let fafSegmentLegIndex = -1;

            for (let i = activeSegment.legs.length - 1; i >= 0; i--) {
              if (BitFlags.isAll(activeSegment.legs[i].leg.fixTypeFlags, FixTypeFlags.FAF)) {
                fafSegmentLegIndex = i;
                break;
              }
            }

            const fafGlobalLegIndex = activeSegment.offset + fafSegmentLegIndex;

            isToFaf = activePlan.activeLateralLeg === fafGlobalLegIndex;
            isPastFaf = activePlan.activeLateralLeg > fafGlobalLegIndex;
          }
        }
      }
    }

    this.flightPhase.set('isApproachActive', isApproachActive);
    this.flightPhase.set('isToFaf', isToFaf);
    this.flightPhase.set('isPastFaf', isPastFaf);
    this.flightPhase.set('isInMissedApproach', isInMissedApproach);

    if (this.needPublishFlightPhase) {
      this.needPublishFlightPhase = false;

      this.publisher.pub(this.fmsTopicMap['fms_flight_phase'], Object.assign({}, this.flightPhase.get()), false, true);
    }

    const flightPhase = this.flightPhase.get();

    if (this.isPrimary) {
      if (!this.disableApproachAvailablePublish) {
        this.publisher.pub('approach_available', flightPhase.isApproachActive, true, true);
      }
      this.publisher.pub(this.fmsTopicMap['approach_supports_gp'], this.doesApproachSupportGp(), true, true);

      // If we are in the missed approach, make sure that the activate missed approach state reflects this.
      if (flightPhase.isInMissedApproach && !this.activateMaprState.get()) {
        this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], true, true, true);
      }
    }
  }

  /**
   * A method to check the current approach state.
   */
  private async updateApproachDetails(): Promise<void> {
    const opId = ++this.updateApproachDetailsOpId;

    const plan = this.getFlightPlan();
    let approachLoaded = false;
    let approachType: GarminApproachType = ApproachType.APPROACH_TYPE_UNKNOWN;
    let approachRnavType: RnavTypeFlags = RnavTypeFlags.None;
    let approachRnavTypeFlags: RnavTypeFlags = RnavTypeFlags.None;
    let approachIsCircling = false;
    let approachIsVtf = false;
    let referenceFacility: VorFacility | null = null;
    let approachRunway: OneWayRunway | null = null;

    const visualApproachData = plan.getUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach);
    const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);

    if (plan.destinationAirport && (plan.procedureDetails.approachIndex > -1 || visualApproachData !== undefined || vfrApproachData)) {
      approachLoaded = true;

      const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);

      if (opId !== this.updateApproachDetailsOpId) {
        return;
      }

      if (plan.procedureDetails.approachIndex > -1) {
        const approach = facility.approaches[plan.procedureDetails.approachIndex];
        if (approach) {
          approachType = approach.approachType;
          approachRnavType = FmsUtils.getBestRnavType(approach.rnavTypeFlags);
          approachRnavTypeFlags = approach.rnavTypeFlags;
          approachIsCircling = !approach.runway;
          approachIsVtf = plan.procedureDetails.approachTransitionIndex < 0;
          if (FmsUtils.approachHasNavFrequency(approach)) {
            referenceFacility = (await ApproachUtils.getReferenceFacility(approach, this.facLoader) as VorFacility | undefined) ?? null;
          }
          approachRunway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator) ?? null;
        }
      } else if (visualApproachData) {
        approachType = AdditionalApproachType.APPROACH_TYPE_VISUAL;
        approachRunway = RunwayUtils.matchOneWayRunwayFromDesignation(facility, visualApproachData.runwayDesignation) ?? null;
        approachIsVtf = visualApproachData.isVtf;
      } else if (vfrApproachData) {
        const approach = facility.approaches[vfrApproachData.approachIndex];
        if (approach) {
          if (FmsUtils.approachHasNavFrequency(approach)) {
            referenceFacility = (await ApproachUtils.getReferenceFacility(approach, this.facLoader) as VorFacility | undefined) ?? null;
          }
          approachRunway = approach.runway
            ? RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator) ?? null
            : null;
        }

        approachType = GarminAdditionalApproachType.APPROACH_TYPE_VFR;
        approachIsCircling = !approach.runway;
        approachIsVtf = vfrApproachData.isVtf;
      }

      if (opId !== this.updateApproachDetailsOpId) {
        return;
      }
    }

    this.setApproachDetails(false, approachLoaded, approachType, approachRnavType, approachRnavTypeFlags, approachIsCircling, approachIsVtf, referenceFacility, approachRunway);
  }

  /**
   * Removes the direct to existing legs from the primary flight plan. If a direct to existing is currently active,
   * this will effectively cancel it.
   * @param lateralLegIndex The index of the leg to set as the active lateral leg after the removal operation. Defaults
   * to the index of the current active primary flight plan leg.
   */
  private removeDirectToExisting(lateralLegIndex?: number): void {
    const plan = this.getFlightPlan();
    const directToData = plan.directToData;
    if (directToData && directToData.segmentIndex > -1) {
      // Removing a lateral direct-to also cancels any existing vertical direct-to
      this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);

      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);
      plan.removeLeg(directToData.segmentIndex, directToData.segmentLegIndex + 1, true);

      const activateIndex = lateralLegIndex ?? plan.activeLateralLeg;
      const adjustedActivateIndex = activateIndex - MathUtils.clamp(activateIndex - (plan.getSegment(directToData.segmentIndex).offset + directToData.segmentLegIndex), 0, 3);

      plan.setDirectToData(-1, true);
      plan.setCalculatingLeg(adjustedActivateIndex);
      plan.setLateralLeg(adjustedActivateIndex);
      plan.calculate(0);
    }
  }

  /**
   * Checks whether a leg in the primary flight plan can be manually activated.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns Whether the leg can be manually activated.
   */
  public canActivateLeg(segmentIndex: number, segmentLegIndex: number): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();

    if (!plan) {
      return false;
    }

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg || BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo) || leg === plan.getLeg(0)) {
      return false;
    }

    if (BitFlags.isAll(leg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
      return true;
    }

    switch (leg.leg.type) {
      case LegType.CF:
      case LegType.FC:
      case LegType.FD:
        return true;
      case LegType.CI:
      case LegType.VI:
      case LegType.FA:
      case LegType.CA:
      case LegType.VA:
      case LegType.VM:
        return false;
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, segmentLegIndex) as LegDefinition;
    switch (prevLeg.leg.type) {
      case LegType.VA:
      case LegType.CA:
      case LegType.VM:
      case LegType.Discontinuity:
      case LegType.ThruDiscontinuity:
        return false;
    }

    return true;
  }

  /**
   * Checks whether a leg in the primary flight plan is a valid direct to target.
   * @param segmentIndex The index of the segment in which the leg resides.
   * @param segmentLegIndex The index of the leg in its segment.
   * @returns Whether the leg is a valid direct to target.
   * @throws Error if a leg could not be found at the specified location.
   */
  public canDirectTo(segmentIndex: number, segmentLegIndex: number): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();

    if (!plan) {
      return false;
    }

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg || leg.leg.fixIcao === '' || leg.leg.fixIcao === ICAO.emptyIcao || BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo)) {
      return false;
    }

    switch (leg.leg.type) {
      case LegType.IF:
      case LegType.TF:
      case LegType.DF:
      case LegType.CF:
      case LegType.AF:
      case LegType.RF:
        return true;
    }

    return false;
  }

  /**
   * Gets the current Direct To State.
   * @returns the DirectToState.
   */
  public getDirectToState(): DirectToState {
    if (this.flightPlanner.activePlanIndex == 1) {
      const plan = this.getDirectToFlightPlan();
      if (plan.segmentCount > 0 && plan.getSegment(0).segmentType === FlightPlanSegmentType.RandomDirectTo) {
        return DirectToState.TORANDOM;
      }
    } else if (this.hasPrimaryFlightPlan()) {
      const plan = this.getPrimaryFlightPlan();
      const directDataExists = plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1;
      if (directDataExists && plan.segmentCount >= plan.directToData.segmentIndex
        && plan.getLegIndexFromLeg(plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex]) === plan.activeLateralLeg - 3) {
        return DirectToState.TOEXISTING;
      }
    }
    return DirectToState.NONE;
  }

  /**
   * Gets the ICAO string (V1) of the current Direct To target.
   * @returns The ICAO string (V1) of the current Direct To target, or undefined if Direct To is not active.
   * @deprecated Please use `getDirectToTargetIcaoValue()` instead.
   */
  public getDirectToTargetIcao(): string | undefined {
    return this.getDirectToLeg()?.fixIcao;
  }

  /**
   * Gets the ICAO value of the current Direct To target.
   * @returns The ICAO value of the current Direct To target, or undefined if Direct To is not active.
   */
  public getDirectToTargetIcaoValue(): IcaoValue | undefined {
    return this.getDirectToLeg()?.fixIcaoStruct;
  }

  /**
   * Gets the current DTO Target Flight Plan Leg.
   * @returns the FlightPlanLeg.
   */
  private getDirectToLeg(): FlightPlanLeg | undefined {
    switch (this.getDirectToState()) {
      case DirectToState.TORANDOM: {
        const plan = this.getDirectToFlightPlan();
        return plan.getSegment(0).legs[2].leg;
      }
      case DirectToState.TOEXISTING: {
        const plan = this.getFlightPlan();
        return plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET].leg;
      }
    }
    return undefined;
  }

  /**
   * Checks if a segment is the first enroute segment that is not an airway.
   * @param segmentIndex is the segment index of the segment to check
   * @returns whether or not the segment is the first enroute segment that is not an airway.
   */
  public isFirstEnrouteSegment(segmentIndex: number): boolean {
    const plan = this.getFlightPlan();
    for (let i = 0; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      if (segment.segmentType === FlightPlanSegmentType.Enroute && !segment.airway) {
        return i === segmentIndex;
      }
    }
    return false;
  }

  /**
   * Adds a user facility.
   * @param userFacility the facility to add.
   */
  public addUserFacility(userFacility: UserFacility): void {
    this.facRepo.add(userFacility);
  }

  /**
   * Removes a user facility.
   * @param userFacility the facility to remove.
   */
  public removeUserFacility(userFacility: UserFacility): void {
    this.facRepo.remove(userFacility);
  }

  /**
   * Adds a visual or runway facility from the FlightPlanLeg.
   * @param leg the leg to build the facility from.
   * @param visualRunwayDesignation is the visual runway this facility belongs to.
   */
  private addVisualFacilityFromLeg(leg: FlightPlanLeg, visualRunwayDesignation: string): void {
    const fac: VisualFacility = {
      icao: leg.fixIcao,
      icaoStruct: ICAO.copyValue(leg.fixIcaoStruct),
      lat: leg.lat !== undefined ? leg.lat : 0,
      lon: leg.lon !== undefined ? leg.lon : 0,
      approach: `VISUAL ${visualRunwayDesignation}`,
      city: '',
      name: `${visualRunwayDesignation} - ${leg.fixIcaoStruct.ident}`,
      region: '',
    };
    this.facRepo.add(fac);
  }

  /**
   * Inserts a waypoint into the primary flight plan.
   * @param segmentIndex The index of the flight plan segment into which to insert the waypoint.
   * @param facility The waypoint facility to insert.
   * @param legIndex The index in the segment at which to insert the waypoint. If a leg already exists at the index,
   * the existing leg and all subsequent legs will be shifted to the right. If not defined, the waypoint will be
   * inserted at the end of the segment.
   * @returns The leg that was inserted into the flight plan, or `undefined` if the insertion operation could not be
   * carried out.
   */
  public insertWaypoint(segmentIndex: number, facility: Facility, legIndex?: number): LegDefinition | undefined {
    const plan = this.getFlightPlan();

    // Check to see if we are trying to insert a leg between a direct-to target leg and the direct-to leg, which is
    // an illegal operation.
    if (segmentIndex === plan.directToData.segmentIndex && legIndex !== undefined) {
      const legIndexDelta = legIndex - plan.directToData.segmentLegIndex;
      if (legIndexDelta > 0 && legIndexDelta <= FmsUtils.DTO_LEG_OFFSET) {
        return undefined;
      }
    }

    const leg = FlightPlan.createLeg({
      type: LegType.TF,
      fixIcaoStruct: facility.icaoStruct,
    });


    let segment = plan.getSegment(segmentIndex);
    const prevLeg = plan.getPrevLeg(segmentIndex, legIndex ?? Infinity);
    const nextLeg = plan.getNextLeg(segmentIndex, legIndex === undefined ? Infinity : legIndex - 1);

    // Make sure we are not inserting a duplicate leg
    if ((prevLeg && this.isDuplicateLeg(prevLeg.leg, leg)) || (nextLeg && this.isDuplicateLeg(leg, nextLeg.leg))) {
      return undefined;
    }

    // Editing the plan prior to an existing vertical direct-to cancels the vertical direct-to
    if (this.verticalPathCalculator) {
      const globalLegIndex = segment.offset + (legIndex ?? segment.legs.length);
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      if (verticalPlan.verticalDirectIndex !== undefined && verticalPlan.verticalDirectIndex >= globalLegIndex) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    // Check if we are trying to insert a waypoint after an airway entry or exit. If so, change the leg indexes so that
    // we are inserting at the beginning of the next segment instead (which is an equivalent operation) in order to
    // correctly trigger (or not) the airway handling section below.
    if (legIndex === undefined || legIndex >= segment.legs.length) {
      const airwayLegType = this.getAirwayLegType(plan, segmentIndex, segment.legs.length - 1);
      switch (airwayLegType) {
        case AirwayLegType.ENTRY:
        case AirwayLegType.EXIT_ENTRY:
        case AirwayLegType.EXIT:
          segment = plan.getSegment(++segmentIndex);
          legIndex = 0;
          break;
      }
    }

    // Deal with whether this insert is in an airway segment
    if (segment.airway) {
      return this.handleAirwayInsertLeg(plan, segmentIndex, leg, legIndex);
    }

    // If we are inserting a leg before a VTF faf leg, we need to check whether the leg terminates at the same
    // facility as the leg prior to the faf in the published procedure.
    if (legIndex !== undefined && segment.segmentType === FlightPlanSegmentType.Approach && FmsUtils.isVtfApproachLoaded(plan)) {
      const vtfFafLeg = FmsUtils.getApproachVtfLeg(plan);

      if (vtfFafLeg !== undefined) {
        const vtfFafLegIndex = segment.legs.indexOf(vtfFafLeg);
        const discoLegExists = BitFlags.isAll(segment.legs[vtfFafLegIndex - 1]?.flags ?? 0, LegDefinitionFlags.VectorsToFinal);

        if (vtfFafLeg !== undefined && legIndex === vtfFafLegIndex - (discoLegExists ? 1 : 0)) {
          const publishedLegIcao = plan.getUserData<string>(Fms.VTF_FAF_DATA_KEY) ?? '';
          const legTerminatorIcao = FlightPlanUtils.getTerminatorIcao(leg) ?? '';

          const needDisco = !ICAO.isFacility(publishedLegIcao) || !ICAO.isFacility(legTerminatorIcao) || publishedLegIcao !== legTerminatorIcao;

          if (needDisco && !discoLegExists) {
            plan.addLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }), vtfFafLegIndex, LegDefinitionFlags.VectorsToFinal);

            if (plan.activeLateralLeg >= segment.offset + vtfFafLegIndex) {
              plan.setLateralLeg(plan.activeLateralLeg + 1);
              plan.setCalculatingLeg(plan.activeCalculatingLeg + 1);
            }
          } else if (!needDisco && discoLegExists) {
            plan.removeLeg(segmentIndex, vtfFafLegIndex - 1);

            if (plan.activeLateralLeg >= segment.offset + vtfFafLegIndex) {
              plan.setLateralLeg(plan.activeLateralLeg - 1);
              plan.setCalculatingLeg(plan.activeCalculatingLeg - 1);
            }
          }
        }
      }
    }

    return this.planAddLeg(segmentIndex, leg, legIndex);
  }

  /**
   * Handles inserting a flight plan leg into an airway segment.
   * @param plan The flight plan into which to insert the leg.
   * @param segmentIndex The index of the airway segment.
   * @param leg The leg to insert.
   * @param segmentLegIndex The index in the airway segment at which to insert the leg. If not defined, the leg will be
   * inserted at the end of the segment.
   * @returns The leg that was inserted into the airway segment, or `undefined` if the segment does not exist or is not
   * an airway segment.
   */
  private handleAirwayInsertLeg(plan: FlightPlan, segmentIndex: number, leg: FlightPlanLeg, segmentLegIndex?: number): LegDefinition | undefined {
    const segment = plan.tryGetSegment(segmentIndex);
    if (segment === null || segment.airway === undefined) {
      return undefined;
    }

    segmentLegIndex ??= segment.legs.length - 1;

    // Get the displaced legs from the airway segment
    const legsToMove: FlightPlanLeg[] = [];
    const legsLength = segment.legs.length;
    for (let i = segmentLegIndex; i < legsLength; i++) {
      legsToMove.push(segment.legs[i].leg);
    }

    // Save the airway name
    const airway = segment.airway?.split('.')[0] ?? '';

    const prevSegment = plan.getSegment(segmentIndex - 1);
    const nextSegment = plan.getSegment(segmentIndex + 1);

    const isPrevSegmentEnroute = prevSegment.segmentType === FlightPlanSegmentType.Enroute && prevSegment.airway === undefined;
    const needFirstAirwaySegment = segmentLegIndex > 0; // We don't need to keep the original airway segment around if we've displaced all of its enroute waypoints.
    const needSecondAirwaySegment = legsToMove.length > 2; // Only create a second airway segment if we've displaced at least three waypoints in the original airway
    const needNewEnrouteSegment = !isPrevSegmentEnroute || (
      needFirstAirwaySegment
      && (needSecondAirwaySegment || nextSegment.airway !== undefined || nextSegment.segmentType !== FlightPlanSegmentType.Enroute)
    );

    const firstAirwaySegmentIndex = needFirstAirwaySegment ? segmentIndex : -1;

    let enrouteSegment: FlightPlanSegment;
    let secondAirwaySegment: FlightPlanSegment | undefined;

    if (needSecondAirwaySegment) {
      secondAirwaySegment = plan.getSegment(this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1));
    }

    if (needNewEnrouteSegment) {
      enrouteSegment = plan.getSegment(this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1));
    } else {
      if (needFirstAirwaySegment) {
        enrouteSegment = plan.getSegment(segmentIndex + 1);
      } else {
        enrouteSegment = plan.getSegment(segmentIndex - 1);
      }
    }

    // Add the inserted leg to its enroute segment
    const legDefinition = this.planAddLeg(enrouteSegment.segmentIndex, leg);

    if (!needFirstAirwaySegment) {
      this.planRemoveSegment(segmentIndex);
    } else {
      for (let i = legsLength - 1; i >= segmentLegIndex; i--) {
        this.planRemoveLeg(segmentIndex, i, true, true);
      }
    }

    if (legsToMove.length > 0) {
      this.planAddLeg(enrouteSegment.segmentIndex, legsToMove[0]); // Always add first displaced waypoint to the enroute segment in case it is an airway entry

      const toAddSegmentIndex = secondAirwaySegment ? secondAirwaySegment.segmentIndex : enrouteSegment.segmentIndex;
      for (let i = 1; i < legsToMove.length; i++) {
        this.planAddLeg(toAddSegmentIndex, legsToMove[i]);
      }
    }

    // Update names of the airway segments as appropriate.

    if (firstAirwaySegmentIndex >= 0) {
      segment.airway = airway + '.' + segment.legs[segmentLegIndex - 1].name;
      plan.setAirway(firstAirwaySegmentIndex, segment.airway);
    }

    if (secondAirwaySegment) {
      secondAirwaySegment.airway = airway + '.' + secondAirwaySegment.legs[secondAirwaySegment.legs.length - 1].name;
      plan.setAirway(secondAirwaySegment.segmentIndex, secondAirwaySegment.airway);
    }

    return legDefinition;
  }

  /**
   * Removes a leg to a waypoint from the primary flight plan.
   * @param segmentIndex The index of the segment containing the leg to remove.
   * @param segmentLegIndex The index of the leg to remove in its segment.
   * @returns Whether the waypoint was successfully removed.
   */
  public removeWaypoint(segmentIndex: number, segmentLegIndex: number): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();
    if (!plan) {
      return false;
    }

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (!leg || BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.FAF | FixTypeFlags.MAP)) {
      return false;
    }

    const wasActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);

    const legDeleted = this.planRemoveLeg(segmentIndex, segmentLegIndex);
    const nextLeg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
    if (legDeleted && nextLeg && (nextLeg.leg.type === LegType.HA || nextLeg.leg.type === LegType.HM || nextLeg.leg.type === LegType.HF)) {
      if (plan.tryGetLeg(segmentIndex, segmentLegIndex)) {
        this.planRemoveLeg(segmentIndex, segmentLegIndex, true, true, true);
      }
    }

    // If removing the leg caused the active leg to move from before the approach into the approach, activate the
    // approach instead.
    if (!wasActiveLegInApproach) {
      const isActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);
      if (isActiveLegInApproach) {
        if (this.isApproachVtf()) {
          this.activateVtf();
        } else {
          this.activateApproach();
        }
      }
    }

    return legDeleted;
  }

  /**
   * Gets the airway leg type of a flight plan leg.
   * @param plan The flight plan containing the query leg.
   * @param segmentIndex The index of the flight plan segment containing the query leg.
   * @param segmentLegIndex The index of the query leg in its segment.
   * @returns The airway leg type of the query leg.
   */
  private getAirwayLegType(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): AirwayLegType {
    const isLegDtoTarget = plan.directToData.segmentIndex === segmentIndex && plan.directToData.segmentLegIndex === segmentLegIndex;
    const segment = plan.getSegment(segmentIndex);
    const segmentIsAirway = segment.airway !== undefined;
    const nextSegmentIsAirway = segmentIndex + 1 < plan.segmentCount && plan.getSegment(segmentIndex + 1).airway !== undefined;
    const legIsLast = segmentLegIndex + (isLegDtoTarget ? FmsUtils.DTO_LEG_OFFSET : 0) === segment.legs.length - 1;

    if (legIsLast && nextSegmentIsAirway) {
      return segmentIsAirway ? AirwayLegType.EXIT_ENTRY : AirwayLegType.ENTRY;
    }

    if (segmentIsAirway) {
      return legIsLast ? AirwayLegType.EXIT : AirwayLegType.ONROUTE;
    }

    return AirwayLegType.NONE;
  }

  /**
   * Method to get the distance of an airway segment.
   * @param segmentIndex is the index of the segment of the airway.
   * @returns the cumulative distance for the airway segment.
   */
  public getAirwayDistance(segmentIndex: number): number {
    const plan = this.getFlightPlan();
    const segment = plan.getSegment(segmentIndex);
    const entrySegment = plan.getSegment(segmentIndex - 1);
    const entryCumulativeDistance = entrySegment.legs[entrySegment.legs.length - 1]?.calculated?.cumulativeDistance;
    const exitCumulativeDistance = segment.legs[segment.legs.length - 1]?.calculated?.cumulativeDistance;
    return exitCumulativeDistance && entryCumulativeDistance ? exitCumulativeDistance - entryCumulativeDistance : -1;
  }

  /**
   * Sets the primary flight plan's origin airport and runway. Any departure procedure loaded in the flight plan will
   * be removed.
   * @param airport The origin airport to set or its ICAO, or `undefined` if the origin airport should be cleared from
   * the flight plan.
   * @param runway The origin runway to set, or `undefined` if the origin runway should be cleared from the flight
   * plan. Ignored if `airport` is `undefined`.
   */
  public setOrigin(airport: AirportFacility | string | undefined, runway?: OneWayRunway): void {
    // TODO: use IcaoValue
    const airportIcao = typeof airport === 'object' ? airport.icao : airport;
    const plan = this.getPrimaryFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

    plan.setDeparture();

    if (airportIcao !== undefined && ICAO.isFacility(airportIcao, FacilityType.Airport)) {
      plan.setOriginAirport(airportIcao);
      plan.setOriginRunway(runway);
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
      this.planAddOriginDestinationLeg(true, segmentIndex, ICAO.stringV1ToValue(airportIcao), runway);

      const prevLeg = plan.getPrevLeg(segmentIndex, 1);
      const nextLeg = plan.getNextLeg(segmentIndex, 0);
      if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
        this.planRemoveDuplicateLeg(prevLeg, nextLeg);
      }
    } else {
      plan.removeOriginAirport();
      this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
    }

    plan.calculate(0);
  }

  /**
   * Sets the primary flight plan's destination airport and runway.
   * @param airport The destination airport to set or its ICAO, or `undefined` if the destination airport should be
   * cleared from the flight plan.
   * @param runway The destination runway to set, or `undefined` if the destination runway should be cleared from the
   * flight plan. Ignored if `airport` is `undefined`.
   */
  public setDestination(airport: AirportFacility | string | undefined, runway?: OneWayRunway): void {
    // TODO: use IcaoValue
    const airportIcao = typeof airport === 'object' ? airport.icao : airport;
    const plan = this.getFlightPlan();
    const destSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);

    if (airportIcao !== undefined && ICAO.isFacility(airportIcao, FacilityType.Airport)) {
      plan.setDestinationAirport(airportIcao);
      plan.setDestinationRunway(runway);
      this.planClearSegment(destSegmentIndex, FlightPlanSegmentType.Destination);

      const hasArrival = plan.procedureDetails.arrivalIndex > -1;
      const hasApproach = plan.procedureDetails.approachIndex > -1;

      if (!hasArrival && !hasApproach) {
        this.planAddOriginDestinationLeg(false, destSegmentIndex, ICAO.stringV1ToValue(airportIcao), runway);
      }
    } else {
      plan.removeDestinationAirport();
      this.planClearSegment(destSegmentIndex, FlightPlanSegmentType.Destination);
    }

    plan.calculate(0);
  }

  /**
   * Moves any current legs in the destination segment to the end of the last enroute segment.
   */
  public moveCurrentDestinationLegToEnroute(): void {
    const plan = this.getFlightPlan();
    const destinationSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
    const destinationSegment = plan.getSegment(destinationSegmentIndex);
    if (destinationSegment.legs.length > 0) {
      const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
      for (let l = 0; l < destinationSegment.legs.length; l++) {
        const newLeg = Object.assign({}, destinationSegment.legs[l].leg);
        this.planRemoveLeg(destinationSegmentIndex, l);
        this.planAddLeg(lastEnrouteSegmentIndex, newLeg);
      }
    }
  }

  /**
   * Method to remove runway or airport legs from segments where they shouldn't exist.
   */
  public removeDestLegFromSegments(): void {
    const plan = this.getFlightPlan();
    const destination = plan.destinationAirport;
    const hasArrival = plan.procedureDetails.arrivalIndex > -1;
    const hasApproach = FmsUtils.isApproachLoaded(plan);
    const destinationSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
    const destinationSegment = plan.getSegment(destinationSegmentIndex);

    if (hasApproach && destination) {
      if (hasArrival) {
        const arrivalSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);
        const arrival = plan.getSegment(arrivalSegmentIndex);
        const lastArrivalLegIcao = arrival.legs[arrival.legs.length - 1].leg.fixIcao;
        if (lastArrivalLegIcao === destination || lastArrivalLegIcao.search('R') === 0) {
          this.planRemoveLeg(arrivalSegmentIndex, arrival.legs.length - 1);
        }
      }
      if (destinationSegment.legs.length > 0) {
        this.planClearSegment(destinationSegmentIndex, FlightPlanSegmentType.Destination);
      }
    } else if (hasArrival && destination) {
      if (destinationSegment.legs.length > 0) {
        this.planClearSegment(destinationSegmentIndex, FlightPlanSegmentType.Destination);
      }
    }
  }

  /**
   * Method to ensure only one segment of a specific type exists in the flight plan and optionally insert it if needed.
   * @param segmentType is the segment type we want to evaluate.
   * @param insert is whether to insert the segment if missing
   * @returns segmentIndex of the only segment of this type in the flight plan.
   */
  private ensureOnlyOneSegmentOfType(segmentType: FlightPlanSegmentType, insert = true): number {
    const plan = this.getFlightPlan();
    let segmentIndex: number;

    const selectedSegments = plan.segmentsOfType(segmentType);
    const segmentIndexArray: number[] = [];

    for (const element of selectedSegments) {
      segmentIndexArray.push(element.segmentIndex);
    }

    if (segmentIndexArray.length === 0) {
      if (insert) {
        segmentIndex = this.planInsertSegmentOfType(segmentType);
      } else {
        segmentIndex = -1;
      }
    } else if (segmentIndexArray.length > 1) {
      for (let i = 0; i < segmentIndexArray.length; i++) {
        this.planRemoveSegment(segmentIndexArray[i]);
      }
      segmentIndex = this.planInsertSegmentOfType(segmentType);
    } else {
      segmentIndex = segmentIndexArray[0];
    }
    return segmentIndex;
  }

  /**
   * Method to invert the flightplan.
   */
  public invertFlightplan(): void {
    const plan = this.getFlightPlan();

    this.removeDirectToExisting();

    const newOriginIcao = plan.destinationAirport;
    const newDestinationIcao = plan.originAirport;
    const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);

    if (lastEnrouteSegmentIndex === 1 && plan.getSegment(1).legs.length > 0) {
      //case for when there is only 1 enroute segment and it has at least 1 waypoint, a simple reversal is all that's required.
      const segment = Object.assign({}, plan.getSegment(1));
      this.emptyPrimaryFlightPlan();
      for (let l = segment.legs.length - 1; l >= 0; l--) {
        plan.addLeg(1, segment.legs[l].leg);
      }
    } else if (lastEnrouteSegmentIndex > 1) {
      //case for when there is more than 1 enroute segment we know we have to deal with airways
      const legs: LegListItem[] = [];
      for (let i = 1; i <= lastEnrouteSegmentIndex; i++) {
        //create a temporary list of legs that looks like what a flight plan import looks like with ICAO and the airway
        //we fly FROM the leg on.
        const oldSegment = plan.getSegment(i);
        const airway = oldSegment.airway ? oldSegment.airway?.split('.')[0] : undefined;
        for (const leg of oldSegment.legs) {
          const legListItem: LegListItem = { icao: leg.leg.fixIcaoStruct, airway: airway };
          legs.push(legListItem);
        }
      }
      //after the array of legs is complete, we just reverse it
      legs.reverse();
      this.emptyPrimaryFlightPlan();

      let currentSegment = 1;
      let lastLegWasAirway = false;

      //last we go through each leg and use the same logic we use for the flight plan import to go through each leg and create airway
      //segments as appropriate for these legs.
      for (let i = 0; i < legs.length; i++) {
        const wpt = legs[i];
        const segment = plan.getSegment(currentSegment);
        if (wpt.airway) {
          const leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcaoStruct: wpt.icao,
          });
          plan.addLeg(currentSegment, leg);
          if (!lastLegWasAirway) {
            plan.insertSegment(currentSegment + 1, FlightPlanSegmentType.Enroute, wpt.airway);
            currentSegment += 1;
          }
          for (let j = i + 1; j < legs.length; j++) {
            i++;
            const airwayLeg = FlightPlan.createLeg({
              type: LegType.TF,
              fixIcaoStruct: legs[j].icao,
            });
            plan.addLeg(currentSegment, airwayLeg);

            if (legs[j].airway !== wpt.airway) {
              lastLegWasAirway = legs[j].airway ? true : false;
              break;
            }
          }

          plan.setAirway(currentSegment, wpt.airway + '.' + legs[i].icao.ident);

          currentSegment += 1;
          plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute, lastLegWasAirway ? legs[i].airway : undefined);

        } else {
          let leg: FlightPlanLeg | undefined = undefined;
          leg = FlightPlan.createLeg({
            type: LegType.TF,
            fixIcaoStruct: wpt.icao,
          });
          if (leg) {
            plan.addLeg(currentSegment, leg);
            if (lastLegWasAirway) {
              plan.setAirway(currentSegment, segment.airway + '.' + wpt.icao.ident);
              currentSegment += 1;
              plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
            }
            lastLegWasAirway = false;
          }
        }
      }

      if (plan.getSegment(currentSegment).airway) {
        currentSegment += 1;
        plan.insertSegment(currentSegment, FlightPlanSegmentType.Enroute);
      }
    } else {
      this.emptyPrimaryFlightPlan();
    }

    if (newOriginIcao) {
      this.facLoader.getFacility(FacilityType.Airport, newOriginIcao).then((facility) => {
        this.setOrigin(facility as AirportFacility);
      });
    }

    if (newDestinationIcao) {
      this.facLoader.getFacility(FacilityType.Airport, newDestinationIcao).then((facility) => {
        this.setDestination(facility as AirportFacility);
      });
    }

    ++this.updateApproachDetailsOpId;
    this.setApproachDetails(true, false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, RnavTypeFlags.None, false, false, null, null);
    plan.deleteUserData(Fms.VTF_FAF_DATA_KEY);

    plan.calculate(0);
  }

  /**
   * Method to add or replace a departure procedure in the flight plan.
   * @param facility is the facility that contains the procedure to add.
   * @param departureIndex is the index of the departure
   * @param departureRunwayIndex is the index of the runway transition
   * @param enrouteTransitionIndex is the index of the enroute transition
   * @param oneWayRunway is the one way runway to set as the origin leg.
   */
  public insertDeparture(
    facility: AirportFacility,
    departureIndex: number,
    departureRunwayIndex: number,
    enrouteTransitionIndex: number,
    oneWayRunway?: OneWayRunway | undefined
  ): void {
    const plan = this.getFlightPlan();
    plan.setDeparture(facility.icao, departureIndex, enrouteTransitionIndex, departureRunwayIndex);

    let departureSegment = plan.getSegment(this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure));

    this.planClearSegment(departureSegment.segmentIndex, FlightPlanSegmentType.Departure);

    // planClearSegment() actually removes and replaces the segment, so we need to get a reference to the new segment.
    departureSegment = FmsUtils.getDepartureSegment(plan) as FlightPlanSegment;

    const insertProcedureObject: InsertProcedureObject = this.buildDepartureLegs(facility, departureIndex, enrouteTransitionIndex, departureRunwayIndex, oneWayRunway);

    if (oneWayRunway) {
      plan.setOriginAirport(facility.icao);
      plan.setOriginRunway(oneWayRunway);
    } else if (plan.originAirport == facility.icao && plan.procedureDetails.originRunway) {
      const originLeg = FmsUtils.buildRunwayLeg(facility, plan.procedureDetails.originRunway, true);
      insertProcedureObject.procedureLegs.splice(0, 1, originLeg);
    } else {
      plan.setOriginAirport(facility.icao);
    }

    insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(departureSegment.segmentIndex, l));

    const nextLeg = plan.getNextLeg(departureSegment.segmentIndex, Infinity);
    const lastDepLeg = departureSegment.legs[departureSegment.legs.length - 1];
    if (nextLeg && lastDepLeg && this.isDuplicateLeg(lastDepLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(lastDepLeg, nextLeg);
    }

    this.autoDesignateProcedureConstraints(plan, departureSegment.segmentIndex);

    plan.calculate(0);
  }

  /**
   * Method to insert the arrival legs.
   * @param facility is the facility to build legs from.
   * @param procedureIndex is the procedure index to build legs from.
   * @param enrouteTransitionIndex is the enroute transition index to build legs from.
   * @param runwayTransitionIndex is the runway transition index to build legs from.
   * @param oneWayRunway is the one way runway, if one is specified in the procedure.
   * @returns InsertProcedureObject to insert into the flight plan.
   */
  private buildDepartureLegs(
    facility: AirportFacility,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number,
    oneWayRunway?: OneWayRunway
  ): InsertProcedureObject {

    const departure = facility.departures[procedureIndex];
    const enRouteTransition = departure.enRouteTransitions[enrouteTransitionIndex];
    const runwayTransition = departure.runwayTransitions[runwayTransitionIndex];
    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    let originLeg: FlightPlanLeg;

    if (oneWayRunway) {
      originLeg = FmsUtils.buildRunwayLeg(facility, oneWayRunway, true);
    } else {
      originLeg = FlightPlan.createLeg({
        lat: facility.lat,
        lon: facility.lon,
        type: LegType.IF,
        fixIcaoStruct: facility.icaoStruct,
      });
    }

    insertProcedureObject.procedureLegs.push(originLeg);

    if (runwayTransition !== undefined) {
      for (let i = 0; i < runwayTransition.legs.length; i++) {
        const insertLeg = this.procedureLegMapFunc(
          FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(runwayTransition.legs[i]))
        );

        if (!insertLeg) {
          continue;
        }

        if (i === 0 && ICAO.isValueFacility(insertLeg.fixIcaoStruct, FacilityType.RWY)) {
          const runway = RunwayUtils.matchOneWayRunwayFromIdent(facility, insertLeg.fixIcaoStruct.ident);

          if (!runway) {
            continue;
          }

          // If the procedure runway leg is the first leg, then check if we already added an origin runway leg for
          // the same runway. If we did, then skip the procedure runway leg since we don't want to duplicate the
          // runway leg. If we did not, then replace the origin leg we added with the procedure runway leg (converted
          // to using our own runway leg format).
          if (!oneWayRunway || runway.designation !== oneWayRunway.designation) {
            insertProcedureObject.procedureLegs.splice(0, 1, FmsUtils.buildRunwayLeg(facility, runway, true));
          }
        } else {
          insertProcedureObject.procedureLegs.push(insertLeg);
        }
      }
    }

    for (let i = 0; i < departure.commonLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(departure.commonLegs[i]));
      if (
        i === 0
        && insertProcedureObject.procedureLegs.length > 0
        && this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)
      ) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
          this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
        continue;
      }
      const insertLeg = this.procedureLegMapFunc(leg);
      insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
    }

    if (enRouteTransition) {
      for (let i = 0; i < enRouteTransition.legs.length; i++) {
        const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(enRouteTransition.legs[i]));
        if (
          i === 0
          && insertProcedureObject.procedureLegs.length > 0
          && this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)
        ) {
          insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
            this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
          continue;
        }
        const insertLeg = this.procedureLegMapFunc(enRouteTransition.legs[i]);
        insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
      }
    }

    return insertProcedureObject;
  }

  /**
   * Method to add or replace an arrival procedure in the flight plan.
   * @param facility is the facility that contains the procedure to add.
   * @param arrivalIndex is the index of the arrival procedure.
   * @param arrivalRunwayTransitionIndex is the index of the arrival runway transition.
   * @param enrouteTransitionIndex is the index of the enroute transition.
   * @param arrivalRunway is the one way runway to set as the destination leg.
   */
  public insertArrival(
    facility: AirportFacility,
    arrivalIndex: number,
    arrivalRunwayTransitionIndex: number,
    enrouteTransitionIndex: number,
    arrivalRunway?: OneWayRunway,
  ): void {
    const plan = this.getFlightPlan();
    plan.setArrival(facility.icao, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex, arrivalRunway);

    if (plan.length > 0 && plan.procedureDetails.approachIndex < 0 && plan.destinationAirport) {
      if (!this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute)) {
        if (plan.getLeg(plan.activeLateralLeg).leg.fixIcao === plan.destinationAirport && plan.destinationAirport !== facility.icao && plan.activeLateralLeg === plan.length - 1) {
          const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
          const newDestinationLeg = FlightPlan.createLeg({
            fixIcaoStruct: plan.destinationAirportIcao,
            type: LegType.TF
          });
          this.planAddLeg(lastEnrouteSegmentIndex, newDestinationLeg);
        }
      }
    }

    if (plan.procedureDetails.approachIndex < 0) {
      plan.setDestinationAirport(facility.icao);
      plan.setDestinationRunway(arrivalRunway);
    }

    let arrivalSegment = plan.getSegment(this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival));

    if (arrivalSegment.legs.length > 0) {
      this.planClearSegment(arrivalSegment.segmentIndex, FlightPlanSegmentType.Arrival);

      // planClearSegment() actually removes and replaces the segment, so we need to get a reference to the new segment.
      arrivalSegment = FmsUtils.getArrivalSegment(plan) as FlightPlanSegment;
    }

    const insertProcedureObject: InsertProcedureObject = this.buildArrivalLegs(facility, arrivalIndex, enrouteTransitionIndex, arrivalRunwayTransitionIndex, arrivalRunway);

    let directTargetLeg: FlightPlanLeg | undefined;
    let handleDirectToDestination = false;
    const directToState = this.getDirectToState();

    if (plan.procedureDetails.approachIndex > -1) {
      insertProcedureObject.procedureLegs.pop();
    } else if (directToState === DirectToState.TOEXISTING) {
      directTargetLeg = this.getDirectToLeg();
      if (directTargetLeg?.fixIcao === plan.destinationAirport &&
        directTargetLeg?.fixIcao === insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1].fixIcao) {
        insertProcedureObject.procedureLegs.pop();
        handleDirectToDestination = true;
      }
    }

    insertProcedureObject.procedureLegs.forEach(l => this.planAddLeg(arrivalSegment.segmentIndex, l));

    const prevLeg = plan.getPrevLeg(arrivalSegment.segmentIndex, 0);
    const firstArrLeg = arrivalSegment.legs[0];
    if (prevLeg && firstArrLeg && this.isDuplicateLeg(prevLeg.leg, firstArrLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, firstArrLeg);
    }

    this.removeDestLegFromSegments();

    const nextLeg = plan.getNextLeg(arrivalSegment.segmentIndex, Infinity);
    const lastArrLeg = arrivalSegment.legs[arrivalSegment.legs.length - 1];
    if (nextLeg && lastArrLeg && this.isDuplicateLeg(lastArrLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(lastArrLeg, nextLeg);
    }

    if (handleDirectToDestination) {
      this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Arrival, arrivalSegment.segmentIndex);
    } else if (directToState === DirectToState.TOEXISTING && directTargetLeg && directTargetLeg.fixIcao === plan.destinationAirport) {
      this.removeDirectToExisting();
      this.createDirectToRandom(plan.destinationAirport);
    }

    this.autoDesignateProcedureConstraints(plan, arrivalSegment.segmentIndex);

    plan.calculate(0);
  }

  /**
   * Method to insert the arrival legs.
   * @param facility is the facility to build legs from.
   * @param procedureIndex is the procedure index to build legs from.
   * @param enrouteTransitionIndex is the enroute transition index to build legs from.
   * @param runwayTransitionIndex is the runway transition index to build legs from.
   * @param arrivalRunway is the one way runway, if one is specified in the procedure.
   * @returns InsertProcedureObject to insert into the flight plan.
   */
  private buildArrivalLegs(
    facility: AirportFacility,
    procedureIndex: number,
    enrouteTransitionIndex: number,
    runwayTransitionIndex: number,
    arrivalRunway?: OneWayRunway
  ): InsertProcedureObject {

    const arrival = facility.arrivals[procedureIndex];
    const enRouteTransition = arrival.enRouteTransitions[enrouteTransitionIndex];
    const runwayTransition = arrival.runwayTransitions[runwayTransitionIndex];
    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    if (enRouteTransition !== undefined && enRouteTransition.legs.length > 0) {
      for (const leg of enRouteTransition.legs) {
        const insertLeg = this.procedureLegMapFunc(
          FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(leg))
        );
        insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
      }
    }

    for (let i = 0; i < arrival.commonLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(arrival.commonLegs[i]));
      if (
        i === 0
        && insertProcedureObject.procedureLegs.length > 0
        && this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)
      ) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
          this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
        continue;
      }
      const insertLeg = this.procedureLegMapFunc(leg);
      insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
    }

    let didAddRunwayLeg = false;

    if (runwayTransition) {
      for (let i = 0; i < runwayTransition.legs.length; i++) {
        const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(runwayTransition.legs[i]));
        if (
          i === 0
          && insertProcedureObject.procedureLegs.length > 0
          && this.isDuplicateIFLeg(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg)
        ) {
          insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] =
            this.mergeDuplicateLegData(insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1], leg);
          continue;
        }
        const insertLeg = this.procedureLegMapFunc(leg);

        if (!insertLeg) {
          continue;
        }

        if (i === runwayTransition.legs.length - 1 && ICAO.isValueFacility(insertLeg.fixIcaoStruct, FacilityType.RWY)) {
          const runway = RunwayUtils.matchOneWayRunwayFromIdent(facility, insertLeg.fixIcaoStruct.ident);

          if (!runway) {
            continue;
          }

          // If the procedure runway leg is the first leg, then check if we already added an origin runway leg for
          // the same runway. If we did, then skip the procedure runway leg since we don't want to duplicate the
          // runway leg. If we did not, then replace the origin leg we added with the procedure runway leg (converted
          // to using our own runway leg format).
          if (!arrivalRunway || runway.designation !== arrivalRunway.designation) {
            insertProcedureObject.procedureLegs.push(FmsUtils.buildRunwayLeg(facility, runway, true));
            didAddRunwayLeg = true;
          }
        } else {
          insertProcedureObject.procedureLegs.push(insertLeg);
        }
      }
    }

    if (!didAddRunwayLeg) {
      const destinationLeg = arrivalRunway
        ? FmsUtils.buildRunwayLeg(facility, arrivalRunway, false)
        : FlightPlan.createLeg({
          lat: facility.lat,
          lon: facility.lon,
          type: LegType.TF,
          fixIcaoStruct: facility.icaoStruct,
        });

      insertProcedureObject.procedureLegs.push(destinationLeg);
    }

    this.tryInsertIFLeg(insertProcedureObject);

    return insertProcedureObject;
  }

  /**
   * Method to move a direct to destination to a specified target segment.
   * @param plan is the primary flight plan.
   * @param targetSegmentType is the target segment type.
   * @param arrivalSegmentIndex is the arrival segment index
   * @returns whether a direct to destination was moved.
   */
  private moveDirectToDestinationLeg(plan: FlightPlan, targetSegmentType: FlightPlanSegmentType, arrivalSegmentIndex?: number): boolean {
    if (this.getDirectToState() === DirectToState.TOEXISTING) {
      const directTargetSegmentIndex = targetSegmentType === FlightPlanSegmentType.Arrival ? arrivalSegmentIndex : this.findLastEnrouteSegmentIndex(plan);
      if (directTargetSegmentIndex !== undefined && directTargetSegmentIndex > 0 && plan.getLeg(plan.activeLateralLeg).leg.fixIcao === plan.destinationAirport) {
        const destinationLeg = Object.assign({}, plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex].leg);
        const directTargetLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg).leg);
        const directOriginLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 1).leg);
        const discoLeg = Object.assign({}, plan.getLeg(plan.activeLateralLeg - 2).leg);

        const newDirectLegIndex = plan.getSegment(directTargetSegmentIndex).legs.length;

        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);

        plan.setDirectToData(directTargetSegmentIndex, newDirectLegIndex);

        plan.addLeg(directTargetSegmentIndex, destinationLeg);
        plan.addLeg(directTargetSegmentIndex, discoLeg, undefined, LegDefinitionFlags.DirectTo);
        plan.addLeg(directTargetSegmentIndex, directOriginLeg, undefined, LegDefinitionFlags.DirectTo);
        const newActiveLeg = plan.addLeg(directTargetSegmentIndex, directTargetLeg, undefined, LegDefinitionFlags.DirectTo);
        const newActiveLegIndex = plan.getLegIndexFromLeg(newActiveLeg);

        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
        plan.planIndex !== this.flightPlanner.activePlanIndex && plan.calculate(newActiveLegIndex);

        return true;
      }
    }
    return false;
  }

  /**
   * Method to find the first enroute segment of the supplied flight plan.
   * @param plan is the flight plan to find the first enroute segment in.
   * @returns a segment index.
   */
  public findFirstEnrouteSegmentIndex(plan: FlightPlan): number {
    for (let i = 1; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      if (segment.segmentType === FlightPlanSegmentType.Enroute) {
        return i;
      }
    }
    return 1;
  }

  /**
   * Method to find the last enroute segment of the supplied flight plan.
   * @param plan is the flight plan to find the last enroute segment in.
   * @returns a segment index.
   */
  public findLastEnrouteSegmentIndex(plan: FlightPlan): number {
    let enrouteSegmentFound = 0;
    for (let i = 1; i < plan.segmentCount; i++) {
      const segment = plan.getSegment(i);
      if (segment.segmentType === FlightPlanSegmentType.Enroute) {
        enrouteSegmentFound = i;
      }
    }
    return enrouteSegmentFound;
  }

  /**
   * Method manage the destination leg in the last enroute segment.
   * @param plan is the flight plan.
   * @param currentDestination is the currently set destination airport icao.
   */
  private manageAirportLeg(plan: FlightPlan, currentDestination: IcaoValue | undefined): void {
    if (plan.procedureDetails.arrivalIndex > -1 || !currentDestination || Simplane.getIsGrounded()) {
      //if we don't have a destination set, or an arrival is selected, don't add the airport to enroute
      return;
    }
    const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
    const segment = plan.getSegment(lastEnrouteSegmentIndex);
    const lastLegIndex = segment.legs.length - 1;

    if (currentDestination && (lastLegIndex < 0 || !ICAO.valueEquals(segment.legs[lastLegIndex].leg.fixIcaoStruct, currentDestination))) {
      //if a destination is set, AND either (a) the last enroute segment is empty OR (b) the last enroute segment isn't empty and
      //the last leg of the last enroute segment is not already the current destination
      this.planAddLeg(lastEnrouteSegmentIndex, FlightPlan.createLeg({
        fixIcaoStruct: currentDestination,
        type: LegType.TF
      }));
    }
  }

  /**
   * Method to check whether an approach can load, or only activate.
   * @returns true if the approach can be loaded and not activated, otherwise the approach can only be immediatly activated.
   */
  public canApproachLoad(): boolean {
    const plan = this.getFlightPlan();
    if (plan.length > 0) {
      const activeSegment = plan.getSegment(plan.getSegmentIndex(plan.activeLateralLeg));
      if (activeSegment.segmentType !== FlightPlanSegmentType.Approach && plan.length > 1) {
        return true;
      }
    }
    return false;
  }

  private insertApproachOpId = 0;

  /**
   * Method to add or replace an approach procedure in the flight plan.
   * @param facility is the facility that contains the procedure to add.
   * @param approachIndex is the index of the approach procedure.
   * @param approachTransitionIndex is the index of the approach transition.
   * @param visualRunwayNumber is the visual runway number, if any.
   * @param visualRunwayDesignator is the visual runway designator, if any.
   * @param skipCourseReversal Whether to skip the course reversal. False by default.
   * @param activate Whether to activate the approach once it is loaded into the flight plan. Defaults to `false`.
   * @returns A Promise which is fulfilled with whether the approach was inserted.
   */
  public async insertApproach(
    facility: AirportFacility,
    approachIndex: number,
    approachTransitionIndex: number,
    visualRunwayNumber?: number,
    visualRunwayDesignator?: RunwayDesignator,
    skipCourseReversal = false,
    activate = false
  ): Promise<boolean> {

    const plan = this.getFlightPlan();
    let visualRunway: OneWayRunway | undefined;

    if (visualRunwayNumber !== undefined && visualRunwayDesignator !== undefined) {
      visualRunway = RunwayUtils.matchOneWayRunway(facility, visualRunwayNumber, visualRunwayDesignator);
      if (!visualRunway) {
        return false;
      }
    }

    const opId = ++this.insertApproachOpId;
    const insertProcedureObject = await this.buildApproachLegs(facility, approachIndex, approachTransitionIndex, visualRunway, skipCourseReversal);

    if (opId !== this.insertApproachOpId) {
      return false;
    }

    const originalPlanLength = plan.length;

    // Loading a new approach will always kick us out of any existing missed approach, so deactivate the missed approach.
    this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], false, true, true);

    let skipDestinationLegCheck = false;

    const approachRunway = insertProcedureObject.runway;
    const approachRunwayIcao = approachRunway ? RunwayUtils.getRunwayFacilityIcao(facility, approachRunway) : undefined;
    const isDtoExistingToRunwayActive = approachRunway
      && this.getDirectToState() === DirectToState.TOEXISTING
      && plan.getLeg(plan.activeLateralLeg).leg.fixIcao[0] === 'R';

    const isDtoExistingToApproachRunway = isDtoExistingToRunwayActive && approachRunway && plan.getLeg(plan.activeLateralLeg).leg.fixIcao === approachRunwayIcao;

    let dtoExistingToRunwayIcao = '';
    let dtoExistingToRunwayCourse: number | undefined = undefined;

    if (isDtoExistingToRunwayActive) {
      const dtoLeg = plan.getLeg(plan.activeLateralLeg);
      dtoExistingToRunwayIcao = dtoLeg.leg.fixIcao;
      dtoExistingToRunwayCourse = dtoLeg.leg.type === LegType.DF ? undefined : dtoLeg.leg.course;

      // Do not remove the destination runway leg if it is part of an arrival and the target of a direct to existing
      skipDestinationLegCheck = plan.getSegment(plan.directToData.segmentIndex).segmentType === FlightPlanSegmentType.Arrival;
    }

    plan.deleteUserData(FmsFplUserDataKey.VfrApproach);

    if (visualRunway) {
      plan.setUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach, {
        runwayDesignation: visualRunway.designation,
        isVtf: approachTransitionIndex < 0
      });
      plan.setUserData<string>(FmsFplUserDataKey.VisualApproachRunway, visualRunway.designation);
    } else {
      plan.deleteUserData(FmsFplUserDataKey.VisualApproach);
      plan.deleteUserData(FmsFplUserDataKey.VisualApproachRunway);
    }

    plan.setUserData<boolean>(FmsFplUserDataKey.ApproachSkipCourseReversal, skipCourseReversal);

    plan.setApproach(facility.icao, approachIndex, approachTransitionIndex);

    if (plan.procedureDetails.arrivalIndex < 0) {
      if (!this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute)) {
        this.manageAirportLeg(plan, plan.destinationAirport ? ICAO.stringV1ToValue(plan.destinationAirport) : undefined);
      } else {
        skipDestinationLegCheck = true;
      }
    }
    plan.setDestinationAirport(facility.icao);

    if (!skipDestinationLegCheck) {
      this.removeDestLegFromSegments();
    }

    let approachSegment = plan.getSegment(this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach));

    if (approachSegment.legs.length > 0) {
      this.planClearSegment(approachSegment.segmentIndex, FlightPlanSegmentType.Approach);

      // planClearSegment() actually removes and replaces the segment, so we need to get a reference to the new segment.
      approachSegment = FmsUtils.getApproachSegment(plan) as FlightPlanSegment;
    }

    if (insertProcedureObject.runway) {
      plan.setDestinationRunway(insertProcedureObject.runway);
    }

    let didAddVtfFafLeg = false;
    let haveAddedMap = false;
    insertProcedureObject.procedureLegs.forEach((leg, index, array) => {
      let isMissedLeg = false;
      if (visualRunway !== undefined) {
        // If the leg's fix is a visual approach fix, we need to add it to the facility repository so that others can
        // look it up properly.
        if (leg.type !== LegType.Discontinuity && leg.type !== LegType.ThruDiscontinuity) {
          this.addVisualFacilityFromLeg(leg, visualRunway.designation);
        }
        if (haveAddedMap) {
          isMissedLeg = true;
        }
        if (leg.fixTypeFlags & FixTypeFlags.MAP) {
          haveAddedMap = true;
        }
      }

      let flags = leg.legDefinitionFlags ?? LegDefinitionFlags.None;

      // If we are inserting a VTF leg, we need to save the terminator ICAO of the prior leg in the published procedure
      // to the plan user data.
      if (BitFlags.isAll(flags, LegDefinitionFlags.VectorsToFinalFaf)) {
        const prevLeg = array[index - 1];
        const fixIcao = prevLeg === undefined ? undefined : FlightPlanUtils.getTerminatorIcao(prevLeg);

        plan.setUserData(Fms.VTF_FAF_DATA_KEY, fixIcao ?? '');
        didAddVtfFafLeg = true;
      }

      if (isMissedLeg) {
        flags |= LegDefinitionFlags.MissedApproach;
      }

      this.planAddLeg(approachSegment.segmentIndex, leg, undefined, flags);
    });

    if (!didAddVtfFafLeg) {
      plan.deleteUserData(Fms.VTF_FAF_DATA_KEY);
    }

    const prevLeg = plan.getPrevLeg(approachSegment.segmentIndex, 0);
    const firstAppLeg = approachSegment.legs[0];
    if (prevLeg && firstAppLeg && this.isDuplicateLeg(prevLeg.leg, firstAppLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, firstAppLeg);
    }

    // Adds missed approach legs
    if (!visualRunway && insertProcedureObject.procedureLegs.length > 0) {
      const missedLegs = facility.approaches[approachIndex].missedLegs;
      if (missedLegs.length > 0) {
        let maphIndex = -1;
        for (let m = missedLegs.length - 1; m >= 0; m--) {
          switch (missedLegs[m].type) {
            case LegType.HA:
            case LegType.HF:
            case LegType.HM:
              maphIndex = m - 1;
              break;
          }
        }
        for (let n = 0; n < missedLegs.length; n++) {
          const validLeg = this.procedureLegMapFunc(
            FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(missedLegs[n]))
          );
          if (validLeg) {
            if (maphIndex >= 0 && n === maphIndex) {
              validLeg.fixTypeFlags |= FixTypeFlags.MAHP;
            }
            this.planAddLeg(approachSegment.segmentIndex, validLeg, undefined, LegDefinitionFlags.MissedApproach);
          }
        }
      }
    }

    const approachType = visualRunway ? AdditionalApproachType.APPROACH_TYPE_VISUAL : facility.approaches[approachIndex].approachType;
    const bestRnavType = visualRunway ? RnavTypeFlags.None : FmsUtils.getBestRnavType(facility.approaches[approachIndex].rnavTypeFlags);
    const rnavTypeFlags = visualRunway ? RnavTypeFlags.None : facility.approaches[approachIndex].rnavTypeFlags;
    const approachIsCircling = !visualRunway && !facility.approaches[approachIndex].runway ? true : false;
    const isVtf = approachTransitionIndex < 0;

    let referenceFacility: VorFacility | null = null;
    if (!visualRunway && FmsUtils.approachHasNavFrequency(facility.approaches[approachIndex])) {
      referenceFacility = (await ApproachUtils.getReferenceFacility(facility.approaches[approachIndex], this.facLoader) as VorFacility | undefined) ?? null;
    }

    ++this.updateApproachDetailsOpId;
    this.setApproachDetails(true, true, approachType, bestRnavType, rnavTypeFlags, approachIsCircling, isVtf, referenceFacility, approachRunway);

    this.autoDesignateProcedureConstraints(plan, approachSegment.segmentIndex);

    await plan.calculate();

    if (opId !== this.insertApproachOpId) {
      return false;
    }

    if (!activate && isDtoExistingToRunwayActive && this.getDirectToState() !== DirectToState.TOEXISTING) {
      // Direct To Existing to the destination runway was canceled as a result of adding the approach
      if (isDtoExistingToApproachRunway) {
        // DTO target runway matches the runway of the loaded approach -> need to reactivate DTO to the new runway leg
        // in the approach
        const runwayLegIndex = approachSegment.legs.findIndex(leg => leg.leg.fixIcao === approachRunwayIcao);
        if (runwayLegIndex >= 0) {
          this.createDirectToExisting(approachSegment.segmentIndex, runwayLegIndex, dtoExistingToRunwayCourse);
        }
      } else {
        // DTO target runway does not match the runway of the loaded approach (or the approach is circling only) ->
        // activate DTO random to the old runway
        this.createDirectToRandom(dtoExistingToRunwayIcao, dtoExistingToRunwayCourse);
      }
    } else {
      // If there were fewer than 2 legs in the flight plan before the approach was loaded, then we are forced to
      // activate the approach.
      activate ||= originalPlanLength < 2;
    }

    if (activate) {
      if (approachTransitionIndex < 0) {
        this.activateVtf();
      } else {
        this.activateApproach();
      }
    } else {
      // Only auto-tune approach frequency if not activating the approach, because activating the approach will also
      // trigger auto-tune.
      for (const index of this.navRadioIndexes) {
        this.setLocFrequency(index);
      }
    }

    return true;
  }

  /**
   * Method to insert the approach legs.
   * @param facility The facility to build legs from.
   * @param approachIndex The approach procedure index to build legs from.
   * @param approachTransitionIndex The transition index to build legs from.
   * @param visualRunway If this is a visual approach, the visual approach one way runway object.
   * @param skipCourseReversal Whether to skip the course reversal.
   * @returns A Promise which is fulfilled with an `InsertProcedureObject` containing the flight plan legs to insert
   * into the flight plan.
   */
  private async buildApproachLegs(
    facility: AirportFacility,
    approachIndex: number,
    approachTransitionIndex: number,
    visualRunway?: OneWayRunway,
    skipCourseReversal?: boolean
  ): Promise<InsertProcedureObject> {
    const isVisual = !!visualRunway;
    const approach = isVisual
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? FmsUtils.buildVisualApproach(facility, visualRunway!, this.visualApproachOptions.finalFixDistance, this.visualApproachOptions.strghtFixDistance)
      : facility.approaches[approachIndex];

    const transition = approach.transitions[approachTransitionIndex];
    const isVtf = approachTransitionIndex < 0;
    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    if (transition !== undefined && transition.legs.length > 0) {
      for (let i = 0; i < transition.legs.length; i++) {
        const insertLeg = this.procedureLegMapFunc(
          FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(transition.legs[i]))
        );
        insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
      }
    }

    const lastTransitionLeg = insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1];

    if (isVtf) {
      insertProcedureObject.procedureLegs.push(FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }));
    }

    const finalLegs = approach.finalLegs;
    for (let i = 0; i < finalLegs.length; i++) {
      const leg = FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(finalLegs[i]));
      if (i === 0 && lastTransitionLeg && this.isDuplicateIFLeg(lastTransitionLeg, leg)) {
        insertProcedureObject.procedureLegs[insertProcedureObject.procedureLegs.length - 1] = this.mergeDuplicateLegData(lastTransitionLeg, leg);
        continue;
      }

      if (!isVisual && ICAO.isValueFacility(leg.fixIcaoStruct, FacilityType.RWY)) {
        const approachRunway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
        if (approachRunway) {
          insertProcedureObject.runway = approachRunway;
          const runwayLeg = FmsUtils.buildRunwayLeg(facility, approachRunway, false);
          runwayLeg.altitude1 += Fms.RUNWAY_LEG_ALTITUDE_OFFSET; // Add offset to raise runway leg altitude above the runway elevation.

          insertProcedureObject.procedureLegs.push(runwayLeg);
        }
      } else if (isVisual && i === finalLegs.length - 1) {
        insertProcedureObject.runway = visualRunway;
        insertProcedureObject.procedureLegs.push(leg);
        if (approach.missedLegs.length > 0) {
          insertProcedureObject.procedureLegs.push(approach.missedLegs[0]);
        }
      } else {
        if (isVtf && BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.FAF)) {
          // If this is a VTF approach, replace the faf leg with a VTF leg
          await this.insertVtfLeg(insertProcedureObject, leg, finalLegs[i - 1], finalLegs[i + 1]);
        } else {
          const insertLeg = this.procedureLegMapFunc(leg);
          insertLeg && insertProcedureObject.procedureLegs.push(insertLeg);
        }
      }
    }

    if (!isVisual) {
      this.tryInsertIFLeg(insertProcedureObject);
      this.tryReconcileIAFLeg(insertProcedureObject);
      this.manageFafAltitudeRestriction(insertProcedureObject);
      this.tryCleanupHold(insertProcedureObject);
      if (skipCourseReversal) {
        this.tryRemoveCourseReversal(insertProcedureObject);
      }
      this.tryInsertMap(insertProcedureObject);

      if (!insertProcedureObject.runway && approach.runway) {
        insertProcedureObject.runway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
      }

      if (isVtf) {
        // If the first leg (not counting the discontinuity leg) of the VTF approach is not already an IF leg, replace
        // it with one unless it is also the faf and a CF leg.
        // Note that we can skip checking for certain leg types because they are handled by tryInsertIfLeg().

        const firstLeg = insertProcedureObject.procedureLegs[1];

        switch (firstLeg?.type) {
          case LegType.TF:
          case LegType.DF:
          case LegType.CF:
            if (BitFlags.isAll(firstLeg.fixTypeFlags, FixTypeFlags.FAF)) {
              break;
            }
          // eslint-disable-next-line no-fallthrough
          case LegType.AF:
          case LegType.RF:
            insertProcedureObject.procedureLegs[1] = FlightPlan.createLeg({
              type: LegType.IF,
              fixIcaoStruct: firstLeg.fixIcaoStruct,
              fixTypeFlags: firstLeg.fixTypeFlags
            });
            break;
          default:
            // If we are not replacing the leg, we need to remove altitude restrictions from the leg unless it is the faf
            if (!BitFlags.isAll(firstLeg.fixTypeFlags, FixTypeFlags.FAF)) {
              firstLeg.altDesc = AltitudeRestrictionType.Unused;
              firstLeg.altitude1 = 0;
              firstLeg.altitude2 = 0;
            }
        }
      }
    }

    return insertProcedureObject;
  }

  /**
   * Inserts a VFR approach into the primary flight plan, replacing any approach that is already loaded.
   *
   * VFR approaches are distinct from both _visual instrument approaches_, which are a type of published IFR approach,
   * and _Garmin visual approaches_, which are auto-generated approaches not based on any published approach. A VFR
   * approach is based on a published IFR approach, but only includes the flight plan legs between and including those
   * ending at the final approach fix (faf) and missed approach point (map). Flight plan legs in the missed approach
   * procedure are not included.
   * @param facility The airport facility containing the published approach on which the VFR approach to insert is
   * based.
   * @param approachIndex The index of the published approach on which the VFR approach to insert is based.
   * @param isVtf Whether to insert the approach as a vectors-to-final (VTF) approach.
   * @param activate Whether to activate the approach once it is loaded into the flight plan. Defaults to `false`.
   * @returns A Promise which is fulfilled with whether the approach was inserted.
   */
  public async insertVfrApproach(
    facility: AirportFacility,
    approachIndex: number,
    isVtf: boolean,
    activate = false
  ): Promise<boolean> {

    const plan = this.getFlightPlan();

    const opId = ++this.insertApproachOpId;
    const insertProcedureObject = await this.buildVfrApproachLegs(facility, approachIndex, isVtf);

    if (opId !== this.insertApproachOpId || !insertProcedureObject) {
      return false;
    }

    const originalPlanLength = plan.length;

    // Loading a new approach will always kick us out of any existing missed approach, so deactivate the missed approach.
    this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], false, true, true);

    let skipDestinationLegCheck = false;

    const approachRunway = insertProcedureObject.runway;
    const approachRunwayIcao = approachRunway ? RunwayUtils.getRunwayFacilityIcao(facility, approachRunway) : undefined;
    const isDtoExistingToRunwayActive = approachRunway
      && this.getDirectToState() === DirectToState.TOEXISTING
      && plan.getLeg(plan.activeLateralLeg).leg.fixIcao[0] === 'R';

    const isDtoExistingToApproachRunway = isDtoExistingToRunwayActive && approachRunway && plan.getLeg(plan.activeLateralLeg).leg.fixIcao === approachRunwayIcao;

    let dtoExistingToRunwayIcao = '';
    let dtoExistingToRunwayCourse: number | undefined = undefined;

    if (isDtoExistingToRunwayActive) {
      const dtoLeg = plan.getLeg(plan.activeLateralLeg);
      dtoExistingToRunwayIcao = dtoLeg.leg.fixIcao;
      dtoExistingToRunwayCourse = dtoLeg.leg.type === LegType.DF ? undefined : dtoLeg.leg.course;

      // Do not remove the destination runway leg if it is part of an arrival and the target of a direct to existing
      skipDestinationLegCheck = plan.getSegment(plan.directToData.segmentIndex).segmentType === FlightPlanSegmentType.Arrival;
    }

    plan.deleteUserData(FmsFplUserDataKey.VisualApproach);
    plan.deleteUserData(FmsFplUserDataKey.VisualApproachRunway);

    plan.setUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach, {
      approachIndex,
      isVtf
    });

    plan.setUserData<boolean>(FmsFplUserDataKey.ApproachSkipCourseReversal, false);

    plan.setApproach(facility.icao, -1, isVtf ? -1 : 0);

    if (plan.procedureDetails.arrivalIndex < 0) {
      if (!this.moveDirectToDestinationLeg(plan, FlightPlanSegmentType.Enroute)) {
        this.manageAirportLeg(plan, plan.destinationAirport ? ICAO.stringV1ToValue(plan.destinationAirport) : undefined);
      } else {
        skipDestinationLegCheck = true;
      }
    }
    plan.setDestinationAirport(facility.icao);

    if (!skipDestinationLegCheck) {
      this.removeDestLegFromSegments();
    }

    let approachSegment = plan.getSegment(this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach));

    if (approachSegment.legs.length > 0) {
      this.planClearSegment(approachSegment.segmentIndex, FlightPlanSegmentType.Approach);

      // planClearSegment() actually removes and replaces the segment, so we need to get a reference to the new segment.
      approachSegment = FmsUtils.getApproachSegment(plan) as FlightPlanSegment;
    }

    if (insertProcedureObject.runway) {
      plan.setDestinationRunway(insertProcedureObject.runway);
    }

    let didAddVtfFafLeg = false;
    insertProcedureObject.procedureLegs.forEach((leg, index, array) => {
      const flags = leg.legDefinitionFlags ?? LegDefinitionFlags.None;

      // If we are inserting a VTF leg, we need to save the terminator ICAO of the prior leg in the published procedure
      // to the plan user data.
      if (BitFlags.isAll(flags, LegDefinitionFlags.VectorsToFinalFaf)) {
        const prevLeg = array[index - 1];
        const fixIcao = prevLeg === undefined ? undefined : FlightPlanUtils.getTerminatorIcao(prevLeg);

        plan.setUserData(Fms.VTF_FAF_DATA_KEY, fixIcao ?? '');
        didAddVtfFafLeg = true;
      }

      this.planAddLeg(approachSegment.segmentIndex, leg, undefined, flags);
    });

    if (!didAddVtfFafLeg) {
      plan.deleteUserData(Fms.VTF_FAF_DATA_KEY);
    }

    const prevLeg = plan.getPrevLeg(approachSegment.segmentIndex, 0);
    const firstAppLeg = approachSegment.legs[0];
    if (prevLeg && firstAppLeg && this.isDuplicateLeg(prevLeg.leg, firstAppLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, firstAppLeg);
    }

    const approachType = GarminAdditionalApproachType.APPROACH_TYPE_VFR;
    const bestRnavType = RnavTypeFlags.None;
    const rnavTypeFlags = RnavTypeFlags.None;
    const approachIsCircling = !facility.approaches[approachIndex].runway ? true : false;

    let referenceFacility: VorFacility | null = null;
    if (FmsUtils.approachHasNavFrequency(facility.approaches[approachIndex])) {
      referenceFacility = (await ApproachUtils.getReferenceFacility(facility.approaches[approachIndex], this.facLoader) as VorFacility | undefined) ?? null;
    }

    ++this.updateApproachDetailsOpId;
    this.setApproachDetails(true, true, approachType, bestRnavType, rnavTypeFlags, approachIsCircling, isVtf, referenceFacility, approachRunway);

    await plan.calculate();

    if (opId !== this.insertApproachOpId) {
      return false;
    }

    if (!activate && isDtoExistingToRunwayActive && this.getDirectToState() !== DirectToState.TOEXISTING) {
      // Direct To Existing to the destination runway was canceled as a result of adding the approach
      if (isDtoExistingToApproachRunway) {
        // DTO target runway matches the runway of the loaded approach -> need to reactivate DTO to the new runway leg
        // in the approach
        const runwayLegIndex = approachSegment.legs.findIndex(leg => leg.leg.fixIcao === approachRunwayIcao);
        if (runwayLegIndex >= 0) {
          this.createDirectToExisting(approachSegment.segmentIndex, runwayLegIndex, dtoExistingToRunwayCourse);
        }
      } else {
        // DTO target runway does not match the runway of the loaded approach (or the approach is circling only) ->
        // activate DTO random to the old runway
        this.createDirectToRandom(dtoExistingToRunwayIcao, dtoExistingToRunwayCourse);
      }
    } else {
      // If there were fewer than 2 legs in the flight plan before the approach was loaded, then we are forced to
      // activate the approach.
      activate ||= originalPlanLength < 2;
    }

    if (activate) {
      if (isVtf) {
        this.activateVtf();
      } else {
        this.activateApproach();
      }
    } else {
      // Only auto-tune approach frequency if not activating the approach, because activating the approach will also
      // trigger auto-tune.
      for (const index of this.navRadioIndexes) {
        this.setLocFrequency(index);
      }
    }

    return true;
  }

  /**
   * Builds a set of VFR approach flight plan legs.
   * @param facility The airport facility containing the approach procedure for which build the legs.
   * @param approachIndex The index of the approach procedure for which to build the legs.
   * @param isVtf Whether to build a set of legs for a vectors-to-final (VTF) approach.
   * @returns A Promise which will be fulfilled with an `InsertProcedureObject` containing the flight plan legs to
   * insert into the flight plan, or with `undefined` if a set of legs could not be built for the specified procedure.
   */
  private async buildVfrApproachLegs(
    facility: AirportFacility,
    approachIndex: number,
    isVtf: boolean
  ): Promise<InsertProcedureObject | undefined> {
    const approach = FmsUtils.buildVfrApproach(facility, approachIndex);

    if (!approach) {
      return undefined;
    }

    const insertProcedureObject: InsertProcedureObject = { procedureLegs: [] };

    const finalLegs = approach.finalLegs;
    for (let i = 0; i < finalLegs.length; i++) {
      const leg = finalLegs[i];

      if (ICAO.isValueFacility(leg.fixIcaoStruct, FacilityType.RWY)) {
        const approachRunway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
        if (approachRunway) {
          insertProcedureObject.runway = approachRunway;
          const runwayLeg = FmsUtils.buildRunwayLeg(facility, approachRunway, false);
          runwayLeg.altitude1 += Fms.RUNWAY_LEG_ALTITUDE_OFFSET; // Add offset to raise runway leg altitude above the runway elevation.
          runwayLeg.fixTypeFlags = leg.fixTypeFlags;

          insertProcedureObject.procedureLegs.push(runwayLeg);
        }
      } else {
        if (BitFlags.isAll(leg.fixTypeFlags, FixTypeFlags.FAF) && isVtf) {
          // If this is a VTF approach, attempt to replace the faf leg with a VTF leg
          await this.insertVtfLeg(insertProcedureObject, FlightPlan.createLeg(leg), finalLegs[i - 1], finalLegs[i + 1]);
        } else {
          const insertLeg = this.procedureLegMapFunc(
            FlightPlanUtils.convertLegRunwayIcaosToSdkFormat(FlightPlan.createLeg(leg))
          );
          insertLeg && insertProcedureObject.procedureLegs.push(FlightPlan.createLeg(insertLeg));
        }
      }
    }

    // Ensure VTF approaches begin with a discontinuity.
    if (isVtf) {
      insertProcedureObject.procedureLegs.unshift(FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }));
    }

    this.manageFafAltitudeRestriction(insertProcedureObject);

    if (!insertProcedureObject.runway && approach.runway) {
      insertProcedureObject.runway = RunwayUtils.matchOneWayRunway(facility, approach.runwayNumber, approach.runwayDesignator);
    }

    return insertProcedureObject;
  }

  /**
   * Inserts a vector-to-final (VTF) leg into a procedure insertion object. A VTF leg is a CF leg to the final approach
   * fix with the {@link LegDefinitionFlags.VectorsToFinalFaf} flag applied to it.
   *
   * The course of the VTF leg is defined as follows:
   * * If the leg to the faf is a CF leg, the VTF course is equal to the CF leg course.
   * * If the leg to the faf is not an IF leg, the VTF course is defined by the great-circle path from the fix
   * immediately prior to the faf to the faf.
   * * If the leg to the faf is an IF leg, the VTF course is defined by the great-circle path from the faf to the fix
   * immediately following it.
   *
   * If a VTF course cannot be defined, then the normal faf leg is inserted instead of the VTF leg.
   * @param insertProcedureObject The procedure insertion object into which to insert the leg.
   * @param fafLeg The leg to the final approach fix.
   * @param prevLeg The leg before the faf leg.
   * @param nextLeg The leg after the faf leg.
   */
  private async insertVtfLeg(insertProcedureObject: InsertProcedureObject, fafLeg: FlightPlanLeg, prevLeg?: FlightPlanLeg, nextLeg?: FlightPlanLeg): Promise<void> {
    switch (fafLeg.type) {
      case LegType.CF:
      case LegType.TF:
      case LegType.IF:
      case LegType.DF:
        break;
      default:
        insertProcedureObject.procedureLegs.push(fafLeg);
        return;
    }

    try {
      const fafFacility: LatLonInterface = ICAO.isFacility(fafLeg.fixIcao, FacilityType.VIS)
        // If the faf fix is a visual facility, we can't retrieve it from facility loader because it is not guaranteed
        // to exist yet. However, because we are dealing with a visual approach, the leg should define the fix's
        // lat/lon coordinates.
        ? { lat: fafLeg.lat ?? 0, lon: fafLeg.lon ?? 0 }
        : await this.facLoader.getFacility(ICAO.getFacilityType(fafLeg.fixIcao), fafLeg.fixIcao);

      let course: number | undefined;
      let trueDegrees: boolean;

      if (fafLeg.type === LegType.CF) {
        course = fafLeg.course;
        trueDegrees = fafLeg.trueDegrees;
      } else {
        const fafPoint = Fms.geoPointCache[0].set(fafFacility);

        if (fafLeg.type === LegType.IF) {
          // faf leg is an IF, meaning it is the first leg in the approach -> get the course from the next leg.

          let nextLegFixIcao = '';
          switch (nextLeg?.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA:
              nextLegFixIcao = nextLeg.fixIcao;
          }

          if (ICAO.isFacility(nextLegFixIcao)) {
            const nextLegFacility = await this.facLoader.getFacility(ICAO.getFacilityType(nextLegFixIcao), nextLegFixIcao);
            course = fafPoint.bearingTo(nextLegFacility);
          }
        } else {
          // faf leg is not the first leg in the approach -> get the course from the previous leg.

          let prevLegFixIcao = '';
          switch (prevLeg?.type) {
            case LegType.IF:
            case LegType.TF:
            case LegType.DF:
            case LegType.CF:
            case LegType.AF:
            case LegType.RF:
            case LegType.HF:
            case LegType.HM:
            case LegType.HA:
              prevLegFixIcao = prevLeg.fixIcao;
          }

          if (ICAO.isFacility(prevLegFixIcao)) {
            const prevLegFacility = await this.facLoader.getFacility(ICAO.getFacilityType(prevLegFixIcao), prevLegFixIcao);
            course = fafPoint.bearingFrom(prevLegFacility);
          }
        }

        trueDegrees = true;
      }

      if (course === undefined) {
        insertProcedureObject.procedureLegs.push(fafLeg);
        return;
      }

      const vtfFafLeg: InsertProcedureObjectLeg = FlightPlan.createLeg({
        type: LegType.CF,
        lat: fafFacility.lat,
        lon: fafFacility.lon,
        fixIcaoStruct: fafLeg.fixIcaoStruct,
        course,
        trueDegrees,
        originIcaoStruct: fafLeg.originIcaoStruct,
        fixTypeFlags: fafLeg.fixTypeFlags,
        altDesc: fafLeg.altDesc,
        altitude1: fafLeg.altitude1,
        altitude2: fafLeg.altitude2,
        speedRestriction: fafLeg.speedRestriction
      });

      vtfFafLeg.legDefinitionFlags = LegDefinitionFlags.VectorsToFinalFaf;

      insertProcedureObject.procedureLegs.push(vtfFafLeg);
    } catch (e) {
      console.warn(`Fms: could not insert VTF legs due to error... ${e}`);
      if (e instanceof Error) {
        console.error(e.stack);
      }

      insertProcedureObject.procedureLegs.push(fafLeg);
    }
  }

  /**
   * Manages the altitude constraints when adding a procedure by creating a VerticalData object for each leg.
   * @param plan The Flight Plan.
   * @param segmentIndex The segment index for the inserted procedure.
   */
  private autoDesignateProcedureConstraints(plan: FlightPlan, segmentIndex: number): void {
    const segment = plan.getSegment(segmentIndex);
    const isDeparture = segment.segmentType === FlightPlanSegmentType.Origin || segment.segmentType === FlightPlanSegmentType.Departure;
    const isApproach = segment.segmentType === FlightPlanSegmentType.Approach;

    for (let l = 0; l < segment.legs.length; l++) {
      const leg = segment.legs[l];
      const isMapr = isApproach && BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach);

      const isAltitudeDesignable = this.isAltitudeAutoDesignable(segment, leg);

      let phase = VerticalFlightPhase.Descent;
      let altDesc = AltitudeRestrictionType.Unused;
      let altitude1 = 0;
      let altitude2 = 0;

      if (isAltitudeDesignable) {
        // For simple VNAV, convert all constraints to AT constraints (for BETWEEN constraints, use the lower altitude).
        if (!this.isAdvancedVnav) {
          phase = VerticalFlightPhase.Descent;
          altDesc = leg.leg.altDesc === AltitudeRestrictionType.Unused ? AltitudeRestrictionType.Unused : AltitudeRestrictionType.At;
          altitude1 = leg.leg.altDesc === AltitudeRestrictionType.Between ? leg.leg.altitude2 : leg.leg.altitude1;
          altitude2 = 0;
        } else {
          phase = isDeparture || isMapr ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent;
          altDesc = leg.leg.altDesc;
          altitude1 = leg.leg.altitude1;
          altitude2 = leg.leg.altitude2;
        }
      }

      const verticalData: VerticalData = {
        phase,
        altDesc,
        altitude1,
        altitude2,
        displayAltitude1AsFlightLevel: FmsUtils.displayAltitudeAsFlightLevel(altitude1),
        displayAltitude2AsFlightLevel: FmsUtils.displayAltitudeAsFlightLevel(altitude2),
        isAltitude1TempCompensated: false,
        isAltitude2TempCompensated: false,
        speed: leg.leg.speedRestriction,
        speedDesc: FmsUtils.getPublishedSpeedDescBasedOnSegment(leg.leg.speedRestriction, segment.segmentType),
        speedUnit: SpeedUnit.IAS,
      };

      plan.setLegVerticalData(segmentIndex, l, verticalData);
    }
  }

  /**
   * Checks whether an altitude constraint defined for a flight plan leg in a procedure can be auto-designated.
   * @param segment The procedure segment containing the flight plan leg to evaluate.
   * @param leg The flight plan leg to evaluate.
   * @returns Whether an altitude constraint defined for the specified orocedure flight plan leg can be
   * auto-designated.
   */
  private isAltitudeAutoDesignable(segment: FlightPlanSegment, leg: LegDefinition): boolean {
    if (BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
      return false;
    }

    if (this.isAdvancedVnav) {
      switch (leg.leg.type) {
        case LegType.FM:
        case LegType.VM:
        case LegType.HM:
        case LegType.HA:
          return false;
      }
    } else {

      // Departure altitudes are not designable in simple VNAV mode.
      if (segment.segmentType === FlightPlanSegmentType.Origin || segment.segmentType === FlightPlanSegmentType.Departure) {
        return false;
      }

      // Missed approach altitudes are not designable in simple VNAV mode.
      if (BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach)) {
        return false;
      }

      switch (leg.leg.type) {
        case LegType.FM:
        case LegType.VM:
        case LegType.HM:
        case LegType.CI:
        case LegType.VI:
        case LegType.CR:
        case LegType.VR:
        case LegType.CA:
        case LegType.FA:
        case LegType.VA:
        case LegType.HA:
        case LegType.HF:
          return false;
      }
    }

    return true;
  }

  /**
   * Method to set a user altitude constraint.
   * @param segmentIndex The segment index to insert the constraint at.
   * @param segmentLegIndex The leg index to insert the constraint at.
   * @param altitudeFeet The altitude, in feet, to set the constraint at; if undefined, delete user constraint.
   * @param displayAsFlightLevel Whether the constraint should be displayed as a flight level. Defaults to false.
   * @throws Error if altitude is NaN.
   */
  public setUserConstraint(segmentIndex: number, segmentLegIndex: number, altitudeFeet?: number, displayAsFlightLevel = false): void {
    if (altitudeFeet !== undefined && isNaN(altitudeFeet)) {
      throw new Error('altitudeFeet must not be NaN');
    }

    if (!this.hasPrimaryFlightPlan()) {
      return;
    }

    const plan = this.getPrimaryFlightPlan();

    const verticalData: AltitudeConstraintSimple & Partial<VerticalData> = {
      phase: VerticalFlightPhase.Descent,
      altDesc: altitudeFeet !== undefined ? AltitudeRestrictionType.At : AltitudeRestrictionType.Unused,
      altitude1: altitudeFeet !== undefined ? UnitType.FOOT.convertTo(altitudeFeet, UnitType.METER) : 0,
      displayAltitude1AsFlightLevel: displayAsFlightLevel,
    };

    // When setting an altitude constraint other than "At", delete the FPA
    if (verticalData.altDesc !== AltitudeRestrictionType.At) {
      verticalData.fpa = undefined;
    }

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Method to set a user altitude constraint.
   * @param segmentIndex The segment index to insert the constraint at.
   * @param segmentLegIndex The leg index to insert the constraint at.
   * @param phase The vertical restriction type.
   * @param altDesc The altitude restriction type.
   * @param altitude1Meters The altitude 1 in meters.
   * @param displayAltitude1AsFlightLevel Whether to display altitude 1 as a flight level.
   * @param altitude2Meters The altitude 2 in meters. Optional.
   * @param displayAltitude2AsFlightLevel Whether to display altitude 2 as a flight level.
   * @throws Error if either altitude is NaN.
   */
  public setUserConstraintAdvanced(
    segmentIndex: number,
    segmentLegIndex: number,
    phase: VerticalFlightPhase,
    altDesc: AltitudeRestrictionType,
    altitude1Meters: number,
    displayAltitude1AsFlightLevel: boolean,
    altitude2Meters = 0,
    displayAltitude2AsFlightLevel = false,
  ): void {
    if (isNaN(altitude1Meters)) {
      throw new Error('altitude1Meters must not be NaN');
    }
    if (isNaN(altitude2Meters)) {
      throw new Error('altitude2Meters must not be NaN');
    }

    if (!this.hasPrimaryFlightPlan()) { return; }

    const plan = this.getPrimaryFlightPlan();

    const verticalData: AltitudeConstraintAdvanced & Partial<VerticalData> = {
      phase,
      altDesc,
      altitude1: altitude1Meters,
      displayAltitude1AsFlightLevel,
      altitude2: altitude2Meters,
      displayAltitude2AsFlightLevel,
    };

    // When setting an altitude constraint other than "At", delete the FPA
    if (verticalData.altDesc !== AltitudeRestrictionType.At) {
      verticalData.fpa = undefined;
    }

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Reverts an altitude constraint to the published data.
   * @param segmentIndex The segment index to revert the constraint at.
   * @param segmentLegIndex The leg index to revert the constraint at.
   */
  public revertAltitudeConstraint(segmentIndex: number, segmentLegIndex: number): void {
    if (!this.hasPrimaryFlightPlan()) { return; }

    const plan = this.getPrimaryFlightPlan();
    const segment = plan.tryGetSegment(segmentIndex);
    const leg = segment?.legs[segmentLegIndex];

    if (segment === null || leg === undefined) { return; }

    let phase = VerticalFlightPhase.Descent;
    let altDesc = AltitudeRestrictionType.Unused;
    let altitude1 = 0;
    let altitude2 = 0;

    if (!this.isAdvancedVnav) {
      phase = VerticalFlightPhase.Descent;
      altDesc = leg.leg.altDesc === AltitudeRestrictionType.Unused ? AltitudeRestrictionType.Unused : AltitudeRestrictionType.At;
      altitude1 = leg.leg.altDesc === AltitudeRestrictionType.Between ? leg.leg.altitude2 : leg.leg.altitude1;
      altitude2 = 0;
    } else {
      const isDeparture = segment.segmentType === FlightPlanSegmentType.Departure;
      const isMapr = BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach);

      phase = isDeparture || isMapr ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent;
      altDesc = leg.leg.altDesc;
      altitude1 = leg.leg.altitude1;
      altitude2 = leg.leg.altitude2;
    }

    const verticalData: AltitudeConstraintAdvanced & Partial<VerticalData> = {
      phase,
      altDesc,
      altitude1,
      altitude2,
      displayAltitude1AsFlightLevel: FmsUtils.displayAltitudeAsFlightLevel(altitude1),
      displayAltitude2AsFlightLevel: FmsUtils.displayAltitudeAsFlightLevel(altitude2),
    };

    // When setting an altitude constraint other than "At", delete the FPA
    if (verticalData.altDesc !== AltitudeRestrictionType.At) {
      verticalData.fpa = undefined;
    }

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Method to set a user speed constraint.
   * @param planIndex The flight plan index to use.
   * @param segmentIndex The segment index to insert the constraint at.
   * @param segmentLegIndex The leg index to insert the constraint at.
   * @param speed The speed, in knots IAS or Mach (should match the given speedDesc),
   * to set the constraint at; if undefined, delete user constraint.
   * @param speedUnit The speed units.
   * @param speedDesc The speed restriction type to set.
   * @throws Error if speed is NaN.
   */
  public setUserSpeedConstraint(
    planIndex: number,
    segmentIndex: number,
    segmentLegIndex: number,
    speed?: number,
    speedUnit?: SpeedUnit,
    speedDesc?: SpeedRestrictionType,
  ): void {
    if (speed !== undefined && isNaN(speed)) {
      throw new Error('speed must not be NaN');
    }

    if (!this.hasFlightPlan(planIndex)) { return; }

    const plan = this.getFlightPlan(planIndex);

    let verticalData: SpeedConstraint;

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (leg === null) { return; }

    if (speed !== undefined && speedUnit !== undefined && speedDesc !== undefined) {
      verticalData = {
        speed,
        speedUnit,
        speedDesc,
      };
    } else {
      verticalData = {
        speed: 0,
        speedUnit: SpeedUnit.IAS,
        speedDesc: SpeedRestrictionType.Unused,
      };
    }

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Method to revert the speed constraint back to published value.
   * @param planIndex The flight plan index to use.
   * @param segmentIndex The segment index to revert the constraint at.
   * @param segmentLegIndex The leg index to revert the constraint at.
   */
  public revertSpeedConstraint(planIndex: number, segmentIndex: number, segmentLegIndex: number): void {
    if (!this.hasFlightPlan(planIndex)) { return; }

    const plan = this.getFlightPlan(planIndex);
    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (leg === null) { return; }

    const segment = plan.getSegment(segmentIndex);
    const verticalData: SpeedConstraint = {
      speed: leg.leg.speedRestriction,
      // There is no published speedDesc in the nav data, so they are all in knots IAS
      speedUnit: SpeedUnit.IAS,
      // Nav data doesn't have a speed desc, so we pick one based on the segment
      speedDesc: FmsUtils.getPublishedSpeedDescBasedOnSegment(leg.leg.speedRestriction, segment.segmentType),
    };

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Method to set a user flight path angle.
   * @param planIndex The flight plan index to use.
   * @param segmentIndex The segment index to insert the fpa at.
   * @param segmentLegIndex The leg index to insert the fpa at.
   * @param fpa The fpa, in degrees, to set the fpa to; if undefined, deletes the fpa.
   * @throws Error if fpa is NaN.
   */
  public setUserFpa(planIndex: number, segmentIndex: number, segmentLegIndex: number, fpa?: number): void {
    if (fpa !== undefined && isNaN(fpa)) {
      throw new Error('fpa must not be NaN');
    }

    if (!this.hasFlightPlan(planIndex)) { return; }

    const plan = this.getFlightPlan(planIndex);
    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);

    if (leg === null) { return; }

    const verticalData: Partial<VerticalData> = { fpa };

    // Setting a user FPA auto converts the altitude constraint to an "At" constraint
    if (fpa !== undefined) {
      verticalData.altDesc = AltitudeRestrictionType.At;
    }

    this.setLegVerticalData(plan, segmentIndex, segmentLegIndex, verticalData);
  }

  /**
   * Sets vertical data into the plan and the direct to if necessary, then calculates the plan.
   * @param plan The flight plan to use.
   * @param segmentIndex The segment index to set the vertical data for.
   * @param segmentLegIndex The leg index to set the vertical data for.
   * @param verticalData The vertical data to set, will be merged with existing data.
   */
  private setLegVerticalData(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number, verticalData: Partial<VerticalData>): void {
    const segment = plan.tryGetSegment(segmentIndex);

    if (segment === null || segment.legs.length <= segmentLegIndex) {
      return;
    }

    // If we are editing an altitude constraint before a vertical direct-to, cancel the vertical direct-to.
    // Note that we don't need to make any corrections for lateral direct-to indexes. The VDTO leg index can only
    // point to the lateral direct-to leg, never the lateral direct-to target leg. Since the lateral direct-to leg
    // index is always greater than the target leg index, editing either leg will correctly cancel the VDTO if it
    // is targeting the direct-to leg.
    if (this.verticalPathCalculator && verticalData.altDesc !== undefined) {
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      if (verticalPlan.verticalDirectIndex !== undefined && verticalPlan.verticalDirectIndex >= segment.offset + segmentLegIndex) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    plan.setLegVerticalData(segmentIndex, segmentLegIndex, verticalData);

    const directToData = plan.directToData;

    // If we are editing a direct-to leg or the direct-to target leg, we need to also edit the other leg in the pair
    if (
      plan === this.getPrimaryFlightPlan() && this.getDirectToState() === DirectToState.TOEXISTING
      && segmentIndex === directToData.segmentIndex
    ) {
      // TODO Change nxi to not deal with adding + 3 when calling setUserConstraint and other vertical data methods
      if (segmentLegIndex === directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET) {
        plan.setLegVerticalData(segmentIndex, directToData.segmentLegIndex, verticalData);
      } else if (segmentLegIndex === directToData.segmentLegIndex) {
        plan.setLegVerticalData(segmentIndex, directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET, verticalData);
      }
    }

    plan.calculate();
  }

  /**
   * Method to check if a leg has a user specified constraint.
   * @param segmentIndex The segment index to insert the constraint at.
   * @param segmentLegIndex The leg index to insert the constraint at.
   * @deprecated Use FmsUtils.isLegAltitudeEdited in preference to this.
   * @returns Whether the leg has a user constraint.
   */
  public isConstraintUser(segmentIndex: number, segmentLegIndex: number): boolean {
    if (this.hasPrimaryFlightPlan()) {
      const plan = this.getPrimaryFlightPlan();
      const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
      if (leg?.verticalData.altDesc !== leg?.leg.altDesc || leg?.verticalData.altitude1 !== leg?.leg.altitude1 || leg?.verticalData.altitude2 !== leg?.leg.altitude2) {
        return true;
      }
    }
    return false;
  }

  /**
   * Method to check if a leg constraint can be reverted to the nav data constraint.
   * @param segmentIndex The segment index to insert the constraint at.
   * @param segmentLegIndex The leg index to insert the constraint at.
   * @returns Whether the leg has a nav data constraint to be reverted to.
   */
  public hasConstraint(segmentIndex: number, segmentLegIndex: number): number | undefined {
    if (this.hasPrimaryFlightPlan()) {
      const plan = this.getPrimaryFlightPlan();
      const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
      if (leg !== null && leg.leg.altDesc !== AltitudeRestrictionType.Unused) {
        switch (leg.leg.altDesc) {
          case AltitudeRestrictionType.At:
          case AltitudeRestrictionType.AtOrAbove:
          case AltitudeRestrictionType.AtOrBelow:
            return UnitType.METER.convertTo(leg.leg.altitude1, UnitType.FOOT);
          case AltitudeRestrictionType.Between:
            return UnitType.METER.convertTo(leg.leg.altitude2, UnitType.FOOT);
        }
      }
    }
    return undefined;
  }

  /**
   * Manages the altitude constraints for FAF legs where vertical angle info is also provided.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private manageFafAltitudeRestriction(proc: InsertProcedureObject): InsertProcedureObject {
    proc.procedureLegs.forEach(leg => {
      if (leg.fixTypeFlags === FixTypeFlags.FAF && leg.altitude2 > 0) {
        const alt = leg.altitude1 <= leg.altitude2 ? leg.altitude1 : leg.altitude2;
        leg.altDesc = AltitudeRestrictionType.AtOrAbove;
        leg.altitude1 = alt;
        leg.altitude2 = 0;
      }
    });
    return proc;
  }


  /**
   * Inserts an IF leg at the beginning of a procedure if it begins with a leg type which defines a fixed origin.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryInsertIFLeg(proc: InsertProcedureObject): InsertProcedureObject {
    const firstLeg = proc.procedureLegs[0];
    let icao: IcaoValue | undefined;
    switch (firstLeg?.type) {
      case LegType.HA:
      case LegType.HF:
      case LegType.HM:
      case LegType.PI:
      case LegType.FD:
      case LegType.FC:
        icao = firstLeg.fixIcaoStruct;
        break;
      case LegType.FM:
      case LegType.VM:
        icao = firstLeg.originIcaoStruct;
        break;
    }

    if (icao && !ICAO.isValueEmpty(icao)) {
      proc.procedureLegs.unshift(FlightPlan.createLeg({
        type: LegType.IF,
        fixIcaoStruct: icao,
        fixTypeFlags: firstLeg.fixTypeFlags & (FixTypeFlags.IF | FixTypeFlags.IAF)
      }));

      if (firstLeg?.type === LegType.HF || firstLeg?.type === LegType.PI) {
        proc.procedureLegs[0].altDesc = firstLeg.altDesc;
        proc.procedureLegs[0].altitude1 = firstLeg.altitude1;
        proc.procedureLegs[0].altitude2 = firstLeg.altitude2;
      }

      // need to remove IF/IAF flags from the original first leg (now the second leg)
      const replacementLeg = FlightPlan.createLeg(proc.procedureLegs[1]);
      replacementLeg.fixTypeFlags = replacementLeg.fixTypeFlags & ~(FixTypeFlags.IF | FixTypeFlags.IAF);
      if (firstLeg?.type !== LegType.PI) {
        replacementLeg.altDesc = AltitudeRestrictionType.Unused;
        replacementLeg.altitude1 = 0;
        replacementLeg.altitude2 = 0;
      }
      proc.procedureLegs[1] = replacementLeg;
    }

    return proc;
  }

  /**
   * Checks the approach legs for an IAF fix type flag, and if one exists, amend the approach to ensure that
   * the IAF is not on a hold/pt leg and that we do not add legs prior to the IAF except in cases where we needed to add
   * an IF leg type.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryReconcileIAFLeg(proc: InsertProcedureObject): InsertProcedureObject {
    let iafIndex = -1;
    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.fixTypeFlags === FixTypeFlags.IAF) {
        iafIndex = i;
        switch (leg.type) {
          case LegType.HA:
          case LegType.HF:
          case LegType.HM:
          case LegType.PI:
          case LegType.FD:
          case LegType.FC:
            if (iafIndex > 0) {
              leg.fixTypeFlags &= ~FixTypeFlags.IAF;
              proc.procedureLegs[iafIndex - 1].fixTypeFlags |= FixTypeFlags.IAF;
              iafIndex--;
            }
        }
        break;
      }
    }
    return proc;
  }

  /**
   * Inserts a MAP fix type flag if none exists on the approach.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryInsertMap(proc: InsertProcedureObject): InsertProcedureObject {
    let addMap = true;
    let runwayIndex = -1;

    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.fixTypeFlags === FixTypeFlags.MAP) {
        addMap = false;
        break;
      }
      if (leg.fixIcao.search('R') === 0) {
        runwayIndex = i;
        break;
      }
    }

    if (addMap && runwayIndex > -1) {
      proc.procedureLegs[runwayIndex].fixTypeFlags = FixTypeFlags.MAP;
    }

    return proc;
  }

  /**
   * Method to remove the duplicate leg after the hold leg.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryCleanupHold(proc: InsertProcedureObject): InsertProcedureObject {
    for (let i = 0; i < proc.procedureLegs.length; i++) {
      const leg = proc.procedureLegs[i];
      if (leg.type === LegType.HF) {
        const next = proc.procedureLegs[i + 1];
        if (leg.fixIcao === next.fixIcao && next.type === LegType.IF) {
          proc.procedureLegs.splice(i + 1, 1);
        }
      }
    }
    return proc;
  }

  /**
   * Method to remove a course reversal in an approach procedure.
   * @param proc A procedure object.
   * @returns the procedure object, after it has been changed.
   */
  private tryRemoveCourseReversal(proc: InsertProcedureObject): InsertProcedureObject {
    let canRemove = false;
    if (proc.procedureLegs.length > 2) {
      const leg = proc.procedureLegs[1];
      switch (leg.type) {
        case LegType.HA:
        case LegType.HF:
        case LegType.HM:
        case LegType.PI:
          canRemove = true;
      }
    }
    if (canRemove) {
      proc.procedureLegs.splice(1, 1);
    }
    return proc;
  }

  /**
   * Method to remove the departure from the flight plan.
   */
  public async removeDeparture(): Promise<void> {
    const plan = this.getFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);

    const wasActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);

    plan.setDeparture();

    this.planClearSegment(segmentIndex, FlightPlanSegmentType.Departure);
    if (plan.originAirport) {
      const updatedSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Departure);
      this.planAddOriginDestinationLeg(true, updatedSegmentIndex, ICAO.stringV1ToValue(plan.originAirport), plan.procedureDetails.originRunway);

      const prevLeg = plan.getPrevLeg(updatedSegmentIndex, 1);
      const nextLeg = plan.getNextLeg(updatedSegmentIndex, 0);
      if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
        this.planRemoveDuplicateLeg(prevLeg, nextLeg);
      }
    }

    plan.calculate(0);

    // If removing the segment caused the active leg to move from before the approach into the approach, activate the
    // approach instead.
    if (!wasActiveLegInApproach) {
      const isActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);
      if (isActiveLegInApproach) {
        if (this.isApproachVtf()) {
          this.activateVtf();
        } else {
          this.activateApproach();
        }
      }
    }
  }

  /**
   * Method to remove the arrival from the flight plan.
   */
  public async removeArrival(): Promise<void> {
    const plan = this.getFlightPlan();
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival);

    const wasActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);

    plan.setArrival();

    this.planRemoveSegment(segmentIndex);
    if (plan.procedureDetails.approachIndex < 0 && plan.destinationAirport) {
      const destSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
      this.planAddOriginDestinationLeg(false, destSegmentIndex, ICAO.stringV1ToValue(plan.destinationAirport), plan.procedureDetails.destinationRunway);
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const nextLeg = plan.getNextLeg(segmentIndex, -1);
    if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    plan.calculate(0);

    // If removing the segment caused the active leg to move from before the approach into the approach, activate the
    // approach instead.
    if (!wasActiveLegInApproach) {
      const isActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);
      if (isActiveLegInApproach) {
        if (this.isApproachVtf()) {
          this.activateVtf();
        } else {
          this.activateApproach();
        }
      }
    }
  }

  /**
   * Method to remove the approach from the flight plan.
   */
  public async removeApproach(): Promise<void> {
    const plan = this.getFlightPlan();

    ++this.updateApproachDetailsOpId;
    this.setApproachDetails(true, false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, RnavTypeFlags.None, false, false, null, null);
    plan.deleteUserData(Fms.VTF_FAF_DATA_KEY);

    const hasArrival = plan.procedureDetails.arrivalIndex >= 0;
    const segmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach);

    if (hasArrival) {
      const lastEnrouteSegmentIndex = this.findLastEnrouteSegmentIndex(plan);
      const segment = plan.getSegment(lastEnrouteSegmentIndex);
      const lastLegIndex = segment && segment.legs.length > 0 ? segment.legs.length - 1 : 0;
      if (plan.destinationAirport && segment.legs[lastLegIndex] && segment.legs[lastLegIndex].leg.fixIcao === plan.destinationAirport) {
        this.planRemoveLeg(lastEnrouteSegmentIndex, lastLegIndex);
      }
      plan.setDestinationRunway();
      if (plan.procedureDetails.arrivalFacilityIcao && plan.procedureDetails.arrivalFacilityIcao !== plan.destinationAirport) {
        const arrivalFacility = await this.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.arrivalFacilityIcao);
        this.setDestination(arrivalFacility);
      }
    }

    plan.setApproach();

    this.planRemoveSegment(segmentIndex);
    if (plan.destinationAirport) {
      const destLegSegmentIndex = hasArrival
        ? this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Arrival)
        : this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Destination);
      this.planAddOriginDestinationLeg(false, destLegSegmentIndex, ICAO.stringV1ToValue(plan.destinationAirport), plan.procedureDetails.destinationRunway);
    }

    const prevLeg = plan.getPrevLeg(segmentIndex, 0);
    const nextLeg = plan.getNextLeg(segmentIndex, -1);
    if (prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    plan.deleteUserData(FmsFplUserDataKey.VisualApproach);
    plan.deleteUserData(FmsFplUserDataKey.VisualApproachRunway);
    plan.deleteUserData(FmsFplUserDataKey.VfrApproach);
    plan.deleteUserData(FmsFplUserDataKey.ApproachSkipCourseReversal);

    // Without an approach, we can't be in a missed approach, so deactivate the missed approach.
    this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], false, true, true);

    plan.calculate(0);
  }

  /**
   * Activates a flight plan leg.
   * @param segmentIndex The index of the flight plan segment containing the leg to activate.
   * @param segmentLegIndex The index of the leg to activate in its containing segment.
   * @param planIndex The index of the flight plan containing the leg to activate. Defaults to the index of the primary
   * flight plan.
   * @param inhibitImmediateSequence Whether to inhibit immediate automatic sequencing past the activated leg. Defaults
   * to `false`.
   */
  public activateLeg(segmentIndex: number, segmentLegIndex: number, planIndex = Fms.PRIMARY_PLAN_INDEX, inhibitImmediateSequence = false): void {
    const plan = this.getFlightPlan(planIndex);
    const dtoState = this.getDirectToState();
    const activeFplIndex = dtoState === DirectToState.TORANDOM ? Fms.DTO_RANDOM_PLAN_INDEX : Fms.PRIMARY_PLAN_INDEX;
    let needConvertObsToDto = false;

    if (planIndex === activeFplIndex) {
      if (dtoState === DirectToState.TOEXISTING) {
        needConvertObsToDto = plan.directToData.segmentIndex < segmentIndex
          || (plan.directToData.segmentIndex === segmentIndex && plan.directToData.segmentLegIndex < segmentLegIndex);
      } else {
        const segment = plan.getSegment(segmentIndex);
        const globalLegIndex = segment.offset + segmentLegIndex;
        needConvertObsToDto = globalLegIndex > plan.activeLateralLeg;
      }
    }

    const oldActiveSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
    const legOffset = this.cancelObs(needConvertObsToDto);

    this._activateLeg(planIndex, segmentIndex, segmentLegIndex + (oldActiveSegmentIndex === segmentIndex ? legOffset : 0), inhibitImmediateSequence);
  }

  /**
   * Activates a flight plan leg.
   * @param planIndex The index of the flight plan containing the leg to activate.
   * @param segmentIndex The index of the flight plan segment containing the leg to activate.
   * @param segmentLegIndex The index of the leg to activate in its containing segment.
   * @param inhibitImmediateSequence Whether to inhibit immediate automatic sequencing past the activated leg.
   */
  private _activateLeg(
    planIndex: number,
    segmentIndex: number,
    segmentLegIndex: number,
    inhibitImmediateSequence: boolean
  ): void {
    const plan = this.getFlightPlan(planIndex);
    const segment = plan.getSegment(segmentIndex);
    const globalLegIndex = segment.offset + segmentLegIndex;

    const oldDtoState = this.getDirectToState();

    if (planIndex === Fms.PRIMARY_PLAN_INDEX && this.flightPlanner.activePlanIndex != Fms.PRIMARY_PLAN_INDEX) {
      this.flightPlanner.setActivePlanIndex(Fms.PRIMARY_PLAN_INDEX);
      this.flightPlanner.deleteFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
    }

    if (
      oldDtoState === DirectToState.TORANDOM
      || (oldDtoState === DirectToState.TOEXISTING && (segmentIndex !== plan.directToData.segmentIndex || segmentLegIndex !== plan.directToData.segmentLegIndex))
    ) {
      // Removing a lateral direct-to also cancels any existing vertical direct-to
      this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
    }

    // Activate or deactivate missed approach state depending on if we are activating a leg in the missed approach.
    if (segment.legs[segmentLegIndex]) {
      this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], BitFlags.isAll(segment.legs[segmentLegIndex].flags, LegDefinitionFlags.MissedApproach), true, true);
    }

    // If we are activating a leg before a direct to existing sequence, we need to remove the sequence.
    if (
      planIndex === Fms.PRIMARY_PLAN_INDEX
      && (segmentIndex < plan.directToData.segmentIndex || (segmentIndex === plan.directToData.segmentIndex && segmentLegIndex <= plan.directToData.segmentLegIndex))
    ) {
      this.removeDirectToExisting(globalLegIndex);
    } else {
      plan.setCalculatingLeg(globalLegIndex);
      plan.calculate(Math.max(0, globalLegIndex - 1));
      plan.setLateralLeg(globalLegIndex);
    }

    // If we are activating a leg before a VTF leg, we need to check to see if we need to remove the discontinuity leg
    // preceding the VTF leg.
    if (FmsUtils.isVtfApproachLoaded(plan)) {
      const approachSegment = FmsUtils.getApproachSegment(plan);
      const vtfFafLeg = FmsUtils.getApproachVtfLeg(plan);

      if (approachSegment !== undefined && vtfFafLeg !== undefined) {
        const vtfLegSegmentLegIndex = approachSegment.legs.indexOf(vtfFafLeg);
        const discoLegExists = BitFlags.isAll(approachSegment.legs[vtfLegSegmentLegIndex - 1]?.flags ?? 0, LegDefinitionFlags.VectorsToFinal);

        if (discoLegExists && plan.activeLateralLeg < approachSegment.offset + vtfLegSegmentLegIndex) {
          const prevLeg = approachSegment.legs[vtfLegSegmentLegIndex - 2];

          const publishedLegIcao = plan.getUserData<string>(Fms.VTF_FAF_DATA_KEY) ?? '';
          const legTerminatorIcao = prevLeg === undefined ? '' : FlightPlanUtils.getTerminatorIcao(prevLeg.leg) ?? '';

          if (ICAO.isFacility(publishedLegIcao) && ICAO.isFacility(legTerminatorIcao) && publishedLegIcao === legTerminatorIcao) {
            plan.removeLeg(approachSegment.segmentIndex, vtfLegSegmentLegIndex - 1);
          }
        }
      }
    }

    this.publisher.pub(this.lnavControlTopicMap['suspend_sequencing'], false, true, false);
    if (inhibitImmediateSequence) {
      this.publisher.pub(this.lnavControlTopicMap['lnav_inhibit_next_sequence'], true, true, false);
    }
  }

  /**
   * Gets the required flight path angle, in degrees, for a vertical direct-to if it were to be activated immediately.
   * Positive angles represent descending paths.
   * @param constraintGlobalLegIndex The global index of the target flight plan leg of the vertical direct-to.
   * @param altitudeMeters The target altitude, in meters, of the vertical direct-to.
   * @returns The required flight path angle, in degrees, for the specified vertical direct-to if it were to be
   * activated immediately, or `undefined` if an angle cannot be calculated. Positive angles represent descending
   * paths.
   */
  public async getVerticalDirectRequiredFpa(constraintGlobalLegIndex: number, altitudeMeters: number): Promise<number | undefined> {
    const activePlanIndex = this.flightPlanner.activePlanIndex;

    // TODO: support off-route direct to
    if (activePlanIndex !== Fms.PRIMARY_PLAN_INDEX) {
      return undefined;
    }

    if (!this.flightPlanner.hasFlightPlan(activePlanIndex) || !this.verticalPathCalculator) {
      return undefined;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(activePlanIndex);

    if (constraintGlobalLegIndex >= lateralPlan.length) {
      return undefined;
    }

    let verticalDirectLegIndex = constraintGlobalLegIndex;

    // Check if we are trying to activate VDTO on a direct-to target leg
    const segmentIndex = lateralPlan.getSegmentIndex(constraintGlobalLegIndex);
    const segmentLegIndex = lateralPlan.getSegmentLegIndex(constraintGlobalLegIndex);
    if (lateralPlan.directToData.segmentIndex === segmentIndex && lateralPlan.directToData.segmentLegIndex === segmentLegIndex) {
      verticalDirectLegIndex += FmsUtils.DTO_LEG_OFFSET;
    } else if (lateralPlan.directToData.segmentIndex === segmentIndex && lateralPlan.directToData.segmentLegIndex === segmentLegIndex - FmsUtils.DTO_LEG_OFFSET) {
      constraintGlobalLegIndex -= FmsUtils.DTO_LEG_OFFSET;
    }

    let activeLegIndex = this.lnavTrackedLegIndex.get();

    // Cannot activate VDTO to a constraint that is located before the active leg.
    if (activeLegIndex > verticalDirectLegIndex) {
      return undefined;
    }

    // We need to make sure all legs from the active leg to the VDTO target leg are calculated, so we force a calculate.
    try {
      await lateralPlan.calculate();
    } catch {
      // Abort the operation if the calculate failed.
      return undefined;
    }

    activeLegIndex = this.lnavTrackedLegIndex.get();

    // Check active plan index, plan length, and active leg index again in case they changed.
    if (activePlanIndex !== this.flightPlanner.activePlanIndex || verticalDirectLegIndex >= lateralPlan.length || activeLegIndex > verticalDirectLegIndex) {
      return undefined;
    }

    return this.getVerticalDirectFpa(
      lateralPlan,
      verticalDirectLegIndex,
      altitudeMeters,
      activeLegIndex,
      UnitType.NMILE.convertTo(this.lnavLegDistanceRemaining.get(), UnitType.METER),
      UnitType.FOOT.convertTo(this.indicatedAlt.get(), UnitType.METER)
    );
  }

  /**
   * Activates a vertical direct to a selected constraint.
   * @param constraintGlobalLegIndex The global index of the target flight plan leg of the vertical direct-to.
   * @param altitudeMeters The target altitude, in meters, of the vertical direct-to.
   * @param displayAsFlightLevel Whether the target altitude should be displayed as a flight level. Defaults to false.
   * @param fpa The flight path angle, in degrees, for the vertical direct-to. Positive values indicate descending
   * paths. The FPA will be clamped to between 0 and 6 degrees. If not defined, then the flight path angle will be set
   * to the default VNAV descent FPA.
   * @returns Whether the vertical direct was activated or not.
   */
  public activateVerticalDirect(
    constraintGlobalLegIndex: number,
    altitudeMeters: number,
    displayAsFlightLevel = false,
    fpa: number | undefined
  ): boolean {
    if (!this.verticalPathCalculator) {
      return false;
    }

    const activePlanIndex = this.flightPlanner.activePlanIndex;

    // TODO: support off-route direct to
    if (activePlanIndex !== FmsUtils.PRIMARY_PLAN_INDEX) {
      return false;
    }

    if (!this.flightPlanner.hasFlightPlan(activePlanIndex)) {
      return false;
    }

    const lateralPlan = this.flightPlanner.getFlightPlan(activePlanIndex);

    if (constraintGlobalLegIndex >= lateralPlan.length) {
      return false;
    }

    let verticalDirectLegIndex = constraintGlobalLegIndex;

    // Check if we are trying to activate VDTO on a direct-to target leg
    const segmentIndex = lateralPlan.getSegmentIndex(constraintGlobalLegIndex);
    const segmentLegIndex = lateralPlan.getSegmentLegIndex(constraintGlobalLegIndex);
    if (lateralPlan.directToData.segmentIndex === segmentIndex && lateralPlan.directToData.segmentLegIndex === segmentLegIndex) {
      verticalDirectLegIndex += FmsUtils.DTO_LEG_OFFSET;
    } else if (lateralPlan.directToData.segmentIndex === segmentIndex && lateralPlan.directToData.segmentLegIndex === segmentLegIndex - FmsUtils.DTO_LEG_OFFSET) {
      constraintGlobalLegIndex -= FmsUtils.DTO_LEG_OFFSET;
    }

    // Cannot activate VDTO to a constraint that is located before the active leg.
    if (this.lnavTrackedLegIndex.get() > verticalDirectLegIndex) {
      return false;
    }

    // Does delete the user FPA
    const verticalData: Partial<VerticalData> = {
      altDesc: AltitudeRestrictionType.Unused,
      altitude1: 0,
      altitude2: 0,
      displayAltitude1AsFlightLevel: false,
      displayAltitude2AsFlightLevel: false,
      fpa: undefined,
    };

    // Delete all constraints before the vnav direct to leg
    for (let i = 0; i < constraintGlobalLegIndex; i++) {
      lateralPlan.setLegVerticalData(i, verticalData);
    }

    // Create an "At" constraint at the vnav direct to leg, and delete the fpa
    this.setLegVerticalData(lateralPlan, segmentIndex, segmentLegIndex, {
      phase: VerticalFlightPhase.Descent,
      altDesc: AltitudeRestrictionType.At,
      altitude1: altitudeMeters,
      altitude2: 0,
      displayAltitude1AsFlightLevel: displayAsFlightLevel,
      displayAltitude2AsFlightLevel: false,
      fpa: undefined,
    });

    this.publisher.pub(this.vnavControlTopicMap!['vnav_set_vnav_direct_to'], {
      planIndex: activePlanIndex,
      globalLegIndex: verticalDirectLegIndex,
      fpa: fpa === undefined ? undefined : MathUtils.clamp(fpa, 0, 6),
    }, true, false);

    return true;
  }

  /**
   * Cancels the currently active vertical direct-to.
   */
  public cancelVerticalDirectTo(): void {
    if (!this.verticalPathCalculator) {
      return;
    }

    const activePlanIndex = this.flightPlanner.activePlanIndex;

    // TODO: support off-route direct to
    if (activePlanIndex !== Fms.PRIMARY_PLAN_INDEX) {
      return;
    }

    this.publishCancelVerticalDirectTo(activePlanIndex);
  }

  /**
   * Publishes a command to cancel the current vertical direct-to for a given flight plan.
   * @param planIndex The index of the flight plan for which to cancel the vertical direct-to.
   */
  private publishCancelVerticalDirectTo(planIndex: number): void {
    if (!this.vnavControlTopicMap) {
      return;
    }

    this.publisher.pub(this.vnavControlTopicMap['vnav_set_vnav_direct_to'], {
      planIndex,
      globalLegIndex: -1
    }, true, false);
  }

  /**
   * Computes the desired flight path angle, in degrees, for a vertical direct-to. Positive angles represent descending
   * paths. The FPA is computed such that the vertical path for the direct-to is placed 200 feet above the airplane,
   * with the TOD some distance in front of the airplane.
   *
   * If there are any uncalculated or VNAV-ineligible legs between the active leg and the vertical direct-to target leg
   * (inclusive), the FPA cannot be computed and will be `undefined`. If the airplane's indicated altitude is at or
   * below the vertical direct-to target altitude, the computed FPA will be zero.
   * @param plan The lateral flight plan for which to
   * @param directLegIndex The global index of the vertical direct-to target flight plan leg.
   * @param directAltitude The target altitude of the vertical direct-to, in meters.
   * @param activeLegIndex The global index of the active flight plan leg.
   * @param legDistanceRemaining The along-track distance from the airplane's present position to the end of the active
   * flight plan leg, in meters.
   * @param indicatedAlt The indicated altitude of the airplane, in meters.
   * @returns The desired flight path angle, in degrees, for the specified vertical direct-to, or `undefined` if the
   * FPA could not be computed. Positive angles represent descending paths.
   */
  private getVerticalDirectFpa(
    plan: FlightPlan,
    directLegIndex: number,
    directAltitude: number,
    activeLegIndex: number,
    legDistanceRemaining: number,
    indicatedAlt: number
  ): number | undefined {
    let distance = Math.max(0, legDistanceRemaining);
    for (const leg of plan.legs(false, activeLegIndex + 1, directLegIndex + 1)) {
      if (leg.calculated === undefined) {
        return undefined;
      }

      if (!GarminVNavUtils.isLegVNavEligible(leg)) {
        return undefined;
      }

      distance += leg.calculated.distanceWithTransitions;
    }

    const altitudeDelta = indicatedAlt - directAltitude;
    if (altitudeDelta < 30) {
      return 0;
    }

    return VNavUtils.getFpa(distance, indicatedAlt - directAltitude + 60);
  }

  /**
   * Checks whether an approach can be activated. An approach can be activated if and only if the primary flight plan
   * has a non-vectors-to-final approach loaded.
   * @returns Whether an approach can be activated.
   */
  public canActivateApproach(): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();
    if (!plan) {
      return false;
    }

    return FmsUtils.isApproachLoaded(plan) && !FmsUtils.isVtfApproachLoaded(plan);
  }

  /**
   * Activates an approach. Activating an approach activates a Direct To to the first approach waypoint of the primary
   * flight plan, and attempts to load the primary approach frequency (if one exists) to the nav radios. If the primary
   * flight plan does not have an approach loaded, this method has no effect.
   */
  public activateApproach(): void {
    if (!this.canActivateApproach()) {
      return;
    }

    const approachSegmentIndex = this.ensureOnlyOneSegmentOfType(FlightPlanSegmentType.Approach, false);
    this.createDirectToExisting(approachSegmentIndex, 0);
    for (const index of this.navRadioIndexes) {
      this.setLocFrequency(index);
    }
    this.publisher.pub(this.fmsTopicMap['fms_approach_activate'], undefined, true, false);
  }

  /**
   * Checks whether vectors-to-final can be activated. VTF can be activated if and only if the primary flight plan has
   * an approach loaded.
   * @returns Whether vectors-to-final can be activated.
   */
  public canActivateVtf(): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();
    if (!plan) {
      return false;
    }

    return FmsUtils.isApproachLoaded(plan);
  }

  /**
   * Activates vectors-to-final. Activating vectors-to-final activates the primary flight plan's vectors-to-final leg,
   * and attempts to load the primary approach frequency (if one exists) to the nav radios. If the primary flight plan
   * has a non-VTF approach loaded, it will be replaced by its VTF counterpart. If the primary flight plan has no
   * approach loaded, this method has no effect.
   */
  public async activateVtf(): Promise<void> {
    if (!this.canActivateVtf()) {
      return;
    }

    this.cancelObs(false);

    const plan = this.getPrimaryFlightPlan();

    let approachType: GarminApproachType = ApproachType.APPROACH_TYPE_UNKNOWN;

    if (!FmsUtils.isVtfApproachLoaded(plan)) {
      // if a VTF approach is not loaded; replace the current approach with its VTF counterpart.

      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const airport = await this.facLoader.getFacility(FacilityType.Airport, plan.procedureDetails.approachFacilityIcao!);

        if (plan.procedureDetails.approachIndex >= 0) {
          await this.insertApproach(airport, plan.procedureDetails.approachIndex, -1);
          approachType = airport.approaches[plan.procedureDetails.approachIndex].approachType;
        } else {
          const visApproachData = plan.getUserData<Readonly<FmsFplVisualApproachData>>(FmsFplUserDataKey.VisualApproach);
          const vfrApproachData = plan.getUserData<Readonly<FmsFplVfrApproachData>>(FmsFplUserDataKey.VfrApproach);

          if (visApproachData) {
            const runway = RunwayUtils.matchOneWayRunwayFromDesignation(airport, visApproachData.runwayDesignation);

            if (!runway) {
              return;
            }

            approachType = AdditionalApproachType.APPROACH_TYPE_VISUAL;
            await this.insertApproach(airport, -1, -1, runway.direction, runway.runwayDesignator);
          } else if (vfrApproachData) {
            await this.insertVfrApproach(airport, vfrApproachData.approachIndex, true);
          }
        }
      } catch (e) {
        console.warn(`Fms: failed to activate VTF approach... ${e}`);
        if (e instanceof Error) {
          console.error(e.stack);
        }
        return;
      }
    } else {
      approachType = this.approachDetails.get().type;
    }

    const approachSegment = FmsUtils.getApproachSegment(plan);

    if (approachSegment === undefined) {
      // This should never happen.
      return;
    }

    // If a VTF leg was not inserted, activate the normal faf leg.
    const legToActivate = FmsUtils.getApproachVtfLeg(plan) ?? FmsUtils.getApproachFafLeg(plan);

    if (legToActivate === undefined) {
      console.warn('Fms: failed to activate VTF approach');
      return;
    }

    let legToActivateSegmentLegIndex = approachSegment.legs.indexOf(legToActivate);

    // If we are activating a VTF leg, check to see if it is preceded by a discontinuity leg. If it is not, then
    // we need to add one.
    if (
      BitFlags.isAll(legToActivate.flags, LegDefinitionFlags.VectorsToFinalFaf)
      && !BitFlags.isAll(approachSegment.legs[legToActivateSegmentLegIndex - 1]?.flags, LegDefinitionFlags.VectorsToFinal)
    ) {
      plan.addLeg(approachSegment.segmentIndex, FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }), legToActivateSegmentLegIndex, LegDefinitionFlags.VectorsToFinal);
      legToActivateSegmentLegIndex++;
    }

    this._activateLeg(Fms.PRIMARY_PLAN_INDEX, approachSegment.segmentIndex, legToActivateSegmentLegIndex, true);

    let firstNavRadioIndex: number | undefined = undefined;
    for (const index of this.navRadioIndexes) {
      firstNavRadioIndex ??= index;
      this.setLocFrequency(index);
    }

    this.publisher.pub(this.fmsTopicMap['fms_approach_activate'], undefined, true, false);

    if (firstNavRadioIndex !== undefined) {
      switch (approachType) {
        case ApproachType.APPROACH_TYPE_ILS:
        case ApproachType.APPROACH_TYPE_LDA:
        case ApproachType.APPROACH_TYPE_LOCALIZER:
        case ApproachType.APPROACH_TYPE_LOCALIZER_BACK_COURSE:
        case ApproachType.APPROACH_TYPE_SDF:
        case ApproachType.APPROACH_TYPE_VOR:
        case ApproachType.APPROACH_TYPE_VORDME:
          this.publisher.pub(this.cdiControlTopicMap['cdi_src_set'], { type: NavSourceType.Nav, index: firstNavRadioIndex }, true, false);
          break;
      }
    }
  }

  /**
   * Method to check if the approach is VTF.
   * @returns whether the approach is VTF.
   */
  public isApproachVtf(): boolean {
    if (!this.hasPrimaryFlightPlan()) {
      return false;
    }
    const plan = this.getPrimaryFlightPlan();
    return FmsUtils.isVtfApproachLoaded(plan);
  }

  /**
   * Checks if the missed approach can be activated.
   * @returns whether the missed approach can be activated.
   */
  public canMissedApproachActivate(): boolean {
    if (this.activateMaprState.get()) {
      return false;
    }

    if (this.getDirectToState() === DirectToState.TORANDOM) {
      return false;
    }

    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();

    if (!plan) {
      return false;
    }

    if (this.cdiSource.type === NavSourceType.Gps && plan.activeLateralLeg < plan.length - 1 && plan.segmentCount > 0) {
      const segmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
      if (segmentIndex > 0) {
        const segment = plan.getSegment(segmentIndex);
        if (
          segment.segmentType === FlightPlanSegmentType.Approach
          && BitFlags.isAll(segment.legs[segment.legs.length - 1].flags, LegDefinitionFlags.MissedApproach)
        ) {
          for (let i = 0; i < segment.legs.length; i++) {
            const leg = segment.legs[i];
            if (leg.leg.fixTypeFlags === FixTypeFlags.FAF) {
              if (plan.activeLateralLeg - segment.offset >= i) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Activates the missed approach.
   */
  public activateMissedApproach(): void {
    if (this.canMissedApproachActivate()) {
      this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], true, true, true);
    }
  }

  /**
   * Creates and activates a Direct-To targeting a waypoint not in the primary flight plan (off-route Direct-To).
   * @param target The Direct-To's target waypoint facility or its ICAO.
   * @param course The magnetic course for the Direct-To, in degrees. If not defined, then the Direct-To will be
   * initiated from the airplane's present position.
   */
  public createDirectToRandom(target: Facility | string, course?: number): void {
    this.cancelObs(false);

    // Creating a lateral direct-to also cancels any existing vertical direct-to
    this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);

    // We can't be in an missed approach while on an off-route direct-to, so deactivate the missed approach.
    this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], false, true, true);

    const icao: IcaoValue = typeof target === 'string' ? ICAO.stringV1ToValue(target) : target.icaoStruct;
    const plan = this.flightPlanner.createFlightPlan(1);

    plan.setCalculatingLeg(0);
    plan.setLateralLeg(0);

    // Delete all segments for the random dto plan
    for (let i = plan.segmentCount - 1; i >= 0; i--) {
      if (plan.getSegment(i) !== undefined) {
        plan.removeSegment(i);
      }
    }

    plan.insertSegment(0, FlightPlanSegmentType.RandomDirectTo, undefined, true);
    const segment = plan.getSegment(0);

    if (segment) {
      const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
      // Dupe the disco leg if we have a defined course so that DTO sequences are always 3 legs long
      const dtoOriginLeg = course === undefined ? this.createDTOOriginLeg(this.ppos) : discoLeg;
      const dtoTargetLeg = this.createDTODirectLeg(icao, undefined, course);

      plan.addLeg(0, discoLeg, 0, LegDefinitionFlags.DirectTo);
      plan.addLeg(0, dtoOriginLeg, 1, LegDefinitionFlags.DirectTo);
      plan.addLeg(0, dtoTargetLeg, 2, LegDefinitionFlags.DirectTo);
      plan.calculate(0);

      plan.setCalculatingLeg(2);
      plan.setLateralLeg(2);

      if (this.flightPlanner.activePlanIndex !== 1) {
        this.flightPlanner.setActivePlanIndex(1);
      }

      this.publisher.pub(this.lnavControlTopicMap['suspend_sequencing'], false, true, false);
    }
  }

  /**
   * Creates and activates a Direct-To to an existing waypoint in the primary flight plan (on-route Direct-To).
   * @param segmentIndex The index of the segment containing the Direct-To's target flight plan leg.
   * @param segmentLegIndex The index of the Direct-To's target flight plan leg in its containing segment.
   * @param course The magnetic course for the Direct-To, in degrees. If not defined, then the Direct-To will be
   * initiated from the airplane's present position.
   * @param deletePriorConstraints Whether to delete all altitude constraints before the Direct-To target leg.
   * User-defined flight path angles will be preserved.
   */
  public createDirectToExisting(segmentIndex: number, segmentLegIndex: number, course?: number, deletePriorConstraints = false): void {
    this.cancelObs(false);

    const plan = this.getPrimaryFlightPlan();
    const segment = plan.getSegment(segmentIndex);
    const leg = segment.legs[segmentLegIndex];

    let legIndexDelta = 0;

    if (plan.directToData.segmentIndex > -1 && plan.directToData.segmentLegIndex > -1) {
      legIndexDelta -= plan.directToData.segmentIndex === segmentIndex && segmentLegIndex > plan.directToData.segmentLegIndex ? 3 : 0;

      if (this.getDirectToState() === DirectToState.TOEXISTING) {
        this.removeDirectToExisting();
      } else {
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
      }
    }

    // Creating a lateral direct-to also cancels any existing vertical direct-to
    this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);

    plan.setDirectToData(segmentIndex, segmentLegIndex + legIndexDelta);

    if (segment && leg) {
      const discoLeg = FlightPlan.createLeg({ type: LegType.Discontinuity });
      // Dup the disco leg if we have a defined course so that DTO sequences are always 3 legs long
      const dtoOriginLeg = course === undefined ? this.createDTOOriginLeg(this.ppos) : discoLeg;
      const dtoTargetLeg = this.createDTODirectLeg(leg.leg.fixIcaoStruct, leg.leg, course);

      const dtoLegFlags = (leg.flags & LegDefinitionFlags.MissedApproach) | LegDefinitionFlags.DirectTo;

      plan.addLeg(segmentIndex, discoLeg, segmentLegIndex + legIndexDelta + 1, dtoLegFlags);
      plan.addLeg(segmentIndex, dtoOriginLeg, segmentLegIndex + legIndexDelta + 2, dtoLegFlags);
      plan.addLeg(segmentIndex, dtoTargetLeg, segmentLegIndex + legIndexDelta + FmsUtils.DTO_LEG_OFFSET, dtoLegFlags);

      plan.setLegVerticalData(segmentIndex, segmentLegIndex + legIndexDelta + FmsUtils.DTO_LEG_OFFSET, leg.verticalData);

      this._activateLeg(Fms.PRIMARY_PLAN_INDEX, segmentIndex, segmentLegIndex + legIndexDelta + FmsUtils.DTO_LEG_OFFSET, false);

      if (deletePriorConstraints) {
        // Does not delete the user FPA
        const verticalData: Partial<VerticalData> = {
          altDesc: AltitudeRestrictionType.Unused,
          altitude1: 0,
          altitude2: 0,
          displayAltitude1AsFlightLevel: false,
          displayAltitude2AsFlightLevel: false,
        };

        const globalLegIndex = segment.offset + segmentLegIndex + legIndexDelta;

        // Delete all constraints before the new direct to leg
        for (let i = 0; i < globalLegIndex; i++) {
          plan.setLegVerticalData(i, verticalData);
        }
      }

      // If advanced VNAV is not supported, activating a lateral direct-to will also activate a vertical direct-to with
      // minimum FPA of 3 degrees.
      if (!this.isAdvancedVnav) {
        this.handleDirectToVerticalDirect(segmentIndex, segmentLegIndex + legIndexDelta);
      }
    }
  }

  /**
   * Creates a Direct-To origin IF leg.
   * @param ppos The current plane position.
   * @returns a Direct-To origin IF leg.
   */
  private createDTOOriginLeg(ppos: GeoPointInterface): FlightPlanLeg {
    return FlightPlan.createLeg({
      type: LegType.IF,
      lat: ppos.lat,
      lon: ppos.lon
    });
  }

  /**
   * Creates a Direct-To target leg.
   * @param icao is the icao.
   * @param leg The FlightPlanLeg.
   * @param course The magnetic course for the Direct To.
   * @returns a Direct-To leg.
   */
  private createDTODirectLeg(icao: IcaoValue, leg?: FlightPlanLeg, course?: number): FlightPlanLeg {
    let legType: LegType;
    if (course === undefined) {
      legType = LegType.DF;
      const planeHeading = SimVar.GetSimVarValue('PLANE HEADING DEGREES MAGNETIC', 'degrees');
      course = planeHeading === 0 ? 360 : planeHeading;
    } else {
      legType = LegType.CF;
    }

    const dtoLeg = FlightPlan.createLeg(leg ?? {});
    dtoLeg.type = legType;
    FlightPlanUtils.setLegIcao(dtoLeg, 'fixIcaoStruct', icao);
    dtoLeg.course = course as number;
    dtoLeg.trueDegrees = false;
    dtoLeg.turnDirection = LegTurnDirection.None;

    return dtoLeg;
  }

  /**
   * Handles the automatic activation of a vertical direct-to after a lateral direct-to has been activated. This will
   * activate a vertical direct-to targeting the first constraint at or after the target leg of the lateral direct-to,
   * with a minimum flight path angle of 3 degrees. If the first constraint at or after the target leg of the lateral
   * direct-to is not a descent constraint, the vertical direct-to will not be activated.
   * @param segmentIndex The index of the segment containing the target flight plan leg of the new lateral direct-to.
   * @param segmentLegIndex The index of the target flight plan leg of the new lateral direct-to in its segment.
   */
  private async handleDirectToVerticalDirect(segmentIndex: number, segmentLegIndex: number): Promise<void> {
    if (!this.verticalPathCalculator) {
      return;
    }

    const lateralPlan = this.getPrimaryFlightPlan();
    const segment = lateralPlan.getSegment(segmentIndex);
    const dtoLegSegmentLegIndex = segmentLegIndex + FmsUtils.DTO_LEG_OFFSET;

    const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);

    try {
      // Wait until the vertical plan has been rebuilt with the direct-to legs included. Abort after 5 seconds.
      await Wait.awaitSubEvent(this.verticalPathCalculator.vnavCalculated, planIndex => {
        if (planIndex !== Fms.PRIMARY_PLAN_INDEX) {
          return false;
        }

        const verticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, segment.offset + dtoLegSegmentLegIndex);
        return verticalLeg.segmentIndex === segmentIndex && verticalLeg.legIndex === dtoLegSegmentLegIndex;
      }, 5000);

      // Wait until LNAV is tracking the newly created direct-to leg. Abort after 2 seconds.
      await Wait.awaitSubscribable(this.lnavTrackedLegIndex, index => {
        return index === segment.offset + dtoLegSegmentLegIndex;
      }, true, 2000);

      // If the lateral direct-to has changed or has been removed, abort.
      if (lateralPlan.directToData.segmentIndex !== segmentIndex || lateralPlan.directToData.segmentLegIndex !== segmentLegIndex) {
        return;
      }

      const constraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, segment.offset + dtoLegSegmentLegIndex);
      if (constraint && constraint.type !== 'climb' && constraint.type !== 'missed') {
        const lateralLeg = lateralPlan.tryGetLeg(constraint.index);
        if (lateralLeg) {
          let fpa = await this.getVerticalDirectRequiredFpa(constraint.index, lateralLeg.verticalData.altitude1);

          if (lateralPlan.tryGetLeg(constraint.index) === lateralLeg) {
            if (fpa !== undefined) {
              fpa = MathUtils.clamp(fpa, 3, 6);
            }
            this.activateVerticalDirect(constraint.index, lateralLeg.verticalData.altitude1, lateralLeg.verticalData.displayAltitude1AsFlightLevel, fpa);
          }
        }
      }
    } catch {
      // noop
    }
  }

  /**
   * Cancels the currently active on-route or off-route direct-to.
   * @returns Whether an active direct-to was cancelled.
   */
  public cancelDirectTo(): boolean {
    const directToState = this.getDirectToState();

    if (directToState === DirectToState.TOEXISTING) {
      this.cancelObs(true);

      const plan = this.getPrimaryFlightPlan();
      this._activateLeg(Fms.PRIMARY_PLAN_INDEX, plan.directToData.segmentIndex, plan.directToData.segmentLegIndex, false);
      return true;
    } else if (directToState === DirectToState.TORANDOM) {
      this.cancelObs(false);

      if (this.activateNearestLeg()) {
        return true;
      }

      // We failed to activate the nearest leg...
      if (this.hasPrimaryFlightPlan()) {
        const plan = this.getPrimaryFlightPlan();

        if (plan.length > 0) {
          // If the plan is not empty, activate the first leg.
          const segmentIndex = plan.getSegmentIndex(0);
          this._activateLeg(Fms.PRIMARY_PLAN_INDEX, segmentIndex, 0, false);
        } else {
          // If the primary plan is empty, then just reset the active flight plan to the primary plan.
          this.flightPlanner.setActivePlanIndex(Fms.PRIMARY_PLAN_INDEX);
          this.flightPlanner.deleteFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Empties the primary flight plan.
   */
  public async emptyPrimaryFlightPlan(): Promise<void> {
    if (!this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
      return;
    }

    // Cancel any existing vertical direct-to.
    this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);

    // Deactivate the missed approach.
    this.publisher.pub(this.lnavControlTopicMap['activate_missed_approach'], false, true, true);

    const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);

    for (let i = plan.segmentCount - 1; i >= 0; i--) {
      plan.removeSegment(i);
    }
    plan.addSegment(0, FlightPlanSegmentType.Departure);
    plan.addSegment(1, FlightPlanSegmentType.Enroute);
    plan.addSegment(2, FlightPlanSegmentType.Destination);

    plan.removeOriginAirport();
    plan.removeDestinationAirport();
    plan.setDirectToData(-1);

    plan.setDeparture();
    plan.setArrival();
    plan.setApproach();

    plan.deleteUserData(FmsFplUserDataKey.VisualApproach);
    plan.deleteUserData(FmsFplUserDataKey.VisualApproachRunway);
    plan.deleteUserData(FmsFplUserDataKey.VfrApproach);
    plan.deleteUserData(FmsFplUserDataKey.ApproachSkipCourseReversal);

    ++this.updateApproachDetailsOpId;
    this.setApproachDetails(true, false, ApproachType.APPROACH_TYPE_UNKNOWN, RnavTypeFlags.None, RnavTypeFlags.None, false, false, null, null);
    plan.deleteUserData(Fms.VTF_FAF_DATA_KEY);

    plan.setCalculatingLeg(0);
    plan.setLateralLeg(0);
    plan.setVerticalLeg(0);
  }

  /**
   * Empties the primary flight plan and deletes its name.
   */
  public async deletePrimaryFlightPlan(): Promise<void> {
    if (!this.flightPlanner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX)) {
      return;
    }
    const plan = this.flightPlanner.getFlightPlan(Fms.PRIMARY_PLAN_INDEX);

    plan.deleteUserData(FmsFplUserDataKey.Name);

    await this.emptyPrimaryFlightPlan();
  }

  /**
   * Resets all flight plans to their initial empty states, and cancels any active off-route Direct-To.
   */
  public async resetAllFlightPlans(): Promise<void> {
    await this.deletePrimaryFlightPlan();
    this.flightPlanner.setActivePlanIndex(Fms.PRIMARY_PLAN_INDEX);
    this.flightPlanner.deleteFlightPlan(Fms.DTO_RANDOM_PLAN_INDEX);
  }

  /**
   * Builds a flight plan to preview a procedure.
   * @param calculator The flight path calculator to assign to the preview plan.
   * @param facility The airport facility to load the approach from
   * @param procType The type of procedure to preview.
   * @param procIndex The procedure index selected.
   * @param transIndex The transition index selected.
   * @param oneWayRunway The one way runway to build the preview with, if any.
   * @param rwyTransIndex The runway transition index selected, if any.
   * @param visualRunwayNumber is the visual runway number, if any.
   * @param visualRunwayDesignator is the visual runway designator, if any.
   * @returns A Promise which is fulfilled with whether the preview plan was successfully built.
   */
  public async buildProcedurePreviewPlan(
    calculator: FlightPathCalculator,
    facility: AirportFacility,
    procType: ProcedureType,
    procIndex: number,
    transIndex: number,
    oneWayRunway?: OneWayRunway,
    rwyTransIndex?: number,
    visualRunwayNumber?: number,
    visualRunwayDesignator?: RunwayDesignator,
  ): Promise<FlightPlan> {
    const plan = new FlightPlan(0, calculator, FlightPlanner.buildDefaultLegName);

    let procedureLegObject: InsertProcedureObject | undefined;
    switch (procType) {
      case ProcedureType.APPROACH:
        procedureLegObject = await this.buildApproachLegs(facility, procIndex, transIndex, undefined);
        plan.addSegment(0, FlightPlanSegmentType.Approach, undefined, false);
        break;
      case ProcedureType.ARRIVAL: {
        const runwayIndex = rwyTransIndex ?? -1;
        procedureLegObject = this.buildArrivalLegs(facility, procIndex, transIndex, runwayIndex, oneWayRunway);
        plan.addSegment(0, FlightPlanSegmentType.Arrival, undefined, false);
        break;
      }
      case ProcedureType.DEPARTURE: {
        const runwayIndex = rwyTransIndex ?? -1;
        procedureLegObject = this.buildDepartureLegs(facility, procIndex, transIndex, runwayIndex, oneWayRunway);
        plan.addSegment(0, FlightPlanSegmentType.Departure, undefined, false);
        break;
      }
      case ProcedureType.VISUALAPPROACH:
        if (visualRunwayNumber !== undefined && visualRunwayDesignator !== undefined) {
          const visualRunway = RunwayUtils.matchOneWayRunway(facility, visualRunwayNumber, visualRunwayDesignator);
          procedureLegObject = await this.buildApproachLegs(facility, -1, transIndex, visualRunway);
          plan.addSegment(0, FlightPlanSegmentType.Approach, undefined, false);
        }
        break;
    }

    if (procedureLegObject && procedureLegObject.procedureLegs.length > 0) {
      const visualRunway = visualRunwayNumber !== undefined && visualRunwayDesignator !== undefined
        ? RunwayUtils.matchOneWayRunway(facility, visualRunwayNumber, visualRunwayDesignator)
        : undefined;

      procedureLegObject.procedureLegs.forEach((l) => {
        // If the leg's fix is a visual approach fix, we need to add it to the facility repository so that others can
        // look it up properly.
        if (visualRunway !== undefined && ICAO.isValueFacility(l.fixIcaoStruct, FacilityType.VIS)) {
          this.addVisualFacilityFromLeg(l, visualRunway.designation);
        }

        plan.addLeg(0, l, undefined, l.legDefinitionFlags ?? LegDefinitionFlags.None, false);
      });

      if (procType === ProcedureType.APPROACH) {
        // Adds missed approach legs
        if (visualRunwayNumber === undefined && visualRunwayDesignator === undefined && procedureLegObject.procedureLegs.length > 0) {
          const missedLegs = facility.approaches[procIndex].missedLegs;
          if (missedLegs && missedLegs.length > 0) {
            let maphIndex = -1;
            for (let m = missedLegs.length - 1; m >= 0; m--) {
              switch (missedLegs[m].type) {
                case LegType.HA:
                case LegType.HF:
                case LegType.HM:
                  maphIndex = m - 1;
                  break;
              }
            }
            for (let n = 0; n < missedLegs.length; n++) {
              const newLeg = FlightPlan.createLeg(missedLegs[n]);
              if (maphIndex > 0 && n === maphIndex) {
                newLeg.fixTypeFlags |= FixTypeFlags.MAHP;
                plan.addLeg(0, newLeg, undefined, LegDefinitionFlags.MissedApproach, false);
              } else {
                plan.addLeg(0, newLeg, undefined, LegDefinitionFlags.MissedApproach, false);
              }
            }
          }
        }
      }

      await plan.calculate(0);

      return plan;
    } else {
      return plan;
    }
  }

  /**
   * Builds a flight plan to preview procedure transitions.
   * @param calculator The flight path calculator to assign to the preview plan.
   * @param facility The airport facility to which the procedure to preview belongs.
   * @param procType The type of procedure to preview.
   * @param procIndex The index of the procedure to preview.
   * @param excludeTransitionIndex The index of the transition to exclude in the preview.
   * @param rwyTransIndex The index of the procedure's runway transition.
   * @returns The index of the procedure transition preview plan.
   */
  public async buildProcedureTransitionPreviewPlan(
    calculator: FlightPathCalculator,
    facility: AirportFacility,
    procType: ProcedureType,
    procIndex: number,
    excludeTransitionIndex: number,
    rwyTransIndex?: number
  ): Promise<FlightPlan> {
    const plan = new FlightPlan(0, calculator, FlightPlanner.buildDefaultLegName);

    let legs: FlightPlanLeg[] | undefined;
    switch (procType) {
      case ProcedureType.DEPARTURE:
        if (facility.departures[procIndex] && rwyTransIndex !== undefined) {
          legs = this.buildDepartureTransitionPreviewLegs(facility.departures[procIndex], excludeTransitionIndex, rwyTransIndex);
        }
        break;
      case ProcedureType.ARRIVAL:
        if (facility.arrivals[procIndex] && rwyTransIndex !== undefined) {
          legs = this.buildArrivalTransitionPreviewLegs(facility.arrivals[procIndex], excludeTransitionIndex, rwyTransIndex);
        }
        break;
      case ProcedureType.APPROACH:
        if (facility.approaches[procIndex]) {
          legs = this.buildApproachTransitionPreviewLegs(facility.approaches[procIndex], excludeTransitionIndex);
        }
        break;
    }

    if (legs && legs.length > 0) {
      plan.addSegment(0, FlightPlanSegmentType.Enroute, undefined, false);
      legs.forEach((l) => {
        plan.addLeg(0, l, undefined, 0, false);
      });
      await plan.calculate(0);
    }

    return plan;
  }

  /**
   * Builds a sequence of legs for a departure transition preview. The sequence consists of the legs of each departure
   * transition in order. Discontinuity legs separate legs of different transitions.
   * @param departure A departure.
   * @param excludeTransitionIndex The index of the transition to exclude in the preview.
   * @param rwyTransIndex The runway transition index of the departure.
   * @returns A sequence of legs for a departure transition preview.
   */
  private buildDepartureTransitionPreviewLegs(departure: DepartureProcedure, excludeTransitionIndex: number, rwyTransIndex: number): FlightPlanLeg[] {
    const runwayTransition = departure.runwayTransitions[rwyTransIndex];

    if (!runwayTransition && departure.runwayTransitions.length > 0) {
      return [];
    }

    const insertProcObject: InsertProcedureObject = { procedureLegs: [] };
    const legs: FlightPlanLeg[] = [];
    const preTransitionLegs: FlightPlanLeg[] = [];

    const lastCommonLeg = departure.commonLegs[departure.commonLegs.length - 1];

    const lastPreTransitionLeg = lastCommonLeg ?? runwayTransition.legs[runwayTransition.legs.length - 1];
    const secondLastPreTransitionLeg = lastPreTransitionLeg
      ? lastCommonLeg
        ? departure.commonLegs[departure.commonLegs.length - 2] ?? runwayTransition.legs[runwayTransition.legs.length - 1]
        : runwayTransition.legs[runwayTransition.legs.length - 2]
      : undefined;

    secondLastPreTransitionLeg && preTransitionLegs.push(secondLastPreTransitionLeg);
    lastPreTransitionLeg && preTransitionLegs.push(lastPreTransitionLeg);

    const transitions = departure.enRouteTransitions;
    for (let i = 0; i < transitions.length; i++) {
      if (i === excludeTransitionIndex) {
        continue;
      }

      const transition = transitions[i];

      if (transition.legs.length > 0) {
        insertProcObject.procedureLegs.push(...preTransitionLegs);
        for (let j = 0; j < transition.legs.length; j++) {
          const leg = transition.legs[j];

          if (j === 0 && lastPreTransitionLeg && this.isDuplicateIFLeg(lastPreTransitionLeg, leg)) {
            continue;
          }

          insertProcObject.procedureLegs.push(leg);
        }

        this.tryCleanupHold(insertProcObject);

        legs.push(...insertProcObject.procedureLegs, FlightPlan.createLeg({ type: LegType.Discontinuity }));

        insertProcObject.procedureLegs.length = 0;
      }
    }

    return legs;
  }

  /**
   * Builds a sequence of legs for an arrival transition preview. The sequence consists of the legs of each arrival
   * transition in order. Discontinuity legs separate legs of different transitions.
   * @param arrival An arrival.
   * @param excludeTransitionIndex The index of the transition to exclude in the preview.
   * @param rwyTransIndex The runway transition index of the arrival.
   * @returns A sequence of legs for an arrival transition preview.
   */
  private buildArrivalTransitionPreviewLegs(arrival: ArrivalProcedure, excludeTransitionIndex: number, rwyTransIndex: number): FlightPlanLeg[] {
    const runwayTransition = arrival.runwayTransitions[rwyTransIndex];

    if (!runwayTransition && arrival.runwayTransitions.length > 0) {
      return [];
    }

    const insertProcObject: InsertProcedureObject = { procedureLegs: [] };
    const legs: FlightPlanLeg[] = [];

    const firstCommonLeg = arrival.commonLegs[0];

    const firstPostTransitionLeg = firstCommonLeg ?? runwayTransition.legs[0];
    const secondPostTransitionLeg = firstPostTransitionLeg
      ? firstCommonLeg
        ? arrival.commonLegs[1] ?? runwayTransition.legs[0]
        : runwayTransition.legs[1]
      : undefined;

    const transitions = arrival.enRouteTransitions;
    for (let i = 0; i < transitions.length; i++) {
      if (i === excludeTransitionIndex) {
        continue;
      }

      const transition = transitions[i];

      if (transition.legs.length > 0) {
        for (let j = 0; j < transition.legs.length; j++) {
          insertProcObject.procedureLegs.push(transition.legs[j]);
        }

        const lastTransitionLeg = insertProcObject.procedureLegs[insertProcObject.procedureLegs.length - 1];

        if (firstPostTransitionLeg && !this.isDuplicateIFLeg(lastTransitionLeg, firstPostTransitionLeg)) {
          insertProcObject.procedureLegs.push(firstPostTransitionLeg);

          // need to add the second post-transition leg if the last transition leg is a PI leg and first post-
          // transition leg is an IF so that the calculator can get an inbound course for the PI leg.
          if (lastTransitionLeg.type === LegType.PI && firstPostTransitionLeg.type === LegType.IF && secondPostTransitionLeg) {
            insertProcObject.procedureLegs.push(secondPostTransitionLeg);
          }
        }

        this.tryInsertIFLeg(insertProcObject);
        this.tryCleanupHold(insertProcObject);

        legs.push(...insertProcObject.procedureLegs, FlightPlan.createLeg({ type: LegType.Discontinuity }));

        insertProcObject.procedureLegs.length = 0;
      }
    }

    return legs;
  }

  /**
   * Builds a sequence of legs for an approach transition preview. The sequence consists of the legs of each approach
   * transition in order, followed by the first leg of the final approach. Discontinuity legs separate legs of
   * different transitions.
   * @param approach An approach.
   * @param excludeTransitionIndex The index of the transition to exclude in the preview.
   * @returns A sequence of legs for an approach transition preview.
   */
  private buildApproachTransitionPreviewLegs(approach: ApproachProcedure, excludeTransitionIndex: number): FlightPlanLeg[] {
    const insertProcObject: InsertProcedureObject = { procedureLegs: [] };
    const legs: FlightPlanLeg[] = [];

    const firstFinalLeg = approach.finalLegs[0];
    const secondFinalLeg = approach.finalLegs[1];

    const transitions = approach.transitions;
    for (let i = 0; i < transitions.length; i++) {
      if (i === excludeTransitionIndex) {
        continue;
      }

      const transition = transitions[i];

      if (transition.legs.length > 0) {
        for (let j = 0; j < transition.legs.length; j++) {
          insertProcObject.procedureLegs.push(transition.legs[j]);
        }

        const lastTransitionLeg = insertProcObject.procedureLegs[insertProcObject.procedureLegs.length - 1];

        if (firstFinalLeg && !this.isDuplicateIFLeg(lastTransitionLeg, firstFinalLeg)) {
          insertProcObject.procedureLegs.push(firstFinalLeg);

          // need to add the second final approach leg if the last transition leg is a PI leg and first final leg is
          // an IF so that the calculator can get an inbound course for the PI leg.
          if (lastTransitionLeg.type === LegType.PI && firstFinalLeg.type === LegType.IF && secondFinalLeg) {
            insertProcObject.procedureLegs.push(secondFinalLeg);
          }
        }

        this.tryInsertIFLeg(insertProcObject);
        this.tryCleanupHold(insertProcObject);

        legs.push(...insertProcObject.procedureLegs, FlightPlan.createLeg({ type: LegType.Discontinuity }));

        insertProcObject.procedureLegs.length = 0;
      }
    }

    return legs;
  }

  /**
   * Builds a flight plan to preview a VFR approach procedure.
   * @param calculator The flight path calculator to assign to the preview plan.
   * @param facility The airport facility containing the published approach on which the VFR approach to preview is
   * based.
   * @param approachIndex The index of the published approach on which the VFR approach to preview is based.
   * @param isVtf Whether to preview the approach as a vectors-to-final (VTF) approach.
   * @returns A Promise which will be fulfilled with the preview plan after it has been built.
   */
  public async buildVfrApproachPreviewPlan(
    calculator: FlightPathCalculator,
    facility: AirportFacility,
    approachIndex: number,
    isVtf: boolean
  ): Promise<FlightPlan> {
    const plan = new FlightPlan(0, calculator, FlightPlanner.buildDefaultLegName);

    const procedureLegObject = await this.buildVfrApproachLegs(facility, approachIndex, isVtf);
    plan.addSegment(0, FlightPlanSegmentType.Approach, undefined, false);

    if (procedureLegObject && procedureLegObject.procedureLegs.length > 0) {
      for (const leg of procedureLegObject.procedureLegs) {
        plan.addLeg(0, leg, undefined, leg.legDefinitionFlags ?? LegDefinitionFlags.None, false);
      }

      await plan.calculate(0);
    }

    return plan;
  }

  /**
   * Builds a temporary flight plan to preview an airway entry.
   * @param airway The airway object.
   * @param entry The entry intersection facility.
   * @param exit The exit intersection facility.
   * @returns the index of the temporary flight plan.
   */
  public buildAirwayPreviewSegment(airway: AirwayData, entry: IntersectionFacility, exit: IntersectionFacility): number {
    this.flightPlanner.deleteFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
    const plan = this.flightPlanner.createFlightPlan(Fms.PROC_PREVIEW_PLAN_INDEX);
    const airwayLegObject = this.buildAirwayLegs(airway, entry, exit);
    plan.insertSegment(0, FlightPlanSegmentType.Enroute, airway.name, false);
    if (airwayLegObject.procedureLegs.length > 0) {
      airwayLegObject.procedureLegs.forEach((l) => {
        plan.addLeg(0, l, undefined, LegDefinitionFlags.None, false);
      });
      plan.calculate(0, true);
    }
    return Fms.PROC_PREVIEW_PLAN_INDEX;
  }

  /**
   * Inserts an airway segment into the flight plan.
   * @param airway The airway object.
   * @param entry The entry intersection facility.
   * @param exit The exit intersection facility.
   * @param segmentIndex The index of the segment containing the airway entry leg.
   * @param segmentLegIndex The index of the airway entry leg in its containing leg.
   * @returns The index of the inserted airway segment.
   */
  public insertAirwaySegment(airway: AirwayData, entry: IntersectionFacility, exit: IntersectionFacility, segmentIndex: number, segmentLegIndex: number): number {
    const plan = this.getFlightPlan();

    // If the entry leg is the target of a direct-to, insert the airway segment after the direct-to leg sequence.
    if (plan.directToData.segmentIndex === segmentIndex && plan.directToData.segmentLegIndex === segmentLegIndex) {
      segmentLegIndex += FmsUtils.DTO_LEG_OFFSET;
    }

    const entrySegment = plan.tryGetSegment(segmentIndex);

    // Editing the plan prior to an existing vertical direct-to cancels the vertical direct-to
    if (entrySegment && this.verticalPathCalculator) {
      const entryLegGlobalIndex = entrySegment.offset + segmentLegIndex;
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      if (verticalPlan.verticalDirectIndex !== undefined && verticalPlan.verticalDirectIndex > entryLegGlobalIndex) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    const airwaySegmentIndex = this.prepareAirwaySegment(`${airway.name}.${ICAO.getIdent(exit.icao)}`, segmentIndex, segmentLegIndex);
    const airwayLegObject = this.buildAirwayLegs(airway, entry, exit);
    const airwayLegs = airwayLegObject.procedureLegs;

    for (let i = 1; i < airwayLegs.length; i++) {
      this.planAddLeg(airwaySegmentIndex, airwayLegs[i]);
    }

    // handle duplicates
    const airwaySegment = plan.getSegment(airwaySegmentIndex);
    const lastLeg = airwaySegment.legs[airwaySegment.legs.length - 1];
    const nextLeg = plan.getNextLeg(airwaySegmentIndex + 1, -1);
    if (lastLeg && nextLeg && this.isDuplicateLeg(lastLeg.leg, nextLeg.leg)) {
      const nextLegIndex = plan.getLegIndexFromLeg(nextLeg);
      const nextLegSegmentIndex = plan.getSegmentIndex(nextLegIndex);
      const nextLegSegment = plan.getSegment(nextLegSegmentIndex);
      if (this.getAirwayLegType(plan, nextLegSegmentIndex, nextLegIndex - nextLegSegment.offset) === AirwayLegType.ENTRY) {
        // the duplicated leg is an airway entry -> remove the segment containing it (the segment is guaranteed to
        // contain just the one leg)
        this.planRemoveSegment(nextLegSegmentIndex);
      } else {
        this.planRemoveDuplicateLeg(lastLeg, nextLeg);
      }
    }

    plan.calculate(0, true);
    return airwaySegmentIndex;
  }

  /**
   * Prepares a new, empty airway segment in the primary flight plan which is ready to accept airway legs. Also
   * modifies the segment containing the entry leg, if necessary, either splitting it following the entry leg if it is
   * a non-airway enroute segment, or removing all legs following the entry leg if it is an airway segment. If the
   * entry leg is the last leg in its segment, a new non-airway enroute segment will be inserted after the entry leg
   * segment if the entry leg segment is the last segment in the flight plan or if the following segment is not an
   * enroute segment. If the entry leg is the entry for an existing airway segment, the existing airway segment will be
   * removed.
   * @param airwayName The name of the airway.
   * @param entrySegmentIndex The index of the segment containing the airway entry leg.
   * @param entrySegmentLegIndex The index of the airway entry leg in its segment.
   * @returns The index of the new airway segment.
   */
  private prepareAirwaySegment(airwayName: string, entrySegmentIndex: number, entrySegmentLegIndex: number): number {
    const plan = this.getPrimaryFlightPlan();

    if (
      entrySegmentIndex < plan.directToData.segmentIndex
      || (entrySegmentIndex === plan.directToData.segmentIndex && entrySegmentLegIndex < plan.directToData.segmentLegIndex)
    ) {
      this.removeDirectToExisting();
    }

    const entrySegment = plan.getSegment(entrySegmentIndex);
    const nextSegment = entrySegmentIndex + 1 < plan.segmentCount ? plan.getSegment(entrySegmentIndex + 1) : undefined;
    let airwaySegmentIndex = entrySegmentIndex + 1;

    let removeLegsSegmentIndex = -1;
    let removeLegsFromIndex = -1;

    if (entrySegment.airway !== undefined) {
      // the entry leg is within an existing airway segment -> remove all legs in the same segment after the entry leg
      removeLegsSegmentIndex = entrySegmentIndex;
      removeLegsFromIndex = entrySegmentLegIndex + 1;
    } else if (entrySegmentLegIndex === entrySegment.legs.length - 1 && nextSegment?.airway !== undefined) {
      // the entry leg is the entry leg for an existing airway segment -> remove all legs from the existing airway segment
      removeLegsSegmentIndex = entrySegmentIndex + 1;
      removeLegsFromIndex = 0;
    }

    // remove legs as required
    if (removeLegsSegmentIndex >= 0) {
      const removeLegsSegment = plan.getSegment(removeLegsSegmentIndex);

      if (this.getAirwayLegType(plan, removeLegsSegmentIndex, removeLegsSegment.legs.length - 1) === AirwayLegType.EXIT_ENTRY) {
        // preserve the airway entry leg
        const lastLeg = removeLegsSegment.legs[removeLegsSegment.legs.length - 1];
        this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, removeLegsSegmentIndex + 1);
        this.planAddLeg(removeLegsSegmentIndex + 1, lastLeg.leg, 0);
      }

      if (removeLegsFromIndex > 0) {
        while (removeLegsSegment.legs.length > removeLegsFromIndex) {
          this.planRemoveLeg(removeLegsSegmentIndex, removeLegsSegment.legs.length - 1, true, true);
        }
      } else {
        this.planRemoveSegment(removeLegsSegmentIndex);
      }
    }

    const entryLegIsNotLastLegInEntrySegment = entrySegment.legs.length - 1 > entrySegmentLegIndex;

    if (entryLegIsNotLastLegInEntrySegment) {
      // split the segment after the entry leg
      airwaySegmentIndex = this.splitSegmentForAirway(plan, entrySegmentIndex, entrySegmentLegIndex);
    } else if (
      plan.getSegment(entrySegmentIndex).segmentType === FlightPlanSegmentType.Enroute
      && (nextSegment?.segmentType !== FlightPlanSegmentType.Enroute)
    ) {
      // entry leg is the last leg in its segment and the following segment doesn't exist or is not an enroute segment
      plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute);
    }

    plan.insertSegment(airwaySegmentIndex, FlightPlanSegmentType.Enroute, airwayName);
    return airwaySegmentIndex;
  }

  /**
   * Splits a segment in preparation for inserting an airway segment after an entry leg within the segment to be split.
   * If the segment containing the entry leg is an enroute segment, it will be split into two enroute segments, with
   * the split occurring immediately after the entry leg. If the segment containing the entry leg is a departure
   * segment, all legs after the entry leg will be removed from the segment.
   * @param plan The flight plan to edit.
   * @param segmentIndex The index of the segment containing the airway entry leg.
   * @param segmentLegIndex The index of the airway entry leg in its containing segment.
   * @returns The index into which to insert the new airway segment now that the segment containing the entry leg has
   * been split.
   */
  private splitSegmentForAirway(plan: FlightPlan, segmentIndex: number, segmentLegIndex: number): number {
    const segment = plan.getSegment(segmentIndex);

    if (segment.segmentType === FlightPlanSegmentType.Enroute) {
      const nextSegmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
      // Move legs after leg index to new segment
      // It's funky without the i++, but it works correctly because the length of the segment is changing
      for (let i = segmentLegIndex + 1; i < segment.legs.length;) {
        const leg = segment.legs[i].leg;
        this.planAddLeg(nextSegmentIndex, leg);
        this.planRemoveLeg(segmentIndex, i);
      }
      return nextSegmentIndex;
    } else if (segment.segmentType === FlightPlanSegmentType.Departure) {
      // Remove legs after leg index
      // It's funky without the i++, but it works correctly because the length of the segment is changing
      for (let i = segmentLegIndex + 1; i < segment.legs.length;) {
        this.planRemoveLeg(segmentIndex, i);
      }
      return segmentIndex + 1;
    }

    return segmentIndex;
  }

  /**
   * Builds a legs for an airway.
   * @param airway The airway object.
   * @param entry The entry intersection facility.
   * @param exit The exit intersection facility.
   * @returns the InsertProcedureObject.
   */
  private buildAirwayLegs(airway: AirwayData, entry: IntersectionFacility, exit: IntersectionFacility): InsertProcedureObject {
    const insertAirwayObject: InsertProcedureObject = { procedureLegs: [] };
    const waypoints = airway.waypoints;
    const entryIndex = waypoints.findIndex((w) => w.icao === entry.icao);
    const exitIndex = waypoints.findIndex((w) => w.icao === exit.icao);
    const ascending = exitIndex > entryIndex;
    if (ascending) {
      for (let i = entryIndex; i <= exitIndex; i++) {
        const leg = FlightPlan.createLeg({
          fixIcaoStruct: waypoints[i].icaoStruct,
          type: i === entryIndex ? LegType.IF : LegType.TF
        });
        insertAirwayObject.procedureLegs.push(leg);
      }
    } else {
      for (let i = entryIndex; i >= exitIndex; i--) {
        const leg = FlightPlan.createLeg({
          fixIcaoStruct: waypoints[i].icaoStruct,
          type: i === entryIndex ? LegType.IF : LegType.TF
        });
        insertAirwayObject.procedureLegs.push(leg);
      }
    }
    return insertAirwayObject;
  }

  /**
   * Method to remove an airway from the flight plan.
   * @param segmentIndex is the segment index of the airway to remove.
   */
  public removeAirway(segmentIndex: number): void {
    const plan = this.getFlightPlan();
    const segment = plan.tryGetSegment(segmentIndex);

    if (segment === null || segment.airway === undefined) {
      return;
    }

    const wasActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);

    let combineSegments = false;
    const nextSegmentIsAirway = plan.getSegment(segmentIndex + 1).airway;

    const priorSegmentEnrouteNonAirway = plan.getSegment(segmentIndex - 1).segmentType === FlightPlanSegmentType.Enroute
      && plan.getSegment(segmentIndex - 1).airway === undefined;
    const nextSegmentEnrouteNonAirway = plan.getSegment(segmentIndex + 1).segmentType === FlightPlanSegmentType.Enroute
      && plan.getSegment(segmentIndex + 1).airway === undefined;

    if (priorSegmentEnrouteNonAirway && nextSegmentEnrouteNonAirway) {
      combineSegments = true;
    }

    let entryLeg: FlightPlanLeg | undefined = undefined;
    if (nextSegmentIsAirway) {
      entryLeg = segment.legs[segment.legs.length - 1].leg;
    }

    this.planRemoveSegment(segmentIndex);

    if (combineSegments) {
      this.mergeSegments(plan, segmentIndex - 1);
    }

    if (priorSegmentEnrouteNonAirway && entryLeg !== undefined) {
      this.planAddLeg(segmentIndex - 1, entryLeg);
    } else if (entryLeg !== undefined) {
      const newSegmentIndex = this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex);
      this.planAddLeg(newSegmentIndex, entryLeg);
    }

    plan.calculate(0);

    // If removing the segment caused the active leg to move from before the approach into the approach, activate the
    // approach instead.
    if (!wasActiveLegInApproach) {
      const isActiveLegInApproach = this.getDirectToState() === DirectToState.NONE && plan.activeLateralLeg >= (FmsUtils.getApproachSegment(plan)?.offset ?? Infinity);
      if (isActiveLegInApproach) {
        if (this.isApproachVtf()) {
          this.activateVtf();
        } else {
          this.activateApproach();
        }
      }
    }
  }

  /**
   * Merges the legs of two consecutive segments into a single segment. All legs in the second segment are moved to the
   * first, and the second segment is removed from the flight plan.
   * @param plan The flight plan to modify.
   * @param segmentIndex The index of the first segment to merge.
   */
  private mergeSegments(plan: FlightPlan, segmentIndex: number): void {
    const segmentToGrow = plan.getSegment(segmentIndex);
    const segmentToRemove = plan.getSegment(segmentIndex + 1);

    const segmentToGrowOrigLength = segmentToGrow.legs.length;

    segmentToRemove.legs.forEach((l) => {
      plan.addLeg(segmentIndex, l.leg, undefined, l.flags);
    });

    if (plan.directToData.segmentIndex === segmentIndex + 1) {
      plan.setDirectToData(segmentIndex, segmentToGrowOrigLength + plan.directToData.segmentLegIndex);
    }

    this.planRemoveSegment(segmentIndex + 1);
  }

  /**
   * Inserts a hold-at-waypoint leg to a flight plan. The hold leg will be inserted immediately after the specified
   * parent leg. The hold leg must have the same fix as the parent leg.
   * @param planIndex The index of the flight plan to add the hold to.
   * @param segmentIndex The index of the segment that contains the hold's parent leg.
   * @param segmentLegIndex The index of the hold's parent leg in its segment.
   * @param holdLeg The hold leg to add.
   * @returns The inserted hold-at-waypoint leg, or `undefined` if the leg could not be inserted.
   */
  public insertHold(planIndex: number, segmentIndex: number, segmentLegIndex: number, holdLeg: FlightPlanLeg): LegDefinition | undefined {
    const plan = this.hasFlightPlan(planIndex) && this.getFlightPlan(planIndex);
    if (!plan) {
      return undefined;
    }

    const parentLeg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
    if (parentLeg?.leg.fixIcao !== holdLeg.fixIcao) {
      return undefined;
    }

    if (planIndex === Fms.PRIMARY_PLAN_INDEX) {
      const airwayLegType = this.getAirwayLegType(plan, segmentIndex, segmentLegIndex);
      switch (airwayLegType) {
        case AirwayLegType.ONROUTE:
        case AirwayLegType.EXIT:
        case AirwayLegType.EXIT_ENTRY: {
          // Insert the hold leg. The hold leg is guaranteed to end up in a non-airway enroute segment.
          const insertedHoldLeg = this.handleAirwayInsertLeg(plan, segmentIndex, holdLeg, segmentLegIndex + 1);
          if (!insertedHoldLeg) {
            return undefined;
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const holdLegSegment = plan.getSegmentFromLeg(insertedHoldLeg)!;
          const holdLegSegmentIndex = holdLegSegment.legs.indexOf(insertedHoldLeg);

          // We need to move the hold's parent leg out of the airway and into the same segment as the hold leg. The
          // parent leg's segment index and segment leg index should not have been changed by inserting the hold leg.
          this.planRemoveLeg(segmentIndex, segmentLegIndex);
          this.planAddLeg(holdLegSegment.segmentIndex, parentLeg.leg, holdLegSegmentIndex);
          this.setLegVerticalData(plan, holdLegSegment.segmentIndex, holdLegSegmentIndex, parentLeg.verticalData);

          return insertedHoldLeg;
        }
        case AirwayLegType.ENTRY: // Inserting a hold at an airway entry leg turns the hold leg into the entry leg, so there is no extra logic needed.
        default:
          return this.planAddLeg(segmentIndex, holdLeg, segmentLegIndex + 1);
      }
    } else {
      if (this.getDirectToState() === DirectToState.TORANDOM) {
        this.cancelObs(plan.activeLateralLeg < 3);
      }

      const insertedHoldLeg = plan.addLeg(segmentIndex, holdLeg);
      this.publisher.pub(this.lnavControlTopicMap['suspend_sequencing'], false, true, false);
      return insertedHoldLeg;
    }
  }

  /**
   * Edits a hold in a flight plan. The existing hold leg will be removed from the flight plan and a new hold leg with
   * the edited parameters will be inserted in its place.
   * @param planIndex The index of the flight plan containing the hold to edit.
   * @param segmentIndex The index of the segment containing the hold to edit.
   * @param segmentLegIndex The index of the hold leg in its containing segment.
   * @param holdLeg A leg describing the new hold parameters to apply.
   * @returns The edited hold leg, or `undefined` if the hold could not be edited.
   */
  public editHold(planIndex: number, segmentIndex: number, segmentLegIndex: number, holdLeg: FlightPlanLeg): LegDefinition | undefined {
    const plan = this.hasFlightPlan(planIndex) && this.getFlightPlan(planIndex);
    if (!plan) {
      return undefined;
    }

    const leg = plan.tryGetLeg(segmentIndex, segmentLegIndex);
    if (!leg || !FlightPlanUtils.isHoldLeg(leg.leg.type)) {
      return undefined;
    }

    const parentLeg = plan.tryGetLeg(segmentIndex, segmentLegIndex - 1);
    if (parentLeg?.leg.fixIcao !== holdLeg.fixIcao) {
      return undefined;
    }

    const verticalData = leg.verticalData;

    plan.removeLeg(segmentIndex, segmentLegIndex);
    const insertedHoldLeg = plan.addLeg(segmentIndex, holdLeg, segmentLegIndex);
    plan.setLegVerticalData(segmentIndex, segmentLegIndex, verticalData);

    return insertedHoldLeg;
  }

  /**
   * Activates the nearest and most applicable leg of the primary flight plan.
   * @param allowMissedApproach Whether to allow activation of missed approach legs. Defaults to `false`.
   * @returns Whether a leg was successfully activated.
   */
  public activateNearestLeg(allowMissedApproach = false): boolean {
    const plan = this.hasPrimaryFlightPlan() && this.getPrimaryFlightPlan();
    if (!plan) {
      return false;
    }

    this.cancelObs(this.getDirectToState() !== DirectToState.TORANDOM);

    let index = 0;
    let lastAllowableLegIndex = -1;
    let hasReachedMapr = false;

    //Filter to legs that we are potentially on
    const validLegs: LegDefinition[] = [];
    for (const leg of plan.legs()) {
      const isDto = BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo);
      const isMapr = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
      const isDisco = FlightPlanUtils.isDiscontinuityLeg(leg.leg.type);

      hasReachedMapr ||= isMapr;

      const isLegAllowed = !isDto && !isDisco && (allowMissedApproach || !hasReachedMapr);

      if (isLegAllowed) {
        lastAllowableLegIndex = index;

        const calcs = leg.calculated;
        if (calcs !== undefined) {
          const position = this.getLegReferencePosition(leg);
          if (position !== undefined && position >= 0 && position <= 1) {
            validLegs.push(leg);
          }
        }
      }

      index++;
    }

    //Try to activate the second or last leg if we're beyond the end or the beginning of the plan
    if (validLegs.length === 0 && plan.length > 1) {
      let secondLegGlobalIndex = 1;

      // If the first leg is the target of an on-route direct-to, then the second leg's index must be offset to
      // account for this.
      const firstLegSegmentIndex = plan.getSegmentIndex(0);
      if (plan.directToData.segmentIndex === firstLegSegmentIndex && plan.directToData.segmentLegIndex === 0) {
        secondLegGlobalIndex += FmsUtils.DTO_LEG_OFFSET;
      }

      if (lastAllowableLegIndex >= secondLegGlobalIndex) {
        const secondLeg = plan.getLeg(secondLegGlobalIndex);

        const secondLegPosition = this.getLegReferencePosition(secondLeg);
        if (secondLegPosition !== undefined && secondLegPosition > 1) {
          const segmentIndex = plan.getSegmentIndex(lastAllowableLegIndex);
          const segment = plan.getSegment(segmentIndex);

          if (segment !== null) {
            this._activateLeg(Fms.PRIMARY_PLAN_INDEX, segment.segmentIndex, lastAllowableLegIndex - segment.offset, false);
            return true;
          }
        } else if (secondLegPosition !== undefined && secondLegPosition <= 1) {
          const segment = plan.getSegmentFromLeg(secondLeg);

          if (segment !== null) {
            this._activateLeg(Fms.PRIMARY_PLAN_INDEX, segment.segmentIndex, secondLegGlobalIndex - segment.offset, false);
            return true;
          }
        }
      }
    }

    let closestLeg: LegDefinition | undefined = undefined;
    let closestXtk: number | undefined = undefined;

    for (const leg of validLegs) {
      const calcs = leg.calculated;
      if (calcs !== undefined) {
        const xtk = this.getClosestLegXtk(leg);
        if (xtk !== undefined) {
          if (closestXtk === undefined || xtk < closestXtk) {
            closestLeg = leg;
            closestXtk = xtk;
          }
        }
      }
    }

    if (closestLeg !== undefined) {
      const segment = plan.getSegmentFromLeg(closestLeg);

      if (segment !== null) {
        this._activateLeg(Fms.PRIMARY_PLAN_INDEX, segment.segmentIndex, segment.legs.indexOf(closestLeg), false);
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the normalized leg reference position from the leg.
   * @param leg The leg to get the position for.
   * @returns The normalized reference position.
   */
  private getLegReferencePosition(leg: LegDefinition): number | undefined {
    if (leg.calculated !== undefined && leg.calculated.flightPath.length > 0) {
      let numBefore = 0;
      let firstBeforePosition = 0;

      let numAfter = 0;
      let lastAfterPosition = 0;

      let latestInside: number | undefined = undefined;

      const flightPath = leg.calculated.flightPath;
      for (let i = 0; i < flightPath.length; i++) {
        const vector = flightPath[i];
        const circle = FlightPathUtils.setGeoCircleFromVector(flightPath[i], Fms.geoCircleCache[0]);

        const start = Fms.geoPointCache[0].set(vector.startLat, vector.startLon);
        const end = Fms.geoPointCache[1].set(vector.endLat, vector.endLon);
        const position = FlightPathUtils.getAlongArcNormalizedDistance(circle, start, end, this.ppos);

        if (position < 0) {
          numBefore++;
          if (i === 0) {
            firstBeforePosition = position;
          }
        } else if (position > 1) {
          numAfter++;
          if (i === flightPath.length - 1) {
            lastAfterPosition = position;
          }
        } else {
          latestInside = position;
        }
      }

      if (numBefore === flightPath.length) {
        return firstBeforePosition;
      } else if (numAfter === flightPath.length) {
        return lastAfterPosition;
      } else if (latestInside !== undefined) {
        return latestInside;
      } else {
        return undefined;
      }
    }

    return undefined;
  }

  /**
   * Gets the XTK of the closest vector on the leg.
   * @param leg The leg to get the XTK for.
   * @returns The closest leg vector XTK.
   */
  private getClosestLegXtk(leg: LegDefinition): number | undefined {
    if (leg.calculated !== undefined) {
      return Math.min(...leg.calculated.flightPath.map(vector => {
        const circle = FlightPathUtils.setGeoCircleFromVector(vector, Fms.geoCircleCache[0]);

        const start = Fms.geoPointCache[0].set(vector.startLat, vector.startLon);
        const end = Fms.geoPointCache[1].set(vector.endLat, vector.endLon);
        const position = FlightPathUtils.getAlongArcNormalizedDistance(circle, start, end, this.ppos);

        if (position >= 0 || position <= 1) {
          return Math.abs(circle.distance(this.ppos));
        } else {
          return Number.MAX_SAFE_INTEGER;
        }
      }));
    }
    return undefined;
  }

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param array The source array to search in
   * @param predicate find calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param defaultReturn is the default value
   * @returns either the index or the default if the predicate criteria is not met
   */
  private findLastSegmentIndex(array: Array<FlightPlanSegment>, predicate:
    (value: FlightPlanSegment, index: number, obj: FlightPlanSegment[]) => boolean, defaultReturn = -1): number {
    let l = array.length;
    while (l--) {
      if (predicate(array[l], l, array)) {
        return array[l].segmentIndex;
      }
    }
    return defaultReturn;
  }

  /**
   * Adds a leg to the flight plan.
   * @param segmentIndex The segment to add the leg to.
   * @param leg The leg to add to the plan.
   * @param index The index of the leg in the segment to insert. Will add to the end of the segment if ommitted.
   * @param flags Leg definition flags to apply to the new leg. Defaults to `None` (0).
   * @param notify Whether or not to send notifications after the operation.
   * @returns the new leg definition.
   */
  private planAddLeg(segmentIndex: number, leg: FlightPlanLeg, index?: number, flags = 0, notify = true): LegDefinition {
    const plan = this.getFlightPlan();

    const dtoLegIndex = plan.directToData.segmentLegIndex;
    const dtoSegmentIndex = plan.directToData.segmentIndex;
    if (
      dtoSegmentIndex >= 0
      && (
        segmentIndex < dtoSegmentIndex
        || (segmentIndex === dtoSegmentIndex && index !== undefined && index <= dtoLegIndex)
      )
    ) {
      this.removeDirectToExisting();
    }

    const segment = plan.getSegment(segmentIndex);
    const addIndex = index !== undefined ? index : Math.max(segment.legs.length - 1, 0);
    if (
      segment.segmentType === FlightPlanSegmentType.Approach
      && addIndex > 0
      && BitFlags.isAll(segment.legs[addIndex - 1].flags, LegDefinitionFlags.MissedApproach)
    ) {
      flags |= LegDefinitionFlags.MissedApproach;
    }

    const legDefinition = plan.addLeg(segmentIndex, leg, index, flags, notify);
    plan.calculate(plan.activeLateralLeg - 1);
    const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
    if (activeSegmentIndex !== -1) {
      const activeLegIndex = plan.activeLateralLeg - plan.getSegment(activeSegmentIndex).offset;
      if (segmentIndex < activeSegmentIndex || (index && segmentIndex == activeSegmentIndex && index < activeLegIndex)) {
        const newActiveLegIndex = plan.activeLateralLeg + 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    } else {
      console.error('planAddLeg: activeSegmentIndex was -1');
    }
    return legDefinition;
  }

  /**
   * Removes a leg from the flight plan.
   * @param segmentIndex The segment to add the leg to.
   * @param segmentLegIndex The index of the leg in the segment to remove.
   * @param notify Whether or not to send notifications after the operation. True by default.
   * @param skipDupCheck Whether to skip checking for duplicates. False by default.
   * @param skipCancelDirectTo Whether to skip canceling a direct to existing if the removed leg is equal to or is
   * located before the direct to target. False by default.
   * @returns whether a leg was removed.
   */
  private planRemoveLeg(segmentIndex: number, segmentLegIndex: number, notify = true, skipDupCheck = false, skipCancelDirectTo = false): boolean {
    const plan = this.getFlightPlan();

    if (segmentIndex < 0 || segmentIndex >= plan.segmentCount) {
      return false;
    }

    const segment = plan.getSegment(segmentIndex);

    const toRemoveLeg = segment.legs[segmentLegIndex];
    if (!toRemoveLeg) {
      return false;
    }

    const removeLegGlobalIndex = segment.offset + segmentLegIndex;

    const isDirectToExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;

    let removed = false;
    const airwayLegType = this.getAirwayLegType(plan, segmentIndex, segmentLegIndex);

    if (airwayLegType !== AirwayLegType.NONE) {
      removed = this.removeLegAirwayHandler(plan, airwayLegType, segmentIndex, segmentLegIndex);
    } else {
      removed = plan.removeLeg(segmentIndex, segmentLegIndex, notify) !== null;

      if (!removed) {
        return false;
      }

      const dtoLegIndex = plan.directToData.segmentLegIndex;
      const dtoSegmentIndex = plan.directToData.segmentIndex;
      if (
        !skipCancelDirectTo
        && dtoSegmentIndex >= 0
        && (
          segmentIndex < dtoSegmentIndex
          || (segmentIndex === dtoSegmentIndex && segmentLegIndex <= dtoLegIndex)
        )
      ) {
        // Need to adjust direct to data to compensate for removed leg.
        if (segmentIndex === dtoSegmentIndex) {
          plan.directToData.segmentLegIndex--;
        }

        if (isDirectToExistingActive && segmentIndex === dtoSegmentIndex && segmentLegIndex === dtoLegIndex) {
          // Create a DTO random to replace the canceled DTO existing if we are directly removing the target leg of the DTO existing.
          const directIcao = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET].leg.fixIcao;
          this.createDirectToRandom(directIcao);
        }

        this.removeDirectToExisting(plan.activeLateralLeg - 1);
      } else if (removeLegGlobalIndex < plan.activeLateralLeg || plan.activeLateralLeg >= plan.length) {
        const newActiveLegIndex = plan.activeLateralLeg - 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    }

    // Editing the plan prior to an existing vertical direct-to cancels the vertical direct-to
    if (removed && this.verticalPathCalculator) {
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      if (verticalPlan.verticalDirectIndex !== undefined && verticalPlan.verticalDirectIndex >= removeLegGlobalIndex) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    const prevLeg = removeLegGlobalIndex - 1 >= 0 ? plan.getLeg(removeLegGlobalIndex - 1) : null;
    const nextLeg = removeLegGlobalIndex < plan.length ? plan.getLeg(removeLegGlobalIndex) : null;

    // If we are removing a leg before a VTF faf leg, we need to check whether the new leg prior to the faf leg
    // terminates at the same facility as the leg prior to the faf in the published procedure.
    if (segment.segmentType === FlightPlanSegmentType.Approach && FmsUtils.isVtfApproachLoaded(plan)) {
      const vtfFafLeg = FmsUtils.getApproachVtfLeg(plan);

      if (vtfFafLeg !== undefined) {
        // Note that by now we have already removed the leg, so all leg indexes after the removed leg have been shifted by -1.

        const vtfFafSegmentLegIndex = segment.legs.indexOf(vtfFafLeg);
        const discoLegExists = BitFlags.isAll(segment.legs[vtfFafSegmentLegIndex - 1]?.flags ?? 0, LegDefinitionFlags.VectorsToFinal);

        if (vtfFafLeg !== undefined && segmentLegIndex === vtfFafSegmentLegIndex - (discoLegExists ? 1 : 0)) {
          const publishedLegIcao = plan.getUserData<string>(Fms.VTF_FAF_DATA_KEY) ?? '';
          const legTerminatorIcao = prevLeg === null ? '' : FlightPlanUtils.getTerminatorIcao(prevLeg.leg) ?? '';

          const needDisco = !ICAO.isFacility(publishedLegIcao) || !ICAO.isFacility(legTerminatorIcao) || publishedLegIcao !== legTerminatorIcao;

          if (needDisco && !discoLegExists) {
            plan.addLeg(segmentIndex, FlightPlan.createLeg({ type: LegType.ThruDiscontinuity }), vtfFafSegmentLegIndex, LegDefinitionFlags.VectorsToFinal);

            if (plan.activeLateralLeg >= segment.offset + vtfFafSegmentLegIndex) {
              plan.setLateralLeg(plan.activeLateralLeg + 1);
              plan.setCalculatingLeg(plan.activeCalculatingLeg + 1);
            }
          } else if (!needDisco && discoLegExists) {
            plan.removeLeg(segmentIndex, vtfFafSegmentLegIndex - 1);

            if (plan.activeLateralLeg >= segment.offset + vtfFafSegmentLegIndex) {
              plan.setLateralLeg(plan.activeLateralLeg - 1);
              plan.setCalculatingLeg(plan.activeCalculatingLeg - 1);
            }
          }
        }
      }
    }

    // Detect if we have created consecutive duplicate legs. If we have, we need to delete one of them.
    if (!skipDupCheck && prevLeg && nextLeg && this.isDuplicateLeg(prevLeg.leg, nextLeg.leg)) {
      this.planRemoveDuplicateLeg(prevLeg, nextLeg);
    }

    if (!skipDupCheck) {
      this.checkAndRemoveEmptySegment(plan, segmentIndex);
    }

    plan.calculate(plan.activeLateralLeg - 1);
    return true;
  }

  /**
   * Handles removing a leg that is either in an airway segment or is an entry for an airway segment.
   * @param plan The flight plan containing the leg to remove.
   * @param airwayLegType The type of the leg to remove with respect to its associated airway.
   * @param segmentIndex The index of the segment containing the leg to remove.
   * @param segmentLegIndex The index of the leg to remove in its segment.
   * @returns Whether this handler processed the remove request.
   */
  private removeLegAirwayHandler(plan: FlightPlan, airwayLegType: AirwayLegType, segmentIndex: number, segmentLegIndex: number): boolean {
    const removeLegGlobalIndex = plan.getSegment(segmentIndex).offset + segmentLegIndex;

    let removed = false;
    let needReconcileDto = plan.directToData.segmentIndex >= 0;

    if (
      segmentIndex < plan.directToData.segmentIndex
      || (segmentIndex === plan.directToData.segmentIndex && segmentLegIndex <= plan.directToData.segmentLegIndex)
    ) {
      // If there are DTO legs after the leg we are removing, we need to remove them (canceling the active DTO existing if necessary)

      if (this.getDirectToState() === DirectToState.TOEXISTING && segmentLegIndex === plan.directToData.segmentLegIndex) {
        // Create a DTO random to replace the canceled DTO existing if we are directly removing the target leg of the DTO existing.
        const directIcao = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex + FmsUtils.DTO_LEG_OFFSET].leg.fixIcao;
        this.createDirectToRandom(directIcao);
      }

      this.removeDirectToExisting();

      needReconcileDto = false;
    }

    switch (airwayLegType) {
      case AirwayLegType.ONROUTE: {
        const segment = plan.getSegment(segmentIndex);
        plan.removeLeg(segmentIndex, segmentLegIndex);

        if (segmentLegIndex > 0) {
          // Need to rename the airway segment with the new exit (if we removed the first leg after the entry, the
          // airway segment will be deleted so no need to bother)

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          plan.setAirway(segmentIndex, segment.airway!.replace(/\..*/, `.${segment.legs[segmentLegIndex - 1].name}`));
        }

        // We need to move the leg immediately after the removed leg to the next non-airway enroute segment
        // (if the next enroute segment does not exist we will create one)

        if (
          plan.segmentCount <= segmentIndex + 1
          || plan.getSegment(segmentIndex + 1).segmentType !== FlightPlanSegmentType.Enroute
          || plan.getSegment(segmentIndex + 1).airway !== undefined
        ) {
          plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);
        }

        const legAfterRemoved = segment.legs[segmentLegIndex].leg;
        plan.addLeg(segmentIndex + 1, legAfterRemoved, 0);
        plan.removeLeg(segmentIndex, segmentLegIndex);

        if (segmentLegIndex < segment.legs.length) {
          // There is at least one more leg in the original airway segment after the one we moved to the next enroute
          // segment -> move these remaining legs into a new airway segment

          const newEntrySegment = plan.getSegment(segmentIndex + 1);
          let newAirwaySegmentIndex = segmentIndex + 2;
          if (newEntrySegment.legs.length > 1) {
            // need to split the segment containing the entry leg of the new airway segment
            newAirwaySegmentIndex = this.splitSegmentForAirway(plan, segmentIndex + 1, 0);
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const airwayName = segment.airway!.replace(/\..*/, `.${segment.legs[segment.legs.length - 1].name}`);
          plan.insertSegment(newAirwaySegmentIndex, FlightPlanSegmentType.Enroute, airwayName);

          while (segment.legs.length > segmentLegIndex) {
            const leg = segment.legs[segmentLegIndex].leg;
            plan.removeLeg(segmentIndex, segmentLegIndex);
            plan.addLeg(newAirwaySegmentIndex, leg);
          }

          // If the newly added airway segment is the last enroute segment, we need to insert an empty enroute segment
          // after it to ensure that the last enroute segment in the plan is not an airway segment
          if (newAirwaySegmentIndex >= plan.segmentCount - 1 || plan.getSegment(newAirwaySegmentIndex + 1).segmentType !== FlightPlanSegmentType.Enroute) {
            plan.insertSegment(newAirwaySegmentIndex + 1, FlightPlanSegmentType.Enroute);
          }
        }

        removed = true;
        break;
      }
      case AirwayLegType.ENTRY: {
        if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Enroute) {
          // We need to remove the entry leg, then move the first leg in the airway segment out of the airway segment
          // and into the previous enroute segment to serve as the new entry leg.

          const airwaySegment = plan.getSegment(segmentIndex + 1);
          const legToMove = airwaySegment.legs[0].leg;
          plan.removeLeg(segmentIndex + 1, 0);
          this.checkAndRemoveEmptySegment(plan, segmentIndex + 1);

          this.planAddLeg(segmentIndex, legToMove, segmentLegIndex + 1);
        } else if (plan.getSegment(segmentIndex).segmentType === FlightPlanSegmentType.Departure) {
          // We need to remove the entry leg, then move the first leg in the airway segment out of the airway segment
          // and into a newly created enroute segment placed before the airway segment to serve as the new entry leg.

          this.planInsertSegmentOfType(FlightPlanSegmentType.Enroute, segmentIndex + 1);
          const airwaySegment = plan.getSegment(segmentIndex + 2);
          const legToMove = airwaySegment.legs[0].leg;
          plan.removeLeg(segmentIndex + 2, 0);
          this.checkAndRemoveEmptySegment(plan, segmentIndex + 2);

          this.planAddLeg(segmentIndex + 1, legToMove, 0);
        }
        removed = plan.removeLeg(segmentIndex, segmentLegIndex) !== null;
        break;
      }
      case AirwayLegType.EXIT: {
        if (segmentLegIndex < 1) {
          // We are removing the only leg in the airway segment, so just delete the segment.

          this.removeAirway(segmentIndex);
          return true;
        } else {
          // Remove the leg, then change the name of the airway segment to reflect the new exit waypoint.

          const segment = plan.getSegment(segmentIndex);
          const airway = segment.airway?.split('.');
          segment.airway = airway && airway[0] ? airway[0] + '.' + segment.legs[segmentLegIndex - 1].name : segment.airway;
          plan.setAirway(segmentIndex, segment.airway);
          removed = plan.removeLeg(segmentIndex, segmentLegIndex) !== null;
        }
        break;
      }
      case AirwayLegType.EXIT_ENTRY: {
        // We need to move the first leg in the next airway segment out of that segment and into an enroute segment
        // before the next airway segment.

        const segment = plan.getSegment(segmentIndex + 1);
        const leg = segment.legs[0].leg;
        plan.removeLeg(segmentIndex + 1, 0);
        if (segmentLegIndex < 1) {
          // We are removing the only leg in the first airway segment, so just remove the segment.
          plan.removeSegment(segmentIndex);

          let prevSegmentIndex = segmentIndex - 1;
          const prevSegment = plan.getSegment(prevSegmentIndex);
          if (prevSegment.segmentType !== FlightPlanSegmentType.Enroute || prevSegment.airway !== undefined) {
            plan.insertSegment(segmentIndex, FlightPlanSegmentType.Enroute);
            prevSegmentIndex = segmentIndex;
          }

          plan.addLeg(prevSegmentIndex, leg);
        } else {
          // Remove the leg from the first airway segment, then change the name of the airway segment to reflect the
          // new exit waypoint.

          plan.removeLeg(segmentIndex, segmentLegIndex);
          plan.insertSegment(segmentIndex + 1, FlightPlanSegmentType.Enroute);
          plan.addLeg(segmentIndex + 1, leg);

          const firstAirwaySegment = plan.getSegment(segmentIndex);
          const airway = firstAirwaySegment.airway?.split('.');
          firstAirwaySegment.airway = airway && airway[0] ? airway[0] + '.' + firstAirwaySegment.legs[segmentLegIndex - 1].name : firstAirwaySegment.airway;
          plan.setAirway(segmentIndex, firstAirwaySegment.airway);
        }
        removed = true;
      }
    }

    if (removed) {
      if (needReconcileDto) {
        FmsUtils.reconcileDirectToData(plan);
      }

      if (removeLegGlobalIndex <= plan.activeLateralLeg || plan.activeLateralLeg >= plan.length) {
        const newActiveLegIndex = plan.activeLateralLeg - 1;
        plan.setCalculatingLeg(newActiveLegIndex);
        plan.setLateralLeg(newActiveLegIndex);
      }
    }

    return removed;
  }

  /**
   * Checks if a flight plan segment is empty, and removes the segment if it is eligible to be removed. Only Enroute
   * segments that are followed by another Enroute segment are eligible to be removed if empty.
   * @param plan A flight plan.
   * @param segmentIndex The index of the segment to check.
   * @returns Whether the segment was removed.
   */
  private checkAndRemoveEmptySegment(plan: FlightPlan, segmentIndex: number): boolean {
    if (this.checkIfRemoveLeftEmptySegmentToDelete(plan, segmentIndex)) {
      this.planRemoveSegment(segmentIndex);

      const prevSegmentIndex = segmentIndex - 1;
      const nextSegmentIndex = segmentIndex;
      const prevSegment = prevSegmentIndex >= 0 ? plan.getSegment(prevSegmentIndex) : undefined;
      const nextSegment = nextSegmentIndex < plan.segmentCount ? plan.getSegment(nextSegmentIndex) : undefined;
      if (
        prevSegment?.segmentType === FlightPlanSegmentType.Enroute
        && prevSegment.airway === undefined
        && nextSegment?.segmentType === FlightPlanSegmentType.Enroute
        && nextSegment.airway === undefined
      ) {
        // We are left with two consecutive non-airway enroute segments -> merge the two
        this.mergeSegments(plan, prevSegmentIndex);
      }

      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if a remove left an empty segment that also needs to be removed.
   * @param plan is the flight plan
   * @param segmentIndex The segment to add the leg to.
   * @returns whether to remove the segment.
   */
  private checkIfRemoveLeftEmptySegmentToDelete(plan: FlightPlan, segmentIndex: number): boolean {
    const segment = plan.getSegment(segmentIndex);
    let nextSegment: FlightPlanSegment | undefined;
    if (segmentIndex < plan.segmentCount - 1) {
      nextSegment = plan.getSegment(segmentIndex + 1);
    }
    if (segment.legs.length < 1) {
      switch (segment.segmentType) {
        case FlightPlanSegmentType.Enroute:
          if (nextSegment && nextSegment.segmentType === FlightPlanSegmentType.Enroute) {
            return true;
          }
          break;
        //TODO: Add more cases as appropriate
      }
    }
    return false;
  }


  /**
   * Adds an appropriate origin or destination leg (either an airport or runway fix) to the primary flight plan. Origin
   * legs are added to the beginning of the specified segment. Destination legs are added to the end of the specified
   * segment.
   * @param isOrigin Whether to add an origin leg.
   * @param segmentIndex The index of the segment to which to add the leg.
   * @param airportIcao The ICAO of the leg's airport.
   * @param runway The leg's runway.
   */
  private planAddOriginDestinationLeg(
    isOrigin: boolean,
    segmentIndex: number,
    airportIcao: IcaoValue,
    runway?: OneWayRunway
  ): void {
    let legToAdd;
    if (runway) {
      legToAdd = FmsUtils.buildRunwayLeg(airportIcao, runway, isOrigin);
    } else {
      legToAdd = FlightPlan.createLeg({
        type: isOrigin ? LegType.IF : LegType.TF,
        fixIcaoStruct: airportIcao,
      });
    }

    this.planAddLeg(segmentIndex, legToAdd, isOrigin ? 0 : undefined);

    if (!isOrigin) {
      const plan = this.getFlightPlan();
      const lastEnrouteSegment = FmsUtils.getLastEnrouteSegment(plan);
      if (lastEnrouteSegment) {
        for (let segmentLegIndex = lastEnrouteSegment.legs.length - 1; segmentLegIndex >= 0; segmentLegIndex--) {
          const leg = lastEnrouteSegment.legs[segmentLegIndex];
          if (BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo)) {
            continue;
          }

          if (ICAO.valueEquals(leg.leg.fixIcaoStruct, airportIcao)) {
            this.planRemoveLeg(lastEnrouteSegment.segmentIndex, segmentLegIndex, true, true);
          }
          break;
        }
      }
    }
  }

  /**
   * Method to add a segment to the flightplan.
   * @param segmentType is the FlightPlanSegmentType.
   * @param index is the optional segment index to insert the segment.
   * @returns the segment index of the inserted segment.
   */
  private planInsertSegmentOfType(segmentType: FlightPlanSegmentType, index?: number): number {
    const plan = this.getFlightPlan();
    let segmentIndex = -1;

    if (index) {
      segmentIndex = index - 1;
    } else {
      const segments: FlightPlanSegment[] = [];
      for (const segment of plan.segments()) {
        segments.push(segment);
      }

      switch (segmentType) {
        case FlightPlanSegmentType.Origin:
          break;
        case FlightPlanSegmentType.Departure:
          segmentIndex = 0;
          break;
        case FlightPlanSegmentType.Arrival:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute;
          }, 2);
          break;
        case FlightPlanSegmentType.Approach:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival;
          }, 2);
          break;
        case FlightPlanSegmentType.MissedApproach:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Approach;
          }, 2);
          break;
        case FlightPlanSegmentType.Destination:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
              || v.segmentType === FlightPlanSegmentType.Approach;
          }, 5);
          break;
        default:
          segmentIndex = this.findLastSegmentIndex(segments, (v) => {
            return v.segmentType === FlightPlanSegmentType.Enroute || v.segmentType === FlightPlanSegmentType.Arrival
              || v.segmentType === FlightPlanSegmentType.Approach || v.segmentType === FlightPlanSegmentType.Destination;
          }, 1);
          segmentIndex--;
          break;
      }
    }
    return this.planInsertSegment(segmentIndex + 1, segmentType).segmentIndex;
  }

  /**
   * Method to remove all legs from a segment.
   * @param segmentIndex is the index of the segment to delete all legs from.
   * @param segmentType is the type if segment to delete all legs from, if known.
   */
  private planClearSegment(segmentIndex: number, segmentType?: FlightPlanSegmentType): void {
    this.planRemoveSegment(segmentIndex);
    this.planInsertSegment(segmentIndex, segmentType);
  }

  /**
   * Inserts a segment into the flight plan at the specified index and
   * reflows the subsequent segments.
   * @param segmentIndex The index to insert the flight plan segment.
   * @param segmentType The type of segment this will be.
   * @param airway The airway this segment is made up of, if any
   * @param notify Whether or not to send notifications after the operation.
   * @returns The new flight plan segment.
   */
  private planInsertSegment(segmentIndex: number, segmentType: FlightPlanSegmentType = FlightPlanSegmentType.Enroute, airway?: string, notify = true): FlightPlanSegment {
    const plan = this.getFlightPlan();

    // Editing the plan prior to an existing vertical direct-to cancels the vertical direct-to
    if (this.verticalPathCalculator) {
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      const currentSegment = plan.tryGetSegment(segmentIndex);
      if (verticalPlan.verticalDirectIndex !== undefined && currentSegment !== null && verticalPlan.verticalDirectIndex >= currentSegment.offset) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    const segment = plan.insertSegment(segmentIndex, segmentType, airway, notify);
    plan.calculate(plan.activeLateralLeg - 1);

    if (plan.directToData.segmentIndex >= 0 && segmentIndex <= plan.directToData.segmentIndex) {
      plan.setDirectToData(plan.directToData.segmentIndex + 1, plan.directToData.segmentLegIndex);
    }

    return segment;
  }

  /**
   * Removes a segment from the flight plan and reflows the segments following
   * the removed segment, not leaving an empty segment at the specified index.
   * @param segmentIndex The index of the segment to remove.
   * @param notify Whether or not to send notifications after the operation.
   */
  private planRemoveSegment(segmentIndex: number, notify = true): void {
    const plan = this.getFlightPlan();

    const segment = plan.getSegment(segmentIndex);
    const activeSegmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);

    // Editing the plan prior to an existing vertical direct-to cancels the vertical direct-to
    if (this.verticalPathCalculator) {
      const verticalPlan = this.verticalPathCalculator.getVerticalFlightPlan(Fms.PRIMARY_PLAN_INDEX);
      if (verticalPlan.verticalDirectIndex !== undefined && verticalPlan.verticalDirectIndex >= segment.offset) {
        this.publishCancelVerticalDirectTo(FmsUtils.PRIMARY_PLAN_INDEX);
      }
    }

    if (plan.directToData.segmentIndex >= 0) {
      if (segmentIndex < plan.directToData.segmentIndex) {
        plan.setDirectToData(plan.directToData.segmentIndex - 1, plan.directToData.segmentLegIndex);
      } else if (segmentIndex === plan.directToData.segmentIndex) {
        plan.setDirectToData(-1);
      }
    }

    if (activeSegmentIndex === segmentIndex && !Simplane.getIsGrounded() && plan.length > 1) {
      const directIcao = plan.getLeg(plan.activeLateralLeg).leg.fixIcao;
      if (ICAO.isFacility(directIcao) && this.getDirectToState() !== DirectToState.TORANDOM) {
        this.createDirectToRandom(directIcao);
      }
    }

    const newActiveLegIndex = plan.activeLateralLeg - Utils.Clamp(plan.activeLateralLeg - segment.offset, 0, segment.legs.length);
    plan.setCalculatingLeg(newActiveLegIndex);
    plan.setLateralLeg(newActiveLegIndex);

    plan.removeSegment(segmentIndex, notify);
    plan.calculate(plan.activeLateralLeg - 1);
  }

  /**
   * Checks whether of two consecutive flight plan legs, the second is a duplicate of the first. The second leg is
   * considered a duplicate if and only if it is an IF, TF, or DF leg with the same terminator fix as the first leg,
   * which is also an IF, TF, or DF leg.
   * @param leg1 The first leg.
   * @param leg2 The second leg.
   * @returns whether the second leg is a duplicate of the first.
   */
  private isDuplicateLeg(leg1: FlightPlanLeg, leg2: FlightPlanLeg): boolean {
    if (
      leg2.type !== LegType.IF
      && leg2.type !== LegType.DF
      && leg2.type !== LegType.TF
      && leg2.type !== LegType.CF
    ) {
      return false;
    }

    const isLeg1TypeValidForDuplicate = leg1.type === LegType.IF
      || leg1.type === LegType.TF
      || leg1.type === LegType.DF
      || leg1.type === LegType.CF;

    if (!isLeg1TypeValidForDuplicate) {
      return false;
    }

    if (leg1.fixIcao === leg2.fixIcao) {
      return true;
    }

    const leg1Airport = leg1.fixIcaoStruct.airport;
    const leg2Airport = leg2.fixIcaoStruct.airport;

    if (leg1Airport.length > 0 && leg2Airport.length > 0 && leg1Airport !== leg2Airport) {
      return false;
    }

    if (leg1Airport.length > 0 && leg2Airport.length === 0 || leg2Airport.length > 0 && leg1Airport.length === 0) {
      if (leg1.fixIcaoStruct.region === leg2.fixIcaoStruct.region) {
        return leg1.fixIcaoStruct.ident === leg2.fixIcaoStruct.ident;
      }
    }

    return false;
  }

  /**
   * Checks whether of two consecutive flight plan legs, the second is an IF leg and is a duplicate of the first. The
   * IF leg is considered a duplicate if and only if its fix is the same as the fix at which the first leg terminates.
   * @param leg1 The first leg.
   * @param leg2 The second leg.
   * @returns whether the second leg is an duplicate IF leg of the first.
   */
  private isDuplicateIFLeg(leg1: FlightPlanLeg, leg2: FlightPlanLeg): boolean {
    if (leg2.type !== LegType.IF) {
      return false;
    }
    if (
      leg1.type !== LegType.TF
      && leg1.type !== LegType.DF
      && leg1.type !== LegType.RF
      && leg1.type !== LegType.CF
      && leg1.type !== LegType.AF
      && leg1.type !== LegType.IF
    ) {
      return false;
    }

    return ICAO.valueEquals(leg1.fixIcaoStruct, leg2.fixIcaoStruct);
  }

  /**
   * Merges two duplicate legs such that the new merged leg contains the fix type and altitude data from the source leg
   * and all other data is derived from the target leg.
   * @param target The target leg.
   * @param source The source leg.
   * @returns the merged leg.
   */
  private mergeDuplicateLegData(target: FlightPlanLeg, source: FlightPlanLeg): FlightPlanLeg {
    const merged = FlightPlan.createLeg(target);
    merged.fixTypeFlags |= source.fixTypeFlags;
    merged.altDesc = source.altDesc;
    merged.altitude1 = source.altitude1;
    merged.altitude2 = source.altitude2;
    return merged;
  }

  /**
   * Deletes one of two consecutive duplicate legs. If one leg is in a procedure and the other is not, the leg that is
   * not in a procedure will be deleted. If the legs are in different procedures, the earlier leg will be deleted.
   * Otherwise, the later leg will be deleted. If the deleted leg is the target leg of a direct to, the legs in the
   * direct to sequence will be copied and moved to immediately follow the duplicate leg that was not deleted.
   * @param leg1 The first duplicate leg.
   * @param leg2 The second duplicate leg.
   * @returns the leg that was deleted, or null if neither leg was deleted.
   * @throws Error if direct to legs could not be updated.
   */
  private planRemoveDuplicateLeg(leg1: LegDefinition, leg2: LegDefinition): LegDefinition | null {
    const plan = this.getFlightPlan();

    const leg1Segment = plan.getSegmentFromLeg(leg1);
    const leg1Index = plan.getLegIndexFromLeg(leg1);
    const leg2Segment = plan.getSegmentFromLeg(leg2);
    const leg2Index = plan.getLegIndexFromLeg(leg2);

    const prevLegIndex = leg1Index - 1;
    const prevLeg = plan.tryGetLeg(prevLegIndex);

    if (!leg1Segment || !leg2Segment) {
      return null;
    }

    const isLeg1DirectToLeg = BitFlags.isAll(leg1.flags, LegDefinitionFlags.DirectTo);
    const isLeg2DirectToLeg = BitFlags.isAll(leg2.flags, LegDefinitionFlags.DirectTo);
    const dupDirectToLeg = isLeg1DirectToLeg ? leg1
      : isLeg2DirectToLeg ? leg2
        : null;

    if (dupDirectToLeg) {
      if (dupDirectToLeg.leg.type === LegType.IF) {
        // Technically this should never happen.
        return null;
      } else {
        // If one of the duplicates is the second leg in a direct to sequence, then the true duplicated leg is the
        // target leg of the DTO. In this case, we call this method with the DTO target leg replacing the DTO leg.
        const dtoTargetLeg = plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
        return isLeg1DirectToLeg ? this.planRemoveDuplicateLeg(dtoTargetLeg, leg2) : this.planRemoveDuplicateLeg(leg1, dtoTargetLeg);
      }
    }

    const isLeg1InProc = leg1Segment.segmentType !== FlightPlanSegmentType.Enroute;
    const isLeg2InProc = leg2Segment.segmentType !== FlightPlanSegmentType.Enroute;
    const prevLegIsIntercept = prevLeg !== null && (prevLeg.leg.type === LegType.CI || prevLeg.leg.type === LegType.VI);

    let toDeleteSegment;
    let toDeleteIndex;
    let toDeleteLeg;
    if (
      prevLegIsIntercept
      || (!isLeg1InProc && isLeg2InProc)
      || (isLeg1InProc && isLeg2InProc && leg1Segment !== leg2Segment)
      || BitFlags.isAny(leg2.leg.fixTypeFlags, FixTypeFlags.FAF | FixTypeFlags.MAP)
    ) {
      toDeleteSegment = leg1Segment;
      toDeleteIndex = leg1Index - leg1Segment.offset;
      toDeleteLeg = leg1;
    } else {
      toDeleteSegment = leg2Segment;
      toDeleteIndex = leg2Index - leg2Segment.offset;

      //Merge data into first leg and replace
      const mergedLeg = this.mergeDuplicateLegData(leg1.leg, leg2.leg);
      const leg1SegmentLegIndex = leg1Index - leg1Segment.offset;
      plan.removeLeg(leg1Segment.segmentIndex, leg1SegmentLegIndex);
      plan.addLeg(leg1Segment.segmentIndex, mergedLeg, leg1SegmentLegIndex, leg2.flags);

      toDeleteLeg = leg2;
    }

    if (toDeleteIndex >= 0) {
      const dtoTargetLeg = plan.directToData.segmentIndex < 0 ? null : plan.getSegment(plan.directToData.segmentIndex).legs[plan.directToData.segmentLegIndex];
      const needMoveDtoLegs = toDeleteLeg === dtoTargetLeg;
      if (needMoveDtoLegs) {
        const isDtoExistingActive = this.getDirectToState() === DirectToState.TOEXISTING;

        // If the removed leg was the target leg of a DTO existing, we need to shift the DTO legs to target the leg
        // that was not removed.

        const oldDiscoLeg = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        const oldDtoLeg1 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);
        const oldDtoLeg2 = plan.removeLeg(plan.directToData.segmentIndex, plan.directToData.segmentLegIndex + 1);

        if (!oldDtoLeg1 || !oldDtoLeg2 || !oldDiscoLeg) {
          throw new Error(`Fms: Could not remove direct to legs starting at segment index ${plan.directToData.segmentIndex}, leg index ${plan.directToData.segmentLegIndex} during duplicate leg resolution.`);
        }

        const preservedLeg = toDeleteLeg === leg1 ? leg2 : leg1;
        const preservedLegIndex = plan.getLegIndexFromLeg(preservedLeg);

        const newTargetSegmentIndex = plan.getSegmentIndex(preservedLegIndex);
        const newTargetSegmentLegIndex = preservedLegIndex - plan.getSegment(newTargetSegmentIndex).offset;

        plan.setDirectToData(newTargetSegmentIndex, newTargetSegmentLegIndex);

        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDiscoLeg.leg), newTargetSegmentLegIndex + 1, LegDefinitionFlags.DirectTo);
        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg1.leg), newTargetSegmentLegIndex + 2, LegDefinitionFlags.DirectTo);
        plan.addLeg(newTargetSegmentIndex, FlightPlan.createLeg(oldDtoLeg2.leg), newTargetSegmentLegIndex + 3, LegDefinitionFlags.DirectTo);

        if (isDtoExistingActive) {
          const newActiveLegIndex = preservedLegIndex + FmsUtils.DTO_LEG_OFFSET;
          plan.setCalculatingLeg(newActiveLegIndex);
          plan.setLateralLeg(newActiveLegIndex);
        }
      }

      const success = this.planRemoveLeg(toDeleteSegment.segmentIndex, toDeleteIndex, true, false, needMoveDtoLegs);
      if (success) {
        return toDeleteLeg;
      }
    }

    return null;
  }

  /**
   * Cancels OBS and optionally converts the OBS course to a Direct-To.
   * @param convertToDto Whether to convert the OBS course to a Direct-To.
   * @returns The net number of legs inserted into the active flight plan as a result of converting the OBS course to
   * a Direct-To.
   */
  private cancelObs(convertToDto: boolean): number {
    if (!this.isObsActive.get()) {
      return 0;
    }

    SimVar.SetSimVarValue(this.needConvertObsToDtoSimVar, SimVarValueType.Bool, false);
    if (this.useSimObsState) {
      SimVar.SetSimVarValue('K:GPS_OBS_OFF', SimVarValueType.Number, 0);
    } else {
      this.publisher.pub(this.obsControlTopicMap['lnav_obs_set_active'], false, true, false);
    }

    if (convertToDto) {
      return this.convertObsToDirectTo();
    } else {
      return 0;
    }
  }

  /**
   * Converts an OBS course to a Direct-To. The OBS's target leg is assumed to be the currently active flight plan leg.
   * @returns The net number of legs inserted into the active flight plan as a result of converting the OBS course to
   * a Direct-To.
   */
  private convertObsToDirectTo(): number {
    const obsCourse = this.obsCourse.get();
    const dtoState = this.getDirectToState();

    if (dtoState === DirectToState.TORANDOM) {
      // Just replace the DTO random with one with a custom course
      const dtoTargetIcao = this.getDirectToTargetIcao();
      this.createDirectToRandom(dtoTargetIcao as string, obsCourse);
      return 0;
    } else if (dtoState === DirectToState.TOEXISTING) {
      const dtoData = this.getPrimaryFlightPlan().directToData;
      this.createDirectToExisting(dtoData.segmentIndex, dtoData.segmentLegIndex, obsCourse);
      return 0;
    } else {
      const plan = this.getPrimaryFlightPlan();
      const segmentIndex = plan.getSegmentIndex(plan.activeLateralLeg);
      const segmentLegIndex = plan.getSegmentLegIndex(plan.activeLateralLeg);
      if (segmentIndex >= 0 && segmentLegIndex >= 0) {
        const didDtoExist = plan.directToData.segmentIndex >= 0 && plan.directToData.segmentLegIndex >= 0;
        this.createDirectToExisting(segmentIndex, segmentLegIndex, obsCourse);
        return didDtoExist ? 0 : FmsUtils.DTO_LEG_OFFSET;
      } else {
        return 0;
      }
    }
  }

  /**
   * Loads an approach frequency into a NAV radio.
   * @param radioIndex The index of the NAV radio into which to load the frequency.
   */
  private setLocFrequency(radioIndex: NavRadioIndex): void {
    const approachReferenceFac = this.approachDetails.get().referenceFacility;

    if (!approachReferenceFac) {
      return;
    }

    const activeFreqKhz = Math.round(this.navActiveFreqs[radioIndex].get() * 1000);
    const referenceFacFreqKhz = Math.round(approachReferenceFac.freqMHz * 1000);

    if (activeFreqKhz === referenceFacFreqKhz) {
      return;
    }

    const setActive = this.cdiSource.type === NavSourceType.Gps || this.cdiSource.index !== radioIndex;

    SimVar.SetSimVarValue(`K:NAV${radioIndex}_STBY_SET_HZ`, 'Hz', referenceFacFreqKhz * 1000);
    if (setActive) {
      SimVar.SetSimVarValue(`K:NAV${radioIndex}_RADIO_SWAP`, 'Bool', 1);
    }
  }

  /**
   * Sets the approach details for the loaded approach and sends an event across the bus.
   * @param sync Whether to sync the details to other instruments.
   * @param isLoaded Whether an approach is loaded.
   * @param type The approach type.
   * @param bestRnavType The best available approach RNAV type.
   * @param rnavTypeFlags The RNAV minimum type flags for the approach.
   * @param isCircling Whether the approach is a circling approach.
   * @param isVtf Whether the approach is a vectors-to-final approach.
   * @param referenceFacility The approach's reference facility.
   * @param runway The assigned runway for the approach
   */
  private setApproachDetails(
    sync: boolean,
    isLoaded?: boolean,
    type?: GarminApproachType,
    bestRnavType?: RnavTypeFlags,
    rnavTypeFlags?: RnavTypeFlags,
    isCircling?: boolean,
    isVtf?: boolean,
    referenceFacility?: VorFacility | null,
    runway?: OneWayRunway | null
  ): void {
    isLoaded !== undefined && this.approachDetails.set('isLoaded', isLoaded);
    type !== undefined && this.approachDetails.set('type', type);
    bestRnavType !== undefined && this.approachDetails.set('bestRnavType', bestRnavType);
    rnavTypeFlags !== undefined && this.approachDetails.set('rnavTypeFlags', rnavTypeFlags);
    isCircling !== undefined && this.approachDetails.set('isCircling', isCircling);
    isVtf !== undefined && this.approachDetails.set('isVtf', isVtf);
    referenceFacility !== undefined && this.approachDetails.set('referenceFacility', referenceFacility);
    runway !== undefined && this.approachDetails.set('runway', runway);

    const approachDetails = this.approachDetails.get();

    // If an approach is flagged as RNAV but has no defined RNAV minima, assume it is an RNP (AR) approach if it is not circling.
    this.approachDetails.set('isRnpAr', approachDetails.type === ApproachType.APPROACH_TYPE_RNAV && approachDetails.bestRnavType === 0 && !approachDetails.isCircling);

    if (this.needPublishApproachDetails) {
      this.needPublishApproachDetails = false;

      this.publisher.pub(this.fmsTopicMap['fms_approach_details'], Object.assign({}, approachDetails), false, true);
      this.publisher.pub(this.fmsTopicMap['fms_approach_details_sync'], approachDetails, sync, false);
    }
  }

  /**
   * Checks whether the approach details indicate that vertical guidance (GP) can be supported.
   * @returns whether or not vertical guidance is supported.
   */
  private doesApproachSupportGp(): boolean {
    const approachDetails = this.approachDetails.get();

    if (approachDetails.isLoaded && !approachDetails.isCircling && this.flightPhase.get().isApproachActive) {
      switch (approachDetails.type) {
        case ApproachType.APPROACH_TYPE_GPS:
        case ApproachType.APPROACH_TYPE_RNAV:
        case AdditionalApproachType.APPROACH_TYPE_VISUAL:
          return true;
      }
    }
    return false;
  }

  /**
   * Sets the approach details when an approach_details_set event is received from the bus.
   * @param approachDetails The approachDetails received from the bus.
   */
  private onApproachDetailsSet(approachDetails: Readonly<ApproachDetails>): void {
    // If the event came from this Fms, then the objects will be equal by reference, so we only bother setting the
    // object if they are different.
    if (approachDetails !== this.approachDetails.get()) {
      this.approachDetails.set(approachDetails);

      if (this.needPublishApproachDetails) {
        this.needPublishApproachDetails = false;

        this.publisher.pub(this.fmsTopicMap['fms_approach_details'], Object.assign({}, this.approachDetails.get()), false, true);
      }
    }
  }
}
