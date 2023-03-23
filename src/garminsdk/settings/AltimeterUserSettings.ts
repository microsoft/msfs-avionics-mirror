import { MetricAltitudeSelectSetting } from '@microsoft/msfs-sdk';

/**
 * Altimeter user settings.
 */
export type AltimeterUserSettingTypes = MetricAltitudeSelectSetting & {
  /** Whether to display altimeter barometric pressure settings in metric units. */
  altimeterBaroMetric: boolean;
};