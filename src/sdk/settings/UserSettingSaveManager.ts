import { DataStore } from '../data/DataStore';
import { EventBus } from '../data/EventBus';
import { SubscribableUtils } from '../sub/SubscribableUtils';
import { Subscription } from '../sub/Subscription';
import { UserSetting, UserSettingValue } from './UserSetting';

/**
 * A definition describing a user setting to be saved by {@link UserSettingSaveManager}.
 */
export type UserSettingSaveManagerSettingDef<ValueType extends UserSettingValue> = {
  /** The setting to save. */
  setting: UserSetting<ValueType>;

  /**
   * A function that validates a loaded value before it is applied to the setting. If not defined, then all loaded
   * values will be applied to the setting as-is.
   * @param loadValue The loaded value.
   * @param setting The setting to which the loaded value should be applied.
   * @returns The value that should be applied to the setting.
   */
  loadValidator?: (loadValue: unknown, setting: UserSetting<ValueType>) => ValueType;
};

/**
 * A UserSettingSaveManager entry for a setting.
 */
type UserSettingSaveManagerEntry<T extends UserSettingValue> = {
  /** A setting. */
  setting: UserSetting<T>;

  /** A subscription to the setting. */
  subscription: Subscription;

  /** The data store keys to which the setting's value should be automatically saved. */
  autoSaveDataStoreKeys: string[];

  /**
   * A function that validates a loaded value before it is applied to the setting. If not defined, then all loaded
   * values will be applied to the setting as-is.
   * @param loadValue The loaded value.
   * @param setting The setting to which the loaded value should be applied.
   * @returns The value that should be applied to the setting.
   */
  loadValidator?: (loadValue: unknown, setting: UserSetting<T>) => T;
}

/**
 * A manager for user settings that are saved and persistent across flight sessions. The manager facilitates saving
 * and loading setting values to and from multiple keyed save slots and also supports auto-saving. Uses Data Store to
 * store saved setting values.
 */
export class UserSettingSaveManager {
  private static readonly DATASTORE_PREFIX = 'persistent-setting';

  private readonly entries: UserSettingSaveManagerEntry<UserSettingValue>[];
  private readonly autoSaveKeys = new Set<string>();

  private isAlive = true;

  /**
   * Creates a new instance of UserSettingSaveManager.
   * @param settings This manager's managed settings.
   * @param bus The event bus.
   */
  public constructor(
    settings: readonly (UserSetting<UserSettingValue> | UserSettingSaveManagerSettingDef<UserSettingValue>)[],
    bus: EventBus
  ) {
    const subscriber = bus.getSubscriber<any>();

    this.entries = Array.from(settings, settingOrDef => {
      let setting: UserSetting<UserSettingValue>;
      let loadValidator: ((loadValue: unknown, setting: UserSetting<UserSettingValue>) => UserSettingValue) | undefined;

      if (SubscribableUtils.isSubscribable(settingOrDef)) {
        setting = settingOrDef;
      } else {
        setting = settingOrDef.setting;
        loadValidator = settingOrDef.loadValidator;
      }

      const autoSaveDataStoreKeys: string[] = [];
      return {
        setting,
        subscription: subscriber.on(setting.definition.name).whenChanged().handle(this.onSettingChanged.bind(this, autoSaveDataStoreKeys), true),
        autoSaveDataStoreKeys,
        loadValidator
      };
    });
  }

  /**
   * A callback which is called when a setting's value changes.
   * @param autoSaveDataStoreKeys The data store keys to which the setting's value should be automatically saved.
   * @param value The new value of the setting.
   */
  private onSettingChanged<T extends UserSettingValue>(autoSaveDataStoreKeys: string[], value: T): void {
    const len = autoSaveDataStoreKeys.length;
    for (let i = 0; i < len; i++) {
      DataStore.set(autoSaveDataStoreKeys[i], value);
    }
  }

  /**
   * Loads the saved values of this manager's settings.
   * @param key The key from which to load the values.
   * @throws Error if this manager has been destroyed.
   */
  public load(key: string): void {
    if (!this.isAlive) {
      throw new Error('UserSettingSaveManager: cannot load using a destroyed manager.');
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const dataStoreKey = UserSettingSaveManager.getDataStoreKey(entry.setting, key);
      const storedValue = DataStore.get(dataStoreKey);
      if (storedValue !== undefined) {
        entry.setting.set(entry.loadValidator ? entry.loadValidator(storedValue, entry.setting) : storedValue);
      }
    }
  }

  /**
   * Saves the current values of this manager's settings.
   * @param key The key to which to save the values.
   * @throws Error if this manager has been destroyed.
   */
  public save(key: string): void {
    if (!this.isAlive) {
      throw new Error('UserSettingSaveManager: cannot save using a destroyed manager.');
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const dataStoreKey = UserSettingSaveManager.getDataStoreKey(entry.setting, key);
      DataStore.set(dataStoreKey, entry.setting.get());
    }
  }

  /**
   * Starts automatically saving this manager's settings when their values change.
   * @param key The key to which to save the values.
   * @throws Error if this manager has been destroyed.
   */
  public startAutoSave(key: string): void {
    if (!this.isAlive) {
      throw new Error('UserSettingSaveManager: cannot start autosave using a destroyed manager.');
    }

    if (this.autoSaveKeys.has(key)) {
      return;
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      entry.autoSaveDataStoreKeys.push(UserSettingSaveManager.getDataStoreKey(entry.setting, key));
      if (entry.autoSaveDataStoreKeys.length === 1) {
        entry.subscription.resume();
      }
    }
  }

  /**
   * Stops automatically saving this manager's settings when their values change.
   * @param key The key to which to stop saving the values.
   * @throws Error if this manager has been destroyed.
   */
  public stopAutoSave(key: string): void {
    if (!this.isAlive) {
      throw new Error('UserSettingSaveManager: cannot stop autosave using a destroyed manager.');
    }

    if (!this.autoSaveKeys.has(key)) {
      return;
    }

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      entry.autoSaveDataStoreKeys.splice(entry.autoSaveDataStoreKeys.indexOf(UserSettingSaveManager.getDataStoreKey(entry.setting, key)), 1);
      if (entry.autoSaveDataStoreKeys.length === 0) {
        entry.subscription.pause();
      }
    }
  }

  /**
   * Destroys this manager. Once this manager is destroyed, all active autosaves will be stopped, and attempting to
   * save, load, or start another autosave from this manager will cause an error to be thrown.
   */
  public destroy(): void {
    const len = this.entries.length;
    for (let i = 0; i < len; i++) {
      this.entries[i].subscription.destroy();
    }

    this.entries.length = 0;
    this.isAlive = false;
  }

  /**
   * Gets a data store key for a specific setting and save key.
   * @param setting A user setting.
   * @param saveKey The save key.
   * @returns the data store key for the setting and save key.
   */
  private static getDataStoreKey(setting: UserSetting<any>, saveKey: string): string {
    return `${UserSettingSaveManager.DATASTORE_PREFIX}.${saveKey}.${setting.definition.name}`;
  }
}
