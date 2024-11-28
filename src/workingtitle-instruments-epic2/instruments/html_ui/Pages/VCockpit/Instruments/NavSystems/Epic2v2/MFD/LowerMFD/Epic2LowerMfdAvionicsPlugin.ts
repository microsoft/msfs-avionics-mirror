import { VNode } from '@microsoft/msfs-sdk';

import { Epic2AvionicsPlugin, Epic2PluginBinder } from '@microsoft/msfs-epic2-shared';

/** A plugin binder for Epic2 MFD plugins. */
export type Epic2LowerMfdPluginBinder = Epic2PluginBinder;

/**
 * A Epic2 MFD plugin.
 */
export abstract class Epic2LowerMfdAvionicsPlugin extends Epic2AvionicsPlugin<Epic2LowerMfdPluginBinder> {
  /**
   * Allows rendering of components to the (right) section of the lower MFD.
   * @returns The rendered vnode.
   */
  renderSection?(): VNode | null;
}
