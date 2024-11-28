import { ComponentProps, DisplayComponent, FSComponent, MathUtils, MutableSubscribable, Subject, UnitType, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { DigitInput, G1000UiControlWrapper, GenericNumberInput, ScrollableControl, ScrollController, UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';

/** The number of digits a number entry field would accept. Either 2 or 3. */
export type Sr22tWBNumberEntryDigitCount = 2 | 3;

/** Component props for {@link Sr22tWBNumberEntry}. */
interface Sr22tWBNumberEntryProps extends ComponentProps {
  /** The CSS class of the section. */
  class: string;
  /** The weight value of the section. */
  storeValue: MutableSubscribable<number>;
  /** The weight unit setting. */
  weightUnit: UserSetting<UnitsWeightSettingMode>;
  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
  /** The number of digits to for the number entry. Defaults to three digits. */
  digitCount?: Sr22tWBNumberEntryDigitCount;
  /** The maximum value allowed, in pounds. */
  maxValue?: number;
}

/** A component providing three-digit number entry interface for SR22T weight values. */
export class Sr22tWBNumberEntry extends DisplayComponent<Sr22tWBNumberEntryProps> {
  protected scrollController: ScrollController = new ScrollController();

  private temporaryValue = Subject.create(this.getConvertedValue(this.props.storeValue.get()));
  private readonly hundredsValueSub = Subject.create(0);
  private readonly tensValueSub = Subject.create(0);
  private readonly onesValueSub = Subject.create(0);

  /** Resets the temporary value to the value received in the props. */
  public reset(): void {
    this.temporaryValue.set(this.getConvertedValue(this.props.storeValue.get()));
  }

  /** Changes the value in the store when the temporary value is saved. */
  private setValue(): void {
    const digitCountLimitedValue = MathUtils.clamp(this.temporaryValue.get(), 0, this.props.digitCount !== 2 ? 999 : 99);
    const poundValue = this.props.weightUnit.get() === UnitsWeightSettingMode.Pounds
      ? digitCountLimitedValue
      : UnitType.KILOGRAM.convertTo(digitCountLimitedValue, UnitType.POUND);
    const correctedValue = this.props.maxValue ? MathUtils.clamp(poundValue, 0, this.props.maxValue) : poundValue;
    this.props.storeValue.set(correctedValue);
    this.temporaryValue.set(this.getConvertedValue(correctedValue));
  }

  /**
   * Converts the value to the current weight unit.
   * @param value the value to convert
   * @returns the converted value in the current weight unit
   */
  private getConvertedValue(value: number): number {
    return this.props.weightUnit.get() === UnitsWeightSettingMode.Pounds ? value : UnitType.POUND.convertTo(value, UnitType.KILOGRAM);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <G1000UiControlWrapper onRegister={this.props.registerScroll}>
        <GenericNumberInput
          value={this.temporaryValue}
          digitizer={(value, signValues, digitValues): void => {
            if (this.props.digitCount !== 2) {
              digitValues[0].set(Math.floor(value / 100) * 100);
              digitValues[1].set(Math.floor((value % 100) / 10) * 10);
              digitValues[2].set(Math.floor(value % 10));
            } else {
              digitValues[0].set(Math.floor(value / 10) * 10);
              digitValues[1].set(Math.floor(value % 10));
            }
          }}
          renderInactiveValue={
            (value): VNode => {
              return (
                <>
                  {value.toFixed()}
                  <span class='wb-labeled-number-entry-unit'>
                    {this.props.weightUnit.map(v => v === UnitsWeightSettingMode.Pounds ? 'LB' : 'KG')}
                  </span>
                </>
              );
            }
          }
          onInputAccepted={this.setValue.bind(this)} onInputRejected={this.setValue.bind(this)}
          class={this.props.class}
        >
          {this.props.digitCount !== 2 && <DigitInput value={this.hundredsValueSub} minValue={0} maxValue={10} increment={1} scale={100} wrap />}
          <DigitInput value={this.tensValueSub} minValue={0} maxValue={10} increment={1} scale={10} wrap />
          <DigitInput value={this.onesValueSub} minValue={0} maxValue={10} increment={1} scale={1} wrap />
          <span class='wb-labeled-number-entry-unit'>
            {this.props.weightUnit.map(v => v === UnitsWeightSettingMode.Pounds ? 'LB' : 'KG')}
          </span>
        </GenericNumberInput>
      </G1000UiControlWrapper>
    );
  }
}
