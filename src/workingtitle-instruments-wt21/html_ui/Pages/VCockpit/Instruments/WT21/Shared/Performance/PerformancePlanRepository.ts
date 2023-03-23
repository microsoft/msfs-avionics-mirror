import { EventBus, FlightPlanner, FlightPlannerEvents, OriginDestChangeType, Subject } from '@microsoft/msfs-sdk';

import { PerformancePlan } from './PerformancePlan';

/** Data package for performance plan sync events */
interface PerformancePlanDataPacket {
  /** The repository source id */
  repoId: number;
  /** The index of the plan */
  planIndex: number;
  /** The (serialized) plan data */
  serializedPlan: string;
}

/** Sync update event for performance plan data. */
interface PerformancePlanSyncEvent {
  /** An event for updates to the performance plan */
  performancePlanChanged: PerformancePlanDataPacket;
}

/**
 * Correlates flight plan indices with performance plan objects
 */
export class PerformancePlanRepository {
  private static DEFAULT_VALUES_PLAN_INDEX = Number.MAX_SAFE_INTEGER;
  private static SYNC_PLAN_INDEX = PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX - 1;
  private readonly repoId = Math.floor(Math.random() * 10000000);

  private plans: PerformancePlan[] = [];

  /**
   * Ctor
   * @param flightPlanner a flight planner instance
   * @param bus the event bus
   */
  constructor(
    private readonly flightPlanner: FlightPlanner,
    private readonly bus: EventBus,
  ) {
    this.plans[PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX] = PerformancePlan.createFromDefaults(bus);
    this.plans[PerformancePlanRepository.SYNC_PLAN_INDEX] = PerformancePlan.createFromDefaults(bus);
    this.plans[0] = PerformancePlan.createFromDefaults(bus);

    const sub = this.bus.getSubscriber<FlightPlannerEvents & PerformancePlanSyncEvent>();

    sub.on('fplOriginDestChanged').handle((data) => {
      if (data.type === OriginDestChangeType.OriginAdded || data.type === OriginDestChangeType.OriginRemoved) {
        this.copy(PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX, data.planIndex);
      }
    });

    sub.on('performancePlanChanged').handle((data): void => {
      if (data.repoId !== this.repoId) {
        this.plans[PerformancePlanRepository.SYNC_PLAN_INDEX].deserializeInto(data.serializedPlan);

        if (this.has(data.planIndex)) {
          this.copy(PerformancePlanRepository.SYNC_PLAN_INDEX, data.planIndex, true);
        }
      }
    });
  }

  /**
   * Whether the repository has a performance plan already stored for a given index
   *
   * @param index the index
   *
   * @returns boolean
   */
  public has(index: number): boolean {
    return this.plans[index] !== undefined;
  }

  /**
   * Returns a performance plan for a given flight plan index, or creates it
   *
   * @param index flight plan index
   *
   * @throws if an invalid flight plan index is specified
   *
   * @returns the performance plan
   */
  public forFlightPlanIndex(index: number): PerformancePlan {
    const existing = this.plans[index];

    const planExists = this.flightPlanner.hasFlightPlan(index);

    if (!planExists) {
      if (existing) {
        delete this.plans[index];
      }

      throw new Error(`Invalid flight plan index=${index}`);
    }

    if (!existing) {
      return this.create(index);
    }

    return existing;
  }

  /**
   * Gets the active plan. This is the plan that always exists even if there is no valid flight plan yet.
   * @returns the active plan
   */
  public getActivePlan(): PerformancePlan {
    return this.plans[0];
  }

  /**
   * Gets the mod plan.
   * @returns the mod plan
   */
  public getModPlan(): PerformancePlan {
    return this.plans[1];
  }

  /**
   * Returns the performance plan containing default values
   *
   * @returns the plan
   */
  public defaultValuesPlan(): PerformancePlan {
    return this.plans[PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX];
  }

  /**
   * Returns whether this plan repository has nay valid plans
   *
   * @returns boolean
   */
  public hasAnyPlan(): boolean {
    return this.plans.some((it, index) => !!it && this.flightPlanner.hasFlightPlan(index));
  }

  /**
   * Creates a performance plan at the given index
   *
   * @param atIndex the index
   *
   * @returns the created plan
   */
  public create(atIndex: number): PerformancePlan {
    const newPerformancePlan = PerformancePlan.createFromDefaults(this.bus);

    this.plans[atIndex] = newPerformancePlan;

    return newPerformancePlan;
  }

  /**
   * Copies a performance plan onto another
   *
   * @param from from index
   * @param to to index
   * @param skipChecks whether to skip flight planner checks
   */
  public copy(from: number, to: number, skipChecks = false): void {
    const fromPlan = this.plans[from];
    const toPlan = skipChecks ? this.plans[to] : this.forFlightPlanIndex(to);

    // Copy data
    for (const key in toPlan) {
      const fromValue = (fromPlan as any)[key];
      const toValue = (toPlan as any)[key];

      if (fromValue instanceof Subject && toValue instanceof Subject) {
        toValue.set(fromValue.get());
      }
    }
  }

  /**
   * Triggers a synchronisation of the active plan performance plan over the EventBus.
   * @param planIndex the plan index
   */
  public triggerSync(planIndex: number): void {
    const packet: PerformancePlanDataPacket = {
      repoId: this.repoId,
      planIndex,
      serializedPlan: this.plans[planIndex].serialize()
    };

    this.bus.getPublisher<PerformancePlanSyncEvent>().pub('performancePlanChanged', packet, true, true);
  }
}