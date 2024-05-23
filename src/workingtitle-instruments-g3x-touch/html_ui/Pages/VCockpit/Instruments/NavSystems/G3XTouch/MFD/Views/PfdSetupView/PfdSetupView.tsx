import {
  FSComponent, MappedSubject, MutableSubscribable, MutableSubscribableInputType, Subject, SubscribableMapFunctions,
  SubscribableType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { PfdUserSettingTypes, PfdKnobActionSettingMode, WindDisplaySettingMode, PfdHsiOrientationSettingMode } from '../../../Shared/Settings/PfdUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';

import './PfdSetupView.css';
/**
 * Component props for {@link PfdSetupView}.
 */
export interface PfdSetupViewProps extends UiViewProps {
  /** Whether the PFD synthetic vision display is supported. */
  supportSvt: boolean;

  /** A manager for display user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;
}

/**
 * A PFD setup menu.
 */
export class PfdSetupView extends AbstractUiView<PfdSetupViewProps> {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  private readonly pfdSplitScreenSide = this.props.uiService.gdu460PfdPaneSide.map(pfdPaneSide => {
    return pfdPaneSide === 'right' ? 'Left' : 'Right';
  });

  private readonly svtFpmButtonState = this.props.supportSvt
    ? MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.props.pfdSettingManager.getSetting('svtEnabled'),
      this.props.pfdSettingManager.getSetting('svtFpmShow'),
    )
    : Subject.create(false);
  private readonly svtTrafficButtonState = this.props.supportSvt
    ? MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.props.pfdSettingManager.getSetting('svtEnabled'),
      this.props.pfdSettingManager.getSetting('svtTrafficShow'),
    )
    : Subject.create(false);

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

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pfd-setup-view ui-titled-view'>
        <div class='pfd-setup-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_pfd_setup.png`} class='ui-view-title-icon' />
          <div>PFD Setup</div>
        </div>
        <div class='pfd-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            autoDisableOverscroll
            class='pfd-setup-view-list'
          >
            <UiListItem>
              <div class='pfd-setup-view-row-left'>PFD Presentation</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  Subject.create('Tapes'),
                  undefined,
                  undefined,
                  'pfd-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='pfd-setup-view-row-left'>Wind Vector</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.props.pfdSettingManager.getSetting('windDisplayMode'),
                  mode => {
                    switch (mode) {
                      case WindDisplaySettingMode.Off:
                        return 'Off';
                      case WindDisplaySettingMode.SpeedDir:
                        return 'Speed/Dir';
                      case WindDisplaySettingMode.HeadXWind:
                        return 'Head/X-Wind';
                      default:
                        return '';
                    }
                  },
                  {
                    selectedValue: this.props.pfdSettingManager.getSetting('windDisplayMode'),
                    inputData: [
                      {
                        value: WindDisplaySettingMode.Off,
                        labelRenderer: () => 'Off'
                      },
                      {
                        value: WindDisplaySettingMode.SpeedDir,
                        labelRenderer: () => 'Speed/Dir'
                      },
                      {
                        value: WindDisplaySettingMode.HeadXWind,
                        labelRenderer: () => 'Head/X-Wind'
                      }
                    ]
                  },
                  'pfd-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='pfd-setup-view-row-left'>Standard Rate Turn Bank Angle Pointers</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.props.pfdSettingManager.getSetting('pfdStandardRateTurnPointerShow'),
                  show => show ? 'Show' : 'Hide',
                  {
                    selectedValue: this.props.pfdSettingManager.getSetting('pfdStandardRateTurnPointerShow'),
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
                  },
                  'pfd-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='pfd-setup-view-row-left'>HSI Orientation</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  this.props.pfdSettingManager.getSetting('pfdHsiOrientationMode'),
                  mode => mode === PfdHsiOrientationSettingMode.Auto ? 'Auto TRK/HDG' : 'Heading',
                  {
                    selectedValue: this.props.pfdSettingManager.getSetting('pfdHsiOrientationMode'),
                    inputData: [
                      {
                        value: PfdHsiOrientationSettingMode.Heading,
                        labelRenderer: () => 'Heading'
                      },
                      {
                        value: PfdHsiOrientationSettingMode.Auto,
                        labelRenderer: () => 'Auto TRK/HDG'
                      }
                    ]
                  },
                  'pfd-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            {this.props.uiService.gduFormat === '460' && (
              <>
                <UiListItem>
                  <div class='pfd-setup-view-row-left'>{this.pfdSplitScreenSide} Side Knob Action</div>
                  <UiListFocusable>
                    {this.renderListSelectButton(
                      this.props.pfdSettingManager.getSetting('pfdKnobSplitScreenSideAction'),
                      action => {
                        switch (action) {
                          case PfdKnobActionSettingMode.CourseBaro:
                            return 'Course/Baro';
                          case PfdKnobActionSettingMode.FdBugBaro:
                            return 'FD Bug/Baro';
                          case PfdKnobActionSettingMode.HeadingAltitude:
                            return 'Heading/Altitude';
                          default:
                            return '';
                        }
                      },
                      {
                        selectedValue: this.props.pfdSettingManager.getSetting('pfdKnobSplitScreenSideAction'),
                        inputData: [
                          {
                            value: PfdKnobActionSettingMode.CourseBaro,
                            labelRenderer: () => 'Course/Baro'
                          },
                          // TODO: Figure out what the FD bug function is.
                          // {
                          //   value: PfdKnobAction.FdBugBaro,
                          //   labelRenderer: () => 'FD Bug/Baro'
                          // },
                          {
                            value: PfdKnobActionSettingMode.HeadingAltitude,
                            labelRenderer: () => 'Heading/Altitude'
                          }
                        ]
                      },
                      'pfd-setup-view-row-right'
                    )}
                  </UiListFocusable>
                </UiListItem>
                <UiListItem>
                  <div class='pfd-setup-view-row-left'>Press To Toggle Knob Action</div>
                  <UiListFocusable>
                    {this.renderListSelectButton(
                      this.props.pfdSettingManager.getSetting('pfdKnobPressToToggleAction'),
                      value => value ? 'Enabled' : 'Disabled',
                      {
                        selectedValue: this.props.pfdSettingManager.getSetting('pfdKnobPressToToggleAction'),
                        inputData: [
                          {
                            value: false,
                            labelRenderer: () => 'Disabled'
                          },
                          {
                            value: true,
                            labelRenderer: () => 'Enabled'
                          }
                        ]
                      },
                      'pfd-setup-view-row-right'
                    )}
                  </UiListFocusable>
                </UiListItem>
              </>
            )}
            <UiListItem>
              <div class='pfd-setup-view-row-button-grid'>
                <UiListFocusable>
                  <UiToggleTouchButton
                    state={this.props.pfdSettingManager.getSetting('pfdHsiShowUpperDeviationIndicator')}
                    label={'Lateral\nDeviation'}
                    isInList
                    gduFormat={this.props.uiService.gduFormat}
                  />
                </UiListFocusable>
              </div>
            </UiListItem>
            <UiListItem>
              <div class='pfd-setup-view-row-button-grid'>
                <UiListFocusable>
                  <UiToggleTouchButton
                    state={this.props.supportSvt ? this.props.pfdSettingManager.getSetting('svtEnabled') : Subject.create(false)}
                    label='Synthetic Vision'
                    isEnabled={this.props.supportSvt}
                    isInList
                    gduFormat={this.props.uiService.gduFormat}
                    class='pfd-setup-view-svt-button'
                  />
                </UiListFocusable>
              </div>
            </UiListItem>
            <UiListItem>
              <div class='pfd-setup-view-row-button-grid'>
                <UiListFocusable>
                  <UiToggleTouchButton
                    state={this.svtFpmButtonState}
                    label={'Flt. Path\nMarker'}
                    isEnabled={this.props.supportSvt && this.props.pfdSettingManager.getSetting('svtEnabled')}
                    onPressed={() => {
                      const setting = this.props.pfdSettingManager.getSetting('svtFpmShow');
                      setting.value = !setting.value;
                    }}
                    isInList
                    gduFormat={this.props.uiService.gduFormat}
                  />
                  <UiToggleTouchButton
                    state={this.svtTrafficButtonState}
                    label={'Traffic'}
                    isEnabled={false}
                    isInList
                    gduFormat={this.props.uiService.gduFormat}
                  />
                </UiListFocusable>
              </div>
            </UiListItem>
          </UiList>
        </div>
      </div>
    );
  }

  /**
   * Renders a button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog.
   * @param state The state to which to bind the button.
   * @param renderValue A function which renders the value of the button's bound state, or a VNode which renders the
   * value. If not defined, then values are rendered into strings via default `toString()` behavior. If the rendered
   * value is a VNode, then all first-level DisplayComponents in the VNode tree will be destroyed when a new value is
   * rendered or when the button is destroyed.
   * @param listParams Parameters to pass to the selection list dialog, or a function which will return the parameters
   * when called each time the list is opened.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @param hideDropdownArrow Whether to hide the button's dropdown arrow. Defaults to `false`.
   * @returns A button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<S extends MutableSubscribable<any, any>>(
    state: S,
    renderValue?: VNode | ((stateValue: SubscribableType<S>) => string | VNode),
    listParams?: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>),
    cssClass?: string,
    hideDropdownArrow?: boolean
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 84 : 42;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const modifyListParams = (inputListParams: UiListDialogParams<MutableSubscribableInputType<S>>): UiListDialogParams<MutableSubscribableInputType<S>> => {
      const modified = Object.assign({}, inputListParams);

      modified.itemsPerPage ??= Math.min(inputListParams.inputData.length, 5);
      modified.listItemHeightPx ??= defaultListItemHeight;
      modified.listItemSpacingPx ??= defaultListItemSpacing;
      modified.autoDisableOverscroll ??= true;
      modified.class ??= 'pfd-setup-view-select-list';

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
        hideDropdownArrow={hideDropdownArrow}
        isInList
        class={cssClass}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.pfdSplitScreenSide.destroy();
    'destroy' in this.svtFpmButtonState && this.svtFpmButtonState.destroy();
    'destroy' in this.svtTrafficButtonState && this.svtTrafficButtonState.destroy();

    super.destroy();
  }
}