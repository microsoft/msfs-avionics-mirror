import { AttitudeAircraftSymbolColor } from '@microsoft/msfs-garminsdk';

import { Config } from '../../../Shared/Config/Config';

/**
 * A configuration object which defines PFD horizon display options.
 */
export class HorizonConfig implements Config {
  /** The color of the symbolic aircraft. */
  public readonly symbolColor: AttitudeAircraftSymbolColor;

  /** Whether to show the roll indicator arc. */
  public readonly showRollArc: boolean;

  /** Whether to render the roll indicator with a ground pointer or a sky pointer. */
  public readonly rollPointerStyle: 'ground' | 'sky';

  /** Whether to include the display of unusual attitude warning chevrons on the pitch ladder. */
  public readonly includeUnusualAttitudeChevrons: boolean;

  /**
   * Creates a new HorizonConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    let inheritData: HorizonConfigData | undefined;

    if (element !== undefined) {
      if (element.tagName !== 'Horizon') {
        throw new Error(`Invalid HorizonConfig definition: expected tag name 'Horizon' but was '${element.tagName}'`);
      }

      const inheritFromId = element.getAttribute('inherit');
      const inheritFromElement = inheritFromId === null
        ? null
        : element.ownerDocument.querySelector(`Horizon[id='${inheritFromId}']`);

      inheritData = inheritFromElement ? new HorizonConfigData(inheritFromElement) : undefined;
    }

    const data = new HorizonConfigData(element);

    this.symbolColor = data.symbolColor ?? inheritData?.symbolColor ?? 'yellow';
    this.showRollArc = data.showRollArc ?? inheritData?.showRollArc ?? true;
    this.rollPointerStyle = data.rollPointerStyle ?? inheritData?.rollPointerStyle ?? 'ground';
    this.includeUnusualAttitudeChevrons = data.includeUnusualAttitudeChevrons ?? inheritData?.includeUnusualAttitudeChevrons ?? true;
  }
}

/**
 * An object containing PFD horizon display config data parsed from an XML document element.
 */
class HorizonConfigData {
  /** The color of the symbolic aircraft. */
  public readonly symbolColor?: AttitudeAircraftSymbolColor;

  /** Whether to show the roll indicator arc. */
  public readonly showRollArc?: boolean;

  /** Whether to render the roll indicator with a ground pointer or a sky pointer. */
  public readonly rollPointerStyle?: 'ground' | 'sky';

  /** Whether to include the display of unusual attitude warning chevrons on the pitch ladder. */
  public readonly includeUnusualAttitudeChevrons?: boolean;

  /**
   * Creates a new HorizonConfigData from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      return;
    }

    const symbolColor = element.getAttribute('symbol-color')?.toLowerCase();
    switch (symbolColor) {
      case 'yellow':
        this.symbolColor = 'yellow';
        break;
      case 'white':
        this.symbolColor = 'white';
        break;
      default:
        console.warn(`Invalid HorizonConfig definition: unrecognized symbolic aircraft color option "${symbolColor}". Discarding option.`);
    }

    const showRollArc = element.getAttribute('roll-arc')?.toLowerCase();
    switch (showRollArc) {
      case 'true':
        this.showRollArc = true;
        break;
      case 'false':
        this.showRollArc = false;
        break;
      default:
        console.warn(`Invalid HorizonConfig definition: unrecognized roll arc option "${showRollArc}" (expected "true" or "false"). Discarding option.`);
    }

    const rollPointerStyle = element.getAttribute('roll-pointer')?.toLowerCase();
    switch (rollPointerStyle) {
      case 'ground':
        this.rollPointerStyle = 'ground';
        break;
      case 'sky':
        this.rollPointerStyle = 'sky';
        break;
      default:
        console.warn(`Invalid HorizonConfig definition: unrecognized roll pointer option "${rollPointerStyle}" (expected "ground" or "sky"). Discarding option.`);
    }

    const includeUnusualAttitudeChevrons = element.getAttribute('unusual-attitude-chevrons')?.toLowerCase();
    switch (includeUnusualAttitudeChevrons) {
      case 'true':
        this.includeUnusualAttitudeChevrons = true;
        break;
      case 'false':
        this.includeUnusualAttitudeChevrons = false;
        break;
      default:
        console.warn(`Invalid HorizonConfig definition: unrecognized unusual attitude chevrons option "${includeUnusualAttitudeChevrons}" (expected "true" or "false"). Discarding option.`);
    }
  }
}