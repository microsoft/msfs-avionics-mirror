import { VNode } from '@microsoft/msfs-sdk';

import { G1000AvionicsPlugin, G1000PfdPluginBinder } from './G1000Plugin';

/**
 * A G1000 PFD plugin.
 */
export abstract class G1000PfdAvionicsPlugin extends G1000AvionicsPlugin<G1000PfdPluginBinder> {

  /** Renders components to the PFD instrument container.
   * @returns The rendered vnode
   */
  public renderToPfdInstruments?(): VNode | null {
    return null;
  }
}
