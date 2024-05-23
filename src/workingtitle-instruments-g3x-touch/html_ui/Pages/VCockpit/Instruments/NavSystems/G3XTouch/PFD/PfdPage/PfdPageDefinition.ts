import { NodeReference, VNode } from '@microsoft/msfs-sdk';

import { UiService } from '../../Shared/UiSystem/UiService';
import { UiViewLifecyclePolicy } from '../../Shared/UiSystem/UiViewTypes';

/**
 * A function which renders a PFD page.
 */
export type PfdPageFactory = (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode;

/**
 * A definition describing a PFD page.
 */
export type PfdPageDefinition = {
  /** The key of the page. */
  key: string;

  /**
   * A numeric value which determines the order in which the page appears in the MFD Display Setup menu's Split Screen
   * Page selection list. A lower value causes the page to appear before other pages.
   */
  order: number;

  /** The label displayed for the page in the MFD Display Setup menu's Split Screen Page selection list. */
  selectLabel: string;

  /** The UI view lifecycle policy to apply to the page. Defaults to `UiViewLifecyclePolicy.Static`. */
  lifecyclePolicy?: UiViewLifecyclePolicy;

  /** A function which renders the page. If not defined, then the page will be disabled. */
  factory?: PfdPageFactory;
};
