import { EventBus } from './EventBus';
import { GameStateProvider } from './GameStateProvider';

/**
 * Key intercept event data.
 */
export type KeyEventData = {
  /** The key. */
  key: string;

  /** The first data value of the key event. */
  value0?: number;

  /** The second data value of the key event (this is often the index for indexed events). */
  value1?: number;

  /** The third data value of the key event. */
  value2?: number;
}

/**
 * Key events.
 */
export type KeyEvents = {
  /** A key intercept event. */
  key_intercept: KeyEventData;
}

/**
 * A manager for key events. Allows key events to be triggered and intercepted, and also publishes intercepted key
 * events on the event bus.
 */
export class KeyEventManager {
  private static INSTANCE?: KeyEventManager;
  private static isCreatingInstance = false;
  private static readonly pendingPromiseResolves: ((value: KeyEventManager) => void)[] = [];

  /**
   * Constructor.
   * @param keyListener The Coherent key intercept view listener.
   * @param bus The event bus.
   */
  private constructor(private readonly keyListener: ViewListener.ViewListener, private readonly bus: EventBus) {
    Coherent.on('keyIntercepted', this.onKeyIntercepted.bind(this));
  }

  /**
   * Responds to key intercept events.
   * @param key The key that was intercepted.
   * @param value1 The second data value of the key event.
   * @param value0 The first data value of the key event.
   * @param value2 The third data value of the key event.
   */
  private onKeyIntercepted(key: string, value1?: number, value0?: number, value2?: number): void {
    // Even though values are uint32, we will do what the sim does and pretend they're actually sint32
    if (value0 !== undefined && value0 >= 2147483648) {
      value0 -= 4294967296;
    }

    this.bus.pub('key_intercept', { key, value0, value1, value2 }, false, false);
  }

  /**
   * Triggers a key event.
   * @param key The key to trigger.
   * @param bypass Whether the event should bypass intercepts.
   * @param value0 The first data value of the key event. Defaults to `0`.
   * @param value1 The second data value of the key event. Defaults to `0`.
   * @param value2 The third data value of the key event. Defaults to `0`.
   * @returns A Promise which is fulfilled after the key event has been triggered.
   */
  public triggerKey(key: string, bypass: boolean, value0 = 0, value1 = 0, value2 = 0): Promise<void> {
    return Coherent.call('TRIGGER_KEY_EVENT', key, bypass, value0, value1, value2);
  }

  /**
   * Enables interception for a key.
   * @param key The key to intercept.
   * @param passThrough Whether to pass the event through to the sim after it has been intercepted.
   */
  public interceptKey(key: string, passThrough: boolean): void {
    Coherent.call('INTERCEPT_KEY_EVENT', key, passThrough ? 0 : 1);
  }

  /**
   * Gets an instance of KeyEventManager. If an instance does not already exist, a new one will be created.
   * @param bus The event bus.
   * @returns A Promise which will be fulfilled with an instance of KeyEventManager.
   */
  public static getManager(bus: EventBus): Promise<KeyEventManager> {
    if (KeyEventManager.INSTANCE) {
      return Promise.resolve(KeyEventManager.INSTANCE);
    }

    if (!KeyEventManager.isCreatingInstance) {
      KeyEventManager.createInstance(bus);
    }

    return new Promise(resolve => {
      KeyEventManager.pendingPromiseResolves.push(resolve);
    });
  }

  /**
   * Creates an instance of KeyEventManager and fulfills all pending Promises to get the manager instance once
   * the instance is created.
   * @param bus The event bus.
   */
  private static async createInstance(bus: EventBus): Promise<void> {
    KeyEventManager.isCreatingInstance = true;
    KeyEventManager.INSTANCE = await KeyEventManager.create(bus);
    KeyEventManager.isCreatingInstance = false;

    for (let i = 0; i < KeyEventManager.pendingPromiseResolves.length; i++) {
      KeyEventManager.pendingPromiseResolves[i](KeyEventManager.INSTANCE);
    }
  }

  /**
   * Creates an instance of KeyEventManager.
   * @param bus The event bus.
   * @returns A Promise which is fulfilled with a new instance of KeyEventManager after it has been created.
   */
  private static create(bus: EventBus): Promise<KeyEventManager> {
    return new Promise((resolve, reject) => {
      const gameState = GameStateProvider.get();
      const sub = gameState.sub(state => {
        if ((window as any)['IsDestroying']) {
          sub.destroy();
          reject('KeyEventManager: cannot create a key intercept manager after the Coherent JS view has been destroyed');
          return;
        }

        if (state === GameState.briefing || state === GameState.ingame) {
          sub.destroy();

          const keyListener = RegisterViewListener('JS_LISTENER_KEYEVENT', () => {
            if ((window as any)['IsDestroying']) {
              reject('KeyEventManager: cannot create a key intercept manager after the Coherent JS view has been destroyed');
              return;
            }

            resolve(new KeyEventManager(keyListener, bus));
          });
        }
      }, false, true);

      sub.resume(true);
    });
  }
}