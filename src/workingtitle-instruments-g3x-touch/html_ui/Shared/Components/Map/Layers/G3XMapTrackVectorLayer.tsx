/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AffineTransformPathStream, BitFlags, ClippedPathStream, FSComponent, MapDataIntegrityModule,
  MapLayer, MapLayerProps, MapOwnAirplanePropsModule, MappedSubject, MapProjection,
  MapProjectionChangeType, MapSyncedCanvasLayer, MapSystemKeys, MathUtils, NullPathStream, Subject,
  Subscription, UnitType, Vec2Math, Vec2Subject, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { GarminMapKeys, MapUnitsModule } from '@microsoft/msfs-garminsdk';

import { G3XMapTrackVectorMode, G3XMapTrackVectorModule } from '../Modules/G3XMapTrackVectorModule';

/**
 * Modules required for G3XMapTrackVectorLayer.
 */
export interface G3XMapTrackVectorLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Track vector module. */
  [GarminMapKeys.TrackVector]: G3XMapTrackVectorModule;

  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]?: MapDataIntegrityModule;

  /** Display units module. */
  [GarminMapKeys.Units]?: MapUnitsModule;
}

/**
 * Component props for G3XMapTrackVectorLayer.
 */
export interface G3XMapTrackVectorLayerProps extends MapLayerProps<G3XMapTrackVectorLayerModules> {
  /** The width of the vector stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The color of the vector stroke. Defaults to `'cyan'`. */
  strokeColor?: string;

  /** The width of the vector outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The color of the vector outline. Defaults to `'#505050'`. */
  outlineColor?: string;

  /** The length of each vector tick, in pixels. Defaults to 10 pixels. */
  tickLength?: number;
}

/**
 * A map layer which displays a track vector.
 */
export class G3XMapTrackVectorLayer extends MapLayer<G3XMapTrackVectorLayerProps> {
  private static readonly DEFAULT_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_STROKE_STYLE = 'cyan';
  private static readonly DEFAULT_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_OUTLINE_STYLE = '#505050';
  private static readonly DEFAULT_TICK_LENGTH = 10; // px

  private static readonly vec2Cache = [Vec2Math.create()];

  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly strokeWidth = this.props.strokeWidth ?? G3XMapTrackVectorLayer.DEFAULT_STROKE_WIDTH;
  private readonly strokeStyle = this.props.strokeColor ?? G3XMapTrackVectorLayer.DEFAULT_STROKE_STYLE;
  private readonly outlineWidth = this.props.outlineWidth ?? G3XMapTrackVectorLayer.DEFAULT_OUTLINE_WIDTH;
  private readonly outlineStyle = this.props.outlineColor ?? G3XMapTrackVectorLayer.DEFAULT_OUTLINE_STYLE;
  private readonly tickLength = this.props.tickLength ?? G3XMapTrackVectorLayer.DEFAULT_TICK_LENGTH;

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly trackVectorModule = this.props.model.getModule(GarminMapKeys.TrackVector);
  private readonly dataIntegrityModule = this.props.model.getModule(MapSystemKeys.DataIntegrity);
  private readonly unitsModule = this.props.model.getModule(GarminMapKeys.Units);

  private readonly projectedPlanePosition = Vec2Subject.create(new Float64Array(2));
  private readonly projectPlanePositionHandler = (): void => {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), G3XMapTrackVectorLayer.vec2Cache[0]);
    this.projectedPlanePosition.set(projected);
  };

  private readonly isVectorVisible = MappedSubject.create(
    ([mode, gs, isGpsValid, isAdcValid], previousVal?: boolean): boolean => {
      return mode !== G3XMapTrackVectorMode.Off
        && isGpsValid
        && isAdcValid
        && gs.asUnit(UnitType.KNOT) >= (previousVal ? 30 : 28);
    },
    this.trackVectorModule.mode,
    this.ownAirplanePropsModule.groundSpeed,
    this.dataIntegrityModule?.gpsSignalValid ?? Subject.create(true),
    this.dataIntegrityModule?.adcSignalValid ?? Subject.create(true)
  ).pause();

  private readonly clipBounds = VecNSubject.create(VecNMath.create(4));
  private readonly clipPathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.clipBounds);
  private readonly transformPathStream = new AffineTransformPathStream(this.clipPathStream);

  private needUpdate = false;

  private distanceSub?: Subscription;
  private timeSub?: Subscription;
  private distanceUnitsSub?: Subscription;
  private gsSub?: Subscription;

  private readonly subscriptions: Subscription[] = [
    this.isVectorVisible
  ];

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

    this.clipPathStream.setConsumer(this.canvasLayerRef.instance.display.context);

    this.initCanvasStyles();
    this.updateClipBounds();

    this.subscriptions.push(this.ownAirplanePropsModule.position.sub(this.projectPlanePositionHandler));

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    this.isVectorVisible.resume();
    this.isVectorVisible.sub(this.setVisible.bind(this), true);

    if (this.unitsModule) {
      this.subscriptions.push(
        this.distanceUnitsSub = this.unitsModule.distanceLarge.sub(scheduleUpdate, false, true)
      );
    }

    this.subscriptions.push(
      this.projectedPlanePosition.sub(scheduleUpdate),
      this.ownAirplanePropsModule.trackTrue.sub(scheduleUpdate),
      this.gsSub = this.ownAirplanePropsModule.groundSpeed.sub(scheduleUpdate),
      this.distanceSub = this.trackVectorModule.lookaheadDistance.sub(scheduleUpdate, false, true),
      this.timeSub = this.trackVectorModule.lookaheadTime.sub(scheduleUpdate, false, true),

      this.trackVectorModule.mode.sub(mode => {
        switch (mode) {
          case G3XMapTrackVectorMode.Distance:
            this.timeSub!.pause();
            this.gsSub!.pause();
            this.distanceSub!.resume(true);
            this.distanceUnitsSub!.resume();
            break;
          case G3XMapTrackVectorMode.Time:
            this.distanceSub!.pause();
            this.distanceUnitsSub!.pause();
            this.timeSub!.resume(true);
            this.gsSub!.resume();
            break;
          default:
            this.distanceSub!.pause();
            this.distanceUnitsSub!.pause();
            this.timeSub!.pause();
            this.gsSub!.pause();
        }
      }, true)
    );

    this.needUpdate = true;
  }

  /**
   * Initializes this layer's static canvas styles.
   */
  private initCanvasStyles(): void {
    this.canvasLayerRef.instance.display.context.lineCap = 'round';
  }

  /**
   * Updates this layer's clipping boundaries.
   */
  private updateClipBounds(): void {
    const size = this.props.mapProjection.getProjectedSize();
    this.clipBounds.set(-10, -10, size[0] + 10, size[1] + 10);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAny(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      this.initCanvasStyles();
      this.updateClipBounds();
    }

    this.projectPlanePositionHandler();
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const display = this.canvasLayerRef.instance.display;
    display.clear();

    const track = this.ownAirplanePropsModule.trackTrue.get();

    if (this.trackVectorModule.mode.get() === G3XMapTrackVectorMode.Distance) {
      const distanceRad = this.trackVectorModule.lookaheadDistance.get().asUnit(UnitType.GA_RADIAN);
      const tickIntervalRad = (this.unitsModule?.distanceLarge.get() ?? UnitType.NMILE).convertTo(1, UnitType.GA_RADIAN);
      this.drawVector(display.context, this.props.mapProjection, track, distanceRad, tickIntervalRad);
    } else {
      const groundSpeed = this.ownAirplanePropsModule.groundSpeed.get();
      const lookaheadTime = this.trackVectorModule.lookaheadTime.get();
      const gsRadPerMin = UnitType.NMILE.convertTo(groundSpeed.asUnit(UnitType.KNOT), UnitType.GA_RADIAN) / 60;
      const distanceRad = gsRadPerMin * lookaheadTime.asUnit(UnitType.MINUTE);
      this.drawVector(display.context, this.props.mapProjection, track, distanceRad, gsRadPerMin);
    }

    this.needUpdate = false;
  }

  /**
   * Draws this layer's track vector.
   * @param context The canvas 2D rendering context to which to draw the vector.
   * @param projection The map projection to use to draw the vector.
   * @param track The vector's true ground track, in degrees.
   * @param distance The vector's total distance, in great-arc radians.
   * @param tickInterval The distance interval between each vector tick, in great-arc radians.
   */
  public drawVector(
    context: CanvasRenderingContext2D,
    projection: MapProjection,
    track: number,
    distance: number,
    tickInterval: number
  ): void {
    const resolution = projection.getProjectedResolution();
    const projectedDiag = Vec2Math.abs(projection.getProjectedSize());

    // Cull the ticks if we are zoomed out enough that more than ~50 ticks could be visible.
    const drawTicks = projectedDiag * resolution / tickInterval <= 50;

    // Approximating the track vector as a straight line isn't accurate for long track vectors, but drawing the true
    // projected great circle (specifically the ticks) isn't worth the performance cost.

    this.transformPathStream.beginPath();

    const originProjected = this.projectedPlanePosition.get();

    this.transformPathStream
      .resetTransform()
      .addRotation(track * Avionics.Utils.DEG2RAD + projection.getRotation() - MathUtils.HALF_PI)
      .addTranslation(originProjected[0], originProjected[1]);

    this.transformPathStream.moveTo(0, 0);
    this.transformPathStream.lineTo(distance / resolution, 0);

    if (drawTicks) {
      const halfTickLength = this.tickLength / 2;
      const maxD = distance + 1e-6;
      for (let d = tickInterval; d <= maxD; d += tickInterval) {
        const x = d / resolution;
        this.transformPathStream.moveTo(x, -halfTickLength - this.outlineWidth);
        this.transformPathStream.lineTo(x, halfTickLength + this.outlineWidth);
      }
    }

    if (this.outlineWidth > 0) {
      context.lineWidth = this.strokeWidth + this.outlineWidth * 2;
      context.strokeStyle = this.outlineStyle;
      context.stroke();
    }

    if (this.strokeWidth > 0) {
      context.lineWidth = this.strokeWidth;
      context.strokeStyle = this.strokeStyle;
      context.stroke();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.canvasLayerRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}