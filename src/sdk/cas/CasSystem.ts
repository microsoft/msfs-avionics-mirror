/**
 * A bus-based system for publishing and managing CAS notifications.
 */

import { AnnunciationType } from '../components/Annunciatons';
import { EventBus, Publisher } from '../data/EventBus';
import { EventSubscriber } from '../data/EventSubscriber';
import { KeyEventData, KeyEventManager, KeyEvents } from '../data/KeyEventManager';
import { SimVarValueType } from '../data/SimVars';
import { NavMath } from '../geo/NavMath';
import { ClockEvents } from '../instruments/Clock';
import { ArraySubject } from '../sub/ArraySubject';
import { SubscribableArray } from '../sub/SubscribableArray';
import { ArrayUtils } from '../utils/datastructures/ArrayUtils';
import { SortedMappedSubscribableArray } from '../utils/datastructures/SortedMappedSubscribableArray';

/** The defining information required to register an alert. */
export type CasAlertDefinition = {
  /** A unique identifier for the alert. */
  uuid: string;

  /** The message text displayed on the CAS when the alert is active. */
  message: string;

  /** A list of inhibit states during with this alert should be inhibited. */
  inhibitedBy?: string[];

  /** A list of possible suffixes, in the order they're to be displayed when active. */
  suffixes?: string[];

  /** An optional debounce time, in milliseconds. */
  debounceTime?: number;
}

/** The data relevant to a single active CAS alert message. */
export type CasActiveMessage = {
  /** The UUID of this message's alert. */
  uuid: string;

  /** The text to be displayed for this message, excluding suffixes. */
  message: string;

  /** The current priority of this message. */
  priority: AnnunciationType;

  /** Whether this message has been acknowledged. */
  acknowledged: boolean;

  /** Whether this message's alert is currently inhibited. */
  inhibited: boolean;

  /** Whether this message's alert is currently suppressed. Used for Boeing CAN/RCL */
  suppressed: boolean;

  /** The last time this message's alert was activated. */
  lastActive: number;

  /** This message's currently active suffixes. */
  suffixes?: string[];

  /** This message's currently acknowledged suffixes. */
  acknowledgedSuffixes?: string[];
}

/** A compound type identifying a specific alert and suffix combination. */
export type CasAlertKey = {
  /** The UUID of the alert. */
  uuid: string;

  /** Optionally, a suffix for the alert. */
  suffix?: string;
}

/** Events for CAS notification management. */
export interface CasEvents {
  /**
   * Register a new alert.  Anything that can send a `cas_register_alert` message _must_ subscribe for and
   * respond to `cas_publish_registration` and `cas_publish_all_registration` requests.  This can be handled
   * manually or through the use of a `CasRegistrationManager`.
   */
  'cas_register_alert': CasAlertDefinition;

  /** Activate an alert at a given priority. */
  'cas_activate_alert': {
    /** The alert key that's going active. */
    key: CasAlertKey,
    /** The priority the new alert will have. */
    priority: AnnunciationType
  };

  /** Deactivate an alert. */
  'cas_deactivate_alert': {
    /** The alert key that's going inactive. */
    key: CasAlertKey,
    /** The priority of the alert that's going inactive. */
    priority: AnnunciationType
  };

  /** Sets whether newly activated alerts are initialized as acknowledged. */
  'cas_set_initial_acknowledge': boolean;

  /** Broadcast a master acknowledge event. */
  'cas_master_acknowledge': AnnunciationType;

  /** Acknowledges a single alert. */
  'cas_single_acknowledge': {
    /** The alert key that's going active. */
    key: CasAlertKey,
    /** The priority the new alert will have. */
    priority: AnnunciationType
  };

  /** Enable a CAS inhibit state. */
  'cas_activate_inhibit_state': string;

  /** Disable a CAS inhibit state. */
  'cas_deactivate_inhibit_state': string;

  /**
   * Request a republish of a single CAS registration.  Anything that can send a `cas_register_alert` message
   * _must_ be capable of responding to this.
   */
  'cas_publish_registration': string;

  /**
   * Request a republish of all CAS registrations.  Anything that can send a `cas_register_alert` message
   * _must_ be capable of responding to this.
   */
  'cas_publish_all_registrations': boolean;

  /**
   * Requests the CAS system to suppress all annunciations with the provided type/priority.
   */
  'cas_suppress_priority': AnnunciationType;

  /**
   * Requests the CAS system to unsuppress all annunciations with the provided type/priority.
   */
  'cas_unsuppress_priority': AnnunciationType;
}

/**
 * Event data describing a CAS alert.
 */
export type CasAlertEventData = {
  /** The unique identifier for the alert. */
  uuid: string;

  /** The suffix of the alert. */
  suffix?: string;

  /** The priority of the alert. */
  priority: AnnunciationType;

  /** Whether the alert is acknowledged. */
  acknowledged: boolean;
};

/**
 * Events related to {@link CasSystem} state.
 */
export interface CasStateEvents {
  /** Whether the master warning alert is active. */
  cas_master_warning_active: boolean;

  /** Whether the master caution alert is active. */
  cas_master_caution_active: boolean;

  /** A CAS alert that was previously hidden has been displayed in a message. */
  cas_alert_displayed: Readonly<CasAlertEventData>;

  /** A displayed CAS alert that was previously unacknowledged has been acknowledged. */
  cas_alert_acknowledged: Readonly<CasAlertEventData>;

  /** A CAS alert that was previously displayed in a message has been hidden. */
  cas_alert_hidden: Readonly<CasAlertEventData>;
}

/**
 * A system for CAS management.
 *
 * Every avionics system must have exactly one instance of CasSystem configured as the primary system. This is the one
 * that is responsible for triggering sim-level master caution/warning alerts and intercepting and handling master
 * acknowledge events.
 *
 * Each JS instrument should have at most one instance of CasSystem. Multiple instances of CasSystem on a single
 * instrument will cause duplicated events to be published to the topics defined by {@link CasStateEvents}.
 */
export class CasSystem {
  private readonly bus: EventBus;
  private readonly casSubscriber: EventSubscriber<CasEvents>;
  private readonly casPublisher: Publisher<CasEvents>;
  private readonly casStatePublisher: Publisher<CasStateEvents>;

  private registeredAlerts = new Map<string, CasAlertDefinition>();
  private activeInhibitStates = new Set<string>();

  private scheduledSuffixedAlerts = new Map<string, Map<string, Map<AnnunciationType, number>>>();
  private scheduledUnsuffixedAlerts = new Map<string, Map<AnnunciationType, number>>();
  private previousScheduleCheckTime = -1;

  private isPrimary: boolean;
  private initialAcknowledge = true;

  private masterWarningActive: boolean | undefined = undefined;
  private masterCautionActive: boolean | undefined = undefined;

  /** A compound map containing every active CAS message at every message priority. */
  private allMessages = new Map<AnnunciationType, Map<string, CasActiveMessage>>([
    [AnnunciationType.Warning, new Map<string, CasActiveMessage>()],
    [AnnunciationType.Caution, new Map<string, CasActiveMessage>()],
    [AnnunciationType.Advisory, new Map<string, CasActiveMessage>()],
    [AnnunciationType.SafeOp, new Map<string, CasActiveMessage>()],
  ]);

  /** An array of CAS messages filtered to only show the highest priority for any given UUID and suffix. */
  private displayedCasMessages = ArraySubject.create<CasActiveMessage>();

  private prevDisplayedCasMessages: CasActiveMessage[] = [];

  /** The displayable CAS messages sorted by the standard sort order of priority, state, and age. */
  // TODO Add the ability to specify alternate sorting logic.
  private _casActiveMessageSubject = SortedMappedSubscribableArray.create<CasActiveMessage>(
    this.displayedCasMessages,
    (a, b) => {
      if (a.uuid && b.uuid && a.lastActive !== undefined && b.lastActive !== undefined) {
        if (a.priority === b.priority) {
          return b.lastActive - a.lastActive;
        }
        return a.priority - b.priority;
      } else {
        return 0;
      }
    },
    (a, b) => a.uuid === b.uuid
  );
  public readonly casActiveMessageSubject = this._casActiveMessageSubject as SubscribableArray<CasActiveMessage>;

  /**
   * Create a CasSystem.
   * @param bus The event bus.
   * @param primary Whether or not this is the system responsible for managing alerts at the sim level.
   */
  constructor(bus: EventBus, primary = false) {
    this.bus = bus;
    this.casSubscriber = this.bus.getSubscriber<CasEvents>();
    this.casPublisher = this.bus.getPublisher<CasEvents>();
    this.casStatePublisher = this.bus.getPublisher<CasStateEvents>();

    this.isPrimary = primary;

    this.setMasterStatus(AnnunciationType.Caution, false);
    this.setMasterStatus(AnnunciationType.Warning, false);

    this.bus.getSubscriber<ClockEvents>().on('simTime').handle(t =>
      this.checkScheduledAlerts(t)
    );

    // If this is the primary CAS system, set up handlers for the master caution and warning
    // acknowledgement events and reset the initial alert state.
    if (this.isPrimary) {
      KeyEventManager.getManager(this.bus).then(manager => {
        manager.interceptKey('MASTER_CAUTION_ACKNOWLEDGE', true);
        manager.interceptKey('MASTER_WARNING_ACKNOWLEDGE', true);
      });

      this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(
        (keyData: KeyEventData) => {
          switch (keyData.key) {
            case 'MASTER_CAUTION_ACKNOWLEDGE':
              this.casPublisher.pub('cas_master_acknowledge', AnnunciationType.Caution, true, false);
              break;
            case 'MASTER_WARNING_ACKNOWLEDGE':
              this.casPublisher.pub('cas_master_acknowledge', AnnunciationType.Warning, true, false);
              break;
          }
        }
      );
    }

    // Set up subs to the events we react to.
    this.casSubscriber.on('cas_register_alert').handle(alertConfig => {
      if (!this.registeredAlerts.has(alertConfig.uuid)) {
        this.registeredAlerts.set(alertConfig.uuid, alertConfig);
      }
    });

    this.casSubscriber.on('cas_activate_alert').handle(eventData => {
      this.scheduleAlert(eventData.key, eventData.priority);
    });

    this.casSubscriber.on('cas_deactivate_alert').handle(eventData => {
      this.deactivateAlert(eventData.key, eventData.priority);
    });

    this.casSubscriber.on('cas_activate_inhibit_state').handle(state => {
      this.handleInhibitState(state, true);
    });

    this.casSubscriber.on('cas_deactivate_inhibit_state').handle(state => {
      this.handleInhibitState(state, false);
    });

    this.casSubscriber.on('cas_set_initial_acknowledge').handle(v => {
      this.initialAcknowledge = v;
    });

    this.casSubscriber.on('cas_master_acknowledge').handle(ackType => {
      this.handleAcknowledgement(ackType);
    });

    this.casSubscriber.on('cas_single_acknowledge').handle(({ key, priority }) => {
      this.handleSingleAcknowledgement(key, priority);
    });

    // Requests the CAS system to suppress all annunciations with the provided priority.
    this.casSubscriber.on('cas_suppress_priority').handle(priority => {
      this.suppressType(priority);
    });

    // Requests the CAS system to unsuppress all annunciations with the provided priority.
    this.casSubscriber.on('cas_unsuppress_priority').handle(priority => {
      this.unsuppressAllSuppressed(priority);
    });

    this.casPublisher.pub('cas_publish_all_registrations', true, true);
  }

  /**
   * Suppress all messages of a given type.
   * @param priority The type of messages which shall be suppressed.
   */
  private suppressType(priority: AnnunciationType): void {
    for (const [, message] of this.allMessages.get(priority) || []) {
      message.suppressed = true;
    }
    this.refreshDisplayedAlerts();
  }

  /**
   * Unsuppress all messages of a given type.
   * @param priority The type of messages which shall be suppressed.
   */
  private unsuppressAllSuppressed(priority: AnnunciationType): void {
    for (const [, message] of this.allMessages.get(priority) || []) {
      message.suppressed = false;
    }
    this.refreshDisplayedAlerts();
  }

  /**
   * Create a new message from an alert key at a given priority.
   * @param alertKey The alert key.
   * @param priority The priority.
   * @returns A new CasActiveMessage or undefined if the key was invalid.
   */
  private createNewMessage(alertKey: CasAlertKey, priority: AnnunciationType): CasActiveMessage | undefined {
    const def = this.registeredAlerts.get(alertKey.uuid);
    if (def === undefined) {
      return undefined;
    }

    let inhibited = false;
    for (const state of def.inhibitedBy || []) {
      if (this.activeInhibitStates.has(state)) {
        inhibited = true;
        break;
      }
    }

    return {
      uuid: alertKey.uuid,
      message: def.message ?? 'MISSING MESSAGE',
      priority: priority,
      acknowledged: this.initialAcknowledge,
      inhibited: inhibited,
      suppressed: false,
      lastActive: Date.now(),
      suffixes: alertKey.suffix !== undefined ? [alertKey.suffix] : undefined,
      acknowledgedSuffixes: alertKey.suffix !== undefined ? this.initialAcknowledge ? [alertKey.suffix] : [] : undefined
    };
  }


  /**
   * Schedule an alert to go active at the end of its debounce time.
   * @param alertKey The UUID and optional suffix of the alert to handle.
   * @param priority The priority of the alert to fire.
   */
  private scheduleAlert(alertKey: CasAlertKey, priority: AnnunciationType): void {
    if (!this.checkValidAlertKey(alertKey)) {
      return;
    }

    const debounceTime = this.registeredAlerts.get(alertKey.uuid)?.debounceTime;
    if (debounceTime === undefined) {
      this.activateAlert(alertKey, priority);
      return;
    }

    // Traverse the nested maps of scheduled alerts and create a schedule item if needed.
    if (alertKey.suffix !== undefined) {
      let uuidMap = this.scheduledSuffixedAlerts.get(alertKey.uuid);
      if (uuidMap === undefined) {
        uuidMap = new Map<string, Map<AnnunciationType, number>>();
        this.scheduledSuffixedAlerts.set(alertKey.uuid, uuidMap);
      }
      let suffixMap = uuidMap.get(alertKey.suffix);
      if (suffixMap === undefined) {
        suffixMap = new Map<AnnunciationType, number>();
        uuidMap.set(alertKey.suffix, suffixMap);
      }
      const time = suffixMap.get(priority);
      if (time !== undefined) {
        return;
      }
      suffixMap.set(priority, debounceTime);
    } else {
      let uuidMap = this.scheduledUnsuffixedAlerts.get(alertKey.uuid);
      if (uuidMap === undefined) {
        uuidMap = new Map<AnnunciationType, number>();
        this.scheduledUnsuffixedAlerts.set(alertKey.uuid, uuidMap);
      }
      const time = uuidMap.get(priority);
      if (time !== undefined) {
        return;
      }
      uuidMap.set(priority, debounceTime);
    }
  }

  /**
   * Check the scheduled alerts to see if there's anything that needs to fire.
   * @param timestamp The current sim time.
   */
  private checkScheduledAlerts(timestamp: number): void {
    if (this.previousScheduleCheckTime !== -1) {
      const deltaTime = NavMath.clamp(timestamp - this.previousScheduleCheckTime, 0, 10000);

      if (deltaTime > 0) {
        // Handle unsuffixed alerts.
        for (const [uuid, uuidMap] of this.scheduledUnsuffixedAlerts) {
          for (const [priority, delay] of uuidMap) {
            const newDelay = delay - deltaTime;
            if (newDelay <= 0) {
              uuidMap.delete(priority);
              this.activateAlert({ uuid: uuid }, priority);
            } else {
              uuidMap.set(priority, newDelay);
            }
          }
        }

        // And then suffixed ones.
        for (const [uuid, uuidMap] of this.scheduledSuffixedAlerts) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [suffix, suffixMap] of uuidMap) {
            for (const [priority, delay] of suffixMap) {
              const newDelay = delay - deltaTime;
              if (newDelay <= 0) {
                suffixMap.delete(priority);
                this.activateAlert({ uuid: uuid, suffix: suffix }, priority);
              } else {
                suffixMap.set(priority, newDelay);
              }
            }
          }
        }
      }
    }

    this.previousScheduleCheckTime = timestamp;
  }

  /**
   * Handle an alert going active.
   * @param alertKey The UUID and optional suffix of the alert to handle.
   * @param priority The priority of the alert to fire.
   */
  private activateAlert(alertKey: CasAlertKey, priority: AnnunciationType): void {
    if (!this.checkValidAlertKey(alertKey)) {
      return;
    }

    // Check to see if there's an existing alert for this message at this priority level.
    const messagesAtPriority = this.allMessages.get(priority);
    const uuidMessageAtPriority = messagesAtPriority?.get(alertKey.uuid);
    if (uuidMessageAtPriority === undefined) {
      // There's not already an existing message, so we make one.
      const newMessage = this.createNewMessage(alertKey, priority);
      if (newMessage !== undefined) {
        messagesAtPriority?.set(alertKey.uuid, newMessage);
      }
    } else {
      // There is an existing message at this priority level so we need to update it instead.
      uuidMessageAtPriority.acknowledged &&= this.initialAcknowledge;
      uuidMessageAtPriority.lastActive = Date.now();

      // Suffix handling.  If one is in the alert key, make sure it's added to the active
      // message if it's not already present.
      if (alertKey.suffix !== undefined) {
        // These arrays must be defined or else checkValidAlertKey() would have returned false.
        const suffixes = uuidMessageAtPriority.suffixes as string[];
        const acknowledgedSuffixes = uuidMessageAtPriority.acknowledgedSuffixes as string[];

        if (!suffixes.includes(alertKey.suffix)) {
          suffixes.push(alertKey.suffix);

          if (this.initialAcknowledge) {
            acknowledgedSuffixes.push(alertKey.suffix);
          }

          const suffixOrder = this.registeredAlerts.get(alertKey.uuid)?.suffixes;
          if (suffixOrder !== undefined) {
            const comparator = (a: string, b: string): number => suffixOrder.indexOf(a) - suffixOrder.indexOf(b);
            suffixes.sort(comparator);

            if (this.initialAcknowledge) {
              acknowledgedSuffixes.sort(comparator);
            }
          }
        }
      }
    }

    this.refreshDisplayedAlerts();
  }

  /**
   * Handle an alert going inactive.
   * @param alertKey The UUID and optional suffix of the alert to handle.
   * @param priority The priority of the alert to clear.
   */
  private deactivateAlert(alertKey: CasAlertKey, priority: AnnunciationType): void {
    if (!this.checkValidAlertKey(alertKey)) {
      return;
    }

    // We are deactivating an alert.  If there is no suffix provided this is easy.
    if (alertKey.suffix === undefined) {
      this.allMessages.get(priority)?.delete(alertKey.uuid);
      this.scheduledUnsuffixedAlerts.get(alertKey.uuid)?.delete(priority);
    } else {
      this.scheduledSuffixedAlerts.get(alertKey.uuid)?.get(alertKey.suffix)?.delete(priority);
      // With suffixes in the mix we need a little more intelligence.  First, find the relevant message.
      const messagesAtPriority = this.allMessages.get(priority);
      const uuidMessageAtPriority = messagesAtPriority?.get(alertKey.uuid);
      if (uuidMessageAtPriority !== undefined) {
        // These arrays must be defined or else checkValidAlertKey() would have returned false.
        const suffixes = uuidMessageAtPriority.suffixes as string[];
        const acknowledgedSuffixes = uuidMessageAtPriority.acknowledgedSuffixes as string[];

        // Remove the suffix from the message's suffix array.
        const index = suffixes.indexOf(alertKey.suffix);
        if (index >= 0) {
          suffixes.splice(index, 1);
        }

        if (suffixes.length == 0) {
          // We've just removed the last suffix, we can fully disable this alert.
          messagesAtPriority?.delete(alertKey.uuid);
        } else {
          // Remove the suffix from the message's acknowledged suffix array.
          const acknowledgedIndex = acknowledgedSuffixes.indexOf(alertKey.suffix);
          if (acknowledgedIndex >= 0) {
            acknowledgedSuffixes.splice(acknowledgedIndex, 1);
          }
        }
      }
    }

    this.refreshDisplayedAlerts();
  }

  /**
   * Handle a master warning or caution acknowledgement.
   * @param type The type of alert to acknowledge.
   */
  protected handleAcknowledgement(type: AnnunciationType): void {
    this.setMasterStatus(type, false);

    const messagesAtPriority = this.allMessages.get(type);
    if (messagesAtPriority !== undefined) {
      for (const uuid of messagesAtPriority.keys()) {
        const message = messagesAtPriority.get(uuid);
        if (message !== undefined && !message.inhibited) {
          this.acknowledgeMessage(message);
        }
      }
    }

    this.refreshDisplayedAlerts();
  }

  /**
   * Handle acknowledgement of a single message
   * @param key The UUID and optional suffix of the alert to handle.
   * @param priority The priority of the alert to handle.
   */
  protected handleSingleAcknowledgement(key: CasAlertKey, priority: AnnunciationType): void {
    const messagesAtPriority = this.allMessages.get(priority);
    if (messagesAtPriority) {
      const messageToBeAck = messagesAtPriority.get(key.uuid);
      if (messageToBeAck !== undefined && !messageToBeAck.inhibited) {
        this.acknowledgeMessage(messageToBeAck);
        this.refreshDisplayedAlerts();
      }
    }
  }

  /**
   * Acknowledge a single message by mutating it.
   * @param message The message to be acknowledged from CasSystem's `allMessages`
   */
  protected acknowledgeMessage(message: CasActiveMessage): void {
    message.acknowledged = true;

    if (message.suffixes && message.acknowledgedSuffixes) {
      // Copy the suffixes array into the acknowledged suffixes array since every suffix is now acknowledged
      message.acknowledgedSuffixes.length = message.suffixes.length;
      for (let i = 0; i < message.suffixes.length; i++) {
        const suffix = message.suffixes[i];
        if (message.acknowledgedSuffixes[i] !== suffix) {
          message.acknowledgedSuffixes.splice(i, 0, suffix);

          this.casStatePublisher.pub('cas_alert_acknowledged', {
            uuid: message.uuid,
            suffix: message.suffixes[i],
            priority: message.priority,
            acknowledged: true
          }, false, false);
        }
      }
    } else {
      this.casStatePublisher.pub('cas_alert_acknowledged', {
        uuid: message.uuid,
        priority: message.priority,
        acknowledged: true
      }, false, false);
    }
  }

  /**
   * Handle the setting of a new inhibit state.
   * @param state The name of the inhibited state to set.
   * @param active Whether the state is active or not.
   */
  private handleInhibitState(state: string, active: boolean): void {
    if ((active && !this.activeInhibitStates.has(state)) || (!active && this.activeInhibitStates.has(state))) {
      if (active) {
        this.activeInhibitStates.add(state);
      } else {
        this.activeInhibitStates.delete(state);
      }

      for (const priority of this.allMessages.keys()) {
        for (const message of this.allMessages.get(priority)?.values() ?? []) {
          if (message !== undefined) {
            let isInhibited = false;
            for (const candidateState of this.registeredAlerts.get(message.uuid)?.inhibitedBy ?? []) {
              if (this.activeInhibitStates.has(candidateState)) {
                isInhibited = true;
                break;
              }
            }
            message.inhibited = isInhibited;
          }
        }
      }
    }

    this.refreshDisplayedAlerts();
  }

  /**
   * Set both sets of simvars relevant to a master caution or warning status.
   * @param type The type of the status to set
   * @param active Whether or not the status is active
   */
  private setMasterStatus(type: AnnunciationType, active: boolean): void {
    switch (type) {
      case AnnunciationType.Caution:
        if (this.masterCautionActive !== active) {
          if (this.isPrimary) {
            SimVar.SetSimVarValue('K:MASTER_CAUTION_SET', SimVarValueType.Number, active ? 1 : 0);
            SimVar.SetSimVarValue('L:Generic_Master_Caution_Active', SimVarValueType.Bool, active);
          }

          this.masterCautionActive = active;
          this.casStatePublisher.pub('cas_master_caution_active', active, false, true);
        }
        break;
      case AnnunciationType.Warning:
        if (this.masterWarningActive !== active) {
          if (this.isPrimary) {
            SimVar.SetSimVarValue('K:MASTER_WARNING_SET', SimVarValueType.Number, active ? 1 : 0);
            SimVar.SetSimVarValue('L:Generic_Master_Warning_Active', SimVarValueType.Bool, active);
          }

          this.masterWarningActive = active;
          this.casStatePublisher.pub('cas_master_warning_active', active, false, true);
        }
        break;
    }
  }

  /**
   * Get the full registered definition of an alert based on its key.
   * @param alertKey The key of the alert definition to retrieve.
   * @returns The full alert definition, or undefined if not found.
   */
  private getAlertDefinition(alertKey: CasAlertKey): CasAlertDefinition | undefined {
    const alertDefinition = this.registeredAlerts.get(alertKey.uuid);
    if (alertDefinition === undefined) {
      console.warn(`Trying to access an unregistered alert UUID: ${alertKey.uuid}`);
      return undefined;
    } else {
      return alertDefinition;
    }
  }

  /**
   * Check whether a provided alert key is valid according to the alert's suffix definition.
   * @param alertKey The key of the alert to check.
   * @returns A boolean indicating whether the key is valid.
   */
  private checkValidAlertKey(alertKey: CasAlertKey): boolean {
    const alertDefinition = this.getAlertDefinition(alertKey);
    if (alertDefinition === undefined) {
      return false;
    }

    const suffixes = alertDefinition.suffixes;
    if (alertKey.suffix === undefined && suffixes !== undefined) {
      console.warn(`Trying to access a suffixed alert without a suffix: '${alertDefinition.message}'`);
      return false;
    } else if (alertKey.suffix !== undefined && suffixes === undefined) {
      console.warn(`Trying to access a non-suffixed alert with a suffix: '${alertDefinition.message}:${alertKey.suffix}'`);
      return false;
    } else if (alertKey.suffix !== undefined && !suffixes?.includes(alertKey.suffix)) {
      console.warn(`Trying to access a suffixed alert with an invalid suffix: '${alertDefinition.message}:${alertKey.suffix}'`);
      return false;
    }

    return true;
  }

  /**
   * See if there is still an active, unacked annunciation of the given type.
   * @param type The annunciation type to check for.
   * @returns True if there is an active, unacked annunciation of the given type, false otherwise.
   */
  protected checkForActiveType(type: AnnunciationType): boolean {
    const messagesAtPriority = this.allMessages.get(type);
    if (messagesAtPriority !== undefined) {
      for (const message of messagesAtPriority.values()) {
        if (!message.acknowledged) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Reprocess all active alerts to generate a list consisting only of those which are displayable.
   * At the same time, keep track of whether or not the master warning or caution lights should be
   * active and, if the primary CasSystem, set them appropriately when done.
   */
  private refreshDisplayedAlerts(): void {
    this.displayedCasMessages.clear();
    const unsuffixedDisplayedKeys = new Set<string>();
    const suffixedDisplayedKeys = new Map<string, Set<string>>();
    let unackedWarnings = false;
    let unackedCautions = false;

    for (const priority of [
      AnnunciationType.Warning,
      AnnunciationType.Caution,
      AnnunciationType.Advisory,
      AnnunciationType.SafeOp
    ]) {
      // Go through the UUIDs of all active messages at this priority.
      for (const [uuid, message] of this.allMessages.get(priority) || []) {
        // If the message is currently inhibited or suppressed, skip over it.
        if (message.inhibited || message.suppressed) {
          continue;
        }
        // In the simple case we have no suffixes.   In which case we either add
        // the message to the displayed array or continue.
        if (message.suffixes === undefined) {
          if (!unsuffixedDisplayedKeys.has(uuid)) {
            unsuffixedDisplayedKeys.add(uuid);
            this.displayedCasMessages.insert(message);
            if (!message.acknowledged) {
              switch (priority) {
                case AnnunciationType.Warning:
                  unackedWarnings = true; break;
                case AnnunciationType.Caution:
                  unackedCautions = true; break;
              }
            }
          }
        } else {
          // We do have suffixes to worry about.  Yay.  Let's store all the ones
          // that are supposed to be displayed at this level and reset the list
          // in our message.
          const origSuffixes = message.suffixes;
          message.suffixes = [];
          // Now we go through the active suffixes and see if they've already been
          // displayed at a higher priority.
          for (const suffix of origSuffixes) {
            const suffixesDisplayed = suffixedDisplayedKeys.get(uuid);
            if (suffixesDisplayed === undefined) {
              // First time we've seen any suffix for this UUID
              suffixedDisplayedKeys.set(uuid, new Set<string>([suffix]));
              message.suffixes.push(suffix);
            } else {
              // We've already displayed some suffix for this UID.  But is is the one
              // we're working with now?
              if (!suffixesDisplayed.has(suffix)) {
                suffixesDisplayed.add(suffix);
                message.suffixes.push(suffix);
              }
            }
          }
          // Now, assuming we added back at least one suffix we want to display this
          // message, so add it to the array.
          if (message.suffixes.length > 0) {
            this.displayedCasMessages.insert(message);
            if (!message.acknowledged) {
              switch (priority) {
                case AnnunciationType.Warning:
                  unackedWarnings = true; break;
                case AnnunciationType.Caution:
                  unackedCautions = true; break;
              }
            }
          }
        }
      }
    }

    this.setMasterStatus(AnnunciationType.Caution, unackedCautions);
    this.setMasterStatus(AnnunciationType.Warning, unackedWarnings);

    // Diff the old and new messages and publish state change events.

    const oldMessages = this.prevDisplayedCasMessages;
    const newMessages = this.displayedCasMessages.getArray();

    this.diffAlerts(newMessages, oldMessages, 'cas_alert_hidden');
    this.diffAlerts(oldMessages, newMessages, 'cas_alert_displayed');

    // We need to deep copy the new displayed messages array because messages in the displayed array can be mutated.
    CasSystem.copyMessageArray(newMessages, this.prevDisplayedCasMessages);
  }

  /**
   * Finds alerts displayed in a query message array that are not displayed in a reference message array and publishes
   * them.
   * @param referenceMessages The reference message array.
   * @param queryMessages The query message array.
   * @param topic The event bus topic to publish to.
   */
  private diffAlerts(referenceMessages: readonly CasActiveMessage[], queryMessages: readonly CasActiveMessage[], topic: 'cas_alert_displayed' | 'cas_alert_hidden'): void {
    // Using old-fashioned for loops here to avoid object/function creation
    for (let i = 0; i < queryMessages.length; i++) {
      const queryMessage = queryMessages[i];
      let matchedReferenceMessage: CasActiveMessage | undefined = undefined;

      for (let j = 0; j < referenceMessages.length; j++) {
        const referenceMessage = referenceMessages[j];

        if (referenceMessage.priority === queryMessage.priority && referenceMessage.uuid === queryMessage.uuid) {
          matchedReferenceMessage = referenceMessage;
          break;
        }
      }

      // If the new message has suffixes, then we need to check each suffix to see if a matched message contained the
      // same suffix. Otherwise, we need to check if a matched message exists and had no suffix.
      if (queryMessage.suffixes && queryMessage.suffixes.length > 0) {
        for (let k = 0; k < queryMessage.suffixes.length; k++) {
          const suffix = queryMessage.suffixes[k];
          if (!matchedReferenceMessage || !matchedReferenceMessage.suffixes || !matchedReferenceMessage.suffixes.includes(suffix)) {
            this.casStatePublisher.pub(topic, {
              uuid: queryMessage.uuid,
              suffix,
              priority: queryMessage.priority,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              acknowledged: queryMessage.acknowledgedSuffixes!.includes(suffix)
            }, false, false);
          }
        }
      } else if (!matchedReferenceMessage || (matchedReferenceMessage.suffixes && matchedReferenceMessage.suffixes.length > 0)) {
        this.casStatePublisher.pub(topic, {
          uuid: queryMessage.uuid,
          priority: queryMessage.priority,
          acknowledged: queryMessage.acknowledged
        }, false, false);
      }
    }
  }

  /**
   * Copies a CAS message.
   * @param source The source message to copy from.
   * @param target The target message to copy to. If not defined, a new message object will be created.
   * @returns The message copy.
   */
  private static copyMessage(source: Readonly<CasActiveMessage>, target?: CasActiveMessage): CasActiveMessage {
    target ??= {} as CasActiveMessage;

    target.uuid = source.uuid;
    target.message = source.message;
    target.priority = source.priority;
    target.acknowledged = source.acknowledged;
    target.inhibited = source.inhibited;
    target.suppressed = source.suppressed;
    target.lastActive = source.lastActive;

    if (source.suffixes) {
      target.suffixes = ArrayUtils.shallowCopy(source.suffixes, target.suffixes);
    } else {
      target.suffixes = undefined;
    }

    if (source.acknowledgedSuffixes) {
      target.acknowledgedSuffixes = ArrayUtils.shallowCopy(source.acknowledgedSuffixes, target.acknowledgedSuffixes);
    } else {
      target.acknowledgedSuffixes = undefined;
    }

    return target;
  }

  /**
   * Performs a deep copy of a CAS message array.
   * @param source The source array to copy from.
   * @param target The target array to copy to. If not defined, a new array will be created.
   * @returns The array copy.
   */
  private static copyMessageArray(source: readonly CasActiveMessage[], target?: CasActiveMessage[]): CasActiveMessage[] {
    target ??= [];

    target.length = source.length;

    for (let i = 0; i < source.length; i++) {
      target[i] = CasSystem.copyMessage(source[i], target[i]);
    }

    return target;
  }
}
