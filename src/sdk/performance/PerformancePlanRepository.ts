import { FlightPlanner } from '../flightplan/FlightPlanner';
import { PerformancePlan, PerformancePlanUtils } from './PerformancePlan';
import { EventBus } from '../data/EventBus';
import { PerformancePlanDefinition, PerformancePlanDefinitionObject } from './PerformancePlanDefinitions';
import { Subject } from '../sub/Subject';
import { PerformancePlanProxy, PerformancePlanProxyCallbacks } from './PerformancePlanProxy';
import { ProxiedPerformancePlanProperty } from './ProxiedPerformancePlanProperty';
import { MutableSubscribable } from '../sub';

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
interface BasePerformancePlanSyncEvents {
  /** An event for updates to the performance plan */
  performancePlanChanged: PerformancePlanDataPacket;
}

/**
 * The event topic suffix for a {@link PerformancePlanRepository} with a specific ID.
 */
type FlightPlannerEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events published by a {@link PerformancePlanRepository} with a specific ID.
 */
export type PerformancePlanSyncEventsForId<ID extends string> = {
  [P in keyof BasePerformancePlanSyncEvents as `${P}${FlightPlannerEventSuffix<ID>}`]: BasePerformancePlanSyncEvents[P];
};

/**
 * All possible performance plan repository cross-instrument sync events.
 */
type PerformancePlanSyncEvents = BasePerformancePlanSyncEvents & PerformancePlanSyncEventsForId<string>;

/**
 * Correlates flight plan indices with performance plan objects
 */
export class PerformancePlanRepository<P extends PerformancePlan, ID extends string = any> {
  public static DEFAULT_VALUES_PLAN_INDEX = Number.MAX_SAFE_INTEGER;

  private static SYNC_PLAN_INDEX = PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX - 1;
  private readonly repoId = Math.floor(Math.random() * 10000000);

  private readonly eventSuffix = (this.id === '' ? '' : `_${this.id}`) as FlightPlannerEventSuffix<ID>;

  private _plans: P[] = [];

  public plans: readonly P[] = this._plans;

  /**
   * Ctor
   *
   * @param id the performance plan repository ID
   * @param bus the event bus
   * @param flightPlanner a flight planner instance
   * @param definitions an object containing definitions for each of the performance plan's properties
   */
  constructor(
    private readonly id: ID,
    private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly definitions: PerformancePlanDefinitionObject<P>,
  ) {
    this._plans[PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX] = this.createPlanFromDefinitions();
    this._plans[PerformancePlanRepository.SYNC_PLAN_INDEX] = this.createPlanFromDefinitions();
    this._plans[flightPlanner.activePlanIndex] = this.createPlanFromDefinitions();

    const sub = this.bus.getSubscriber<PerformancePlanSyncEvents>();

    sub.on(`performancePlanChanged${this.eventSuffix}`).handle((data): void => {
      if (data.repoId !== this.repoId) {
        PerformancePlanUtils.deserializeInto(data.serializedPlan, this._plans[PerformancePlanRepository.SYNC_PLAN_INDEX]);

        if (this.has(data.planIndex)) {
          this.copy(PerformancePlanRepository.SYNC_PLAN_INDEX, data.planIndex, true, false);
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
    return this._plans[index] !== undefined;
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
  public forFlightPlanIndex(index: number): P {
    const existing = this._plans[index];

    if (!existing) {
      return this.create(index);
    }

    return existing;
  }

  /**
   * Gets the active plan. This is the plan that always exists even if there is no valid flight plan yet.
   * @returns the active plan
   */
  public getActivePlan(): P {
    return this._plans[this.flightPlanner.activePlanIndex];
  }

  /**
   * Returns the performance plan containing default values
   *
   * @returns the plan
   */
  public defaultValuesPlan(): P {
    return this._plans[PerformancePlanRepository.DEFAULT_VALUES_PLAN_INDEX];
  }

  /**
   * Returns whether this plan repository has nay valid plans
   *
   * @returns boolean
   */
  public hasAnyPlan(): boolean {
    return this._plans.some((it, index) => !!it && this.flightPlanner.hasFlightPlan(index));
  }

  /**
   * Creates a performance plan at the given index if it doesn't exist, or returns the existing one
   *
   * @param atIndex the index
   *
   * @returns the created plan
   */
  public create(atIndex: number): P {
    if (!this.has(atIndex)) {
      const newPerformancePlan = this.createPlanFromDefinitions();

      this._plans[atIndex] = newPerformancePlan;

      return newPerformancePlan;
    } else {
      return this._plans[atIndex];
    }
  }

  /**
   * Copies a performance plan onto another
   *
   * @param from from index
   * @param to to index
   * @param skipChecks whether to skip flight planner checks
   * @param sync whether to trigger a perf plan sync
   */
  public copy(from: number, to: number, skipChecks = false, sync = true): void {
    const fromPlan = this._plans[from];
    const toPlan = skipChecks ? this._plans[to] : this.forFlightPlanIndex(to);

    // Copy data
    for (const key in toPlan) {
      const fromValue = (fromPlan as any)[key];
      const toValue = (toPlan as any)[key];

      if (fromValue instanceof Subject && toValue instanceof Subject) {
        // do a shallow comparison of properties if fromValue is a complex type
        if (typeof fromValue.get() === 'object' && this.isSameObject(fromValue.get(), toValue.get())) {
          continue;
        }
        toValue.set(fromValue.get());
      }
    }

    sync && this.triggerSync(to);
  }

  /**
   * Checks whether two objects are the same by performing a (very) shallow comparison.
   * @param obj1 The first object
   * @param obj2 The second object
   * @returns true if the objects are the same
   */
  private isSameObject(obj1: any, obj2: any): boolean {
    // Check if the values are null or undefined
    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }

    for (const prop in obj1) {
      if (typeof obj1[prop] === 'object') {
        continue;
      }
      if (obj1[prop] !== obj2[prop]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Triggers a synchronisation of the active plan performance plan over the EventBus.
   * @param planIndex the plan index
   */
  public triggerSync(planIndex: number): void {
    const packet: PerformancePlanDataPacket = {
      repoId: this.repoId,
      planIndex,
      serializedPlan: PerformancePlanUtils.serialize(this._plans[planIndex]),
    };

    this.bus.getPublisher<PerformancePlanSyncEvents>().pub(`performancePlanChanged${this.eventSuffix}`, packet, true, true);
  }

  /**
   * Creates a performance plan from the definitions object
   *
   * @returns a performance plan with default values filled
   */
  private createPlanFromDefinitions(): P {
    const plan: Record<string, MutableSubscribable<any>> = {};

    for (const [key, definition] of Object.entries(this.definitions)) {
      plan[key] = Subject.create((definition as PerformancePlanDefinition<any>).defaultValue);
    }

    return plan as P;
  }

  /**
   * Creates a performance plan proxy from the definitions object
   *
   * @param callbacks an object containing the callbacks to attach to the proxy
   *
   * @returns a performance plan proxy
   */
  public createPerformancePlanProxy(callbacks: PerformancePlanProxyCallbacks<P>): PerformancePlanProxy<P> {
    const defaultValuesPlan = this.defaultValuesPlan();
    const definitions = this.definitions;

    const proxy: PerformancePlanProxy<P> = {
      defaultValuesPlan,

      /** @inheritDoc */
      switchToPlan(plan: P, initial: boolean) {
        for (const [key, definition] of Object.entries(definitions)) {
          if (initial || (definition as PerformancePlanDefinition<any>).differentiateBetweenFlightPlans) {
            const typedKey = key as keyof P;

            (this as PerformancePlanProxy<P>)[typedKey].switchToPlan(plan);
          }
        }
      },

      /** @inheritDoc */
      onBeforeEdit(property: ProxiedPerformancePlanProperty<P, keyof P>, newValue: any) {
        callbacks.onBeforeEdit(property, newValue);
      },

      /** @inheritDoc */
      onAfterEdit(property: ProxiedPerformancePlanProperty<P, keyof P>, newValue: any) {
        callbacks.onAfterEdit(property, newValue);
      },
    } as unknown as PerformancePlanProxy<P>;

    for (const [key, definition] of Object.entries(definitions)) {
      const typedKey = key as keyof P;
      const typedDefinition = definition as PerformancePlanDefinition<any>;

      const property = new ProxiedPerformancePlanProperty<P, typeof typedKey>(
        proxy,
        typedKey,
        typedDefinition.differentiateBetweenFlightPlans ?? false,
      );

      (proxy as unknown as Record<keyof P, ProxiedPerformancePlanProperty<P, typeof typedKey>>)[typedKey] = property;
    }

    proxy.switchToPlan(this.getActivePlan(), true);

    for (const [key, definition] of Object.entries(definitions)) {
      const typedKey = key as keyof P;
      const typedDefinition = definition as PerformancePlanDefinition<any>;

      proxy[typedKey].set(typedDefinition.defaultValue);
    }

    return proxy;
  }
}
