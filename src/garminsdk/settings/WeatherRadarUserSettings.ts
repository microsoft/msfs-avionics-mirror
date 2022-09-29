import { WeatherRadarOperatingMode, WeatherRadarScanMode } from '../components/weatherradar/WeatherRadar';

/**
 * Weather radar user settings.
 */
export type WeatherRadarUserSettingTypes = {
  /** Whether the weather radar is active. */
  wxrActive: boolean;

  /** The weather radar's operating mode. */
  wxrOperatingMode: WeatherRadarOperatingMode;

  /** The weather radar's scan mode. */
  wxrScanMode: WeatherRadarScanMode;

  /** The index of the weather radar's current range. */
  wxrRangeIndex: number;

  /** Whether to show the bearing line in horizontal scan mode. */
  wxrShowBearingLine: boolean;

  /** Whether to show the tilt line in vertical scan mode. */
  wxrShowTiltLine: boolean;
};