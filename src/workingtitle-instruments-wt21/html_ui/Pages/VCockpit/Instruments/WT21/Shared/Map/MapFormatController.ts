import {
  MapBingLayer, MapCullableTextLayer, MapOwnAirplaneIconModule, MapRotation, MapRotationModule, MapSystemContext, MapSystemController,
  MapSystemFlightPlanLayer, MapSystemKeys, MapSystemWaypointsLayer, MapWxrModule, UnitType, UserSettingManager, Vec2Math, VecNMath
} from '@microsoft/msfs-sdk';
import { MapFormatSupportMatrix } from './MapFormatSupportMatrix';

import { MapTodLayer } from './MapTodLayer';
import { HSIFormat, MapSettingsMfdAliased, MapSettingsPfdAliased, MapUserSettings, PfdOrMfd, TerrWxState } from './MapUserSettings';
import { WT21MapKeys } from './WT21MapKeys';
import { MapTerrainStateModule } from './MapTerrainWeatherStateModule';

/**
 * Modules required by MapFormatController.
 */
export interface MapFormatControllerModules {
  /** Own airplane icon module. */
  [MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule;

  /** Rotation module. */
  [MapSystemKeys.Rotation]: MapRotationModule;

  /** Terrain colors module. */
  [WT21MapKeys.TerrainModeState]: MapTerrainStateModule;

  /** Weather module. */
  [MapSystemKeys.Weather]: MapWxrModule;
}

/**
 * Layers required by MapFormatController.
 */
export interface MapFormatControllerLayers {
  /** Bing Map layer. */
  [MapSystemKeys.Bing]: MapBingLayer;

  /** Active flight plan layer. */
  flightPlan0: MapSystemFlightPlanLayer;

  /** Mod flight plan layer. */
  flightPlan1: MapSystemFlightPlanLayer;

  /** Waypoints layer. */
  [MapSystemKeys.NearestWaypoints]: MapSystemWaypointsLayer;

  /** TOD display layer */
  [WT21MapKeys.Tod]: MapTodLayer;

  /** Text layer. */
  [MapSystemKeys.TextLayer]: MapCullableTextLayer;
}

/**
 * A map system controller that controls the display settings of the various format
 * and terrain/wxr combinations.
 */
export class MapFormatController extends MapSystemController<MapFormatControllerModules, MapFormatControllerLayers> {
  private static readonly TARGET_OFFSETS = {
    ['ARC']: Vec2Math.create(0, 66),
    ['PPOS']: Vec2Math.create(0, 66),
    ['ROSE']: Vec2Math.create(0, -6),
    ['PLAN']: Vec2Math.create(0, -6),
    ['GWX']: Vec2Math.create(0, 0),
    ['TCAS']: Vec2Math.create(0, -6)
  };
  private static readonly RANGE_ENDPOINTS = {
    ['ARC']: VecNMath.create(4, 0.5, 348 / 564, 0.5, 45 / 564),
    ['PPOS']: VecNMath.create(4, 0.5, 348 / 564, 0.5, 45 / 564),
    ['ROSE']: VecNMath.create(4, 0.5, 276 / 564, 0.5, 46 / 564),
    ['PLAN']: VecNMath.create(4, 0.5, 276 / 564, 0.5, 46 / 564),
    ['GWX']: VecNMath.create(4, 0.5, 0.5, 0.5, 52 / 564),
    ['TCAS']: VecNMath.create(4, 0.5, 276 / 564, 0.5, 46 / 564)
  };

  private static readonly RANGE_ENDPOINTS_EXTENDED = {
    ['ARC']: VecNMath.create(4, 0.5, 348 / 824, 0.5, 45 / 824),
    ['PPOS']: VecNMath.create(4, 0.5, 348 / 824, 0.5, 45 / 824),
    ['ROSE']: VecNMath.create(4, 0.5, 276 / 824, 0.5, 46 / 824),
    ['PLAN']: VecNMath.create(4, 0.5, 276 / 824, 0.5, 46 / 824),
    ['GWX']: VecNMath.create(4, 0.5, 0.5, 0.5, 52 / 824),
    ['TCAS']: VecNMath.create(4, 0.5, 276 / 824, 0.5, 46 / 824)
  };

  private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
  private readonly terrain = this.context.model.getModule(WT21MapKeys.TerrainModeState);
  private readonly wxr = this.context.model.getModule(MapSystemKeys.Weather);
  private readonly ownship = this.context.model.getModule(MapSystemKeys.OwnAirplaneIcon);
  private readonly rotation = this.context.model.getModule(MapSystemKeys.Rotation);

  private readonly bingLayer = this.context.getLayer(MapSystemKeys.Bing);
  private readonly todLayer = this.context.getLayer(WT21MapKeys.Tod);
  private readonly flightplanLayer = this.context.getLayer('flightPlan0');
  private readonly modFlightplanLayer = this.context.getLayer('flightPlan1');
  private readonly waypointLayer = this.context.getLayer(MapSystemKeys.NearestWaypoints);
  private readonly textLayer = this.context.getLayer(MapSystemKeys.TextLayer);

  private readonly supportMatrix = new MapFormatSupportMatrix();
  private currentTerrWxState: TerrWxState = 'OFF';
  private currentFormat: HSIFormat = 'PPOS';
  private currentNexrad = false;
  private currentRangeEndPoints = MapFormatController.RANGE_ENDPOINTS;
  private isExtendedMap = false;

  /**
   * Creates an instance of the MapFormatController.
   * @param context The map system context to use with this controller.
   * @param pfdOrMfd Whether or not the map is on the PFD or MFD.
   */
  constructor(
    context: MapSystemContext<MapFormatControllerModules>,
    private readonly pfdOrMfd: PfdOrMfd
  ) {
    super(context);
    this.wxr.weatherRadarArc.set(120);
    this.settings = MapUserSettings.getAliasedManager(this.context.bus, this.pfdOrMfd);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the settings system to the format controller.
   */
  private wireSettings(): void {
    this.settings.whenSettingChanged('terrWxState')
      .handle((v) => this.handleFormatOrTerrWxChanged(v, this.currentFormat, this.currentNexrad));
    this.settings.whenSettingChanged('hsiFormat')
      .handle((v) => this.handleFormatOrTerrWxChanged(this.currentTerrWxState, v, this.currentNexrad));

    if (this.pfdOrMfd === 'MFD') {
      (this.settings as UserSettingManager<MapSettingsMfdAliased>).whenSettingChanged('nexradEnabled')
        .handle((v) => this.handleFormatOrTerrWxChanged(this.currentTerrWxState, this.currentFormat, v));

      (this.settings as UserSettingManager<MapSettingsMfdAliased>).whenSettingChanged('mapExtended').handle(x => {
        this.isExtendedMap = x;
        this.context.projection.setQueued({
          projectedSize: new Float64Array([564, (x === true) ? 824 : 564])
        });
        this.handleFormatOrTerrWxChanged(this.currentTerrWxState, this.currentFormat, this.currentNexrad);
      });
    }
  }

  /**
   * Handles when the format or terrain/wxr settings are changed on the map.
   * @param state The changed terrain/wxr map state.
   * @param format The changed map format.
   * @param nexradEnabled Whether to show the NEXRAD weather overlay for PLAN format.
   */
  private handleFormatOrTerrWxChanged(state: TerrWxState, format: HSIFormat, nexradEnabled: boolean): void {
    this.currentTerrWxState = state;
    this.currentFormat = format;
    this.currentNexrad = nexradEnabled;

    this.terrain.displayTerrain.set(state === 'TERR' && this.supportMatrix.isSupported(format, 1));

    this.wxr.isEnabled.set((state === 'WX' && this.supportMatrix.isSupported(format, 2)) || (nexradEnabled === true && this.supportMatrix.isSupported(format, 3)));
    if (this.wxr.isEnabled.get() === true) {
      this.wxr.weatherRadarMode.set(format === 'PLAN' ? EWeatherRadar.TOPVIEW : EWeatherRadar.HORIZONTAL);
    }

    if (state !== 'OFF' && UnitType.GA_RADIAN.convertTo(this.context.projection.getRange(), UnitType.NMILE) === 600) {
      this.settings.getSetting('mapRange').set(300);
    }

    this.setOffset(this.isExtendedMap);
    this.setRangeEndpoints(format, this.isExtendedMap);
    this.setOwnshipVisible(format);
    this.setRotationType(format);
    this.setWaypointsVisible(format);
  }

  /**
   * Sets the map target offset for the specified format.
   * @param isExtendedMap Value indicating if the map is in extended format.
   */
  private setOffset(isExtendedMap: boolean): void {
    const offset = MapFormatController.TARGET_OFFSETS[this.currentFormat].slice();
    if (isExtendedMap === true) {
      offset[1] += 130;
    }

    this.context.projection.setQueued({ targetProjectedOffset: offset });
  }

  /**
   * Handles when the format changes.
   * @param format The format of the map.
   * @param isExtendedMap Value indicating if the map is in extended format.
   */
  private setRangeEndpoints(format: HSIFormat, isExtendedMap: boolean): void {
    this.currentRangeEndPoints = (isExtendedMap === true) ? MapFormatController.RANGE_ENDPOINTS_EXTENDED : MapFormatController.RANGE_ENDPOINTS;
    this.context.projection.setQueued({ rangeEndpoints: this.currentRangeEndPoints[format] });
  }

  /**
   * Sets whether or not the ownship icon is visible for the specified format.
   * @param format The current HSI format.
   */
  private setOwnshipVisible(format: HSIFormat): void {
    if (format === 'PPOS' || format === 'PLAN') {
      this.ownship.show.set(true);
    } else {
      this.ownship.show.set(false);
    }
  }

  /**
   * Sets the map rotation type for the specified format.
   * @param format The current HSI format.
   */
  private setRotationType(format: HSIFormat): void {
    if (format === 'PLAN') {
      this.rotation.rotationType.set(MapRotation.NorthUp);
    } else {
      this.rotation.rotationType.set(MapRotation.HeadingUp);
    }
  }


  /**
   * Sets the whether or not the flight plan is visible for the specified format.
   * @param format The current HSI format.
   */
  private setWaypointsVisible(format: HSIFormat): void {
    this.bingLayer.setVisible(this.supportMatrix.isSupported(format, 0) || (format === 'ARC' && this.currentTerrWxState !== 'OFF'));

    if (this.supportMatrix.isSupported(format, 0)) {
      this.flightplanLayer.setVisible(true);
      this.modFlightplanLayer.setVisible(true);
      this.waypointLayer.setVisible(true);
      this.todLayer.setVisible(true);
      this.textLayer.setVisible(true);
    } else {
      this.flightplanLayer.setVisible(false);
      this.modFlightplanLayer.setVisible(false);
      this.waypointLayer.setVisible(false);
      this.todLayer.setVisible(false);
      this.textLayer.setVisible(false);
    }
  }
}