import { EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { G1000FilePaths } from '../../G1000FilePaths';
import { ControlPadKeyOperations, ControlpadHEventHandler } from '../../Input/ControlpadHEventHandler';
import { FmsHEvent } from '../FmsHEvent';
import { UiControl, UiControlProps } from '../UiControl';

import './InputComponent.css';

/**
 * @interface InputComponentProps
 */
interface InputComponentProps extends UiControlProps {
  /** The event bus */
  bus: EventBus;

  /** The max char length of this input field. */
  maxLength: number;

  /** A callback method to output the updated text to. */
  onTextChanged(value: string): void;
}

/**
 * Input Component Class
 */
export class InputComponent extends UiControl<InputComponentProps> {
  private readonly textBoxRef = FSComponent.createRef<HTMLInputElement>();
  private readonly keyboardIconRef = FSComponent.createRef<HTMLImageElement>();
  private readonly inputValueContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly selectedSpanRef = FSComponent.createRef<HTMLSpanElement>();

  private readonly keyboardInputHandler = this.handleTextboxInput.bind(this);

  private readonly dataEntry = {
    text: '',
    highlightIndex: 0,
    beforeSelected: Subject.create(''),
    selected: Subject.create(''),
    afterSelected: Subject.create(''),
  };
  private readonly characterMap: readonly string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  private isKeyboardActive = false;
  private inputCharacterIndex = 0;
  private previousValue = '';
  private readonly inputId = this.genGuid();

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    let isHandled = false;
    const keyInputEvaluationResult = ControlpadHEventHandler.evaluateKeyboardInput(evt);
    switch (keyInputEvaluationResult.KeyboardOperation) {
      case ControlPadKeyOperations.InsertCharacter:
        // Insert a character received from the controlPad keyboard.
        if (!this.getIsActivated()) {
          this.activate();
        }
        if (keyInputEvaluationResult.ReceivedKey !== null) {
          this.updateDataEntryElement(keyInputEvaluationResult.ReceivedKey);
          this.dataEntry.highlightIndex++;
          isHandled = true;
        }
        break;

      case ControlPadKeyOperations.ApplyBackSpace:
        // Handle backspace keys received from the controlPad keyboard.
        this.leftDeleteCharacter();
        isHandled = true;
        break;

      default:
        // For all other events we pass the event on:
        isHandled = super.onInteractionEvent(evt);
        break;
    }
    return isHandled;
  }

  /**
   * Method to set the initial text value when the component is made active.
   * @param value is a string containing the start text value
   * @param highlightIndex The new index of the highlighted character. The index will remain unchanged if this
   * argument is undefined.
   * @param emitEvent Whether a text changed event should be emitted.
   */
  public setText(value: string, highlightIndex?: number, emitEvent = true): void {
    this.dataEntry.text = value.padEnd(this.props.maxLength, '_').substr(0, this.props.maxLength);
    this.dataEntry.highlightIndex = Utils.Clamp(highlightIndex ?? this.dataEntry.highlightIndex, 0, this.dataEntry.text.length - 1);
    this.textBoxRef.instance.value = value.substr(0, this.dataEntry.highlightIndex);
    this.updateDataEntryElement(undefined, emitEvent);
  }

  /**
   * Gets the current input.
   * @returns the data entry text
   */
  public getText(): string {
    return this.dataEntry.text;
  }

  /**
   * Gets the raw input without blank fills.
   * @returns the data entry text without blank fills
   */
  public getRawText(): string {
    return this.dataEntry.text.replace(/_/g, ' ').trim();
  }

  /**
   * Clears the input.
   * @param emitEvent A boolean indicating if an event should be emitted after clearing the input value.
   */
  public clear(emitEvent = true): void {
    this.setText('', 0, emitEvent);
  }

  /**
   * Method to select a character for data entry. TODO: Make part of component
   * @param increment is a bool for whether to increment or decrement the input character when the method is called
   * @returns a character to input into the data entry element
   */
  private updateSelectedCharacter(increment = true): string | undefined {
    this.inputCharacterIndex += increment ? 1 : -1;
    if (this.inputCharacterIndex > (this.characterMap.length - 1)) {
      this.inputCharacterIndex = 0;
    } else if (this.inputCharacterIndex < 0) {
      this.inputCharacterIndex = (this.characterMap.length - 1);
    }

    return this.characterMap[this.inputCharacterIndex];
  }

  /**
   * Method to update data entry field. TODO: Make part of component
   * @param newCharacter is the new string character to input
   * @param [emitEvent] A boolean indicating if a text changed event should be emitted.
   */
  private updateDataEntryElement(newCharacter: string | undefined = undefined, emitEvent = true): void {
    let beforeText = '';
    let selectedChar = '';
    let afterText = '';

    const text = this.dataEntry.text;

    if (this.dataEntry.highlightIndex !== undefined) {
      beforeText = text.substr(0, this.dataEntry.highlightIndex);
      selectedChar = text.substr(this.dataEntry.highlightIndex, 1);
      afterText = text.substr(this.dataEntry.highlightIndex + 1);
    } else {
      afterText = text;
    }

    if (newCharacter) {
      selectedChar = newCharacter;
      // clear chars after this
      const blankFill = this.props.maxLength - (this.dataEntry.highlightIndex + 1);
      if (blankFill > 1) {
        afterText = ''.padStart(blankFill, '_');
      }
    }

    this.inputCharacterIndex = this.characterMap.indexOf(selectedChar);
    const updatedText = beforeText + selectedChar + afterText;

    this.dataEntry.text = updatedText;

    if (emitEvent) {
      this.props.onTextChanged(this.dataEntry.text.replace(/_/g, ' ').trim());
    }

    this.dataEntry.beforeSelected.set(beforeText);
    this.dataEntry.selected.set(selectedChar);
    this.dataEntry.afterSelected.set(afterText);
  }

  /**
   * Method to delete the character to the left of the selected index in the entry field (bkspc function).
   * @param [emitEvent] A boolean indicating if a text changed event should be emitted.
   */
  private leftDeleteCharacter(emitEvent = true): void {
    if (this.dataEntry.highlightIndex !== undefined) {
      const newSelectedIndex = Math.max(0, this.dataEntry.highlightIndex - 1);

      const text = this.dataEntry.text;
      const blankFill = this.props.maxLength - this.dataEntry.highlightIndex;

      const beforeText = text.substr(0, newSelectedIndex);
      const newSelectedChar = '_';
      const afterText = ''.padStart(blankFill, '_');

      this.dataEntry.text = beforeText + newSelectedChar + afterText;

      if (emitEvent) {
        this.props.onTextChanged(this.dataEntry.text.replace(/_/g, ' ').trim());
      }

      // We move the index one to the left and fetch the new selected char:
      if (this.dataEntry.highlightIndex > 0) {
        this.dataEntry.highlightIndex--;
      }

      this.dataEntry.beforeSelected.set(beforeText);
      this.dataEntry.selected.set(newSelectedChar);
      this.dataEntry.afterSelected.set(afterText);
    }
  }


  /**
   * Handles the input from the hidden textbox
   */
  private handleTextboxInput(): void {
    const targetChars = this.textBoxRef.instance.value.trimRight().length;
    this.dataEntry.text = this.textBoxRef.instance.value.toUpperCase().padEnd(6, '_');
    this.dataEntry.highlightIndex = Utils.Clamp(targetChars, 0, this.dataEntry.text.length - 1);

    this.updateDataEntryElement(undefined, true);
  }

  /**
   * Method to handle when the virtual keyboard button is clicked
   */
  private handleKeyboardClicked = (): void => {
    if (this.getIsFocused()) {
      if (!this.isKeyboardActive) {
        this.activateKeyboardInput();
      } else {
        this.deactivateKeyboardInput();
      }
    }
  };

  /**
   * Activates keyboard input. If this control is not active, activating keyboard input will activate this control as
   * well.
   */
  private activateKeyboardInput(): void {
    if (!this.isActivated) {
      this.activate();
    }
    this.textBoxRef.instance.disabled = false;
    this.textBoxRef.instance.focus();

    this.isKeyboardActive = true;
  }

  /**
   * Deactivates keyboard input.
   */
  private deactivateKeyboardInput(): void {
    this.textBoxRef.instance.blur();
    this.textBoxRef.instance.disabled = true;

    this.isKeyboardActive = false;
  }

  /**
   * Method to handle when input focus is set
   * @param e The focus event.
   */
  private onInputFocus = (e: FocusEvent): void => {
    e.preventDefault();
    const currentText = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
    Coherent.on('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger('FOCUS_INPUT_FIELD', this.inputId, '', '', currentText, false);
    Coherent.on('mousePressOutsideView', () => {
      this.textBoxRef.instance.blur();
    });

    this.textBoxRef.instance.focus({ preventScroll: true });
    this.textBoxRef.instance.value = currentText;
    this.textBoxRef.instance.disabled = false;
    this.textBoxRef.instance.addEventListener('input', this.keyboardInputHandler);

    this.keyboardIconRef.instance.classList.add('active');
  };

  private setValueFromOS = (text: string): void => {
    this.textBoxRef.instance.value = text;
    this.textBoxRef.instance.dispatchEvent(new Event('input'));
    this.textBoxRef.instance.blur();
    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
  };

  /**
   * Method to handle on input blur
   */
  private onInputBlur = (): void => {
    ControlpadHEventHandler.clearPrefetchedCharacter();
    this.textBoxRef.instance.disabled = true;
    this.textBoxRef.instance.value = '';
    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger('UNFOCUS_INPUT_FIELD', '');
    Coherent.off('mousePressOutsideView');

    if (this.keyboardInputHandler) {
      this.textBoxRef.instance.removeEventListener('input', this.keyboardInputHandler);
    }

    this.keyboardIconRef.instance.classList.remove('active');
  };

  /** @inheritdoc */
  public onUpperKnobInc(): void {
    if (!this.getIsActivated()) {
      this.activate();
      if (this.getRawText() === '') {
        this.inputCharacterIndex = 9;
        this.updateDataEntryElement(this.updateSelectedCharacter(true));
      }
    } else {
      this.updateDataEntryElement(this.updateSelectedCharacter(true));
    }
  }

  /** @inheritdoc */
  public onUpperKnobDec(): void {
    if (!this.getIsActivated()) {
      this.activate();
      if (this.getRawText() === '') {
        this.inputCharacterIndex = 11;
        this.updateDataEntryElement(this.updateSelectedCharacter(false));
      }
    } else {
      this.updateDataEntryElement(this.updateSelectedCharacter(false));
    }
  }

  /** @inheritdoc */
  public onLowerKnobInc(): void {
    if (this.dataEntry.highlightIndex < 5) {
      this.dataEntry.highlightIndex++;
      this.updateDataEntryElement();
      if (this.isKeyboardActive) {
        this.textBoxRef.instance.value = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
      }
    }
  }

  /** @inheritdoc */
  public onLowerKnobDec(): void {
    if (this.dataEntry.highlightIndex < 1) {
      this.dataEntry.highlightIndex = 0;
    } else {
      this.dataEntry.highlightIndex--;
      this.updateDataEntryElement();
      if (this.isKeyboardActive) {
        this.textBoxRef.instance.value = this.dataEntry.text.substr(0, this.dataEntry.highlightIndex);
      }
    }
  }

  /** @inheritdoc */
  public onEnter(): boolean {
    ControlpadHEventHandler.clearPrefetchedCharacter();
    if (this.getIsActivated()) {
      this.deactivate();
      if (this.props.onEnter) {
        this.props.onEnter(this);
      }
      return true;
    } else if (this.getIsFocused()) {
      if (this.props.onEnter) {
        return this.props.onEnter(this);
      }
    }
    return false;
  }

  /** @inheritdoc */
  public onClr(): boolean {
    ControlpadHEventHandler.clearPrefetchedCharacter();
    if (this.getIsActivated()) {
      this.setText(this.previousValue);
      this.deactivate();
      return true;
    }
    return false;
  }

  /** @inheritdoc */
  public getHighlightElement(): Element | null {
    return this.inputValueContainerRef.instance;
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
    this.clear();
    this.inputValueContainerRef.instance.style.width = `${this.props.maxLength * 15}px`;
    this.keyboardIconRef.instance.onmouseup = this.handleKeyboardClicked;
    this.inputValueContainerRef.instance.onmouseup = this.handleKeyboardClicked;
    this.textBoxRef.instance.onfocus = this.onInputFocus;
    this.textBoxRef.instance.onblur = this.onInputBlur;
    this.textBoxRef.instance.blur();

    this.focusSubject.sub((v, rv) => {
      // Make sure we deactivate ourselves if we lose focus.
      if (!rv && this.isActivated) {
        this.deactivate();
        ControlpadHEventHandler.clearPrefetchedCharacter();
      } else if (rv === true) {
        // In case the component has focus, check for the existences of a prefetched character:
        const prefetchedCharacter = ControlpadHEventHandler.getPrefetchedCharacter();
        if (prefetchedCharacter !== undefined) {
          this.dataEntry.highlightIndex = 0;
          if (!this.getIsActivated()) {
            this.activate();
          }
          this.updateDataEntryElement(prefetchedCharacter, true);
          this.dataEntry.highlightIndex++;
        }
      }
    });
  }

  /** @inheritdoc */
  public onActivated(): void {
    this.dataEntry.highlightIndex = 0;
    this.updateDataEntryElement();
    this.previousValue = this.getText();
    this.selectedSpanRef.instance.classList.add(UiControl.FOCUS_CLASS);
    this.getHighlightElement()?.classList.remove(UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public onDeactivated(): void {
    this.previousValue = this.getText();
    this.textBoxRef.instance.blur();
    this.selectedSpanRef.instance.classList.remove(UiControl.FOCUS_CLASS);
    if (this.getIsFocused()) {
      this.getHighlightElement()?.classList.add(UiControl.FOCUS_CLASS);
    }
  }

  /**
   * Generates a unique id.
   * @returns A unique ID string.
   */
  private genGuid(): string {
    return 'INPT-xxxyxxyy'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /** @inheritdoc */
  renderControl(): VNode {
    return (
      <div class="input-component-scroller">
        <div ref={this.inputValueContainerRef} class="input-component-value" style="display:inline-block;">
          {this.dataEntry.beforeSelected}
          <span ref={this.selectedSpanRef}>{this.dataEntry.selected}</span>
          {this.dataEntry.afterSelected}
        </div>
        <input id={this.inputId} tabindex="-1" ref={this.textBoxRef} width="5px" style="border:1px; background-color:black; opacity:0;" type="text" size="1" maxLength="6" />
        <img ref={this.keyboardIconRef} src={`${G1000FilePaths.ASSETS_PATH}/keyboard_icon.png`} class='input-component-keyboard-icon' />
      </div>
    );
  }
}
