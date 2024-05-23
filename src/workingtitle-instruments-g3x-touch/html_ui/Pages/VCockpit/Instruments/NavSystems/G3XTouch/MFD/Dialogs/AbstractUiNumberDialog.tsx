import { DisplayComponent, FSComponent, MutableSubscribable, NodeReference, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import { NumberInput } from '../../Shared/Components/NumberInput/NumberInput';
import { NumberPad } from '../../Shared/Components/NumberPad/NumberPad';
import { ImgTouchButton } from '../../Shared/Components/TouchButton/ImgTouchButton';
import { UiImgTouchButton } from '../../Shared/Components/TouchButton/UiImgTouchButton';
import { G3XTouchFilePaths } from '../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../Shared/UiSystem/UiViewTypes';
import { UiMessageDialog } from './UiMessageDialog';

import './AbstractUiNumberDialog.css';

/**
 * A request input for {@link AbstractUiNumberDialog}.
 */
export interface UiNumberDialogInput {
  /** The value initially loaded into the dialog at the start of a request. */
  initialValue: number;
}

/**
 * A definition for a {@link NumberInput} used in a {@link AbstractUiNumberDialog}.
 */
export interface UiNumberDialogInputDefinition {
  /** A reference to this definition's input. */
  readonly ref: NodeReference<NumberInput>;

  /** The value bound to this definition's input. */
  readonly value: MutableSubscribable<number>;

  /** A mutable subscribable which controls the visibility of this definition's input. */
  readonly isVisible: MutableSubscribable<boolean>;

  /**
   * Renders this definition's input.
   * @param ref The reference to which to assign the rendered input.
   * @param value The value to bind to the rendered input.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This definition's input, as a VNode.
   */
  render(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>, rootCssClassName: string | undefined): VNode;
}

/**
 * An abstract implementation of a UI dialog view which allows the user to select an arbitrary numeric value. The
 * dialog includes a 0-9 number pad and backspace button by default. Subclasses can register an arbitrary number of
 * {@link NumberInput} components. The different inputs may be used to allow the user to input numbers with different
 * formatting, number of digits, etc. However, only one input is active and visible at a time. Subclasses may also
 * choose to render additional dialog content by overriding the `renderOtherNumberPadContents()` and
 * `renderOtherContents()` methods.
 */
export abstract class AbstractUiNumberDialog
  <
    Input extends UiNumberDialogInput = UiNumberDialogInput,
    Output = number,
    InputDef extends UiNumberDialogInputDefinition = UiNumberDialogInputDefinition,
    P extends UiViewProps = UiViewProps
  >
  extends AbstractUiView<P> implements UiDialogView<Input, Output> {

  protected readonly inputContainerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly numpadRef = FSComponent.createRef<NumberPad>();
  protected readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();
  protected readonly backRef = FSComponent.createRef<ImgTouchButton>();
  protected readonly enterRef = FSComponent.createRef<ImgTouchButton>();
  protected readonly rootCssClass = SetSubject.create(['number-dialog', 'ui-view-panel']);

  protected readonly title = Subject.create('');

  protected readonly backButtonLabel = Subject.create('');
  protected readonly backButtonImgSrc = Subject.create('');

  protected readonly inputDefinitions = new Map<string, InputDef>();

  protected activeInputDef?: InputDef;

  protected resolveFunction?: (value: any) => void;
  protected resultObject: UiDialogResult<Output> = {
    wasCancelled: true,
  };

  protected isAlive = true;

  /** Whether the sign button is shown. Defaults to false. */
  protected readonly showSignButton = Subject.create(false);

  /** Whether the decimal button is shown. Defaults to false. */
  protected readonly showDecimalButton = Subject.create(false);

  /** Whether the enter button is enabled. */
  protected readonly isEnterButtonEnabled = Subject.create(true);

  /**
   * Registers an input definition with this dialog. Definitions must be registered before they are requested as the
   * active input in order to function properly.
   * @param key The key to register the definition under. If an existing definition is already registered under the
   * same key, it will be replaced.
   * @param def The definition to register.
   */
  protected registerInputDefinition(key: string, def: InputDef): void {
    const existing = this.inputDefinitions.get(key);
    if (existing && existing.ref.getOrDefault()) {
      existing.isVisible.set(false);
      existing.ref.instance.destroy();
    }

    this.inputDefinitions.set(key, def);
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.focusController.setActive(true);
  }

  /**
   * Sets the style of this dialog's back/cancel button.
   * @param style The style to set.
   */
  protected setBackButtonStyle(style: 'back' | 'cancel'): void {
    if (style === 'cancel') {
      this.backButtonLabel.set('Cancel');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);
    } else {
      this.backButtonLabel.set('Back');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`);
    }
  }

  /**
   * Responds to when the editing state of this dialog's active number input changes.
   * @param isEditingActive Whether editing is active.
   * @param activeInputDef The active input definition.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onEditingActiveChanged(isEditingActive: boolean, activeInputDef: InputDef): void {
    if (isEditingActive) {
      this.setBackButtonStyle('cancel');
    }
  }

  /** @inheritDoc */
  public request(input: Input): Promise<UiDialogResult<Output>> {
    if (!this.isAlive) {
      throw new Error('AbstractUiNumberDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.onRequest(input);
    });
  }

  /**
   * A callback method which is called when this dialog receives a request.
   * @param input The input for the request.
   */
  protected abstract onRequest(input: Input): void;

  /**
   * Resets the active input.
   * @param key The key of the input to set as the active input. Defaults to the key of the current active input.
   * @param initialValue The initial value to set on the new active input. If not defined, the new active input will
   * retain its current value.
   * @param resetEditing Whether to reset the editing state of this dialog, in effect resetting the Back/Cancel button
   * on the button bar to Back. Defaults to `false`.
   */
  protected resetActiveInput(key?: string, initialValue?: number, resetEditing = false): void {
    this.activeInputDef?.ref.instance.deactivateEditing();
    this.activeInputDef?.isVisible.set(false);

    this.activeInputDef = key === undefined ? this.activeInputDef : this.inputDefinitions.get(key);

    if (this.activeInputDef === undefined) {
      return;
    }

    // Render the active input if it has not yet been rendered.
    if (!this.activeInputDef.ref.getOrDefault()) {
      this.renderInputToContainer(this.activeInputDef);
    }

    if (resetEditing) {
      this.setBackButtonStyle('back');
    }

    if (initialValue !== undefined) {
      this.activeInputDef.ref.instance.setValue(initialValue);
    }

    this.activeInputDef.isVisible.set(true);
    this.activeInputDef.ref.instance.refresh();
  }

  /**
   * Renders one of this dialog's registered inputs to the input container.
   * @param def The definition for the input to render.
   */
  protected renderInputToContainer(def: InputDef): void {
    FSComponent.render(def.render(def.ref, def.value, this.getRootCssClassName()), this.inputContainerRef.instance);

    def.ref.instance.isEditingActive.sub(isActive => {
      if (def === this.activeInputDef) {
        this.onEditingActiveChanged(isActive, def);
      }
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.activeInputDef?.ref.instance.refresh();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.activeInputDef?.ref.instance.changeSlotValue(1);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.activeInputDef?.ref.instance.changeSlotValue(-1);
        return true;
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.activeInputDef?.ref.instance.moveCursor(1, true);
        return true;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.activeInputDef?.ref.instance.moveCursor(-1, true);
        return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  protected async validateValueAndClose(): Promise<void> {
    if (this.activeInputDef === undefined) {
      this.props.uiService.goBackMfd();
      return;
    }

    const value = this.activeInputDef.value.get();

    if (this.isValueValid(value, this.activeInputDef)) {
      this.resultObject = {
        wasCancelled: false,
        payload: this.getPayload(value, this.activeInputDef)
      };

      this.props.uiService.goBackMfd();
    } else {
      const result = await this.props.uiService
        .openMfdPopup<UiMessageDialog>(...this.getInvalidValueMessageDialogLayerAndKey())
        .ref.request({
          message: this.getInvalidValueMessage(value, this.activeInputDef),
          showRejectButton: false,
        });

      if (!result.wasCancelled && result.payload) {
        this.activeInputDef?.ref.instance.deactivateEditing();
      }
    }
  }

  /**
   * Checks if a value is valid to be returned for a request.
   * @param value The value to check.
   * @param activeInputDef The input definition used to generate the value to check.
   * @returns Whether the specified value is valid to be returned for a request.
   */
  protected abstract isValueValid(value: number, activeInputDef: InputDef): boolean;

  /**
   * Gets the message to display when attempting to return an invalid value.
   * @param value The invalid value.
   * @param activeInputDef The input definition used to generate the invalid value.
   * @returns The message to display when attempting to return an invalid value.
   */
  protected abstract getInvalidValueMessage(value: number, activeInputDef: InputDef): string | VNode;

  /**
   * Gets the payload for a completed request.
   * @param value The numeric value to return with the request.
   * @param activeInputDef The active input definition at the time the request was completed.
   * @returns The payload for a completed request.
   */
  protected abstract getPayload(value: number, activeInputDef: InputDef): Output;

  /**
   * Gets the view stack layer and key of the message dialog to open to display the invalid value message.
   * @returns The view stack layer and key of the message dialog to open to display the invalid value message, as
   * `[layer, key]`.
   */
  protected getInvalidValueMessageDialogLayerAndKey(): [UiViewStackLayer, string] {
    return [UiViewStackLayer.Overlay, UiViewKeys.MessageDialog1];
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  protected cleanupRequest(): void {
    this.activeInputDef?.ref.instance.deactivateEditing();

    this.onCleanupRequest();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * A callback method which is called when this dialog cleans up a request. This method is called before the pending
   * request Promise is fulfilled, if one exists.
   */
  protected onCleanupRequest(): void {
    // noop
  }

  /**
   * Responds to when one of this dialog's number pad buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  protected onNumberPressed(value: number): void {
    this.activeInputDef?.ref.instance.setSlotCharacterValue(`${value}`);
  }

  /**
   * Called when this dialog's sign button is pressed.
   */
  protected onSignPressed(): void {
    //noop
  }

  /**
   * Called when this dialog's decimal button is pressed.
   */
  protected onDecimalPressed(): void {
    // noop
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  protected onBackspacePressed(): void {
    this.activeInputDef?.ref.instance.backspace();
  }

  /**
   * Responds to when this dialog's back/cancel button is pressed.
   */
  protected onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Responds to when this dialog's enter button is pressed.
   */
  protected onEnterPressed(): void {
    this.validateValueAndClose();
  }

  /** @inheritDoc */
  public render(): VNode {
    const rootCssClassName = this.getRootCssClassName();

    if (rootCssClassName !== undefined) {
      this.rootCssClass.add(rootCssClassName);
    }

    return (
      <div class={this.rootCssClass}>
        <div class={`number-dialog-title ${rootCssClassName === undefined ? '' : `${rootCssClassName}-title`}`}>
          {this.title}
        </div>
        <div
          ref={this.inputContainerRef}
          class={`number-dialog-input-container ${rootCssClassName === undefined ? '' : `${rootCssClassName}-input-container`}`}
        />
        <div class={`number-dialog-numpad-container ${rootCssClassName === undefined ? '' : `${rootCssClassName}-numpad-container`}`}>
          {this.renderNumberPad(this.numpadRef, rootCssClassName)}
          {this.renderOtherNumberPadContents(rootCssClassName)}
        </div>
        {this.renderBackspaceButton(this.backspaceRef, rootCssClassName)}
        {this.renderBackButton(this.backRef, rootCssClassName)}
        {this.renderEnterButton(this.enterRef, rootCssClassName)}
        {this.renderOtherContents(rootCssClassName)}
      </div>
    );
  }

  /**
   * Gets the CSS class name (singular) for this dialog's root element.
   * @returns The CSS class name (singular) for this dialog's root element.
   */
  protected abstract getRootCssClassName(): string | undefined;

  /**
   * Renders this dialog's number pad.
   * @param ref The reference to which to assign the rendered number pad.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's number pad, as a VNode.
   */
  protected renderNumberPad(ref: NodeReference<NumberPad>, rootCssClassName: string | undefined): VNode {
    return (
      <NumberPad
        ref={ref}
        onNumberPressed={this.onNumberPressed.bind(this)}
        onSignPressed={this.onSignPressed.bind(this)}
        onDecimalPressed={this.onDecimalPressed.bind(this)}
        class={`number-dialog-numpad ${rootCssClassName === undefined ? '' : `${rootCssClassName}-numpad`}`}
        showSignButton={this.showSignButton}
        showDecimalButton={this.showDecimalButton}
      />
    );
  }

  /**
   * Renders additional contents in this dialog's number pad container.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns Additional contents in this dialog's number pad container, as a VNode, or `null` if there are no
   * additional contents.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected renderOtherNumberPadContents(rootCssClassName: string | undefined): VNode | null {
    return null;
  }

  /**
   * Renders this dialog's backspace button.
   * @param ref The reference to which to assign the rendered button.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's backspace button, as a VNode, or `null` if this dialog does not have a backspace button.
   */
  protected renderBackspaceButton(ref: NodeReference<DisplayComponent<any>>, rootCssClassName: string | undefined): VNode | null {
    return (
      <ImgTouchButton
        ref={ref}
        label='Backspace'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
        onPressed={this.onBackspacePressed.bind(this)}
        class={`ui-nav-button number-dialog-backspace ${rootCssClassName === undefined ? '' : `${rootCssClassName}-backspace`}`}
      />
    );
  }

  /**
   * Renders this dialog's back/cancel button.
   * @param ref The reference to which to assign the rendered button.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's back/cancel button, as a VNode, or `null` if this dialog does not have a backspace button.
   */
  protected renderBackButton(ref: NodeReference<DisplayComponent<any>>, rootCssClassName: string | undefined): VNode | null {
    return (
      <UiImgTouchButton
        ref={ref}
        label={this.backButtonLabel}
        imgSrc={this.backButtonImgSrc}
        onPressed={this.onBackPressed.bind(this)}
        focusController={this.focusController}
        class={`ui-nav-button number-dialog-nav-button number-dialog-back ${rootCssClassName === undefined ? '' : `${rootCssClassName}-back`}`}
      />
    );
  }

  /**
   * Renders this dialog's enter button.
   * @param ref The reference to which to assign the rendered button.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's enter button, as a VNode, or `null` if this dialog does not have a backspace button.
   */
  protected renderEnterButton(ref: NodeReference<DisplayComponent<any>>, rootCssClassName: string | undefined): VNode | null {
    return (
      <UiImgTouchButton
        ref={ref}
        label='Enter'
        imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
        isEnabled={this.isEnterButtonEnabled}
        onPressed={this.onEnterPressed.bind(this)}
        focusController={this.focusController}
        class={`ui-nav-button number-dialog-nav-button number-dialog-enter ${rootCssClassName === undefined ? '' : `${rootCssClassName}-enter`}`}
      />
    );
  }

  /**
   * Renders additional contents in this dialog's root container.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns Additional contents in this dialog's root container, as a VNode, or `null` if there are no additional
   * contents.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected renderOtherContents(rootCssClassName: string | undefined): VNode | null {
    return null;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    for (const def of this.inputDefinitions.values()) {
      def.ref.getOrDefault()?.destroy();
    }
    this.numpadRef.getOrDefault()?.destroy();
    this.backspaceRef.getOrDefault()?.destroy();

    super.destroy();
  }
}