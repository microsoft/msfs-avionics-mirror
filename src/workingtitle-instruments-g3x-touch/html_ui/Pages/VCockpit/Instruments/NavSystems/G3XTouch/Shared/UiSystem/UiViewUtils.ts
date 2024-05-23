import { UiPositionedPopupOpenOptions } from './UiViewStack';

/**
 * A utility class for working with UI views.
 */
export class UiViewUtils {
  /**
   * Sets the parameters of a positioned popup's opening options to align the popup with an element rendered in the
   * same view stack container.
   * @param options The popup opening options for which to set parameters.
   * @param container The root element of the popup's view stack container.
   * @param target The target element to which to align the popup.
   * @param popupReference The reference corner of the popup which will be aligned to the target element. Defaults to
   * `'top-left'`.
   * @param alignTo The edges of the target element to which to align the popup. Defaults to `'top-left'`.
   * @param xOffset The horizontal offset to apply to the popup's position after alignment, in pixels.
   * @param yOffset The vertical offset to apply to the popup's position after alignment, in pixels.
   * @returns The provided popup opening options, after its parameters have been set to align the popup in the
   * specified manner.
   */
  public static alignPositionedPopupToElement(
    options: UiPositionedPopupOpenOptions,
    container: HTMLElement,
    target: HTMLElement,
    popupReference: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left',
    alignTo: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-left',
    xOffset = 0,
    yOffset = 0
  ): UiPositionedPopupOpenOptions {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    let referenceX: number;
    let referenceXSign: 1 | -1;
    let referenceY: number;
    let referenceYSign: 1 | -1;

    let xProp: 'left' | 'right';
    let yProp: 'top' | 'bottom';

    switch (popupReference) {
      case 'top-right':
        referenceX = containerRect.right;
        referenceXSign = -1;
        referenceY = containerRect.top;
        referenceYSign = 1;
        xProp = 'right';
        yProp = 'top';
        break;
      case 'bottom-left':
        referenceX = containerRect.left;
        referenceXSign = 1;
        referenceY = containerRect.bottom;
        referenceYSign = -1;
        xProp = 'left';
        yProp = 'bottom';
        break;
      case 'bottom-right':
        referenceX = containerRect.right;
        referenceXSign = -1;
        referenceY = containerRect.bottom;
        referenceYSign = -1;
        xProp = 'right';
        yProp = 'bottom';
        break;
      default: // top-left
        referenceX = containerRect.left;
        referenceXSign = 1;
        referenceY = containerRect.top;
        referenceYSign = 1;
        xProp = 'left';
        yProp = 'top';
    }

    let alignX: number;
    let alignY: number;

    switch (alignTo) {
      case 'top-right':
        alignX = targetRect.right;
        alignY = targetRect.top;
        break;
      case 'bottom-right':
        alignX = targetRect.right;
        alignY = targetRect.bottom;
        break;
      case 'bottom-left':
        alignX = targetRect.left;
        alignY = targetRect.bottom;
        break;
      default: // top-left
        alignX = targetRect.left;
        alignY = targetRect.top;
    }

    const x = containerRect.width > 0 ? (alignX - referenceX + xOffset) * referenceXSign / containerRect.width * 100 : 0;
    const y = containerRect.height > 0 ? (alignY - referenceY + yOffset) * referenceYSign / containerRect.height * 100 : 0;

    if (xProp === 'left') {
      options.left = x;
      options.right = undefined;
    } else {
      options.right = x;
      options.left = undefined;
    }

    if (yProp === 'top') {
      options.top = y;
      options.bottom = undefined;
    } else {
      options.bottom = y;
      options.top = undefined;
    }

    return options;
  }
}