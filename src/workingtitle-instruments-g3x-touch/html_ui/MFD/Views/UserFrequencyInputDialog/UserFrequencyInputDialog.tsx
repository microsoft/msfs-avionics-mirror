import { ComSpacing, Formatter, FSComponent, MappedSubject, RadioFrequencyFormatter, Subject, VNode } from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiValueTouchButton } from '../../../Shared/Components/TouchButton/UiValueTouchButton';
import { ComFrequencyDialogOutput } from '../ComFrequencyDialog/ComFrequencyDialog';
import { UserFrequencyInputDialogContextType, UserFrequencyNumberInputDialog } from './UserFrequencyNumberInputDialog';
import { UserFrequencyNameInputDialog } from './UserFrequencyNameInputDialog';

import './UserFrequencyInputDialog.css';

export enum UserFrequencyInputDialogType {
  Com,
  Nav,
}

/**
 * Component props for {@link ComFindFrequencyDialog}.
 */
export interface UserFrequencyInputDialogProps extends UiViewProps {
  /** The type of dialog to display. Com or Nav from {@link UserFrequencyInputDialogType}. */
  type: UserFrequencyInputDialogType;
}

/**
 * The input of a COM find frequency dialog.
 */
export interface UserFrequencyInputDialogInput {
  /** The com spacing for the radio, if applicable */
  comSpacing?: ComSpacing;
}

/**
 * The result returned by {@link UserFrequencyInputDialog}.
 */
export interface UserFrequencyInputDialogOutput {
  /** The frequency in KHz */
  frequency: number;
  /** The name of the frequency */
  name: string;
}

/**
 * The Edit User Frequencies dialog in the Com Find Frequency flow.
 */
export class UserFrequencyInputDialog extends AbstractUiView<UserFrequencyInputDialogProps>
  implements UiDialogView<UserFrequencyInputDialogInput, UiDialogResult<UserFrequencyInputDialogOutput>> {

  private readonly comSpacing = Subject.create<ComSpacing | null>(null);

  private readonly frequency = Subject.create<number | null>(null);
  private readonly name = Subject.create<string | null>(null);

  private readonly inputValid = MappedSubject.create(([frequency, name]) => {
    return !!frequency && !!name;
  }, this.frequency, this.name);

  private readonly nameFormatter: Formatter<string | null, string> = {
    nullValueString: '______',
    format: (name) => {
      if (!name) {
        return '______';
      }
      return name;
    },
  };
  private frequencyFormatter = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz, '______');

  private resolveFunction?: (value: UiDialogResult<ComFrequencyDialogOutput>) => void;
  private resultObject: UiDialogResult<any> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public request(input: UserFrequencyInputDialogInput): Promise<UiDialogResult<any>> {
    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.comSpacing.set(input.comSpacing ?? null);
      if (this.props.type === UserFrequencyInputDialogType.Com) {
        this.frequencyFormatter = RadioFrequencyFormatter.createCom(input.comSpacing ?? ComSpacing.Spacing25Khz, '______');
      } else {
        this.frequencyFormatter = RadioFrequencyFormatter.createNav('______');
      }
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.comSpacing.set(null);

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Handles adding a user frequency.
   */
  private onAddFrequency(): void {
    const frequency = this.frequency.get();
    const name = this.name.get();

    if (frequency && name) {
      this.resultObject = {
        wasCancelled: false,
        payload: {
          frequency: frequency / 1e6, // Saving frequency in KHz, but we got it in Hz
          name,
        },
      };
    }

    this.props.uiService.goBackMfd();
  }

  /**
   * Handles the back button being pressed.
   */
  private onBackButtonPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Handles the frequency entry button being pressed.
   */
  private async onFrequencyEntryPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup(
      (popup: RenderedUiViewEntry) => popup.key === UiViewKeys.UserFrequencyNumberInputDialog && popup.layer === UiViewStackLayer.Overlay)
    ) {
      const dialogType = this.props.type === UserFrequencyInputDialogType.Com
        ? this.comSpacing.get() === ComSpacing.Spacing25Khz ? UserFrequencyInputDialogContextType.Com25Khz : UserFrequencyInputDialogContextType.Com833Khz
        : UserFrequencyInputDialogContextType.Nav;
      const dialogInput = {
        type: dialogType,
        initialValue: this.frequency.get() ?? undefined,
      };
      const result = await this.props.uiService
        .openMfdPopup<UserFrequencyNumberInputDialog>(UiViewStackLayer.Overlay, UiViewKeys.UserFrequencyNumberInputDialog, false, { popupType: 'slideout-top-full' })
        .ref.request(dialogInput);

      if (!result.wasCancelled && result.payload.frequency) {
        this.frequency.set(result.payload.frequency);
      }
    }
  }

  /**
   * Handles the name entry button being pressed.
   */
  private async onNameEntryPressed(): Promise<void> {
    if (!this.props.uiService.closeMfdPopup(
      (popup: RenderedUiViewEntry) => popup.key === UiViewKeys.UserFrequencyNameInputDialog && popup.layer === UiViewStackLayer.Overlay)
    ) {
      const dialogInput = {
        initialValue: this.name.get() ?? undefined,
      };
      const result = await this.props.uiService
        .openMfdPopup<UserFrequencyNameInputDialog>(UiViewStackLayer.Overlay, UiViewKeys.UserFrequencyNameInputDialog, false, { popupType: 'slideout-top-full' })
        .ref.request(dialogInput);

      if (!result.wasCancelled && result.payload.name) {
        this.name.set(result.payload.name);
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="ui-view-panel com-find-dialog add-user-frequency-dialog">
        <div class="com-find-dialog-title">Add User Frequency</div>
        <div class="user-frequency-input-dialog-container">
          <UiValueTouchButton
            label={'Name'}
            state={this.name.map(v => v !== null ? this.nameFormatter.format(v) : this.nameFormatter.nullValueString)}
            class={'user-frequency-input-touchbutton'}
            onPressed={this.onNameEntryPressed.bind(this)}
          />
          <UiValueTouchButton
            label={'Frequency'}
            state={this.frequency.map(v => this.frequencyFormatter(v !== null ? Number(v) : NaN))}
            class={'user-frequency-input-touchbutton'}
            onPressed={this.onFrequencyEntryPressed.bind(this)}
          />
        </div>
        <div class="find-frequency-dialog-input-row">
          <UiImgTouchButton
            label={'Cancel'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`}
            onPressed={this.onBackButtonPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            label={'Enter'}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            isEnabled={this.inputValid}
            focusController={this.focusController}
            onPressed={this.onAddFrequency.bind(this)}
            class='find-frequency-dialog-action-button'
          />
        </div>
      </div>
    );
  }
}
