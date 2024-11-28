import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { InstrumentConfig, WT21InstrumentType } from '../../Config';
import { WT21ControlEvents } from '../../WT21ControlEvents';

import './FormatInfo.css';

/**
 * Props for {@link FormatSwitch}
 */
export interface FormatInfoProps extends ComponentProps {
  /** The event bus */
  bus: EventBus,

  /** The instrument config object */
  instrumentConfig: InstrumentConfig,

  /** The format to control */
  format: 'upper' | 'lower',

  /** The orientation of the label */
  orientation: 'left' | 'right',
}

/**
 * FORMAT switch
 */
export class FormatSwitch extends DisplayComponent<FormatInfoProps> {
  private static readonly ARROW_ORIENTATIONS: Record<'left' | 'right', string> = {
    left: 'M 7, 2 l -4, 5 l 4, 5',
    right: 'M 3, 2 l 4, 5 l -4, 5',
  };

  private readonly formatChangeSub = ConsumerSubject.create(this.props.bus.getSubscriber<WT21ControlEvents>().on(`softkeyFormatChangeActive_${this.props.instrumentConfig.instrumentIndex as 1 | 2}`), false);

  private readonly formatText = this.props.instrumentConfig.instrumentType === WT21InstrumentType.Pfd ? 'FORMAT' : (this.props.format === 'upper' ? 'UPPER FORMAT' : 'LOWER FORMAT');

  private readonly showLabel: Subscribable<boolean> = this.props.instrumentConfig.instrumentType === WT21InstrumentType.Pfd
    ? Subject.create(true)
    : this.formatChangeSub;

  private readonly formatLabel = this.showLabel.map((show) => show ? this.formatText : '\u00a0');

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class={{ 'info-format-switch': true, 'info-format-switch-right': this.props.orientation === 'right' }}>
        <svg class="info-format-switch-switch-arrow" viewBox="0 0 10 14">
          <path d={FormatSwitch.ARROW_ORIENTATIONS[this.props.orientation]} stroke-width={1.5} stroke="white" />
        </svg>

        <span class="info-format-switch-label">{this.formatLabel}</span>
      </div>
    );
  }
}
