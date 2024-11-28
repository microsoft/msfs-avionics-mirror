import {
  DisplayComponent, FSComponent, MathUtils, NodeReference, NumberFormatter,
  SetSubject, SpeedRestrictionType, SpeedUnit, Subject, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { ImgTouchButton, NumberUnitDisplay } from '@microsoft/msfs-garminsdk';

import { FmsSpeedsGeneralLimits, G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcToggleTouchButton } from '../Components/TouchButton/GtcToggleTouchButton';
import { NumberPad } from '../Components/NumberPad/NumberPad';
import { GtcDialogs } from './GtcDialogs';
import { GtcMessageDialog } from './GtcMessageDialog';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcSpeedConstraintDialog.css';

/**
 * Component props for GtcSpeedConstraintDialog.
 */
export interface GtcSpeedConstraintDialogProps extends GtcViewProps {
  /** General speed limits for the airplane. */
  generalSpeedLimits: FmsSpeedsGeneralLimits;
}

/** A request input for {@link GtcSpeedConstraintDialog}. */
export interface GtcSpeedConstraintDialogInput {
  /** The initial speed to start with, knots IAS or Mach. */
  initialSpeed: number;
  /** The initial speed restriction type, or undefined.*/
  initialSpeedDesc: SpeedRestrictionType;
  /** The initial speed unit, or undefined.*/
  initialSpeedUnit: SpeedUnit;
  /** The published speed in knots IAS, or undefined.*/
  publishedSpeedIas?: number;
  /** The published speed restriction type, or undefined.*/
  publishedSpeedDesc?: SpeedRestrictionType;
  /** Whether the constraint is different from the published constraint.*/
  isDifferentFromPublished: boolean;
  /** Whether to show the remove button.*/
  allowRemove: boolean;
}

/** A result type for {@link GtcSpeedConstraintDialog}. */
export type GtcSpeedConstraintDialogResult = GtcSpeedConstraintDialogResultSet | GtcSpeedConstraintDialogResultRevert | GtcSpeedConstraintDialogResultRemove;

/** A set result for {@link GtcSpeedConstraintDialog}. */
export interface GtcSpeedConstraintDialogResultSet {
  /** A result to set the constraint. */
  result: 'set';
  /** The speed in knots IAS or Mach. */
  speed: number;
  /** The speed unit. */
  speedUnit: SpeedUnit;
  /** The speed constraint type. */
  speedDesc: SpeedRestrictionType;
}

/** A revert result for {@link GtcSpeedConstraintDialog}. */
export interface GtcSpeedConstraintDialogResultRevert {
  /** A result to revert the constraint to published values. */
  result: 'revert';
}

/** A remove result for {@link GtcSpeedConstraintDialog}. */
export interface GtcSpeedConstraintDialogResultRemove {
  /** A result to remove the constraint. */
  result: 'remove';
}

const IAS_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3 });
const MACH_FORMATTER = NumberFormatter.create({ precision: 1, pad: 3 });

/** Dialog to set speed constraint. */
export class GtcSpeedConstraintDialog extends GtcView<GtcSpeedConstraintDialogProps> implements GtcDialogView<GtcSpeedConstraintDialogInput, GtcSpeedConstraintDialogResult> {

  private readonly iasInputRef = FSComponent.createRef<NumberInput>();
  private readonly machInputRef = FSComponent.createRef<NumberInput>();
  private readonly numpadRef = FSComponent.createRef<NumberPad>();
  private readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();

  private activeInput: NodeReference<NumberInput> | null = null;

  private readonly iasInputCssClass = SetSubject.create(['number-dialog-input', 'ias-input', 'hidden']);
  private readonly machInputCssClass = SetSubject.create(['number-dialog-input', 'mach-input', 'hidden']);

  private readonly valueIAS = Subject.create(0);
  private readonly valueMach = Subject.create(0);

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<GtcSpeedConstraintDialogResult> = {
    wasCancelled: true,
  };

  private readonly isDifferentFromPublished = Subject.create(false);

  private readonly atEnabled = Subject.create(true);
  private readonly aboveEnabled = Subject.create(false);
  private readonly belowEnabled = Subject.create(false);

  private readonly iasEnabled = Subject.create(true);
  private readonly machEnabled = Subject.create(false);

  private readonly speedDesc = Subject.create(SpeedRestrictionType.At);

  private readonly speedUnit = Subject.create(SpeedUnit.IAS);

  private readonly allowRemove = Subject.create(false);

  private readonly minKnots = this.props.generalSpeedLimits.minimumIas;
  private readonly maxKnots = this.props.generalSpeedLimits.maximumIas;
  private readonly minMach = this.props.generalSpeedLimits.minimumMach * 1000;
  private readonly maxMach = this.props.generalSpeedLimits.maximumMach * 1000;

  private publishedSpeedIas?: number;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
    this._sidebarState.slot5.set('enterEnabled');

    this.iasInputRef.instance.isEditingActive.sub(isActive => {
      this.onEditingActiveChanged(isActive);
    });
    this.machInputRef.instance.isEditingActive.sub(isActive => {
      this.onEditingActiveChanged(isActive);
    });

    this.speedDesc.sub(speedDesc => {
      this.atEnabled.set(speedDesc === SpeedRestrictionType.At);
      this.aboveEnabled.set(speedDesc === SpeedRestrictionType.AtOrAbove);
      this.belowEnabled.set(speedDesc === SpeedRestrictionType.AtOrBelow);
    }, true);

    this.speedUnit.sub(speedUnit => {
      this.iasEnabled.set(speedUnit === SpeedUnit.IAS);
      this.machEnabled.set(speedUnit === SpeedUnit.MACH);

      this.activeInput?.instance.deactivateEditing();

      if (speedUnit === SpeedUnit.MACH) {
        this.activeInput = this.machInputRef;
        this.valueMach.set(0);
        this.machInputRef.instance.setValue(this.valueMach.get());
      } else {
        this.activeInput = this.iasInputRef;
        this.valueIAS.set(0);
        this.iasInputRef.instance.setValue(this.valueIAS.get());
      }

      this.machInputCssClass.toggle('hidden', speedUnit !== SpeedUnit.MACH);
      this.iasInputCssClass.toggle('hidden', speedUnit !== SpeedUnit.IAS);

      this.activeInput.instance.refresh();
    }, true);
  }

  /** @inheritdoc */
  public request(input: GtcSpeedConstraintDialogInput): Promise<GtcDialogResult<GtcSpeedConstraintDialogResult>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this._sidebarState.slot1.set(null);

      this._title.set('Enter Speed');

      this.publishedSpeedIas = input.publishedSpeedIas;
      this.isDifferentFromPublished.set(input.isDifferentFromPublished);
      this.speedUnit.set(input.initialSpeedUnit);
      this.allowRemove.set(input.allowRemove);
      this.speedDesc.set(input.initialSpeedDesc === SpeedRestrictionType.Unused ? SpeedRestrictionType.At : input.initialSpeedDesc);

      if (input.initialSpeedUnit === SpeedUnit.IAS) {
        this.valueIAS.set(isNaN(input.initialSpeed) ? 0 : input.initialSpeed);
        this.valueMach.set(0);
      } else {
        this.valueIAS.set(0);
        this.valueMach.set(isNaN(input.initialSpeed) ? 0 : (input.initialSpeed * 1000));
      }

      this.iasInputRef.instance.setValue(this.valueIAS.get());
      this.machInputRef.instance.setValue(this.valueMach.get());
    });
  }

  /** @inheritDoc */
  public onResume(): void {
    this.activeInput?.instance.refresh();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.activeInput?.instance.changeSlotValue(1);
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.activeInput?.instance.changeSlotValue(-1);
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.activeInput?.instance.moveCursor(1, true);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.activeInput?.instance.moveCursor(-1, true);
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.validateValueAndClose();
        return true;
      default:
        return false;
    }
  }

  /**
   * Responds to when the editing state of this dialog's number input changes.
   * @param isEditingActive Whether editing is active for this dialog's number input.
   */
  private onEditingActiveChanged(isEditingActive: boolean): void {
    if (isEditingActive) {
      this._sidebarState.slot1.set('cancel');
    }
  }

  /** Clears this dialog's pending request and fulfills the pending request Promise if one exists. */
  private cleanupRequest(): void {
    this.activeInput?.instance.deactivateEditing();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  private isValueValid(): boolean {
    if (this.speedUnit.get() === SpeedUnit.IAS) {
      const value = this.valueIAS.get();
      return value >= this.minKnots && value <= this.maxKnots;
    } else {
      const value = this.valueMach.get();
      return value >= this.minMach && value <= this.maxMach;
    }
  }

  /** @inheritdoc */
  private getInvalidValueMessage(): string {
    if (this.speedUnit.get() === SpeedUnit.IAS) {
      return `Invalid Speed\nPlease enter a speed between\n${this.minKnots.toFixed(0)} KT and ${this.maxKnots.toFixed(0)} KT`;
    } else {
      return `Invalid Speed\nPlease enter a mach number\nbetween\n${(this.minMach / 1000).toFixed(3)} and ${(this.maxMach / 1000).toFixed(3)}`;
    }
  }

  /**
   * Responds to when one of this dialog's number pad buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  private onNumberPressed(value: number): void {
    this.activeInput?.instance.setSlotCharacterValue(`${value}`);
  }

  /** Responds to when this dialog's backspace button is pressed. */
  private onBackspacePressed(): void {
    this.activeInput?.instance.backspace();
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  private async validateValueAndClose(): Promise<void> {
    const speedUnit = this.speedUnit.get();

    const value = speedUnit === SpeedUnit.IAS
      ? this.valueIAS.get()
      : this.valueMach.get() / 1000;

    if (this.isValueValid()) {
      this.resultObject = {
        wasCancelled: false,
        payload: {
          speed: value,
          speedUnit,
          speedDesc: this.speedDesc.get(),
          result: 'set',
        },
      };

      this.props.gtcService.goBack();
    } else {
      const result = await this.props.gtcService
        .openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
        .ref.request({
          message: this.getInvalidValueMessage(),
          showRejectButton: false,
        });

      if (!result.wasCancelled && result.payload) {
        this.activeInput?.instance.deactivateEditing();
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    const rootCssClassName = 'speed-constraint-dialog';

    return (
      <div class={`number-dialog ${rootCssClassName ?? ''}`}>
        {this.renderInputIas()}
        {this.renderInputMach()}
        <div class={`number-dialog-numpad-container ${rootCssClassName === undefined ? '' : `${rootCssClassName}-numpad-container`}`}>
          {this.renderNumberPad(this.numpadRef, rootCssClassName)}
        </div>
        {this.renderBackspaceButton(this.backspaceRef, rootCssClassName)}
        {this.renderOtherContents()}
      </div>
    );
  }

  /**
   * Renders this dialog's number pad.
   * @param ref The reference to which to assign the rendered number pad.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's number pad, as a VNode.
   */
  private renderNumberPad(ref: NodeReference<NumberPad>, rootCssClassName: string | undefined): VNode {
    return (
      <NumberPad
        ref={ref}
        onNumberPressed={this.onNumberPressed.bind(this)}
        class={`number-dialog-numpad ${rootCssClassName === undefined ? '' : `${rootCssClassName}-numpad`}`}
        orientation={this.props.gtcService.orientation}
      />
    );
  }

  /**
   * Renders this dialog's backspace button.
   * @param ref The reference to which to assign the rendered button.
   * @param rootCssClassName The CSS class name for this dialog's root element.
   * @returns This dialog's backspace button, as a VNode, or `null` if this dialog does not have a backspace button.
   */
  private renderBackspaceButton(ref: NodeReference<DisplayComponent<any>>, rootCssClassName: string | undefined): VNode | null {
    return (
      <ImgTouchButton
        ref={ref}
        label='BKSP'
        imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_backspace_long.png`}
        onPressed={this.onBackspacePressed.bind(this)}
        class={`number-dialog-backspace ${rootCssClassName === undefined ? '' : `${rootCssClassName}-backspace`}`}
      />
    );
  }

  /**
   * Renders the number input for knots IAS.
   * @returns VNode.
   */
  private renderInputIas(): VNode {
    return (
      <NumberInput
        ref={this.iasInputRef}
        value={this.valueIAS}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.KNOT.createNumber(MathUtils.clamp(Math.round(value), 0, 999))}
              displayUnit={null}
              formatter={IAS_FORMATTER}
              class="speed-constraint-dialog-input-inactive"
            />
          );
        }}
        allowBackFill={true}
        class={this.iasInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
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
        <div class='numberunit-unit-small'>KT</div>
      </NumberInput>
    );
  }

  /**
   * Renders the number input for Mach.
   * @returns VNode.
   */
  private renderInputMach(): VNode {
    return (
      <NumberInput
        ref={this.machInputRef}
        value={this.valueMach}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <div class="speed-constraint-dialog-input-inactive">
              <span>M 0.</span><span>{MACH_FORMATTER(MathUtils.clamp(Math.round(value), 0, 999))}</span>
            </div>
          );
        }}
        allowBackFill={true}
        class={this.machInputCssClass}
      >
        <span>M 0.</span>
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e2}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e1}
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

  /** Set result object to 'revert' and close dialog. */
  private closeWithRevert(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        result: 'revert',
      },
    };
    this.props.gtcService.goBack();
  }

  /** Set result object to 'remove' and close dialog. */
  private closeWithRemove(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        result: 'remove',
      },
    };
    this.props.gtcService.goBack();
  }

  /**
   * Renders other contents for the dialog.
   * @returns The other contents.
   */
  private renderOtherContents(): VNode {
    return (
      <>
        <GtcTouchButton
          class="remove-button"
          label={'Remove\nSpeed'}
          isVisible={this.allowRemove}
          onPressed={async () => {
            if (this.publishedSpeedIas !== undefined && this.isDifferentFromPublished.get()) {
              const message = (
                <>
                  <span>Remove or Revert to published</span>
                  <span>speed of {this.publishedSpeedIas.toFixed(0)}<span class="numberunit-unit-small">KT</span>?</span>
                </>
              );
              const result =
                await this.gtcService.openPopup<GtcMessageDialog>(GtcViewKeys.MessageDialog1)
                  .ref.request({
                    message,
                    showRejectButton: true,
                    acceptButtonLabel: 'Remove',
                    rejectButtonLabel: 'Revert',
                  });
              if (!result.wasCancelled) {
                if (result.payload === true) {
                  this.closeWithRemove();
                } else {
                  this.closeWithRevert();
                }
              }
            } else {
              const accepted = await GtcDialogs.openMessageDialog(this.gtcService, 'Remove Speed Constraint?');
              if (accepted) {
                this.closeWithRemove();
              }
            }
          }}
        />
        <div class="gtc-panel type-panel">
          <div class="gtc-panel-title">Type</div>
          <GtcToggleTouchButton
            state={this.atEnabled}
            label={'At'}
            onPressed={() => this.speedDesc.set(SpeedRestrictionType.At)}
          />
          <GtcToggleTouchButton
            state={this.aboveEnabled}
            label={'Above'}
            onPressed={() => this.speedDesc.set(SpeedRestrictionType.AtOrAbove)}
          />
          <GtcToggleTouchButton
            state={this.belowEnabled}
            label={'Below'}
            onPressed={() => this.speedDesc.set(SpeedRestrictionType.AtOrBelow)}
          />
        </div>
        <div class="gtc-panel units-panel">
          <div class="gtc-panel-title">Units</div>
          <GtcToggleTouchButton
            state={this.iasEnabled}
            label={'IAS'}
            onPressed={() => this.speedUnit.set(SpeedUnit.IAS)}
          />
          <GtcToggleTouchButton
            state={this.machEnabled}
            label={'Mach'}
            onPressed={() => this.speedUnit.set(SpeedUnit.MACH)}
          />
        </div>
      </>
    );
  }
}
