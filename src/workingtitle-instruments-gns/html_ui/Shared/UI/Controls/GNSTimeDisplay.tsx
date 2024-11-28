import { TimeDisplay, TimeDisplayFormat } from '@microsoft/msfs-garminsdk';

/**
 * A time unit display for the GNS devices.
 */
export class GNSTimeDisplay extends TimeDisplay {
  /** @inheritdoc */
  protected getSuffix(format: TimeDisplayFormat, isAm: boolean): string {
    if (format === TimeDisplayFormat.UTC) {
      return 'Ä';
    } else if (format === TimeDisplayFormat.Local24) {
      return 'Ã';
    } else {
      return isAm ? 'Æ' : 'Ç';
    }
  }
}