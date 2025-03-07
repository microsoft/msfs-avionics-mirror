import { Consumer } from '../data/Consumer';
import { EventBus, Publisher } from '../data/EventBus';
import { EventSubscriber } from '../data/EventSubscriber';
import { UnitType } from '../math/NumberUnit';
import { FlightPlanLeg, LegType } from '../navigation/Facilities';
import { IcaoValue } from '../navigation/Icao';
import { ICAO } from '../navigation/IcaoUtils';
import { SubEvent } from '../sub/SubEvent';
import { FlightPathCalculator } from './flightpath/FlightPathCalculator';
import {
  ActiveLegType, DirectToData, FlightPlan, FlightPlanModBatch, LegEventType, OriginDestChangeType, PlanEvents,
  SegmentEventType
} from './FlightPlan';
import { FlightPlanSegment, FlightPlanSegmentType, LegDefinition, ProcedureDetails, VerticalData } from './FlightPlanning';

/**
 * Events published by {@link FlightPlanner} indexed by base topic names.
 */
export type BaseFlightPlannerEvents = {
  /** A flight plan has been modified from a secondary source */
  fplLegChange: FlightPlanLegEvent;

  /** A flight plan has been modified from a secondary source */
  fplSegmentChange: FlightPlanSegmentEvent;

  /** A flight plan has changed an active leg. */
  fplActiveLegChange: FlightPlanActiveLegEvent;

  /** A flight plan has update origin/dest information. */
  fplOriginDestChanged: FlightPlanOriginDestEvent;

  /** A flight plan has updated procedure details. */
  fplProcDetailsChanged: FlightPlanProcedureDetailsEvent;

  /** A full flight plan has been loaded. */
  fplLoaded: FlightPlanIndicationEvent;

  /** A new flight plan has been created. */
  fplCreated: FlightPlanIndicationEvent;

  /** A flight plan has been deleted. */
  fplDeleted: FlightPlanIndicationEvent;

  /** The active flight plan index has changed in the Flight Planner. */
  fplIndexChanged: FlightPlanIndicationEvent;

  /** A global flight plan user data key-value pair has been set. */
  fplUserDataSet: FlightPlanUserDataEvent;

  /** A global flight plan user data key-value pair has been deleted. */
  fplUserDataDelete: FlightPlanUserDataEvent;

  /** A flight plan leg user data key-value pair has been set. */
  fplLegUserDataSet: FlightPlanLegUserDataEvent;

  /** A flight plan leg user data key-value pair has been deleted. */
  fplLegUserDataDelete: FlightPlanLegUserDataEvent;

  /** Direct to data has been changed in the flight plan. */
  fplDirectToDataChanged: FlightPlanDirectToDataEvent;

  /** A flight plan has begun calculating lateral flight path vectors. */
  fplCalculatePended: FlightPlanCalculatedEvent;

  /** A flight plan has finished calculated lateral flight path vectors. */
  fplCalculated: FlightPlanCalculatedEvent;

  /** The flight plan has been copied. */
  fplCopied: FlightPlanCopiedEvent;

  /** A flight plan modification batch was opened. */
  fplBatchOpened: FlightPlanModBatchEvent;

  /** A flight plan modification batch was closed. */
  fplBatchClosed: FlightPlanModBatchEvent;

  /**
   * A flight plan modification batch was closed and all pending asynchronous operations assigned to the batch have
   * finished.
   */
  fplBatchAsyncClosed: FlightPlanModBatchEvent;
};

/**
 * The event topic suffix for a {@link FlightPlanner} with a specific ID.
 */
type FlightPlannerEventSuffix<ID extends string> = ID extends '' ? '' : `_${ID}`;

/**
 * Events published by a {@link FlightPlanner} with a specific ID.
 */
export type FlightPlannerEventsForId<ID extends string> = {
  [P in keyof BaseFlightPlannerEvents as `${P}${FlightPlannerEventSuffix<ID>}`]: BaseFlightPlannerEvents[P];
};

/**
 * All possible events published by {@link FlightPlanner}.
 */
export type FlightPlannerEvents = BaseFlightPlannerEvents & FlightPlannerEventsForId<string>;

/**
 * An event fired when a flight plan leg is added, removed, or its vertical data is changed.
 */
export interface FlightPlanLegEvent {
  /** The type of the leg event. */
  readonly type: LegEventType;

  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The index of the segment containing the changed flight plan leg. */
  readonly segmentIndex: number;

  /** The index of the changed flight plan leg in its containing segment. */
  readonly legIndex: number;

  /** The leg that was added, removed, or changed. */
  readonly leg: LegDefinition;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event fired when an active leg changes.
 */
export interface FlightPlanActiveLegEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The global index of the active leg. */
  readonly index: number;

  /** The index of the segment in which the active leg is. */
  readonly segmentIndex: number;

  /** The index of the leg within the segment. */
  readonly legIndex: number;

  /** The index of the segment in which the previously active leg is. */
  readonly previousSegmentIndex: number;

  /** The index of the previously active leg within the previously active segment. */
  readonly previousLegIndex: number;

  /** The type of active leg that changed. */
  readonly type: ActiveLegType;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event fired when there are segment related changes.
 */
export interface FlightPlanSegmentEvent {
  /** The type of the segment change. */
  readonly type: SegmentEventType;

  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The current leg selected. */
  readonly segmentIndex: number;

  /** The segment that was added, removed, or changed. */
  readonly segment?: FlightPlanSegment;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when the origin and/or destination information
 * is updated.
 */
export interface FlightPlanOriginDestEvent {
  /** The type of change. */
  readonly type: OriginDestChangeType;

  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The ICAO value of the airport that was changed. */
  readonly airportIcao?: IcaoValue;

  /**
   * The ICAO string (V1) of the airport that was changed.
   * @deprecated Please use `airportIcao` instead.
   */
  readonly airport?: string;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when the flight plan procedure details changs.
 */
export interface FlightPlanProcedureDetailsEvent {
  /** THe index of the flight plan. */
  readonly planIndex: number;

  /** The procedure details that changed. */
  readonly details: Readonly<ProcedureDetails>;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when an instrument requests a full set
 * of plans from the bus.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FlightPlanRequestEvent {
  /** A unique ID attached to the request. */
  readonly uid: number;
}

/**
 * An event generated when an instrument responds to a full
 * flight plan set request.
 */
export interface FlightPlanResponseEvent {
  /** The unique ID of the request that triggered this response. */
  readonly uid: number;

  /** The plans contained by the flight planner. */
  readonly flightPlans: (FlightPlan | null)[];

  /** The index of the active plan. */
  readonly planIndex: number;
}

/**
 * An event generated when a full plan has been loaded, created, or became active.
 */
export interface FlightPlanIndicationEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;
}

/**
 * An event generated when a global flight plan user data key-value pair is changed.
 */
export interface FlightPlanUserDataEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The key of the user data. */
  readonly key: string;

  /** The user data. Not defined if the user data was deleted. */
  readonly data?: any;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when a flight plan leg user data key-value pair is changed.
 */
export interface FlightPlanLegUserDataEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The index of the segment containing the user data's flight plan leg. */
  readonly segmentIndex: number;

  /** The index of the user data's flight plan leg in its containing segment. */
  readonly legIndex: number;

  /** The user data's flight plan leg. */
  readonly leg: LegDefinition;

  /** The key of the user data. */
  readonly key: string;

  /** The user data. Not defined if the user data was deleted. */
  readonly data?: any;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when direct to data is changed in the flight plan.
 */
export interface FlightPlanDirectToDataEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The direct to data. */
  readonly directToData: DirectToData;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when a flight plan lateral vectorization is started or completed.
 */
export interface FlightPlanCalculatedEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The global index of the flight plan leg that the path was generated from. */
  readonly index?: number;

  /**
   * The modification batch stack to which the calculation was assigned, in order of increasing nestedness. Not
   * defined if the calculation was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when a flight plan is copied to another flight plan.
 */
export interface FlightPlanCopiedEvent {
  /** The index of the flight plan that was copied. */
  readonly planIndex: number;

  /** The index that the flight plan was copied to. */
  readonly targetPlanIndex: number;

  /** Whether this copy should include flight plan calculations. */
  readonly copyCalcs: boolean;

  /**
   * The modification batch stack in the target plan to which the copy operation was assigned, in order of increasing
   * nestedness. Not defined if the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * An event generated when a flight plan modification batch is manipulated.
 */
export interface FlightPlanModBatchEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** Whether the batch was synced from another instrument. */
  readonly isSynced: boolean;

  /** The batch that was manipulated. */
  readonly batch: Readonly<FlightPlanModBatch>;
}

/**
 * Configuration options for {@link FlightPlanner}.
 */
export type FlightPlannerOptions = {
  /** The flight path calculator to use to compute flight paths for the planner's flight plans. */
  calculator: FlightPathCalculator;

  /** A function which generates flight plan leg names for the planner's flight plans. */
  getLegName?: (leg: FlightPlanLeg) => string | undefined
};

// ------ INTERNAL SYNC EVENTS ------

/**
 * A description of a leg definition that can be included with flight plan sync events.
 */
interface SyncedLegDefinition {
  /** The leg's flight plan leg description. */
  readonly leg: Readonly<FlightPlanLeg>;

  /** The leg's vertical data. */
  readonly verticalData: Readonly<VerticalData>;

  /** The leg definition flags that are applied to the leg. */
  readonly flags: number;
}

// NOTE: FlightPlanLegSyncEvent MUST be a supertype of FlightPlanLegEvent to maintain backwards compatibility. If and
// when it becomes acceptable to break backwards compatibility, this relationship can also be broken.
/**
 * A sync event fired when a flight plan leg is added, removed, or its vertical data is changed.
 */
interface FlightPlanLegSyncEvent {
  /** The type of the leg event. */
  readonly type: LegEventType;

  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The index of the segment containing the changed flight plan leg. */
  readonly segmentIndex: number;

  /** The index of the changed flight plan leg in its containing segment. */
  readonly legIndex: number;

  /** The leg that was changed. Not defined if the leg was removed. */
  readonly leg?: SyncedLegDefinition;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * A description of a flight plan segment that can be included with flight plan sync events.
 */
interface SyncedFlightPlanSegment {
  /** The type of the segment. */
  readonly segmentType: FlightPlanSegmentType;

  /** The airway string assigned to the segment. */
  readonly airway?: string;
}

// NOTE: FlightPlanSegmentSyncEvent MUST be a supertype of FlightPlanSegmentEvent to maintain backwards compatibility.
// If and when it becomes acceptable to break backwards compatibility, this relationship can also be broken.
/**
 * A sync event fired when a flight plan segment was added, inserted, removed, or changed.
 */
interface FlightPlanSegmentSyncEvent {
  /** The type of the segment change. */
  readonly type: SegmentEventType;

  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The current leg selected. */
  readonly segmentIndex: number;

  /** The segment that was changed. Not defined if the segment was removed. */
  readonly segment?: SyncedFlightPlanSegment;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

// NOTE: FlightPlanLegUserDataSyncEvent MUST be a supertype of FlightPlanLegUserDataEvent to maintain backwards
// compatibility. If and when it becomes acceptable to break backwards compatibility, this relationship can also be
// broken.
/**
 * An event generated when a flight plan leg user data key-value pair is changed.
 */
interface FlightPlanLegUserDataSyncEvent {
  /** The index of the flight plan. */
  readonly planIndex: number;

  /** The index of the segment containing the user data's flight plan leg. */
  readonly segmentIndex: number;

  /** The index of the user data's flight plan leg in its containing segment. */
  readonly legIndex: number;

  /** The key of the user data. */
  readonly key: string;

  /** The user data. Not defined if the user data was deleted. */
  readonly data?: any;

  /**
   * The modification batch stack to which the change was assigned, in order of increasing nestedness. Not defined if
   * the change was not assigned to any batches.
   */
  readonly batch?: readonly Readonly<FlightPlanModBatch>[];
}

/**
 * Base flight planner cross-instrument sync events.
 */
type BaseFlightPlannerSyncEvents = {
  /** A flight plan leg has been changed. */
  fplsync_fplLegChange: FlightPlanLegSyncEvent;

  /** A flight plan segment has been changed. */
  fplsync_fplSegmentChange: FlightPlanSegmentSyncEvent;

  /** A flight plan has changed an active leg. */
  fplsync_fplActiveLegChange: FlightPlanActiveLegEvent;

  /** A flight plan has update origin/dest information. */
  fplsync_fplOriginDestChanged: FlightPlanOriginDestEvent;

  /** A flight plan has updated procedure details. */
  fplsync_fplProcDetailsChanged: FlightPlanProcedureDetailsEvent;

  /** A full flight plan has been loaded. */
  fplsync_fplLoaded: FlightPlanIndicationEvent;

  /** A new flight plan has been created. */
  fplsync_fplCreated: FlightPlanIndicationEvent;

  /** A flight plan has been deleted. */
  fplsync_fplDeleted: FlightPlanIndicationEvent;

  /** The active flight plan index has changed in the Flight Planner. */
  fplsync_fplIndexChanged: FlightPlanIndicationEvent;

  /** A global flight plan user data key-value pair has been set. */
  fplsync_fplUserDataSet: FlightPlanUserDataEvent;

  /** A global flight plan user data key-value pair has been deleted. */
  fplsync_fplUserDataDelete: FlightPlanUserDataEvent;

  /** A flight plan leg user data key-value pair has been set. */
  fplsync_fplLegUserDataSet: FlightPlanLegUserDataSyncEvent;

  /** A flight plan leg user data key-value pair has been deleted. */
  fplsync_fplLegUserDataDelete: FlightPlanLegUserDataSyncEvent;

  /** Direct to data has been changed in the flight plan. */
  fplsync_fplDirectToDataChanged: FlightPlanDirectToDataEvent;

  /** A flight plan has begun calculating lateral flight path vectors. */
  fplsync_fplCalculatePended: FlightPlanCalculatedEvent;

  /** A flight plan has finished calculated lateral flight path vectors. */
  fplsync_fplCalculated: FlightPlanCalculatedEvent;

  /** The flight plan has been copied. */
  fplsync_fplCopied: FlightPlanCopiedEvent;

  /** A flight plan modification batch was opened. */
  fplsync_fplBatchOpened: FlightPlanModBatchEvent;

  /** A flight plan modification batch was closed. */
  fplsync_fplBatchClosed: FlightPlanModBatchEvent;

  /**
   * A flight plan modification batch was closed and all pending asynchronous operations assigned to the batch have
   * finished.
   */
  fplsync_fplBatchAsyncClosed: FlightPlanModBatchEvent;

  /** A full set of flight plans has been requested. */
  fplsync_fplRequest: FlightPlanRequestEvent;

  /** A full set of flight plans has been responded to. */
  fplsync_fplResponse: FlightPlanResponseEvent;
}

/**
 * Cross-instrument sync events for a flight planner with a specific ID.
 */
type FlightPlannerSyncEventsForId<ID extends string> = {
  [P in keyof BaseFlightPlannerSyncEvents as `${P}${FlightPlannerEventSuffix<ID>}`]: BaseFlightPlannerSyncEvents[P];
};

/**
 * All possible flight planner cross-instrument sync events.
 */
type FlightPlannerSyncEvents = BaseFlightPlannerSyncEvents & FlightPlannerSyncEventsForId<string>;

/**
 * An entry describing a synced flight plan modification batch.
 */
type SyncedFlightPlanModBatchEntry = {
  /** This entry's synced flight plan modification batch. */
  batch: FlightPlanModBatch;

  /** Whether the batch is closed. */
  isClosed: boolean;

  /** The number of lateral vectorization calculations assigned to this batch that are still pending. */
  pendingCalculateCount: number;

  /** Event data for the batch. */
  eventData: FlightPlanModBatchEvent;
};

/**
 * Manages the active flightplans of the navigational systems.
 */
export class FlightPlanner<ID extends string = any> {

  private static readonly instances = new Map<string, FlightPlanner<any>>();

  private readonly eventSuffix = (this.id === '' ? '' : `_${this.id}`) as FlightPlannerEventSuffix<ID>;
  private readonly eventSubscriber = this.bus.getSubscriber<FlightPlannerEventsForId<ID>>();

  private readonly calculator: FlightPathCalculator;

  /** The flight plans managed by this flight planner. */
  private readonly flightPlans: (FlightPlan | undefined)[] = [];

  /** A publisher for publishing flight planner update events. */
  private readonly publisher: Publisher<FlightPlannerEvents & FlightPlannerSyncEvents>;

  private ignoreSync = false;

  /** The active flight plan index. */
  private _activePlanIndex = 0;

  private lastRequestUid?: number;

  private readonly syncedBatchEntries: (Map<string, SyncedFlightPlanModBatchEntry> | undefined)[] = [];

  /** Invoked when we receive a flight plan response event. */
  public flightPlanSynced = new SubEvent<this, boolean>();

  /**
   * Set a new active plan index.
   * @param planIndex The new active plan index.
   */
  public set activePlanIndex(planIndex: number) {
    this._activePlanIndex = planIndex;
  }

  /**
   * Get the active plan index.
   * @returns The active plan index number.
   */
  public get activePlanIndex(): number {
    return this._activePlanIndex;
  }

  private readonly getLegNameFunc: (leg: FlightPlanLeg) => string | undefined;

  /**
   * Creates an instance of the FlightPlanner.
   * @param id This planner's ID.
   * @param bus The event bus.
   * @param options Options with which to configure the flight planner.
   */
  private constructor(
    public readonly id: ID,
    private readonly bus: EventBus,
    options: Readonly<FlightPlannerOptions>
  ) {

    this.calculator = options.calculator;
    this.getLegNameFunc = options?.getLegName ?? FlightPlanner.buildDefaultLegName;

    this.publisher = bus.getPublisher<FlightPlannerEvents & FlightPlannerSyncEvents>();
    const subscriber = bus.getSubscriber<FlightPlannerSyncEvents>();

    subscriber.on(`fplsync_fplRequest${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onFlightPlanRequest(data));
    subscriber.on(`fplsync_fplResponse${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onFlightPlanResponse(data));
    subscriber.on(`fplsync_fplCreated${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onPlanCreated(data));
    subscriber.on(`fplsync_fplDeleted${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onPlanDeleted(data));
    subscriber.on(`fplsync_fplActiveLegChange${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onActiveLegChanged(data));
    subscriber.on(`fplsync_fplLegChange${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onLegChanged(data));
    subscriber.on(`fplsync_fplSegmentChange${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onSegmentChanged(data));
    subscriber.on(`fplsync_fplOriginDestChanged${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onOriginDestChanged(data));
    subscriber.on(`fplsync_fplProcDetailsChanged${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onProcedureDetailsChanged(data));
    subscriber.on(`fplsync_fplIndexChanged${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onPlanIndexChanged(data));
    subscriber.on(`fplsync_fplUserDataSet${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onUserDataSet(data));
    subscriber.on(`fplsync_fplUserDataDelete${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onUserDataDelete(data));
    subscriber.on(`fplsync_fplLegUserDataSet${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onLegUserDataSet(data));
    subscriber.on(`fplsync_fplLegUserDataDelete${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onLegUserDataDelete(data));
    subscriber.on(`fplsync_fplDirectToDataChanged${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onDirectToDataChanged(data));
    subscriber.on(`fplsync_fplCalculatePended${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onCalculatePended(data));
    subscriber.on(`fplsync_fplCopied${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onPlanCopied(data));
    subscriber.on(`fplsync_fplBatchOpened${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onBatchOpened(data));
    subscriber.on(`fplsync_fplBatchClosed${this.eventSuffix}`).handle(data => !this.ignoreSync && this.onBatchClosed(data));
  }

  /**
   * Gets an event bus subscriber for topics published by this flight planner.
   * @returns An event bus subscriber for topics published by this flight planner.
   */
  public getEventSubscriber(): EventSubscriber<FlightPlannerEventsForId<ID>> {
    return this.eventSubscriber;
  }

  /**
   * Subscribes to one of the event bus topics published by this flight planner.
   * @param baseTopic The base name of the topic to which to subscribe.
   * @returns A consumer for the specified event bus topic.
   */
  public onEvent<K extends keyof BaseFlightPlannerEvents>(baseTopic: K): Consumer<BaseFlightPlannerEvents[K]> {
    return this.eventSubscriber.on(
      `${baseTopic}${this.eventSuffix}` as keyof FlightPlannerEventsForId<ID>
    ) as unknown as Consumer<BaseFlightPlannerEvents[K]>;
  }

  /**
   * Requests synchronization from other FlightPlanner instances.
   */
  public requestSync(): void {
    this.sendFlightPlanRequest();
  }

  /**
   * An event generated when a set of flight plans is requested.
   * @param data The event data.
   */
  private onFlightPlanRequest(data: FlightPlanRequestEvent): void {
    this.ignoreSync = true;
    this.publisher.pub(`fplsync_fplResponse${this.eventSuffix}`, {
      uid: data.uid,
      flightPlans: this.flightPlans.map(plan => {
        if (!plan) {
          return null;
        }

        const newPlan = Object.assign({}, plan) as any;
        newPlan.calculator = undefined;

        return newPlan;
      }), planIndex: this.activePlanIndex
    }, true, false);
    this.ignoreSync = false;
  }

  /**
   * Sends a flight plan request event.
   */
  private sendFlightPlanRequest(): void {
    this.ignoreSync = true;
    this.publisher.pub(`fplsync_fplRequest${this.eventSuffix}`, { uid: this.lastRequestUid = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER) }, true, false);
    this.ignoreSync = false;
  }

  /**
   * A callback which is called in response to flight plan request response sync events.
   * @param data The event data.
   */
  private onFlightPlanResponse(data: FlightPlanResponseEvent): void {
    if (data.uid !== this.lastRequestUid) {
      return;
    }

    this.lastRequestUid = undefined;

    for (let i = 0; i < data.flightPlans.length; i++) {
      const flightPlan = data.flightPlans[i];
      if (flightPlan === null || flightPlan.segmentCount === 0) {
        continue;
      }

      const newPlan = new FlightPlan(i, this.calculator, this.getLegNameFunc);
      newPlan.copyFrom(flightPlan, true);
      newPlan.events = this.buildPlanEventHandlers(i);

      this.flightPlans[i] = newPlan;
      this.sendLocalEvent('fplLoaded', { planIndex: i });

      // Make sure the newly loaded plans are calculated at least once from the beginning
      newPlan.calculate(0);
    }

    // Only process a plan index changed event if the plan actually exists.
    if (this.flightPlans[data.planIndex]) {
      this.onPlanIndexChanged(data);
    }

    this.flightPlanSynced.notify(this, true);
  }

  /**
   * Checks whether a flight plan exists at a specified index.
   * @param planIndex The index to check.
   * @returns Whether a a flight plan exists at `planIndex`.
   */
  public hasFlightPlan(planIndex: number): boolean {
    return !!this.flightPlans[planIndex];
  }

  /**
   * Gets a flight plan from the flight planner.
   * @param planIndex The index of the flight plan.
   * @returns The requested flight plan.
   * @throws Error if a flight plan does not exist at `planIndex`.
   */
  public getFlightPlan(planIndex: number): FlightPlan {
    const plan = this.flightPlans[planIndex];
    if (!plan) {
      throw new Error(`FlightPlanner: Flight plan does not exist at index ${planIndex}`);
    }

    return plan;
  }

  /**
   * Creates a new flight plan at a specified index if one does not already exist.
   * @param planIndex The index at which to create the new flight plan.
   * @param notify Whether to send an event notification. True by default.
   * @returns The new flight plan, or the existing flight plan at `planIndex`.
   */
  public createFlightPlan(planIndex: number, notify = true): FlightPlan {
    if (this.flightPlans[planIndex]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.flightPlans[planIndex]!;
    }

    const flightPlan = new FlightPlan(planIndex, this.calculator, this.getLegNameFunc);
    flightPlan.events = this.buildPlanEventHandlers(planIndex);

    this.flightPlans[planIndex] = flightPlan;

    notify && this.sendPlanCreated(planIndex);

    return flightPlan;
  }

  /**
   * A callback which is called in response to flight plan request response sync events.
   * @param data The event data.
   */
  private onPlanCreated(data: FlightPlanIndicationEvent): void {
    this.createFlightPlan(data.planIndex, false);
    this.sendLocalEvent('fplCreated', data);
  }

  /**
   * Sends a flight plan created event.
   * @param planIndex The index of the flight plan that was created.
   */
  private sendPlanCreated(planIndex: number): void {
    const data = { planIndex };
    this.sendSyncEvent('fplsync_fplCreated', data);
    this.sendLocalEvent('fplCreated', data);
  }

  /**
   * Deletes a flight plan from the flight planner.
   * @param planIndex The index of the flight plan to delete.
   * @param notify Whether to send an event notification. True by default.
   */
  public deleteFlightPlan(planIndex: number, notify = true): void {
    const flightPlan = this.flightPlans[planIndex];
    if (flightPlan) {
      flightPlan.events = {};
      this.flightPlans[planIndex] = undefined;
      this.syncedBatchEntries[planIndex] = undefined;

      notify && this.sendPlanDeleted(planIndex);
    }

    if (planIndex === this.flightPlans.length - 1) {
      this.flightPlans.length--;
    }
  }

  /**
   * A callback which is called in response to flight plan deleted sync events.
   * @param data The event data.
   */
  private onPlanDeleted(data: FlightPlanIndicationEvent): void {
    this.deleteFlightPlan(data.planIndex, false);
    this.sendLocalEvent('fplDeleted', data);
  }

  /**
   * Sends a flight plan deleted event.
   * @param planIndex The index of the flight plan that was created.
   */
  private sendPlanDeleted(planIndex: number): void {
    const data = { planIndex };
    this.sendSyncEvent('fplsync_fplDeleted', data);
    this.sendLocalEvent('fplDeleted', data);
  }

  /**
   * Builds the plan event handlers for the flight plan.
   * @param planIndex The index of the flight plan.
   * @returns The plan event handlers.
   */
  private buildPlanEventHandlers(planIndex: number): PlanEvents {
    return {
      onLegChanged: this.sendLegChanged.bind(this, planIndex),
      onSegmentChanged: this.sendSegmentChanged.bind(this, planIndex),
      onActiveLegChanged: this.sendActiveLegChange.bind(this, planIndex),
      onOriginDestChanged: this.sendOriginDestChanged.bind(this, planIndex),
      onProcedureDetailsChanged: this.sendProcedureDetailsChanged.bind(this, planIndex),
      onUserDataSet: this.sendUserDataSet.bind(this, planIndex),
      onUserDataDelete: this.sendUserDataDelete.bind(this, planIndex),
      onLegUserDataSet: this.sendLegUserDataSet.bind(this, planIndex),
      onLegUserDataDelete: this.sendLegUserDataDelete.bind(this, planIndex),
      onDirectDataChanged: this.sendDirectToData.bind(this, planIndex),
      onCalculatePended: this.sendCalculatePended.bind(this, planIndex),
      onCalculated: this.sendCalculated.bind(this, planIndex),
      onBatchOpened: this.sendBatchOpened.bind(this, planIndex),
      onBatchClosed: this.sendBatchClosed.bind(this, planIndex),
      onBatchAsyncClosed: this.sendBatchAsyncClosed.bind(this, planIndex),
    };
  }

  /**
   * Checks whether an active flight plan exists.
   * @returns Whether an active flight plan exists.
   */
  public hasActiveFlightPlan(): boolean {
    return this.hasFlightPlan(this.activePlanIndex);
  }

  /**
   * Gets the currently active flight plan from the flight planner.
   * @returns The currently active flight plan.
   * @throws Error if no active flight plan exists.
   */
  public getActiveFlightPlan(): FlightPlan {
    return this.getFlightPlan(this.activePlanIndex);
  }

  /**
   * Copies a flight plan to another flight plan slot.
   * @param sourcePlanIndex The source flight plan index.
   * @param targetPlanIndex The target flight plan index.
   * @param copyCalcs Whether to copy leg calculations (defaults to false).
   * @param notify Whether or not to notify subscribers that the plan has been copied.
   */
  public copyFlightPlan(sourcePlanIndex: number, targetPlanIndex: number, copyCalcs = false, notify = true): void {
    const sourcePlan = this.flightPlans[sourcePlanIndex];
    if (!sourcePlan) {
      return;
    }

    if (this.flightPlans[targetPlanIndex]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.flightPlans[targetPlanIndex]!.copyFrom(sourcePlan, copyCalcs);
    } else {
      const newPlan = sourcePlan.copy(targetPlanIndex, copyCalcs);
      newPlan.events = this.buildPlanEventHandlers(targetPlanIndex);
      this.flightPlans[targetPlanIndex] = newPlan;
    }

    if (notify) {
      this.sendPlanCopied(sourcePlanIndex, targetPlanIndex, copyCalcs);
    }
  }

  /**
   * A callback which is called in response to flight plan copied sync events.
   * @param data The event data.
   */
  private onPlanCopied(data: FlightPlanCopiedEvent): void {
    this.copyFlightPlan(data.planIndex, data.targetPlanIndex, data.copyCalcs, false);

    this.sendLocalEvent('fplCopied', data);
  }

  /**
   * Sends a leg change event.
   * @param planIndex The index of the flight plan that was the source of the copy.
   * @param targetPlanIndex The index of the copy.
   * @param copyCalcs Whether to leg calculations were copied.
   */
  private sendPlanCopied(planIndex: number, targetPlanIndex: number, copyCalcs: boolean): void {
    const data = { planIndex, targetPlanIndex, copyCalcs, batch: this.flightPlans[targetPlanIndex]?.getBatchStack() };
    this.sendSyncEvent('fplsync_fplCopied', data);
    this.sendLocalEvent('fplCopied', data);
  }

  /**
   * A callback which is called in response to leg changed sync events.
   * @param data The event data.
   */
  private onLegChanged(data: FlightPlanLegSyncEvent): void {
    const plan = this.getFlightPlan(data.planIndex);

    let localLeg: LegDefinition;

    switch (data.type) {
      case LegEventType.Added: {
        if (!data.leg) {
          return;
        }
        localLeg = plan.addLeg(data.segmentIndex, data.leg.leg, data.legIndex, data.leg.flags, false);
        break;
      }
      case LegEventType.Removed: {
        const leg = plan.removeLeg(data.segmentIndex, data.legIndex, false);
        // We don't want to send the event locally if we didn't find a leg
        if (!leg) {
          return;
        }
        localLeg = leg;
        break;
      }
      case LegEventType.Changed: {
        if (!data.leg) {
          return;
        }
        const leg = plan.tryGetLeg(data.segmentIndex, data.legIndex);
        // We don't want to send the event locally if we didn't find a leg
        if (!leg) {
          return;
        }
        localLeg = leg;
        plan.setLegVerticalData(data.segmentIndex, data.legIndex, data.leg.verticalData, false);
        break;
      }
      default:
        return;
    }

    // We need to send a reference to the local flight plan's copy of the leg with the local event so that
    // event consumers that save the reference don't become desynced with the local flight plan.
    const localData: FlightPlanLegEvent = {
      planIndex: data.planIndex,
      type: data.type,
      segmentIndex: data.segmentIndex,
      legIndex: data.legIndex,
      leg: localLeg,
      batch: data.batch
    };

    this.sendLocalEvent('fplLegChange', localData);
  }

  /**
   * Sends a leg change event.
   * @param planIndex The index of the flight plan.
   * @param segmentIndex The index of the segment.
   * @param index The index of the leg.
   * @param type The type of change.
   * @param leg The leg that was changed.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendLegChanged(planIndex: number, segmentIndex: number, index: number, type: LegEventType, leg: LegDefinition, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    let syncLeg: SyncedLegDefinition | undefined;

    switch (type) {
      case LegEventType.Added:
      case LegEventType.Changed:
        syncLeg = {
          leg: leg.leg,
          verticalData: leg.verticalData,
          flags: leg.flags,
        };
        break;
    }

    this.sendSyncEvent('fplsync_fplLegChange', {
      planIndex,
      segmentIndex,
      legIndex: index,
      type,
      leg: syncLeg,
      batch
    });
    this.sendLocalEvent('fplLegChange', {
      planIndex,
      segmentIndex,
      legIndex: index,
      type,
      leg,
      batch
    });
  }

  /**
   * A callback which is called in response to segment changed sync events.
   * @param data The event data.
   */
  private onSegmentChanged(data: FlightPlanSegmentSyncEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    let localSegment: FlightPlanSegment | null = null;

    switch (data.type) {
      case SegmentEventType.Added:
        if (!data.segment) {
          return;
        }
        localSegment = plan.addSegment(data.segmentIndex, data.segment.segmentType, data.segment.airway, false);
        break;
      case SegmentEventType.Inserted:
        if (!data.segment) {
          return;
        }
        localSegment = plan.insertSegment(data.segmentIndex, data.segment.segmentType, data.segment.airway, false);
        break;
      case SegmentEventType.Removed:
        localSegment = plan.tryGetSegment(data.segmentIndex);
        if (!localSegment) {
          return;
        }
        plan.removeSegment(data.segmentIndex, false);
        break;
      case SegmentEventType.Changed:
        if (!data.segment) {
          return;
        }
        localSegment = plan.tryGetSegment(data.segmentIndex);
        if (!localSegment) {
          return;
        }
        plan.setAirway(data.segmentIndex, data.segment.airway, false);
        break;
      default:
        return;
    }

    // We need to send a reference to the local flight plan's copy of the segment with the local event so that
    // event consumers that save the reference don't become desynced with the local flight plan.
    const localData: FlightPlanSegmentEvent = {
      planIndex: data.planIndex,
      type: data.type,
      segmentIndex: data.segmentIndex,
      segment: localSegment,
      batch: data.batch
    };

    this.sendLocalEvent('fplSegmentChange', localData);
  }

  /**
   * Sends a segment change event.
   * @param planIndex The index of the flight plan.
   * @param index The index of the segment.
   * @param type The type of change.
   * @param segment The segment that was changed.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendSegmentChanged(planIndex: number, index: number, type: SegmentEventType, segment?: FlightPlanSegment, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    this.sendSyncEvent('fplsync_fplSegmentChange', {
      planIndex,
      segmentIndex: index,
      type,
      segment: segment ? { segmentType: segment.segmentType, airway: segment.airway } : undefined,
      batch
    });
    this.sendLocalEvent('fplSegmentChange', {
      planIndex,
      segmentIndex: index,
      type,
      segment,
      batch
    });
  }

  /**
   * A callback which is called in response to active leg changed sync events.
   * @param data The event data.
   */
  private onActiveLegChanged(data: FlightPlanActiveLegEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    switch (data.type) {
      case ActiveLegType.Lateral:
        plan.setLateralLeg(data.index, false);
        break;
      case ActiveLegType.Vertical:
        plan.setVerticalLeg(data.index, false);
        break;
      case ActiveLegType.Calculating:
        plan.setCalculatingLeg(data.index, false);
        break;
    }

    this.sendLocalEvent('fplActiveLegChange', data);
  }

  /**
   * Sends an active leg change event.
   * @param planIndex The index of the flight plan.
   * @param index The global index of the leg.
   * @param segmentIndex The index of the plan segment.
   * @param legIndex The index of the leg within the segment.
   * @param previousSegmentIndex The index of the segment in which the previously active leg is.
   * @param previousLegIndex The index of the previously active leg within the previously active segment.
   * @param type The type of leg that was changed.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendActiveLegChange(
    planIndex: number,
    index: number,
    segmentIndex: number,
    legIndex: number,
    previousSegmentIndex: number,
    previousLegIndex: number,
    type: ActiveLegType,
    batch?: readonly Readonly<FlightPlanModBatch>[]
  ): void {
    const data = {
      planIndex,
      index,
      segmentIndex, legIndex,
      previousSegmentIndex, previousLegIndex,
      type,
      batch
    };
    this.sendSyncEvent('fplsync_fplActiveLegChange', data);
    this.sendLocalEvent('fplActiveLegChange', data);
  }

  /**
   * A callback which is called in response to origin/destination changed sync events.
   * @param data The event data.
   */
  private onOriginDestChanged(data: FlightPlanOriginDestEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    switch (data.type) {
      case OriginDestChangeType.OriginAdded:
        data.airport && plan.setOriginAirport(data.airport, false);
        break;
      case OriginDestChangeType.OriginRemoved:
        plan.removeOriginAirport(false);
        break;
      case OriginDestChangeType.DestinationAdded:
        data.airport && plan.setDestinationAirport(data.airport, false);
        break;
      case OriginDestChangeType.DestinationRemoved:
        plan.removeDestinationAirport(false);
        break;
    }

    this.sendLocalEvent('fplOriginDestChanged', data);
  }

  /**
   * Sends a origin/dest change event.
   * @param planIndex The index of the flight plan.
   * @param type The origin/destination change type.
   * @param airportIcao The ICAO value of the airport that was changed.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendOriginDestChanged(planIndex: number, type: OriginDestChangeType, airportIcao: IcaoValue | undefined, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, type, airportIcao, airport: airportIcao ? ICAO.valueToStringV1(airportIcao) : undefined, batch };
    this.sendSyncEvent('fplsync_fplOriginDestChanged', data);
    this.sendLocalEvent('fplOriginDestChanged', data);
  }

  /**
   * A callback which is called in response to procedure changed sync events.
   * @param data The event data.
   */
  private onProcedureDetailsChanged(data: FlightPlanProcedureDetailsEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    // We do object assign against new proc details in case the incoming details are missing fields because of coming from json
    // and because we want to overwrite the entire object, instead of just some fields.
    plan.setProcedureDetails(Object.assign(FlightPlan.createProcedureDetails(), data.details), false);

    this.sendLocalEvent('fplProcDetailsChanged', data);
  }

  /**
   * Sends a procedure details change event.
   * @param planIndex The index of the flight plan.
   * @param details The details that were changed.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendProcedureDetailsChanged(planIndex: number, details: ProcedureDetails, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, details, batch };
    this.sendSyncEvent('fplsync_fplProcDetailsChanged', data);
    this.sendLocalEvent('fplProcDetailsChanged', data);
  }

  /**
   * A callback which is called in response to flight plan index changed sync events.
   * @param data The event data.
   */
  private onPlanIndexChanged(data: FlightPlanIndicationEvent): void {
    this.activePlanIndex = data.planIndex;

    this.sendLocalEvent('fplIndexChanged', data);
  }

  /**
   * Sends an active plan index change event.
   * @param planIndex The index of the flight plan.
   */
  private sendPlanIndexChanged(planIndex: number): void {
    const data = { planIndex };
    this.sendSyncEvent('fplsync_fplIndexChanged', data);
    this.sendLocalEvent('fplIndexChanged', data);
  }

  /**
   * A callback which is called in response to global user data set sync events.
   * @param data The event data.
   */
  private onUserDataSet(data: FlightPlanUserDataEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    plan.setUserData(data.key, data.data, false);

    this.sendLocalEvent('fplUserDataSet', data);
  }

  /**
   * A callback which is called in response to global user data delete sync events.
   * @param data The event data.
   */
  private onUserDataDelete(data: FlightPlanUserDataEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    plan.deleteUserData(data.key, false);

    this.sendLocalEvent('fplUserDataDelete', data);
  }

  /**
   * Sends a global user data set event.
   * @param planIndex The index of the flight plan.
   * @param key The key of the user data.
   * @param userData The data that was set.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendUserDataSet(planIndex: number, key: string, userData: any, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, key, data: userData, batch };
    this.sendSyncEvent('fplsync_fplUserDataSet', data);
    this.sendLocalEvent('fplUserDataSet', data);
  }

  /**
   * Sends a global user data delete event.
   * @param planIndex The index of the flight plan.
   * @param key The key of the user data.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendUserDataDelete(planIndex: number, key: string, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, key, batch };
    this.sendSyncEvent('fplsync_fplUserDataDelete', data);
    this.sendLocalEvent('fplUserDataDelete', data);
  }

  /**
   * A callback which is called in response to flight plan leg user data set sync events.
   * @param data The event data.
   */
  private onLegUserDataSet(data: FlightPlanLegUserDataSyncEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    const localLeg = plan.tryGetLeg(data.segmentIndex, data.segmentIndex);

    if (!localLeg) {
      return;
    }

    plan.setLegUserData(data.segmentIndex, data.legIndex, data.key, data.data, false);

    // We need to send a reference to the local flight plan's copy of the leg with the local event so that
    // event consumers that save the reference don't become desynced with the local flight plan.
    const localData: FlightPlanLegUserDataEvent = {
      planIndex: data.planIndex,
      segmentIndex: data.segmentIndex,
      legIndex: data.legIndex,
      leg: localLeg,
      key: data.key,
      data: data.data,
      batch: data.batch
    };

    this.sendLocalEvent('fplLegUserDataSet', localData);
  }

  /**
   * A callback which is called in response to flight plan leg user data delete sync events.
   * @param data The event data.
   */
  private onLegUserDataDelete(data: FlightPlanLegUserDataSyncEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    const localLeg = plan.tryGetLeg(data.segmentIndex, data.segmentIndex);

    if (!localLeg) {
      return;
    }

    plan.deleteLegUserData(data.segmentIndex, data.legIndex, data.key, false);

    // We need to send a reference to the local flight plan's copy of the leg with the local event so that
    // event consumers that save the reference don't become desynced with the local flight plan.
    const localData: FlightPlanLegUserDataEvent = {
      planIndex: data.planIndex,
      segmentIndex: data.segmentIndex,
      legIndex: data.legIndex,
      leg: localLeg,
      key: data.key,
      batch: data.batch
    };

    this.sendLocalEvent('fplLegUserDataDelete', localData);
  }

  /**
   * Sends a flight plan leg user data set event.
   * @param planIndex The index of the flight plan.
   * @param segmentIndex The index of the segment containing the user data's flight plan leg.
   * @param segmentLegIndex The index of the user data's flight plan leg in its containing segment.
   * @param leg The user data's flight plan leg.
   * @param key The key of the user data.
   * @param userData The data that was set.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendLegUserDataSet(
    planIndex: number,
    segmentIndex: number,
    segmentLegIndex: number,
    leg: LegDefinition,
    key: string,
    userData: any,
    batch?: readonly Readonly<FlightPlanModBatch>[]
  ): void {
    this.sendSyncEvent('fplsync_fplLegUserDataSet', {
      planIndex,
      segmentIndex,
      legIndex: segmentLegIndex,
      key,
      data: userData,
      batch
    });
    this.sendLocalEvent('fplLegUserDataSet', {
      planIndex,
      segmentIndex,
      legIndex: segmentLegIndex,
      leg,
      key,
      data: userData,
      batch
    });
  }

  /**
   * Sends a flight plan leg user data delete event.
   * @param planIndex The index of the flight plan.
   * @param segmentIndex The index of the segment containing the user data's flight plan leg.
   * @param segmentLegIndex The index of the user data's flight plan leg in its containing segment.
   * @param leg The user data's flight plan leg.
   * @param key The key of the user data that was deleted.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendLegUserDataDelete(
    planIndex: number,
    segmentIndex: number,
    segmentLegIndex: number,
    leg: LegDefinition,
    key: string,
    batch?: readonly Readonly<FlightPlanModBatch>[]
  ): void {
    this.sendSyncEvent('fplsync_fplLegUserDataDelete', {
      planIndex,
      segmentIndex,
      legIndex: segmentLegIndex,
      key,
      batch
    });
    this.sendLocalEvent('fplLegUserDataDelete', {
      planIndex,
      segmentIndex,
      legIndex: segmentLegIndex,
      leg,
      key,
      batch
    });
  }

  /**
   * A callback which is called in response to direct to data changed sync events.
   * @param data The event data.
   */
  private onDirectToDataChanged(data: FlightPlanDirectToDataEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    plan.setDirectToData(data.directToData.segmentIndex, data.directToData.segmentLegIndex, false);

    this.sendLocalEvent('fplDirectToDataChanged', data);
  }

  /**
   * Sends a direct to data changed event.
   * @param planIndex The index of the flight plan.
   * @param directToData The direct to data.
   * @param batch The modification batch to which the change was assigned.
   */
  private sendDirectToData(planIndex: number, directToData: DirectToData, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, directToData: directToData, batch };
    this.sendSyncEvent('fplsync_fplDirectToDataChanged', data);
    this.sendLocalEvent('fplDirectToDataChanged', data);
  }

  /**
   * A callback which is called in response to calculation pended sync events.
   * @param data The event data.
   */
  private async onCalculatePended(data: FlightPlanCalculatedEvent): Promise<void> {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    const syncedBatchEntries = this.syncedBatchEntries[data.planIndex];

    if (syncedBatchEntries && data.batch) {
      for (let i = data.batch.length - 1; i >= 0; i--) {
        const batch = data.batch[i];

        const entry = syncedBatchEntries.get(batch.uuid);
        if (entry) {
          entry.pendingCalculateCount++;
        }
      }
    }

    this.sendLocalEvent('fplCalculatePended', data);

    await plan.calculate(data.index, false);

    if (this.flightPlans[data.planIndex] !== plan) {
      return;
    }

    this.sendLocalEvent('fplCalculated', data);

    if (syncedBatchEntries && data.batch) {
      for (let i = data.batch.length - 1; i >= 0; i--) {
        const batch = data.batch[i];

        const entry = syncedBatchEntries.get(batch.uuid);
        if (entry) {
          entry.pendingCalculateCount--;
          if (entry.isClosed && entry.pendingCalculateCount === 0) {
            this.sendLocalEvent('fplBatchAsyncClosed', entry.eventData);
            syncedBatchEntries.delete(batch.uuid);
          }
        }
      }
    }
  }

  /**
   * Sends a calculate pended event.
   * @param planIndex The index of the flight plan.
   * @param index The global index of the flight plan leg that the path is to be generated from.
   * @param batch The modification batch to which the calculation was assigned.
   */
  private sendCalculatePended(planIndex: number, index?: number, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, index, batch };
    this.sendSyncEvent('fplsync_fplCalculatePended', data);
    this.sendLocalEvent('fplCalculatePended', data);
  }

  /**
   * Sends a calculated event.
   * @param planIndex The index of the flight plan.
   * @param index The global index of the flight plan leg that the path was generated from.
   * @param batch The modification batch to which the calculation was assigned.
   */
  private sendCalculated(planIndex: number, index?: number, batch?: readonly Readonly<FlightPlanModBatch>[]): void {
    const data = { planIndex, index, batch };
    this.sendSyncEvent('fplsync_fplCalculated', data);
    this.sendLocalEvent('fplCalculated', data);
  }

  /**
   * A callback which is called in response to modification batch opened sync events.
   * @param data The event data.
   */
  private onBatchOpened(data: FlightPlanModBatchEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    const localData = { planIndex: data.planIndex, isSynced: true, batch: data.batch };

    const entries = this.syncedBatchEntries[data.planIndex] ??= new Map<string, SyncedFlightPlanModBatchEntry>();
    entries.set(data.batch.uuid, { batch: data.batch, isClosed: false, pendingCalculateCount: 0, eventData: localData });

    this.sendLocalEvent('fplBatchOpened', localData);
  }

  /**
   * Sends a modification batch opened event.
   * @param planIndex The index of the flight plan.
   * @param batch The modification batch that was opened.
   */
  private sendBatchOpened(planIndex: number, batch: Readonly<FlightPlanModBatch>): void {
    const data = { planIndex, isSynced: false, batch };
    this.sendSyncEvent('fplsync_fplBatchOpened', data);
    this.sendLocalEvent('fplBatchOpened', data);
  }

  /**
   * A callback which is called in response to modification batch closed sync events.
   * @param data The event data.
   */
  private onBatchClosed(data: FlightPlanModBatchEvent): void {
    const plan = this.flightPlans[data.planIndex];
    if (!plan) {
      return;
    }

    const entries = this.syncedBatchEntries[data.planIndex];
    const entry = entries?.get(data.batch.uuid);

    if (entry) {
      entry.isClosed = true;
      this.sendLocalEvent('fplBatchClosed', entry.eventData);

      if (entry.pendingCalculateCount === 0) {
        this.sendLocalEvent('fplBatchAsyncClosed', entry.eventData);
        entries!.delete(data.batch.uuid);
      }
    }
  }

  /**
   * Sends a modification batch closed event.
   * @param planIndex The index of the flight plan.
   * @param batch The modification batch that was closed.
   */
  private sendBatchClosed(planIndex: number, batch: Readonly<FlightPlanModBatch>): void {
    const data = { planIndex, isSynced: false, batch };
    this.sendSyncEvent('fplsync_fplBatchClosed', data);
    this.sendLocalEvent('fplBatchClosed', data);
  }

  /**
   * Sends a modification batch async closed event.
   * @param planIndex The index of the flight plan.
   * @param batch The modification batch that was closed.
   */
  private sendBatchAsyncClosed(planIndex: number, batch: Readonly<FlightPlanModBatch>): void {
    const data = { planIndex, isSynced: false, batch };
    this.sendLocalEvent('fplBatchAsyncClosed', data);
  }

  /**
   * Method to set an active flight plan index.
   * @param planIndex The index of the flight plan to make active.
   */
  public setActivePlanIndex(planIndex: number): void {
    if (this.hasFlightPlan(planIndex)) {
      this.activePlanIndex = planIndex;
      this.sendPlanIndexChanged(planIndex);
    }
  }

  /**
   * Sends a local event.
   * @param topic The topic of the event to send.
   * @param data The event data.
   */
  private sendLocalEvent<T extends keyof BaseFlightPlannerEvents>(topic: T, data: BaseFlightPlannerEvents[T]): void {
    this.publisher.pub(`${topic}${this.eventSuffix}`, data as any, false, false);
  }

  /**
   * Sends a sync event.
   * @param topic The topic of the event to send.
   * @param data The event data.
   */
  private sendSyncEvent<T extends keyof BaseFlightPlannerSyncEvents>(topic: T, data: BaseFlightPlannerSyncEvents[T]): void {
    this.ignoreSync = true;
    this.publisher.pub(`${topic}${this.eventSuffix}`, data as any, true, false);
    this.ignoreSync = false;
  }

  /**
   * Gets an instance of FlightPlanner. If the requested instance does not exist, then a new instance will be created
   * and returned.
   * @param id The ID of the flight planner to get.
   * @param bus The event bus.
   * @param options Options with which to configure the flight planner if a new one must be created.
   * @returns The instance of FlightPlanner with the specified ID.
   */
  public static getPlanner<ID extends string>(
    id: ID,
    bus: EventBus,
    options: Readonly<FlightPlannerOptions>
  ): FlightPlanner<ID>;
  /**
   * Gets an instance of FlightPlanner with the empty ID (`''`). If the instance does not exist, then a new instance
   * will be created and returned.
   * @param bus The event bus.
   * @param calculator The flight path calculator to use to compute flight paths for the planner's flight plans if a
   * new one must be created.
   * @param getLegName A function which generates flight plan leg names for the planner's flight plans if a new one
   * must be created.
   * @returns The instance of FlightPlanner with the empty ID.
   */
  public static getPlanner(
    bus: EventBus,
    calculator: FlightPathCalculator,
    getLegName?: ((leg: FlightPlanLeg) => string | undefined)
  ): FlightPlanner<''>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getPlanner(
    arg1: string | EventBus,
    arg2: EventBus | FlightPathCalculator,
    arg3?: Readonly<FlightPlannerOptions> | ((leg: FlightPlanLeg) => string | undefined)
  ): FlightPlanner<any> {
    let id: string;
    let bus: EventBus;
    let options: Readonly<FlightPlannerOptions>;

    if (typeof arg1 === 'string') {
      id = arg1;
      bus = arg2 as EventBus;
      options = arg3 as Readonly<FlightPlannerOptions>;
    } else {
      id = '';
      bus = arg1;
      options = {
        calculator: arg2 as FlightPathCalculator,
        getLegName: arg3 as ((leg: FlightPlanLeg) => string | undefined) | undefined
      };
    }

    let instance = FlightPlanner.instances.get(id);
    if (!instance) {
      instance = new FlightPlanner(id, bus, options);
      FlightPlanner.instances.set(id, instance);
    }
    return instance;
  }

  /**
   * Default Method for leg naming - builds leg names using default nomenclature.
   * @param leg The leg to build a name for.
   * @returns The name of the leg.
   */
  public static buildDefaultLegName(leg: FlightPlanLeg): string {
    let legDistanceNM;
    switch (leg.type) {
      case LegType.CA:
      case LegType.FA:
      case LegType.VA:
        return `${UnitType.METER.convertTo(leg.altitude1, UnitType.FOOT).toFixed(0)}FT`;
      case LegType.FM:
      case LegType.VM:
        return 'MANSEQ';
      case LegType.FC:
        legDistanceNM = Math.round(UnitType.METER.convertTo(leg.distance, UnitType.NMILE));
        return `D${leg.course.toFixed(0).padStart(3, '0')}${String.fromCharCode(64 + Utils.Clamp(legDistanceNM, 1, 26))}`;
      case LegType.CD:
      case LegType.FD:
      case LegType.VD:
        legDistanceNM = UnitType.METER.convertTo(leg.distance, UnitType.NMILE);
        return `${ICAO.getIdent(leg.originIcao)}${legDistanceNM.toFixed(1)}`;
      case LegType.CR:
      case LegType.VR:
        return `${ICAO.getIdent(leg.originIcao)}${leg.theta.toFixed(0)}`;
      case LegType.CI:
      case LegType.VI:
        return 'INTRCPT';
      case LegType.PI:
        return 'PROC. TURN';
      case LegType.HA:
      case LegType.HM:
      case LegType.HF:
        return 'HOLD';
      default:
        return ICAO.getIdent(leg.fixIcao);
    }
  }
}
