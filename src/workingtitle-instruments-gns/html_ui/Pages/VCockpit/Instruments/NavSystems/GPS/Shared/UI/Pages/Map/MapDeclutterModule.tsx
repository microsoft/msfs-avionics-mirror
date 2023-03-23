import { Subject } from '@microsoft/msfs-sdk';

import { MapDeclutterLevel } from '../../../Settings/MapSettingsProvider';

/**
 * A map module that manages the map declutter level.
 */
export class MapDeclutterModule {
  /** The current map declutter level. */
  public readonly declutterLevel = Subject.create(MapDeclutterLevel.None);
}