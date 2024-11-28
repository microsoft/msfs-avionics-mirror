/* eslint-disable @typescript-eslint/no-unused-vars */
import { MapLayer, MappedSubject, MapRotation, MapSystemContext, UserSettingManager } from '@microsoft/msfs-sdk';

import { HsiDisplayFormat, PfdAliasedUserSettingTypes } from '../../Settings';
import { EpicMapCommon, MapFormatConfig } from '../EpicMapCommon';
import { EpicMapKeys } from '../EpicMapKeys';
import { MapSystemCommon } from '../MapSystemCommon';
import { MapFormatController, MapFormatControllerModules } from './MapFormatController';
import { TERRAIN_MODE } from '../Modules';

const HSI_LAYER_KEYS = [
  EpicMapKeys.HsiOverlay,
  ...EpicMapCommon.HDG_TRK_UP_FORMAT_COMMON_LAYER_KEYS,
] as readonly string[];

// TODO Just setting both formats to be the same thing for now
const MAP_FORMAT_CONFIGS: Readonly<Record<HsiDisplayFormat, MapFormatConfig>> = {
  'Full': {
    rotationType: MapRotation.HeadingUp,
    compassType: 'arc',
    targetProjectedOffsetY: MapSystemCommon.hsiOffsetY,
    compassRadius: MapSystemCommon.hsiCompassRadius,
    mapHeight: MapSystemCommon.hsiMapHeight,
    layerKeys: HSI_LAYER_KEYS,
    ...EpicMapCommon.HDG_TRK_UP_DEFAULT_CONFIG,
  },
  'Partial': {
    rotationType: MapRotation.HeadingUp,
    compassType: 'arc',
    targetProjectedOffsetY: MapSystemCommon.hsiOffsetY,
    compassRadius: MapSystemCommon.hsiCompassRadius,
    mapHeight: MapSystemCommon.hsiMapHeight,
    layerKeys: HSI_LAYER_KEYS,
    ...EpicMapCommon.HDG_TRK_UP_DEFAULT_CONFIG,
  },
};

/**
 * A map system controller that controls the display settings of the various format
 * and terrain/wxr combinations.
 */
export class HsiFormatController extends MapFormatController {
  /**
   * Creates an instance of the MapFormatController.
   * @param context The map system context to use with this controller.
   * @param settings The settings manager to use.
   */
  constructor(
    context: MapSystemContext<MapFormatControllerModules>,
    settings: UserSettingManager<PfdAliasedUserSettingTypes>
  ) {
    const currentMapFormatConfig = MappedSubject.create(([mapFormat]) => {
      return MAP_FORMAT_CONFIGS[mapFormat];
    }, settings.getSetting('hsiDisplayFormat'));

    super(
      context,
      currentMapFormatConfig,
      settings.getSetting('terrWxState'),
      settings.getSetting('trafficEnabled'),
    );

    // Start with all map format layers hidden.
    this.hideAllMapFormatLayers();

  }

  /** @inheritdoc */
  public override onAfterMapRender(): void {
    super.onAfterMapRender();
    this.terrainWeatherStateModule.state.sub((v) => this.bingLayer?.setVisible(v !== 'OFF'), true);
    this.terrWxState.sub((v) => {
      this.terrainWeatherStateModule.terrainMode.set(v === 'TERR' ? TERRAIN_MODE.SA : TERRAIN_MODE.OFF);
    }, true);
  }

  /** Hide all layers associated with map formats. */
  private hideAllMapFormatLayers(): void {
    const allLayerKeys = new Set<string>();

    for (const [_, formatConfig] of Object.entries(MAP_FORMAT_CONFIGS)) {
      formatConfig.layerKeys.forEach(x => allLayerKeys.add(x));
    }

    for (const layerKey of allLayerKeys) {
      // FYI Make sure all layers extend MapLayer
      (this.context.getLayer(layerKey as any) as MapLayer)?.setVisible(false);
    }
  }
}
