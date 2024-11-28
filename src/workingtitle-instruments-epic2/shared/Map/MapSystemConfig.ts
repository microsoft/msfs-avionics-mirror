/* eslint-disable max-len */
/* eslint-disable jsdoc/require-jsdoc */
import {
  AbstractMapTrafficIntruderIcon, APLateralModes, BitFlags, EventBus, FacilityType, FacilityWaypoint, FlightPathLegRenderPart, FlightPathRenderStyle,
  FlightPathVectorStyle, FlightPathWaypoint, FlightPlan, FlightPlanDisplayBuilder, GNSSEvents, ICAO, ImageCache, LegDefinition, LegDefinitionFlags,
  MapCullableLocationTextLabel, MapFlightPlanModule, MapLocationTextLabelOptions, MapSystemContext, MapSystemKeys, MapSystemWaypointRoles, MapWaypointImageIcon,
  PerformancePlanRepository, Subject, Subscribable, TcasIntruder, Vec2Math, VorFacility, VorType, Waypoint, WaypointDisplayBuilder, WaypointTypes
} from '@microsoft/msfs-sdk';

import { Epic2FmaEvents } from '../Autopilot';
import { Epic2FlightArea, Epic2FmsUtils } from '../Fms';
import { Epic2Colors } from '../Misc/Epic2Colors';
import { FmcSimVarEvents } from '../Misc/FmcSimVars';
import { Epic2LNavDataEvents } from '../Navigation';
import { Epic2PerformancePlan } from '../Performance';
import { Epic2TcasIntruder } from '../Traffic';
import { ActiveWaypointIcon } from './ActiveWaypoint';
import { AirportSize, AirportWaypoint } from './AirportWaypoint';
import { Epic2FacilityWaypointCache } from './Epic2FacilityWaypointCache';
import { Epic2MapModules } from './Epic2MapModules';
import { Epic2MapLabelPriority, EpicMapCommon, MapWaypointsDisplay } from './EpicMapCommon';
import { FlightPathWaypointLabel } from './FlightPathWaypointLabel';
import { MapAirportIcon } from './MapAirportIcon';
import { MapDataProvider } from './MapDataProvider';
import { MapDynamicWaypointImageIcon } from './MapDynamicWaypointIcon';
import { MapSystemCommon } from './MapSystemCommon';
import { MapTrafficIntruderIcon } from './MapTrafficIntruderIcon';
import { MapStyles } from './Modules/MapStylesModule';
import { VNavDataModule } from './Modules/VNavDataModule';

// const nonFixLegTypes = [LegType.CA, LegType.CI, LegType.CR, LegType.FA, LegType.FM, LegType.VA, LegType.VI, LegType.VM, LegType.VR];

/**
 * A map system config for Boeing maps.
 */
export class MapSystemConfig {
  private readonly ICON_SIZE = Vec2Math.create(this.mapStyles.mapIconSize, this.mapStyles.mapIconSize);
  private readonly LNAV_ENGAGED_MODES = [APLateralModes.GPSS, APLateralModes.NAV];

  private readonly MagentaPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.magenta,
    outlineWidth: this.mapStyles.outlineWidth,
  };

  private readonly GreenPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.green,
    outlineWidth: this.mapStyles.outlineWidth,
  };

  private readonly WhitePath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.white,
    outlineWidth: this.mapStyles.outlineWidth,
  };

  private readonly WhiteDashedPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.white,
    dash: [14, 10],
    outlineWidth: this.mapStyles.outlineWidth,
    lineCap: 'round',
  };

  private readonly WhiteDottedPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: (this.mapStyles.strokeWidth + 1) * 1.5,
    style: Epic2Colors.white,
    dash: [0.75, 10],
    outlineWidth: this.mapStyles.outlineWidth,
    lineCap: 'round',
  };

  private readonly CyanDashedPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.cyan,
    dash: [24, 10],
    outlineWidth: this.mapStyles.outlineWidth,
    lineCap: 'round',
  };

  private readonly CyanPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: this.mapStyles.strokeWidth + 1,
    style: Epic2Colors.cyan,
    outlineWidth: this.mapStyles.outlineWidth,
  };

  private readonly HoldLegWhitePath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildWhiteHoldStyle.bind(this)
  };

  private readonly HoldLegMagentaPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildMagentaHoldStyle.bind(this)
  };

  private readonly HoldLegGreenPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildGreenHoldStyle.bind(this)
  };

  private readonly HoldLegCyanPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildCyanHoldStyle.bind(this)
  };

  private readonly HoldLegWhiteDashedPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildWhiteDashedHoldStyle.bind(this)
  };

  private readonly HoldLegWhiteDottedPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildWhiteDottedHoldStyle.bind(this)
  };

  private readonly HoldLegCyanDashedPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: this.buildCyanDashedHoldStyle.bind(this)
  };

  private readonly FlightPathWaypointLabelOptions: MapLocationTextLabelOptions = {
    fontSize: this.mapStyles.labelFontSize,
    font: EpicMapCommon.font,
    fontOutlineWidth: this.mapStyles.fontOutlineWidth,
    fontOutlineColor: Epic2Colors.black,
    offset: this.mapStyles.labelOffset,
  } as const;

  /**
   * Creates a new map system config.
   * @param mapStyles the Epic2 map styles.
   */
  public constructor(private readonly mapStyles: MapStyles) { }

  /**
   * Builds non-active leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildWhiteHoldStyle(): FlightPathRenderStyle {
    return this.WhitePath;
  }

  /**
   * Builds active leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildMagentaHoldStyle(): FlightPathRenderStyle {
    return this.MagentaPath;
  }

  /**
   * Builds active leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildGreenHoldStyle(): FlightPathRenderStyle {
    return this.GreenPath;
  }

  /**
   * Builds leg style for hold legs on the missed approach.
   * @returns The appropriate hold leg display style.
   */
  private buildCyanHoldStyle(): FlightPathRenderStyle {
    return this.CyanPath;
  }

  /**
   * Builds mod leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildWhiteDashedHoldStyle(): FlightPathRenderStyle {
    return this.WhiteDashedPath;
  }

  /**
   * Builds mod leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildWhiteDottedHoldStyle(): FlightPathRenderStyle {
    return this.WhiteDottedPath;
  }

  /**
   * Builds inactive plan leg style for hold legs.
   * @returns The appropriate hold leg display style.
   */
  private buildCyanDashedHoldStyle(): FlightPathRenderStyle {
    return this.CyanDashedPath;
  }

  /**
   * Builds a label for facility waypoints.
   * @param color The color of the label.
   * @param maxRange The max range at which this label should be visible.
   * @param currentRange The current range setting of the map.
   * @param options Additional options for the label.
   * @returns A new factory that will create the label.
   */
  private buildFacilityLabel(
    color: string,
    maxRange: number,
    currentRange: Subscribable<number>,
    options?: Partial<MapLocationTextLabelOptions>
  ): (w: FacilityWaypoint) => MapCullableLocationTextLabel {
    return (w: FacilityWaypoint): MapCullableLocationTextLabel => {
      const defaultOptions: MapLocationTextLabelOptions = {
        fontColor: color,
        font: EpicMapCommon.font,
        fontOutlineWidth: this.mapStyles.fontOutlineWidth,
        fontOutlineColor: Epic2Colors.black,
        offset: this.mapStyles.labelOffset,
        anchor: this.mapStyles.labelAnchor,
      };

      // check if it's a large airport
      const isLargerAirport = w instanceof AirportWaypoint && w.size !== AirportSize.Small;
      if (!isLargerAirport) {
        defaultOptions.fontSize = currentRange.map(range => range <= maxRange ? this.mapStyles.labelFontSize : 0);

      } else {
        defaultOptions.fontSize = currentRange.map(range => range <= 50 ? this.mapStyles.labelFontSize : 0);
      }

      const mergedOptions: MapLocationTextLabelOptions = {
        ...defaultOptions,
        ...options
      };

      const label = new MapCullableLocationTextLabel(
        ICAO.getIdent(w.facility.get().icao),
        Epic2MapLabelPriority.Bottom,
        w.location,
        false,
        mergedOptions
      );

      return label;
    };
  }

  /**
   * Builds a label for flight plan waypoints.
   * @param fontColor The color of the label.
   * @param displaySetting The 'mapWaypointsDisplay' setting.
   * @param vnavDataModule The vnav data module.
   * @param perfPlanRepository The perfPlanRepository.
   * @returns A new factory that will create the label.
   */
  private buildFlightPlanLabel(
    fontColor: string,
    displaySetting?: Subscribable<MapWaypointsDisplay>,
    vnavDataModule?: VNavDataModule,
    perfPlanRepository?: PerformancePlanRepository<Epic2PerformancePlan>,
  ): (w: FlightPathWaypoint) => FlightPathWaypointLabel {
    return w => new FlightPathWaypointLabel(
      w,
      displaySetting,
      { fontColor, ...this.FlightPathWaypointLabelOptions },
      this.mapStyles.labelLineHeight,
      vnavDataModule,
      perfPlanRepository,
    );
  }

  /**
   * Builds an icon for a waypoint.
   * @param id The ID of the icon.
   * @param priority The render priority of this icon.
   * @returns A factory that builds the image icon.
   */
  private buildActiveWaypointIcon(id: string, priority = 0): (w: Waypoint) => MapWaypointImageIcon<any> {
    return (w: Waypoint) => new ActiveWaypointIcon(w, priority, ImageCache.get(id), this.ICON_SIZE);
  }

  /**
   * Configures the map waypoint display layer.
   * @param bus The event bus.
   * @param mapDataProvider The map data provider.
   * @returns A builder function to configure the waypoint display system.
   */
  public readonly configureMapWaypoints = (bus: EventBus, mapDataProvider: MapDataProvider): (builder: WaypointDisplayBuilder) => void => {
    return (builder): void => {
      builder.withSearchCenter('target');
      this.configWptRoles(MapSystemWaypointRoles.Normal, builder, mapDataProvider.mapRange);
      builder.withWaypointCache(Epic2FacilityWaypointCache.getCache(bus));
    };
  };

  /**
   * Configures the map waypoint role styles.
   * @param role The role to configure.
   * @param builder The waypoint display builder
   * @param rangeSetting The map range setting.
   */
  private configWptRoles(role: number | string, builder: WaypointDisplayBuilder, rangeSetting: Subscribable<number>): void {
    builder
      .addDefaultIcon(role, (w) => new MapWaypointImageIcon(w, 0, ImageCache.get('INTERSECTION'), this.ICON_SIZE))
      .addDefaultLabel(role, this.buildFacilityLabel(Epic2Colors.white, 3, rangeSetting, {
        anchor: MapSystemCommon.labelAnchorBottomRight,
        offset: MapSystemCommon.labelOffsetBottomRight
      })) // intersection
      .addLabel(role, WaypointTypes.Airport, this.buildFacilityLabel(Epic2Colors.lightCyan, 5, rangeSetting))
      .addIcon(role, WaypointTypes.Airport, (w: AirportWaypoint) => new MapAirportIcon(w, 0, ImageCache.get('AIRPORT'), ImageCache.get('AIRPORT_DOT'), this.ICON_SIZE, rangeSetting))
      .addLabel(role, WaypointTypes.NDB, this.buildFacilityLabel(Epic2Colors.white, 50, rangeSetting,
        {
          anchor: MapSystemCommon.labelAnchorBottomLeft,
          offset: MapSystemCommon.labelOffsetBottomLeft
        }
      ))
      .addIcon(role, WaypointTypes.NDB, (w) => new MapWaypointImageIcon(w, 0, ImageCache.get('NDB'), this.ICON_SIZE))
      .addLabel(role, WaypointTypes.VOR, this.buildFacilityLabel(Epic2Colors.white, 100, rangeSetting,
        {
          anchor: MapSystemCommon.labelAnchorTopLeft,
          offset: MapSystemCommon.labelOffsetAnchorTopLeft
        }))
      .addIcon(role, WaypointTypes.VOR, (w: FacilityWaypoint<VorFacility>) => {
        switch (w.facility.get().type) {
          case VorType.VOR:
            return new MapDynamicWaypointImageIcon(w, 0, ImageCache.get('VOR'), ImageCache.get('DOT'), this.ICON_SIZE, 100, rangeSetting);
          case VorType.VORDME:
            return new MapDynamicWaypointImageIcon(w, 0, ImageCache.get('VORDME'), ImageCache.get('DOT'), this.ICON_SIZE, 100, rangeSetting);
          case VorType.DME:
            return new MapDynamicWaypointImageIcon(w, 0, ImageCache.get('DME'), ImageCache.get('DOT'), this.ICON_SIZE, 100, rangeSetting);
          case VorType.TACAN:
            return new MapDynamicWaypointImageIcon(w, 0, ImageCache.get('TACAN'), ImageCache.get('DOT'), this.ICON_SIZE, 100, rangeSetting);
          default:
            return new MapDynamicWaypointImageIcon(w, 0, ImageCache.get('VORTAC'), ImageCache.get('DOT'), this.ICON_SIZE, 100, rangeSetting);
        }
      });
  }

  /**
   * Configures the map flight plan display layer.
   * @param bus The event bus to use.
   * @param ndDataProvider The ND data provider.
   * @param vnavDataModule The vnav data module.
  //  * @param activeRoutePredictor The active route predictor.
   * @param perfPlanRepository The perfPlanRepository.
   * @returns A builder function to configure the flight plan display system.
   */
  public readonly configureFlightPlan = (
    bus: EventBus,
    ndDataProvider: MapDataProvider,
    vnavDataModule: VNavDataModule,
    // activeRoutePredictor: FlightPlanPredictionsProvider,
    perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>,
  ): (builder: FlightPlanDisplayBuilder, context: MapSystemContext<{ [MapSystemKeys.FlightPlan]: MapFlightPlanModule }>) => void => {

    return (builder): void => {

      const flightPlanLabelArgs = [ndDataProvider.mapWaypointsDisplay, vnavDataModule, perfPlanRepository] as const;

      const effectiveLegIndex = Subject.create(-1);
      const isTracking = Subject.create(false);

      const sub = bus.getSubscriber<Epic2FmaEvents & Epic2LNavDataEvents & GNSSEvents>();

      sub.on('lnavdata_nominal_leg_index').handle(effectiveLegIndex.set.bind(effectiveLegIndex));
      sub.on('epic2_fma_data').handle((data) => isTracking.set(this.LNAV_ENGAGED_MODES.includes(data.lateralActive)));

      builder.registerRole(ActivePlanWaypointRoles.Active_Tracked_Star)
        .registerRole(ActivePlanWaypointRoles.Active_Untracked_Star)
        .registerRole(ActivePlanWaypointRoles.Active_Tracked_Circle)
        .registerRole(ActivePlanWaypointRoles.Active_Untracked_Circle)
        .registerRole(ActivePlanWaypointRoles.Inactive_Star)
        .registerRole(ActivePlanWaypointRoles.Inactive_Circle)
        .addDefaultIcon(ActivePlanWaypointRoles.Active_Tracked_Star, this.buildActiveWaypointIcon('FLIGHTPLAN_M', 999))
        // .addDefaultIcon(ActivePlanWaypointRoles.Active_Tracked_Circle, this.buildActiveWaypointIcon('FLIGHTPLAN_CIRCLE_MAGENTA', 999))
        .addDefaultIcon(ActivePlanWaypointRoles.Active_Untracked_Star, this.buildActiveWaypointIcon('FLIGHTPLAN_G', 999))
        // .addDefaultIcon(ActivePlanWaypointRoles.Active_Untracked_Circle, this.buildActiveWaypointIcon('FLIGHTPLAN_CIRCLE_GREEN', 999))
        .addDefaultIcon(ActivePlanWaypointRoles.Inactive_Star, (w) => new MapWaypointImageIcon(w, 999, ImageCache.get('FLIGHTPLAN'), this.ICON_SIZE))
        // .addDefaultIcon(ActivePlanWaypointRoles.Inactive_Circle, this.buildIcon('FLIGHTPLAN_CIRCLE_WHITE', 999))
        // 787 does show DATA for all legs in active route
        .addLabel(ActivePlanWaypointRoles.Active_Tracked_Star, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.magenta, ...flightPlanLabelArgs))
        // .addLabel(ActivePlanWaypointRoles.Active_Tracked_Circle, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.magenta, ...flightPlanLabelArgs))
        .addLabel(ActivePlanWaypointRoles.Active_Untracked_Star, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.green, ...flightPlanLabelArgs))
        // .addLabel(ActivePlanWaypointRoles.Active_Untracked_Circle, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.green, ...flightPlanLabelArgs))
        .addLabel(ActivePlanWaypointRoles.Inactive_Star, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.white, ...flightPlanLabelArgs))
        // .addLabel(ActivePlanWaypointRoles.Inactive_Circle, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.white, ...flightPlanLabelArgs))
        .withAnticipationTurns(true)
        .withLegPathStyles((plan, leg, activeLeg, legIndex) => {
          const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
          const isHoldLeg = Epic2FmsUtils.isHoldAtLeg(leg.leg.type);
          // const activeLegIndex =
          if (isMissedApproachLeg) {
            // We only want the MAP legs to be in cyan if we are not already in the missed approach
            if (!ndDataProvider.isMissedApproachActive.get()) {
              if (!BitFlags.isAny(ndDataProvider.mapWaypointsDisplay.get(), MapWaypointsDisplay.MissedApproach)) {
                return FlightPathRenderStyle.Hidden;
              }

              return isHoldLeg ? this.HoldLegWhiteDottedPath : this.WhiteDottedPath;
            }
          }

          if (legIndex > effectiveLegIndex.get()) {
            return isHoldLeg ? this.HoldLegWhitePath : this.WhitePath;
          } else if (legIndex === effectiveLegIndex.get()) {
            if (isTracking.get()) {
              return isHoldLeg ? this.HoldLegMagentaPath : this.MagentaPath;
            } else {
              return isHoldLeg ? this.HoldLegGreenPath : this.GreenPath;
            }
          }
          return FlightPathRenderStyle.Hidden;
        })
        .withLegWaypointRoles((plan, leg, activeLeg, legIndex) => {
          if (this.isOriginDestOrRunwayLeg(plan, leg)) {
            return 0;
          }

          const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
          if (isMissedApproachLeg) {
            // We only want the MAP legs to be in cyan if we are not already in the missed approach
            if (!ndDataProvider.isMissedApproachActive.get()) {
              if (!BitFlags.isAny(ndDataProvider.mapWaypointsDisplay.get(), MapWaypointsDisplay.MissedApproach)) {
                return 0;
              }
            }
          }

          // Legs with no fix are shown as a circle
          const useCircleIcon = false; //nonFixLegTypes.includes(leg.leg.type);


          if (legIndex > effectiveLegIndex.get()) {
            return builder.getRoleId(useCircleIcon ? ActivePlanWaypointRoles.Inactive_Circle : ActivePlanWaypointRoles.Inactive_Star);
          } else if (legIndex === effectiveLegIndex.get()) {
            if (isTracking.get()) {
              return builder.getRoleId(useCircleIcon ? ActivePlanWaypointRoles.Active_Tracked_Circle : ActivePlanWaypointRoles.Active_Tracked_Star);
            } else {
              return builder.getRoleId(useCircleIcon ? ActivePlanWaypointRoles.Active_Untracked_Circle : ActivePlanWaypointRoles.Active_Untracked_Star);
            }
          } else if (legIndex === effectiveLegIndex.get() - 1) {
            return builder.getRoleId(useCircleIcon ? ActivePlanWaypointRoles.Inactive_Circle : ActivePlanWaypointRoles.Inactive_Star);
          }

          return 0;
        });
    };
  };

  /**
   * Configures the map flight plan display layer for the mod flight plan.
   * @param bus The event bus to use.
   * @returns A builder function to configure the mod flight plan display system.
   */
  public readonly configureModFlightPlan = (bus: EventBus): (builder: FlightPlanDisplayBuilder) => void => {
    return (builder): void => {
      const isMissedApproachActive = Subject.create(false);
      bus.getSubscriber<Epic2LNavDataEvents>().on('lnavdata_flight_area')
        .handle(x => isMissedApproachActive.set(x === Epic2FlightArea.MissedApproach));

      const currentlyInMod = Subject.create(false);
      bus.getSubscriber<FmcSimVarEvents>().on('fmcExecActive').handle(active => currentlyInMod.set(active === 1));

      builder
        .registerRole(PendingPlanWaypointRoles.Inactive_Star)
        .registerRole(PendingPlanWaypointRoles.Inactive_Circle)
        .addDefaultIcon(PendingPlanWaypointRoles.Inactive_Star, (w) => new MapWaypointImageIcon(w, 999, ImageCache.get('FLIGHTPLAN_C'), this.ICON_SIZE))
        // TODO flight plan circle cyan icon
        .addDefaultIcon(PendingPlanWaypointRoles.Inactive_Circle, (w) => new MapWaypointImageIcon(w, 999, ImageCache.get('FLIGHTPLAN_CIRCLE_CYAN'), this.ICON_SIZE))
        // 787 does not show DATA for mod or inactive routes
        .addLabel(PendingPlanWaypointRoles.Inactive_Star, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.cyan))
        .addLabel(PendingPlanWaypointRoles.Inactive_Circle, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.cyan));

      builder.withAnticipationTurns(true);

      builder.withLegPathStyles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
        if (legIndex >= activeLegIndex && currentlyInMod.get()) {
          const isHoldLeg = Epic2FmsUtils.isHoldAtLeg(leg.leg.type);
          // const isHoldToManualTerminationLeg = (leg.leg.type === LegType.HM);
          return isHoldLeg
            ? this.HoldLegCyanPath
            : this.CyanPath;
        }

        return FlightPathRenderStyle.Hidden;
      });

      builder.withLegWaypointRoles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
        if (this.isOriginDestOrRunwayLeg(plan, leg)) {
          return 0;
        }

        // Legs with no fix are shown as a circle
        const useCircleIcon = false; //nonFixLegTypes.includes(leg.leg.type);

        if (legIndex >= activeLegIndex && currentlyInMod.get()) {
          return builder.getRoleId(useCircleIcon ? PendingPlanWaypointRoles.Inactive_Circle : PendingPlanWaypointRoles.Inactive_Star);
        }

        return 0;
      });
    };
  };

  // /**
  //  * Configures the map flight plan display layer for the inactive route flight plan.
  //  * @returns A builder function to configure the inactive route flight plan display system.
  //  */
  // public readonly configureInactiveFlightPlan = (): (builder: FlightPlanDisplayBuilder) => void => {
  //   return (builder): void => {
  //     builder
  //       .registerRole(PlanWaypointRoles.Inactive_Star)
  //       .registerRole(PlanWaypointRoles.Inactive_Circle)
  //       .addDefaultIcon(PlanWaypointRoles.Inactive_Star, this.buildIcon('FLIGHTPLAN'))
  //       .addDefaultIcon(PlanWaypointRoles.Inactive_Circle, this.buildIcon('FLIGHTPLAN_CIRCLE_WHITE'))
  //       // 787 does not show DATA for mod or inactive routes
  //       .addLabel(PlanWaypointRoles.Inactive_Star, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.white))
  //       .addLabel(PlanWaypointRoles.Inactive_Circle, WaypointTypes.FlightPlan, this.buildFlightPlanLabel(Epic2Colors.white));

  //     builder.withAnticipationTurns(true);

  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     builder.withLegPathStyles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
  //       const isHoldLeg = Epic2FmsUtils.isHoldAtLeg(leg.leg.type);;
  //       const isHoldToManualTerminationLeg = (leg.leg.type === LegType.HM);
  //       return isHoldLeg
  //         ? this.HoldLegCyanDashedPath
  //         : isHoldToManualTerminationLeg
  //           ? this.CyanPath
  //           : this.CyanDashedPath;
  //     });

  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     builder.withLegWaypointRoles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
  //       if (this.isOriginDestOrRunwayLeg(plan, leg)) {
  //         return 0;
  //       }

  //       // Legs with no fix are shown as a circle
  //       const useCircleIcon = nonFixLegTypes.includes(leg.leg.type);

  //       return builder.getRoleId(useCircleIcon ? PlanWaypointRoles.Inactive_Circle : PlanWaypointRoles.Inactive_Star);
  //     });
  //   };
  // };

  public readonly createTrafficIntruderIcon = () => (
    intruder: TcasIntruder,
    context: MapSystemContext<Epic2MapModules, any, any, any>,
  ): AbstractMapTrafficIntruderIcon => {
    return new MapTrafficIntruderIcon(
      intruder as Epic2TcasIntruder,
      context.model.getModule(MapSystemKeys.Traffic),
      context.model.getModule(MapSystemKeys.OwnAirplaneProps),
      this.mapStyles,
    );

  };

  /**
   * Initializes global canvas styles for the traffic layer.
   * @param context The canvas rendering context for which to initialize styles.
   */
  public readonly initTrafficLayerCanvasStyles = (context: CanvasRenderingContext2D): void => {
    context.textAlign = 'center';
    context.font = this.mapStyles.labelFontSize + 'px ' + EpicMapCommon.font;
  };

  /**
   * Checks if leg is the origin or destination airport leg or runway leg.
   * @param plan the plan.
   * @param leg the leg.
   * @returns Whether leg is the origin or destination airport leg or runway leg.
   */
  private isOriginDestOrRunwayLeg(plan: FlightPlan, leg: LegDefinition): boolean {
    const isOriginOrDestinationAirportLeg = leg.leg.fixIcao === plan.originAirport || leg.leg.fixIcao === plan.destinationAirport;

    const isRunwayLeg = ICAO.isFacility(leg.leg.fixIcao, FacilityType.RWY);

    return isOriginOrDestinationAirportLeg || isRunwayLeg;
  }
}

enum ActivePlanWaypointRoles {
  Inactive_Star = 'ActiveFlightPlan_Inactive_Star',
  Active_Untracked_Star = 'ActiveFlightPlan_Active_Untracked_Star',
  Active_Tracked_Star = 'ActiveFlightPlan_Active_Tracked_Star',
  Inactive_Circle = 'ActiveFlightPlan_Inactive_Circle',
  Active_Untracked_Circle = 'ActiveFlightPlan_Active_Untracked_Circle',
  Active_Tracked_Circle = 'ActiveFlightPlan_Active_Tracked_Circle',
}

enum PendingPlanWaypointRoles {
  Inactive_Star = 'PendingFlightPlan_Inactive_Star',
  Active_Star = 'PendingFlightPlan_Active_Star',
  Inactive_Circle = 'PendingFlightPlan_Inactive_Circle',
  Active_Circle = 'PendingFlightPlan_Active_Circle',
}
