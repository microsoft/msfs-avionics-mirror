/* eslint-disable jsdoc/require-jsdoc */
import {
  FacilityLoader, FacilityRepository, FlightPlanner, FSComponent, MapDataIntegrityModule,
  MapOwnAirplaneIconOrientation, MapSystemBuilder, MapSystemContext, MapSystemGenericController, MapSystemKeys,
  MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject,
  Subscribable, SubscribableUtils, UnitFamily, UserSettingManager, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { GarminFacilityWaypointCache } from '../../../navigation/GarminFacilityWaypointCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { WaypointMapHighlightController, WaypointMapRTRController, WaypointMapRTRControllerContext, WaypointMapRTRControllerModules } from '../controllers';
import { DefaultFlightPathPlanRenderer, MapDefaultFlightPlanWaypointRecordManager } from '../flightplan';
import { GarminMapBuilder, RangeRingOptions, WaypointHighlightLineOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapBannerIndicator, MapDetailIndicator, MapOrientationIndicator } from '../indicators';
import { MapDeadReckoningLayer, MapPointerInfoLayerSize } from '../layers';
import { MapRunwayDesignationImageCache } from '../MapRunwayDesignationImageCache';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { MapWaypointRenderRole } from '../MapWaypointRenderer';
import { NextGenMapWaypointStyles } from '../MapWaypointStyles';
import { MapDeclutterMode, MapDeclutterModule, MapOrientation, MapOrientationModule, MapPointerModule, MapTerrainMode, MapUnitsModule, WaypointMapSelectionModule } from '../modules';
import { NextGenGarminMapBuilder } from '../NextGenGarminMapBuilder';

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin waypoint map.
 */
export type NextGenWaypointMapOptions = {
  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the map's Bing Map instance. Defaults to 0. */
  bingDelay?: number;

  /** The frequency, in hertz, with which the player airplane's properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /** Whether the map draws a line from the highlighted waypoint to the player airplane. Defaults to `false`. */
  includeLine?: boolean;

  /** Styling options for the waypoint highlight line. Ignored if `includeLine` is `false`. */
  lineOptions?: WaypointHighlightLineOptions;

  /**
   * Whether the map should automatically adjust its range when the selected waypoint is an airport to give an
   * appropriate view of the selected runway, or all runways if there is no selected runway. Defaults to `false`.
   */
  supportAirportAutoRange?: boolean;

  /**
   * The default map range index to apply when a range cannot be automatically selected for an airport. Ignored if
   * `supportAirportAutoRange` is `false`. If not defined, the map range will not be reset when targeting an airport
   * and a range cannot be automatically selected.
   */
  defaultAirportRangeIndex?: number | Subscribable<number>;

  /**
   * The nominal margins (relative to the map's dead zone boundaries), to respect when calculating the map range for
   * airports, as `[left, top, right, bottom]` in pixels. Ignored if `supportAirportAutoRange` is `false`. Defaults to
   * `[0, 0, 0, 0]`.
   */
  airportAutoRangeMargins?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The image cache from which to retrieve waypoint icon images. */
  waypointIconImageCache: WaypointIconImageCache;

  /** The font type to use for waypoint labels. */
  waypointStyleFontType: 'Roboto' | 'DejaVu';

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

  /** The text of the banner that is displayed when GPS position is not available. Defaults to `'NO GPS POSITION'`. */
  noGpsBannerText?: string;

  /** Styling options for the range ring. */
  rangeRingOptions: RangeRingOptions;

  /** Whether to display airport runway outlines. Defaults to `false`. */
  includeRunwayOutlines?: boolean;

  /**
   * The image cache from which to retrieve runway designation images. If not defined, runway designations will not be
   * rendered. Ignored if `includeRunwayOutlines` is `false`.
   */
  runwayDesignationImageCache?: MapRunwayDesignationImageCache;

  /**
   * A function that filters user facilities to be displayed by the nearest waypoints layer based on their scopes. If
   * not defined, then user facilities will not be filtered based on scope.
   * @param scope A user facility scope.
   * @returns Whether to display the user facility with the specified scope.
   */
  userFacilityScopeFilter?: (scope: string) => boolean;

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

  /** The orientation of the player airplane icon. Defaults to `MapOwnAirplaneIconOrientation.HeadingUp`. */
  airplaneIconOrientation?: MapOwnAirplaneIconOrientation | Subscribable<MapOwnAirplaneIconOrientation>;

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

  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;

  /** The URI of the mini-compass's image asset. Required to display the mini-compass. */
  miniCompassImgSrc?: string;

  /** Whether to include an orientation indicator. Defaults to `true`. */
  includeOrientationIndicator?: boolean;

  /** Whether to include a detail indicator. Defaults to `false`. */
  includeDetailIndicator?: boolean;

  /** Whether to show the detail indicator title. Defaults to `false`. Ignored if `includeDetailIndicator` is `false`. */
  showDetailIndicatorTitle?: boolean;

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
   * Whether to allow relative terrain mode. Defaults to `false`. Ignored if `useTerrainUserSettings` is `false` or
   * `settingManager` is not defined.
   */
  allowRelativeTerrainMode?: boolean;

  /**
   * The amount of time, in milliseconds, over which to blend the on-ground and relative terrain mode colors when
   * transitioning between the two. Defaults to 2000 milliseconds.
   */
  groundRelativeTerrainBlendDuration?: number;

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

    options.supportAirportAutoRange ??= false;

    options.rangeEndpoints ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0.25);

    options.supportDataIntegrity ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= true;
    options.allowRelativeTerrainMode ??= false;
    options.groundRelativeTerrainBlendDuration ??= 2000;

    options.nexradMinRangeIndex ??= 13;
    options.useNexradUserSettings ??= false;

    options.airplaneIconOrientation ??= MapOwnAirplaneIconOrientation.HeadingUp;

    options.includeAirspaces ??= false;
    options.useAirspaceVisUserSettings ??= true;

    options.includeRunwayOutlines ??= false;

    options.useWaypointVisUserSettings ??= true;

    options.rangeRingOptions.labelRadial ??= 225;

    options.includeOrientationIndicator ??= true;
    options.includeDetailIndicator ??= false;
    options.showDetailIndicatorTitle ??= false;

    mapBuilder
      .withModule(GarminMapKeys.WaypointSelection, () => new WaypointMapSelectionModule())
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
      .withBing(options.bingId, { bingDelay: options.bingDelay })
      .with(GarminMapBuilder.terrainColors,
        {
          [MapTerrainMode.None]: MapUtils.noTerrainEarthColors(),
          [MapTerrainMode.Absolute]: MapUtils.absoluteTerrainEarthColors(),
          [MapTerrainMode.Relative]: MapUtils.relativeTerrainEarthColors(),
          [MapTerrainMode.Ground]: MapUtils.groundTerrainEarthColors()
        },
        options.useTerrainUserSettings ? options.settingManager : undefined,
        options.allowRelativeTerrainMode,
        options.groundRelativeTerrainBlendDuration
      )
      .with(GarminMapBuilder.nexrad,
        options.nexradMinRangeIndex,
        options.useNexradUserSettings ? options.settingManager : undefined,
        MapDeclutterMode.Level2,
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
      options.useWaypointVisUserSettings ? options.settingManager : undefined,
      {
        supportRunwayOutlines: options.includeRunwayOutlines,
        userFacilityScopeFilter: options.userFacilityScopeFilter
      }
    );

    if (options.flightPlanner) {
      mapBuilder.with(GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
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
            );
        },
        {
          lnavIndex: options.lnavIndex,
          vnavIndex: options.vnavIndex,
          drawEntirePlan: false,
          waypointRecordManagerFactory: (context, renderer) => {
            return new MapDefaultFlightPlanWaypointRecordManager(
              new FacilityLoader(FacilityRepository.getRepository(context.bus)),
              GarminFacilityWaypointCache.getCache(context.bus),
              renderer,
              MapWaypointRenderRole.FlightPlanInactive,
              MapWaypointRenderRole.FlightPlanActive
            );
          },
          pathRendererFactory: () => new DefaultFlightPathPlanRenderer(),
          supportFocus: false
        }
      );
    }

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        options.includeLine,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            options.waypointIconImageCache,
            NextGenMapWaypointStyles.highlightIconStyles(4, options.waypointStyleScale),
            NextGenMapWaypointStyles.highlightLabelStyles(4, options.waypointStyleFontType, options.waypointStyleScale)
          );
        },
        options.lineOptions,
      )
      .withController(GarminMapKeys.WaypointHighlight, context => {
        return new WaypointMapHighlightController(context);
      })
      .withController<
        WaypointMapRTRController,
        WaypointMapRTRControllerModules,
        any, any,
        WaypointMapRTRControllerContext
      >(GarminMapKeys.WaypointRTR, context => {
        let defaultAirportRangeIndex: Subscribable<number> | undefined = undefined;
        let margins: Subscribable<ReadonlyFloat64Array> | undefined = undefined;
        if (options.supportAirportAutoRange && options.defaultAirportRangeIndex !== undefined) {
          defaultAirportRangeIndex = SubscribableUtils.toSubscribable(options.defaultAirportRangeIndex, true);
        }
        if (options.supportAirportAutoRange && options.airportAutoRangeMargins !== undefined) {
          margins = SubscribableUtils.toSubscribable(options.airportAutoRangeMargins, true);
        }

        return new WaypointMapRTRController(
          context,
          options.supportAirportAutoRange as boolean,
          defaultAirportRangeIndex,
          margins,
        );
      });

    let airplaneIconSrc = options.airplaneIconSrc;
    let airplaneIconAnchor = options.airplaneIconAnchor;
    if (options.supportDataIntegrity && options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
      airplaneIconSrc = Subject.create('');
      airplaneIconAnchor = Vec2Subject.create(Vec2Math.create());
    }

    mapBuilder
      .with(GarminMapBuilder.rangeRing, options.rangeRingOptions)
      .with(GarminMapBuilder.crosshair)
      .withOwnAirplaneIcon(options.airplaneIconSize, airplaneIconSrc, airplaneIconAnchor)
      .withOwnAirplaneIconOrientation(options.airplaneIconOrientation)
      .withOwnAirplanePropBindings([
        'position',
        'hdgTrue',
        'isOnGround'
      ], options.dataUpdateFreq)
      .withFollowAirplane();

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

    // Top-left indicators
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

    // Bottom-left indicators
    if (options.includeDetailIndicator) {
      const detailRef = FSComponent.createRef<MapDetailIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeDetailIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Declutter]: MapDeclutterModule
          }>): VNode => {
            const declutterModule = context.model.getModule(GarminMapKeys.Declutter);

            return (
              <MapDetailIndicator
                ref={detailRef}
                declutterMode={declutterModule.mode}
                showTitle={options.showDetailIndicatorTitle as boolean}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomLeftIndicators,
        factories,
        {
          onDetached: () => {
            detailRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-left'
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