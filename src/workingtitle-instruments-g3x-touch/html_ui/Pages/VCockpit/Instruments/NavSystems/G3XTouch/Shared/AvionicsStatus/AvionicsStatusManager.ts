import { EventBus, Subscription } from '@microsoft/msfs-sdk';

import { AvionicsStatusChangeEvent, AvionicsStatusEvents, AvionicsStatusGlobalPowerEvent } from './AvionicsStatusEvents';
import { AvionicsStatus } from './AvionicsStatusTypes';

/**
 * A status update from an {@link AvionicsStatusClient}.
 */
type AvionicsStatusClientSyncData = {
  /** The instrument index of the client's avionics unit. */
  instrumentIndex: number;

  /** The status of the client's avionics unit. */
  status: AvionicsStatus;

  /** Whether this is an initial status update from the client. */
  isInitial: boolean;
};

/**
 * An avionics unit event status update from an {@link AvionicsStatusManager}.
 */
type AvionicsStatusEventStatusSyncData = {
  /** The UID of the avionics unit whose status has changed. */
  avionicsUid: string;

  /** The avionics unit status change event. */
  event: AvionicsStatusChangeEvent;

  /**
   * If this update is part of a handshake, the UID of the event client for which this update is intended. Otherwise,
   * `undefined`.
   */
  handshakeUid?: string;
};

/**
 * A global power event status update from an {@link AvionicsStatusManager}.
 */
type AvionicsStatusEventGlobalSyncData = {
  /** The global power change event. */
  event: AvionicsStatusGlobalPowerEvent;

  /**
   * If this update is part of a handshake, the UID of the event client for which this update is intended. Otherwise,
   * `undefined`.
   */
  handshakeUid?: string;
};

/**
 * Events used to sync avionics unit statuses from clients to a central manager.
 */
interface AvionicsStatusSyncEvents {
  /** A request for clients to send their statuses to the central manager. */
  avionics_status_sync_request: void;

  /** A status update from a client. */
  avionics_status_client_sync_data: Readonly<AvionicsStatusClientSyncData>;
}

/**
 * Events used to sync avionics unit statuses from clients to a central manager.
 */
interface AvionicsStatusEventSyncEvents {
  /**
   * A request for avionics status event clients to initiate the handshake process with the central manager.
   */
  avionics_status_event_handshake_request: void;

  /**
   * A request from an avionics status event client to initiate a handshake with the central manager. The event data is
   * the UID of the requesting client.
   */
  avionics_status_event_handshake: string;

  /** A status update from a client. */
  avionics_status_event_status_sync_data: Readonly<AvionicsStatusEventStatusSyncData>;

  /** A status update from a client. */
  avionics_status_event_global_sync_data: Readonly<AvionicsStatusEventGlobalSyncData>;
}

/**
 * An entry for the status of an {@link AvionicsStatusClient}.
 */
type ClientEntry = {
  /** The UID of the client's avionics unit. */
  uid: string;

  /** The instrument index of the client's avionics unit. */
  instrumentIndex: number;

  /** The current status of the client's avionics unit. */
  currentStatus?: AvionicsStatus;

  /** The previous status of the client's avionics unit. */
  previousStatus?: AvionicsStatus;
};

/**
 * A manager for G3X Touch avionics unit (GDU) status. Processes status updates received from instances of
 * {@link AvionicsStatusClient} and publishes avionics unit status events, including global power state events.
 */
export class AvionicsStatusManager {
  private readonly syncPublisher = this.bus.getPublisher<AvionicsStatusSyncEvents>();
  private readonly eventSyncPublisher = this.bus.getPublisher<AvionicsStatusEventSyncEvents>();

  private readonly clients = new Map<string, ClientEntry>();

  private currentGlobalPower: boolean | undefined = undefined;
  private previousGlobalPower: boolean | undefined = undefined;

  private isAlive = true;
  private isInit = false;

  private syncSub?: Subscription;
  private eventHandshakeRequestSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
  }

  /**
   * Initializes this manager. Once initialized, this manager will keep track of the status of all
   * {@link AvionicsStatusClient} instances and publish them on the event bus, along with the avionics global power
   * state.
   * @throws Error if this manager was destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AvionicsStatusManager: cannot initialize a dead manager');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.syncSub = this.bus.getSubscriber<AvionicsStatusSyncEvents>()
      .on('avionics_status_client_sync_data')
      .handle(this.onStatusSyncReceived.bind(this));
    this.eventHandshakeRequestSub = this.bus.getSubscriber<AvionicsStatusEventSyncEvents>()
      .on('avionics_status_event_handshake')
      .handle(this.onEventHandshakeInitialized.bind(this));

    // Send a request for all existing clients to sync their statuses.
    this.syncPublisher.pub('avionics_status_sync_request', undefined, true, false);

    // Send a request for all existing event clients to start the handshake process.
    this.eventSyncPublisher.pub('avionics_status_event_handshake_request', undefined, true, false);
  }

  /**
   * Responds to when a status sync event is received.
   * @param data The event data.
   */
  private onStatusSyncReceived(data: Readonly<AvionicsStatusClientSyncData>): void {
    const uid = `${data.instrumentIndex}`;

    let entry = this.clients.get(uid);
    if (entry === undefined) {
      entry = {
        uid,
        instrumentIndex: data.instrumentIndex,
      };
      this.clients.set(uid, entry);
    } else if (data.isInitial) {
      // We are receiving an initial sync for a client that we are already tracking. This can only happen if the
      // client's instrument was reloaded. In this case we reset the status of the client as if this was the first
      // time we are receiving data from the client.
      entry.currentStatus = undefined;
      entry.previousStatus = undefined;
    }

    entry.previousStatus = entry.currentStatus;
    entry.currentStatus = data.status;

    if (entry.previousStatus !== entry.currentStatus) {
      this.eventSyncPublisher.pub(
        'avionics_status_event_status_sync_data',
        {
          avionicsUid: uid,
          event: { previous: entry.previousStatus, current: entry.currentStatus }
        },
        true,
        false
      );
    }

    this.updateGlobalPower();
  }

  /**
   * Updates the avionics global power state and if it has changed, publishes the change to the event bus.
   */
  private updateGlobalPower(): void {
    let globalPower = false;
    for (const entry of this.clients.values()) {
      if (entry.currentStatus !== AvionicsStatus.Off) {
        globalPower = true;
        break;
      }
    }

    this.previousGlobalPower = this.currentGlobalPower;
    this.currentGlobalPower = globalPower;

    if (this.previousGlobalPower !== globalPower) {
      this.eventSyncPublisher.pub(
        'avionics_status_event_global_sync_data',
        {
          event: { previous: this.previousGlobalPower, current: this.currentGlobalPower }
        },
        true,
        false
      );
    }
  }

  /**
   * Responds to when an event client initializes a handshake.
   * @param uid The UID of the event client.
   */
  private onEventHandshakeInitialized(uid: string): void {
    for (const client of this.clients.values()) {
      if (client.currentStatus !== undefined) {
        this.eventSyncPublisher.pub(
          'avionics_status_event_status_sync_data',
          {
            avionicsUid: client.uid,
            event: { previous: client.previousStatus, current: client.currentStatus },
            handshakeUid: uid
          },
          true,
          false
        );
      }
    }

    this.eventSyncPublisher.pub(
      'avionics_status_event_global_sync_data',
      {
        event: { previous: this.previousGlobalPower, current: this.currentGlobalPower },
        handshakeUid: uid
      },
      true,
      false
    );
  }

  /**
   * Destroys this manager. Once destroyed, this manager will no longer keep track of avionics unit statuses or publish
   * events to the event bus.
   */
  public destroy(): void {
    this.isAlive = false;

    this.syncSub?.destroy();
    this.eventHandshakeRequestSub?.destroy();
  }
}

/**
 * A client which tracks and sends the status of a G3X Touch avionics unit (GDU) to a central manager for processing.
 */
export class AvionicsStatusClient {
  private readonly syncPublisher = this.bus.getPublisher<AvionicsStatusSyncEvents>();

  /** The UID of this client's avionics unit. */
  public readonly uid: string;

  private status: AvionicsStatus | undefined = undefined;

  private isAlive = true;
  private isInit = false;
  private hasSentInitialSync = false;

  private syncRequestSub?: Subscription;

  /**
   * Constructor.
   * @param instrumentIndex The instrument index of this client's avionics unit.
   * @param bus The event bus.
   */
  public constructor(
    private readonly instrumentIndex: number,
    private readonly bus: EventBus
  ) {
    this.uid = `${instrumentIndex}`;
  }

  /**
   * Initializes this client. Once initialized, this client will automatically send its status to a central manager.
   * @throws Error if this client was destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AvionicsStatusClient: cannot initialize a dead client');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.sendSyncData(true);

    const sub = this.bus.getSubscriber<AvionicsStatusSyncEvents>();

    this.syncRequestSub = sub.on('avionics_status_sync_request').handle(this.sendSyncData.bind(this, true));
  }

  /**
   * Sets the status of this client's avionics unit. If this client has been initialized, then the new status will
   * automatically be sent to the client's central manager.
   * @param status The status to set.
   * @throws Error if this client was destroyed.
   */
  public setStatus(status: AvionicsStatus): void {
    if (!this.isAlive) {
      throw new Error('AvionicsStatusClient: cannot set the status of a dead client');
    }

    if (this.status === status) {
      return;
    }

    this.status = status;

    if (this.isInit) {
      this.sendSyncData(!this.hasSentInitialSync);
    }
  }

  /**
   * Sends this client's status to a central manager over the event bus.
   * @param isInitial Whether the status is to be sent as an initial sync.
   */
  private sendSyncData(isInitial: boolean): void {
    if (this.status === undefined) {
      return;
    }

    this.hasSentInitialSync = true;

    this.syncPublisher.pub(
      'avionics_status_client_sync_data',
      { instrumentIndex: this.instrumentIndex, status: this.status, isInitial },
      true,
      false
    );
  }

  /**
   * Destroys this client.
   */
  public destroy(): void {
    this.isAlive = false;

    this.syncRequestSub?.destroy();
  }
}

/**
 * A client which receives avionics status data from a central manager and publishes the data locally (i.e. only on the
 * client's hosting JS instrument) to the event bus as avionics status events.
 */
export class AvionicsStatusEventClient {
  private readonly publisher = this.bus.getPublisher<AvionicsStatusEvents>();
  private readonly syncPublisher = this.bus.getPublisher<AvionicsStatusEventSyncEvents>();

  private isAlive = true;
  private isInit = false;
  private isHandshakeComplete = false;

  private handshakeRequestSub?: Subscription;
  private statusSyncSub?: Subscription;
  private globalPowerSyncSub?: Subscription;

  /**
   * Constructor.
   * @param uid This client's unique ID.
   * @param bus The event bus.
   */
  public constructor(
    public readonly uid: string,
    private readonly bus: EventBus
  ) {
    // Initialize global power topic.
    this.publisher.pub('avionics_global_power', { previous: undefined, current: undefined }, false, true);
  }

  /**
   * Initializes this client. Once initialized, this client will begin communicating with the central manager and
   * publish avionics status events as appropriate.
   * @throws Error if this client was destroyed.
   */
  public init(): void {
    if (!this.isAlive) {
      throw new Error('AvionicsStatusEventClient: cannot initialize a dead client');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    const sub = this.bus.getSubscriber<AvionicsStatusEventSyncEvents>();

    this.statusSyncSub = sub.on('avionics_status_event_status_sync_data').handle(this.onStatusSyncReceived.bind(this));
    this.globalPowerSyncSub = sub.on('avionics_status_event_global_sync_data').handle(this.onGlobalPowerSyncReceived.bind(this));

    // Send an initial handshake. Note that just because we send a handshake doesn't mean we will receive a response,
    // because the manager might not be initialized yet.
    this.syncPublisher.pub('avionics_status_event_handshake', this.uid, true, false);

    this.handshakeRequestSub = sub.on('avionics_status_event_handshake_request').handle(() => {
      this.syncPublisher.pub('avionics_status_event_handshake', this.uid, true, false);
    });
  }

  /**
   * Responds to when avionics unit status sync data is received from the central manager.
   * @param data The avionics unit status sync data that was received.
   */
  private onStatusSyncReceived(data: AvionicsStatusEventStatusSyncData): void {
    if (this.isHandshakeComplete) {
      // Do not respond to handshake status syncs if handshake is complete.
      if (data.handshakeUid !== undefined) {
        return;
      }
    } else {
      // Do not respond to non-handshake or handshake status syncs directed at other clients if handshake is not complete.
      if (data.handshakeUid !== this.uid) {
        return;
      }
    }

    this.publisher.pub(`avionics_status_${data.avionicsUid}`, data.event, false, true);
  }

  /**
   * Responds to when global power status sync data is received from the central manager.
   * @param data The global power status sync data that was received.
   */
  private onGlobalPowerSyncReceived(data: AvionicsStatusEventGlobalSyncData): void {
    if (this.isHandshakeComplete) {
      // Do not respond to handshake status syncs if handshake is complete.
      if (data.handshakeUid !== undefined) {
        return;
      }
    } else {
      // Do not respond to non-handshake or handshake status syncs directed at other clients if handshake is not complete.
      if (data.handshakeUid !== this.uid) {
        return;
      }

      // The global power state is the last piece of data synced during a handshake, so once we receive that, we mark
      // the handshake as complete.
      this.isHandshakeComplete = true;

      // Because we locally initialize the global power topic to a state of undefined, do not publish the handshake
      // data if the current power is undefined.
      if (data.event.current === undefined) {
        return;
      }
    }

    this.publisher.pub('avionics_global_power', data.event, false, true);
  }

  /**
   * Destroys this client.
   */
  public destroy(): void {
    this.isAlive = false;

    this.statusSyncSub?.destroy();
    this.globalPowerSyncSub?.destroy();
    this.handshakeRequestSub?.destroy();
  }
}