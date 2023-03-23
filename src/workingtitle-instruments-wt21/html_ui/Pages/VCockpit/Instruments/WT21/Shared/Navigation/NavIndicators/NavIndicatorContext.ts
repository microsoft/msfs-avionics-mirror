import { Context, FSComponent } from '@microsoft/msfs-sdk';

import { WT21NavIndicators } from '../WT21NavIndicators';

export let NavIndicatorContext: Context<WT21NavIndicators>;

/** TODO
 * @param navIndicatorsInstrument TODO
 */
export function initNavIndicatorContext(navIndicatorsInstrument: WT21NavIndicators): void {
  NavIndicatorContext = FSComponent.createContext<WT21NavIndicators>(navIndicatorsInstrument);
}
