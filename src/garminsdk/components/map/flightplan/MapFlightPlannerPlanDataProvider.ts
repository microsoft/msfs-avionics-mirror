import {
  ActiveLegType, ConsumerSubject, EventBus, FlightPlan, FlightPlanner, FlightPlannerEvents, LNavEvents, LNavTrackingState, LNavUtils, NavEvents, NumberUnitInterface,
  NumberUnitSubject, SubEvent, Subject, Subscribable, Subscription, UnitFamily, UnitType, VNavEvents, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';

/**
 * A map flight plan layer data provider which provides a displayed flight plan from a flight planner.
 */
export class MapFlightPlannerPlanDataProvider implements MapFlightPlanDataProvider {
  private readonly planSub = Subject.create<FlightPlan | null>(null);
  /** @inheritdoc */
  public readonly plan: Subscribable<FlightPlan | null> = this.planSub;

  /** @inheritdoc */
  public readonly planModified = new SubEvent<this, void>();

  /** @inheritdoc */
  public readonly planCalculated = new SubEvent<this, void>();

  private readonly activeLegIndexSub = Subject.create(0);
  /** @inheritdoc */
  public readonly activeLateralLegIndex: Subscribable<number> = this.activeLegIndexSub;

  private readonly lnavDataSub = Subject.create<LNavTrackingState | undefined>(
    undefined,
    (a, b) => {
      if (!a && !b) {
        return true;
      }

      if (a && b) {
        return LNavUtils.lnavTrackingStateEquals(a, b);
      }

      return false;
    }
  );
  /** @inheritdoc */
  public readonly lnavData: Subscribable<LNavTrackingState | undefined> = this.lnavDataSub;

  public readonly vnavState: Subscribable<VNavState>;
  /** @inheritdoc */
  public readonly vnavPathMode: Subscribable<VNavPathMode>;

  private readonly vnavTodLegIndexSub = Subject.create(-1);
  /** @inheritdoc */
  public readonly vnavTodLegIndex: Subscribable<number> = this.vnavTodLegIndexSub;

  private readonly vnavBodLegIndexSub = Subject.create(-1);
  /** @inheritdoc */
  public readonly vnavBodLegIndex: Subscribable<number> = this.vnavBodLegIndexSub;

  private readonly vnavTodLegDistanceSub = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritdoc */
  public readonly vnavTodLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this.vnavTodLegDistanceSub;

  private readonly vnavDistanceToTodSub = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritdoc */
  public readonly vnavDistanceToTod: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this.vnavDistanceToTodSub;

  private readonly vnavTocLegIndexSub = Subject.create(-1);
  /** @inheritdoc */
  public readonly vnavTocLegIndex: Subscribable<number> = this.vnavTocLegIndexSub;

  private readonly vnavBocLegIndexSub = Subject.create(-1);
  /** @inheritdoc */
  public readonly vnavBocLegIndex: Subscribable<number> = this.vnavBocLegIndexSub;

  private readonly vnavTocLegDistanceSub = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritdoc */
  public readonly vnavTocLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this.vnavTocLegDistanceSub;

  private readonly vnavDistanceToTocSub = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritdoc */
  public readonly vnavDistanceToToc: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this.vnavDistanceToTocSub;

  private readonly obsCourseSub = Subject.create<number | undefined>(undefined);
  /** @inheritdoc */
  public readonly obsCourse: Subscribable<number | undefined> = this.obsCourseSub;

  private planIndex = -1;

  private isObsActive = false;
  private obsCourseValue = 0;

  private readonly activePlanSubs: Subscription[];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param planner The flight planner.
   */
  constructor(protected readonly bus: EventBus, protected readonly planner: FlightPlanner) {
    const plannerEvents = bus.getSubscriber<FlightPlannerEvents>();
    plannerEvents.on('fplCreated').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
    plannerEvents.on('fplDeleted').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
    plannerEvents.on('fplLoaded').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); });
    plannerEvents.on('fplIndexChanged').handle(() => { this.updateActivePlanRelatedSubs(); });

    plannerEvents.on('fplLegChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
    plannerEvents.on('fplSegmentChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
    plannerEvents.on('fplOriginDestChanged').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); });
    plannerEvents.on('fplActiveLegChange').handle(data => { data.planIndex === this.planIndex && data.type === ActiveLegType.Lateral && this.updateActiveLegIndex(); });
    plannerEvents.on('fplCalculated').handle(data => { data.planIndex === this.planIndex && this.planCalculated.notify(this); });

    const lnavEvents = bus.getSubscriber<LNavEvents>();
    const vnavEvents = bus.getSubscriber<VNavEvents>();
    const navEvents = this.bus.getSubscriber<NavEvents>();

    this.vnavState = ConsumerSubject.create(vnavEvents.on('vnav_state'), VNavState.Disabled);
    this.vnavPathMode = ConsumerSubject.create(vnavEvents.on('vnav_path_mode'), VNavPathMode.None);

    this.activePlanSubs = [
      lnavEvents.on('lnav_tracking_state').handle(state => {
        this.lnavDataSub.set(state);
      }, true),

      vnavEvents.on('vnav_tod_global_leg_index').whenChanged().handle(legIndex => {
        this.vnavTodLegIndexSub.set(legIndex);
      }, true),
      vnavEvents.on('vnav_bod_global_leg_index').whenChanged().handle(legIndex => {
        this.vnavBodLegIndexSub.set(legIndex);
      }, true),
      vnavEvents.on('vnav_tod_leg_distance').withPrecision(0).handle(distance => {
        this.vnavTodLegDistanceSub.set(distance, UnitType.METER);
      }, true),
      vnavEvents.on('vnav_tod_distance').withPrecision(0).handle(distance => {
        this.vnavDistanceToTodSub.set(distance, UnitType.METER);
      }, true),
      vnavEvents.on('vnav_toc_global_leg_index').whenChanged().handle(legIndex => {
        this.vnavTocLegIndexSub.set(legIndex);
      }, true),
      vnavEvents.on('vnav_boc_global_leg_index').whenChanged().handle(legIndex => {
        this.vnavBocLegIndexSub.set(legIndex);
      }, true),
      vnavEvents.on('vnav_toc_leg_distance').withPrecision(0).handle(distance => {
        this.vnavTocLegDistanceSub.set(distance, UnitType.METER);
      }, true),
      vnavEvents.on('vnav_toc_distance').withPrecision(0).handle(distance => {
        this.vnavDistanceToTocSub.set(distance, UnitType.METER);
      }, true),

      navEvents.on('gps_obs_active').whenChanged().handle(isActive => {
        this.isObsActive = isActive;
        this.updateObsCourse();
      }, true),
      navEvents.on('gps_obs_value').whenChanged().handle(course => {
        this.obsCourseValue = course;
        this.updateObsCourse();
      }, true)
    ];
  }

  /**
   * Sets the index of the displayed plan.
   * @param index The index of the displayed plan.
   */
  public setPlanIndex(index: number): void {
    if (index === this.planIndex) {
      return;
    }

    this.planIndex = index;
    this.updatePlan();
    this.updateActivePlanRelatedSubs();
  }

  /**
   * Updates the displayed plan.
   */
  private updatePlan(): void {
    if (this.planner.hasFlightPlan(this.planIndex)) {
      this.planSub.set(this.planner.getFlightPlan(this.planIndex));
    } else {
      this.planSub.set(null);
    }
  }

  /**
   * Updates subjects related to the active plan.
   */
  private updateActivePlanRelatedSubs(): void {
    this.updateActiveLegIndex();

    if (this.planIndex === this.planner.activePlanIndex) {
      this.activePlanSubs.forEach(sub => { sub.resume(true); });
    } else {
      this.activePlanSubs.forEach(sub => { sub.pause(); });

      this.lnavDataSub.set(undefined);
      this.vnavTodLegIndexSub.set(-1);
      this.vnavBodLegIndexSub.set(-1);
      this.vnavTodLegDistanceSub.set(0);
      this.vnavDistanceToTodSub.set(0);
      this.vnavTocLegIndexSub.set(-1);
      this.vnavBocLegIndexSub.set(-1);
      this.vnavTocLegDistanceSub.set(0);
      this.vnavDistanceToTocSub.set(0);
      this.obsCourseSub.set(undefined);
    }
  }

  /**
   * Updates the active leg index.
   */
  private updateActiveLegIndex(): void {
    const plan = this.plan.get();
    this.activeLegIndexSub.set(plan && this.planIndex === this.planner.activePlanIndex ? plan.activeLateralLeg : -1);
  }

  /**
   * Updates the OBS course.
   */
  private updateObsCourse(): void {
    this.obsCourseSub.set(this.isObsActive ? this.obsCourseValue : undefined);
  }
}