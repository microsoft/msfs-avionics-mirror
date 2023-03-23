import { DisplayComponent, FSComponent, MutableSubscribable, NodeReference, VNode, Subject, SetSubject } from '@microsoft/msfs-sdk';
import { ImgTouchButton } from '../Components/TouchButton/ImgTouchButton';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { NumberPad } from '../Components/NumberPad/NumberPad';
import { GtcMessageDialog } from './GtcMessageDialog';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { DualConcentricKnobLabelKey } from '../GtcService/Sidebar';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import '../Components/TouchButton/NumPadTouchButton.css';
import './AbstractGtcNumberDialog.css';

/**
 * A request input for {@link AbstractGtcNumberDialog}.
 */
export interface GtcNumberDialogInput {
  /** The value initially loaded into the dialog at the start of a request. */
  initialValue: number;
}

/**
 * A definition for a {@link NumberInput} used in a {@link AbstractGtcNumberDialog}.
 */
export interface GtcNumberDialogInputDefinition {
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
 * An abstract implementation of a GTC dialog view which allows the user to select an arbitrary numeric value. The
 * dialog includes a 0-9 number pad and backspace button by default. Subclasses can register an arbitrary number of
 * {@link NumberInput} components. The different inputs may be used to allow the user to input numbers with different
 * formatting, number of digits, etc. However, only one input is active and visible at a time. Subclasses may also
 * choose to render additional dialog content by overriding the `renderOtherNumberPadContents()` and
 * `renderOtherContents()` methods.
 */
export abstract class AbstractGtcNumberDialog
  <
    Input extends GtcNumberDialogInput = GtcNumberDialogInput,
    Output = number,
    InputDef extends GtcNumberDialogInputDefinition = GtcNumberDialogInputDefinition,
    P extends GtcViewProps = GtcViewProps
  >
  extends GtcView<P> implements GtcDialogView<Input, Output> {

  protected readonly numpadRef = FSComponent.createRef<NumberPad>();
  protected readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();

  protected readonly rootCssClass = SetSubject.create(['number-dialog']);

  protected readonly inputDefinitions = new Map<string, InputDef>();

  protected activeInputDef?: InputDef;

  protected resolveFunction?: (value: any) => void;
  protected resultObject: GtcDialogResult<Output> = {
    wasCancelled: true,
  };

  protected isAlive = true;

  /** Whether the sign button is shown. Defaults to false. */
  protected readonly showSignButton = Subject.create(false);

  /** Whether the decimal button is shown. Defaults to false. */
  protected readonly showDecimalButton = Subject.create(false);

  /**
   * Registers an input definition with this dialog. Definitions must be registered before this dialog is rendered
   * in order to function properly.
   * @param key The key to register the definition under. If an existing definition is already registered under the
   * same key, it will be replaced.
   * @param def The definition to register.
   */
  protected registerInputDefinition(key: string, def: InputDef): void {
    this.inputDefinitions.set(key, def);
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this._sidebarState.dualConcentricKnobLabel.set(this.getDualConcentricKnobLabel());
    this._sidebarState.slot5.set('enterEnabled');

    for (const def of this.inputDefinitions.values()) {
      def.ref.instance.isEditingActive.sub(isActive => {
        if (def === this.activeInputDef) {
          this.onEditingActiveChanged(isActive, def);
        }
      });
    }
  }

  /**
   * Gets the label key or label string for the dual concentric knob while this dialog is active.
   * @returns The label key or label string for the dual concentric knob while this dialog is active.
   */
  protected getDualConcentricKnobLabel(): DualConcentricKnobLabelKey | string {
    return 'dataEntryPushEnter';
  }

  /**
   * Responds to when the editing state of this dialog's active number input changes.
   * @param isEditingActive Whether editing is active.
   * @param activeInputDef The active input definition.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onEditingActiveChanged(isEditingActive: boolean, activeInputDef: InputDef): void {
    if (isEditingActive) {
      this._sidebarState.slot1.set('cancel');
    }
  }

  /** @inheritdoc */
  public request(input: Input): Promise<GtcDialogResult<Output>> {
    if (!this.isAlive) {
      throw new Error('AbstractGtcMultiInputNumberDialog: cannot request from a dead dialog');
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
   * Resets the active input. This will
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

    if (resetEditing) {
      this._sidebarState.slot1.set(null);
    }

    if (initialValue !== undefined) {
      this.activeInputDef.ref.instance.setValue(initialValue);
    }

    this.activeInputDef.isVisible.set(true);
    this.activeInputDef.ref.instance.refresh();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.activeInputDef?.ref.instance.refresh();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.activeInputDef?.ref.instance.changeSlotValue(1);
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.activeInputDef?.ref.instance.changeSlotValue(-1);
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.activeInputDef?.ref.instance.moveCursor(1, true);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.activeInputDef?.ref.instance.moveCursor(-1, true);
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.validateValueAndClose();
        return true;
      default:
        return false;
    }
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  protected async validateValueAndClose(): Promise<void> {
    if (this.activeInputDef === undefined) {
      this.props.gtcService.goBack();
      return;
    }

    const value = this.activeInputDef.value.get();

    if (this.isValueValid(value, this.activeInputDef)) {
      this.resultObject = {
        wasCancelled: false,
        payload: this.getPayload(value, this.activeInputDef)
      };

      this.props.gtcService.goBack();
    } else {
      const result = await this.props.gtcService
        .openPopup<GtcMessageDialog>(this.getInvalidValueMessageDialogKey())
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
   * Gets the key of the message dialog to open to display the invalid value message.
   * @returns The key of the message dialog to open to display the invalid value message.
   */
  protected getInvalidValueMessageDialogKey(): string {
    return GtcViewKeys.MessageDialog1;
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
    // noop
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

  /** @inheritdoc */
  public render(): VNode {
    const rootCssClassName = this.getRootCssClassName();

    if (rootCssClassName !== undefined) {
      this.rootCssClass.add(rootCssClassName);
    }

    return (
      <div class={this.rootCssClass}>
        {Array.from(this.inputDefinitions.values()).map(def => def.render(def.ref, def.value, rootCssClassName))}
        <div class={`number-dialog-numpad-container ${rootCssClassName === undefined ? '' : `${rootCssClassName}-numpad-container`}`}>
          {this.renderNumberPad(this.numpadRef, rootCssClassName)}
          {this.renderOtherNumberPadContents(rootCssClassName)}
        </div>
        {this.renderBackspaceButton(this.backspaceRef, rootCssClassName)}
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
        orientation={this.props.gtcService.orientation}
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
        label='BKSP'
        imgSrc={'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_backspace_long.png'}
        onPressed={this.onBackspacePressed.bind(this)}
        class={`number-dialog-backspace ${rootCssClassName === undefined ? '' : `${rootCssClassName}-backspace`}`}
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

  /** @inheritdoc */
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