import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { CAS, CASProps } from './CAS';

import './CASOverlay.css';

/** The CAS Overlay component. */
export class CASOverlay extends DisplayComponent<CASProps> {


  /** @inheritdoc */
  public onAfterRender(): void {
    //TODO
  }

  //DISABLED IN CSS UNTIL BATT ON/AVIONICS ON MODES ARE SUPPORTED
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="cas-overlay-container">
        <CAS bus={this.props.bus} logicHandler={this.props.logicHandler} instrument={this.props.instrument} />
      </div>
    );
  }
}