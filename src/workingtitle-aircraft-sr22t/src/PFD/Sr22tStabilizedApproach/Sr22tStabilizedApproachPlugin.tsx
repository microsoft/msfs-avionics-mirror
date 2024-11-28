import { FSComponent, AvionicsPlugin, VNode, registerPlugin } from '@microsoft/msfs-sdk';
import { G1000PfdPluginBinder, G1000PfdAvionicsPlugin } from '@microsoft/msfs-wtg1000';
import { Sr22tStabilizedApproachComponent } from './Sr22tStabilizedApproachComponent';
import { Sr22tFilePaths } from '../../Shared';

import './Sr22tStabilizedApproachComponent.css';

/**
 * A plugin which configures the SR22T's Stabilized Approach logic.
 */
export class Sr22tStabilizedApproachPlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {
  /** @inheritDoc */
  public renderToPfdInstruments(): VNode {
    return (
      <>
        <Sr22tStabilizedApproachComponent bus={this.binder.bus} fms={this.binder.fms} navIndicatorController={this.binder.navIndicatorController} />
      </>
    );
  }

  /** @inheritDoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TPfdPlugins.css`);
  }
}

registerPlugin(Sr22tStabilizedApproachPlugin);
