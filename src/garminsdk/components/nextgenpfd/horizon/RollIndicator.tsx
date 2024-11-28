import {
  AffineTransformPathStream, BitFlags, CssTransformBuilder, CssTransformSubject, DisplayComponent, FSComponent,
  HorizonLayer, HorizonLayerProps, HorizonProjection, HorizonProjectionChangeType, MathUtils, ObjectSubject,
  ReadonlyFloat64Array, Subscribable, Subscription, SvgPathStream, VNode
} from '@microsoft/msfs-sdk';

import { RollIndicatorScaleComponent, RollIndicatorScaleParameters } from './RollIndicatorScaleComponent';

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
}

/**
 * A function that renders a roll scale component for a {@link RollIndicator}. The rendered component should be an
 * instance of {@link RollIndicatorScaleComponent}.
 * @param projection The component's horizon projection.
 * @param scaleParams Parameters describing the component's parent roll scale.
 * @returns A roll scale component, as a VNode.
 */
export type RollIndicatorScaleComponentFactory = (projection: HorizonProjection, scaleParams: Readonly<RollIndicatorScaleParameters>) => VNode;

/**
 * Component props for {@link RollIndicator}.
 */
export interface RollIndicatorProps extends HorizonLayerProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** Whether to show the slip-skid indicator. */
  showSlipSkid: Subscribable<boolean>;

  /** Whether to show the low-bank arc. */
  showLowBankArc: Subscribable<boolean>;

  /** The turn coordinator ball position, normalized to the range `[-1, 1]`. */
  turnCoordinatorBall: Subscribable<number>;

  /** Options for the roll indicator. */
  options: Readonly<RollIndicatorOptions>;

  /**
   * Factories to create roll scale components to render with the indicator.
   */
  scaleComponents?: Iterable<RollIndicatorScaleComponentFactory>;
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

  private readonly rollTransform = CssTransformSubject.create(CssTransformBuilder.rotate3d('deg'));
  private readonly slipSkidTransform = CssTransformSubject.create(CssTransformBuilder.translate3d('px'));

  private readonly scaleComponents: RollIndicatorScaleComponent[] = [];
  private areScaleComponentsAttached = false;

  private needUpdateRoll = false;
  private needUpdateSlipSkid = false;

  private showSub?: Subscription;
  private turnCoordinatorBallSub?: Subscription;

  /** @inheritDoc */
  protected onVisibilityChanged(isVisible: boolean): void {
    if (this.areScaleComponentsAttached) {
      for (const component of this.scaleComponents) {
        component.onScaleVisibilityChanged(isVisible);
      }
    }
  }

  /** @inheritDoc */
  public onAttached(): void {
    super.onAttached();

    this.turnCoordinatorBallSub = this.props.turnCoordinatorBall.sub(() => { this.needUpdateSlipSkid = true; });

    this.showSub = this.props.show.sub(this.setVisible.bind(this), true);

    this.updateRootPosition();

    this.needUpdateRoll = true;
    this.needUpdateSlipSkid = true;

    for (const component of this.scaleComponents) {
      component.onScaleAttached();
    }
    this.areScaleComponentsAttached = true;
    if (!this.isVisible()) {
      for (const component of this.scaleComponents) {
        component.onScaleVisibilityChanged(false);
      }
    }
  }

  /** @inheritDoc */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAll(changeFlags, HorizonProjectionChangeType.OffsetCenterProjected)) {
      this.updateRootPosition();
    }

    if (BitFlags.isAny(changeFlags, HorizonProjectionChangeType.Roll)) {
      this.needUpdateRoll = true;
    }

    for (let i = 0; i < this.scaleComponents.length; i++) {
      this.scaleComponents[i].onProjectionChanged(projection, changeFlags);
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
  public onUpdated(time: number, elapsed: number): void {
    if (this.isVisible()) {
      this.rootStyle.set('display', '');

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
    } else {
      this.rootStyle.set('display', 'none');
    }

    for (let i = 0; i < this.scaleComponents.length; i++) {
      this.scaleComponents[i].onUpdated(time, elapsed);
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
    const ball = this.props.turnCoordinatorBall.get();

    this.slipSkidTransform.transform.set(ball * this.props.options.slipSkidIndicatorTranslateScale, 0, 0, 0.1);
    this.slipSkidTransform.resolve();
  }

  /** @inheritDoc */
  public onDetached(): void {
    super.onDetached();

    for (const component of this.scaleComponents) {
      component.onScaleDetached();
    }

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
   * @throws Error if a scale component factory creates a VNode that is not an instance of
   * `RollIndicatorScaleComponent`.
   */
  private renderScale(): VNode {
    const {
      radius,
      showArc,
      pointerStyle,
      lowBankAngle,
      majorTickLength,
      minorTickLength,
      referencePointerSize,
      referencePointerOffset
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

    // low-bank arc

    let lowBankArcPath: string | undefined;

    if (lowBankAngle !== undefined) {
      transformPathStream.resetTransform();
      transformPathStream.addRotation(-lowBankAngle * Avionics.Utils.DEG2RAD - Math.PI / 2);

      transformPathStream.beginPath();
      transformPathStream.moveTo(radius, 0);
      transformPathStream.arc(0, 0, radius, 0, 2 * lowBankAngle * Avionics.Utils.DEG2RAD);

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

    // Render scale components

    const scaleComponentNodes: VNode[] = [];
    if (this.props.scaleComponents) {
      const scaleParams: RollIndicatorScaleParameters = {
        radius,
        showArc,
        pointerStyle,
        majorTickLength,
        minorTickLength,
        referencePointerSize,
        referencePointerOffset
      };

      for (const factory of this.props.scaleComponents) {
        const node = factory(this.props.projection, scaleParams);
        if (node.instance instanceof DisplayComponent && (node.instance as any).isRollIndicatorScaleComponent === true) {
          scaleComponentNodes.push(node);
          this.scaleComponents.push(node.instance as RollIndicatorScaleComponent);
        } else {
          throw new Error('RollIndicator: a scale component node was created that is not an instance of RollIndicatorScaleComponent');
        }
      }
    }

    return (
      <div
        style={{
          'position': 'absolute',
          'left': '0px',
          'top': '0px',
          'width': '0px',
          'height': '0px',
          'transform': pointerStyle === 'sky' ? '' : this.rollTransform,
        }}
      >
        <svg
          viewBox={viewBox}
          class='roll-indicator-scale'
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
        {scaleComponentNodes}
      </div>
    );
  }

  /**
   * Renders the roll pointer and slip/skid indicator.
   * @returns The roll pointer and slip/skid indicator, as a VNode.
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

    const slipSkidTop = -pointerTipRadius + pointerHeight + Math.max(0, this.props.options.slipSkidIndicatorOffset);

    const slipSkidHeight = this.props.options.slipSkidIndicatorHeight;
    const slipSkidTopHalfWidth = MathUtils.lerp(slipSkidTop + pointerTipRadius, 0, pointerHeight, 0, pointerHalfWidth);
    const slipSkidBottomHalfWidth = MathUtils.lerp(slipSkidTop + pointerTipRadius + slipSkidHeight, 0, pointerHeight, 0, pointerHalfWidth);
    const slipSkidDeltaHalfWidth = slipSkidBottomHalfWidth - slipSkidTopHalfWidth;

    const slipSkidLeft = -slipSkidBottomHalfWidth;
    const slipSkidWidth = slipSkidBottomHalfWidth * 2;

    const slipSkidPath = `M ${-slipSkidTopHalfWidth} ${slipSkidTop} l ${slipSkidTopHalfWidth * 2} 0 l ${slipSkidDeltaHalfWidth} ${slipSkidHeight} l ${-slipSkidBottomHalfWidth * 2} 0 Z`;

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
          <path d={slipSkidPath} />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const component of this.scaleComponents) {
      component.destroy();
    }

    this.lowBankArcDisplay.destroy();
    this.slipSkidDisplay.destroy();

    this.showSub?.destroy();
    this.turnCoordinatorBallSub?.destroy();

    super.destroy();
  }
}
