import {
  BitFlags, FSComponent, MapIndexedRangeModule, MapLabeledRingLabel, MapLabeledRingLayer, MapLayer, MapLayerProps, MapProjection, MapProjectionChangeType,
  MapSyncedCanvasLayer, NumberUnitInterface, NumberUnitSubject, ReadonlyFloat64Array, Subject, Subscribable, Unit, UnitFamily, UnitType, Vec2Math, VNode
} from 'msfssdk';

import { GarminMapKeys } from '../GarminMapKeys';
import { MapRangeDisplay } from '../MapRangeDisplay';
import { MapGarminTrafficModule } from '../modules/MapGarminTrafficModule';

/**
 * Modules required for TrafficMapRangeLayer.
 */
export interface TrafficMapRangeLayerModules {
  /** Range module. */
  [GarminMapKeys.Range]: MapIndexedRangeModule;

  /** Traffic module. */
  [GarminMapKeys.Traffic]: MapGarminTrafficModule;
}

/**
 * A function which renders labels for traffic map range rings.
 */
export type TrafficMapRangeLabelRenderer = (range: Subscribable<NumberUnitInterface<UnitFamily.Distance>>, displayUnit: Subscribable<Unit<UnitFamily.Distance>>) => VNode;

/**
 * Component props for TrafficMapRangeLayer.
 */
export interface TrafficMapRangeLayerProps extends MapLayerProps<TrafficMapRangeLayerModules> {
  /** The stroke width of the outer range ring, in pixels. Defaults to 2 pixels. */
  outerStrokeWidth?: number;

  /** The stroke style of the outer range ring. Defaults to `'white'`. */
  outerStrokeStyle?: string | CanvasGradient | CanvasPattern;

  /** The stroke dash of the outer range ring. Defaults to `[4, 4]`. */
  outerStrokeDash?: readonly number[];

  /** The stroke width of the inner range ring, in pixels. Defaults to 2 pixels. */
  innerStrokeWidth?: number;

  /** The stroke style of the inner range ring. Defaults to `'white'`. */
  innerStrokeStyle?: string | CanvasGradient | CanvasPattern;

  /** The stroke dash of the inner range ring. Defaults to `[4, 4]`. */
  innerStrokeDash?: readonly number[];

  /** The color of the ring ticks. Defaults to `'white'`. */
  tickColor?: string;

  /** The size of the major outer ring ticks, in pixels. Defaults to 10 pixels. */
  outerMajorTickSize?: number;

  /** The size of the minor outer ring ticks, in pixels. Defaults to 5 pixels. */
  outerMinorTickSize?: number;

  /** The size of the major inner ring ticks, in pixels. Defaults to 10 pixels. */
  innerMajorTickSize?: number;

  /** The size of the minor inner ring ticks, in pixels. Defaults to 5 pixels. */
  innerMinorTickSize?: number;

  /**
   * The radial on which the outer range label is positioned, in degrees. A value of 0 degrees is in the direction of
   * the positive x axis. If `null`, the outer range label will not be displayed. Defaults to `null`.
   */
  outerLabelRadial?: number | null;

  /**
   * The radial on which the inner range label is positioned, in degrees. A value of 0 degrees is in the direction of
   * the positive x axis. If `null`, the inner range label will not be displayed. Defaults to `null`.
   */
  innerLabelRadial?: number | null;

  /**
   * A function which renders labels for the rings. If not defined, a default label of type {@link MapRangeDisplay}
   * will be rendered.
   */
  renderLabel?: TrafficMapRangeLabelRenderer;
}

/**
 * A map layer which displays inner and outer range rings for traffic maps.
 */
export class TrafficMapRangeLayer extends MapLayer<TrafficMapRangeLayerProps> {
  private static readonly DEFAULT_STROKE_WIDTH = 2;
  private static readonly DEFAULT_STROKE_STYLE = 'white';
  private static readonly DEFAULT_STROKE_DASH = [4, 4];
  private static readonly DEFAULT_TICK_COLOR = 'white';
  private static readonly DEFAULT_MAJOR_TICK_SIZE = 10;
  private static readonly DEFAULT_MINOR_TICK_SIZE = 5;

  private static readonly vec2Cache = [new Float64Array(2)];

  private readonly tickLayerRef = FSComponent.createRef<MapSyncedCanvasLayer<TrafficMapRangeLayerProps>>();
  private readonly innerRangeLayerRef = FSComponent.createRef<MapLabeledRingLayer<TrafficMapRangeLayerProps>>();
  private readonly outerRangeLayerRef = FSComponent.createRef<MapLabeledRingLayer<TrafficMapRangeLayerProps>>();

  private readonly outerStrokeWidth = this.props.outerStrokeWidth ?? TrafficMapRangeLayer.DEFAULT_STROKE_WIDTH;
  private readonly outerStrokeStyle = this.props.outerStrokeStyle ?? TrafficMapRangeLayer.DEFAULT_STROKE_STYLE;
  private readonly outerStrokeDash = this.props.outerStrokeDash ?? TrafficMapRangeLayer.DEFAULT_STROKE_DASH;
  private readonly innerStrokeWidth = this.props.innerStrokeWidth ?? TrafficMapRangeLayer.DEFAULT_STROKE_WIDTH;
  private readonly innerStrokeStyle = this.props.innerStrokeStyle ?? TrafficMapRangeLayer.DEFAULT_STROKE_STYLE;
  private readonly innerStrokeDash = this.props.innerStrokeDash ?? TrafficMapRangeLayer.DEFAULT_STROKE_DASH;

  private readonly tickColor = this.props.tickColor ?? TrafficMapRangeLayer.DEFAULT_TICK_COLOR;
  private readonly outerMajorTickSize = this.props.outerMajorTickSize ?? TrafficMapRangeLayer.DEFAULT_MAJOR_TICK_SIZE;
  private readonly outerMinorTickSize = this.props.outerMinorTickSize ?? TrafficMapRangeLayer.DEFAULT_MINOR_TICK_SIZE;
  private readonly innerMajorTickSize = this.props.innerMajorTickSize ?? TrafficMapRangeLayer.DEFAULT_MAJOR_TICK_SIZE;
  private readonly innerMinorTickSize = this.props.innerMinorTickSize ?? TrafficMapRangeLayer.DEFAULT_MINOR_TICK_SIZE;

  private readonly rangeModule = this.props.model.getModule(GarminMapKeys.Range);
  private readonly trafficModule = this.props.model.getModule(GarminMapKeys.Traffic);

  private readonly innerRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(0));
  private readonly outerRange = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(0));

  private innerLabel: MapLabeledRingLabel<MapRangeDisplay> | null = null;
  private outerLabel: MapLabeledRingLabel<MapRangeDisplay> | null = null;
  private needUpdateRings = false;

  /** @inheritdoc */
  public onAttached(): void {
    this.tickLayerRef.instance.onAttached();
    this.innerRangeLayerRef.instance.onAttached();
    this.outerRangeLayerRef.instance.onAttached();

    this.initLabels();
    this.initStyles();
    this.initModuleListeners();

    this.innerRange.sub(() => { this.needUpdateRings = true; });
    this.outerRange.sub(() => { this.needUpdateRings = true; });

    this.needUpdateRings = true;
  }

  /**
   * Initializes the range display labels.
   */
  private initLabels(): void {
    const displayUnit = Subject.create(UnitType.NMILE);

    if (this.props.innerLabelRadial !== null && this.props.innerLabelRadial !== undefined) {
      this.innerLabel = this.innerRangeLayerRef.instance.createLabel<any>(
        this.props.renderLabel !== undefined
          ? this.props.renderLabel(this.innerRange, displayUnit)
          : (<MapRangeDisplay range={this.innerRange} displayUnit={displayUnit} />)
      ) as MapLabeledRingLabel<any>;

      this.innerLabel.setAnchor(new Float64Array([0.5, 0.5]));
      this.innerLabel.setRadialAngle(this.props.innerLabelRadial * Avionics.Utils.DEG2RAD);
    }

    if (this.props.outerLabelRadial !== null && this.props.outerLabelRadial !== undefined) {
      this.outerLabel = this.outerRangeLayerRef.instance.createLabel<any>(
        this.props.renderLabel !== undefined
          ? this.props.renderLabel(this.outerRange, displayUnit)
          : (<MapRangeDisplay range={this.outerRange} displayUnit={displayUnit} />)
      ) as MapLabeledRingLabel<any>;

      this.outerLabel.setAnchor(new Float64Array([0.5, 0.5]));
      this.outerLabel.setRadialAngle(this.props.outerLabelRadial * Avionics.Utils.DEG2RAD);
    }
  }

  /**
   * Initializes ring styles.
   */
  private initStyles(): void {
    this.tickLayerRef.instance.display.context.fillStyle = this.tickColor;

    this.innerRangeLayerRef.instance.setRingStrokeStyles(this.innerStrokeWidth, this.innerStrokeStyle, this.innerStrokeDash);
    this.outerRangeLayerRef.instance.setRingStrokeStyles(this.outerStrokeWidth, this.outerStrokeStyle, this.outerStrokeDash);
  }

  /**
   * Initializes modules listeners.
   */
  private initModuleListeners(): void {
    const innerRangeCallback = this.updateInnerRange.bind(this);
    const outerRangeCallback = this.updateOuterRange.bind(this);

    this.rangeModule.nominalRanges.sub(innerRangeCallback);
    this.rangeModule.nominalRanges.sub(outerRangeCallback);

    this.trafficModule.innerRangeIndex.sub(innerRangeCallback, true);
    this.trafficModule.outerRangeIndex.sub(outerRangeCallback, true);
  }

  /** @inheritdoc */
  public onMapProjectionChanged(mapProjection: MapProjection, changeFlags: number): void {
    this.tickLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.innerRangeLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);
    this.outerRangeLayerRef.instance.onMapProjectionChanged(mapProjection, changeFlags);

    if (BitFlags.isAll(changeFlags, MapProjectionChangeType.ProjectedSize)) {
      // Need to reset the canvas context fill style because a resize will wipe its state.
      this.tickLayerRef.instance.display.context.fillStyle = this.tickColor;
    }

    this.needUpdateRings = BitFlags.isAny(changeFlags, MapProjectionChangeType.TargetProjected | MapProjectionChangeType.ProjectedResolution);
  }

  /** @inheritdoc */
  public onUpdated(time: number, elapsed: number): void {
    this.tickLayerRef.instance.onUpdated(time, elapsed);

    if (this.needUpdateRings) {
      this.updateRings();
      this.needUpdateRings = false;
    }

    this.innerRangeLayerRef.instance.onUpdated(time, elapsed);
    this.outerRangeLayerRef.instance.onUpdated(time, elapsed);
  }

  /**
   * Updates the rings.
   */
  private updateRings(): void {
    const center = this.props.mapProjection.getTargetProjected();
    const innerRadius = (this.innerRange.get().asUnit(UnitType.GA_RADIAN) as number) / this.props.mapProjection.getProjectedResolution();
    const outerRadius = (this.outerRange.get().asUnit(UnitType.GA_RADIAN) as number) / this.props.mapProjection.getProjectedResolution();

    if (innerRadius > 0) {
      this.innerRangeLayerRef.instance.setVisible(true);
      this.innerRangeLayerRef.instance.setRingPosition(center, innerRadius);
    } else {
      this.innerRangeLayerRef.instance.setVisible(false);
    }

    if (outerRadius > 0) {
      this.outerRangeLayerRef.instance.setVisible(true);
      this.outerRangeLayerRef.instance.setRingPosition(center, outerRadius);
    } else {
      this.outerRangeLayerRef.instance.setVisible(false);
    }

    this.updateTicks(center, innerRadius, outerRadius);
  }

  /**
   * Updates the ring tick marks.
   * @param center The projected center of the rings.
   * @param innerRadius The radius of the inner ring, in pixels.
   * @param outerRadius The radius of the outer ring, in pixels.
   */
  private updateTicks(center: ReadonlyFloat64Array, innerRadius: number, outerRadius: number): void {
    const display = this.tickLayerRef.instance.display;

    display.clear();

    if (innerRadius > 0) {
      this.drawTicks(display.context, center, innerRadius, this.innerMajorTickSize, this.innerMinorTickSize);
    }

    if (outerRadius > 0) {
      this.drawTicks(display.context, center, outerRadius, this.outerMajorTickSize, this.outerMinorTickSize);
    }
  }

  /**
   * Draws ring ticks to a canvas. One major tick is drawn at each of the four cardinal positions, and one minor tick
   * is drawn at each of the eight remaining hour positions.
   * @param context A canvas 2D rendering context.
   * @param center The projected center of the outer ring.
   * @param radius The radius of the ring, in pixels.
   * @param majorTickSize The size of each major tick, in pixels.
   * @param minorTickSize The size of each minor tick, in pixels.
   */
  private drawTicks(
    context: CanvasRenderingContext2D,
    center: ReadonlyFloat64Array,
    radius: number,
    majorTickSize: number,
    minorTickSize: number
  ): void {
    const step = Math.PI / 6;
    for (let i = 0; i < 12; i++) {
      const pos = Vec2Math.setFromPolar(radius, i * step, TrafficMapRangeLayer.vec2Cache[0]);
      this.drawTick(context, center[0] + pos[0], center[1] + pos[1], i % 3 === 0 ? majorTickSize : minorTickSize);
    }
  }

  /**
   * Draws a tick to a canvas.
   * @param context A canvas 2D rendering context.
   * @param x The x-coordinate of the center of the tick.
   * @param y The y-coordinate of the center of the tick.
   * @param size The size of the tick, in pixels.
   */
  private drawTick(context: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    context.fillRect(x - size / 2, y - size / 2, size, size);
  }

  /**
   * Updates the inner ring range.
   */
  private updateInnerRange(): void {
    const range = this.rangeModule.nominalRanges.get()[this.trafficModule.innerRangeIndex.get()];
    this.innerRange.set(range ?? 0);
  }

  /**
   * Updates the outer ring range.
   */
  private updateOuterRange(): void {
    const range = this.rangeModule.nominalRanges.get()[this.trafficModule.outerRangeIndex.get()];
    this.outerRange.set(range ?? 0);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <MapSyncedCanvasLayer ref={this.tickLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
        <MapLabeledRingLayer ref={this.innerRangeLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
        <MapLabeledRingLayer ref={this.outerRangeLayerRef} model={this.props.model} mapProjection={this.props.mapProjection} />
      </div>
    );
  }
}