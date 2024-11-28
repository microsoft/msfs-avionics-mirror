import {
  ConsumerSubject, EventBus, FlightPlanner, FlightPlannerEvents, MapLayerProps, MapSyncedCanvasLayer,
  MapSystemWaypointsRenderer, UnitType, VNavEvents, VNavPathMode, VNavWaypoint
} from '@microsoft/msfs-sdk';
import { Epic2FlightPlans } from '../Fms';
import { MapTocLabelFactory, MapTodIconFactory, MapTodLabelFactory } from './MapTod';

/** The props for the MapTodLayer component. */
export interface MapTodLayerProps extends MapLayerProps<any> {
  /** The event bus. */
  bus: EventBus;
  /** The flight planner. */
  planner: FlightPlanner;
  /** The waypoint renderer to use. */
  waypointRenderer: MapSystemWaypointsRenderer;
}

/** The map layer for displaying the ToD and ToC. */
export class MapTodLayer extends MapSyncedCanvasLayer<MapTodLayerProps>{

  // ToD
  private static readonly TOD_DISTANCE_THRESHOLD = UnitType.METER.createNumber(100); // minimum distance from TOD for which to display TOD waypoint

  protected todWaypoint: VNavWaypoint | undefined;
  protected readonly TodWaypointRole = 'TodRole';

  protected readonly vnavPathMode = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_path_mode').whenChanged(), VNavPathMode.None);
  protected readonly vnavTodLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_global_leg_index').whenChanged(), -1);
  protected readonly vnavTodLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToTod = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_tod_distance').whenChanged(), -1);


  // ToC
  protected tocWaypoint: VNavWaypoint | undefined;
  protected readonly TocWaypointRole = 'TocRole';

  protected readonly vnavTocLegIndex = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_toc_global_leg_index').whenChanged(), -1);
  protected readonly vnavTocLegDistance = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_toc_leg_distance').whenChanged(), -1);
  protected readonly vnavDistanceToToc = ConsumerSubject.create(this.props.bus.getSubscriber<VNavEvents>().on('vnav_toc_distance').whenChanged(), -1);


  /** @inheritdoc */
  onAttached(): void {
    super.onAttached();

    // ToD
    this.props.waypointRenderer.addRenderRole(this.TodWaypointRole);

    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, new MapTodLabelFactory());

    this.vnavPathMode.sub(() => { this.updateTodWaypoint(); });
    this.vnavTodLegIndex.sub(() => { this.updateTodWaypoint(); });
    this.vnavTodLegDistance.sub(() => { this.updateTodWaypoint(); });
    this.vnavDistanceToTod.sub(() => { this.updateTodWaypoint(); });

    // ToC
    this.props.waypointRenderer.addRenderRole(this.TocWaypointRole);

    this.props.waypointRenderer.setCanvasContext(this.props.waypointRenderer.getRoleFromName(this.TocWaypointRole) ?? 0, this.display.context);
    this.props.waypointRenderer.setIconFactory(this.props.waypointRenderer.getRoleFromName(this.TocWaypointRole) ?? 0, new MapTodIconFactory());
    this.props.waypointRenderer.setLabelFactory(this.props.waypointRenderer.getRoleFromName(this.TocWaypointRole) ?? 0, new MapTocLabelFactory());

    this.vnavTocLegIndex.sub(() => { this.updateTocWaypoint(); });
    this.vnavTocLegDistance.sub(() => { this.updateTocWaypoint(); });
    this.vnavDistanceToToc.sub(() => { this.updateTocWaypoint(); });

    // We also update every `fplCalculated` so that we refresh with valid leg calculations
    this.props.bus.getSubscriber<FlightPlannerEvents>().on('fplCalculated').handle(() => {
      this.updateTodWaypoint();
      this.updateTocWaypoint();
    });
  }

  /**
   * Updates the TOC waypoint.
   */
  private updateTocWaypoint(): void {
    this.tocWaypoint && this.props.waypointRenderer.deregister(this.tocWaypoint, this.props.waypointRenderer.getRoleFromName(this.TocWaypointRole) ?? 0, 'toc-layer-toc');
    this.tocWaypoint = undefined;

    if (this.props.planner.hasActiveFlightPlan()) {
      const plan = this.props.planner.getFlightPlan(Epic2FlightPlans.Active);

      if (plan.segmentCount > 1 && this.vnavTocLegIndex.get() >= 0) {
        try {
          const leg = plan.getLeg(this.vnavTocLegIndex.get());
          this.tocWaypoint = new VNavWaypoint(leg, this.vnavTocLegDistance.get(), 'vnav-toc', 'TOC');
          this.props.waypointRenderer.register(this.tocWaypoint, this.props.waypointRenderer.getRoleFromName(this.TocWaypointRole) ?? 0, 'toc-layer-toc');
        } catch (error) {
          console.warn(`Invalid ToC leg at: ${this.vnavTocLegIndex.get()}`);
        }
      }
    }
  }

  /**
   * Updates the TOD waypoint.
   */
  updateTodWaypoint(): void {
    this.todWaypoint && this.props.waypointRenderer.deregister(this.todWaypoint, this.props.waypointRenderer.getRoleFromName(this.TodWaypointRole) ?? 0, 'tod-layer-tod');
    this.todWaypoint = undefined;

    if (this.props.planner.hasActiveFlightPlan()) {
      const plan = this.props.planner.getFlightPlan(Epic2FlightPlans.Active);

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
}
