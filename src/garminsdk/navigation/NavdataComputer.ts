import {
  ActiveLegType, AdditionalApproachType, AirportFacility, BitFlags, ClockEvents, ConsumerSubject, ControlEvents, EventBus, FacilityLoader, FacilityType, FixTypeFlags,
  FlightPathUtils, FlightPathVectorFlags, FlightPlan, FlightPlanLegEvent, FlightPlanner, FlightPlannerEvents, FlightPlanOriginDestEvent, FlightPlanSegment,
  FlightPlanSegmentType, FlightPlanUtils, GeoCircle, GeoPoint, GeoPointInterface, GNSSEvents, LegCalculations, LegDefinition, LegDefinitionFlags, LegType, LNavDataVars,
  LNavEvents, LNavTransitionMode, MagVar, MathUtils, NavEvents, NavMath, ObjectSubject, OriginDestChangeType, RnavTypeFlags, SimVarValueType, Subject,
  UnitType, Vec3Math, VNavDataEvents, VNavEvents
} from '@microsoft/msfs-sdk';

import { GlidepathServiceLevel } from '../autopilot/GarminVerticalNavigation';
import { ApproachDetails, FmsEvents, FmsUtils } from '../flightplan';
import { GarminControlEvents } from '../instruments';
import { CDIScaleLabel, GarminLNavDataVars, LNavDataEvents, LNavDataDtkVector } from './LNavDataEvents';

/**
 * Computes Garmin LNAV-related data.
 */
export class NavdataComputer {
  private static readonly GLIDEPATH_ANGULAR_SCALE = 0.8; // degrees
  private static readonly GLIDEPATH_SCALE_TAN = Math.tan(NavdataComputer.GLIDEPATH_ANGULAR_SCALE * Avionics.Utils.DEG2RAD);

  private readonly geoPointCache = [new GeoPoint(0, 0)];

  private readonly publisher = this.bus.getPublisher<LNavDataEvents & VNavDataEvents>();

  private readonly planePos = new GeoPoint(0, 0);
  private readonly magVar: ConsumerSubject<number>;
  private readonly isObsActive: ConsumerSubject<boolean>;

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

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavVectorIndex: ConsumerSubject<number>;
  private readonly lnavTransitionMode: ConsumerSubject<LNavTransitionMode>;
  private readonly lnavIsSuspended: ConsumerSubject<boolean>;
  private readonly lnavDtk: ConsumerSubject<number>;
  private readonly lnavXtk: ConsumerSubject<number>;
  private readonly lnavLegDistanceAlong: ConsumerSubject<number>;
  private readonly lnavLegDistanceRemaining: ConsumerSubject<number>;
  private readonly lnavVectorDistanceAlong: ConsumerSubject<number>;

  private readonly isMaprActive: ConsumerSubject<boolean>;

  private readonly gpServiceLevel: ConsumerSubject<GlidepathServiceLevel>;
  private readonly gpDistance: ConsumerSubject<number>;

  private readonly lnavData = ObjectSubject.create({
    dtkTrue: 0,
    dtkMag: 0,
    xtk: 0,
    nextDtkTrue: 0,
    nextDtkMag: 0,
    cdiScale: 0,
    cdiScaleLabel: CDIScaleLabel.Enroute,
    waypointBearingTrue: 0,
    waypointBearingMag: 0,
    waypointDistance: 0,
    waypointIdent: '',
    destinationDistance: 0,
    egressDistance: 0
  });

  private readonly vnavData = ObjectSubject.create({
    gpScale: 0
  });

  private readonly dtkVector: LNavDataDtkVector = {
    globalLegIndex: -1,
    vectorIndex: -1
  };
  private readonly nextDtkVector: LNavDataDtkVector = {
    globalLegIndex: -1,
    vectorIndex: -1
  };

  private readonly nominalPathCircle = { vectorIndex: -1, circle: new GeoCircle(Vec3Math.create(), 0) };

  private originFacility?: AirportFacility;

  private destinationFacility?: AirportFacility;

  /**
   * Creates a new instance of the NavdataComputer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param facilityLoader The facility loader to use with this instance.
   */
  constructor(private readonly bus: EventBus, private readonly flightPlanner: FlightPlanner, private readonly facilityLoader: FacilityLoader) {
    const sub = this.bus.getSubscriber<
      NavEvents & GNSSEvents & LNavEvents & VNavEvents & VNavDataEvents & FlightPlannerEvents & FmsEvents & ClockEvents & ControlEvents
    >();

    this.magVar = ConsumerSubject.create(sub.on('magvar'), 0);
    this.isObsActive = ConsumerSubject.create(sub.on('gps_obs_active'), false);

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.lnavLegIndex = ConsumerSubject.create(sub.on('lnav_tracked_leg_index'), 0);
    this.lnavVectorIndex = ConsumerSubject.create(sub.on('lnav_tracked_vector_index'), 0);
    this.lnavTransitionMode = ConsumerSubject.create(sub.on('lnav_transition_mode'), LNavTransitionMode.None);
    this.lnavIsSuspended = ConsumerSubject.create(sub.on('lnav_is_suspended'), false);
    this.lnavDtk = ConsumerSubject.create(sub.on('lnav_dtk'), 0);
    this.lnavXtk = ConsumerSubject.create(sub.on('lnav_xtk'), 0);
    this.lnavLegDistanceAlong = ConsumerSubject.create(sub.on('lnav_leg_distance_along'), 0);
    this.lnavLegDistanceRemaining = ConsumerSubject.create(sub.on('lnav_leg_distance_remaining'), 0);
    this.lnavVectorDistanceAlong = ConsumerSubject.create(sub.on('lnav_vector_distance_along'), 0);

    this.isMaprActive = ConsumerSubject.create(sub.on('activate_missed_approach'), false);

    this.gpServiceLevel = ConsumerSubject.create(sub.on('gp_service_level'), GlidepathServiceLevel.None);
    this.gpDistance = ConsumerSubject.create(sub.on('gp_distance'), 0);

    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });
    sub.on('fplOriginDestChanged').handle(this.flightPlanOriginDestChanged.bind(this));
    sub.on('fplActiveLegChange').handle(event => { event.type === ActiveLegType.Lateral && this.onActiveLegChanged(); });
    sub.on('fplLegChange').handle(this.onLegChanged);
    sub.on('fplIndexChanged').handle(() => this.onActiveLegChanged());
    sub.on('fplSegmentChange').handle(() => this.onActiveLegChanged());
    sub.on('fms_approach_details').handle(d => { this.approachDetails = d; });
    sub.on('realTime').handle(() => {
      this.computeTrackingData();
      this.computeCdiScaling();
      this.computeGpScaling();
    });

    this.lnavData.sub((obj, key, value) => {
      switch (key) {
        case 'dtkTrue': SimVar.SetSimVarValue(LNavDataVars.DTKTrue, SimVarValueType.Degree, value); break;
        case 'dtkMag': SimVar.SetSimVarValue(LNavDataVars.DTKMagnetic, SimVarValueType.Degree, value); break;
        case 'xtk': SimVar.SetSimVarValue(LNavDataVars.XTK, SimVarValueType.NM, value); break;
        case 'nextDtkTrue': SimVar.SetSimVarValue(GarminLNavDataVars.NextDTKTrue, SimVarValueType.Degree, value); break;
        case 'nextDtkMag': SimVar.SetSimVarValue(GarminLNavDataVars.NextDTKMagnetic, SimVarValueType.Degree, value); break;
        case 'cdiScale': SimVar.SetSimVarValue(LNavDataVars.CDIScale, SimVarValueType.NM, value); break;
        case 'cdiScaleLabel': SimVar.SetSimVarValue(GarminLNavDataVars.CDIScaleLabel, SimVarValueType.Number, value); break;
        case 'waypointBearingTrue': SimVar.SetSimVarValue(LNavDataVars.WaypointBearingTrue, SimVarValueType.Degree, value); break;
        case 'waypointBearingMag': SimVar.SetSimVarValue(LNavDataVars.WaypointBearingMagnetic, SimVarValueType.Degree, value); break;
        case 'waypointDistance': SimVar.SetSimVarValue(LNavDataVars.WaypointDistance, SimVarValueType.NM, value); break;
        case 'waypointIdent': this.publisher.pub('lnavdata_waypoint_ident', value as string, true, true); break;
        case 'destinationDistance': SimVar.SetSimVarValue(LNavDataVars.DestinationDistance, SimVarValueType.NM, value); break;
        case 'egressDistance': SimVar.SetSimVarValue(GarminLNavDataVars.EgressDistance, SimVarValueType.NM, value); break;
      }
    }, true);

    this.vnavData.sub((obj, key, value) => {
      switch (key) {
        case 'gpScale': this.publisher.pub('gp_gsi_scaling', value as number, true, true); break;
      }
    }, true);

    this.obsAvailable.sub(v => {
      this.bus.getPublisher<GarminControlEvents>().pub('obs_available', v, true, true);
    });
  }

  /**
   * A callback fired when the active flight plan leg changes.
   * @param plan The Lateral Flight Plan (optional)
   */
  private onActiveLegChanged(plan?: FlightPlan): void {
    let activeLeg = null;
    if (plan === undefined && this.flightPlanner.hasActiveFlightPlan()) {
      plan = this.flightPlanner.getActiveFlightPlan();
    }
    if (plan !== undefined) {
      activeLeg = plan.tryGetLeg(plan.activeLateralLeg);
    }

    this.updateObsAvailable(activeLeg);
  }

  /**
   * A callback fired when any flight plan leg changes.
   * @param event is the FlightPlanLegEvent
   */
  private onLegChanged = (event: FlightPlanLegEvent): void => {
    if (this.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.flightPlanner.getActiveFlightPlan();
      if (FmsUtils.getGlobalLegIndex(plan, event.segmentIndex, event.legIndex) === plan.activeLateralLeg && event.planIndex === this.flightPlanner.activePlanIndex) {
        this.onActiveLegChanged(plan);
      }
    }
  };

  /**
   * A callback fired when the origin or destination changes in the flight plan.
   * @param e The event that was captured.
   */
  private flightPlanOriginDestChanged(e: FlightPlanOriginDestEvent): void {
    if (e.airport !== undefined) {
      this.facilityLoader.getFacility(FacilityType.Airport, e.airport).then(fac => {
        switch (e.type) {
          case OriginDestChangeType.OriginAdded:
            this.originFacility = fac;
            break;
          case OriginDestChangeType.DestinationAdded:
            this.destinationFacility = fac;
            break;
        }
      });
    }

    if (e.type === OriginDestChangeType.OriginRemoved) {
      this.originFacility = undefined;
    }

    if (e.type === OriginDestChangeType.DestinationRemoved) {
      this.destinationFacility = undefined;
    }
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
    let totalDistance = 0;

    if (this.lnavIsTracking.get()) {
      const plan = this.flightPlanner.hasActiveFlightPlan() && this.flightPlanner.getActiveFlightPlan();

      const isSuspended = this.lnavIsSuspended.get();
      const trackedLegIndex = this.lnavLegIndex.get();
      const nextLegIndex = trackedLegIndex + 1;

      const currentLeg = plan && trackedLegIndex >= 0 && trackedLegIndex < plan.length ? plan.getLeg(trackedLegIndex) : undefined;
      const nextLeg = plan && nextLegIndex >= 0 && nextLegIndex < plan.length ? plan.getLeg(nextLegIndex) : undefined;

      if (currentLeg?.calculated) {
        distance = this.getActiveDistance(currentLeg, this.planePos);
        totalDistance = this.getTotalDistance(trackedLegIndex, distance);
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
      } else {
        const transitionMode = this.lnavTransitionMode.get();

        let circle;
        if (transitionMode === LNavTransitionMode.Egress && nextLeg?.calculated?.flightPath.length) {
          const result = this.getNominalPathCircle(nextLeg, 0, LNavTransitionMode.Ingress, this.nominalPathCircle);
          if (result.vectorIndex >= 0) {
            dtkLegIndex = nextLegIndex;
            dtkVectorIndex = result.vectorIndex;
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
        }
      }
    }

    this.lnavData.set('dtkTrue', dtkTrue);
    this.lnavData.set('dtkMag', dtkMag);
    this.lnavData.set('xtk', xtk);
    this.lnavData.set('nextDtkTrue', nextDtkTrue);
    this.lnavData.set('nextDtkMag', nextDtkMag);
    this.lnavData.set('waypointBearingTrue', waypointBearingTrue);
    this.lnavData.set('waypointBearingMag', waypointBearingMag);
    this.lnavData.set('waypointDistance', distance);
    this.lnavData.set('waypointIdent', waypointIdent);
    this.lnavData.set('destinationDistance', totalDistance);

    this.updateDtkVector('lnavdata_dtk_vector', dtkLegIndex, dtkVectorIndex);
    this.updateDtkVector('lnavdata_next_dtk_vector', nextDtkLegIndex, nextDtkVectorIndex);

    this.lnavData.set('egressDistance', egressDistance);
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
    const dtkVector = topic === 'lnavdata_dtk_vector' ? this.dtkVector : this.nextDtkVector;

    const needUpdate = dtkVector.globalLegIndex !== globalLegIndex
      || dtkVector.vectorIndex !== vectorIndex;

    if (needUpdate) {
      dtkVector.globalLegIndex = globalLegIndex;
      dtkVector.vectorIndex = vectorIndex;

      this.publisher.pub(topic, Object.assign({}, dtkVector), true, true);
    }
  }

  /**
   * Computes CDI scaling.
   */
  private computeCdiScaling(): void {
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

        if (this.originFacility !== undefined) {
          const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.originFacility), UnitType.NMILE);
          scale = 2.0 - NavMath.clamp(31 - distance, 0, 1);

          if (distance <= 30) {
            scaleLabel = CDIScaleLabel.Terminal;
          }
        }

        if (this.destinationFacility !== undefined) {
          const distance = UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.destinationFacility), UnitType.NMILE);
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

    this.lnavData.set('cdiScale', scale);
    this.lnavData.set('cdiScaleLabel', scaleLabel);
  }

  /**
   * Computes glidepath scaling.
   */
  private computeGpScaling(): void {
    const gpServiceLevel = this.gpServiceLevel.get();
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
   * Gets the total distance from the plane position to the destination leg.
   * @param activeLegIndex The global leg index of the active flight plan leg.
   * @param activeLegDistance The distance from the present position to the end of the active leg, in nautical miles.
   * @returns The distance, in nautical miles.
   */
  private getTotalDistance(activeLegIndex: number, activeLegDistance: number): number {
    const plan = this.flightPlanner.getActiveFlightPlan();
    const activeLegCumulativeDistance = plan.tryGetLeg(activeLegIndex)?.calculated?.cumulativeDistanceWithTransitions ?? 0;

    let lastLegIndex = plan.length - 1;
    for (const leg of plan.legs(true)) {
      if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
        break;
      }
      lastLegIndex--;
    }

    const destinationLegCumulativeDistance = plan.tryGetLeg(lastLegIndex)?.calculated?.cumulativeDistanceWithTransitions ?? 0;

    return UnitType.METER.convertTo(destinationLegCumulativeDistance - activeLegCumulativeDistance, UnitType.NMILE) + activeLegDistance;
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
        switch (this.gpServiceLevel.get()) {
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