import { DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableType, Subscription, VNode } from '@microsoft/msfs-sdk';

import { TouchButton, TouchButtonProps } from './TouchButton';

/**
 * Component props for ValueTouchButton.
 */
export interface ValueTouchButtonProps<S extends Subscribable<any>>
  extends Omit<TouchButtonProps, 'onPressed'> {

  /** A subscribable whose state will be bound to the button. */
  state: S;

  /**
   * A function which renders the value of the button's bound state, or a {@link VNode} which renders the value. If not
   * defined, values are rendered into strings via default `toString()` behavior.
   *
   * If the rendered value is a VNode, all first-level DisplayComponents in the VNode tree will be destroyed when a new
   * value is rendered or when the button is destroyed.
   */
  renderValue?: ((stateValue: SubscribableType<S>) => string | VNode) | VNode;

  /**
   * A callback function which will be called every time the button is pressed.
   * @param button The button that was pressed.
   */
  onPressed?: <B extends ValueTouchButton<S> = ValueTouchButton<S>>(button: B, state: S) => void;
}

/**
 * A touchscreen button which displays the value of a bound state.
 *
 * The root element of the button contains the `touch-button-value` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 *
 * The value of the button's bound state is rendered into a child `div` element containing the CSS class
 * `touch-button-value-value`.
 */
export class ValueTouchButton<S extends Subscribable<any>> extends DisplayComponent<ValueTouchButtonProps<S>> {
  protected static readonly RESERVED_CSS_CLASSES = new Set(['touch-button-value']);

  protected readonly buttonRef = FSComponent.createRef<TouchButton>();
  protected readonly valueRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly cssClassSet = SetSubject.create(['touch-button-value']);

  protected renderedValue?: string | VNode;

  private cssClassSub?: Subscription;
  private stateSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    if ((this.props.renderValue === undefined || typeof this.props.renderValue === 'function')) {
      const renderFunc = this.props.renderValue ?? ((value: SubscribableType<S>): string => `${value}`);

      this.stateSub = this.props.state.sub(value => {
        this.processRenderedValue(renderFunc(value));
      }, true);
    }
  }

  /**
   * Processes a newly rendered value. The new rendered value will rendered into this button's value container,
   * replacing any existing rendered value.
   * @param rendered The newly rendered value.
   */
  protected processRenderedValue(rendered: string | VNode): void {
    this.cleanUpRenderedValue();

    this.renderedValue = rendered;

    if (typeof rendered === 'string') {
      this.valueRef.instance.textContent = rendered;
    } else {
      FSComponent.render(rendered, this.valueRef.instance);
    }
  }

  /**
   * Cleans up this button's rendered value.
   */
  protected cleanUpRenderedValue(): void {
    if (this.renderedValue === undefined) {
      return;
    }

    const valueContainer = this.valueRef.getOrDefault();

    if (typeof this.renderedValue === 'object') {
      FSComponent.visitNodes(this.renderedValue, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });

      if (valueContainer !== null) {
        valueContainer.innerHTML = '';
      }
    } else {
      if (valueContainer !== null) {
        valueContainer.textContent = '';
      }
    }
  }

  /**
   * Responds to when this button is pressed.
   */
  protected onPressed(): void {
    this.props.onPressed && this.props.onPressed(this, this.props.state);
  }

  /** @inheritdoc */
  public render(): VNode {
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
        isVisible={this.props.isVisible}
        isHighlighted={this.props.isHighlighted}
        label={this.props.label}
        onPressed={this.onPressed.bind(this)}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        class={this.cssClassSet}
      >
        {this.renderValueContainer()}
        {this.props.children}
      </TouchButton>
    );
  }

  /**
   * Renders this button's value container.
   * @returns This button's rendered value container.
   */
  protected renderValueContainer(): VNode {
    if (this.props.renderValue !== undefined && typeof this.props.renderValue === 'object') {
      this.renderedValue = this.props.renderValue;
    }

    return (
      <div ref={this.valueRef} class='touch-button-value-value'>{this.renderedValue}</div>
    );
  }

  /**
   * Gets the CSS classes that are reserved for this button's root element.
   * @returns The CSS classes that are reserved for this button's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return ValueTouchButton.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.cleanUpRenderedValue();

    this.cssClassSub?.destroy();
    this.stateSub?.destroy();

    super.destroy();
  }
}