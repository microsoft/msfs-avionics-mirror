import {
  ControlEvents, FSComponent, MathUtils, Publisher, Subject, Subscription, VNode, XPDRMode, XPDRSimVarEvents,
} from '@microsoft/msfs-sdk';
import { BtnImagePathHor } from '../../ButtonBackgroundImagePaths';
import { NumberInput } from '../../Components/NumberInput/NumberInput';
import { DigitInputSlot } from '../../Components/NumberInput/DigitInputSlot';
import { GtcImgTouchButton } from '../../Components/TouchButton/GtcImgTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { RoundTouchButton } from '../../Components/TouchButton/RoundTouchButton';
import { GtcDialogResult, GtcDialogView } from '../../Dialog/GtcDialogView';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import '../../Components/TouchButton/NumPadTouchButton.css';
import './GtcTransponderDialog.css';

/** Types of transponder */
type Transponder = 'XPDR1' | 'XPDR2';

/** Transponder dialog layouts */
export type TransponderDialogLayout = 'MODE_AND_CODE' | 'CODE_ONLY';

/** Component props for the Transponder dialog. */
export interface GtcTransponderDialogProps extends GtcViewProps {
  /** Which layout version to display. */
  layout: TransponderDialogLayout;
}

/**
 * A GTC dialog which allows the user to select a transponder code and optionally a transponder mode.
 */
export class GtcTransponderDialog extends GtcView<GtcTransponderDialogProps> implements GtcDialogView<number, number> {
  private thisNode?: VNode;

  private readonly inputRef = FSComponent.createRef<NumberInput>();

  private readonly controlPublisher: Publisher<ControlEvents> = this.bus.getPublisher<ControlEvents>();
  private readonly xpdrMode: Subject<XPDRMode> = Subject.create<XPDRMode>(XPDRMode.STBY);
  private activeTransponder: Subject<Transponder> = Subject.create<Transponder>('XPDR1');

  private readonly xpdrCodeValue = Subject.create(1234);
  private readonly isXpdrCodeValueValid = this.xpdrCodeValue.map(code => !isNaN(code));

  protected resolveFunction?: (value: any) => void;
  protected resultObject: GtcDialogResult<number> = {
    wasCancelled: true,
  };

  private isAlive = true;

  private xpdrModeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Transponder');

    this.isXpdrCodeValueValid.sub(isValid => {
      this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
      this._sidebarState.slot5.set(isValid ? 'enterEnabled' : 'enterDisabled');
    }, true);

    // Set Back button to Cancel once editing starts
    this.inputRef.instance.isEditingActive.sub(val => val && this._sidebarState.slot1.set('cancel'));

    this.xpdrModeSub = this.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_mode_1').whenChanged()
      .handle((mode: XPDRMode): void => this.xpdrMode.set(mode));
  }

  private onIdentPressed = (): void => this.controlPublisher.pub('xpdr_send_ident_1', true, true, false);

  /** Handles transponder VFR button presses */
  private onVFRPressed = (): void => {
    const vfrCode: number = [WorldRegion.NORTH_AMERICA, WorldRegion.AUSTRALIA]
      .includes(Simplane.getWorldRegion()) ? 1200 : 7000;

    this.inputRef.instance.deactivateEditing();
    this.inputRef.instance.setValue(vfrCode);
  };

  // private onActiveTransponderPressed = async (): Promise<void> => {
  //   const result: GtcDialogResult<Transponder> = await this.props.gtcService
  //     .openPopup<GtcListDialog>(GtcViewKeys.ListDialog1).ref
  //     .request<Transponder>({
  //       title: 'Select Active Transponder',
  //       inputData: [
  //         { labelRenderer: () => 'XPDR1', value: 'XPDR1' },
  //         { labelRenderer: () => 'XPDR2', value: 'XPDR2' },
  //       ],
  //       selectableListDefaultValue: this.activeTransponder.get(),
  //     });
  //   !result.wasCancelled && this.activeTransponder.set(result.payload);
  // };

  /** @inheritdoc */
  public request(input: number): Promise<GtcDialogResult<number>> {
    if (!this.isAlive) {
      throw new Error('GtcTransponderDialog: cannot request from a dead dialog');
    }

    return new Promise<GtcDialogResult<number>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.inputRef.instance.setValue(input);
    });
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.inputRef.instance.changeSlotValue(1);
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.inputRef.instance.changeSlotValue(-1);
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.inputRef.instance.moveCursor(1, true);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.inputRef.instance.moveCursor(-1, true);
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        this.submitDialog();
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.submitDialog();
        return true;
      default:
        return false;
    }
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  protected async submitDialog(): Promise<void> {
    if (!this.isXpdrCodeValueValid.get()) {
      return;
    }

    this.resultObject = {
      wasCancelled: false,
      payload: this.xpdrCodeValue.get(),
    };
    this.props.gtcService.goBack();
  }

  /** Clears this dialog's pending request and resolves the pending request Promise if one exists. */
  protected cleanupRequest(): void {
    this.inputRef.instance.deactivateEditing();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritDoc */
  public override onOpen(): void {
    this._sidebarState.slot1.set(null);
    (this.gtcService.isHorizontal ? this._sidebarState.mapKnobLabel : this._sidebarState.centerKnobLabel).set('');
  }

  /** @inheritDoc */
  public override onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`transponder-popup gtc-popup-panel gtc-nav-com-popup${this.props.layout === 'CODE_ONLY' ? ' code-only' : ''}`}>
        {this.props.layout === 'MODE_AND_CODE' &&
          <div class="mode-buttons">
            <div class="mode-label">Mode</div>
            <GtcToggleTouchButton
              label={'Altitude\nReporting'}
              state={this.xpdrMode.map(mode => mode === XPDRMode.ALT)}
              onPressed={(): void => this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false)}
            />
            <GtcToggleTouchButton
              label='On'
              state={this.xpdrMode.map(mode => mode === XPDRMode.ON)}
              onPressed={(): void => this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.ON, true, false)}
            />
            <GtcToggleTouchButton
              label='Standby'
              state={this.xpdrMode.map(mode => mode === XPDRMode.STBY)}
              onPressed={(): void => this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.STBY, true, false)}
            />
          </div>
        }

        <div>
          <NumberInput
            ref={this.inputRef}
            value={this.xpdrCodeValue}
            digitizeValue={(value, setSignValues, setDigitValues): void => {
              if (isNaN(value)) {
                return;
              }
              const rounded = Math.max(0, Math.round(value));
              setDigitValues[0](MathUtils.clamp(Math.floor(rounded / 1000), 0, 7), true);
              setDigitValues[1](MathUtils.clamp(Math.floor((rounded % 1000) / 100), 0, 7), true);
              setDigitValues[2](MathUtils.clamp(Math.floor((rounded % 100) / 10), 0, 7), true);
              setDigitValues[3](MathUtils.clamp(rounded % 10, 0, 7), true);
            }}
            allowBackFill={false}
          >
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={1000}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={100}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={10}
              defaultCharValues={[NaN]}
            />
            <DigitInputSlot
              characterCount={1}
              minValue={0}
              maxValue={8}
              increment={1}
              wrap={true}
              scale={1}
              defaultCharValues={[NaN]}
            />
          </NumberInput>
          <GtcImgTouchButton
            label='BKSP'
            imgSrc={BtnImagePathHor.BackspaceIcon}
            onPressed={() => this.inputRef.instance.backspace()}
            class='backspace-button'
          />
          <div class="numpad">
            {['0', '1', '2', '3', '4', '5', '6', '7'].map((numeral: string) => (
              <RoundTouchButton
                label={numeral}
                class='numpad-touch-button'
                onPressed={() => this.inputRef.instance.setSlotCharacterValue(numeral)}
                orientation={this.gtcService.orientation}
              ></RoundTouchButton>
            ))}
          </div>
        </div>

        {this.props.layout === 'MODE_AND_CODE' &&
          <GtcTouchButton
            class='active-xpdr'
            label={
              <div class="active-xpdr-label-container">
                <div class="active-xpdr-label">Active</div>
                <div class="active-xpdr-value">{this.activeTransponder}</div>
              </div>
            }
            isEnabled={false}
          />
        }

        {this.props.layout === 'CODE_ONLY' &&
          <GtcTouchButton
            class='ident'
            label='IDENT'
            onPressed={this.onIdentPressed}
          />
        }

        <GtcTouchButton
          class='vfr'
          label='VFR'
          onPressed={this.onVFRPressed}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.xpdrModeSub?.destroy();

    super.destroy();
  }
}