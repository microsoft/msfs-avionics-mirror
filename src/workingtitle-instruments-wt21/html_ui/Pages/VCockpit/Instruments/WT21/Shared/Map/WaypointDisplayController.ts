import { BitFlags, FacilityType, FacilityWaypointUtils, MapSystemContext, MapSystemController, MapSystemKeys, MapWaypointDisplayModule, UserSettingManager, Waypoint } from '@microsoft/msfs-sdk';
import { MapFacilitySelectModule } from './MapFacilitySelectModule';

import { MapSettingsMfdAliased, MapSettingsPfdAliased, MapUserSettings, MapWaypointsDisplay, PfdOrMfd } from './MapUserSettings';
import { WT21MapKeys } from './WT21MapKeys';

/**
 * Modules required by WaypointDisplayController.
 */
export interface WaypointDisplayControllerModules {
  /** Waypoints display module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;
  /** Waypoints display module. */
  [WT21MapKeys.CtrWpt]: MapFacilitySelectModule;
}

/**
 * A map system controller that controls the display settings of the nearest waypoints.
 */
export class WaypointDisplayController extends MapSystemController<WaypointDisplayControllerModules> {
  private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>;
  private readonly waypoints: MapWaypointDisplayModule = this.context.model.getModule(MapSystemKeys.NearestWaypoints);
  private readonly selectWaypointModule: MapFacilitySelectModule = this.context.model.getModule(WT21MapKeys.CtrWpt);
  private rangeSetting = 0;
  private readonly facilityMaxRange = new Map<FacilityType, number>([
    [FacilityType.Airport, 600],
    [FacilityType.Intersection, 50],
    [FacilityType.VOR, 600],
    [FacilityType.NDB, 50],
  ]);

  /**
   * Creates an instance of the WaypointDisplayController.
   * @param context The map system context to use with this controller.
   * @param pfdOrMfd Whether or not the map is on the PFD or MFD.
   */
  constructor(
    context: MapSystemContext<WaypointDisplayControllerModules>,
    pfdOrMfd: PfdOrMfd,
  ) {
    super(context);

    this.settings = MapUserSettings.getAliasedManager(context.bus, pfdOrMfd);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();
  }

  /**
   * Wires the settings system to the waypoint display controller.
   */
  private wireSettings(): void {
    this.settings.whenSettingChanged('mapWaypointsDisplay').handle((v) => this.handleSettingsChanged(v));
    this.settings.getSetting('mapRange').sub((v) => {
      this.rangeSetting = v;
    });
  }

  /**
   * Determines if a map waypoint should be displayed because it is the selected facility.
   * @param facType The type of facility.
   * @param shouldShow The current setting value for that facility type.
   * @returns A function that is checking if the waypoint is the selected waypoint.
   */
  private shouldShowWaypoint(facType: FacilityType, shouldShow: boolean): (w: Waypoint) => boolean {
    return (w) => {
      if (FacilityWaypointUtils.isFacilityWaypoint(w) && w.facility.get().icao === this.selectWaypointModule.facilityIcao.get()) {
        return true;
      }

      const maxRange = this.facilityMaxRange.get(facType) ?? 600;
      if (this.rangeSetting > maxRange) {
        return false;
      }

      return shouldShow;
    };
  }

  /**
   * Handles when the waypoint display settings mask has changed.
   * @param mask The waypoint display settings mask to apply.
   */
  private handleSettingsChanged(mask: number): void {
    this.waypoints.showAirports.set(this.shouldShowWaypoint(FacilityType.Airport, BitFlags.isAll(mask, MapWaypointsDisplay.Airports)));
    this.waypoints.showIntersections.set(this.shouldShowWaypoint(FacilityType.Intersection, BitFlags.isAll(mask, MapWaypointsDisplay.Intersections)));
    this.waypoints.showNdbs.set(this.shouldShowWaypoint(FacilityType.NDB, BitFlags.isAll(mask, MapWaypointsDisplay.NDBs)));
    this.waypoints.showVors.set(this.shouldShowWaypoint(FacilityType.VOR, BitFlags.isAny(mask, MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids)));
  }
}