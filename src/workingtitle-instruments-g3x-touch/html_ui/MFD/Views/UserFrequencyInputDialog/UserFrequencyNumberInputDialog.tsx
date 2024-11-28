import { ComSpacing, FSComponent, NodeReference, RadioType, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { ChannelSpacing, FrequencyInput } from '../../../Shared/Components/FrequencyInput';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { NumberPad } from '../../../Shared/Components/NumberPad';

import './UserFrequencyNumberInputDialog.css';

/**
 * A request input for {@link UserFrequencyInputDialog}.
 */
export interface UserFrequencyInputDialogInput {
  /** The channel spacing to use when selecting a frequency. */
  type: UserFrequencyInputDialogContextType;

  /** The frequency, in hertz, initially loaded into the dialog at the start of the request. */
  initialValue?: number;
}

/**
 * A request result returned by {@link UserFrequencyInputDialog}.
 */
export interface UserFrequencyNumberInputDialogOutput {
  /** The selected frequency, in Hz. */
  frequency: number;
}

export enum UserFrequencyInputDialogContextType {
  Com25Khz = 'Com25Khz',
  Com833Khz = 'Com833Khz',
  Nav = 'Nav',
}

/**
 * A COM frequency dialog context.
 */
type ComFrequencyNumberDialogContext = {
  /** This context's type. */
  readonly type: UserFrequencyInputDialogContextType.Com25Khz | UserFrequencyInputDialogContextType.Com833Khz;
  /** This context's COM spacing type. */
  readonly comType: ComSpacing;
}

/**
 * A NAV frequency dialog context.
 */
type NavFrequencyNumberDialogContext = {
  /** This context's type. */
  readonly type: UserFrequencyInputDialogContextType.Nav;
}

/**
 * A dialog context.
 */
type UserFrequencyNumberInputDialogContext = (ComFrequencyNumberDialogContext | NavFrequencyNumberDialogContext) & {
  /** A reference to this context's frequency input. */
  readonly inputRef: NodeReference<FrequencyInput>;

  /** This context's frequency value. */
  readonly freqValue: Subject<number>;

  /** Whether this context's frequency input is hidden. */
  readonly hidden: Subject<boolean>;

  /** The pipe that determines whether this context's input is valid. */
  isInputValidPipe?: Subscription;
}

/**
 * A dialog which allows the user to select a COM or NAV radio frequency.
 */
export class UserFrequencyNumberInputDialog
  extends AbstractUiView
  implements UiDialogView<UserFrequencyInputDialogInput, UserFrequencyNumberInputDialogOutput> {

  private thisNode?: VNode;

  private readonly enterRef = FSComponent.createRef<UiImgTouchButton>();

  private readonly contexts: Record<UserFrequencyInputDialogContextType, UserFrequencyNumberInputDialogContext> = {
    [UserFrequencyInputDialogContextType.Com25Khz]: {
      type: UserFrequencyInputDialogContextType.Com25Khz,
      comType: ComSpacing.Spacing25Khz,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      freqValue: Subject.create(118e6),
      hidden: Subject.create<boolean>(true)
    },
    [UserFrequencyInputDialogContextType.Com833Khz]: {
      type: UserFrequencyInputDialogContextType.Com833Khz,
      comType: ComSpacing.Spacing833Khz,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      freqValue: Subject.create(118e6),
      hidden: Subject.create<boolean>(true)
    },
    [UserFrequencyInputDialogContextType.Nav]: {
      type: UserFrequencyInputDialogContextType.Nav,
      inputRef: FSComponent.createRef<FrequencyInput>(),
      freqValue: Subject.create(108e6),
      hidden: Subject.create<boolean>(true)
    },
  };

  private readonly isInputValid = Subject.create(false);

  private activeContext?: UserFrequencyNumberInputDialogContext;

  private readonly backButtonLabel = Subject.create('');
  private readonly backButtonImgSrc = Subject.create('');

  private resolveFunction?: (value: UiDialogResult<UserFrequencyNumberInputDialogOutput>) => void;
  private resultObject: UiDialogResult<UserFrequencyNumberInputDialogOutput> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [ UiKnobId.SingleOuter, 'Tune Freq' ],
      [ UiKnobId.SingleInner, 'Tune Freq' ],
    ]);

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public request(input: UserFrequencyInputDialogInput): Promise<UiDialogResult<UserFrequencyNumberInputDialogOutput>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.activeContext = this.contexts[input.type];

      this.activeContext.hidden.set(false);
      if (input.initialValue) {
        this.activeContext.inputRef.instance.setFrequency(input.initialValue);
        this.activeContext.freqValue.set(input.initialValue);
      }
      this.activeContext.inputRef.instance.refresh();

      this.activeContext.isInputValidPipe = this.activeContext.freqValue.pipe(this.isInputValid, (value) => {
        return this.activeContext?.type === UserFrequencyInputDialogContextType.Nav
          ? value >= 108e6 && value < 118e6
          : value >= 118e6 && value < 137e6;
      }, false);

      this.backButtonLabel.set('Cancel');
      this.backButtonImgSrc.set(`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`);

      this.enterRef.instance.focusSelf();
    });
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    if (this.activeContext) {
      this.activeContext.inputRef.instance.deactivateEditing();
      this.activeContext.hidden.set(true);
      this.activeContext.freqValue.set(NaN);
      this.activeContext.isInputValidPipe?.destroy();
      this.activeContext = undefined;
    }

    this.isInputValid.set(false);

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's numeral buttons is pressed.
   * @param value The numeric value of the button that was pressed.
   */
  private onNumberPressed(value: number): void {
    this.activeContext?.inputRef.instance.setSlotCharacterValue(value.toString());
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.activeContext?.inputRef.instance.backspace();
  }

  /**
   * Responds to when this dialog's back button is pressed.
   */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  private validateValueAndClose(): void {
    if (!this.activeContext) {
      return;
    }

    const frequency = this.activeContext.freqValue.get();
    if (this.activeContext.type !== UserFrequencyInputDialogContextType.Nav) {
      if (frequency < 118e6 && frequency >= 137e6) {
        return;
      }
    } else {
      if (frequency < 108e6 && frequency >= 118e6) {
        return;
      }
    }

    this.resultObject = {
      wasCancelled: false,
      payload: {
        frequency
      }
    };

    this.props.uiService.goBackMfd();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='user-freq-number-input-dialog ui-view-panel'>
        <div class='user-freq-number-input-dialog-title'>Set User Frequency</div>

        <div class='user-freq-number-input-dialog-input-row-wrapper'>
          <div class='user-freq-number-input-dialog-input-row'>
            <div class='user-freq-number-input-dialog-left-spacer' />
            <div class='user-freq-number-input-dialog-input-row-center'>
              <FrequencyInput
                ref={this.contexts[UserFrequencyInputDialogContextType.Com25Khz].inputRef}
                radioType={RadioType.Com}
                comChannelSpacing={ChannelSpacing.Spacing25Khz}
                frequency={this.contexts[UserFrequencyInputDialogContextType.Com25Khz].freqValue}
                class={{ 'user-freq-number-input-dialog-input': true, 'hidden': this.contexts[UserFrequencyInputDialogContextType.Com25Khz].hidden }}
              />
              <FrequencyInput
                ref={this.contexts[UserFrequencyInputDialogContextType.Com833Khz].inputRef}
                radioType={RadioType.Com}
                comChannelSpacing={ChannelSpacing.Spacing8_33Khz}
                frequency={this.contexts[UserFrequencyInputDialogContextType.Com833Khz].freqValue}
                class={{ 'user-freq-number-input-dialog-input': true, 'hidden': this.contexts[UserFrequencyInputDialogContextType.Com833Khz].hidden }}
              />
              <FrequencyInput
                ref={this.contexts[UserFrequencyInputDialogContextType.Nav].inputRef}
                radioType={RadioType.Nav}
                frequency={this.contexts[UserFrequencyInputDialogContextType.Nav].freqValue}
                class={{ 'user-freq-number-input-dialog-input': true, 'hidden': this.contexts[UserFrequencyInputDialogContextType.Nav].hidden }}
              />
            </div>

            <UiImgTouchButton
              label='Backspace'
              imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
              onPressed={this.onBackspacePressed.bind(this)}
              class='ui-nav-button'
            />
          </div>
        </div>

        <NumberPad
          onNumberPressed={this.onNumberPressed.bind(this)}
          class='user-freq-number-input-dialog-numpad'
        />

        <div class='user-freq-number-input-dialog-bottom-row'>
          <UiImgTouchButton
            label={this.backButtonLabel}
            imgSrc={this.backButtonImgSrc}
            onPressed={this.onBackPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            ref={this.enterRef}
            isEnabled={this.isInputValid}
            label='Enter'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            onPressed={this.validateValueAndClose.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
