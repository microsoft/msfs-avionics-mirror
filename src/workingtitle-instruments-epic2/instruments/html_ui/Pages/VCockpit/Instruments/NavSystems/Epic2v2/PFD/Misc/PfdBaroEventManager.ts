import { Epic2PfdControlEvents } from '@microsoft/msfs-epic2-shared';
import { EventBus, KeyEventManager } from '@microsoft/msfs-sdk';

/** Manages PFD controller baro events. */
export class PfdBaroEventManager {
  private keyEventManager?: KeyEventManager;

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  /**
   * Creates a new instance.
   * @param bus The instrument event bus.
   * @param managedAltimeters Indices of the managed altimeters.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly managedAltimeters: number[],
  ) {
    const sub = this.bus.getSubscriber<Epic2PfdControlEvents>();
    sub.on('pfd_control_baro_decrement').handle(this.sendEventToManagedAltimeters.bind(this, 'KOHLSMAN_DEC'));
    sub.on('pfd_control_baro_increment').handle(this.sendEventToManagedAltimeters.bind(this, 'KOHLSMAN_INC'));
    sub.on('pfd_control_baro_push').handle(this.sendEventToManagedAltimeters.bind(this, 'BAROMETRIC_STD_PRESSURE'));

    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this handler's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this handler's key event manager is ready, or rejected if this
   * handler is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /** Initialises the manager. */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('AltimeterBaroKeyEventHandler: cannot initialize a dead handler');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;
  }

  /**
   * Sends a key event to each managed altimeter.
   * @param kEvent The key event to send.
   */
  private sendEventToManagedAltimeters(kEvent: string): void {
    if (!this.isAlive || !this.isInit) {
      return;
    }

    for (const index of this.managedAltimeters) {
      this.keyEventManager?.triggerKey(kEvent, false, index);
    }
  }
}
