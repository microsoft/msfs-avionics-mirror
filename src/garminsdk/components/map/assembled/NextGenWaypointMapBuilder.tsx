/* eslint-disable jsdoc/require-jsdoc */
import {
  FlightPlanner, FSComponent, MapDataIntegrityModule, MapSystemBuilder, MapSystemContext, MapSystemGenericController, MapSystemKeys, MutableSubscribable,
  NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable, UnitFamily, UserSettingManager, Vec2Math, Vec2Subject,
  VecNMath, VNode
} from 'msfssdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { WaypointMapRTRController, WaypointMapRTRControllerContext, WaypointMapRTRControllerModules } from '../controllers';
import { DefaultFlightPathPlanRenderer } from '../flightplan';
import { GarminMapBuilder, RangeRingOptions, WaypointHighlightLineOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapBannerIndicator, MapOrientationIndicator } from '../indicators';
import { MapPointerInfoLayerSize } from '../layers';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { MapWaypointStyles } from '../MapWaypointStyles';
import { MapDeclutterMode, MapOrientation, MapOrientationModule, MapPointerModule, MapTerrainMode, MapUnitsModule } from '../modules';

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin waypoint map.
 */
export type NextGenWaypointMapOptions = {
  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The frequency, in hertz, with which the player airplane's properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /** whether the map draws a line from the highlighted waypoint to the player airplane. Defaults to `false`. */
  includeLine?: boolean;

  /** Styling options for the waypoint highlight line. Ignored if `includeLine` is `false`. */
  lineOptions?: WaypointHighlightLineOptions;

  /**
   * The default map range index to apply when there is no highlighted waypoint, or `null` if no range index should be
   * applied. Defaults to `null`.
   */
  defaultNoTargetRangeIndex?: number | Subscribable<number> | null;

  /**
   * The default map range index to apply when targeting the highlighted waypoint, or `null` if no range index should
   * be applied. Defaults to `null`.
   */
  defaultTargetRangeIndex?: number | Subscribable<number> | null;

  /**
   * Whether the map should automatically adjust its range when an airport is the highlighted waypoint to give an
   * appropriate view of all runways. If `false`, the map will attempt to apply the range index defined by
   * `defaultTargetRangeIndex` instead. Defaults to `false`.
   */
  supportAirportAutoRange?: boolean;

  /**
   * The offset of the boundaries of this controller's enforced display area relative to the boundaries of the map's
   * projected window, *excluding* the dead zone, as `[left, top, right, bottom]` in pixels. Positive offsets are
   * directed toward the center of the map. When this controller selects a map range when targeting an airport, it will
   * attempt to keep all runways within the display area. Ignored if `supportAirportAutoRange` is `false`.
   */
  boundsOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The image cache from which to retrieve waypoint icon images. */
  waypointIconImageCache: WaypointIconImageCache;

  /** The scaling factor of waypoint icons and labels. Defaults to `1`. */
  waypointStyleScale?: number;

  /**
   * The nominal projected target offset of the map, as `[x, y]`, where each component is expressed relative to the
   * width or height of the map's projected window, *excluding* the dead zone. Defaults to `[0, 0]`.
   */
  targetOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The range endpoints of the map, as `[x1, y1, x2, y2]`, where each component is expressed relative to the width or
   * height of the map's projected window, *excluding* the dead zone. Defaults to `[0.5, 0.5, 0.5, 0.25]`.
   */
  rangeEndpoints?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

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

  /** Styling options for the range ring. */
  rangeRingOptions: RangeRingOptions;

  /** Whether to display airspaces. Defaults to `false`. */
  includeAirspaces?: boolean;

  /** The URI of the player airplane icon's image asset, or a subscribable which provides it */
  airplaneIconSrc: string | Subscribable<string>;

  /** The size of the player airplane icon, in pixels. */
  airplaneIconSize: number;

  /**
   * The point on the player airplane icon that is anchored to the airplane's position, or a subscribable which
   * provides it. The point is expressed as a 2-tuple relative to the icon's width and height, with [0, 0] at the top
   * left and [1, 1] at the bottom right.
   */
  airplaneIconAnchor: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

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

  /** The flight planner containing the active flight plan. Required to display the active flight plan. */
  flightPlanner?: FlightPlanner;

  /** The URI of the mini-compass's image asset. Required to display the mini-compass. */
  miniCompassImgSrc?: string;

  /** Whether to include an orientation indicator. Defaults to `true`. */
  includeOrientationIndicator?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<MapUserSettingTypes>>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

  /** Whether to bind terrain colors to user settings. Defaults to `true`. Ignored if `settingManager` is not defined. */
  useTerrainUserSettings?: boolean;

  /**
   * Whether to allow relative terrain mode. Defaults to `true`. Ignored if `useTerrainUserSettings` is `false` or
   * `settingManager` is not defined.
   */
  allowRelativeTerrainMode?: boolean;

  /**
   * The minimum range index, inclusive, at which NEXRAD is visible.
   */
  nexradMinRangeIndex?: number;

  /**
   * Whether to bind the display of NEXRAD to user settings. Defaults to `false`. Ignored if `settingManager` is not
   * defined.
   */
  useNexradUserSettings?: boolean;

  /**
   * Whether to bind the global declutter function to user settings. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  useDeclutterUserSetting?: boolean;

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
}

/**
 * Builds next-generation (NXi, G3000, etc) Garmin waypoint maps.
 */
export class NextGenWaypointMapBuilder {
  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin waypoint map. The map is locked to
   * a North Up orientation, targets a highlighted waypoint, and follows the player airplane when there is no
   * highlighted waypoint.
   *
   * The module `[GarminMapKeys.WaypointHighlight]: MapWaypointHighlightModule` is added to the map model and can be
   * used to control the highlighted waypoint.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the waypoint map.
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
    options: NextGenWaypointMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.includeLine ??= false;

    options.defaultNoTargetRangeIndex ??= null;
    options.defaultTargetRangeIndex ??= null;
    options.supportAirportAutoRange ??= false;

    options.rangeEndpoints ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0.25);

    options.supportDataIntegrity ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= true;
    options.allowRelativeTerrainMode ??= false;

    options.nexradMinRangeIndex ??= 13;
    options.useNexradUserSettings ??= false;

    options.includeAirspaces ??= false;
    options.useAirspaceVisUserSettings ??= true;

    options.useWaypointVisUserSettings ??= true;

    options.rangeRingOptions.labelRadial ??= 225;

    options.includeOrientationIndicator ??= true;

    mapBuilder
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Nautical),
        options.metricRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Metric),
        options.settingManager,
        false
      )
      .with(GarminMapBuilder.orientation, { [MapOrientation.NorthUp]: options.targetOffset }, { [MapOrientation.NorthUp]: options.rangeEndpoints })
      .withController<
        MapSystemGenericController,
        { [GarminMapKeys.Orientation]: MapOrientationModule },
        any, any,
        { [GarminMapKeys.OrientationControl]: ResourceModerator }
      >('waypointMapOrientation', context => {
        const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
        const orientationControlConsumer: ResourceConsumer = {
          priority: Number.MAX_SAFE_INTEGER,

          onAcquired: () => {
            orientationModule.orientation.set(MapOrientation.NorthUp);
          },

          onCeded: () => { }
        };

        let controller: MapSystemGenericController;

        return controller = new MapSystemGenericController(context, {
          onAfterMapRender: (contextArg): void => {
            contextArg[GarminMapKeys.OrientationControl].claim(orientationControlConsumer);
          },

          onMapDestroyed: (): void => {
            controller.destroy();
          },

          onDestroyed: (contextArg): void => {
            contextArg[GarminMapKeys.OrientationControl].forfeit(orientationControlConsumer);
          }
        });
      })
      .with(GarminMapBuilder.declutter, options.useDeclutterUserSetting ? options.settingManager : undefined)
      .withBing(options.bingId)
      .with(GarminMapBuilder.terrainColors,
        {
          [MapTerrainMode.None]: MapUtils.noTerrainEarthColors(),
          [MapTerrainMode.Absolute]: MapUtils.absoluteTerrainEarthColors(),
          [MapTerrainMode.Relative]: MapUtils.relativeTerrainEarthColors()
        },
        options.useTerrainUserSettings ? options.settingManager : undefined,
        options.allowRelativeTerrainMode
      )
      .with(GarminMapBuilder.nexrad,
        options.nexradMinRangeIndex,
        options.useNexradUserSettings ? options.settingManager : undefined,
        MapDeclutterMode.Level2
      );

    if (options.includeAirspaces) {
      mapBuilder.with(GarminMapBuilder.airspaces, options.useAirspaceVisUserSettings ? options.settingManager : undefined);
    }

    mapBuilder.with(GarminMapBuilder.waypoints,
      (builder: MapWaypointDisplayBuilder): void => {
        builder.withNormalStyles(
          options.waypointIconImageCache,
          MapWaypointStyles.nextGenNormalIconStyles(1, options.waypointStyleScale),
          MapWaypointStyles.nextGenNormalLabelStyles(1, options.waypointStyleScale)
        );
      },
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
              MapWaypointStyles.nextGenFlightPlanIconStyles(false, 2, options.waypointStyleScale),
              MapWaypointStyles.nextGenFlightPlanLabelStyles(false, 2, options.waypointStyleScale)
            )
            .withFlightPlanActiveStyles(
              options.waypointIconImageCache,
              MapWaypointStyles.nextGenFlightPlanIconStyles(true, 3, options.waypointStyleScale),
              MapWaypointStyles.nextGenFlightPlanLabelStyles(true, 3, options.waypointStyleScale)
            );
        }
      );
    }

    if (typeof options.defaultNoTargetRangeIndex === 'number') {
      options.defaultNoTargetRangeIndex = Subject.create(options.defaultNoTargetRangeIndex);
    }
    if (typeof options.defaultTargetRangeIndex === 'number') {
      options.defaultTargetRangeIndex = Subject.create(options.defaultTargetRangeIndex);
    }

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        options.includeLine,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            options.waypointIconImageCache,
            MapWaypointStyles.nextGenHighlightIconStyles(4, options.waypointStyleScale),
            MapWaypointStyles.nextGenHighlightLabelStyles(4, options.waypointStyleScale)
          );
        },
        options.lineOptions,
      )
      .withController<
        WaypointMapRTRController,
        WaypointMapRTRControllerModules,
        any, any,
        WaypointMapRTRControllerContext
      >(GarminMapKeys.Nearest, context => {
        let boundsOffset = undefined;
        if (options.supportAirportAutoRange && options.boundsOffset !== undefined) {
          boundsOffset = 'isSubscribable' in options.boundsOffset ? options.boundsOffset : Subject.create(options.boundsOffset);
        }

        return new WaypointMapRTRController(
          context,
          options.defaultNoTargetRangeIndex as Subscribable<number> | null,
          options.defaultTargetRangeIndex as Subscribable<number> | null,
          options.supportAirportAutoRange as boolean,
          boundsOffset,
        );
      });

    let airplaneIconSrc = options.airplaneIconSrc;
    let airplaneIconAnchor = options.airplaneIconAnchor;
    if (options.supportDataIntegrity && options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
      airplaneIconSrc = Subject.create('');
      airplaneIconAnchor = Vec2Subject.createFromVector(Vec2Math.create());
    }

    mapBuilder
      .with(GarminMapBuilder.rangeRing, options.rangeRingOptions)
      .with(GarminMapBuilder.crosshair)
      .withOwnAirplaneIcon(options.airplaneIconSize, airplaneIconSrc, airplaneIconAnchor)
      .withOwnAirplanePropBindings([
        'position',
        'hdgTrue',
        'isOnGround'
      ], options.dataUpdateFreq)
      .withFollowAirplane();

    if (options.miniCompassImgSrc !== undefined) {
      mapBuilder.with(GarminMapBuilder.miniCompass, options.miniCompassImgSrc);
    }

    if (options.includeOrientationIndicator) {
      const ref = FSComponent.createRef<MapOrientationIndicator>();

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopLeftIndicators,
        [(context: MapSystemContext<{
          [GarminMapKeys.Orientation]: MapOrientationModule,
          [GarminMapKeys.Pointer]?: MapPointerModule
        }>): VNode => {
          const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
          const pointerModule = context.model.getModule(GarminMapKeys.Pointer);

          return (
            <MapOrientationIndicator
              ref={ref}
              orientation={orientationModule.orientation}
              text={{
                [MapOrientation.NorthUp]: 'NORTH UP'
              }}
              isVisible={pointerModule?.isActive.map(isActive => !isActive) ?? Subject.create(true)}
            />
          );
        }],
        { onDetached: () => { ref.instance.destroy(); } },
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
                NO GPS POSITION
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