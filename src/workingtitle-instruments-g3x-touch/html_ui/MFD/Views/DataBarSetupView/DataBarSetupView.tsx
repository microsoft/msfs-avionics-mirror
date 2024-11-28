import { ArrayUtils, FSComponent, MutableSubscribable, MutableSubscribableInputType, Subject, SubscribableType, VNode } from '@microsoft/msfs-sdk';

import { AvionicsConfig } from '../../../Shared/AvionicsConfig/AvionicsConfig';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { CombinedTouchButton } from '../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiSetValueTouchButton } from '../../../Shared/Components/TouchButton/UiSetValueTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import {
  CnsDataBarButtonSizeSettingMode, CnsDataBarModeButtonSideSettingMode, CnsDataBarScreenSideSettingMode,
  CnsDataBarShowSettingMode, CnsDataBarUserSettings
} from '../../../Shared/Settings/CnsDataBarUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';

import './DataBarSetupView.css';

/**
 * Component props for {@link DataBarSetupView}.
 */
export interface DataBarSetupViewProps extends UiViewProps {
  /** The general avionics configuration object. */
  config: AvionicsConfig;
}

/**
 * A CNS data bar setup menu.
 */
export class DataBarSetupView extends AbstractUiView<DataBarSetupViewProps> {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  private readonly dataBarSettingManager = CnsDataBarUserSettings.getManager(this.props.uiService.bus);

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
    this.listRef.instance.scrollToIndex(0, 0, true, false);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='data-bar-setup-view ui-titled-view'>
        <div class='data-bar-setup-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_databar_setup.png`} class='ui-view-title-icon' />
          <div>Data Bar Setup</div>
        </div>
        <div class='data-bar-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            autoDisableOverscroll
            class='data-bar-setup-view-list'
          >
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>Mode Button Screen Side</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.dataBarSettingManager.getSetting('cnsDataBarSplitButtonSide'),
                  setting => {
                    switch (setting) {
                      case CnsDataBarModeButtonSideSettingMode.Auto:
                        return 'Auto';
                      case CnsDataBarModeButtonSideSettingMode.Left:
                        return 'Left';
                      case CnsDataBarModeButtonSideSettingMode.Right:
                        return 'Right';
                      default:
                        return '';
                    }
                  },
                  {
                    selectedValue: this.dataBarSettingManager.getSetting('cnsDataBarSplitButtonSide'),
                    inputData: [
                      {
                        value: CnsDataBarModeButtonSideSettingMode.Auto,
                        labelRenderer: () => 'Auto'
                      },
                      {
                        value: CnsDataBarModeButtonSideSettingMode.Left,
                        labelRenderer: () => 'Left'
                      },
                      {
                        value: CnsDataBarModeButtonSideSettingMode.Right,
                        labelRenderer: () => 'Right'
                      }
                    ]
                  }
                )}
              </UiListFocusable>
            </UiListItem>
            {this.props.config.radios.comCount === 1 && (
              <UiListItem>
                <div class='data-bar-setup-view-row-left'>COM Radio Screen Side</div>
                <UiListFocusable>
                  {this.renderLeftRightCombinedButton(
                    this.dataBarSettingManager.getSetting('cnsDataBarComRadioScreenSide')
                  )}
                </UiListFocusable>
              </UiListItem>
            )}
            {this.props.config.radios.comCount > 0 && (
              <UiListItem>
                <div class='data-bar-setup-view-row-left'>COM Radio Controls</div>
                <UiListFocusable>
                  {this.renderButtonSizeSelectButton(
                    this.dataBarSettingManager.getSetting('cnsDataBarComRadioButtonSize')
                  )}
                </UiListFocusable>
              </UiListItem>
            )}
            {this.props.config.radios.navCount > 0 && (
              <UiListItem>
                <div class='data-bar-setup-view-row-left'>NAV Radio Controls</div>
                <UiListFocusable>
                  {this.renderButtonSizeSelectButton(
                    this.dataBarSettingManager.getSetting('cnsDataBarNavRadioButtonSize')
                  )}
                </UiListFocusable>
              </UiListItem>
            )}
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>Radio Volume Indicator</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow'),
                  setting => setting ? 'Show' : 'Hide',
                  {
                    selectedValue: this.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShow'),
                    inputData: [
                      {
                        value: false,
                        labelRenderer: () => 'Hide'
                      },
                      {
                        value: true,
                        labelRenderer: () => 'Show'
                      }
                    ]
                  }
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>Radio Volume Shortcut</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShortcutShow'),
                  setting => setting ? 'Show' : 'Hide',
                  {
                    selectedValue: this.dataBarSettingManager.getSetting('cnsDataBarRadioVolumeShortcutShow'),
                    inputData: [
                      {
                        value: false,
                        labelRenderer: () => 'Hide'
                      },
                      {
                        value: true,
                        labelRenderer: () => 'Show'
                      }
                    ]
                  }
                )}
              </UiListFocusable>
            </UiListItem>
            {this.props.config.audio.audioPanel !== undefined && (
              <>
                <UiListItem>
                  <div class='data-bar-setup-view-row-left'>Audio Panel Screen Side</div>
                  <UiListFocusable>
                    {this.renderLeftRightCombinedButton(
                      this.dataBarSettingManager.getSetting('cnsDataBarAudioButtonScreenSide')
                    )}
                  </UiListFocusable>
                </UiListItem>
                <UiListItem>
                  <div class='data-bar-setup-view-row-left'>Audio Panel Controls</div>
                  <UiListFocusable>
                    {this.renderButtonSizeSelectButton(
                      this.dataBarSettingManager.getSetting('cnsDataBarAudioButtonSize')
                    )}
                  </UiListFocusable>
                </UiListItem>
              </>
            )}
            {this.props.config.transponder !== undefined && (
              <UiListItem>
                <div class='data-bar-setup-view-row-left'>Transponder Screen Side</div>
                <UiListFocusable>
                  {this.renderLeftRightCombinedButton(
                    this.dataBarSettingManager.getSetting('cnsDataBarTransponderScreenSide')
                  )}
                </UiListFocusable>
              </UiListItem>
            )}
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>Emergency Button</div>
              <UiListFocusable>
                {this.renderListSelectButton(Subject.create('Hide'))}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>User Timer Button</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.dataBarSettingManager.getSetting('cnsDataBarUserTimerShow'),
                  setting => {
                    switch (setting) {
                      case CnsDataBarShowSettingMode.Hide:
                        return 'Hide';
                      case CnsDataBarShowSettingMode.Left:
                        return 'Left';
                      case CnsDataBarShowSettingMode.Right:
                        return 'Right';
                      default:
                        return '';
                    }
                  },
                  {
                    selectedValue: this.dataBarSettingManager.getSetting('cnsDataBarUserTimerShow'),
                    inputData: [
                      {
                        value: CnsDataBarShowSettingMode.Hide,
                        labelRenderer: () => 'Hide'
                      },
                      {
                        value: CnsDataBarShowSettingMode.Left,
                        labelRenderer: () => 'Left'
                      },
                      {
                        value: CnsDataBarShowSettingMode.Right,
                        labelRenderer: () => 'Right'
                      }
                    ]
                  }
                )}
              </UiListFocusable>
            </UiListItem>
            {this.props.uiService.gduFormat === '460' && (
              <UiListItem>
                <div class='data-bar-setup-view-row-left'>Max Displayed Field Count</div>
                <UiListFocusable>
                  {this.renderListSelectButton(
                    this.dataBarSettingManager.getSetting('cnsDataBarMaxFieldCount'),
                    setting => `${setting} Field${setting > 1 ? 's' : ''}`,
                    {
                      selectedValue: this.dataBarSettingManager.getSetting('cnsDataBarMaxFieldCount'),
                      inputData: ArrayUtils.create(8, index => {
                        return {
                          value: index + 1,
                          labelRenderer: () => `${index + 1} Field${index > 0 ? 's' : ''}`
                        };
                      })
                    }
                  )}
                </UiListFocusable>
              </UiListItem>
            )}
            <UiListItem>
              <div class='data-bar-setup-view-row-left'>Data Fields</div>
              <UiListFocusable>
                <UiTouchButton
                  label='Change...'
                  onPressed={() => {
                    this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.DataBarFieldEdit, false, { popupType: 'fade' });
                  }}
                  isInList
                  gduFormat={this.props.uiService.gduFormat}
                  class='data-bar-setup-view-row-right'
                />
              </UiListFocusable>
            </UiListItem>
          </UiList>
        </div>
      </div>
    );
  }

  /**
   * Renders a button that displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog.
   * @param state The state to which to bind the button.
   * @param renderValue A function which renders the value of the button's bound state, or a VNode which renders the
   * value. If not defined, then values are rendered into strings via default `toString()` behavior. If the rendered
   * value is a VNode, then all first-level DisplayComponents in the VNode tree will be destroyed when a new value is
   * rendered or when the button is destroyed.
   * @param listParams Parameters to pass to the selection list dialog, or a function which will return the parameters
   * when called each time the list is opened.
   * @returns A button that displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<S extends MutableSubscribable<any, any>>(
    state: S,
    renderValue?: VNode | ((stateValue: SubscribableType<S>) => string | VNode),
    listParams?: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>)
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 66 : 33;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const modifyListParams = (inputListParams: UiListDialogParams<MutableSubscribableInputType<S>>): UiListDialogParams<MutableSubscribableInputType<S>> => {
      const modified = Object.assign({}, inputListParams);

      modified.itemsPerPage ??= Math.min(inputListParams.inputData.length, 5);
      modified.listItemHeightPx ??= defaultListItemHeight;
      modified.listItemSpacingPx ??= defaultListItemSpacing;
      modified.autoDisableOverscroll ??= true;
      modified.class ??= 'data-bar-setup-view-select-list';

      return modified;
    };

    let finalListParams: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>);

    if (listParams === undefined) {
      finalListParams = { inputData: [] };
    } else if (typeof listParams === 'object') {
      finalListParams = modifyListParams(listParams);
    } else {
      finalListParams = (listParamsState: S): UiListDialogParams<MutableSubscribableInputType<S>> => {
        return modifyListParams(listParams(listParamsState));
      };
    }

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        isEnabled={listParams !== undefined}
        state={state}
        renderValue={renderValue}
        listParams={finalListParams}
        isInList
        class='data-bar-setup-view-row-right'
      />
    );
  }

  /**
   * Renders a button that displays a button size setting value and when pressed, allows the user to select a value
   * for the setting from a list dialog.
   * @param state The state to which to bind the button.
   * @returns A button that displays a button size setting value and when pressed, allows the user to select a value
   * for the setting from a list dialog, as a VNode.
   */
  private renderButtonSizeSelectButton(
    state: MutableSubscribable<CnsDataBarButtonSizeSettingMode>
  ): VNode {
    return this.renderListSelectButton(
      state,
      location => {
        switch (location) {
          case CnsDataBarButtonSizeSettingMode.Normal:
            return 'Normal';
          case CnsDataBarButtonSizeSettingMode.Minimized:
            return 'Minimized';
          default:
            return '';
        }
      },
      {
        selectedValue: state,
        inputData: [
          {
            value: CnsDataBarButtonSizeSettingMode.Normal,
            labelRenderer: () => 'Normal'
          },
          {
            value: CnsDataBarButtonSizeSettingMode.Minimized,
            labelRenderer: () => 'Minimized'
          }
        ]
      }
    );
  }

  /**
   * Renders a combined button that contains two set-value touch buttons that toggle a state between the 'Left' and
   * 'Right' members of `CnsDataBarScreenSideSettingMode`.
   * @param state The state to which to bind the buttons.
   * @param isEnabled Whether the buttons are enabled. Defaults to `true`.
   * @returns A combined button that contains two set-value touch buttons that toggle a state between the 'Left' and
   * 'Right' members of `CnsDataBarScreenSideSettingMode`.
   */
  private renderLeftRightCombinedButton(
    state: MutableSubscribable<CnsDataBarScreenSideSettingMode>,
    isEnabled?: boolean
  ): void {
    isEnabled ??= true;

    return (
      <CombinedTouchButton
        orientation='row'
        isFocusable
        canBeFocused={isEnabled}
        focusSelfOnTouch
        onUiInteractionEvent={event => {
          switch (event) {
            case UiInteractionEvent.SingleKnobPress:
            case UiInteractionEvent.LeftKnobPress:
            case UiInteractionEvent.RightKnobPress:
              state.set(state.get() === CnsDataBarScreenSideSettingMode.Left ? CnsDataBarScreenSideSettingMode.Right : CnsDataBarScreenSideSettingMode.Left);
              return true;
            default:
              return false;
          }
        }}
        class='data-bar-setup-view-row-right'
      >
        <UiSetValueTouchButton
          state={state}
          setValue={CnsDataBarScreenSideSettingMode.Left}
          isEnabled={isEnabled}
          label='Left'
        />
        <UiSetValueTouchButton
          state={state}
          setValue={CnsDataBarScreenSideSettingMode.Right}
          isEnabled={isEnabled}
          label='Right'
        />
      </CombinedTouchButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
