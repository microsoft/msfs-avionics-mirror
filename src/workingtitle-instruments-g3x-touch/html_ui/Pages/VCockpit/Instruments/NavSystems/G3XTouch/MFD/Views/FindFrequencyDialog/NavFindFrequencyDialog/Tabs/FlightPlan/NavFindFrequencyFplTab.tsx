import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';

/**
 * A tab for a NAV find frequency dialog that shows flight plan frequencies.
 */
export class NavFindFrequencyFplTab extends GenericFindFrequencyTab<GenericFindFrequencyTabProps> {
    /** @inheritDoc */
    protected getTabContent(): VNode {
        return (
            <div class="com-find-dialog-tabbed-content">Flight plan</div>
        );
    }
}
