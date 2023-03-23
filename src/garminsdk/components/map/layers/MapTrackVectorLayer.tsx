import {
  ExpSmoother, FSComponent, MapDataIntegrityModule, MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MappedSubject, MappedSubscribable, MapProjection, MapSyncedCanvasLayer,
  MapSystemKeys, NumberUnitInterface, Subject, Subscribable, Subscription, UnitFamily, UnitType, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapTrackVectorModule } from '../modules/MapTrackVectorModule';

/**
 * Modules required for MapTrackVectorLayer.
 */
export interface MapTrackVectorLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Track vector module. */
  [GarminMapKeys.TrackVector]: MapTrackVectorModule;

  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]?: MapDataIntegrityModule;
}

/**
 * Component props for MapTrackVectorLayer.
 */
export interface MapTrackVectorLayerProps extends MapLayerProps<MapTrackVectorLayerModules> {
  /** The minimum turn rate of the player airplane, in degrees per second, required to draw the track vector as an arc. */
  arcTurnRateThreshold: number | Subscribable<number>;

  /** The maximum lookahead time for which the track vector can be drawn as an arc. */
  arcMaxLookaheadTime: NumberUnitInterface<UnitFamily.Duration> | Subscribable<NumberUnitInterface<UnitFamily.Duration>>;

  /** The width of the vector stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The style of the vector stroke. Defaults to `'cyan'`. */
  strokeStyle?: string;

  /** The width of the vector outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The style of the vector outline. Defaults to `'#505050'`. */
  outlineStyle?: string;
}

/**
 * A map layer which displays a track vector.
 */
export class MapTrackVectorLayer extends MapLayer<MapTrackVectorLayerProps> {
  private static readonly DEFAULT_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_STROKE_STYLE = 'cyan';
  private static readonly DEFAULT_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_OUTLINE_STYLE = '#505050';

  private static readonly vec2Cache = [new Float64Array(2)];

  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly strokeWidth = this.props.strokeWidth ?? MapTrackVectorLayer.DEFAULT_STROKE_WIDTH;
  private readonly strokeStyle = this.props.strokeStyle ?? MapTrackVectorLayer.DEFAULT_STROKE_STYLE;
  private readonly outlineWidth = this.props.outlineWidth ?? MapTrackVectorLayer.DEFAULT_OUTLINE_WIDTH;
  private readonly outlineStyle = this.props.outlineStyle ?? MapTrackVectorLayer.DEFAULT_OUTLINE_STYLE;

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly trackVectorModule = this.props.model.getModule(GarminMapKeys.TrackVector);

  private readonly arcTurnRateThreshold = (typeof this.props.arcTurnRateThreshold === 'object')
    ? this.props.arcTurnRateThreshold
    : Subject.create(this.props.arcTurnRateThreshold);
  private readonly arcMaxLookaheadTime = ('isSubscribable' in this.props.arcMaxLookaheadTime)
    ? this.props.arcMaxLookaheadTime
    : Subject.create(this.props.arcMaxLookaheadTime);

  private readonly projectedPlanePosition = Vec2Subject.createFromVector(new Float64Array(2));
  private readonly projectPlanePositionHandler = (): void => {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), MapTrackVectorLayer.vec2Cache[0]);
    this.projectedPlanePosition.set(projected);
  };

  private readonly turnRateSmoother = new ExpSmoother(500 / Math.LN2, undefined, 1000);

  private isVectorVisible?: MappedSubscribable<boolean>;

  private needUpdate = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.needUpdate = true;
    } else {
      this.canvasLayerRef.getOrDefault()?.tryGetDisplay()?.clear();
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.canvasLayerRef.instance.onAttached();

    this.subscriptions.push(this.ownAirplanePropsModule.position.sub(this.projectPlanePositionHandler));

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    const dataIntegrityModule = this.props.model.getModule(MapSystemKeys.DataIntegrity);

    this.isVectorVisible = MappedSubject.create(
      ([show, isOnGround, isGpsValid, isHeadingValid, isAttitudeValid, isAdcValid]) => show && !isOnGround && isGpsValid && isAdcValid && (isHeadingValid || isAttitudeValid),
      this.trackVectorModule.show,
      this.ownAirplanePropsModule.isOnGround,
      dataIntegrityModule?.gpsSignalValid ?? Subject.create(true),
      dataIntegrityModule?.headingSignalValid ?? Subject.create(true),
      dataIntegrityModule?.attitudeSignalValid ?? Subject.create(true),
      dataIntegrityModule?.adcSignalValid ?? Subject.create(true)
    );
    this.isVectorVisible.sub(isVisible => { this.setVisible(isVisible); }, true);

    this.subscriptions.push(this.projectedPlanePosition.sub(scheduleUpdate));

    this.subscriptions.push(this.ownAirplanePropsModule.turnRate.sub(scheduleUpdate));
    this.subscriptions.push(this.ownAirplanePropsModule.trackTrue.sub(scheduleUpdate));
    this.subscriptions.push(this.ownAirplanePropsModule.groundSpeed.sub(scheduleUpdate));

    this.subscriptions.push(this.trackVectorModule.lookaheadTime.sub(scheduleUpdate, true));
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.projectPlanePositionHandler();
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const display = this.canvasLayerRef.instance.display!;
    display.clear();

    const lookaheadTime = this.trackVectorModule.lookaheadTime.get();

    const track = this.ownAirplanePropsModule.trackTrue.get();
    const groundSpeed = this.ownAirplanePropsModule.groundSpeed.get();
    const turnRate = this.turnRateSmoother.next(this.ownAirplanePropsModule.turnRate.get(), elapsed);

    const distanceNM = groundSpeed.asUnit(UnitType.KNOT) * lookaheadTime.asUnit(UnitType.HOUR);
    const distancePx = UnitType.NMILE.convertTo(distanceNM, UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
    const projectedTrackAngle = track * Avionics.Utils.DEG2RAD + this.props.mapProjection.getRotation() - Math.PI / 2;

    const projectedPlanePos = this.projectedPlanePosition.get();

    display.context.beginPath();
    display.context.moveTo(projectedPlanePos[0], projectedPlanePos[1]);
    if (Math.abs(turnRate) < this.arcTurnRateThreshold.get() || lookaheadTime.compare(this.arcMaxLookaheadTime.get()) > 0) {
      // draw a line
      const delta = Vec2Math.setFromPolar(distancePx, projectedTrackAngle, MapTrackVectorLayer.vec2Cache[0]);

      display.context.lineTo(projectedPlanePos[0] + delta[0], projectedPlanePos[1] + delta[1]);
    } else {
      // draw an arc
      const groundSpeedPxPerSec = UnitType.NMILE.convertTo(groundSpeed.asUnit(UnitType.KNOT) / 3600, UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
      const turnRadius = groundSpeedPxPerSec / (turnRate * Avionics.Utils.DEG2RAD);
      const angularWidthDrawn = Utils.Clamp(distancePx / turnRadius, -Math.PI / 2, Math.PI / 2);

      const circleOffsetAngle = projectedTrackAngle + Math.PI / 2;
      const circleCenter = Vec2Math.add(
        Vec2Math.setFromPolar(turnRadius, circleOffsetAngle, MapTrackVectorLayer.vec2Cache[0]),
        projectedPlanePos,
        MapTrackVectorLayer.vec2Cache[0]
      );
      const startAngle = circleOffsetAngle + (turnRadius < 0 ? 0 : Math.PI);
      const endAngle = startAngle + angularWidthDrawn;

      display.context.arc(circleCenter[0], circleCenter[1], Math.abs(turnRadius), startAngle, endAngle, turnRadius < 0);
    }

    display.context.lineWidth = this.strokeWidth + this.outlineWidth * 2;
    display.context.strokeStyle = this.outlineStyle;
    display.context.stroke();

    display.context.lineWidth = this.strokeWidth;
    display.context.strokeStyle = this.strokeStyle;
    display.context.stroke();

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isVectorVisible?.destroy();

    this.subscriptions.forEach(sub => sub.destroy());
  }
}