import {
  AirportClass,
  BasicFacilityWaypoint, BitFlags, Facility, FacilityType, FacilityWaypoint, FacilityWaypointUtils, IntersectionType, MapFlightPlanModule,
  MapSystemContext, MapSystemController, MapSystemKeys, MapSystemWaypointRoles, MapSystemWaypointsRenderer, MapWaypointDisplayModule,
  NearestAirportSearchSession, NearestVorSearchSession, Subscribable, UnitType, UserSettingManager, Waypoint
} from '@microsoft/msfs-sdk';

import { Epic2FixInfoManager, Epic2FlightPlans } from '../../Fms';
import { MfdAliasedUserSettingTypes } from '../../Settings';
import { MapWaypointsDisplay } from '../EpicMapCommon';
import { EpicMapKeys } from '../EpicMapKeys';
import { MapFacilitySelectModule } from '../Modules';
import { AirportWaypoint } from '../AirportWaypoint';

/** Modules required by WaypointDisplayController. */
export interface WaypointDisplayControllerModules {
  /** Waypoints display module. */
  [MapSystemKeys.NearestWaypoints]: MapWaypointDisplayModule;
  /** Waypoints display module. */
  [EpicMapKeys.CtrWpt]: MapFacilitySelectModule;
  /** Waypoints display module. */
  [MapSystemKeys.FlightPlan]: MapFlightPlanModule;
}

/** Context required by WaypointDisplayController. */
export interface WaypointDisplayControllerContext {
  /** WaypointRenderer. */
  [MapSystemKeys.WaypointRenderer]: MapSystemWaypointsRenderer;
}

/** A map system controller that controls the display settings of the nearest waypoints. */
export class MapWaypointDisplayController extends MapSystemController<
  WaypointDisplayControllerModules, any, any, WaypointDisplayControllerContext
> {
  public static readonly CtrWaypointRole = 'CtrWptRole';

  private readonly waypointsDisplayModule: MapWaypointDisplayModule = this.context.model.getModule(MapSystemKeys.NearestWaypoints);

  // selectWaypointModule is only on the ND, not on the minimap
  private readonly selectWaypointModule?: MapFacilitySelectModule = this.context.model.getModule(EpicMapKeys.CtrWpt);

  private readonly flightPlanModule: MapFlightPlanModule = this.context.model.getModule(MapSystemKeys.FlightPlan);

  // private readonly navComSub = this.context.bus.getSubscriber<NavComSimVars>();

  // private readonly tunedVorIdents = ['', ''];

  private readonly waypointRenderer = this.context[MapSystemKeys.WaypointRenderer];

  private readonly systemWaypointRole = this.waypointRenderer.getRoleFromName(MapSystemWaypointRoles.Normal) ?? 0;

  protected displayWaypoint: FacilityWaypoint | undefined;

  private rangeSetting = 0;
  private readonly facilityMaxRange = new Map<FacilityType, number>([
    [FacilityType.Airport, 150],
    [FacilityType.Intersection, 5],
    [FacilityType.VOR, 200],
    [FacilityType.NDB, 50],
  ]);

  /**
   * Creates an instance of the WaypointDisplayController.
   * @param context The map system context to use with this controller.
   * @param mapWaypointsDisplay A subscribable MapWaypointsDisplay.
   * @param pfdOrMfd pfd or mfd.
   * @param mfdSettings The MFD settings, if this is for the MFD, otherwise leave undefined.
   * @param fixInfo The fix info manager.
   */
  constructor(
    context: MapSystemContext<WaypointDisplayControllerModules, any, any, WaypointDisplayControllerContext>,
    private readonly mapWaypointsDisplay: Subscribable<MapWaypointsDisplay>,
    private readonly pfdOrMfd: 'PFD' | 'MFD',
    private readonly mfdSettings?: UserSettingManager<MfdAliasedUserSettingTypes>,
    private readonly fixInfo?: Epic2FixInfoManager,
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    this.wireSettings();

    this.waypointsDisplayModule.airportsRange.set(200, UnitType.NMILE);

    this.waypointsDisplayModule.intersectionsRange.set(40, UnitType.NMILE);

    this.waypointsDisplayModule.vorsRange.set(200, UnitType.NMILE);

    this.waypointsDisplayModule.ndbsRange.set(100, UnitType.NMILE);

    this.waypointsDisplayModule.numAirports.set(100);

    this.waypointsDisplayModule.numIntersections.set(100);

    this.waypointsDisplayModule.numVors.set(110);

    // TODO Review for the Epic2
    this.waypointsDisplayModule.intersectionsFilter.set({
      typeMask: BitFlags.union(
        BitFlags.createFlag(IntersectionType.Named),
        BitFlags.createFlag(IntersectionType.Unnamed),
        BitFlags.createFlag(IntersectionType.Offroute),
        BitFlags.createFlag(IntersectionType.IAF),
        BitFlags.createFlag(IntersectionType.FAF),
        BitFlags.createFlag(IntersectionType.RNAV),
      ),
      showTerminalWaypoints: false,
    });

    this.waypointsDisplayModule.vorsFilter.set({
      typeMask: NearestVorSearchSession.Defaults.TypeMask,
      classMask: NearestVorSearchSession.Defaults.ClassMask,
    });

    this.waypointsDisplayModule.airportsFilter.set({
      classMask: BitFlags.union(
        BitFlags.createFlag(AirportClass.HardSurface),
        BitFlags.createFlag(AirportClass.SoftSurface),
        BitFlags.createFlag(AirportClass.AllWater),
        BitFlags.createFlag(AirportClass.Private),
      ),
      showClosed: NearestAirportSearchSession.Defaults.ShowClosed,
    });

    this.waypointsDisplayModule.extendedAirportsFilter.set({
      runwaySurfaceTypeMask: NearestAirportSearchSession.Defaults.SurfaceTypeMask,
      approachTypeMask: NearestAirportSearchSession.Defaults.ApproachTypeMask,
      minimumRunwayLength: 155,
      toweredMask: NearestAirportSearchSession.Defaults.ToweredMask,
    });
  }

  /**
   * Wires the settings system to the waypoint display controller.
   */
  private wireSettings(): void {
    this.mapWaypointsDisplay.sub((v) => this.handleSettingsChanged(v), true);

    // this.waypointsDisplayModule.waypointRoleSelector.set(w => {
    //   // const facility = (w as FacilityWaypoint).facility.get();
    //   // const isVor = ICAO.isFacility(facility.icao, FacilityType.VOR);
    //   // const identMatch = this.tunedVorIdents.includes(ICAO.getIdent(facility.icao));
    //   // if (isVor && identMatch) {
    //   //   return EpicMapCommon.tunedVorRole;
    //   // } else {
    //   //   return MapSystemWaypointRoles.Normal;
    //   // }
    // });

    // this.navComSub.on('nav_ident_1').whenChanged().handle(ident => {
    //   this.tunedVorIdents[0] = ident;
    //   this.waypointsDisplayModule.refreshWaypoints.notify();
    // });

    // this.navComSub.on('nav_ident_2').whenChanged().handle(ident => {
    //   this.tunedVorIdents[1] = ident;
    //   this.waypointsDisplayModule.refreshWaypoints.notify();
    // });

    // selectWaypointModule is only on the ND, not on the minimap
    this.selectWaypointModule?.facility.sub(this.updateDisplayWaypoint.bind(this));

    this.mfdSettings?.getSetting('mapRange').sub((v) => {
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
      if (FacilityWaypointUtils.isFacilityWaypoint(w) && !(w instanceof AirportWaypoint)) {
        // Don't show waypoint if it's in the active plan
        const plan = this.flightPlanModule.getPlanSubjects(Epic2FlightPlans.Active).flightPlan.get();
        if (plan) {
          for (const leg of plan.legs()) {
            if (leg.leg.fixIcao === w.facility.get().icao) {
              return false;
            }
          }
        }

        // selectWaypointModule is only on the ND, not on the minimap
        // Show waypoint if it's selected by the MAP CTR functionality
        if (this.selectWaypointModule && w.facility.get().icao === this.selectWaypointModule.facilityIcao.get()) {
          return true;
        }

        // Show waypoint if it's a fix info waypoint
        /*if (this.fixInfo && this.fixInfo.ndWaypoints.getArray().some(x => x.fixIcao === w.facility.get().icao)) {
          return true;
        }*/
      }

      const maxRange = this.facilityMaxRange.get(facType) ?? 600;
      if (this.rangeSetting > maxRange) {
        return false;
      }

      return this.pfdOrMfd === 'PFD' ? false : shouldShow;
    };
  }

  /**
   * Handles when the waypoint display settings mask has changed.
   * @param mask The waypoint display settings mask to apply.
   */
  private handleSettingsChanged(mask: number): void {
    this.waypointsDisplayModule.showAirports.set(this.shouldShowWaypoint(FacilityType.Airport, BitFlags.isAll(mask, MapWaypointsDisplay.Airports)));
    this.waypointsDisplayModule.showIntersections.set(this.shouldShowWaypoint(FacilityType.Intersection, BitFlags.isAll(mask, MapWaypointsDisplay.Intersections)));
    this.waypointsDisplayModule.showNdbs.set(this.shouldShowWaypoint(FacilityType.NDB, BitFlags.isAll(mask, MapWaypointsDisplay.NDBs)));
    this.waypointsDisplayModule.showVors.set(w => {

      // if (this.tunedVorIdents.includes(ICAO.getIdent((w as FacilityWaypoint).facility.get().icao))) {
      //   return true;
      // }

      return this.shouldShowWaypoint(FacilityType.VOR, BitFlags.isAny(mask, MapWaypointsDisplay.HiNavaids | MapWaypointsDisplay.LoNavaids))(w);
    });
  }

  /**
   * Updates the displayed facility.
   * @param facility The facility to display.
   */
  private updateDisplayWaypoint(facility: Facility | null): void {
    this.displayWaypoint && this.waypointRenderer.deregister(this.displayWaypoint, this.systemWaypointRole, 'waypoints-layer');
    if (facility !== null) {
      this.displayWaypoint = new BasicFacilityWaypoint(facility, this.context.bus);

      if (!this.waypointRenderer.isRegistered(this.displayWaypoint)) {
        this.waypointRenderer.register(this.displayWaypoint, this.systemWaypointRole, 'waypoints-layer');
      }
    }
  }
}
