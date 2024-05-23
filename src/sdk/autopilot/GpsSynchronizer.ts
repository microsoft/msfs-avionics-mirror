import { ConsumerSubject, EventBus, SimVarValueType } from '../data';
import { FlightPlan, FlightPlanSegmentType, FlightPlanUtils, FlightPlanner, LegDefinition, LegDefinitionFlags } from '../flightplan';
import { AhrsEvents, GNSSEvents } from '../instruments';
import { BitFlags } from '../math/BitFlags';
import { UnitType } from '../math/NumberUnit';
import { AdditionalApproachType, FacilityLoader, FacilityType, FixTypeFlags, LegTurnDirection, LegType } from '../navigation';
import { MappedSubject } from '../sub/MappedSubject';
import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';
import { SubscribableMapFunctions } from '../sub/SubscribableMapFunctions';
import { SubscribableUtils } from '../sub/SubscribableUtils';
import { Subscription } from '../sub/Subscription';
import { LNavDataEvents } from './lnav/LNavDataEvents';
import { LNavEvents } from './lnav/LNavEvents';
import { LNavUtils } from './lnav/LNavUtils';
import { VNavDataEvents } from './vnav/VNavDataEvents';
import { VNavEvents } from './vnav/VNavEvents';
import { VNavUtils } from './vnav/VNavUtils';

/**
 * Configuration options for {@link GpsSynchronizer}.
 */
export type GpsSynchronizerOptions = {
  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;
};

/**
 * A class that synchronizes LNAV and VNAV data to the sim's built-in GPS system.
 */
export class GpsSynchronizer {

  private readonly lnavIndex: Subscribable<number>;
  private readonly vnavIndex: Subscribable<number>;

  private magvar = 0;
  private groundSpeed = 0;
  private zuluTime = 0;
  private numPlanLegs = Subject.create<number>(0);
  private hasReachedDestination = Subject.create<boolean>(false);
  private isDestinationLegActive = Subject.create<boolean>(false);
  private isDirectToActive = Subject.create<boolean>(false);

  private isVNavIndexValid = false;
  private gpFpa = 0;
  private gpDeviation = 0;
  private gpDistance = 0;
  private readonly isApproachActive = Subject.create<boolean>(false);
  private readonly gpAvailable = ConsumerSubject.create<boolean>(null, false);

  private readonly publishGpVsr = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isApproachActive,
    this.gpAvailable
  ).pause();
  private readonly vnavVsr = ConsumerSubject.create(null, 0);
  private readonly gpVsr = ConsumerSubject.create(null, 0);

  private publishedGpAngleError: number | undefined = undefined;

  /**
   * Creates a new instance of GpsSynchronizer.
   * @param bus The event bus.
   * @param flightPlanner The flight planner from which to source active flight plan data.
   * @param facLoader An instance of the facility loader.
   * @param options Options with which to configure the synchronizer.
   */
  public constructor(
    private bus: EventBus,
    private flightPlanner: FlightPlanner,
    private readonly facLoader: FacilityLoader,
    options?: Readonly<GpsSynchronizerOptions>
  ) {
    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);
    this.vnavIndex = SubscribableUtils.toSubscribable(options?.vnavIndex ?? 0, true);

    this.initLNav();
    this.initVNav();

    const ahrs = bus.getSubscriber<AhrsEvents>();
    ahrs.on('hdg_deg_true').handle(this.onTrueHeadingChanged.bind(this));

    const gnss = bus.getSubscriber<GNSSEvents>();
    gnss.on('gps-position').handle(this.onPositionChanged.bind(this));
    gnss.on('zulu_time').handle(t => this.zuluTime = t);
    gnss.on('track_deg_true').handle(this.onTrackTrueChanged.bind(this));
    gnss.on('ground_speed').handle(this.onGroundSpeedChanged.bind(this));
    gnss.on('magvar').handle(this.onMagvarChanged.bind(this));

    this.flightPlanner.onEvent('fplActiveLegChange').handle(() => {
      this.hasReachedDestination.set(false);
      if (this.flightPlanner.hasActiveFlightPlan()) {
        const activeFlightplan = this.flightPlanner.getActiveFlightPlan();
        this.checkDestinationLegActive(activeFlightplan);
        this.checkDirectToState(activeFlightplan);
        this.onIsPrevLegChanged(activeFlightplan);
        this.onWaypointIndexChanged(activeFlightplan);
      }
    });

    this.flightPlanner.onEvent('fplSegmentChange').handle(this.onPlanChanged.bind(this));
    this.flightPlanner.onEvent('fplIndexChanged').handle(this.onPlanChanged.bind(this));

    this.numPlanLegs.sub(this.onNumLegsChanged.bind(this));

    this.isDirectToActive.sub(this.onDirectToActive, true);
    this.hasReachedDestination.sub(this.onDestinationReached, true);
    this.isApproachActive.sub(this.onApproachActive, true);
  }

  /**
   * Initializes this synchronizer's LNAV subscriptions.
   */
  private initLNav(): void {
    const lnav = this.bus.getSubscriber<LNavEvents & LNavDataEvents>();

    const dtkHandler = this.onDtkChanged.bind(this);
    const xtkHandler = this.onXtkChanged.bind(this);
    const disHandler = this.onLnavDistanceChanged.bind(this);
    const brgHandler = this.onLnavBearingChanged.bind(this);
    const destDisHandler = this.onLnavDistanceToDestinationChanged.bind(this);
    const courseToSteerHandler = this.onLNavCourseToSteerChanged.bind(this);
    const cdiScaleHandler = this.onCdiScaleChanged.bind(this);

    const lnavSubs: Subscription[] = [];

    this.lnavIndex.sub(index => {
      for (const sub of lnavSubs) {
        sub.destroy();
      }
      lnavSubs.length = 0;

      if (LNavUtils.isValidLNavIndex(index)) {
        const suffix = LNavUtils.getEventBusTopicSuffix(index);
        lnavSubs.push(
          lnav.on(`lnavdata_dtk_mag${suffix}`).whenChanged().handle(dtkHandler),
          lnav.on(`lnavdata_xtk${suffix}`).whenChanged().handle(xtkHandler),
          lnav.on(`lnavdata_waypoint_distance${suffix}`).whenChanged().handle(disHandler),
          lnav.on(`lnavdata_waypoint_bearing_mag${suffix}`).whenChanged().handle(brgHandler),
          lnav.on(`lnavdata_destination_distance${suffix}`).whenChanged().handle(destDisHandler),
          lnav.on(`lnav_course_to_steer${suffix}`).whenChanged().handle(courseToSteerHandler),
          lnav.on(`lnavdata_cdi_scale${suffix}`).whenChanged().handle(cdiScaleHandler)
        );
      } else {
        dtkHandler(0);
        xtkHandler(0);
        disHandler(0);
        brgHandler(0);
        destDisHandler(0);
        courseToSteerHandler(0);
        cdiScaleHandler(0);
      }
    }, true);
  }

  /**
   * Initializes this synchronizer's VNAV and glidepath subscriptions.
   */
  private initVNav(): void {
    const vnavSubs: Subscription[] = [];

    const vnav = this.bus.getSubscriber<VNavEvents & VNavDataEvents>();

    const approachHasGpHandler = this.onApproachHasGpChanged.bind(this);
    const gpFpaHandler = this.onGpFpaChanged.bind(this);
    const gpDeviationHandler = this.onGpDeviationChanged.bind(this);
    const gpDistanceHandler = this.onGpDistanceChanged.bind(this);
    const gsiScaleHandler = this.onGsiScalingChanged.bind(this);
    const targetAltHandler = this.onTargetAltChanged.bind(this);
    const activeLegAltHandler = this.onActiveLegAltChanged.bind(this);
    const vsrHandler = this.onVsrChanged.bind(this);

    const gpAvailableSub = this.gpAvailable.sub(approachHasGpHandler, false, true);

    const vnavVsrSub = this.vnavVsr.sub(vsrHandler, false, true);
    const gpVsrSub = this.gpVsr.sub(vsrHandler, false, true);

    const publishGpVsrSub = this.publishGpVsr.sub(publishGpVsr => {
      if (publishGpVsr) {
        vnavVsrSub.pause();
        gpVsrSub.resume(true);
      } else {
        gpVsrSub.pause();
        vnavVsrSub.resume(true);
      }
    }, false, true);

    this.vnavIndex.sub(index => {
      for (const sub of vnavSubs) {
        sub.destroy();
      }
      vnavSubs.length = 0;

      this.isVNavIndexValid = VNavUtils.isValidVNavIndex(index);
      if (this.isVNavIndexValid) {
        const suffix = VNavUtils.getEventBusTopicSuffix(index);

        vnavSubs.push(
          vnav.on(`gp_fpa${suffix}`).whenChanged().handle(gpFpaHandler),
          vnav.on(`gp_vertical_deviation${suffix}`).whenChanged().handle(gpDeviationHandler),
          vnav.on(`gp_distance${suffix}`).whenChanged().handle(gpDistanceHandler),
          vnav.on(`gp_gsi_scaling${suffix}`).whenChanged().handle(gsiScaleHandler),
          vnav.on(`vnav_target_altitude${suffix}`).whenChanged().handle(targetAltHandler),
          vnav.on(`vnav_active_leg_alt${suffix}`).whenChanged().handle(activeLegAltHandler),
        );

        this.gpAvailable.setConsumer(vnav.on(`gp_available${suffix}`));
        gpAvailableSub.resume(true);

        this.vnavVsr.setConsumer(vnav.on(`vnav_required_vs${suffix}`));
        this.gpVsr.setConsumer(vnav.on(`gp_required_vs${suffix}`));

        this.publishGpVsr.resume();
        publishGpVsrSub.resume(true);
      } else {
        gpAvailableSub.pause();

        approachHasGpHandler(false);
        gpFpaHandler(0);
        gpDeviationHandler(0);
        gpDistanceHandler(0);
        gsiScaleHandler(0);
        targetAltHandler(0);
        activeLegAltHandler(0);

        this.gpAvailable.setConsumer(null);
        this.vnavVsr.setConsumer(null);
        this.gpVsr.setConsumer(null);
        this.publishGpVsr.pause();
        publishGpVsrSub.pause();
        vnavVsrSub.pause();
        gpVsrSub.pause();
        vsrHandler(0);
      }
    }, true);
  }

  /**
   * Updates the GpsSynchronizer.
   */
  public update(): void {
    const isGpsOverridden = SimVar.GetSimVarValue('GPS OVERRIDDEN', SimVarValueType.Bool);
    if (!isGpsOverridden) {
      SimVar.SetSimVarValue('GPS OVERRIDDEN', SimVarValueType.Bool, true);
    }

    let numPlanLegs = 0;
    if (this.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.flightPlanner.getActiveFlightPlan();
      numPlanLegs = plan.length;
    }
    this.numPlanLegs.set(numPlanLegs);

    this.updateGpAngleError();
  }

  /**
   * Updates the current glidepath angle error.
   */
  private updateGpAngleError(): void {
    let valueToPublish: number;

    if (!this.isVNavIndexValid || this.gpFpa <= 0) {
      valueToPublish = 0;
    } else {
      const fpaAltitude = VNavUtils.altitudeForDistance(this.gpFpa, this.gpDistance);
      const calculatedFpaToTarget = VNavUtils.getFpa(this.gpDistance, fpaAltitude + this.gpDeviation);
      valueToPublish = this.gpFpa - calculatedFpaToTarget;
    }

    if (valueToPublish !== this.publishedGpAngleError) {
      this.publishedGpAngleError = valueToPublish;
      SimVar.SetSimVarValue('GPS VERTICAL ANGLE ERROR', SimVarValueType.Degree, valueToPublish);
    }
  }

  /**
   * Handles when the active plan segments are changed.
   */
  private onPlanChanged(): void {
    const plan = this.flightPlanner.getActiveFlightPlan();
    const approachSegments = [...plan.segmentsOfType(FlightPlanSegmentType.Approach)];

    if (approachSegments && approachSegments.length > 0) {
      SimVar.SetSimVarValue('GPS IS APPROACH LOADED', SimVarValueType.Bool, true);
      //SimVar.SetSimVarValue('GPS APPROACH WP COUNT', SimVarValueType.Number, approachSegments[0].legs.length);

    } else {
      SimVar.SetSimVarValue('GPS IS APPROACH LOADED', SimVarValueType.Bool, false);
      //SimVar.SetSimVarValue('GPS APPROACH WP COUNT', SimVarValueType.Number, 0);
    }

    //SimVar.SetSimVarValue('GPS APPROACH APPROACH INDEX', SimVarValueType.Number, plan.procedureDetails.approachIndex);
    //SimVar.SetSimVarValue('GPS APPROACH TRANSITION INDEX', SimVarValueType.Number, plan.procedureDetails.approachTransitionIndex);

    this.checkApproachTypeAndTimezone(plan, plan.procedureDetails.approachIndex);

    this.hasReachedDestination.set(false);
    this.checkDestinationLegActive(plan);
    this.checkDirectToState(plan);
    this.onIsPrevLegChanged(plan);
    this.onWaypointIndexChanged(plan);
  }

  /**
   * Handles when the course steered by LNAV changes.
   * @param course The course steered by LNAV, in degrees true.
   */
  private onLNavCourseToSteerChanged(course: number): void {
    SimVar.SetSimVarValue('GPS COURSE TO STEER', SimVarValueType.Radians, UnitType.DEGREE.convertTo(course, UnitType.RADIAN));
    // SimVar.SetSimVarValue('GPS COURSE TO STEER', SimVarValueType.Degree, course);
  }

  /**
   * Checks to see if we are in a direct to state.
   * @param plan The Active Flight Plan.
   */
  private checkDirectToState(plan: FlightPlan): void {
    let isDirectToActive = false;
    if (plan.activeLateralLeg >= 0 && plan.activeLateralLeg < plan.length) {
      const activeLeg = plan.getLeg(plan.activeLateralLeg);
      isDirectToActive = BitFlags.isAll(activeLeg.flags, LegDefinitionFlags.DirectTo);
    }
    this.isDirectToActive.set(isDirectToActive);
  }

  private onDirectToActive = (state: boolean): void => {
    SimVar.SetSimVarValue('GPS IS DIRECTTO FLIGHTPLAN', SimVarValueType.Bool, state);
  };

  private onDestinationReached = (state: boolean): void => {
    SimVar.SetSimVarValue('GPS IS ARRIVED', SimVarValueType.Bool, state);
  };

  private onApproachActive = (isApproachActive: boolean): void => {
    SimVar.SetSimVarValue('GPS IS APPROACH ACTIVE', SimVarValueType.Bool, isApproachActive);
  };

  /**
   * Checks to see if we have reached the plan destination.
   * @param plan The Active Flight Plan
   */
  private checkDestinationLegActive(plan: FlightPlan): void {

    if (plan.length > 1) {
      const finalSegment = plan.getSegment(plan.getSegmentIndex(plan.length - 1));
      const isApproachActive = plan.activeLateralLeg > finalSegment.offset && finalSegment.segmentType === FlightPlanSegmentType.Approach;

      this.isApproachActive.set(isApproachActive);

      let destinationLegIndex = plan.length - 1;
      let fafIndex = -1;

      if (isApproachActive) {
        for (let i = finalSegment.legs.length - 1; i >= 0; i--) {
          const leg = finalSegment.legs[i];
          if (!BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach)) {
            destinationLegIndex = i + finalSegment.offset;
          }
          if (leg.leg.fixTypeFlags === FixTypeFlags.FAF) {
            fafIndex = i + finalSegment.offset;
            break;
          }
        }
      }

      this.checkApproachMode(plan, isApproachActive, fafIndex);
      if (!this.hasReachedDestination.get() && destinationLegIndex === plan.activeLateralLeg) {
        this.isDestinationLegActive.set(true);
        return;
      }
    } else {
      this.checkApproachMode(plan, false, -1);
    }

    this.isDestinationLegActive.set(false);
  }

  /**
   * Checks the approach mode on leg change.
   * @param plan The Active Flight Plan.
   * @param isApproachActive Whether the approach is active.
   * @param fafIndex The destination leg index.
   */
  private checkApproachMode(plan: FlightPlan, isApproachActive: boolean, fafIndex: number): void {
    let approachMode = 0;
    let currentLeg: LegDefinition | undefined;
    if (isApproachActive && plan.activeLateralLeg >= 0 && plan.activeLateralLeg < plan.length) {
      currentLeg = plan.getLeg(plan.activeLateralLeg);
      if (BitFlags.isAll(currentLeg.flags, LegDefinitionFlags.MissedApproach)) {
        approachMode = 3;
      } else if (fafIndex > -1 && plan.activeLateralLeg >= fafIndex) {
        approachMode = 2;
      } else {
        approachMode = 1;
      }
    }
    this.checkApproachWaypointType(currentLeg);
    SimVar.SetSimVarValue('GPS APPROACH MODE', SimVarValueType.Number, approachMode);
    SimVar.SetSimVarValue('GPS APPROACH IS FINAL', SimVarValueType.Bool, approachMode === 2);
  }

  /**
   * Handles when the active leg index changes.
   * @param plan The Active Flight Plan.
   */
  private onWaypointIndexChanged(plan: FlightPlan): void {
    let name = '';
    if (plan.activeLateralLeg >= 0 && plan.activeLateralLeg < plan.length) {
      const leg = plan.getLeg(plan.activeLateralLeg);
      name = leg.name ?? '';

      if (leg?.calculated) {
        SimVar.SetSimVarValue('GPS WP NEXT LAT', SimVarValueType.Degree, leg.calculated.endLat);
        SimVar.SetSimVarValue('GPS WP NEXT LON', SimVarValueType.Degree, leg.calculated.endLon);
      }
    }
    SimVar.SetSimVarValue('GPS WP NEXT ID', SimVarValueType.String, name);
  }

  /**
   * Handles when the number of active plan legs changes.
   * @param numLegs The number of active plan legs.
   */
  private onNumLegsChanged(numLegs: number): void {
    SimVar.SetSimVarValue('GPS IS ACTIVE FLIGHT PLAN', SimVarValueType.Bool, numLegs > 0);
    SimVar.SetSimVarValue('GPS IS ACTIVE WAY POINT', SimVarValueType.Bool, (this.isDirectToActive.get() || numLegs > 1));
    //SimVar.SetSimVarValue('GPS FLIGHT PLAN WP COUNT', SimVarValueType.Number, numLegs);

    if (this.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.flightPlanner.getActiveFlightPlan();
      this.onIsPrevLegChanged(plan);
    }

  }

  /**
   * Handles when the previous leg changes.
   * @param plan The Active Flight Plan
   */
  private onIsPrevLegChanged(plan: FlightPlan): void {
    const numLegs = this.numPlanLegs.get();
    let name = '';
    if (numLegs > 1 && plan.activeLateralLeg > 0 && plan.activeLateralLeg < plan.length) {
      const prevLeg = plan.getLeg(plan.activeLateralLeg - 1);

      if (!FlightPlanUtils.isDiscontinuityLeg(prevLeg.leg.type)) {
        SimVar.SetSimVarValue('GPS WP PREV VALID', SimVarValueType.Bool, true);
        name = prevLeg.name ?? '';
        if (prevLeg.calculated) {
          SimVar.SetSimVarValue('GPS WP PREV LAT', SimVarValueType.Degree, prevLeg.calculated.endLat);
          SimVar.SetSimVarValue('GPS WP PREV LON', SimVarValueType.Degree, prevLeg.calculated.endLon);
        }
      }
    }
    SimVar.SetSimVarValue('GPS WP PREV ID', SimVarValueType.String, name);
  }

  /**
   * Handles when the LNAV Distance to Destination Changes.
   * @param dis The new distance to destination.
   */
  private onLnavDistanceToDestinationChanged(dis: number): void {
    const eteSeconds = this.groundSpeed > 1 ? 3600 * dis / this.groundSpeed : 0;
    if (isNaN(eteSeconds)) { return; }

    SimVar.SetSimVarValue('GPS ETE', SimVarValueType.Seconds, eteSeconds);
    SimVar.SetSimVarValue('GPS ETA', SimVarValueType.Seconds, eteSeconds + this.zuluTime);
  }

  /**
   * Handles when the LNAV DTK changes.
   * @param dtk The new DTK.
   */
  private onDtkChanged(dtk: number): void {
    SimVar.SetSimVarValue('GPS WP DESIRED TRACK', SimVarValueType.Radians, UnitType.DEGREE.convertTo(dtk, UnitType.RADIAN));
  }

  /**
   * Handles when the LNAV XTK changes.
   * @param xtk The new XTK.
   */
  private onXtkChanged(xtk: number): void {
    SimVar.SetSimVarValue('GPS WP CROSS TRK', SimVarValueType.Meters, UnitType.NMILE.convertTo(xtk, UnitType.METER) * -1);
  }

  /**
   * Handles when the LNAV DIS to WP changes.
   * @param dis The distance.
   */
  private onLnavDistanceChanged(dis: number): void {
    if (this.isDestinationLegActive.get() && Math.abs(dis) < 2) {
      this.hasReachedDestination.set(true);
    }
    const distanceMeters = UnitType.NMILE.convertTo(dis, UnitType.METER);
    SimVar.SetSimVarValue('GPS WP DISTANCE', SimVarValueType.Meters, distanceMeters);

    const eteSeconds = this.groundSpeed > 1 ? 3600 * dis / this.groundSpeed : 0;

    SimVar.SetSimVarValue('GPS WP ETE', SimVarValueType.Seconds, eteSeconds);
    SimVar.SetSimVarValue('GPS WP ETA', SimVarValueType.Seconds, eteSeconds + this.zuluTime);
  }

  /**
   * Handles when the LNAV Bearing to WP changes.
   * @param brg The bearing.
   */
  private onLnavBearingChanged(brg: number): void {
    SimVar.SetSimVarValue('GPS WP BEARING', SimVarValueType.Radians, UnitType.DEGREE.convertTo(brg, UnitType.RADIAN));
  }

  /**
   * Handles when the True Ground Track Changes.
   * @param trk The true track.
   */
  private onTrackTrueChanged(trk: number): void {
    SimVar.SetSimVarValue('GPS GROUND TRUE TRACK', SimVarValueType.Radians, UnitType.DEGREE.convertTo(trk, UnitType.RADIAN));
  }

  /**
   * Handles when the Ground Speed changes.
   * @param gs The current ground speed.
   */
  private onGroundSpeedChanged(gs: number): void {
    this.groundSpeed = gs;
    SimVar.SetSimVarValue('GPS GROUND SPEED', SimVarValueType.MetersPerSecond, UnitType.KNOT.convertTo(gs, UnitType.MPS));
  }

  /**
   * Handles when the true heading changes.
   * @param hdg The true heading.
   */
  private onTrueHeadingChanged(hdg: number): void {
    SimVar.SetSimVarValue('GPS GROUND TRUE HEADING', SimVarValueType.Radians, UnitType.DEGREE.convertTo(hdg, UnitType.RADIAN));
  }

  /**
   * Handles when the magvar changes.
   * @param magvar The new magvar.
   */
  private onMagvarChanged(magvar: number): void {
    this.magvar = magvar;
    SimVar.SetSimVarValue('GPS MAGVAR', SimVarValueType.Radians, UnitType.DEGREE.convertTo(magvar, UnitType.RADIAN));
  }

  /**
   * Handles when the plane position changes.
   * @param pos The new plane position.
   */
  private onPositionChanged(pos: LatLongAlt): void {
    SimVar.SetSimVarValue('GPS POSITION LAT', SimVarValueType.Degree, pos.lat);
    SimVar.SetSimVarValue('GPS POSITION LON', SimVarValueType.Degree, pos.long);
    SimVar.SetSimVarValue('GPS POSITION ALT', SimVarValueType.Meters, pos.alt);
  }

  /**
   * Handles when the GPS CDI scale changes.
   * @param scaleNm The scale, in nautical miles.
   */
  private onCdiScaleChanged(scaleNm: number): void {
    SimVar.SetSimVarValue('GPS CDI SCALING', SimVarValueType.Meters, UnitType.NMILE.convertTo(scaleNm, UnitType.METER));
  }

  /**
   * Handles when whether the loaded approach has glidepath guidance changes.
   * @param approachHasGp Whether the loaded approach has glidepath guidance.
   */
  private onApproachHasGpChanged(approachHasGp: boolean): void {
    SimVar.SetSimVarValue('GPS HAS GLIDEPATH', SimVarValueType.Bool, approachHasGp);
  }

  /**
   * Handles when the glidepath angle changes.
   * @param fpa The new glidepath angle, in degrees.
   */
  private onGpFpaChanged(fpa: number): void {
    this.gpFpa = fpa;
    SimVar.SetSimVarValue('GPS VERTICAL ANGLE', SimVarValueType.Degree, fpa);
  }

  /**
   * Handles when the glidepath deviation changes.
   * @param deviation The new deviation, in feet.
   */
  private onGpDeviationChanged(deviation: number): void {
    this.gpDeviation = deviation;
    const deviationMeters = UnitType.FOOT.convertTo(deviation, UnitType.METER);
    SimVar.SetSimVarValue('GPS VERTICAL ERROR', SimVarValueType.Meters, -deviationMeters);
  }

  /**
   * Handles when the distance to the glidepath endpoint changes.
   * @param dis The new distance to the glidepath endpoint, in feet.
   */
  private onGpDistanceChanged(dis: number): void {
    this.gpDistance = dis;
  }

  /**
   * Handles when the glidepath deviation scale changes.
   * @param gsiScaling The new scale, in feet.
   */
  private onGsiScalingChanged(gsiScaling: number): void {
    const gsiScalingMeters = UnitType.FOOT.convertTo(gsiScaling, UnitType.METER);
    SimVar.SetSimVarValue('GPS GSI SCALING', SimVarValueType.Meters, gsiScalingMeters);
  }

  /**
   * Handles when the VNAV target altitude changes.
   * @param targetAlt The new target altitude, in feet (can be -1 if none is defined or available)
   */
  private onTargetAltChanged(targetAlt: number): void {
    SimVar.SetSimVarValue('GPS TARGET ALTITUDE', SimVarValueType.Meters, targetAlt > 0 ? UnitType.FOOT.convertTo(targetAlt, UnitType.METER) : 0);
  }

  /**
   * Handles when the VNAV active leg altitude changes.
   * @param alt The new active leg altitude, in meters.
   */
  private onActiveLegAltChanged(alt: number): void {
    SimVar.SetSimVarValue('GPS WP NEXT ALT', SimVarValueType.Meters, alt > 0 ? alt : 0);
  }

  /**
   * Handles when the vertical speed required changes.
   * @param vs The new required vertical speed, in feet per minute.
   */
  private onVsrChanged(vs: number): void {
    SimVar.SetSimVarValue('GPS WP VERTICAL SPEED', SimVarValueType.MetersPerSecond, UnitType.FPM.convertTo(vs, UnitType.MPS));
  }

  /**
   * Handles checking the approach type and timezone.
   * @param plan The active flight plan.
   * @param approachIndex The approach index in the active plan.
   */
  private async checkApproachTypeAndTimezone(plan: FlightPlan, approachIndex: number): Promise<void> {
    let approachType = 0;
    if (plan.getUserData<any>('visual_approach') !== undefined) {
      approachType = ApproachType.APPROACH_TYPE_RNAV;
    } else if (approachIndex > -1 && plan.destinationAirport) {
      const facility = await this.facLoader.getFacility(FacilityType.Airport, plan.destinationAirport);

      approachType = facility.approaches[approachIndex].approachType;
      if (approachType === AdditionalApproachType.APPROACH_TYPE_VISUAL) {
        approachType = ApproachType.APPROACH_TYPE_RNAV;
      }

      // TODO: Find a way to get the timezone from the facility or by lat/lon?
    }
    SimVar.SetSimVarValue('GPS APPROACH APPROACH TYPE', SimVarValueType.Number, approachType);
  }

  /**
   * Handles checking the approach waypoint type.
   * @param leg The active lateral leg.
   */
  private checkApproachWaypointType(leg?: LegDefinition): void {
    let legType = 0;
    let segmentType = 0;
    if (leg) {
      switch (leg.leg.type) {
        case LegType.AF:
          legType = leg.leg.turnDirection === LegTurnDirection.Left ? 4 : 5;
          segmentType = leg.leg.turnDirection === LegTurnDirection.Left ? 2 : 1;
          break;
        case LegType.RF:
          legType = 1;
          segmentType = leg.leg.turnDirection === LegTurnDirection.Left ? 2 : 1;
          break;
        case LegType.CA:
        case LegType.FA:
        case LegType.VA:
          legType = 9;
          break;
        case LegType.FM:
        case LegType.VM:
          legType = 10;
          break;
        case LegType.CD:
        case LegType.FD:
        case LegType.VD:
          legType = 8;
          break;
        case LegType.PI:
          legType = leg.leg.turnDirection === LegTurnDirection.Left ? 2 : 3;
          break;
        case LegType.HA:
        case LegType.HM:
        case LegType.HF:
          legType = leg.leg.turnDirection === LegTurnDirection.Left ? 6 : 7;
          break;
        default:
          legType = 1;
      }
    }
    SimVar.SetSimVarValue('GPS APPROACH WP TYPE', SimVarValueType.Number, legType);
    SimVar.SetSimVarValue('GPS APPROACH SEGMENT TYPE', SimVarValueType.Number, segmentType);
    SimVar.SetSimVarValue('GPS APPROACH IS WP RUNWAY', SimVarValueType.Bool, leg?.leg.fixIcao[0] === 'R');
  }
}