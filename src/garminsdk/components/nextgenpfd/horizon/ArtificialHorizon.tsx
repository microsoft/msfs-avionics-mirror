import {
  BitFlags, ComponentProps, HorizonProjection, HorizonProjectionChangeType, HorizonSharedCanvasSubLayer,
  Subscribable, Subscription, Transform2D, Vec2Math
} from '@microsoft/msfs-sdk';

/**
 * Options for {@link ArtificialHorizon}.
 */
export interface ArtificialHorizonOptions {
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
export interface ArtificalHorizonProps extends ComponentProps {
  /** Whether to show the artificial horizon. */
  show: Subscribable<boolean>;

  /** Options for the artificial horizon. */
  options: ArtificialHorizonOptions;
}

/**
 * A PFD artificial horizon. Renders sky and ground boxes.
 */
export class ArtificialHorizon extends HorizonSharedCanvasSubLayer<ArtificalHorizonProps> {
  private static readonly UPDATE_FLAGS
    = HorizonProjectionChangeType.ScaleFactor
    | HorizonProjectionChangeType.Fov
    | HorizonProjectionChangeType.Pitch
    | HorizonProjectionChangeType.Roll
    | HorizonProjectionChangeType.ProjectedSize;

  private readonly vec2Cache = [Vec2Math.create(), Vec2Math.create(), Vec2Math.create(), Vec2Math.create()];

  private readonly bgTranslation = Vec2Math.create();
  private bgRotation = 0;

  private readonly windowTransform = new Transform2D();

  private readonly maxSkyColorStopPx = Math.max(...this.props.options.skyColors.map(c => c[0]));

  private needUpdate = false;

  private showSub?: Subscription;

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.showSub = this.props.show.sub(() => { this.needUpdate = true; }, true);

    this.needUpdate = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(changeFlags, ArtificialHorizon.UPDATE_FLAGS)) {
      this.needUpdate = true;
    }
  }

  /** @inheritdoc */
  public shouldInvalidate(): boolean {
    return this.needUpdate && this.isVisible();
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.display.isInvalidated || !this.isVisible()) {
      return;
    }

    if (this.props.show.get()) {
      // Approximate translation due to pitch using a constant pitch resolution (pixels per degree of pitch) derived
      // from the projection's current field of view. The error of this approximation increases with the absolute
      // deviation of the pitch angle from 0 degrees. We do this instead of simply projecting the true horizon line
      // because we need to keep the line in sync with the attitude pitch ladder, which uses the same approximation.

      const projection = this.projection;
      const pitchResolution = projection.getScaleFactor() / projection.getFov();
      const pitch = projection.getPitch();
      const roll = projection.getRoll();

      Vec2Math.set(0, pitchResolution * pitch, this.bgTranslation);
      this.bgRotation = -roll;

      this.drawHorizonRects(this.display.context, projection);
    }

    this.needUpdate = false;
  }

  /**
   * Draws the horizon rects.
   * @param context The canvas rendering context to which to draw.
   * @param projection The horizon projection.
   */
  private drawHorizonRects(context: CanvasRenderingContext2D, projection: HorizonProjection): void {
    const projectedCenter = projection.getOffsetCenterProjected();
    const projectedSize = projection.getProjectedSize();

    this.windowTransform.toIdentity();
    const transform = this.windowTransform
      .addTranslation(-projectedCenter[0], -projectedCenter[1])
      .addRotation(-this.bgRotation * Avionics.Utils.DEG2RAD)
      .addTranslation(-this.bgTranslation[0], -this.bgTranslation[1]);

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
  public destroy(): void {
    this.showSub?.destroy();

    super.destroy();
  }
}