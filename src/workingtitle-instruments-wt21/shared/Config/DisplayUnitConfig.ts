export enum DisplayUnitLayout {
  /** Traditional layout, without softkeys */
  Traditional = 'Traditional',

  /** Layout with 4 softkeys on each side */
  Softkeys = 'Softkeys',
}

/**
 * WT21 Display Unit configuration
 */
export interface DisplayUnitConfigInterface {
  /** The layout of the display unit */
  displayUnitLayout: DisplayUnitLayout;
}

/**
 * WT21 Display Unit configuration
 */
export class DisplayUnitConfig implements DisplayUnitConfigInterface {
  public static readonly DEFAULT: DisplayUnitConfigInterface = {
    displayUnitLayout: DisplayUnitLayout.Traditional,
  };

  public displayUnitLayout = DisplayUnitLayout.Traditional;

  /**
   * Constructs a DisplayUnitConfig from an element
   * @param element the XML element
   */
  constructor(element: Element) {
    if (element.tagName != 'DisplayUnitConfig') {
      throw new Error(`Invalid DisplayUnitConfig definition: expected tag name 'DisplayUnitConfig' but was '${element.tagName}'`);
    }

    const displayUnitLayoutTags = element.querySelectorAll(':scope > Layout');

    if (displayUnitLayoutTags.length > 0) {
      if (displayUnitLayoutTags.length > 1) {
        console.warn('Invalid DisplayUnitConfig definition: Multiple \'Layout\' tags inside \'DisplayUnitConfig\'. Only the first one will be taken into account');
      }

      const layout = displayUnitLayoutTags.item(0).textContent;

      if (layout === null) {
        throw new Error('Invalid Layout definition: content is mandatory');
      }

      if (!(layout in DisplayUnitLayout)) {
        throw new Error('Invalid Layout definition: content must be a valid DisplayUnitLayout value');
      }

      this.displayUnitLayout = (DisplayUnitLayout as Record<typeof layout, DisplayUnitLayout>)[layout];
    }
  }
}