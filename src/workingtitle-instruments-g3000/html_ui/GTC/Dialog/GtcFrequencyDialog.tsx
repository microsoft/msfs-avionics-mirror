import { FSComponent, NodeReference, RadioType, SetSubject, Subject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { G3000FilePaths, G3000RadioType, G3000RadioUtils, TunableRadio } from '@microsoft/msfs-wtg3000-common';

import { ChannelSpacing } from '../Components/FrequencyInput/ChannelInputSlot';
import { FrequencyInput } from '../Components/FrequencyInput/FrequencyInput';
import { NumberPad } from '../Components/NumberPad/NumberPad';
import { GtcImgTouchButton } from '../Components/TouchButton/GtcImgTouchButton';
import { GtcToggleTouchButton } from '../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../Components/TouchButton/GtcTouchButton';
import { ImgTouchButton } from '../Components/TouchButton/ImgTouchButton';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import './GtcFrequencyDialog.css';

/**
 * Frequency input types supported by {@link GtcFrequencyDialog}
 */
export enum GtcFrequencyDialogInputType {
  /** Nav radio frequencies. */
  Nav = 'Nav',

  /** Com radio frequencies with 25 Khz spacing. */
  Com25 = 'Com25',

  /** Com radio frequencies with 8.33 Khz spacing. */
  Com833 = 'Com833',

  /** ADF radio frequencies. */
  Adf = 'Adf'
}

/**
 * A request input for {@link GtcFrequencyDialog}.
 */
export type GtcFrequencyDialogInput = {
  /** The frequency input type to use. */
  type: GtcFrequencyDialogInputType;

  /** The frequency, in hertz, initially loaded into the dialog at the start of the request. */
  initialValue: number;

  /** Whether to show the transfer frequency button. */
  showTransferButton: boolean;

  /** Whether to show the find button. */
  showFindButton: boolean;

  /** The active frequency to display above the dialog's input. If not defined, nothing will be displayed above the input. */
  activeFrequency?: number | Subscribable<number>;

  /** The GTC view title to display while the request is active. */
  title?: string;

  /** The radio for which the request is being made. */
  radio?: TunableRadio;

  /** Whether to show the ADF mode selection buttons. Ignored if the input type is not ADF. Defaults to `false`. */
  showAdfModeButtons?: boolean;
};

/**
 * A request result returned from {@link GtcFrequencyDialog}.
 */
export type GtcFrequencyDialogResult = {
  /** The selected frequency, in hertz. */
  frequency: number;

  /** Whether a frequency transfer was selected. */
  transfer: boolean;
};

/**
 * A frequency input context.
 */
type GtcFrequencyDialogContext = {
  /** This context's frequency input type. */
  readonly type: GtcFrequencyDialogInputType;

  /** A reference to the frequency input. */
  readonly inputRef: NodeReference<FrequencyInput>;

  /** CSS classes for the frequency input. */
  readonly cssClass: SetSubject<string>;

  /** The frequency value. */
  readonly frequency: Subject<number>;

  /** A function which renders the active frequency to a displayed string. */
  readonly activeFrequencyRenderer: (freq: number) => string;

  /** A function which validates frequency values. */
  readonly validator: (freq: number) => boolean;

  /** A subscription to the frequency input's editing state. */
  editingSub?: Subscription;
}

/**
 * A GTC dialog view which allows the user to select a radio frequency.
 */
export class GtcFrequencyDialog extends GtcView implements GtcDialogView<GtcFrequencyDialogInput, GtcFrequencyDialogResult> {
  private readonly contexts: Record<GtcFrequencyDialogInputType, GtcFrequencyDialogContext> = {
    [GtcFrequencyDialogInputType.Nav]: {
      type: GtcFrequencyDialogInputType.Nav,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      cssClass: SetSubject.create(['frequency-dialog-input', 'frequency-dialog-input-nav', 'hidden']),
      frequency: Subject.create(0),
      activeFrequencyRenderer: (freq: number): string => {
        return `Active Freq: ${(freq / 1e6).toFixed(2)}`;
      },
      validator: (freq: number) => {
        return freq >= 108e6 && freq < 118e6;
      }
    },
    [GtcFrequencyDialogInputType.Com25]: {
      type: GtcFrequencyDialogInputType.Com25,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      cssClass: SetSubject.create(['frequency-dialog-input', 'frequency-dialog-input-com25', 'hidden']),
      frequency: Subject.create(0),
      activeFrequencyRenderer: (freq: number): string => {
        return `Active Freq: ${(freq / 1e6).toFixed(2)}`;
      },
      validator: (freq: number) => {
        return freq >= 118e6 && freq < 137e6;
      }
    },
    [GtcFrequencyDialogInputType.Com833]: {
      type: GtcFrequencyDialogInputType.Com833,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      cssClass: SetSubject.create(['frequency-dialog-input', 'frequency-dialog-input-com833', 'hidden']),
      frequency: Subject.create(0),
      activeFrequencyRenderer: (freq: number): string => {
        return `Active Freq: ${(freq / 1e6).toFixed(3)}`;
      },
      validator: (freq: number) => {
        return freq >= 118e6 && freq < 137e6;
      }
    },
    [GtcFrequencyDialogInputType.Adf]: {
      type: GtcFrequencyDialogInputType.Adf,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      cssClass: SetSubject.create(['frequency-dialog-input', 'frequency-dialog-input-adf', 'hidden']),
      frequency: Subject.create(0),
      activeFrequencyRenderer: (freq: number): string => {
        return `Active Freq: ${(freq / 1e3).toFixed(1)}`;
      },
      validator: (freq: number) => {
        return freq >= 190e3 && freq < 1800e3;
      }
    },
  };

  private readonly numpadRef = FSComponent.createRef<NumberPad>();
  private readonly backspaceRef = FSComponent.createRef<ImgTouchButton>();
  private readonly findRef = FSComponent.createRef<GtcTouchButton>();
  private readonly transferRef = FSComponent.createRef<GtcTouchButton>();

  private readonly rootCssClass = SetSubject.create(['frequency-dialog']);

  private readonly isTransferVisible = Subject.create(false);
  private readonly isFindVisible = Subject.create(false);

  private readonly activeFrequencyText = Subject.create('');

  private activeContext?: GtcFrequencyDialogContext;
  private activeFrequencyPipe?: Subscription;

  private resolveFunction?: (value: GtcDialogResult<GtcFrequencyDialogResult>) => void;
  private resultObject: GtcDialogResult<GtcFrequencyDialogResult> = {
    wasCancelled: true,
  };

  private _radio?: TunableRadio;
  // eslint-disable-next-line jsdoc/require-returns
  /** The radio for the current request. */
  public get radio(): TunableRadio | undefined {
    return this._radio;
  }

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnterHold');
    this._sidebarState.slot5.set('enterEnabled');

    for (const key in this.contexts) {
      const context = this.contexts[key as GtcFrequencyDialogInputType];
      context.editingSub = context.inputRef.instance.isEditingActive.sub(isActive => {
        this.onEditingActiveChanged(isActive);
      });
    }
  }

  /** @inheritdoc */
  public request(input: GtcFrequencyDialogInput): Promise<GtcDialogResult<GtcFrequencyDialogResult>> {
    if (!this.isAlive) {
      throw new Error('GtcFrequencyDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this._sidebarState.slot1.set(null);

      this.isTransferVisible.set(input.showTransferButton);
      this.isFindVisible.set(input.showFindButton);

      this.activeContext = this.contexts[input.type];

      const isComRadio: boolean =
        input.type === GtcFrequencyDialogInputType.Com833 ||
        input.type === GtcFrequencyDialogInputType.Com25;
      (this.gtcService.isHorizontal ? this._sidebarState.mapKnobLabel : this._sidebarState.centerKnobLabel)
        .set(isComRadio ? null : '');

      if (input.activeFrequency !== undefined) {
        if (SubscribableUtils.isSubscribable(input.activeFrequency)) {
          this.activeFrequencyPipe = input.activeFrequency.pipe(this.activeFrequencyText, this.activeContext.activeFrequencyRenderer);
        } else {
          this.activeFrequencyText.set(this.activeContext.activeFrequencyRenderer(input.activeFrequency));
        }
      }

      this.activeContext.cssClass.delete('hidden');
      this.activeContext.inputRef.instance.setFrequency(input.initialValue);
      this.activeContext.inputRef.instance.refresh();
      this.activeContext.editingSub?.resume();

      this._title.set(input.title);

      this._radio = input.radio;

      this.rootCssClass.toggle('frequency-dialog-show-adf-mode', input.type === GtcFrequencyDialogInputType.Adf && (input.showAdfModeButtons ?? false));
    });
  }

  /** @inheritDoc */
  public onResume(): void {
    this.activeContext?.inputRef.instance.refresh();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    if (this.activeContext?.inputRef.instance.onGtcInteractionEvent(event) ?? false) {
      this._sidebarState.slot1.set('cancel');
      return true;
    }

    const isHrz: boolean = this.gtcService.isHorizontal;
    const radio: TunableRadio = this.radio as TunableRadio;
    const isComRadio = G3000RadioUtils.isRadioType(radio, G3000RadioType.Com);

    switch (event) {
      case GtcInteractionEvent.InnerKnobPush:
        this.validateValueAndClose(false);
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.validateValueAndClose(true);
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.validateValueAndClose(false);
        return true;
      case GtcInteractionEvent.MapKnobInc:
        isHrz && isComRadio && G3000RadioUtils.changeRadioVolume(radio, 'INC');
        return isHrz && isComRadio;
      case GtcInteractionEvent.MapKnobDec:
        isHrz && isComRadio && G3000RadioUtils.changeRadioVolume(radio, 'DEC');
        return isHrz && isComRadio;
      case GtcInteractionEvent.CenterKnobInc:
        !isHrz && isComRadio && G3000RadioUtils.changeRadioVolume(radio, 'INC');
        return !isHrz && isComRadio;
      case GtcInteractionEvent.CenterKnobDec:
        !isHrz && isComRadio && G3000RadioUtils.changeRadioVolume(radio, 'DEC');
        return !isHrz && isComRadio;
      default:
        return false;
    }
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   * @param transfer Whether a transfer was selected.
   */
  private validateValueAndClose(transfer: boolean): void {
    if (this.activeContext !== undefined && this.activeContext.validator(this.activeContext.frequency.get())) {
      this.resultObject = {
        wasCancelled: false,
        payload: {
          frequency: this.activeContext.frequency.get(),
          transfer
        }
      };

      this.props.gtcService.goBack();
    }
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this._radio = undefined;

    if (this.activeContext !== undefined) {
      this.activeContext.inputRef.instance.deactivateEditing();
      this.activeContext.cssClass.add('hidden');
      this.activeContext.editingSub?.pause();

      this.activeContext = undefined;
    }

    this.activeFrequencyPipe?.destroy();
    this.activeFrequencyText.set('');

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's number pad buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  protected onNumberPressed(value: number): void {
    this.activeContext?.inputRef.instance.setSlotCharacterValue(`${value}`);
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  protected onBackspacePressed(): void {
    this.activeContext?.inputRef.instance.backspace();
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='frequency-dialog-main-content'>
          {this.renderNavInput()}
          {this.renderCom25Input()}
          {this.renderCom833Input()}
          {this.renderAdfInput()}
          <div class='frequency-dialog-active-freq'>
            {this.activeFrequencyText}
          </div>
          <NumberPad
            ref={this.numpadRef}
            onNumberPressed={this.onNumberPressed.bind(this)}
            class='frequency-dialog-numpad'
            orientation={this.props.gtcService.orientation}
          />
          <GtcImgTouchButton
            ref={this.backspaceRef}
            label='BKSP'
            imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_backspace_long.png`}
            onPressed={this.onBackspacePressed.bind(this)}
            class='frequency-dialog-backspace'
          />
          <GtcTouchButton
            ref={this.findRef}
            isVisible={this.isFindVisible}
            isEnabled={false}
            class='frequency-dialog-find'
          >
            <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_find.png`} />
            <div>Find</div>
          </GtcTouchButton>
          <GtcTouchButton
            ref={this.transferRef}
            isVisible={this.isTransferVisible}
            onPressed={(): void => { this.validateValueAndClose(true); }}
            class='frequency-dialog-xfer'
          >
            <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_flip_flop_arrow.png`} />
            <div>XFER</div>
          </GtcTouchButton>
        </div>
        <div class='frequency-dialog-adf-mode-container gtc-panel'>
          <div class='frequency-dialog-adf-mode-title'>Mode</div>
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='ANT'
            isEnabled={false}
            class='frequency-dialog-adf-mode-button'
          />
          <GtcToggleTouchButton
            state={Subject.create(true)}
            label='ADF'
            isEnabled={false}
            class='frequency-dialog-adf-mode-button'
          />
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='ADF/BFO'
            isEnabled={false}
            class='frequency-dialog-adf-mode-button'
          />
          <GtcToggleTouchButton
            state={Subject.create(false)}
            label='ANT/BFO'
            isEnabled={false}
            class='frequency-dialog-adf-mode-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this dialog's nav radio frequency input.
   * @returns This dialog's nav radio frequency input, as a VNode.
   */
  private renderNavInput(): VNode {
    const context = this.contexts[GtcFrequencyDialogInputType.Nav];

    return (
      <FrequencyInput
        ref={context.inputRef}
        radioType={RadioType.Nav}
        frequency={context.frequency}
        class={context.cssClass}
      />
    );
  }

  /**
   * Renders this dialog's com radio frequency input with 25 Khz spacing.
   * @returns This dialog's com radio frequency input with 25 Khz spacing, as a VNode.
   */
  private renderCom25Input(): VNode {
    const context = this.contexts[GtcFrequencyDialogInputType.Com25];

    return (
      <FrequencyInput
        ref={context.inputRef}
        radioType={RadioType.Com}
        frequency={context.frequency}
        comChannelSpacing={ChannelSpacing.Spacing25Khz}
        class={context.cssClass}
      />
    );
  }

  /**
   * Renders this dialog's com radio frequency input with 8.33 Khz spacing.
   * @returns This dialog's com radio frequency input with 8.33 Khz spacing, as a VNode.
   */
  private renderCom833Input(): VNode {
    const context = this.contexts[GtcFrequencyDialogInputType.Com833];

    return (
      <FrequencyInput
        ref={context.inputRef}
        radioType={RadioType.Com}
        frequency={context.frequency}
        comChannelSpacing={ChannelSpacing.Spacing8_33Khz}
        class={context.cssClass}
      />
    );
  }

  /**
   * Renders this dialog's ADF radio frequency input.
   * @returns This dialog's ADF radio frequency input, as a VNode.
   */
  private renderAdfInput(): VNode {
    const context = this.contexts[GtcFrequencyDialogInputType.Adf];

    return (
      <FrequencyInput
        ref={context.inputRef}
        radioType={RadioType.Adf}
        frequency={context.frequency}
        class={context.cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.contexts[GtcFrequencyDialogInputType.Nav].inputRef.getOrDefault()?.destroy();
    this.contexts[GtcFrequencyDialogInputType.Com25].inputRef.getOrDefault()?.destroy();
    this.contexts[GtcFrequencyDialogInputType.Com833].inputRef.getOrDefault()?.destroy();
    this.contexts[GtcFrequencyDialogInputType.Adf].inputRef.getOrDefault()?.destroy();

    this.numpadRef.getOrDefault()?.destroy();
    this.backspaceRef.getOrDefault()?.destroy();
    this.findRef.getOrDefault()?.destroy();
    this.transferRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
