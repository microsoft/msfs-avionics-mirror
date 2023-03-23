/* eslint-disable jsdoc/require-jsdoc */
import {
  DefaultLodBoundaryCache, FlightPlanner, FlightPlannerEvents, FSComponent, GeoPoint, LatLonInterface, MapAltitudeArcLayer, MapAltitudeArcLayerModules,
  MapAltitudeArcLayerProps, MapAltitudeArcModule, MapBinding, MapCullableTextLabelManager,
  MapFollowAirplaneModule, MapGenericLayer, MapGenericLayerProps, MapIndexedRangeModule, MapLayerProps, MapLineLayer, MapLineLayerProps,
  MapOwnAirplanePropsModule, MapSyncedCanvasLayer, MapSystemBuilder, MapSystemContext, MapSystemGenericController, MapSystemKeys, MapTerrainColorsModule,
  MapTrafficIntruderIconFactory, MapTrafficModule, MapWxrModule, MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer,
  ResourceModerator, SetSubject, Subject, Subscribable, SubscribableSet, SubscribableSetEventType, Subscription, TcasAlertLevel, TcasIntruder,
  TrafficOffScaleOobOptions, UnitFamily, UnitType, UserSettingManager, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '../../flightplan/Fms';
import { MapDeclutterSettingMode } from '../../settings/MapUserSettings';
import { TrafficUserSettingTypes } from '../../settings/TrafficUserSettings';
import { UnitsUserSettingManager } from '../../settings/UnitsUserSettings';
import { TrafficSystem } from '../../traffic/TrafficSystem';
import {
  MapAirspaceVisController, MapAirspaceVisControllerModules, MapAirspaceVisUserSettings, MapDataIntegrityRTRController, MapDataIntegrityRTRControllerContext,
  MapDataIntegrityRTRControllerModules, MapFlightPlanFocusRTRController, MapFlightPlanFocusRTRControllerContext, MapFlightPlanFocusRTRControllerModules,
  MapGarminTrafficController, MapGarminTrafficControllerModules, MapNexradController, MapNexradControllerModules, MapNexradUserSettings,
  MapOrientationController, MapOrientationControllerContext, MapOrientationControllerModules, MapOrientationControllerSettings, MapOrientationRTRController,
  MapOrientationRTRControllerContext, MapOrientationRTRControllerModules, MapPointerController, MapPointerControllerModules, MapPointerRTRController,
  MapPointerRTRControllerContext, MapPointerRTRControllerModules, MapRangeCompassController, MapRangeCompassControllerModules, MapRangeController,
  MapRangeControllerModules, MapRangeControllerSettings, MapRangeRTRController, MapRangeRTRControllerModules, MapTerrainColorsController,
  MapTerrainColorsControllerModules, MapTerrainColorsDefinition, MapTerrainController, MapTerrainControllerModules, MapTerrainUserSettings,
  MapTrafficController, MapTrafficControllerModules, MapTrafficUserSettings, MapWaypointsVisController, MapWaypointsVisControllerModules,
  MapWaypointVisUserSettings, MapWxrController, MapWxrControllerModules, TrafficMapRangeController, TrafficMapRangeControllerModules,
  TrafficMapRangeControllerSettings, WeatherMapOrientationController, WeatherMapOrientationControllerContext, WeatherMapOrientationControllerModules,
  WeatherMapOrientationControllerSettings
} from './controllers';
import { MapActiveFlightPlanDataProvider, MapFlightPathPlanRenderer, MapFlightPathProcRenderer, MapFlightPlannerPlanDataProvider } from './flightplan';
import { MapFlightPlanDataProvider } from './flightplan/MapFlightPlanDataProvider';
import { GarminMapKeys } from './GarminMapKeys';
import {
  MapCrosshairLayer, MapCrosshairLayerModules, MapFlightPlanLayer,
  MapMiniCompassLayer, MapPointerInfoLayer, MapPointerInfoLayerModules, MapPointerInfoLayerSize, MapPointerLayer, MapPointerLayerModules,
  MapProcedurePreviewLayer, MapProcedurePreviewLayerModules, MapRangeCompassLayer, MapRangeCompassLayerModules, MapRangeCompassLayerProps, MapRangeRingLayer,
  MapRangeRingLayerModules, MapRangeRingLayerProps, MapTrackVectorLayer, MapTrackVectorLayerModules, MapTrackVectorLayerProps, MapWaypointHighlightLayer,
  MapWaypointHighlightLayerModules, MapWaypointsLayer, MapWaypointsLayerModules, TrafficMapRangeLayer, TrafficMapRangeLayerModules, TrafficMapRangeLayerProps
} from './layers';
import { MapAirspaceRendering } from './MapAirspaceRendering';
import { MapTrafficIntruderIcon, MapTrafficIntruderIconOptions } from './MapTrafficIntruderIcon';
import { MapTrafficOffScaleStatus } from './MapTrafficOffScaleStatus';
import { MapWaypointDisplayBuilder, MapWaypointDisplayBuilderClass } from './MapWaypointDisplayBuilder';
import { MapWaypointRenderer, MapWaypointRenderRole } from './MapWaypointRenderer';
import {
  GarminAirspaceShowTypeMap, MapCrosshairModule, MapDeclutterMode, MapDeclutterModule, MapFlightPlanFocusModule, MapGarminDataIntegrityModule, MapGarminTrafficModule,
  MapNexradModule, MapOrientation, MapOrientationModule, MapPointerModule, MapProcedurePreviewModule, MapRangeCompassModule, MapRangeRingModule, MapTerrainMode,
  MapTerrainModule, MapTrackVectorModule, MapUnitsModule, MapWaypointHighlightModule, MapWaypointsModule
} from './modules';

/**
 * Styling options for the range ring.
 */
export type RangeRingOptions = Omit<MapRangeRingLayerProps, keyof MapLayerProps<any>>;

/**
 * Styling options for the range compass.
 */
export type RangeCompassOptions = Omit<MapRangeCompassLayerProps, keyof MapLayerProps<any> | 'bus'>;

/**
 * Styling options for the range compass heading bug.
 */
export type RangeCompassHeadingBugOptions = {
  /** The width of the reference heading arrow, in pixels. */
  referenceArrowWidth: number;

  /** The height of the reference heading arrow, in pixels. */
  referenceArrowHeight: number;

  /** The width of the heading bug, in pixels. */
  headingBugWidth: number;

  /** The height of the heading bug, in pixels. */
  headingBugHeight: number;
};

/**
 * Options for flight plan layers.
 */
export type FlightPlanOptions = {
  /** The data provider for the flight plan to render. */
  dataProvider: MapFlightPlanDataProvider;

  /** The flight path renderer to use. */
  pathRenderer: MapFlightPathPlanRenderer;

  /** Whether to always draw the entire plan, or a subscribable which provides it. Defaults to `false`. */
  drawEntirePlan?: boolean | Subscribable<boolean>;
}

/**
 * Options for the waypoint highlight line.
 */
export type WaypointHighlightLineOptions = Omit<MapLineLayerProps, keyof MapLayerProps<any> | 'start' | 'end'>;

/**
 * Options for traffic intruder icons.
 */
export type TrafficIconOptions = MapTrafficIntruderIconOptions & {
  /** The name of the icon font. */
  font: string;
}

/**
 * Options for the traffic map range rings.
 */
export type TrafficRangeRingOptions = Omit<TrafficMapRangeLayerProps, keyof MapLayerProps<any>>;

/**
 * Options for the altitude intercept arc.
 */
export type AltitudeArcOptions = Omit<MapAltitudeArcLayerProps, keyof MapLayerProps<any>>;

/**
 * Options for the track vector.
 */
export type TrackVectorOptions = Omit<MapTrackVectorLayerProps, keyof MapLayerProps<any>>;

/** Callback functions for indicator groups. */
export type IndicatorGroupCallbacks = Omit<MapGenericLayerProps<any>, keyof MapLayerProps<any>>;

/**
 *
 */
export class GarminMapBuilder {

  /**
   * Configures a map builder to generate a map with measurement unit support.
   *
   * Adds the module `[GarminMapKeys.Units]: MapUnitsModule`.
   * @param mapBuilder The map builder to configure.
   * @param settingManager A units setting manager to control the map's measurement units. If not defined, the map
   * will use a default set of measurement units.
   * @returns The map builder, after it has been configured.
   */
  public static units<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    settingManager?: UnitsUserSettingManager
  ): MapBuilder {
    return mapBuilder.withModule(GarminMapKeys.Units, () => new MapUnitsModule(settingManager));
  }

  /**
   * Configures a map builder to generate a map which supports multiple indexed ranges, with optional support for
   * controlling the map range with a user setting.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.RangeControl]: ResourceModerator<void>`
   * * `[GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>>` (only if user setting support is enabled)
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   *
   * Controllers:
   * * `[GarminMapKeys.RangeRTR]: MapRangeRTRController`
   * * `[GarminMapKeys.Range]: MapRangeController` (can be used to control map range)
   * * `'useRangeSettingDefault': MapSystemCustomController` (only if user setting support is enabled)
   * @param mapBuilder The map builder to configure.
   * @param nauticalRangeArray The map range array to use for nautical distance mode. If not defined, a range array
   * will not automatically be set when entering nautical distance mode.
   * @param metricRangeArray The map range array to use for metric distance mode. If not defined, a range array will
   * not automatically be set when entering metric distance mode.
   * @param settingManager A setting manager containing a user setting to control the map range. If not defined, range
   * will not be controlled by a user setting.
   * @param useRangeSettingByDefault Whether the range user setting should control the map range by default. Defaults
   * to `true`. Is ignored if `settingManager` is undefined.
   * @returns The map builder, after it has been configured.
   */
  public static range<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    settingManager?: UserSettingManager<MapRangeControllerSettings>,
    useRangeSettingByDefault = true
  ): MapSystemBuilder {
    const useSetting = settingManager === undefined ? undefined : Subject.create(true);

    if (useSetting) {
      const defaultUseRangeSettingConsumer: ResourceConsumer<Subject<boolean>> = {
        priority: 0,

        onAcquired: (useRangeSetting): void => {
          useRangeSetting.set(useRangeSettingByDefault);
        },

        onCeded: () => { }
      };

      let useRangeSettingDefaultController: MapSystemGenericController;

      mapBuilder
        .withContext(GarminMapKeys.UseRangeSetting, () => new ResourceModerator(useSetting))
        .withController<
          MapSystemGenericController<any, any, any, { [GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>> }>,
          any, any, any,
          { [GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>> }
        >(
          'useRangeSettingDefault',
          context => useRangeSettingDefaultController = new MapSystemGenericController(context, {
            onAfterMapRender: (contextArg): void => {
              contextArg[GarminMapKeys.UseRangeSetting].claim(defaultUseRangeSettingConsumer);
            },

            onMapDestroyed: (): void => {
              useRangeSettingDefaultController.destroy();
            },

            onDestroyed: (contextArg): void => {
              contextArg[GarminMapKeys.UseRangeSetting].forfeit(defaultUseRangeSettingConsumer);
            }
          })
        );
    }

    return mapBuilder
      .withRangeControlModerator()
      .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
      .withController<MapRangeRTRController, MapRangeRTRControllerModules>(GarminMapKeys.RangeRTR, context => new MapRangeRTRController(context))
      .withController<MapRangeController, MapRangeControllerModules>(
        GarminMapKeys.Range,
        context => new MapRangeController(
          context,
          nauticalRangeArray,
          metricRangeArray,
          settingManager,
          useSetting
        )
      );
  }

  /**
   * Configures a map builder to generate a map which supports different orientations, as enumerated by
   * {@link MapOrientation}. Each orientation defines a different rotation behavior, target offset, and range
   * endpoints.
   *
   * Adds the following...
   *
   * Context properties:
   * * `'[MapSystemKeys.RotationControl]': ResourceModerator<void>`
   * * `[GarminMapKeys.OrientationControl]: ResourceModerator<void>`
   *
   * Modules:
   * * `[MapSystemKeys.Rotation]: MapRotationModule`
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule` (only with user setting support)
   *
   * Controllers:
   * * `[MapSystemKeys.Rotation]: MapRotationController`
   * * `[GarminMapKeys.OrientationRTR]: MapOrientationRTRController`
   * * `[GarminMapKeys.Orientation]: MapOrientationController` (only with user setting support)
   * {@link MapOrientationRTRController}.
   * @param mapBuilder The map builder to configure.
   * @param nominalTargetOffsets The nominal projected target offsets defined by each orientation. Each target offset
   * is a 2-tuple `[x, y]`, where each component is expressed relative to the width or height of the map's projected
   * window, *excluding* the dead zone. If an orientation does not have a defined offset, it will default to `[0, 0]`.
   * @param nominalRangeEndpoints The nominal range endpoints defined by each orientation. Each set of range endpoints
   * is a 4-tuple `[x1, y1, x2, y2]`, where each component is expressed relative to the width or height of the map's
   * projected window, *excluding* the dead zone. If an orientation does not have defined range endpoints, it will
   * default to `[0.5, 0.5, 0.5, 0]` (center to top-center).
   * @param settingManager A setting manager containing user settings used to control the map orientation. If not
   * defined, map orientation will not be bound to user settings.
   * @returns The map builder, after it has been configured.
   */
  public static orientation<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    nominalTargetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    nominalRangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    settingManager?: UserSettingManager<Partial<MapOrientationControllerSettings>>
  ): MapBuilder {
    mapBuilder
      .withRotation()
      .withContext(GarminMapKeys.RotationModeControl, () => new ResourceModerator(undefined))
      .withContext(GarminMapKeys.OrientationControl, () => new ResourceModerator(undefined))
      .withModule(GarminMapKeys.Orientation, () => new MapOrientationModule())
      .withController<MapOrientationRTRController, MapOrientationRTRControllerModules, any, any, MapOrientationRTRControllerContext>(
        GarminMapKeys.OrientationRTR,
        context => new MapOrientationRTRController(
          context,
          nominalTargetOffsets,
          nominalRangeEndpoints
        )
      );

    if (settingManager !== undefined) {
      mapBuilder
        .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
        .withController<MapOrientationController, MapOrientationControllerModules, any, any, MapOrientationControllerContext>(
          GarminMapKeys.Orientation,
          context => new MapOrientationController(context, settingManager)
        );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which supports different weather map orientations, as enumerated by
   * {@link MapOrientation}. Each orientation defines a different rotation behavior, target offset, and range
   * endpoints.
   *
   * Adds the following...
   *
   * Context properties:
   * * `'[MapSystemKeys.RotationControl]': ResourceModerator<void>`
   * * `[GarminMapKeys.OrientationControl]: ResourceModerator<void>`
   *
   * Modules:
   * * `[MapSystemKeys.Rotation]: MapRotationModule`
   * * `[GarminMapKeys.Orientation]: MapOrientationModule`
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule` (only with user setting support)
   *
   * Controllers:
   * * `[MapSystemKeys.Rotation]: MapRotationController`
   * * `[GarminMapKeys.OrientationRTR]: MapOrientationRTRController`
   * * `[GarminMapKeys.Orientation]: MapOrientationController` (only with user setting support)
   * {@link MapOrientationRTRController}.
   * @param mapBuilder The map builder to configure.
   * @param nominalTargetOffsets The nominal projected target offsets defined by each orientation. Each target offset
   * is a 2-tuple `[x, y]`, where each component is expressed relative to the width or height of the map's projected
   * window, *excluding* the dead zone. If an orientation does not have a defined offset, it will default to `[0, 0]`.
   * @param nominalRangeEndpoints The nominal range endpoints defined by each orientation. Each set of range endpoints
   * is a 4-tuple `[x1, y1, x2, y2]`, where each component is expressed relative to the width or height of the map's
   * projected window, *excluding* the dead zone. If an orientation does not have defined range endpoints, it will
   * default to `[0.5, 0.5, 0.5, 0]` (center to top-center).
   * @param settingManager A setting manager containing user settings used to control the map orientation. If not
   * defined, map orientation will not be bound to user settings.
   * @returns The map builder, after it has been configured.
   */
  public static weatherOrientation<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    nominalTargetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    nominalRangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>,
    settingManager?: UserSettingManager<Partial<WeatherMapOrientationControllerSettings>>
  ): MapBuilder {
    mapBuilder
      .withRotation()
      .withContext(GarminMapKeys.RotationModeControl, () => new ResourceModerator(undefined))
      .withContext(GarminMapKeys.OrientationControl, () => new ResourceModerator(undefined))
      .withModule(GarminMapKeys.Orientation, () => new MapOrientationModule())
      .withController<MapOrientationRTRController, MapOrientationRTRControllerModules, any, any, MapOrientationRTRControllerContext>(
        GarminMapKeys.OrientationRTR,
        context => new MapOrientationRTRController(
          context,
          nominalTargetOffsets,
          nominalRangeEndpoints
        )
      );

    if (settingManager !== undefined) {
      mapBuilder
        .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
        .withController<WeatherMapOrientationController, WeatherMapOrientationControllerModules, any, any, WeatherMapOrientationControllerContext>(
          GarminMapKeys.Orientation,
          context => new WeatherMapOrientationController(context, settingManager)
        );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which supports data integrity state. During loss of valid heading
   * information, the map will default to North Up orientation, and the player airplane icon will optionally be changed
   * to reflect this state. During loss of valid GPS signal, the map will stop attempting to follow the player
   * airplane, and the player airplane icon will be hidden.
   * @param mapBuilder The map builder to configure.
   * @param airplaneIconSrc A mutable subscribable which controls the player airplane icon's image source URI.
   * Required for this controller to change the player airplane icon.
   * @param airplaneIconAnchor A mutable subscribable which controls the anchor point of the player airplane icon.
   * Required for this controller to change the player airplane icon.
   * @param normalIconSrc The URI of the normal player airplane icon's image source, or a subscribable which provides
   * it. Required for the player airplane icon to change during loss of valid heading information.
   * @param normalIconAnchor The anchor point of the normal player airplane icon, as `[x, y]`, where each component is
   * relative to the width or height of the icon, or a subscribable which provides it. Required for the player airplane
   * icon to change during loss of valid heading information.
   * @param noHeadingIconSrc The URI of the no-heading player airplane icon's image source, or a subscribable which
   * provides it. Required for the player airplane icon to change during loss of valid heading information.
   * @param noHeadingIconAnchor The anchor point of the no-heading player airplane icon, as `[x, y]`, where each
   * component is relative to the width or height of the icon, or a subscribable which provides it. Required for the
   * player airplane icon to change during loss of valid heading information.
   * @returns The map builder, after it has been configured.
   */
  public static dataIntegrity<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    airplaneIconSrc?: MutableSubscribable<string>,
    airplaneIconAnchor?: MutableSubscribable<ReadonlyFloat64Array>,
    normalIconSrc?: string | Subscribable<string>,
    normalIconAnchor?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    noHeadingIconSrc?: string | Subscribable<string>,
    noHeadingIconAnchor?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>
  ): MapBuilder {
    return mapBuilder
      .withModule(MapSystemKeys.DataIntegrity, () => new MapGarminDataIntegrityModule())
      .withController<
        MapDataIntegrityRTRController,
        MapDataIntegrityRTRControllerModules,
        any, any,
        MapDataIntegrityRTRControllerContext
      >(GarminMapKeys.DataIntegrityRTR, context => {
        const normalIconSrcToUse = typeof normalIconSrc === 'string' ? Subject.create(normalIconSrc) : normalIconSrc;
        const normalIconAnchorToUse = normalIconAnchor instanceof Float64Array
          ? Subject.create(normalIconAnchor)
          : normalIconAnchor as Subscribable<ReadonlyFloat64Array> | undefined;

        const noHeadingIconSrcToUse = typeof noHeadingIconSrc === 'string' ? Subject.create(noHeadingIconSrc) : noHeadingIconSrc;
        const noHeadingIconAnchorToUse = noHeadingIconAnchor instanceof Float64Array
          ? Subject.create(noHeadingIconAnchor)
          : noHeadingIconAnchor as Subscribable<ReadonlyFloat64Array> | undefined;

        return new MapDataIntegrityRTRController(
          context,
          airplaneIconSrc,
          airplaneIconAnchor,
          normalIconSrcToUse,
          normalIconAnchorToUse,
          noHeadingIconSrcToUse,
          noHeadingIconAnchorToUse
        );
      });
  }

  /**
   * Configures a map builder to generate a map which supports declutter modes, and optionally binds the declutter
   * mode to a user setting.
   * @param mapBuilder The map builder to configure.
   * @param settingManager A user setting manager containing the setting controlling declutter mode.
   * @returns The map builder, after it has been configured.
   */
  public static declutter<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    settingManager?: UserSettingManager<{ 'mapDeclutter'?: MapDeclutterSettingMode }>
  ): MapBuilder {
    mapBuilder.withModule(GarminMapKeys.Declutter, () => new MapDeclutterModule());

    if (settingManager?.tryGetSetting('mapDeclutter') !== undefined) {
      mapBuilder.withBindings<{ [GarminMapKeys.Declutter]: MapDeclutterModule }>(GarminMapKeys.Declutter, context => {
        return [
          {
            source: settingManager.getSetting('mapDeclutter'),
            target: context.model.getModule(GarminMapKeys.Declutter).mode,
            map: (setting: MapDeclutterSettingMode): MapDeclutterMode => {
              switch (setting) {
                case MapDeclutterSettingMode.Level3: return MapDeclutterMode.Level3;
                case MapDeclutterSettingMode.Level2: return MapDeclutterMode.Level2;
                case MapDeclutterSettingMode.Level1: return MapDeclutterMode.Level1;
                default: return MapDeclutterMode.All;
              }
            }
          }
        ];
      });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which supports terrain color modes, and optionally binds the modes to
   * user settings.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule` (only with user settings support)
   * * `[GarminMapKeys.Terrain]: MapTerrainModule`
   *
   * Controllers:
   * * `[MapSystemKeys.TerrainColors]: MapTerrainColorsController`
   * * `[GarminMapKeys.Terrain]: MapTerrainController` (only with user settings support)
   * @param mapBuilder The map builder to configure.
   * @param colors The terrain colors to use for each terrain mode. Ignored if `includeTerrain` is `false`.
   * @param settingManager A user setting manager containing settings which control terrain colors. If not defined,
   * terrain color mode will not be controlled by user settings.
   * @param allowRelativeMode Whether to allow relative terrain mode. Defaults to `true`. Ignored if terrain
   * colors is not controlled by user settings.
   * @param groundRelativeBlendDuration The amount of time, in milliseconds, over which to blend the on-ground and
   * relative terrain mode colors when transitioning between the two. A blend transition is only possible if colors
   * are defined for both the on-ground and relative terrain modes, and the colors for both modes have the same number
   * of steps and are applied over the same elevation range. Defaults to 0 milliseconds.
   * @returns The map builder, after it has been configured.
   */
  public static terrainColors<MapBuilder extends MapSystemBuilder<{ [MapSystemKeys.TerrainColors]: MapTerrainColorsModule }>>(
    mapBuilder: MapBuilder,
    colors: Partial<Record<MapTerrainMode, MapTerrainColorsDefinition>>,
    settingManager?: UserSettingManager<Partial<MapTerrainUserSettings>>,
    allowRelativeMode = true,
    groundRelativeBlendDuration = 0
  ): MapBuilder {
    mapBuilder
      .withModule(GarminMapKeys.Terrain, () => new MapTerrainModule())
      .withController<MapTerrainColorsController, MapTerrainColorsControllerModules>(
        MapSystemKeys.TerrainColors, context => new MapTerrainColorsController(context, colors ?? {}, groundRelativeBlendDuration)
      );

    const setting = settingManager?.tryGetSetting('mapTerrainMode');
    if (setting !== undefined) {
      mapBuilder
        .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
        .withController<MapTerrainController, MapTerrainControllerModules>(GarminMapKeys.Terrain, context => {
          return new MapTerrainController(context, settingManager, allowRelativeMode);
        });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which supports NEXRAD, and optionally binds the display of NEXRAD to
   * user settings.
   *
   * Requires the module `[MapSystemKeys.Weather]: MapWxrModule`.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   * * `[GarminMapKeys.Nexrad]: MapNexradModule`
   *
   * Controllers:
   * * `[MapSystemKeys.Weather]: MapWxrController`
   * * `[GarminMapKeys.Nexrad]: MapNexradController`
   * @param mapBuilder The map builder to configure.
   * @param minRangeIndex The minimum range index, inclusive, at which NEXRAD is visible. Defaults to `0`.
   * @param settingManager A user setting manager containing settings which control NEXRAD. If not defined, NEXRAD will
   * not be controlled by user settings.
   * @param maxDeclutterMode The highest global declutter mode, inclusive, at which NEXRAD is visible. Defaults
   * to `MapDeclutterMode.Level2`. Ignored if NEXRAD user settings are not supported.
   * @param colors The color array for the NEXRAD overlay. If not defined, default colors will be applied.
   * @returns The map builder, after it has been configured.
   */
  public static nexrad<MapBuilder extends MapSystemBuilder<{ [MapSystemKeys.Weather]: MapWxrModule }>>(
    mapBuilder: MapBuilder,
    minRangeIndex = 0,
    settingManager?: UserSettingManager<Partial<MapNexradUserSettings>>,
    maxDeclutterMode?: MapDeclutterMode,
    colors?: readonly (readonly [number, number])[]
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
      .withModule(GarminMapKeys.Nexrad, () => new MapNexradModule())
      .withController<MapWxrController, MapWxrControllerModules>(MapSystemKeys.Weather, context => new MapWxrController(context))
      .withController<MapNexradController, MapNexradControllerModules>(GarminMapKeys.Nexrad, context => {
        return new MapNexradController(context, minRangeIndex, settingManager, maxDeclutterMode);
      })
      .withInit<{ [GarminMapKeys.Nexrad]: MapNexradModule }>(GarminMapKeys.Nexrad, context => {
        if (colors !== undefined) {
          context.model.getModule(GarminMapKeys.Nexrad).colors.set(colors);
        }
      });
  }

  /**
   * Configures a map builder to generate a map which displays a range ring.
   *
   * Requires the modules defined in {@link MapRangeRingLayerModules} with the exception of `'rangeRing'`.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.RangeRing]: MapRangeRingModule`
   *
   * Layers:
   * * `[GarminMapKeys.RangeRing]: MapRangeRingLayer`
   * @param mapBuilder The map builder to configure.
   * @param options Styling options for the ring.
   * @param order The order to assign to the range ring layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static rangeRing<MapBuilder extends MapSystemBuilder<Omit<MapRangeRingLayerModules, typeof GarminMapKeys.RangeRing>>>(
    mapBuilder: MapBuilder,
    options: RangeRingOptions,
    order?: number
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.RangeRing, () => new MapRangeRingModule())
      .withLayer<MapRangeRingLayer, MapRangeRingLayerModules>(GarminMapKeys.RangeRing, context => {
        return (
          <MapRangeRingLayer
            model={context.model}
            mapProjection={context.projection}
            {...options}
          />
        );
      }, order)
      .withInit<MapRangeRingLayerModules>(GarminMapKeys.RangeRing, context => { context.model.getModule(GarminMapKeys.RangeRing).show.set(true); });
  }

  /**
   * Configures a map builder to generate a map which displays a range compass. The range compass is displayed only in
   * Heading Up and Track Up orientation. If the map also supports a range ring, the range ring will be hidden while
   * the range compass is displayed.
   *
   * Requires the modules defined in {@link MapRangeCompassLayerModules} with the exception of `'rangeCompass'`.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.RangeCompass]: MapRangeCompassModule`
   *
   * Layers:
   * * `[GarminMapKeys.RangeCompass]: MapRangeCompassLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.RangeCompass]: MapRangeCompassController`
   * @param mapBuilder The map builder to configure.
   * @param options Styling options for the ring.
   * @param order The order to assign to the range compass layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static rangeCompass<
    MapBuilder extends MapSystemBuilder<Omit<MapRangeCompassLayerModules, typeof GarminMapKeys.RangeCompass>>
  >(
    mapBuilder: MapBuilder,
    options: RangeCompassOptions,
    order?: number
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.RangeCompass, () => new MapRangeCompassModule())
      .withLayer<MapRangeCompassLayer, MapRangeCompassLayerModules>(GarminMapKeys.RangeCompass, context => {
        return (
          <MapRangeCompassLayer
            model={context.model}
            mapProjection={context.projection}
            bus={context.bus}
            {...options}
          />
        );
      }, order)
      .withController<MapRangeCompassController, MapRangeCompassControllerModules>(
        GarminMapKeys.RangeCompass, context => new MapRangeCompassController(context)
      );
  }

  /**
   * Configures a map builder to generate a map which displays a crosshair at the projected target position when the
   * map is not following the player airplane. If the map does not have the module
   * `[MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule`, the map is assumed to never follow the player airplane,
   * and the crosshair will always be visible.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Crosshair]: MapCrosshairModule`
   *
   * Layers:
   * * `[GarminMapKeys.Crosshair]: MapCrosshairLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.Crosshair]: MapBindingsController`
   * @param mapBuilder The map builder to configure.
   * @returns The map builder, after it has been configured.
   */
  public static crosshair<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.Crosshair, () => new MapCrosshairModule())
      .withLayer<MapCrosshairLayer, MapCrosshairLayerModules>(GarminMapKeys.Crosshair, context => {
        return (
          <MapCrosshairLayer
            model={context.model}
            mapProjection={context.projection}
          />
        );
      })
      .withBindings<{
        [GarminMapKeys.Crosshair]: MapCrosshairModule,
        [MapSystemKeys.FollowAirplane]?: MapFollowAirplaneModule
      }>(GarminMapKeys.Crosshair, context => {
        return [{
          source: context.model.getModule(MapSystemKeys.FollowAirplane)?.isFollowing ?? Subject.create(false),
          target: context.model.getModule(GarminMapKeys.Crosshair).show,
          map: (isFollowingAirplane: boolean) => !isFollowingAirplane
        }];
      });
  }

  /**
   * Configures a map builder to generate a map which supports the display of waypoints located within the boundaries
   * of the map's projected window. Waypoints displayed in this manner are rendered by a {@link MapWaypointRenderer}
   * under the role {@link MapWaypointRenderRole.Normal}. Optionally binds the visibility of waypoints to user
   * settings.
   *
   * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
   * waypoint layer. Otherwise, a text layer will be added to the builder after the waypoint layer.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
   * * `[MapSystemKeys.WaypointRenderer]: MapWaypointRenderer`
   * * `[GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilder`
   *
   * Modules:
   * * `[MapSystemKeys.NearestWaypoints]: MapWaypointsModule`
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule` (only if user settings are supported)
   *
   * Layers:
   * * `[MapSystemKeys.NearestWaypoints]: MapWaypointsLayer`
   * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.WaypointRenderer]: MapSystemCustomController` (handles initialization and updating of the
   * waypoint renderer)
   * * `'waypointsVis': MapWaypointsVisController` (only if user settings are supported)
   * @param mapBuilder The map builder to configure.
   * @param configure A function used to configure the display and styling of waypoint icons and labels.
   * @param supportRunwayOutlines Whether to support the rendering of airport runway outlines.
   * @param settingManager A setting manager containing the user settings controlling waypoint visibility. If not
   * defined, waypoint visibility will not be bound to user settings.
   * @param order The order to assign to the waypoint layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static waypoints<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    configure: (builder: MapWaypointDisplayBuilder) => void,
    supportRunwayOutlines: boolean,
    settingManager?: UserSettingManager<Partial<MapWaypointVisUserSettings>>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withTextLayer(true)
      .withModule(MapSystemKeys.NearestWaypoints, () => new MapWaypointsModule())
      .withContext<{ [MapSystemKeys.TextManager]: MapCullableTextLabelManager }>(
        MapSystemKeys.WaypointRenderer, context => new MapWaypointRenderer(context[MapSystemKeys.TextManager])
      )
      .withContext(GarminMapKeys.WaypointDisplayBuilder, () => new MapWaypointDisplayBuilderClass());

    if (settingManager) {
      mapBuilder
        .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
        .with(GarminMapBuilder.waypointVisSettings, settingManager);
    }

    const layerCount = mapBuilder.layerCount;

    return mapBuilder
      .withLayer<MapWaypointsLayer, MapWaypointsLayerModules, { [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }>(
        MapSystemKeys.NearestWaypoints,
        (context): VNode => {
          return (
            <MapWaypointsLayer
              model={context.model}
              mapProjection={context.projection}
              bus={context.bus}
              waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
              supportRunwayOutlines={supportRunwayOutlines}
            />
          );
        },
        order
      )
      .withLayerOrder(MapSystemKeys.TextLayer, order ?? layerCount)
      .withInit<
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass }
      >('waypointsLayerDisplayConfigure', context => {
        configure(context[GarminMapKeys.WaypointDisplayBuilder]);
      })
      .withController<
        MapSystemGenericController,
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass, [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }
      >(
        MapSystemKeys.WaypointRenderer,
        context => new MapSystemGenericController(context, {
          onAfterMapRender: (): void => { context[GarminMapKeys.WaypointDisplayBuilder].apply(context[MapSystemKeys.WaypointRenderer]); },
          onAfterUpdated: (): void => { context[MapSystemKeys.WaypointRenderer].update(context.projection); }
        })
      );
  }

  /**
   * Configures a map builder to bind the visibility of waypoints to user settings.
   *
   * Requires the modules defined in {@link MapWaypointsVisControllerModules}.
   *
   * Adds the controller `[GarminMapKeys.WaypointsVisibility]: MapWaypointsVisController`.
   * @param mapBuilder The map builder to configure.
   * @param settingManager A setting manager containing the user settings controlling waypoint visibility.
   * @returns The map builder, after it has been configured.
   */
  public static waypointVisSettings<MapBuilder extends MapSystemBuilder<MapWaypointsVisControllerModules>>(
    mapBuilder: MapBuilder,
    settingManager: UserSettingManager<Partial<MapWaypointVisUserSettings>>
  ): MapBuilder {
    return mapBuilder.withController(GarminMapKeys.WaypointsVisibility, context => new MapWaypointsVisController(context, settingManager));
  }

  public static flightPlans<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: FlightPlanOptions[],
    configure: (builder: MapWaypointDisplayBuilder) => void,
    order?: number
  ): MapBuilder {
    if (options.length === 0) {
      return mapBuilder;
    }

    mapBuilder
      .withTextLayer(true)
      .withContext<{ [MapSystemKeys.TextManager]: MapCullableTextLabelManager }>(
        MapSystemKeys.WaypointRenderer, context => new MapWaypointRenderer(context[MapSystemKeys.TextManager])
      )
      .withContext(GarminMapKeys.WaypointDisplayBuilder, () => new MapWaypointDisplayBuilderClass());

    const layerCount = mapBuilder.layerCount;

    for (let i = 0; i < options.length; i++) {
      const { dataProvider, pathRenderer, drawEntirePlan } = options[i];

      mapBuilder.withLayer<MapFlightPlanLayer, any, { [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }>(`${MapSystemKeys.FlightPlan}${i}`, context => {
        return (
          <MapFlightPlanLayer
            model={context.model}
            mapProjection={context.projection}
            bus={context.bus}
            waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
            dataProvider={dataProvider}
            pathRenderer={pathRenderer}
            drawEntirePlan={typeof drawEntirePlan !== 'object' ? Subject.create(drawEntirePlan ?? false) : drawEntirePlan}
          />
        );
      }, order ?? layerCount);
    }

    return mapBuilder
      .withLayer(GarminMapKeys.FlightPlanWaypoints, context => {
        return (
          <MapSyncedCanvasLayer
            model={context.model}
            mapProjection={context.projection}
          />
        );
      }, order ?? layerCount)
      .withLayerOrder(MapSystemKeys.TextLayer, order ?? layerCount)
      .withInit<
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass }
      >('flightPlanLayerDisplayConfigure', context => {
        configure(context[GarminMapKeys.WaypointDisplayBuilder]);
      })
      .withController<
        MapSystemGenericController,
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass, [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }
      >(
        MapSystemKeys.WaypointRenderer,
        context => new MapSystemGenericController(context, {
          onAfterMapRender: (): void => { context[GarminMapKeys.WaypointDisplayBuilder].apply(context[MapSystemKeys.WaypointRenderer]); },
          onAfterUpdated: (): void => { context[MapSystemKeys.WaypointRenderer].update(context.projection); }
        })
      )
      .withController<
        MapSystemGenericController,
        any,
        { [GarminMapKeys.FlightPlanWaypoints]: MapSyncedCanvasLayer },
        any,
        { [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }
      >(
        GarminMapKeys.FlightPlanWaypoints,
        context => new MapSystemGenericController(context, {
          onAfterMapRender: (): void => {
            const fplWaypointsLayer = context.getLayer(GarminMapKeys.FlightPlanWaypoints);
            context[MapSystemKeys.WaypointRenderer].setCanvasContext(MapWaypointRenderRole.FlightPlanInactive, fplWaypointsLayer.display.context);
            context[MapSystemKeys.WaypointRenderer].setCanvasContext(MapWaypointRenderRole.FlightPlanActive, fplWaypointsLayer.display.context);
            context[MapSystemKeys.WaypointRenderer].setCanvasContext(MapWaypointRenderRole.VNav, fplWaypointsLayer.display.context);
          }
        })
      );
  }

  /**
   * Configures a map builder to generate a map which displays the active flight plan. The flight path and all
   * waypoints that are part of the flight plan are displayed. Waypoints displayed in this manner are rendered by a
   * {@link MapWaypointRenderer} under the roles {@link MapWaypointRenderRole.FlightPlanActive} or
   * {@link MapWaypointRenderRole.FlightPlanInactive}. Additionally, if VNAV is supported, TOD and BOD markers will
   * also be rendered under the role {@link MapWaypointRenderRole.VNav}.
   *
   * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
   * flight plan layers. Otherwise, a text layer will be added to the builder after the flight plan layers.
   * @param mapBuilder The map builder to configure.
   * @param flightPlanner The flight planner.
   * @param pathRenderer The flight path renderer to use to the draw the flight plan.
   * @param drawEntirePlan Whether the entire flight plan should always be drawn.
   * @param configure A function used to configure the display and styling of flight plan waypoint icons and labels.
   * @param supportFocus Whether to support flight plan focus on the primary flight plan. If focus is supported, the
   * primary flight plan will be drawn when it is focused, regardless of whether it is active. Defaults to `false`.
   * @param order The order to assign to the flight plan layers. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static activeFlightPlan<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    flightPlanner: FlightPlanner,
    pathRenderer: MapFlightPathPlanRenderer,
    drawEntirePlan: boolean | Subscribable<boolean>,
    configure: (builder: MapWaypointDisplayBuilder) => void,
    supportFocus = false,
    order?: number
  ): MapBuilder {
    if (supportFocus) {
      // Because flight plan focus still leaves the DTO random flight plan visible when it is active, we need to
      // support drawing two flight plans at the same time under those circumstances.

      const primaryPlanProvider = new MapFlightPlannerPlanDataProvider(mapBuilder.bus, flightPlanner);
      const dtoPlanProvider = new MapFlightPlannerPlanDataProvider(mapBuilder.bus, flightPlanner);

      let fplIndexSub: Subscription | undefined;
      let isFocusedSub: Subscription | undefined;

      let controller: MapSystemGenericController;

      return mapBuilder
        .with(
          GarminMapBuilder.flightPlans,
          [
            { dataProvider: primaryPlanProvider, pathRenderer, drawEntirePlan },
            { dataProvider: dtoPlanProvider, pathRenderer, drawEntirePlan: false }
          ],
          configure,
          order
        )
        .withController<MapSystemGenericController, { [GarminMapKeys.FlightPlanFocus]?: MapFlightPlanFocusModule }>(
          'activeFlightPlanProvider',
          context => controller = new MapSystemGenericController(context, {
            onAfterMapRender: (): void => {
              const focusModule = context.model.getModule(GarminMapKeys.FlightPlanFocus);

              const planProviderHandler = (): void => {
                const activePlanIndex = flightPlanner.activePlanIndex;
                const isFlightPlanFocused = focusModule?.planHasFocus.get() ?? false;

                // Show the primary plan when a DTO random is not active or when it is focused.
                primaryPlanProvider.setPlanIndex(activePlanIndex === Fms.PRIMARY_PLAN_INDEX || isFlightPlanFocused ? Fms.PRIMARY_PLAN_INDEX : -1);
                // Only show the DTO random plan when a DTO random is active.
                dtoPlanProvider.setPlanIndex(activePlanIndex === Fms.DTO_RANDOM_PLAN_INDEX ? Fms.DTO_RANDOM_PLAN_INDEX : -1);
              };

              fplIndexSub = context.bus.getSubscriber<FlightPlannerEvents>().on('fplIndexChanged').handle(planProviderHandler);
              isFocusedSub = focusModule?.planHasFocus.sub(planProviderHandler, true);
            },

            onMapDestroyed: (): void => {
              controller.destroy();
            },

            onDestroyed: (): void => {
              fplIndexSub?.destroy();
              isFocusedSub?.destroy();
            }
          })
        );
    } else {
      return mapBuilder.with(
        GarminMapBuilder.flightPlans,
        [{ dataProvider: new MapActiveFlightPlanDataProvider(mapBuilder.bus, flightPlanner), pathRenderer, drawEntirePlan }],
        configure,
        order
      );
    }
  }

  /**
   * Configures a map builder to generate a map which supports displaying a highlighted waypoint, and optionally
   * drawing a line from the highlighted waypoint to the position of the player airplane.
   *
   * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
   * highlighted waypoint layers. Otherwise, a text layer will be added to the builder after the highlighted waypoint
   * layers.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
   * * `[MapSystemKeys.WaypointRenderer]: MapWaypointRenderer`
   * * `[GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilder`
   *
   * Modules:
   * * `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule`
   *
   * Layers:
   * * `[GarminMapKeys.WaypointHighlightLine]: MapLineLayer` (only if line support is included)
   * * `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightLayer`
   * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.WaypointRenderer]: MapSystemCustomController` (handles initialization and updating of the
   * waypoint renderer)
   * @param mapBuilder The map builder to configure.
   * @param includeLine Whether to include support for drawing a line from the highlighted waypoint to the player
   * airplane.
   * @param configure A function used to configure the display and styling of highlighted waypoint icons and labels.
   * @param lineOptions Styling options for the waypoint highlight line. The default values are the same as for
   * {@link MapLineLayer}, except the `strokeDash` property defaults to `[5, 3, 2, 3]`. Ignored if `includeLine` is
   * `false`.
   * @param order The order to assign to the highlighted waypoint layers. Layers with lower assigned order will be
   * attached to the map before and appear below layers with greater assigned order values. Defaults to the number of
   * layers already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static waypointHighlight<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    includeLine: boolean,
    configure: (builder: MapWaypointDisplayBuilder) => void,
    lineOptions?: WaypointHighlightLineOptions,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withTextLayer(true)
      .withModule(GarminMapKeys.WaypointHighlight, () => new MapWaypointHighlightModule())
      .withContext<{ [MapSystemKeys.TextManager]: MapCullableTextLabelManager }>(
        MapSystemKeys.WaypointRenderer, context => new MapWaypointRenderer(context[MapSystemKeys.TextManager])
      )
      .withContext(GarminMapKeys.WaypointDisplayBuilder, () => new MapWaypointDisplayBuilderClass());

    if (includeLine) {
      const waypointLocation = new GeoPoint(0, 0);
      const waypointLocationSubject = Subject.create<LatLonInterface | null>(null);

      let waypointLocationSub: Subscription | undefined;

      let controller: MapSystemGenericController;

      mapBuilder
        .withLayer<
          MapLineLayer,
          {
            [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule,
            [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule
          }
        >(GarminMapKeys.WaypointHighlightLine, context => {
          const options = { ...lineOptions };

          options.strokeDash ??= [5, 3, 2, 3];

          return (
            <MapLineLayer
              model={context.model}
              mapProjection={context.projection}
              start={context.model.getModule(MapSystemKeys.OwnAirplaneProps).position}
              end={waypointLocationSubject}
              {...options}
            />
          );
        })
        .withController<
          MapSystemGenericController<{ [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule }>,
          { [GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule }
        >('waypointHighlightLineEndSubject', context => {
          return controller = new MapSystemGenericController(context, {
            onAfterMapRender: (contextArg): void => {
              contextArg.model.getModule(GarminMapKeys.WaypointHighlight).waypoint.sub(waypoint => {
                if (waypoint === null) {
                  waypointLocationSub?.destroy();
                  waypointLocationSub = undefined;
                  waypointLocationSubject.set(null);
                } else {
                  waypointLocationSub?.destroy();
                  waypointLocationSub = waypoint.location.sub(location => {
                    waypointLocation.set(location);
                    if (waypointLocationSubject.get() === waypointLocation) {
                      waypointLocationSubject.notify();
                    } else {
                      waypointLocationSubject.set(waypointLocation);
                    }
                  }, true);
                }
              }, true);
            },

            onMapDestroyed: (): void => {
              controller.destroy();
            },

            onDestroyed: (): void => {
              waypointLocationSub?.destroy();
            }
          });
        });
    }

    const layerCount = mapBuilder.layerCount;

    return mapBuilder
      .withLayer<MapWaypointHighlightLayer, MapWaypointHighlightLayerModules, { [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }>(
        GarminMapKeys.WaypointHighlight,
        (context): VNode => {
          return (
            <MapWaypointHighlightLayer
              model={context.model}
              mapProjection={context.projection}
              waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
            />
          );
        },
        order
      )
      .withLayerOrder(MapSystemKeys.TextLayer, order ?? layerCount)
      .withInit<
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass }
      >('waypointHighlightLayerDisplayConfigure', context => {
        configure(context[GarminMapKeys.WaypointDisplayBuilder]);
      })
      .withController<
        MapSystemGenericController,
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass, [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }
      >(
        MapSystemKeys.WaypointRenderer,
        context => new MapSystemGenericController(context, {
          onAfterMapRender: (): void => { context[GarminMapKeys.WaypointDisplayBuilder].apply(context[MapSystemKeys.WaypointRenderer]); },
          onAfterUpdated: (): void => { context[MapSystemKeys.WaypointRenderer].update(context.projection); }
        })
      );
  }

  /**
   * Configures a map builder to generate a map which displays airspaces, and optionally binds the visibility of
   * airspaces to user settings.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.AirspaceManager]: GenericAirspaceRenderManager`
   *
   * Modules:
   * * `[MapSystemKeys.Airspace]: MapAirspaceModule`
   *
   * Layers:
   * * `[MapSystemKeys.Airspace]: MapAirspaceLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.AirspaceVisibility]: MapAirspaceVisController` (only with user settings support)
   * @param mapBuilder The map builder to configure.
   * @param settingManager A setting manager containing the user settings controlling airspace visibility. If not
   * defined, airspace visibility will not be controlled by user settings.
   * @param order The order to assign to the airspace layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static airspaces<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    settingManager?: UserSettingManager<Partial<MapAirspaceVisUserSettings>>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withAirspaces(
        DefaultLodBoundaryCache.getCache(),
        GarminAirspaceShowTypeMap.MAP,
        MapAirspaceRendering.selectRenderer,
        MapAirspaceRendering.renderOrder,
        undefined,
        order
      );

    if (settingManager !== undefined) {
      mapBuilder.with(GarminMapBuilder.airspaceVisSettings, settingManager);
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to bind the visibility of airspaces to user settings.
   *
   * Requires the modules defined in {@link MapAirspaceVisControllerModules}.
   *
   * Adds the controller `[GarminMapKeys.AirspaceVisibility]: MapAirspaceVisController`.
   * @param mapBuilder The map builder to configure.
   * @param settingManager A setting manager containing the user settings controlling airspace visibility.
   * @returns The map builder, after it has been configured.
   */
  public static airspaceVisSettings<MapBuilder extends MapSystemBuilder<MapAirspaceVisControllerModules>>(
    mapBuilder: MapBuilder,
    settingManager: UserSettingManager<Partial<MapAirspaceVisUserSettings>>
  ): MapBuilder {
    return mapBuilder.withController(GarminMapKeys.AirspaceVisibility, context => new MapAirspaceVisController(context, settingManager));
  }

  /**
   * Configures a map builder to generate a map which displays TCAS intruders.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   * * `[MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule`
   * * `[MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule`
   * * `[MapSystemKeys.Traffic]: MapTrafficModule`
   * * `[GarminMapKeys.Traffic]: MapGarminTrafficModule`
   *
   * Layers:
   * * `[MapSystemKeys.Traffic]: MapSystemTrafficLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.Traffic]: MapTrafficController`
   * * `[GarminMapKeys.Traffic]: MapGarminTrafficController` (only with user settings support)
   * @param mapBuilder The map builder to configure.
   * @param trafficSystem The traffic system from which to derive intruder data.
   * @param iconOptions Configuration options for intruder icons.
   * @param useOuterRangeAsOffScale Whether to use the outer traffic range defined in {@link MapGarminTrafficModule} as
   * the off-scale traffic range.
   * @param offScaleStatus A mutable subscribable to update with the layer's off-scale traffic status.
   * @param iconFactory A function which creates intruder icons for the traffic display. If not defined, a default icon
   * of type {@link MapTrafficIntruderIcon} is created for each intruder.
   * @param initCanvasStyles A function which initializes global canvas styles for the traffic display.
   * @param trafficSettingManager A setting manager containing user settings controlling the operation of the traffic
   * system. If not defined, the display of map traffic will not be controlled by those settings.
   * @param mapSettingManager A setting manager containing user settings controlling the display of traffic on maps. If
   * not defined, the display of map traffic will not be controlled by those settings.
   * @param order The order to assign to the traffic layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static traffic<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    trafficSystem: TrafficSystem,
    iconOptions: TrafficIconOptions,
    useOuterRangeAsOffScale: boolean,
    offScaleStatus?: MutableSubscribable<MapTrafficOffScaleStatus>,
    iconFactory?: MapTrafficIntruderIconFactory,
    initCanvasStyles?: (context: CanvasRenderingContext2D) => void,
    trafficSettingManager?: UserSettingManager<Partial<TrafficUserSettingTypes>>,
    mapSettingManager?: UserSettingManager<Partial<MapTrafficUserSettings>>,
    order?: number
  ): MapBuilder {
    const canvasFont = `${iconOptions.fontSize}px ${iconOptions.font}`;

    let offScaleOobOptions: ((context: MapSystemContext<any, any, any, any>) => TrafficOffScaleOobOptions) | undefined;

    if (offScaleStatus !== undefined) {
      offScaleOobOptions = (context: MapSystemContext<any, any, any, any>): TrafficOffScaleOobOptions => {
        const offScaleIntruders = SetSubject.create<TcasIntruder>();
        const oobIntruders = SetSubject.create<TcasIntruder>();

        const alertLevelSubs = new Map<TcasIntruder, Subscription>();

        const offScaleTAs = SetSubject.create();
        const offScaleRAs = SetSubject.create();

        const handler = (set: ReadonlySet<TcasIntruder>, type: SubscribableSetEventType, intruder: TcasIntruder): void => {
          if (type === SubscribableSetEventType.Added) {
            alertLevelSubs.set(
              intruder,
              intruder.alertLevel.sub(alertLevel => {
                if (alertLevel === TcasAlertLevel.ResolutionAdvisory) {
                  offScaleRAs.add(intruder);
                  offScaleTAs.delete(intruder);
                } else if (alertLevel === TcasAlertLevel.TrafficAdvisory) {
                  offScaleTAs.add(intruder);
                  offScaleRAs.delete(intruder);
                } else {
                  offScaleTAs.delete(intruder);
                  offScaleRAs.delete(intruder);
                }
              }, true)
            );
          } else {
            alertLevelSubs.get(intruder)?.destroy();
            alertLevelSubs.delete(intruder);
            offScaleTAs.delete(intruder);
            offScaleRAs.delete(intruder);
          }
        };

        offScaleIntruders.sub(handler);
        oobIntruders.sub(handler);

        const raTAHandler = (): void => {
          if (offScaleRAs.get().size > 0) {
            offScaleStatus.set(MapTrafficOffScaleStatus.RA);
          } else if (offScaleTAs.get().size > 0) {
            offScaleStatus.set(MapTrafficOffScaleStatus.TA);
          } else {
            offScaleStatus.set(MapTrafficOffScaleStatus.None);
          }
        };

        offScaleTAs.sub(raTAHandler);
        offScaleRAs.sub(raTAHandler);

        raTAHandler();

        return {
          offScaleIntruders,
          oobIntruders,
          oobOffset: context.deadZone
        };
      };
    }

    iconFactory ??= (
      intruder,
      context: MapSystemContext<{
        [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule,
        [MapSystemKeys.FollowAirplane]: MapFollowAirplaneModule
        [MapSystemKeys.Traffic]: MapTrafficModule
        [GarminMapKeys.Traffic]: MapGarminTrafficModule
      }>
    ): MapTrafficIntruderIcon => new MapTrafficIntruderIcon(
      intruder,
      context.model.getModule(MapSystemKeys.Traffic),
      context.model.getModule(MapSystemKeys.OwnAirplaneProps),
      context.model.getModule(GarminMapKeys.Traffic),
      context.model.getModule(MapSystemKeys.FollowAirplane),
      iconOptions
    );

    initCanvasStyles ??= (canvasContext): void => {
      canvasContext.textAlign = 'center';
      canvasContext.font = canvasFont;
    };

    mapBuilder
      .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
      .withModule(MapSystemKeys.FollowAirplane, () => new MapFollowAirplaneModule())
      .withModule(GarminMapKeys.Traffic, () => new MapGarminTrafficModule(trafficSystem))
      .withTraffic(trafficSystem, iconFactory, initCanvasStyles, offScaleOobOptions, order)
      .withController<MapTrafficController, MapTrafficControllerModules>(MapSystemKeys.Traffic, context => {
        return new MapTrafficController(context, useOuterRangeAsOffScale);
      });

    if (trafficSettingManager !== undefined) {
      mapBuilder.withController<MapGarminTrafficController, MapGarminTrafficControllerModules>(
        GarminMapKeys.Traffic,
        context => new MapGarminTrafficController(context, trafficSettingManager, mapSettingManager)
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which supports multiple indexed traffic map ranges, with optional
   * support for controlling the map range with a user setting. At each range index there is an outer range and an
   * inner range, except for the first index, at which there is just an outer range. The inner range is always the
   * largest range in the range array that is less than the outer range.
   *
   * Requires the module `[GarminMapKeys.Traffic]: MapGarminTrafficModule`.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>>` (only if user setting support is enabled)
   *
   * Modules:
   * * `[GarminMapKeys.Range]: MapIndexedRangeModule`
   *
   * Controllers:
   * * `[GarminMapKeys.RangeRTR]: MapRangeRTRController`
   * * `[GarminMapKeys.TrafficRange]: TrafficMapRangeController` (can be used to control map range)
   * * `'useRangeSettingDefault': MapSystemCustomController` (only if user setting support is enabled)
   * @param mapBuilder The map builder to configure.
   * @param nauticalRangeArray The map range array to use for nautical distance mode. If not defined, a range array
   * will not automatically be set when entering nautical distance mode.
   * @param metricRangeArray The map range array to use for metric distance mode. If not defined, a range array will
   * not automatically be set when entering metric distance mode.
   * @param settingManager A setting manager containing a user setting to control the map range. If not defined, range
   * will not be controlled by a user setting.
   * @param useRangeSettingByDefault Whether the range user setting should control the map range by default. Defaults
   * to `true`. Is ignored if `settingManager` is undefined.
   * @returns The map builder, after it has been configured.
   */
  public static trafficRange<MapBuilder extends MapSystemBuilder<{ [GarminMapKeys.Traffic]: MapGarminTrafficModule }>>(
    mapBuilder: MapBuilder,
    nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[],
    settingManager?: UserSettingManager<TrafficMapRangeControllerSettings>,
    useRangeSettingByDefault = true
  ): MapBuilder {
    const useSetting = settingManager === undefined ? undefined : Subject.create(true);

    if (useSetting) {
      const defaultUseRangeSettingConsumer: ResourceConsumer<Subject<boolean>> = {
        priority: 0,

        onAcquired: (useRangeSetting): void => {
          useRangeSetting.set(useRangeSettingByDefault);
        },

        onCeded: () => { }
      };

      let useRangeSettingDefaultController: MapSystemGenericController;

      mapBuilder
        .withContext(GarminMapKeys.UseRangeSetting, () => new ResourceModerator(useSetting))
        .withController<
          MapSystemGenericController<any, any, any, { [GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>> }>,
          any, any, any,
          { [GarminMapKeys.UseRangeSetting]: ResourceModerator<Subject<boolean>> }
        >(
          'useRangeSettingDefault',
          context => useRangeSettingDefaultController = new MapSystemGenericController(context, {
            onAfterMapRender: (contextArg): void => {
              contextArg[GarminMapKeys.UseRangeSetting].claim(defaultUseRangeSettingConsumer);
            },

            onMapDestroyed: (): void => {
              useRangeSettingDefaultController.destroy();
            },

            onDestroyed: (contextArg): void => {
              contextArg[GarminMapKeys.UseRangeSetting].forfeit(defaultUseRangeSettingConsumer);
            }
          })
        );
    }

    return mapBuilder
      .withModule(GarminMapKeys.Range, () => new MapIndexedRangeModule())
      .withController<MapRangeRTRController, MapRangeRTRControllerModules>(GarminMapKeys.RangeRTR, context => new MapRangeRTRController(context))
      .withController<TrafficMapRangeController, TrafficMapRangeControllerModules>(GarminMapKeys.TrafficRange, context => {
        return new TrafficMapRangeController(
          context,
          nauticalRangeArray,
          metricRangeArray,
          settingManager,
          useSetting
        );
      });
  }

  /**
   * Configures a map builder to generate a map which displays traffic range rings. There are two rings: an outer and
   * an inner ring. Each ring has tick marks at the 12 clock positions, with major ticks at the 4 cardinal positions.
   * Each ring also has an optional label which displays the range marked by the ring.
   *
   * Requires the modules defined in {@link TrafficMapRangeLayerModules}.
   *
   * Adds the layer `[GarminMapKeys.TrafficRange]: TrafficMapRangeLayer`.
   * @param mapBuilder The map builder to configure.
   * @param ringOptions Styling options for the rings.
   * @param order The order to assign to the ring layer. Layers with lower assigned order will be attached to the map
   * before and appear below layers with greater assigned order values. Defaults to the number of layers already added
   * to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static trafficRangeRings<MapBuilder extends MapSystemBuilder<TrafficMapRangeLayerModules>>(
    mapBuilder: MapBuilder,
    ringOptions?: TrafficRangeRingOptions,
    order?: number
  ): MapBuilder {
    return mapBuilder.withLayer(GarminMapKeys.TrafficRange, context => {
      return (
        <TrafficMapRangeLayer
          model={context.model}
          mapProjection={context.projection}
          {...ringOptions}
        />
      );
    }, order);
  }

  /**
   * Configures a map builder to generate a map with pointer support. Activating the pointer allows the pointer to
   * control map panning and stops the map from actively rotating.
   *
   * If map target and rotation control resource moderators exist on the map context, the pointer RTR controller will
   * attempt to claim those resources with a priority of `100`. Otherwise, the controller assumes nothing else controls
   * the map target or rotation.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.Pointer]: MapPointerModule`
   *
   * Layers:
   * * `[GarminMapKeys.Pointer]: MapPointerLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.Pointer]: MapPointerController` (can be used to control the behavior of the pointer)
   * * `[GarminMapKeys.PointerRTR]: MapPointerRTRController`
   * @param mapBuilder The map builder to configure.
   * @param pointerBoundsOffset The offset of the boundary surrounding the area in which the pointer can freely move,
   * from the edge of the projected map, excluding the dead zone, or a subscribable which provides it. Expressed as
   * `[left, top, right, bottom]`, relative to the width and height, as appropriate, of the projected map window. A
   * positive offset is directed toward the center of the map.
   * @param icon The pointer icon to render, as a VNode. If not default, a default icon will be rendered.
   * @param order The order to assign to the pointer layer. Layers with lower assigned order will be attached to the
   * map before and appear below layers with greater assigned order values. Defaults to the number of layers already
   * added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static pointer<MapBuilder extends MapSystemBuilder<any, any, any, MapPointerRTRControllerContext>>(
    mapBuilder: MapBuilder,
    pointerBoundsOffset: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    icon?: VNode,
    order?: number
  ): MapBuilder {
    return mapBuilder
      .withModule(GarminMapKeys.Pointer, () => new MapPointerModule())
      .withLayer<MapPointerLayer, MapPointerLayerModules>(GarminMapKeys.Pointer, (context): VNode => {
        return (
          <MapPointerLayer model={context.model} mapProjection={context.projection}>
            {icon}
          </MapPointerLayer>
        );
      }, order)
      .withController<MapPointerController, MapPointerControllerModules>(GarminMapKeys.Pointer, context => new MapPointerController(context))
      .withController<MapPointerRTRController, MapPointerRTRControllerModules, any, any, MapPointerRTRControllerContext>(
        GarminMapKeys.PointerRTR,
        context => {
          return new MapPointerRTRController(
            context,
            'isSubscribable' in pointerBoundsOffset ? pointerBoundsOffset : Subject.create(pointerBoundsOffset)
          );
        }
      );
  }

  /**
   * Configures a map builder to generate a map which displays a pointer information box when the pointer is active.
   *
   * Requires the modules defined in {@link MapPointerInfoLayerModules}.
   *
   * Adds the layer `[GarminMapKeys.PointerInfo]: MapPointerInfoLayer`.
   * @param mapBuilder The map builder to configure.
   * @param size The size of the pointer information box.
   * @param order The order to assign to the pointer information layer. Layers with lower assigned order will be
   * attached to the map before and appear below layers with greater assigned order values. Defaults to the number of
   * layers already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static pointerInfo<MapBuilder extends MapSystemBuilder<MapPointerInfoLayerModules>>(
    mapBuilder: MapBuilder,
    size: MapPointerInfoLayerSize,
    order?: number
  ): MapBuilder {
    return mapBuilder.withLayer(GarminMapKeys.PointerInfo, (context): VNode => {
      return (
        <MapPointerInfoLayer
          model={context.model}
          mapProjection={context.projection}
          size={size}
        />
      );
    }, order);
  }

  /**
   * Configures the map builder to generate a map which supports flight plan focus. Flight plan focus automatically
   * adjusts the map's target and range to place a portion of a flight plan into view.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule`
   *
   * Controllers:
   * * `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusRTRController`
   * @param mapBuilder The map builder to configure.
   * @param nominalFocusMargins A subscribable which provides the nominal focus margins, as
   * `[left, top, right, bottom]` in pixels. The nominal margins define the offset of the boundaries of the focus
   * region relative to the map's projected window, *excluding* the dead zone. Positive values represent offsets
   * toward the center of the window. When the flight plan is focused, the focused elements of the plan are guaranteed
   * to be contained within the focus region.
   * @param defaultFocusRangeIndex The default map range index to apply when the flight plan focus consists of only a
   * single point in space.
   * @param focusDebounceDelay The debounce delay, in milliseconds, to apply to focus target calculations when the
   * flight plan focus changes. Defaults to 500 milliseconds.
   * @returns The map builder, after it has been configured.
   */
  public static flightPlanFocus<
    MapBuilder extends MapSystemBuilder<
      Omit<MapFlightPlanFocusRTRControllerModules, typeof GarminMapKeys.FlightPlanFocus>,
      any, any,
      MapFlightPlanFocusRTRControllerContext
    >
  >(
    mapBuilder: MapBuilder,
    nominalFocusMargins?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>,
    defaultFocusRangeIndex = 0,
    focusDebounceDelay = 500
  ): MapBuilder {
    const definedNominalFocusMargins = nominalFocusMargins ?? Subject.create(VecNMath.create(4));

    return mapBuilder
      .withModule(GarminMapKeys.FlightPlanFocus, () => new MapFlightPlanFocusModule())
      .withController<
        MapFlightPlanFocusRTRController,
        MapFlightPlanFocusRTRControllerModules,
        any, any,
        MapFlightPlanFocusRTRControllerContext
      >(GarminMapKeys.FlightPlanFocus, context => {
        return new MapFlightPlanFocusRTRController(
          context,
          'isSubscribable' in definedNominalFocusMargins ? definedNominalFocusMargins : Subject.create(definedNominalFocusMargins),
          defaultFocusRangeIndex,
          focusDebounceDelay
        );
      });
  }

  /**
   * Configures a map builder to generate a map with an altitude intercept arc, and optionally binds the display of the
   * arc to a user setting.
   *
   * Adds the following...
   *
   * Modules:
   * * `[MapSystemKeys.AltitudeArc]: MapAltitudeArcModule`
   *
   * Layers:
   * * `[MapSystemKeys.AltitudeArc]: MapAltitudeArcLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.AltitudeArc]: MapBindingsController` (only if user settings are supported)
   * @param mapBuilder The map builder to configure.
   * @param options Options for the arc.
   * @param settingManager A setting manager containing user settings used to control the display of the arc. If not
   * defined, the display of the arc will not be bound to user settings.
   * @param order The order to assign to the altitude arc layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static altitudeArc<MapBuilder extends MapSystemBuilder<Omit<MapAltitudeArcLayerModules, typeof MapSystemKeys.AltitudeArc>>>(
    mapBuilder: MapBuilder,
    options: AltitudeArcOptions,
    settingManager?: UserSettingManager<{ 'mapAltitudeArcShow'?: boolean }>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withModule(MapSystemKeys.AltitudeArc, () => new MapAltitudeArcModule())
      .withLayer<MapAltitudeArcLayer, MapAltitudeArcLayerModules>(MapSystemKeys.AltitudeArc, context => {
        return (
          <MapAltitudeArcLayer
            model={context.model}
            mapProjection={context.projection}
            {...options}
          />
        );
      }, order);

    if (settingManager?.tryGetSetting('mapAltitudeArcShow') !== undefined) {
      mapBuilder.withBindings<MapAltitudeArcLayerModules>(MapSystemKeys.AltitudeArc, context => {
        return [
          {
            source: settingManager.getSetting('mapAltitudeArcShow'),
            target: context.model.getModule(MapSystemKeys.AltitudeArc).show
          }
        ];
      });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map with a track vector, and optionally binds the display options of the
   * vector to user settings.
   *
   * Adds the following...
   *
   * Modules:
   * * `[GarminMapKeys.TrackVector]: MapTrackVectorModule`
   *
   * Layers:
   * * `[GarminMapKeys.TrackVector]: MapTrackVectorLayer`
   *
   * Controllers:
   * * `[GarminMapKeys.TrackVector]: MapBindingsController` (only if user settings are supported)
   * @param mapBuilder The map builder to configure.
   * @param options Options for the track vector.
   * @param settingManager A setting manager containing user settings used to control the track vector. If not defined,
   * the track vector will not be bound to user settings.
   * @param order The order to assign to the track vector layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static trackVector<MapBuilder extends MapSystemBuilder<Omit<MapTrackVectorLayerModules, typeof GarminMapKeys.TrackVector>>>(
    mapBuilder: MapBuilder,
    options: TrackVectorOptions,
    settingManager?: UserSettingManager<{ 'mapTrackVectorShow'?: boolean, 'mapTrackVectorLookahead'?: number }>,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withModule(GarminMapKeys.TrackVector, () => new MapTrackVectorModule())
      .withLayer<MapTrackVectorLayer, MapTrackVectorLayerModules>(GarminMapKeys.TrackVector, context => {
        return (
          <MapTrackVectorLayer
            model={context.model}
            mapProjection={context.projection}
            {...options}
          />
        );
      }, order);

    const showSetting = settingManager?.tryGetSetting('mapTrackVectorShow');
    const lookaheadSetting = settingManager?.tryGetSetting('mapTrackVectorLookahead');

    if (showSetting !== undefined || lookaheadSetting !== undefined) {
      mapBuilder.withBindings<MapTrackVectorLayerModules>(GarminMapKeys.TrackVector, context => {
        const seconds = UnitType.SECOND.createNumber(0);

        const bindings: MapBinding[] = [];

        if (showSetting !== undefined) {
          bindings.push({
            source: showSetting,
            target: context.model.getModule(GarminMapKeys.TrackVector).show
          });
        }

        if (lookaheadSetting !== undefined) {
          bindings.push({
            source: lookaheadSetting,
            target: context.model.getModule(GarminMapKeys.TrackVector).lookaheadTime,
            map: (source: number) => seconds.set(source)
          });
        }

        return bindings;
      });
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a map which displays a miniature compass.
   *
   * Adds the layer `GarminMapKeys.MiniCompass: MapMiniCompassLayer`.
   * @param mapBuilder The map builder to configure.
   * @param imgSrc The URI of the mini-compass's image asset.
   * @param order The order to assign to the mini-compass layer. Layers with lower assigned order will be attached to
   * the map before and appear below layers with greater assigned order values. Defaults to the number of layers
   * already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static miniCompass<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    imgSrc: string,
    order?: number
  ): MapBuilder {
    return mapBuilder.withLayer(GarminMapKeys.MiniCompass, context => {
      return (
        <MapMiniCompassLayer
          model={context.model}
          mapProjection={context.projection}
          imgSrc={imgSrc}
        />
      );
    }, order);
  }

  /**
   * Configures a map builder to generate a map which supports a flight plan procedure preview.
   *
   * If a text layer has already been added to the builder, its order will be changed so that it is rendered above the
   * highlighted waypoint layers. Otherwise, a text layer will be added to the builder after the highlighted waypoint
   * layers.
   *
   * Adds the following...
   *
   * Context properties:
   * * `[MapSystemKeys.TextManager]: MapCullableTextLabelManager`
   * * `[MapSystemKeys.WaypointRenderer]: MapWaypointRenderer`
   * * `[GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilder`
   *
   * Modules:
   * * `[GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule`
   *
   * Layers:
   * * `[GarminMapKeys.ProcedurePreview]: MapProcedurePreviewLayer`
   * * `[MapSystemKeys.TextLayer]: MapCullableTextLayer`
   *
   * Controllers:
   * * `[MapSystemKeys.WaypointRenderer]: MapSystemCustomController` (handles initialization and updating of the
   * waypoint renderer)
   * @param mapBuilder The map builder to configure.
   * @param pathRenderer The flight path renderer to use to render the procedure preview.
   * @param configure A function used to configure the display and styling of procedure preview waypoint icons and
   * labels.
   * @param order The order to assign to the highlighted waypoint layers. Layers with lower assigned order will be
   * attached to the map before and appear below layers with greater assigned order values. Defaults to the number of
   * layers already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static procPreview<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    pathRenderer: MapFlightPathProcRenderer,
    configure: (builder: MapWaypointDisplayBuilder) => void,
    order?: number
  ): MapBuilder {
    mapBuilder
      .withTextLayer(true)
      .withModule(GarminMapKeys.ProcedurePreview, () => new MapProcedurePreviewModule())
      .withContext<{ [MapSystemKeys.TextManager]: MapCullableTextLabelManager }>(
        MapSystemKeys.WaypointRenderer, context => new MapWaypointRenderer(context[MapSystemKeys.TextManager])
      )
      .withContext(GarminMapKeys.WaypointDisplayBuilder, () => new MapWaypointDisplayBuilderClass());

    const layerCount = mapBuilder.layerCount;

    return mapBuilder
      .withLayer<MapProcedurePreviewLayer, MapProcedurePreviewLayerModules, { [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }>(
        GarminMapKeys.ProcedurePreview,
        (context): VNode => {
          return (
            <MapProcedurePreviewLayer
              model={context.model}
              mapProjection={context.projection}
              bus={context.bus}
              waypointRenderer={context[MapSystemKeys.WaypointRenderer]}
              pathRenderer={pathRenderer}
            />
          );
        },
        order
      )
      .withLayerOrder(MapSystemKeys.TextLayer, order ?? layerCount)
      .withInit<
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass }
      >('procPreviewLayerDisplayConfigure', context => {
        configure(context[GarminMapKeys.WaypointDisplayBuilder]);
      })
      .withController<
        MapSystemGenericController,
        any, any, any,
        { [GarminMapKeys.WaypointDisplayBuilder]: MapWaypointDisplayBuilderClass, [MapSystemKeys.WaypointRenderer]: MapWaypointRenderer }
      >(
        MapSystemKeys.WaypointRenderer,
        context => new MapSystemGenericController(context, {
          onAfterMapRender: (): void => { context[GarminMapKeys.WaypointDisplayBuilder].apply(context[MapSystemKeys.WaypointRenderer]); },
          onAfterUpdated: (): void => { context[MapSystemKeys.WaypointRenderer].update(context.projection); }
        })
      );
  }

  /**
   * Configures a map builder to include an indicator group.
   * @param mapBuilder The map builder to configure.
   * @param key The key of the indicator group.
   * @param indicatorFactories An array of functions which create the indicators. The order of functions in the array
   * determines the order in which the created indicators will be added to the group.
   * @param callbacks Optional callback functions to register with the indicator group.
   * @param cssClass The CSS class(es) to apply to the root of the indicator group.
   * @param order The order to assign to the layer containing the indicator group. Layers with lower assigned order
   * will be attached to the map before and appear below layers with greater assigned order values. Defaults to the
   * number of layers already added to the map builder.
   * @returns The map builder, after it has been configured.
   */
  public static indicatorGroup<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    key: string,
    indicatorFactories: ReadonlyArray<
      (context: MapBuilder extends MapSystemBuilder<infer M, infer L, infer C, infer Context> ? MapSystemContext<M, L, C, Context> : never) => VNode
    >,
    callbacks?: IndicatorGroupCallbacks,
    cssClass?: string | SubscribableSet<string>,
    order?: number
  ): MapBuilder {
    return mapBuilder.withLayer(key, context => {
      return (
        <MapGenericLayer model={context.model} mapProjection={context.projection} {...callbacks} class={cssClass}>
          {indicatorFactories.map(factory => factory(context as any))}
        </MapGenericLayer>
      );
    }, order);
  }
}