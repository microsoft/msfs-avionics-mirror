import { VNode, FSComponent, Subject, SimVarValueType, ComSpacing, RadioFrequencyFormatter } from '@microsoft/msfs-sdk';
import { TouchButton } from '@microsoft/msfs-garminsdk';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogView, GtcDialogResult } from './GtcDialogView';
import './GtcLoadFrequencyDialog.css';

/** A type of radio. */
type RadioType = 'NAV' | 'COM';

/** A request input for {@link GtcLoadFrequencyDialog}. */
export type GtcLoadFrequencyDialogInput = {
  /** The radio type to load the frequency to. */
  type: RadioType;

  /** The COM channel spacing mode to use. Ignored if `type` is not `COM`. Defaults to 25 kHz. */
  comChannelSpacing?: ComSpacing;

  /** The frequency, in megahertz, to be loaded. */
  frequency: number;

  /** The label to show after the frequency. */
  label: string;
};

/**
 * A GTC dialog view which allows the user to load a frequency into a radio.
 */
export class GtcLoadFrequencyDialog extends GtcView implements GtcDialogView<GtcLoadFrequencyDialogInput, void> {
  private static readonly NAV_FORMATTER = RadioFrequencyFormatter.createNav();
  private static readonly COM_25_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing25Khz);
  private static readonly COM_833_FORMATTER = RadioFrequencyFormatter.createCom(ComSpacing.Spacing833Khz);

  private thisNode?: VNode;

  private readonly panelTitle = Subject.create('');
  private readonly radioType = Subject.create<RadioType>('NAV');

  private input?: GtcLoadFrequencyDialogInput;

  private resolveFunction?: (value: GtcDialogResult<void>) => void;
  private resultObject: GtcDialogResult<void> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Load Frequency');
  }

  /** @inheritdoc */
  public request(input: GtcLoadFrequencyDialogInput): Promise<GtcDialogResult<void>> {
    if (!this.isAlive) {
      throw new Error('GtcLoadFrequencyDialog: cannot request from a dead dialog');
    }

    return new Promise<GtcDialogResult<void>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.input = input;
      this.radioType.set(input.type);

      const formatter = input.type === 'NAV'
        ? GtcLoadFrequencyDialog.NAV_FORMATTER
        : input.comChannelSpacing === ComSpacing.Spacing833Khz
          ? GtcLoadFrequencyDialog.COM_833_FORMATTER
          : GtcLoadFrequencyDialog.COM_25_FORMATTER;

      this.panelTitle.set(`Load ${formatter(input.frequency * 1e6)} ${input.label} to:`);
    });
  }

  /** @inheritDoc */
  public onResume(): void {
    //
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /**
   * Clears this dialog's message and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="load-frequency-dialog gtc-panel">
        <div class="gtc-panel-title-large">{this.panelTitle}</div>
        <div class="load-panels">
          {this.renderLoadPanel(1)}
          {this.renderLoadPanel(2)}
        </div>
        <TouchButton class="favorites-button" isEnabled={false}>
          <img src="coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_favorites.png" class="star-icon" />
          <div class="touch-button-label">Add to Favorites</div>
        </TouchButton>
      </div>
    );
  }

  /**
   * Renders a radio load panel.
   * @param index The radio index.
   * @returns The radio load panel.
   */
  private renderLoadPanel(index: 1 | 2): VNode {
    return (
      <div class="gtc-panel">
        <div class="gtc-panel-title">{this.radioType.map(x => `${x}${index}`)}</div>
        <div class="column">
          <TouchButton
            label="Active"
            onPressed={() => this.handlePressed(index, false)}
          />
          <TouchButton
            label="Standby"
            onPressed={() => this.handlePressed(index, true)}
          />
        </div>
      </div>
    );
  }

  /**
   * Handles a load button being pressed.
   * @param index The radio index.
   * @param isStandby Whether this is standby radio or not.
   */
  private handlePressed(index: 1 | 2, isStandby: boolean): void {
    if (this.input?.frequency) {
      if (this.input.type === 'COM') {
        const indexStr = index === 1 ? '' : '2';
        SimVar.SetSimVarValue(`K:COM${indexStr}_STBY_RADIO_SET_HZ`, SimVarValueType.Number, this.input.frequency * 1_000_000);
      } else {
        SimVar.SetSimVarValue(`K:NAV${index}_STBY_SET_HZ`, SimVarValueType.Number, this.input.frequency * 1_000_000);
      }
      if (!isStandby) {
        SimVar.SetSimVarValue(`K:${this.input.type}${index}_RADIO_SWAP`, 'number', 0);
      }
    }

    this.resultObject = {
      payload: undefined,
      wasCancelled: false,
    };

    this.props.gtcService.goBack();
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}