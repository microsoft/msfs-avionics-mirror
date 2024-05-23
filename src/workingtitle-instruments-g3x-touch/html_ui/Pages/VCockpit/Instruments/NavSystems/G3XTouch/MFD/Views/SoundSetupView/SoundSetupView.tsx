import { FSComponent, MutableSubscribable, Subject, VNode } from '@microsoft/msfs-sdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';
import { G3XSoundUserSettings } from '../../../Shared/Settings/G3XSoundUserSettings';

import './SoundSetupView.css';

/**
 * A units setup menu.
 */
export class SoundSetupView extends AbstractUiView {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.listRef.instance.scrollToIndex(0, 0, true, false);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.listRef.instance.clearRecentFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Renders a button which displays a state value and when pressed, allows the user to select a value for the state
   * @param state The state to which to bind the button.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @param isDisabled Whether the button should be disabled. Defaults to `false`.
   * @returns A button which displays a state value and when pressed, allows the user to select a
   * value for the state from a list dialog, as a VNode.
   */
  private renderEnableDisableButton(
    state: MutableSubscribable<boolean>,
    cssClass?: string,
    isDisabled = false
  ): VNode {
    const listItemHeight = this.props.uiService.gduFormat === '460' ? 84 : 42;
    const listItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const renderValue = (value: boolean): string => value ? 'Enabled' : 'Disabled';

    let listParams: UiListDialogParams<boolean>;

    if (isDisabled) {
      listParams = { inputData: [] };
    } else {
      listParams = {
        selectedValue: state,
        inputData: [
          {
            value: false,
            labelRenderer: () => 'Disabled'
          },
          {
            value: true,
            labelRenderer: () => 'Enabled'
          }
        ],
        itemsPerPage: 2,
        listItemHeightPx: listItemHeight,
        listItemSpacingPx: listItemSpacing,
        autoDisableOverscroll: true,
        class: 'sound-alerts-setup-view-select-list'
      };
    }

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        isEnabled={!isDisabled}
        state={state}
        renderValue={renderValue}
        listParams={listParams}
        isInList
        class={cssClass}
      />
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    const settingManager = G3XSoundUserSettings.getManager(this.props.uiService.bus);

    return (
      <div class='sound-alerts-setup-view ui-titled-view'>
        <div class='sound-alerts-setup-view ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_sound_setup.png`} class='ui-view-title-icon' />
          <div>Sound Setup</div>
        </div>
        <div class='sound-alerts-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            autoDisableOverscroll
            class='sound-alerts-setup-view-list'
          >
            <UiListItem>
              <div class='sound-alerts-setup-view-row-left'>Minimums Alert</div>
              <UiListFocusable>
                {this.renderEnableDisableButton(
                  settingManager.getSetting('g3xSoundMinimumsAlertEnabled'),
                  'sound-alerts-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='sound-alerts-setup-view-row-left'>VNAV Alert</div>
              <UiListFocusable>
                {this.renderEnableDisableButton(
                  Subject.create(false),
                  'sound-alerts-setup-view-row-right',
                  true
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='sound-alerts-setup-view-row-left'>Traffic N/A Alert</div>
              <UiListFocusable>
                {this.renderEnableDisableButton(
                  Subject.create(true),
                  'sound-alerts-setup-view-row-right',
                  true
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='sound-alerts-setup-view-row-left'>Altitude Alert</div>
              <UiListFocusable>
                {this.renderEnableDisableButton(
                  settingManager.getSetting('g3xSoundAltitudeAlertEnabled'),
                  'sound-alerts-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='sound-alerts-setup-view-row-left'>Message Volume</div>
              <UiListSelectTouchButton
                uiService={this.props.uiService}
                listDialogLayer={UiViewStackLayer.Overlay}
                listDialogKey={UiViewKeys.ListDialog1}
                openDialogAsPositioned
                containerRef={this.props.containerRef}
                isEnabled={false}
                state={Subject.create(false)}
                listParams={{ inputData: [] }}
                hideDropdownArrow={true}
                isInList
                class={'sound-alerts-setup-view-row-right'}
              >
                50%
              </UiListSelectTouchButton>
            </UiListItem>
          </UiList>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}