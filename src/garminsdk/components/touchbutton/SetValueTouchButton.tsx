import {
  DisplayComponent, FSComponent, MappedSubject, MutableSubscribable, SetSubject, Subscribable,
  SubscribableType, SubscribableUtils, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { ToggleStatusBar } from '../common/ToggleStatusBar';
import { TouchButton, TouchButtonProps } from './TouchButton';

/**
 * Component props for SetValueTouchButton.
 */
export interface SetValueTouchButtonProps<S extends MutableSubscribable<any>>
  extends Omit<TouchButtonProps, 'onPressed'> {

  /** A mutable subscribable whose state will be bound to the button. */
  state: S;

  /** A subscribable which provides the value which the button sets. */
  setValue: SubscribableType<S> | Subscribable<SubscribableType<S>>;

  /**
   * A callback function which will be called when the button is pressed. If not defined, pressing the button will
   * apply the button's set value to the state.
   */
  onPressed?: <B extends SetValueTouchButton<S> = SetValueTouchButton<S>>(button: B, state: S, setValue: SubscribableType<S>) => void;
}

/**
 * A touchscreen button which displays whether the value of a bound state is equal to a set value. By default, pressing
 * the button will apply its set value to the state. This behavior can be overridden by providing a custom callback
 * function which runs when the button is pressed.
 *
 * The root element of the button contains the `touch-button-set-value` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The root element contains a child {@link ToggleStatusBar} component with the CSS class
 * `touch-button-set-value-status-bar` and an optional label element with the CSS class `touch-button-label`.
 */
export class SetValueTouchButton<S extends MutableSubscribable<any>> extends DisplayComponent<SetValueTouchButtonProps<S>> {
  protected static readonly RESERVED_CSS_CLASSES = new Set(['touch-button-set-value']);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();
  protected readonly statusBarRef = FSComponent.createRef<ToggleStatusBar>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-set-value']);

  protected readonly setValue = SubscribableUtils.toSubscribable(this.props.setValue, true) as Subscribable<SubscribableType<S>>;

  protected readonly toggleState = MappedSubject.create(
    ([state, setValue]): boolean => state === setValue,
    this.props.state,
    this.setValue
  );

  protected cssClassSub?: Subscription;

  /** @inheritdoc */
  public render(): VNode {
    let onPressed: () => void;

    if (this.props.onPressed) {
      onPressed = (): void => {
        (this.props.onPressed as any)(this, this.props.state, this.setValue.get());
      };
    } else {
      onPressed = (): void => { this.props.state.set(this.setValue.get()); };
    }

    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <TouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        onPressed={onPressed}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        class={this.cssClassSet}
      >
        <ToggleStatusBar ref={this.statusBarRef} state={this.toggleState} class='touch-button-set-value-status-bar'></ToggleStatusBar>
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return SetValueTouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.buttonRef.instance.destroy();
    this.statusBarRef.instance.destroy();
    this.toggleState.destroy();

    this.props.onDestroy && this.props.onDestroy();
  }
}