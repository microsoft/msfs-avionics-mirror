import { FsInstrument } from '@microsoft/msfs-sdk';

import { DisplayUnitConfig, DisplayUnitConfigInterface } from './Config/DisplayUnitConfig';

import './WT21_Common.css';

/**
 * WT21 display unit type
 */
export enum WT21DisplayUnitType {
  Pfd,
  Mfd,
}

/**
 * WT21 display unit type. Not taken into account for `WT21DisplayUnitType.Pfd`
 */
export type WT21DisplayUnitIndex = 1 | 2

/**
 * Base WT21 FsInstrument
 */
export abstract class WT21DisplayUnitFsInstrument implements FsInstrument {
  public displayUnitConfig: DisplayUnitConfigInterface = DisplayUnitConfig.DEFAULT;

  /** @inheritDoc */
  protected constructor(
    public readonly instrument: BaseInstrument,

    /** The WT21 display unit type of this instrument */
    public readonly displayUnitType: WT21DisplayUnitType,

    /** The WT21 display unit index of this instrument */
    public readonly displayUnitIndex: WT21DisplayUnitIndex,
  ) {
    const instrumentConfigTag = this.getInstrumentConfigTag(instrument.xmlConfig, displayUnitType, displayUnitIndex);

    if (!instrumentConfigTag) {
      console.warn(`No matching 'Instrument' tag found in XML config for display unit with type '${displayUnitType}' and index '${displayUnitIndex}'`);
      return;
    }

    const displayUnitConfig = instrumentConfigTag.querySelector(':scope > DisplayUnitConfig');

    if (displayUnitConfig) {
      this.displayUnitConfig = new DisplayUnitConfig(displayUnitConfig);
    }
  }

  /**
   * Tries to find the instrument config tag for this instrument in an XML config
   *
   * @param xmlConfig the XML config document
   * @param displayUnitType the display unit type
   * @param displayUnitIndex the display unit index
   *
   * @returns an XML element or `undefined`, if not appropriate tag is found
   */
  private getInstrumentConfigTag(xmlConfig: Document, displayUnitType: WT21DisplayUnitType, displayUnitIndex: WT21DisplayUnitIndex): Element | undefined {
    const instrumentTags = Array.from(xmlConfig.querySelectorAll('Instrument'));

    let instrumentConfigTag: Element | undefined;
    if (displayUnitType === WT21DisplayUnitType.Pfd) {
      instrumentConfigTag = instrumentTags.find((tag) => {
        const name = tag.querySelector(':scope > Name');

        if (!name) {
          return false;
        }

        return name.textContent === `WT21_PFD_${displayUnitIndex}` || (displayUnitIndex === 1 && name.textContent === 'WT21_PFD');
      });
    } else if (displayUnitType === WT21DisplayUnitType.Mfd) {
      instrumentConfigTag = instrumentTags.find((tag) => {
        const name = tag.querySelector(':scope > Name');

        if (!name) {
          return false;
        }

        return name.textContent === `WT21_MFD_${displayUnitIndex}` || (displayUnitIndex === 1 && name.textContent === 'WT21_MFD');
      });
    }

    return instrumentConfigTag;
  }

  /** @inheritDoc */
  public Update(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onInteractionEvent(_args: Array<string>): void {
    // noop
  }

  /** @inheritDoc */
  public onFlightStart(): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritDoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }
}
