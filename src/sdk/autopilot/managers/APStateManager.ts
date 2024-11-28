import { EventBus } from '../../data/EventBus';
import { KeyEventData, KeyEventManager, KeyEvents } from '../../data/KeyEventManager';
import { SimVarValueType } from '../../data/SimVars';
import { APEvents, APLockType } from '../../instruments';
import { MSFSAPStates } from '../../navigation';
import { MappedSubject } from '../../sub/MappedSubject';
import { SubEvent, SubEventInterface } from '../../sub/SubEvent';
import { Subject } from '../../sub/Subject';
import { Subscribable } from '../../sub/Subscribable';
import { SubscribableMapFunctions } from '../../sub/SubscribableMapFunctions';
import { APConfig } from '../APConfig';

/** AP Mode Types */
export enum APModeType {
  LATERAL,
  VERTICAL,
  APPROACH
}

/** Interface for APModePressEvents */
export interface APModePressEvent {
  /** The Mode */
  mode: number;

  /** The Set Value, if any */
  set?: boolean;
}

/**
 * A class that manages the autopilot modes and autopilot mode states.
 */
export abstract class APStateManager {

  private readonly apListenerPromise: Promise<void>;
  private readonly keyEventManagerPromise: Promise<KeyEventManager>;

  protected apListenerRegistered = false;

  protected keyEventManager?: KeyEventManager;

  protected readonly flightDirectorStateSimVars = {
    [1]: 'AUTOPILOT FLIGHT DIRECTOR ACTIVE:1',
    [2]: 'AUTOPILOT FLIGHT DIRECTOR ACTIVE:2',
  };
  private readonly flightDirectorSimStates: Record<1 | 2, boolean | undefined> = {
    [1]: undefined,
    [2]: undefined,
  };
  private readonly flightDirectorPendingStates: Record<1 | 2, boolean> = {
    [1]: false,
    [2]: false,
  };
  private readonly flightDirectorPushedPendingStates: Record<1 | 2, boolean> = {
    [1]: false,
    [2]: false,
  };

  private readonly _stateManagerInitialized = Subject.create(false);
  /** Whether this manager has been initialized. */
  public readonly stateManagerInitialized = this._stateManagerInitialized as Subscribable<boolean>;

  public lateralPressed: SubEventInterface<this, APModePressEvent> = new SubEvent<this, APModePressEvent>();
  public verticalPressed: SubEventInterface<this, APModePressEvent> = new SubEvent<this, APModePressEvent>();
  public approachPressed: SubEventInterface<this, boolean | undefined> = new SubEvent<this, boolean | undefined>();
  public vnavPressed: SubEventInterface<this, boolean> = new SubEvent<this, boolean>();

  public apMasterOn = Subject.create(false);
  protected _isFlightDirectorOn = Subject.create(false);
  public isFlightDirectorOn = this._isFlightDirectorOn as Subscribable<boolean>;
  protected _isFlightDirectorCoPilotOn = Subject.create(false);
  public isFlightDirectorCoPilotOn = this._isFlightDirectorCoPilotOn as Subscribable<boolean>;
  /** Whether any flight director is switched on. */
  public readonly isAnyFlightDirectorOn = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this._isFlightDirectorOn,
    this._isFlightDirectorCoPilotOn,
  );

  /**
   * Creates an instance of the APStateManager.
   * @param bus An instance of the event bus.
   * @param apConfig This autopilot's configuration.
   */
  public constructor(protected readonly bus: EventBus, protected readonly apConfig: APConfig) {
    this.apListenerPromise = this.initAPListener();
    this.keyEventManagerPromise = this.initKeyEventManager();
  }

  /**
   * Initializes the Coherent autopilot listener and calls `this.onAPListenerRegistered()` when the listener is
   * registered.
   * @returns A Promise which is fulfilled when the autopilot listener has been registered and
   * `this.onAPListenerRegistered()` is finished executing.
   */
  private initAPListener(): Promise<void> {
    return new Promise<void>(resolve => {
      RegisterViewListener('JS_LISTENER_AUTOPILOT', () => {
        this.apListenerRegistered = true;
        this.onAPListenerRegistered();
        resolve();
      });
    });
  }

  /**
   * Initializes the key event manager and calls `this.onKeyEventManagerReady()` when the manager has been retrieved.
   * @returns A Promise which is fulfilled with the key event manager when it has been retrieved and
   * `this.onKeyEventManagerReady()` is finished executing.
   */
  private initKeyEventManager(): Promise<KeyEventManager> {
    return new Promise<KeyEventManager>(resolve => {
      KeyEventManager.getManager(this.bus).then(manager => {
        this.keyEventManager = manager;
        this.onKeyEventManagerReady(manager);
        resolve(manager);
      });
    });
  }

  /**
   * Waits until the Coherent autopilot listener has been registered and `this.onAPListenerRegistered()` has finished
   * executing.
   * @returns A Promise which is fulfilled when the Coherent autopilot listener has been registered and
   * `this.onAPListenerRegistered()` has finished executing.
   */
  protected awaitApListenerRegistered(): Promise<void> {
    return this.apListenerPromise;
  }

  /**
   * Waits until the key event manager has been retrieved and `this.onKeyEventManagerReady()` has finished executing.
   * @returns A Promise which is fulfilled when the key event manager has been retrieved and
   * `this.onKeyEventManagerReady()` has finished executing.
   */
  protected awaitKeyEventManagerReady(): Promise<KeyEventManager> {
    return this.keyEventManagerPromise;
  }

  /**
   * A callback which is called when the Coherent autopilot listener has been registered.
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
  }

  /**
   * A callback which is called when the key event manager has been retrieved.
   * @param manager The key event manager.
   */
  protected onKeyEventManagerReady(manager: KeyEventManager): void {
    this.setupKeyIntercepts(manager);
    this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.handleKeyIntercepted.bind(this));
  }

  /**
   * Sets up key intercepts necessary for managing the sim's flight director state.
   * @param manager The key event manager.
   */
  protected setupFlightDirectorKeyIntercepts(manager: KeyEventManager): void {
    manager.interceptKey('TOGGLE_FLIGHT_DIRECTOR', false);
  }

  /**
   * Sets up key intercepts for the simulation autopilot key events.
   * @param manager The key event manager.
   */
  protected abstract setupKeyIntercepts(manager: KeyEventManager): void;

  /**
   * Handles an intercepted key event.
   * @param data The event data.
   */
  protected abstract handleKeyIntercepted(data: KeyEventData): void;

  /**
   * Initializes this manager. If this manager has already been initialized, then this method does nothing.
   * @returns A Promise which will be fulfilled when the manager has been initialized. If the manager has already been
   * initialized, then the Promise will be fulfilled immediately.
   */
  public async initialize(): Promise<void> {
    if (this._stateManagerInitialized.get()) {
      return;
    }

    this.onBeforeInitialize();

    await Promise.all([this.awaitApListenerRegistered(), this.awaitKeyEventManagerReady()]);
    await this.enableAvionicsManagedMode();

    this.updateFlightDirectorStateFromSim(1);
    this.updateFlightDirectorStateFromSim(2);

    this.initFlightDirector();
    this._stateManagerInitialized.set(true);
  }

  /**
   * Enables avionics managed mode for the autopilot.
   */
  private async enableAvionicsManagedMode(): Promise<void> {
    if (!this.apListenerRegistered) {
      await this.awaitApListenerRegistered();
    }

    await Coherent.call('apSetAutopilotMode', MSFSAPStates.AvionicsManaged, 1);
  }

  /**
   * Initializes the flight director to a default value.
   */
  protected initFlightDirector(): void {
    this.setFlightDirector(false);
  }

  /**
   * Sets the flight director state.
   * @param state The state to set: `true` = on, `false` = off.
   * @param index The index of the flight director to set. If not defined, then the state of both flight directors will
   * be set. This parameter is ignored if the autopilot is not configured with independent flight directors, in which
   * case the state of both flight directors will always be set.
   */
  public setFlightDirector(state: boolean, index?: 1 | 2): void {
    if (!this.apConfig.independentFds) {
      index = undefined;
    }

    if (index === 1 || index === undefined) {
      this.setFlightDirectorState(1, state);
    }

    if (index === 2 || index === undefined) {
      this.setFlightDirectorState(2, state);
    }
  }

  /**
   * Sets the state of a flight director.
   * @param index The index of the flight director to set.
   * @param state The state to set.
   */
  protected setFlightDirectorState(index: 1 | 2, state: boolean): void {
    this.pendSimFlightDirectorState(index, state);
  }

  /**
   * Pends a flight director state to push to the sim.
   * @param index The index of the flight director for which to pend the state.
   * @param state The state to pend.
   */
  protected pendSimFlightDirectorState(index: 1 | 2, state: boolean): void {
    this.flightDirectorPendingStates[index] = state;
  }

  /**
   * A method that is called on every autopilot update cycle before the autopilot directors are updated.
   */
  public onBeforeUpdate(): void {
    this.updateFlightDirectorStateFromSim(1);
    this.updateFlightDirectorStateFromSim(2);
  }

  /**
   * Updates this manager's tracked flight director state from the sim.
   * @param index The index of the flight director to update.
   */
  protected updateFlightDirectorStateFromSim(index: 1 | 2): void {
    const simState = SimVar.GetSimVarValue(this.flightDirectorStateSimVars[1], SimVarValueType.Bool) !== 0;
    if (simState !== this.flightDirectorSimStates[index]) {
      this.flightDirectorSimStates[index] = simState;
      this.flightDirectorPendingStates[index] = simState;
      this.flightDirectorPushedPendingStates[index] = simState;
      this.onFlightDirectorSimStateChanged(index, simState);
    }
  }

  /**
   * Responds to when the sim state of a flight director changes.
   * @param index The index of the flight director whose state changed.
   * @param state The flight director's new state.
   */
  protected onFlightDirectorSimStateChanged(index: 1 | 2, state: boolean): void {
    if (!this.apConfig.independentFds) {
      this.setFlightDirectorState(index === 1 ? 2 : 1, state);
    }

    if (index === 1) {
      this._isFlightDirectorOn.set(state);
    } else {
      this._isFlightDirectorCoPilotOn.set(state);
    }
  }

  /**
   * A method that is called on every autopilot update cycle after the autopilot directors are updated.
   */
  public onAfterUpdate(): void {
    this.pushPendingFlightDirectorStateToSim(1);
    this.pushPendingFlightDirectorStateToSim(2);
  }

  /**
   * Pushes the pending state of a flight director to the sim.
   * @param index The index of the flight director for which to push the pending state.
   */
  protected pushPendingFlightDirectorStateToSim(index: 1 | 2): void {
    if (this.flightDirectorPendingStates[index] !== this.flightDirectorPushedPendingStates[index]) {
      SimVar.SetSimVarValue('K:TOGGLE_FLIGHT_DIRECTOR', 'number', index);
      this.flightDirectorPushedPendingStates[index] = this.flightDirectorPendingStates[index];
    }
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
  protected sendApModeEvent(type: APModeType, mode?: number, set?: boolean): void {
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
