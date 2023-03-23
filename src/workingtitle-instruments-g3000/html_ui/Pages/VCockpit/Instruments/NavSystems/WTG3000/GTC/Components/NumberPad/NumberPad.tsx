import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { GtcOrientation } from '@microsoft/msfs-wtg3000-common';

import { RoundTouchButton } from '../TouchButton/RoundTouchButton';
import { TouchButton } from '../TouchButton/TouchButton';

import '../../Components/TouchButton/NumPadTouchButton.css';
import './NumberPad.css';

/** The properties for the NumberPad component. */
export interface NumberPadProps extends ComponentProps {
  /** A callback function to execute when a number pad button is pressed. */
  onNumberPressed?: (value: number) => void;

  /** A callback function to execute when the sign button is pressed. */
  onSignPressed?: () => void;

  /** A callback function to execute when the decimal button is pressed. */
  onDecimalPressed?: () => void;

  /** CSS class(es) to apply to the number pad's root element. */
  class?: string | SubscribableSet<string>;

  /** Whether the button is to be used in the vertical or horizontal orientation. */
  orientation: GtcOrientation;

  /** Whether to show the sign button. Defaults to `false`. */
  showSignButton?: Subscribable<boolean> | boolean;

  /** Whether to show the decimal button. Defaults to `false`. */
  showDecimalButton?: Subscribable<boolean> | boolean;
}

/**
 * A number pad with buttons for each integer from zero to nine, inclusive, and optional sign (`+/−`) and decimal
 * (`.`) buttons.
 */
export class NumberPad extends DisplayComponent<NumberPadProps> {
  private static readonly RESERVED_CSS_CLASSES = ['number-pad', 'show-sign-button', 'show-decimal-button'];

  private readonly numButtonRefs = Array.from({ length: 10 }, () => FSComponent.createRef<TouchButton>());
  private readonly signButtonRef = FSComponent.createRef<TouchButton>();
  private readonly decimalButtonRef = FSComponent.createRef<TouchButton>();

  private readonly classList = SetSubject.create(['number-pad']);

  private cssClassSub?: Subscription;
  private showSignButtonSub?: Subscription;
  private showDecimalButtonSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    if (SubscribableUtils.isSubscribable(this.props.showSignButton)) {
      this.showSignButtonSub = this.props.showSignButton.sub(showSignButton => {
        this.classList.toggle('show-sign-button', showSignButton);
      }, true);
    } else {
      this.classList.toggle('show-sign-button', !!this.props.showSignButton);
    }

    if (SubscribableUtils.isSubscribable(this.props.showDecimalButton)) {
      this.showDecimalButtonSub = this.props.showDecimalButton.sub(showDecimalButton => {
        this.classList.toggle('show-decimal-button', showDecimalButton);
      }, true);
    } else {
      this.classList.toggle('show-decimal-button', !!this.props.showDecimalButton);
    }
  }

  /**
   * Responds to when one of this number pad's numeric buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  private onNumButtonPressed(value: number): void {
    this.props.onNumberPressed && this.props.onNumberPressed(value);
  }

  /**
   * Responds to when this number pad's sign button is pressed.
   */
  private onSignButtonPressed(): void {
    this.props.onSignPressed && this.props.onSignPressed();
  }

  /**
   * Responds to when this number pad's decimal button is pressed.
   */
  private onDecimalButtonPressed(): void {
    this.props.onDecimalPressed && this.props.onDecimalPressed();
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.classList, this.props.class, NumberPad.RESERVED_CSS_CLASSES);
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !NumberPad.RESERVED_CSS_CLASSES.includes(classToAdd))
          .forEach(x => this.classList.add(x));
      }
    }

    return (
      <div class={this.classList}>
        {Array.from({ length: 10 }, (v, index) => {
          return (
            <RoundTouchButton
              ref={this.numButtonRefs[index]}
              label={index.toString()}
              onPressed={(): void => { this.onNumButtonPressed(index); }}
              class={`numpad-touch-button number-pad-button number-pad-button-${index}`}
              orientation={this.props.orientation}
            />
          );
        })}
        {(this.props.showSignButton ?? false) !== false && (
          <RoundTouchButton
            ref={this.signButtonRef}
            label='+/−'
            onPressed={(): void => { this.onSignButtonPressed(); }}
            class='numpad-touch-button number-pad-button number-pad-button-sign'
            orientation={this.props.orientation}
          />
        )}
        {(this.props.showDecimalButton ?? false) !== false && (
          <RoundTouchButton
            ref={this.decimalButtonRef}
            label='.'
            onPressed={(): void => { this.onDecimalButtonPressed(); }}
            class='numpad-touch-button number-pad-button number-pad-button-decimal'
            orientation={this.props.orientation}
          />
        )}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.numButtonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
    this.signButtonRef.getOrDefault()?.destroy();
    this.decimalButtonRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();
    this.showSignButtonSub?.destroy();
    this.showDecimalButtonSub?.destroy();

    super.destroy();
  }
}