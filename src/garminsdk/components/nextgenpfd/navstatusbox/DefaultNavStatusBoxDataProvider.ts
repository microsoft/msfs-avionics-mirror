import {
  ActiveLegType, BitFlags, ClockEvents, ConsumerSubject, EventBus, GNSSEvents, LegDefinition, LegDefinitionFlags,
  MappedSubject, NavEvents, SubEvent, Subject, Subscribable, Subscription
} from '@microsoft/msfs-sdk';

import { GarminVNavTrackAlertType } from '../../../autopilot/vnav/GarminVNavDataEvents';
import { Fms } from '../../../flightplan/Fms';
import { DirectToState } from '../../../flightplan/FmsTypes';
import { FmsUtils } from '../../../flightplan/FmsUtils';
import { VNavDataProvider } from '../../../navigation/VNavDataProvider';
import { WaypointAlertComputer } from '../../../navigation/WaypointAlertComputer';
import { NavStatusBoxDataProvider, NavStatusTrackedLegs } from './NavStatusBoxDataProvider';

/**
 * A default implementation of `NavStatusBoxDataProvider`.
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
  /** @inheritDoc */
  public readonly trackedLegs = this._trackedLegs as Subscribable<Readonly<NavStatusTrackedLegs>>;

  private readonly isObsActive = ConsumerSubject.create(null, false);
  private readonly obsCourseSource = ConsumerSubject.create(null, 0);
  private readonly _obsCourse = MappedSubject.create(
    ([isObsActive, obsCourseSource]): number | null => isObsActive ? obsCourseSource : null,
    this.isObsActive,
    this.obsCourseSource
  );
  public readonly obsCourse = this._obsCourse as Subscribable<number | null>;

  /** @inheritDoc */
  public readonly waypointAlertState = this.waypointAlertComputer.state;

  /** @inheritDoc */
  public readonly waypointAlertTime = this.waypointAlertComputer.timeRemaining;

  /** @inheritDoc */
  public readonly verticalTrackAlert = this.vnavDataProvider ? this.vnavDataProvider.trackAlert : new SubEvent<void, GarminVNavTrackAlertType>();

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private needUpdateTrackedLegs = false;

  private clockSub?: Subscription;
  private readonly fplSubs: Subscription[] = [];

  /**
   * Creates a new instance of DefaultNavStatusBoxDataProvider.
   * @param bus The event bus.
   * @param fms The FMS.
   * @param waypointAlertComputer The waypoint alert computer from which to source this provider's waypoint alert data.
   * @param vnavDataProvider The VNAV data provider from which to source this provider's vertical track alert data. If
   * not defined, then vertical track alert data will not be provided.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
    private readonly waypointAlertComputer: WaypointAlertComputer,
    private readonly vnavDataProvider?: VNavDataProvider
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
