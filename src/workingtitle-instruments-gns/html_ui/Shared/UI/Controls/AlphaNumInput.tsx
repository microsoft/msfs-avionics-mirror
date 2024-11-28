import { FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GNSFilePaths } from '../../GNSFilePaths';
import { GNSType } from '../../UITypes';
import { GNSUiControl, GNSUiControlProps } from '../GNSUiControl';

import './AlphaNumInput.css';

/**
 * Props for the AlphaNumInput control.
 */
interface AlphaNumInputProps extends GNSUiControlProps {
  /** The length of characters that can be input. Defaults to 5. */
  length?: number;

  /** The class to apply to this control. */
  class?: string;

  /**
   * A callback called when the input is changed.
   * @param val The full new value of the input.
   * @param index The input index that changed.
   * @param changedTo The value the input index changed to.
   */
  onChanged: (val: string, index: number, changedTo: string) => void;

  /** The GNS type */
  gnsType: GNSType;

  /** Whether or not keyboard focus mode is enabled. */
  enableKeyboard?: boolean;
}

/**
 * A control that allows a user to input an alphanumeric string via the right inner knob.
 */
export class AlphaNumInput extends GNSUiControl<AlphaNumInputProps> {
  private currentValue = ''.padEnd(this.props.length !== undefined ? this.props.length : 5, '_');
  private readonly el = FSComponent.createRef<HTMLDivElement>();
  private readonly root = FSComponent.createRef<GNSUiControl>();
  private readonly activeRef = FSComponent.createRef<HTMLDivElement>();
  private readonly inactiveRef = FSComponent.createRef<HTMLDivElement>();
  private readonly keyboardRef = FSComponent.createRef<HTMLDivElement>();

  public isEditing = false;
  private inactiveRenderedValue: string | null = null;
  private readonly keyboardIcon = FSComponent.createRef<HTMLImageElement>();
  private readonly textBox = FSComponent.createRef<HTMLInputElement>();
  private currentSlotIndex = 0;

  private readonly inputId = this.genGuid();

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    if (this.props.enableKeyboard) {
      this.textBox.instance.onkeydown = (e): void => this.onKeyboardEvent(e);
      this.textBox.instance.onfocus = (e): void => this.onKeyboardFocus(e);
      this.textBox.instance.onblur = (e): void => this.onKeyboardBlur(e);

      this.textBox.instance.disabled = true;
      this.el.instance.onclick = (): any => {
        if (this.props.enableKeyboard) {
          if (this.textBox.instance.disabled) {
            this.textBox.instance.disabled = false;
            this.textBox.instance.focus();
          } else {
            this.textBox.instance.disabled = true;
            this.textBox.instance.blur();
          }
        }
      };
    }
    this.updateInactiveDisplay();
    this.displayKeyboardIcon(false);

    const charWidth = this.props.gnsType === 'wt530' ? 10 : 12;
    this.el.instance.style.setProperty('--alpha-num-input-width', `${this.props.length ? this.props.length * charWidth : 50}px`);
  }

  /**
   * Handles when a character in a slot changes.
   * @param index The index of the character.
   * @param val The value at that index.
   */
  private onSlotChanged(index: number, val: string): void {
    const newValue = this.currentValue.substr(0, index) + val;
    this.set(newValue);

    const underscoreIndex = this.currentValue.indexOf('_');
    let valWithoutUnderscores = newValue;
    if (underscoreIndex !== -1) {
      valWithoutUnderscores = this.currentValue.substr(0, this.currentValue.indexOf('_'));
    }

    this.props.onChanged(valWithoutUnderscores, index, val);
    this.currentSlotIndex = index;

    this.manageSelected();

    this.root.instance.getChild(index)?.focus(FocusPosition.First);
  }

  /**
   * Sets the value of the input control.
   * @param val The value to set.
   */
  public set(val: string): void {
    const isEditing = this.isEditing;
    this.isEditing = true;
    for (let i = 0; i < this.currentValue.length; i++) {
      const slot = this.root.instance.getChild(i) as InputSlot;
      if (i >= val.length) {
        slot.set('_');
      } else {
        slot.set(val[i] as string);
      }
    }

    //Only update the current slot index if we're not in keyboard mode
    //else keyboard mode is tracking that for us
    if (document.activeElement !== this.textBox.instance) {
      this.currentSlotIndex = val.length - 1;
    }

    this.currentValue = val.padEnd(this.props.length !== undefined ? this.props.length : 5, '_');
    if (this.props.enableKeyboard) {
      this.textBox.instance.value = val;
      isEditing && document.activeElement === this.textBox.instance && this.textBox.instance.setSelectionRange(val.length - 1, val.length - 1);
    }
    this.updateInactiveDisplay();
    this.isEditing = isEditing;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    if (this.root.instance.getFocusedIndex() === -1) {
      this.focusSelf();
    }
  }

  /**
   * Focuses the whole input component itself.
   */
  public focusSelf(): void {
    this.root.instance.blur();
    this.disableSlots();
    this.displayKeyboardIcon(true);

    this.manageSelected();

  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.enableSlots();
    this.root.instance.getChild(0)?.focus(FocusPosition.First);

    this.manageSelected();

    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.enableSlots();
    this.root.instance.getChild(0)?.focus(FocusPosition.First);

    this.manageSelected();

    return true;
  }

  /**
   * Disables the individual input slots.
   */
  public disableSlots(): void {
    for (let i = 0; i < this.root.instance.length; i++) {
      this.root.instance.getChild(i)?.setDisabled(true);
    }
    this.isEditing = false;
    this.updateInactiveDisplay();
  }

  /**
   * Enables the individual input slots.
   */
  public enableSlots(): void {
    for (let i = 0; i < this.root.instance.length; i++) {
      const child = this.root.instance.getChild(i) as InputSlot;
      child?.setDisabled(false);
      child?.set(this.currentValue[i]);
    }
    this.displayKeyboardIcon(true);
    this.isEditing = true;
    this.updateInactiveDisplay();
  }

  /** @inheritDoc */
  protected onBlurred(): void {
    this.root.instance.setFocusedIndex(0);

    this.manageSelected();
    !this.isEditing && this.displayKeyboardIcon(false);
    if (this.props.enableKeyboard) {
      this.textBox.instance.blur();
    }
  }

  /**
   * Shows the Keyboard icon.
   * @param display Boolean to show keyboard icon.
   */
  public displayKeyboardIcon(display: boolean): void {
    this.keyboardRef.instance.style.display = display ? '' : 'none';
  }

  /**
   * An event fired when keyboard focus receives a key event.
   * @param e The keyboard event.
   */
  protected onKeyboardEvent(e: KeyboardEvent): void {
    if (e.keyCode === 8) {
      if (this.currentSlotIndex === 0 && this.currentValue[0] !== '_') {
        this.onSlotChanged(0, '_');
      } else if (this.currentSlotIndex === this.root.instance.length - 1 && this.currentValue[this.root.instance.length - 1] !== '_') {
        this.onSlotChanged(this.root.instance.length - 1, '_');
      } else if (this.currentValue[0] !== '_') {
        this.scroll('backward');
        this.onSlotChanged(this.currentSlotIndex - 1, '_');
      } else {
        this.focusSelf();
      }
    } else {
      const key = String.fromCharCode(e.keyCode).toUpperCase();
      if (InputSlot.CharacterMap.includes(key)) {
        this.enableSlots();

        this.onSlotChanged(this.currentSlotIndex, key);
        this.scroll('forward');
        this.currentSlotIndex = Math.min(this.currentSlotIndex + 1, this.root.instance.length - 1);
      }
    }

    e.preventDefault();
  }

  /**
   * An event triggered when keyboard focus is entered.
   * @param e The event that was triggered.
   */
  protected onKeyboardFocus(e: FocusEvent): void {
    e.preventDefault();

    this.enableSlots();
    this.root.instance.getChild(0)?.focus(FocusPosition.First);

    this.manageSelected();

    this.currentSlotIndex = this.root.instance.getFocusedIndex();
    this.textBox.instance.focus({ preventScroll: true });

    const underscoreIndex = this.currentValue.indexOf('_');
    let valWithoutUnderscores = this.currentValue;
    if (underscoreIndex !== -1) {
      valWithoutUnderscores = this.currentValue.substring(0, this.currentValue.indexOf('_'));
    }

    Coherent.on('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger('FOCUS_INPUT_FIELD', this.inputId, '', '', valWithoutUnderscores, false);
    Coherent.on('mousePressOutsideView', () => {
      this.textBox.instance.blur();
    });

    this.keyboardIcon.instance.style.backgroundColor = 'cyan';
  }

  /**
   * An event triggered when keyboard focus is exited.
   * @param e The event that was triggered.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onKeyboardBlur(e: FocusEvent): void {
    e.preventDefault();

    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
    Coherent.trigger('UNFOCUS_INPUT_FIELD', '');
    Coherent.off('mousePressOutsideView');
    this.keyboardIcon.instance.style.backgroundColor = 'transparent';
  }

  private setValueFromOS = (text: string): void => {
    this.textBox.instance.value = text;
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      this.onSlotChanged(i, char);
    }
    this.textBox.instance.blur();
    Coherent.off('SetInputTextFromOS', this.setValueFromOS);
  };

  /**
   * Manages whether the inactive ref is selected.
   */
  private manageSelected(): void {
    if (this.isEditing) {
      this.inactiveRef.instance.classList.remove('selected');
    } else if (this.isFocused) {
      this.inactiveRef.instance.classList.add('selected');
    } else {
      this.inactiveRef.instance.classList.remove('selected');
    }
  }

  /**
   * Updates this input's rendered editing-inactive value. If editing is currently active, the rendered editing-
   * inactive value will be hidden. If editing is not active, it will be displayed and updated to reflect this input's
   * current value.
   */
  private updateInactiveDisplay(): void {
    if (!this.isEditing) {
      const index = this.currentValue.indexOf('_');
      this.inactiveRenderedValue = this.currentValue.substr(0, index < 0 ? this.props.length ?? 5 : index);
      this.inactiveRef.instance.textContent = this.inactiveRenderedValue === '' ? ''.padEnd(this.props.length !== undefined ? this.props.length : 5, '_') : this.inactiveRenderedValue;
      this.inactiveRef.instance.style.display = '';
      this.activeRef.instance.style.display = 'none';
    } else {
      this.inactiveRef.instance.style.display = 'none';
      this.activeRef.instance.style.display = '';
      this.inactiveRef.instance.textContent = '';
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
  public render(): VNode {
    return (
      <div class={`alpha-num-input ${this.props.class ?? ''}`} ref={this.el}>
        <GNSUiControl ref={this.root} isolateScroll>
          <div class='alpha-num-active alpha-num-input-width' ref={this.activeRef} >
            {Array(this.props.length !== undefined ? this.props.length : 5).fill(0)
              .map((val, index) => (<InputSlot onChanged={this.onSlotChanged.bind(this, index)} />))}
          </div>
          <div class='alpha-num-inactive alpha-num-input-width' ref={this.inactiveRef} />
          <div class='alpha-num-keyboard' ref={this.keyboardRef} >
            {this.props.enableKeyboard && <img ref={this.keyboardIcon} src={`${GNSFilePaths.ASSETS_PATH}/Images/keyboard.png`} class='alpha-num-kb-icon' />}
            {this.props.enableKeyboard && <input id={this.inputId} tabindex="-1" ref={this.textBox} width="0px" style="border:1px; background-color:black; opacity:0; display: inline-block;" type="text" size="1" maxLength="5" />}
          </div>
        </GNSUiControl>
      </div>
    );
  }
}

/**
 * Props on the InputSlot component.
 */
interface InputSlotProps extends GNSUiControlProps {
  /**
   * A callback called when the input slot value changes.
   * @param val The value in the slot.
   */
  onChanged: (val: string) => void;
}

/**
 * A control that allows scrolling between alphanumeric characters.
 */
class InputSlot extends GNSUiControl<InputSlotProps> {
  public static readonly CharacterMap: readonly string[] = ['_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  private readonly char = Subject.create('_');
  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    return this.changeChar('inc');
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    return this.changeChar('dec');
  }

  /**
   * Changes the character in the input slot.
   * @param direction The direction to change in.
   * @returns Whether or not the change was handled.
   */
  private changeChar(direction: 'inc' | 'dec'): boolean {
    const currentIndex = InputSlot.CharacterMap.indexOf(this.char.get());
    let nextIndex = direction === 'inc' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= InputSlot.CharacterMap.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = InputSlot.CharacterMap.length - 1;
    }

    this.char.set(InputSlot.CharacterMap[nextIndex]);
    this.props.onChanged(this.char.get());

    return true;
  }

  /**
   * Sets the character value for the input slot.
   * @param val The value to set.
   */
  public set(val: string): void {
    this.char.set(val[0]);
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (<span class='alpha-num-slot' ref={this.el}>{this.char}</span>);
  }
}
