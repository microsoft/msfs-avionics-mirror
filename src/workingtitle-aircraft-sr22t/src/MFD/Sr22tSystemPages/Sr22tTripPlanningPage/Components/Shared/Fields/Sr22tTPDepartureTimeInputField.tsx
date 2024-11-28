import { FSComponent, NodeReference, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';
import { DigitInput, G1000UiControl, G1000UiControlProps, GenericNumberInput, TimeNumberInput } from '@microsoft/msfs-wtg1000';

/** The props for the departure time input field. */
export interface Sr22tTPDepartureTimeInputFieldProps extends G1000UiControlProps {
  /** The reference to the input field */
  inputRef: NodeReference<GenericNumberInput>;
  /** The unit display style */
  unitStyle: Subject<string>;
  /** The departure time in milliseconds */
  departureTimeMillisSubject: Subject<number>;
}

/** The departure time input field for the trip planning page. */
export class Sr22tTPDepartureTimeInputField extends G1000UiControl<Sr22tTPDepartureTimeInputFieldProps> {
  private readonly HR_TO_MS = UnitType.HOUR.convertTo(1, UnitType.MILLISECOND);
  private readonly MIN_TO_MS = UnitType.MINUTE.convertTo(1, UnitType.MILLISECOND);

  /** @inheritDoc */
  public render(): VNode {
    return (
      <TimeNumberInput
        ref={this.props.inputRef}
        value={this.props.departureTimeMillisSubject}
        digitizer={(value, signValues, digitValues): void => {
          const abs = Math.abs(value);

          const hrs = Math.min(23, Math.trunc(abs / this.HR_TO_MS));
          const minOverall = (value - hrs * this.HR_TO_MS) / this.MIN_TO_MS;
          const min = Math.trunc(minOverall % 10);
          const minTens = Math.trunc(minOverall / 10);

          digitValues[0].set(hrs * this.HR_TO_MS);
          digitValues[1].set(minTens * 10 * this.MIN_TO_MS);
          digitValues[2].set(min * this.MIN_TO_MS);
        }}
        editOnActivate={true}
        class='tp-generic-number-input'
      >
        <DigitInput
          value={Subject.create(0)} minValue={0} maxValue={24} increment={1} scale={this.HR_TO_MS} wrap={true}
          formatter={(value): string => value.toString().padStart(2, '0')}
        />
        <span>:</span>
        <DigitInput value={Subject.create(0)} minValue={0} maxValue={6} increment={1} scale={10 * this.MIN_TO_MS} wrap={true} />
        <DigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={this.MIN_TO_MS} wrap={true} />
        <span class={this.props.unitStyle}>UTC</span>
      </TimeNumberInput>
    );
  }
}
