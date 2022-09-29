import {
  ActiveLegType, FlightPlan, NumberUnitInterface, NumberUnitSubject, SubEvent, Subject, Subscribable, UnitFamily, UnitType, VNavPathMode, VNavState
} from 'msfssdk';

import { FlightPathPlanRendererLNavData } from './MapFlightPathPlanRenderer';
import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';

/**
 * A {@link MapFlightPlanDataProvider} which provides data for a standalone flight plan not owned by a flight planner.
 */
export class MapStandaloneFlightPlanPlanDataProvider implements MapFlightPlanDataProvider {
  public readonly planModified = new SubEvent<this, void>();

  public readonly planCalculated = new SubEvent<this, void>();

  private readonly _activeLateralLegIndex = Subject.create(0);
  public readonly activeLateralLegIndex: Subscribable<number> = this._activeLateralLegIndex;

  public readonly lnavData: Subscribable<FlightPathPlanRendererLNavData | undefined> = Subject.create(undefined);

  public readonly vnavState: Subscribable<VNavState> = Subject.create(VNavState.Disabled);
  public readonly vnavPathMode: Subscribable<VNavPathMode> = Subject.create(VNavPathMode.None);

  public readonly vnavTodLegIndex: Subscribable<number> = Subject.create(-1);

  public readonly vnavBodLegIndex: Subscribable<number> = Subject.create(-1);

  public readonly vnavTodLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.createFromNumberUnit(UnitType.METER.createNumber(0));

  public readonly vnavDistanceToTod: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.createFromNumberUnit(UnitType.METER.createNumber(0));

  public readonly obsCourse: Subscribable<number | undefined> = Subject.create(undefined);

  private oldPlan: FlightPlan | null = null;

  /**
   * Constructor.
   * @param plan A subscribable which provides the flight plan for this data provider.
   */
  constructor(public readonly plan: Subscribable<FlightPlan | null>) {
    plan.sub(flightPlan => {
      if (this.oldPlan !== null) {
        this.oldPlan.events.onActiveLegChanged = undefined;
        this.oldPlan.events.onCalculated = undefined;
      }

      if (flightPlan !== null) {
        this._activeLateralLegIndex.set(flightPlan.activeLateralLeg);

        flightPlan.events.onActiveLegChanged = (
          index: number,
          segmentIndex: number,
          legIndex: number,
          previousSegmentIndex: number,
          previousLegIndex: number,
          type: ActiveLegType
        ): void => {
          if (type === ActiveLegType.Lateral) {
            this._activeLateralLegIndex.set(index);
          }
        };

        flightPlan.events.onCalculated = (): void => {
          this.planCalculated.notify(this);
        };
      } else {
        this._activeLateralLegIndex.set(0);
      }
    }, true);
  }
}