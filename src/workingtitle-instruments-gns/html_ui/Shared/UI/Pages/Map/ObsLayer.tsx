import {
  EventBus, FSComponent, GeoCircle, GeoCircleLineRenderer, GeoCircleResampler, GeoPoint, GeoProjectionPathStreamStack,
  LNavObsEvents, LNavUtils, MagVar, MapCachedCanvasLayer, MapFlightPlanModule, MapLayer, MapLayerProps, MapProjection,
  MapSystemKeys, NullPathStream, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

/**
 * Modules required by the layer.
 */
interface RequiredModules {
  /** The flight plan module. */
  [MapSystemKeys.FlightPlan]: MapFlightPlanModule;
}

/**
 * Props on the ObsLayer component.
 */
interface ObsLayerProps extends MapLayerProps<RequiredModules> {
  /** An instance of the event bus */
  bus: EventBus;

  /** The FMS instance. */
  fms: Fms;
}

/**
 * A layer that displays the OBS path.
 */
export class ObsLayer extends MapLayer<ObsLayerProps> {
  private static readonly geoPointCache = [new GeoPoint(0, 0), new GeoPoint(0, 0)];
  private static readonly geoCircleCache = [new GeoCircle(new Float64Array(3), 0)];

  private readonly lineRenderer = new GeoCircleLineRenderer();
  private readonly resampler = new GeoCircleResampler(Math.PI / 12, 0.25, 8);
  private readonly streamStack = new GeoProjectionPathStreamStack(NullPathStream.INSTANCE, this.props.mapProjection.getGeoProjection(), this.resampler);
  private readonly canvasLayer = FSComponent.createRef<MapCachedCanvasLayer>();

  private obsActiveSub?: Subscription;
  private obsCourseSub?: Subscription;
  private activePlanSub?: Subscription;

  private isObsActive = false;
  private obsCourse = 0;
  private activePlanIndex = 0;
  private needsRender = false;

  /** @inheritdoc */
  public onAttached(): void {
    const sub = this.props.bus.getSubscriber<LNavObsEvents>();

    const lnavTopicSuffix = LNavUtils.getEventBusTopicSuffix(this.props.fms.lnavIndex);

    this.obsActiveSub = sub.on(`lnav_obs_active${lnavTopicSuffix}`).whenChanged().handle(v => {
      this.isObsActive = v;
      this.needsRender = true;
    });

    this.obsCourseSub = sub.on(`lnav_obs_course${lnavTopicSuffix}`).whenChanged().handle(v => {
      this.obsCourse = v;
      this.needsRender = true;
    });

    this.activePlanSub = this.props.fms.flightPlanner.onEvent('fplIndexChanged').handle(v => {
      this.activePlanIndex = v.planIndex;
      this.needsRender = true;
    });

    this.canvasLayer.instance.onAttached();
    this.streamStack.setConsumer(this.canvasLayer.instance.display.context);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    super.onUpdated(time, elapsed);

    this.canvasLayer.instance.onUpdated(time, elapsed);
    this.drawPath();
  }

  /**
   * Draws the OBS path.
   */
  private drawPath(): void {
    const display = this.canvasLayer.instance.tryGetDisplay();

    if (display !== undefined && (display.isInvalid || this.needsRender)) {
      display.clear();
      display.invalidate();

      display.syncWithMapProjection(this.props.mapProjection);
      this.streamStack.setProjection(this.canvasLayer.instance.display.geoProjection);

      const planSubs = this.props.model.getModule(MapSystemKeys.FlightPlan).getPlanSubjects(this.activePlanIndex);
      const leg = planSubs.flightPlan.get()?.tryGetLeg(planSubs.activeLeg.get());
      this.needsRender = false;

      if (!this.isObsActive || leg === undefined || leg?.calculated?.endLat === undefined || leg?.calculated?.endLon === undefined) {
        return;
      }

      const context = display.context;

      const obsFix = ObsLayer.geoPointCache[0].set(leg.calculated.endLat, leg.calculated.endLon);
      const obsLat = obsFix.lat;
      const obsLon = obsFix.lon;

      const obsCourseTrue = MagVar.magneticToTrue(this.obsCourse, obsLat, obsLon);
      const obsPath = ObsLayer.geoCircleCache[0].setAsGreatCircle(obsFix, obsCourseTrue);

      const start = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(-500, UnitType.GA_RADIAN), ObsLayer.geoPointCache[1]);
      const startLat = start.lat;
      const startLon = start.lon;

      const end = obsPath.offsetDistanceAlong(obsFix, UnitType.NMILE.convertTo(500, UnitType.GA_RADIAN), ObsLayer.geoPointCache[1]);
      const endLat = end.lat;
      const endLon = end.lon;

      this.lineRenderer.render(obsPath, startLat, startLon, obsLat, obsLon, context, this.streamStack, 3, 'magenta');
      this.lineRenderer.render(obsPath, obsLat, obsLon, endLat, endLon, context, this.streamStack, 3, 'white');
    }
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    super.onMapProjectionChanged(mapProjection, changeFlags);
    this.canvasLayer.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.needsRender = true;
  }

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.canvasLayer.instance.onVisibilityChanged(isVisible);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapCachedCanvasLayer useBuffer={true} overdrawFactor={Math.SQRT2} model={this.props.model} mapProjection={this.props.mapProjection} ref={this.canvasLayer} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.obsActiveSub?.destroy();
    this.obsCourseSub?.destroy();
    this.activePlanSub?.destroy();
  }
}