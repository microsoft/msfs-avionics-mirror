import { Config } from '../../../Shared/Config/Config';
import { G3XVsiScaleMaximum } from './G3XVerticalSpeedIndicatorTypes';

/**
 * A configuration object which defines vertical speed indicator options.
 */
export class G3XVsiConfig implements Config {
  /** Options for the VSI scale. */
  public readonly scaleMaximum: G3XVsiScaleMaximum;

  /**
   * Creates a new VsiConfig from a configuration document element.
   * @param element A configuration document element.
   */
  constructor(element: Element | undefined) {
    if (element === undefined) {
      this.scaleMaximum = 2000;
    } else {
      if (element.tagName !== 'Vsi') {
        throw new Error(`Invalid VsiConfig definition: expected tag name 'Vsi' but was '${element.tagName}'`);
      }

      let scaleMaximum: G3XVsiScaleMaximum | undefined;

      try {
        scaleMaximum = this.parseScaleMaximum(element);
      } catch (e) {
        console.warn(e);
      }

      if (scaleMaximum === undefined) {
        const inheritFromId = element.getAttribute('inherit');
        const inheritFromElement = inheritFromId === null
          ? null
          : element.ownerDocument.querySelector(`Vsi[id='${inheritFromId}']`);
        if (inheritFromElement !== null) {
          try {
            scaleMaximum = this.parseScaleMaximum(inheritFromElement);
          } catch (e) {
            console.warn(e);
          }
        }
      }
      this.scaleMaximum = scaleMaximum ?? 2000;
    }
  }

  /**
   * Parses scale options from a configuration document element.
   * @param element A configuration document element.
   * @returns Scale options defined by the specified element.
   * @throws Error if the specified element has an invalid format.
   */
  private parseScaleMaximum(element: Element): G3XVsiScaleMaximum | undefined {

    const scale = element.querySelector(':scope>Scale');

    if (scale === null) {
      return undefined;
    }

    const maximum = Number(scale.getAttribute('max') ?? 'NaN');

    if (isNaN(maximum as number) || (maximum !== 2000 && maximum !== 3000 && maximum !== 4000)) {
      console.warn('Invalid VsiConfig definition: invalid scale maximum option (Must be: 2000, 3000, or 4000)');
      return undefined;
    }

    return maximum;
  }
}
