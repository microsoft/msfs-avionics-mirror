import {
  ConsumerSubject, ControlEvents, FSComponent, MappedSubject, MathUtils, Subject, Subscribable, Subscription, VNode, XPDRMode,
  XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { DigitInputSlot } from '../../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../../Shared/Components/NumberInput/NumberInput';
import { CombinedTouchButton } from '../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XTransponderEvents } from '../../../Shared/Transponder/G3XTransponderEvents';
import { TransponderConfig } from '../../../Shared/Transponder/TransponderConfig';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { TransponderViewControlEvents } from './TransponderViewControlEvents';
import { TransponderViewEvents } from './TransponderViewEvents';

import './TransponderView.css';

/**
 * Component props for {@link TransponderView}.
 */
export interface TransponderViewProps extends UiViewProps {
  /** A configuration object defining options for the transponder. */
  transponderConfig: TransponderConfig;
}

/**
 * A transponder view. Allows the user to input a transponder code, activate IDENT, and optionally change transponder
 * mode.
 */
export class TransponderView extends AbstractUiView<TransponderViewProps> {
  private thisNode?: VNode;

  private readonly controlPublisher = this.props.uiService.bus.getPublisher<ControlEvents>();

  private readonly supportAutoGroundAlt = !this.props.transponderConfig.hasSelectableGround && this.props.transponderConfig.useSimGroundMode;

  private readonly xpdrOnGround = ConsumerSubject.create(null, false);

  private readonly simXpdrMode = ConsumerSubject.create(null, XPDRMode.OFF);
  private readonly simXpdrCode = ConsumerSubject.create(null, 0);

  private readonly altButtonMode: Subscribable<XPDRMode.ALT | XPDRMode.GROUND> = this.supportAutoGroundAlt
    ? this.xpdrOnGround.map(onGround => onGround ? XPDRMode.GROUND : XPDRMode.ALT)
    : Subject.create(XPDRMode.ALT);

  private readonly altButtonLabel = this.altButtonMode.map(mode => mode === XPDRMode.GROUND ? 'GND' : 'ALT');

  private readonly inputRef = FSComponent.createRef<NumberInput>();
  private readonly inputXpdrCodeValue = Subject.create(this.simXpdrCode.get());

  private readonly isPaused = Subject.create(true);

  private readonly inputXpdrCodeState = MappedSubject.create(
    ([simXpdrCode, inputXpdrCode, isPaused]) => {
      if (isPaused) {
        return 'unchanged';
      } else {
        if (!isFinite(inputXpdrCode)) {
          return 'invalid';
        } else if (simXpdrCode === inputXpdrCode) {
          return 'unchanged';
        } else {
          return 'changed';
        }
      }
    },
    this.simXpdrCode,
    this.inputXpdrCodeValue,
    this.isPaused
  );

  private readonly isInputCodeValid = Subject.create(false);

  private readonly isIdentButtonEnabled = MappedSubject.create(
    ([mode, isInputCodeValid]) => mode !== XPDRMode.OFF && mode !== XPDRMode.STBY && mode !== XPDRMode.TEST && isInputCodeValid,
    this.simXpdrMode,
    this.isInputCodeValid
  );
  private readonly identButtonLabel = Subject.create('IDENT');

  private viewEnterPlusIdentSub?: Subscription;
  private xpdrCodeSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [UiKnobId.SingleInner, 'Set Code'],
      [UiKnobId.SingleOuter, 'Set Code'],
      [UiKnobId.LeftInner, 'Set Code'],
      [UiKnobId.LeftOuter, 'Set Code'],
      [UiKnobId.RightInner, 'Set Code'],
      [UiKnobId.RightOuter, 'Set Code']
    ]);

    const sub = this.props.uiService.bus.getSubscriber<XPDRSimVarEvents & G3XTransponderEvents>();

    if (this.props.transponderConfig.canSelectMode) {
      if (this.supportAutoGroundAlt) {
        this.xpdrOnGround.setConsumer(sub.on('g3x_xpdr_on_ground_1'));
      }

      this.simXpdrMode.setConsumer(sub.on('xpdr_mode_1'));
    }

    this.simXpdrCode.setConsumer(sub.on('xpdr_code_1'));

    this.xpdrCodeSub = this.simXpdrCode.sub(this.onXpdrCodeChanged.bind(this), false, true);
    this.inputXpdrCodeValue.sub(this.onInputXpdrCodeChanged.bind(this), true);
    this.inputXpdrCodeState.sub(this.onInputXpdrCodeStateChanged.bind(this), true);

    this.focusController.setActive(true);
    this.viewEnterPlusIdentSub = this.props.uiService.bus.getSubscriber<TransponderViewControlEvents>()
      .on('xpdr_view_enter_plus_ident')
      .handle(this.ident.bind(this));
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.xpdrOnGround.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.xpdrOnGround.pause();

    this.inputRef.instance.deactivateEditing();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.xpdrCodeSub?.resume(true);
    this.viewEnterPlusIdentSub?.resume();
    this.isPaused.set(false);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.xpdrCodeSub?.pause();
    this.viewEnterPlusIdentSub?.pause();
    this.isPaused.set(true);
  }

  /**
   * Executes logic in response to the 'Enter' command. If this view's input transponder code is valid, then sets the
   * sim transponder code to the input code and closes the view.
   */
  private enter(): void {
    if (this.inputXpdrCodeState.get() === 'changed') {
      const code = this.inputXpdrCodeValue.get();
      this.controlPublisher.pub('publish_xpdr_code_1', code, true, false);

      this.props.uiService.goBackMfd();
    }
  }

  /**
   * Executes logic in response to the 'Ident' command. If this view's input transponder code is valid, then sets the
   * sim transponder code to the input code (if they differ) and triggers a transponder IDENT. If the sim transponder
   * code was changed, then also closes the view.
   */
  private ident(): void {
    const inputCodeState = this.inputXpdrCodeState.get();

    if (inputCodeState === 'invalid') {
      return;
    }

    let goBack = false;

    if (inputCodeState === 'changed') {
      const code = this.inputXpdrCodeValue.get();
      this.controlPublisher.pub('publish_xpdr_code_1', code, true, false);
      goBack = true;
    }

    this.controlPublisher.pub('xpdr_send_ident_1', true, true, false);

    if (goBack) {
      this.props.uiService.goBackMfd();
    }
  }

  /**
   * Responds to when the sim's transponder code changes.
   * @param code The new transponder code.
   */
  private onXpdrCodeChanged(code: number): void {
    if (!this.inputRef.instance.isEditingActive.get()) {
      this.inputRef.instance.setValue(code);
    }
  }

  /**
   * Responds to when this view's input transponder code changes.
   * @param code The new input transponder code.
   */
  private onInputXpdrCodeChanged(code: number): void {
    if (isFinite(code)) {
      this.isInputCodeValid.set(true);
      this.focusController.setFocusIndex(0);
    } else {
      this.isInputCodeValid.set(false);
    }
  }

  /**
   * Responds to when the state of this view's input transponder code changes.
   * @param state The new input transponder code state.
   */
  private onInputXpdrCodeStateChanged(state: 'invalid' | 'unchanged' | 'changed'): void {
    this.props.uiService.bus.getPublisher<TransponderViewEvents>().pub('xpdr_view_code_state', state);

    let knobLabel: string | undefined;
    let identButtonLabel: string;
    switch (state) {
      case 'unchanged':
        knobLabel = 'Hold IDENT';
        identButtonLabel = 'IDENT';
        break;
      case 'changed':
        knobLabel = 'Hold ENT+ID';
        identButtonLabel = 'ENT+ID';
        break;
      default:
        knobLabel = undefined;
        identButtonLabel = 'ENT+ID';
    }

    if (knobLabel === undefined) {
      this._knobLabelState.delete(UiKnobId.SingleInnerPush);
      this._knobLabelState.delete(UiKnobId.LeftInnerPush);
      this._knobLabelState.delete(UiKnobId.RightInnerPush);
    } else {
      this._knobLabelState.setValue(UiKnobId.SingleInnerPush, knobLabel);
      this._knobLabelState.setValue(UiKnobId.LeftInnerPush, knobLabel);
      this._knobLabelState.setValue(UiKnobId.RightInnerPush, knobLabel);
    }

    this.identButtonLabel.set(identButtonLabel);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.inputRef.instance.changeSlotValue(1);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.inputRef.instance.changeSlotValue(-1);
        return true;
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.inputRef.instance.moveCursor(1, true);
        return true;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.inputRef.instance.moveCursor(-1, true);
        return true;
      case UiInteractionEvent.SingleKnobPressLong:
      case UiInteractionEvent.LeftKnobPressLong:
      case UiInteractionEvent.RightKnobPressLong:
        this.ident();
        return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Responds to when one of this view's numpad buttons is pressed.
   * @param numeral The numeral character associated with the button that was pressed.
   */
  private onNumpadButtonPressed(numeral: string): void {
    this.inputRef.instance.setSlotCharacterValue(numeral);

    // If we end up with a valid code after inputting the last digit, then deactivate editing.
    if (isFinite(this.inputXpdrCodeValue.get()) && this.inputRef.instance.cursorPosition.get() > 3) {
      this.inputRef.instance.deactivateEditing();
    }
  }

  /**
   * Responds to when this view's back button is pressed.
   */
  private onBackButtonPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Responds to when this view's VFR button is pressed.
   */
  private onVfrButtonPressed(): void {
    const vfrCode: number = [WorldRegion.NORTH_AMERICA, WorldRegion.AUSTRALIA]
      .includes(Simplane.getWorldRegion()) ? 1200 : 7000;

    this.inputRef.instance.deactivateEditing();
    this.inputRef.instance.setValue(vfrCode);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='transponder-view ui-view-panel'>
        <div class='transponder-view-title'>Transponder</div>

        <div class='transponder-view-input-row'>
          <UiTouchButton
            label='VFR'
            onPressed={this.onVfrButtonPressed.bind(this)}
            class='transponder-view-vfr-button'
          />

          <NumberInput
            ref={this.inputRef}
            value={this.inputXpdrCodeValue}
            digitizeValue={(value, setSignValues, setDigitValues): void => {
              if (isNaN(value)) {
                return;
              }
              const rounded = Math.max(0, Math.round(value));
              setDigitValues[0](MathUtils.clamp(Math.floor(rounded / 1000), 0, 7), true);
              setDigitValues[1](MathUtils.clamp(Math.floor((rounded % 1000) / 100), 0, 7), true);
              setDigitValues[2](MathUtils.clamp(Math.floor((rounded % 100) / 10), 0, 7), true);
              setDigitValues[3](MathUtils.clamp(rounded % 10, 0, 7), true);
            }}
            allowBackFill={false}
            class='transponder-view-input'
          >
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={1000}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={100}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={10}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={1}
              defaultCharValues={[NaN]}
            />
          </NumberInput>

          <UiImgTouchButton
            label='Backspace'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
            onPressed={() => this.inputRef.instance.backspace()}
            class='ui-nav-button'
          />
        </div>

        <div class='transponder-view-numpad'>
          {['0', '1', '2', '3', '4', '5', '6', '7'].map((numeral: string) => (
            <UiTouchButton
              label={numeral}
              class='numpad-touch-button'
              onPressed={this.onNumpadButtonPressed.bind(this, numeral)}
            />
          ))}
        </div>

        {this.props.transponderConfig.canSelectMode && (
          <div class='transponder-view-mode-buttons-container'>
            <div class='transponder-view-mode-buttons-spacer' />
            <div class='transponder-view-mode-buttons-box ui-view-box'>
              <div class='ui-view-box-title'>Mode</div>

              <CombinedTouchButton
                orientation='row'
                class='transponder-view-mode-buttons'
              >
                <UiToggleTouchButton
                  label='STBY'
                  state={this.simXpdrMode.map(mode => mode === XPDRMode.STBY)}
                  onPressed={() => { this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.STBY, true, false); }}
                  class='transponder-view-mode-button'
                />
                {this.props.transponderConfig.hasSelectableGround && (
                  <UiToggleTouchButton
                    label='GND'
                    state={this.simXpdrMode.map(mode => mode === XPDRMode.GROUND)}
                    onPressed={() => { this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.GROUND, true, false); }}
                    class='transponder-view-mode-button'
                  />
                )}
                <UiToggleTouchButton
                  label='ON'
                  state={this.simXpdrMode.map(mode => mode === XPDRMode.ON)}
                  onPressed={() => { this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.ON, true, false); }}
                  class='transponder-view-mode-button'
                />
                <UiToggleTouchButton
                  label={this.altButtonLabel}
                  state={this.simXpdrMode.map(mode => mode === XPDRMode.ALT || (this.supportAutoGroundAlt && mode === XPDRMode.GROUND))}
                  onPressed={() => { this.controlPublisher.pub('publish_xpdr_mode_1', this.altButtonMode.get(), true, false); }}
                  class='transponder-view-mode-button'
                />
              </CombinedTouchButton>
            </div>
            <div class='transponder-view-mode-buttons-spacer' />
          </div>
        )}

        <div class='transponder-view-bottom-row'>
          <UiImgTouchButton
            label='Back'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`}
            onPressed={this.onBackButtonPressed.bind(this)}
            class='transponder-view-bottom-row-button ui-nav-button'
          />

          <UiTouchButton
            label={this.identButtonLabel}
            isEnabled={this.isIdentButtonEnabled}
            onPressed={this.ident.bind(this)}
            class='transponder-view-bottom-row-button transponder-view-ident-button'
          />

          <UiImgTouchButton
            label='Enter'
            isEnabled={this.isInputCodeValid}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            onPressed={this.enter.bind(this)}
            focusController={this.focusController}
            class='transponder-view-bottom-row-button ui-nav-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.xpdrOnGround.destroy();
    this.simXpdrMode.destroy();
    this.simXpdrCode.destroy();
    this.viewEnterPlusIdentSub?.destroy();

    super.destroy();
  }
}
