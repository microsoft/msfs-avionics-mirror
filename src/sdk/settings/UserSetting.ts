import { Consumer } from '../data/Consumer';
import { EventBus, Handler } from '../data/EventBus';
import { AbstractSubscribable } from '../sub/AbstractSubscribable';
import { MutableSubscribable } from '../sub/Subscribable';
import { Subscription } from '../sub/Subscription';

/** The supported data types for a user setting. */
export type UserSettingValue = boolean | number | string;

/**
 * A definition for a user setting.
 */
export interface UserSettingDefinition<T extends UserSettingValue> {
  /** The name of this setting. */
  readonly name: string;

  /** The default value of this setting. */
  readonly defaultValue: T;
}

/**
 * A user setting.
 */
export interface UserSetting<T extends UserSettingValue> extends MutableSubscribable<T> {
  /** This setting's definition. */
  readonly definition: UserSettingDefinition<T>;

  /** This setting's current value. */
  value: T;

  /** Resets this setting to its default value. */
  resetToDefault(): void;
}

/**
 * A record which maps user setting names to user setting value types.
 */
export type UserSettingRecord = Record<any, UserSettingValue>;

/**
 * Filters a record of user settings to just those settings whose values extend a certain type.
 */
export type UserSettingValueFilter<T extends UserSettingRecord, V> = {
  [Property in keyof T as (T[Property] extends V ? Property : never)]: T[Property]
}

/**
 * A user setting type derived from a user setting record. If the provided key does not exist in the record, a type of
 * `undefined` is returned. If the provided key is optional in the record, a union type of `UserSetting<T> | undefined`
 * is returned, where `T` is the value type mapped to the key in the record.
 */
export type UserSettingFromRecord<R extends UserSettingRecord, K extends string>
  = K extends keyof R
  ? R[K] extends NonNullable<R[K]> ? UserSetting<R[K]> : UserSetting<NonNullable<R[K]>> | undefined
  : undefined;

/**
 * An entry that maps one set of setting definitions to another.
 */
export type UserSettingMap<Aliased, Original> = {
  [Property in keyof Aliased]?: keyof Original;
}

/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus.
 */
export interface UserSettingManager<T extends UserSettingRecord> {
  /**
   * Attempts to get a setting from this manager.
   * @param name The name of the setting to get.
   * @returns The requested setting, or `undefined` if no such setting exists.
   */
  tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<T[K]>> | undefined;

  /**
   * Gets a setting from this manager.
   * @param name The name of the setting to get.
   * @returns The requested setting.
   * @throws Error if no setting with the specified name exists.
   */
  getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<T[K]>>;

  /**
   * Gets a consumer which notifies handlers when the value of a setting changes.
   * @param name The name of a setting.
   * @returns a consumer which notifies handlers when the value of the setting changes.
   * @throws Error if no setting with the specified name exists.
   */
  whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<T[K]>>;

  /**
   * Gets an array of all settings of this manager.
   * @returns an array of all settings of this manager.
   */
  getAllSettings(): UserSetting<UserSettingValue>[];

  /**
   * Maps a subset of this manager's settings to ones with aliased names, and creates a new setting manager which
   * supports accessing the settings using their aliases.
   * @param map A map defining the aliases of a subset of this manager's settings, with aliased setting names as keys
   * and original setting names as values.
   * @returns A new setting manager which supports accessing a subset of this manager's settings using aliased names.
   */
  mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T>): UserSettingManager<M & T>;
}

/**
 * An entry for a user setting in UserSettingManager.
 */
export type UserSettingManagerEntry<T extends UserSettingValue> = {
  /** A user setting. */
  setting: SyncableUserSetting<T>;

  /** The event topic used to sync the setting. */
  syncTopic: `usersetting_sync_${string}`;

  /** The timestamp of the most recent sync event. */
  syncTime: number;

  /** The unique ID attached to this entry's setting's initialization sync event. */
  initUid: number;

  /** The initialization subscription for the setting. */
  initSub: Subscription;
}

/**
 * Data provided for a setting sync event.
 */
export type UserSettingManagerInitData<T extends UserSettingValue> = {
  /** The initialized value of the setting. */
  value: T;

  /** The timestamp of this initialization event. */
  syncTime: number;

  /** A unique ID attached to this initialization event. */
  uid: number;
}

/**
 * Data provided for a setting sync event.
 */
export type UserSettingManagerSyncData<T extends UserSettingValue> = {
  /** The synced value of the setting. */
  value: T;

  /** The timestamp of this sync event. */
  syncTime: number;

  /**
   * The unique ID of the initialization event to which this sync event is responding. Only defined if this sync
   * event is an initialization response.
   */
  initUid?: number;
}

/**
 * Events used to sync user setting values across instruments.
 */
export interface UserSettingManagerSyncEvents {
  /** A user setting value initialized event. */
  [setting_init: `usersetting_init_${string}`]: UserSettingManagerInitData<UserSettingValue>;

  /** A user setting value sync event. */
  [setting_sync: `usersetting_sync_${string}`]: UserSettingManagerSyncData<UserSettingValue>;
}

/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus.
 */
export class DefaultUserSettingManager<T extends UserSettingRecord> implements UserSettingManager<T> {
  protected readonly settings: Map<string, UserSettingManagerEntry<T[keyof T]>>;

  protected readonly publisher = this.bus.getPublisher<T>();
  protected readonly subscriber = this.bus.getSubscriber<T>();

  protected readonly syncPublisher = this.bus.getPublisher<UserSettingManagerSyncEvents>();
  protected readonly syncSubscriber = this.bus.getSubscriber<UserSettingManagerSyncEvents>();

  private keepLocal: boolean;

  /**
   * Constructor.
   * @param bus The bus used by this manager to publish setting change events.
   * @param settingDefs The setting definitions used to initialize this manager's settings.
   * @param keepLocal If present and true, values will be kept local to the instrument on which they're set.
   */
  constructor(
    protected readonly bus: EventBus,
    settingDefs: readonly UserSettingDefinition<T[keyof T]>[],
    keepLocal = false
  ) {
    this.keepLocal = keepLocal;
    this.settings = new Map(settingDefs.map(def => {
      const initTopic = `usersetting_init_${def.name}` as const;
      const syncTopic = `usersetting_sync_${def.name}` as const;

      const entry: UserSettingManagerEntry<any> = {
        syncTopic,
        syncTime: 0,
        initUid: Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
      } as any;

      entry.setting = new SyncableUserSetting(def, this.onSettingValueChanged.bind(this, entry));

      entry.initSub = this.syncSubscriber.on(initTopic).handle(data => {
        // Do not respond to our own initialization sync.
        if (data.uid === entry.initUid) {
          return;
        }

        // If we receive an initialization sync event for a setting, that means a manager on another instrument tried
        // to initialize the same setting to its default value. However, since the setting already exists here, we will
        // send a response to override the initialized value with the existing value.
        this.syncPublisher.pub(entry.syncTopic, { value: entry.setting.value, syncTime: entry.syncTime, initUid: data.uid }, !this.keepLocal, true);
      }, true);

      // Because sync events are cached, the initial subscriptions to the sync topic below will grab the synced value
      // of the new setting if it exists on the local instrument (e.g. if the value was synced from another instrument
      // after the local instrument was created but before this manager and local setting were created).
      this.syncSubscriber.on(syncTopic).handle(this.onSettingValueSynced.bind(this, entry) as Handler<UserSettingManagerSyncData<UserSettingValue>>);
      if (entry.syncTime === 0) {

        // If the new setting has no synced value on the local instrument, we will try to grab an initialization value
        // instead. If one exists, we will use it, but keep the local sync time at 0. If there is a pending response
        // to this initialization value, we want to be ready to accept the response when it arrives, which we can't do
        // if the local sync time is non-zero).

        const sub = this.syncSubscriber.on(initTopic).handle(data => {
          this.onSettingValueSynced(entry, { value: data.value as T[keyof T], syncTime: 0 });
        });
        sub.destroy();
      }

      if (entry.syncTime === 0) {
        // An existing synced value does not exist for the new setting on the local instrument, so we will go ahead
        // and initialize the new setting value to its default and send an initialization sync event. If the setting
        // exists on other instruments, their managers will send an initialization response to override our initialized
        // value.

        this.syncPublisher.pub(initTopic, { value: entry.setting.value, syncTime: Date.now(), uid: entry.initUid }, !this.keepLocal, true);
        this.publisher.pub(entry.setting.definition.name, entry.setting.value, false, true);
      }

      entry.initSub.resume();

      return [def.name, entry];
    }));
  }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<T[K]>> | undefined {
    return this.settings.get(name)?.setting as UserSetting<NonNullable<T[K]>> | undefined;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<T[K]>> {
    const setting = this.tryGetSetting(name);
    if (setting === undefined) {
      throw new Error(`DefaultUserSettingManager: Could not find setting with name ${name}`);
    }

    return setting as UserSetting<NonNullable<T[K]>>;
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return Array.from(this.settings.values(), entry => entry.setting);
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<T[K]>> {
    const setting = this.settings.get(name);
    if (!setting) {
      throw new Error(`DefaultUserSettingManager: Could not find setting with name ${name}`);
    }

    return this.subscriber.on(name).whenChanged() as Consumer<NonNullable<T[K]>>;
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T>): MappedUserSettingManager<M, T> {
    return new MappedUserSettingManager(this, map);
  }

  /**
   * A callback which is called when one of this manager's settings has its value changed locally.
   * @param entry The entry for the setting that was changed.
   * @param value The new value of the setting.
   */
  protected onSettingValueChanged<K extends keyof T>(entry: UserSettingManagerEntry<T[K]>, value: T[K]): void {
    entry.syncTime = Date.now();
    this.syncPublisher.pub(entry.syncTopic, { value, syncTime: entry.syncTime }, !this.keepLocal, true);
  }

  /**
   * A callback which is called when a setting changed event is received over the event bus.
   * @param entry The entry for the setting that was changed.
   * @param data The sync data.
   */
  protected onSettingValueSynced<K extends keyof T>(entry: UserSettingManagerEntry<T[K]>, data: UserSettingManagerSyncData<T[K]>): void {
    // If the sync event is an initialization response, ignore it if the local setting value has already been synced.
    // Otherwise, protect against race conditions by not responding to sync events older than the last time this
    // manager synced the setting.
    if (
      (data.initUid !== undefined && entry.syncTime !== 0)
      || (data.initUid === undefined && data.syncTime < entry.syncTime)
    ) {
      return;
    }

    this.syncSettingFromEvent(entry, data);
  }

  /**
   * Syncs a setting using data received from a sync event.
   * @param entry The entry for the setting to sync.
   * @param data The sync event data.
   */
  protected syncSettingFromEvent<K extends keyof T>(entry: UserSettingManagerEntry<T[K]>, data: UserSettingManagerSyncData<T[K]>): void {
    entry.syncTime = data.syncTime;
    entry.setting.syncValue(data.value);

    // Publish the public setting change event. Do NOT sync across the bus because doing so can result in older events
    // being received after newer events.
    this.publisher.pub(entry.setting.definition.name as K, entry.setting.value, false, true);
  }
}

/**
 * A manager for user settings. Provides settings using their names as keys, publishes value change events on the
 * event bus, and keeps setting values up to date when receiving change events across the bus, using a mapping from
 * abstracted settings keys to true underlying settings keys.
 */
export class MappedUserSettingManager<T extends UserSettingRecord, O extends UserSettingRecord> implements UserSettingManager<T & O> {

  /**
   * Creates an instance of a MappedUserSettingManager.
   * @param parent The parent setting manager.
   * @param map The map of abstracted keys to true underlying keys.
   */
  constructor(private readonly parent: UserSettingManager<O>, private readonly map: UserSettingMap<T, O>) { }

  /** @inheritdoc */
  public tryGetSetting<K extends string>(name: K): UserSetting<NonNullable<(T & O)[K]>> | undefined {
    const mappedName = (this.map[name] ?? name) as keyof O & string;
    return this.parent.tryGetSetting(mappedName) as unknown as UserSetting<NonNullable<(T & O)[K]>> | undefined;
  }

  /** @inheritdoc */
  public getSetting<K extends keyof T & string>(name: K): UserSetting<NonNullable<(T & O)[K]>> {
    const mappedName = (this.map[name] ?? name) as keyof O & string;
    return this.parent.getSetting(mappedName) as unknown as UserSetting<NonNullable<(T & O)[K]>>;
  }

  /** @inheritdoc */
  public whenSettingChanged<K extends keyof T & string>(name: K): Consumer<NonNullable<(T & O)[K]>> {
    const mappedName = (this.map[name] ?? name) as keyof O & string;
    return this.parent.whenSettingChanged(mappedName) as unknown as Consumer<NonNullable<(T & O)[K]>>;
  }

  /** @inheritdoc */
  public getAllSettings(): UserSetting<UserSettingValue>[] {
    return this.parent.getAllSettings();
  }

  /** @inheritdoc */
  public mapTo<M extends UserSettingRecord>(map: UserSettingMap<M, T & O>): MappedUserSettingManager<M, T & O> {
    return new MappedUserSettingManager(this, map);
  }
}

/**
 * An implementation of a user setting which can be synced across multiple instances.
 */
class SyncableUserSetting<T extends UserSettingValue> extends AbstractSubscribable<T> implements UserSetting<T> {
  public readonly isMutableSubscribable = true;

  private _value: T;

  // eslint-disable-next-line jsdoc/require-returns
  /** This setting's current value. */
  public get value(): T {
    return this._value;
  }
  // eslint-disable-next-line jsdoc/require-jsdoc
  public set value(v: T) {
    if (this._value === v) {
      return;
    }

    this._value = v;
    this.valueChangedCallback(v);
    this.notify();
  }

  /**
   * Constructor.
   * @param definition This setting's definition.
   * @param valueChangedCallback A function to be called whenever the value of this setting changes.
   */
  constructor(
    public readonly definition: UserSettingDefinition<T>,
    private readonly valueChangedCallback: (value: T) => void
  ) {
    super();

    this._value = definition.defaultValue;
  }

  /**
   * Syncs this setting to a value. This will not trigger a call to valueChangedCallback.
   * @param value The value to which to sync.
   */
  public syncValue(value: T): void {
    if (this._value === value) {
      return;
    }

    this._value = value;
    this.notify();
  }

  /** @inheritdoc */
  public get(): T {
    return this._value;
  }

  /**
   * Sets the value of this setting.
   * @param value The new value.
   */
  public set(value: T): void {
    this.value = value;
  }

  /** @inheritdoc */
  public resetToDefault(): void {
    this.set(this.definition.defaultValue);
  }
}