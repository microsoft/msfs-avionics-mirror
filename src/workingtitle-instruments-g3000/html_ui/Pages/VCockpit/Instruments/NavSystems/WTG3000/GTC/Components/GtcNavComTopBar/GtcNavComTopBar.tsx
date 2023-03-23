import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GtcService } from '../../GtcService/GtcService';

import './GtcNavComTopBar.css';

/** The properties for the GtcNavComTopBar component. */
interface GtcNavComTopBarProps extends ComponentProps {
  /** An instance of the event bus. */
  gtcService: GtcService;
}

/** The GtcNavComTopBar component. */
export class GtcNavComTopBar extends DisplayComponent<GtcNavComTopBarProps> {

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gtc-nav-com-top-bar">
        {this.props.children}
      </div>
    );
  }
}