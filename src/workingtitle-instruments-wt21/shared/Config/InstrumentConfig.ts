import { DisplayUnitConfig } from './DisplayUnitConfig';

export enum WT21InstrumentType {
  Pfd = 'PFD',
  Mfd = 'MFD',
  Fmc = 'FMC',
}

/**
 * A configuration object for an individual instrument
 */
export class InstrumentConfig {
  /** The type of instrument */
  public readonly instrumentType: WT21InstrumentType;
  /** The instrument index, localized for the specific instrument type */
  public readonly instrumentIndex: number;

  /** The display unit config, undefined if the instrument is an FMC */
  public readonly displayUnitConfig: DisplayUnitConfig;

  /** @inheritdoc */
  constructor(instrument: BaseInstrument) {
    this.instrumentType = this.getInstrumentType(instrument.instrumentIdentifier);
    this.instrumentIndex = instrument.instrumentIndex;

    const displayUnitConfigElement = instrument.instrumentXmlConfig.querySelector(':scope>DisplayUnitConfig');
    this.displayUnitConfig = displayUnitConfigElement ? new DisplayUnitConfig(displayUnitConfigElement) : DisplayUnitConfig.DEFAULT;
  }

  /**
   * Gets the instrument type from the instrument identifier
   * @param instrumentIdentifier The instrument identifier string
   * @returns The instrument type as an enum
   */
  private getInstrumentType(instrumentIdentifier: string): WT21InstrumentType {
    if (instrumentIdentifier.includes('PFD')) {
      return WT21InstrumentType.Pfd;
    } else if (instrumentIdentifier.includes('MFD')) {
      return WT21InstrumentType.Mfd;
    } else if (instrumentIdentifier.includes('FMC')) {
      return WT21InstrumentType.Fmc;
    } else {
      console.error(`Instrument is not identified as either a PFD, MFD or FMC. Setting ${instrumentIdentifier} instrument to PFD`);
      return WT21InstrumentType.Pfd;
    }
  }
}
