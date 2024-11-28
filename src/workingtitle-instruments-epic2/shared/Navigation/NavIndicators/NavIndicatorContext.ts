import { Context, FSComponent } from '@microsoft/msfs-sdk';

import { Epic2NavIndicators } from '../Epic2NavIndicators';

export let NavIndicatorContext: Context<Epic2NavIndicators>;

/** TODO
 * @param navIndicatorsInstrument TODO
 */
export function initNavIndicatorContext(navIndicatorsInstrument: Epic2NavIndicators): void {
  NavIndicatorContext = FSComponent.createContext<Epic2NavIndicators>(navIndicatorsInstrument);
}
