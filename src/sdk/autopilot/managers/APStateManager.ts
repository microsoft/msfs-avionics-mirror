import { EventBus, KeyEventData, KeyEvents, KeyEventManager, SimVarValueType } from '../../data';
import { APEvents, APLockType } from '../../instruments';
import { MSFSAPStates } from '../../navigation';
import { SubEventInterface, SubEvent, Subject, Subscribable } from '../../sub';
import { APConfig, APLateralModes, APVerticalModes } from '../APConfig';

/** AP Mode Types */
export enum APModeType {
  LATERAL,
  VERTICAL,
  APPROACH
}

/** Interface for APModePressEvents */
export interface APModePressEvent {
  /** The Mode */
  mode: APLateralModes | APVerticalModes;
  /** The Set Value, if any */
  set?: boolean;
}

/**
 * A class that manages the autopilot modes and autopilot mode states.
 */
export abstract class APStateManager {

  protected keyEventManager?: KeyEventManager;

  private readonly apListener: ViewListener.ViewListener;

  protected apListenerRegistered = false;
  private managedModeSet = false;
  public stateManagerInitialized = Subject.create(false);

  public lateralPressed: SubEventInterface<this, APModePressEvent> = new SubEvent<this, APModePressEvent>();
  public verticalPressed: SubEventInterface<this, APModePressEvent> = new SubEvent<this, APModePressEvent>();
  public approachPressed: SubEventInterface<this, boolean | undefined> = new SubEvent<this, boolean | undefined>();
  public vnavPressed: SubEventInterface<this, boolean> = new SubEvent<this, boolean>();

  public apMasterOn = Subject.create(false);
  protected _isFlightDirectorOn = Subject.create(false);
  public isFlightDirectorOn = this._isFlightDirectorOn as Subscribable<boolean>;
  protected _isFlightDirectorCoPilotOn = Subject.create(false);
  public isFlightDirectorCoPilotOn = this._isFlightDirectorCoPilotOn as Subscribable<boolean>;

  /**
   * Creates an instance of the APStateManager.
   * @param bus An instance of the event bus.
   * @param apConfig This autopilot's configuration.
   */
  constructor(protected readonly bus: EventBus, protected readonly apConfig: APConfig) {

    KeyEventManager.getManager(bus).then(manager => {
      this.keyEventManager = manager;
      this.setupKeyIntercepts(manager);
      this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.handleKeyIntercepted.bind(this));
    });

    this.apListener = RegisterViewListener('JS_LISTENER_AUTOPILOT', () => {
      this.onAPListenerRegistered();
      this.apListenerRegistered = true;
    });
  }

  /**
   * A callback which is called when the autopilot listener has been registered.
   */
  protected onAPListenerRegistered(): void {
    const ap = this.bus.getSubscriber<APEvents>();

    ap.on('ap_lock_set').handle(lock => {
      if (lock === APLockType.VNav) {
        this.vnavPressed.notify(this, true);
      }
    });

    ap.on('ap_lock_release').handle(lock => {
      if (lock === APLockType.VNav) {
        this.vnavPressed.notify(this, false);
      }
    });

    ap.on('ap_master_status').handle(this.apMasterOn.set.bind(this.apMasterOn));

    ap.on('flight_director_is_active_1').whenChanged().handle((fd) => {
      this._isFlightDirectorOn.set(fd);
      this.setFlightDirector(fd);
    });

    ap.on('flight_director_is_active_2').whenChanged().handle((fd) => {
      this._isFlightDirectorCoPilotOn.set(fd);
      this.setFlightDirector(fd);
    });
  }

  /**
   * Sets up key intercepts for the simulation autopilot key events.
   * @param manager The key intercept manager.
   */
  protected abstract setupKeyIntercepts(manager: KeyEventManager): void;

  /**
   * Handles an intercepted key event.
   * @param data The event data.
   */
  protected abstract handleKeyIntercepted(data: KeyEventData): void;

  /**
   * Checks whether the AP State Manager has completed listerner steps,
   * and if so, finishes initializing and then notifies Autopilot of the same.
   * @param force forces the initialize
   */
  public initialize(force = false): void {
    this.onBeforeInitialize();
    if (force || (this.keyEventManager && this.apListenerRegistered)) {
      this.setManagedMode(true).then(() => {
        SimVar.SetSimVarValue('AUTOPILOT ALTITUDE LOCK VAR', SimVarValueType.Feet, this.apConfig.altitudeHoldDefaultAltitude ?? 0);
        this.initFlightDirector();
        this.stateManagerInitialized.set(true);
      });
    }
  }

  /** Initializes the flight director to a default value. */
  protected initFlightDirector(): void {
    this.setFlightDirector(false);
  }

  /**
   * Sets the Flight Director State
   * @param on is wheter to set the FD On.
   */
  public setFlightDirector(on: boolean): void {
    // HINT: Delay this by a frame so we know about the actual FD state
    setTimeout(() => {
      if (on !== this.isFlightDirectorOn.get()) {
        SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', 'number', 1);
        this._isFlightDirectorOn.set(on);
      }
      if (on !== this.isFlightDirectorCoPilotOn.get()) {
        SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', 'number', 2);
        this._isFlightDirectorCoPilotOn.set(on);
      }
    }, 0);
  }

  /**
   * Sets Managed Mode.
   * @param set is wheter to set or unset managed mode.
   */
  private async setManagedMode(set: boolean): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        if (set) {
          Coherent.call('apSetAutopilotMode', MSFSAPStates.AvionicsManaged, 1).then(() => resolve());
        } else {
          Coherent.call('apSetAutopilotMode', MSFSAPStates.AvionicsManaged, 0).then(() => resolve());
        }
        this.managedModeSet = set;
      }, 1000);
    });
  }

  /**
   * Toggles VNAV L Var value.
   */
  protected toggleVnav(): void {
    const vnavXmlVarValue = SimVar.GetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool');
    SimVar.SetSimVarValue('L:XMLVAR_VNAVButtonValue', 'Bool', vnavXmlVarValue ? 0 : 1);
  }

  /**
   * Sends AP Mode Events from the Intercept to the Autopilot.
   * @param type is the AP Mode Type for this event
   * @param mode is the mode to set/unset.
   * @param set is whether to actively set or unset this mode.
   */
  protected sendApModeEvent(type: APModeType, mode?: APLateralModes | APVerticalModes, set?: boolean): void {
    switch (type) {
      case APModeType.LATERAL:
        if (mode !== undefined) {
          this.lateralPressed.notify(this, { mode: mode, set: set });
        }
        break;
      case APModeType.VERTICAL:
        if (mode !== undefined) {
          this.verticalPressed.notify(this, { mode: mode, set: set });
        }
        break;
      case APModeType.APPROACH:
        this.approachPressed.notify(this, set);
        break;
    }
  }

  /**
   * Method to override with steps to run before initialze method is run.
   */
  protected onBeforeInitialize(): void {
    //noop
  }
}