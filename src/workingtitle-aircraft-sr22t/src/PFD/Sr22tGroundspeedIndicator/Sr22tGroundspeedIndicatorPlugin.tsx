import { AvionicsPlugin, FSComponent, registerPlugin, VNode } from '@microsoft/msfs-sdk';

import { G1000PfdAvionicsPlugin, G1000PfdPluginBinder } from '@microsoft/msfs-wtg1000';

import { Sr22tFilePaths } from '../../Shared';
import { Sr22tGroundspeedIndicator } from './Sr22tGroundspeedIndicator';

import './Sr22tGroundspeedIndicator.css';

/**
 * A plugin for the PFD groundspeed indicator
 */
export class Sr22tGroundspeedIndicatorPlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {

  /** @inheritDoc */
  public renderToPfdInstruments(): VNode | null {
    return (<Sr22tGroundspeedIndicator bus={this.binder.bus} />);
  }

  /** @inheritDoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TPfdPlugins.css`);
  }
}

registerPlugin(Sr22tGroundspeedIndicatorPlugin);
