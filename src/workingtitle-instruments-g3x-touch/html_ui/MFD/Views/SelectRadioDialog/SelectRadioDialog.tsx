import { FSComponent, RadioType, Subject, VNode } from '@microsoft/msfs-sdk';

import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';

import './SelectRadioDialog.css';

// TODO: We have no references for what this dialog looks like. It will need to be fixed and cleaned up when we get some references.

/**
 * A request input for {@link SelectRadioDialog}.
 */
export interface SelectRadioDialogInput {
  /** The type of radio for the user to select. */
  radioType: 'COM' | 'NAV';

  /** The name of the frequency to display. */
  frequencyName: string;

  /** The frequency to display. */
  frequencyText: string;
}

/**
 * Select COM/NAV Radio dialog
 */
export class SelectRadioDialog extends AbstractUiView implements UiDialogView<SelectRadioDialogInput, 1 | 2> {
  private readonly radioType = Subject.create<'COM' | 'NAV'>('COM');

  private readonly radioTypeDisplay = this.radioType.map((it) => {
    switch (it) {
      case RadioType.Com: return 'COM';
      case RadioType.Nav: return 'NAV';
      default: throw new Error(`Invalid radio type '${it}' for SelectRadioDialog`);
    }
  });

  private readonly frequencyName = Subject.create('');

  private readonly frequencyText = Subject.create('');

  private resolveFn?: (output: UiDialogResult<1 | 2>) => void;
  private resultObject?: UiDialogResult<1 | 2>;

  /** @inheritDoc */
  public request(input: SelectRadioDialogInput): Promise<UiDialogResult<1 | 2>> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.resultObject = { wasCancelled: true };

      this.radioType.set(input.radioType);
      this.frequencyName.set(input.frequencyName);
      this.frequencyText.set(input.frequencyText);
    });
  }

  /** @inheritDoc */
  public override onClose(): void {
    super.onClose();

    const result = this.resultObject ?? { wasCancelled: true };
    const resolve = this.resolveFn;

    this.resolveFn = undefined;
    this.resultObject = undefined;

    resolve && resolve(result);
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

  /**
   * Builds the radio buttons for this dialog.
   * @returns The radio button VNodes.
   */
  private buildRadioButtons(): VNode {
    const radioButtons: VNode[] = [];

    for (let i = 1; i <= 2; i++) {
      radioButtons.push(
        <UiTouchButton
          label={this.radioTypeDisplay.map(type => `${type} ${i}`)}
          onPressed={() => this.handleRadioButtonPressed(i as 1 | 2)}
        />
      );
    }

    return (
      <>
        {...radioButtons}
      </>
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="select-radio-dialog ui-view-panel">
        <div class="ui-view-panel-title">Select {this.radioTypeDisplay} Radio</div>

        <div class="select-radio-dialog-frequency">
          <span class="select-radio-dialog-frequency-name">{this.frequencyName}</span>
          <span class="select-radio-dialog-frequency-mhz">{this.frequencyText}</span>
        </div>

        <div class="select-radio-dialog-radios">
          {this.buildRadioButtons()}
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
}
