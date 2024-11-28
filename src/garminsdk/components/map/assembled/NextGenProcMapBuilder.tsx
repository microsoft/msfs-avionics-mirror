/* eslint-disable jsdoc/require-jsdoc */
import {
  FSComponent, MapDataIntegrityModule, MapOwnAirplaneIconOrientation, MapSystemBuilder, MapSystemContext, MapSystemGenericController, MapSystemKeys,
  MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable, UnitFamily,
  UserSettingManager, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { ProcMapFlightPathPlanRenderer } from '../flightplan';
import { GarminMapBuilder, RangeRingOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapBannerIndicator, MapOrientationIndicator } from '../indicators';
import { MapDeadReckoningLayer, MapPointerInfoLayerSize } from '../layers';
import { MapUtils } from '../MapUtils';
import { NextGenMapWaypointStyles } from '../MapWaypointStyles';
import { MapFlightPlanFocusModule, MapOrientation, MapOrientationModule, MapPointerModule, MapTerrainMode, MapTerrainModule, MapUnitsModule } from '../modules';

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin procedure map.
 */
export type NextGenProcMapOptions = {
  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the map's Bing Map instance. Defaults to 0. */
  bingDelay?: number;

  /** The frequency, in hertz, with which the player airplane's properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

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

  /**
   * A subscribable which provides the nominal focus margins, as `[left, top, right, bottom]` in pixels. The nominal
   * margins define the offset of the boundaries of the focus region relative to the map's projected window,
   * *excluding* the dead zone. Positive values represent offsets toward the center of the window. When the flight plan
   * is focused, the focused elements of the plan are guaranteed to be contained within the focus region. Defaults to
   * `[0, 0, 0, 0]`.
   */
  nominalFocusMargins?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The default map range index to apply when the procedure focus consists of only a single point in space. Defaults
   * to `17` (25 NM/50 KM with standard range arrays).
   */
  defaultFocusRangeIndex?: number;

  /** Styling options for the range ring. */
  rangeRingOptions: RangeRingOptions;

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

  /** Whether to bind terrain colors to user settings. Defaults to `false`. Ignored if `settingManager` is not defined. */
  useTerrainUserSettings?: boolean;

  /**
   * Whether to allow relative terrain mode. Defaults to `true`. Ignored if `useTerrainUserSettings` is `false` or
   * `settingManager` is not defined.
   */
  allowRelativeTerrainMode?: boolean;

  /**
   * Whether to bind the global declutter function to user settings. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  useDeclutterUserSetting?: boolean;
}

/**
 * Builds next-generation (NXi, G3000, etc) Garmin procedure maps.
 */
export class NextGenProcMapBuilder {
  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin procedure map. The map displays a
   * flight plan procedure (departure, arrival, approach) and its transitions, and is always focused on the displayed
   * procedure. The map is also locked to a North Up orientation.
   *
   * The module `[GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule` is added to the map model and can be
   * used to control the displayed procedure.
   *
   * The module `[GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule` is added to the map model and can be used
   * to control the procedure focus.
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
    options: NextGenProcMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.rangeEndpoints ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0.25);
    options.defaultFocusRangeIndex ??= 17;

    options.supportDataIntegrity ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= false;
    options.allowRelativeTerrainMode ??= false;

    options.airplaneIconOrientation ??= MapOwnAirplaneIconOrientation.HeadingUp;

    options.rangeRingOptions.labelRadial ??= 225;

    options.includeOrientationIndicator ??= false;

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
      >('procMapOrientation', context => {
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
          [MapTerrainMode.Relative]: MapUtils.relativeTerrainEarthColors()
        },
        options.useTerrainUserSettings ? options.settingManager : undefined,
        options.allowRelativeTerrainMode
      );

    mapBuilder
      .with(GarminMapBuilder.procPreview,
        new ProcMapFlightPathPlanRenderer(),
        (builder): void => {
          builder
            .withProcTransitionPreviewStyles(
              options.waypointIconImageCache,
              NextGenMapWaypointStyles.procTransitionPreviewIconStyles(1, options.waypointStyleScale),
              NextGenMapWaypointStyles.procTransitionPreviewLabelStyles(1, options.waypointStyleFontType, options.waypointStyleScale)
            )
            .withProcPreviewStyles(
              options.waypointIconImageCache,
              NextGenMapWaypointStyles.procPreviewIconStyles(2, options.waypointStyleScale),
              NextGenMapWaypointStyles.procPreviewLabelStyles(2, options.waypointStyleFontType, options.waypointStyleScale)
            );
        }
      )
      .with(GarminMapBuilder.flightPlanFocus, options.nominalFocusMargins, options.defaultFocusRangeIndex)
      .with(GarminMapBuilder.rangeRing, options.rangeRingOptions)
      .with(GarminMapBuilder.crosshair);

    let airplaneIconSrc = options.airplaneIconSrc;
    let airplaneIconAnchor = options.airplaneIconAnchor;
    if (options.supportDataIntegrity && options.noHeadingAirplaneIconSrc !== undefined && options.noHeadingAirplaneIconAnchor !== undefined) {
      airplaneIconSrc = Subject.create('');
      airplaneIconAnchor = Vec2Subject.create(Vec2Math.create());
    }

    mapBuilder
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

    return mapBuilder.withInit<{
      [GarminMapKeys.Orientation]: MapOrientationModule,
      [GarminMapKeys.Terrain]: MapTerrainModule,
      [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule
    }>('procMapInit', context => {
      context.model.getModule(GarminMapKeys.FlightPlanFocus).planHasFocus.set(true);

      if (!options.useTerrainUserSettings) {
        context.model.getModule(GarminMapKeys.Terrain).terrainMode.set(MapTerrainMode.None);
      }
    });
  }
}