import {
  BasicFacilityWaypoint, BitFlags, ClippedPathStream, ConsumerSubject, EventBus, FacilityLoader, FacilityRepository, FlightPlanner, FlightPlannerEvents, ICAO,
  MapCullableTextLabelManager, MapLayerProps, MapProjection, MapProjectionChangeType, MapSyncedCanvasLayer, MapSystemWaypointRoles, MapSystemWaypointsRenderer,
  NullPathStream, NumberUnit, SubscribableArrayEventType, UnitType, VecNSubject, VNavEvents, VNavPathMode, VNavWaypoint
} from '@microsoft/msfs-sdk';

import { WT21VNavDataEvents } from '../Navigation/WT21VnavEvents';
import { PerformancePlan } from '../Performance/PerformancePlan';
import { WT21FixInfoWaypoint } from '../Systems/FixInfo/WT21FixInfoData';
import { WT21FixInfoManager } from '../Systems/FixInfo/WT21FixInfoManager';
import { WT21FmsUtils } from '../Systems/FMS/WT21FmsUtils';
import { FixInfoFacilityWaypoint, MapDesAdvisoryLabelFactory, MapFixInfoIconFactory, MapTodIconFactory, MapTodLabelFactory } from './MapTod';
import { WT21MapKeys } from './WT21MapKeys';

/** The props for the MapTodLayer component. */
export interface MapTodLayerProps extends MapLayerProps<any> {
  /** The event bus. */
  bus: EventBus;
  /** A facility loader. If not defined, then a default instance will be created. */
  facLoader?: FacilityLoader;
  /** The flight planner. */
  planner: FlightPlanner;
  /** The waypoint renderer to use. */
  waypointRenderer: MapSystemWaypointsRenderer;
  /** The text label manager. */
  textManager: MapCullableTextLabelManager;
  /** The fix info manager. If not passed in, then fix info will not be rendered on this layer. */
  fixInfo?: WT21FixInfoManager;
  /** The active route perf plan. Only needed if fix info should be displayed. */
  activePerformancePlan?: PerformancePlan;
}

/**
 * Info about fix info waypoints.
 */
interface FixInfoWaypointEntry {
  /** The waypoint. */
  fixInfoWaypoint: FixInfoFacilityWaypoint<any>;
  /** The basic facility waypoint. */
  basicFacWaypoint: BasicFacilityWaypoint<any>;
}

/** The map layer for displaying the Tod. */
export class MapTodLayer extends MapSyncedCanvasLayer<MapTodLayerProps> {
  private static readonly TOD_DISTANCE_THRESHOLD = UnitType.METER.createNumber(100); // minimum distance from TOD for which to display TOD waypoint

  protected todWaypoint: VNavWaypoint | undefined;
  protected desAdvisoryWaypoint: VNavWaypoint | undefined;
  protected readonly TodWaypointRole = 'TodRole';
  protected readonly DesAdvisoryWaypointRole = 'DesAdvisoryRole';
  protected readonly FixInfoWaypointRole = 'FixInfoWaypointRole';
  protected readonly FixInfoMarkerRole = 'FixInfoMarkerRole';

  protected readonly vnavPathMode = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_path_mode').whenChanged(), VNavPathMode.None);
  protected readonly vnavTodLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index').whenChanged(), -1);
  protected readonly vnavTodLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToTod = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_distance').whenChanged(), -1);

  protected readonly vnavDesAdvisoryLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_global_leg_index').whenChanged(), -1);
  protected readonly vnavDesAdvisoryLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToDesAdvisory = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_distance').whenChanged(), -1);

  protected todLegEndDistance = new NumberUnit(0, UnitType.METER);

  protected readonly mapStyles = this.props.model.getModule(WT21MapKeys.MapStyles).styles;

  protected readonly facLoader = this.props.facLoader ?? new FacilityLoader(FacilityRepository.getRepository(this.props.bus));
  protected readonly boundsSub = VecNSubject.create(new Float64Array(4));
  protected readonly clipPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.boundsSub);
  protected readonly fixInfoWpEntries = new Map<WT21FixInfoWaypoint, FixInfoWaypointEntry>();

  /** @inheritdoc */
  onAttached(): void {
    super.onAttached();
    this.props.waypointRenderer.addRenderRole(this.TodWaypointRole);
    this.props.waypointRenderer.addRenderRole(this.DesAdvisoryWaypointRole);
    this.props.waypointRenderer.addRenderRole(this.FixInfoWaypointRole);

    // ToD
    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodLabelFactory());

    // DES Advisory
    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, new MapDesAdvisoryLabelFactory());

    // FixInfoWaypointRole
    this.props.waypointRenderer.setCanvasContext(
      this.props.waypointRenderer.getRoleFromName(this.FixInfoWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(
      this.props.waypointRenderer.getRoleFromName(this.FixInfoWaypointRole) ?? 0, new MapFixInfoIconFactory(this.mapStyles, this.clipPathStream));

    this.vnavPathMode.sub(() => { this.updateTodWaypoint(); });

    this.vnavTodLegIndex.sub(() => { this.updateTodWaypoint(); });
    this.vnavTodLegDistance.sub(() => { this.updateTodWaypoint(); });
    this.vnavDistanceToTod.sub(() => { this.updateTodWaypoint(); });

    this.vnavDesAdvisoryLegIndex.sub(() => { this.updateDesAdvisoryWaypoint(); });
    this.vnavDesAdvisoryLegDistance.sub(() => { this.updateDesAdvisoryWaypoint(); });
    this.vnavDistanceToDesAdvisory.sub(() => { this.updateDesAdvisoryWaypoint(); });

    // We also update every `fplCalculated` so that we refresh with valid leg calculations
    this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplCalculated').handle(() => {
      this.updateTodWaypoint();
      this.updateDesAdvisoryWaypoint();
    });

    if (this.props.fixInfo) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.props.fixInfo.ndWaypoints.sub(async (index, type, item, array) => {
        switch (type) {
          case SubscribableArrayEventType.Added: {
            if (!item) { return; }

            if ('fixIdent' in item) {
              this.handleFixInfoWpAdded(item);
            } else {
              item.forEach(x => this.handleFixInfoWpAdded(x));
            }
            break;
          }
          case SubscribableArrayEventType.Removed: {
            if (!item) { return; }

            if ('fixIdent' in item) {
              this.handleFixInfoWpRemoved(item);
            } else {
              item.forEach(x => this.handleFixInfoWpRemoved(x));
            }
            break;
          }
          case SubscribableArrayEventType.Cleared: {
            this.fixInfoWpEntries.forEach(x => this.deregisterFixInfoWpEntry(x));
            this.fixInfoWpEntries.clear();
            break;
          }
        }
      }, true);
    }

    const width = this.getWidth();
    const height = this.getHeight();
    this.boundsSub.set(-10, -10, width + 10, height + 10);

    this.clipPathStream.setConsumer(this.display.context);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      const width = this.getWidth();
      const height = this.getHeight();

      this.boundsSub.set(-10, -10, width + 10, height + 10);
    }
  }

  /**
   * Handles a new fix info waypoint being added.
   * @param wp The new waypoint.
   */
  private async handleFixInfoWpAdded(wp: WT21FixInfoWaypoint): Promise<void> {
    const facility = await this.facLoader.getFacility(ICAO.getFacilityType(wp.fixIcao), wp.fixIcao);

    if (this.props.fixInfo?.ndWaypoints.getArray().includes(wp) === false) {
      // If wp was removed while getting the fac, don't register it
      return;
    }

    const fixInfoWaypoint = new FixInfoFacilityWaypoint(facility, this.props.bus, wp);
    const basicFacWaypoint = new BasicFacilityWaypoint(facility, this.props.bus);
    const entry: FixInfoWaypointEntry = {
      fixInfoWaypoint,
      basicFacWaypoint,
    };

    this.props.waypointRenderer.register(fixInfoWaypoint, this.props.waypointRenderer.getRoleFromName(this.FixInfoWaypointRole) ?? 0, 'fix-info-layer');
    this.props.waypointRenderer.register(basicFacWaypoint, this.props.waypointRenderer.getRoleFromName(MapSystemWaypointRoles.Normal) ?? 0, 'fix-info-layer');

    this.fixInfoWpEntries.set(wp, entry);
  }

  /**
   * Handles when fix info waypoints are removed.
   * @param wp The waypoint that was removed.
   */
  private handleFixInfoWpRemoved(wp: WT21FixInfoWaypoint): void {
    const entry = this.fixInfoWpEntries.get(wp);
    if (entry !== undefined) {
      this.deregisterFixInfoWpEntry(entry);
      this.fixInfoWpEntries.delete(wp);
    }
  }

  /**
   * Deregisters a fix info entry from the renderers.
   * @param entry The wp entry to deregister.
   */
  private deregisterFixInfoWpEntry(entry: FixInfoWaypointEntry): void {
    this.props.waypointRenderer.deregister(entry.fixInfoWaypoint, this.props.waypointRenderer.getRoleFromName(this.FixInfoWaypointRole) ?? 0, 'fix-info-layer');
    this.props.waypointRenderer.deregister(entry.basicFacWaypoint, this.props.waypointRenderer.getRoleFromName(MapSystemWaypointRoles.Normal) ?? 0, 'fix-info-layer');
  }

  /**
   * Updates the TOD waypoint.
   */
  updateTodWaypoint(): void {
    this.todWaypoint && this.props.waypointRenderer.deregister(this.todWaypoint, this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, 'tod-layer-tod');
    this.todWaypoint = undefined;

    if (this.props.planner.hasActiveFlightPlan()) {
      const plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

      if (plan.segmentCount > 1 && this.vnavTodLegIndex.get() >= 0
        && this.vnavPathMode.get() !== VNavPathMode.PathActive
        && MapTodLayer.TOD_DISTANCE_THRESHOLD.compare(this.vnavDistanceToTod.get()) <= 0) {
        try {
          const leg = plan.getLeg(this.vnavTodLegIndex.get());
          this.todWaypoint = new VNavWaypoint(leg, this.vnavTodLegDistance.get(), 'vnav-tod', 'TOD');
          this.props.waypointRenderer.register(this.todWaypoint, this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, 'tod-layer-tod');
        } catch (error) {
          console.warn(`Invalid tod leg at: ${this.vnavTodLegIndex.get()}`);
        }
      }
    }
  }

  /**
   * Updates the DES Advisory waypoint.
   */
  updateDesAdvisoryWaypoint(): void {
    this.desAdvisoryWaypoint && this.props.waypointRenderer.deregister(this.desAdvisoryWaypoint, this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, 'tod-layer-des');
    this.desAdvisoryWaypoint = undefined;

    if (this.props.planner.hasActiveFlightPlan()) {
      const plan = this.props.planner.getFlightPlan(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX);

      if (plan.segmentCount > 1 && this.vnavDesAdvisoryLegIndex.get() >= 0
        && MapTodLayer.TOD_DISTANCE_THRESHOLD.compare(this.vnavDistanceToDesAdvisory.get()) <= 0
      ) {
        try {
          const leg = plan.getLeg(this.vnavDesAdvisoryLegIndex.get());
          this.desAdvisoryWaypoint = new VNavWaypoint(leg, this.vnavDesAdvisoryLegDistance.get(), 'wt21vnav-des-advisory', 'DES');
          this.props.waypointRenderer.register(this.desAdvisoryWaypoint, this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, 'tod-layer-des');
        } catch (error) {
          console.warn(`Invalid DES advisory leg at: ${this.vnavDesAdvisoryLegIndex.get()}`);
        }
      }
    }
  }
}
