import {
  AirportClass, AirportFacility, BitFlags, FacilityType, FacilityWaypointUtils, MapFlightPlanModule, MapSystemContext, MapSystemController, MapSystemKeys,
  MapWaypointDisplayModule, NearestAirportSearchSession, UnitType, UserSettingManager, Waypoint
} from '@microsoft/msfs-sdk';

import { WT21FixInfoManager } from '../Systems/FixInfo/WT21FixInfoManager';
import { WT21FmsUtils } from '../Systems/FMS/WT21FmsUtils';
import { MapFacilitySelectModule } from './MapFacilitySelectModule';
import { MapSettingsMfdAliased, MapSettingsPfdAliased, MapWaypointsDisplay } from './MapUserSettings';
import { WT21MapKeys } from './WT21MapKeys';

/**
 * Modules required by WaypointDisplayController.
 */
export interface WaypointDisplayControllerModules {
  /** Waypoints display module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;
  /** Waypoints display module. */
  [WT21MapKeys.CtrWpt]: MapFacilitySelectModule;
  /** Waypoints display module. */
  [MapSystemKeys.FlightPlan]: MapFlightPlanModule;
}

/**
 * A map system controller that controls the display settings of the nearest waypoints.
 */
export class WaypointDisplayController extends MapSystemController<WaypointDisplayControllerModules> {

  private readonly waypoints: MapWaypointDisplayModule = this.context.model.getModule(MapSystemKeys.NearestWaypoints);
  private readonly selectWaypointModule: MapFacilitySelectModule = this.context.model.getModule(WT21MapKeys.CtrWpt);
  private readonly flightPlanModule: MapFlightPlanModule = this.context.model.getModule(MapSystemKeys.FlightPlan);
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
   * @param settings The map user settings
   * @param fixInfo The fix info manager.
   */
  constructor(
    context: MapSystemContext<WaypointDisplayControllerModules>,
    private readonly settings: UserSettingManager<MapSettingsPfdAliased | MapSettingsMfdAliased>,
    private readonly fixInfo?: WT21FixInfoManager,
  ) {
    super(context);

  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();

    this.waypoints.airportsRange.set(200, UnitType.NMILE);

    this.waypoints.airportsFilter.set({
      classMask: BitFlags.union(BitFlags.createFlag(AirportClass.HardSurface), BitFlags.createFlag(AirportClass.Private)),
      showClosed: NearestAirportSearchSession.Defaults.ShowClosed
    });

    this.waypoints.extendedAirportsFilter.set({
      approachTypeMask: NearestAirportSearchSession.Defaults.ApproachTypeMask,
      runwaySurfaceTypeMask: NearestAirportSearchSession.Defaults.SurfaceTypeMask,
      minimumRunwayLength: 2000,
      toweredMask: NearestAirportSearchSession.Defaults.ToweredMask
    });
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
      if (FacilityWaypointUtils.isFacilityWaypoint(w)) {
        // Don't show waypoint if it's in the active plan
        const plan = this.flightPlanModule.getPlanSubjects(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX).flightPlan.get();
        if (plan) {
          for (const leg of plan.legs()) {
            if (leg.leg.fixIcao === w.facility.get().icao) {
              return false;
            }
          }
        }

        if (w.facility.get().icao === this.selectWaypointModule.facilityIcao.get()) {
          return true;
        }

        // Show waypoint if it's a fix info waypoint
        if (this.fixInfo && this.fixInfo.ndWaypoints.getArray().some(x => x.fixIcao === w.facility.get().icao)) {
          return true;
        }
      }

      if (facType === FacilityType.Airport && FacilityWaypointUtils.isFacilityWaypoint(w)) {
        const airport = w.facility.get() as AirportFacility;
        if (airport.airportClass !== AirportClass.HardSurface && airport.airportClass !== AirportClass.Private) {
          return false;
        }
        if (airport.runways.findIndex(runway => runway.length - runway.primaryThresholdLength - runway.secondaryThresholdLength >= 600) === -1) {
          return false;
        }
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
