import { registerPlugin } from '@microsoft/msfs-sdk';

import { WT21AvionicsPlugin } from '@microsoft/msfs-wt21-shared';

import { CJ4FilePaths } from '../Shared/CJ4FilePaths';
import { CJ4Fadec } from '../Shared/Fadec/CJ4Fadec';

import './CJ4PfdPlugin.css';

/**
 * CJ4 PFD plugin
 */
export class CJ4PfdPlugin extends WT21AvionicsPlugin {
  /** @inheritDoc */
  public onInstalled(): void {
    this.loadCss(`${CJ4FilePaths.PLUGINS_PATH}/CJ4PfdPlugins.css`);
    new CJ4Fadec(this.binder.bus);
  }
}

registerPlugin(CJ4PfdPlugin);
