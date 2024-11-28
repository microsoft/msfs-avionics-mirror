import { DebounceTimer, FSComponent, MutableSubscribable, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { G1000UiControl, G1000UiControlProps } from '../G1000UiControl';

import './ArrowControl.css';

/**
 * Base component props for ArrowControl.
 */
interface BaseArrowControlProps<T> extends G1000UiControlProps {
  /** The options that can be selected using the control. */
  options: Iterable<T>;

  /**
   * A function which renders selected values. If not defined, then selected values will be rendered using the default
   * `toString()` method.
   */
  renderValue?: (value: T) => string;

  /**
   * The duration, in milliseconds, of the applied solid highlight when the control is focused or edited. Defaults to
   * 1000.
   */
  solidHighlightDuration?: number;

  /** CSS class(es) to apply to the root of the component. */
  class?: string;
}

/**
 * Component props for a ArrowControl that is bound to a subscribable value.
 */
interface SubscribableArrowControlProps<T> extends BaseArrowControlProps<T> {
  /** The value to bind to the control. */
  value: Subscribable<T>;

  /**
   * A function which is called when a user selects an option using the control.
   */
  onOptionSelected: (option: T) => void;
}

/**
 * Component props for a ArrowControl that is bound to a mutable subscribable value.
 */
interface MutableSubscribableArrowControlProps<T> extends BaseArrowControlProps<T> {
  /** The value to bind to the control. */
  value: MutableSubscribable<T>;

  /**
   * A function which is called when a user selects an option using the control. If not defined, then the selected
   * value will be written to the mutable subscribable bound to the control.
   */
  onOptionSelected?: (option: T) => void;
}

/**
 * Component props for ArrowControl.
 */
export type ArrowControlProps<T> = SubscribableArrowControlProps<T> | MutableSubscribableArrowControlProps<T>;

/**
 * A control which allows the user to select a value by scrolling left and right through a virtual list of options.
 * The control displays the currently selected value and arrows to the left and right that depict whether the user can
 * scroll left and/or right.
 */
export class ArrowControl<T> extends G1000UiControl<ArrowControlProps<T>> {
  private static readonly DEFAULT_SOLID_HIGHLIGHT_DURATION = 1000; // milliseconds

  private readonly valueRef = FSComponent.createRef<HTMLDivElement>();

  private readonly options = Array.from(this.props.options);
  private readonly selectedIndex = this.props.value.map(value => this.options.indexOf(value));

  private readonly selectedValueDisplay = this.props.value.map(value => {
    return this.props.renderValue ? this.props.renderValue(value) : `${value}`;
  });

  protected readonly solidHighlightTimer = new DebounceTimer();

  /** @inheritDoc */
  protected onFocused(source: G1000UiControl): void {
    super.onFocused(source);

    this.applySolidHighlight(this.props.solidHighlightDuration ?? ArrowControl.DEFAULT_SOLID_HIGHLIGHT_DURATION);
  }

  /** @inheritDoc */
  protected onBlurred(source: G1000UiControl): void {
    super.onBlurred(source);

    this.valueRef.instance.classList.remove('highlight-active');
    this.valueRef.instance.classList.remove('highlight-select');
    this.solidHighlightTimer.clear();
  }

  /** @inheritDoc */
  protected onEnabled(source: G1000UiControl): void {
    super.onEnabled(source);

    this.valueRef.instance.classList.remove('input-disabled');
  }

  /** @inheritDoc */
  protected onDisabled(source: G1000UiControl): void {
    super.onDisabled(source);

    this.valueRef.instance.classList.add('input-disabled');
  }

  /**
   * Applies a solid highlight to this control's value display.
   * @param duration The duration, in milliseconds, of the highlight.
   */
  protected applySolidHighlight(duration: number): void {
    this.valueRef.instance.classList.remove('highlight-select');
    this.valueRef.instance.classList.add('highlight-active');

    this.solidHighlightTimer.schedule(() => {
      this.valueRef.instance.classList.remove('highlight-active');
      if (this.isFocused) {
        this.valueRef.instance.classList.add('highlight-select');
      }
    }, duration);
  }

  /** @inheritDoc */
  public onUpperKnobInc(): boolean {
    this.changeOption(1);
    return true;
  }

  /** @inheritDoc */
  public onUpperKnobDec(): boolean {
    this.changeOption(-1);
    return true;
  }

  /**
   * Changes this control's selected option.
   * @param direction The direction in which to change the selected option.
   */
  private changeOption(direction: 1 | -1): void {
    if (this.options.length > 0) {
      let index = this.selectedIndex.get();

      if (index < 0) {
        index = direction === 1 ? -1 : this.options.length;
      }

      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < this.options.length) {
        const selected = this.options[newIndex];

        if (this.props.onOptionSelected) {
          this.props.onOptionSelected(selected);
        } else if (SubscribableUtils.isMutableSubscribable(this.props.value)) {
          this.props.value.set(selected);
        }
      }
    }

    this.applySolidHighlight(this.props.solidHighlightDuration ?? ArrowControl.DEFAULT_SOLID_HIGHLIGHT_DURATION);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`arrow-control ${this.props.class ?? ''}`}>
        <svg
          viewBox='0 0 5 10'
          class={{
            'arrow-control-arrow': true,
            'arrow-control-arrow-enabled': this.options.length === 0 ? false : this.selectedIndex.map(index => index < 0 || index > 0)
          }}
        >
          <path d='M 5 0 l 0 10 l -5 -5 z' />
        </svg>
        <div ref={this.valueRef} class='arrow-control-value'>{this.selectedValueDisplay}</div>
        <svg
          viewBox='0 0 5 10'
          class={{
            'arrow-control-arrow': true,
            'arrow-control-arrow-enabled': this.options.length === 0 ? false : this.selectedIndex.map(index => index < this.options.length - 1)
          }}
        >
          <path d='M 0 0 l 0 10 l 5 -5 z' />
        </svg>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.solidHighlightTimer.clear();
    this.selectedIndex.destroy();
    this.selectedValueDisplay.destroy();

    super.destroy();
  }
}