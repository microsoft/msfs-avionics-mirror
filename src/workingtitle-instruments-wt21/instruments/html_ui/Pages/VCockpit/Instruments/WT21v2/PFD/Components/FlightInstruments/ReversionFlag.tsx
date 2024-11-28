import { FSComponent, ComponentProps, DisplayComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './ReversionFlag.css';

/** Props for a {@link ReversionFlag} component */
export interface ReversionFlagProps extends ComponentProps {
  /** The label to display */
  label: Subscribable<string>;
  /** Whether to hide the reversion flag */
  hidden: Subscribable<boolean>;
}

/** A generic WT21 reversion flag */
export class ReversionFlag extends DisplayComponent<ReversionFlagProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{'hidden': this.props.hidden, 'reversion-box': true}}>
        {this.props.label}
      </div>
    );
  }
}
