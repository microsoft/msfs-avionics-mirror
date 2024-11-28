import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { FrequencieItemInformation } from './FrequencieItemInformation';

/**
 * A UI control that display a Menu items within the plan table.
 */
export class WaypointFrequencieItem extends GNSUiControl<WaypointFrequencieItemProps> {
  private readonly name = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  protected onFocused(): void {
    this.name.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.name.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='aux-entry'>
        <div class='aux-menuItem-name'><span ref={this.name}>{this.props.data.name}</span></div>
      </div>
    );
  }
}

/** Props on the AuxMenuItem component. */
export interface WaypointFrequencieItemProps extends GNSUiControlProps {
  /** The leg data associated with this component. */
  data: FrequencieItemInformation;
}
