import {
  ArrayUtils, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, NodeReference, SetSubject, Subject, Subscribable, SubscribableSet,
  Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { Epic2TscKeyboardEvents } from '@microsoft/msfs-epic2-shared';

import { CharInput, CharInputSlot, DuAndCcdIcon, TscButton } from '../../Shared';
import { TscService } from '../../TscService';
import { KeyboardAlphaKeyPopup } from './KeyboardAlphaKeyPopup';
import { KeyboardController, KeyValues } from './KeyboardController';

import './Keyboard.css';

/** An entry for a single character input slot. */
type CharInputSlotEntry = {
  /** A reference to the input slot. */
  ref: NodeReference<CharInputSlot>;
  /** The input slot's default character value. */
  defaultCharValue: Subject<string>;
};

/** Component props for Keyboard. */
export interface KeyboardProps extends ComponentProps {
  /** The instrument event bus. */
  bus: EventBus;
  /** CSS class(es) to apply to the number pad's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
  /** The TSC Service */
  tscService: TscService;
}

const closeButtonSvg = (
  <svg viewBox="-1 -1 12 12" stroke="var(--epic2-color-white)" stroke-width="2" stroke-linecap="round" width="26px" height="26px">
    <path d="M 0 0 L 10 10 M 0 10 L 10 0 z" />
  </svg>
);

const leftArrowSvg = (
  <svg class="tsc-keyboard-left-arrow" viewBox="-1 -1 12 12" width="21px" height="21px" ill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 5 10 L 0 5 M 5 0 l -5 5 M 10 5 L 0 5 z" />
  </svg>
);

const rightArrowSvg = (
  <svg class="tsc-keyboard-right-arrow" viewBox="-1 -1 12 12" width="21px" height="21px" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 5 0 L 10 5 M 5 10 l 5 -5 M 0 5 L 10 5 z" />
  </svg>
);

/**
 * A keyboard with buttons for all alphanumeric characters and the space character, a Clear button,
 * an Enter/Next button, a Delete button, and 2 Left/Right arrow buttons.
 */
export class Keyboard extends DisplayComponent<KeyboardProps> {

  private static readonly RESERVED_CSS_CLASSES = [
    'keyboard-container',
    'keyboard-container-alpha',
    'keyboard-container-numpad'
  ];

  private static readonly CHAR_ARRAY = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '', ' ', '.', '/', '+', '-',
  ];

  private thisNode?: VNode;

  private readonly controller = new KeyboardController(this.props.bus, this);

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  private readonly closeButtonRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['keyboard-container', 'hidden']);
  private readonly subscriber = this.props.bus.getSubscriber<Epic2TscKeyboardEvents>();

  private readonly showNumpad = Subject.create(false);

  private readonly mouseIsDown = Subject.create<boolean>(false);

  private cssClassSub?: Subscription | Subscription[];

  public readonly inputText = Subject.create('');
  public readonly inputSlotEntries: CharInputSlotEntry[] = ArrayUtils.create(8, () => {
    return {
      ref: FSComponent.createRef<CharInputSlot>(),
      defaultCharValue: Subject.create('')
    };
  });

  private readonly keyboardHeader = ConsumerSubject.create<string>(this.subscriber.on('tsc_keyboard_header'), '');

  private lastTabIndex = 0;
  public readonly inputRef = FSComponent.createRef<CharInput>();
  private readonly isDeleteKeyEnabled = this.inputText.map((input) => input !== '');

  private subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.closeButtonRef.instance.addEventListener('mouseup', this.onCloseButtonPressed.bind(this));

    this.subscriptions = [
      this.showNumpad.sub(showNumpad => {
        this.rootCssClass.toggle('keyboard-container-alpha', !showNumpad);
        this.rootCssClass.toggle('keyboard-container-numpad', showNumpad);
      }, true),

      this.subscriber.on('tsc_keyboard_active_input_id').whenChanged().handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id === undefined);
        this.inputRef.instance.placeCursor(0, false);

        if (id !== undefined) {
          this.lastTabIndex = this.props.tscService.tabIndexSubject.get();
          this.props.tscService.tabIndexSubject.set(-1);
        } else {
          this.props.tscService.tabIndexSubject.set(this.lastTabIndex);
        }
      }),
    ];
  }

  /**
   * Sets whether the keyboard shows the numpad keys instead of the alphabet keys.
   * @param show Whether to show the numpad keys.
   */
  public setShowNumpad(show: boolean): void {
    this.showNumpad.set(show);
  }

  /**
   * Responds to when one of this keyboard's character keys is pressed.
   * @param char The character of the key that was pressed.
   */
  private onKeyPressed(char: KeyValues): void {
    this.controller.onKeyPress(char);

    switch (char) {
      case 'CLEAR':
        this.onClearPressed();
        break;
      case 'LEFT_ARROW':
        this.onMoveCursorLeftPressed();
        break;
      case 'RIGHT_ARROW':
        this.onMoveCursorRightPressed();
        break;
      default:
        break;
    }
  }

  /** Sets cursor position to 0 when this keyboard's CLEAR button is pressed. */
  private onClearPressed(): void {
    this.inputRef.instance.placeCursor(0, false);
  }

  /** Moves cursors 1 slot to the left when this keyboard's LEFT ARROW button is pressed. */
  private onMoveCursorLeftPressed(): void {
    this.inputRef.instance.moveCursor(-1, true);
  }

  /** Moves cursors 1 slot to the right when this keyboard's RIGHT ARROW button is pressed. */
  private onMoveCursorRightPressed(): void {
    this.inputRef.instance.moveCursor(1, true);
  }

  /** A callback function which will be called every time a mouse down event happens. */
  private onMouseDown(): void {
    this.mouseIsDown.set(true);
  }

  /** A callback function which will be called every time a mouse down event happens. */
  private onMouseUp(): void {
    this.mouseIsDown.set(false);
  }

  /** A callback function which will be called when the Close button is pressed. */
  private onCloseButtonPressed(): void {
    this.controller.onClose();
  }

  /**
   * Renders a character key.
   * @param cssClass CSS class(es) to apply to the key's root element.
   * @param value The string value of this key.
   * @param label The character or VNode to display on the key.
   * @param isEnabled Whether this key is enabled. Defaults to true.
   * @param popUpLabel The label to display in the key's popup.
   * @returns A key for the specified character, as a VNode.
   */
  protected renderKey(
    cssClass: string,
    value: KeyValues,
    label: string | VNode,
    isEnabled: boolean | Subscribable<boolean>,
    popUpLabel?: string,
  ): VNode {

    if (popUpLabel) {
      const showPopup = Subject.create<boolean>(false);
      return (
        <KeyboardAlphaKeyPopup label={popUpLabel} show={showPopup}>
          {cssClass === 'keyboard-numpad-key' ? (
            <TscButton
              label={label}
              onPressed={this.onKeyPressed.bind(this, value)}
              class={cssClass}
              variant='base'
              isEnabled={isEnabled}
            />
          ) : (
            <TscButton
              label={label}
              onPressed={this.onKeyPressed.bind(this, value)}
              onMouseDown={this.onMouseDown.bind(this)}
              onMouseUp={this.onMouseUp.bind(this)}
              mouseIsDown={this.mouseIsDown}
              showPopup={showPopup}
              class={cssClass}
              variant='base'
              isEnabled={isEnabled}
            />
          )}
        </KeyboardAlphaKeyPopup>
      );
    }

    return (
      <>
        {cssClass === 'keyboard-numpad-key' ? (
          <TscButton
            label={label}
            onPressed={this.onKeyPressed.bind(this, value)}
            class={cssClass}
            variant='base'
            isEnabled={isEnabled}
          />
        ) : (
          <TscButton
            label={label}
            onPressed={this.onKeyPressed.bind(this, value)}
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            mouseIsDown={this.mouseIsDown}
            class={cssClass}
            variant='base'
            isEnabled={isEnabled}
          />
        )}
      </>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, Keyboard.RESERVED_CSS_CLASSES);
    } else if (this.props.class) {
      for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !Keyboard.RESERVED_CSS_CLASSES.includes(classToFilter))) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div ref={this.rootRef} class={this.rootCssClass}>
        <div class="tsc-keyboard-header">
          <DuAndCcdIcon bus={this.props.bus} style='transform: scale3d(0.7, 0.7, 0.7); position: absolute; top: -3px; left: -10px;' />
          <div class="tsc-keyboard-header-label">
            {this.keyboardHeader}
          </div>

          <div ref={this.closeButtonRef} class="tsc-keyboard-close-button">
            {closeButtonSvg}
          </div>
        </div>
        <div class='keyboard-container-mode keyboard-qwerty'>
          <div class='tsc-keyboard-input-display'>
            <CharInput ref={this.inputRef} value={this.inputText} allowBackFill class="tsc-keyboard-input">
              {this.inputSlotEntries.map(entry => {
                return (
                  <CharInputSlot
                    ref={entry.ref}
                    charArray={Keyboard.CHAR_ARRAY}
                    defaultCharValue={entry.defaultCharValue}
                    wrap
                    class={{ 'tsc-keyboard-input-slot': entry.defaultCharValue.map(value => value !== '-') }}
                  />
                );
              })}

            </CharInput>
          </div>
          <div class='keyboard-row keyboard-row-0'>
            {this.renderKey('left-arrow-button', 'LEFT_ARROW', leftArrowSvg, this.isDeleteKeyEnabled)}
            {this.renderKey('right-arrow-button', 'RIGHT_ARROW', rightArrowSvg, this.isDeleteKeyEnabled,)}
            {this.renderKey('delete-button', 'DELETE', 'DELETE', this.isDeleteKeyEnabled)}
          </div>
          <div class='keyboard-row keyboard-row-numpad'>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((char) =>
              this.renderKey('keyboard-numpad-key', char as KeyValues, char, true)
            )}
          </div>
          <div class='keyboard-row keyboard-row-1'>
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((char) =>
              this.renderKey('keyboard-alpha-key', char as KeyValues, char, true, char)
            )}
          </div>
          <div class='keyboard-row keyboard-row-2'>
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((char) =>
              this.renderKey('keyboard-alpha-key', char as KeyValues, char, true, char)
            )}
          </div>
          <div class='keyboard-row keyboard-row-3'>
            {['+/-', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '/'].map((char) =>
              this.renderKey('keyboard-alpha-key', char as KeyValues, char, true, char)
            )}
          </div>
          <div class='keyboard-row keyboard-row-4'>
            {this.renderKey('clear-button', 'CLEAR', 'CLEAR', true)}
            {this.renderKey('space-button', 'SPACE', 'SPACE', true)}
            {this.renderKey('enter-button', 'ENTER/NEXT', 'ENTER/NEXT', true)}
          </div>
          <div class="tsc-keyboard-slide-pagination">
            <div class="left-circle"></div>
            <div class="right-circle"></div>
          </div>
        </div>
      </div >
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.subscriptions.map((sub) => sub.destroy());

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    this.closeButtonRef.instance.removeEventListener('mouseup', this.onCloseButtonPressed.bind(this));

    super.destroy();
  }
}
