import { ImgTouchButton } from '@microsoft/msfs-garminsdk';
import { ArrayUtils, FSComponent, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { CharInput } from '../../../Shared/Components/CharInput';
import { CharInputSlot } from '../../../Shared/Components/CharInput/CharInputSlot';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';

import './UserFrequencyNameInputDialog.css';

/**
 * The input of a user frequency name input dialog.
 */
export interface UserFrequencyNameInputDialogInput {
  /** The initial value of the input box. */
  initialValue?: string;
}

/**
 * A request result returned by {@link UserFrequencyNameInputDialog}.
 */
export interface UserFrequencyNameInputDialogOutput {
  /** The selected frequency, in hertz. */
  name: string;
}

/**
 * An entry for a single character input slot.
 */
type CharInputSlotEntry = {
  /** A reference to the input slot. */
  ref: NodeReference<CharInputSlot>;

  /** The input slot's default character value. */
  defaultCharValue: Subject<string>;
};

/**
 * A dialog that allows the user to input a frequency name.
 */
export class UserFrequencyNameInputDialog
  extends AbstractUiView
  implements UiDialogView<UserFrequencyNameInputDialogInput, UserFrequencyNameInputDialogOutput> {

  private static readonly CHAR_ARRAY = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', ''
  ];

  private static readonly KEYS = [
    'A', 'B', 'C', 'D', 'E', '1', '2', '3',
    'F', 'G', 'H', 'I', 'J', '4', '5', '6',
    'K', 'L', 'M', 'N', 'O', '7', '8', '9',
    'P', 'Q', 'R', 'S', 'T', null, '0', null,
    'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
  ];

  private thisNode?: VNode;

  private readonly inputRef = FSComponent.createRef<CharInput>();

  private readonly inputSlotEntries: CharInputSlotEntry[] = ArrayUtils.create(16, () => {
    return {
      ref: FSComponent.createRef<CharInputSlot>(),
      defaultCharValue: Subject.create('')
    };
  });

  private readonly titleText = Subject.create('Set User Frequency Name');

  private readonly inputText = Subject.create('');
  private readonly inputTextSub = this.inputText.sub(this.onInputTextChanged.bind(this), false, true);

  private readonly enterButtonEnabled = Subject.create(false);

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<UserFrequencyNameInputDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public request(input: UserFrequencyNameInputDialogInput): Promise<UiDialogResult<UserFrequencyNameInputDialogOutput>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      if (input.initialValue) {
        this.inputText.set(input.initialValue);
        this.enterButtonEnabled.set(true);
        this.inputRef.instance.setValue(input.initialValue);
      } else {
        this.inputText.set('');
        this.inputRef.instance.setValue('');
        this.enterButtonEnabled.set(false);
      }

      this.inputRef.instance.deactivateEditing();
      this.inputRef.instance.refresh();

      this.inputTextSub.resume();
    });
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
  public onClose(): void {
    this.focusController.clearRecentFocus();
    this.cleanupRequest();
  }

  /**
   * A callback called when the input box is updated.
   */
  private onInputTextChanged(): void {
    this.enterButtonEnabled.set(!!this.inputText.get());
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
    this.inputRef.instance.setSlotCharacterValue(char);
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.inputRef.instance.backspace();
  }

  /**
   * Responds to when this dialog's cancel button is pressed.
   */
  private onCancelPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Attempts to resolve the current request.
   */
  private resolve(): void {
    if (this.inputText.get()) {
      this.resultObject = {
        wasCancelled: false,
        payload: {
          name: this.inputText.get()
        }
      };
    }
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='user-freq-name-input-dialog ui-view-panel'>
        <div class='user-freq-name-input-dialog-title'>{this.titleText}</div>


        <div class='user-freq-name-input-dialog-top-row'>
          <div class='user-freq-name-input-dialog-input-container'>
            <div class='user-freq-name-input-dialog-input-box'>
              <CharInput
                ref={this.inputRef}
                value={this.inputText}
                renderInactiveValue={
                  <div
                    class={{
                      'user-freq-name-input-dialog-input-inactive-value-text': true,
                      'user-freq-name-input-dialog-input-inactive-value-text-highlight': this.inputText.map(text => text !== '')
                    }}
                  >
                    {this.inputText.map(text => text === '' ? 'Enter Identifier' : text)}
                  </div>
                }
                class='user-freq-name-input-dialog-input'
              >
                {this.inputSlotEntries.map(entry => {
                  return (
                    <CharInputSlot
                      ref={entry.ref}
                      charArray={UserFrequencyNameInputDialog.CHAR_ARRAY}
                      defaultCharValue={entry.defaultCharValue}
                      wrap
                      class={{
                        'user-freq-name-input-dialog-input-slot-autocomplete': entry.defaultCharValue.map(value => value !== '')
                      }}
                    />
                  );
                })}
              </CharInput>
            </div>
          </div>

          <ImgTouchButton
            label='Backspace'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
            onPressed={this.onBackspacePressed.bind(this)}
            class='ui-nav-button user-freq-name-input-dialog-backspace'
          />
        </div>

        <div class='user-freq-name-input-dialog-key-grid'>
          {UserFrequencyNameInputDialog.KEYS.map(this.renderKey.bind(this))}
        </div>

        <div class='user-freq-name-input-dialog-bottom-row'>
          <UiImgTouchButton
            label='Cancel'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`}
            onPressed={this.onCancelPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            label='Symbol'
            isEnabled={false}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            label='Enter'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            isEnabled={this.enterButtonEnabled}
            onPressed={this.resolve.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders a character key.
   * @param char The character of the key to render, or `null` if a spacer should be rendered instead.
   * @returns A rendered key for the specified character or a spacer, as a VNode.
   */
  private renderKey(char: string | null): VNode {
    if (char === null) {
      return (
        <div class='user-freq-name-input-dialog-key-spacer' />
      );
    }

    let cssClass = 'user-freq-name-input-dialog-key';

    if (char === ' ') {
      cssClass += ' user-freq-name-input-dialog-key-wide';
    } else if (isFinite(Number(char))) {
      cssClass += ' numpad-touch-button';
    }

    return (
      <UiTouchButton
        label={char === ' ' ? G3XSpecialChar.SpaceBar : char}
        onPressed={this.onKeyPressed.bind(this, char)}
        class={cssClass}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
