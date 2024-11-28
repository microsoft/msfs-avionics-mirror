import { VNode } from '@microsoft/msfs-sdk';

import { UiService } from '../../../../Shared/UiSystem/UiService';

/**
 * A function which renders a PFD inset.
 */
export type PfdInsetFactory = (side: 'left' | 'right', uiService: UiService) => VNode;

/**
 * A definition describing a PFD inset.
 */
export type PfdInsetDefinition = {
  /** The key of the inset. */
  key: string;

  /** The label displayed in the inset's associated button in the PFD inset selection list. */
  selectLabel: string;

  /**
   * A numeric value which determines the order in which the inset appears in the PFD inset selection list. A lower
   * value causes the inset to appear before other insets.
   */
  order: number;

  /** A function which renders the inset. If not defined, then the inset will be disabled. */
  factory?: PfdInsetFactory;
};