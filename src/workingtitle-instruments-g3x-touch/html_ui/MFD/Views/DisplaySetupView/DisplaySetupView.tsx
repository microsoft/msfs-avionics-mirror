import {
  ArraySubject, ArrayUtils, ConsumerSubject, FSComponent, MutableSubscribable, MutableSubscribableInputType, Subject,
  SubscribableType, Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { PfdPageDefinition } from '../../../PFD/PfdPage/PfdPageDefinition';
import { AvionicsConfig } from '../../../Shared/AvionicsConfig/AvionicsConfig';
import { G3XBacklightEvents } from '../../../Shared/Backlight/G3XBacklightEvents';
import { G3XChartsSource } from '../../../Shared/Charts/G3XChartsSource';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { CombinedTouchButton } from '../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiSetValueTouchButton } from '../../../Shared/Components/TouchButton/UiSetValueTouchButton';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchSlider } from '../../../Shared/Components/TouchSlider/UiTouchSlider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { InstrumentConfig } from '../../../Shared/InstrumentConfig/InstrumentConfig';
import { BacklightControlSettingMode, BacklightUserSettings } from '../../../Shared/Settings/BacklightUserSettings';
import { DisplayLocationSettingMode, DisplayScreenSideSettingMode, DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { G3XChartsColorModeSettingMode, G3XChartsUserSettingTypes } from '../../../Shared/Settings/G3XChartsUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { ListDialogItemDefinition, UiListDialogParams } from '../../Dialogs/UiListDialog';

import './DisplaySetupView.css';

/**
 * Component props for DisplaySetupView.
 */
export interface DisplaySetupViewProps extends UiViewProps {
  /** A manager for display user settings. */
  displaySettingManager: UserSettingManager<DisplayUserSettingTypes>;

  /** A manager for electronic charts user settings. */
  chartsSettingManager: UserSettingManager<G3XChartsUserSettingTypes>;

  /** The general avionics configuration object. */
  config: AvionicsConfig;

  /** The configuration object of the view's parent instrument. */
  instrumentConfig: InstrumentConfig;

  /**
   * An iterable of definitions for PFD pages in the order in which the pages should appear in the view's MFD Split
   * Screen Page selection list.
   */
  pfdPageDefs: Iterable<Readonly<PfdPageDefinition>>;

  /** All available electronic charts sources. */
  chartsSources: Iterable<G3XChartsSource>;
}

/**
 * An item in {@link DisplaySetupView}'s list.
 */
type DisplaySetupViewItem = DynamicListData & {
  /** A function that renders this item. */
  renderItem: () => VNode;
};

/**
 * A display setup menu.
 */
export class DisplaySetupView extends AbstractUiView<DisplaySetupViewProps> {
  private static readonly BACKLIGHT_INTENSITY_STOPS = ArrayUtils.range(101, 0, 0.01);

  private readonly backlightLevel = ConsumerSubject.create(null, 1).pause();
  private readonly backlightLevelText = this.backlightLevel.map(level => `${(level * 100).toFixed(0)}%`);

  private readonly backlightSettingManager = BacklightUserSettings.getManager(this.props.uiService.bus);

  private readonly isBacklightIntensityVisible = this.backlightSettingManager.getSetting('displayBacklightMode').map(settingMode => {
    return settingMode === BacklightControlSettingMode.Manual;
  }).pause();

  private readonly pfdPageDefs = Array.from(this.props.pfdPageDefs);

  private readonly chartsSources = new Map(Array.from(this.props.chartsSources).map(source => [source.uid, source]));
  private readonly isChartColorModeVisible = this.props.chartsSettingManager.getSetting('chartsPreferredSource').map(source => {
    return this.chartsSources.get(source)?.supportsNightMode === true;
  }).pause();

  private readonly listRef = FSComponent.createRef<UiList<any>>();
  private readonly listData = ArraySubject.create<DisplaySetupViewItem>(this.createListData());

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  private readonly subscriptions: Subscription[] = [
    this.backlightLevel,
    this.isBacklightIntensityVisible,
    this.isChartColorModeVisible,
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    this.backlightLevel.setConsumer(
      this.props.uiService.bus.getSubscriber<G3XBacklightEvents>()
        .on(`g3x_backlight_screen_level_${this.props.uiService.gduIndex}`)
        .withPrecision(2)
    );

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
    for (const sub of this.subscriptions) {
      sub.resume();
    }

    this.listRef.instance.scrollToIndex(0, 0, true, false);
  }

  /** @inheritDoc */
  public onClose(): void {
    for (const sub of this.subscriptions) {
      sub.pause();
    }

    this.listRef.instance.clearRecentFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    // TODO: support GDU470 (portrait)
    return (
      <div class='display-setup-view ui-titled-view'>
        <div class='display-setup-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_display_setup.png`} class='ui-view-title-icon' />
          <div>Display Setup</div>
        </div>
        <div class='display-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            data={this.listData}
            renderItem={item => item.renderItem()}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            autoDisableOverscroll
            autoRefocus
            class='display-setup-view-list'
          />
        </div>
      </div>
    );
  }

  /**
   * Creates this view's list data array.
   * @returns This view's list data array.
   */
  private createListData(): DisplaySetupViewItem[] {
    const backlightModeInputData: ListDialogItemDefinition<BacklightControlSettingMode>[] = [
      {
        value: BacklightControlSettingMode.Manual,
        labelRenderer: () => 'Manual'
      },
      {
        value: BacklightControlSettingMode.PhotoCell,
        labelRenderer: () => 'Photo Cell'
      }
    ];

    if (this.props.instrumentConfig.backlight.lightBus !== undefined) {
      backlightModeInputData.splice(1, 0, {
        value: BacklightControlSettingMode.LightBus,
        labelRenderer: () => 'Light Bus'
      });
    }

    const data: (DisplaySetupViewItem | undefined)[] = [
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left display-setup-view-row-backlight-mode-left'>
              <div>Backlight Control</div>
              <div class='display-setup-view-backlight-level'>{this.backlightLevelText}</div>
            </div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.backlightSettingManager.getSetting('displayBacklightMode'),
                mode => {
                  switch (mode) {
                    case BacklightControlSettingMode.Manual:
                      return 'Manual';
                    case BacklightControlSettingMode.LightBus:
                      return 'Light Bus';
                    case BacklightControlSettingMode.PhotoCell:
                      return 'Photo Cell';
                    default:
                      return '';
                  }
                },
                {
                  selectedValue: this.backlightSettingManager.getSetting('displayBacklightMode'),
                  inputData: backlightModeInputData
                },
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        isVisible: this.isBacklightIntensityVisible,
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Backlight Intensity</div>
            <UiListFocusable>
              <UiTouchSlider
                bus={this.props.uiService.bus}
                orientation='to-right'
                state={this.backlightSettingManager.getSetting('displayBacklightManualLevel')}
                stops={DisplaySetupView.BACKLIGHT_INTENSITY_STOPS}
                background={
                  <div class='display-setup-view-backlight-slider-background' />
                }
                foreground={
                  <div class='display-setup-view-backlight-slider-foreground' />
                }
                inset={
                  <div class='display-setup-view-backlight-slider-inset' >
                    <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='display-setup-view-backlight-slider-occlude'>
                      <path d='M 0 0 h 100 l -100 100 Z' />
                    </svg>
                    <div class='display-setup-view-backlight-slider-inset-overlay' />
                  </div>
                }
                gduFormat={this.props.uiService.gduFormat}
                changeValueOnDrag
                inhibitOnDrag
                class='display-setup-view-backlight-slider'
              />
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>{this.props.uiService.instrumentType} Startup Page</div>
            <UiListFocusable>
              <CombinedTouchButton
                orientation='row'
                canBeFocused={false}
              >
                <UiToggleTouchButton
                  state={this.props.displaySettingManager.getSetting('displayStartupSplitMode')}
                  label='Split'
                />
                {this.renderListSelectButton(
                  Subject.create('Auto'),
                  undefined,
                  undefined,
                  undefined,
                  true
                )}
              </CombinedTouchButton>
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Toggle Split Screen Layout With BACK Key</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.props.displaySettingManager.getSetting('displayToggleSplitWithBack'),
                toggle => toggle ? 'Enabled' : 'Disabled',
                {
                  selectedValue: this.props.displaySettingManager.getSetting('displayToggleSplitWithBack'),
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
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      this.props.uiService.instrumentType === 'MFD' ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>{this.props.uiService.instrumentType} Split Screen Page</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.props.displaySettingManager.getSetting('displayMfdSplitScreenPageKey'),
                key => this.pfdPageDefs.find(def => def.key === key)?.selectLabel ?? '',
                {
                  selectedValue: this.props.displaySettingManager.getSetting('displayMfdSplitScreenPageKey'),
                  inputData: this.pfdPageDefs.map(def => {
                    return {
                      value: def.key,
                      labelRenderer: () => def.selectLabel,
                      isEnabled: def.factory !== undefined
                    };
                  })
                },
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>{this.props.uiService.instrumentType} Split Screen Side</div>
            <UiListFocusable>
              {this.renderLeftRightCombinedButton(
                this.props.displaySettingManager.getSetting('displayPfdPaneSide'),
                'display-setup-view-row-right',
                this.props.uiService.instrumentType === 'PFD'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      this.props.uiService.gdu460EisSize !== undefined ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>EIS Display Location</div>
            <UiListFocusable>
              {this.renderDisplayLocationSelectButton(
                this.props.displaySettingManager.getSetting('displayEisLocation'),
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      this.props.uiService.gdu460EisSize !== undefined ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>{this.props.uiService.instrumentType} EIS Screen Side</div>
            <UiListFocusable>
              {this.renderLeftRightCombinedButton(
                this.props.displaySettingManager.getSetting('displayEisScreenSide'),
                'display-setup-view-row-right',
                false
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      this.props.config.radios.comCount > 0 ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>COM Radio Display Location</div>
            <UiListFocusable>
              {this.renderDisplayLocationSelectButton(
                this.props.displaySettingManager.getSetting('displayComRadioLocation'),
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      this.props.config.radios.navCount > 0 ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>NAV Radio Display Location</div>
            <UiListFocusable>
              {this.renderDisplayLocationSelectButton(
                this.props.displaySettingManager.getSetting('displayNavRadioLocation'),
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      this.props.config.audio.audioPanel !== undefined ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Audio Panel Display Location</div>
            <UiListFocusable>
              {this.renderDisplayLocationSelectButton(
                this.props.displaySettingManager.getSetting('displayAudioPanelLocation'),
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      this.props.config.transponder !== undefined ? {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Transponder Display Location</div>
            <UiListFocusable>
              {this.renderDisplayLocationSelectButton(
                this.props.displaySettingManager.getSetting('displayTransponderLocation'),
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      } : undefined,
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Knob Zoom Action</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.props.displaySettingManager.getSetting('displayKnobZoomReverse'),
                toggle => toggle ? 'Reverse' : 'Normal',
                {
                  selectedValue: this.props.displaySettingManager.getSetting('displayKnobZoomReverse'),
                  inputData: [
                    {
                      value: false,
                      labelRenderer: () => 'Normal'
                    },
                    {
                      value: true,
                      labelRenderer: () => 'Reverse'
                    }
                  ]
                },
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      ...this.createChartsListData(),
    ];

    return data.filter((item): item is DisplaySetupViewItem => !!item);
  }

  /**
   * Creates this view's electronic charts-related list data.
   * @returns This view's electronic charts-related list data.
   */
  private createChartsListData(): DisplaySetupViewItem[] {
    if (this.chartsSources.size === 0) {
      return [];
    }

    return [
      {
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Preferred Chart Source</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.props.chartsSettingManager.getSetting('chartsPreferredSource'),
                source => this.chartsSources.get(source)?.name ?? '',
                {
                  selectedValue: this.props.chartsSettingManager.getSetting('chartsPreferredSource'),
                  inputData: Array.from(this.chartsSources.values()).map(source => {
                    return {
                      value: source.uid,
                      labelRenderer: () => source.name,
                    };
                  })
                },
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        isVisible: this.isChartColorModeVisible,
        renderItem: () => (
          <UiListItem>
            <div class='display-setup-view-row-left'>Chart Color Mode</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.props.chartsSettingManager.getSetting('chartsColorMode'),
                mode => {
                  switch (mode) {
                    case G3XChartsColorModeSettingMode.Day:
                      return 'Day';
                    case G3XChartsColorModeSettingMode.Night:
                      return 'Night';
                    case G3XChartsColorModeSettingMode.Auto:
                      return 'Auto';
                    default:
                      return '';
                  }
                },
                {
                  selectedValue: this.props.chartsSettingManager.getSetting('chartsColorMode'),
                  inputData: [
                    {
                      value: G3XChartsColorModeSettingMode.Day,
                      labelRenderer: () => 'Day',
                    },
                    {
                      value: G3XChartsColorModeSettingMode.Night,
                      labelRenderer: () => 'Night',
                    },
                    {
                      value: G3XChartsColorModeSettingMode.Auto,
                      labelRenderer: () => 'Auto',
                    },
                  ],
                },
                'display-setup-view-row-right'
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
    ];
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
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @param hideDropdownArrow Whether to hide the button's dropdown arrow. Defaults to `false`.
   * @returns A button that displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<S extends MutableSubscribable<any, any>>(
    state: S,
    renderValue?: VNode | ((stateValue: SubscribableType<S>) => string | VNode),
    listParams?: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>),
    cssClass?: string,
    hideDropdownArrow?: boolean
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 66 : 33;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const modifyListParams = (inputListParams: UiListDialogParams<MutableSubscribableInputType<S>>): UiListDialogParams<MutableSubscribableInputType<S>> => {
      const modified = Object.assign({}, inputListParams);

      modified.itemsPerPage ??= Math.min(inputListParams.inputData.length, 5);
      modified.listItemHeightPx ??= defaultListItemHeight;
      modified.listItemSpacingPx ??= defaultListItemSpacing;
      modified.autoDisableOverscroll ??= true;
      modified.class ??= 'display-setup-view-select-list';

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

  /**
   * Renders a button that displays a display location setting value and when pressed, allows the user to select a
   * value for the setting from a list dialog.
   * @param state The state to which to bind the button.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button that displays a display location setting value and when pressed, allows the user to select a
   * value for the setting from a list dialog, as a VNode.
   */
  private renderDisplayLocationSelectButton(
    state: MutableSubscribable<DisplayLocationSettingMode>,
    cssClass?: string
  ): VNode {
    return this.renderListSelectButton(
      state,
      location => {
        switch (location) {
          case DisplayLocationSettingMode.MFD:
            return 'MFD';
          case DisplayLocationSettingMode.PFD:
            return 'PFD';
          case DisplayLocationSettingMode.Both:
            return 'Both';
          default:
            return '';
        }
      },
      {
        selectedValue: state,
        inputData: [
          {
            value: DisplayLocationSettingMode.MFD,
            labelRenderer: () => 'MFD'
          },
          {
            value: DisplayLocationSettingMode.PFD,
            labelRenderer: () => 'PFD'
          },
          {
            value: DisplayLocationSettingMode.Both,
            labelRenderer: () => 'Both'
          }
        ]
      },
      cssClass
    );
  }

  /**
   * Renders a combined button that contains two set-value touch buttons that toggle a state between the 'Left' and
   * 'Right' members of `DisplayScreenSideSettingMode`.
   * @param state The state to which to bind the buttons.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @param invert Whether to invert the nominal values of 'Left' and 'Right', such that the 'Left' button toggles the
   * state to `DisplayScreenSideSettingMode.Right` and the 'Right' button toggles the state to
   * `DisplayScreenSideSettingMode.Left`.
   * @param isEnabled Whether the buttons are enabled. Defaults to `true`.
   * @returns A combined button that contains two set-value touch buttons that toggle a state between the 'Left' and
   * 'Right' members of `DisplayScreenSideSettingMode`.
   */
  private renderLeftRightCombinedButton(
    state: MutableSubscribable<DisplayScreenSideSettingMode>,
    cssClass?: string,
    invert?: boolean,
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
              state.set(state.get() === DisplayScreenSideSettingMode.Left ? DisplayScreenSideSettingMode.Right : DisplayScreenSideSettingMode.Left);
              return true;
            default:
              return false;
          }
        }}
        class={cssClass}
      >
        <UiSetValueTouchButton
          state={state}
          setValue={invert ? DisplayScreenSideSettingMode.Right : DisplayScreenSideSettingMode.Left}
          isEnabled={isEnabled}
          label='Left'
        />
        <UiSetValueTouchButton
          state={state}
          setValue={invert ? DisplayScreenSideSettingMode.Left : DisplayScreenSideSettingMode.Right}
          isEnabled={isEnabled}
          label='Right'
        />
      </CombinedTouchButton>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
