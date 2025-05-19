import { MapLayer, MappedSubject, MapRotation, MapSystemContext, UserSettingManager } from '@microsoft/msfs-sdk';

import {
  EpicMapCommon, EpicMapKeys, MapDisplayMode, MapFormatConfig, MapFormatController, MapFormatControllerModules, MapSystemCommon, MfdAliasedUserSettingTypes,
  TERRAIN_MODE, WeatherMode
} from '@microsoft/msfs-epic2-shared';

import { UpperMfdPaneSizes } from '../UpperMfdPaneSizes';

const HDG_TRK_UP_LAYER_KEYS = [
  EpicMapKeys.HeadingTrackUpOverlay,
  ...EpicMapCommon.HDG_TRK_UP_FORMAT_COMMON_LAYER_KEYS,
] as readonly string[];

const NORTH_UP_LAYER_KEYS = [
  EpicMapKeys.NorthUpOverlay,
  ...EpicMapCommon.NORTH_UP_FORMAT_COMMON_LAYER_KEYS,
] as readonly string[];

/**
 * A map system controller that controls the display settings of the various format
 * and terrain/wxr combinations.
 */
export class UpperMfdFormatController extends MapFormatController {
  /**
   * Gets a record of map format configs corresponding to a display mode
   * @param isVsdEnabled Whether the VSD display is enabled
   * @returns A record of map format configs corresponding
   */
  private static getMapFormatConfigs(isVsdEnabled: boolean): Readonly<Record<MapDisplayMode, MapFormatConfig>> {
    return {
      [MapDisplayMode.NorthUp]: {
        rotationType: MapRotation.NorthUp,
        compassType: 'center',
        targetProjectedOffsetY: (isVsdEnabled ? -70 : 0),
        compassRadius: MapSystemCommon.northUpCompassRadius,
        mapHeight: UpperMfdPaneSizes.twoThirds.height,
        layerKeys: NORTH_UP_LAYER_KEYS,
        ...EpicMapCommon.NORTH_UP_DEFAULT_CONFIG,
      },
      [MapDisplayMode.HeadingUp]: {
        rotationType: MapRotation.HeadingUp,
        compassType: 'arc',
        targetProjectedOffsetY: MapSystemCommon.hdgTrkUpOffsetY - (isVsdEnabled ? 70 : 0),
        compassRadius: MapSystemCommon.hdgTrkUpCompassRadius,
        mapHeight: UpperMfdPaneSizes.twoThirds.height,
        layerKeys: HDG_TRK_UP_LAYER_KEYS,
        ...EpicMapCommon.HDG_TRK_UP_DEFAULT_CONFIG,
      },
      [MapDisplayMode.TrackUp]: {
        rotationType: MapRotation.TrackUp,
        compassType: 'arc',
        targetProjectedOffsetY: MapSystemCommon.hdgTrkUpOffsetY - (isVsdEnabled ? 70 : 0),
        compassRadius: MapSystemCommon.hdgTrkUpCompassRadius,
        mapHeight: UpperMfdPaneSizes.twoThirds.height,
        layerKeys: HDG_TRK_UP_LAYER_KEYS,
        ...EpicMapCommon.HDG_TRK_UP_DEFAULT_CONFIG,
      },
    };
  }

  /**
   * Creates an instance of the MapFormatController.
   * @param context The map system context to use with this controller.
   * @param mfdSettings The settings manager to use.
   */
  constructor(
    context: MapSystemContext<MapFormatControllerModules>,
    private readonly mfdSettings: UserSettingManager<MfdAliasedUserSettingTypes>
  ) {
    const currentMapFormatConfig = MappedSubject.create(([mapFormat, isVsdEnabled]) => {
      return UpperMfdFormatController.getMapFormatConfigs(isVsdEnabled)[mapFormat];
    }, mfdSettings.getSetting('mapDisplayMode'), mfdSettings.getSetting('vsdEnabled'));

    super(
      context,
      currentMapFormatConfig,
      mfdSettings.getSetting('terrWxState'),
      mfdSettings.getSetting('tfcEnabled'),
    );

    // Start with all map format layers hidden.
    this.hideAllMapFormatLayers();

  }

  /** @inheritdoc */
  public override onAfterMapRender(): void {
    super.onAfterMapRender();
    const terrWxModule = this.context.model.getModule(EpicMapKeys.TerrainWeatherState);

    const terrainMode = MappedSubject.create(([terrWxState, isGeoTerrainEnabled, isSATerrainEnabled]) => {
      if (isSATerrainEnabled && terrWxState === 'WX') {
        return TERRAIN_MODE.OFF;
      }
      return isSATerrainEnabled ? TERRAIN_MODE.SA : isGeoTerrainEnabled ? TERRAIN_MODE.GEO : TERRAIN_MODE.OFF;
    },
      terrWxModule.state,
      this.mfdSettings.getSetting('terrainEnabled'),
      this.mfdSettings.getSetting('saTerrainEnabled')
    );
    terrainMode.pipe(terrWxModule.terrainMode);
    this.mfdSettings.getSetting('weatherMode').sub((v) => {
      if (v !== WeatherMode.Off) {
        this.weatherModule.weatherRadarMode.set(v === WeatherMode.SxmWeather ? EWeatherRadar.TOPVIEW : EWeatherRadar.HORIZONTAL);
        this.mfdSettings.getSetting('terrWxState').set('WX');
      } else {
        this.mfdSettings.getSetting('terrWxState').set('OFF');
      }
    }, true);
  }

  /** Hide all layers associated with map formats. */
  private hideAllMapFormatLayers(): void {
    const allLayerKeys = new Set<string>();

    for (const formatConfig of Object.values(UpperMfdFormatController.getMapFormatConfigs(false))) {
      formatConfig.layerKeys.forEach(x => allLayerKeys.add(x));
    }

    for (const layerKey of allLayerKeys) {
      // FYI Make sure all layers extend MapLayer
      (this.context.getLayer(layerKey as any) as MapLayer)?.setVisible(false);
    }
  }
}
