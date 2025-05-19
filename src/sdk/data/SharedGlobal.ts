import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';

/**
 * A reference to a shared global object.
 * @experimental
 */
export interface SharedGlobalObjectRef<T extends object> {
  /** The object instance. */
  readonly instance: T;

  /** Whether the object has been detached. */
  readonly isDetached: Subscribable<boolean>;
}

/**
 * An entry describing a shared global.
 */
type GlobalEntry = {
  /** A Promise which is fulfilled when the global is attached. */
  attachPromise: Promise<void>;

  /** The status of the global. */
  status: 'pending' | 'attached' | 'detached';

  /** Whether the global is detached. */
  isDetached: Subject<boolean>;

  /** A Promise resolve function to call when the global is attached. */
  resolve?: () => void;

  /** A Promise reject function to call when the global is detached. */
  reject?: (reason?: any) => void;
};

/**
 * A utility class for working with shared global objects.
 *
 * Shared global objects are objects that can be accessed from multiple CoherentGT views. Each shared global has an
 * owning view - this is the view from which the global was originally created. When a view is destroyed, all globals
 * that it owns are detached. Once a shared global is detached, it must be created again by another view to continue
 * to be used.
 * @experimental
 */
export class SharedGlobal {
  private static listenerPromise?: Promise<ViewListener.ViewListener>;

  private static readonly globalEntries = new Map<string, GlobalEntry>();

  /**
   * Initializes the shared global listener.
   * @returns A Promise which is fulfilled when the shared global listener is initialized.
   */
  private static initListener(): Promise<ViewListener.ViewListener> {
    return SharedGlobal.listenerPromise ??= new Promise(resolve => {
      const listener = RegisterViewListener('JS_LISTENER_SHAREDGLOBAL', () => {
        listener.on('SharedGlobalAttached', SharedGlobal.onGlobalAttached);
        listener.on('SharedGlobalDetached', SharedGlobal.onGlobalDetached);
        resolve(listener);
      });
    });
  }

  /**
   * Gets a shared global object. If the shared global does not already exist, then it will be created with this view
   * as the owner.
   * @param name The name of the shared global object to get.
   * @returns A Promise which is fulfilled with a reference to the specified shared global object.
   * @experimental
   */
  public static async get<T extends object = object>(name: string): Promise<SharedGlobalObjectRef<T>> {
    const listener = await SharedGlobal.initListener();

    // First pend a request to ensure we receive the callback for the global being attached/detached.
    const entry = this.pendRequest(listener, name);
    // Then call the CREATE_SHARED_GLOBAL function. If the global does not exist, then it will be created and attached.
    // If it does exist, then the function does nothing (so we aren't in danger of duplicating or overwriting a
    // global).
    listener.call('CREATE_SHARED_GLOBAL', name);

    await entry.attachPromise;

    const obj = (window as unknown as Record<string, unknown>)[name];

    if (typeof obj !== 'object' || obj === null) {
      throw new Error(`SharedGlobal.get(): failed to get shared global object with name ${name}`);
    }

    return {
      instance: obj as T,
      isDetached: entry.isDetached,
    };
  }

  /**
   * Waits for a shared global object to be attached.
   * @param name The name of the shared global object for which to wait.
   * @returns A Promise which is fulfilled with a reference to the specified shared global object once the global has
   * been created.
   * @experimental
   */
  public static async await<T extends object = object>(name: string): Promise<SharedGlobalObjectRef<T>> {
    const listener = await SharedGlobal.initListener();

    const entry = SharedGlobal.pendRequest(listener, name);
    await entry.attachPromise;

    const obj = (window as unknown as Record<string, unknown>)[name];

    if (typeof obj !== 'object' || obj === null) {
      throw new Error(`SharedGlobal.await(): failed to get shared global object with name ${name}`);
    }

    return {
      instance: obj as T,
      isDetached: entry.isDetached,
    };
  }

  /**
   * Pends a request for a shared global. If the shared global has already been requested or is already attached, then
   * the request is skipped.
   * @param listener The shared global listener.
   * @param name The name of the shared global to request.
   * @returns An entry describing the requested shared global.
   */
  private static pendRequest(listener: ViewListener.ViewListener, name: string): GlobalEntry {
    const existing = SharedGlobal.globalEntries.get(name);

    if (existing) {
      return existing;
    }

    let resolve: () => void;
    let reject: (reason?: any) => void;
    const attachPromise = new Promise<void>((resolveFunc, rejectFunc) => {
      resolve = resolveFunc;
      reject = rejectFunc;
    });

    const entry: GlobalEntry = {
      attachPromise,
      status: 'pending',
      isDetached: Subject.create(false),
      resolve: resolve!,
      reject: reject!,
    };

    SharedGlobal.globalEntries.set(name, entry);

    listener.call('REQUEST_SHARED_GLOBAL', name);

    return entry;
  }

  /**
   * Responds to when a shared global is attached.
   * @param name The name of the attached global.
   */
  private static onGlobalAttached(name: string): void {
    const entry = SharedGlobal.globalEntries.get(name);
    if (entry) {
      entry.status = 'attached';
      entry.resolve?.();
    } else {
      SharedGlobal.globalEntries.set(name, {
        attachPromise: Promise.resolve(),
        status: 'attached',
        isDetached: Subject.create(false),
      });
    }
  }

  /**
   * Responds to when a shared global is detached.
   * @param name The name of detached global.
   */
  private static onGlobalDetached(name: string): void {
    const entry = SharedGlobal.globalEntries.get(name);
    if (entry) {
      SharedGlobal.globalEntries.delete(name);
      delete (window as unknown as Record<string, unknown>)[name];
      entry.status = 'detached';
      entry.reject?.(`SharedGlobal: shared global object with name ${name} was detached`);
      entry.isDetached.set(true);
    }
  }
}
