import { ComponentProps, DisplayComponent, ReadonlyFloat64Array } from '@microsoft/msfs-sdk';

import { UiService } from '../../../../Shared/UiSystem/UiService';
import { PfdInsetSizeMode } from './PfdInsetTypes';

/**
 * Component props for PfdInset.
 */
export interface PfdInsetProps extends ComponentProps {
  /** The side to which the inset belongs. */
  side: 'left' | 'right';

  /** The UI service instance. */
  uiService: UiService;
}

/**
 * A PFD inset.
 */
export interface PfdInset<P extends PfdInsetProps = PfdInsetProps> extends DisplayComponent<P> {
  /**
   * Responds to when this inset is opened.
   * @param sizeMode The new size mode of this view's container.
   * @param dimensions The new dimensions of this view's container, as `[width, height]` in pixels.
   */
  onOpen(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Responds to when this inset is closed.
   */
  onClose(): void;

  /**
   * Responds when this inset's container is resized while it is open.
   * @param sizeMode The new size mode of this inset's container.
   * @param dimensions The new dimensions of this inset's container, as `[width, height]` in pixels.
   */
  onResize(sizeMode: PfdInsetSizeMode, dimensions: ReadonlyFloat64Array): void;

  /**
   * Called every update cycle.
   * @param time The current real (operating system) time, as a Javascript timestamp.
   */
  onUpdate(time: number): void;
}