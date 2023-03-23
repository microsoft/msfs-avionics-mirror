import { DurationFormatter, FSComponent, MathUtils, NodeReference, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';

import '../Components/TouchButton/NumPadTouchButton.css';

/** A request input for {@link GtcDurationDialogMSS}. */
export interface GtcDurationDialogMSSInput extends GtcNumberDialogInput {
  /** The GTC view title to display with the message. */
  title?: string;

  /** The minimum valid value, in seconds. Defaults to `0`. */
  min?: number;

  /** The maximum valid value, in seconds. Defaults to `599` (9 minutes, 59 seconds). */
  max?: number;
}

/** A pop-up dialog which allows the user to select a duration, in seconds, display as M:SS. */
export class GtcDurationDialogMSS extends AbstractSimpleGtcNumberDialog<GtcDurationDialogMSSInput> {
  private static readonly HR_TO_SEC = UnitType.HOUR.convertTo(1, UnitType.SECOND);
  private static readonly MIN_TO_SEC = UnitType.MINUTE.convertTo(1, UnitType.SECOND);

  private static readonly DEFAULT_MIN = 0;
  private static readonly DEFAULT_MAX = 599;

  private static readonly FORMATTER = DurationFormatter.create('{m}:{ss}', UnitType.SECOND, 1);

  private min = GtcDurationDialogMSS.DEFAULT_MIN;
  private max = GtcDurationDialogMSS.DEFAULT_MAX;

  /** @inheritdoc */
  protected onRequest(input: GtcDurationDialogMSSInput): number {
    this._title.set(input.title);

    this.min = Math.max(0, input.min ?? GtcDurationDialogMSS.DEFAULT_MIN);
    this.max = MathUtils.clamp(input.max ?? GtcDurationDialogMSS.DEFAULT_MAX, this.min, GtcDurationDialogMSS.DEFAULT_MAX);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string {
    return `Invalid Entry\nValid range is ${GtcDurationDialogMSS.FORMATTER(this.min)} to ${GtcDurationDialogMSS.FORMATTER(this.max)}`;
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

          const minOnes = Math.trunc((clamped % (GtcDurationDialogMSS.MIN_TO_SEC * 10)) / GtcDurationDialogMSS.MIN_TO_SEC);
          const secTens = Math.trunc((clamped % GtcDurationDialogMSS.MIN_TO_SEC) / 10);
          const secOnes = clamped % 10;

          setDigitValues[0](minOnes, true);
          setDigitValues[1](secTens, true);
          setDigitValues[2](secOnes, true);
        }}
        allowBackFill={true}
        class='number-dialog-input'
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={GtcDurationDialogMSS.MIN_TO_SEC}
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