/**
 * Setting modes for weather map orientation.
 */
export enum WeatherMapOrientationSettingMode {
  NorthUp = 'NorthUp',
  TrackUp = 'TrackUp',
  HeadingUp = 'HeadingUp',
  DtkUp = 'DtkUp',
  SyncToNavMap = 'SyncToNavMap'
}

/**
 * Weather map user settings.
 */
export type WeatherMapUserSettingTypes = {
  /** The weather map range index setting.  */
  weatherMapRangeIndex: number;

  /** The weather map orientation setting. */
  weatherMapOrientation: WeatherMapOrientationSettingMode;
};

/**
 * Connext weather map user settings.
 */
export type ConnextMapUserSettingTypes = {
  /** Whether the Connext weather map radar overlay is enabled. */
  connextMapRadarOverlayShow: boolean;

  /** Connext radar overlay maximum range setting. */
  connextMapRadarOverlayRangeIndex: number;
};

/**
 * A utility class for working with weather map user settings.
 */
export class WeatherMapUserSettingsUtils {
  /** An array of all generic weather map user setting names. */
  public static readonly SETTING_NAMES = [
    'weatherMapRangeIndex',
    'weatherMapOrientation'
  ] as readonly (keyof WeatherMapUserSettingTypes)[];

  /** An array of all Connext weather map user setting names. */
  public static readonly CONNEXT_SETTING_NAMES = [
    'connextMapRadarOverlayShow',
    'connextMapRadarOverlayRangeIndex'
  ] as readonly (keyof ConnextMapUserSettingTypes)[];
}