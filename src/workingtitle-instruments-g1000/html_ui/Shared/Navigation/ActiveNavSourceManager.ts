/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ControlEvents, EventBus, KeyEventData, KeyEventManager, KeyEvents, NavSourceType, Subscription } from '@microsoft/msfs-sdk';

/**
 * A manager for the active navigation source. Changes the active navigation source in response to control events and
 * key events and keeps various data in sync with the active nav source.
 */
export class ActiveNavSourceManager {
  private readonly publisher = this.bus.getPublisher<ControlEvents>();

  private keyEventManager?: KeyEventManager;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private isAlive = true;
  private isInit = false;

  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    KeyEventManager.getManager(this.bus).then(manager => {
      this.keyEventManager = manager;
      while (this.isAlive && this.keyEventManagerReadyPromises.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.keyEventManagerReadyPromises.shift()!.resolve();
      }
    });
  }

  /**
   * Waits for this manager's key event manager to be ready.
   * @returns A Promise which will be fulfilled when this manager's key event manager is ready, or rejected if this
   * manager is destroyed before then.
   */
  private awaitKeyEventManagerReady(): Promise<void> {
    if (this.keyEventManager !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => { this.keyEventManagerReadyPromises.push({ resolve, reject }); });
  }

  /**
   * Initializes this manager. Once this manager is initialized, it will manage the active navigation source in
   * response to control events and key events and keep various data in sync with the active nav source.
   * @throws Error if this manager has been destroyed.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('ActiveNavSourceManager: cannot initialize a dead manager');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.keyEventManager!.interceptKey('AP_NAV_SELECT_SET', false);
    this.keyEventManager!.interceptKey('TOGGLE_GPS_DRIVES_NAV1', false);

    this.keyEventSub = this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
  }

  /**
   * Responds to when a key event is intercepted.
   * @param data The data for the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'AP_NAV_SELECT_SET':
        if (data.value0 !== undefined && data.value0 >= 1 && data.value0 <= 2) {
          this.publisher.pub('cdi_src_set', { type: NavSourceType.Nav, index: data.value0 }, true);
        }
        break;
      case 'TOGGLE_GPS_DRIVES_NAV1':
        this.publisher.pub('cdi_src_gps_toggle', true, true);
        break;
    }
  }

  /**
   * Destroys this manager.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('ActiveNavSourceManager: manager was destroyed'); });

    this.keyEventSub?.destroy();
  }
}