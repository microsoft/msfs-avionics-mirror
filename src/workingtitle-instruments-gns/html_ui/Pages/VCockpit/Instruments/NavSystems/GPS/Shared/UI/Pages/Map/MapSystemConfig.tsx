import {
  BitFlags, CircleVector, ConsumerSubject, EventBus, FacilityWaypoint, FacilityWaypointUtils, FlightPathLegRenderPart,
  FlightPathRenderStyle, FlightPathVectorStyle, FlightPathWaypoint, FlightPlanDisplayBuilder, ICAO, ImageCache,
  LegDefinitionFlags, LegType, LNavEvents, LNavTransitionMode, LNavUtils, MapCullableLocationTextLabel, MapProjection,
  MapSystemWaypointRoles, MapWaypointImageIcon, MapWaypointSpriteIcon, NavMath, NdbFacility, NdbType, Subject,
  Subscribable, UserSetting, Vec2Math, VecNMath, VorFacility, VorType, Waypoint, WaypointDisplayBuilder, WaypointTypes
} from '@microsoft/msfs-sdk';

import { AirportSize, AirportWaypoint, Fms, GarminFacilityWaypointCache } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { MapSettingsWaypointSizes } from '../../../Settings/MapSettingsProvider';
import { GNSType } from '../../../UITypes';
import { Icons } from '../../Icons';

export const OwnshipIconPath = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/ownship.png';

enum AdditionalRoles {
  ActiveFlightPlan = 'ActiveFlightPlan'
}

/** Map waypoint roles for the GNS map. */
export const GNSMapWaypointRoles = { ...MapSystemWaypointRoles, ...AdditionalRoles };

/** A collection of static flight path render styles. */
class FlightPathStyles {
  public static readonly Magenta: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 3,
    style: 'magenta'
  };

  public static readonly MagentaDashed: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 3,
    style: 'magenta',
    dash: [6, 4]
  };

  public static readonly White: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 3,
    style: 'white'
  };

  public static readonly WhiteDashed: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 3,
    style: 'white',
    dash: [6, 4]
  };

  public static readonly Gray: FlightPathRenderStyle = {
    isDisplayed: true,
    width: 1,
    style: 'gray'
  };

  public static readonly InactiveHold: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: FlightPathStyles.buildWhiteHoldStyles
  };

  public static readonly ActiveHoldEntry: FlightPathVectorStyle = {
    partsToRender: FlightPathLegRenderPart.Base | FlightPathLegRenderPart.Ingress,
    styleBuilder: FlightPathStyles.buildActiveEntryHoldStyles
  };

  /**
   * Builds non-active leg styles for hold legs.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  public static buildWhiteHoldStyles(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return isIngress ? FlightPathStyles.WhiteDashed : FlightPathStyles.White;
  }

  /**
   * Builds hold displays with an active hold entry.
   * @param vector The vector being rendered.
   * @param isIngress Whether or not this vector is an ingress vector.
   * @returns The appropriate hold leg display style.
   */
  public static buildActiveEntryHoldStyles(vector: CircleVector, isIngress: boolean): FlightPathRenderStyle {
    return isIngress ? FlightPathStyles.MagentaDashed : FlightPathStyles.White;
  }
}

/**
 * A class that configures displays on the map system.
 */
export class MapSystemConfig {

  /**
   * Builds a label for facility waypoints.
   * @param size The size of the label.
   * @returns A new factory that will create the label.
   */
  private static buildFacilityLabel(size: Subscribable<number>): (w: FacilityWaypoint) => MapCullableLocationTextLabel {
    return (w: FacilityWaypoint): MapCullableLocationTextLabel => {
      return new MapCullableLocationTextLabel(
        ICAO.getIdent(w.facility.get().icao),
        0,
        w.location, false, {
        fontSize: size,
        fontColor: '#ccc',
        font: 'GreatNiftySymbol-Regular',
        anchor: new Float64Array([0.5, 1.50]),
        showBg: true,
        bgColor: 'black',
        bgPadding: VecNMath.create(4, 1, 1, -2, 1)
      });
    };
  }

  /**
   * Builds a label for airport waypoints.
   * @param large The size of the label, for large airports.
   * @param med The size of the label, for medium airports.
   * @param small The size of the label, for small airports.
   * @returns A new factory that will create the label.
   */
  private static buildAirportLabel(large: Subscribable<number>, med: Subscribable<number>, small: Subscribable<number>): (w: AirportWaypoint) => MapCullableLocationTextLabel {
    return (w: AirportWaypoint): MapCullableLocationTextLabel => {
      let size = small;
      if (w.size === AirportSize.Large) {
        size = large;
      } else if (w.size === AirportSize.Medium) {
        size = med;
      }

      return new MapCullableLocationTextLabel(
        ICAO.getIdent(w.facility.get().icao),
        0,
        w.location, false, {
        fontSize: size,
        fontColor: '#ccc',
        font: 'GreatNiftySymbol-Regular',
        anchor: new Float64Array([0.5, 1.50]),
        showBg: true,
        bgColor: 'black',
        bgPadding: VecNMath.create(4, 1, 1, -2, 1)
      });
    };
  }

  /**
   * Builds an airport facility icon.
   * @param gnsType The type of GNS unit to configure.
   * @returns A function that builds the icon.
   */
  private static buildAirportIcon(gnsType: GNSType): (w: AirportWaypoint) => MapWaypointSpriteIcon<AirportWaypoint> {
    return (w: AirportWaypoint): MapWaypointSpriteIcon<AirportWaypoint> => new MapWaypointSpriteIcon<AirportWaypoint>(
      w,
      0,
      Icons.getByFacility(w.facility.get()),
      13,
      13,
      gnsType === 'wt430' ? Vec2Math.create(17, 17) : Vec2Math.create(13, 13),
      undefined,
      (mapProjection: MapProjection): number => {
        if (!w.longestRunway) {
          return 0;
        }

        const mapRotationDeg = mapProjection.getRotation() * Avionics.Utils.RAD2DEG;
        return Math.round(NavMath.normalizeHeading((w.longestRunway.direction + mapRotationDeg)) / 22.5) % 8;
      }
    );
  }

  /**
   * Configures the GNS waypoint display.
   * @param bus The event bus to use with this waypoints display.
   * @param settingsProvider The GNS settings provider containing map settings.
   * @param gnsType The type of GNS unit to configure.
   * @returns A function that builds the GNS waypoint display.
   */
  public static configureWaypoints(bus: EventBus, settingsProvider: GNSSettingsProvider, gnsType: GNSType): (builder: WaypointDisplayBuilder) => void {
    const largeAirportWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_large_apt_size'), gnsType);
    const medAirportWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_medium_apt_size'), gnsType);
    const smallAirportWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_small_apt_size'), gnsType);
    const intWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_int_size'), gnsType);
    const ndbWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_ndb_size'), gnsType);
    const vorWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_vor_size'), gnsType);
    const userWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_user_size'), gnsType);

    return (builder): void => {
      builder.withSearchCenter('target')
        .withWaypointCache(GarminFacilityWaypointCache.getCache(bus))
        .addDefaultIcon(GNSMapWaypointRoles.Normal, w => new MapWaypointImageIcon(w, 0, ImageCache.get('INTERSECTION'), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12)))
        .addDefaultLabel(GNSMapWaypointRoles.Normal, MapSystemConfig.buildFacilityLabel(intWaypointSize))
        .addLabel(GNSMapWaypointRoles.Normal, WaypointTypes.NDB, MapSystemConfig.buildFacilityLabel(ndbWaypointSize))
        .addLabel(GNSMapWaypointRoles.Normal, WaypointTypes.VOR, MapSystemConfig.buildFacilityLabel(vorWaypointSize))
        .addLabel(GNSMapWaypointRoles.Normal, WaypointTypes.User, MapSystemConfig.buildFacilityLabel(userWaypointSize))
        .addLabel(GNSMapWaypointRoles.Normal, WaypointTypes.Airport, MapSystemConfig.buildAirportLabel(largeAirportWaypointSize, medAirportWaypointSize, smallAirportWaypointSize))
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.Airport, MapSystemConfig.buildAirportIcon(gnsType))
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.VOR, (w: FacilityWaypoint<VorFacility>) => {
          if (w.facility.get().type === VorType.VORDME) {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(17, 17) : Vec2Math.create(13, 13));
          } else {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12));
          }
        })
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.NDB, (w: FacilityWaypoint<NdbFacility>) => {
          if (w.facility.get().type === NdbType.MH) {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(17, 17) : Vec2Math.create(13, 13));
          } else {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12));
          }
        });
    };
  }

  /**
   * Gets a waypoint size subject from a size setting.
   * @param setting The setting to map.
   * @param gnsType The type of GNS unit to configure.
   * @returns A subject that maps the waypoint size setting to a font size value.
   */
  public static getWaypointSize(setting: UserSetting<MapSettingsWaypointSizes>, gnsType: GNSType): Subscribable<number> {
    const subject = Subject.create(gnsType === 'wt430' ? 14 : 10);
    setting.sub(size => {
      switch (size) {
        case MapSettingsWaypointSizes.Off:
          subject.set(0);
          break;
        case MapSettingsWaypointSizes.Med:
          subject.set(gnsType === 'wt430' ? 15 : 11);
          break;
        case MapSettingsWaypointSizes.Large:
          subject.set(gnsType === 'wt430' ? 17 : 13);
          break;
        default:
          subject.set(gnsType === 'wt430' ? 14 : 10);
          break;
      }
    }, true);

    return subject;
  }

  /**
   * Configures the GNS flight plan map display.
   * @param settingsProvider The GNS settings provider containing map settings.
   * @param gnsType The type of GNS unit to configure.
   * @param bus An instance of the event bus.
   * @param fms The FMS instance.
   * @returns A function that configures the flight plan map display.
   */
  public static configureFlightPlan(
    settingsProvider: GNSSettingsProvider,
    gnsType: GNSType,
    bus: EventBus,
    fms: Fms
  ): (builder: FlightPlanDisplayBuilder) => void {
    return (builder): void => {
      const fplWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_fpl_size'), gnsType);

      builder
        .withAnticipationTurns(false)
        .registerRole(GNSMapWaypointRoles.ActiveFlightPlan)
        .addDefaultIcon(GNSMapWaypointRoles.FlightPlan, w => new MapWaypointImageIcon(w, 0, ImageCache.get('INTERSECTION'), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12)))
        .addDefaultIcon(GNSMapWaypointRoles.ActiveFlightPlan, w => new MapWaypointImageIcon(w, 0, ImageCache.get('INTERSECTION'), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12)))
        .addDefaultLabel(GNSMapWaypointRoles.FlightPlan, MapSystemConfig.buildFlightPlanLabel('#000', '#ccc', fplWaypointSize))
        .addDefaultLabel(GNSMapWaypointRoles.ActiveFlightPlan, MapSystemConfig.buildFlightPlanLabel('magenta', '#000', fplWaypointSize));

      builder.withLegWaypointRoles((plan, leg, activeLeg, legIndex, activeLegIndex): number => {
        if (legIndex < activeLegIndex) {
          return 0;
        } else if (legIndex === activeLegIndex) {
          return builder.getRoleId(GNSMapWaypointRoles.ActiveFlightPlan);
        } else {
          return builder.getRoleId(GNSMapWaypointRoles.FlightPlan);
        }
      });

      const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(fms.lnavIndex);

      let activeFlightPlanIndex = 0;
      const lnavTransitionType = ConsumerSubject.create(bus.getSubscriber<LNavEvents>().on(`lnav_transition_mode${lnavTopicSuffix}`).whenChanged(), LNavTransitionMode.None);
      fms.flightPlanner.onEvent('fplIndexChanged').handle(ev => activeFlightPlanIndex = ev.planIndex);

      builder.withLegPathStyles((plan, leg, activeLeg, legIndex, activeLegIndex): FlightPathRenderStyle | FlightPathVectorStyle => {
        const missedApproachActive = activeLeg !== undefined && BitFlags.isAny(activeLeg.flags, LegDefinitionFlags.MissedApproach);
        if (BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach) && !missedApproachActive) {
          return FlightPathStyles.Gray;
        }

        const isActivePlan = activeFlightPlanIndex === builder.planIndex;
        const isHoldLeg = (leg.leg.type === LegType.HM || leg.leg.type === LegType.HF || leg.leg.type === LegType.HA);

        if (legIndex < activeLegIndex) {
          return FlightPathRenderStyle.Hidden;
        } else if (legIndex === activeLegIndex) {
          if (isActivePlan) {
            return isHoldLeg
              ? (lnavTransitionType.get() === LNavTransitionMode.Ingress) ? FlightPathStyles.ActiveHoldEntry : FlightPathStyles.Magenta
              : FlightPathStyles.Magenta;
          } else {
            return isHoldLeg ? FlightPathStyles.InactiveHold : FlightPathStyles.White;
          }
        } else {
          return isHoldLeg
            ? FlightPathStyles.InactiveHold : FlightPathStyles.White;
        }
      });
    };
  }

  /**
   * Configures the GNS procedure preview plan map display.
   * @param settingsProvider The GNS settings provider containing map settings.
   * @param gnsType The type of GNS unit to configure.
   * @returns A function that configures the preview plan map display.
   */
  public static configureProcedurePreviewPlan(settingsProvider: GNSSettingsProvider, gnsType: GNSType): (builder: FlightPlanDisplayBuilder) => void {
    return (builder): void => {
      const fplWaypointSize = MapSystemConfig.getWaypointSize(settingsProvider.map.getSetting('wpt_fpl_size'), gnsType);

      builder
        .withAnticipationTurns(false)
        .addDefaultIcon(GNSMapWaypointRoles.FlightPlan, w => new MapWaypointImageIcon(w, 0, ImageCache.get('INTERSECTION'), Vec2Math.create(12, 12)))
        .addDefaultLabel(GNSMapWaypointRoles.FlightPlan, MapSystemConfig.buildFlightPlanLabel('#ccc', '#000', fplWaypointSize))
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.Airport, MapSystemConfig.buildAirportIcon(gnsType))
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.VOR, (w: FacilityWaypoint<VorFacility>) => {
          if (w.facility.get().type === VorType.VORDME) {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(17, 17) : Vec2Math.create(13, 13));
          } else {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12));
          }
        })
        .addIcon(GNSMapWaypointRoles.Normal, WaypointTypes.NDB, (w: FacilityWaypoint<NdbFacility>) => {
          if (w.facility.get().type === NdbType.MH) {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(17, 17) : Vec2Math.create(13, 13));
          } else {
            return new MapWaypointImageIcon(w, 0, Icons.getByFacility(w.facility.get()), gnsType === 'wt430' ? Vec2Math.create(16, 16) : Vec2Math.create(12, 12));
          }
        });

      builder.withLegWaypointRoles((): number => builder.getRoleId(GNSMapWaypointRoles.FlightPlan));

      const defaultStyle = {
        isDisplayed: true,
        width: 3,
        style: '#ccc'
      };

      const missedApproachStyle = {
        isDisplayed: true,
        width: 1,
        style: '#ccc'
      };

      builder.withLegPathStyles((plan, leg): FlightPathRenderStyle => {
        if (BitFlags.isAny(leg.flags, LegDefinitionFlags.MissedApproach)) {
          return missedApproachStyle;
        } else {
          return defaultStyle;
        }
      });
    };
  }

  /**
   * Configures the GNS transition portion of the procedure preview plan map display.
   * @returns A function that configures the transition portion of the preview plan map display.
   */
  public static configureTransitionPreviewPlan(): (builder: FlightPlanDisplayBuilder) => void {
    return (builder): void => {
      builder
        .withAnticipationTurns(false)
        .withLegWaypointRoles((): number => 0);

      const defaultStyle = {
        isDisplayed: true,
        width: 1,
        style: '#ccc'
      };

      builder.withLegPathStyles((): FlightPathRenderStyle => defaultStyle);
    };
  }

  /**
   * Builds a label for a flight plan waypoint.
   * @param color The color of the text of the label.
   * @param bgColor The background color of the label.
   * @param size The size of the label.
   * @returns A function that builds the flight plan waypoint label.
   */
  private static buildFlightPlanLabel(color: string, bgColor: string, size: Subscribable<number>): (w: Waypoint) => MapCullableLocationTextLabel {
    return (w) => {
      if (FacilityWaypointUtils.isFacilityWaypoint(w)) {
        return new MapCullableLocationTextLabel(
          ICAO.getIdent(w.facility.get().icao),
          0,
          w.location, true, {
          fontSize: size,
          fontColor: color,
          font: 'GreatNiftySymbol-Regular',
          anchor: new Float64Array([0.5, 1.50]),
          showBg: true,
          bgColor: bgColor,
          bgPadding: VecNMath.create(4, 1, 1, -2, 1)
        });
      }

      if (w instanceof FlightPathWaypoint) {
        if (w.ident.toLowerCase() === 'hold') {
          return new MapCullableLocationTextLabel(
            '',
            0,
            w.location, true);
        } else {
          return new MapCullableLocationTextLabel(
            w.ident,
            0,
            w.location, true, {
            fontSize: size,
            fontColor: color,
            font: 'GreatNiftySymbol-Regular',
            anchor: new Float64Array([0.5, 1.50]),
            showBg: true,
            bgColor: bgColor,
            bgPadding: VecNMath.create(4, 1, 1, -2, 1)
          });
        }

      }

      throw new Error('Invalid waypoint type');
    };
  }
}