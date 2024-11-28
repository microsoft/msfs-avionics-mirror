import { DefaultUserSettingManager, EventBus, UserSettingRecord } from '@microsoft/msfs-sdk';

/**
 * Settings for the GNS GPS system.
 */
export interface GNSGpsSettings extends UserSettingRecord {
  /** Whether or not WAAS is enabled. */
  'sbas_waas_enabled': boolean;

  /** Whether or not EGNOS is enabled. */
  'sbas_egnos_enabled': boolean;

  /** Whether or not GAGAN is enabled. */
  'sbas_gagan_enabled': boolean;

  /** Whether or not MSAS is enabled. */
  'sbas_msas_enabled': boolean;
}

/**
 * A setting manager that handles GPS settings.
 */
export class GpsSettingsProvider extends DefaultUserSettingManager<GNSGpsSettings> {

  /**
   * Creates an instane of the GpsSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(bus, [
      { name: 'sbas_waas_enabled', defaultValue: true },
      { name: 'sbas_egnos_enabled', defaultValue: true },
      { name: 'sbas_gagan_enabled', defaultValue: true },
      { name: 'sbas_msas_enabled', defaultValue: true },
    ], true);
  }
}