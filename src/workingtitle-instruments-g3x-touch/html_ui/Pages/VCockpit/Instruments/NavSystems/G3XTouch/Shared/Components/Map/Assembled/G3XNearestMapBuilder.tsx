/* eslint-disable jsdoc/require-jsdoc */

import {
  FlightPlanner, FSComponent, MapOwnAirplaneIconOrientation, MapOwnAirplanePropsKey, MappedSubject, MapRangeModule, MapSystemBuilder, MapSystemContext,
  MapSystemGenericController, NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable, Subscription,
  UnitFamily, UnitType, UserSettingManager, Vec2Math, Vec2Subject, VecNMath, VNode
} from '@microsoft/msfs-sdk';

import {
  DefaultFlightPathPlanRenderer, GarminMapBuilder, GarminMapKeys, MapDeclutterModule, MapGarminAutopilotPropsKey,
  MapOrientation, MapOrientationModule, MapTerrainMode, MapTerrainModule, MapTrafficOffScaleStatus, MapUnitsModule,
  MapUtils, MapWaypointDisplayBuilder, TrafficIconOptions, TrafficSystem, TrafficUserSettingTypes,
  UnitsDistanceSettingMode, UnitsUserSettingManager, WaypointHighlightLineOptions
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../../CommonTypes';
import { G3XTouchFilePaths } from '../../../G3XTouchFilePaths';
import { GduUserSettingTypes } from '../../../Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../Settings/MapUserSettings';
import { G3XNearestMapRTRController, G3XNearestMapRTRControllerModules } from '../Controllers/G3XNearestMapRTRController';
import { G3XMapBuilder } from '../G3XMapBuilder';
import { G3XMapKeys } from '../G3XMapKeys';
import { G3XMapUtils } from '../G3XMapUtils';
import { G3XMapWaypointStyles } from '../G3XMapWaypointStyles';
import {
  G3XMapDetailIndicator, G3XMapTerrainScaleIndicator, G3XMapTrafficStatusIndicator, MapRangeTargetControlIndicator, MapRangeTargetControlIndicatorControllers,
  MapRangeTargetControlIndicatorModules, MapRelativeTerrainStatusIndicator, MapScaleBarIndicator
} from '../Indicators';
import { MapWaypointIconImageCache } from '../MapWaypointIconImageCache';
import { G3XMapTrafficModule, MapLabelTextModule } from '../Modules';

/**
 * Configuration options for traffic intruder icons for G3X Touch nearest maps.
 */
export type G3XNearestMapTrafficIconOptions = Pick<TrafficIconOptions, 'iconSize' | 'fontSize'>;

/**
 * Options for creating a G3X Touch nearest map.
 */
export type G3XNearestMapOptions = {
  /** The format of the map's parent GDU. */
  gduFormat: GduFormat;

  /** The ID to assign to the map's bound Bing Map instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the map's Bing Map instance. Defaults to 0. */
  bingDelay?: number;

  /** The frequency, in hertz, with which player airplane and autopilot properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /** The index of the GDU from which the map sources data. */
  gduIndex: number;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /**
   * Styling options for the waypoint highlight line. Defaults to the options returned by
   * `G3XMapUtils.waypointHighlightLineOptions()` for the appropriate GDU format.
   */
  highlightLineOptions?: Readonly<WaypointHighlightLineOptions>;

  /**
   * The margins around the projected map boundaries to respect when automatically selecting a range to place a
   * highlighted waypoint in view, as `[left, top, right, bottom]` in pixels. Positive values move the margin inwards
   * toward the center of the projection. Defaults to `[0, 0, 0, 0]`.
   */
  highlightMargins?: ReadonlyFloat64Array;

  /** The scaling factor of waypoint icons and labels. Defaults to `1`. */
  waypointStyleScale?: number;

  /** The projected scale of the map's nominal range, in pixels. */
  projectedRange: number | Subscribable<number>;

  /**
   * The nominal projected target offset of the map, as `[x, y]`, where each component is expressed relative to the
   * width or height of the map's projected window, *excluding* the dead zone. Defaults to `[0, 0]`.
   */
  targetOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The map range array to use for nautical units mode. Defaults to a standard range array. */
  nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** The map range array to use for metric units mode. Defaults to a standard range array. */
  metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** Whether to include support for drag-to-pan. Defaults to `true`. */
  includeDragPan?: boolean;

  /** The text of the banner that is displayed when GPS position is not available. Defaults to `'NO GPS POSITION'`. */
  noGpsBannerText?: string;

  /** Whether to display airport runway outlines. Defaults to `true`. */
  includeRunwayOutlines?: boolean;

  /** Whether to display airspaces. Defaults to `true`. */
  includeAirspaces?: boolean;

  /** The URI of the player airplane icon's image asset */
  airplaneIconSrc: string | Subscribable<string>;

  /** The orientation of the player airplane icon. Defaults to `MapOwnAirplaneIconOrientation.HeadingUp`. */
  airplaneIconOrientation?: MapOwnAirplaneIconOrientation | Subscribable<MapOwnAirplaneIconOrientation>;

  /** The flight planner containing the active flight plan. Required to display the active flight plan. */
  flightPlanner?: FlightPlanner | Subscribable<FlightPlanner>;

  /** The index of the LNAV instance associated with the active flight plan. Required to display the active flight plan. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV instance associated with the active flight plan. Required to display the active flight plan. */
  vnavIndex?: number | Subscribable<number>;

  /** The traffic system from which to retrieve traffic intruder data. Required to display traffic. */
  trafficSystem?: TrafficSystem;

  /** Configuration options for traffic icons. Required to display traffic. */
  trafficIconOptions?: G3XNearestMapTrafficIconOptions;

  /** Whether to include the track vector display. Defaults to `true`. */
  includeTrackVector?: boolean;

  /** Whether to include the altitude intercept arc display. Defaults to `true`. */
  includeAltitudeArc?: boolean;

  /** Whether to include a mini-compass. Defaults to `false`. */
  includeMiniCompass?: boolean;

  /** The indicator group in which to render the range/target control indicator. Defaults to `'top-right'`. */
  rangeTargetControlGroup?: 'top-right' | 'bottom-left' | 'bottom-right';

  /** Whether to include a detail indicator. Defaults to `true`. */
  includeDetailIndicator?: boolean;

  /** Whether to show the detail indicator title. Defaults to `true`. Ignored if `includeDetailIndicator` is `false`. */
  showDetailIndicatorTitle?: boolean;

  /** Whether to include a traffic off-scale status indicator. Defaults to `true`. */
  includeTrafficOffScaleIndicator?: boolean;

  /** Whether to include a traffic failed mode indicator. Defaults to `true`. */
  includeTrafficFailedIndicator?: boolean;

  /** Whether to include a terrain scale indicator. Defaults to `true`. */
  includeTerrainScale?: boolean;

  /** Whether to include a relative terrain mode status indicator. Defaults to `true`. */
  includeRelativeTerrainStatusIndicator?: boolean;

  /** Whether to include a traffic status indicator. Defaults to `true`. */
  includeTrafficStatusIndicator?: boolean;

  /**
   * Whether to show the traffic altitude restriction mode on the traffic status indicator. Defaults to `true`. Ignored
   * if `includeTrafficStatusIndicator` is `false`.
   */
  showTrafficAltRestriction?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /**
   * A user setting manager containing settings controlling the operation of the traffic system. If not defined,
   * certain traffic display options will not be controlled by user settings.
   */
  trafficSettingManager?: UserSettingManager<Partial<TrafficUserSettingTypes>>;

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
   * The amount of time, in milliseconds, over which to blend the on-ground and relative terrain mode colors when
   * transitioning between the two. Defaults to 10000 milliseconds.
   */
  groundRelativeTerrainBlendDuration?: number;

  /**
   * The minimum range index, inclusive, at which NEXRAD is visible.
   */
  nexradMinRangeIndex?: number;

  /**
   * Whether to bind the display of NEXRAD to user settings. Defaults to `true`. Ignored if `settingManager` is not
   * defined.
   */
  useNexradUserSettings?: boolean;

  /**
   * Whether to bind the global declutter function to user settings. Defaults to `true`. Ignored if `settingManager` is
   * not defined.
   */
  useDeclutterUserSetting?: boolean;

  /**
   * Whether to bind waypoint visibility and label text to user settings. Ignored if `settingManager` is not
   * defined. Defaults to `true`.
   */
  useWaypointUserSettings?: boolean;

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
 * Builds G3X Touch nearest maps.
 */
export class G3XNearestMapBuilder {
  /**
   * Configures a map builder to generate a G3X Touch nearest map.
   *
   * The controller `[GarminMapKeys.Range]: MapRangeController` is added to the map context and can be used to control
   * the range of the map.
   *
   * If drag-to-pan is supported, then the controller `[G3XMapKeys.DragPan]: MapDragPanController` is added to the
   * map context and can be used to control drag-to-pan functionality.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static build<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: G3XNearestMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.highlightMargins ??= VecNMath.create(4);
    options.highlightLineOptions ??= G3XMapUtils.waypointHighlightLineOptions(options.gduFormat);

    options.includeDragPan ??= true;

    options.useDeclutterUserSetting ??= true;

    options.useTerrainUserSettings ??= true;
    options.allowRelativeTerrainMode ??= true;
    options.groundRelativeTerrainBlendDuration ??= 10000;

    options.nexradMinRangeIndex ??= G3XMapUtils.DEFAULT_NEXRAD_MIN_RANGE_INDEX;
    options.useNexradUserSettings ??= true;

    options.includeAirspaces ??= true;
    options.useAirspaceVisUserSettings ??= true;

    options.includeRunwayOutlines ??= true;

    options.useWaypointUserSettings ??= true;

    options.includeTrackVector ??= true;
    options.useTrackVectorUserSettings ??= true;

    options.includeAltitudeArc ??= true;
    options.useAltitudeArcUserSettings ??= true;

    options.includeMiniCompass ??= false;
    options.rangeTargetControlGroup ??= 'top-right';
    options.includeDetailIndicator ??= true;
    options.showDetailIndicatorTitle ??= true;
    options.includeTrafficOffScaleIndicator ??= true;
    options.includeTrafficFailedIndicator ??= true;
    options.includeTerrainScale ??= true;
    options.includeRelativeTerrainStatusIndicator ??= true;
    options.includeTrafficStatusIndicator ??= true;
    options.showTrafficAltRestriction ??= true;

    mapBuilder
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? G3XMapUtils.mapRanges(UnitsDistanceSettingMode.Nautical),
        undefined,
      )
      .with(G3XMapBuilder.orientation,
        options.projectedRange,
        { [MapOrientation.NorthUp]: options.targetOffset }
      )
      .withController<
        MapSystemGenericController,
        { [GarminMapKeys.Orientation]: MapOrientationModule },
        any, any,
        { [GarminMapKeys.OrientationControl]: ResourceModerator }
      >('nearestMapOrientation', context => {
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
      .withBing(options.bingId, options.bingDelay)
      .with(GarminMapBuilder.terrainColors,
        {
          [MapTerrainMode.None]: G3XMapUtils.noTerrainEarthColors(),
          [MapTerrainMode.Absolute]: G3XMapUtils.absoluteTerrainEarthColors(),
          [MapTerrainMode.Relative]: G3XMapUtils.relativeTerrainEarthColors(),
          [MapTerrainMode.Ground]: G3XMapUtils.groundTerrainEarthColors()
        },
        options.useTerrainUserSettings ? options.settingManager : undefined,
        {
          allowRelative: options.allowRelativeTerrainMode,
          defaultMode: MapTerrainMode.Absolute
        },
        options.groundRelativeTerrainBlendDuration
      )
      .with(G3XMapBuilder.nexrad,
        options.nexradMinRangeIndex,
        options.useNexradUserSettings ? options.settingManager : undefined,
        MapUtils.connextPrecipRadarColors()
      );

    if (options.includeDragPan) {
      mapBuilder.with(G3XMapBuilder.dragPan);
    }

    if (options.includeAirspaces) {
      mapBuilder.with(G3XMapBuilder.airspaces, options.gduFormat, options.useAirspaceVisUserSettings ? options.settingManager : undefined);
    }

    mapBuilder.with(G3XMapBuilder.waypoints,
      (builder: MapWaypointDisplayBuilder, context: MapSystemContext<{ [G3XMapKeys.LabelText]: MapLabelTextModule }>): void => {
        const textModule = context.model.getModule(G3XMapKeys.LabelText);

        const labelStyleDef = G3XMapWaypointStyles.normalLabelStyles(
          options.gduFormat, 1,
          textModule.airportLargeTextSize,
          textModule.airportMediumTextSize,
          textModule.airportSmallTextSize,
          textModule.vorTextSize,
          textModule.ndbTextSize,
          textModule.intTextSize,
          textModule.userTextSize
        );

        builder.withNormalStyles(
          MapWaypointIconImageCache.getCache(),
          G3XMapWaypointStyles.normalIconStyles(options.gduFormat, 1),
          labelStyleDef.styles,
          G3XMapWaypointStyles.runwayOutlineIconStyles(1)
        );
      },
      options.includeRunwayOutlines,
      options.useWaypointUserSettings ? options.settingManager : undefined
    );

    if (options.flightPlanner && options.lnavIndex !== undefined && options.vnavIndex !== undefined) {
      mapBuilder.with(GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
        new DefaultFlightPathPlanRenderer(),
        false,
        (builder): void => {
          builder
            .withFlightPlanInactiveStyles(
              MapWaypointIconImageCache.getCache(),
              G3XMapWaypointStyles.flightPlanIconStyles(false, options.gduFormat, 2),
              G3XMapWaypointStyles.flightPlanLabelStyles(false, options.gduFormat, 2)
            )
            .withFlightPlanActiveStyles(
              MapWaypointIconImageCache.getCache(),
              G3XMapWaypointStyles.flightPlanIconStyles(true, options.gduFormat, 3),
              G3XMapWaypointStyles.flightPlanLabelStyles(true, options.gduFormat, 3)
            )
            .withVNavStyles(
              MapWaypointIconImageCache.getCache(),
              G3XMapWaypointStyles.vnavIconStyles(options.gduFormat, 4),
              G3XMapWaypointStyles.vnavLabelStyles(options.gduFormat, 4)
            );
        },
        {
          lnavIndex: options.lnavIndex,
          vnavIndex: options.vnavIndex
        }
      );
    }

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        true,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            MapWaypointIconImageCache.getCache(),
            G3XMapWaypointStyles.highlightIconStyles(options.gduFormat, 4),
            G3XMapWaypointStyles.highlightLabelStyles(options.gduFormat, 4)
          );
        },
        options.highlightLineOptions
      )
      .withController<G3XNearestMapRTRController, G3XNearestMapRTRControllerModules>(GarminMapKeys.Nearest, context => {
        return new G3XNearestMapRTRController(context, options.highlightMargins as ReadonlyFloat64Array);
      });

    if (options.includeTrackVector) {
      mapBuilder.with(G3XMapBuilder.trackVector,
        {}, // TODO: Support GDU470 (portrait)
        options.useTrackVectorUserSettings ? options.settingManager : undefined
      );
    }

    if (options.includeAltitudeArc) {
      mapBuilder
        .with(GarminMapBuilder.altitudeArc,
          {
            // TODO: Support GDU470 (portrait)
            renderMethod: 'svg',
            verticalSpeedPrecision: UnitType.FPM.createNumber(50),
            verticalSpeedThreshold: UnitType.FPM.createNumber(150),
            altitudeDeviationThreshold: UnitType.FOOT.createNumber(150)
          },
          options.useAltitudeArcUserSettings ? options.settingManager : undefined
        );
    }

    const supportTraffic = options.trafficSystem !== undefined
      && options.trafficIconOptions !== undefined;

    let offScale: Subject<MapTrafficOffScaleStatus> | undefined;
    if (supportTraffic && options.includeTrafficOffScaleIndicator) {
      offScale = Subject.create<MapTrafficOffScaleStatus>(MapTrafficOffScaleStatus.None);
    }

    if (supportTraffic) {
      const iconOptions = Object.assign({}, options.trafficIconOptions, {
        font: 'DejaVuSans-SemiBold',
        drawOffScale: false,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        supportAdsbVector: options.trafficSystem!.adsb !== null
      }) as TrafficIconOptions;

      mapBuilder.with(GarminMapBuilder.traffic,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.trafficSystem!,
        iconOptions,
        false,
        offScale,
        undefined, undefined,
        options.trafficSettingManager,
        options.settingManager
      );
    }

    const airplaneIconSrc = Subject.create('');
    const airplaneIconAnchor = Vec2Subject.create(Vec2Math.create());

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
      .withOwnAirplaneIcon(G3XMapUtils.ownAirplaneIconSize(options.gduFormat), airplaneIconSrc, airplaneIconAnchor)
      .withOwnAirplaneIconOrientation(MapOwnAirplaneIconOrientation.HeadingUp)
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

    if (options.includeMiniCompass) {
      mapBuilder.with(G3XMapBuilder.miniCompass, false);
    }

    const rangeTargetControlRef = FSComponent.createRef<MapRangeTargetControlIndicator>();
    const rangeTargetControlFactory = (context: MapSystemContext<
      MapRangeTargetControlIndicatorModules,
      any,
      MapRangeTargetControlIndicatorControllers
    >): VNode => {
      return (
        <MapRangeTargetControlIndicator
          ref={rangeTargetControlRef}
          context={context}
        />
      );
    };

    const includeStatusIndicatorContainer
      = (supportTraffic && options.includeTrafficStatusIndicator)
      || options.includeRelativeTerrainStatusIndicator;

    // Top-right indicators
    if (options.rangeTargetControlGroup === 'top-right' || includeStatusIndicatorContainer) {
      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      const trafficStatusRef = FSComponent.createRef<G3XMapTrafficStatusIndicator>();
      const relTerrainStatusRef = FSComponent.createRef<MapRelativeTerrainStatusIndicator>();

      const subscriptions: Subscription[] = [];

      let needDestroyRangeTargetControl = false;
      if (options.rangeTargetControlGroup === 'top-right') {
        factories.push(rangeTargetControlFactory);
        needDestroyRangeTargetControl = true;
      }

      if (includeStatusIndicatorContainer) {
        const { includeTrafficStatusIndicator, includeRelativeTerrainStatusIndicator } = options;

        factories.push((context: MapSystemContext<
          {
            [GarminMapKeys.Terrain]: MapTerrainModule,
            [GarminMapKeys.Traffic]?: G3XMapTrafficModule
          }
        >): VNode => {
          const terrainModule = context.model.getModule(GarminMapKeys.Terrain);
          const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

          let showRelTerrain: Subscribable<boolean> | undefined;

          if (includeRelativeTerrainStatusIndicator) {
            subscriptions.push(
              showRelTerrain = MappedSubject.create(
                ([mode, isRelFailed]) => mode === MapTerrainMode.Relative || mode === MapTerrainMode.Ground || isRelFailed,
                terrainModule.terrainMode,
                terrainModule.isRelativeModeFailed
              )
            );
          }

          return (
            <div class='map-status-indicator-container'>
              {includeTrafficStatusIndicator && trafficModule !== undefined && (
                <G3XMapTrafficStatusIndicator
                  ref={trafficStatusRef}
                  show={trafficModule.show}
                  operatingMode={trafficModule.operatingMode}
                />
              )}
              {showRelTerrain !== undefined && (
                <MapRelativeTerrainStatusIndicator
                  ref={relTerrainStatusRef}
                  iconFilePath={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_icon_relative_terrain.png`}
                  show={showRelTerrain}
                  isFailed={terrainModule.isRelativeModeFailed}
                />
              )}
            </div>
          );
        });
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopRightIndicators,
        factories,
        {
          onDetached: () => {
            if (needDestroyRangeTargetControl) {
              rangeTargetControlRef.getOrDefault()?.destroy();
            }

            trafficStatusRef.getOrDefault()?.destroy();
            relTerrainStatusRef.getOrDefault()?.destroy();

            for (const sub of subscriptions) {
              sub.destroy();
            }
          }
        },
        'map-indicator-group-top-right'
      );
    }

    // Bottom-left indicators
    if (options.includeTerrainScale || options.rangeTargetControlGroup === 'bottom-left') {
      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      const terrainScaleRef = FSComponent.createRef<G3XMapTerrainScaleIndicator>();

      let needDestroyRangeTargetControl = false;
      if (options.rangeTargetControlGroup === 'bottom-left') {
        factories.push(rangeTargetControlFactory);
        needDestroyRangeTargetControl = true;
      }

      if (options.includeTerrainScale) {
        factories.push((context: MapSystemContext<{ [GarminMapKeys.Terrain]: MapTerrainModule }>): VNode => {
          return (
            <G3XMapTerrainScaleIndicator
              ref={terrainScaleRef}
              terrainMode={context.model.getModule(GarminMapKeys.Terrain).terrainMode}
            />
          );
        });
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomLeftIndicators,
        factories,
        {
          onDetached: () => {
            if (needDestroyRangeTargetControl) {
              rangeTargetControlRef.getOrDefault()?.destroy();
            }

            terrainScaleRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-left'
      );
    }

    // TODO: Commented code retained for future use.
    // eslint-disable-next-line max-len
    // if (options.includeDetailIndicator || (supportTraffic && (options.includeTrafficOffScaleIndicator || options.includeTrafficFailedIndicator))) {
    //   const detailRef = FSComponent.createRef<MapDetailIndicator>();
    //   const offScaleRef = FSComponent.createRef<MapTrafficOffScaleIndicator>();
    //   const failedRef = FSComponent.createRef<MapTrafficFailedIndicator>();

    //   const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

    //   if (supportTraffic) {
    //     if (options.includeTrafficOffScaleIndicator) {
    //       factories.push(
    //         (): VNode => {
    //           return (
    //             <MapTrafficOffScaleIndicator
    //               ref={offScaleRef}
    //               status={offScale as Subscribable<MapTrafficOffScaleStatus>}
    //             />
    //           );
    //         }
    //       );
    //     }

    //     if (options.includeTrafficFailedIndicator) {
    //       factories.push(
    //         (context: MapSystemContext<{
    //           [GarminMapKeys.Traffic]: MapGarminTrafficModule
    //         }>): VNode => {
    //           const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

    //           return (
    //             <MapTrafficFailedIndicator
    //               ref={failedRef}
    //               show={trafficModule.show}
    //               operatingMode={trafficModule.operatingMode}
    //             />
    //           );
    //         }
    //       );
    //     }
    //   }

    //   mapBuilder.with(GarminMapBuilder.indicatorGroup,
    //     GarminMapKeys.BottomLeftIndicators,
    //     factories,
    //     {
    //       onDetached: () => {
    //         detailRef.getOrDefault()?.destroy();
    //         offScaleRef.getOrDefault()?.destroy();
    //         failedRef.getOrDefault()?.destroy();
    //       }
    //     },
    //     'map-indicator-group-bottom-left'
    //   );
    // }

    // Bottom-right indicators
    {
      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      let needDestroyRangeTargetControl = false;
      if (options.rangeTargetControlGroup === 'bottom-right') {
        factories.push(rangeTargetControlFactory);
        needDestroyRangeTargetControl = true;
      }

      const scaleBarRef = FSComponent.createRef<MapScaleBarIndicator>();
      const detailRef = FSComponent.createRef<G3XMapDetailIndicator>();

      factories.push(
        (context: MapSystemContext<{
          [GarminMapKeys.Range]: MapRangeModule,
          [GarminMapKeys.Units]: MapUnitsModule,
          [GarminMapKeys.Declutter]: MapDeclutterModule
        }>): VNode => {
          return (
            <div class='map-scale-bar-detail-container'>
              <MapScaleBarIndicator
                ref={scaleBarRef}
                range={context.model.getModule(GarminMapKeys.Range).nominalRange}
                displayUnit={context.model.getModule(GarminMapKeys.Units).distanceLarge}
                projectedRange={options.projectedRange}
              />
              {options.includeDetailIndicator && (
                <G3XMapDetailIndicator
                  ref={detailRef}
                  declutterMode={context.model.getModule(GarminMapKeys.Declutter).mode}
                />
              )}
            </div>
          );
        }
      );

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomRightIndicators,
        factories,
        {
          onDetached: () => {
            if (needDestroyRangeTargetControl) {
              rangeTargetControlRef.getOrDefault()?.destroy();
            }

            scaleBarRef.getOrDefault()?.destroy();
            detailRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-bottom-right'
      );
    }

    // TODO: Commented code retained for future use.
    // // Center indicators
    // if (options.supportDataIntegrity) {
    //   const noGpsRef = FSComponent.createRef<MapBannerIndicator>();

    //   const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

    //   if (options.supportDataIntegrity) {
    //     factories.push(
    //       (context: MapSystemContext<{
    //         [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule
    //       }>): VNode => {
    //         const dataIntegrityModule = context.model.getModule(MapSystemKeys.DataIntegrity);

    //         return (
    //           <MapBannerIndicator
    //             ref={noGpsRef}
    //             show={dataIntegrityModule.gpsSignalValid.map(isValid => !isValid)}
    //             class='map-banner-no-gps'
    //           >
    //             {options.noGpsBannerText ?? 'NO GPS POSITION'}
    //           </MapBannerIndicator>
    //         );
    //       }
    //     );
    //   }

    //   mapBuilder.with(GarminMapBuilder.indicatorGroup,
    //     GarminMapKeys.CenterIndicators,
    //     factories,
    //     {
    //       onDetached: () => {
    //         noGpsRef.getOrDefault()?.destroy();
    //       }
    //     },
    //     'map-indicator-group-center'
    //   );
    // }

    mapBuilder.with(G3XMapBuilder.dataIntegrity,
      options.gduIndex, options.gduSettingManager,
      airplaneIconSrc, airplaneIconAnchor,
      options.airplaneIconSrc
    );

    return mapBuilder;
  }
}