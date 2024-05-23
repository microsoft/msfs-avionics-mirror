import { Subscribable, DisplayComponent, FSComponent, VNode, XMLHostedLogicGauge, Subject } from '@microsoft/msfs-sdk';
import { G3XPeakingGaugeProps } from '../../../../G3XGaugesConfigFactory/Gauges/G3XPeakingGaugeProps';

/** Properties for a pointer for a single-value gauge. */
export interface G3XHorizontalBarGaugePointerProps {
  /** A subject for the value. */
  valueSubject: Subscribable<number>;
  /** display peak in default or in peak style */
  showAsPeak: boolean;
  /** A scale Y for pointer. */
  index: 0 | 1;
  /** A label for value pointer. */
  label?: string;
}

/** A single-value pointer. */
export class G3XHorizontalPointer extends DisplayComponent<Partial<G3XPeakingGaugeProps> & XMLHostedLogicGauge & G3XHorizontalBarGaugePointerProps> {

  protected readonly pointerRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly fillSubject = Subject.create<string>('none');
  private readonly translateSubject = Subject.create<number>(0);

  private readonly valueSubscription = this.props.valueSubject.sub((value: number) => {
    this.updatePtr(value);
  }, true);

  private minimum = 0;
  private maximum = 0;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.translateSubject.sub((value) => {
      this.updatePosition(value);
    });

    if (this.props.minimum !== undefined) {
      this.minimum = this.props.logicHost?.addLogicAsNumber(this.props.minimum, (min: number) => {
        this.minimum = min;
        this.updatePtr(this.props.valueSubject.get());
      }, 2);
    }

    if (this.props.maximum !== undefined) {
      this.maximum = this.props.logicHost?.addLogicAsNumber(this.props.maximum, (max: number) => {
        this.maximum = max;
        this.updatePtr(this.props.valueSubject.get());
      }, 2);
    }

    if (this.props.redBlink) {
      this.props.logicHost?.addLogicAsNumber(this.props.redBlink, (value: number) => {
        this.setAlertState(value);
      }, 0);
    }
  }

  /**
   * Update the value of the pointer.
   * @param value The new value to set.
   */
  private updatePtr(value: number): void {
    value = Utils.Clamp(value, this.minimum, this.maximum);
    const translation = 100 * (value - this.minimum) / (this.maximum - this.minimum);
    this.translateSubject.set(translation);
  }

  /**
   * Handle changes in the alert state.
   * @param alerting True if alerting.
   */
  private setAlertState(alerting: number): void {
    if (alerting !== 0) {
      this.fillSubject.set('var(--g3x-color-red)');
    } else {
      this.fillSubject.set('var(--g3x-color-white)');
    }
  }

  /**
   * Update the position of the pointer.
   * @param value The new position.
   */
  protected updatePosition(value: number): void {
    this.pointerRef.instance.style.transform = `translate3d(calc(${value}% - 9px), 0px, 0px)`;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='gauge_pointer'
        ref={this.pointerRef}
      >
        <svg
          viewBox={'0 0 28 28'}
          width={'18px'}
          height={'18px'}
          fill={this.fillSubject}
        >
          {this.props.showAsPeak ? (
            <path
              d='M0 2 L3 0 L28 12 L28 16 L3 28 L0 26 L0 2 M4 6 L4 6 L4 22 L22 14'
              fill-rule='nonzero'
              fill='var(--g3x-color-cyan)'
              transform={`rotate(${this.props.index == 0 ? 90 : -90}) translate(${this.props.index === 0 ? 0 : -28}, ${this.props.index === 0 ? -28 : 0})`}
              stroke='var(--g3x-color-black)'
              stroke-width='0.25'
            />
          ) : (
            <>
              <path
                d='M0 2 L3 0 L28 12 L28 16 L3 28 L0 26 L0 2'
                fill='var(--g3x-color-white)'
                stroke='var(--g3x-color-black)'
                stroke-width='0.25'
                transform={`rotate(${this.props.index == 0 ? 90 : -90}) translate(${this.props.index === 0 ? 0 : -28}, ${this.props.index === 0 ? -28 : 0})`}
              />
              <text
                text-anchor='middle'
                fill='var(--g3x-color-black)'
                x='14px'
                y={this.props.index === 0 ? '17px' : '23px'}
                font-size='18px'
              >
                {this.props.label}
              </text>
            </>
          )}
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.valueSubscription.destroy();
  }
}