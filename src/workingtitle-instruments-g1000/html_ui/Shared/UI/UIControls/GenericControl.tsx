
import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { UiControl, UiControlProps } from '../../../Shared/UI/UiControl';

/** A silly generic control */
export class GenericControl extends UiControl<UiControlProps> {

  /** @inheritdoc */
  public renderControl(): VNode {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}