import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './DividerLine.css';

/** The Divider Line props. */
interface DividerLineProps extends ComponentProps {
  /** Active Input Class passed in from parent */
  class: string;
}
/** The Divider Line Component. */
export class DividerLine extends DisplayComponent<DividerLineProps> {

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      'divider-line': true,
      [this.props.class]: true
    }}></div>;
  }
}
