import {
  ArraySubject, BingComponent, BitFlags, ClippedPathStream, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType,
  HorizonSyncedCanvasLayer, MagVar, NullPathStream, ObjectSubject, ReadonlyFloat64Array, Subject, Subscribable, Subscription, SynVisComponent, Vec2Math,
  Vec2Subject, VecNMath, VecNSubject, VNode
} from 'msfssdk';

/**
 * Styling options for the synthetic vision horizon line.
 */
export type HorizonLineOptions = Omit<HorizonLineProps, keyof HorizonLayerProps | 'useMagneticHeading' | 'showHeadingLabels'>;

/**
 * Component props for SyntheticVision.
 */
export interface SyntheticVisionProps extends HorizonLayerProps {
  /** The string ID to assign to the layer's bound Bing instance. */
  bingId: string;

  /** Whether synthetic vision is enabled. */
  isEnabled: Subscribable<boolean>;

  /** Whether to show horizon heading labels. */
  showHeadingLabels: Subscribable<boolean>;

  /** Styling options for the horizon line. */
  horizonLineOptions: HorizonLineOptions;
}

/**
 * A synthetic vision technology (SVT) display.
 */
export class SyntheticVision extends HorizonLayer<SyntheticVisionProps> {
  private static readonly SKY_COLOR = '#0033E6';

  private readonly horizonLineRef = FSComponent.createRef<HorizonLine>();

  private readonly rootStyle = ObjectSubject.create({
    position: 'absolute',
    display: '',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%'
  });

  private readonly bingStyle = ObjectSubject.create({
    position: 'absolute',
    display: '',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%'
  });

  private readonly resolution = Vec2Subject.createFromVector(Vec2Math.create(100, 100));

  private needUpdate = false;

  private isEnabledSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.horizonLineRef.instance.onAttached();

    this.isEnabledSub = this.props.isEnabled.sub(isEnabled => { this.setVisible(isEnabled); }, true);

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.horizonLineRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ProjectedSize | HorizonProjectionChangeType.ProjectedOffset
    )) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    this.horizonLineRef.instance.onUpdated();

    if (!this.needUpdate) {
      return;
    }

    const projectedSize = this.props.projection.getProjectedSize();
    const projectedOffset = this.props.projection.getProjectedOffset();
    const offsetCenterProjected = this.props.projection.getOffsetCenterProjected();

    // We need to move the Bing texture such that its center lies at the center of the projection, including offset.
    // If there is an offset, we need to overdraw the Bing texture in order to fill the entire projection window.

    const xOverdraw = Math.abs(projectedOffset[0]);
    const yOverdraw = Math.abs(projectedOffset[1]);

    const bingWidth = projectedSize[0] + xOverdraw * 2;
    const bingHeight = projectedSize[1] + yOverdraw * 2;

    this.resolution.set(bingWidth, bingHeight);

    this.bingStyle.set('left', `${offsetCenterProjected[0] - bingWidth / 2}px`);
    this.bingStyle.set('top', `${offsetCenterProjected[1] - bingHeight / 2}px`);
    this.bingStyle.set('width', `${bingWidth}px`);
    this.bingStyle.set('height', `${bingHeight}px`);

    this.needUpdate = false;
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle}>
        <div style={this.bingStyle}>
          <SynVisComponent
            bingId={this.props.bingId}
            resolution={this.resolution}
            skyColor={Subject.create(BingComponent.hexaToRGBColor(SyntheticVision.SKY_COLOR))}
            earthColors={ArraySubject.create(SyntheticVision.createEarthColors())}
          />
        </div>
        <HorizonLine
          ref={this.horizonLineRef}
          projection={this.props.projection}
          showHeadingLabels={this.props.showHeadingLabels}
          useMagneticHeading={Subject.create(true)}
          {...this.props.horizonLineOptions}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isEnabledSub?.destroy();

    this.horizonLineRef.getOrDefault()?.destroy();
  }

  /**
   * Creates a full Bing component earth color array.
   * @returns A full Bing component earth color array.
   */
  private static createEarthColors(): number[] {
    return BingComponent.createEarthColorsArray('#000049', [
      {
        elev: 0,
        color: '#0c2e04'
      },
      {
        elev: 500,
        color: '#113300'
      },
      {
        elev: 2000,
        color: '#463507'
      },
      {
        elev: 3000,
        color: '#5c421f'
      },
      {
        elev: 6000,
        color: '#50331b'
      },
      {
        elev: 8000,
        color: '#512d15'
      },
      {
        elev: 10500,
        color: '#673118'
      },
      {
        elev: 27000,
        color: '#4d4d4d'
      },
      {
        elev: 29000,
        color: '#666666'
      }
    ]);
  }
}

/**
 * Component props for HorizonLine.
 */
interface HorizonLineProps extends HorizonLayerProps {
  /** Whether to show magnetic heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** Whether to show heading labels. */
  showHeadingLabels: Subscribable<boolean>;

  /** The virtual radius of the ring representing the horizon line, in meters. */
  ringRadius: number;

  /** The width of the horizon line stroke, in pixels. Defaults to 2 pixels. */
  strokeWidth?: number;

  /** The color of the horizon line stroke. Defaults to `'white'`. */
  strokeColor?: string;

  /** The width of the horizon line outline, in pixels. Defaults to 1 pixel. */
  outlineWidth?: number;

  /** The color of the horizon line outline. Defaults to `'black'`. */
  outlineColor?: string;

  /** The virtual length of each heading tick, in meters. */
  headingTickVirtualLength: number;

  /** The width of each heading tick, in pixels. Defaults to 1 pixel. */
  headingTickWidth?: number;

  /** The color of each heading tick. Defaults to `'white'`. */
  headingTickColor?: string;

  /** The name of the heading label font. */
  font: string;

  /** The virtual size of the heading label font, in meters. */
  fontVirtualSize: number;

  /** The minimum font size, in pixels. */
  minFontSize: number;

  /** The color of the heading label font. Defaults to `'white'`. */
  fontColor?: string;

  /** The width of the heading label font outline, in pixels. Defaults to 1 pixel. */
  fontOutlineWidth?: number;

  /** The color of the heading label font outline. Defaults to `'black'`. */
  fontOutlineColor?: string;

  /** The virtual offset of the heading label from its tick, in meters. Positive offsets shift the label away from the tick. */
  labelVirtualOffset: number;
}

/**
 * A synthetic vision horizon line. Displays a horizon line with heading tick marks every 10 degrees and optional
 * heading labels every 30 degrees.
 */
class HorizonLine extends HorizonLayer<HorizonLineProps> {
  private static readonly TICK_INCREMENT = 10; // degrees per tick
  private static readonly TICK_COUNT = 360 / HorizonLine.TICK_INCREMENT;
  private static readonly LABEL_FACTOR = 3; // number of ticks per label

  private static readonly BOUNDS_BUFFER = 20; // pixels

  private static readonly DEFAULT_LINE_STROKE_WIDTH = 2; // pixels
  private static readonly DEFAULT_LINE_STROKE_COLOR = 'white';
  private static readonly DEFAULT_LINE_OUTLINE_WIDTH = 1; // pixels
  private static readonly DEFAULT_LINE_OUTLINE_COLOR = 'black';

  private static readonly DEFAULT_TICK_STROKE_WIDTH = 1; // pixels
  private static readonly DEFAULT_TICK_STROKE_COLOR = 'white';

  private static readonly DEFAULT_FONT_COLOR = 'white';
  private static readonly DEFAULT_FONT_OUTLINE_WIDTH = 1;
  private static readonly DEFAULT_FONT_OUTLINE_COLOR = 'black';

  private static readonly vec2Cache = [Vec2Math.create(), Vec2Math.create()];

  private readonly canvasLayerRef = FSComponent.createRef<HorizonSyncedCanvasLayer>();

  private readonly lineStrokeWidth = this.props.strokeWidth ?? HorizonLine.DEFAULT_LINE_STROKE_WIDTH;
  private readonly lineStrokeColor = this.props.strokeColor ?? HorizonLine.DEFAULT_LINE_STROKE_COLOR;
  private readonly lineOutlineWidth = this.props.outlineWidth ?? HorizonLine.DEFAULT_LINE_OUTLINE_WIDTH;
  private readonly lineOutlineColor = this.props.outlineColor ?? HorizonLine.DEFAULT_LINE_OUTLINE_COLOR;

  private readonly tickStrokeWidth = this.props.headingTickWidth ?? HorizonLine.DEFAULT_TICK_STROKE_WIDTH;
  private readonly tickStrokeColor = this.props.headingTickColor ?? HorizonLine.DEFAULT_TICK_STROKE_COLOR;

  private readonly fontColor = this.props.fontColor ?? HorizonLine.DEFAULT_FONT_COLOR;
  private readonly fontOutlineWidth = this.props.fontOutlineWidth ?? HorizonLine.DEFAULT_FONT_OUTLINE_WIDTH;
  private readonly fontOutlineColor = this.props.fontOutlineColor ?? HorizonLine.DEFAULT_FONT_OUTLINE_COLOR;

  private readonly bounds = VecNSubject.createFromVector(
    VecNMath.create(4, -HorizonLine.BOUNDS_BUFFER, -HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER, HorizonLine.BOUNDS_BUFFER)
  );

  private readonly pathStream = new ClippedPathStream(NullPathStream.INSTANCE, this.bounds);

  private readonly nodes = Array.from({ length: HorizonLine.TICK_COUNT }, (v, index) => {
    return {
      heading: index * HorizonLine.TICK_INCREMENT,
      projected: Vec2Math.create()
    };
  });

  private needUpdate = false;

  private showLabelsSub?: Subscription;
  private useMagneticSub?: Subscription;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.updateBounds();

    this.canvasLayerRef.instance.onAttached();
    this.pathStream.setConsumer(this.canvasLayerRef.instance.display.context);

    this.canvasLayerRef.instance.display.context.textAlign = 'center';
    this.canvasLayerRef.instance.display.context.fillStyle = this.fontColor;

    this.showLabelsSub = this.props.showHeadingLabels.sub(() => { this.needUpdate = true; });
    this.useMagneticSub = this.props.useMagneticHeading.sub(() => { this.needUpdate = true; });

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.ProjectedSize)) {
      this.updateBounds();

      // Changing the size of the canvas will reset its state, so we need to re-apply this style.
      this.canvasLayerRef.instance.display.context.textAlign = 'center';
      this.canvasLayerRef.instance.display.context.fillStyle = this.fontColor;
    }

    this.needUpdate = true;
  }

  /**
   * Updates this layer's drawing bounds.
   */
  private updateBounds(): void {
    const projectedSize = this.props.projection.getProjectedSize();
    this.bounds.set(
      -HorizonLine.BOUNDS_BUFFER,
      -HorizonLine.BOUNDS_BUFFER,
      projectedSize[0] + HorizonLine.BOUNDS_BUFFER,
      projectedSize[1] + HorizonLine.BOUNDS_BUFFER
    );
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.needUpdate) {
      return;
    }

    const display = this.canvasLayerRef.instance.display;
    display.clear();

    const projection = this.props.projection;

    const position = projection.getPosition();
    const useMagnetic = this.props.useMagneticHeading.get();

    // Find the most central heading tick
    const headingOffset = useMagnetic ? MagVar.get(position.lat, position.lon) : 0;

    this.recomputeNodes(projection, headingOffset);
    this.drawLine(display.context);
    this.drawTicks(display.context, projection, headingOffset);

    this.needUpdate = false;
  }

  /**
   * Recomputes the projected positions of horizon line nodes.
   * @param projection The horizon projection.
   * @param headingOffset The offset, in degrees, of the heading ticks with respect to true heading.
   */
  private recomputeNodes(projection: HorizonProjection, headingOffset: number): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      projection.projectRelativeEuclidean(node.heading + headingOffset, this.props.ringRadius, 0, node.projected);
    }
  }

  /**
   * Draws the horizon line on a canvas.
   * @param context The canvas rendering context to which to draw the line.
   */
  private drawLine(context: CanvasRenderingContext2D): void {
    this.pathStream.beginPath();

    const first = this.nodes[0].projected;
    this.pathStream.moveTo(first[0], first[1]);

    for (let i = 1; i < this.nodes.length; i++) {
      const projected = this.nodes[i].projected;
      this.pathStream.lineTo(projected[0], projected[1]);
    }

    this.pathStream.lineTo(first[0], first[1]);

    this.strokePath(context, this.lineStrokeWidth, this.lineStrokeColor, this.lineOutlineWidth, this.lineOutlineColor);
  }

  /**
   * Draws this horizon line's heading ticks on a canvas.
   * @param context The canvas rendering context to which to draw the ticks.
   * @param projection The horizon projection.
   * @param headingOffset The offset, in degrees, of the heading ticks with respect to true heading.
   */
  private drawTicks(context: CanvasRenderingContext2D, projection: HorizonProjection, headingOffset: number): void {
    const showLabels = this.props.showHeadingLabels.get();

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      this.drawTick(
        context,
        projection,
        node.projected,
        node.heading,
        headingOffset,
        i % HorizonLine.LABEL_FACTOR === 0 && showLabels ? this.props.fontVirtualSize : undefined,
        this.props.labelVirtualOffset
      );
    }
  }

  /**
   * Draws a heading tick on a canvas.
   * @param context The canvas rendering context to which to draw the tick.
   * @param projection The horizon projection.
   * @param originProjected The projected position of the origin of the tick.
   * @param heading The heading of the tick.
   * @param headingOffset The offset, in degrees, of the heading ticks with respect to true heading.
   * @param fontVirtualSize The virtual font size of the tick's heading label, or `undefined` if there is no label.
   * @param labelVirtualOffset The virtual offset of the tick's heading label, or `undefined` if there is no label.
   */
  private drawTick(
    context: CanvasRenderingContext2D,
    projection: HorizonProjection,
    originProjected: ReadonlyFloat64Array,
    heading: number,
    headingOffset: number,
    fontVirtualSize?: number,
    labelVirtualOffset?: number
  ): void {
    if (!projection.isInProjectedBounds(originProjected, this.bounds.get())) {
      return;
    }

    const endProjected = projection.projectRelativeEuclidean(
      heading + headingOffset,
      this.props.ringRadius,
      this.props.headingTickVirtualLength,
      HorizonLine.vec2Cache[0]
    );

    context.beginPath();
    context.moveTo(originProjected[0], originProjected[1]);
    context.lineTo(endProjected[0], endProjected[1]);

    this.strokePath(context, this.tickStrokeWidth, this.tickStrokeColor);

    if (fontVirtualSize !== undefined && labelVirtualOffset !== undefined) {
      const text = (heading === 0 ? 360 : heading).toFixed(0);

      const labelOriginProjected = projection.projectRelativeEuclidean(
        heading + headingOffset,
        this.props.ringRadius,
        this.props.headingTickVirtualLength + labelVirtualOffset,
        HorizonLine.vec2Cache[0]
      );
      const labelTopProjected = projection.projectRelativeEuclidean(
        heading + headingOffset,
        this.props.ringRadius,
        this.props.headingTickVirtualLength + labelVirtualOffset + fontVirtualSize,
        HorizonLine.vec2Cache[1]
      );

      const delta = Vec2Math.sub(labelTopProjected, labelOriginProjected, HorizonLine.vec2Cache[1]);

      context.translate(labelOriginProjected[0], labelOriginProjected[1]);
      context.rotate(-projection.getRoll() * Avionics.Utils.DEG2RAD);
      context.translate(-labelOriginProjected[0], -labelOriginProjected[1]);

      context.font = `${Math.max(Vec2Math.abs(delta), this.props.minFontSize)}px ${this.props.font}`;
      context.lineWidth = this.fontOutlineWidth * 2;
      context.strokeStyle = this.fontOutlineColor;
      context.strokeText(text, labelOriginProjected[0], labelOriginProjected[1]);
      context.fillText(text, labelOriginProjected[0], labelOriginProjected[1]);

      context.resetTransform();
    }
  }

  /**
   * Strokes a path on a canvas.
   * @param context The canvas rendering context with which to stroke the path.
   * @param strokeWidth The width of the stroke.
   * @param strokeStyle The style of the stroke.
   * @param outlineWidth The outline width of the stroke. Defaults to `0`.
   * @param outlineStyle The outline style of the stroke. Required to draw an outline.
   */
  private strokePath(
    context: CanvasRenderingContext2D,
    strokeWidth: number,
    strokeStyle: string,
    outlineWidth = 0,
    outlineStyle?: string
  ): void {
    if (outlineWidth > 0 && outlineStyle !== undefined) {
      context.lineWidth = strokeWidth + 2 * outlineWidth;
      context.strokeStyle = outlineStyle;
      context.stroke();
    }

    context.lineWidth = strokeWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <HorizonSyncedCanvasLayer ref={this.canvasLayerRef} projection={this.props.projection} />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showLabelsSub?.destroy();
    this.useMagneticSub?.destroy();

    this.canvasLayerRef.getOrDefault()?.destroy();
  }
}