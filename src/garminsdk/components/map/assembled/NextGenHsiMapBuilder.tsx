/* eslint-disable jsdoc/require-jsdoc */
import {
  FlightPlanner, FSComponent, MapIndexedRangeModule, MapOwnAirplaneIconModule, MapOwnAirplaneIconOrientation, MapOwnAirplanePropsKey, MapSystemBuilder,
  MapSystemContext, MapSystemGenericController, MapSystemKeys, MutableSubscribable, NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator,
  Subject, Subscribable, Subscription, UnitFamily, UnitType, UserSettingManager, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { MapUserSettingTypes } from '../../../settings/MapUserSettings';
import { TrafficUserSettingTypes } from '../../../settings/TrafficUserSettings';
import { UnitsDistanceSettingMode, UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { TrafficSystem } from '../../../traffic/TrafficSystem';
import { DefaultFlightPathPlanRenderer } from '../flightplan';
import { GarminMapBuilder, TrafficIconOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import { MapDetailIndicator, MapTrafficOffScaleIndicator, MapTrafficStatusIndicator } from '../indicators';
import { MapDeadReckoningLayer } from '../layers';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapRunwayDesignationImageCache } from '../MapRunwayDesignationImageCache';
import { MapTrafficOffScaleStatus } from '../MapTrafficOffScaleStatus';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { NextGenMapWaypointStyles } from '../MapWaypointStyles';
import { MapDeclutterMode, MapDeclutterModule, MapGarminTrafficModule, MapOrientation, MapOrientationModule, MapTerrainMode, MapUnitsModule } from '../modules';
import { NextGenGarminMapBuilder } from '../NextGenGarminMapBuilder';

/**
 * Configurations for traffic intruder icons for next-generation (NXi, G3000, etc) HSI maps.
 */
export type NextGenHsiMapTrafficIconOptions
  = Pick<TrafficIconOptions, 'iconSize' | 'font' | 'fontSize'> & Partial<Pick<TrafficIconOptions, 'drawOffScale' | 'supportAdsbVector'>>;

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin HSI map.
 */
export type NextGenHsiMapOptions = {
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
   * The nominal projected target offset of the map, as `[x, y]`, where each component is expressed relative to the
   * width or height of the map's projected window, *excluding* the dead zone. Defaults to `[0, 0]`.
   */
  targetOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The range endpoints of the map, as `[x1, y1, x2, y2]`, where each component is expressed relative to the width or
   * height of the map's projected window, *excluding* the dead zone. Defaults to `[0.5, 0.5, 0.5, 0]`.
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

  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;

  /** The traffic system from which to retrieve traffic intruder data. Required to display traffic. */
  trafficSystem?: TrafficSystem;

  /** Configuration options for traffic icons. Required to display traffic. */
  trafficIconOptions?: NextGenHsiMapTrafficIconOptions;

  /** Whether to include the track vector display. Defaults to `true`. */
  includeTrackVector?: boolean;

  /** Whether to include the altitude intercept arc display. Defaults to `true`. */
  includeAltitudeArc?: boolean;

  /** Whether to include a map range indicator. Defaults to `true`. */
  includeRangeIndicator?: boolean;

  /** Whether to include a detail indicator. Defaults to `true`. */
  includeDetailIndicator?: boolean;

  /** Whether to include a traffic off-scale status indicator. Defaults to `true`. */
  includeTrafficOffScaleIndicator?: boolean;

  /** Whether to include a traffic status indicator. Defaults to `true`. */
  includeTrafficStatusIndicator?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<MapUserSettingTypes>>;

  /**
   * A user setting manager containing settings controlling the operation of the traffic system. If not defined,
   * certain traffic display options will not be controlled by user settings.
   */
  trafficSettingManager?: UserSettingManager<Partial<TrafficUserSettingTypes>>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

  /** Whether the map's range should be controlled by user setting by default. Defaults to `true`. */
  useRangeUserSettingByDefault?: boolean;

  /** Whether to bind terrain colors to user settings. Defaults to `true`. Ignored if `settingManager` is not defined. */
  useTerrainUserSettings?: boolean;

  /**
   * Whether to allow relative terrain mode. Defaults to `true`. Ignored if `useTerrainUserSettings` is `false` or
   * `settingManager` is not defined.
   */
  allowRelativeTerrainMode?: boolean;

  /**
   * The amount of time, in milliseconds, over which to blend the on-ground and relative terrain mode colors when
   * transitioning between the two. Defaults to 10000 milliseconds.
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
}

/**
 * Builds next-generation (NXi, G3000, etc) Garmin HSI maps.
 */
export class NextGenHsiMapBuilder {
  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin HSI map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static build<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenHsiMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.targetOffset ??= Vec2Math.create();
    options.rangeEndpoints ??= VecNMath.create(4, 0.5, 0.5, 0.5, 0);

    options.supportDataIntegrity ??= true;

    options.useRangeUserSettingByDefault ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= true;
    options.allowRelativeTerrainMode ??= true;
    options.groundRelativeTerrainBlendDuration ??= 10000;

    options.nexradMinRangeIndex ??= 13;
    options.useNexradUserSettings ??= true;

    options.includeAirspaces ??= true;
    options.useAirspaceVisUserSettings ??= true;

    options.includeRunwayOutlines ??= false;

    options.useWaypointVisUserSettings ??= true;

    options.includeTrackVector ??= true;
    options.useTrackVectorUserSettings ??= true;

    options.includeAltitudeArc ??= true;
    options.useAltitudeArcUserSettings ??= true;

    options.includeRangeIndicator ??= true;
    options.includeDetailIndicator ??= true;
    options.includeTrafficOffScaleIndicator ??= true;
    options.includeTrafficStatusIndicator ??= true;

    mapBuilder
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Nautical),
        options.metricRangeArray ?? MapUtils.nextGenMapRanges(UnitsDistanceSettingMode.Metric),
        options.settingManager,
        options.useRangeUserSettingByDefault
      )
      .with(GarminMapBuilder.orientation,
        { [MapOrientation.HeadingUp]: options.targetOffset },
        { [MapOrientation.HeadingUp]: options.rangeEndpoints }
      )
      .withController<
        MapSystemGenericController,
        { [GarminMapKeys.Orientation]: MapOrientationModule },
        any, any,
        { [GarminMapKeys.OrientationControl]: ResourceModerator }
      >('hsiMapOrientation', context => {
        const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
        const orientationControlConsumer: ResourceConsumer = {
          priority: Number.MAX_SAFE_INTEGER,

          onAcquired: () => {
            orientationModule.orientation.set(MapOrientation.HeadingUp);
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
      .withBing(options.bingId, options.bingDelay)
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
        },
        {
          lnavIndex: options.lnavIndex,
          vnavIndex: options.vnavIndex,
          supportFocus: false
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
      mapBuilder
        .withAutopilotProps(
          ['selectedAltitude'],
          options.dataUpdateFreq
        )
        .with(GarminMapBuilder.altitudeArc,
          {
            renderMethod: 'canvas',
            verticalSpeedPrecision: UnitType.FPM.createNumber(50),
            verticalSpeedThreshold: UnitType.FPM.createNumber(150),
            altitudeDeviationThreshold: UnitType.FOOT.createNumber(150)
          },
          options.useAltitudeArcUserSettings ? options.settingManager : undefined
        );
    }

    mapBuilder.with(GarminMapBuilder.crosshair);

    const supportTraffic = options.trafficSystem !== undefined
      && options.trafficIconOptions !== undefined;

    let offScale: Subject<MapTrafficOffScaleStatus> | undefined;
    if (supportTraffic && options.includeTrafficOffScaleIndicator) {
      offScale = Subject.create<MapTrafficOffScaleStatus>(MapTrafficOffScaleStatus.None);
    }

    if (supportTraffic) {
      const iconOptions = Object.assign({}, options.trafficIconOptions) as TrafficIconOptions;
      iconOptions.drawOffScale ??= false;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      iconOptions.supportAdsbVector ??= options.trafficSystem!.adsb !== null;

      mapBuilder
        .withController<
          MapSystemGenericController,
          {
            [GarminMapKeys.Range]: MapIndexedRangeModule,
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }
        >('hsiMapTrafficOuterRange', context => {
          let controller: MapSystemGenericController;

          let rangePipe: Subscription | undefined;

          return controller = new MapSystemGenericController(context, {
            onAfterMapRender: (contextArg): void => {
              rangePipe = contextArg.model.getModule(GarminMapKeys.Range).nominalRangeIndex.pipe(
                contextArg.model.getModule(GarminMapKeys.Traffic).outerRangeIndex
              );
            },

            onMapDestroyed: (): void => {
              controller.destroy();
            },

            onDestroyed: (): void => {
              rangePipe?.destroy();
            }
          });
        })
        .with(GarminMapBuilder.traffic,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          options.trafficSystem!,
          iconOptions,
          true,
          offScale,
          undefined, undefined,
          options.trafficSettingManager,
          options.settingManager
        );
    }

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
      .withFollowAirplane()
      .withInit<{ [MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule }>(MapSystemKeys.OwnAirplaneIconOrientation, context => {
        context.model.getModule(MapSystemKeys.OwnAirplaneIcon).orientation.set(MapOwnAirplaneIconOrientation.MapUp);
      });

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

    // Bottom-left indicators
    if (options.includeDetailIndicator || options.includeRangeIndicator) {
      const detailRef = FSComponent.createRef<MapDetailIndicator>();
      const rangeRef = FSComponent.createRef<MapRangeDisplay>();

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
                showTitle={false}
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
        GarminMapKeys.BottomLeftIndicators,
        factories,
        {
          onDetached: () => {
            detailRef.getOrDefault()?.destroy();
            rangeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-left'
      );
    }

    // Bottom-center indicators
    if (supportTraffic && (options.includeTrafficOffScaleIndicator || options.includeTrafficStatusIndicator)) {
      const statusRef = FSComponent.createRef<MapTrafficStatusIndicator>();
      const offScaleRef = FSComponent.createRef<MapTrafficOffScaleIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeTrafficOffScaleIndicator) {
        factories.push(
          (): VNode => {
            return (
              <MapTrafficOffScaleIndicator
                ref={offScaleRef}
                status={offScale as Subscribable<MapTrafficOffScaleStatus>}
              />
            );
          }
        );
      }

      if (options.includeTrafficStatusIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <MapTrafficStatusIndicator
                ref={statusRef}
                show={trafficModule.show}
                operatingMode={trafficModule.operatingMode}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomCenterIndicators,
        factories,
        {
          onDetached: () => {
            statusRef.getOrDefault()?.destroy();
            offScaleRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-center'
      );
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