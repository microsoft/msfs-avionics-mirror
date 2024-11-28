import { VNode } from '@microsoft/msfs-sdk';

import { DisplayPaneIndex } from './DisplayPaneTypes';

/**
 * Creates display pane views.
 */
export class DisplayPaneViewFactory {
  private readonly registeredViews: Map<string, (index: DisplayPaneIndex) => VNode> = new Map();

  /**
   * Registers a display pane view under a specific key. Once a view is registered, new instances can be created
   * using the key under which it was registered via the `createViewNode()` method. Registering a view under an
   * existing key will replace the old view registered under that key.
   * @param key The key of the display pane view to register.
   * @param vnodeFn A function which creates new instances of the display pane view to register as VNodes.
   */
  public registerView(key: string, vnodeFn: (index: DisplayPaneIndex) => VNode): void {
    this.registeredViews.set(key, vnodeFn);
  }

  /**
   * Creates a new display pane view instance as a VNode.
   * @param key The key of the display pane view to create.
   * @param index The index of the view's parent pane.
   * @returns A new display pane view instance as a VNode, or `null` if a view could not be created for the specified
   * key.
   */
  public createViewNode(key: string, index: DisplayPaneIndex): VNode | null {
    const vnodeFn = this.registeredViews.get(key);
    if (vnodeFn !== undefined) {
      return vnodeFn(index);
    } else {
      console.warn(`Could not find a registered display pane view of type ${key.toString()}!`);
      return null;
    }
  }
}
