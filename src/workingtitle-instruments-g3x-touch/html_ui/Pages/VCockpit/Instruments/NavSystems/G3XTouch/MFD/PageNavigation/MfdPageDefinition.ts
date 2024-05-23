import { NodeReference, VNode } from '@microsoft/msfs-sdk';

import { UiService } from '../../Shared/UiSystem/UiService';

/**
 * A function which renders an MFD main page.
 */
export type MfdPageFactory = (uiService: UiService, containerRef: NodeReference<HTMLElement>) => VNode;

/**
 * A definition describing an MFD main page.
 */
export type MfdPageDefinition = {
  /** The key of the page. */
  key: string;

  /** The label of the page that appears on the page navigation bar. */
  label: string;

  /** The file path to the image asset for the icon displayed in the page's associated button in the Select Page dialog. */
  selectIconSrc: string;

  /** The label displayed in the page's associated button in the Select Page dialog. */
  selectLabel: string;

  /**
   * A numeric value which determines the order in which the page's navigation bar label appears relative to those of
   * other pages. A lower value causes the label to appear before (to the left of) other labels.
   */
  order: number;

  /** A function which renders the page. If not defined, then the page will be disabled. */
  factory?: MfdPageFactory;
};