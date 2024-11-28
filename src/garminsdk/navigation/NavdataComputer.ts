import {
  ActiveLegType, AdditionalApproachType, AirportFacility, AirportFacilityDataFlags, BaseVNavDataEvents, BitFlags,
  ClockEvents, ConsumerValue, ControlEvents, EventBus, FacilityLoader, FacilityType, FixTypeFlags, FlightPathUtils,
  FlightPathVector, FlightPathVectorFlags, FlightPlanActiveLegEvent, FlightPlanLegEvent, FlightPlanner,
  FlightPlanOriginDestEvent, FlightPlanSegment, FlightPlanSegmentEvent, FlightPlanSegmentType, FlightPlanUtils,
  GeoCircle, GeoPoint, GeoPointInterface, GNSSEvents, ICAO, IcaoValue, LegCalculations, LegDefinition,
  LegDefinitionFlags, LegType, LNavControlEvents, LNavEvents, LNavObsEvents, LNavTransitionMode, LNavUtils, MagVar,
  MathUtils, NavEvents, NavMath, ObjectSubject, OriginDestChangeType, Publisher, RnavTypeFlags, RunwayUtils, Subject,
  Subscribable, SubscribableUtils, UnitType, Vec3Math, VNavDataEvents, VNavEvents, VNavUtils, VorToFrom
} from '@microsoft/msfs-sdk';

import { GlidepathServiceLevel } from '../autopilot/vnav/GarminVNavTypes';
import { ApproachDetails, FmsEvents, FmsUtils } from '../flightplan';
import { BaseLNavDataEvents, CDIScaleLabel, LNavDataEvents } from './LNavDataEvents';

/**
 * Configuration options for {@link NavdataComputer}.
 */
export type NavdataComputerOptions = {
  /** The index of the LNAV computer from which to source data. Defaults to `0`. */
  lnavIndex?: number;

  /**
   * Whether to use the sim's native OBS state. If `true`, then the sim's OBS state as exposed through the event bus
   * topics defined in `NavEvents` will be used. If `false`, then the OBS state exposed through the event bus topics
   * defined in `LNavObsEvents` will be used. Defaults to `true`.
   */
  useSimObsState?: boolean;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;

  /** Whether to use VFR instead of IFR CDI scaling logic. Defaults to `false`. */
  useVfrCdiScaling?: boolean | Subscribable<boolean>;
};

/**
 * A publisher of an LNAV data event bus topic.
 */
class LNavDataTopicPublisher<T extends keyof BaseLNavDataEvents> {
  /** The topic name to which this publisher publishes. */
  public topic: T | `${T}_${number}`;

  /** The value of this publisher's topic data. */
  public value: BaseLNavDataEvents[T];

  private readonly equalityFunc: (a: BaseLNavDataEvents[T], b: BaseLNavDataEvents[T]) => boolean;

  /**
   * Creates a new instance of LNavDataTopicPublisher.
   * @param publisher The publisher to use to publish this entry's topic.
   * @param topic The topic name.
   * @param initialValue The topic's initial value.
   * @param equalityFunc A function that checks whether two values are equal. If not defined, then the publisher will
   * use the strict equality operator (`===`) to determine whether two values are equal.
   */
  public constructor(
    private readonly publisher: Publisher<LNavDataEvents>, topic: T | `${T}_${number}`,
    initialValue: BaseLNavDataEvents[T],
    equalityFunc?: (a: BaseLNavDataEvents[T], b: BaseLNavDataEvents[T]) => boolean
  ) {
    this.topic = topic;
    this.value = initialValue;

    this.equalityFunc = equalityFunc ?? ((a, b) => a === b);
  }

  /**
   * Publishes a value to this publisher's topic. The value will be published if and only if it is not equal to this
   * publisher's existing value or if a republish is requested.
   * @param value The value to publish to the topic. If not defined, then the current value will be republished.
   */
  public publish(value?: BaseLNavDataEvents[T]): void {
    if (value === undefined || !this.equalityFunc(value, this.value)) {
      if (value !== undefined) {
        (this.value as BaseLNavDataEvents[T]) = value;
      }

      this.publisher.pub(this.topic, this.value as any, true, true);
    }
  }
}

/**
 * Computes Garmin LNAV-related data.
 */
export class NavdataComputer {
  private static readonly GLIDEPATH_ANGULAR_SCALE = 0.8; // degrees
  private static readonly GLIDEPATH_SCALE_TAN = Math.tan(NavdataComputer.GLIDEPATH_ANGULAR_SCALE * Avionics.Utils.DEG2RAD);

  private readonly geoPointCache = [new GeoPoint(0, 0)];

  private readonly publisher = this.bus.getPublisher<LNavDataEvents & VNavDataEvents>();

  /** The index of the LNAV computer from which this computer sources data. */
  public readonly lnavIndex: number;

  private readonly useSimObsState: boolean;

  private readonly eventBusTopicPublishers: {
    [P in keyof BaseLNavDataEvents]: LNavDataTopicPublisher<P>;
  };

  private readonly vnavIndex: Subscribable<number>;
  private isVNavIndexValid = false;

  private readonly vnavTopicMap: {
    [P in Extract<keyof BaseVNavDataEvents, 'gp_gsi_scaling'>]: P | `${P}_${number}`
  } = {
      'gp_gsi_scaling': 'gp_gsi_scaling'
    };

  private readonly useVfrCdiScaling: Subscribable<boolean>;

  private readonly planePos = new GeoPoint(0, 0);
  private readonly magVar: ConsumerValue<number>;
  private readonly isObsActive: ConsumerValue<boolean>;

  private readonly obsAvailable = Subject.create<boolean>(false);
  private approachDetails: Readonly<ApproachDetails> = {
    isLoaded: false,
    type: ApproachType.APPROACH_TYPE_UNKNOWN,
    isRnpAr: false,
    bestRnavType: RnavTypeFlags.None,
    rnavTypeFlags: RnavTypeFlags.None,
    isCircling: false,
    isVtf: false,
    referenceFacility: null,
    runway: null
  };

  private readonly lnavIsTracking: ConsumerValue<boolean>;
  private readonly lnavLegIndex: ConsumerValue<number>;
  private readonly lnavVectorIndex: ConsumerValue<number>;
  private readonly lnavTransitionMode: ConsumerValue<LNavTransitionMode>;
  private readonly lnavIsSuspended: ConsumerValue<boolean>;
  private readonly lnavDtk: ConsumerValue<number>;
  private readonly lnavXtk: ConsumerValue<number>;
  private readonly lnavLegDistanceAlong: ConsumerValue<number>;
  private readonly lnavLegDistanceRemaining: ConsumerValue<number>;

  private readonly isMaprActive: ConsumerValue<boolean>;

  private readonly gpServiceLevel = ConsumerValue.create(null, GlidepathServiceLevel.None);
  private readonly gpDistance = ConsumerValue.create(null, 0);

  private readonly vnavData = ObjectSubject.create({
    gpScale: 0
  });

  private readonly nominalPathCircle = { vectorIndex: -1, circle: new GeoCircle(Vec3Math.create(), 0) };

  private primaryPlanOriginFacility?: AirportFacility;
  private primaryPlanDestinationFacility?: AirportFacility;

  private needUpdateDestination = true;
  private destinationPlanIndex?: number;
  private destinationIcao?: IcaoValue;
  private destinationFacility?: AirportFacility;
  private destinationLeg?: LegDefinition;

  /**
   * Creates a new instance of the NavdataComputer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param facilityLoader The facility loader to use with this instance.
   * @param options Options with which to configure the computer.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly facilityLoader: FacilityLoader,
    options?: Readonly<NavdataComputerOptions>
  ) {
    this.lnavIndex = options?.lnavIndex ?? 0;

    if (!LNavUtils.isValidLNavIndex(this.lnavIndex)) {
      throw new Error(`NavdataComputer: invalid LNAV index (${this.lnavIndex}) specified (must be a non-negative integer)`);
    }

    this.useSimObsState = options?.useSimObsState ?? true;

    this.vnavIndex = SubscribableUtils.toSubscribable(options?.vnavIndex ?? 0, true);

    this.useVfrCdiScaling = SubscribableUtils.toSubscribable(options?.useVfrCdiScaling ?? false, true);

    const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.lnavIndex);
    this.eventBusTopicPublishers = {
      'lnavdata_dtk_true': new LNavDataTopicPublisher<'lnavdata_dtk_true'>(this.publisher, `lnavdata_dtk_true${lnavTopicSuffix}`, 0),
      'lnavdata_dtk_mag': new LNavDataTopicPublisher<'lnavdata_dtk_mag'>(this.publisher, `lnavdata_dtk_mag${lnavTopicSuffix}`, 0),
      'lnavdata_xtk': new LNavDataTopicPublisher<'lnavdata_xtk'>(this.publisher, `lnavdata_xtk${lnavTopicSuffix}`, 0),
      'lnavdata_next_dtk_true': new LNavDataTopicPublisher<'lnavdata_next_dtk_true'>(this.publisher, `lnavdata_next_dtk_true${lnavTopicSuffix}`, 0),
      'lnavdata_next_dtk_mag': new LNavDataTopicPublisher<'lnavdata_next_dtk_mag'>(this.publisher, `lnavdata_next_dtk_mag${lnavTopicSuffix}`, 0),
      'lnavdata_cdi_scale': new LNavDataTopicPublisher<'lnavdata_cdi_scale'>(this.publisher, `lnavdata_cdi_scale${lnavTopicSuffix}`, 0),
      'lnavdata_cdi_scale_label': new LNavDataTopicPublisher<'lnavdata_cdi_scale_label'>(this.publisher, `lnavdata_cdi_scale_label${lnavTopicSuffix}`, CDIScaleLabel.Enroute),
      'lnavdata_waypoint_bearing_true': new LNavDataTopicPublisher<'lnavdata_waypoint_bearing_true'>(this.publisher, `lnavdata_waypoint_bearing_true${lnavTopicSuffix}`, 0),
      'lnavdata_waypoint_bearing_mag': new LNavDataTopicPublisher<'lnavdata_waypoint_bearing_mag'>(this.publisher, `lnavdata_waypoint_bearing_mag${lnavTopicSuffix}`, 0),
      'lnavdata_waypoint_distance': new LNavDataTopicPublisher<'lnavdata_waypoint_distance'>(this.publisher, `lnavdata_waypoint_distance${lnavTopicSuffix}`, 0),
      'lnavdata_waypoint_ident': new LNavDataTopicPublisher<'lnavdata_waypoint_ident'>(this.publisher, `lnavdata_waypoint_ident${lnavTopicSuffix}`, ''),
      'lnavdata_destination_distance': new LNavDataTopicPublisher<'lnavdata_destination_distance'>(this.publisher, `lnavdata_destination_distance${lnavTopicSuffix}`, -1),
      'lnavdata_destination_icao': new LNavDataTopicPublisher<'lnavdata_destination_icao'>(
        this.publisher,
        `lnavdata_destination_icao${lnavTopicSuffix}`,
        ICAO.emptyValue(),
        ICAO.valueEquals
      ),
      'lnavdata_destination_ident': new LNavDataTopicPublisher<'lnavdata_destination_ident'>(this.publisher, `lnavdata_destination_ident${lnavTopicSuffix}`, ''),
      'lnavdata_destination_runway_icao': new LNavDataTopicPublisher<'lnavdata_destination_runway_icao'>(
        this.publisher,
        `lnavdata_destination_runway_icao${lnavTopicSuffix}`,
        ICAO.emptyValue(),
        ICAO.valueEquals
      ),
      'lnavdata_egress_distance': new LNavDataTopicPublisher<'lnavdata_egress_distance'>(this.publisher, `lnavdata_egress_distance${lnavTopicSuffix}`, 0),
      'lnavdata_tofrom': new LNavDataTopicPublisher<'lnavdata_tofrom'>(this.publisher, `lnavdata_tofrom${lnavTopicSuffix}`, VorToFrom.OFF),
      'lnavdata_dtk_vector': new LNavDataTopicPublisher<'lnavdata_dtk_vector'>(this.publisher, `lnavdata_dtk_vector${lnavTopicSuffix}`, { globalLegIndex: -1, vectorIndex: -1 }),
      'lnavdata_next_dtk_vector': new LNavDataTopicPublisher<'lnavdata_next_dtk_vector'>(this.publisher, `lnavdata_next_dtk_vector${lnavTopicSuffix}`, { globalLegIndex: -1, vectorIndex: -1 }),
      'obs_available': new LNavDataTopicPublisher<'obs_available'>(this.publisher, `obs_available${lnavTopicSuffix}`, false),
    };

    const sub = this.bus.getSubscriber<
      GNSSEvents & NavEvents & LNavEvents & LNavObsEvents & LNavControlEvents & VNavEvents & VNavDataEvents
      & FmsEvents & ClockEvents & ControlEvents
    >();

    this.magVar = ConsumerValue.create(sub.on('magvar'), 0);
    this.isObsActive = ConsumerValue.create(sub.on(this.useSimObsState ? 'gps_obs_active' : `lnav_obs_active${lnavTopicSuffix}`), false);

    this.lnavIsTracking = ConsumerValue.create(sub.on(`lnav_is_tracking${lnavTopicSuffix}`), false);
    this.lnavLegIndex = ConsumerValue.create(sub.on(`lnav_tracked_leg_index${lnavTopicSuffix}`), 0);
    this.lnavVectorIndex = ConsumerValue.create(sub.on(`lnav_tracked_vector_index${lnavTopicSuffix}`), 0);
    this.lnavTransitionMode = ConsumerValue.create(sub.on(`lnav_transition_mode${lnavTopicSuffix}`), LNavTransitionMode.None);
    this.lnavIsSuspended = ConsumerValue.create(sub.on(`lnav_is_suspended${lnavTopicSuffix}`), false);
    this.lnavDtk = ConsumerValue.create(sub.on(`lnav_dtk${lnavTopicSuffix}`), 0);
    this.lnavXtk = ConsumerValue.create(sub.on(`lnav_xtk${lnavTopicSuffix}`), 0);
    this.lnavLegDistanceAlong = ConsumerValue.create(sub.on(`lnav_leg_distance_along${lnavTopicSuffix}`), 0);
    this.lnavLegDistanceRemaining = ConsumerValue.create(sub.on(`lnav_leg_distance_remaining${lnavTopicSuffix}`), 0);
    this.isMaprActive = ConsumerValue.create(sub.on(`activate_missed_approach${lnavTopicSuffix}`), false);

    const vnavDataSub = this.vnavData.sub((obj, key, value) => {
      switch (key) {
        case 'gpScale': this.publisher.pub(this.vnavTopicMap['gp_gsi_scaling'], value as number, true, true); break;
      }
    }, false, true);

    this.vnavIndex.sub(vnavIndex => {
      this.isVNavIndexValid = VNavUtils.isValidVNavIndex(vnavIndex);
      if (this.isVNavIndexValid) {
        const suffix = VNavUtils.getEventBusTopicSuffix(vnavIndex);
        this.gpServiceLevel.setConsumer(sub.on(`gp_service_level${suffix}`));
        this.gpDistance.setConsumer(sub.on(`gp_distance${suffix}`));

        this.vnavTopicMap['gp_gsi_scaling'] = `gp_gsi_scaling${suffix}`;

        vnavDataSub.resume(true);
      } else {
        vnavDataSub.pause();

        this.gpServiceLevel.setConsumer(null);
        this.gpDistance.setConsumer(null);
      }
    }, true);

    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });

    this.flightPlanner.onEvent('fplOriginDestChanged').handle(this.onOriginDestChanged.bind(this));
    this.flightPlanner.onEvent('fplSegmentChange').handle(() => this.onSegmentChanged.bind(this));
    this.flightPlanner.onEvent('fplLegChange').handle(this.onLegChanged.bind(this));
    this.flightPlanner.onEvent('fplIndexChanged').handle(this.onActivePlanChanged.bind(this));
    this.flightPlanner.onEvent('fplActiveLegChange').handle(this.onActiveLegChanged.bind(this));

    FmsUtils.onFmsEvent(this.flightPlanner.id, sub, 'fms_approach_details').handle(d => { this.approachDetails = d; });

    sub.on('realTime').handle(() => {
      this.computeTrackingData();
      this.computeCdiScaling();
      this.computeGpScaling();
    });

    this.republishEventBusTopics();

    this.obsAvailable.sub(v => {
      this.eventBusTopicPublishers['obs_available'].publish(v);
    });
  }

  /**
   * Immediately republishes all event bus topics with their current values.
   */
  private republishEventBusTopics(): void {
    for (const topic in this.eventBusTopicPublishers) {
      this.eventBusTopicPublishers[topic as keyof BaseLNavDataEvents].publish();
    }
  }

  /**
   * Responds to when a flight plan origin or destination changes.
   * @param event The event data describing the change.
   */
  private onOriginDestChanged(event: FlightPlanOriginDestEvent): void {
    if (event.planIndex !== FmsUtils.PRIMARY_PLAN_INDEX) {
      return;
    }

    if (event.airport !== undefined) {
      if (event.type === OriginDestChangeType.OriginAdded) {
        this.updatePrimaryPlanOriginFacility(event.airport);
      } else {
        this.updatePrimaryPlanDestinationFacility(event.airport);
      }
    } else {
      if (event.type === OriginDestChangeType.OriginRemoved) {
        this.updatePrimaryPlanOriginFacility(undefined);
      } else {
        this.updatePrimaryPlanDestinationFacility(undefined);
      }
    }

    if (event.type === OriginDestChangeType.DestinationAdded || event.type === OriginDestChangeType.DestinationRemoved) {
      this.needUpdateDestination = true;
    }
  }

  /**
   * Responds to when a flight plan segment changes.
   * @param event The event data describing the change.
   */
  private onSegmentChanged(event: FlightPlanSegmentEvent): void {
    if (
      event.planIndex === FmsUtils.PRIMARY_PLAN_INDEX
      || (event.planIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX && this.flightPlanner.activePlanIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX)
    ) {
      this.needUpdateDestination = true;
    }
  }

  /**
   * Responds to when a flight plan leg changes.
   * @param event The event data describing the change.
   */
  private onLegChanged(event: FlightPlanLegEvent): void {
    if (
      event.planIndex === FmsUtils.PRIMARY_PLAN_INDEX
      || (event.planIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX && this.flightPlanner.activePlanIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX)
    ) {
      this.needUpdateDestination = true;
    }
  }

  /**
   * Responds to when the active flight plan changes.
   */
  private onActivePlanChanged(): void {
    this.needUpdateDestination = true;
  }

  /**
   * Responds to when a flight plan active leg changes.
   * @param event The event data describing the change.
   */
  private onActiveLegChanged(event: FlightPlanActiveLegEvent): void {
    if (event.type === ActiveLegType.Lateral) {
      if (event.planIndex === FmsUtils.PRIMARY_PLAN_INDEX) {
        this.needUpdateDestination = true;
      }
    }
  }

  private primaryPlanOriginFacilityOpId = 0;

  /**
   * Updates the primary flight plan's origin airport facility.
   * @param icao The ICAO of the origin airport facility, or `undefined` if there is no origin airport.
   */
  private async updatePrimaryPlanOriginFacility(icao: string | undefined): Promise<void> {
    const opId = ++this.primaryPlanOriginFacilityOpId;

    if (icao === undefined) {
      this.primaryPlanOriginFacility = undefined;
      return;
    }

    const facility = await this.facilityLoader.getFacility(FacilityType.Airport, icao);

    if (opId !== this.primaryPlanOriginFacilityOpId) {
      return;
    }

    this.primaryPlanOriginFacility = facility;
  }

  private primaryPlanDestinationFacilityOpId = 0;

  /**
   * Updates the primary flight plan's destination airport facility.
   * @param icao The ICAO of the destination airport facility, or `undefined` if there is no destination airport.
   */
  private async updatePrimaryPlanDestinationFacility(icao: string | undefined): Promise<void> {
    const opId = ++this.primaryPlanDestinationFacilityOpId;

    if (icao === undefined) {
      this.primaryPlanDestinationFacility = undefined;
      return;
    }

    const facility = await this.facilityLoader.getFacility(FacilityType.Airport, icao);

    if (opId !== this.primaryPlanDestinationFacilityOpId) {
      return;
    }

    this.primaryPlanDestinationFacility = facility;
  }

  /**
   * Computes the nav tracking data, such as XTK, DTK, and distance to turn.
   */
  private computeTrackingData(): void {
    const magVar = this.magVar.get();

    let xtk = 0;
    let dtkLegIndex = -1;
    let dtkVectorIndex = -1;
    let dtkTrue = 0;
    let dtkMag = 0;
    let nextDtkLegIndex = -1;
    let nextDtkVectorIndex = -1;
    let nextDtkTrue = 0;
    let nextDtkMag = 0;
    let distance = 0;
    let waypointBearingTrue = 0;
    let waypointBearingMag = 0;
    let waypointIdent = '';
    let egressDistance = 0;
    let destinationDistance = -1;
    let toFrom = VorToFrom.OFF;

    const activePlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;

    this.updateObsAvailable(activePlan ? activePlan.tryGetLeg(activePlan.activeLateralLeg) : null);

    if (this.needUpdateDestination) {
      this.updateDestination();
      this.needUpdateDestination = false;
    }

    if (this.lnavIsTracking.get()) {
      const isSuspended = this.lnavIsSuspended.get();
      const trackedLegIndex = this.lnavLegIndex.get();
      const nextLegIndex = trackedLegIndex + 1;

      const currentLeg = activePlan && trackedLegIndex >= 0 && trackedLegIndex < activePlan.length ? activePlan.getLeg(trackedLegIndex) : undefined;
      const nextLeg = activePlan && nextLegIndex >= 0 && nextLegIndex < activePlan.length ? activePlan.getLeg(nextLegIndex) : undefined;

      if (currentLeg?.calculated) {
        distance = this.getActiveDistance(currentLeg, this.planePos);
        destinationDistance = this.getDestinationDistance(trackedLegIndex, distance);
        waypointIdent = currentLeg.name ?? '';

        if (currentLeg.calculated.endLat !== undefined && currentLeg.calculated.endLon) {
          waypointBearingTrue = this.planePos.bearingTo(currentLeg.calculated.endLat, currentLeg.calculated.endLon);
          waypointBearingMag = MagVar.trueToMagnetic(waypointBearingTrue, magVar);
        }
      }

      // Next DTK is only valid if we are actually going to sequence into the next leg, so we have to make sure LNAV is not suspended
      // and won't go into suspend at the end of the leg.
      if (
        nextLeg !== undefined
        && nextLeg.calculated?.startLat !== undefined && nextLeg.calculated?.startLon !== undefined
        && !isSuspended
        && nextLeg.leg.type !== LegType.Discontinuity
        && (!BitFlags.isAny(nextLeg.flags, LegDefinitionFlags.MissedApproach) || this.isMaprActive.get())
      ) {
        const result = this.getNominalPathCircle(nextLeg, 0, LNavTransitionMode.Ingress, this.nominalPathCircle);
        if (result.vectorIndex >= 0) {
          nextDtkLegIndex = nextLegIndex;
          nextDtkVectorIndex = result.vectorIndex;
          nextDtkTrue = result.circle.bearingAt(this.geoPointCache[0].set(nextLeg.calculated.startLat, nextLeg.calculated.startLon), Math.PI);
          nextDtkMag = MagVar.trueToMagnetic(nextDtkTrue, nextLeg.calculated.startLat, nextLeg.calculated.startLon);
        }
      }

      if (this.isObsActive.get()) {
        xtk = this.lnavXtk.get();
        dtkLegIndex = trackedLegIndex;
        dtkVectorIndex = -1;
        dtkTrue = this.lnavDtk.get();
        dtkMag = MagVar.trueToMagnetic(dtkTrue, magVar);
        egressDistance = this.lnavLegDistanceRemaining.get();
        toFrom = egressDistance < 0 ? VorToFrom.FROM : VorToFrom.TO;
      } else {
        const transitionMode = this.lnavTransitionMode.get();

        let dtkVector: FlightPathVector | undefined;
        let circle: GeoCircle | undefined;
        if (transitionMode === LNavTransitionMode.Egress && nextLeg?.calculated?.flightPath.length) {
          const result = this.getNominalPathCircle(nextLeg, 0, LNavTransitionMode.Ingress, this.nominalPathCircle);
          if (result.vectorIndex >= 0) {
            dtkLegIndex = nextLegIndex;
            dtkVectorIndex = result.vectorIndex;
            dtkVector = nextLeg.calculated.flightPath[dtkVectorIndex];
            circle = result.circle;
          }

          egressDistance = UnitType.METER.convertTo(nextLeg.calculated.distanceWithTransitions, UnitType.NMILE) - NavdataComputer.getEgressDistance(nextLeg)
            + this.lnavLegDistanceRemaining.get();
        } else if (currentLeg?.calculated?.flightPath.length) {
          const vectorIndex = this.lnavVectorIndex.get();

          const result = this.getNominalPathCircle(currentLeg, vectorIndex, transitionMode, this.nominalPathCircle);
          if (result.vectorIndex >= 0) {
            dtkLegIndex = trackedLegIndex;
            dtkVectorIndex = result.vectorIndex;
            dtkVector = currentLeg.calculated.flightPath[dtkVectorIndex];
            circle = result.circle;
          }

          if (FlightPlanUtils.isManualDiscontinuityLeg(currentLeg.leg.type)) {
            // MANSEQ legs aren't supposed to have an "end", so set egress distance to an arbitrarily large value.
            egressDistance = Number.MAX_SAFE_INTEGER;
          } else {
            egressDistance = this.lnavLegDistanceRemaining.get() - (
              // Distance remaining published by LNAV does not include egress if suspend is active
              isSuspended ? 0 : NavdataComputer.getEgressDistance(currentLeg)
            );
          }
        }

        if (circle !== undefined) {
          xtk = UnitType.GA_RADIAN.convertTo(circle.distance(this.planePos), UnitType.NMILE);
          dtkTrue = circle.bearingAt(this.planePos, Math.PI);
          dtkMag = MagVar.trueToMagnetic(dtkTrue, magVar);

          const dtkLeg = dtkLegIndex === nextLegIndex ? nextLeg! : currentLeg!;
          switch (dtkLeg.leg.type) {
            case LegType.AF:
            case LegType.RF:
              toFrom = this.lnavLegDistanceRemaining.get() < 0 ? VorToFrom.FROM : VorToFrom.TO;
              break;
            default:
              if (dtkVector && circle) {
                if (circle.isGreatCircle()) {
                  const angleAlong = circle.angleAlong(this.planePos, this.geoPointCache[0].set(dtkVector.endLat, dtkVector.endLon), Math.PI);
                  toFrom = angleAlong > Math.PI ? VorToFrom.FROM : VorToFrom.TO;
                } else {
                  toFrom = this.lnavLegDistanceRemaining.get() < 0 ? VorToFrom.FROM : VorToFrom.TO;
                }
              }
          }
        }
      }
    }

    this.eventBusTopicPublishers['lnavdata_dtk_true'].publish(dtkTrue);
    this.eventBusTopicPublishers['lnavdata_dtk_mag'].publish(dtkMag);
    this.eventBusTopicPublishers['lnavdata_xtk'].publish(xtk);
    this.eventBusTopicPublishers['lnavdata_next_dtk_true'].publish(nextDtkTrue);
    this.eventBusTopicPublishers['lnavdata_next_dtk_mag'].publish(nextDtkMag);
    this.eventBusTopicPublishers['lnavdata_waypoint_bearing_true'].publish(waypointBearingTrue);
    this.eventBusTopicPublishers['lnavdata_waypoint_bearing_mag'].publish(waypointBearingMag);
    this.eventBusTopicPublishers['lnavdata_waypoint_distance'].publish(distance);
    this.eventBusTopicPublishers['lnavdata_waypoint_ident'].publish(waypointIdent);
    this.eventBusTopicPublishers['lnavdata_destination_distance'].publish(destinationDistance);

    this.updateDtkVector('lnavdata_dtk_vector', dtkLegIndex, dtkVectorIndex);
    this.updateDtkVector('lnavdata_next_dtk_vector', nextDtkLegIndex, nextDtkVectorIndex);

    this.eventBusTopicPublishers['lnavdata_tofrom'].publish(toFrom);
    this.eventBusTopicPublishers['lnavdata_egress_distance'].publish(egressDistance);
  }

  /**
   * Updates the LNAV destination airport.
   */
  private updateDestination(): void {
    let destinationPlanIndex: number | undefined = undefined;
    let destinationIcao: IcaoValue | undefined = undefined;
    let destinationRunwayIcao: IcaoValue | undefined = undefined;
    let destinationLeg: LegDefinition | undefined = undefined;

    const primaryPlan = this.flightPlanner.hasFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX) ? this.flightPlanner.getFlightPlan(FmsUtils.PRIMARY_PLAN_INDEX) : undefined;

    if (primaryPlan) {
      if (primaryPlan.destinationAirportIcao) {
        // If the primary flight plan has a destination airport, then it is always the LNAV destination.
        destinationPlanIndex = FmsUtils.PRIMARY_PLAN_INDEX;
        destinationIcao = primaryPlan.destinationAirportIcao;

        destinationRunwayIcao = primaryPlan.procedureDetails.destinationRunway
          ? RunwayUtils.getRunwayFacilityIcaoValue(destinationIcao, primaryPlan.procedureDetails.destinationRunway)
          : undefined;

        for (const leg of primaryPlan.legs(true)) {
          if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
            destinationLeg = leg;
            break;
          }
        }
      } else {
        // Find the last airport in the primary flight plan that we have not yet sequenced.
        let legIndex = primaryPlan.activeLateralLeg - 1;
        for (const leg of primaryPlan.legs(true, undefined, primaryPlan.activeLateralLeg - 1)) {
          if (BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
            // Skip all missed approach legs.
            continue;
          } else if (legIndex === 0 && primaryPlan.getSegmentFromLeg(leg)?.segmentType === FlightPlanSegmentType.Departure) {
            // Skip the first leg of the flight plan if it is in the departure segment. This prevents us from selecting
            // the origin airport.
            break;
          }

          if (ICAO.isValueFacility(leg.leg.fixIcaoStruct, FacilityType.Airport)) {
            destinationPlanIndex = FmsUtils.PRIMARY_PLAN_INDEX;
            destinationIcao = leg.leg.fixIcaoStruct;
            destinationLeg = leg;
            break;
          }

          legIndex--;
        }
      }
    }

    if (destinationIcao === undefined) {
      // If we can't find a destination in the primary flight plan, then check to see if we are on an off-route DTO
      // to an airport.
      const dtoRandomPlan = this.flightPlanner.hasFlightPlan(FmsUtils.DTO_RANDOM_PLAN_INDEX) ? this.flightPlanner.getFlightPlan(FmsUtils.DTO_RANDOM_PLAN_INDEX) : undefined;
      if (dtoRandomPlan && this.flightPlanner.activePlanIndex === FmsUtils.DTO_RANDOM_PLAN_INDEX) {
        // The leg to the DTO target is always at the same index. Note that there may be additional legs after the leg
        // to the target (e.g. a hold leg), but the destination leg is always considered to be the leg to the target.
        const leg = dtoRandomPlan.tryGetLeg(FmsUtils.DTO_LEG_OFFSET - 1);
        if (leg && ICAO.isValueFacility(leg.leg.fixIcaoStruct, FacilityType.Airport)) {
          destinationPlanIndex = FmsUtils.DTO_RANDOM_PLAN_INDEX;
          destinationIcao = leg.leg.fixIcaoStruct;
          destinationLeg = leg;
        }
      }
    }

    this.destinationPlanIndex = destinationPlanIndex;
    this.destinationIcao = destinationIcao;
    this.destinationLeg = destinationLeg;

    const destinationIcaoToPublish = destinationIcao ?? ICAO.emptyValue();
    this.eventBusTopicPublishers['lnavdata_destination_icao'].publish(destinationIcaoToPublish);
    this.eventBusTopicPublishers['lnavdata_destination_ident'].publish(destinationIcaoToPublish.ident);

    this.eventBusTopicPublishers['lnavdata_destination_runway_icao'].publish(destinationRunwayIcao ?? ICAO.emptyValue());

    this.updateDestinationFacility(destinationIcao);
  }

  private destinationFacilityOpId = 0;

  /**
   * Updates the LNAV destination airport facility.
   * @param icao The ICAO of the destination airport facility, or `undefined` if there is no destination airport.
   */
  private async updateDestinationFacility(icao: IcaoValue | undefined): Promise<void> {
    const opId = ++this.destinationFacilityOpId;

    if (icao === undefined) {
      this.destinationFacility = undefined;
      return;
    }

    const facility = await this.facilityLoader.tryGetFacility(FacilityType.Airport, icao, AirportFacilityDataFlags.Minimal);

    if (opId !== this.destinationFacilityOpId) {
      return;
    }

    this.destinationFacility = facility ?? undefined;
  }

  /**
   * Updates a nominal desired track vector, and publishes the data to the event bus if necessary.
   * @param topic The event bus topic associated with the vector.
   * @param globalLegIndex The global index of the leg to which the vector belongs, or `-1` if there is no vector.
   * @param vectorIndex The index of the vector in its parent leg's `flightPath` array, or `-1` if there is no vector.
   */
  private updateDtkVector(
    topic: 'lnavdata_dtk_vector' | 'lnavdata_next_dtk_vector',
    globalLegIndex: number,
    vectorIndex: number
  ): void {
    const publisher = this.eventBusTopicPublishers[topic];
    const dtkVector = publisher.value;
    const needUpdate = dtkVector.globalLegIndex !== globalLegIndex
      || dtkVector.vectorIndex !== vectorIndex;

    if (needUpdate) {
      publisher.publish({ globalLegIndex, vectorIndex });
    }
  }

  /**
   * Computes CDI scaling.
   */
  private computeCdiScaling(): void {
    if (this.useVfrCdiScaling.get()) {
      this.computeVfrCdiScaling();
    } else {
      this.computeIfrCdiScaling();
    }
  }

  /**
   * Computes CDI scaling using VFR logic.
   */
  private computeVfrCdiScaling(): void {
    let scale = 5.0;
    let scaleLabel = CDIScaleLabel.VfrEnroute;

    const lnavIsTracking = this.lnavIsTracking.get();
    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
    const activeLegIndex = this.lnavLegIndex.get();

    if (lnavIsTracking && flightPlan && flightPlan.length > 0 && activeLegIndex < flightPlan.length) {
      const activeSegment = flightPlan.getSegment(flightPlan.getSegmentIndex(activeLegIndex));

      const approachSegment = FmsUtils.getApproachSegment(flightPlan);

      if (activeSegment.segmentType === FlightPlanSegmentType.Approach) {
        // If the active leg is part of an approach, then set CDI scale to 0.25 NM and label to VfrApproach.
        scale = 0.25;
        scaleLabel = CDIScaleLabel.VfrApproach;
      } else {
        // Find distance to closest airport in the active flight plan.

        let distanceToAirport = Infinity;

        for (let segmentIndex = 0; segmentIndex < flightPlan.segmentCount; segmentIndex++) {
          const segment = flightPlan.tryGetSegment(segmentIndex);
          if (segment) {
            for (let segmentLegIndex = 0; segmentLegIndex < segment.legs.length; segmentLegIndex++) {
              const leg = segment.legs[segmentLegIndex];

              switch (leg.leg.type) {
                case LegType.IF:
                case LegType.TF:
                case LegType.CF:
                case LegType.DF:
                case LegType.AF:
                case LegType.RF:
                case LegType.HF:
                case LegType.HA:
                case LegType.HM:
                  if (
                    ICAO.isFacility(leg.leg.fixIcao, FacilityType.Airport)
                    && leg.calculated
                    && leg.calculated.endLat !== undefined
                    && leg.calculated.endLon !== undefined
                  ) {
                    distanceToAirport = Math.min(
                      distanceToAirport,
                      UnitType.GA_RADIAN.convertTo(this.planePos.distance(leg.calculated.endLat, leg.calculated.endLon), UnitType.NMILE)
                    );
                  }
                  break;
              }
            }
          }
        }

        // If distance to the closest airport is <= 31 NM, then reduce CDI scale down to 1.25 NM as distance to airport
        // decreases from 31 NM to 30 NM. If distance is <= 30 NM, then set scale label to VfrTerminal.
        if (distanceToAirport <= 31) {
          scale = MathUtils.lerp(distanceToAirport, 30, 31, 1.25, scale, true, true);

          if (distanceToAirport <= 30) {
            scaleLabel = CDIScaleLabel.VfrTerminal;
          }
        }

        if (approachSegment) {
          // Find distance to faf or map.

          let fafLeg: LegDefinition | undefined = undefined;
          let mapLeg: LegDefinition | undefined = undefined;

          for (let i = approachSegment.legs.length - 1; i >= 0 && (!fafLeg || !mapLeg); i--) {
            const leg = approachSegment.legs[i];
            if (BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.MissedApproach | LegDefinitionFlags.VectorsToFinal)) {
              continue;
            }

            if (!mapLeg && BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.MAP)) {
              mapLeg = leg;
            } else if (!fafLeg && BitFlags.isAny(leg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
              fafLeg = leg;
            }
          }

          let distanceToFafOrMap = Infinity;

          if (
            fafLeg
            && fafLeg.calculated
            && fafLeg.calculated.endLat !== undefined
            && fafLeg.calculated.endLon !== undefined
          ) {
            distanceToFafOrMap = Math.min(
              distanceToFafOrMap,
              UnitType.GA_RADIAN.convertTo(this.planePos.distance(fafLeg.calculated.endLat, fafLeg.calculated.endLon), UnitType.NMILE)
            );
          }
          if (
            mapLeg
            && mapLeg.calculated
            && mapLeg.calculated.endLat !== undefined
            && mapLeg.calculated.endLon !== undefined
          ) {
            distanceToFafOrMap = Math.min(
              distanceToFafOrMap,
              UnitType.GA_RADIAN.convertTo(this.planePos.distance(mapLeg.calculated.endLat, mapLeg.calculated.endLon), UnitType.NMILE)
            );
          }

          // If distance to the faf/map is <= 3 NM, then reduce CDI scale down to 0.25 NM as distance to the fix
          // decreases from 3 NM to 2 NM. If distance is <= 2 NM, then set scale label to VfrApproach.
          if (distanceToFafOrMap <= 3) {
            scale = MathUtils.lerp(distanceToFafOrMap, 2, 3, 0.25, scale, true, true);

            if (distanceToFafOrMap <= 2) {
              scaleLabel = CDIScaleLabel.VfrApproach;
            }
          }
        }
      }
    }

    this.eventBusTopicPublishers['lnavdata_cdi_scale'].publish(scale);
    this.eventBusTopicPublishers['lnavdata_cdi_scale_label'].publish(scaleLabel);
  }

  /**
   * Computes CDI scaling using IFR logic.
   */
  private computeIfrCdiScaling(): void {
    let scale = 2.0;
    let scaleLabel = CDIScaleLabel.Enroute;
    const flightPlan = this.flightPlanner.hasActiveFlightPlan() ? this.flightPlanner.getActiveFlightPlan() : undefined;
    const activeLegIndex = this.lnavLegIndex.get();

    if (flightPlan && flightPlan.length > 0 && activeLegIndex < flightPlan.length) {
      const activeSegment = flightPlan.getSegment(flightPlan.getSegmentIndex(activeLegIndex));

      let previousLeg: LegDefinition | undefined;
      try {
        previousLeg = flightPlan.getLeg(activeLegIndex - 1);
      } catch { /*Do nothing*/ }

      if (activeSegment.segmentType === FlightPlanSegmentType.Departure) {
        // We are currently in the departure segment

        scale = 0.3;
        scaleLabel = CDIScaleLabel.Departure;

        const prevLegType = previousLeg?.leg.type;
        if (prevLegType && prevLegType !== LegType.IF && prevLegType !== LegType.CA && prevLegType !== LegType.FA) {
          scale = 1.0;
          scaleLabel = CDIScaleLabel.Terminal;
        }
      } else {
        // We are not in the departure segment

        if (this.primaryPlanOriginFacility !== undefined) {
          const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.primaryPlanOriginFacility), UnitType.NMILE);
          scale = 2.0 - NavMath.clamp(31 - distance, 0, 1);

          if (distance <= 30) {
            scaleLabel = CDIScaleLabel.Terminal;
          }
        }

        if (this.primaryPlanDestinationFacility !== undefined) {
          const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.primaryPlanDestinationFacility), UnitType.NMILE);
          scale = 2.0 - NavMath.clamp(31 - distance, 0, 1);

          if (distance <= 30) {
            scaleLabel = CDIScaleLabel.Terminal;
          }
        }
      }

      //Check for distance from arrival start
      if (activeSegment.segmentType === FlightPlanSegmentType.Arrival && activeSegment.legs.length > 1) {
        const firstArrivalLeg = activeSegment.legs[1];

        //If we're going from the start of the arrival (i.e. the second leg)
        if (
          activeLegIndex === activeSegment.offset + 1
          && firstArrivalLeg.calculated?.startLat !== undefined
          && firstArrivalLeg.calculated?.startLon !== undefined
          && firstArrivalLeg.calculated?.endLat !== undefined
          && firstArrivalLeg.calculated?.endLon !== undefined
        ) {
          const distance = this.lnavLegDistanceAlong.get();
          scale = 2.0 - NavMath.clamp(distance, 0, 1);

          if (distance >= 1) {
            scaleLabel = CDIScaleLabel.Terminal;
          }
        } else if (activeLegIndex > activeSegment.offset + 1) {
          scale = 1.0;
          scaleLabel = CDIScaleLabel.Terminal;
        }
      } else if (activeSegment.segmentType === FlightPlanSegmentType.Approach) {

        scale = 1.0;
        scaleLabel = CDIScaleLabel.Terminal;

        const fafIndex = this.getFafIndex(activeSegment);

        const currentLeg = activeLegIndex >= 0 && activeLegIndex < flightPlan.length ? flightPlan.getLeg(activeLegIndex) : undefined;

        if (fafIndex !== undefined && activeLegIndex === fafIndex) {
          const fafCalc = flightPlan.getLeg(fafIndex).calculated;

          if (fafCalc?.endLat !== undefined && fafCalc?.endLon !== undefined) {
            const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(fafCalc.endLat, fafCalc.endLon), UnitType.NMILE);
            scale = 1.0 - (0.7 * (NavMath.clamp(2 - distance, 0, 2) / 2));
          }

          scaleLabel = this.getApproachCdiScale();

        } else if (currentLeg?.calculated?.endLat && currentLeg?.calculated?.endLon && fafIndex !== undefined && activeLegIndex > fafIndex) {

          if (currentLeg && BitFlags.isAll(currentLeg.flags, LegDefinitionFlags.MissedApproach)) {
            scale = 1.0;
            scaleLabel = CDIScaleLabel.MissedApproach;
          } else {
            // TODO: this computation is incorrect for any approach that has >1 leg between the FAF and the missed approach

            const legLength = currentLeg.calculated.distance;
            const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(currentLeg.calculated.endLat, currentLeg.calculated.endLon), UnitType.NMILE);

            scale = 0.3 - (0.112 * (NavMath.clamp(legLength - distance, 0, legLength) / legLength));
            scaleLabel = this.getApproachCdiScale();
          }
        }
      }
    }

    this.eventBusTopicPublishers['lnavdata_cdi_scale'].publish(scale);
    this.eventBusTopicPublishers['lnavdata_cdi_scale_label'].publish(scaleLabel);
  }

  /**
   * Computes glidepath scaling.
   */
  private computeGpScaling(): void {
    const gpServiceLevel = this.isVNavIndexValid ? this.gpServiceLevel.get() : GlidepathServiceLevel.None;
    if (gpServiceLevel !== GlidepathServiceLevel.None) {
      const maxScaleFeet = 492; // 150 meters
      const minScaleFeet = gpServiceLevel === GlidepathServiceLevel.Lpv ? 49 : 148; // 15/45 meters

      const scale = MathUtils.clamp(NavdataComputer.GLIDEPATH_SCALE_TAN * this.gpDistance.get(), minScaleFeet, maxScaleFeet);
      this.vnavData.set('gpScale', scale);
    } else {
      this.vnavData.set('gpScale', 0);
    }
  }

  /**
   * Gets the index of the FAF in a segment.
   * @param segment The segment to search.
   * @returns The index of the FAF if found.
   */
  private getFafIndex(segment: FlightPlanSegment): number | undefined {
    let fafLeg = segment.legs[segment.legs.length - 2];
    let fafIndex = segment.legs.length - 2;

    for (let i = 0; i < segment.legs.length; i++) {
      const leg = segment.legs[i];
      if (leg.leg.fixTypeFlags & FixTypeFlags.FAF) {
        fafLeg = leg;
        fafIndex = i;
        break;
      }
    }

    if (fafLeg !== undefined) {
      return segment.offset + fafIndex;
    }
    return undefined;
  }

  /**
   * Gets the geo circle describing the nominal path tracked by LNAV.
   * @param leg The flight plan leg currently tracked by LNAV.
   * @param vectorIndex The index of the vector currently tracked by LNAV.
   * @param transitionMode The current LNAV transition mode.
   * @param out The object to which to write the result.
   * @param out.vectorIndex The index of the flight path vector associated with the geo circle.
   * @param out.circle The geo circle.
   * @returns The geo circle describing the initial path of a flight plan leg.
   */
  private getNominalPathCircle(
    leg: LegDefinition,
    vectorIndex: number,
    transitionMode: LNavTransitionMode,
    // eslint-disable-next-line jsdoc/require-jsdoc
    out: { vectorIndex: number, circle: GeoCircle }
  ): typeof out {
    out.vectorIndex = -1;

    if (!leg.calculated) {
      return out;
    }

    const legCalc = leg.calculated;

    // Fallback resolution paths are equivalent to DF legs.
    if (!legCalc.endsInFallback && BitFlags.isAll(legCalc.flightPath[0]?.flags ?? 0, FlightPathVectorFlags.Fallback | FlightPathVectorFlags.Direct)) {
      return this.getNominalPathCircleForEndCourseLeg(legCalc, out);
    }

    switch (leg.leg.type) {
      case LegType.FA:
      case LegType.CA:
      case LegType.VA:
      case LegType.FM:
      case LegType.VM:
      case LegType.DF:
      case LegType.CD:
      case LegType.VD:
      case LegType.CR:
      case LegType.VR:
      case LegType.CI:
      case LegType.VI:
        return this.getNominalPathCircleForEndCourseLeg(legCalc, out);
      case LegType.HM:
      case LegType.HF:
      case LegType.HA:
        return this.getNominalPathCircleForHoldLeg(legCalc, out);
      default: {
        let nominalVectorIndex: number;

        switch (transitionMode) {
          case LNavTransitionMode.Ingress:
            nominalVectorIndex = 0;
            break;
          case LNavTransitionMode.Egress:
            nominalVectorIndex = legCalc.flightPath.length - 1;
            break;
          default:
            nominalVectorIndex = vectorIndex;
        }

        const vector = legCalc.flightPath[nominalVectorIndex];

        if (vector !== undefined) {
          out.vectorIndex = nominalVectorIndex;
          FlightPathUtils.setGeoCircleFromVector(vector, out.circle);
        }
      }
    }

    return out;
  }

  /**
   * Gets the geo circle describing the nominal path tracked by LNAV for a flight plan leg whose nominal path is
   * defined by the course at the end of the leg.
   * @param legCalc The calculations for the flight plan leg.
   * @param out The object to which to write the result.
   * @param out.vectorIndex The index of the flight path vector associated with the geo circle.
   * @param out.circle The geo circle.
   * @returns The geo circle describing the initial path of a flight plan leg.
   */
  private getNominalPathCircleForEndCourseLeg(
    legCalc: LegCalculations,
    // eslint-disable-next-line jsdoc/require-jsdoc
    out: { vectorIndex: number, circle: GeoCircle }
  ): typeof out {
    out.vectorIndex = -1;

    const nominalVectorIndex = legCalc.flightPath.length - 1;
    const vector = legCalc.flightPath[nominalVectorIndex];

    if (!vector) {
      return out;
    }

    if (FlightPathUtils.isVectorGreatCircle(vector)) {
      out.vectorIndex = nominalVectorIndex;
      FlightPathUtils.setGeoCircleFromVector(vector, out.circle);
    } else {
      const turn = FlightPathUtils.setGeoCircleFromVector(vector, out.circle);
      const turnEnd = this.geoPointCache[0].set(vector.endLat, vector.endLon);
      const bearingAtEnd = turn.bearingAt(turnEnd, Math.PI);
      if (!isNaN(bearingAtEnd)) {
        out.vectorIndex = nominalVectorIndex;
        out.circle.setAsGreatCircle(turnEnd, bearingAtEnd);
      }
    }

    return out;
  }

  /**
   * Gets the geo circle describing the nominal path tracked by LNAV for a hold leg.
   * @param legCalc The calculations for the hold leg.
   * @param out The object to which to write the result.
   * @param out.vectorIndex The index of the flight path vector associated with the geo circle.
   * @param out.circle The geo circle.
   * @returns The geo circle describing the initial path of a flight plan leg.
   */
  private getNominalPathCircleForHoldLeg(
    legCalc: LegCalculations,
    // eslint-disable-next-line jsdoc/require-jsdoc
    out: { vectorIndex: number, circle: GeoCircle }
  ): typeof out {
    out.vectorIndex = -1;

    // The last base flight path vector for hold legs should always be the inbound leg
    if (legCalc.flightPath.length > 0) {
      out.vectorIndex = legCalc.flightPath.length - 1;
      FlightPathUtils.setGeoCircleFromVector(legCalc.flightPath[out.vectorIndex], out.circle);
    }

    return out;
  }

  /**
   * Gets the active distance from the plane position to the leg end.
   * @param leg The leg to get the distance for.
   * @param pos The current plane position.
   * @returns The distance, in nautical miles.
   */
  private getActiveDistance(leg: LegDefinition, pos: GeoPointInterface): number {
    const finalVector = leg.calculated?.flightPath[leg.calculated.flightPath.length - 1];
    if (finalVector !== undefined) {
      return UnitType.GA_RADIAN.convertTo(pos.distance(finalVector.endLat, finalVector.endLon), UnitType.NMILE);
    }

    return 0;
  }

  /**
   * Gets the distance remaining, in nautical miles, to the LNAV destination.
   * @param activeLegIndex The global leg index of the active flight plan leg.
   * @param activeLegDistance The distance from the airplane's current position to the end of the active leg, in
   * nautical miles.
   * @returns The distance remaining, in nautical miles, to the LNAV destination, or `-1` if the distance cannot be
   * calculated.
   */
  private getDestinationDistance(activeLegIndex: number, activeLegDistance: number): number {
    if (this.destinationPlanIndex === undefined || this.destinationIcao === undefined) {
      return -1;
    }

    const destinationPlan = this.flightPlanner.hasFlightPlan(this.destinationPlanIndex) ? this.flightPlanner.getFlightPlan(this.destinationPlanIndex) : undefined;

    if (!destinationPlan) {
      return -1;
    }

    if (this.flightPlanner.activePlanIndex === this.destinationPlanIndex) {
      // The flight plan containing the destination leg is the active flight plan. In this case, the distance to
      // destination should be calculated as the along-track distance from the airplane to the destination (with one
      // exception if we have already sequenced the destination leg - see the case below).

      const activeLegCumDistance = destinationPlan.tryGetLeg(activeLegIndex)?.calculated?.cumulativeDistanceWithTransitions;
      const destinationLegCumDistance = this.destinationLeg?.calculated?.cumulativeDistanceWithTransitions;

      if (activeLegCumDistance === undefined || destinationLegCumDistance === undefined) {
        return -1;
      } else if (destinationLegCumDistance - activeLegCumDistance < 0) {
        // The destination leg cumulative distance is less than the active leg cumulative distance. This means we have
        // sequenced past the destination leg. In this case, we want to revert to a great-circle distance calculation
        // if and only if the LNAV destination is the primary flight plan's destination airport or the LNAV destination
        // is the off-route direct-to target. Therefore, if either of these conditions is met, then we will let the
        // code fall through to the default case below. If neither is met, then the chosen destination is invalid, so
        // we will return -1.
        if (
          this.destinationPlanIndex === FmsUtils.PRIMARY_PLAN_INDEX
          && (
            !!destinationPlan.destinationAirportIcao !== !!this.destinationIcao
            || (destinationPlan.destinationAirportIcao && !ICAO.valueEquals(destinationPlan.destinationAirportIcao, this.destinationIcao))
          )
        ) {
          return -1;
        }
      } else {
        return UnitType.METER.convertTo(destinationLegCumDistance - activeLegCumDistance, UnitType.NMILE) + activeLegDistance;
      }
    }

    // If we have reached this point, then calculate the distance to destination as the great-circle distance from the
    // airplane to the destination.

    if (this.destinationLeg?.calculated && this.destinationLeg.calculated.endLat && this.destinationLeg.calculated.endLon) {
      return UnitType.GA_RADIAN.convertTo(
        this.planePos.distance(this.destinationLeg.calculated.endLat, this.destinationLeg.calculated.endLon),
        UnitType.NMILE
      );
    } else if (this.destinationFacility) {
      return UnitType.GA_RADIAN.convertTo(
        this.planePos.distance(this.destinationFacility),
        UnitType.NMILE
      );
    } else {
      return -1;
    }
  }

  /**
   * Updates whether OBS is available based on the current active flight plan leg, and sends a control event if OBS
   * availability has changed since the last update.
   * @param activeLeg The active flight plan leg, or `null` if none exists.
   */
  private updateObsAvailable(activeLeg: LegDefinition | null): void {
    let newObsAvailable = false;
    if (activeLeg) {
      switch (activeLeg.leg.type) {
        case LegType.AF:
        case LegType.CD:
        case LegType.CF:
        case LegType.CR:
        case LegType.DF:
        case LegType.IF:
        case LegType.RF:
        case LegType.TF:
          newObsAvailable = true;
          break;
      }
    }
    this.obsAvailable.set(newObsAvailable);
  }

  /**
   * Checks and returns the CDI Scale when in an approach.
   * @returns The CDIScaleLabel appropriate for the approach.
   */
  private getApproachCdiScale(): CDIScaleLabel {
    switch (this.approachDetails.type) {
      case ApproachType.APPROACH_TYPE_GPS:
      case ApproachType.APPROACH_TYPE_RNAV:
        if (this.approachDetails.isRnpAr) {
          return CDIScaleLabel.RNP;
        }
        switch (this.isVNavIndexValid ? this.gpServiceLevel.get() : GlidepathServiceLevel.None) {
          case GlidepathServiceLevel.LNavPlusV:
          case GlidepathServiceLevel.LNavPlusVBaro:
            return CDIScaleLabel.LNavPlusV;
          case GlidepathServiceLevel.LNavVNav:
          case GlidepathServiceLevel.LNavVNavBaro:
            return CDIScaleLabel.LNavVNav;
          case GlidepathServiceLevel.LpPlusV:
            return CDIScaleLabel.LPPlusV;
          case GlidepathServiceLevel.Lpv:
            return CDIScaleLabel.LPV;
          default:
            return CDIScaleLabel.LNav;
        }
      case AdditionalApproachType.APPROACH_TYPE_VISUAL:
        return CDIScaleLabel.Visual;
    }

    return CDIScaleLabel.Terminal;
  }

  /**
   * Gets the total distance of the egress transition of a flight plan leg, in nautical miles.
   * @param leg The leg to get the distance for.
   * @returns The total distance distance of the egress transition of the specified flight plan leg, in nautical miles.
   */
  private static getEgressDistance(leg: LegDefinition): number {
    if (leg.calculated === undefined) {
      return 0;
    }

    let distance = 0;
    for (let i = 0; i < leg.calculated.egress.length; i++) {
      distance += leg.calculated.egress[i].distance;
    }

    return UnitType.METER.convertTo(distance, UnitType.NMILE);
  }
}