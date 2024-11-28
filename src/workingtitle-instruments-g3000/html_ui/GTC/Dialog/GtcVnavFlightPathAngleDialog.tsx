import { FSComponent, MathUtils, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcNumberDialogInput } from './AbstractGtcNumberDialog';
import { AbstractSimpleGtcNumberDialog } from './AbstractSimpleGtcNumberDialog';
import { GtcDialogs } from './GtcDialogs';
import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcVnavFlightPathAngleDialog.css';

/** A request input for {@link GtcVnavFlightPathAngleDialog}. */
export interface GtcVnavFlightPathAngleDialogInput extends GtcNumberDialogInput {
  /** Whether to show the remove button. */
  showRemoveButton?: boolean;
}

/** A pop-up dialog which allows the user to select a flight path angle. */
export class GtcVnavFlightPathAngleDialog extends AbstractSimpleGtcNumberDialog<GtcVnavFlightPathAngleDialogInput> {
  private readonly removeButtonRef = FSComponent.createRef<GtcTouchButton>();

  private readonly showRemoveButton = Subject.create(false);

  private readonly min = 0.10 * 100;
  private readonly max = 6.00 * 100;

  /** @inheritdoc */
  public override onAfterRender(): void {
    super.onAfterRender();

    this._title.set('VNAV Flight Path Angle');

    this.showDecimalButton.set(true);
  }

  /** @inheritdoc */
  protected override onRequest(input: GtcVnavFlightPathAngleDialogInput): number {
    this.showRemoveButton.set(!!input.showRemoveButton);

    return input.initialValue;
  }

  /** @inheritdoc */
  protected override isValueValid(value: number): boolean {
    // Value is nan when removing the value
    if (isNaN(value)) {
      return true;
    }
    return value >= this.min && value <= this.max;
  }

  /** @inheritdoc */
  protected override getInvalidValueMessage(): string {
    return 'Invalid Entry\nValue must be between\n−6.00 and −0.10';
  }

  /** @inheritdoc */
  protected override getRootCssClassName(): string | undefined {
    return 'vnav-fpa-dialog';
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritdoc */
  protected override onDecimalPressed(): void {
    this.inputRef.instance.placeCursor(1, false);
  }

  /** @inheritdoc */
  protected override onBackspacePressed(): void {
    this.inputRef.instance.backspace(false);
  }

  /** @inheritdoc */
  protected override renderInput(ref: NodeReference<NumberInput>, valueToBind: Subject<number>): VNode {
    return (
      <NumberInput
        ref={ref}
        value={valueToBind}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        allowBackFill={true}
        initialEditIndex={0}
        class='number-dialog-input'
      >
        <div class='vnav-fpa-dialog-input-cyan'>−</div>
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <div>.</div>
        <DigitInputSlot
          allowBackfill={false}
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          allowBackfill={false}
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div class='vnav-fpa-dialog-input-cyan'>°</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  protected override renderOtherContents(): VNode {
    return (
      <GtcTouchButton
        ref={this.removeButtonRef}
        class="remove-button"
        label={'Remove\nFPA'}
        isVisible={this.showRemoveButton}
        onPressed={async () => {
          const accepted = await GtcDialogs.openMessageDialog(this.gtcService, 'Remove FPA Constraint?');
          if (accepted) {
            this.value.set(NaN);
            this.validateValueAndClose();
          }
        }}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.removeButtonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}