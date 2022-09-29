import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from 'msfssdk';

import { ToggleStatusBar } from '../common/ToggleStatusBar';
import { TouchButton } from './TouchButton';

/**
 * Component props for ToggleTouchButton.
 */
export interface ToggleTouchButtonProps<S extends Subscribable<boolean> | MutableSubscribable<boolean>> extends ComponentProps {
  /** A subscribable whose state will be bound to the button. */
  state: S;

  /**
   * Whether the button is enabled, or a subscribable which provides it. Disabled buttons cannot be pressed. Defaults
   * to `true`.
   */
  isEnabled?: boolean | Subscribable<boolean>;

  /** Whether the button is highlighted, or a subscribable which provides it. Defaults to `false`. */
  isHighlighted?: boolean | Subscribable<boolean>;

  /**
   * The label for the button. Can be defined as either a static `string`, a subscribable which provides the label
   * `string`, or a VNode. If not defined, the button will not have a label.
   */
  label?: string | Subscribable<string> | VNode;

  /**
   * A callback function which will be called when the button is pressed. If not defined, pressing the button will
   * toggle its bound state.
   */
  onPressed?: <B extends ToggleTouchButton<S> = ToggleTouchButton<S>>(button: B, state: S) => void;

  /** A callback function which will be called when the button is destroyed. */
  onDestroy?: () => void;

  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A touchscreen button which displays the value of a bound boolean state. By default, pressing the button will toggle
 * its state if the state is mutable. This behavior can be overridden by providing a custom callback function which
 * runs when the button is pressed.
 *
 * The root element of the button contains the `touch-button-toggle` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The root element contains a child {@link ToggleStatusBar} component with the CSS class
 * `touch-button-toggle-status-bar` and an optional label element with the CSS class `touch-button-label`.
 */
export class ToggleTouchButton<S extends Subscribable<boolean> | MutableSubscribable<boolean>> extends DisplayComponent<ToggleTouchButtonProps<S>> {

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();
  protected readonly statusBarRef = FSComponent.createRef<ToggleStatusBar>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-toggle']);

  protected cssClassSub?: Subscription;

  /** @inheritdoc */
  public render(): VNode {
    let onPressed: (() => void) | undefined;

    const state = this.props.state;

    if (this.props.onPressed) {
      onPressed = (): void => {
        (this.props.onPressed as any)(this, state);
      };
    } else if ('isMutableSubscribable' in state) {
      onPressed = (): void => { state.set(!state.get()); };
    }

    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class ?? '').filter(cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <TouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        label={this.props.label}
        onPressed={onPressed}
        class={this.cssClassSet}
      >
        <ToggleStatusBar ref={this.statusBarRef} state={this.props.state} class='touch-button-toggle-status-bar'></ToggleStatusBar>
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): Set<string> {
    return new Set(['touch-button-toggle']);
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.buttonRef.instance.destroy();
    this.statusBarRef.instance.destroy();

    this.props.onDestroy && this.props.onDestroy();
  }
}