import { AttitudeAircraftSymbolColor } from '@microsoft/msfs-garminsdk';
import { Config } from '../Config/Config';

/**
 * An option for horizon display flight director cue style support.
 */
export type HorizonDirectorCueOption = 'single' | 'dual' | 'both';

/**
 * A configuration object which defines PFD horizon display options.
 */
export class HorizonConfig implements Config {
  /** Flight director cue style support. */
  public readonly directorCue: HorizonDirectorCueOption;

  /** The color of the symbolic aircraft. */
  public readonly symbolColor: AttitudeAircraftSymbolColor;

  /** Whether to show the roll indicator arc. */
  public readonly showRollArc: boolean;

  /** Whether to render the roll indicator with a ground pointer or a sky pointer. */
  public readonly rollPointerStyle: 'ground' | 'sky';

  /** Whether to support advanced SVT features. */
  public readonly advancedSvt: boolean;

  /**
   * Creates a new HorizonConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.directorCue = 'single';
      this.symbolColor = 'yellow';
      this.showRollArc = true;
      this.rollPointerStyle = 'ground';
      this.advancedSvt = false;
    } else {
      if (element.tagName !== 'Horizon') {
        throw new Error(`Invalid HorizonConfig definition: expected tag name 'Horizon' but was '${element.tagName}'`);
      }

      const directorCue = element.getAttribute('director-cue')?.toLowerCase();
      switch (directorCue) {
        case 'single':
        case undefined:
          this.directorCue = 'single';
          break;
        case 'dual':
          this.directorCue = 'dual';
          break;
        case 'both':
          this.directorCue = 'both';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized director cue option "${directorCue}". Defaulting to "single".`);
          this.directorCue = 'single';
      }

      const symbolColor = element.getAttribute('symbol-color')?.toLowerCase();
      switch (symbolColor) {
        case 'yellow':
        case undefined:
          this.symbolColor = 'yellow';
          break;
        case 'white':
          this.symbolColor = 'white';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized symbolic aircraft color option "${symbolColor}". Defaulting to "yellow".`);
          this.symbolColor = 'yellow';
      }

      const showRollArc = element.getAttribute('roll-arc')?.toLowerCase();
      switch (showRollArc) {
        case 'true':
        case undefined:
          this.showRollArc = true;
          break;
        case 'false':
          this.showRollArc = false;
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized roll arc option "${showRollArc}" (expected "true" or "false"). Defaulting to "true".`);
          this.showRollArc = false;
      }

      const rollPointerStyle = element.getAttribute('roll-pointer')?.toLowerCase();
      switch (rollPointerStyle) {
        case 'ground':
        case undefined:
          this.rollPointerStyle = 'ground';
          break;
        case 'sky':
          this.rollPointerStyle = 'sky';
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized roll pointer option "${rollPointerStyle}" (expected "ground" or "sky"). Defaulting to "ground".`);
          this.rollPointerStyle = 'ground';
      }

      const advancedSvt = element.getAttribute('advanced-svt')?.toLowerCase();
      switch (advancedSvt) {
        case 'false':
        case undefined:
          this.advancedSvt = false;
          break;
        case 'true':
          this.advancedSvt = true;
          break;
        default:
          console.warn(`Invalid HorizonConfig definition: unrecognized advanced SVT support option "${advancedSvt}" (expected "true" or "false"). Defaulting to "false".`);
          this.advancedSvt = false;
      }
    }
  }
}