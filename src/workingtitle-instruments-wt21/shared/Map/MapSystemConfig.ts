import {
  BitFlags, CircleVector, EventBus, FacilityWaypoint, FlightPathLegRenderPart, FlightPathRenderStyle, FlightPathVectorStyle, FlightPathWaypoint,
  FlightPlanDisplayBuilder, GNSSEvents, ICAO, ImageCache, LatLonInterface, LegDefinitionFlags, LegType, MapCullableLocationTextLabel, MapOwnAirplanePropsKey,
  MapOwnAirplanePropsModule, MapSystemContext, MapSystemKeys, MapSystemWaypointRoles, MapTrafficModule, MapWaypointImageIcon, Subject, TcasIntruder,
  UserSetting, Vec2Math, VorFacility, VorType, Waypoint, WaypointDisplayBuilder, WaypointTypes
} from '@microsoft/msfs-sdk';

import { FmcSimVarEvents } from '../FmcSimVars';
import { WaypointAlerter } from '../LowerSection/WaypointAlerter';
import { CDIScaleLabel, WT21LNavDataEvents } from '../Systems/Autopilot/WT21LNavDataEvents';
import { WT21_PFD_MFD_Colors as WT21_PFD_MFD_Colors } from '../WT21_Colors';
import { ActiveWaypointIcon } from './ActiveWaypoint';
import { FlightPathWaypointLabel } from './FlightPathWaypointLabel';
import { WT21MapWaypointIconPriority } from './MapSystemCommon';
import { MapTrafficIntruderIcon } from './MapTrafficIntruderIcon';
import { MapUserSettings, MapWaypointsDisplay, PfdOrMfd } from './MapUserSettings';

ImageCache.addToCache('AIRPORT', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/airport_c.png');
ImageCache.addToCache('INTERSECTION', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/intersection.png');
ImageCache.addToCache('NDB', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/ndb.png');
ImageCache.addToCache('VOR', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/vor.png');
ImageCache.addToCache('DME', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/dme.png');
ImageCache.addToCache('VORDME', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/vordme.png');
ImageCache.addToCache('VORTAC', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/vortac.png');
ImageCache.addToCache('TACAN', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/tacan.png');
ImageCache.addToCache('FLIGHTPLAN', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/flightplan.png');
ImageCache.addToCache('FLIGHTPLAN_M', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/flightplan_m.png');
ImageCache.addToCache('FLIGHTPLAN_C', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/flightplan_c.png');
ImageCache.addToCache('TOD', 'coui://html_ui/Pages/VCockpit/Instruments/WT21/Assets/icons/tod.png');

/**
 * Events on the bus that control the WT21 plan map display position.
 */
export interface PlanMapEvents {

  /** A request was made to move the plan map to the next waypoint, with the data indicating the display unit index. */
  plan_map_next: number;

  /** A request was made to move the plan map to the previous waypoint, with the data indicating the display unit index. */
  plan_map_prev: number;

  /** A request was made to move the plan map to active waypoint, with the data indicating the display unit index. */
  plan_map_to: number;

  /**
   * The plan map was requested to move to a specific geographic location, with the data
   * indicating the FMC unit index, 1 or 2.
   */
  plan_map_ctr_wpt: PlanMapCenterRequest;
}

/**
 * A request to move the plan map to a specific geographic location.
 */
export interface PlanMapCenterRequest {
  /** The FMC unit index, 1 or 2. */
  index: number;

  /** The full ICAO string of the facility to center. */
  icao: string | null;

  /** The position that was requested to move the map to. */
  position: LatLonInterface | null;
}

/**
 * A map system config for the WT21 PFD/MFD map.
 */
export class MapSystemConfig {
  private static readonly ICON_SIZE = Vec2Math.create(30, 30);

  public static readonly MagentaPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 2,
    style: WT21_PFD_MFD_Colors.magenta
  };

  public static readonly WhitePath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 2,
    style: WT21_PFD_MFD_Colors.white
  };

  public static readonly WhiteDashedPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 2,
    style: WT21_PFD_MFD_Colors.white,
    dash: [14, 10]
  };

  public static readonly CyanPath: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 2,
    style: WT21_PFD_MFD_Colors.cyan
  };

  public static readonly HoldLegPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: MapSystemConfig.buildWhiteHoldStyle
  };

  public static readonly HoldLegActivePath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: MapSystemConfig.buildMagentaHoldStyle
  };

  public static readonly HoldLegMapPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: MapSystemConfig.buildCyanHoldStyle
  };

  public static readonly HoldLegDashedPath: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: MapSystemConfig.buildWhiteDashedHoldStyle
  };

  /**
   * Builds non-active leg style for hold legs.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildWhiteHoldStyle(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return MapSystemConfig.WhitePath;
  }

  /**
   * Builds active leg style for hold legs.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildMagentaHoldStyle(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return MapSystemConfig.MagentaPath;
  }

  /**
   * Builds leg style for hold legs on the missed approach.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildCyanHoldStyle(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return MapSystemConfig.CyanPath;
  }

  /**
   * Builds non-active leg style for hold legs.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static buildWhiteDashedHoldStyle(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return MapSystemConfig.WhiteDashedPath;
  }

  /**
   * Gets the own airplane properties to bind to event bus events.
   * @returns An array of own airplane properties to bind to event bus events.
   */
  public static getOwnAirplanePropsToBind(): (MapOwnAirplanePropsKey)[] {
    return [
      'position',
      'hdgTrue',
      'trackTrue',
      'altitude',
      'verticalSpeed',
      'groundSpeed'
    ];
  }

  /**
   * Builds a label for facility waypoints.
   * @param color The color of the label.
   * @returns A new factory that will create the label.
   */
  private static buildFacilityLabel(color: string): (w: FacilityWaypoint) => MapCullableLocationTextLabel {
    return (w: FacilityWaypoint): MapCullableLocationTextLabel => {
      return new MapCullableLocationTextLabel(
        ICAO.getIdent(w.facility.get().icao),
        WT21MapWaypointIconPriority.Bottom,
        w.location,
        false,
        { fontSize: 24, fontColor: color, font: 'WT21', anchor: new Float64Array([-0.35, 0.4]) }
      );
    };
  }

  /**
   * Builds a label for flight plan waypoints.
   * @param color The color of the label.
   * @param displaySetting The 'mapWaypointsDisplay' setting.
   * @returns A new factory that will create the label.
   */
  private static buildFlightPlanLabel(color: string, displaySetting?: UserSetting<number>): (w: FlightPathWaypoint) => FlightPathWaypointLabel {
    return (w: FlightPathWaypoint): FlightPathWaypointLabel => new FlightPathWaypointLabel(w, displaySetting, { fontSize: 24, fontColor: color, font: 'WT21' });
  }

  /**
   * Builds an icon for a waypoint.
   * @param id The ID of the icon.
   * @param priority he render priority of this icon.
   * @returns A factory that builds the image icon.
   */
  private static buildIcon(id: string, priority = WT21MapWaypointIconPriority.Bottom): (w: Waypoint) => MapWaypointImageIcon<any> {
    return (w: Waypoint): MapWaypointImageIcon<any> => new MapWaypointImageIcon(w, priority, ImageCache.get(id), MapSystemConfig.ICON_SIZE);
  }

  /**
   * Configures the map waypoint display layer.
   * @returns A builder function to configure the waypoint display system.
   *
   */
  public static configureMapWaypoints(): (builder: WaypointDisplayBuilder) => void {

    return (builder): void => {
      builder.withSearchCenter('target');
      MapSystemConfig.configWptRoles(MapSystemWaypointRoles.Normal, builder);
    };
  }

  /**
   * Configures the map waypoint role styles.
   * @param role The role to configure.
   * @param builder The waypoint display builder
   */
  public static configWptRoles(role: number | string, builder: WaypointDisplayBuilder): void {
    builder.addDefaultIcon(role, MapSystemConfig.buildIcon('INTERSECTION'))
      .addDefaultLabel(role, MapSystemConfig.buildFacilityLabel(WT21_PFD_MFD_Colors.cyan))
      .addIcon(role, WaypointTypes.Airport, MapSystemConfig.buildIcon('AIRPORT'))
      .addIcon(role, WaypointTypes.NDB, MapSystemConfig.buildIcon('NDB'))
      .addIcon(role, WaypointTypes.VOR, (w: FacilityWaypoint<VorFacility>) => {
        switch (w.facility.get().type) {
          case VorType.VOR:
            return new MapWaypointImageIcon(w, 0, ImageCache.get('VOR'), MapSystemConfig.ICON_SIZE);
          case VorType.VORDME:
            return new MapWaypointImageIcon(w, 0, ImageCache.get('VORDME'), MapSystemConfig.ICON_SIZE);
          case VorType.DME:
            return new MapWaypointImageIcon(w, 0, ImageCache.get('DME'), MapSystemConfig.ICON_SIZE);
          case VorType.TACAN:
            return new MapWaypointImageIcon(w, 0, ImageCache.get('TACAN'), MapSystemConfig.ICON_SIZE);
          default:
            return new MapWaypointImageIcon(w, 0, ImageCache.get('VORTAC'), MapSystemConfig.ICON_SIZE);
        }
      });
  }

  /**
   * Configures the map flight plan display layer.
   * @param bus The event bus to use.
   * @param waypointAlerter A waypoint alerter that will control the flash of the alering waypoint.
   * @param pfdOrMfd Whether this map is on the PFD or MFD.
   * @returns A builder function to configure the flight plan display system.
   */
  public static configureFlightPlan(bus: EventBus, waypointAlerter: WaypointAlerter, pfdOrMfd: PfdOrMfd): (builder: FlightPlanDisplayBuilder) => void {
    return (builder): void => {
      const effectiveLegIndex = Subject.create(-1);

      const sub = bus.getSubscriber<WT21LNavDataEvents & GNSSEvents>();

      const settings = MapUserSettings.getAliasedManager(bus, pfdOrMfd);
      const showMissedAppr = (): boolean => BitFlags.isAll(settings.getSetting('mapWaypointsDisplay').value, MapWaypointsDisplay.MissedApproach);

      const isMissedApproachActive = Subject.create(false);
      sub.on('lnavdata_cdi_scale_label')
        .handle(x => isMissedApproachActive.set(x === CDIScaleLabel.MissedApproach));

      let currentActiveWaypointIcon: ActiveWaypointIcon | undefined;
      let currentActiveWaypointLabel: FlightPathWaypointLabel | undefined;


      waypointAlerter.isDisplayed.sub(isDisplayed => {
        currentActiveWaypointIcon?.setDisplayed(isDisplayed);
        currentActiveWaypointLabel?.setDisplayed(isDisplayed);
      });

      sub.on('lnavdata_nominal_leg_index').handle(effectiveLegIndex.set.bind(effectiveLegIndex));

      builder.registerRole(PlanWaypointRoles.Active)
        .registerRole(PlanWaypointRoles.Ahead)
        .registerRole(PlanWaypointRoles.From)
        .addDefaultIcon(PlanWaypointRoles.Ahead, MapSystemConfig.buildIcon('FLIGHTPLAN', WT21MapWaypointIconPriority.FlightPlan))
        .addDefaultIcon(PlanWaypointRoles.Active, w => {
          currentActiveWaypointIcon = new ActiveWaypointIcon(w, 999, ImageCache.get('FLIGHTPLAN_M'), MapSystemConfig.ICON_SIZE);
          return currentActiveWaypointIcon;
        })
        .addDefaultIcon(PlanWaypointRoles.From, MapSystemConfig.buildIcon('FLIGHTPLAN_C', WT21MapWaypointIconPriority.FlightPlan))
        .addDefaultLabel(PlanWaypointRoles.Ahead, MapSystemConfig.buildFlightPlanLabel(WT21_PFD_MFD_Colors.white, settings.getSetting('mapWaypointsDisplay')))
        .addDefaultLabel(PlanWaypointRoles.Active, (w: FlightPathWaypoint) => {
          currentActiveWaypointLabel = new FlightPathWaypointLabel(w, settings.getSetting('mapWaypointsDisplay'), { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.magenta, font: 'WT21' });
          return currentActiveWaypointLabel;
        })
        .addDefaultLabel(PlanWaypointRoles.From, MapSystemConfig.buildFlightPlanLabel(WT21_PFD_MFD_Colors.cyan))
        .addLabel(PlanWaypointRoles.Ahead, WaypointTypes.FlightPlan, MapSystemConfig.buildFlightPlanLabel(WT21_PFD_MFD_Colors.white, settings.getSetting('mapWaypointsDisplay')))
        .addLabel(PlanWaypointRoles.Active, WaypointTypes.FlightPlan, (w: FlightPathWaypoint) => {
          currentActiveWaypointLabel = new FlightPathWaypointLabel(w, settings.getSetting('mapWaypointsDisplay'), { fontSize: 24, fontColor: WT21_PFD_MFD_Colors.magenta, font: 'WT21' });
          return currentActiveWaypointLabel;
        })
        .addLabel(PlanWaypointRoles.From, WaypointTypes.FlightPlan, MapSystemConfig.buildFlightPlanLabel(WT21_PFD_MFD_Colors.cyan));

      builder.withLegPathStyles((plan, leg, activeLeg, legIndex) => {
        const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
        const isHoldLeg = (leg.leg.type === LegType.HF || leg.leg.type === LegType.HA);
        if (isMissedApproachLeg) {
          // We only want the MAP legs to be in cyan if we are not already in the missed approach
          if (!isMissedApproachActive.get()) {
            if (showMissedAppr()) {
              return isHoldLeg ? MapSystemConfig.HoldLegMapPath : MapSystemConfig.CyanPath;
            } else {
              return FlightPathRenderStyle.Hidden;
            }
          }
        }

        if (legIndex > effectiveLegIndex.get()) {
          return isHoldLeg ? MapSystemConfig.HoldLegPath : MapSystemConfig.WhitePath;
        } else if (legIndex === effectiveLegIndex.get()) {
          return isHoldLeg ? MapSystemConfig.HoldLegActivePath : MapSystemConfig.MagentaPath;
        } else if (legIndex === effectiveLegIndex.get() - 1) {
          return isHoldLeg ? MapSystemConfig.HoldLegPath : MapSystemConfig.WhitePath;
        }
        return FlightPathRenderStyle.Hidden;
      });

      builder.withLegWaypointRoles((plan, leg, activeLeg, legIndex) => {
        const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
        if (isMissedApproachLeg) {
          // We only want the MAP legs to be in cyan if we are not already in the missed approach
          if (!isMissedApproachActive.get()) {
            if (showMissedAppr()) {
              return builder.getRoleId(PlanWaypointRoles.From);
            } else {
              return 0;
            }
          }
        }
        if (legIndex > effectiveLegIndex.get()) {
          return builder.getRoleId(PlanWaypointRoles.Ahead);
        } else if (legIndex === effectiveLegIndex.get()) {
          return builder.getRoleId(PlanWaypointRoles.Active);
        } else if (legIndex === effectiveLegIndex.get() - 1) {
          return builder.getRoleId(PlanWaypointRoles.From);
        }

        return 0;
      });
    };
  }

  /**
   * Configures the map flight plan display layer for the mod flight plan.
   * @param bus The event bus to use.
   * @param pfdOrMfd Whether this map is on the PFD or MFD.
   * @returns A builder function to configure the mod flight plan display system.
   */
  public static configureModFlightPlan(bus: EventBus, pfdOrMfd: PfdOrMfd): (builder: FlightPlanDisplayBuilder) => void {
    return (builder): void => {
      const settings = MapUserSettings.getAliasedManager(bus, pfdOrMfd);
      const showMissedAppr = (): boolean => BitFlags.isAll(settings.getSetting('mapWaypointsDisplay').value, MapWaypointsDisplay.MissedApproach);

      const isMissedApproachActive = Subject.create(false);
      bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_cdi_scale_label')
        .handle(x => isMissedApproachActive.set(x === CDIScaleLabel.MissedApproach));

      const currentlyInMod = Subject.create(false);
      bus.getSubscriber<FmcSimVarEvents>().on('fmcExecActive').handle(active => currentlyInMod.set(active === 1));

      builder.registerRole(PlanWaypointRoles.Mod)
        .addDefaultIcon(PlanWaypointRoles.Mod, MapSystemConfig.buildIcon('FLIGHTPLAN'))
        .addDefaultLabel(PlanWaypointRoles.Mod, MapSystemConfig.buildFacilityLabel(WT21_PFD_MFD_Colors.white))
        .addLabel(PlanWaypointRoles.Mod, WaypointTypes.FlightPlan, MapSystemConfig.buildFlightPlanLabel(WT21_PFD_MFD_Colors.white));

      builder.withLegPathStyles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
        if (legIndex >= activeLegIndex && currentlyInMod.get()) {
          const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
          if (isMissedApproachLeg && !showMissedAppr() && !isMissedApproachActive.get()) {
            return FlightPathRenderStyle.Hidden;
          }
          const isHoldLeg = (leg.leg.type === LegType.HF || leg.leg.type === LegType.HA);
          return isHoldLeg ? MapSystemConfig.HoldLegDashedPath : MapSystemConfig.WhiteDashedPath;
        }

        return FlightPathRenderStyle.Hidden;
      });

      builder.withLegWaypointRoles((plan, leg, activeLeg, legIndex, activeLegIndex) => {
        if (legIndex >= activeLegIndex && currentlyInMod.get()) {
          const isMissedApproachLeg = BitFlags.isAll(leg.flags, LegDefinitionFlags.MissedApproach);
          if (isMissedApproachLeg && !showMissedAppr() && !isMissedApproachActive.get()) {
            return 0;
          }
          return builder.getRoleId(PlanWaypointRoles.Mod);
        }

        return 0;
      });
    };
  }

  /**
   * Creates an icon for a traffic intruder.
   * @param intruder The intruder for which to create an icon.
   * @param context The context of the icon's parent map.
   * @returns An icon for the specified intruder.
   */
  public static createTrafficIntruderIcon(
    intruder: TcasIntruder,
    context: MapSystemContext<{
      /** Own airplane props module. */
      [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule,
      /** Traffic module */
      [MapSystemKeys.Traffic]: MapTrafficModule
    },
      any, any, any
    >
  ): MapTrafficIntruderIcon {
    return new MapTrafficIntruderIcon(intruder, context.model.getModule(MapSystemKeys.Traffic), context.model.getModule(MapSystemKeys.OwnAirplaneProps));
  }

  /**
   * Initializes global canvas styles for the traffic layer.
   * @param context The canvas rendering context for which to initialize styles.
   */
  public static initTrafficLayerCanvasStyles(context: CanvasRenderingContext2D): void {
    context.textAlign = 'center';
    context.font = '20px WT21';
  }
}

enum PlanWaypointRoles {
  Ahead = 'FlightPlan_Ahead',
  Active = 'FlightPlan_Active',
  From = 'From',
  Mod = 'FlightPlan_Mod',
}
