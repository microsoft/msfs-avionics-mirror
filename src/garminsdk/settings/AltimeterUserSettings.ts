import { MetricAltitudeSelectSetting } from 'msfssdk';

/**
 * Altimeter user settings.
 */
export type AltimeterUserSettingTypes = MetricAltitudeSelectSetting & {
  /** Whether to display altimeter barometric pressure settings in metric units. */
  altimeterBaroMetric: boolean;
};