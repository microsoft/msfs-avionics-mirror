import { EventBus, FlightPlanner, FlightPlannerEvents } from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';
import { MapFlightPlannerPlanDataProvider } from './MapFlightPlannerPlanDataProvider';

/**
 * A map flight plan layer data provider which provides the active flight plan to be displayed.
 */
export class MapActiveFlightPlanDataProvider implements MapFlightPlanDataProvider {
  private readonly provider = new MapFlightPlannerPlanDataProvider(this.bus, this.planner);

  /** @inheritdoc */
  public readonly plan = this.provider.plan;
  /** @inheritdoc */
  public readonly planModified = this.provider.planModified;
  /** @inheritdoc */
  public readonly planCalculated = this.provider.planCalculated;
  /** @inheritdoc */
  public readonly activeLateralLegIndex = this.provider.activeLateralLegIndex;
  /** @inheritdoc */
  public readonly lnavData = this.provider.lnavData;
  /** @inheritdoc */
  public readonly vnavState = this.provider.vnavState;
  /** @inheritdoc */
  public readonly vnavPathMode = this.provider.vnavPathMode;
  /** @inheritdoc */
  public readonly vnavTodLegIndex = this.provider.vnavTodLegIndex;
  /** @inheritdoc */
  public readonly vnavBodLegIndex = this.provider.vnavBodLegIndex;
  /** @inheritdoc */
  public readonly vnavTodLegDistance = this.provider.vnavTodLegDistance;
  /** @inheritdoc */
  public readonly vnavDistanceToTod = this.provider.vnavDistanceToTod;
  /** @inheritdoc */
  public readonly vnavTocLegIndex = this.provider.vnavTocLegIndex;
  /** @inheritdoc */
  public readonly vnavBocLegIndex = this.provider.vnavBocLegIndex;
  /** @inheritdoc */
  public readonly vnavTocLegDistance = this.provider.vnavTocLegDistance;
  /** @inheritdoc */
  public readonly vnavDistanceToToc = this.provider.vnavDistanceToToc;
  /** @inheritdoc */
  public readonly obsCourse = this.provider.obsCourse;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param planner The flight planner.
   */
  constructor(protected readonly bus: EventBus, protected readonly planner: FlightPlanner) {
    const plannerEvents = bus.getSubscriber<FlightPlannerEvents>();
    plannerEvents.on('fplIndexChanged').handle(data => { this.provider.setPlanIndex(data.planIndex); });

    this.provider.setPlanIndex(planner.activePlanIndex);
  }
}