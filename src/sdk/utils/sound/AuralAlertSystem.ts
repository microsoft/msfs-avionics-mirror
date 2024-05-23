/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { EventBus } from '../../data/EventBus';
import { BinaryHeap } from '../datastructures/BinaryHeap';
import { DebounceTimer } from '../time/DebounceTimer';
import { Wait } from '../time/Wait';
import { SoundPacket, SoundServerControlEvents, SoundServerEvents } from './SoundServer';

/**
 * A sound packet that can be played by {@link SoundServer}.
 */
export type AuralAlertDefinition = {
  /** The ID of the alert. */
  uuid: string;

  /**
   * The name of the queue to which the alert belongs. Only one alert from each queue can play simultaneously unless
   * they are on different tracks (see the documentation for `track` for more information).
   */
  queue: string;

  /**
   * The priority of the alert within its queue. If two alerts in the same queue become active at the same time, the
   * alert with the higher priority will play first. However, alerts cannot interrupt other alerts that are already
   * playing, regardless of their relative priorities.
   */
  priority: number;

  /**
   * The name of the track on which to play the alert. Each queue has an arbitrary number of tracks. Alerts on
   * different tracks can play at the same time. However, an alert will still wait until all other alerts in the same
   * queue with higher priority are finished playing before it starts playing, even if the other alerts are playing on
   * different tracks. If not defined, then the alert will play on the default track (with name equal to `''`).
   */
  track?: string;

  /**
   * The sequence of sound atoms to play for the alert, as either a single ID or an array of IDs. Each atom is a single
   * sound file.
   */
  sequence: string | readonly string[];

  /**
   * Whether the alert's sound sequence should loop from the beginning when it is finished playing. If `true`, then the
   * alert effectively has an infinite duration, and once it starts playing it will never stop until forced to do so by
   * a deactivate, untrigger, or kill command.
   */
  continuous: boolean;

  /**
   * Whether the alert should be requeued after it finishes playing if it is still active. If `true`, then the alert
   * will play continuously while active as long as another alert of higher priority is not queued.
   */
  repeat: boolean;

  /**
   * The amount of time, in milliseconds, after the alert starts playing at which to forcibly stop the alert. It is
   * recommended to set this value to be at least several seconds longer than the expected length of the alert's
   * entire sequence. If the alert is continuous, the timeout is reset with each loop. Defaults to 10000 milliseconds.
   */
  timeout?: number;

  /**
   * The amount of time, in milliseconds, that the alert can remain in the queue before it is automatically removed
   * from the queue. Defaults to `Infinity`.
   */
  queuedLifetime?: number;
};

/**
 * Events published by {@link AuralAlertSystem}.
 */
export interface AuralAlertEvents {
  /** Requests all alerts to be registered again. */
  aural_alert_request_all_registrations: void;
}

/**
 * Data describing how to activate an alert.
 */
export type AuralAlertActivation = {
  /** The ID of the alert to activate. */
  uuid: string;

  /**
   * The alias to use to activate or trigger the alert instead of the alert's registered ID. The alias must be unique.
   *
   * If an alias is defined, it will be used in place of the alert's registered ID when determining activation or
   * trigger state. Alerts activated or triggered with multiple aliases will play once per alias. In effect, using an
   * alias behaves as if a copy of the aliased alert were temporarily registered with the alias as its ID for as long
   * as the alias is activated/triggered.
   */
  alias?: string;

  /**
   * The suffix to append to the alert's ID to activate or trigger the alert. Suffixing an alert ID will generate a
   * suffixed ID in the form ``` `${uuid}::${suffix}` ```. The suffixed ID must be unique.
   *
   * If a suffix is defined, the suffixed ID will be used to determine activation/triggered state. An alert can be
   * activated or triggered with multiple suffixes. However, it will still only be played once regardless of how many
   * of its suffixes are active or triggered. An alert is considered deactivated or untriggered only when all of its
   * suffixes are deactivated or untriggered.
   *
   * If both an alias and a suffix are defined, the suffix will be appended to the _alias_ instead of the alert's
   * registered ID.
   */
  suffix?: string;

  /**
   * The name of the track on which to play the alert. Each queue has an arbitrary number of tracks. Alerts on
   * different tracks can play at the same time. However, an alert will still wait until all other alerts in the same
   * queue with higher priority are finished playing before it starts playing, even if the other alerts are playing on
   * different tracks. If not defined, then the track defined when the alert was registered will be used.
   */
  track?: string;

  /**
   * The sequence of sound atoms to play for the alert, as either a single ID or an array of IDs. Each atom is a single
   * sound file. If not defined, then the sequence defined when the alert was registered will be played.
   */
  sequence?: string | readonly string[];

  /**
   * Whether the alert's sound sequence should loop from the beginning when it is finished playing. If `true`, then the
   * alert effectively has an infinite duration, and once it starts playing it will never stop until forced to do so by
   * a deactivate, untrigger, or kill command. If not defined, then the alert will loop if and only if it was defined
   * to do so during registration.
   */
  continuous?: boolean;

  /**
   * Whether the alert should be requeued after it finishes playing if it is still active. If `true`, then the alert
   * will play continuously while active as long as another alert of higher priority is not queued. If not defined,
   * then the alert will repeat if and only if it was defined to do so during registration.
   */
  repeat?: boolean;

  /**
   * The amount of time, in milliseconds, after the alert starts playing at which to forcibly stop the alert. It is
   * recommended to set this value to be at least several seconds longer than the expected length of the alert's
   * entire sequence. If the alert is continuous, the timeout is reset with each loop. If not defined, then the timeout
   * defined when the alert was registered will be used.
   */
  timeout?: number;

  /**
   * The amount of time, in milliseconds, that the alert can remain in the queue before it is automatically removed
   * from the queue. If not defined, then the lifetime defined when the alert was registered will be used.
   */
  queuedLifetime?: number;
};

/**
 * Events used to send commands to {@link AuralAlertSystem}.
 */
export interface AuralAlertControlEvents {
  /**
   * Registers an aural alert. Alerts must be registered before they can be activated.
   */
  aural_alert_register: Readonly<AuralAlertDefinition>;

  /**
   * Activates an aural alert. The event data should be the unique ID of the alert or an activation data object that
   * contains the unique ID and optional override parameters. If no override parameters are provided, then the alert
   * will play as it was defined during registration.
   *
   * Once activated, the alert will be queued to play once all higher-priority alerts that are playing or queued have
   * finished playing. If the alert is already active, then this command has no effect.
   */
  aural_alert_activate: string | Readonly<AuralAlertActivation>;

  /**
   * Deactivates an aural alert. The event data should be an (optionally suffixed) alert ID. An alert is considered
   * deactivated only when all of its suffixes are deactivated (the un-suffixed ID also counts as a suffix).
   *
   * Deactivating an alert will clear any queued activated instances of the alert. If the activated alert is already
   * playing, it will finish playing but will not loop if it is continuous.
   */
  aural_alert_deactivate: string;

  /**
   * Triggers an aural alert. The event data should be the unique ID of the alert or an activation data object that
   * contains the unique ID and optional override parameters. If no override parameters are provided, then the alert
   * will play as it was defined during registration.
   *
   * Once triggered, the alert will be queued to play once all higher-priority alerts that are playing or queued have
   * finished playing. A triggered alert is not considered active. Triggering an alert while an existing triggered
   * instance is queued will replace the existing instance with the new instance. Triggered alerts automatically
   * revert to an untriggered state after they are finished playing.
   */
  aural_alert_trigger: string | Readonly<AuralAlertActivation>;

  /**
   * Untriggers an aural alert. The event data should be an (optionally suffixed) alert ID. An alert is considered
   * untriggered only when all of its suffixes are deactivated (the un-suffixed ID also counts as a suffix).
   *
   * Untriggering an alert will clear any queued triggered instances of the alert. If the triggered alert is already
   * playing, it will finish playing but will not loop if it is continuous.
   */
  aural_alert_untrigger: string;

  /**
   * Kills an aural alert. The event data should be an (optionally suffixed) alert ID.
   *
   * Killing an alert will deactivate and untrigger the alert. If the alert is already playing, it will be stopped at
   * the earliest opportunity.
   */
  aural_alert_kill: string;

  /** Deactivates all aural alerts. */
  aural_alert_deactivate_all: void;

  /** Untriggers all aural alerts. */
  aural_alert_untrigger_all: void;

  /** Kills all aural alerts. */
  aural_alert_kill_all: void;
}

/**
 * An entry for an alert queue.
 */
type QueueEntry = {
  /** The name of the queue. */
  name: string;

  /** This queue's tracks, keyed by track name. */
  tracks: Map<string, QueueTrack>;

  /** A timer used to debounce newly activated or triggered alerts when the queue is empty. */
  debounceTimer: DebounceTimer;
};

/**
 * A track for an alert queue.
 */
type QueueTrack = {
  /** The name of the track. */
  name: string;

  /** The `SoundServer` packet key used to play alerts on the track. */
  packetKey: string;

  /** A priority queue of alerts waiting to be played. */
  queue: BinaryHeap<QueuedAuralAlert>;
};

/**
 * An alert that is playing or is queued to be played.
 */
type QueuedAuralAlert = {
  /** The alert's definition. */
  definition: Readonly<AuralAlertDefinition>;

  /** The ID used to play the alert. */
  id: string;

  /** The name of the queue track on which to play the alert. */
  track: string;

  /** Whether the alert should repeat while it is active. */
  repeat: boolean;

  /** The sound packet to play for the alert. */
  packet: SoundPacket;

  /** The time when the alert was first queued, as a UNIX timestamp in milliseconds. */
  timestamp: number;

  /**
   * The amount of time, in milliseconds, that the alert can remain in the queue before it will no longer be played
   * when it is dequeued.
   */
  queuedLifetime: number;
};

/**
 * A system which manages and plays aural alerts using a priority queue system.
 *
 * The system collects registered alerts, and manages how they are played. Each alert belongs to a queue. Only one
 * alert from each queue can play simultaneously. Alerts are queued to be played when they become activated or triggered.
 * If two alerts are queued at the same time, the one with higher priority is played first. Alerts cannot interrupt an
 * already playing alert, regardless of their relative priorities.
 */
export class AuralAlertSystem {
  private static readonly ALERT_COMPARATOR = (a: QueuedAuralAlert, b: QueuedAuralAlert): number => {
    const priorityDiff = b.definition.priority - a.definition.priority;

    // If same priority, bias toward older alerts so that repeatable alerts of the same priority don't constantly
    // preempt one another.
    if (priorityDiff === 0) {
      return a.timestamp - b.timestamp;
    } else {
      return priorityDiff;
    }
  };

  private readonly soundServerSub = this.bus.getSubscriber<SoundServerEvents>();
  private readonly controlSub = this.bus.getSubscriber<AuralAlertControlEvents>();

  private readonly soundServerPublisher = this.bus.getPublisher<SoundServerControlEvents>();
  private readonly publisher = this.bus.getPublisher<AuralAlertEvents>();

  private readonly registeredAlerts = new Map<string, Readonly<AuralAlertDefinition>>();

  private readonly packetKeyToQueueMap = new Map<string, string>();

  private readonly queues = new Map<string, QueueEntry>();
  private readonly playing = new Map<string, QueuedAuralAlert[]>();

  private readonly activeAliasToUuid = new Map<string, string>();
  private readonly triggeredAliasToUuid = new Map<string, string>();

  private readonly activeSuffixedIdToId = new Map<string, string>();
  private readonly idToActiveSuffixedIds = new Map<string, Set<string>>();

  private readonly triggeredSuffixedIdToId = new Map<string, string>();
  private readonly idToTriggeredSuffixedIds = new Map<string, Set<string>>();

  private readonly activeAlerts = new Map<string, QueuedAuralAlert>();
  private readonly triggeredAlerts = new Map<string, QueuedAuralAlert>();

  private isSoundServerInit = false;
  private isSoundServerAwake = false;

  private isAwake = false;

  private isActive = false;

  /**
   * Creates a new AuralAlertSystem. The system is initially asleep after being created.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    this.controlSub.on('aural_alert_register').handle(this.onAlertRegistered.bind(this));
    this.publisher.pub('aural_alert_request_all_registrations', undefined, true, false);

    this.soundServerSub.on('sound_server_is_awake').whenChanged().handle(this.onSoundServerWakeChanged.bind(this));
    this.soundServerSub.on('sound_server_packet_ended').handle(this.onPacketEnded.bind(this));

    this.controlSub.on('aural_alert_activate').handle(this.activateAlert.bind(this));
    this.controlSub.on('aural_alert_deactivate').handle(this.deactivateAlert.bind(this));
    this.controlSub.on('aural_alert_trigger').handle(this.triggerAlert.bind(this));
    this.controlSub.on('aural_alert_untrigger').handle(this.untriggerAlert.bind(this));
    this.controlSub.on('aural_alert_kill').handle(this.killAlert.bind(this));
    this.controlSub.on('aural_alert_deactivate_all').handle(this.deactivateAllAlerts.bind(this));
    this.controlSub.on('aural_alert_untrigger_all').handle(this.untriggerAllAlerts.bind(this));
    this.controlSub.on('aural_alert_kill_all').handle(this.killAllAlerts.bind(this));

    // Hold all pending alerts in their queues until the sound server is initialized. Then, start dequeuing alerts.
    Wait.awaitConsumer(this.soundServerSub.on('sound_server_initialized'), init => init, true).then(() => {
      this.isSoundServerInit = true;

      for (const queue of this.queues.values()) {
        this.dequeueAlert(queue);
      }
    });
  }

  /**
   * Wakes this system. If the sound server is also awake, all active continuous or repeating alerts will be re-queued
   * to play. While both this system and the sound server are awake, activation of alerts will queue them to be played.
   * Activation of any alerts that were already active when the system woke up will not queue them to be played unless
   * the alert was deactivated in the interim.
   */
  public wake(): void {
    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    this.updateActiveState();
  }

  /**
   * Puts this system to sleep. Clears all triggered and queued alerts and stops all currently playing alerts at the
   * earliest opportunity. While this system is asleep, activating alerts will not queue them to be played and
   * triggering alerts has no effect.
   */
  public sleep(): void {
    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    this.updateActiveState();
  }

  /**
   * Responds to when an alert is registered.
   * @param alert The definition of the registered alert.
   */
  private onAlertRegistered(alert: Readonly<AuralAlertDefinition>): void {
    this.registeredAlerts.set(alert.uuid, alert);
    !this.queues.has(alert.queue) && this.createQueue(alert.queue);
  }

  /**
   * Creates an alert queue entry.
   * @param queueName The name of the queue to create.
   * @returns The new queue entry.
   */
  private createQueue(queueName: string): QueueEntry {
    const entry: QueueEntry = {
      name: queueName,
      tracks: new Map([['', this.createQueueTrack(queueName, '')]]),
      debounceTimer: new DebounceTimer()
    };

    this.queues.set(queueName, entry);

    return entry;
  }

  /**
   * Creates a queue track.
   * @param queueName The name of the queue.
   * @param trackName The name of the track.
   * @returns The new queue track.
   */
  private createQueueTrack(queueName: string, trackName: string): QueueTrack {
    const packetKey = AuralAlertSystem.createPacketKey(queueName, trackName);
    this.packetKeyToQueueMap.set(packetKey, queueName);

    return {
      name: trackName,
      packetKey: packetKey,
      queue: new BinaryHeap(AuralAlertSystem.ALERT_COMPARATOR)
    };
  }

  /**
   * Checks if an alias is unique. An alias is considered unique if and only if it does not match any registered
   * alert IDs and it does not match any active or triggered aliases assigned to other parent IDs.
   * @param uuid The parent ID of the alias.
   * @param alias The alias to check.
   * @returns Whether the specified alias is unique.
   */
  private isAliasUnique(uuid: string, alias: string): boolean {
    if (this.registeredAlerts.has(alias)) {
      return false;
    }

    const existingActive = this.activeAliasToUuid.get(alias);
    if (existingActive !== undefined && existingActive !== uuid) {
      return false;
    }

    const existingTriggered = this.triggeredAliasToUuid.get(alias);
    if (existingTriggered !== undefined && existingTriggered !== uuid) {
      return false;
    }

    return true;
  }

  /**
   * Checks if a suffixed ID is unique. A suffixed ID is considered unique if and only if it does not match any
   * registered alert IDs or aliases and it does not match any active or triggered suffixed IDs assigned to other
   * parent IDs.
   * @param id The parent ID of the suffix.
   * @param suffixedId The suffixed ID to check.
   * @returns Whether the specified suffixed ID is unique.
   */
  private isSuffixedIdUnique(id: string, suffixedId: string): boolean {
    if (this.registeredAlerts.has(suffixedId) || this.activeAliasToUuid.has(suffixedId) || this.triggeredAliasToUuid.has(suffixedId)) {
      return false;
    }

    const existingActive = this.activeSuffixedIdToId.get(suffixedId);
    if (existingActive !== undefined && existingActive !== id) {
      return false;
    }

    const existingTriggered = this.triggeredSuffixedIdToId.get(suffixedId);
    if (existingTriggered !== undefined && existingTriggered !== id) {
      return false;
    }

    return true;
  }

  /**
   * Activates an alert.
   * @param activation The ID of the alert to activate, or data describing the alert to activate.
   */
  private activateAlert(activation: string | Readonly<AuralAlertActivation>): void {
    let uuid: string;
    let alias: string | undefined;
    let queuedId: string;
    let suffixedId: string | undefined;
    let activationObject: Readonly<AuralAlertActivation> | undefined;
    if (typeof activation === 'string') {
      uuid = activation;
      alias = undefined;
      queuedId = uuid;
      suffixedId = undefined;
      activationObject = undefined;
    } else {
      uuid = activation.uuid;
      alias = activation.alias;
      queuedId = alias ?? uuid;
      suffixedId = activation.suffix === undefined ? undefined : `${queuedId}::${activation.suffix}`;
      activationObject = activation;
    }

    const alertDef = this.registeredAlerts.get(uuid);

    // If the alert is not registered, then do nothing.
    if (!alertDef) {
      return;
    }

    if (alias !== undefined && !this.isAliasUnique(uuid, alias)) {
      return;
    }

    if (suffixedId !== undefined && !this.isSuffixedIdUnique(queuedId, suffixedId)) {
      return;
    }

    if (alias !== undefined) {
      this.activeAliasToUuid.set(alias, uuid);
    }

    this.activateSuffix(queuedId, suffixedId);

    // If the alert is already active, then do nothing.
    if (this.activeAlerts.has(queuedId)) {
      return;
    }

    const queuedAlert = this.createQueuedAlert(alertDef, activationObject);

    this.activeAlerts.set(queuedId, queuedAlert);

    if (this.isActive) {
      this.queueAlert(queuedAlert);
    }
  }

  /**
   * Activates an alert suffix.
   * @param id The ID of the suffix's parent alert.
   * @param suffixedId The suffixed ID to activate.
   */
  private activateSuffix(id: string, suffixedId = id): void {
    this.activeSuffixedIdToId.set(suffixedId, id);

    let suffixedIds = this.idToActiveSuffixedIds.get(id);
    if (!suffixedIds) {
      this.idToActiveSuffixedIds.set(id, suffixedIds = new Set<string>());
    }
    suffixedIds.add(suffixedId);
  }

  /**
   * Triggers an alert.
   * @param activation The ID of the alert to trigger, or data describing the alert to trigger.
   */
  private triggerAlert(activation: string | Readonly<AuralAlertActivation>): void {
    if (!this.isActive) {
      return;
    }

    let uuid: string;
    let alias: string | undefined;
    let queuedId: string;
    let suffixedId: string | undefined;
    let activationObject: Readonly<AuralAlertActivation> | undefined;
    if (typeof activation === 'string') {
      uuid = activation;
      alias = undefined;
      queuedId = uuid;
      suffixedId = undefined;
      activationObject = undefined;
    } else {
      uuid = activation.uuid;
      alias = activation.alias;
      queuedId = alias ?? uuid;
      suffixedId = activation.suffix === undefined ? undefined : `${queuedId}::${activation.suffix}`;
      activationObject = activation;
    }

    const alertDef = this.registeredAlerts.get(uuid);

    // If the alert is not registered, then do nothing.
    if (!alertDef) {
      return;
    }

    if (alias !== undefined && !this.isAliasUnique(uuid, alias)) {
      return;
    }

    if (suffixedId !== undefined && !this.isSuffixedIdUnique(queuedId, suffixedId)) {
      return;
    }

    if (alias !== undefined) {
      this.triggeredAliasToUuid.set(alias, uuid);
    }

    this.triggerSuffix(queuedId, suffixedId);

    // If a triggered instance of this alert is already playing, then do nothing.
    const existing = this.triggeredAlerts.get(queuedId);
    if (existing && this.playing.get(existing.definition.queue)?.includes(existing)) {
      return;
    }

    const queuedAlert = this.createQueuedAlert(alertDef, activationObject);

    this.triggeredAlerts.set(queuedId, queuedAlert);

    this.queueAlert(queuedAlert);
  }

  /**
   * Triggers an alert suffix.
   * @param id The ID of the suffix's parent alert.
   * @param suffixedId The suffixed ID to trigger.
   */
  private triggerSuffix(id: string, suffixedId = id): void {
    this.triggeredSuffixedIdToId.set(suffixedId, id);

    let suffixedIds = this.idToTriggeredSuffixedIds.get(id);
    if (!suffixedIds) {
      this.idToTriggeredSuffixedIds.set(id, suffixedIds = new Set<string>());
    }
    suffixedIds.add(suffixedId);
  }

  /**
   * Creates an alert to be queued.
   * @param definition The definition of the alert.
   * @param activation Data describing the alert to activate. If not defined, the alert will be activated according
   * to its definition.
   * @returns The queued alert.
   */
  private createQueuedAlert(definition: Readonly<AuralAlertDefinition>, activation?: AuralAlertActivation): QueuedAuralAlert {
    const queueEntry = this.queues.get(definition.queue)!;
    const trackName = activation?.track ?? definition.track ?? '';
    let track = queueEntry.tracks.get(trackName);
    if (!track) {
      track = this.createQueueTrack(definition.queue, trackName);
      queueEntry.tracks.set(trackName, track);
    }

    return {
      definition,
      id: activation?.alias ?? definition.uuid,
      track: trackName,
      repeat: activation?.repeat ?? definition.repeat,
      packet: {
        key: track.packetKey,
        sequence: activation?.sequence ?? definition.sequence,
        continuous: activation?.continuous ?? definition.continuous,
        timeout: activation?.timeout ?? definition.timeout
      },
      timestamp: Date.now(),
      queuedLifetime: activation?.queuedLifetime ?? definition.queuedLifetime ?? Infinity
    };
  }

  /**
   * Queues an alert to be played.
   * @param alert The alert to queue.
   */
  private queueAlert(alert: QueuedAuralAlert): void {
    const queueName = alert.definition.queue;
    const queueEntry = this.queues.get(queueName) ?? this.createQueue(queueName);

    queueEntry.tracks.get(alert.track)!.queue.insert(alert);

    if (this.isSoundServerInit) {
      const playingAlerts = this.playing.get(queueName);

      let isTrackPlaying = false;
      let playingPriority: number | undefined = undefined;

      if (playingAlerts) {
        for (let i = 0; i < playingAlerts.length; i++) {
          const playing = playingAlerts[i];
          if (playing.track === alert.track) {
            isTrackPlaying = true;
          }
          if (playingPriority === undefined || playing.definition.priority > playingPriority) {
            playingPriority = playing.definition.priority;
          }
        }
      }

      // If the alert would be immediately dequeued (i.e. there is nothing playing on its track and there are no
      // currently playing alerts in its queue that are of higher priority), then wait one frame before we start
      // dequeuing so that alerts that are activated on the same frame are correctly prioritized.
      if (!isTrackPlaying && (playingPriority === undefined || alert.definition.priority >= playingPriority)) {
        if (!queueEntry.debounceTimer.isPending()) {
          queueEntry.debounceTimer.schedule(this.dequeueAlert.bind(this, queueEntry), 0);
        }
      }
    }
  }

  /**
   * Dequeues the next activated or triggered alert from a queue and starts playing it. If this system is asleep, then
   * the queue will be cleared instead and no alert will be played.
   * @param entry The queue entry.
   */
  private dequeueAlert(entry: QueueEntry): void {
    if (this.isActive) {
      const time = Date.now();

      let playingAlerts = this.playing.get(entry.name);

      // Go through each track of the queue and mark queued alerts to potentially dequeue and play.
      const nextAlerts = new BinaryHeap<QueuedAuralAlert>(AuralAlertSystem.ALERT_COMPARATOR);
      for (const track of entry.tracks.values()) {
        // If an alert is still playing on this track, then we will not attempt to dequeue any alerts on this track.
        if (playingAlerts && playingAlerts.find(query => query.track === track.name)) {
          continue;
        }

        while (track.queue.size > 0) {
          const next = track.queue.findMin() as QueuedAuralAlert;

          // We need to compare the queued alert with the one in the active/triggered alerts map by reference instead
          // of just comparing their IDs because the alert could have been deactivated and activated or triggered again
          // while it was queued. The maps contain the queued alert object from the most recent activation/trigger, so
          // that is the one we want to play.
          if (
            time - next.timestamp <= next.queuedLifetime
            && (
              this.activeAlerts.get(next.id) === next
              || this.triggeredAlerts.get(next.id) === next
            )
          ) {
            // If the queued alert was not expired, replaced, deactivated, or untriggered, then mark it as a candidate
            // to be dequeued and played. However, we will not remove it from the track queue yet because we don't know
            // yet whether it will actually be dequeued.
            nextAlerts.insert(next);
            break;
          } else {
            // If the queued alert was expired, replaced, deactivated, or untriggered, then remove it from the queue.
            track.queue.removeMin();
          }
        }
      }

      if (nextAlerts.size === 0) {
        return;
      }

      // Now we will evaluate every queued alert marked as a candidate for dequeuing in order of decreasing priority.
      // If there are no currently playing alerts that have a higher priority than the candidate with the highest
      // priority, then we will dequeue the highest-priority candidate along with every other candidate with the same
      // priority. Candidates that are not dequeued remain in their respective track queues.

      let priority: number | undefined = undefined;
      if (playingAlerts) {
        for (let i = 0; i < playingAlerts.length; i++) {
          const playing = playingAlerts[i];
          if (priority === undefined || playing.definition.priority > priority) {
            priority = playing.definition.priority;
          }
        }
      }

      while (nextAlerts.size > 0) {
        const toPlay = nextAlerts.removeMin() as QueuedAuralAlert;
        if (priority === undefined) {
          priority = toPlay.definition.priority;
        }

        if (toPlay.definition.priority >= priority) {
          priority = toPlay.definition.priority;

          const track = entry.tracks.get(toPlay.track)!;
          track.queue.removeMin();

          if (!playingAlerts) {
            playingAlerts = [];
            this.playing.set(entry.name, playingAlerts);
          }
          playingAlerts.push(toPlay);

          this.soundServerPublisher.pub('sound_server_interrupt', toPlay.packet, true, false);
        } else {
          // The current candidate has a lower priority than the minimum required to be dequeued and played. Since we
          // are evaluating candidates in order of decreasing priority, we are guaranteed that all remaining candidates
          // have equal or lower priority than the current one. Therefore, we know no further candidates will be
          // dequeued and can stop immediately.
          break;
        }
      }
    } else {
      for (const track of entry.tracks.values()) {
        track.queue.clear();
      }
    }
  }

  /**
   * Deactivates an alert. Deactivating an alert will prevent queued activated instances of it from playing. In
   * addition, if an activated instance of the alert is currently playing and is continuous, it will be prevented from
   * looping.
   * @param id The (optionally suffixed) ID of the alert to deactivate.
   */
  private deactivateAlert(id: string): void {
    const deactivatedId = this.deactivateSuffix(id);

    if (deactivatedId === undefined) {
      return;
    }

    // Check if the deactivated ID is an alias by retrieving it from the alias map. If it's not in the map, then we
    // assume it is not an alias.
    const deactivatedUuid = this.activeAliasToUuid.get(deactivatedId) ?? deactivatedId;

    // If the deactivated ID was an alias, remove it from the alias map.
    if (deactivatedUuid !== deactivatedId) {
      this.activeAliasToUuid.delete(deactivatedId);
    }

    const alertDef = this.registeredAlerts.get(deactivatedUuid);

    if (alertDef) {
      const playingAlerts = this.playing.get(alertDef.queue);
      if (playingAlerts) {
        const playing = playingAlerts.find(query => query.id === deactivatedId);
        if (playing && this.triggeredAlerts.get(deactivatedId) !== playing) {
          this.soundServerPublisher.pub('sound_server_stop', playing.packet.key, true, false);
        }
      }
    }
  }

  /**
   * Deactivates an alert suffix.
   * @param suffixedId The suffixed ID to deactivate.
   * @returns The ID of the alert that was deactivated as a result of deactivating the suffix, or `undefined` if no
   * alert was deactivated.
   */
  private deactivateSuffix(suffixedId: string): string | undefined {
    const id = this.activeSuffixedIdToId.get(suffixedId);
    if (id === undefined) {
      return undefined;
    }

    this.activeSuffixedIdToId.delete(suffixedId);

    const suffixedIds = this.idToActiveSuffixedIds.get(id);
    if (!suffixedIds) {
      this.activeAlerts.delete(id);
      return id;
    } else {
      suffixedIds.delete(suffixedId);
      if (suffixedIds.size === 0) {
        this.activeAlerts.delete(id);
        return id;
      } else {
        return undefined;
      }
    }
  }

  /**
   * Untriggers an alert. Untriggering an alert will prevent queued triggered instances of it from playing. In
   * addition, if a triggered instance of the alert is currently playing and is continuous, it will be prevented from
   * looping.
   * @param uuid The (optionally suffixed) ID of the alert to untrigger.
   */
  private untriggerAlert(uuid: string): void {
    const untriggeredId = this.untriggerSuffix(uuid);

    if (untriggeredId === undefined) {
      return;
    }

    // Check if the untriggered ID is an alias by retrieving it from the alias map. If it's not in the map, then we
    // assume it is not an alias.
    const untriggeredUuid = this.triggeredAliasToUuid.get(untriggeredId) ?? untriggeredId;

    // If the untriggered ID was an alias, remove it from the alias map.
    if (untriggeredUuid !== untriggeredId) {
      this.triggeredAliasToUuid.delete(untriggeredId);
    }

    const alertDef = this.registeredAlerts.get(untriggeredUuid);

    if (alertDef) {
      const playingAlerts = this.playing.get(alertDef.queue);
      if (playingAlerts) {
        const playing = playingAlerts.find(query => query.id === untriggeredId);
        if (playing && this.activeAlerts.get(untriggeredId) !== playing) {
          this.soundServerPublisher.pub('sound_server_stop', playing.packet.key, true, false);
        }
      }
    }
  }

  /**
   * Untriggers an alert suffix.
   * @param suffixedId The suffixed ID to untrigger.
   * @returns The ID of the alert that was untriggered as a result of deactivating the suffix, or `undefined` if no
   * alert was untriggered.
   */
  private untriggerSuffix(suffixedId: string): string | undefined {
    const id = this.triggeredSuffixedIdToId.get(suffixedId);
    if (id === undefined) {
      return undefined;
    }

    this.triggeredSuffixedIdToId.delete(suffixedId);

    const suffixedIds = this.idToTriggeredSuffixedIds.get(id);
    if (!suffixedIds) {
      this.triggeredAlerts.delete(id);
      return id;
    } else {
      suffixedIds.delete(suffixedId);
      if (suffixedIds.size === 0) {
        this.triggeredAlerts.delete(id);
        return id;
      } else {
        return undefined;
      }
    }
  }

  /**
   * Kills an alert. Killing an alert will deactivate and untrigger it. In addition, if the alert is currently playing,
   * it will be stopped at the earliest opportunity.
   * @param uuid The (optionally suffixed) ID of the alert to kill.
   */
  private killAlert(uuid: string): void {
    const deactivatedId = this.deactivateSuffix(uuid);
    const untriggeredId = this.untriggerSuffix(uuid);

    let deactivatedUuid: string | undefined = undefined;
    let untriggeredUuid: string | undefined = undefined;

    if (deactivatedId !== undefined) {
      // Check if the deactivated ID is an alias by retrieving it from the alias map. If it's not in the map, then we
      // assume it is not an alias.
      deactivatedUuid = this.activeAliasToUuid.get(deactivatedId) ?? deactivatedId;

      // If the deactivated ID was an alias, remove it from the alias map.
      if (deactivatedUuid !== deactivatedId) {
        this.activeAliasToUuid.delete(deactivatedId);
      }
    }

    if (untriggeredId !== undefined) {
      // Check if the untriggered ID is an alias by retrieving it from the alias map. If it's not in the map, then we
      // assume it is not an alias.
      untriggeredUuid = this.triggeredAliasToUuid.get(untriggeredId) ?? untriggeredId;

      // If the untriggered ID was an alias, remove it from the alias map.
      if (untriggeredUuid !== untriggeredId) {
        this.triggeredAliasToUuid.delete(untriggeredId);
      }
    }

    const deactivatedAlertDef = deactivatedUuid === undefined ? undefined : this.registeredAlerts.get(deactivatedUuid);
    const untriggeredAlertDef = untriggeredUuid === undefined ? undefined : this.registeredAlerts.get(untriggeredUuid);

    let killedPacketKey: string | undefined = undefined;

    if (deactivatedAlertDef) {
      const playingAlerts = this.playing.get(deactivatedAlertDef.queue);
      if (playingAlerts) {
        const playing = playingAlerts.find(query => query.id === deactivatedId);
        if (playing && this.triggeredAlerts.get(deactivatedId!) !== playing) {
          this.soundServerPublisher.pub('sound_server_kill', playing.packet.key, true, false);
          killedPacketKey = playing.packet.key;
        }
      }
    }

    if (untriggeredAlertDef) {
      const playingAlerts = this.playing.get(untriggeredAlertDef.queue);
      if (playingAlerts) {
        const playing = playingAlerts.find(query => query.id === untriggeredId);
        if (playing && this.activeAlerts.get(untriggeredId!) !== playing && killedPacketKey !== playing.packet.key) {
          this.soundServerPublisher.pub('sound_server_kill', playing.packet.key, true, false);
        }
      }
    }
  }

  /**
   * Deactivates all alerts. This will stop all queued activated alerts from playing and prevent all currently playing
   * activated continuous alerts from looping.
   */
  private deactivateAllAlerts(): void {
    this.activeAlerts.clear();
    this.activeAliasToUuid.clear();
    this.activeSuffixedIdToId.clear();
    this.idToActiveSuffixedIds.clear();

    for (const playingAlerts of this.playing.values()) {
      for (const playing of playingAlerts) {
        if (this.triggeredAlerts.get(playing.id) !== playing) {
          this.soundServerPublisher.pub('sound_server_stop', playing.packet.key, true, false);
        }
      }
    }
  }

  /**
   * Untriggers all alerts. This will stop all queued triggered alerts from playing and prevent all currently playing
   * triggered continuous alerts from looping.
   */
  private untriggerAllAlerts(): void {
    this.triggeredAlerts.clear();
    this.triggeredAliasToUuid.clear();
    this.triggeredSuffixedIdToId.clear();
    this.idToTriggeredSuffixedIds.clear();

    for (const playingAlerts of this.playing.values()) {
      for (const playing of playingAlerts) {
        if (this.activeAlerts.get(playing.id) !== playing) {
          this.soundServerPublisher.pub('sound_server_stop', playing.packet.key, true, false);
        }
      }
    }
  }

  /**
   * Kills all alerts. This deactivates and untriggers all alerts, stopping all queued alerts from playing and stopping
   * all currently playing alerts at the earliest opportunity.
   */
  private killAllAlerts(): void {
    this.activeAlerts.clear();
    this.triggeredAlerts.clear();
    this.activeAliasToUuid.clear();
    this.triggeredAliasToUuid.clear();
    this.activeSuffixedIdToId.clear();
    this.idToActiveSuffixedIds.clear();
    this.triggeredSuffixedIdToId.clear();
    this.idToTriggeredSuffixedIds.clear();

    for (const playingAlerts of this.playing.values()) {
      for (const playing of playingAlerts) {
        this.soundServerPublisher.pub('sound_server_kill', playing.packet.key, true, false);
      }
    }
  }

  /**
   * Responds to when a sound packet stops playing.
   * @param key The key of the stopped packet.
   */
  private onPacketEnded(key: string): void {
    const queueName = this.packetKeyToQueueMap.get(key);
    if (queueName === undefined) {
      return;
    }

    const queueEntry = this.queues.get(queueName);

    if (!queueEntry) {
      this.packetKeyToQueueMap.delete(key);
      return;
    }

    const playingAlerts = this.playing.get(queueName);

    if (playingAlerts) {
      const finishedAlertIndex = playingAlerts.findIndex(alert => alert.packet.key === key);
      const finishedAlert = playingAlerts[finishedAlertIndex];
      if (finishedAlert) {
        // Check if the alert that finished playing was triggered. If so, remove the alert from the triggered list as well
        // as all of its triggered suffixes.
        if (this.triggeredAlerts.get(finishedAlert.id) === finishedAlert) {
          this.triggeredAlerts.delete(finishedAlert.id);

          if (finishedAlert.id !== finishedAlert.definition.uuid) {
            this.triggeredAliasToUuid.delete(finishedAlert.id);
          }

          const suffixedIds = this.idToTriggeredSuffixedIds.get(finishedAlert.id);
          if (suffixedIds) {
            for (const suffixedId of suffixedIds) {
              this.triggeredSuffixedIdToId.delete(suffixedId);
            }

            this.idToTriggeredSuffixedIds.delete(finishedAlert.id);
          }
        }

        // Requeue the alert if it is repeatable and is still active.
        if (finishedAlert.repeat && this.activeAlerts.get(finishedAlert.id) === finishedAlert) {
          this.queueAlert(finishedAlert);
        }

        playingAlerts.splice(finishedAlertIndex, 1);
      }
    }

    queueEntry.debounceTimer.clear();
    this.dequeueAlert(queueEntry);
  }

  /**
   * Responds to when the wake state of the sound server changes.
   * @param isAwake Whether the sound server is awake.
   */
  private onSoundServerWakeChanged(isAwake: boolean): void {
    if (this.isSoundServerAwake === isAwake) {
      return;
    }

    this.isSoundServerAwake = isAwake;

    this.updateActiveState();

    if (!isAwake) {
      // If the sound server is asleep, it will automatically stop playing all sound packets. Additionally, any
      // commands we sent to the server to start playing packets while the server was asleep but before we got the
      // notification were ignored (so we will never receive a packet ended event for them). Therefore, we need to
      // clear all playing alerts to ensure that alerts don't get stuck in the 'playing' state.
      for (const playingAlerts of this.playing.values()) {
        playingAlerts.length = 0;
      }
    }
  }

  /**
   * Updates this system's activity state. This system is considered active if both it and the sound server are awake.
   * On activation, all active continuous or repeating alerts are re-queued to play. On deactivation, all triggered and
   * queued alerts are cleared and all currently playing alerts are stopped at the earliest opportunity.
   */
  private updateActiveState(): void {
    const isActive = this.isAwake && this.isSoundServerAwake;

    if (isActive === this.isActive) {
      return;
    }

    this.isActive = isActive;

    if (isActive) {

      // Find all active alerts that are repeatable or continuous and re-queue them.
      for (const alert of this.activeAlerts.values()) {
        if (alert.repeat || alert.packet.continuous) {
          this.queueAlert(alert);
        }
      }

    } else {

      // Clears all triggered alerts.
      this.triggeredAlerts.clear();
      this.triggeredAliasToUuid.clear();
      this.triggeredSuffixedIdToId.clear();
      this.idToTriggeredSuffixedIds.clear();

      // Clear all queued alerts.
      for (const queueEntry of this.queues.values()) {
        queueEntry.debounceTimer.clear();
        for (const track of queueEntry.tracks.values()) {
          track.queue.clear();
        }
      }

      // If the sound server is awake, kill all alerts that are currently playing. If the sound server is asleep, it
      // will stop all packets automatically and will not respond to commands, so there is no need to send the kill
      // commands.
      if (this.isSoundServerAwake) {
        for (const playingAlerts of this.playing.values()) {
          for (const playing of playingAlerts) {
            this.soundServerPublisher.pub('sound_server_kill', playing.packet.key, true, false);
          }
        }
      }

    }
  }

  /**
   * Creates a sound packet key for a queue track.
   * @param queueName The name of the queue.
   * @param trackName The name of track.
   * @returns A sound packet key for the specified queue track.
   */
  private static createPacketKey(queueName: string, trackName: string): string {
    return `$$aural-alert-system-queue-${queueName}${trackName === '' ? '' : `-${trackName}`}$$`;
  }
}