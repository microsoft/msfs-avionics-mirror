import {
  BitFlags, EventBus, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType,
  HorizonSyncedCanvasLayer,
  MathUtils, ObjectSubject, Subject, Subscribable, Subscription, Transform2D, Vec2Math, Vec2Subject, VNode
} from '@microsoft/msfs-sdk';
import { HorizonLine, HorizonLineProps } from './HorizonLine';

/**
 * Styling options for the synthetic vision horizon line.
 */
export type HorizonLineOptions = Omit<
  HorizonLineProps, keyof HorizonLayerProps | 'approximate' | 'useMagneticHeading' | 'showHeadingTicks' | 'showHeadingLabels'
>;

/**
 * Color options for the artificial horizon.
 */
export interface ArtificialHorizonColorOptions {
  /** The color of the ground. */
  groundColor: string;

  /**
   * The colors of the sky, represented by pixel distance from the horizon
   * and a color string.
   */
  skyColors: ArtificialHorizonSkyColor[];
}

/**
 * A color gradient stop in the artificial horizon sky.
 */
export type ArtificialHorizonSkyColor = [distance: number, color: string];

/**
 * Component props for ArtificialHorizon.
 */
export interface ArtificalHorizonProps extends HorizonLayerProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** Whether to show the artificial horizon. */
  show: Subscribable<boolean>;

  /** Whether to show horizon heading labels. */
  showHeadingLabels: boolean | Subscribable<boolean>;

  /** Whether to show magnetic heading ticks and labels instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** Styling options for the horizon line. */
  horizonLineOptions: HorizonLineOptions;

  /** The color options for the artificial horizon. */
  options: ArtificialHorizonColorOptions;
}

/**
 * A PFD artificial horizon. Displays a horizon line, and sky and ground boxes.
 */
export class ArtificialHorizon extends HorizonLayer<ArtificalHorizonProps> {
  private static readonly BACKGROUND_UPDATE_FLAGS
    = HorizonProjectionChangeType.ScaleFactor
    | HorizonProjectionChangeType.Fov
    | HorizonProjectionChangeType.Pitch
    | HorizonProjectionChangeType.Roll;

  private readonly horizonLineRef = FSComponent.createRef<HorizonLine>();
  private readonly canvasLayerRef = FSComponent.createRef<HorizonSyncedCanvasLayer>();

  private readonly rootStyle = ObjectSubject.create({
    display: '',
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%'
  });

  private readonly vec2Cache = [Vec2Math.create(), Vec2Math.create(), Vec2Math.create(), Vec2Math.create()];
  private readonly bgTranslation = Vec2Subject.create(Vec2Math.create());
  private readonly bgRotation = Subject.create(0);
  private readonly windowTransform = new Transform2D();
  private maxSkyColorStopPx = 0;

  private needUpdateBackgroundTransforms = false;
  private needRedrawBackground = false;
  private forceRedrawBackground = false;

  private showSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.canvasLayerRef.instance.onAttached();
    this.horizonLineRef.instance.onAttached();

    this.maxSkyColorStopPx = Math.max(...this.props.options.skyColors.map(c => c[0]));

    this.bgTranslation.sub(() => { this.needRedrawBackground = true; });
    this.bgRotation.sub(() => { this.needRedrawBackground = true; });

    this.showSub = this.props.show.sub(show => { this.setVisible(show); }, true);
    this.needUpdateBackgroundTransforms = true;
    this.forceRedrawBackground = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    this.canvasLayerRef.instance.onProjectionChanged(projection, changeFlags);
    this.horizonLineRef.instance.onProjectionChanged(projection, changeFlags);

    if (BitFlags.isAny(changeFlags, ArtificialHorizon.BACKGROUND_UPDATE_FLAGS)) {
      this.needUpdateBackgroundTransforms = true;
    }

    // If the projected size was changed, the background canvas will have been reset, so we need to draw the background
    // again
    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.ProjectedSize)) {
      this.needUpdateBackgroundTransforms = true;
      this.forceRedrawBackground = true;
    }
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    this.horizonLineRef.instance.onUpdated();

    if (!this.needUpdateBackgroundTransforms && !this.forceRedrawBackground) {
      return;
    }

    // Approximate translation due to pitch using a constant pitch resolution (pixels per degree of pitch) derived
    // from the projection's current field of view. The error of this approximation increases with the absolute
    // deviation of the pitch angle from 0 degrees. We do this instead of simply projecting the true horizon line
    // because we need to keep the line in sync with the attitude pitch ladder, which uses the same approximation.

    const pitchResolution = this.props.projection.getScaleFactor() / this.props.projection.getFov();
    const pitch = this.props.projection.getPitch();
    const roll = this.props.projection.getRoll();

    this.bgTranslation.set(0, MathUtils.round(pitchResolution * pitch, 0.1));
    this.bgRotation.set(MathUtils.round(-roll, 0.1));

    if (this.forceRedrawBackground || this.needRedrawBackground) {
      this.drawHorizonRects();
      this.needRedrawBackground = false;
      this.forceRedrawBackground = false;
    }
  }

  /**
   * Draws the horizon rects to the canvas.
   */
  private drawHorizonRects(): void {
    const context = this.canvasLayerRef.instance.display.context;

    const projectedCenter = this.props.projection.getOffsetCenterProjected();
    const projectedSize = this.props.projection.getProjectedSize();

    context.clearRect(0, 0, projectedSize[0], projectedSize[1]);

    const bgTranslation = this.bgTranslation.get();
    this.windowTransform.toIdentity();
    const transform = this.windowTransform
      .addTranslation(-projectedCenter[0], -projectedCenter[1])
      .addRotation(-this.bgRotation.get() * Avionics.Utils.DEG2RAD)
      .addTranslation(-bgTranslation[0], -bgTranslation[1]);

    const windowUl = transform.apply(Vec2Math.set(0, 0, this.vec2Cache[0]), this.vec2Cache[0]);
    const windowUr = transform.apply(Vec2Math.set(projectedSize[0], 0, this.vec2Cache[1]), this.vec2Cache[1]);
    const windowLl = transform.apply(Vec2Math.set(0, projectedSize[1], this.vec2Cache[2]), this.vec2Cache[2]);
    const windowLr = transform.apply(Vec2Math.set(projectedSize[0], projectedSize[1], this.vec2Cache[3]), this.vec2Cache[3]);

    const minX = Math.min(windowUl[0], windowUr[0], windowLl[0], windowLr[0]);
    const maxX = Math.max(windowUl[0], windowUr[0], windowLl[0], windowLr[0]);
    const minY = Math.min(windowUl[1], windowUr[1], windowLl[1], windowLr[1]);
    const maxY = Math.max(windowUl[1], windowUr[1], windowLl[1], windowLr[1]);

    const inverted = transform.invert();

    if (maxY > 0) {
      context.beginPath();
      let p = inverted.apply(Vec2Math.set(minX, 0, this.vec2Cache[0]), this.vec2Cache[0]);
      context.moveTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(maxX, 0, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(maxX, maxY, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(minX, maxY, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);
      context.closePath();

      context.fillStyle = this.props.options.groundColor;
      context.fill();
    }

    if (minY < 0) {
      context.beginPath();
      let p = inverted.apply(Vec2Math.set(minX, 0, this.vec2Cache[0]), this.vec2Cache[0]);
      context.moveTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(maxX, 0, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(maxX, minY, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);

      p = inverted.apply(Vec2Math.set(minX, minY, this.vec2Cache[0]), this.vec2Cache[0]);
      context.lineTo(p[0], p[1]);
      context.closePath();

      // The gradient distance must be at least as long as the longest color stop distance
      // or else the gradient becomes invalid (as addColorStop throws for values above 1)
      const gradientDistance = Math.min(minY, -this.maxSkyColorStopPx);
      const gradientStart = inverted.apply(Vec2Math.set(0, gradientDistance, this.vec2Cache[0]), this.vec2Cache[0]);
      const gradientEnd = inverted.apply(Vec2Math.set(0, 0, this.vec2Cache[1]), this.vec2Cache[1]);

      const gradient = context.createLinearGradient(gradientStart[0], gradientStart[1], gradientEnd[0], gradientEnd[1]);

      for (let i = 0; i < this.props.options.skyColors.length; i++) {
        const color = this.props.options.skyColors[i];
        gradient.addColorStop(1 - (color[0] / -gradientDistance), color[1]);
      }

      context.fillStyle = gradient;
      context.fill();
    }
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='artificial-horizon' style={this.rootStyle}>
        <HorizonSyncedCanvasLayer projection={this.props.projection} ref={this.canvasLayerRef} />
        <HorizonLine
          ref={this.horizonLineRef}
          projection={this.props.projection}
          approximate={true}
          showHeadingTicks={this.props.showHeadingLabels}
          showHeadingLabels={this.props.showHeadingLabels}
          useMagneticHeading={this.props.useMagneticHeading}
          {...this.props.horizonLineOptions}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.horizonLineRef.getOrDefault()?.destroy();

    this.showSub?.destroy();

    super.destroy();
  }
}