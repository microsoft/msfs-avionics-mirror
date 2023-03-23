import { DebounceTimer, DisplayComponent, FSComponent, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { GNSUiControl, GNSUiControlProps } from '../GNSUiControl';


import './GNSDigitInput.css';

/**
 * Component props for DigitInput.
 */
export interface GNSDigitInputProps extends GNSUiControlProps {
  /** A subject which is bound to the input value. */
  value: Subject<number>;

  /** The minimum un-scaled value of the input, or a subscribable which provides it. */
  minValue: Subscribable<number> | number;

  /** The maximum un-scaled value of the input (exclusive if `wrap` is true), or a subscribable which provides it. */
  maxValue: Subscribable<number> | number;

  /**
   * The amount to increment/decrement the input's un-scaled value when the inner FMS knob is scrolled, or a
   * subscribable which provides it.
   */
  increment: Subscribable<number> | number;

  /** Whether the input should wrap from the max value to the min value, or a subscribable which provides it. */
  wrap: Subscribable<boolean> | boolean;

  /**
   * The scaling factor applied to this input's value, or a subscribable which provides it. The scaling factor
   * determines the relationship between this input's bound data value and the displayed value as follows:
   * `data_value = display_value * scale`. When the scaling factor changes, this input's displayed value is
   * preserved, and the bound data value is changed to reflect the new scaling factor.
   */
  scale: Subscribable<number> | number;

  /**
   * A function which formats input values for display as either a string or a VNode. If not defined, values will be
   * rendered as plain strings according to their `toString()` method.
   */
  formatter?: (value: number) => string | VNode;

  /**
   * The duration, in milliseconds, of the applied solid highlight when this input is focused or edited. Defaults to
   * 1000.
   */
  solidHighlightDuration?: number;

  /** CSS class(es) to apply to the root of the input component. */
  class?: string;
}

/**
 * An input control which allows the user to select a numeric digit. Digits are not necessarily constrained to be
 * integers in the range [0, 9]. Instead, they can take any valid floating point numeric value.
 */
export class GNSDigitInput extends GNSUiControl<GNSDigitInputProps> {
  protected static readonly DEFAULT_SOLID_HIGHLIGHT_DURATION = 1000; // milliseconds

  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  protected readonly displayValueSub = Subject.create(0);
  protected readonly renderedValueSub = this.props.formatter ? this.displayValueSub.map(this.props.formatter) : this.displayValueSub.map(v => v.toString());
  protected renderedValue: string | VNode | null = null;

  protected readonly minValue: Subscribable<number> = typeof this.props.minValue === 'number' ? Subject.create(this.props.minValue) : this.props.minValue;
  protected readonly maxValue: Subscribable<number> = typeof this.props.maxValue === 'number' ? Subject.create(this.props.maxValue) : this.props.maxValue;
  protected readonly increment: Subscribable<number> = typeof this.props.increment === 'number' ? Subject.create(this.props.increment) : this.props.increment;
  protected readonly wrap: Subscribable<boolean> = typeof this.props.wrap === 'boolean' ? Subject.create(this.props.wrap) : this.props.wrap;
  protected readonly scale: Subscribable<number> = typeof this.props.scale === 'number' ? Subject.create(this.props.scale) : this.props.scale;

  protected readonly solidHighlightTimer = new DebounceTimer();

  protected valueChangedHandler = this.onValueChanged.bind(this);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.props.value.sub(this.valueChangedHandler, true);
    this.scale.sub(this.onScaleChanged.bind(this));
    this.renderedValueSub.sub(this.onDisplayValueChanged.bind(this), true);
  }

  /**
   * Responds to changes in the input value.
   * @param value The input value.
   */
  protected onValueChanged(value: number): void {
    const scale = this.scale.get();
    this.props.value.set(Utils.Clamp(value, this.minValue.get() * scale, this.maxValue.get() * scale));
    this.displayValueSub.set(this.props.value.get() / scale);
  }

  /**
   * Responds to changes in the input scaling factor.
   * @param scale The scaling factor.
   */
  protected onScaleChanged(scale: number): void {
    this.props.value.set(this.displayValueSub.get() * scale);
  }

  /**
   * Responds to changes in the displayed value.
   * @param display The displayed value, as either a plain string or a VNode.
   */
  protected onDisplayValueChanged(display: string | VNode): void {
    this.rootRef.instance.innerHTML = '';
    this.cleanUpRenderedValue();

    if (typeof display === 'string') {
      this.rootRef.instance.textContent = display;
    } else {
      FSComponent.render(display, this.rootRef.instance);
    }

    this.renderedValue = display;
  }

  /**
   * Cleans up this input's rendered value, destroying any top-level DisplayComponents that are part of the rendered
   * value's VNode tree.
   */
  protected cleanUpRenderedValue(): void {
    if (this.renderedValue !== null && typeof this.renderedValue !== 'string') {
      FSComponent.visitNodes(this.renderedValue, node => {
        if (node.instance instanceof DisplayComponent) {
          node.instance.destroy();
          return true;
        }

        return false;
      });
    }

    this.renderedValue = null;
  }

  /** @inheritdoc */
  protected onFocused(source: GNSUiControl): void {
    super.onFocused(source);
    this.rootRef.instance.classList.add('selected');

    // this.applySolidHighlight(this.props.solidHighlightDuration ?? GNSDigitInput.DEFAULT_SOLID_HIGHLIGHT_DURATION);
  }

  /** @inheritdoc */
  protected onBlurred(source: GNSUiControl): void {
    super.onBlurred(source);
    this.rootRef.instance.classList.remove('selected');

    // this.rootRef.instance.classList.remove('highlight-active');
    // this.rootRef.instance.classList.remove('highlight-select');
    // this.solidHighlightTimer.clear();
  }

  /** @inheritdoc */
  protected onEnabled(source: GNSUiControl): void {
    super.onEnabled(source);

    // this.rootRef.instance.classList.remove('input-disabled');
  }

  /** @inheritdoc */
  protected onDisabled(source: GNSUiControl): void {
    super.onDisabled(source);

    // this.rootRef.instance.classList.add('input-disabled');
  }

  /**
   * Applies a solid highlight to this input.
   * @param duration The duration, in milliseconds, of the highlight.
   */
  protected applySolidHighlight(duration: number): void {
    this.rootRef.instance.classList.remove('highlight-select');
    this.rootRef.instance.classList.add('highlight-active');

    this.solidHighlightTimer.schedule(() => {
      this.rootRef.instance.classList.remove('highlight-active');
      if (this.isFocused) {
        this.rootRef.instance.classList.add('highlight-select');
      }
    }, duration);
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.changeValue(this.increment.get() * this.scale.get());
    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.changeValue(-this.increment.get() * this.scale.get());
    return true;
  }

  /**
   * Changes this input's value by a specified amount.
   * @param delta The amount by which to change the value.
   */
  protected changeValue(delta: number): void {
    const scale = this.scale.get();
    const old = this.props.value.get();
    const oldInt = old / scale;
    const deltaInt = delta / scale;

    const min = this.minValue.get();
    const max = this.maxValue.get();

    let newValue = oldInt;
    if (this.wrap.get()) {
      const mod = max - min;
      newValue = ((oldInt - min + deltaInt) % mod + mod) % mod + min;
    } else {
      newValue = Utils.Clamp(oldInt + deltaInt, min, max);
    }
    newValue = newValue / (1 / scale);

    this.props.value.set(newValue);
    // this.applySolidHighlight(this.props.solidHighlightDuration ?? GNSDigitInput.DEFAULT_SOLID_HIGHLIGHT_DURATION);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span ref={this.rootRef} class={`digit-input ${this.props.class ?? ''}`}></span>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.value.unsub(this.valueChangedHandler);
    this.solidHighlightTimer.clear();
    this.renderedValueSub.destroy();
    this.cleanUpRenderedValue();
  }
}