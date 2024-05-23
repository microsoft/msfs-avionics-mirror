import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { NavMath } from '../../geo/NavMath';
import { ClockEvents } from '../../instruments/Clock';
import { Subscription } from '../../sub/Subscription';
import { LNavObsControlEvents } from './LNavObsControlEvents';
import { LNavObsVars } from './LNavObsEvents';
import { LNavUtils } from './LNavUtils';

/**
 * A manager that controls OBS state in response to control events defined in `LNavObsControlEvents`.
 */
export class LNavObsManager {

  private readonly activeSimVar: string;
  private readonly courseSimVar: string;

  private readonly activeLVar: string;
  private readonly courseLVar: string;

  private readonly subscriptions: Subscription[] = [];

  private isAlive = true;
  private isInit = false;

  /**
   * Creates a new instance of LNavObsManager.
   * @param bus The event bus.
   * @param index The index of the LNAV that is associated with the OBS state controlled by this manager.
   * @param useSimObsState Whether this manager uses the sim's native OBS state. If `true`, then the manager will
   * forward state changes to the sim's native OBS SimVars via key events and sync the values of the native SimVars to
   * the LVars defined in `LNavObsVars`. If `false`, then the manager will directly manipulate the LVars defined in
   * `LNavObsVars`.
   */
  public constructor(
    private readonly bus: EventBus,
    private readonly index: number,
    private readonly useSimObsState: boolean
  ) {
    if (!LNavUtils.isValidLNavIndex(index)) {
      throw new Error(`LNavObsManager: invalid index: ${index}`);
    }

    const lvarSuffix = index === 0 ? '' : `:${index}`;
    this.activeLVar = `${LNavObsVars.Active}${lvarSuffix}`;
    this.courseLVar = `${LNavObsVars.Course}${lvarSuffix}`;

    if (useSimObsState) {
      this.activeSimVar = 'GPS OBS ACTIVE';
      this.courseSimVar = 'GPS OBS VALUE';
    } else {
      this.activeSimVar = this.activeLVar;
      this.courseSimVar = this.courseLVar;
    }
  }

  /**
   * Initializes this manager. Once initialized, the manager will control OBS state in response to control events
   * received on the event bus.
   * @throws Error if this manager has been destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('LNavObsManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const eventBusTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.index);

    const sub = this.bus.getSubscriber<ClockEvents & LNavObsControlEvents>();

    this.subscriptions.push(
      sub.on(`lnav_obs_set_active${eventBusTopicSuffix}`).handle(this.onSetActiveEvent.bind(this)),
      sub.on(`lnav_obs_toggle_active${eventBusTopicSuffix}`).handle(this.onToggleActiveEvent.bind(this)),
      sub.on(`lnav_obs_set_course${eventBusTopicSuffix}`).handle(this.onSetCourseEvent.bind(this)),
      sub.on(`lnav_obs_inc_course${eventBusTopicSuffix}`).handle(this.onIncrementCourseEvent.bind(this, 1)),
      sub.on(`lnav_obs_dec_course${eventBusTopicSuffix}`).handle(this.onIncrementCourseEvent.bind(this, -1)),
    );

    if (this.useSimObsState) {
      // We need the update loop to ensure the sync happens every frame (SimVar publishing to the event bus is
      // throttled by cockpit refresh rate setting and external view, so we can't rely on data published to the bus).
      this.subscriptions.push(sub.on('simTimeHiFreq').handle(this.syncSimStateToLVars.bind(this)));
    }
  }

  /**
   * Responds to when a control event to set whether OBS is active is received.
   * @param active The state commanded by the control event.
   */
  private onSetActiveEvent(active: boolean): void {
    this.setActive(active);
  }

  /**
   * Responds to when a control event to toggle whether OBS is active is received.
   */
  private onToggleActiveEvent(): void {
    if (this.useSimObsState) {
      SimVar.SetSimVarValue('K:GPS_OBS', SimVarValueType.Number, 0);
    } else {
      this.setActive(SimVar.GetSimVarValue(this.activeSimVar, SimVarValueType.Bool) === 0);
    }
  }

  /**
   * Responds to when a control event to set the OBS course is received.
   * @param course The course commanded by the control event.
   */
  private onSetCourseEvent(course: number): void {
    this.setCourse(course);
  }

  /**
   * Responds to when a control event to increment OBS course is received.
   * @param dir The direction in which to increment the OBS course.
   */
  private onIncrementCourseEvent(dir: 1 | -1): void {
    if (this.useSimObsState) {
      SimVar.SetSimVarValue(dir === 1 ? 'K:GPS_OBS_INC' : 'K:GPS_OBS_DEC', SimVarValueType.Number, 0);
    } else {
      let course: number = SimVar.GetSimVarValue(this.courseSimVar, SimVarValueType.Degree);
      if (dir === 1) {
        course = Math.floor(dir) + 1;
      } else {
        course = Math.ceil(dir) - 1;
      }
      this.setCourse(course);
    }
  }

  /**
   * Sets whether OBS is active.
   * @param active Whether OBS should be set to active.
   */
  private setActive(active: boolean): void {
    if (this.useSimObsState) {
      if (active) {
        SimVar.SetSimVarValue('K:GPS_OBS_ON', SimVarValueType.Number, 0);
      } else {
        SimVar.SetSimVarValue('K:GPS_OBS_OFF', SimVarValueType.Number, 0);
      }
    } else {
      SimVar.SetSimVarValue(this.activeSimVar, SimVarValueType.Bool, active ? 1 : 0);
    }
  }

  /**
   * Sets the OBS course.
   * @param course The course to set, in degrees.
   */
  private setCourse(course: number): void {
    if (!isFinite(course)) {
      return;
    }

    if (this.useSimObsState) {
      SimVar.SetSimVarValue('K:GPS_OBS_SET', SimVarValueType.Number, course);
    } else {
      SimVar.SetSimVarValue(this.courseSimVar, SimVarValueType.Degree, NavMath.normalizeHeading(course));
    }
  }

  /**
   * Syncs the sim's native OBS state to the LVars controlled by this manager.
   */
  private syncSimStateToLVars(): void {
    SimVar.SetSimVarValue(this.activeLVar, SimVarValueType.Bool, SimVar.GetSimVarValue('GPS OBS ACTIVE', SimVarValueType.Bool));
    SimVar.SetSimVarValue(this.courseLVar, SimVarValueType.Degree, SimVar.GetSimVarValue('GPS OBS VALUE', SimVarValueType.Degree));
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer control OBS state.
   */
  public destroy(): void {
    this.isAlive = false;

    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}