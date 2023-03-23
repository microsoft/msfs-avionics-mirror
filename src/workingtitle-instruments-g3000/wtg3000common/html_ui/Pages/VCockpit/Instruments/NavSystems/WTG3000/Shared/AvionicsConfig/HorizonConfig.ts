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