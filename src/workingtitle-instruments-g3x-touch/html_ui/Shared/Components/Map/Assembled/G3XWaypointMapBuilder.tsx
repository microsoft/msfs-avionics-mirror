/* eslint-disable jsdoc/require-jsdoc */

import {
  FacilityLoader, FacilityRepository, FlightPlanner, FSComponent, MapOwnAirplaneIconOrientation,
  MapOwnAirplanePropsKey, MapRangeModule, MapSystemBuilder, MapSystemContext, MapSystemGenericController,
  NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable,
  SubscribableUtils, Subscription, UnitFamily, UnitType, UserSettingManager, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import {
  DefaultFlightPathPlanRenderer, GarminFacilityWaypointCache, GarminMapBuilder, GarminMapKeys, MapDeclutterModule,
  MapDefaultFlightPlanWaypointRecordManager, MapGarminAutopilotPropsKey, MapOrientation, MapOrientationModule,
  MapTerrainMode, MapTerrainModule, MapUnitsModule, MapUtils, MapWaypointDisplayBuilder, MapWaypointRenderRole,
  TrafficIconOptions, UnitsDistanceSettingMode, UnitsUserSettingManager, WaypointMapHighlightController,
  WaypointMapRTRController, WaypointMapRTRControllerContext, WaypointMapRTRControllerModules,
  WaypointMapSelectionModule
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../../CommonTypes';
import { GduUserSettingTypes } from '../../../Settings/GduUserSettings';
import { G3XMapUserSettingTypes } from '../../../Settings/MapUserSettings';
import { G3XMapBuilder } from '../G3XMapBuilder';
import { G3XMapKeys } from '../G3XMapKeys';
import { G3XMapUtils } from '../G3XMapUtils';
import { G3XMapWaypointStyles } from '../G3XMapWaypointStyles';
import {
  G3XMapDetailIndicator, G3XMapTrafficStatusIndicator, MapRangeTargetControlIndicator,
  MapRangeTargetControlIndicatorControllers, MapRangeTargetControlIndicatorModules, MapRelativeTerrainStatusIndicator,
  MapScaleBarIndicator
} from '../Indicators';
import { MapWaypointIconImageCache } from '../MapWaypointIconImageCache';
import { MapLabelTextModule } from '../Modules';

/**
 * Configuration options for traffic intruder icons for G3X Touch waypoint maps.
 */
export type G3XWaypointMapTrafficIconOptions = Pick<TrafficIconOptions, 'iconSize' | 'fontSize'>;

/**
 * Options for creating a G3X Touch waypoint map.
 */
export type G3XWaypointMapOptions = {
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

  /** Whether to include the track vector display. Defaults to `true`. */
  includeTrackVector?: boolean;

  /** Whether to include the altitude intercept arc display. Defaults to `true`. */
  includeAltitudeArc?: boolean;

  /** The indicator group in which to render the range/target control indicator. Defaults to `'top-right'`. */
  rangeTargetControlGroup?: 'top-right' | 'bottom-left' | 'bottom-right';

  /** Whether to include a detail indicator. Defaults to `true`. */
  includeDetailIndicator?: boolean;

  /** Whether to show the detail indicator title. Defaults to `true`. Ignored if `includeDetailIndicator` is `false`. */
  showDetailIndicatorTitle?: boolean;

  /**
   * A user setting manager containing map settings. If not defined, map options will not be controlled by user
   * settings.
   */
  settingManager?: UserSettingManager<Partial<G3XMapUserSettingTypes>>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

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
   * Whether to bind the display of the compass arc to user settings. Defaults to `true`. Ignored if `settingManager`
   * is not defined.
   */
  useCompassArcUserSettings?: boolean;

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
 * Builds G3X Touch waypoint maps.
 */
export class G3XWaypointMapBuilder {
  /**
   * Configures a map builder to generate a G3X Touch waypoint map.
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
    options: G3XWaypointMapOptions,
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.supportAirportAutoRange ??= false;

    options.includeDragPan ??= true;

    options.useDeclutterUserSetting ??= true;

    options.nexradMinRangeIndex ??= G3XMapUtils.DEFAULT_NEXRAD_MIN_RANGE_INDEX;
    options.useNexradUserSettings ??= true;

    options.useCompassArcUserSettings ??= true;

    options.includeAirspaces ??= true;
    options.useAirspaceVisUserSettings ??= true;

    options.includeRunwayOutlines ??= true;

    options.useWaypointUserSettings ??= true;

    options.includeTrackVector ??= true;
    options.useTrackVectorUserSettings ??= true;

    options.includeAltitudeArc ??= true;
    options.useAltitudeArcUserSettings ??= true;

    options.rangeTargetControlGroup ??= 'top-right';
    options.includeDetailIndicator ??= true;
    options.showDetailIndicatorTitle ??= true;

    mapBuilder
      .withModule(GarminMapKeys.WaypointSelection, () => new WaypointMapSelectionModule())
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.range,
        options.nauticalRangeArray ?? G3XMapUtils.mapRanges(UnitsDistanceSettingMode.Nautical),
        undefined,
        options.settingManager,
        false
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
          [MapTerrainMode.None]: G3XMapUtils.noTerrainEarthColors(),
          [MapTerrainMode.Absolute]: G3XMapUtils.absoluteTerrainEarthColors(),
          [MapTerrainMode.Relative]: G3XMapUtils.relativeTerrainEarthColors(),
          [MapTerrainMode.Ground]: G3XMapUtils.groundTerrainEarthColors()
        }
      )
      .withInit<{ [GarminMapKeys.Terrain]: MapTerrainModule }>('g3xTerrainInit', context => {
        context.model.getModule(GarminMapKeys.Terrain).terrainMode.set(MapTerrainMode.Absolute);
      })
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
      options.useWaypointUserSettings ? options.settingManager : undefined,
      { supportRunwayOutlines: options.includeRunwayOutlines }
    );

    if (options.flightPlanner && options.lnavIndex !== undefined && options.vnavIndex !== undefined) {
      mapBuilder.with(GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
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
        }
      );
    }

    // mapBuilder
    //   .with(GarminMapBuilder.waypointHighlight,
    //     false,
    //     (builder: MapWaypointDisplayBuilder) => {
    //       builder.withHighlightStyles(
    //         options.waypointIconImageCache,
    //         NextGenMapWaypointStyles.highlightIconStyles(5, options.waypointStyleScale),
    //         NextGenMapWaypointStyles.highlightLabelStyles(5, options.waypointStyleFontType, options.waypointStyleScale)
    //       );
    //     }
    //   );

    mapBuilder
      .with(GarminMapBuilder.waypointHighlight,
        false,
        (builder: MapWaypointDisplayBuilder) => {
          builder.withHighlightStyles(
            MapWaypointIconImageCache.getCache(),
            G3XMapWaypointStyles.highlightIconStyles(options.gduFormat, 4),
            G3XMapWaypointStyles.highlightLabelStyles(options.gduFormat, 4)
          );
        }
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

    // Top-right indicators
    if (options.rangeTargetControlGroup === 'top-right') {
      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      const trafficStatusRef = FSComponent.createRef<G3XMapTrafficStatusIndicator>();
      const relTerrainStatusRef = FSComponent.createRef<MapRelativeTerrainStatusIndicator>();

      const subscriptions: Subscription[] = [];

      let needDestroyRangeTargetControl = false;
      if (options.rangeTargetControlGroup === 'top-right') {
        factories.push(rangeTargetControlFactory);
        needDestroyRangeTargetControl = true;
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
    if (options.rangeTargetControlGroup === 'bottom-left') {
      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      let needDestroyRangeTargetControl = false;
      if (options.rangeTargetControlGroup === 'bottom-left') {
        factories.push(rangeTargetControlFactory);
        needDestroyRangeTargetControl = true;
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.BottomLeftIndicators,
        factories,
        {
          onDetached: () => {
            if (needDestroyRangeTargetControl) {
              rangeTargetControlRef.getOrDefault()?.destroy();
            }
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