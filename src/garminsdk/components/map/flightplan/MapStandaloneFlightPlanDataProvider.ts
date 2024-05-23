import {
  ActiveLegType, FlightPlan, LNavTrackingState, NumberUnitInterface, NumberUnitSubject, SubEvent, Subject, Subscribable, Subscription, UnitFamily,
  UnitType, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { MapFlightPlanDataProvider } from './MapFlightPlanDataProvider';

/**
 * A {@link MapFlightPlanDataProvider} which provides data for a standalone flight plan not owned by a flight planner.
 */
export class MapStandaloneFlightPlanPlanDataProvider implements MapFlightPlanDataProvider {
  /** @inheritdoc */
  public readonly planModified = new SubEvent<this, void>();

  /** @inheritdoc */
  public readonly planCalculated = new SubEvent<this, void>();

  private readonly _activeLateralLegIndex = Subject.create(0);
  /** @inheritdoc */
  public readonly activeLateralLegIndex: Subscribable<number> = this._activeLateralLegIndex;

  /** @inheritdoc */
  public readonly lnavData: Subscribable<LNavTrackingState | undefined> = Subject.create(undefined);

  /** @inheritdoc */
  public readonly vnavState: Subscribable<VNavState> = Subject.create(VNavState.Disabled);
  /** @inheritdoc */
  public readonly vnavPathMode: Subscribable<VNavPathMode> = Subject.create(VNavPathMode.None);

  /** @inheritdoc */
  public readonly vnavTodLegIndex: Subscribable<number> = Subject.create(-1);

  /** @inheritdoc */
  public readonly vnavBodLegIndex: Subscribable<number> = Subject.create(-1);

  /** @inheritdoc */
  public readonly vnavTodLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  /** @inheritdoc */
  public readonly vnavDistanceToTod: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  /** @inheritdoc */
  public readonly vnavTocLegIndex: Subscribable<number> = Subject.create(-1);

  /** @inheritdoc */
  public readonly vnavBocLegIndex: Subscribable<number> = Subject.create(-1);

  /** @inheritdoc */
  public readonly vnavTocLegDistance: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  /** @inheritdoc */
  public readonly vnavDistanceToToc: Subscribable<NumberUnitInterface<UnitFamily.Distance>>
    = NumberUnitSubject.create(UnitType.METER.createNumber(0));

  /** @inheritdoc */
  public readonly obsCourse: Subscribable<number | undefined> = Subject.create(undefined);

  private oldPlan: FlightPlan | null = null;

  private readonly planSub: Subscription;

  /**
   * Constructor.
   * @param plan A subscribable which provides the flight plan for this data provider.
   */
  public constructor(public readonly plan: Subscribable<FlightPlan | null>) {
    this.planSub = plan.sub(flightPlan => {
      if (this.oldPlan !== null) {
        this.oldPlan.events.onActiveLegChanged = undefined;
        this.oldPlan.events.onCalculated = undefined;
      }

      this.oldPlan = flightPlan;

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

  /**
   * Destroys this data provider.
   */
  public destroy(): void {
    this.planSub.destroy();

    if (this.oldPlan !== null) {
      this.oldPlan.events.onActiveLegChanged = undefined;
      this.oldPlan.events.onCalculated = undefined;
    }

    this.oldPlan = null;
  }
}