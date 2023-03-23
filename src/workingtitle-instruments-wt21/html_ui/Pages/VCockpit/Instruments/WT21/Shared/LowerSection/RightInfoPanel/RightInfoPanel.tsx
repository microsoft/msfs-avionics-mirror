import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { PfdOrMfd } from '../../Map/MapUserSettings';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { MinimumsDisplay } from './MinimumsDisplay';
import { NextradInfo } from './NextradInfo';
import { TerrWxInfo } from './TerrWxInfo';
import { TfcInfo } from './TfcInfo';

import './RightInfoPanel.css';

/** @inheritdoc */
interface RightInfoPanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The TCAS instance. */
  tcas: WT21TCAS;

  /** Whether the component is on the PFD or the MFD. */
  pfdOrMfd: PfdOrMfd;
}

/** The RightInfoPanel component. */
export class RightInfoPanel extends DisplayComponent<RightInfoPanelProps> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="right-info-panel">
        <TfcInfo bus={this.props.bus} tcas={this.props.tcas} pfdOrMfd={this.props.pfdOrMfd} />
        <TerrWxInfo bus={this.props.bus} pfdOrMfd={this.props.pfdOrMfd} />
        {this.props.pfdOrMfd === 'MFD' ? <NextradInfo bus={this.props.bus} /> : null}
        {this.props.pfdOrMfd === 'PFD' ? <MinimumsDisplay bus={this.props.bus} /> : null}
      </div>
    );
  }
}