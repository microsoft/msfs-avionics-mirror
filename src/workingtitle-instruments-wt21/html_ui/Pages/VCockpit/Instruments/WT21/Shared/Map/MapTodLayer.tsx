import {
  ConsumerSubject,
  EventBus,
  FlightPlanner,
  FlightPlannerEvents,
  MapLayerProps,
  MapSyncedCanvasLayer,
  MapSystemWaypointsRenderer,
  NumberUnit,
  UnitType,
  VNavEvents,
  VNavPathMode,
  VNavWaypoint
} from '@microsoft/msfs-sdk';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { MapDesAdvisoryLabelFactory, MapTodIconFactory, MapTodLabelFactory } from './MapTod';
import { WT21VNavDataEvents } from '../Navigation/WT21VnavEvents';

/** The props for the MapTodLayer component. */
export interface MapTodLayerProps extends MapLayerProps<any> {
  /** The event bus. */
  bus: EventBus;
  /** The flight planner. */
  planner: FlightPlanner;
  /** The waypoint renderer to use. */
  waypointRenderer: MapSystemWaypointsRenderer;
}

/** The map layer for displaying the Tod. */
export class MapTodLayer extends MapSyncedCanvasLayer<MapTodLayerProps>{
  private static readonly TOD_DISTANCE_THRESHOLD = UnitType.METER.createNumber(100); // minimum distance from TOD for which to display TOD waypoint

  protected todWaypoint: VNavWaypoint | undefined;
  protected desAdvisoryWaypoint: VNavWaypoint | undefined;
  protected readonly TodWaypointRole = 'TodRole';
  protected readonly DesAdvisoryWaypointRole = 'DesAdvisoryRole';

  protected readonly vnavPathMode = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_path_mode').whenChanged(), VNavPathMode.None);
  protected readonly vnavTodLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index').whenChanged(), -1);
  protected readonly vnavTodLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToTod = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_distance').whenChanged(), -1);

  protected readonly vnavDesAdvisoryLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_global_leg_index').whenChanged(), -1);
  protected readonly vnavDesAdvisoryLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToDesAdvisory = ConsumerSubject.create(this.props.bus.getSubscriber<WT21VNavDataEvents>().on('wt21vnav_des_advisory_distance').whenChanged(), -1);

  protected todLegEndDistance = new NumberUnit(0, UnitType.METER);

  /** @inheritdoc */
  onAttached(): void {
    super.onAttached();
    this.props.waypointRenderer.addRenderRole(this.TodWaypointRole);
    this.props.waypointRenderer.addRenderRole(this.DesAdvisoryWaypointRole);

    // ToD
    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodLabelFactory());

    // DES Advisory
    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.DesAdvisoryWaypointRole) ?? 0, new MapDesAdvisoryLabelFactory());

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
  }

  /**
   * Updates the TOD waypoint.
   */
  updateTodWaypoint(): void {
    this.todWaypoint && this.props.waypointRenderer.deregister(this.todWaypoint, this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, 'tod-layer-tod');
    this.todWaypoint = undefined;

    if (this.props.planner.hasActiveFlightPlan()) {
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

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
      const plan = this.props.planner.getFlightPlan(WT21Fms.PRIMARY_ACT_PLAN_INDEX);

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