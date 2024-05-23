import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { UiTouchButton } from '../../../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiViewStackLayer } from '../../../../../../Shared/UiSystem/UiViewTypes';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../../../../Shared/Components/List/UiListFocusable';
import { UiList } from '../../../../../../Shared/Components/List/UiList';
import { UiKnobUtils } from '../../../../../../Shared/UiSystem/UiKnobUtils';
import { DefaultRadioSavedFrequenciesDataProvider } from '../../../../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';
import { GenericFindFrequencyTabButtonRow } from '../../../GenericFindFrequencyTabButtonRow';
import { SavedFrequenciesData } from '../../../../../../Shared/NavCom/G3XNavComEventPublisher';
import { NavFindFrequencyEditUserDialog } from './NavFindFrequencyEditUserDialog';

import './NavFindFrequencyUserTab.css';

/** Component props for {@link NavFindFrequencyUserTab}. */
export interface NavFindFrequencyUserTabProps extends GenericFindFrequencyTabProps {
  /** The saved frequencies data provider. */
  savedFrequenciesProvider: DefaultRadioSavedFrequenciesDataProvider;
}

/** Component props for {@link NavFindFrequencyUserTab}. */
export class NavFindFrequencyUserTab extends GenericFindFrequencyTab<NavFindFrequencyUserTabProps> {
  private readonly userFrequencyArrayLengthSub = this.props.savedFrequenciesProvider.userNavFrequencies.sub((index, type, item, array) => {
    this.listHasElements.set(array.length > 0);
  }, true);

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
    this.userFrequencyArrayLengthSub.resume(true);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
    this.userFrequencyArrayLengthSub.pause();
  }

  /**
   * Handles when the edit frequencies button is pressed.
   */
  private onEditFrequenciesPressed(): void {
    this.props.uiService.openMfdPopup<NavFindFrequencyEditUserDialog>(
      UiViewStackLayer.Overlay,
      UiViewKeys.NavFindFrequencyEditUserDialog,
      false,
      { popupType: 'slideout-top-full' }
    );
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
          data={this.props.savedFrequenciesProvider.userNavFrequencies}
          listItemLengthPx={this.props.listConfig.itemHeightPx}
          listItemSpacingPx={this.props.listConfig.itemSpacingPx}
          itemsPerPage={this.props.listConfig.itemsPerPage}
          renderItem={this.renderListItem.bind(this)}
          class={'nav-find-recent-list'}
          lengthPx={this.props.listConfig.itemHeightPx}
          validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
        />
        <div class={{ 'nav-find-user-list-empty': true, 'hidden': this.listHasElements }}>No User Frequencies</div>
      </div>
    );
  }

  /** @inheritDoc */
  protected getButtonRow(): VNode {
    return (
      <GenericFindFrequencyTabButtonRow
        backButtonImgSrc={this.props.backButtonImgSrc}
        backButtonLabel={this.props.backButtonLabel}
        onBackPressed={this.props.onBackPressed}
        actionButtonLabel={Subject.create('Edit User Frequencies')}
        onActionPressed={this.onEditFrequenciesPressed.bind(this)}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.userFrequencyArrayLengthSub.destroy();
  }
}
