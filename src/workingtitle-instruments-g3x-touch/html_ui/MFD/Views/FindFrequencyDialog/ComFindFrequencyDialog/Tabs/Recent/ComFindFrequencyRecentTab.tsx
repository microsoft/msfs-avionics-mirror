import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';
import { DefaultRadioSavedFrequenciesDataProvider } from '../../../../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { SavedFrequenciesData } from '../../../../../../Shared/NavCom/G3XNavComEventPublisher';
import { UiKnobUtils } from '../../../../../../Shared/UiSystem/UiKnobUtils';
import { UiTouchButton } from '../../../../../../Shared/Components/TouchButton';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../../../../Shared/Components/List/UiListFocusable';
import { UiList } from '../../../../../../Shared/Components/List/UiList';

import './ComFindFrequencyRecentTab.css';

/** Component props for {@link ComFindFrequencyRecentTab}. */
export interface ComFindFrequencyRecentTabProps extends GenericFindFrequencyTabProps {
  /** The saved frequencies data provider. */
  savedFrequenciesProvider: DefaultRadioSavedFrequenciesDataProvider;
}

/**
 * A tab for a COM find frequency dialog that shows recently used frequencies.
 */
export class ComFindFrequencyRecentTab extends GenericFindFrequencyTab<ComFindFrequencyRecentTabProps> {
  private readonly recentFrequencyArrayLengthSub = this.props.savedFrequenciesProvider.recentComFrequencies.sub((index, type, item, array) => {
    this.listHasElements.set(array.length > 0);
  }, false, true);

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.getOrDefault()?.focusRecent();
    this.recentFrequencyArrayLengthSub.resume(true);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.getOrDefault()?.removeFocus();
    this.recentFrequencyArrayLengthSub.pause();
  }

  /**
   * Renders individual frequency list items.
   * @param data The frequency data to render.
   * @returns The rendered list item.
   */
  private renderListItem(data: SavedFrequenciesData): VNode {
    return (
      <UiListItem hideBorder={true}>
        <div class="com-find-recent-list-item">
          <div class='com-find-recent-list-item-name'><span>{data.name}</span></div>
          <UiListFocusable>
            <UiTouchButton
              label={data.frequency.toFixed(3)}
              class='com-find-recent-list-item-frequency'
              onPressed={this.onFrequencySelected.bind(this, data.frequency, data.name)}
            />
          </UiListFocusable>
        </div>
      </UiListItem>
    );
  }

  /** @inheritDoc */
  protected getTabContent(): VNode {
    return (
      <div class="com-find-dialog-tabbed-content">
        <UiList<SavedFrequenciesData & DynamicListData>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.props.savedFrequenciesProvider.recentComFrequencies}
          listItemLengthPx={this.props.listConfig.itemHeightPx}
          listItemSpacingPx={this.props.listConfig.itemSpacingPx}
          itemsPerPage={this.props.listConfig.itemsPerPage}
          renderItem={this.renderListItem.bind(this)}
          class={'com-find-recent-list'}
          lengthPx={this.props.listConfig.listHeightPx}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
        />
        <div class={{ 'com-find-recent-list-empty': true, 'hidden': this.listHasElements }}>No Recent Frequencies</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.recentFrequencyArrayLengthSub.destroy();
  }
}
