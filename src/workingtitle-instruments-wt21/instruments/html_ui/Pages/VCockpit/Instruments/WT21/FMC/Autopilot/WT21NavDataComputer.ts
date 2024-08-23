import {
  AirportFacility, BitFlags, ClockEvents, ConsumerSubject, ControlEvents, EventBus, FacilityLoader, FacilityType, FixTypeFlags, FlightPathUtils,
  FlightPathVectorFlags, FlightPlan, FlightPlanner, FlightPlannerEvents, FlightPlanSegmentType, GeoCircle, GeoPoint, GeoPointInterface, GNSSEvents,
  LegDefinition, LegDefinitionFlags, LegType, LNavDataVars, LNavEvents, LNavTransitionMode, LNavUtils, MagVar, MathUtils, NavEvents, NavSourceId, NavSourceType,
  ObjectSubject, RnavTypeFlags, SimVarValueType, Subject, UnitType
} from '@microsoft/msfs-sdk';

import { ApproachDetails, CDIScaleLabel, FMS_MESSAGE_ID, MessageService, WT21ControlEvents, WT21FmsUtils, WT21LNavDataVars } from '@microsoft/msfs-wt21-shared';

const terminalScalingLabels = [
  CDIScaleLabel.Terminal,
  CDIScaleLabel.TerminalArrival,
  CDIScaleLabel.TerminalDeparture,
] as readonly CDIScaleLabel[];

/**
 * Computes WT21 LNAV-related data.
 */
export class WT21NavDataComputer {
  private readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly isInDiscontinuity = Subject.create(false);
  private readonly is2MinutesFromDiscontinuity = Subject.create(false);

  private readonly planePos = new GeoPoint(0, 0);

  private approachDetails?: ApproachDetails;
  private missedApproachManuallyActivated = false;

  private readonly lnavIsTracking: ConsumerSubject<boolean>;
  private readonly lnavLegIndex: ConsumerSubject<number>;
  private readonly lnavVectorIndex: ConsumerSubject<number>;
  private readonly lnavTransitionMode: ConsumerSubject<LNavTransitionMode>;
  private readonly lnavIsSuspended: ConsumerSubject<boolean>;

  private readonly lnavData = ObjectSubject.create({
    dtkTrue: 0,
    dtkMag: 0,
    xtk: 0,
    nextDtkTrue: 0,
    nextDtkMag: 0,
    cdiScale: 2,
    cdiScaleLabel: CDIScaleLabel.Enroute,
    waypointBearingTrue: 0,
    waypointBearingMag: 0,
    waypointDistance: 0,
    destinationDistance: 0,
    nominalLegIndex: 0,
    destinationDistanceDirect: Number.MAX_SAFE_INTEGER,
    distanceToFaf: Number.MAX_SAFE_INTEGER
  });

  private originFacility?: AirportFacility;

  private destinationFacility?: AirportFacility;

  private cdiSource?: NavSourceId;
  private groundSpeed = 0;

  /**
   * Creates a new instance of the NavdataComputer.
   * @param bus The event bus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param facilityLoader The facility loader to use with this instance.
   * @param messageService The MessageServiceisntance to use.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly facilityLoader: FacilityLoader,
    private readonly messageService: MessageService,
  ) {
    const sub = this.bus.getSubscriber<GNSSEvents & LNavEvents & FlightPlannerEvents
      & ClockEvents & ControlEvents & NavEvents & WT21ControlEvents>();

    this.lnavIsTracking = ConsumerSubject.create(sub.on('lnav_is_tracking'), false);
    this.lnavLegIndex = ConsumerSubject.create(sub.on('lnav_tracked_leg_index'), 0);
    this.lnavVectorIndex = ConsumerSubject.create(sub.on('lnav_tracked_vector_index'), 0);
    this.lnavTransitionMode = ConsumerSubject.create(sub.on('lnav_transition_mode'), LNavTransitionMode.None);
    this.lnavIsSuspended = ConsumerSubject.create(sub.on('lnav_is_suspended'), false);

    sub.on('gps-position').handle(lla => { this.planePos.set(lla.lat, lla.long); });
    // In the WT21, the active flight plan is never modified directly
    // So instead we listen for when the mod flight plan is copied into the active flight plan
    sub.on('fplCopied').handle(this.updateOriginDest.bind(this));
    sub.on('approach_freq_set').handle(() => {
      // Reset scaling when an approach is entered.
      this.setEnRouteScaling();
    });
    sub.on('approach_details_set').handle(d => {
      this.approachDetails = d;
      this.updateScalingMessages();
    });
    sub.on('realTime').atFrequency(1).handle(() => {
      this.updateCDIScaling();
    });
    sub.on('cdi_select').handle(x => {
      this.cdiSource = x;
      this.updateScalingMessages();
    });
    sub.on('ground_speed').withPrecision(0).handle(s => {
      this.groundSpeed = s;
    });

    sub.on('activate_missed_approach').handle(v => {
      this.missedApproachManuallyActivated = v;
    });

    this.lnavLegIndex.sub(trackedLegIndex => {
      if (this.missedApproachManuallyActivated) {
        this.handleActiveLegIndexChanged(trackedLegIndex);
      }
    });

    this.isInDiscontinuity.sub(x => {
      if (x) {
        const blinkEndTime = Date.now() + 5000;
        this.messageService.post(FMS_MESSAGE_ID.DISCONTINUITY, undefined, () => Date.now() < blinkEndTime);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.DISCONTINUITY);
      }
    });

    this.is2MinutesFromDiscontinuity.sub(x => {
      if (x) {
        this.messageService.post(FMS_MESSAGE_ID.FPLN_DISCONTINUITY);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.FPLN_DISCONTINUITY);
      }
    });

    // Start with enroute scaling, it should be able to find it's way from there
    // to the correct scaling once an origin or dest is entered.
    this.setEnRouteScaling();

    this.lnavData.sub((obj, key, value) => {
      switch (key) {
        case 'dtkTrue': SimVar.SetSimVarValue(LNavDataVars.DTKTrue, SimVarValueType.Degree, value); break;
        case 'dtkMag': SimVar.SetSimVarValue(LNavDataVars.DTKMagnetic, SimVarValueType.Degree, value); break;
        case 'xtk': SimVar.SetSimVarValue(LNavDataVars.XTK, SimVarValueType.NM, value); break;
        case 'cdiScale': SimVar.SetSimVarValue(LNavDataVars.CDIScale, SimVarValueType.NM, value); break;
        case 'cdiScaleLabel':
          SimVar.SetSimVarValue(WT21LNavDataVars.CDIScaleLabel, SimVarValueType.Number, value);
          this.updateScalingMessages();
          break;
        case 'waypointBearingTrue': SimVar.SetSimVarValue(LNavDataVars.WaypointBearingTrue, SimVarValueType.Degree, value); break;
        case 'waypointBearingMag': SimVar.SetSimVarValue(LNavDataVars.WaypointBearingMagnetic, SimVarValueType.Degree, value); break;
        case 'waypointDistance': SimVar.SetSimVarValue(LNavDataVars.WaypointDistance, SimVarValueType.NM, value); break;
        case 'destinationDistance': SimVar.SetSimVarValue(LNavDataVars.DestinationDistance, SimVarValueType.NM, value); break;
        case 'nominalLegIndex': SimVar.SetSimVarValue(WT21LNavDataVars.NominalLegIndex, SimVarValueType.Number, value); break;
        case 'destinationDistanceDirect': SimVar.SetSimVarValue(WT21LNavDataVars.DestinationDistanceDirect, SimVarValueType.NM, value); break;
        case 'distanceToFaf': SimVar.SetSimVarValue(WT21LNavDataVars.FafDistance, SimVarValueType.NM, value); break;
      }
    }, true);
  }

  /**
   * Update loop for WT21NavDataComputer
   */
  public update(): void {
    this.computeTrackingVars(MagVar.get(this.planePos));
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateOriginDest(): void {
    const flightPlan = this.flightPlanner.hasActiveFlightPlan()
      ? this.flightPlanner.getActiveFlightPlan()
      : undefined;

    if (!flightPlan) {
      this.originFacility = undefined;
      this.destinationFacility = undefined;
      return;
    }

    const { originAirport, destinationAirport } = flightPlan;

    if (originAirport) {
      this.facilityLoader.getFacility(FacilityType.Airport, originAirport).then(fac => {
        this.originFacility = fac;
      });
    } else {
      this.originFacility = undefined;
    }

    if (destinationAirport) {
      this.facilityLoader.getFacility(FacilityType.Airport, destinationAirport).then(fac => {
        this.destinationFacility = fac;
      });
    } else {
      this.destinationFacility = undefined;
    }
  }

  /**
   * Computes the nav tracking data, such as XTK, DTK, and distance to turn.
   * @param magVar The computed current location magvar.
   */
  private computeTrackingVars(magVar: number): void {
    let xtk = 0;
    let dtkTrue = 0;
    let dtkMag = 0;
    let distance = 0;
    let waypointBearingTrue = 0;
    let waypointBearingMag = 0;
    let totalDistance = 0;
    let nominalLegIndex = -1;

    const plan = this.flightPlanner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX) && this.flightPlanner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

    const trackedLegIndex = this.lnavLegIndex.get();
    const nextLegIndex = trackedLegIndex + 1;

    const currentLeg = plan && trackedLegIndex >= 0 && trackedLegIndex < plan.length
      ? plan.tryGetLeg(trackedLegIndex)
      : undefined;
    const nextLeg = plan && nextLegIndex >= 0 && nextLegIndex < plan.length
      ? plan.tryGetLeg(nextLegIndex)
      : undefined;

    if (currentLeg !== null && currentLeg !== undefined && trackedLegIndex > 0) {
      nominalLegIndex = trackedLegIndex;
    }

    const isTracking = this.lnavIsTracking.get();

    if (isTracking) {
      const transitionMode = this.lnavTransitionMode.get();

      let nominalLeg;
      let circle;
      if (transitionMode === LNavTransitionMode.Egress) {
        nominalLeg = nextLeg !== undefined && nextLeg !== null ? nextLeg : currentLeg;
        nominalLegIndex = nextLeg !== undefined && nextLeg !== null ? nextLegIndex : nominalLegIndex;
        if (nextLeg?.calculated?.flightPath.length) {
          circle = this.getNominalPathCircle(nextLeg, 0, LNavTransitionMode.Ingress, this.geoCircleCache[0]);
        }
      } else {
        nominalLeg = currentLeg;
        nominalLegIndex = trackedLegIndex;
        if (currentLeg?.calculated?.flightPath.length) {
          circle = this.getNominalPathCircle(currentLeg, this.lnavVectorIndex.get(), transitionMode, this.geoCircleCache[0]);
        }
      }

      if (nominalLeg?.calculated) {
        distance = this.getDistanceToTurn(nominalLeg, this.planePos);
        totalDistance = this.getTotalDistance(
          nominalLegIndex,
          distance + UnitType.METER.convertTo(nominalLeg.calculated.egress.reduce((cum, vector) => cum + vector.distance, 0), UnitType.NMILE)
        );

        if (nominalLeg.calculated.endLat !== undefined && nominalLeg.calculated.endLon) {
          waypointBearingTrue = this.planePos.bearingTo(nominalLeg.calculated.endLat, nominalLeg.calculated.endLon);
          waypointBearingMag = MagVar.trueToMagnetic(waypointBearingTrue, magVar);
        }
      }

      if (circle !== undefined) {
        xtk = UnitType.GA_RADIAN.convertTo(circle.distance(this.planePos), UnitType.NMILE);
        dtkTrue = circle.bearingAt(this.planePos, Math.PI);
        dtkMag = MagVar.trueToMagnetic(dtkTrue, magVar);
      }
    }

    this.updateDiscontinuityMessages(currentLeg, nextLeg, isTracking, distance);

    this.lnavData.set('nominalLegIndex', nominalLegIndex);
    this.lnavData.set('dtkTrue', dtkTrue);
    this.lnavData.set('dtkMag', dtkMag);
    this.lnavData.set('xtk', xtk);
    this.lnavData.set('waypointBearingTrue', waypointBearingTrue);
    this.lnavData.set('waypointBearingMag', waypointBearingMag);
    this.lnavData.set('waypointDistance', distance);
    this.lnavData.set('destinationDistance', totalDistance);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateDiscontinuityMessages(currentLeg: LegDefinition | undefined | null, nextLeg: LegDefinition | undefined | null, isTracking: boolean, distance: number): void {
    const isOnDiscoLeg = currentLeg?.leg.type === LegType.Discontinuity;
    const isOnVectorLeg = currentLeg?.leg.type === LegType.VM || currentLeg?.leg.type === LegType.FM;
    const isNextLegDiscoLeg = nextLeg?.leg.type === LegType.Discontinuity;
    const isOnGround = Simplane.getIsGrounded();

    let isWithin2MinutesOfDiscoLeg = false;

    if (isTracking && isNextLegDiscoLeg && !isOnVectorLeg) {
      const distanceToEndOfLeg = Math.round(distance * 1000) / 1000;
      const ttg = Math.round((distanceToEndOfLeg / this.groundSpeed) * 3600);
      const ttgToDiscoSeconds = isFinite(ttg) ? ttg : Number.MAX_SAFE_INTEGER;

      if (ttgToDiscoSeconds < 120) {
        isWithin2MinutesOfDiscoLeg = true;
      }
    }

    this.isInDiscontinuity.set(!isOnGround && isOnDiscoLeg && this.isGpsActiveSource());
    this.is2MinutesFromDiscontinuity.set(!isOnGround && (isWithin2MinutesOfDiscoLeg || isOnDiscoLeg));
  }

  /**
   * Computes the CDI scaling for the given LNAV data.
   */
  private updateCDIScaling(): void {

    const flightPlan = this.flightPlanner.hasActiveFlightPlan()
      ? this.flightPlanner.getActiveFlightPlan()
      : undefined;

    if (!this.originFacility || !this.destinationFacility) {
      if (flightPlan !== undefined) {
        this.updateOriginDest();
      }
    }

    // If no origin, then just use 999 NM
    const distanceFromOriginNM = this.originFacility
      ? UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.originFacility), UnitType.NMILE)
      : 999;

    // If no destination, then just use 999 NM
    const distanceToArivalNM = this.destinationFacility
      ? UnitType.GA_RADIAN.convertTo(this.planePos.distance(this.destinationFacility), UnitType.NMILE)
      : 999;

    const currentScaling = this.lnavData.get().cdiScaleLabel;
    const isInNorthAtlantic = this.planePos.lat >= 27 && this.planePos.lat <= 67 &&
      this.planePos.lon >= -60 && this.planePos.lon <= -10;

    this.lnavData.set('destinationDistanceDirect', distanceToArivalNM);

    // Default scaling of 2.0
    if (currentScaling === CDIScaleLabel.Enroute) {
      // Enroute -> Oceanic
      if (isInNorthAtlantic) {
        this.setOceanicScaling();
        return;
      }
      // Enroute -> TerminalDeparture
      if (distanceFromOriginNM <= 31) {
        this.setTerminalDepartureScaling();
        return;
      }
      // Enroute -> TerminalArrival
      if (distanceToArivalNM <= 31) {
        this.setTerminalArrivalScaling();
        return;
      }
      // Enroute -> Approach should not be possible, so not checking it here
      // Stay in Enroute
      return;
    }

    // Oceanic scaling of 4.0
    if (currentScaling === CDIScaleLabel.Oceanic) {
      // Oceanic -> Enroute
      if (!isInNorthAtlantic) {
        this.setEnRouteScaling();
        return;
      }
      // Oceanic -> TerminalArrival
      if (distanceToArivalNM <= 31) {
        this.setTerminalArrivalScaling();
        return;
      }
      // Stay in Oceanic
      return;
    }

    // TODO? REMOTE Scaling? The manual mentions it but doesn't explain

    if (!flightPlan) {
      // If we got here it means no flight plan, and not already in enroute or oceanic
      this.setEnRouteScaling();
      return;
    }

    if (flightPlan.activeLateralLeg < 0 || flightPlan.activeLateralLeg >= flightPlan.length) {
      // If we got here it means no active leg, and not already in enroute or oceanic
      this.setEnRouteScaling();
      return;
    }

    const currentLegIndex = flightPlan.activeLateralLeg;
    const currentLeg = flightPlan.getLeg(currentLegIndex);
    const isOnMissedApproachLeg = BitFlags.isAll(currentLeg.flags, LegDefinitionFlags.MissedApproach);
    const fafIndex = this.getFafIndex(flightPlan);
    const isAfterFAF = fafIndex !== undefined && currentLegIndex > fafIndex;
    const [isWithin2NmOfFAF, distanceToFafNM] = isAfterFAF
      ? [true, 0]
      : this.isWithin2NmOfFAF(flightPlan, currentLeg, fafIndex);
    const activeSegment = flightPlan.getSegment(flightPlan.getSegmentIndex(flightPlan.activeLateralLeg));
    const currentSegmentType = activeSegment.segmentType;

    // Terminal is when aircraft is within 31 NM radius of origin or arrival airport
    // We use TerminalDeparture to differentiate between TerminalArrival for nav-to-nav logic
    if (currentScaling === CDIScaleLabel.TerminalDeparture) {
      // TerminalDeparture -> EnRoute
      if (distanceFromOriginNM > 31) {
        this.setEnRouteScaling();
        return;
      }
      // TerminalDeparture -> TerminalArrival
      if (currentSegmentType !== FlightPlanSegmentType.Departure && distanceToArivalNM <= 31) {
        this.setTerminalArrivalScaling();
        return;
      }
      // TerminalDeparture -> Approach
      if (isAfterFAF || isWithin2NmOfFAF) {
        this.setApproachScaling();
        return;
      }
      // Stay in TerminalDeparture
      return;
    }

    // Terminal is when aircraft is within 31 NM radius of origin or arrival airport
    // We use TerminalArrival to differentiate between TerminalDeparture for nav-to-nav logic
    if (currentScaling === CDIScaleLabel.TerminalArrival) {
      // TerminalArrival -> EnRoute
      if (distanceToArivalNM > 31) {
        this.setEnRouteScaling();
        return;
      }
      // TerminalArrival -> Approach
      if (isAfterFAF || isWithin2NmOfFAF) {
        this.setApproachScaling();
        return;
      }
      // TerminalArrival -> MissedApproach
      if (isOnMissedApproachLeg) {
        this.setMissedApproachScaling();
        return;
      }
      // Stay in TerminalArrival
      return;
    }

    // Approach scaling starts at 1.0 at 2 NM out from FAF, then smoothly down to 0.3 at FAF and beyond
    if (currentScaling === CDIScaleLabel.Approach) {
      if (isWithin2NmOfFAF) {
        // Apply smooth transition
        const normalized = MathUtils.clamp(distanceToFafNM / 2, 0, 1);
        const newScaling = 0.3 + (0.7 * normalized);
        this.lnavData.set('cdiScale', newScaling);
      } else {
        this.lnavData.set('cdiScale', 1);
      }
      // Approach -> MissedApproach
      if (isOnMissedApproachLeg) {
        this.setMissedApproachScaling();
        return;
      }
      // Approach -> EnRoute
      if (distanceToArivalNM > 31) {
        this.setEnRouteScaling();
        return;
      }
      // Stay in Approach
      return;
    }

    if (currentScaling === CDIScaleLabel.MissedApproach) {
      // MissedApproach -> EnRoute
      if (!isOnMissedApproachLeg && distanceToArivalNM > 31) {
        this.setEnRouteScaling();
        return;
      }
      // MissedApproach -> TerminalArrival
      if (!isOnMissedApproachLeg && distanceToArivalNM <= 31) {
        this.setTerminalArrivalScaling();
        return;
      }
      // Stay in MissedApproach
      return;
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setEnRouteScaling(): void {
    this.lnavData.set('cdiScale', 2);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.Enroute);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setOceanicScaling(): void {
    this.lnavData.set('cdiScale', 4);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.Oceanic);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setTerminalDepartureScaling(): void {
    this.lnavData.set('cdiScale', 1);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.TerminalDeparture);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setTerminalArrivalScaling(): void {
    this.lnavData.set('cdiScale', 1);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.TerminalArrival);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setApproachScaling(): void {
    // Starts at 1 and smoothly transition to 0.3
    this.lnavData.set('cdiScale', 1);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.Approach);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private setMissedApproachScaling(): void {
    this.lnavData.set('cdiScale', 0.3);
    this.lnavData.set('cdiScaleLabel', CDIScaleLabel.MissedApproach);
  }

  private readonly updateScalingMessages = (): void => {
    this.isOceanic() ? this.messageService.post(FMS_MESSAGE_ID.OCEANIC) : this.messageService.clear(FMS_MESSAGE_ID.OCEANIC);
    this.isTerm() ? this.messageService.post(FMS_MESSAGE_ID.TERM) : this.messageService.clear(FMS_MESSAGE_ID.TERM);
    this.isLVTerm() ? this.messageService.post(FMS_MESSAGE_ID.LV_TERM) : this.messageService.clear(FMS_MESSAGE_ID.LV_TERM);
    this.isLpvTerm() ? this.messageService.post(FMS_MESSAGE_ID.LPV_TERM) : this.messageService.clear(FMS_MESSAGE_ID.LPV_TERM);
    this.isAppr() ? this.messageService.post(FMS_MESSAGE_ID.APPR) : this.messageService.clear(FMS_MESSAGE_ID.APPR);
    this.isGpsAppr() ? this.messageService.post(FMS_MESSAGE_ID.GPS_APPR) : this.messageService.clear(FMS_MESSAGE_ID.GPS_APPR);
    this.isLVAppr() ? this.messageService.post(FMS_MESSAGE_ID.LV_APPR) : this.messageService.clear(FMS_MESSAGE_ID.LV_APPR);
    this.isLpvAppr() ? this.messageService.post(FMS_MESSAGE_ID.LPV_APPR) : this.messageService.clear(FMS_MESSAGE_ID.LPV_APPR);
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isOceanic(): boolean {
    return this.isGpsActiveSource() && this.isOceanicScaling();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isTerm(): boolean {
    return this.isGpsActiveSource() && this.isTerminalScaling();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isLVTerm(): boolean {
    return this.isGpsActiveSource() && this.isTerminalArrivalScaling() && this.isLnavVnavApproachLoaded();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isLpvTerm(): boolean {
    return this.isGpsActiveSource() && this.isTerminalArrivalScaling() && this.isSbasLpvApproachLoaded();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isAppr(): boolean {
    return this.isGpsActiveSource() && this.isApproachScaling();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isGpsAppr(): boolean {
    return this.isGpsActiveSource() && this.isApproachScaling() && this.isGpsApproachLoaded();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isLVAppr(): boolean {
    // TODO This isn't excatly right, but it's close enough for now, see manual
    return this.isGpsActiveSource() && this.isApproachScaling() && this.isLnavVnavApproachLoaded();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isLpvAppr(): boolean {
    // TODO This isn't excatly right, but it's close enough for now, see manual
    return this.isGpsActiveSource() && this.isApproachScaling() && this.isSbasLpvApproachLoaded();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isOceanicScaling(): boolean {
    return this.lnavData.get().cdiScaleLabel === CDIScaleLabel.Oceanic;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isTerminalScaling(): boolean {
    return terminalScalingLabels.includes(this.lnavData.get().cdiScaleLabel);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isTerminalArrivalScaling(): boolean {
    return this.lnavData.get().cdiScaleLabel === CDIScaleLabel.TerminalArrival;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isApproachScaling(): boolean {
    return this.lnavData.get().cdiScaleLabel === CDIScaleLabel.Approach || this.lnavData.get().cdiScaleLabel === CDIScaleLabel.MissedApproach;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isGpsActiveSource(): boolean {
    return this.cdiSource?.type === NavSourceType.Gps;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isGpsApproachLoaded(): boolean {
    if (this.approachDetails) {
      return WT21FmsUtils.isGpsApproach(this.approachDetails.approachType);
    } else {
      return false;
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isLnavVnavApproachLoaded(): boolean {
    return this.approachDetails?.approachRnavType === RnavTypeFlags.LNAVVNAV;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private isSbasLpvApproachLoaded(): boolean {
    return this.approachDetails?.approachRnavType === RnavTypeFlags.LPV;
  }

  /**
   * Gets the geo circle describing the nominal path tracked by LNAV.
   * @param leg The flight plan leg currently tracked by LNAV.
   * @param vectorIndex The index of the vector currently tracked by LNAV.
   * @param transitionMode The current LNAV transition mode.
   * @param out The geo circle to which to write the result.
   * @returns The geo circle describing the initial path of a flight plan leg, or undefined if one could not be
   * determined.
   */
  private getNominalPathCircle(leg: LegDefinition, vectorIndex: number, transitionMode: LNavTransitionMode, out: GeoCircle): GeoCircle | undefined {
    if (!leg.calculated) {
      return undefined;
    }

    const legCalc = leg.calculated;

    switch (leg.leg.type) {
      case LegType.DF: {
        const vector = legCalc.flightPath[legCalc.flightPath.length - 1];

        if (!vector) {
          return undefined;
        }

        if (FlightPathUtils.isVectorGreatCircle(vector)) {
          return FlightPathUtils.setGeoCircleFromVector(vector, out);
        } else {
          const turn = FlightPathUtils.setGeoCircleFromVector(vector, out);
          const turnEnd = this.geoPointCache[0].set(vector.endLat, vector.endLon);
          const bearingAtEnd = turn.bearingAt(turnEnd);
          return isNaN(bearingAtEnd) ? undefined : out.setAsGreatCircle(turnEnd, bearingAtEnd);
        }
      }
      case LegType.HM:
      case LegType.HF:
      case LegType.HA: {
        const vectors = transitionMode === LNavTransitionMode.None
          ? LNavUtils.getVectorsForTransitionMode(legCalc, transitionMode, this.lnavIsSuspended.get())
          : legCalc.flightPath;
        const searchStartIndex = transitionMode === LNavTransitionMode.None || transitionMode === LNavTransitionMode.Unsuspend
          ? vectorIndex
          : transitionMode === LNavTransitionMode.Ingress
            ? 0
            : 3;

        let vector;
        for (let i = searchStartIndex; i < vectors.length; i++) {
          const holdVector = vectors[i];
          if (BitFlags.isAny(holdVector.flags, FlightPathVectorFlags.HoldOutboundLeg | FlightPathVectorFlags.HoldInboundLeg)) {
            vector = holdVector;
            break;
          }
        }

        return vector ? FlightPathUtils.setGeoCircleFromVector(vector, out) : undefined;
      }
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

        return vector ? FlightPathUtils.setGeoCircleFromVector(vector, out) : undefined;
      }
    }
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
   * Gets the active distance from the plane position to the next leg turn.
   * @param leg The leg to get the distance for.
   * @param pos The current plane position.
   * @returns The distance, in nautical miles.
   */
  private getDistanceToTurn(leg: LegDefinition, pos: GeoPointInterface): number {
    if (leg.calculated !== undefined) {
      const firstEgressVector = leg.calculated.egress[0];
      if (firstEgressVector) {
        return UnitType.GA_RADIAN.convertTo(pos.distance(firstEgressVector.startLat, firstEgressVector.startLon), UnitType.NMILE);
      } else {
        return this.getActiveDistance(leg, pos);
      }
    }

    return 0;
  }

  /**
   * Starts at FAF and works backwards to current leg to caculate the distance to the FAF and determine if we are within 2 NM of it.
   * Sets the distanceToFaf lnav data value.
   * @param flightPlan flightPlan
   * @param currentLeg currentLeg
   * @param fafIndex fafIndex
   * @returns Whether aircraft is within 2 NM or after the FAF and distance to FAF when within 2 NM before FAF
   */
  private isWithin2NmOfFAF(flightPlan: FlightPlan, currentLeg: LegDefinition, fafIndex?: number): [boolean, number] {
    if (currentLeg?.calculated?.endLat === undefined || currentLeg?.calculated?.endLon === undefined || fafIndex === undefined) {
      this.lnavData.set('distanceToFaf', Number.MAX_SAFE_INTEGER);

      return [false, Number.MAX_SAFE_INTEGER];
    }

    let sumNM = 0;

    for (const leg of flightPlan.legs(true, fafIndex)) {
      if (leg === currentLeg) {
        sumNM += UnitType.GA_RADIAN.convertTo(this.planePos.distance(currentLeg.calculated.endLat, currentLeg.calculated.endLon), UnitType.NMILE);
        return [sumNM <= 2, sumNM];
      } else {
        sumNM += leg.calculated?.distanceWithTransitions || 0;
        if (sumNM > 2) {
          return [false, Number.MAX_SAFE_INTEGER];
        }
      }
    }

    this.lnavData.set('distanceToFaf', sumNM);

    return [sumNM <= 2, sumNM];
  }


  /**
   * Gets the FAF index in the plan.
   * @param plan The flight plan.
   * @returns The FAF index in the plan, or undefined if not found.
   */
  private getFafIndex(plan: FlightPlan): number | undefined {
    if (plan.length > 0) {
      for (let l = plan.length - 1; l > 0; l--) {
        const planLeg = plan.tryGetLeg(l);
        if (planLeg && BitFlags.isAll(planLeg.leg.fixTypeFlags, FixTypeFlags.FAF)) {
          return l;
        }
      }
    }
    return undefined;
  }

  /**
   * Handles resetting whether the missed approach is active on a tracked leg change.
   * @param trackedLegIndex The currently tracked leg index.
   */
  private handleActiveLegIndexChanged(trackedLegIndex: number): void {

    const plan = this.flightPlanner.hasFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX) && this.flightPlanner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

    const currentLeg = plan && trackedLegIndex >= 0 && trackedLegIndex < plan.length
      ? plan.tryGetLeg(trackedLegIndex)
      : undefined;

    if (!currentLeg || !BitFlags.isAny(currentLeg.flags, LegDefinitionFlags.MissedApproach)) {
      this.bus.getPublisher<ControlEvents>().pub('activate_missed_approach', false, true);
    }
  }
}
