import {
  ActiveLegType, EventBus, EventSubscriber, FlightPlan, FlightPlanner, LNavEvents, LNavObsEvents, LNavTrackingState,
  LNavUtils, NumberUnitInterface, NumberUnitSubject, SubEvent, Subject, Subscribable, SubscribableUtils, Subscription,
  UnitFamily, UnitType, VNavEvents, VNavPathMode, VNavState, VNavUtils
} from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';

/**
 * Configuration options for {@link MapFlightPlannerPlanDataProvider}.
 */
export type MapFlightPlannerPlanDataProviderOptions = {
  /** The flight planner from which to retrieve displayed flight plans. */
  flightPlanner: FlightPlanner | Subscribable<FlightPlanner | null>;

  /** The index of the LNAV from which to source LNAV tracking data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;
};

/**
 * A map flight plan layer data provider that provides a displayed flight plan from a flight planner.
 */
export class MapFlightPlannerPlanDataProvider implements MapFlightPlanDataProvider {
  private readonly planner: Subscribable<FlightPlanner | null>;

  private readonly _plan = Subject.create<FlightPlan | null>(null);
  /** @inheritDoc */
  public readonly plan: Subscribable<FlightPlan | null> = this._plan;

  /** @inheritDoc */
  public readonly planModified = new SubEvent<this, void>();

  /** @inheritDoc */
  public readonly planCalculated = new SubEvent<this, void>();

  private readonly _activeLateralLegIndex = Subject.create(0);
  /** @inheritDoc */
  public readonly activeLateralLegIndex: Subscribable<number> = this._activeLateralLegIndex;

  private readonly _lnavData = Subject.create<LNavTrackingState | undefined>(
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
  /** @inheritDoc */
  public readonly lnavData: Subscribable<LNavTrackingState | undefined> = this._lnavData;

  private readonly _vnavState = Subject.create(VNavState.Disabled);
  /** @inheritDoc */
  public readonly vnavState = this._vnavState as Subscribable<VNavState>;

  private readonly _vnavPathMode = Subject.create(VNavPathMode.None);
  /** @inheritDoc */
  public readonly vnavPathMode = this._vnavPathMode as Subscribable<VNavPathMode>;

  private readonly _vnavTodLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly vnavTodLegIndex: Subscribable<number> = this._vnavTodLegIndex;

  private readonly _vnavBodLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly vnavBodLegIndex: Subscribable<number> = this._vnavBodLegIndex;

  private readonly _vnavTodLegDistance = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritDoc */
  public readonly vnavTodLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this._vnavTodLegDistance;

  private readonly _vnavDistanceToTod = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritDoc */
  public readonly vnavDistanceToTod: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this._vnavDistanceToTod;

  private readonly _vnavTocLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly vnavTocLegIndex: Subscribable<number> = this._vnavTocLegIndex;

  private readonly _vnavBocLegIndex = Subject.create(-1);
  /** @inheritDoc */
  public readonly vnavBocLegIndex: Subscribable<number> = this._vnavBocLegIndex;

  private readonly _vnavTocLegDistance = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritDoc */
  public readonly vnavTocLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this._vnavTocLegDistance;

  private readonly _vnavDistanceToToc = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  /** @inheritDoc */
  public readonly vnavDistanceToToc: Subscribable<NumberUnitInterface<UnitFamily.Distance>> = this._vnavDistanceToToc;

  private readonly _obsCourse = Subject.create<number | undefined>(undefined);
  /** @inheritDoc */
  public readonly obsCourse: Subscribable<number | undefined> = this._obsCourse;

  private readonly lnavIndex: Subscribable<number>;
  private readonly vnavIndex: Subscribable<number>;

  private readonly lnavDataSource = Subject.create<LNavTrackingState | undefined>(undefined);
  private readonly obsActiveSource = Subject.create<boolean>(false);
  private readonly obsCourseSource = Subject.create(0);
  private readonly lnavSourceSubs: Subscription[] = [];

  private readonly vnavTodLegIndexSource = Subject.create(-1);
  private readonly vnavBodLegIndexSource = Subject.create(-1);
  private readonly vnavTodLegDistanceSource = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  private readonly vnavDistanceToTodSource = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  private readonly vnavTocLegIndexSource = Subject.create(-1);
  private readonly vnavBocLegIndexSource = Subject.create(-1);
  private readonly vnavTocLegDistanceSource = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  private readonly vnavDistanceToTocSource = NumberUnitSubject.create(UnitType.METER.createNumber(0));
  private readonly vnavSourceSubs: Subscription[] = [];

  private planIndex = -1;

  private isObsActive = false;
  private obsCourseValue = 0;

  private readonly fplSubs: Subscription[] = [];
  private readonly activePlanSubs: Subscription[];

  private isAlive = true;

  private readonly subscriptions: Subscription[] = [];

  /**
   * Creates a new instance of MapFlightPlannerPlanDataProvider.
   * @param bus The event bus.
   * @param options Options with which to configure the data provider.
   */
  public constructor(
    bus: EventBus,
    options: Readonly<MapFlightPlannerPlanDataProviderOptions>
  );
  /**
   * Creates a new instance of MapFlightPlannerPlanDataProvider.
   * @param bus The event bus.
   * @param flightPlanner The flight planner from which to retrieve displayed flight plans.
   */
  public constructor(
    bus: EventBus,
    flightPlanner: FlightPlanner
  );
  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    arg2: Readonly<MapFlightPlannerPlanDataProviderOptions> | FlightPlanner,
  ) {
    let flightPlanner: FlightPlanner | Subscribable<FlightPlanner | null>;
    let options: Readonly<MapFlightPlannerPlanDataProviderOptions> | undefined;

    if (arg2 instanceof FlightPlanner) {
      flightPlanner = arg2;
    } else {
      flightPlanner = arg2.flightPlanner;
      options = arg2;
    }

    this.planner = SubscribableUtils.toSubscribable(flightPlanner, true);

    this.lnavIndex = SubscribableUtils.toSubscribable(options?.lnavIndex ?? 0, true);
    this.vnavIndex = SubscribableUtils.toSubscribable(options?.vnavIndex ?? 0, true);

    const lnavEvents = bus.getSubscriber<LNavEvents & LNavObsEvents>();
    const vnavEvents = bus.getSubscriber<VNavEvents>();

    this.activePlanSubs = [
      this.lnavDataSource.pipe(this._lnavData, true),

      this.vnavTodLegIndexSource.pipe(this._vnavTodLegIndex, true),
      this.vnavBodLegIndexSource.pipe(this._vnavBodLegIndex, true),
      this.vnavTodLegDistanceSource.pipe(this._vnavTodLegDistance, true),
      this.vnavDistanceToTodSource.pipe(this._vnavDistanceToTod, true),
      this.vnavTocLegIndexSource.pipe(this._vnavTocLegIndex, true),
      this.vnavBocLegIndexSource.pipe(this._vnavBocLegIndex, true),
      this.vnavTocLegDistanceSource.pipe(this._vnavTocLegDistance, true),
      this.vnavDistanceToTocSource.pipe(this._vnavDistanceToToc, true),

      this.obsActiveSource.sub(isActive => {
        this.isObsActive = isActive;
        this.updateObsCourse();
      }, false, true),
      this.obsCourseSource.sub(course => {
        this.obsCourseValue = course;
        this.updateObsCourse();
      }, false, true)
    ];

    this.subscriptions.push(
      this.planner.sub(this.onFlightPlannerChanged.bind(this), true),
      this.lnavIndex.sub(this.onLNavIndexChanged.bind(this, lnavEvents), true),
      this.vnavIndex.sub(this.onVNavIndexChanged.bind(this, vnavEvents), true)
    );
  }

  /**
   * Responds to when this provider's flight planner changes.
   * @param planner The new flight planner.
   */
  private onFlightPlannerChanged(planner: FlightPlanner | null): void {
    for (const sub of this.fplSubs) {
      sub.destroy();
    }
    this.fplSubs.length = 0;

    if (planner) {
      this.fplSubs.push(
        planner.onEvent('fplCreated').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); }),
        planner.onEvent('fplDeleted').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); }),
        planner.onEvent('fplLoaded').handle(data => { data.planIndex === this.planIndex && this.updatePlan(); }),
        planner.onEvent('fplIndexChanged').handle(() => { this.updateActivePlanRelatedSubs(); }),

        planner.onEvent('fplLegChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); }),
        planner.onEvent('fplSegmentChange').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); }),
        planner.onEvent('fplOriginDestChanged').handle(data => { data.planIndex === this.planIndex && this.planModified.notify(this); }),
        planner.onEvent('fplActiveLegChange').handle(data => { data.planIndex === this.planIndex && data.type === ActiveLegType.Lateral && this.updateActiveLegIndex(); }),
        planner.onEvent('fplCalculated').handle(data => { data.planIndex === this.planIndex && this.planCalculated.notify(this); })
      );
    }

    this.updatePlan();
    this.updateActivePlanRelatedSubs();
  }

  /**
   * Responds to when this provider's LNAV index changes.
   * @param lnavEvents An event subscriber for LNAV events.
   * @param index The new LNAV index.
   */
  private onLNavIndexChanged(lnavEvents: EventSubscriber<LNavEvents & LNavObsEvents>, index: number): void {
    for (const sub of this.lnavSourceSubs) {
      sub.destroy();
    }
    this.lnavSourceSubs.length = 0;

    this.lnavDataSource.set(undefined);
    this.obsActiveSource.set(false);
    this.obsCourseSource.set(0);

    if (LNavUtils.isValidLNavIndex(index)) {
      const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(index);

      this.lnavSourceSubs.push(
        lnavEvents.on(`lnav_tracking_state${lnavTopicSuffix}`).handle(state => {
          this.lnavDataSource.set(state);
        }),

        lnavEvents.on(`lnav_obs_active${lnavTopicSuffix}`).whenChanged().handle(isActive => {
          this.obsActiveSource.set(isActive);
        }),

        lnavEvents.on(`lnav_obs_course${lnavTopicSuffix}`).whenChanged().handle(course => {
          this.obsCourseSource.set(course);
        })
      );
    }
  }

  /**
   * Responds to when this provider's VNAV index changes.
   * @param vnavEvents An event subscriber for VNAV events.
   * @param index The new VNAV index.
   */
  private onVNavIndexChanged(vnavEvents: EventSubscriber<VNavEvents>, index: number): void {
    for (const sub of this.vnavSourceSubs) {
      sub.destroy();
    }
    this.vnavSourceSubs.length = 0;

    this._vnavState.set(VNavState.Disabled);
    this._vnavPathMode.set(VNavPathMode.None);

    this.vnavTodLegIndexSource.set(-1);
    this.vnavBodLegIndexSource.set(-1);
    this.vnavTodLegDistanceSource.set(0);
    this.vnavDistanceToTodSource.set(0);
    this.vnavTocLegIndexSource.set(-1);
    this.vnavBocLegIndexSource.set(-1);
    this.vnavTocLegDistanceSource.set(0);
    this.vnavDistanceToTocSource.set(0);

    if (VNavUtils.isValidVNavIndex(index)) {
      const vnavTopicSuffix = VNavUtils.getEventBusTopicSuffix(index);

      this.vnavSourceSubs.push(
        vnavEvents.on(`vnav_state${vnavTopicSuffix}`).handle(state => {
          this._vnavState.set(state);
        }),
        vnavEvents.on(`vnav_path_mode${vnavTopicSuffix}`).handle(mode => {
          this._vnavPathMode.set(mode);
        }),
        vnavEvents.on(`vnav_tod_global_leg_index${vnavTopicSuffix}`).whenChanged().handle(legIndex => {
          this.vnavTodLegIndexSource.set(legIndex);
        }),
        vnavEvents.on(`vnav_bod_global_leg_index${vnavTopicSuffix}`).whenChanged().handle(legIndex => {
          this.vnavBodLegIndexSource.set(legIndex);
        }),
        vnavEvents.on(`vnav_tod_leg_distance${vnavTopicSuffix}`).withPrecision(0).handle(distance => {
          this.vnavTodLegDistanceSource.set(distance, UnitType.METER);
        }),
        vnavEvents.on(`vnav_tod_distance${vnavTopicSuffix}`).withPrecision(0).handle(distance => {
          this.vnavDistanceToTodSource.set(distance, UnitType.METER);
        }),
        vnavEvents.on(`vnav_toc_global_leg_index${vnavTopicSuffix}`).whenChanged().handle(legIndex => {
          this.vnavTocLegIndexSource.set(legIndex);
        }),
        vnavEvents.on(`vnav_boc_global_leg_index${vnavTopicSuffix}`).whenChanged().handle(legIndex => {
          this.vnavBocLegIndexSource.set(legIndex);
        }),
        vnavEvents.on(`vnav_toc_leg_distance${vnavTopicSuffix}`).withPrecision(0).handle(distance => {
          this.vnavTocLegDistanceSource.set(distance, UnitType.METER);
        }),
        vnavEvents.on(`vnav_toc_distance${vnavTopicSuffix}`).withPrecision(0).handle(distance => {
          this.vnavDistanceToTocSource.set(distance, UnitType.METER);
        })
      );
    }
  }

  /**
   * Sets the index of the displayed plan.
   * @param index The index of the displayed plan.
   * @throws Error if this data provider has been destroyed.
   */
  public setPlanIndex(index: number): void {
    if (!this.isAlive) {
      throw new Error('MapFlightPlannerPlanDataProvider: cannot modify a dead provider');
    }

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
    const planner = this.planner.get();

    if (planner && planner.hasFlightPlan(this.planIndex)) {
      this._plan.set(planner.getFlightPlan(this.planIndex));
    } else {
      this._plan.set(null);
    }
  }

  /**
   * Updates subjects related to the active plan.
   */
  private updateActivePlanRelatedSubs(): void {
    this.updateActiveLegIndex();

    const planner = this.planner.get();

    if (planner && this.planIndex === planner.activePlanIndex) {
      for (const sub of this.activePlanSubs) {
        sub.resume(true);
      }
    } else {
      for (const sub of this.activePlanSubs) {
        sub.pause();
      }

      this._lnavData.set(undefined);
      this._vnavTodLegIndex.set(-1);
      this._vnavBodLegIndex.set(-1);
      this._vnavTodLegDistance.set(0);
      this._vnavDistanceToTod.set(0);
      this._vnavTocLegIndex.set(-1);
      this._vnavBocLegIndex.set(-1);
      this._vnavTocLegDistance.set(0);
      this._vnavDistanceToToc.set(0);
      this._obsCourse.set(undefined);
    }
  }

  /**
   * Updates the active leg index.
   */
  private updateActiveLegIndex(): void {
    const planner = this.planner.get();
    const plan = this.plan.get();
    this._activeLateralLegIndex.set(planner && plan && this.planIndex === planner.activePlanIndex ? plan.activeLateralLeg : -1);
  }

  /**
   * Updates the OBS course.
   */
  private updateObsCourse(): void {
    this._obsCourse.set(this.isObsActive ? this.obsCourseValue : undefined);
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const sub of this.fplSubs) {
      sub.destroy();
    }

    for (const sub of this.lnavSourceSubs) {
      sub.destroy();
    }

    for (const sub of this.vnavSourceSubs) {
      sub.destroy();
    }
  }
}