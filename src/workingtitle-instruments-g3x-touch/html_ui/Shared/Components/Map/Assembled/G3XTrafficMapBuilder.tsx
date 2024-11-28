/* eslint-disable jsdoc/require-jsdoc */

import {
  FSComponent, FacilityLoader, FacilityRepository, MapDataIntegrityModule, MapSystemBuilder, MapSystemContext,
  MapSystemKeys, MappedSubscribable, NumberFormatter, NumberUnitInterface, Subject, Subscribable, TcasOperatingMode,
  Unit, UnitFamily, UserSettingManager, VNode, Vec2Math
} from '@microsoft/msfs-sdk';

import {
  DefaultFlightPathPlanRenderer, GarminFacilityWaypointCache, GarminMapBuilder, GarminMapKeys,
  MapDefaultFlightPlanWaypointRecordManager, MapOrientation, MapOrientationIndicator, MapOrientationModule,
  MapTrafficAltitudeRestrictionMode, MapWaypointRenderRole, TrafficIconOptions, TrafficMapAltitudeModeIndicator,
  TrafficMapBuilder, TrafficMapOptions, TrafficRangeRingOptions
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../../CommonTypes';
import { GduUserSettingTypes } from '../../../Settings/GduUserSettings';
import { G3XNumberUnitDisplay } from '../../Common/G3XNumberUnitDisplay';
import { MapDataIntegrityController, MapDataIntegrityControllerModules } from '../Controllers/MapDataIntegrityController';
import { G3XMapUtils } from '../G3XMapUtils';
import { G3XMapWaypointStyles } from '../G3XMapWaypointStyles';
import {
  G3XMapTrafficStatusIndicator, G3XTrafficMapOperatingModeIndicator, TrafficMapCombinedIndicator,
  TrafficMapRangeControlIndicator, TrafficMapRangeControlIndicatorControllers
} from '../Indicators';
import { MapWaypointIconImageCache } from '../MapWaypointIconImageCache';
import { G3XMapTrafficModule, G3XTrafficSystemSource } from '../Modules';

/**
 * Configuration options for traffic intruder icons for G3X Touch traffic maps.
 */
export type G3XTrafficMapIconOptions = Pick<TrafficIconOptions, 'iconSize' | 'fontSize'>;

/**
 * Options for creating a base G3X Touch traffic map.
 */
type G3XTrafficMapBaseOptions = Pick<
  TrafficMapOptions,
  'trafficSystem' | 'dataUpdateFreq' | 'targetOffset' | 'rangeEndpoints' | 'offScaleStatus' | 'rangeRingOptions'
  | 'airplaneIconSrc' | 'flightPlanner' | 'includeStandbyBanner' | 'includeFailedBanner' | 'trafficSettingManager'
  | 'unitsSettingManager'
> & {
  /** The format of the map's parent GDU. */
  gduFormat: GduFormat;

  /** The index of the GDU from which the map sources data. */
  gduIndex: number;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** The source of traffic data. */
  trafficSource: G3XTrafficSystemSource;

  /** Configuration options for traffic icons. */
  trafficIconOptions: G3XTrafficMapIconOptions;

  /** Whether to include range rings. Defaults to `true`. */
  includeRangeRings?: boolean;

  /** The index of the LNAV instance associated with the active flight plan. Required to display the active flight plan. */
  lnavIndex?: number | Subscribable<number>;

  /** The index of the VNAV instance associated with the active flight plan. Required to display the active flight plan. */
  vnavIndex?: number | Subscribable<number>;
}

/**
 * Options for creating a G3X Touch traffic map.
 */
export type G3XTrafficMapOptions = G3XTrafficMapBaseOptions;

/**
 * Options for creating a G3X Touch traffic inset map.
 */
export type G3XTrafficInsetMapOptions = G3XTrafficMapBaseOptions & {
  /** The indicator group in which to render the range control indicator. */
  rangeControlGroup: 'bottom-left' | 'bottom-right';
};

/**
 * Builds G3X Touch traffic maps.
 */
export class G3XTrafficMapBuilder {
  private static readonly RANGE_FORMATTER = NumberFormatter.create({ precision: 0.1, forceDecimalZeroes: false });

  /**
   * Configures a map builder to generate a base G3X Touch traffic map. The map consists of an optional active flight
   * plan layer, an optional traffic range ring layer, a traffic intruder layer, and an airplane icon layer. The map is
   * centered on the player airplane and is locked in Heading Up orientation. No indicators are added to the map except
   * for center banner indicators.
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
  private static buildBase<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: G3XTrafficMapBaseOptions
  ): MapBuilder {
    const trafficIconOptions = Object.assign({}, options.trafficIconOptions, {
      font: 'DejaVuSans-SemiBold',
      drawOffScale: true,
      supportAdsbVector: options.trafficSystem.adsb !== null
    }) as TrafficIconOptions;

    const rangeRingOptions = Object.assign({}, {
      outerStrokeWidth: 1,
      outerStrokeDash: [6, 6],
      outerOutlineWidth: 1,
      outerOutlineStyle: '#404040',

      innerStrokeWidth: 1,
      innerStrokeDash: [6, 6],
      innerOutlineWidth: 1,
      innerOutlineStyle: '#404040',

      outerMajorTickSize: 8,
      outerMinorTickSize: 8,
      innerMajorTickSize: 8,
      innerMinorTickSize: 8,

      outerMinorTickColor: '#b0b0b0',
      innerMinorTickColor: '#b0b0b0',

      renderLabel: (range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>, displayUnit: Subscribable<Unit<UnitFamily.Distance>>) => {
        return (
          <G3XNumberUnitDisplay
            value={range}
            displayUnit={displayUnit}
            formatter={G3XTrafficMapBuilder.RANGE_FORMATTER}
            class='traffic-map-range-display'
          />
        );
      }
    }, options.rangeRingOptions) as TrafficRangeRingOptions;

    const optionsToUse = Object.assign({}, options, {
      orientation: MapOrientation.HeadingUp,
      trafficIconOptions,
      rangeRingOptions,
      airplaneIconSize: G3XMapUtils.ownAirplaneIconSize(options.gduFormat),
      airplaneIconAnchor: Vec2Math.create(0.5, 0.5),
      includeOrientationIndicator: false,
      includeOperatingModeIndicator: false,
      includeAdsbModeIndicator: false,
      includeAltitudeModeIndicator: false,
      includeAdsbOffBanner: false,
    }) as TrafficMapOptions;

    optionsToUse.nauticalRangeArray ??= G3XMapUtils.trafficMapRanges();
    optionsToUse.metricRangeArray ??= G3XMapUtils.trafficMapRanges();

    optionsToUse.includeRangeRings ??= true;

    optionsToUse.orientationText = {
      [MapOrientation.HeadingUp]: 'HDG UP'
    };

    // Do not render active flight plan unless both LNAV and VNAV index are defined.
    if (optionsToUse.flightPlanner && optionsToUse.lnavIndex !== undefined && optionsToUse.vnavIndex !== undefined) {
      optionsToUse.flightPlanWaypointRecordManagerFactory = (context, renderer) => {
        return new MapDefaultFlightPlanWaypointRecordManager(
          new FacilityLoader(FacilityRepository.getRepository(context.bus)),
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
      };
    } else {
      optionsToUse.flightPlanner = undefined;
    }

    return mapBuilder.with(TrafficMapBuilder.build, optionsToUse)
      .withModule(GarminMapKeys.Traffic, () => new G3XMapTrafficModule(options.trafficSystem))
      .withInit<{ [GarminMapKeys.Traffic]: G3XMapTrafficModule }>('trafficSourceInit', context => {
        context.model.getModule(GarminMapKeys.Traffic).source.set(options.trafficSource);
      })
      .withController<MapDataIntegrityController, MapDataIntegrityControllerModules>(
        MapSystemKeys.DataIntegrity,
        context => new MapDataIntegrityController(context, options.gduIndex, options.gduSettingManager)
      );
  }

  /**
   * Configures a map builder to generate a G3X Touch traffic map. The map consists of an optional active flight
   * plan layer, an optional traffic range ring layer, a traffic intruder layer, and an airplane icon layer. The map is
   * centered on the player airplane and is locked in Heading Up orientation.
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
    options: G3XTrafficMapOptions
  ): MapBuilder {
    mapBuilder.with(G3XTrafficMapBuilder.buildBase, options);

    // Top-left indicators
    {
      const combinedRef = FSComponent.createRef<TrafficMapCombinedIndicator>();
      const statusRef = FSComponent.createRef<G3XMapTrafficStatusIndicator>();

      let showStatusIndicator: MappedSubscribable<boolean> | undefined;

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopLeftIndicators,
        [
          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: G3XMapTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

            return (
              <TrafficMapCombinedIndicator
                ref={combinedRef}
                operatingMode={trafficModule.operatingMode}
                source={trafficModule.source}
                supportAdsb={Subject.create(options.trafficSystem.adsb !== null)}
                adsbOperatingMode={trafficModule.adsbOperatingMode}
                altitudeRestrictionMode={trafficModule.altitudeRestrictionMode}
              />
            );
          },

          (context: MapSystemContext<{
            [GarminMapKeys.Traffic]: G3XMapTrafficModule
          }>): VNode => {
            const trafficModule = context.model.getModule(GarminMapKeys.Traffic);
            showStatusIndicator = trafficModule.operatingMode.map(mode => {
              return mode === TcasOperatingMode.TA_RA || mode === TcasOperatingMode.TAOnly;
            });

            return (
              <div class='map-status-indicator-container'>
                <G3XMapTrafficStatusIndicator
                  ref={statusRef}
                  show={showStatusIndicator}
                  operatingMode={trafficModule.operatingMode}
                />
              </div>
            );
          }
        ],
        {
          onDetached: () => {
            showStatusIndicator?.destroy();

            combinedRef.getOrDefault()?.destroy();
            statusRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-left'
      );
    }

    // Top-right indicators
    {
      const orientationRef = FSComponent.createRef<MapOrientationIndicator>();
      const rangeControlRef = FSComponent.createRef<TrafficMapRangeControlIndicator>();

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopRightIndicators,
        [
          (context: MapSystemContext<{
            [GarminMapKeys.Orientation]: MapOrientationModule,
            [MapSystemKeys.DataIntegrity]: MapDataIntegrityModule
          }>): VNode => {
            const orientationModule = context.model.getModule(GarminMapKeys.Orientation);
            const dataIntegrityModule = context.model.getModule(MapSystemKeys.DataIntegrity);

            return (
              <MapOrientationIndicator
                ref={orientationRef}
                orientation={orientationModule.orientation}
                text={{
                  [MapOrientation.HeadingUp]: 'HDG UP'
                }}
                isVisible={dataIntegrityModule.headingSignalValid}
              />
            );
          },

          (context: MapSystemContext<
            any,
            any,
            TrafficMapRangeControlIndicatorControllers
          >): VNode => {
            return (
              <TrafficMapRangeControlIndicator
                ref={rangeControlRef}
                context={context}
              />
            );
          }
        ],
        {
          onDetached: () => {
            orientationRef.getOrDefault()?.destroy();
            rangeControlRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-right'
      );
    }

    return mapBuilder;
  }

  /**
   * Configures a map builder to generate a G3X Touch traffic inset map. The map consists of an optional active flight
   * plan layer, an optional traffic range ring layer, a traffic intruder layer, and an airplane icon layer. The map is
   * centered on the player airplane and is locked in Heading Up orientation.
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
  public static buildInset<MapBuilder extends MapSystemBuilder>(
    mapBuilder: MapBuilder,
    options: G3XTrafficInsetMapOptions
  ): MapBuilder {
    mapBuilder.with(G3XTrafficMapBuilder.buildBase, options);

    // Top-left indicators
    {
      const modeRef = FSComponent.createRef<G3XTrafficMapOperatingModeIndicator>();

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopLeftIndicators,
        [(context: MapSystemContext<{
          [GarminMapKeys.Traffic]: G3XMapTrafficModule
        }>): VNode => {
          const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

          return (
            <G3XTrafficMapOperatingModeIndicator
              ref={modeRef}
              operatingMode={trafficModule.operatingMode}
              source={trafficModule.source}
              supportAdsb={Subject.create(options.trafficSystem.adsb !== null)}
            />
          );
        }],
        {
          onDetached: () => {
            modeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-left'
      );
    }

    // Top-right indicators
    {
      const altitudeRef = FSComponent.createRef<TrafficMapAltitudeModeIndicator>();

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        GarminMapKeys.TopRightIndicators,
        [(context: MapSystemContext<{
          [GarminMapKeys.Traffic]: G3XMapTrafficModule
        }>): VNode => {
          const trafficModule = context.model.getModule(GarminMapKeys.Traffic);

          return (
            <TrafficMapAltitudeModeIndicator
              ref={altitudeRef}
              altitudeRestrictionMode={trafficModule.altitudeRestrictionMode}
              text={{
                [MapTrafficAltitudeRestrictionMode.Normal]: 'Normal',
                [MapTrafficAltitudeRestrictionMode.Above]: 'Above',
                [MapTrafficAltitudeRestrictionMode.Below]: 'Below',
                [MapTrafficAltitudeRestrictionMode.Unrestricted]: 'Unrestricted',
              }}
            />
          );
        }],
        {
          onDetached: () => {
            altitudeRef.getOrDefault()?.destroy();
          }
        },
        'map-indicator-group-top-right'
      );
    }

    let rangeControlIndicatorGroupKey: string;
    let rangeControlIndicatorGroupClass: string;

    let statusIndicatorGroupKey: string;
    let statusIndicatorGroupClass: string;

    if (options.rangeControlGroup === 'bottom-left') {
      rangeControlIndicatorGroupKey = GarminMapKeys.BottomLeftIndicators;
      rangeControlIndicatorGroupClass = 'map-indicator-group-bottom-left';

      statusIndicatorGroupKey = GarminMapKeys.BottomRightIndicators;
      statusIndicatorGroupClass = 'map-indicator-group-bottom-right';
    } else {
      rangeControlIndicatorGroupKey = GarminMapKeys.BottomRightIndicators;
      rangeControlIndicatorGroupClass = 'map-indicator-group-bottom-right';

      statusIndicatorGroupKey = GarminMapKeys.BottomLeftIndicators;
      statusIndicatorGroupClass = 'map-indicator-group-bottom-left';
    }

    // Range control indicator
    {
      const rangeControlRef = FSComponent.createRef<TrafficMapRangeControlIndicator>();

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        rangeControlIndicatorGroupKey,
        [(context: MapSystemContext<
          any,
          any,
          TrafficMapRangeControlIndicatorControllers
        >): VNode => {
          return (
            <TrafficMapRangeControlIndicator
              ref={rangeControlRef}
              context={context}
            />
          );
        }],
        {
          onDetached: () => {
            rangeControlRef.getOrDefault()?.destroy();
          }
        },
        rangeControlIndicatorGroupClass
      );
    }

    // Status indicators
    {
      const statusRef = FSComponent.createRef<G3XMapTrafficStatusIndicator>();

      let showStatusIndicator: MappedSubscribable<boolean> | undefined;

      mapBuilder.with(GarminMapBuilder.indicatorGroup,
        statusIndicatorGroupKey,
        [(context: MapSystemContext<{
          [GarminMapKeys.Traffic]: G3XMapTrafficModule
        }>): VNode => {
          const trafficModule = context.model.getModule(GarminMapKeys.Traffic);
          showStatusIndicator = trafficModule.operatingMode.map(mode => {
            return mode === TcasOperatingMode.TA_RA || mode === TcasOperatingMode.TAOnly;
          });

          return (
            <div class='map-status-indicator-container'>
              <G3XMapTrafficStatusIndicator
                ref={statusRef}
                show={showStatusIndicator}
                operatingMode={trafficModule.operatingMode}
              />
            </div>
          );
        }],
        {
          onDetached: () => {
            showStatusIndicator?.destroy();

            statusRef.getOrDefault()?.destroy();
          }
        },
        statusIndicatorGroupClass
      );
    }

    return mapBuilder;
  }
}