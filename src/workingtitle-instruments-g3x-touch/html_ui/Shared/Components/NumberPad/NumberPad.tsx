import {
  ArrayUtils, ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet,
  SubscribableUtils, Subscription, ToggleableClassNameRecord, VNode
} from '@microsoft/msfs-sdk';

import { TouchButton } from '../TouchButton/TouchButton';

import './NumberPad.css';

/**
 * Component props for NumberPad.
 */
export interface NumberPadProps extends ComponentProps {
  /** A callback function to execute when a number pad button is pressed. */
  onNumberPressed?: (value: number) => void;

  /** A callback function to execute when the sign button is pressed. */
  onSignPressed?: () => void;

  /** A callback function to execute when the decimal button is pressed. */
  onDecimalPressed?: () => void;

  /** CSS class(es) to apply to the number pad's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;

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

  private readonly rootCssClass = SetSubject.create(['number-pad']);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    if (SubscribableUtils.isSubscribable(this.props.showSignButton)) {
      this.subscriptions.push(
        this.props.showSignButton.sub(showSignButton => {
          this.rootCssClass.toggle('show-sign-button', showSignButton);
        }, true)
      );
    } else {
      this.rootCssClass.toggle('show-sign-button', !!this.props.showSignButton);
    }

    if (SubscribableUtils.isSubscribable(this.props.showDecimalButton)) {
      this.subscriptions.push(
        this.props.showDecimalButton.sub(showDecimalButton => {
          this.rootCssClass.toggle('show-decimal-button', showDecimalButton);
        }, true)
      );
    } else {
      this.rootCssClass.toggle('show-decimal-button', !!this.props.showDecimalButton);
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
      const sub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, NumberPad.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      if (this.props.class !== undefined && this.props.class.length > 0) {
        FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !NumberPad.RESERVED_CSS_CLASSES.includes(classToAdd))
          .forEach(x => this.rootCssClass.add(x));
      }
    }

    return (
      <div class={this.rootCssClass}>
        {ArrayUtils.create(10, index => {
          return (
            <TouchButton
              ref={this.numButtonRefs[index]}
              label={index.toString()}
              onPressed={(): void => { this.onNumButtonPressed(index); }}
              class={`numpad-touch-button number-pad-button number-pad-button-${index}`}
            />
          );
        })}
        {(this.props.showSignButton ?? false) !== false && (
          <TouchButton
            ref={this.signButtonRef}
            label='±'
            onPressed={(): void => { this.onSignButtonPressed(); }}
            class='numpad-touch-button number-pad-button number-pad-button-sign'
          />
        )}
        {(this.props.showDecimalButton ?? false) !== false && (
          <TouchButton
            ref={this.decimalButtonRef}
            label='.'
            onPressed={(): void => { this.onDecimalButtonPressed(); }}
            class='numpad-touch-button number-pad-button number-pad-button-decimal'
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

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}