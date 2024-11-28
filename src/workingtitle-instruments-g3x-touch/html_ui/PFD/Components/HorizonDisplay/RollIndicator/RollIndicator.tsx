import {
  AffineTransformPathStream, BitFlags, CssTransformBuilder, CssTransformSubject, FSComponent, HorizonLayer, HorizonLayerProps,
  HorizonProjection, HorizonProjectionChangeType, MappedValue, MathUtils, ObjectSubject, ReadonlyFloat64Array, Subject, Subscribable,
  SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import './RollIndicator.css';

/**
 * Options for {@link RollIndicator}.
 */
export type RollIndicatorOptions = {
  /** The radius of the roll scale, in pixels. */
  radius: number;

  /** Whether to render the roll arc. */
  showArc: boolean;

  /**
   * Whether to render the indicator with a ground pointer or a sky pointer. With a ground pointer, the roll scale
   * rotates as the airplane banks to keep the zero-roll reference pointer pointed toward the ground while the roll
   * pointer remains fixed. With a sky pointer, the roll pointer rotates as the airplane banks to keep itself pointed
   * toward the sky while the roll scale remains fixed.
   */
  pointerStyle: 'ground' | 'sky';

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

  /** The size of the standard rate turn pointer, as `[width, height]` in pixels. */
  standardRateTurnPointerSize: ReadonlyFloat64Array;

  /**
   * The offset of the tip of the roll pointer from the roll scale, in pixels. Positive values displace the pointer
   * toward the center of the circle circumscribed by the roll scale.
   */
  rollPointerOffset: number;
}

/**
 * Component props for RollIndicator.
 */
export interface RollIndicatorProps extends HorizonLayerProps {
  /** Whether to show the standard rate turn pointer. */
  showStandardRateTurnPointer: Subscribable<boolean>;

  /** The airplane's current true airspeed, in knots. */
  tas: Subscribable<number>;

  /** Whether true airspeed data is valid. */
  isTasDataValid: Subscribable<boolean>;

  /** Options for the roll indicator. */
  options: Readonly<RollIndicatorOptions>;
}

/**
 * A PFD roll indicator. Displays a roll scale with standard turn rate pointers and a roll pointer.
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

  private readonly rollTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));
  private readonly leftStandardRatePointerTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('rad'));
  private readonly rightStandardRatePointerTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('rad'));
  private readonly standardRatePointerDisplay = Subject.create('none');

  private readonly isStandardRatePointerVisible = MappedValue.create(
    ([show, tas, isAdcDataValid]) => show && isAdcDataValid && tas >= 50,
    this.props.showStandardRateTurnPointer,
    this.props.tas,
    this.props.isTasDataValid,
  );

  private needUpdateRoll = false;

  /** @inheritDoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    this.rootStyle.set('display', isVisible ? '' : 'none');
  }

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.updateRootPosition();

    this.needUpdateRoll = true;
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
  public onUpdated(): void {
    if (!this.isVisible()) {
      return;
    }

    if (this.needUpdateRoll) {
      this.updateRoll();
      this.needUpdateRoll = false;
    }

    this.updateStandardRatePointers();
  }

  /**
   * Updates the rotation of the indicator.
   */
  private updateRoll(): void {
    this.rollTransform.transform.set(0, 0, 1, -this.props.projection.getRoll(), 0.1);
    this.rollTransform.resolve();
  }

  /**
   * Updates the standard rate turn pointers.
   */
  private updateStandardRatePointers(): void {
    const isVisible = this.isStandardRatePointerVisible.get();
    if (isVisible) {
      this.standardRatePointerDisplay.set('');

      // tan(bank_angle) = tas * (turn_rate) / g
      // standard rate turn = 3 deg/sec

      const tas = this.props.tas.get();
      const bankAngle = Math.atan(tas * 2.7467e-3);
      this.leftStandardRatePointerTransform.transform.set(0, 0, 1, -bankAngle, 1e-4);
      this.leftStandardRatePointerTransform.resolve();
      this.rightStandardRatePointerTransform.transform.set(0, 0, 1, bankAngle, 1e-4);
      this.rightStandardRatePointerTransform.resolve();
    } else {
      this.standardRatePointerDisplay.set('none');
    }
  }

  /** @inheritDoc */
  public onDetached(): void {
    super.onDetached();

    this.destroy();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='roll-indicator' style={this.rootStyle}>
        {this.renderScale()}
        {this.renderPointerContainer()}
      </div>
    );
  }

  /**
   * Renders the bank scale, which includes the bank reference pointer and the scale ticks.
   * @returns The bank scale, as a VNode.
   */
  private renderScale(): VNode {
    const {
      radius,
      showArc,
      majorTickLength,
      minorTickLength,
      referencePointerSize,
      referencePointerOffset,
      standardRateTurnPointerSize: standardRateTurnTrianglePointerSize,
    } = this.props.options;

    const svgPathStream = new SvgPathStream(0.01);
    const transformPathStream = new AffineTransformPathStream(svgPathStream);

    // arc

    let arcPath: string | undefined;

    if (showArc) {
      transformPathStream.addRotation(-Math.PI / 3 - Math.PI / 2);

      transformPathStream.beginPath();
      transformPathStream.moveTo(radius, 0);
      transformPathStream.arc(0, 0, radius, 0, 2 * Math.PI / 3);

      arcPath = svgPathStream.getSvgPath();
    }

    let standardRateTrianglePath = '';
    let standardRateTriangleViewBox = '';
    let pointerWidth = 0;
    let pointerHeight = 0;

    if (standardRateTurnTrianglePointerSize !== undefined) {
      pointerWidth = standardRateTurnTrianglePointerSize[0];
      pointerHeight = standardRateTurnTrianglePointerSize[1];

      transformPathStream.resetTransform();
      transformPathStream.addTranslation(0, -radius - 1);

      transformPathStream.beginPath();
      transformPathStream.moveTo(0, 0);
      transformPathStream.lineTo(-pointerWidth / 2, -pointerHeight);
      transformPathStream.lineTo(pointerWidth / 2, -pointerHeight);
      transformPathStream.lineTo(0, 0);
      transformPathStream.closePath();

      standardRateTrianglePath = svgPathStream.getSvgPath();
      standardRateTriangleViewBox = `${-pointerWidth / 2} ${-radius - pointerHeight} ${pointerWidth} ${radius + pointerHeight}`;
    }

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

    for (const angle of [10, 20, 45]) {
      transformPathStream.resetTransform();
      transformPathStream.addRotation(-angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - minorTickLength);

      transformPathStream.addRotation(2 * angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - minorTickLength);
    }

    for (const angle of [30, 60]) {
      transformPathStream.resetTransform();
      transformPathStream.addRotation(-angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - majorTickLength);

      transformPathStream.addRotation(2 * angle * Avionics.Utils.DEG2RAD);

      transformPathStream.moveTo(0, -radius);
      transformPathStream.lineTo(0, -radius - majorTickLength);
    }

    const ticksPath = svgPathStream.getSvgPath();

    const left = -radius * MathUtils.SQRT3 / 2;
    const top = -radius;
    const width = -left * 2;
    const height = radius;

    const leftPx = left.toFixed(2);
    const topPx = top.toFixed(2);
    const widthPx = width.toFixed(2);
    const heightPx = height.toFixed(2);

    const viewBox = `${leftPx} ${topPx} ${widthPx} ${heightPx}`;

    const standardRateTurnPointerStyle = {
      position: 'absolute',
      left: `${(-pointerWidth / 2).toFixed(2)}px`,
      top: `${-(radius + pointerHeight).toFixed(2)}px`,
      width: `${pointerWidth.toFixed(2)}px`,
      height: `${(radius + pointerHeight).toFixed(2)}px`,
      overflow: 'visible',
      'transform-origin': 'bottom center',
    };

    return (
      <div
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '0px',
          'height': '0px',
          'transform': this.props.options.pointerStyle === 'sky' ? '' : this.rollTransform,
        }}
      >
        <svg
          viewBox={viewBox}
          style={`position: absolute; left: ${leftPx}px; top: ${topPx}px; width: ${widthPx}px; height: ${heightPx}px; overflow: visible;`}
        >
          {arcPath !== undefined && (
            <path
              d={arcPath}
              fill='none'
              class='roll-scale-arc roll-scale-stroke'
            />
          )}
          <path
            d={pointerPath}
            class='roll-scale-ref-pointer roll-scale-fill'
          />
          <path
            d={ticksPath}
            fill='none'
            class='roll-scale-ticks roll-scale-stroke'
          />
        </svg>

        <svg
          viewBox={standardRateTriangleViewBox}
          style={{
            ...standardRateTurnPointerStyle,
            display: this.standardRatePointerDisplay,
            transform: this.leftStandardRatePointerTransform,
          }}
        >
          <path
            d={standardRateTrianglePath}
            class='roll-scale-standard-rate-triangle'
          />
        </svg>
        <svg
          viewBox={standardRateTriangleViewBox}
          style={{
            ...standardRateTurnPointerStyle,
            display: this.standardRatePointerDisplay,
            transform: this.rightStandardRatePointerTransform,
          }}
        >
          <path
            d={standardRateTrianglePath}
            class='roll-scale-standard-rate-triangle'
          />
        </svg>
      </div>
    );
  }

  /**
   * Renders the roll pointer.
   * @returns The roll pointer, as a VNode.
   */
  private renderPointerContainer(): VNode {
    const pointerSize = this.props.options.rollPointerSize;

    const pointerTipRadius = this.props.options.radius - this.props.options.rollPointerOffset;
    const pointerHalfWidth = pointerSize[0] / 2;

    const pointerLeft = -pointerHalfWidth;
    const pointerTop = -pointerTipRadius;
    const pointerWidth = pointerHalfWidth * 2;
    const pointerHeight = pointerSize[1];

    const pointerPath = `M 0 ${-pointerTipRadius} l ${pointerLeft} ${pointerHeight} l ${pointerWidth} 0 Z`;

    return (
      <div
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '0px',
          'height': '0px',
          'transform': this.props.options.pointerStyle === 'sky' ? this.rollTransform : ''
        }}
      >
        <svg
          viewBox={`${pointerLeft} ${pointerTop} ${pointerWidth} ${pointerHeight}`}
          class='roll-indicator-pointer roll-indicator-fill'
          style={`position: absolute; left: ${pointerLeft}px; top: ${pointerTop}px; width: ${pointerWidth}px; height: ${pointerHeight}px; overflow: visible;`}
        >
          <path d={pointerPath} />
        </svg>
      </div>
    );
  }
}