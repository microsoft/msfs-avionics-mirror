import { DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './AttitudeFailureFlag.css';

/** The properties for the attitude failure component. */
interface AttitudeFailureFlagProps {
  /** whether to show the box or not. */
  show: Subscribable<boolean>;
}

/** The Attitude failure flag component. */
export class AttitudeFailureFlag extends DisplayComponent<AttitudeFailureFlagProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{ 'att-fail-overlay': true, 'hidden': this.props.show.map(v => !v) }}>
        ATT FAIL
      </div>
    );
  }
}
