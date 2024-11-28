import { DefaultUserSettingManager, EventBus, UserSettingRecord } from '@microsoft/msfs-sdk';

import { NavDataFieldType } from '@microsoft/msfs-garminsdk';

/**
 * Settings available for the arc map data fields.
 */
export interface ArcMapFieldsSettings extends UserSettingRecord {
  /** The top left data field. */
  'arcmap_topLeft_field_type': NavDataFieldType;

  /** The top right data field. */
  'arcmap_topRight_field_type': NavDataFieldType;

  /** The bottom left data field. */
  'arcmap_bottomLeft_field_type': NavDataFieldType;

  /** The bottom right data field. */
  'arcmap_bottomRight_field_type': NavDataFieldType;
}

/**
 * A settings provider for GNS arc map field settings.
 */
export class ArcMapFieldsSettingsProvider extends DefaultUserSettingManager<ArcMapFieldsSettings> {

  /**
   * Creates an instance of the ArcMapFieldsSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(bus, [
      { name: 'arcmap_topLeft_field_type', defaultValue: NavDataFieldType.DesiredTrack },
      { name: 'arcmap_topRight_field_type', defaultValue: NavDataFieldType.DistanceToWaypoint },
      { name: 'arcmap_bottomLeft_field_type', defaultValue: NavDataFieldType.GroundSpeed },
      { name: 'arcmap_bottomRight_field_type', defaultValue: NavDataFieldType.TimeToWaypoint }
    ],
      true);
  }
}
