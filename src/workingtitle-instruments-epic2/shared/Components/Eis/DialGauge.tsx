import { CssTransformBuilder, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, SVGUtils, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { AbstractEngineGauge, AbstractEngineGaugeProps } from './AbstractEngineGauge';

import './DialGauge.css';

// FIXME need to parameterise size

/** Props for a DialGauge */
export interface DialGaugeProps extends AbstractEngineGaugeProps {
  /** The white mark value, optional. */
  whiteMark?: number,
  /** Whether the white mark is visible, defaults to true. */
  whiteMarkVisible?: Subscribable<boolean>,
  /** The bug value, optional. */
  bugValue?: Subscribable<number>,
  /** The width in characters of the value display. */
  valueCharacterWidth: number,
  /** unit to display on digital readout */
  unit?: string,
  /** CSS class(es) to add to the root of the readout component. */
  class?: ToggleableClassNameRecord;
  /**
   * If true the amber and red segments on the arc are always shown,
   * otherwise they are only shown when warnings/cautions are active.
   */
  segmentsAlwaysVisible?: boolean;
}

const ARC_ORIGIN_X = 148 / 2;
const ARC_ORIGIN_Y = 80;

const MARK_PROPS: (keyof DialGaugeProps)[] = [
  'whiteMark',
  'amberMarkLow',
  'amberMarkHigh',
  'redMarkLow',
  'redMarkHigh',
];

/** A DialGauge */
export class DialGauge extends AbstractEngineGauge<DialGaugeProps> {
  private readonly gaugeRef = FSComponent.createRef<HTMLDivElement>();
  private readonly needleRef = FSComponent.createRef<SVGPolygonElement>();
  protected readonly grayMask = FSComponent.createRef<HTMLDivElement>();

  protected isAmberLowActive = SubscribableUtils.toSubscribable(this.props.isAmberCautionLowActive ?? false, true);
  protected isAmberHighActive = SubscribableUtils.toSubscribable(this.props.isAmberCautionHighActive ?? false, true);
  protected readonly isAmber = MappedSubject.create(SubscribableMapFunctions.or(), this.isAmberLowActive, this.isAmberHighActive);

  protected isRedLowActive = SubscribableUtils.toSubscribable(this.props.isRedWarningLowActive ?? false, true);
  protected isRedHighActive = SubscribableUtils.toSubscribable(this.props.isRedWarningHighActive ?? false, true);
  protected readonly isRed = MappedSubject.create(SubscribableMapFunctions.or(), this.isRedLowActive, this.isRedHighActive);

  protected readonly isPointerVisible = this.pointer.map((v) => v === null);
  protected readonly pointerTransform = Subject.create('rotate3d(0, 0, 0)');
  protected readonly pointerTransformBuilder = CssTransformBuilder.rotate3d('deg');

  /**
   * Calculates an angle from a value for use in the arc path builder.
   * @param value The value.
   * @returns An interpolated angle clamped to -90 to 90.
   * */
  private calculateAngleFromValue(value: number): number {
    const angle: number = MathUtils.lerp(value, this.props.scaleMax, this.props.scaleMin, 90, -90);
    return MathUtils.clamp(angle, -90, 90);
  }

  /** @inheritDoc */
  protected renderMarks(): VNode[] {
    return MARK_PROPS.map((mark: keyof DialGaugeProps): VNode => {
      const markValue = this.props[mark];

      if (typeof markValue === 'number' || (SubscribableUtils.isSubscribable(markValue) && typeof markValue.get() === 'number')) {
        const markSub = SubscribableUtils.toSubscribable(markValue, true) as Subscribable<number>;

        return <line
          class={`mark ${mark.replace(/Mark|High|Low/g, '')}`}
          x1={ARC_ORIGIN_X} y1={9}
          x2={ARC_ORIGIN_X} y2={21}
          style={markSub.map((v) => `transform: rotate(${(this.calculateAngleFromValue(v))}deg);`)}
        />;
      } else {
        return <></>;
      }
    });
  }

  /**
   * Generates an arc path from a starting to an ending value.
   * @param startValue The starting value.
   * @param endValue The ending value.
   * @returns The arc path string.
   */
  private makeArcPath(startValue: number, endValue: number): string {
    return SVGUtils.describeArc(
      ARC_ORIGIN_X,
      ARC_ORIGIN_Y,
      ARC_ORIGIN_X - 9,
      this.calculateAngleFromValue(startValue),
      this.calculateAngleFromValue(endValue),
    );
  }

  /** @inheritDoc */
  protected onValueChanged(val: number | null): void {
    if (val !== null) {
      const angle = this.calculateAngleFromValue(val);
      this.needleRef.instance.style.transform = `rotate(${angle}deg)`;
      this.updateMask(angle);
    }
  }

  /**
   * Updates the current Gauge mask.
   * @param angle The new mask angle.
   */
  public updateMask(angle: number): void {
    const greyCircleRotationDegree = -90 + angle;
    this.grayMask.instance.style.transform = `rotate(${greyCircleRotationDegree}deg)`;
  }

  /**
   * Add an additional arc to the gauge if the low or high value is valid.
   * @param arcLow The start position of the arc.
   * @param arcHigh The end position of the arc.
   * @param isVisible A subscribable to determine whether the arc should be visible.
   * @param colourClass An additional CSS class to add colour to the arc.
   * @returns an arc vnode.
   */
  private renderOptionalArc(arcLow: number | Subscribable<number>, arcHigh: number | Subscribable<number>, isVisible: Subscribable<boolean>, colourClass: string): VNode {
    const arcPath = SubscribableUtils.isSubscribable(arcLow) || SubscribableUtils.isSubscribable(arcHigh)
      ? MappedSubject.create(([low, high]) => this.makeArcPath(low, high), SubscribableUtils.toSubscribable(arcLow, true), SubscribableUtils.toSubscribable(arcHigh, true))
      : this.makeArcPath(arcLow, arcHigh);

    return <path
      class={{
        'arc': true,
        [colourClass]: true,
        'hidden': this.props.segmentsAlwaysVisible ? false : isVisible.map((v) => !v),
      }}
      d={arcPath}
    />;
  }

  /**
   * Renders additional arcs.
   * @returns an array of arc vnodes.
   */
  private renderAdditionalArcs(): VNode[] {
    const arcs: VNode[] = [];
    if (this.props.isAmberCautionLowActive !== undefined && this.props.amberCautionSegmentLow !== undefined) {
      arcs.push(this.renderOptionalArc(this.props.scaleMin, this.props.amberCautionSegmentLow, this.props.isAmberCautionLowActive, 'amber-arc'));
    }
    if (this.props.isAmberCautionHighActive !== undefined && this.props.amberCautionSegmentHigh !== undefined) {
      arcs.push(this.renderOptionalArc(this.props.amberCautionSegmentHigh, this.props.scaleMax, this.props.isAmberCautionHighActive, 'amber-arc'));
    }
    if (this.props.isRedWarningLowActive !== undefined && this.props.redWarningSegmentLow !== undefined) {
      arcs.push(this.renderOptionalArc(this.props.scaleMin, this.props.redWarningSegmentLow, this.props.isRedWarningLowActive, 'red-arc'));
    }
    if (this.props.isRedWarningHighActive !== undefined && this.props.redWarningSegmentHigh !== undefined) {
      arcs.push(this.renderOptionalArc(this.props.redWarningSegmentHigh, this.props.scaleMax, this.props.isRedWarningHighActive, 'red-arc'));
    }
    return arcs;
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    if (this.props.side !== undefined) {
      this.gaugeRef.instance.classList.add(this.props.side === 'left' ? 'left-side' : 'right-side');
    }

    this.pointer.sub((v) => {
      this.pointerTransformBuilder.set(0, 0, 1, this.calculateAngleFromValue(v ?? 0), 0.1);
      this.pointerTransform.set(this.pointerTransformBuilder.resolve());
    }, true);
  }

  // TODO Invalid/missing data condition
  // TODO Wire up and draw target value bug (this.props.bugValue)

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class={{ 'dial-gauge': true, ...this.props.class }} ref={this.gaugeRef}>
        <div class="dial-gauge-container">
          <div class="dial-gauge-svg-arc-rotating-mask dial-gauge-rotate-center" ref={this.grayMask}>
            <svg width="250px" height="200px">
              <path d="M 170 90 A 80 80 0 0 0 10 90 L 10 90 z" />
            </svg>
          </div>
          <div class="dial-gauge-svg-arc-static-mask"></div>
        </div>

        <svg class='dial-gauge-svg'>
          <path
            class='arc grey-arc'
            d={this.makeArcPath(this.props.scaleMin, this.props.scaleMax)}
          />
          <path
            class='arc green-arc'
            d={this.makeArcPath(this.props.greenSegmentLow, this.props.greenSegmentHigh)}
          />
          {this.renderAdditionalArcs()}

          {this.renderMarks()}

          <polygon
            ref={this.needleRef}
            class={{
              'needle': true,
              'amber': this.isAmber,
              'red': this.isRed,
            }}
            points={`${ARC_ORIGIN_X},15 ${ARC_ORIGIN_X + 6},${ARC_ORIGIN_Y} ${ARC_ORIGIN_X - 6},${ARC_ORIGIN_Y}`}
          />

          <circle class="needle-base" cx={`${ARC_ORIGIN_X}`} cy={`${ARC_ORIGIN_Y + 0.45}`} r="6.1" />

          <polygon
            class={{
              'pointer': true,
              'hidden': this.isPointerVisible,
            }}
            style={{
              'transform': this.pointerTransform,
            }}
            points={`${ARC_ORIGIN_X},15 ${ARC_ORIGIN_X - 5},6 ${ARC_ORIGIN_X + 5},6`}
          />
        </svg>

        <div class={{
          'value': true,
          'amber': this.isAmber,
          'red': this.isRed,
        }}>
          {this.valueDisp.map((val: string): string => val.padStart(this.props.valueCharacterWidth, '\u00a0'))}
          {this.props.unit ?? ''}
        </div>

        <div class='engine-label label'>{this.props.label}</div>

      </div>
    );
  }
}
