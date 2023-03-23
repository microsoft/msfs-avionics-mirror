import {
  Subject, NumberUnitSubject, VNode, NumberUnitInterface,
  ComponentProps, DisplayComponent, Subscribable, Unit, FSComponent
} from '@microsoft/msfs-sdk';

import { GNSGenericNumberInput } from './GNSGenericNumberInput';

/**
 * Component props for GNSNumberUnitInputProps.
 */
interface GNSNumberUnitInputProps<F extends string> extends ComponentProps {

  /** The Data as a NumberUnitSubject */
  data: NumberUnitSubject<F>;

  /** The Diplay Unit as a Unit Subject */
  displayUnit: Subscribable<Unit<F>>;

  /**
   * A function which assigns values to individual sign and digit inputs based on the bound value.
   * @param value The bound value.
   * @param signValues An array containing subjects which bind the values of the component's individual sign inputs.
   * The order of the subjects is the same as the order of the sign inputs in the component's control subtree.
   * @param digitValues An array containing subjects which bind the values of the component's individual digit inputs.
   * The order of the subjects is the same as the order of the digit inputs in the component's control subtree.
   */
  digitizer?: (value: number, signValues: readonly Subject<1 | -1>[], digitValues: readonly Subject<number>[]) => void;

  /**
   * A function which renders the input's value when editing is not active. If defined, the output of the function
   * replaces all rendered child components when editing is not active.
   */
  renderInactiveValue?: (value: number) => string | VNode;

  /**
   * The duration, in milliseconds, of the applied solid highlight when this input is focused or edited. Defaults to
   * 1000.
   */
  solidHighlightDuration?: number;

  /**
   * A function which responds to when an input value is accepted.
   * @param value The accepted value.
   */
  onInputAccepted?: (value: number) => void;

  /**
   * A function which responds to when an input value is rejected.
   * @param value The rejected value.
   */
  onInputRejected?: (value: number) => void;

  /** Whether the first event activating the input should also edit the value. */
  editOnActivate?: boolean;

  /** Whether a CLR event when the control is highlighted activates editing */
  activateOnClr?: boolean;

  /** CSS class(es) to apply to the root of the component. */
  class?: string;

}

/**
 * An input which allows users to select a numeric value using a combination of one or more child SignInputs and
 * DigitInputs. The input value is derived from the sum of the values of all child DigitInputs, multiplied by the
 * product of the values of all SignInputs.
 */
export class GNSNumberUnitInput<F extends string> extends DisplayComponent<GNSNumberUnitInputProps<F>> {

  public readonly _value = Subject.create<number>(0);

  /** @inheritdoc */
  onAfterRender(): void {
    this.props.data.sub(this.parseValue.bind(this));
  }

  /**
   * Parses the value from the data in the display unit specified in the props.
   * @param v is the NumberUnitInterface
   */
  private parseValue(v: NumberUnitInterface<string>): void {
    this._value.set(v.asUnit(this.props.displayUnit.get()));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GNSGenericNumberInput
        ref={this.props.ref}
        value={this._value}
        digitizer={this.props.digitizer}
        editOnActivate={this.props.editOnActivate}
        activateOnClr={this.props.activateOnClr}
        class={this.props.class}
        renderInactiveValue={this.props.renderInactiveValue}
        onInputAccepted={this.props.onInputAccepted}
        onInputRejected={this.props.onInputRejected}
        solidHighlightDuration={this.props.solidHighlightDuration}
      >
        {this.props.children}
      </GNSGenericNumberInput>
    );
  }
}