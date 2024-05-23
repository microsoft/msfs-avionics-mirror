import {
  CdiControlEventsForId, ConsumerSubject, FSComponent, FlightTimerEventsForId, FlightTimerUtils, MinimumsControlEvents,
  MinimumsMode, NavSourceType, SetSubject, SubscribableUtils, Subscription, UserSetting, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { GarminTimerControlEventsForId, GarminTimerManager, MinimumsDataProvider } from '@microsoft/msfs-garminsdk';

import { PfdInsetRegistrar } from '../../../GduDisplay/Gdu460/PfdInstruments/Inset/PfdInsetRegistrar';
import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { G3XCdiId } from '../../../Shared/CommonTypes';
import { UserTimerValueDisplay } from '../../../Shared/Components/Timer/UserTimerValueDisplay';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { NavSourceFormatter } from '../../../Shared/Graphics/Text/NavSourceFormatter';
import { G3XTouchNavIndicator } from '../../../Shared/NavReference/G3XTouchNavReference';
import { FplSourceUserSettings, G3XFplSourceSettingMode } from '../../../Shared/Settings/FplSourceUserSettings';
import { PfdBearingPointerSource, PfdUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { ListDialogItemDefinition } from '../../Dialogs/UiListDialog';
import { BaroMinimumDialog } from '../BaroMinimumDialog/BaroMinimumDialog';

import './PfdOptionsView.css';

/**
 * Component props for PfdOptionsView.
 */
export interface PfdOptionsViewProps extends UiViewProps {
  /** A registrar for PFD insets. */
  insetRegistrar: PfdInsetRegistrar;

  /** The nav indicator for the active navigation source. */
  activeNavIndicator: G3XTouchNavIndicator;

  /** A provider of minimums data. */
  minimumsDataProvider: MinimumsDataProvider;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;

  /** The number of supported external flight plan sources. */
  externalFplSourceCount: 0 | 1 | 2;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;
}

/**
 * A PFD options menu.
 */
export class PfdOptionsView extends AbstractUiView<PfdOptionsViewProps> {
  private static readonly BEARING_POINTER_SOURCES: readonly PfdBearingPointerSource[] = [
    PfdBearingPointerSource.None,
    PfdBearingPointerSource.Gps,
    PfdBearingPointerSource.Nav1,
    PfdBearingPointerSource.Nav2,
    PfdBearingPointerSource.NearestAirport
  ];

  private thisNode?: VNode;

  private readonly publisher = this.props.uiService.bus.getPublisher<
    CdiControlEventsForId<G3XCdiId> & MinimumsControlEvents & GarminTimerControlEventsForId<'g3x'>
  >();

  private readonly cdiSourceButtonCssClass = SetSubject.create(['pfd-options-view-cdi-source-button']);

  private readonly timerValue = ConsumerSubject.create(null, 0).pause();
  private readonly isTimerRunning = ConsumerSubject.create(null, false).pause();

  private readonly selectListItemHeight = this.props.uiService.gduFormat === '460' ? 76 : 38;
  private readonly selectListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

  private readonly subscriptions: Subscription[] = [
    this.timerValue,
    this.isTimerRunning
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    const sub = this.props.uiService.bus.getSubscriber<FlightTimerEventsForId<'g3x'>>();

    this.subscriptions.push(
      this.props.activeNavIndicator.source.sub(source => {
        this.cdiSourceButtonCssClass.toggle('pfd-options-view-cdi-source-button-gps', source !== null && source.getType() === NavSourceType.Gps);
      }, true)
    );

    this.isTimerRunning.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_is_running'));
    this.timerValue.setConsumer(FlightTimerUtils.onEvent('g3x', GarminTimerManager.GENERIC_TIMER_INDEX, sub, 'timer_value_ms'));

    this.focusController.knobLabelState.pipe(this._knobLabelState);

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isTimerRunning.resume();
    this.timerValue.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isTimerRunning.pause();
    this.timerValue.pause();

    this.focusController.clearRecentFocus();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
        popupType: 'slideout-bottom-full',
        backgroundOcclusion: 'hide'
      });
      return true;
    }

    return super.onUiInteractionEvent(event);
  }

  /**
   * Responds to when this menu's FPL source button is pressed.
   * @param button The button that was pressed.
   * @param sourceSetting The flight plan data source user setting.
   */
  private onFplSourceButtonPressed(button: UiValueTouchButton<any>, sourceSetting: UserSetting<G3XFplSourceSettingMode>): void {
    if (sourceSetting.value === G3XFplSourceSettingMode.Internal) {
      sourceSetting.value = G3XFplSourceSettingMode.External;
    } else {
      sourceSetting.value = G3XFplSourceSettingMode.Internal;
    }
  }

  /**
   * Responds to when this menu's CDI source button is pressed.
   */
  private onCdiSourceButtonPressed(): void {
    this.publisher.pub('cdi_src_switch_g3x', undefined, true, false);
  }

  /**
   * Responds to when this menu's timer start/stop button is pressed.
   */
  private onTimerButtonPressed(): void {
    if (this.isTimerRunning.get()) {
      this.publisher.pub('garmin_gen_timer_stop_g3x_1', undefined, true, false);
    } else {
      this.publisher.pub('garmin_gen_timer_start_g3x_1', undefined, true, false);
    }
  }

  /**
   * Responds to when this menu's timer reset button is pressed.
   */
  private onTimerResetButtonPressed(): void {
    this.publisher.pub('garmin_gen_timer_stop_g3x_1', undefined, true, false);
    this.publisher.pub('garmin_gen_timer_set_value_g3x_1', 0, true, false);
  }

  /**
   * Responds to when this menu's minimums button is pressed.
   */
  private async onMinimumsButtonPressed(): Promise<void> {
    // TODO: The real unit seems to set the dialog's initial value to field elevation (runway elevation?) when an
    // approach/destination airport is loaded in the flight plan. It may also set the initial value to indicated
    // altitude when on the ground (need more research to confirm).
    const initialValue = this.props.minimumsDataProvider.baroMinimums.get();

    const result = await this.props.uiService
      .openMfdPopup<BaroMinimumDialog>(UiViewStackLayer.Overlay, UiViewKeys.BaroMinimumDialog, true)
      .ref.request({
        initialValue
      });

    if (!result.wasCancelled) {
      if (result.payload.clear) {
        this.publisher.pub('set_minimums_mode', MinimumsMode.OFF);
        this.publisher.pub('set_decision_altitude_feet', 0, true, true);
      } else {
        this.publisher.pub('set_minimums_mode', MinimumsMode.BARO);
        this.publisher.pub('set_decision_altitude_feet', result.payload.value, true, true);
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='pfd-options-view-wrapper'>
        <div class='pfd-options-view ui-view-panel'>
          <div class='pfd-options-view-title'>PFD Options</div>
          {this.renderRow1()}
          {this.props.uiService.gduFormat === '460' && (
            <div class='pfd-options-view-row pfd-options-view-row-2'>
              <div class='ui-view-box pfd-options-view-box pfd-options-view-box-inset'>
                <div class='ui-view-box-title'>Inset Windows</div>
                {this.renderInsetSelectButton('left')}
                <div class='pfd-options-view-divider' />
                {this.renderInsetSelectButton('right')}
              </div>
            </div>
          )}
          <div class='pfd-options-view-row pfd-options-view-row-3'>
            <div class='ui-view-box pfd-options-view-box pfd-options-view-box-bearing'>
              <div class='ui-view-box-title'>Bearing Pointers</div>
              <div class='pfd-options-view-box-bearing-spacer' />
              {this.renderBearingPointerSelectButton(1)}
              <div class='pfd-options-view-box-bearing-spacer' />
              <div class='pfd-options-view-divider' />
              <div class='pfd-options-view-box-bearing-spacer' />
              {this.renderBearingPointerSelectButton(2)}
              <div class='pfd-options-view-box-bearing-spacer' />
            </div>
          </div>
          <div class='pfd-options-view-row pfd-options-view-row-4'>
            <div class='ui-view-box pfd-options-view-box pfd-options-view-box-timer'>
              <div class='ui-view-box-title'>Timer</div>
              <div class='pfd-options-view-spacer pfd-options-view-box-timer-spacer' />
              <UiValueTouchButton
                state={this.timerValue}
                renderValue={
                  <UserTimerValueDisplay
                    value={this.timerValue}
                    isRunning={this.isTimerRunning}
                  />
                }
                label={this.isTimerRunning.map(isRunning => isRunning ? 'Stop' : 'Start')}
                onPressed={this.onTimerButtonPressed.bind(this)}
                focusController={this.focusController}
                class='pfd-options-view-timer-button'
              />
              <div class='pfd-options-view-spacer pfd-options-view-box-timer-spacer' />
              <UiTouchButton
                label={'Reset'}
                onPressed={this.onTimerResetButtonPressed.bind(this)}
                focusController={this.focusController}
                class='pfd-options-view-timer-reset-button'
              />
              <div class='pfd-options-view-spacer pfd-options-view-box-timer-spacer' />
            </div>
            <div class='pfd-options-view-spacer pfd-options-view-row-spacer' />
            <div class='ui-view-box pfd-options-view-box pfd-options-view-box-mins'>
              <div class='ui-view-box-title'>Minimums</div>
              <UiTouchButton
                label='Set...'
                onPressed={this.onMinimumsButtonPressed.bind(this)}
                focusController={this.focusController}
                class='pfd-options-view-mins-button'
              />
            </div>
            <div class='pfd-options-view-spacer pfd-options-view-row-spacer' />
            <div class='pfd-options-view-spacer pfd-options-view-row-spacer pfd-options-view-row-spacer-collapsible' />
            <UiTouchButton
              label={'More\nOptions...'}
              onPressed={() => { this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.PfdSetup, true, { popupType: 'slideout-right-full' }); }}
              focusController={this.focusController}
              class='pfd-options-view-more-options-button'
            />
            <div class='pfd-options-view-spacer pfd-options-view-row-spacer pfd-options-view-row-spacer-collapsible' />
          </div>
          <div class='pfd-options-view-menu-msg'>
            <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='pfd-options-view-main-menu-icon' /> for Main Menu
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders this view's first row.
   * @returns This view's first row, as a VNode, or `null` if the first row is omitted.
   */
  private renderRow1(): VNode | null {
    const items: VNode[] = [];

    const fplSourceSetting = FplSourceUserSettings.getManager(this.props.uiService.bus).getSetting('fplSource');

    if (this.props.externalFplSourceCount > 0) {
      items.push(
        <div class='ui-view-box pfd-options-view-box pfd-options-view-box-fpl-source'>
          <div class='ui-view-box-title'>FPL Source</div>
          <UiValueTouchButton
            state={fplSourceSetting}
            renderValue={source => {
              switch (source) {
                case G3XFplSourceSettingMode.Internal:
                  return 'Internal';
                case G3XFplSourceSettingMode.External:
                  return 'External\nGPS';
                default:
                  return '';
              }
            }}
            onPressed={this.onFplSourceButtonPressed.bind(this)}
            focusController={this.focusController}
            class='pfd-options-view-fpl-source-button'
          />
        </div>
      );
    }

    if (this.props.externalFplSourceCount > 0 || this.props.radiosConfig.navCount > 0) {
      const isEnabled = this.props.externalFplSourceCount === 0
        ? true
        : fplSourceSetting.map(setting => {
          return setting === G3XFplSourceSettingMode.External
            ? this.props.externalFplSourceCount > 1
            : this.props.radiosConfig.navCount > 0;
        });

      if (SubscribableUtils.isSubscribable(isEnabled)) {
        this.subscriptions.push(isEnabled);
      }

      items.push(
        <div class='ui-view-box pfd-options-view-box pfd-options-view-box-cdi-source'>
          <div class='ui-view-box-title'>CDI Source</div>
          <UiValueTouchButton
            isEnabled={isEnabled}
            state={this.props.activeNavIndicator.source}
            renderValue={
              NavSourceFormatter.createForIndicator(false, this.props.radiosConfig.navCount > 1, false)
                .bind(undefined, this.props.activeNavIndicator)
            }
            onPressed={this.onCdiSourceButtonPressed.bind(this)}
            focusController={this.focusController}
            class={this.cdiSourceButtonCssClass}
          />
        </div>
      );
    }

    if (items.length > 0) {
      return (
        <div class='pfd-options-view-row pfd-options-view-row-1'>
          {items}
        </div>
      );
    } else {
      return null;
    }
  }

  /**
   * Renders a PFD inset selection button.
   * @param side The inset side that the button controls.
   * @returns A PFD inset selection button, as a VNode.
   */
  private renderInsetSelectButton(side: 'left' | 'right'): VNode {
    let onsideSetting: UserSetting<string>;
    let crosssideSetting: UserSetting<string>;

    if (side === 'left') {
      onsideSetting = this.props.pfdSettingManager.getSetting('pfdInsetLeftKey');
      crosssideSetting = this.props.pfdSettingManager.getSetting('pfdInsetRightKey');
    } else {
      onsideSetting = this.props.pfdSettingManager.getSetting('pfdInsetRightKey');
      crosssideSetting = this.props.pfdSettingManager.getSetting('pfdInsetLeftKey');
    }

    const insetDefs = this.props.insetRegistrar.getRegisteredInsetsArray();

    const allInputData: ListDialogItemDefinition<string>[] = insetDefs.map(def => {
      return {
        value: def.key,
        labelRenderer: () => def.selectLabel,
        isEnabled: def.factory !== undefined
      };
    });

    allInputData.unshift({
      value: '',
      labelRenderer: () => 'Off'
    });

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        state={onsideSetting}
        renderValue={value => value === '' ? 'Off' : insetDefs.find(def => def.key === value)?.selectLabel ?? ''}
        listParams={() => {
          const inputData = allInputData.filter(data => data.value === '' || data.value !== crosssideSetting.value);
          return {
            selectedValue: onsideSetting,
            inputData,
            listItemHeightPx: this.selectListItemHeight,
            listItemSpacingPx: this.selectListItemSpacing,
            itemsPerPage: Math.min(inputData.length, 6),
            autoDisableOverscroll: true,
            class: 'pfd-options-view-select-dialog pfd-options-view-inset-select-dialog'
          };
        }}
        onSelected={(value, state) => {
          if (value === '' || value !== crosssideSetting.value) {
            state.value = value;
          }
        }}
        focusController={this.focusController}
        class='pfd-options-view-inset-button'
      />
    );
  }

  /**
   * Renders a PFD bearing pointer selection button.
   * @param index The bearing pointer index that the button controls.
   * @returns A PFD bearing pointer selection button, as a VNode.
   */
  private renderBearingPointerSelectButton(index: 1 | 2): VNode {
    let onsideSetting: UserSetting<PfdBearingPointerSource>;
    let crosssideSetting: UserSetting<PfdBearingPointerSource>;

    if (index === 1) {
      onsideSetting = this.props.pfdSettingManager.getSetting('pfdBearingPointer1Source');
      crosssideSetting = this.props.pfdSettingManager.getSetting('pfdBearingPointer2Source');
    } else {
      onsideSetting = this.props.pfdSettingManager.getSetting('pfdBearingPointer2Source');
      crosssideSetting = this.props.pfdSettingManager.getSetting('pfdBearingPointer1Source');
    }

    const sourceRenderer = PfdOptionsView.createBearingPointerSourceRenderer(this.props.radiosConfig.navCount);

    const allInputData = PfdOptionsView.BEARING_POINTER_SOURCES
      .filter(source => {
        switch (source) {
          case PfdBearingPointerSource.Nav1:
            return this.props.radiosConfig.navCount > 0;
          case PfdBearingPointerSource.Nav2:
            return this.props.radiosConfig.navCount > 1;
          default:
            return true;
        }
      })
      .map(source => {
        return {
          value: source,
          labelRenderer: sourceRenderer.bind(undefined, source)
        };
      });

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        state={onsideSetting}
        renderValue={sourceRenderer}
        listParams={() => {
          const inputData = allInputData.filter(data => data.value === PfdBearingPointerSource.None || data.value !== crosssideSetting.value);
          return {
            selectedValue: onsideSetting,
            inputData,
            listItemHeightPx: this.selectListItemHeight,
            listItemSpacingPx: this.selectListItemSpacing,
            itemsPerPage: Math.min(inputData.length, 6),
            autoDisableOverscroll: true,
            class: 'pfd-options-view-select-dialog pfd-options-view-brg-pointer-select-dialog'
          };
        }}
        onSelected={(value, state) => {
          if (value === PfdBearingPointerSource.None || value !== crosssideSetting.value) {
            state.value = value;
          }
        }}
        focusController={this.focusController}
        class='pfd-options-view-brg-pointer-button'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Creates a function that renders label text for bearing pointer sources.
   * @param navRadioCount The number of supported NAV radios.
   * @returns A function that renders label text for bearing pointer sources.
   */
  private static createBearingPointerSourceRenderer(navRadioCount: number): (source: PfdBearingPointerSource) => string {
    return (source: PfdBearingPointerSource): string => {
      switch (source) {
        case PfdBearingPointerSource.None:
          return 'Off';
        case PfdBearingPointerSource.Nav1:
          return navRadioCount > 1 ? 'VLOC1' : 'VLOC';
        case PfdBearingPointerSource.Nav2:
          return navRadioCount > 1 ? 'VLOC2' : 'VLOC';
        // TODO: Add proper GPS1/2 logic.
        case PfdBearingPointerSource.Gps:
          return 'GPS';
        case PfdBearingPointerSource.NearestAirport:
          return 'Nearest\nAirport';
        default:
          return '';
      }
    };
  }
}