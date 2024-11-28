import { DefaultUserSettingManager, EventBus, UserSettingRecord } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';

/**
 * Settings available for the WT430 NAV 1 page data fields.
 */
export interface WT430NAvInfoFieldsSettings extends UserSettingRecord {
  /**
   * The 1st field of the NAV 1 page.
   */
  'wt430_navinfo_field_1_type': NavDataFieldType;

  /**
   * The 2nd field of the NAV 1 page.
   */
  'wt430_navinfo_field_2_type': NavDataFieldType;

  /**
   * The 3rd field of the NAV 1 page.
   */
  'wt430_navinfo_field_3_type': NavDataFieldType;

  /**
   * The 4th field of the NAV 1 page.
   */
  'wt430_navinfo_field_4_type': NavDataFieldType;

  /**
   * The 5th field of the NAV 1 page.
   */
  'wt430_navinfo_field_5_type': NavDataFieldType;

  /**
   * The 6th field of the NAV 1 page.
   */
  'wt430_navinfo_field_6_type': NavDataFieldType;

}

/**
 * A settings provider for GNS standard nav map field settings.
 */
export class WT430NavInfoFieldsSettingsProvider extends DefaultUserSettingManager<WT430NAvInfoFieldsSettings> {

  /**
   * Creates an instance of the StandardNavMapDataFieldsSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(bus, [
      { name: 'wt430_navinfo_field_1_type', defaultValue: NavDataFieldType.CrossTrack },
      { name: 'wt430_navinfo_field_2_type', defaultValue: NavDataFieldType.DistanceToWaypoint },
      { name: 'wt430_navinfo_field_3_type', defaultValue: NavDataFieldType.GroundTrack },
      { name: 'wt430_navinfo_field_4_type', defaultValue: NavDataFieldType.GroundSpeed },
      { name: 'wt430_navinfo_field_5_type', defaultValue: NavDataFieldType.TimeToWaypoint },
      { name: 'wt430_navinfo_field_6_type', defaultValue: NavDataFieldType.DesiredTrack }, /* FIXME add ALT field type */
    ], true);
  }
}
