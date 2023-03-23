import { MappedSubject, MappedSubscribable, Subject, UserSettingManager } from '@microsoft/msfs-sdk';

/**
 * Type descriptions for reference V-speed user settings.
 */
export type VSpeedUserSettingTypes = {
  /** The default value of a V-speed reference, in knots, or -1 if no such value exists. */
  [defaultValue: `vSpeedDefaultValue_${string}`]: number;

  /** The current user-defined value of a V-speed reference, in knots, or -1 if no such value exists. */
  [userValue: `vSpeedUserValue_${string}`]: number;

  /** The current FMS-defined value of a V-speed reference, in knots, or -1 if no such value exists. */
  [fmsValue: `vSpeedFmsValue_${string}`]: number;

  /** Whether the aircraft configuration does not match the one used by the FMS to calculate the value of a V-speed reference. */
  [fmsConfigMiscompare: `vSpeedFmsConfigMiscompare_${string}`]: boolean;

  /** Whether to show a V-speed reference on the PFD airspeed indicator. */
  [show: `vSpeedShow_${string}`]: boolean;
};

/**
 * A utility class for working with reference V-speed user settings.
 */
export class VSpeedUserSettingUtils {
  /**
   * Creates a mapped subscribable which provides the active value of a reference V-speed, in knots. The active value
   * is derived from the following values (in order of decreasing precedence):
   *
   * 1. User-defined value.
   * 2. FMS-defined value.
   * 3. Default value.
   * @param name The name of the reference V-speed.
   * @param settingManager A manager for reference V-speed user settings.
   * @param useFmsValue Whether to support the V-speed's FMS-defined value.
   * @returns A mapped subscribable which provides the active value of the specified reference V-speed, in knots.
   */
  public static activeValue(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}`>>,
    useFmsValue: true
  ): MappedSubscribable<number>;
  /**
   * Creates a mapped subscribable which provides the active value of a reference V-speed, in knots. The active value
   * is derived from the following values (in order of decreasing precedence):
   *
   * 1. User-defined value.
   * 2. Default value.
   * @param name The name of the reference V-speed.
   * @param settingManager A manager for reference V-speed user settings.
   * @param useFmsValue Whether to support the V-speed's FMS-defined value.
   * @returns A mapped subscribable which provides the active value of the specified reference V-speed, in knots.
   */
  public static activeValue(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}` | `vSpeedFmsValue_${string}`>>,
    useFmsValue: false
  ): MappedSubscribable<number>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static activeValue(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}`>>,
    useFmsValue: boolean
  ): MappedSubscribable<number> {
    return useFmsValue
      ? MappedSubject.create(
        ([defaultVal, userVal, fmsVal]) => {
          let val = -1;

          if (userVal >= 0) {
            if (userVal > 0) {
              val = userVal;
            }
          } else if (fmsVal > 0) {
            val = fmsVal;
          } else if (defaultVal > 0) {
            val = defaultVal;
          }

          return val;
        },
        settingManager.tryGetSetting(`vSpeedDefaultValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedUserValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedFmsValue_${name}`) ?? Subject.create(-1)
      )
      : MappedSubject.create(
        ([defaultVal, userVal]) => {
          let val = -1;

          if (userVal >= 0) {
            if (userVal > 0) {
              val = userVal;
            }
          } else if (defaultVal > 0) {
            val = defaultVal;
          }

          return val;
        },
        settingManager.tryGetSetting(`vSpeedDefaultValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedUserValue_${name}`) ?? Subject.create(-1)
      );
  }

  /**
   * Creates a mapped subscribable which provides whether a reference V-speed is using its user-defined value as its
   * active value.
   * @param name The name of the reference V-speed.
   * @param settingManager A manager for reference V-speed user settings.
   * @param useFmsValue Whether to support the V-speed's FMS-defined value.
   * @returns A mapped subscribable which provides whether the specified reference V-speed is using its user-defined
   * value as its active value.
   */
  public static isUserValueActive(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}`>>,
    useFmsValue: true
  ): MappedSubscribable<boolean>;
  /**
   * Creates a mapped subscribable which provides whether a reference V-speed is using its user-defined value as its
   * active value.
   * @param name The name of the reference V-speed.
   * @param settingManager A manager for reference V-speed user settings.
   * @param useFmsValue Whether to support the V-speed's FMS-defined value.
   * @returns A mapped subscribable which provides whether the specified reference V-speed is using its user-defined
   * value as its active value.
   */
  public static isUserValueActive(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}` | `vSpeedFmsValue_${string}`>>,
    useFmsValue: false
  ): MappedSubscribable<boolean>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static isUserValueActive(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}`>>,
    useFmsValue: boolean
  ): MappedSubscribable<boolean> {
    return useFmsValue
      ? MappedSubject.create(
        ([defaultVal, userVal, fmsVal]) => {
          if (userVal < 0) {
            return false;
          }

          return userVal !== fmsVal && userVal !== defaultVal;
        },
        settingManager.tryGetSetting(`vSpeedDefaultValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedUserValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedFmsValue_${name}`) ?? Subject.create(-1)
      )
      : MappedSubject.create(
        ([defaultVal, userVal]) => {
          if (userVal < 0) {
            return false;
          }

          return userVal !== defaultVal;
        },
        settingManager.tryGetSetting(`vSpeedDefaultValue_${name}`) ?? Subject.create(-1),
        settingManager.tryGetSetting(`vSpeedUserValue_${name}`) ?? Subject.create(-1)
      );
  }

  /**
   * Creates a mapped subscribable which provides whether a reference V-speed is using its FMS-defined value as its
   * active value.
   * @param name The name of the reference V-speed.
   * @param settingManager A manager for reference V-speed user settings.
   * @returns A mapped subscribable which provides whether the specified reference V-speed is using its FMS-defined
   * value as its active value.
   */
  public static isFmsValueActive(
    name: string,
    settingManager: UserSettingManager<Omit<VSpeedUserSettingTypes, `vSpeedShow_${string}`>>
  ): MappedSubscribable<boolean> {
    return MappedSubject.create(
      ([userVal, fmsVal]) => {
        if (fmsVal < 0) {
          return false;
        }

        if (userVal > 0) {
          return userVal === fmsVal;
        } else {
          return true;
        }
      },
      settingManager.tryGetSetting(`vSpeedUserValue_${name}`) ?? Subject.create(-1),
      settingManager.tryGetSetting(`vSpeedFmsValue_${name}`) ?? Subject.create(-1)
    );
  }
}