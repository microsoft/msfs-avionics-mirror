/* eslint-disable jsdoc/require-jsdoc */
import {
  AdsbOperatingMode, FacilityLoader, FacilityRepository, FlightPlanner, FSComponent, MapDataIntegrityModule,
  MapOwnAirplaneIconModule, MapOwnAirplaneIconOrientation, MapOwnAirplanePropsModule, MapSystemBuilder,
  MapSystemContext, MapSystemGenericController, MapSystemKeys, MapTrafficIntruderIconFactory, MutableSubscribable,
  NumberUnitInterface, ReadonlyFloat64Array, ResourceConsumer, ResourceModerator, Subject, Subscribable,
  SubscribableUtils, Subscription, TcasOperatingMode, UnitFamily, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { WaypointIconImageCache } from '../../../graphics/img/WaypointIconImageCache';
import { GarminFacilityWaypointCache } from '../../../navigation/GarminFacilityWaypointCache';
import { TrafficUserSettingTypes } from '../../../settings/TrafficUserSettings';
import { UnitsUserSettingManager } from '../../../settings/UnitsUserSettings';
import { TrafficSystem } from '../../../traffic/TrafficSystem';
import { TrafficSystemType } from '../../../traffic/TrafficSystemType';
import { TrafficMapRangeControllerSettings } from '../controllers';
import {
  DefaultFlightPathPlanRenderer, MapDefaultFlightPlanWaypointRecordManager, MapFlightPathPlanRenderer,
  MapFlightPlanWaypointRecordManager
} from '../flightplan';
import { GarminMapBuilder, TrafficIconOptions, TrafficRangeRingOptions } from '../GarminMapBuilder';
import { GarminMapKeys } from '../GarminMapKeys';
import {
  MapOrientationIndicator, TrafficMapAdsbModeIndicator, TrafficMapAdsbOffBannerIndicator,
  TrafficMapAltitudeModeIndicator, TrafficMapFailedBannerIndicator, TrafficMapOperatingModeIndicator,
  TrafficMapStandbyBannerIndicator
} from '../indicators';
import { MapMiniCompassLayer } from '../layers';
import { MapTrafficOffScaleStatus } from '../MapTrafficOffScaleStatus';
import { MapUtils } from '../MapUtils';
import { MapWaypointDisplayBuilder } from '../MapWaypointDisplayBuilder';
import { MapWaypointRenderer, MapWaypointRenderRole } from '../MapWaypointRenderer';
import { NextGenMapWaypointStyles } from '../MapWaypointStyles';
import {
  MapGarminDataIntegrityModule, MapGarminTrafficModule, MapOrientation, MapOrientationModule, MapTrafficAlertLevelMode,
  MapTrafficAltitudeRestrictionMode, MapUnitsModule
} from '../modules';

/**
 * Options for creating a Garmin traffic map.
 */
export type TrafficMapOptions = {
  /** The facility loader to use. If not defined, then a default instance will be created. */
  facilityLoader?: FacilityLoader;

  /** The traffic system from which to retrieve intruder data. */
  trafficSystem: TrafficSystem;

  /** The frequency, in hertz, with which the player airplane's properties are updated from event bus data. */
  dataUpdateFreq: number | Subscribable<number>;

  /**
   * The nominal projected target offset of the map, as `[x, y]`, where each component is expressed relative to the
   * width or height of the map's projected window, *excluding* the dead zone. Defaults to `[0, 0]`.
   */
  targetOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The nominal range endpoints of the map, as `[x1, y1, x2, y2]`, where each component is expressed relative to the
   * width or height of the map's projected window, *excluding* the dead zone. Defaults to `[0.5, 0.5, 0.5, 0]`.
   */
  rangeEndpoints?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /**
   * The map range array to use for nautical units mode. If not defined, a range array will not automatically be set
   * when entering nautical units mode.
   */
  nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /**
   * The map range array to use for metric units mode. If not defined, a range array will not automatically be set
   * when entering metric units mode.
   */
  metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

  /** Whether to support data integrity state. Defaults to `true`. */
  supportDataIntegrity?: boolean;

  /** Configuration options for traffic icons. */
  trafficIconOptions: TrafficIconOptions;

  /** A mutable subscribable to update with the traffic layer's off-scale intruder status. */
  offScaleStatus?: MutableSubscribable<MapTrafficOffScaleStatus>;

  /**
   * A function which creates intruder icons for the traffic display. If not defined, a default icon of type
   * {@link MapTrafficIntruderIcon} is created for each intruder.
   */
  iconFactory?: MapTrafficIntruderIconFactory,

  /** A function which initializes global canvas styles for the traffic display. */
  initCanvasStyles?: (context: CanvasRenderingContext2D) => void,

  /** Whether to include range rings. */
  includeRangeRings: boolean;

  /**
   * Styling options for the range rings. If not defined, both the outer and inner label radial values are set to 135
   * degrees. Ignored if `includeRangeRings` is `false`.
   */
  rangeRingOptions?: TrafficRangeRingOptions;

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
  flightPlanner?: FlightPlanner | Subscribable<FlightPlanner>;

  /** The index of the LNAV from which to source data. Defaults to `0`. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV from which to source data. Defaults to `0`. */
  vnavIndex?: number | Subscribable<number>;

  /**
   * A function that creates a flight plan waypoint record manager to use to manage the waypoints to draw for the
   * flight plan. Required to display the active flight plan.
   * @param context The map system context.
   * @param waypointRenderer The waypoint renderer used to draw the flight plan waypoints.
   * @returns A flight plan waypoint record manager to use to manage the waypoints to draw for the flight plan.
   */
  flightPlanWaypointRecordManagerFactory?: (context: MapSystemContext<any, any, any, any>, waypointRenderer: MapWaypointRenderer) => MapFlightPlanWaypointRecordManager;

  /**
   * A function that creates a flight path renderer to use to draw the flight plan. Required to display the active
   * flight plan.
   * @param context The map system context.
   * @returns A flight path renderer to use to draw the flight plan.
   */
  flightPathRendererFactory?: (context: MapSystemContext<any, any, any, any>) => MapFlightPathPlanRenderer;

  /** A function which configures the display of flight plan waypoints. Required to display the active flight plan. */
  configureFlightPlan?: (builder: MapWaypointDisplayBuilder) => void;

  /** The URI of the mini-compass's image asset. Required to display the mini-compass. */
  miniCompassImgSrc?: string;

  /** The orientation of the map. */
  orientation: MapOrientation | Subscribable<MapOrientation>;

  /** Whether to include an orientation indicator. Defaults to `true`. */
  includeOrientationIndicator?: boolean;

  /**
   * The text to display in the orientation indicator for each orientation mode. Ignored if
   * `includeOrientationIndicator` is `false`.
   */
  orientationText?: Partial<Record<MapOrientation, string>>;

  /** Whether to include a traffic system operating mode indicator. Defaults to `true`. */
  includeOperatingModeIndicator?: boolean;

  /**
   * The text to display in the traffic system operating mode indicator for each operating mode. Ignored if
   * `includeOperatingModeIndicator` is `false`.
   */
  operatingModeText?: Partial<Record<TcasOperatingMode, string>>;

  /** Whether to include an ADS-B operating mode indicator. Defaults to `true`. Ignored if ADS-B is not supported. */
  includeAdsbModeIndicator?: boolean;

  /**
   * The text to display in the ADS-B operating mode indicator for each operating mode. Ignored if ADS-B is not
   * supported.
   */
  adsbModeText?: Partial<Record<AdsbOperatingMode, string>>;

  /** Whether to include an altitude restriction mode indicator. Defaults to `true`. */
  includeAltitudeModeIndicator?: boolean;

  /**
   * The text to display in the altitude restriction mode indicator for each operating mode. Ignored if
   * `includeAltitudeModeIndicator` is `false`.
   */
  altitudeModeText?: Partial<Record<MapTrafficAltitudeRestrictionMode, string>>;

  /** Whether to include a traffic system standby mode warning banner. Defaults to `true`. */
  includeStandbyBanner?: boolean;

  /** Whether to include an ADS-B standby mode warning banner. Defaults to `true`. Ignored if ADS-B is not supported. */
  includeAdsbOffBanner?: boolean;

  /** Whether to include a traffic system failed mode warning banner. Defaults to `true`. */
  includeFailedBanner?: boolean;

  /**
   * A user setting manager containing settings controlling the operation of the traffic system.
   */
  trafficSettingManager?: UserSettingManager<Partial<TrafficUserSettingTypes>>;

  /**
   * A user setting manager containing the map range setting. If not defined, map range will not be controlled by
   * user setting.
   */
  mapRangeSettingManager?: UserSettingManager<TrafficMapRangeControllerSettings>;

  /** A display units user setting manager. If not defined, map display units will not be controlled by user settings. */
  unitsSettingManager?: UnitsUserSettingManager;

  /**
   * Whether to use the map range user setting to control map range by default. Defaults to `true`. Ignored if
   * `mapRangeSettingManager` is not defined.
   */
  useRangeSettingByDefault?: boolean;
};

/**
 * Configurations for traffic intruder icons for next-generation (NXi, G3000, etc) Garmin traffic maps.
 */
export type NextGenTrafficMapIconOptions
  = Pick<TrafficIconOptions, 'iconSize' | 'font' | 'fontSize'> & Partial<Pick<TrafficIconOptions, 'drawOffScale' | 'supportAdsbVector'>>;

/**
 * Options for creating a next-generation (NXi, G3000, etc) Garmin traffic map.
 */
export type NextGenTrafficMapOptions
  = Omit<
    TrafficMapOptions,
    'nauticalRangeArray' | 'metricRangeArray' | 'trafficIconOptions' | 'includeRangeRings'
    | 'flightPlanWaypointRecordManagerFactory' | 'flightPathRendererFactory' | 'configureFlightPlan'
    | 'orientation' | 'orientationText' | 'operatingModeText' | 'adsbModeText' | 'altitudeModeText' | 'standbyText'
  > & {
    /** Configuration options for traffic icons. */
    trafficIconOptions: NextGenTrafficMapIconOptions;

    /** The image cache from which to retrieve waypoint icon images. */
    waypointIconImageCache: WaypointIconImageCache;

    /** The font type to use for waypoint labels. */
    waypointStyleFontType: 'Roboto' | 'DejaVu';

    /** The scaling factor of waypoint icons and labels. Defaults to `1`. */
    waypointStyleScale?: number;

    /** The map range array to use for nautical units mode. Defaults to a standard range array. */
    nauticalRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

    /** The map range array to use for metric units mode. Defaults to a standard range array. */
    metricRangeArray?: readonly NumberUnitInterface<UnitFamily.Distance>[];

    /** Whether to include range rings. Defaults to `true`. */
    includeRangeRings?: boolean;
  };

/**
 * Builds Garmin traffic maps.
 */
export class TrafficMapBuilder {
  /**
   * Configures a map builder to generate a Garmin traffic map. The map consists of an optional active flight plan
   * layer, an optional traffic range ring layer, a traffic intruder layer, an airplane icon layer, and an optional
   * mini-compass layer. The map is centered on the player airplane and is locked to a Heading Up orientation.
   *
   * The controller `[GarminMapKeys.TrafficRange]: TrafficMapRangeController` is added to the map context and can be
   * used to control the range of the traffic map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static build<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: TrafficMapOptions
  ): MapBuilder {
    options = Object.assign({}, options); // so we don't mutate the object that was passed in.

    options.useRangeSettingByDefault ??= true;

    options.supportDataIntegrity ??= true;

    options.includeOrientationIndicator ??= true;
    options.includeOperatingModeIndicator ??= true;
    options.includeAdsbModeIndicator ??= true;
    options.includeAltitudeModeIndicator ??= true;
    options.includeStandbyBanner ??= true;
    options.includeAdsbOffBanner ??= true;
    options.includeFailedBanner ??= true;

    mapBuilder
      .withContext(MapSystemKeys.FacilityLoader, context => {
        return options.facilityLoader ?? new FacilityLoader(FacilityRepository.getRepository(context.bus));
      })
      .withModule(GarminMapKeys.Units, () => new MapUnitsModule(options.unitsSettingManager))
      .with(GarminMapBuilder.orientation, { [MapOrientation.HeadingUp]: options.targetOffset }, { [MapOrientation.HeadingUp]: options.rangeEndpoints })
      .withController<
        MapSystemGenericController,
        { [GarminMapKeys.Orientation]: MapOrientationModule },
        any, any,
        { [GarminMapKeys.OrientationControl]: ResourceModerator }
      >('trafficMapOrientation', context => {
        const orientation = SubscribableUtils.toSubscribable(options.orientation, true);
        const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
        const orientationPipe = orientation.pipe(orientationModule.orientation, true);
        const orientationControlConsumer: ResourceConsumer = {
          priority: Number.MAX_SAFE_INTEGER,

          onAcquired: () => {
            orientationPipe.resume(true);
          },

          onCeded: () => {
            orientationPipe.pause();
          }
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
            orientationPipe.destroy();
          }
        });
      });

    if (
      options.flightPlanner !== undefined
      && options.flightPlanWaypointRecordManagerFactory !== undefined
      && options.flightPathRendererFactory !== undefined
      && options.configureFlightPlan !== undefined
    ) {
      mapBuilder.with(
        GarminMapBuilder.activeFlightPlan,
        options.flightPlanner,
        options.configureFlightPlan,
        {
          lnavIndex: options.lnavIndex,
          vnavIndex: options.vnavIndex,
          drawEntirePlan: false,
          waypointRecordManagerFactory: options.flightPlanWaypointRecordManagerFactory,
          pathRendererFactory: options.flightPathRendererFactory,
          supportFocus: false
        }
      );
    }

    mapBuilder.with(GarminMapBuilder.trafficRange,
      options.nauticalRangeArray,
      options.metricRangeArray,
      options.mapRangeSettingManager,
      options.useRangeSettingByDefault
    );

    if (options.includeRangeRings) {
      const rangeRingOptions = { ...options.rangeRingOptions };

      rangeRingOptions.outerLabelRadial ??= 135;
      rangeRingOptions.innerLabelRadial ??= 135;

      mapBuilder.with(GarminMapBuilder.trafficRangeRings, rangeRingOptions);
    }

    mapBuilder
      .with(GarminMapBuilder.traffic,
        options.trafficSystem,
        options.trafficIconOptions,
        true,
        options.offScaleStatus,
        options.iconFactory, options.initCanvasStyles,
        options.trafficSettingManager
      )
      .withOwnAirplaneIcon(options.airplaneIconSize, options.airplaneIconSrc, options.airplaneIconAnchor)
      .withOwnAirplanePropBindings([
        'position',
        'hdgTrue',
        'isOnGround'
      ], options.dataUpdateFreq)
      .withFollowAirplane()
      .withInit<{ [MapSystemKeys.OwnAirplaneIcon]: MapOwnAirplaneIconModule }>(MapSystemKeys.OwnAirplaneIconOrientation, context => {
        context.model.getModule(MapSystemKeys.OwnAirplaneIcon).orientation.set(MapOwnAirplaneIconOrientation.MapUp);
      });

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
          [MapSystemKeys.DataIntegrity]?: MapDataIntegrityModule
        }>): VNode => {
          const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
          const dataIntegrityModule = context.model.getModule(MapSystemKeys.DataIntegrity);

          return (
            <MapOrientationIndicator
              ref={ref}
              orientation={orientationModule.orientation}
              text={options.orientationText ?? {}}
              isVisible={dataIntegrityModule?.headingSignalValid ?? Subject.create(true)}
            />
          );
        }],
        { onDetached: () => { ref.getOrDefault()?.destroy(); } },
        'map-indicator-group-top-left'
      );
    }

    // Top-right indicators
    if (options.includeOperatingModeIndicator || (options.trafficSystem.adsb !== null && options.includeAdsbModeIndicator) || options.includeAltitudeModeIndicator) {
      const operatingModeRef = FSComponent.createRef<TrafficMapOperatingModeIndicator>();
      const adsbModeRef = FSComponent.createRef<TrafficMapAdsbModeIndicator>();
      const altitudeModeRef = FSComponent.createRef<TrafficMapAltitudeModeIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeOperatingModeIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapOperatingModeIndicator
                ref={operatingModeRef}
                operatingMode={trafficModule.operatingMode}
                text={options.operatingModeText ?? {}}
              />
            );
          }
        );
      }

      if (options.trafficSystem.adsb !== null && options.includeAdsbModeIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapAdsbModeIndicator
                ref={adsbModeRef}
                operatingMode={trafficModule.adsbOperatingMode}
                text={options.adsbModeText ?? {}}
              />
            );
          }
        );
      }

      if (options.includeAltitudeModeIndicator) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapAltitudeModeIndicator
                ref={altitudeModeRef}
                altitudeRestrictionMode={trafficModule.altitudeRestrictionMode}
                text={options.altitudeModeText ?? {}}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopRightIndicators,
        factories,
        {
          onDetached: () => {
            operatingModeRef.getOrDefault()?.destroy();
            adsbModeRef.getOrDefault()?.destroy();
            altitudeModeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-right'
      );
    }

    // Center indicators
    if (options.includeStandbyBanner || (options.trafficSystem.adsb !== null && options.includeAdsbOffBanner) || options.includeFailedBanner) {
      const standbyRef = FSComponent.createRef<TrafficMapStandbyBannerIndicator>();
      const adsbOffRef = FSComponent.createRef<TrafficMapAdsbOffBannerIndicator>();
      const failedRef = FSComponent.createRef<TrafficMapFailedBannerIndicator>();

      const factories: ((context: MapSystemContext<any, any, any, any>) => VNode)[] = [];

      if (options.includeStandbyBanner) {
        factories.push(
          (context: MapSystemContext<{
            [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const ownAirplanePropsModule = context.model.getModule(MapSystemKeys.OwnAirplaneProps);
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapStandbyBannerIndicator
                ref={standbyRef}
                operatingMode={trafficModule.operatingMode}
                isOnGround={ownAirplanePropsModule.isOnGround}
              />
            );
          }
        );
      }

      if (options.trafficSystem.adsb !== null && options.includeAdsbOffBanner) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapAdsbOffBannerIndicator
                ref={adsbOffRef}
                adsbOperatingMode={trafficModule.adsbOperatingMode}
                trafficOperatingMode={trafficModule.operatingMode}
              />
            );
          }
        );
      }

      if (options.includeFailedBanner) {
        factories.push(
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: MapGarminTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapFailedBannerIndicator
                ref={failedRef}
                operatingMode={trafficModule.operatingMode}
              />
            );
          }
        );
      }

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.CenterIndicators,
        factories,
        {
          onDetached: () => {
            standbyRef.getOrDefault()?.destroy();
            adsbOffRef.getOrDefault()?.destroy();
            failedRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-center'
      );
    }

    if (options.supportDataIntegrity) {
      mapBuilder
        .withModule(MapSystemKeys.DataIntegrity, () => new MapGarminDataIntegrityModule())
        .withController<
          MapSystemGenericController,
          { [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule },
          { [GarminMapKeys.MiniCompass]?: MapMiniCompassLayer }
        >('TrafficMapDataIntegrity', context => {
          let controller: MapSystemGenericController;
          let headingSignalSub: Subscription | undefined;

          // TODO: Hide flight plan
          const miniCompassLayer = context.getLayer(GarminMapKeys.MiniCompass);

          return controller = new MapSystemGenericController(context, {
            onAfterMapRender: (contextArg): void => {
              headingSignalSub = contextArg.model.getModule(MapSystemKeys.DataIntegrity).headingSignalValid.sub(isValid => {
                if (isValid) {
                  miniCompassLayer?.setVisible(true);
                } else {
                  miniCompassLayer?.setVisible(false);
                }
              }, true);
            },

            onMapDestroyed: (): void => {
              controller.destroy();
            },

            onDestroyed: (): void => {
              headingSignalSub?.destroy();
            }
          });
        });
    }

    return mapBuilder.withInit<{
      [GarminMapKeys.Orientation]: MapOrientationModule,
      [GarminMapKeys.Traffic]: MapGarminTrafficModule
    }>('trafficMapInit', context => {
      const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

      trafficModule.show.set(true);
      trafficModule.showIntruderLabel.set(true);
      trafficModule.alertLevelMode.set(MapTrafficAlertLevelMode.All);
    });
  }

  /**
   * Configures a map builder to generate a next-generation (NXi, G3000, etc) Garmin traffic map. The map consists of
   * an optional active flight plan layer, an optional traffic range ring layer, a traffic intruder layer, an airplane
   * icon layer, and an optional mini-compass layer. The map is centered on the player airplane and is locked in
   * Heading Up orientation.
   *
   * The controller `[GarminMapKeys.TrafficRange]: TrafficMapRangeController` is added to the map context and can be
   * used to control the range of the traffic map.
   *
   * The map builder will **not** be configured to apply a custom projected size, dead zone, or to automatically update
   * the map.
   * @param mapBuilder The map builder to configure.
   * @param options Options for configuring the map.
   * @returns The builder, after it has been configured.
   */
  public static buildNextGen<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: NextGenTrafficMapOptions
  ): MapBuilder {
    const optionsToUse = Object.assign({
      orientation: MapOrientation.HeadingUp
    }, options) as TrafficMapOptions;

    optionsToUse.nauticalRangeArray ??= MapUtils.nextGenTrafficMapRanges();
    optionsToUse.metricRangeArray ??= MapUtils.nextGenTrafficMapRanges();

    optionsToUse.trafficIconOptions = Object.assign({}, optionsToUse.trafficIconOptions);
    optionsToUse.trafficIconOptions.drawOffScale ??= true;
    optionsToUse.trafficIconOptions.supportAdsbVector ??= options.trafficSystem.adsb !== null;

    optionsToUse.includeRangeRings ??= true;

    optionsToUse.orientationText = {
      [MapOrientation.HeadingUp]: 'HDG UP'
    };

    let operatingModePrefix = '';
    if (options.trafficSystem.adsb !== null) {
      switch (options.trafficSystem.type) {
        case TrafficSystemType.Tis:
          operatingModePrefix = 'TIS: ';
          break;
        case TrafficSystemType.Tas:
          operatingModePrefix = 'TAS: ';
          break;
        case TrafficSystemType.TcasII:
          operatingModePrefix = 'TCAS: ';
          break;
      }
    }

    if (options.trafficSystem.type === TrafficSystemType.TcasII) {
      optionsToUse.operatingModeText = {
        [TcasOperatingMode.Off]: operatingModePrefix + 'FAIL',
        [TcasOperatingMode.Failed]: operatingModePrefix + 'FAIL',
        [TcasOperatingMode.Standby]: operatingModePrefix + 'STANDBY',
        [TcasOperatingMode.TAOnly]: operatingModePrefix + 'TA ONLY',
        [TcasOperatingMode.TA_RA]: operatingModePrefix + 'TA/RA',
        [TcasOperatingMode.Test]: operatingModePrefix + 'TEST'
      };
    } else {
      optionsToUse.operatingModeText = {
        [TcasOperatingMode.Off]: operatingModePrefix + 'FAILED',
        [TcasOperatingMode.Failed]: operatingModePrefix + 'FAILED',
        [TcasOperatingMode.Standby]: operatingModePrefix + 'STANDBY',
        [TcasOperatingMode.TAOnly]: operatingModePrefix + 'OPERATING',
        [TcasOperatingMode.TA_RA]: operatingModePrefix + 'OPERATING',
        [TcasOperatingMode.Test]: operatingModePrefix + 'TEST'
      };
    }

    optionsToUse.adsbModeText = {
      [AdsbOperatingMode.Standby]: 'ADS-B: OFF',
      [AdsbOperatingMode.Surface]: 'ADS-B: SURF',
      [AdsbOperatingMode.Airborne]: 'ADS-B: AIRB',
    };

    optionsToUse.altitudeModeText = {
      [MapTrafficAltitudeRestrictionMode.Unrestricted]: 'UNRESTRICTED',
      [MapTrafficAltitudeRestrictionMode.Above]: 'ABOVE',
      [MapTrafficAltitudeRestrictionMode.Below]: 'BELOW',
      [MapTrafficAltitudeRestrictionMode.Normal]: 'NORMAL',
    };

    if (options.flightPlanner !== undefined) {
      optionsToUse.flightPlanWaypointRecordManagerFactory = (context, renderer) => {
        return new MapDefaultFlightPlanWaypointRecordManager(
          context[MapSystemKeys.FacilityLoader],
          GarminFacilityWaypointCache.getCache(context.bus),
          renderer,
          MapWaypointRenderRole.FlightPlanInactive,
          MapWaypointRenderRole.FlightPlanActive
        );
      };

      optionsToUse.flightPathRendererFactory = () => new DefaultFlightPathPlanRenderer();

      optionsToUse.configureFlightPlan = (builder): void => {
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
      };
    }

    return mapBuilder.with(TrafficMapBuilder.build, optionsToUse);
  }
}