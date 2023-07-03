/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, KeyEventData, KeyEventManager, KeyEvents, Subscription } from '@microsoft/msfs-sdk';

/**
 * A handler for altimeter barometric setting key events.
 */
export class AltimeterBaroKeyEventHandler {
  private keyEventManager?: KeyEventManager;

  private isAlive = true;
  private isInit = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  private readonly keyEventManagerReadyPromises: { resolve: () => void, reject: (reason?: any) => void }[] = [];

  private keyEventSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   */
  public constructor(
    private readonly bus: EventBus,
  ) {
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

  /**
   * Initializes this handler.
   * @returns A Promise which will be fulfilled when this handler is fully initialized, or rejected if this handler is
   * destroyed before then.
   */
  public async init(): Promise<void> {
    if (!this.isAlive) {
      throw new Error('AltimeterBaroKeyEventHandler: cannot initialize a dead handler');
    }

    await this.awaitKeyEventManagerReady();

    if (this.isInit) {
      return;
    }

    this.isInit = true;

    this.keyEventManager!.interceptKey('BAROMETRIC', true);

    this.keyEventSub = this.bus.getSubscriber<KeyEvents>().on('key_intercept').handle(this.onKeyIntercepted.bind(this));
  }

  /**
   * Handles a key event intercept.
   * @param data Data describing the intercepted key event.
   */
  private onKeyIntercepted(data: KeyEventData): void {
    switch (data.key) {
      case 'BAROMETRIC': {
        this.bus.pub('baro_set', true, true, false);
        break;
      }
    }
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.isAlive = false;

    this.keyEventManagerReadyPromises.forEach(promise => { promise.reject('AltimeterBaroKeyEventHandler: handler was destroyed'); });

    this.keyEventSub?.destroy();
  }
}