import { VNode } from '@microsoft/msfs-sdk';

import { Epic2AvionicsPlugin, Epic2PluginBinder } from '@microsoft/msfs-epic2-shared';

/** A plugin binder for Epic2 PFD plugins. */
export type Epic2PfdPluginBinder = Epic2PluginBinder

/**
 * A Epic2 PFD plugin.
 */
export abstract class Epic2PfdAvionicsPlugin extends Epic2AvionicsPlugin<Epic2PfdPluginBinder> {
  /**
   * Allows rendering components to the EIS container.
   * @returns The rendered EIS vnode.
   */
  renderEIS?(): VNode | null;
}
