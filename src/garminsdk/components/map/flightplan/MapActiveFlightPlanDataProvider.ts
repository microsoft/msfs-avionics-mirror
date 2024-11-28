import { EventBus, FlightPlanner, Subject, Subscribable, SubscribableUtils, Subscription } from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';
import { MapFlightPlannerPlanDataProvider, MapFlightPlannerPlanDataProviderOptions } from './MapFlightPlannerPlanDataProvider';

/**
 * A map flight plan layer data provider that provides the active flight plan from a flight planner to be displayed.
 */
export class MapActiveFlightPlanDataProvider implements MapFlightPlanDataProvider {
  private readonly planner: Subject<FlightPlanner | null>;

  private readonly provider: MapFlightPlannerPlanDataProvider;

  /** @inheritDoc */
  public readonly plan;
  /** @inheritDoc */
  public readonly planModified;
  /** @inheritDoc */
  public readonly planCalculated;
  /** @inheritDoc */
  public readonly activeLateralLegIndex;
  /** @inheritDoc */
  public readonly lnavData;
  /** @inheritDoc */
  public readonly vnavState;
  /** @inheritDoc */
  public readonly vnavPathMode;
  /** @inheritDoc */
  public readonly vnavTodLegIndex;
  /** @inheritDoc */
  public readonly vnavBodLegIndex;
  /** @inheritDoc */
  public readonly vnavTodLegDistance;
  /** @inheritDoc */
  public readonly vnavDistanceToTod;
  /** @inheritDoc */
  public readonly vnavTocLegIndex;
  /** @inheritDoc */
  public readonly vnavBocLegIndex;
  /** @inheritDoc */
  public readonly vnavTocLegDistance;
  /** @inheritDoc */
  public readonly vnavDistanceToToc;
  /** @inheritDoc */
  public readonly obsCourse;

  private readonly plannerSub: Subscription;
  private fplIndexSub?: Subscription;

  /**
   * Creates a new instance of MapActiveFlightPlanDataProvider.
   * @param bus The event bus.
   * @param options Options with which to configure the data provider.
   */
  public constructor(
    bus: EventBus,
    options: Readonly<MapFlightPlannerPlanDataProviderOptions>
  );
  /**
   * Creates a new instance of MapActiveFlightPlanDataProvider.
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

    const plannerSubscribable = SubscribableUtils.toSubscribable(flightPlanner, true);
    this.planner = Subject.create(plannerSubscribable.get());

    this.provider = new MapFlightPlannerPlanDataProvider(this.bus, { ...options, flightPlanner: this.planner });

    this.plan = this.provider.plan;
    this.planModified = this.provider.planModified;
    this.planCalculated = this.provider.planCalculated;
    this.activeLateralLegIndex = this.provider.activeLateralLegIndex;
    this.lnavData = this.provider.lnavData;
    this.vnavState = this.provider.vnavState;
    this.vnavPathMode = this.provider.vnavPathMode;
    this.vnavTodLegIndex = this.provider.vnavTodLegIndex;
    this.vnavBodLegIndex = this.provider.vnavBodLegIndex;
    this.vnavTodLegDistance = this.provider.vnavTodLegDistance;
    this.vnavDistanceToTod = this.provider.vnavDistanceToTod;
    this.vnavTocLegIndex = this.provider.vnavTocLegIndex;
    this.vnavBocLegIndex = this.provider.vnavBocLegIndex;
    this.vnavTocLegDistance = this.provider.vnavTocLegDistance;
    this.vnavDistanceToToc = this.provider.vnavDistanceToToc;
    this.obsCourse = this.provider.obsCourse;

    this.plannerSub = plannerSubscribable.sub(this.onFlightPlannerChanged.bind(this), true);
  }

  /**
   * Responds to when this provider's flight planner changes.
   * @param planner The new flight planner.
   */
  private onFlightPlannerChanged(planner: FlightPlanner | null): void {
    this.fplIndexSub?.destroy();
    this.fplIndexSub = undefined;

    if (planner) {
      this.fplIndexSub = planner.onEvent('fplIndexChanged').handle(data => { this.provider.setPlanIndex(data.planIndex); });
    }

    this.planner.set(planner);
    this.provider.setPlanIndex(planner ? planner.activePlanIndex : -1);
  }

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.plannerSub.destroy();
    this.fplIndexSub?.destroy();
    this.provider.destroy();
  }
}