import { DefaultUserSettingManager, EventBus, UserSettingManager, UserSettingMap } from '@microsoft/msfs-sdk';

/**
 * Setting modes for date/time format.
 */
export enum DateTimeFormatSettingMode {
  UTC = 'UTC',
  Local24 = 'Local24',
  Local12 = 'Local12'
}

/**
 * Garmin date/time user settings.
 */
export type DateTimeUserSettingTypes = {
  /** Date/time format. */
  dateTimeFormat: DateTimeFormatSettingMode;

  /** Local time offset, in milliseconds. */
  dateTimeLocalOffset: number;
}

/**
 * Instrument-local versions of Garmin date/time user settings.
 */
export type LocalDateTimeUserSettingTypes = {
  [P in keyof DateTimeUserSettingTypes as `${P}_local`]: DateTimeUserSettingTypes[P];
}

/**
 * Utility class for retrieving date/time user setting managers.
 */
export class DateTimeUserSettings {
  private static INSTANCE: UserSettingManager<DateTimeUserSettingTypes> | undefined;
  private static LOCAL_INSTANCE: UserSettingManager<DateTimeUserSettingTypes> | undefined;

  /**
   * Retrieves a manager for date/time user settings.
   * @param bus The event bus.
   * @returns A manager for date/time user settings.
   */
  public static getManager(bus: EventBus): UserSettingManager<DateTimeUserSettingTypes> {
    return DateTimeUserSettings.INSTANCE ??= new DefaultUserSettingManager(
      bus,
      Object.entries(DateTimeUserSettings.getDefaultValues()).map(([name, defaultValue]) => {
        return {
          name,
          defaultValue
        };
      })
    );
  }

  /**
   * Retrieves a manager for instrument-local date/time user settings.
   * @param bus The event bus.
   * @returns A manager for instrument-local date/time user settings.
   */
  public static getLocalManager(bus: EventBus): UserSettingManager<DateTimeUserSettingTypes> {
    if (DateTimeUserSettings.LOCAL_INSTANCE) {
      return DateTimeUserSettings.LOCAL_INSTANCE;
    }

    const defaultValues = Object.entries(DateTimeUserSettings.getDefaultValues()) as [keyof DateTimeUserSettingTypes, DateTimeUserSettingTypes[keyof DateTimeUserSettingTypes]][];

    const defs = defaultValues.map(([name, defaultValue]) => {
      return {
        name: `${name}_local`,
        defaultValue
      };
    });

    const map = {} as UserSettingMap<DateTimeUserSettingTypes, LocalDateTimeUserSettingTypes>;
    for (const [name] of defaultValues) {
      map[name] = `${name}_local`;
    }

    return DateTimeUserSettings.LOCAL_INSTANCE = new DefaultUserSettingManager(bus, defs, true).mapTo(map);
  }

  /**
   * Gets the default values for a full set of standard display units user settings.
   * @returns The default values for a full set of standard display units user settings.
   */
  private static getDefaultValues(): DateTimeUserSettingTypes {
    return {
      dateTimeFormat: DateTimeFormatSettingMode.UTC,
      dateTimeLocalOffset: 0
    };
  }
}