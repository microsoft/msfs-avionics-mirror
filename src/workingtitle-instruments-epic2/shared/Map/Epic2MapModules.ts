import { MapOwnAirplanePropsModule, MapSystemKeys, MapTerrainColorsModule } from '@microsoft/msfs-sdk';

import { EpicMapKeys } from './EpicMapKeys';
import { MapStylesModule } from './Modules/MapStylesModule';
import { VNavDataModule } from './Modules/VNavDataModule';
import { Epic2MapTrafficModule } from './Modules/Epic2MapTrafficModule';

/** Map modules used by Boeing maps. */
export interface Epic2MapModules {
  /** TerrainColors */
  [MapSystemKeys.TerrainColors]: MapTerrainColorsModule;

  /** Own airplane props module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule,

  /** Traffic module */
  [MapSystemKeys.Traffic]: Epic2MapTrafficModule;

  /** MapStyles module */
  [EpicMapKeys.MapStyles]: MapStylesModule;

  /** VNavData module */
  [EpicMapKeys.VNavData]: VNavDataModule;

  // /** Terrain/weather state module. */
  // [EpicMapKeys.TerrainWeatherState]: MapTerrainWeatherStateModule;
}
