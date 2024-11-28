import { AvionicsPlugin, FSComponent, registerPlugin, VNode } from '@microsoft/msfs-sdk';

import { G1000PfdAvionicsPlugin, G1000PfdPluginBinder } from '@microsoft/msfs-wtg1000';

import { Sr22tFilePaths } from '../../Shared';
import { Sr22tGpsAboveGroundLevelAltitude } from './Sr22tGpsAboveGroundLevelAltitude';

import './Sr22tGpsAboveGroundLevelAltitude.css';

/**
 * A plugin for the Gps Above Ground Level Altitude indicator.
 */
export class Sr22tGpsAboveGroundLevelAltitudePlugin extends AvionicsPlugin<G1000PfdPluginBinder> implements G1000PfdAvionicsPlugin {
  /** @inheritDoc */
  public renderToPfdInstruments(): VNode | null {
    return (<Sr22tGpsAboveGroundLevelAltitude bus={this.binder.bus} />);
  }

  /** @inheritDoc */
  public onInstalled(): void {
    this.loadCss(`${Sr22tFilePaths.PLUGINS_PATH}/SR22TPfdPlugins.css`);
  }
}

registerPlugin(Sr22tGpsAboveGroundLevelAltitudePlugin);
