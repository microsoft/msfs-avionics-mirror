import { ArrayUtils, ConsumerSubject, FSComponent, MathUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { BacklightConfig } from '../../../Shared/Backlight/BacklightConfig';
import { G3XBacklightEvents } from '../../../Shared/Backlight/G3XBacklightEvents';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiTouchSlider } from '../../../Shared/Components/TouchSlider/UiTouchSlider';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { BacklightControlSettingMode, BacklightUserSettings } from '../../../Shared/Settings/BacklightUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { ListDialogItemDefinition } from '../../Dialogs/UiListDialog';

import './BacklightIntensityPopup.css';

/**
 * Component props for {@link BacklightIntensityPopup}.
 */
export interface BacklightIntensityPopupProps extends UiViewProps {
  /** A configuration object defining options for backlighting. */
  backlightConfig: BacklightConfig;
}

/**
 * A popup that allows the user choose a display backlight control mode and adjust the manual backlight intensity
 * setting.
 */
export class BacklightIntensityPopup extends AbstractUiView<BacklightIntensityPopupProps> {
  private static readonly SLIDER_STOPS = ArrayUtils.range(101, 0, 0.01);

  private static readonly INTENSITY_INCREMENT_LARGE = 0.1;
  private static readonly INTENSITY_INCREMENT_SMALL = 0.01;

  private thisNode?: VNode;

  private readonly backlightSettingManager = BacklightUserSettings.getManager(this.props.uiService.bus);

  private readonly backlightLevel = ConsumerSubject.create(null, 1).pause();
  private readonly backlightLevelText = this.backlightLevel.map(level => `${(level * 100).toFixed(0)}%`);

  private readonly isSliderEnabled = this.backlightSettingManager.getSetting('displayBacklightMode').map(mode => {
    return mode === BacklightControlSettingMode.Manual;
  }).pause();

  private sliderEnabledSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.backlightLevel.setConsumer(
      this.props.uiService.bus.getSubscriber<G3XBacklightEvents>()
        .on(`g3x_backlight_screen_level_${this.props.uiService.gduIndex}`)
        .withPrecision(2)
    );

    this.sliderEnabledSub = this.isSliderEnabled.sub(this.onSliderEnabledChanged.bind(this), false, true);

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();

    if (!this.focusController.focusedComponent.get()) {
      this.focusController.focusFirst();
    }

    this.sliderEnabledSub!.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();

    this.sliderEnabledSub!.pause();
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.backlightLevel.resume();
    this.isSliderEnabled.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.backlightLevel.pause();
    this.isSliderEnabled.pause();

    this.focusController.clearRecentFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when whether this popup's slider is enabled changes.
   * @param isEnabled Whether this popup's slider is enabled.
   */
  private onSliderEnabledChanged(isEnabled: boolean): void {
    if (isEnabled) {
      this.focusController.focusFirst();
    }
  }

  /**
   * Changes the manual backlight level. This method does nothing if the manual backlight control mode is not selected.
   * @param delta The amount by which to change the backlight level.
   */
  private changeManualBacklightLevel(delta: number): void {
    if (!this.isSliderEnabled.get()) {
      return;
    }

    const setting = this.backlightSettingManager.getSetting('displayBacklightManualLevel');
    setting.value = MathUtils.clamp(MathUtils.round(setting.value + delta, 0.01), 0, 1);
  }

  /**
   * Responds to when this popup's slider's value changes due to user input.
   * @param value The new slider value.
   */
  private onSliderValueChanged(value: number): void {
    if (!this.isSliderEnabled.get()) {
      return;
    }

    const setting = this.backlightSettingManager.getSetting('displayBacklightManualLevel');
    setting.value = MathUtils.clamp(value, 0, 1);
  }

  /**
   * Responds to when this popup's slider gains UI focus.
   */
  private onSliderFocusGained(): void {
    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Large Step'],
      [UiKnobId.LeftOuter, 'Large Step'],
      [UiKnobId.RightOuter, 'Large Step'],
      [UiKnobId.SingleInner, 'Small Step'],
      [UiKnobId.LeftInner, 'Small Step'],
      [UiKnobId.RightInner, 'Small Step']
    ]);
  }

  /**
   * Responds to when this popup's slider loses UI focus.
   */
  private onSliderFocusLost(): void {
    this._knobLabelState.clear();
  }

  /**
   * Responds to when this popup's slider receives a UI interaction event.
   * @param event The received event.
   * @returns Whether the event was handled.
   */
  private onSliderUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.changeManualBacklightLevel(-BacklightIntensityPopup.INTENSITY_INCREMENT_LARGE);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.changeManualBacklightLevel(-BacklightIntensityPopup.INTENSITY_INCREMENT_SMALL);
        return true;
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.changeManualBacklightLevel(BacklightIntensityPopup.INTENSITY_INCREMENT_LARGE);
        return true;
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.changeManualBacklightLevel(BacklightIntensityPopup.INTENSITY_INCREMENT_SMALL);
        return true;
      default:
        return false;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
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

    if (this.props.backlightConfig.lightBus !== undefined) {
      backlightModeInputData.splice(1, 0, {
        value: BacklightControlSettingMode.LightBus,
        labelRenderer: () => 'Light Bus'
      });
    }

    return (
      <div class='backlight-intensity-popup ui-view-panel'>
        <div class='backlight-intensity-popup-title'>Backlight Intensity</div>
        <div class='backlight-intensity-popup-slider-row'>
          <UiImgTouchButton
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_minus.png`}
            isEnabled={this.isSliderEnabled}
            onPressed={this.changeManualBacklightLevel.bind(this, -0.01)}
            class='backlight-intensity-popup-slider-button'
          />
          <UiTouchSlider
            bus={this.props.uiService.bus}
            orientation='to-right'
            isEnabled={this.isSliderEnabled}
            state={this.backlightLevel}
            stops={BacklightIntensityPopup.SLIDER_STOPS}
            onValueChanged={this.onSliderValueChanged.bind(this)}
            onFocusGained={this.onSliderFocusGained.bind(this)}
            onFocusLost={this.onSliderFocusLost.bind(this)}
            background={
              <div class='backlight-intensity-popup-slider-background' />
            }
            foreground={
              <div class='backlight-intensity-popup-slider-foreground' />
            }
            inset={
              <div class='backlight-intensity-popup-slider-inset' >
                <svg viewBox='0 0 100 100' preserveAspectRatio='none' class='backlight-intensity-popup-slider-occlude'>
                  <path d='M 0 0 h 100 l -100 100 Z' />
                </svg>
                <div class='backlight-intensity-popup-slider-inset-readout'>{this.backlightLevelText}</div>
              </div>
            }
            changeValueOnDrag
            focusController={this.focusController}
            focusOptions={{
              onUiInteractionEvent: this.onSliderUiInteractionEvent.bind(this)
            }}
            class='backlight-intensity-popup-slider'
          />
          <UiImgTouchButton
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/Map/map_range_plus.png`}
            isEnabled={this.isSliderEnabled}
            onPressed={this.changeManualBacklightLevel.bind(this, 0.01)}
            class='backlight-intensity-popup-slider-button'
          />
        </div>
        <UiListSelectTouchButton
          uiService={this.props.uiService}
          listDialogLayer={UiViewStackLayer.Overlay}
          listDialogKey={UiViewKeys.ListDialog1}
          openDialogAsPositioned
          containerRef={this.props.containerRef}
          state={this.backlightSettingManager.getSetting('displayBacklightMode')}
          renderValue={mode => {
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
          }}
          listParams={{
            selectedValue: this.backlightSettingManager.getSetting('displayBacklightMode'),
            inputData: backlightModeInputData,
            listItemHeightPx: this.props.uiService.gduFormat === '460' ? 76 : 38,
            listItemSpacingPx: this.props.uiService.gduFormat === '460' ? 4 : 2,
            itemsPerPage: backlightModeInputData.length,
            autoDisableOverscroll: true
          }}
          class='backlight-intensity-popup-mode-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.backlightLevel.destroy();
    this.isSliderEnabled.destroy();

    super.destroy();
  }
}