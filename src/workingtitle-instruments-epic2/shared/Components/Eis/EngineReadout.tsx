import { FSComponent, Subscribable, SubscribableUtils, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { AbstractEngineIndicator, AbstractEngineIndicatorProps } from './AbstractEngineIndicator';

/** Props for an engine readout. */
export interface EngineReadoutProps extends AbstractEngineIndicatorProps {
  /** The title to display on the left. */
  title?: string,
  /** The unit to display on the right. */
  unit?: string,
  /** Whether it's in the right column, optional. */
  inRightColumn?: boolean,
  /** Is the amber caution condition active. */
  isAmberCautionActive?: Subscribable<boolean>,
  /** Is the red warning condition active. */
  isRedWarningActive?: Subscribable<boolean>,
  /** CSS class(es) to add to the root of the readout component. */
  class?: ToggleableClassNameRecord;
}

/** An engine readout. */
export class EngineReadout extends AbstractEngineIndicator<EngineReadoutProps> {

  /** Whether the data is invalid (display amber dashes). */
  private readonly isInvalid = this.props.value.map((v: number | null): boolean => v === null);

  private readonly isAmberCautionActive = SubscribableUtils.toSubscribable(this.props.isAmberCautionActive ?? false, true);
  private readonly isRedWarningActive = SubscribableUtils.toSubscribable(this.props.isRedWarningActive ?? false, true);

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      ...this.props.class,
      'engine-readout': true,
      'engine-readout-invalid': this.isInvalid,
      'engine-readout-amber': this.isAmberCautionActive,
      'engine-readout-red': this.isRedWarningActive,
      'right-column': this.props.inRightColumn === true,
    }}>
      { this.props.title !== undefined ? <div class='engine-label label'>{this.props.title}</div> : null }
      <div class='engine-readout-value'>{this.valueDisp}</div>
      { this.props.unit !== undefined ? <div class='engine-label unit'>{this.props.unit}</div> : null }
    </div>;
  }

}
