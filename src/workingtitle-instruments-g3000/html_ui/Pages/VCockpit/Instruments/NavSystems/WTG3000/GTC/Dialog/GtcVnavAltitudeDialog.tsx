import {
  DisplayComponent, FSComponent, MathUtils, NodeReference,
  NumberFormatter, SetSubject, StringUtils, Subject, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { ImgTouchButton, NumberUnitDisplay } from '@microsoft/msfs-garminsdk';
import { DigitInputSlot } from '../Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../Components/NumberInput/NumberInput';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { GtcToggleTouchButton } from '../Components/TouchButton/GtcToggleTouchButton';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcDialogs } from './GtcDialogs';
import { GtcMessageDialog } from './GtcMessageDialog';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { NumberPad } from '../Components/NumberPad/NumberPad';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import '../Components/TouchButton/NumPadTouchButton.css';
import './GtcVnavAltitudeDialog.css';

/** A request input for {@link GtcVnavAltitudeDialog}. */
export interface GtcVnavAltitudeDialogInput {
  /** The value initially loaded into the dialog at the start of a request. */
  initialAltitudeFeet: number;
  /** Whether this is for advanced vnav mode or not.*/
  isAdvancedMode: boolean;
  /** The leg ident to display on the VNAV DTO button.*/
  legName: string;
  /** Whether the constraint is different from the published constraint.*/
  isDifferentFromPublished: boolean;
  /** Whether this is for a user constraint or not.*/
  isDesignatedConstraint: boolean;
  /** The published altitude in feet, or undefined.*/
  publishedAltitudeFeet?: number;
  /** Whether the constraint is a flight level or not.*/
  isFlightLevel: boolean;
  /** The leg's fix elevation in meters, if defined, AGL will be an option. */
  fixElevationMeters?: number;
  /** What title to show on the title bar. */
  title?: string;
  /** A max altitude to use. If undefined, no max will be applied. */
  maxAltitudeFeet?: number;
  /** Whether to display max altitude as a flight level. */
  isMaxAltitudeFlightLevel?: boolean;
}

/** A result type for the altitude dialog. */
export type GtcVnavAltitudeDialogResult =
  GtcVnavAltitudeDialogResultSet
  | GtcVnavAltitudeDialogResultRevert
  | GtcVnavAltitudeDialogResultRemove
  | GtcVnavAltitudeDialogResultDirect;

/** A set result for {@link GtcVnavAltitudeDialog}. */
export interface GtcVnavAltitudeDialogResultSet {
  /** A result to set the constraint. */
  result: 'set';
  /** The altitude in feet. */
  altitudeFeet: number;
  /** Whether to display the altitude as a flight level. */
  isFlightLevel: boolean;
}

/** A revert result for {@link GtcVnavAltitudeDialog}. */
export interface GtcVnavAltitudeDialogResultRevert {
  /** A result to revert the constraint to published values. */
  result: 'revert';
}

/** A remove result for {@link GtcVnavAltitudeDialog}. */
export interface GtcVnavAltitudeDialogResultRemove {
  /** A result to remove the constraint. */
  result: 'remove';
}

/** A vnav direct to result for {@link GtcVnavAltitudeDialog}. */
export interface GtcVnavAltitudeDialogResultDirect {
  /** A result to do a vnav direct to. */
  result: 'direct';
  /** The altitude in feet for the vnav direct to constraint. */
  altitudeFeet: number;
  /** Whether the altitude should be displayed as a flight level. */
  isFlightLevel: boolean;
}

/** Dialog to set an altitude constraint. */
export class GtcVnavAltitudeDialog extends GtcView implements GtcDialogView<GtcVnavAltitudeDialogInput, GtcVnavAltitudeDialogResult> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1 });

  private thisNode?: VNode;

  private readonly mslInputRef = FSComponent.createRef<NumberInput>();
  private readonly flInputRef = FSComponent.createRef<NumberInput>();
  private readonly numpadRef = FSComponent.createRef<NumberPad>();
  private readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();

  private activeInput: NodeReference<NumberInput> | null = null;

  private readonly mslInputCssClass = SetSubject.create(['number-dialog-input', 'msl-input', 'hidden']);
  private readonly flInputCssClass = SetSubject.create(['number-dialog-input', 'fl-input', 'hidden']);

  private readonly valueMSL = Subject.create(0);
  private readonly valueFL = Subject.create(0);

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<GtcVnavAltitudeDialogResult> = {
    wasCancelled: true,
  };

  private readonly legName = Subject.create('');
  private readonly isDifferentFromPublished = Subject.create(false);
  private readonly isDesignatedConstraint = Subject.create(false);

  private readonly flightLevelModeEnabled = Subject.create(false);
  private readonly meanSeaLevelModeEnabled = Subject.create(true);
  private readonly aboveGroundLevelModeEnabled = Subject.create(false);

  private readonly isFlightLevel = Subject.create(false);
  private readonly isAboveGroundLevel = Subject.create(false);

  private readonly showAgl = Subject.create(false);

  private publishedAltitudeFeet?: number;
  private fixElevationFeet?: number;
  private maxAltitudeFeet?: number;
  private isMaxAltitudeFlightLevel?: boolean;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
    this._sidebarState.slot5.set('enterEnabled');

    this.mslInputRef.instance.isEditingActive.sub(isActive => {
      this.onEditingActiveChanged(isActive);
    });
    this.flInputRef.instance.isEditingActive.sub(isActive => {
      this.onEditingActiveChanged(isActive);
    });

    this.isFlightLevel.sub(isFlightLevel => {
      const isAgl = this.isAboveGroundLevel.get();

      this.flightLevelModeEnabled.set(isFlightLevel);
      this.meanSeaLevelModeEnabled.set(isFlightLevel ? false : !isAgl);
      this.aboveGroundLevelModeEnabled.set(isFlightLevel ? false : isAgl);

      this.activeInput?.instance.deactivateEditing();

      if (isFlightLevel) {
        this.activeInput = this.flInputRef;
        this.valueFL.set(this.convertFeetToFl(this.valueMSL.get()));
        this.flInputRef.instance.setValue(this.valueFL.get());
      } else {
        this.activeInput = this.mslInputRef;
        this.valueMSL.set(this.convertFlToFeet(this.valueFL.get()));
        this.mslInputRef.instance.setValue(this.valueMSL.get());
      }

      this.flInputCssClass.toggle('hidden', !isFlightLevel);
      this.mslInputCssClass.toggle('hidden', isFlightLevel);

      this.activeInput.instance.refresh();
    }, true);

    this.isAboveGroundLevel.sub(isAgl => {
      const isFlightLevel = this.isFlightLevel.get();

      this.flightLevelModeEnabled.set(isFlightLevel);
      this.meanSeaLevelModeEnabled.set(isFlightLevel ? false : !isAgl);
      this.aboveGroundLevelModeEnabled.set(isFlightLevel ? false : isAgl);
    }, true);
  }

  /** @inheritdoc */
  public request(input: GtcVnavAltitudeDialogInput): Promise<GtcDialogResult<GtcVnavAltitudeDialogResult>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this._sidebarState.slot1.set(null);

      this._title.set(input.title ?? 'VNAV Altitude');

      this.publishedAltitudeFeet = input.publishedAltitudeFeet;
      this.maxAltitudeFeet = input.maxAltitudeFeet;
      this.isMaxAltitudeFlightLevel = input.isMaxAltitudeFlightLevel;

      this.legName.set(input.legName);
      this.isDifferentFromPublished.set(input.isDifferentFromPublished);
      this.isDesignatedConstraint.set(input.isDesignatedConstraint);
      this.isFlightLevel.set(input.isFlightLevel);
      this.isAboveGroundLevel.set(false);
      this.fixElevationFeet = UnitType.METER.convertTo(input.fixElevationMeters ?? 0, UnitType.FOOT);
      this.showAgl.set(input.fixElevationMeters !== undefined);

      this.valueMSL.set(input.initialAltitudeFeet);
      this.valueFL.set(this.convertFeetToFl(input.initialAltitudeFeet));

      this.mslInputRef.instance.setValue(this.valueMSL.get());
      this.flInputRef.instance.setValue(this.valueFL.get());
    });
  }

  /**
   * Converts feet to flight level.
   * @param feet Feet.
   * @returns FL.
   */
  private convertFeetToFl(feet: number): number {
    if (feet < 511) {
      return feet;
    } else {
      const converted = Math.round(feet / 100);
      if (converted === 1000) {
        return 100;
      } else {
        return converted;
      }
    }
  }

  /**
   * Converts fl to feet.
   * @param fl flight level.
   * @returns feet.
   */
  private convertFlToFeet(fl: number): number {
    return fl * 100;
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

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.activeInput?.instance.deactivateEditing();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  private isValueValid(valueFeet: number): boolean {
    if (this.maxAltitudeFeet !== undefined) {
      return valueFeet <= this.maxAltitudeFeet;
    } else {
      return true;
    }
  }

  /** @inheritdoc */
  private getInvalidValueMessage(): string | VNode {
    return (
      <>
        <span>Invalid Altitude</span>
        <span>Please enter an altitude less than</span>
        {this.isMaxAltitudeFlightLevel
          ? <span>or equal to FL{((this.maxAltitudeFeet ?? 0) / 100).toFixed(0)}</span>
          : <span>or equal to {this.maxAltitudeFeet?.toFixed(0)}<span class="numberunit-unit-small">FT</span></span>
        }
      </>
    );
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
   * @param vnavDirectTo Whether to do a vnav direct to or not.
   */
  private async validateValueAndClose(vnavDirectTo = false): Promise<void> {
    const isFlightLevel = this.isFlightLevel.get();
    const isAgl = this.isAboveGroundLevel.get();

    const valueFeet = isFlightLevel
      ? this.convertFlToFeet(this.valueFL.get())
      : isAgl
        ? this.valueMSL.get() + (this.fixElevationFeet ?? 0)
        : this.valueMSL.get();

    if (this.isValueValid(valueFeet)) {
      this.resultObject = {
        wasCancelled: false,
        payload: {
          altitudeFeet: valueFeet,
          isFlightLevel,
          result: vnavDirectTo ? 'direct' : 'set',
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
    const rootCssClassName = 'vnav-altitude-dialog';

    return (
      <div class={`number-dialog ${rootCssClassName ?? ''}`}>
        {this.renderInputMsl()}
        {this.renderInputFL()}
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
        imgSrc={'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_backspace_long.png'}
        onPressed={this.onBackspacePressed.bind(this)}
        class={`number-dialog-backspace ${rootCssClassName === undefined ? '' : `${rootCssClassName}-backspace`}`}
      />
    );
  }

  /** @inheritdoc */
  private renderInputMsl(): VNode {
    return (
      <NumberInput
        ref={this.mslInputRef}
        value={this.valueMSL}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 99999);

          setDigitValues[0](Math.trunc(clamped / 1e4), true);
          setDigitValues[1](Math.trunc((clamped % 1e4) / 1e3), true);
          setDigitValues[2](Math.trunc((clamped % 1e3) / 1e2), true);
          setDigitValues[3](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[4](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <NumberUnitDisplay
              value={UnitType.FOOT.createNumber(MathUtils.clamp(Math.round(value), 0, 99999))}
              displayUnit={null}
              formatter={GtcVnavAltitudeDialog.FORMATTER}
              class="vnav-altitude-dialog-input-inactive"
            />
          );
        }}
        allowBackFill={true}
        class={this.mslInputCssClass}
      >
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e4}
          defaultCharValues={[0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1e3}
          defaultCharValues={[0]}
        />
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
        <div class='numberunit-unit-small'>FT</div>
      </NumberInput>
    );
  }

  /** @inheritdoc */
  private renderInputFL(): VNode {
    return (
      <NumberInput
        ref={this.flInputRef}
        value={this.valueFL}
        digitizeValue={(value, setSignValues, setDigitValues) => {
          const clamped = MathUtils.clamp(Math.round(value), 0, 999);

          setDigitValues[0](Math.trunc(clamped / 1e2), true);
          setDigitValues[1](Math.trunc((clamped % 1e2) / 1e1), true);
          setDigitValues[2](clamped % 1e1, true);
        }}
        renderInactiveValue={value => {
          return (
            <div class="vnav-altitude-dialog-input-inactive">
              <span>FL</span><span>{MathUtils.clamp(Math.round(value), 0, 999).toFixed(0)}</span>
            </div>
          );
        }}
        allowBackFill={true}
        class={this.flInputCssClass}
      >
        <span>FL</span>
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

  /** Sets result to 'revert' and closes the dialog. */
  private closeWithRevert(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        result: 'revert',
      },
    };
    this.props.gtcService.goBack();
  }

  /** Sets result to 'remove' and closes the dialog. */
  private closeWithRemove(): void {
    this.resultObject = {
      wasCancelled: false,
      payload: {
        result: 'remove',
      },
    };
    this.props.gtcService.goBack();
  }

  /** @inheritdoc */
  private renderOtherContents(): VNode {
    return (
      <>
        <GtcTouchButton
          class="remove-button"
          label={'Remove\nVNAV ALT'}
          isVisible={this.isDesignatedConstraint}
          onPressed={async () => {
            if (this.publishedAltitudeFeet !== undefined && this.isDifferentFromPublished.get()) {
              const message = (
                <>
                  <span>Remove or Revert to published</span>
                  <span>VNAV altitude of {this.publishedAltitudeFeet.toFixed(0)}<span class="numberunit-unit-small">FT</span>?</span>
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
              const accepted = await GtcDialogs.openMessageDialog(this.gtcService, 'Remove VNAV altitude?');
              if (accepted) {
                this.closeWithRemove();
              }
            }
          }}
        />
        <GtcTouchButton
          class="vnav-dto-button"
          label={this.legName.map(x => `VNAV${StringUtils.DIRECT_TO}\n` + x)}
          isVisible={!this.gtcService.isAdvancedVnav}
          onPressed={() => this.validateValueAndClose(true)}
        />
        <div class="gtc-panel mode-panel">
          <div class="gtc-panel-title">Mode</div>
          <GtcToggleTouchButton
            state={this.flightLevelModeEnabled}
            label={'Flight\nLevel'}
            onPressed={() => {
              this.isFlightLevel.set(true);
              this.isAboveGroundLevel.set(false);
            }}
          />
          <GtcToggleTouchButton
            state={this.meanSeaLevelModeEnabled}
            label={'MSL'}
            onPressed={() => {
              this.isFlightLevel.set(false);
              this.isAboveGroundLevel.set(false);
            }}
          />
          <GtcToggleTouchButton
            state={this.aboveGroundLevelModeEnabled}
            label={'AGL'}
            isVisible={this.showAgl}
            onPressed={() => {
              this.isFlightLevel.set(false);
              this.isAboveGroundLevel.set(true);
            }}
          />
        </div>
      </>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}