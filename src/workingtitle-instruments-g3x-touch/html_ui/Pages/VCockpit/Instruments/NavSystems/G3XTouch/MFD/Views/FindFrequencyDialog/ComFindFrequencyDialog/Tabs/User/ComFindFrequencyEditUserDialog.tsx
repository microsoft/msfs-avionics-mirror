import { ComSpacing, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { AbstractUiView } from '../../../../../../Shared/UiSystem/AbstractUiView';
import { UiViewProps } from '../../../../../../Shared/UiSystem/UiView';
import { UiDialogResult, UiDialogView } from '../../../../../../Shared/UiSystem/UiDialogView';
import { UiList } from '../../../../../../Shared/Components/List/UiList';
import { UiViewStackLayer } from '../../../../../../Shared/UiSystem/UiViewTypes';
import { UiViewKeys } from '../../../../../../Shared/UiSystem/UiViewKeys';
import { UiListItem } from '../../../../../../Shared/Components/List/UiListItem';
import { UiListFocusable } from '../../../../../../Shared/Components/List/UiListFocusable';
import { UiTouchButton } from '../../../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiKnobId } from '../../../../../../Shared/UiSystem/UiKnobTypes';
import { GenericFindFrequencyTabButtonRow } from '../../../GenericFindFrequencyTabButtonRow';
import { G3XTouchFilePaths } from '../../../../../../Shared/G3XTouchFilePaths';
import { UserFrequencyInputDialog } from '../../../../UserFrequencyInputDialog/UserFrequencyInputDialog';
import { DefaultRadioSavedFrequenciesDataProvider } from '../../../../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { G3XNavComControlEvents, SavedFrequenciesData } from '../../../../../../Shared/NavCom/G3XNavComEventPublisher';
import { GduFormat } from '../../../../../../Shared/CommonTypes';
import { FindFrequencyListConfiguration } from '../../../AbstractFindFrequencyDialog';

import './ComFindFrequencyEditUserDialog.css';

/**
 * The input of a COM find frequency dialog.
 */
interface ComFindFrequencyEditUserDialogInput {
  /** The com spacing for the radio */
  comSpacing: ComSpacing;
}

/**
 * Component props for {@link ComFindFrequencyDialog}.
 */
export interface ComFindFrequencyEditUserDialogProps extends UiViewProps {
  /** The saved frequencies data provider. */
  savedFrequenciesDataProvider: DefaultRadioSavedFrequenciesDataProvider;
}

/**
 * The Edit User Frequencies dialog in the Com Find Frequency flow.
 */
export class ComFindFrequencyEditUserDialog extends AbstractUiView<ComFindFrequencyEditUserDialogProps> implements UiDialogView<ComFindFrequencyEditUserDialogInput, any> {
  private readonly LIST_CONFIGS: Map<GduFormat, FindFrequencyListConfiguration> = new Map([
    ['460', {
      itemHeightPx: 82,
      itemsPerPage: 6,
      itemSpacingPx: 0,
      listHeightPx: 492,
    }],
    // TODO: specify 470 numbers, these are the 460 numbers as placeholder
    ['470', {
      itemHeightPx: 82,
      itemsPerPage: 6,
      itemSpacingPx: 0,
      listHeightPx: 492,
    }],
  ]);

  private readonly listConfig = this.LIST_CONFIGS.get(this.props.uiService.gduFormat)
    || {
      itemHeightPx: 82,
      itemsPerPage: 6,
      itemSpacingPx: 0,
      listHeightPx: 492,
    };

  private readonly publisher = this.props.uiService.bus.getPublisher<G3XNavComControlEvents>();

  private readonly comSpacing = Subject.create<ComSpacing | null>(null);

  private readonly backButtonLabel = Subject.create('Back');
  private readonly backButtonImgSrc = Subject.create(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`);

  private readonly listRef = FSComponent.createRef<UiList<any>>();
  private readonly tabButtonRowRef = FSComponent.createRef<GenericFindFrequencyTabButtonRow>();

  private resolveFunction?: (value: UiDialogResult<any>) => void;
  private resultObject: UiDialogResult<any> = {
    wasCancelled: true,
  };

  private readonly addButtonEnabled = Subject.create<boolean>(false);
  private readonly listHasElements = Subject.create<boolean>(true);
  private readonly userFrequencyArrayLengthSub = this.props.savedFrequenciesDataProvider.userComFrequencies.sub((index, type, item, array) => {
    this.addButtonEnabled.set(array.length < 16);
    this.listHasElements.set(!!array.length);
  });


  /** @inheritDoc */
  public request(input: any): Promise<UiDialogResult<any>> {
    return new Promise<UiDialogResult<any>>(resolve => {
      this.cleanupRequest();

      this.userFrequencyArrayLengthSub.resume(true);
      this.comSpacing.set(input.comSpacing);

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };
    });
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.listRef.instance.scrollToIndex(0, 0, true, false);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.comSpacing.set(null);
    this.userFrequencyArrayLengthSub.pause();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Handles the add frequency button being pressed.
   */
  private async onAddFrequencyPressed(): Promise<void> {
    const result = await this.props.uiService.openMfdPopup<UserFrequencyInputDialog>(
      UiViewStackLayer.Overlay,
      UiViewKeys.ComFindFrequencyAddUserDialog,
      false,
      { popupType: 'slideout-top-full' }
    ).ref.request({
      comSpacing: this.comSpacing.get() || ComSpacing.Spacing25Khz,
    });

    if (result.wasCancelled) {
      return;
    }

    const { frequency, name } = result.payload;
    this.publisher.pub('add_saved_frequency', { radioType: 'com', frequencyType: 'user', frequency, name, }, true, false);
  }

  /**
   * Handles the remove frequency button being pressed.
   * @param frequency The frequency to remove.
   * @param name The name of the frequency to remove.
   */
  private onRemoveFrequencyPressed(frequency: number, name: string): void {
    this.publisher.pub('remove_saved_frequency', { radioType: 'com', frequencyType: 'user', frequency, name, }, true, false);
  }

  /**
   * Handles the back button being pressed.
   */
  private onBackButtonPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Renders individual frequency list items.
   * @param data The frequency data to render.
   * @returns The rendered list item.
   */
  private renderListItem(data: SavedFrequenciesData): VNode {
    return (
      <UiListItem hideBorder={true}>
        <div class="com-find-user-edit-list-item">
          <div class='com-find-user-edit-list-item-name'><span>{data.name}</span></div>
          <div class='com-find-user-edit-list-item-freq'><span>{data.frequency.toFixed(3)}</span></div>
          <UiListFocusable>
            <UiTouchButton
              label={'Remove'}
              class='com-find-user-edit-list-item-remove'
              onPressed={this.onRemoveFrequencyPressed.bind(this, data.frequency, data.name)}
            />
          </UiListFocusable>
        </div>
      </UiListItem>
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="ui-view-panel com-find-dialog com-find-edit-user-dialog">
        <div class="com-find-dialog-title">Edit User Frequencies</div>
        <UiList<SavedFrequenciesData & DynamicListData>
          ref={this.listRef}
          bus={this.props.uiService.bus}
          data={this.props.savedFrequenciesDataProvider.userComFrequencies}
          listItemLengthPx={this.listConfig.itemHeightPx}
          listItemSpacingPx={this.listConfig.itemSpacingPx}
          itemsPerPage={this.listConfig.itemsPerPage}
          renderItem={this.renderListItem.bind(this)}
          class={'com-find-user-edit-list'}
          lengthPx={this.listConfig.listHeightPx}
          validKnobIds={[UiKnobId.RightInner]}
        />
        <GenericFindFrequencyTabButtonRow
          ref={this.tabButtonRowRef}
          backButtonImgSrc={this.backButtonImgSrc}
          backButtonLabel={this.backButtonLabel}
          onBackPressed={this.onBackButtonPressed.bind(this)}
          actionButtonLabel={Subject.create('Add User Frequency')}
          onActionPressed={this.onAddFrequencyPressed.bind(this)}
          actionButtonEnabled={this.addButtonEnabled}
        />
        <div class={{ 'com-find-edit-user-list-empty': true, 'hidden': this.listHasElements }}>No User Frequencies</div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();

    this.userFrequencyArrayLengthSub.destroy();
    this.listRef.getOrDefault()?.destroy();
    this.tabButtonRowRef.getOrDefault()?.destroy();
  }
}
