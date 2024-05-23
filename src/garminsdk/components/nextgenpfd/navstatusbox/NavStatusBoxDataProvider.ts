import {
  ActiveLegType, BitFlags, ClockEvents, ConsumerSubject, EventBus, GNSSEvents, LegDefinition, LegDefinitionFlags,
  MappedSubject, NavEvents, NumberUnitInterface, Subject, Subscribable, Subscription, UnitFamily
} from '@microsoft/msfs-sdk';

import { Fms } from '../../../flightplan/Fms';
import { DirectToState } from '../../../flightplan/FmsTypes';
import { FmsUtils } from '../../../flightplan/FmsUtils';
import { WaypointAlertComputer, WaypointAlertStateEvent } from '../../../navigation/WaypointAlertComputer';

/**
 * From, to, and next flight plan legs tracked by LNAV.
 */
export type NavStatusTrackedLegs = {
  /** The current nominal leg from which LNAV is tracking. */
  fromLeg: LegDefinition | null;

  /** The current nominal leg which LNAV is tracking. */
  toLeg: LegDefinition | null;

  /** The next nominal leg which LNAV is tracking. */
  nextLeg: LegDefinition | null;
};

/**
 * A data provider for a navigation status box.
 */
export interface NavStatusBoxDataProvider {
  /** The current from, to, and next flight plan legs LNAV is tracking. */
  readonly trackedLegs: Subscribable<Readonly<NavStatusTrackedLegs>>;

  /** The current active OBS course, in degrees, or `null` if OBS is inactive. */
  readonly obsCourse: Subscribable<number | null>;

  /** The current waypoint alert state. */
  readonly waypointAlertState: Subscribable<Readonly<WaypointAlertStateEvent>>;

  /** The time remaining for the current waypoint alert, or `NaN` if an alert is not active. */
  readonly waypointAlertTime: Subscribable<NumberUnitInterface<UnitFamily.Duration>>;
}

/**
 * A default implementation of {@link NavStatusBoxDataProvider}.
 */
export class DefaultNavStatusBoxDataProvider implements NavStatusBoxDataProvider {

  private readonly trackedLegsBuffer: NavStatusTrackedLegs[] = [
    { fromLeg: null, toLeg: null, nextLeg: null },
    { fromLeg: null, toLeg: null, nextLeg: null }
  ];

  private readonly _trackedLegs = Subject.create<NavStatusTrackedLegs>(
    this.trackedLegsBuffer[0],
    (a, b) => a.fromLeg === b.fromLeg && a.toLeg === b.toLeg && a.nextLeg === b.nextLeg
  );
  /** @inheritdoc */
  public readonly trackedLegs = this._trackedLegs as Subscribable<Readonly<NavStatusTrackedLegs>>;

  private readonly isObsActive = ConsumerSubject.create(null, false);
  private readonly obsCourseSource = ConsumerSubject.create(null, 0);
  private readonly _obsCourse = MappedSubject.create(
    ([isObsActive, obsCourseSource]): number | null => isObsActive ? obsCourseSource : null,
    this.isObsActive,
    this.obsCourseSource
  );
  public readonly obsCourse = this._obsCourse as Subscribable<number | null>;

  /** @inheritdoc */
  public readonly waypointAlertState = this.waypointAlertComputer.state;

  /** @inheritdoc */
  public readonly waypointAlertTime = this.waypointAlertComputer.timeRemaining;

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private needUpdateTrackedLegs = false;

  private clockSub?: Subscription;
  private readonly fplSubs: Subscription[] = [];

  /**
   * Constructor.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param waypointAlertComputer The waypoint alert computer from which to source this provider's waypoint alert data.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    private readonly waypointAlertComputer: WaypointAlertComputer
  ) {
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultNavStatusBoxDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<ClockEvents & NavEvents & GNSSEvents>();

    this.isObsActive.setConsumer(sub.on('gps_obs_active'));
    this.obsCourseSource.setConsumer(sub.on('gps_obs_value'));

    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplCreated').handle(evt => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplDeleted').handle(evt => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplLoaded').handle(evt => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplCopied').handle(evt => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplIndexChanged').handle(() => {
      this.needUpdateTrackedLegs = true;
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplSegmentChange').handle((evt) => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplLegChange').handle((evt) => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex) {
        this.needUpdateTrackedLegs = true;
      }
    }));
    this.fplSubs.push(this.fms.flightPlanner.onEvent('fplActiveLegChange').handle((evt) => {
      if (evt.planIndex === this.fms.flightPlanner.activePlanIndex && evt.type === ActiveLegType.Lateral) {
        this.needUpdateTrackedLegs = true;
      }
    }));

    this.needUpdateTrackedLegs = true;

    this.clockSub = sub.on('realTime').handle(this.update.bind(this));

    if (paused) {
      this.pause();
    }
  }

  /**
   * Updates this data provider.
   */
  private update(): void {
    if (this.needUpdateTrackedLegs) {
      this.updateTrackedLegs();
      this.needUpdateTrackedLegs = false;
    }
  }

  /**
   * Updates this provider's tracked leg information.
   */
  private updateTrackedLegs(): void {
    let toLeg: LegDefinition | null = null;
    let fromLeg: LegDefinition | null = null;
    let nextLeg: LegDefinition | null = null;

    if (this.fms.flightPlanner.hasActiveFlightPlan()) {
      const plan = this.fms.flightPlanner.getActiveFlightPlan();
      const activeLegIndex = plan.activeLateralLeg;
      const isDirectTo = this.fms.getDirectToState() !== DirectToState.NONE;

      if (plan.length > 0 && activeLegIndex < plan.length) {
        toLeg = plan.getLeg(activeLegIndex);

        if (activeLegIndex > 0 && !isDirectTo && !BitFlags.isAny(toLeg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
          fromLeg = FmsUtils.getFromLegForArrowDisplay(plan, activeLegIndex) ?? null;
        }

        if (activeLegIndex < plan.length - 1) {
          nextLeg = plan.getLeg(activeLegIndex + 1);
        }
      }
    }

    const trackedLegs = this.trackedLegsBuffer[this._trackedLegs.get() === this.trackedLegsBuffer[0] ? 1 : 0];
    trackedLegs.fromLeg = fromLeg;
    trackedLegs.toLeg = toLeg;
    trackedLegs.nextLeg = nextLeg;

    this._trackedLegs.set(trackedLegs);
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultNavStatusBoxDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isObsActive.resume();
    this.obsCourseSource.resume();

    this.fplSubs.forEach(sub => { sub.resume(); });
    this.needUpdateTrackedLegs = true;

    this.clockSub?.resume(true);

    this.isPaused = false;
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultNavStatusBoxDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this.isObsActive.pause();
    this.obsCourseSource.pause();

    this.fplSubs.forEach(sub => { sub.pause(); });

    this.clockSub?.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this.isObsActive.destroy();
    this.obsCourseSource.destroy();

    this.fplSubs.forEach(sub => { sub.destroy(); });

    this.clockSub?.destroy();
  }
}