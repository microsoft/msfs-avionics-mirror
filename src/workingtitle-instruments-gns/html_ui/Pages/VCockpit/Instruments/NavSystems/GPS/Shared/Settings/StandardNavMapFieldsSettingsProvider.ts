import { DefaultUserSettingManager, EventBus, UserSettingRecord } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';

/**
 * Settings available for the arc map data fields.
 */
export interface StandardNavMapDataFieldsSettings extends UserSettingRecord {
  /**
   * The 1st field of the standard nav map.
   */
  'stdmap_field_1_type': NavDataFieldType;

  /**
   * The 2nd field of the standard nav map.
   */
  'stdmap_field_2_type': NavDataFieldType;

  /**
   * The 3rd field of the standard nav map.
   */
  'stdmap_field_3_type': NavDataFieldType;

  /**
   * The 4th field of the standard nav map.
   */
  'stdmap_field_4_type': NavDataFieldType;

  /**
   * The 5th field of the standard nav map.
   */
  'stdmap_field_5_type': NavDataFieldType;
}

/**
 * A settings provider for GNS standard nav map field settings.
 */
export class StandardNavMapDataFieldsSettingsProvider extends DefaultUserSettingManager<StandardNavMapDataFieldsSettings> {

  /**
   * Creates an instance of the StandardNavMapDataFieldsSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(bus, [
      { name: 'stdmap_field_1_type', defaultValue: NavDataFieldType.DistanceToWaypoint, },
      { name: 'stdmap_field_2_type', defaultValue: NavDataFieldType.DesiredTrack },
      { name: 'stdmap_field_3_type', defaultValue: NavDataFieldType.GroundTrack },
      { name: 'stdmap_field_4_type', defaultValue: NavDataFieldType.TimeToWaypoint },
      { name: 'stdmap_field_5_type', defaultValue: NavDataFieldType.GroundSpeed },
    ], true);
  }
}
