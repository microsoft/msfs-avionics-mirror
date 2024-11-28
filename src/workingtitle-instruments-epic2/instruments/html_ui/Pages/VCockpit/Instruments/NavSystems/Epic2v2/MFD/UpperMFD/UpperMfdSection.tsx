import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

/** The UpperMfdSection component. */
export class UpperMfdSection extends DisplayComponent<ComponentProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="upper-mfd-section">
        {this.props.children}
      </div>
    );
  }
}