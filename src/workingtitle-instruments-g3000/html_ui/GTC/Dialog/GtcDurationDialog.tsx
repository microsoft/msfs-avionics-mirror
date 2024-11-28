import { DurationFormatter, FSComponent, MathUtils, NodeReference, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';

import '../Components/TouchButton/NumPadTouchButton.css';

/**
 * A request input for {@link GtcDurationDialog}.
 */
export interface GtcDurationDialogInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;

  /** The minimum valid value, in seconds. Defaults to `0`. */
  min?: number;

  /** The maximum valid value, in seconds. Defaults to `86399` (23 hours, 59 minutes, 59 seconds). */
  max?: number;
}

/**
 * A pop-up dialog which allows the user to select a duration, in seconds.
 */
export class GtcDurationDialog extends AbstractSimpleGtcNumberDialog<GtcDurationDialogInput> {
  private static readonly HR_TO_SEC = UnitType.HOUR.convertTo(1, UnitType.SECOND);
  private static readonly MIN_TO_SEC = UnitType.MINUTE.convertTo(1, UnitType.SECOND);

  private static readonly DEFAULT_MIN = 0;
  private static readonly DEFAULT_MAX = 86399;
  private static readonly ABSOLUTE_MAX = 359999;

  private static readonly FORMATTER = DurationFormatter.create('{hh}:{mm}:{ss}', UnitType.SECOND, 1);

  private min = GtcDurationDialog.DEFAULT_MIN;
  private max = GtcDurationDialog.DEFAULT_MAX;

  private readonly hourMaxValue = Subject.create(24);

  /** @inheritdoc */
  protected onRequest(input: GtcDurationDialogInput): number {
    this._title.set(input.title);

    this.min = Math.max(0, input.min ?? GtcDurationDialog.DEFAULT_MIN);
    this.max = MathUtils.clamp(input.max ?? GtcDurationDialog.DEFAULT_MAX, this.min, GtcDurationDialog.ABSOLUTE_MAX);

    this.hourMaxValue.set(MathUtils.clamp(Math.floor(this.max / GtcDurationDialog.HR_TO_SEC) + 1, 1, 100));

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string {
    return `Invalid Entry\nValid range is ${GtcDurationDialog.FORMATTER(this.min)} to ${GtcDurationDialog.FORMATTER(this.max)}`;
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string | undefined {
    return undefined;
  }

  /** @inheritdoc */
  protected renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(value), this.min, this.max);

          const hrs = Math.trunc(clamped / GtcDurationDialog.HR_TO_SEC);
          const minTens = Math.trunc((clamped % GtcDurationDialog.HR_TO_SEC) / (GtcDurationDialog.MIN_TO_SEC * 10));
          const minOnes = Math.trunc((clamped % (GtcDurationDialog.MIN_TO_SEC * 10)) / GtcDurationDialog.MIN_TO_SEC);
          const secTens = Math.trunc((clamped % GtcDurationDialog.MIN_TO_SEC) / 10);
          const secOnes = clamped % 10;

          setDigitValues[0](hrs, true);
          setDigitValues[1](minTens, true);
          setDigitValues[2](minOnes, true);
          setDigitValues[3](secTens, true);
          setDigitValues[4](secOnes, true);
        }}
        allowBackFill={true}
        class='number-dialog-input'
      >
        <DigitInputSlot
          characterCount={2}
          minValue={0}
          maxValue={this.hourMaxValue}
          increment={1}
          wrap={true}
          scale={GtcDurationDialog.HR_TO_SEC}
          defaultCharValues={[0, 0]}
        />
        <div>:</div>
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={6}
          increment={1}
          wrap={true}
          scale={GtcDurationDialog.MIN_TO_SEC * 10}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={GtcDurationDialog.MIN_TO_SEC}
          defaultCharValues={[0]}
        />
        <div>:</div>
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={6}
          increment={1}
          wrap={true}
          scale={10}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
      </NumberInput>
    );
  }
}