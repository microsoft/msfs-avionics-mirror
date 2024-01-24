import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';
import { G1000UiControlWrapper, DigitInput, UiControl, GenericNumberInput } from '@microsoft/msfs-wtg1000';

import './Sr22tTPFields.css';


/** The object containing all display data for a single display field. */
export type NumberInputFieldData = {
  /** The title of the field. */
  title: string;
  /** The value of the field. Needs to be multiplied pow(10,fractionDigitCount) from the outside */
  value: Subject<number>;
  /** The value of the field. */
  unit: string | undefined;
  /** Optional flag that draws the value in cyan, as if the field would be editable. */
  valueCssClass?: SetSubject<string>;
  /** The function to use to register the group's controls. */
  registerFunc: (ctrl: UiControl, unregister?: boolean) => void;
  /** Boolean subject, set to true disables data input */
  isInputDisabled: Subject<boolean>;
  /** The number of digits to for the number entry. This number includes the fraction digits*/
  digitCount: (2 | 3 | 4 | 5);
  /** The number of fraction digits. Supported are 0, 1 or 2 */
  decimalPlaces: (0 | 1 | 2);
};

/** The properties for the Sr22tTPNumberInputField component. */
export interface NumberInputFieldProps extends ComponentProps {
  /** The `NumberInputFieldData` object. */
  data: NumberInputFieldData;
}

/** Displays a single field of title and value in `AUX - Trip Planning` page. */
export class Sr22tTPNumberInputField extends DisplayComponent<NumberInputFieldProps> {

  private readonly ref = FSComponent.createRef<HTMLDivElement>();
  private readonly inputRef = FSComponent.createRef<GenericNumberInput>();

  private warningSubscription?: Subscription;
  private valueCss = SetSubject.create(['tp-labeled-number-value']);

  private readonly digitShiftFactor = Math.pow(10, this.props.data.decimalPlaces);


  /**
   * Constructor
   * @param props props
   */
  constructor(props: NumberInputFieldProps) {
    super(props);

    if (this.props.data.valueCssClass !== undefined) {
      this.valueCss = this.props.data.valueCssClass;
      this.valueCss.add('tp-labeled-number-value');
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.data.isInputDisabled.sub(newIsDisabledState => {
      this.inputRef.instance.setDisabled(newIsDisabledState);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    // const acceptNewValue = this.acceptNewValue.bind(this);

    return (
      <div class='tp-labeled-number' ref={this.ref}>
        <div class='tp-labeled-number-title'>{this.props.data.title}</div>
        <G1000UiControlWrapper onRegister={this.props.data.registerFunc} >
          <GenericNumberInput
            class='tp-number-input-value'
            ref={this.inputRef}
            value={this.props.data.value}
            digitizer={(value, signValues, digitValues): void => {
              let digitIndex = this.props.data.digitCount - 1;

              digitValues[digitIndex].set(Math.floor(value % 10));
              digitIndex--;

              digitValues[digitIndex].set(Math.floor(value / 10) % 10 * 10);
              digitIndex--;

              if (this.props.data.digitCount > 2) {

                digitValues[digitIndex].set(Math.floor(value / 100) % 10 * 100);
                digitIndex--;

                if (this.props.data.digitCount > 3) {

                  digitValues[digitIndex].set(Math.floor(value / 1000) % 10 * 1000);
                  digitIndex--;

                  if (this.props.data.digitCount > 4) {
                    digitValues[digitIndex].set(Math.floor(value / 10000) * 10000);
                  }
                }
              }
            }}
            renderInactiveValue={(value: number): string => {
              const digitShiftFactor = Math.pow(10, this.props.data.decimalPlaces);
              const valueShifted = value / digitShiftFactor;
              return <div>{valueShifted.toFixed(this.props.data.decimalPlaces)}<span class='smallText'>{this.props.data.unit}</span></div>;
            }}
          >
            {this.props.data.digitCount > 4 && <DigitInput class='tp-labeled-editable-number-value' value={Subject.create(0)} minValue={0} maxValue={10} increment={1} wrap={true} scale={10000} />}
            {this.props.data.digitCount > 3 && <DigitInput class='tp-labeled-editable-number-value' value={Subject.create(0)} minValue={0} maxValue={10} increment={1} wrap={true} scale={1000} />}
            {this.props.data.digitCount > 2 && <DigitInput class='tp-labeled-editable-number-value' value={Subject.create(0)} minValue={0} maxValue={10} increment={1} wrap={true} scale={100} />}
            {this.props.data.decimalPlaces === 2 && <span>.</span>}
            <DigitInput class='tp-labeled-editable-number-value' value={Subject.create(0)} minValue={0} maxValue={10} increment={1} wrap={true} scale={10} />
            {this.props.data.decimalPlaces === 1 && <span>.</span>}
            <DigitInput class='tp-labeled-editable-number-value' value={Subject.create(0)} minValue={0} maxValue={10} increment={1} wrap={true} scale={1} />
            <span class='smallText'>{this.props.data.unit}</span>
          </GenericNumberInput>
        </G1000UiControlWrapper >
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.warningSubscription?.destroy();
  }
}
