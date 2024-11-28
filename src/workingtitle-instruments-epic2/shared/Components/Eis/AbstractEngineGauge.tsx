import { Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';
import { AbstractEngineIndicator, AbstractEngineIndicatorProps } from './AbstractEngineIndicator';

/** Props for an abstract engine gauge. */
export interface AbstractEngineGaugeProps extends AbstractEngineIndicatorProps {
  /** The label to display below the gauge. */
  label?: string,
  /** Which side the gauge sits on. */
  side?: 'left' | 'right';
  /** The minimum scale segment value. */
  scaleMin: number,
  /** The maximum scale segment value. */
  scaleMax: number,
  /** The lower green segment value. */
  greenSegmentLow: number,
  /** The upper green segment value. */
  greenSegmentHigh: number,
  /** The lower amber mark value, optional. */
  amberMarkLow?: number,
  /** The upper amber mark value, optional. */
  amberMarkHigh?: number | Subscribable<number>,
  /** The low amber caution segment value, optional. */
  amberCautionSegmentLow?: number,
  /** Whether the low amber caution segment is active, optional. */
  isAmberCautionLowActive?: Subscribable<boolean>,
  /** The high amber caution segment value, optional. */
  amberCautionSegmentHigh?: number | Subscribable<number>,
  /** Whether the high amber caution segment is active, optional. */
  isAmberCautionHighActive?: Subscribable<boolean>,
  /** The lower red mark value, optional. */
  redMarkLow?: number,
  /** The upper red mark value, optional. */
  redMarkHigh?: number | Subscribable<number>,
  /** The low red warning segment value, optional. */
  redWarningSegmentLow?: number,
  /** Whether the low red warning segment is active, optional. */
  isRedWarningLowActive?: Subscribable<boolean>,
  /** The high red warning segment value, optional. */
  redWarningSegmentHigh?: number | Subscribable<number>,
  /** Whether the high red warning segment is active, optional. */
  isRedWarningHighActive?: Subscribable<boolean>,
  /** The value of the white triangle pointer, in the same units as value. */
  pointer?: Subscribable<number | null> | number | null,
}

/** An abstract engine gauge. */
export abstract class AbstractEngineGauge<P extends AbstractEngineGaugeProps = AbstractEngineGaugeProps> extends AbstractEngineIndicator<P> {

  /**
   * Renders the static markings
   * @returns SVG lines.
   */
  protected abstract renderMarks(): VNode[];

  /** Sub handler for props.value. */
  protected abstract onValueChanged(value: number | null): void;

  protected readonly pointer = SubscribableUtils.toSubscribable(this.props.pointer ?? null, true) as Subscribable<number | null>;

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.value.sub(this.onValueChanged.bind(this), true);
  }

}
