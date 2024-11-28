import { InstrumentConfig } from '@microsoft/msfs-wt21-shared';

/** Artificial horizon style */
export type ArtificialHorizonStyle = 'Cropped' | 'Full';

/** An instrument configuration, specifically for the PFD */
export class PfdInstrumentConfig extends InstrumentConfig {
  public readonly artificialHorizonStyle: ArtificialHorizonStyle;

  /** @inheritdoc */
  constructor(instrument: BaseInstrument) {
    super(instrument);

    const horizonStyleTag = instrument.instrumentXmlConfig.querySelector(':scope>ArtificialHorizonStyle');
    this.artificialHorizonStyle = horizonStyleTag ? this.parseArtificialHorizonConfig(horizonStyleTag) : 'Full';
  }

  /**
   * Parses an artificial horizon configuration object
   * @param element The configuration object element
   * @returns The artificial horizon style
   */
  private parseArtificialHorizonConfig(element: Element): ArtificialHorizonStyle {
    const style = element.textContent;

    if (style && PfdInstrumentConfig.isOfTypeArtificialHorizonStyle(style)) {
      return style;
    } else {
      console.warn('Invalid ArtificialHorizonStyle. Value must be either "Cropped" or "Full". Got:', style, 'Defaulting to Full');
      return 'Full';
    }
  }

  /**
   * Checks if a string is a valid artificial horizon style
   * @param text The string to check
   * @returns If a string is an artificial horizon style
   */
  private static isOfTypeArtificialHorizonStyle(text: string): text is ArtificialHorizonStyle {
    return ['Cropped', 'Full'].includes(text);
  }
}
