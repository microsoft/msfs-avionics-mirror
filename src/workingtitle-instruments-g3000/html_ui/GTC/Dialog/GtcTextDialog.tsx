import { ArrayUtils, FSComponent, NodeReference, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { CharInput } from '../Components/CharInput/CharInput';
import { CharInputSlot } from '../Components/CharInput/CharInputSlot';
import { Keyboard } from '../Components/Keyboard/Keyboard';
import { GtcHardwareControlEvent, GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import './GtcTextDialog.css';

/**
 * A request input for {@link GtcTextDialog}.
 */
export type GtcTextDialogInput = {
  /** The label text to display next to the dialog's character input. */
  label: string;

  /** Whether to allow spaces to be input. */
  allowSpaces: boolean;

  /** The maximum number of characters to allow. */
  maxLength: number;

  /** The initial text with which to populate the dialog's character input. Defaults to the empty string. */
  initialValue?: string;
}

/**
 * A GTC dialog which allows the user to enter text.
 */
export class GtcTextDialog extends GtcView implements GtcDialogView<GtcTextDialogInput, string> {

  private static readonly CHAR_ARRAY = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', ''
  ];

  private static readonly CHAR_ARRAY_NO_SPACE = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ''
  ];

  private thisNode?: VNode;

  private readonly inputContainerRef = FSComponent.createRef<HTMLDivElement>();
  private inputRef?: NodeReference<CharInput>;
  private readonly keyboardRef = FSComponent.createRef<Keyboard>();

  private readonly inputText = Subject.create('');
  private readonly inputTextSub = this.inputText.sub(this.onInputTextChanged.bind(this), false, true);

  private readonly inputLabelText = Subject.create('');

  private readonly isSpaceButtonEnabled = Subject.create(false);

  private resolveFunction?: (value: GtcDialogResult<string>) => void;
  private resultObject: GtcDialogResult<string> = {
    wasCancelled: true,
  };

  private readonly inputSubscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._sidebarState.slot5.set('enterEnabled');
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
  }

  /** @inheritDoc */
  public request(input: GtcTextDialogInput): Promise<GtcDialogResult<string>> {
    return new Promise<GtcDialogResult<string>>(resolve => {
      this.cleanupRequest();

      if (this.inputRef) {
        this.inputContainerRef.instance.innerHTML = '';
        this.inputRef.instance.destroy();
        this.inputRef = undefined;
      }

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.inputLabelText.set(input.label);
      this.isSpaceButtonEnabled.set(input.allowSpaces);

      this.inputText.set('');

      // TODO: Limiting to 12 until we implement horizontal scrolling
      FSComponent.render(this.renderCharInput(Math.min(12, input.maxLength), input.allowSpaces), this.inputContainerRef.instance);

      if (input.initialValue) {
        this.inputRef!.instance.setValue(input.initialValue);
      } else {
        this.inputRef!.instance.setValue('');
      }

      this.inputRef!.instance.deactivateEditing();
      this.inputRef!.instance.refresh();

      this._sidebarState.slot1.set(null);
      this.keyboardRef.instance.setShowNumpad(false);

      this.inputTextSub.resume();
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcHardwareControlEvent.InnerKnobInc:
        this.inputRef?.instance.changeSlotValue(1, false);
        return true;
      case GtcHardwareControlEvent.InnerKnobDec:
        this.inputRef?.instance.changeSlotValue(-1, false);
        return true;
      case GtcHardwareControlEvent.OuterKnobInc:
        this.inputRef?.instance.moveCursor(1, true);
        return true;
      case GtcHardwareControlEvent.OuterKnobDec:
        this.inputRef?.instance.moveCursor(-1, true);
        return true;
      case GtcHardwareControlEvent.InnerKnobPush:
      case GtcHardwareControlEvent.InnerKnobPushLong:
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.resolve();
        return true;
      default:
        return false;
    }
  }

  /**
   * A callback called when the search input box is updated.
   */
  private onInputTextChanged(): void {
    this._sidebarState.slot1.set('cancel');
  }

  /**
   * Attempts to resolve the current request.
   *
   * If this dialog searches for facilities, then the currently selected facility will be returned if one exists. If
   * there is no selected facility, duplicate matches will attempted to be resolved if they exist. If neither a
   * selected facility or duplicate matches exist, the request will be cancelled.
   *
   * If this dialog does not search for facilities, the current input text is returned.
   */
  private resolve(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: this.inputText.get()
    };

    this.props.gtcService.goBack();
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.inputTextSub.pause();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's character keys is pressed.
   * @param char The character of the key that was pressed.
   */
  private onKeyPressed(char: string): void {
    this.inputRef?.instance.setSlotCharacterValue(char);
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.inputRef?.instance.backspace();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='text-dialog'>
        <div class='text-dialog-top-section'>
          <div ref={this.inputContainerRef} class='text-dialog-input-container' />
          <div class='text-dialog-input-label'>
            {this.inputLabelText}
          </div>
        </div>
        <Keyboard
          ref={this.keyboardRef}
          isSpaceButtonEnabled={this.isSpaceButtonEnabled}
          showFindButton={false}
          onKeyPressed={this.onKeyPressed.bind(this)}
          onBackspacePressed={this.onBackspacePressed.bind(this)}
          class='text-dialog-keyboard'
        />
      </div>
    );
  }

  /**
   * Renders a character input for this dialog.
   * @param charCount The maximum number of characters supported by the input.
   * @param allowSpaces Whether the input should allow spaces.
   * @returns A character input, as a VNode.
   */
  private renderCharInput(charCount: number, allowSpaces: boolean): VNode {
    const emptyText = ''.padStart(charCount, '_');

    const isInputTextEmpty = this.inputText.map(text => text === '');
    const inactiveText = this.inputText.map(text => text === '' ? emptyText : text);

    this.inputSubscriptions.push(isInputTextEmpty, inactiveText);

    return (
      <CharInput
        ref={this.inputRef = FSComponent.createRef<CharInput>()}
        value={this.inputText}
        renderInactiveValue={
          <div
            class={{
              'text-dialog-input-inactive-value-text': true,
              'text-dialog-input-inactive-value-text-empty': isInputTextEmpty
            }}
          >
            {inactiveText}
          </div>
        }
        forceSetValue
        class='text-dialog-input'
      >
        {ArrayUtils.create(charCount, () => {
          return (
            <CharInputSlot
              charArray={allowSpaces ? GtcTextDialog.CHAR_ARRAY : GtcTextDialog.CHAR_ARRAY_NO_SPACE}
              defaultCharValue=''
              wrap
            />
          );
        })}
      </CharInput>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
