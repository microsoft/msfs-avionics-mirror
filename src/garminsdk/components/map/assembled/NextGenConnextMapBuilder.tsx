/* eslint-disable jsdoc/require-jsdoc */
import {
  FlightPlanner, FSComponent, MapDataIntegrityModule, MapIndexedRangeModule, MapOwnAirplanePropsKey, MappedSubject, MapSystemBuilder, MapSystemContext,
  MapSystemKeys, MapTerrainColorsModule, MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, Subject, Subscribable, UnitFamily, UnitType,
  UserSettingManager, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { WeatherMapUserSettingTypes } from '../../../settings/WeatherMapUserSettings';
import { WindDataProvider } from '../../../wind/WindDataProvider';
import { MapGarminAutopilotPropsKey } from '../controllers';
import { DefaultFlightPathPlanRenderer } from '../flightplan';
import { GarminMapBuilder, RangeCompassOptions, RangeRingOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import {
  MapBannerIndicator, MapOrientationIndicator
} from '../indicators';
import { MapDeadReckoningLayer, MapPointerInfoLayerSize } from '../layers';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapRunwayDesignationImageCache } from '../MapRunwayDesignationImageCache';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { NextGenMapWaypointStyles } from '../MapWaypointStyles';
import {
  MapFlightPlanFocusModule, MapOrientation, MapOrientationModule, MapPointerModule, MapUnitsModule
} from '../modules';
import { NextGenGarminMapBuilder } from '../NextGenGarminMapBuilder';

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin Connext weather map.
 */
export type NextGenConnextMapOptions = {
  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the map's Bing Map instance. Defaults to 0. */
  bingDelay?: number;

  /** The frequency, in hertz, with which player airplane and autopilot properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /** The image cache from which to retrieve waypoint icon images. */
  waypointIconImageCache: WaypointIconImageCache;

  /** The font type to use for waypoint labels. */
  waypointStyleFontType: 'Roboto' | 'DejaVu';

  /** The scaling factor of waypoint icons and labels. Defaults to `1`. */
  waypointStyleScale?: number;

  /**
   * The nominal projected target offset of the map for each orientation mode, as `[x, y]`, where each component is
   * expressed relative to the width or height of the map's projected window, *excluding* the dead zone. Defaults to
   * the following:
   * ```
   * {
   *   [MapOrientation.NorthUp]: [0, 0],
   *   [MapOrientation.HeadingUp]: [0, 0.17],
   *   [MapOrientation.TrackUp]: [0, 0.17]
   * }
   * ```
   */
  targetOffsets?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>;

  /**
   * The range endpoints of the map for each orientation mode, as `[x1, y1, x2, y2]`, where each component is expressed
   * relative to the width or height of the map's projected window, *excluding* the dead zone. Defaults to the
   * following:
   * ```
   * {
   *   [MapOrientation.NorthUp]: [0.5, 0.5, 0.5, 0.25],
   *   [MapOrientation.HeadingUp]: [0.5, 0.67, 0.5, 0.33],
   *   [MapOrientation.TrackUp]: [0.5, 0.67, 0.5, 0.33]
   * }
   * ```
   */
  rangeEndpoints?: Partial<Record<MapOrientation, ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>>>;

  /** The map range array to use for nautical units mode. Defaults to a standard range array. */
  nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** The map range array to use for metric units mode. Defaults to a standard range array. */
  metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** Whether to support data integrity state. Defaults to `true`. */
  supportDataIntegrity?: boolean;

  /** The URI of the no-heading player airplane icon's image asset, or a subscribable which provides it. */
  noHeadingAirplaneIconSrc?: string | Subscribable<string>;

  /**
   * The point on the no-heading player airplane icon that is anchored to the airplane's position, or a subscribable
   * which provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with [0, 0] at the
   * top left and [1, 1] at the bottom right.
   */
  noHeadingAirplaneIconAnchor?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The text of the banner that is displayed when GPS position is not available. Defaults to `'NO GPS POSITION'`. */
  noGpsBannerText?: string;

  /** Styling options for the range ring. */
  rangeRingOptions: RangeRingOptions;

  /** Styling options for the range compass. */
  rangeCompassOptions: RangeCompassOptions;

  /** Whether to display airport runway outlines. Defaults to `false`. */
  includeRunwayOutlines?: boolean;

  /**
   * The image cache from which to retrieve runway designation images. If not defined, runway designations will not be
   * rendered. Ignored if `includeRunwayOutlines` is `false`.
   */
  runwayDesignationImageCache?: MapRunwayDesignationImageCache;

  /** Whether to display airspaces. Defaults to `true`. */
  includeAirspaces?: boolean;

  /** The URI of the player airplane icon's image asset */
  airplaneIconSrc: string | Subscribable<string>;

  /** The size of the player airplane icon, in pixels. */
  airplaneIconSize: number;

  /**
   * The point on the player airplane icon that is anchored to the airplane's position, or a subscribable which
   * provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with [0, 0] at the top
   * left and [1, 1] at the bottom right.
   */
  airplaneIconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The flight planner containing the active flight plan. Required to display the active flight plan. */
  flightPlanner?: FlightPlanner;

  /** Whether to include the track vector display. Defaults to `true`. */
  includeTrackVector?: boolean;

  /** Whether to include the altitude intercept arc display. Defaults to `true`. */
  includeAltitudeArc?: boolean;

  /** Whether to include the wind vector display. Defaults to `true`. Ignored if `windDataProvider` is not defined. */
  includeWindVector?: boolean;

  /** A provider of wind data for the wind vector. Required to display the wind vector. */
  windDataProvider?: WindDataProvider;

  /**
   * The offset of the boundary surrounding the area in which the pointer can freely move, from the edge of the
   * projected map, excluding the dead zone, or a subscribable which provides it. Expressed as
   * `[left, top, right, bottom]`, relative to the width and height, as appropriate, of the projected map window. A
   * positive offset is directed toward the center of the map. Required to support the map pointer.
   */
  pointerBoundsOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The size of the pointer information box. Required to display the pointer information box. Ignored if the map
   * pointer is not supported.
   */
  pointerInfoSize?: MapPointerInfoLayerSize;

  /** The URI of the mini-compass's image asset. Required to display the mini-compass. */
  miniCompassImgSrc?: string;

  /** Whether to include an orientation indicator. Defaults to `true`. */
  includeOrientationIndicator?: boolean;

  /** Whether to include a map range indicator. Defaults to `false`. */
  includeRangeIndicator?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<MapUserSettingTypes & WeatherMapUserSettingTypes>>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

  /** Whether the map's range should be controlled by user setting by default. Defaults to `true`. */
  useRangeUserSettingByDefault?: boolean;

  /** Whether to bind map orientation to user settings. Defaults to `true`. Ignored if `settingManager` is not defined. */
  useOrientationUserSettings?: boolean;

  /**
   * The minimum range index, inclusive, at which the radar overlay is visible.
   */
  radarOverlayMinRangeIndex?: number;

  /**
   * Whether to bind the display of the radar overlay to user settings. Defaults to `true`. Ignored if `settingManager`
   * is not defined.
   */
  useRadarOverlayUserSettings?: boolean;

  /**
   * Whether to bind waypoint visibility to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useWaypointVisUserSettings?: boolean;

  /**
   * Whether to bind airspace visibility to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useAirspaceVisUserSettings?: boolean;

  /**
   * Whether to bind track vector options to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useTrackVectorUserSettings?: boolean;

  /**
   * Whether to bind altitude intercept arc options to user settings. Defaults to `true`. Ignored if `settingManager`
   * is not defined.
   */
  useAltitudeArcUserSettings?: boolean;

  /**
   * Whether to bind wind vector options to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useWindVectorUserSettings?: boolean;
}

/**
 * Builds next-generation (NXi, G3000, etc) Garmin Connext weather maps.
 */
export class NextGenConnextMapBuilder {
  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin Connext weather map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If the map pointer is supported, the controller `[GarminMapKeys.Pointer]: MapPointerController` is added to the
   * map context and can be used to control the pointer.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static build<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenConnextMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.targetOffsets ??= {};
    options.targetOffsets[MapOrientation.NorthUp] ??= Vec2Math.create();
    options.targetOffsets[MapOrientation.HeadingUp] ??= Vec2Math.create(0, 0.17);
    options.targetOffsets[MapOrientation.TrackUp] ??= Vec2Math.create(0, 0.17);

    options.rangeEndpoints ??= {};
    options.rangeEndpoints[MapOrientation.NorthUp] ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0.25);
    options.rangeEndpoints[MapOrientation.HeadingUp] ??= VecNMath.create(4, 0.5, 0.67, 0.5, 0.33);
    options.rangeEndpoints[MapOrientation.TrackUp] ??= VecNMath.create(4, 0.5, 0.67, 0.5, 0.33);

    options.supportDataIntegrity ??= true;

    options.useRangeUserSettingByDefault ??= true;

    options.useOrientationUserSettings ??= true;

    options.radarOverlayMinRangeIndex ??= 13;
    options.useRadarOverlayUserSettings ??= true;

    options.rangeRingOptions.labelRadial ??= 225;

    options.includeAirspaces ??= true;
    options.useAirspaceVisUserSettings ??= true;

    options.includeRunwayOutlines ??= false;

    options.useWaypointVisUserSettings ??= true;

    options.includeTrackVector ??= true;
    options.useTrackVectorUserSettings ??= true;

    options.includeAltitudeArc ??= true;
    options.useAltitudeArcUserSettings ??= true;

    options.includeWindVector ??= true;
    options.useWindVectorUserSettings ??= true;

    options.includeOrientationIndicator ??= true;
    options.includeRangeIndicator ??= false;

    mapBuilder
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Nautical),
        options.metricRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Metric),
        options.settingManager,
        options.useRangeUserSettingByDefault
      )
      .with(GarminMapBuilder.weatherOrientation,
        options.targetOffsets,
        options.rangeEndpoints,
        options.useOrientationUserSettings ? options.settingManager : undefined
      )
      .withBing(options.bingId, options.bingDelay)
      .withInit<{
        [MapSystemKeys.TerrainColors]: MapTerrainColorsModule,
      }>(GarminMapKeys.Terrain, context => {
        const def = MapUtils.noTerrainEarthColors();
        const terrainColorsModule = context.model.getModule(MapSystemKeys.TerrainColors);
        terrainColorsModule.colorsElevationRange.set(def.elevationRange);
        terrainColorsModule.colors.set(def.colors);
      })
      .with(GarminMapBuilder.nexrad,
        options.radarOverlayMinRangeIndex,
        options.useRadarOverlayUserSettings ? options.settingManager : undefined,
        undefined,
        MapUtils.connextPrecipRadarColors()
      );

    if (options.includeAirspaces) {
      mapBuilder.with(GarminMapBuilder.airspaces, options.useAirspaceVisUserSettings ? options.settingManager : undefined);
    }

    mapBuilder.with(NextGenGarminMapBuilder.waypoints,
      (builder: MapWaypointDisplayBuilder): void => {
        builder.withNormalStyles(
          options.waypointIconImageCache,
          NextGenMapWaypointStyles.normalIconStyles(1, options.waypointStyleScale),
          NextGenMapWaypointStyles.normalLabelStyles(1, options.waypointStyleFontType, options.waypointStyleScale),
          NextGenMapWaypointStyles.runwayOutlineIconStyles(1),
          options.runwayDesignationImageCache
        );
      },
      options.includeRunwayOutlines,
      options.useWaypointVisUserSettings ? options.settingManager : undefined
    );

    if (options.flightPlanner) {
      mapBuilder.with(GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
        new DefaultFlightPathPlanRenderer(),
        false,
        (builder): void => {
          builder
            .withFlightPlanInactiveStyles(
              options.waypointIconImageCache,
              NextGenMapWaypointStyles.flightPlanIconStyles(false, 2, options.waypointStyleScale),
              NextGenMapWaypointStyles.flightPlanLabelStyles(false, 2, options.waypointStyleFontType, options.waypointStyleScale)
            )
            .withFlightPlanActiveStyles(
              options.waypointIconImageCache,
              NextGenMapWaypointStyles.flightPlanIconStyles(true, 3, options.waypointStyleScale),
              NextGenMapWaypointStyles.flightPlanLabelStyles(true, 3, options.waypointStyleFontType, options.waypointStyleScale)
            )
            .withVNavStyles(
              options.waypointIconImageCache,
              NextGenMapWaypointStyles.vnavIconStyles(4, options.waypointStyleScale),
              NextGenMapWaypointStyles.vnavLabelStyles(4, options.waypointStyleFontType, options.waypointStyleScale)
            );
        }
      );
    }

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        false,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            options.waypointIconImageCache,
            NextGenMapWaypointStyles.highlightIconStyles(5, options.waypointStyleScale),
            NextGenMapWaypointStyles.highlightLabelStyles(5, options.waypointStyleFontType, options.waypointStyleScale)
          );
        }
      );

    mapBuilder
      .with(GarminMapBuilder.rangeRing, options.rangeRingOptions)
      .with(GarminMapBuilder.rangeCompass, options.rangeCompassOptions);

    if (options.includeTrackVector) {
      mapBuilder.with(GarminMapBuilder.trackVector,
        {
          arcTurnRateThreshold: 0.25,
          arcMaxLookaheadTime: UnitType.SECOND.createNumber(60)
        },
        options.useTrackVectorUserSettings ? options.settingManager : undefined
      );
    }

    if (options.includeAltitudeArc) {
      mapBuilder.with(GarminMapBuilder.altitudeArc,
        {
          renderMethod: 'svg',
          verticalSpeedPrecision: UnitType.FPM.createNumber(50),
          verticalSpeedThreshold: UnitType.FPM.createNumber(150),
          altitudeDeviationThreshold: UnitType.FOOT.createNumber(150)
        },
        options.useAltitudeArcUserSettings ? options.settingManager : undefined
      );
    }

    mapBuilder.with(GarminMapBuilder.crosshair);

    let airplaneIconSrc = options.airplaneIconSrc;
    let airplaneIconAnchor = options.airplaneIconAnchor;
    if (options.supportDataIntegrity && options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
      airplaneIconSrc = Subject.create('');
      airplaneIconAnchor = Vec2Subject.create(Vec2Math.create());
    }

    const airplanePropBindings: MapOwnAirplanePropsKey[] = [
      'position', 'hdgTrue', 'magVar', 'isOnGround',
      ...(
        options.includeTrackVector || options.includeAltitudeArc
          ? ['groundSpeed', 'trackTrue']
          : []
      ) as MapOwnAirplanePropsKey[],
      ...(
        options.includeTrackVector
          ? ['turnRate']
          : []
      ) as MapOwnAirplanePropsKey[],
      ...(
        options.includeAltitudeArc
          ? ['altitude', 'verticalSpeed']
          : []
      ) as MapOwnAirplanePropsKey[]
    ];

    mapBuilder
      .withOwnAirplaneIcon(options.airplaneIconSize, airplaneIconSrc, airplaneIconAnchor)
      .withOwnAirplanePropBindings(airplanePropBindings, options.dataUpdateFreq)
      .withFollowAirplane();

    const autopilotPropBindings: MapGarminAutopilotPropsKey[] = [
      'selectedHeading', 'manualHeadingSelect',
      ...(
        options.includeAltitudeArc
          ? ['selectedAltitude']
          : []
      ) as MapGarminAutopilotPropsKey[]
    ];

    mapBuilder.with(GarminMapBuilder.autopilotProps, autopilotPropBindings, options.dataUpdateFreq);

    if (options.supportDataIntegrity) {
      mapBuilder.withLayer(GarminMapKeys.DeadReckoning, context => {
        return (
          <MapDeadReckoningLayer
            model={context.model}
            mapProjection={context.projection}
            airplaneIconSize={options.airplaneIconSize}
            airplaneIconAnchor={airplaneIconAnchor}
          />
        );
      });
    }

    if (options.miniCompassImgSrc !== undefined) {
      mapBuilder.with(GarminMapBuilder.miniCompass, options.miniCompassImgSrc);
    }

    if (options.includeWindVector && options.windDataProvider) {
      mapBuilder.with(GarminMapBuilder.windVector,
        options.windDataProvider,
        options.useWindVectorUserSettings ? options.settingManager : undefined
      );
    }

    // Top-left indicators
    if (options.includeOrientationIndicator || options.includeRangeIndicator) {
      const orientationRef = FSComponent.createRef<MapOrientationIndicator>();
      const rangeRef = FSComponent.createRef<MapRangeDisplay>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeOrientationIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Orientation]: MapOrientationModule,
            [GarminMapKeys.Pointer]?: MapPointerModule,
            [GarminMapKeys.FlightPlanFocus]?: MapFlightPlanFocusModule
          }>): VNode => {
            const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
            const pointerModule = context.model.getModule(GarminMapKeys.Pointer);
            const focusModule = context.model.getModule(GarminMapKeys.FlightPlanFocus);

            const isVisible = MappedSubject.create(
              ([isPointerActive, isFocusActive]): boolean => !isPointerActive && !isFocusActive,
              pointerModule?.isActive ?? Subject.create(false),
              focusModule?.isActive ?? Subject.create(false)
            );

            return (
              <MapOrientationIndicator
                ref={orientationRef}
                orientation={orientationModule.orientation}
                text={{
                  [MapOrientation.NorthUp]: 'NORTH UP',
                  [MapOrientation.HeadingUp]: 'HDG UP',
                  [MapOrientation.TrackUp]: 'TRK UP',
                }}
                isVisible={isVisible}
              />
            );
          }
        );
      }

      if (options.includeRangeIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Range]: MapIndexedRangeModule,
            [GarminMapKeys.Units]: MapUnitsModule
          }>): VNode => {
            const rangeModule = context.model.getModule(GarminMapKeys.Range);
            const unitsModule = context.model.getModule(GarminMapKeys.Units);

            return (
              <MapRangeDisplay
                ref={rangeRef}
                range={rangeModule.nominalRange}
                displayUnit={unitsModule.distanceLarge}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopLeftIndicators,
        factories,
        {
          onDetached: () => {
            orientationRef.getOrDefault()?.destroy();
            rangeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-left'
      );
    }

    // Center indicators
    if (options.supportDataIntegrity) {
      const noGpsRef = FSComponent.createRef<MapBannerIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.supportDataIntegrity) {
        factories.push(
          (context: MapSystemContext<{
            [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule
          }>): VNode => {
            const dataIntegrityModule = context.model.getModule(MapSystemKeys.DataIntegrity);

            return (
              <MapBannerIndicator
                ref={noGpsRef}
                show={dataIntegrityModule.gpsSignalValid.map(isValid => !isValid)}
                class='map-banner-no-gps'
              >
                {options.noGpsBannerText ?? 'NO GPS POSITION'}
              </MapBannerIndicator>
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.CenterIndicators,
        factories,
        {
          onDetached: () => {
            noGpsRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-center'
      );
    }

    if (options.pointerBoundsOffset !== undefined) {
      mapBuilder.with(GarminMapBuilder.pointer, options.pointerBoundsOffset);

      if (options.pointerInfoSize !== undefined) {
        mapBuilder.with(GarminMapBuilder.pointerInfo, options.pointerInfoSize);
      }
    }

    if (options.supportDataIntegrity) {
      let airplaneIconSrcToUse: MutableSubscribable<string> | undefined;
      let airplaneIconAnchorToUse: MutableSubscribable<ReadonlyFloat64Array> | undefined;

      if (options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
        airplaneIconSrcToUse = airplaneIconSrc as MutableSubscribable<string>;
        airplaneIconAnchorToUse = airplaneIconAnchor as MutableSubscribable<ReadonlyFloat64Array>;
      }

      mapBuilder.with(GarminMapBuilder.dataIntegrity,
        airplaneIconSrcToUse, airplaneIconAnchorToUse,
        options.airplaneIconSrc, options.airplaneIconAnchor,
        options.noHeadingAirplaneIconSrc, options.noHeadingAirplaneIconAnchor
      );
    }

    return mapBuilder;
  }
}