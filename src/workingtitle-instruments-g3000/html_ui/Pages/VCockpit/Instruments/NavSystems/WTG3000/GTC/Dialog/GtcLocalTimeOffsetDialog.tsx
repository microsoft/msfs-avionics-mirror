import { FSComponent, NodeReference, Subject, Subscribable, UnitType, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { SignInputSlot } from '../Components/NumberInput/SignInputSlot';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';
import { RoundTouchButton } from '../Components/TouchButton/RoundTouchButton';

import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcLocalTimeOffsetDialog.css';

/**
 * A pop-up dialog which allows the user to select a local time offset.
 */
export class GtcLocalTimeOffsetDialog extends AbstractSimpleGtcNumberDialog {
  private static readonly HR_TO_MS = UnitType.HOUR.convertTo(1, UnitType.MILLISECOND);
  private static readonly MIN_TO_MS = UnitType.MINUTE.convertTo(1, UnitType.MILLISECOND);

  /** @inheritdoc */
  public override readonly title = Subject.create('Select Time Offset') as Subscribable<string | undefined>;

  private readonly signSlotRef = FSComponent.createRef<SignInputSlot>();

  /** @inheritdoc */
  protected isValueValid(value: number): boolean {
    return Math.abs(value) < 24 * GtcLocalTimeOffsetDialog.HR_TO_MS;
  }

  /** @inheritdoc */
  protected getInvalidValueMessage(): string {
    return 'Invalid Entry\nValid range is −23:59 to +23:59';
  }

  /** @inheritdoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected getRootCssClassName(): string {
    return 'local-time-offset-dialog';
  }

  /**
   * Responds to when this dialog's sign button is pressed.
   */
  private onSignButtonPressed(): void {
    if (!this.inputRef.instance.isEditingActive.get()) {
      this.inputRef.instance.activateEditing(false);
    }

    this.signSlotRef.instance.incrementValue();

    if (this.inputRef.instance.cursorPosition.get() === 0) {
      this.inputRef.instance.moveCursor(1, false);
    }
  }

  /** @inheritdoc */
  protected renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>, rootCssClassName: string | undefined): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues): void => {
          setSignValues[0](value < 0 ? -1 : 1);

          const abs = Math.abs(value);

          const hrs = Math.min(23, Math.floor(abs / GtcLocalTimeOffsetDialog.HR_TO_MS));
          const min = Math.min(59, Math.floor((abs - hrs * GtcLocalTimeOffsetDialog.HR_TO_MS) / GtcLocalTimeOffsetDialog.MIN_TO_MS));
          const minTens = Math.floor(min / 10);

          setDigitValues[0](hrs, true);
          setDigitValues[1](minTens * 10, true);
          setDigitValues[2](min % 10, true);
        }}
        allowBackFill={true}
        class={`number-dialog-input ${rootCssClassName === undefined ? '' : `${rootCssClassName}-input`}`}
      >
        <SignInputSlot ref={this.signSlotRef} />
        <DigitInputSlot
          characterCount={2}
          minValue={0}
          maxValue={24}
          increment={1}
          wrap={true}
          scale={GtcLocalTimeOffsetDialog.HR_TO_MS}
          defaultCharValues={[0, 0]}
        />
        <div>:</div>
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={6}
          increment={1}
          wrap={true}
          scale={GtcLocalTimeOffsetDialog.MIN_TO_MS * 10}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={GtcLocalTimeOffsetDialog.MIN_TO_MS}
          defaultCharValues={[0]}
        />
      </NumberInput>
    );
  }

  /** @inheritdoc */
  protected renderOtherNumberPadContents(rootCssClassName: string | undefined): VNode | null {
    return (
      <RoundTouchButton
        label='+/−'
        onPressed={this.onSignButtonPressed.bind(this)}
        class={`${rootCssClassName === undefined ? '' : `${rootCssClassName}-sign-button`}`}
        orientation={this.props.gtcService.orientation}
      />
    );
  }
}