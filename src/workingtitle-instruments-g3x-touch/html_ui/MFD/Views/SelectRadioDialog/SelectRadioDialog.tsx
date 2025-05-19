import { FSComponent, RadioType, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XRadiosDataProvider } from '../../../Shared/Radio/G3XRadiosDataProvider';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';

import './SelectRadioDialog.css';

/**
 * Component props for {@link SelectRadioDialog}.
 */
export interface SelectRadioDialogProps extends UiViewProps {
  /** A provider of radio data. */
  radiosDataProvider: G3XRadiosDataProvider;
}

/**
 * A request input for {@link SelectRadioDialog}.
 */
export interface SelectRadioDialogInput {
  /** The type of radio for the user to select. */
  radioType: RadioType.Com | RadioType.Nav;

  /** The name of the frequency to display. */
  frequencyName: string;

  /** The frequency to display. */
  frequencyText: string;
}

/**
 * A dialog that allows the user to select between the COM1 and COM2 radios or the NAV1 and NAV2 radios.
 */
export class SelectRadioDialog extends AbstractUiView<SelectRadioDialogProps> implements UiDialogView<SelectRadioDialogInput, 1 | 2> {
  private readonly radioType = Subject.create<RadioType.Com | RadioType.Nav>(RadioType.Com);

  private readonly radioTypeText = this.radioType.map(type => {
    return type === RadioType.Nav ? 'NAV' : 'COM';
  });

  private readonly isRadioPowered = [Subject.create(false), Subject.create(false)];
  private readonly radioPipes: Subscription[] = [];

  private readonly frequencyName = Subject.create('');

  private readonly frequencyText = Subject.create('');

  private resolveFn?: (output: UiDialogResult<1 | 2>) => void;
  private resultObject: UiDialogResult<1 | 2> = {
    wasCancelled: true
  };

  /** @inheritDoc */
  public request(input: SelectRadioDialogInput): Promise<UiDialogResult<1 | 2>> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.resultObject = { wasCancelled: true };

      this.radioType.set(input.radioType);

      for (const pipe of this.radioPipes) {
        pipe.destroy();
      }
      this.radioPipes.length = 0;

      const dataProviders = input.radioType === RadioType.Nav
        ? this.props.radiosDataProvider.navRadioDataProviders
        : this.props.radiosDataProvider.comRadioDataProviders;

      for (const index of [1, 2] as const) {
        const dataProvider = dataProviders[index];
        if (dataProvider) {
          this.radioPipes.push(
            dataProvider.isPowered.pipe(this.isRadioPowered[index - 1])
          );
        } else {
          this.isRadioPowered[index - 1].set(false);
        }
      }

      this.frequencyName.set(input.frequencyName);
      this.frequencyText.set(input.frequencyText);
    });
  }

  /** @inheritDoc */
  public onClose(): void {
    this.closeRequest();
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private closeRequest(): void {
    for (const pipe of this.radioPipes) {
      pipe.destroy();
    }
    this.radioPipes.length = 0;

    const resolve = this.resolveFn;
    this.resolveFn = undefined;
    resolve && resolve(this.resultObject);
  }

  /** Handles when the cancel button is pressed. */
  private handleCancelPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /**
   * Handles when a radio button is pressed.
   * @param index The index of the radio that was selected.
   */
  private handleRadioButtonPressed(index: 1 | 2): void {
    this.resultObject = { wasCancelled: false, payload: index };
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="select-radio-dialog ui-view-panel">
        <div class="ui-view-panel-title">Select {this.radioTypeText} Radio</div>

        <div class="select-radio-dialog-frequency">
          <span class="select-radio-dialog-frequency-name">{this.frequencyName}</span>
          <span class="select-radio-dialog-frequency-mhz">{this.frequencyText}</span>
        </div>

        <div class="select-radio-dialog-radios">
          {this.renderRadioButtons()}
        </div>

        <div class="select-radio-dialog-bottom">
          <UiImgTouchButton
            label="Cancel"
            onPressed={this.handleCancelPressed.bind(this)}
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`}
            class="ui-nav-button"
          />
        </div>
      </div>
    );
  }

  /**
   * Builds the radio buttons for this dialog.
   * @returns The radio button VNodes.
   */
  private renderRadioButtons(): VNode[] {
    const radioButtons: VNode[] = [];

    for (let i = 1; i <= 2; i++) {
      radioButtons.push(
        <UiTouchButton
          label={this.radioTypeText.map(type => `${type} ${i}`)}
          isEnabled={this.isRadioPowered[i - 1]}
          onPressed={this.handleRadioButtonPressed.bind(this, i as 1 | 2)}
        />
      );
    }

    return radioButtons;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.closeRequest();

    super.destroy();
  }
}
