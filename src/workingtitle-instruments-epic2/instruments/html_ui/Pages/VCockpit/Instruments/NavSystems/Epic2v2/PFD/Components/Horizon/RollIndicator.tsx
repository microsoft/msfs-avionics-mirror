import {
  AffineTransformPathStream, BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps, HorizonProjection,
  HorizonProjectionChangeType, MathUtils, ObjectSubject, ReadonlyFloat64Array, Subscribable, SubscribableMapFunctions, Subscription, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import './RollIndicator.css';

/**
 * Options for {@link RollIndicator}.
 */
export type RollIndicatorOptions = {
  /** The radius of the roll scale, in pixels. */
  radius: number;

  /** The radius of the last tick on the roll scale in pixels, if different to the others. */
  lastTickRadius?: number;

  /** The bank angle limit, in degrees, in Low Bank Mode. If not defined, the low-bank arc will not be displayed. */
  lowBankAngle?: number;

  /** The length of the major roll scale ticks, in pixels. */
  majorTickLength: number;

  /** The length of the minor roll scale ticks, in pixels. */
  minorTickLength: number;

  /** The size of the zero-roll reference pointer, as `[width, height]` in pixels. */
  referencePointerSize: ReadonlyFloat64Array;

  /**
   * The offset of the tip of the zero-roll reference pointer from the roll scale, in pixels. Positive values displace
   * the pointer away from the center of the circle circumscribed by the roll scale.
   */
  referencePointerOffset: number;

  /** The size of the roll pointer, as `[width, height]` in pixels. */
  rollPointerSize: ReadonlyFloat64Array;

  /**
   * The offset of the tip of the roll pointer from the roll scale, in pixels. Positive values displace the pointer
   * toward the center of the circle circumscribed by the roll scale.
   */
  rollPointerOffset: number;

  /** The offset of the slip/skid indicator from the roll pointer, in pixels. Values less than 0 will be clamped to 0. */
  slipSkidIndicatorOffset: number;

  /** The height of the slip/skid indicator, in pixels. */
  slipSkidIndicatorHeight: number;

  /** The amount to translate the slip/skid indicator, in pixels, at full deflection. */
  slipSkidIndicatorTranslateScale: number;

  /** The sideslip acceleration at full deflection, in gs. Beyond this the indicator turns into an arrow. */
  slipSkidFullScale: number;

  /** The threshold for extreme slip/skid. Beyond this the scale changes colour.  */
  slipSkidExtremeThreshold: number;
}

/**
 * Component props for RollIndicator.
 */
export interface RollIndicatorProps extends HorizonLayerProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** Whether to show the slip-skid indicator. */
  showSlipSkid: Subscribable<boolean>;

  /** Whether to show the low-bank arc. */
  showLowBankArc: Subscribable<boolean>;

  /** The sideslip acceleration in gs, or null when invalid. */
  sideSlip: Subscribable<number | null>;

  /** Options for the roll indicator. */
  options: RollIndicatorOptions;
}

/**
 * A PFD roll indicator. Displays a roll scale, roll pointer, and slip-skid indicator.
 */
export class RollIndicator extends HorizonLayer<RollIndicatorProps> {

  // NOTE: Everything in this component is referenced to a coordinate system with the horizon projection projected
  // center as the origin and axes aligned with the horizon projection.

  private readonly rootStyle = ObjectSubject.create({
    'display': '',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'width': '0px',
    'height': '0px',
  });

  private readonly lowBankArcDisplay = this.props.showLowBankArc.map(show => show ? '' : 'none');
  private readonly slipSkidDisplay = this.props.showSlipSkid.map(show => show ? '' : 'none');

  // arrow instead of normal pointer
  private readonly isHighSideSlip = this.props.sideSlip.map((v) => Math.abs(v ?? 0) > this.props.options.slipSkidFullScale);
  // arrows turns amber
  private readonly isExtremeSideSlip = this.props.sideSlip.map((v) => Math.abs(v ?? 0) > this.props.options.slipSkidExtremeThreshold);

  private readonly rollTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));
  private readonly slipSkidTransform = CssTransformSubject.create(CssTransformBuilder.concat(CssTransformBuilder.translate3d('px'), CssTransformBuilder.scaleX()));

  private needUpdateRoll = false;
  private needUpdateSlipSkid = false;

  private showSub?: Subscription;
  private turnCoordinatorBallSub?: Subscription;

  /** @inheritdoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritdoc */
  public onAttached(): void {
    super.onAttached();

    this.turnCoordinatorBallSub = this.props.sideSlip.sub(() => { this.needUpdateSlipSkid = true; });

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.updateRootPosition();

    this.needUpdateRoll = true;
    this.needUpdateSlipSkid = true;
  }

  /** @inheritdoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected)) {
      this.updateRootPosition();
    }

    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.Roll)) {
      this.needUpdateRoll = true;
    }
  }

  /**
   * Updates this indicator's root container position.
   */
  private updateRootPosition(): void {
    const offsetCenter = this.props.projection.getOffsetCenterProjected();
    this.rootStyle.set('left', `${offsetCenter[0]}px`);
    this.rootStyle.set('top', `${offsetCenter[1]}px`);
  }

  /** @inheritdoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.needUpdateRoll) {
      this.updateRoll();

      this.needUpdateRoll = false;
    }

    if (!this.props.showSlipSkid.get()) {
      return;
    }

    if (this.needUpdateSlipSkid) {
      this.updateSlipSkid();

      this.needUpdateSlipSkid = false;
    }
  }

  /**
   * Updates the rotation of the indicator.
   */
  private updateRoll(): void {
    this.rollTransform.transform.set(0, 0, 1, -this.props.projection.getRoll(), 0.1);
    this.rollTransform.resolve();
  }

  /**
   * Updates the position of the slip/skid indicator.
   */
  private updateSlipSkid(): void {
    const accel = this.props.sideSlip.get();

    this.slipSkidTransform.transform.getChild(0).set(MathUtils.clamp((accel ?? 0) / 0.074, -1, 1) * this.props.options.slipSkidIndicatorTranslateScale, 0, 0, 0.1);
    // we mirror the indicator because at high slip it becomes an arrow and we need it to point in the correct direction
    this.slipSkidTransform.transform.getChild(1).set(MathUtils.hardSign(accel ?? 0));
    this.slipSkidTransform.resolve();
  }

  /** @inheritdoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='roll-indicator' style={this.rootStyle}>
        {this.renderScale()}
        {this.renderPointerContainer(this.props.sideSlip.map((v) => v !== null))}
      </div>
    );
  }

  /**
   * Renders the bank scale, which includes the bank reference pointer and the scale ticks.
   * @returns The bank scale, as a VNode.
   */
  private renderScale(): VNode {
    const { radius, lowBankAngle, majorTickLength, minorTickLength, referencePointerSize, referencePointerOffset } = this.props.options;

    const svgPathStream = new SvgPathStream(0.01);
    const transformPathStream = new AffineTransformPathStream(svgPathStream);

    // zero-roll reference pointer

    transformPathStream.resetTransform();
    transformPathStream.addTranslation(0, -(radius + referencePointerOffset));

    transformPathStream.beginPath();

    const halfWidth = referencePointerSize[0] / 2;

    transformPathStream.moveTo(0, 0);
    transformPathStream.lineTo(-halfWidth, -referencePointerSize[1]);
    transformPathStream.lineTo(halfWidth, -referencePointerSize[1]);
    transformPathStream.closePath();

    const pointerPath = svgPathStream.getSvgPath();

    // ticks

    transformPathStream.beginPath();

    for (const angle of [10, 20]) {
      transformPathStream.resetTransform();
      transformPathStream.addRotation(-angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - minorTickLength);

      transformPathStream.addRotation(2 * angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - minorTickLength);
    }

    // 45 ticks (triangles)
    const halfWidth45 = minorTickLength / 2;
    const height45 = minorTickLength / Math.SQRT2;

    transformPathStream.resetTransform();
    transformPathStream.addRotation(-45 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -radius);
    transformPathStream.lineTo(-halfWidth45, -radius - height45);
    transformPathStream.lineTo(halfWidth45, -radius - height45);
    transformPathStream.lineTo(0, -radius);

    transformPathStream.addRotation(2 * 45 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -radius);
    transformPathStream.lineTo(-halfWidth45, -radius - height45);
    transformPathStream.lineTo(halfWidth45, -radius - height45);
    transformPathStream.lineTo(0, -radius);

    // 30 ticks
    transformPathStream.resetTransform();
    transformPathStream.addRotation(-30 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -radius);
    transformPathStream.lineTo(0, -radius - majorTickLength);

    transformPathStream.addRotation(2 * 30 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -radius);
    transformPathStream.lineTo(0, -radius - majorTickLength);

    // 60 ticks
    const lastTickRadius = this.props.options.lastTickRadius ?? radius;

    transformPathStream.resetTransform();
    transformPathStream.addRotation(-60 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -lastTickRadius);
    transformPathStream.lineTo(0, -lastTickRadius - minorTickLength);

    transformPathStream.addRotation(2 * 60 * Avionics.Utils.DEG2RAD);

    transformPathStream.moveTo(0, -lastTickRadius);
    transformPathStream.lineTo(0, -lastTickRadius - minorTickLength);

    const ticksPath = svgPathStream.getSvgPath();

    // low-bank arc

    let lowBankArcPath: string | undefined;

    if (lowBankAngle !== undefined) {
      transformPathStream.resetTransform();
      transformPathStream.addRotation(-lowBankAngle * Avionics.Utils.DEG2RAD - Math.PI / 2);

      transformPathStream.beginPath();
      transformPathStream.moveTo(radius + minorTickLength / 2, 0);
      transformPathStream.lineTo(radius, 0);
      transformPathStream.arc(0, 0, radius, 0, 2 * lowBankAngle * Avionics.Utils.DEG2RAD);
      transformPathStream.addRotation(2 * lowBankAngle * Avionics.Utils.DEG2RAD);
      transformPathStream.lineTo(radius + minorTickLength / 2, 0);

      lowBankArcPath = svgPathStream.getSvgPath();
    }

    const left = -radius * MathUtils.SQRT3 / 2;
    const top = -radius;
    const width = -left * 2;
    const height = radius / 2;

    const leftPx = left.toFixed(2);
    const topPx = top.toFixed(2);
    const widthPx = width.toFixed(2);
    const heightPx = height.toFixed(2);

    const viewBox = `${leftPx} ${topPx} ${widthPx} ${heightPx}`;

    return (
      <div
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '0px',
          'height': '0px',
        }}
      >
        <svg
          viewBox={viewBox}
          class='roll-indicator-scale'
          style={`position: absolute; left: ${leftPx}px; top: ${topPx}px; width: ${widthPx}px; height: ${heightPx}px; overflow: visible;`}
        >
          <path
            d={pointerPath}
            class='roll-scale-shadow'
          />
          <path
            d={pointerPath}
            class='roll-scale-ref-pointer'
          />
          <path
            d={ticksPath}
            fill='none'
            class='roll-scale-ticks roll-scale-shadow'
          />
          <path
            d={ticksPath}
            fill='none'
            class='roll-scale-ticks roll-scale-stroke'
          />
        </svg>
        {lowBankArcPath !== undefined && (
          <svg
            viewBox={viewBox}
            class='roll-indicator-low-bank-arc'
            style={{
              'display': this.lowBankArcDisplay,
              'position': 'absolute',
              'left': `${leftPx}px`,
              'top': `${topPx}px`,
              'width': `${widthPx}px`,
              'height': `${heightPx}px`,
              'overflow': 'visible'
            }}
          >
            <path
              d={lowBankArcPath}
              fill='none'
            />
          </svg>
        )}
      </div>
    );
  }

  /**
   * Renders the roll pointer and slip/skid indicator.
   * @param slipValid Whether the slip/skid pointer data is valid.
   * @returns The roll pointer and slip/skid indicator, as a VNode.
   */
  private renderPointerContainer(slipValid: Subscribable<boolean>): VNode {
    const pointerSize = this.props.options.rollPointerSize;
    const pointerTipRadius = this.props.options.radius - this.props.options.rollPointerOffset;
    const pointerHalfWidth = pointerSize[0] / 2;

    const pointerLeft = -pointerHalfWidth;
    const pointerTop = -pointerTipRadius;
    const pointerWidth = pointerHalfWidth * 2;
    const pointerHeight = pointerSize[1];

    const pointerPath = `M 0 ${-pointerTipRadius} l ${pointerLeft} ${pointerHeight} l ${pointerWidth} 0 Z`;

    const slipSkidTop = -pointerTipRadius + pointerHeight + Math.max(0, this.props.options.slipSkidIndicatorOffset);

    const slipSkidHeight = this.props.options.slipSkidIndicatorHeight;
    const slipSkidTopHalfWidth = MathUtils.lerp(slipSkidTop + pointerTipRadius, 0, pointerHeight, 0, pointerHalfWidth);
    const slipSkidBottomHalfWidth = MathUtils.lerp(slipSkidTop + pointerTipRadius + slipSkidHeight, 0, pointerHeight, 0, pointerHalfWidth);
    const slipSkidDeltaHalfWidth = slipSkidBottomHalfWidth - slipSkidTopHalfWidth;

    const slipSkidLeft = -slipSkidBottomHalfWidth;
    const slipSkidWidth = slipSkidBottomHalfWidth * 2;

    // M -9 -169 l 18 0 l 3.9375 7 l -25.875 0 Z
    const slipSkidNormalPath = `M ${-slipSkidTopHalfWidth} ${slipSkidTop} l ${slipSkidTopHalfWidth * 2} 0 l ${slipSkidDeltaHalfWidth} ${slipSkidHeight} l ${-slipSkidBottomHalfWidth * 2} 0 Z`;
    // M -9 -169 l 22 0 l 0 -7 l 11 10.5 l -11 10.5 l -0.0625 -7 l -25.875 0 Z
    // FIXME parameterise the rest of this..?
    const slipSkidHighPath = `M ${-slipSkidTopHalfWidth} ${slipSkidTop} l 22 0 l 0 -7 l 11 10.5 l -11 10.5 l -0.0625 -7 l -25.875 0 Z`;

    const slipSkidFailedTopX = 1.4 * -slipSkidTopHalfWidth;
    const slipSkidFailedBottomX = 1.4 * -slipSkidBottomHalfWidth;
    const slipSkidFailedTopY = -pointerTipRadius + pointerHeight - 0.3 * slipSkidHeight;
    const slipSkidFailedBottomY = -pointerTipRadius + pointerHeight + 1.3 * slipSkidHeight;

    return (
      <div
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '0px',
          'height': '0px',
          'transform': this.rollTransform,
        }}
      >
        <svg
          viewBox={`${pointerLeft} ${pointerTop} ${pointerWidth} ${pointerHeight}`}
          class='roll-indicator-pointer roll-indicator-fill'
          style={`position: absolute; left: ${pointerLeft}px; top: ${pointerTop}px; width: ${pointerWidth}px; height: ${pointerHeight}px; overflow: visible;`}
        >
          <path d={pointerPath} />
          <rect x={-1} width={2} y={-pointerTipRadius + pointerHeight - 2} height={2} class="roll-indicator-black-fill" />
        </svg>
        <svg
          viewBox={`${slipSkidLeft} ${slipSkidTop} ${slipSkidWidth} ${slipSkidHeight}`}
          class='roll-indicator-slip-skid roll-indicator-fill'
          style={{
            'display': this.slipSkidDisplay,
            'position': 'absolute',
            'left': `${slipSkidLeft}px`,
            'top': `${slipSkidTop}px`,
            'width': `${slipSkidWidth}px`,
            'height': `${slipSkidHeight}px`,
            'transform': this.slipSkidTransform,
            'overflow': 'visible'
          }}
        >
          <path d={slipSkidNormalPath} class={{ 'hidden': this.isHighSideSlip }} />
          <path d={slipSkidHighPath} class={{ 'hidden': this.isHighSideSlip.map(SubscribableMapFunctions.not()), 'amber': this.isExtremeSideSlip }} />
          <rect x={-1} width={2} y={-pointerTipRadius + pointerHeight} height={2} class="roll-indicator-black-fill" />
          <g visibility={slipValid.map((v) => v ? 'hidden' : 'inherit')}>
            <line class="roll-indicator-slip-skid-failed" x1={-slipSkidFailedTopX} x2={slipSkidFailedBottomX} y1={slipSkidFailedTopY} y2={slipSkidFailedBottomY} />
            <line class="roll-indicator-slip-skid-failed" x1={-slipSkidFailedBottomX} x2={slipSkidFailedTopX} y1={slipSkidFailedBottomY} y2={slipSkidFailedTopY} />
          </g>
        </svg>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.lowBankArcDisplay.destroy();
    this.slipSkidDisplay.destroy();

    this.showSub?.destroy();
    this.turnCoordinatorBallSub?.destroy();

    super.destroy();
  }
}
