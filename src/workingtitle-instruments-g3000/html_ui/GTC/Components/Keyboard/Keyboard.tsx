import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, Subject, Subscribable, SubscribableSet, Subscription,
  ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { TouchButton } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import './Keyboard.css';

/**
 * Component props for Keyboard.
 */
export interface KeyboardProps extends ComponentProps {
  /**
   * Whether to show the "Find" button. If `true`, then the "Find" button will replace the space button while the
   * keyboard is displaying letters, and the space button will instead be shown while the keyboard is displaying
   * numerals.
   */
  showFindButton: boolean;

  /** Whether the space button is enabled. */
  isSpaceButtonEnabled: boolean | Subscribable<boolean>;

  /** A callback function which is called when a character key button is pressed. */
  onKeyPressed?: (char: string) => void;

  /** A callback function which is called when the backspace button is pressed. */
  onBackspacePressed?: () => void;

  /** A callback function which is called when the "Find" button is pressed. */
  onFindPressed?: () => void;

  /** CSS class(es) to apply to the number pad's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A keyboard with buttons for all alphanumeric characters and the space character, a backspace button, and an optional
 * "Find" button. The display of letters and numerals is mutually exclusive, and the keyboard can be toggled between
 * the two states. The letters are ordered alphabetically.
 */
export class Keyboard extends DisplayComponent<KeyboardProps> {
  private static readonly RESERVED_CSS_CLASSES = [
    'keyboard-container',
    'keyboard-container-alpha',
    'keyboard-container-numpad'
  ];

  private thisNode?: VNode;

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly rootCssClass = SetSubject.create(['keyboard-container']);

  private readonly showNumpad = Subject.create(false);

  private cssClassSub?: Subscription | Subscription[];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.showNumpad.sub(showNumpad => {
      this.rootCssClass.toggle('keyboard-container-alpha', !showNumpad);
      this.rootCssClass.toggle('keyboard-container-numpad', showNumpad);
    }, true);
  }

  /**
   * Sets whether the keyboard shows the numpad keys instead of the alphabet keys.
   * @param show Whether to show the numpad keys.
   */
  public setShowNumpad(show: boolean): void {
    this.showNumpad.set(show);
  }

  /**
   * Responds to when this keyboard's mode button is pressed.
   */
  private onModePressed(): void {
    this.showNumpad.set(!this.showNumpad.get());
  }

  /**
   * Responds to when one of this keyboard's character keys is pressed.
   * @param char The character of the key that was pressed.
   */
  private onKeyPressed(char: string): void {
    this.props.onKeyPressed && this.props.onKeyPressed(char);
  }

  /**
   * Responds to when this keyboard's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.props.onBackspacePressed && this.props.onBackspacePressed();
  }

  /**
   * Responds to when this keyboard's find button is pressed.
   */
  private onFindPressed(): void {
    this.props.onFindPressed && this.props.onFindPressed();
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

    const renderAlphaKey = (char: string): VNode => this.renderKey('keyboard-alpha-key', char);
    const renderNumpadKey = (char: string): VNode => this.renderKey('keyboard-numpad-key', char);

    return (
      <div ref={this.rootRef} class={this.rootCssClass}>
        <div class='keyboard-container-mode keyboard-alpha'>
          <div class='keyboard-row'>
            {['A', 'B'].map(renderAlphaKey)}
            {
              this.props.showFindButton
                ? (
                  <TouchButton
                    onPressed={this.onFindPressed.bind(this)}
                    class='keyboard-find'
                  >
                    <img
                      src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_find.png`}
                      class='keyboard-find-icon'
                    />
                    <div class='keyboard-find-label'>Find</div>
                  </TouchButton>
                ) : (
                  <TouchButton
                    label='SPC'
                    onPressed={this.onKeyPressed.bind(this, ' ')}
                    isEnabled={this.props.isSpaceButtonEnabled}
                    class='keyboard-space-key'
                  />
                )
            }
            <TouchButton
              class='keyboard-mode keyboard-button-wide'
              label={this.showNumpad.map(x => x ? 'ABC...' : '123...')}
              onPressed={this.onModePressed.bind(this)}
            />
            <TouchButton
              onPressed={this.onBackspacePressed.bind(this)}
              class='keyboard-backspace keyboard-button-wide'
            >
              <div class="keyboard-backspace-label">Backspace</div>
              <img
                src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_backspace_long.png`}
                class='keyboard-backspace-icon'
              />
            </TouchButton>
          </div>
          <div class='keyboard-row'>
            {['C', 'D', 'E', 'F', 'G', 'H'].map(renderAlphaKey)}
          </div>
          <div class='keyboard-row'>
            {['I', 'J', 'K', 'L', 'M', 'N'].map(renderAlphaKey)}
          </div>
          <div class='keyboard-row'>
            {['O', 'P', 'Q', 'R', 'S', 'T'].map(renderAlphaKey)}
          </div>
          <div class='keyboard-row'>
            {['U', 'V', 'W', 'X', 'Y', 'Z'].map(renderAlphaKey)}
          </div>
        </div>
        <div class='keyboard-container-mode keyboard-numpad'>
          <div class='keyboard-numpad-column'>
            {['N', 'S', 'E', 'W'].map(renderNumpadKey)}
          </div>
          <div class='keyboard-numpad-group'>
            <div class='keyboard-row'>
              {['1', '2', '3'].map(renderNumpadKey)}
            </div>
            <div class='keyboard-row'>
              {['4', '5', '6'].map(renderNumpadKey)}
            </div>
            <div class='keyboard-row'>
              {['7', '8', '9'].map(renderNumpadKey)}
            </div>
            <div class='keyboard-row'>
              {this.renderKey('keyboard-numpad-key', '0', '0̸')}
            </div>
          </div>
          {this.props.showFindButton && (
            <TouchButton
              label='SPC'
              onPressed={this.onKeyPressed.bind(this, ' ')}
              isEnabled={this.props.isSpaceButtonEnabled}
              class='keyboard-numpad-key keyboard-space-key'
            />
          )}
        </div>
      </div>
    );
  }

  /**
   * Renders a character key.
   * @param cssClass CSS class(es) to apply to the key's root element.
   * @param char The character for which to render the key.
   * @param label The key's label text. Defaults to the same value as `char`.
   * @returns A key for the specified character, as a VNode.
   */
  protected renderKey(cssClass: string, char: string, label = char): VNode {
    return (
      <TouchButton
        label={label}
        onPressed={this.onKeyPressed.bind(this, char)}
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    if (this.cssClassSub) {
      if (Array.isArray(this.cssClassSub)) {
        for (const sub of this.cssClassSub) {
          sub.destroy();
        }
      } else {
        this.cssClassSub.destroy();
      }
    }

    super.destroy();
  }
}