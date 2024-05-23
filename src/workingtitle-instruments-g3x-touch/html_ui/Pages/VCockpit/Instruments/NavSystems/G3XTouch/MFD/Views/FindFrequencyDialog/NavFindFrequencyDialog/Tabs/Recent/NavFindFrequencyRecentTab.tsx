import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { DefaultRadioSavedFrequenciesDataProvider } from '../../../../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../../../../Shared/Components/List/UiListFocusable';
import { UiList } from '../../../../../../Shared/Components/List/UiList';
import { UiKnobId } from '../../../../../../Shared/UiSystem/UiKnobTypes';
import { SavedFrequenciesData } from '../../../../../../Shared/NavCom/G3XNavComEventPublisher';
import { UiTouchButton } from '../../../../../../Shared/Components/TouchButton';

import './NavFindFrequencyRecentTab.css';

/** Component props for {@link NavFindFrequencyRecentTab}. */
export interface NavFindFrequencyRecentTabProps extends GenericFindFrequencyTabProps {
  /** The saved frequencies data provider. */
  savedFrequenciesProvider: DefaultRadioSavedFrequenciesDataProvider;
}

/**
 * A tab for a NAV find frequency dialog that shows recently used frequencies.
 */
export class NavFindFrequencyRecentTab extends GenericFindFrequencyTab<NavFindFrequencyRecentTabProps> {
  private readonly recentFrequencyArrayLengthSub = this.props.savedFrequenciesProvider.recentNavFrequencies.sub((index, type, item, array) => {
    this.listHasElements.set(array.length > 0);
  }, false, true);

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
    this.recentFrequencyArrayLengthSub.resume(true);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
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
        <div class="nav-find-recent-list-item">
          <div class='nav-find-recent-list-item-name'><span>{data.name}</span></div>
          <UiListFocusable>
            <UiTouchButton
              label={data.frequency.toFixed(2)}
              class='nav-find-recent-list-item-frequency'
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
      <div class="nav-find-dialog-tabbed-content">
        <UiList<SavedFrequenciesData & DynamicListData>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.props.savedFrequenciesProvider.recentNavFrequencies}
          listItemLengthPx={this.props.listConfig.itemHeightPx}
          listItemSpacingPx={this.props.listConfig.itemSpacingPx}
          itemsPerPage={this.props.listConfig.itemsPerPage}
          renderItem={this.renderListItem.bind(this)}
          class={'nav-find-recent-list'}
          lengthPx={this.props.listConfig.listHeightPx}
          validKnobIds={[UiKnobId.RightInner]}
        />
        <div class={{ 'nav-find-recent-list-empty': true, 'hidden': this.listHasElements }}>No Recent Frequencies</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.recentFrequencyArrayLengthSub.destroy();
  }
}
