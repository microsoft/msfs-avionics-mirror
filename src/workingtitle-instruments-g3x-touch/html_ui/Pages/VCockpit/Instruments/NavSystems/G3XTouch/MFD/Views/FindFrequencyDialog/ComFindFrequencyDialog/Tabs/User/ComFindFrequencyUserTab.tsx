import { ComSpacing, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../../../../Shared/Components/List/UiListFocusable';
import { UiTouchButton } from '../../../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiViewStackLayer } from '../../../../../../Shared/UiSystem/UiViewTypes';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { UiList } from '../../../../../../Shared/Components/List/UiList';
import { UiKnobUtils } from '../../../../../../Shared/UiSystem/UiKnobUtils';
import { GenericFindFrequencyTab, GenericFindFrequencyTabProps } from '../../../GenericFindFrequencyTab';
import { GenericFindFrequencyTabButtonRow } from '../../../GenericFindFrequencyTabButtonRow';
import { ComFindFrequencyEditUserDialog } from './ComFindFrequencyEditUserDialog';
import { DefaultRadioSavedFrequenciesDataProvider } from '../../../../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { SavedFrequenciesData } from '../../../../../../Shared/NavCom/G3XNavComEventPublisher';

import './ComFindFrequencyUserTab.css';

/** Component props for {@link ComFindFrequencyRecentTab}. */
export interface ComFindFrequencyUserTabProps extends GenericFindFrequencyTabProps {
  /** The saved frequencies data provider. */
  savedFrequenciesProvider: DefaultRadioSavedFrequenciesDataProvider
  /** The com spacing for the radio */
  comSpacing: Subject<ComSpacing>;
}

/**
 * A tab for a COM find frequency dialog that shows user saved frequencies.
 */
export class ComFindFrequencyUserTab extends GenericFindFrequencyTab<ComFindFrequencyUserTabProps> {
  private readonly userFrequencyArrayLengthSub = this.props.savedFrequenciesProvider.userComFrequencies.sub((index, type, item, array) => {
    this.listHasElements.set(array.length > 0);
  }, true);

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.getOrDefault()?.focusRecent();
    this.userFrequencyArrayLengthSub.resume(true);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.getOrDefault()?.removeFocus();
    this.userFrequencyArrayLengthSub.pause();
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

  /**
   * Handles when the edit frequencies button is pressed.
   */
  private onEditFrequenciesPressed(): void {
    this.props.uiService.openMfdPopup<ComFindFrequencyEditUserDialog>(
      UiViewStackLayer.Overlay,
      UiViewKeys.ComFindFrequencyEditUserDialog,
      false,
      { popupType: 'slideout-top-full' }
    ).ref.request({
      comSpacing: this.props.comSpacing.get()
    });
  }


  /** @inheritDoc */
  protected getTabContent(): VNode {
      return (
        <div class="com-find-dialog-tabbed-content">
          <UiList<SavedFrequenciesData & DynamicListData>
            ref={this.listRef}
            bus={this.props.uiService.bus}
            data={this.props.savedFrequenciesProvider.userComFrequencies}
            listItemLengthPx={this.props.listConfig.itemHeightPx}
            listItemSpacingPx={this.props.listConfig.itemSpacingPx}
            itemsPerPage={this.props.listConfig.itemsPerPage}
            renderItem={this.renderListItem.bind(this)}
            class={'com-find-recent-list'}
            lengthPx={this.props.listConfig.itemHeightPx}
            validKnobIds={this.props.uiService.validKnobIds.filter(UiKnobUtils.isInnerKnobId)}
          />
          <div class={{ 'com-find-user-list-empty': true, 'hidden': this.listHasElements }}>No User Frequencies</div>
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
