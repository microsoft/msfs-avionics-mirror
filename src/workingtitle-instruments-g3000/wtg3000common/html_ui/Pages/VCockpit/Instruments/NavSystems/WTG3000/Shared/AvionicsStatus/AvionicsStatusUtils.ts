import { InstrumentType } from '../CommonTypes';

/**
 * A utility class for for working with G3000 avionics status.
 */
export class AvionicsStatusUtils {
  /**
   * Gets the UID for a G3000 avionics unit (GDU or GTC).
   * @param instrumentType The instrument type of the avionics unit.
   * @param instrumentIndex The instrument index of the avionics unit.
   * @returns The UID for the specified avionics unit.
   */
  public static getUid(instrumentType: InstrumentType, instrumentIndex: number): string {
    return `${instrumentType}_${instrumentIndex}`;
  }
}