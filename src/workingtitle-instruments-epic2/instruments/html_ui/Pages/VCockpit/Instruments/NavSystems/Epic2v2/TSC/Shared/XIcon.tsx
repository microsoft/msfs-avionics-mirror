import { ComponentProps, DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import './XIcon.css';

/** The X Icon props. */
interface XIconProps extends ComponentProps {
  /** component ref */
  ref: NodeReference<HTMLElement>;
}
/** XIcon Display Component */
export class XIcon extends DisplayComponent<XIconProps> {

  /** @inheritdoc */
  public render(): VNode | null {
    return <span class="active-input-clear-icon" ref={this.props.ref}><div class="active-input-cross"></div></span>;
  }
}
