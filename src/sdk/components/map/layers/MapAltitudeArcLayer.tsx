import { CssTransformBuilder } from '../../../graphics/css/CssTransform';
import { AffineTransformPathStream } from '../../../graphics/path/AffineTransformPathStream';
import { SvgPathStream } from '../../../graphics/svg/SvgPathStream';
import { MathUtils } from '../../../math/MathUtils';
import { NumberUnitInterface, UnitFamily, UnitType } from '../../../math/NumberUnit';
import { ReadonlyFloat64Array, Vec2Math } from '../../../math/VecMath';
import { Vec2Subject } from '../../../math/VectorSubject';
import { MappedSubject } from '../../../sub/MappedSubject';
import { ObjectSubject } from '../../../sub/ObjectSubject';
import { Subject } from '../../../sub/Subject';
import { MappedSubscribable, Subscribable } from '../../../sub/Subscribable';
import { Subscription } from '../../../sub/Subscription';
import { FSComponent, VNode } from '../../FSComponent';
import { MapSystemKeys } from '../../mapsystem/MapSystemKeys';
import { MapAltitudeArcModule } from '../../mapsystem/modules/MapAltitudeArcModule';
import { MapLayer, MapLayerProps } from '../MapLayer';
import { MapProjection } from '../MapProjection';
import { MapAutopilotPropsModule } from '../modules/MapAutopilotPropsModule';
import { MapDataIntegrityModule } from '../modules/MapDataIntegrityModule';
import { MapOwnAirplanePropsModule } from '../modules/MapOwnAirplanePropsModule';
import { MapSyncedCanvasLayer } from './MapSyncedCanvasLayer';

/**
 * Modules required for MapAltitudeArcLayer.
 */
export interface MapAltitudeArcLayerModules {
  /** Own airplane properties module. */
  [MapSystemKeys.OwnAirplaneProps]: MapOwnAirplanePropsModule;

  /** Autopilot module. */
  [MapSystemKeys.AutopilotProps]: MapAutopilotPropsModule;

  /** Altitude intercept arc module. */
  [MapSystemKeys.AltitudeArc]: MapAltitudeArcModule;

  /** Data integrity module. */
  [MapSystemKeys.DataIntegrity]?: MapDataIntegrityModule;
}

/**
 * Component props for MapAltitudeArcLayer.
 */
export interface MapAltitudeArcLayerProps extends MapLayerProps<MapAltitudeArcLayerModules> {
  /**
   * The method with which to render the arc: canvas or SVG. The SVG rendering method can use significantly less
   * texture memory than canvas depending on the size of the arc relative to the parent map. However, arcs rendered
   * using SVG may not be properly occluded by `clip-path` or `border-radius` styles set on the parent map.
   */
  renderMethod: 'canvas' | 'svg';

  /** The precision to apply to the airplane's vertical speed when calculating the position of the arc. */
  verticalSpeedPrecision: NumberUnitInterface<UnitFamily.Speed> | Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** The minimum magnitude of the airplane's vertical speed required to display the arc. */
  verticalSpeedThreshold: NumberUnitInterface<UnitFamily.Speed> | Subscribable<NumberUnitInterface<UnitFamily.Speed>>;

  /** The minimum magnitude of the airplane's vertical deviation from the selected altitude required to display the arc. */
  altitudeDeviationThreshold: NumberUnitInterface<UnitFamily.Distance> | Subscribable<NumberUnitInterface<UnitFamily.Distance>>;

  /** The angular width of the arc, in degrees. Defaults to 60 degrees. */
  arcAngularWidth?: number;

  /** The radius of the arc, in pixels. Defaults to 64 pixels. */
  arcRadius?: number;

  /** The width of the arc stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The style of the arc stroke. Defaults to `'cyan'`. */
  strokeStyle?: string;

  /** The line cap of the arc stroke. Defaults to 'butt'. */
  strokeLineCap?: 'butt' | 'round' | 'square';

  /** The width of the arc outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The style of the arc outline. Defaults to `'#505050'`. */
  outlineStyle?: string;

  /** The line cap of the arc outline. Defaults to 'butt'. */
  outlineLineCap?: 'butt' | 'round' | 'square';
}

/**
 * A map layer which displays an altitude intercept arc.
 */
export class MapAltitudeArcLayer extends MapLayer<MapAltitudeArcLayerProps> {
  private static readonly DEFAULT_ARC_ANGULAR_WIDTH = 60; // degrees
  private static readonly DEFAULT_ARC_RADIUS = 64; // px
  private static readonly DEFAULT_STROKE_WIDTH = 2; // px
  private static readonly DEFAULT_STROKE_STYLE = 'cyan';
  private static readonly DEFAULT_STROKE_LINECAP: CanvasLineCap = 'butt';
  private static readonly DEFAULT_OUTLINE_WIDTH = 1; // px
  private static readonly DEFAULT_OUTLINE_STYLE = '#505050';
  private static readonly DEFAULT_OUTLINE_LINECAP: CanvasLineCap = 'butt';

  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2)];

  private readonly layerRef = FSComponent.createRef<MapAltitudeArcCanvasLayer | MapAltitudeArcSvgLayer>();

  private readonly arcAngularWidth = (this.props.arcAngularWidth ?? MapAltitudeArcLayer.DEFAULT_ARC_ANGULAR_WIDTH) * Avionics.Utils.DEG2RAD;
  private readonly arcRadius = this.props.arcRadius ?? MapAltitudeArcLayer.DEFAULT_ARC_RADIUS;
  private readonly strokeWidth = this.props.strokeWidth ?? MapAltitudeArcLayer.DEFAULT_STROKE_WIDTH;
  private readonly strokeStyle = this.props.strokeStyle ?? MapAltitudeArcLayer.DEFAULT_STROKE_STYLE;
  private readonly strokeLineCap = this.props.strokeLineCap ?? MapAltitudeArcLayer.DEFAULT_STROKE_LINECAP;
  private readonly outlineWidth = this.props.outlineWidth ?? MapAltitudeArcLayer.DEFAULT_OUTLINE_WIDTH;
  private readonly outlineStyle = this.props.outlineStyle ?? MapAltitudeArcLayer.DEFAULT_OUTLINE_STYLE;
  private readonly outlineLineCap = this.props.outlineLineCap ?? MapAltitudeArcLayer.DEFAULT_OUTLINE_LINECAP;

  private readonly ownAirplanePropsModule = this.props.model.getModule(MapSystemKeys.OwnAirplaneProps);
  private readonly autopilotModule = this.props.model.getModule(MapSystemKeys.AutopilotProps);

  private vsPrecisionMap?: MappedSubscribable<number>;
  private vsThresholdMap?: MappedSubscribable<number>;
  private altDevThresholdMap?: MappedSubscribable<number>;

  private readonly vsPrecisionFpm = ('isSubscribable' in this.props.verticalSpeedPrecision)
    ? this.vsPrecisionMap = this.props.verticalSpeedPrecision.map(v => v.asUnit(UnitType.FPM))
    : Subject.create(this.props.verticalSpeedPrecision.asUnit(UnitType.FPM));

  private readonly vsThresholdFpm = ('isSubscribable' in this.props.verticalSpeedThreshold)
    ? this.vsThresholdMap = this.props.verticalSpeedThreshold.map(v => v.asUnit(UnitType.FPM))
    : Subject.create(this.props.verticalSpeedThreshold.asUnit(UnitType.FPM));

  private readonly altDevThresholdFeet = ('isSubscribable' in this.props.altitudeDeviationThreshold)
    ? this.altDevThresholdMap = this.props.altitudeDeviationThreshold.map(v => v.asUnit(UnitType.FOOT))
    : Subject.create(this.props.altitudeDeviationThreshold.asUnit(UnitType.FOOT));

  private readonly vsFpm = this.ownAirplanePropsModule.verticalSpeed.map(vs => vs.asUnit(UnitType.FPM));
  private readonly vsFpmQuantized = MappedSubject.create(
    ([vsFpm, precision]): number => {
      return Math.round(vsFpm / precision) * precision;
    },
    this.vsFpm,
    this.vsPrecisionFpm
  );

  private readonly projectedPlanePosition = Vec2Subject.create(Vec2Math.create());
  private readonly projectPlanePositionHandler = (): void => {
    const projected = this.props.mapProjection.project(this.ownAirplanePropsModule.position.get(), MapAltitudeArcLayer.vec2Cache[0]);
    this.projectedPlanePosition.set(projected);
  };

  private isArcVisibleStatic?: MappedSubscribable<boolean>;
  private readonly isArcVisibleDynamic = MappedSubject.create(
    ([vsFpm, alt, selectedAlt, vsThreshold, altDevThresholdFeet]) => {
      if (Math.abs(vsFpm) < vsThreshold) {
        return false;
      }

      const altDevFeet = selectedAlt.asUnit(UnitType.FOOT) - alt.asUnit(UnitType.FOOT);
      return Math.abs(altDevFeet) >= altDevThresholdFeet && altDevFeet * vsFpm > 0;
    },
    this.vsFpmQuantized,
    this.ownAirplanePropsModule.altitude,
    this.autopilotModule.selectedAltitude,
    this.vsThresholdFpm,
    this.altDevThresholdFeet
  ).pause();

  private readonly projectedArcPosition = Vec2Subject.create(Vec2Math.create());
  private readonly projectedArcAngle = Subject.create(0);

  private needUpdate = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    this.layerRef.getOrDefault()?.setVisible(isVisible);

    if (isVisible) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    this.layerRef.instance.onAttached();

    this.subscriptions.push(this.ownAirplanePropsModule.position.sub(this.projectPlanePositionHandler));

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    const altitudeArcModule = this.props.model.getModule(MapSystemKeys.AltitudeArc);
    const dataIntegrityModule = this.props.model.getModule(MapSystemKeys.DataIntegrity);

    this.isArcVisibleStatic = MappedSubject.create(
      ([show, isGpsValid, isAdcValid]) => {
        return show && isGpsValid && isAdcValid;
      },
      altitudeArcModule.show,
      dataIntegrityModule?.gpsSignalValid ?? Subject.create(true),
      dataIntegrityModule?.adcSignalValid ?? Subject.create(true)
    );

    const isArcVisibleDynamicSub = this.isArcVisibleDynamic.sub(isVisible => { this.setVisible(isVisible); }, false, true);

    this.isArcVisibleStatic.sub(isVisible => {
      if (isVisible) {
        this.isArcVisibleDynamic.resume();
        isArcVisibleDynamicSub.resume(true);
      } else {
        this.isArcVisibleDynamic.pause();
        isArcVisibleDynamicSub.pause();
        this.setVisible(false);
      }
    }, true);

    this.subscriptions.push(
      this.projectedPlanePosition.sub(scheduleUpdate),
      this.ownAirplanePropsModule.trackTrue.sub(scheduleUpdate),
      this.ownAirplanePropsModule.groundSpeed.sub(scheduleUpdate),
      this.ownAirplanePropsModule.altitude.sub(scheduleUpdate)
    );
    this.vsFpmQuantized.sub(scheduleUpdate);

    this.subscriptions.push(this.autopilotModule.selectedAltitude.sub(scheduleUpdate, true));

    this.layerRef.instance.setVisible(this.isVisible());
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.layerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.projectPlanePositionHandler();
    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const track = this.ownAirplanePropsModule.trackTrue.get();
    const groundSpeed = this.ownAirplanePropsModule.groundSpeed.get();
    const altitude = this.ownAirplanePropsModule.altitude.get();
    const selectedAltitude = this.autopilotModule.selectedAltitude.get();
    const vsFpm = this.vsFpmQuantized.get();

    const timeToAltitudeMinute = (selectedAltitude.asUnit(UnitType.FOOT) - altitude.asUnit(UnitType.FOOT)) / vsFpm;
    const distanceToAltitudeFeet = groundSpeed.asUnit(UnitType.FPM) * timeToAltitudeMinute;
    const distancePx = UnitType.FOOT.convertTo(distanceToAltitudeFeet, UnitType.GA_RADIAN) / this.props.mapProjection.getProjectedResolution();
    const projectedTrackAngle = track * Avionics.Utils.DEG2RAD + this.props.mapProjection.getRotation() - MathUtils.HALF_PI;

    const projectedPlanePos = this.projectedPlanePosition.get();
    const projectedArcPos = Vec2Math.add(
      Vec2Math.setFromPolar(distancePx, projectedTrackAngle, MapAltitudeArcLayer.vec2Cache[0]),
      projectedPlanePos,
      MapAltitudeArcLayer.vec2Cache[0]
    );

    this.projectedArcPosition.set(projectedArcPos);
    this.projectedArcAngle.set(projectedTrackAngle);

    this.layerRef.instance.onUpdated();

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    const props: MapAltitudeArcSubLayerProps = {
      ref: this.layerRef,
      model: this.props.model,
      mapProjection: this.props.mapProjection,
      arcAngularWidth: this.arcAngularWidth,
      arcRadius: this.arcRadius,
      strokeWidth: this.strokeWidth,
      strokeStyle: this.strokeStyle,
      strokeLineCap: this.strokeLineCap,
      outlineWidth: this.outlineWidth,
      outlineStyle: this.outlineStyle,
      outlineLineCap: this.outlineLineCap,
      projectedArcPosition: this.projectedArcPosition,
      projectedArcAngle: this.projectedArcAngle,
      class: this.props.class,
    };

    return this.props.renderMethod === 'canvas'
      ? (
        <MapAltitudeArcCanvasLayer {...props} />
      ) : (
        <MapAltitudeArcSvgLayer {...props} />
      );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.layerRef.getOrDefault()?.destroy();

    this.vsPrecisionMap?.destroy();
    this.vsThresholdMap?.destroy();
    this.altDevThresholdMap?.destroy();

    this.vsFpm.destroy();

    this.isArcVisibleStatic?.destroy();
    this.isArcVisibleDynamic.destroy();

    this.subscriptions.forEach(sub => sub.destroy());

    super.destroy();
  }
}

/**
 * Component props for map altitude arc sublayers.
 */
interface MapAltitudeArcSubLayerProps extends MapLayerProps<any> {
  /** The projected position of the arc, as `[x, y]` in pixels. */
  projectedArcPosition: Subscribable<ReadonlyFloat64Array>;

  /** The projected facing angle of the arc, in radians. An angle of zero is in the direction of the positive x axis. */
  projectedArcAngle: Subscribable<number>;

  /** The angular width of the arc, in radians. */
  arcAngularWidth: number;

  /** The radius of the arc, in pixels. */
  arcRadius: number;

  /** The width of the arc stroke, in pixels. */
  strokeWidth: number;

  /** The style of the arc stroke. */
  strokeStyle: string;

  /** The line cap of the arc stroke. */
  strokeLineCap: 'butt' | 'round' | 'square';

  /** The width of the arc outline, in pixels. */
  outlineWidth: number;

  /** The style of the arc outline. */
  outlineStyle: string;

  /** The line cap of the arc outline. */
  outlineLineCap: 'butt' | 'round' | 'square';
}

/**
 * A map layer which draws an altitude intercept arc using canvas.
 */
class MapAltitudeArcCanvasLayer extends MapLayer<MapAltitudeArcSubLayerProps> {
  private static readonly vec2Cache = [new Float64Array(2), new Float64Array(2)];

  private readonly arcHalfAngularWidth = this.props.arcAngularWidth / 2;
  private readonly totalArcThickness = this.props.strokeWidth + this.props.outlineWidth * 2;

  private readonly canvasLayerRef = FSComponent.createRef<MapSyncedCanvasLayer>();

  private readonly subscriptions: Subscription[] = [];

  private needUpdate = false;

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

    const scheduleUpdate = (): void => { this.needUpdate = true; };

    this.subscriptions.push(
      this.props.projectedArcPosition.sub(scheduleUpdate, false),
      this.props.projectedArcAngle.sub(scheduleUpdate, false)
    );

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const arcPos = this.props.projectedArcPosition.get();

    const display = this.canvasLayerRef.instance.display;
    display.clear();

    // Do not draw the arc if it is out of bounds.

    const projectedSize = this.props.mapProjection.getProjectedSize();
    const arcX = arcPos[0];
    const arcY = arcPos[1];
    const twiceRadius = this.props.arcRadius * 2;

    if (
      arcX <= -twiceRadius
      || arcX >= projectedSize[0] + twiceRadius
      || arcY <= -twiceRadius
      || arcY >= projectedSize[1] + twiceRadius
    ) {
      return;
    }

    display.context.beginPath();

    const projectedArcAngle = this.props.projectedArcAngle.get();
    const center = Vec2Math.add(
      Vec2Math.setFromPolar(-this.props.arcRadius, projectedArcAngle, MapAltitudeArcCanvasLayer.vec2Cache[0]),
      arcPos,
      MapAltitudeArcCanvasLayer.vec2Cache[0]
    );
    const arcStart = Vec2Math.add(
      Vec2Math.setFromPolar(this.props.arcRadius, projectedArcAngle - this.arcHalfAngularWidth, MapAltitudeArcCanvasLayer.vec2Cache[1]),
      center,
      MapAltitudeArcCanvasLayer.vec2Cache[1]
    );

    display.context.moveTo(arcStart[0], arcStart[1]);
    display.context.arc(
      center[0], center[1],
      this.props.arcRadius,
      projectedArcAngle - this.arcHalfAngularWidth, projectedArcAngle + this.arcHalfAngularWidth
    );

    if (this.props.outlineWidth > 0) {
      display.context.lineWidth = this.totalArcThickness;
      display.context.strokeStyle = this.props.outlineStyle;
      display.context.lineCap = this.props.outlineLineCap;
      display.context.stroke();
    }

    if (this.props.strokeWidth > 0) {
      display.context.lineWidth = this.props.strokeWidth;
      display.context.strokeStyle = this.props.strokeStyle;
      display.context.lineCap = this.props.strokeLineCap;
      display.context.stroke();
    }

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <MapSyncedCanvasLayer ref={this.canvasLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} class={this.props.class} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.canvasLayerRef.getOrDefault()?.destroy();

    this.subscriptions.forEach(sub => sub.destroy());

    super.destroy();
  }
}

/**
 * A map layer which draws an altitude intercept arc using SVG.
 */
class MapAltitudeArcSvgLayer extends MapLayer<MapAltitudeArcSubLayerProps> {
  private readonly arcHalfAngularWidth = this.props.arcAngularWidth / 2;

  private readonly totalArcThickness = this.props.strokeWidth + this.props.outlineWidth * 2;
  private readonly width = this.props.arcRadius * (1 - Math.cos(this.arcHalfAngularWidth)) + this.totalArcThickness + 2;
  private readonly height = 2 * this.props.arcRadius * Math.sin(Math.min(this.arcHalfAngularWidth, MathUtils.HALF_PI)) + this.totalArcThickness + 2;

  private readonly svgStyle = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': `${(this.totalArcThickness / 2 + 1) - this.width}px`,
    'top': `${-this.height / 2}px`,
    'width': `${this.width}px`,
    'height': `${this.height}px`,
    'transform': 'translate3d(0px, 0px, 0px) rotate(0rad)',
    'transform-origin': `${this.width - (this.totalArcThickness / 2 + 1)}px ${this.height / 2}px`
  });

  private readonly svgTransform = CssTransformBuilder.concat(
    CssTransformBuilder.translate3d('px'),
    CssTransformBuilder.rotate('rad')
  );

  private needUpdate = false;

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onVisibilityChanged(isVisible: boolean): void {
    if (isVisible) {
      this.needUpdate = true;
    } else {
      this.svgStyle.set('display', 'none');
    }
  }

  /** @inheritdoc */
  public onAttached(): void {
    const scheduleUpdate = (): void => { this.needUpdate = true; };

    this.subscriptions.push(
      this.props.projectedArcPosition.sub(scheduleUpdate, false),
      this.props.projectedArcAngle.sub(scheduleUpdate, false)
    );
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate || !this.isVisible()) {
      return;
    }

    const arcPos = this.props.projectedArcPosition.get();

    // Hide the arc if it is out of bounds.

    const projectedSize = this.props.mapProjection.getProjectedSize();
    const arcX = arcPos[0];
    const arcY = arcPos[1];
    const twiceRadius = this.props.arcRadius * 2;

    if (
      arcX <= -twiceRadius
      || arcX >= projectedSize[0] + twiceRadius
      || arcY <= -twiceRadius
      || arcY >= projectedSize[1] + twiceRadius
    ) {
      this.svgStyle.set('display', 'none');
    } else {
      this.svgStyle.set('display', '');

      this.svgTransform.getChild(0).set(arcX, arcY, 0, 0.1);
      this.svgTransform.getChild(1).set(this.props.projectedArcAngle.get(), 1e-4);

      this.svgStyle.set('transform', this.svgTransform.resolve());
    }

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public render(): VNode {
    const svgPathStream = new SvgPathStream(0.01);
    const transformPathStream = new AffineTransformPathStream(svgPathStream);

    // Top of the arc is at (0, 0), so the center is at (-radius, 0).
    transformPathStream.beginPath();
    transformPathStream
      .addRotation(-this.arcHalfAngularWidth)
      .addTranslation(-this.props.arcRadius, 0);

    transformPathStream.moveTo(this.props.arcRadius, 0);
    transformPathStream.arc(0, 0, this.props.arcRadius, 0, this.props.arcAngularWidth);

    const path = svgPathStream.getSvgPath();

    return (
      <svg viewBox={`${(this.totalArcThickness / 2 + 1) - this.width} ${-this.height / 2} ${this.width} ${this.height}`} style={this.svgStyle} class={this.props.class}>
        <path d={path} fill="none" stroke={this.props.outlineStyle} stroke-width={this.totalArcThickness} stroke-linecap={this.props.outlineLineCap} />
        <path d={path} fill='none' stroke={this.props.strokeStyle} stroke-width={this.props.strokeWidth} stroke-linecap={this.props.strokeLineCap} />
      </svg>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subscriptions.forEach(sub => sub.destroy());

    super.destroy();
  }
}