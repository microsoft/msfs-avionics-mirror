import { FSComponent, MathUtils, UserSetting, UserSettingValue, VNode } from '@microsoft/msfs-sdk';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcValueTouchButton } from '../../Components/TouchButton/GtcValueTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcToldConfigDefaultsPopup.css';
import { GtcToldFactorDialog } from './GtcToldFactorDialog';

/**
 * A description of an option of enumerated values for which {@link GtcToldConfigDefaultsPopup} can support changing
 * the default.
 */
export type GtcToldConfigDefaultsPopupEnumOption<T extends UserSettingValue> = {
  /** The name of the option. */
  name: string;

  /** The user setting that stores the default value of the option. */
  setting: UserSetting<T>;

  /** The selectable default values of the option. */
  values: readonly T[];

  /** A function which renders option values to text. */
  renderValue: (value: T) => string;
};

/**
 * A description of a factor option for which {@link GtcToldConfigDefaultsPopup} can support changing the default.
 */
export type GtcToldConfigDefaultsPopupFactorOption = {
  /** The name of the option. */
  name: string;

  /** The user setting that stores the default value of the option. */
  setting: UserSetting<number>;
};

/**
 * A description of an option for which {@link GtcToldConfigDefaultsPopup} can support changing the default.
 */
export type GtcToldConfigDefaultsPopupOption = GtcToldConfigDefaultsPopupEnumOption<any> | GtcToldConfigDefaultsPopupFactorOption;

/**
 * Component props for GtcToldConfigDefaultsPopup.
 */
export interface GtcToldConfigDefaultsPopupProps extends GtcViewProps {
  /** The options for which to support changing default values. */
  options: readonly GtcToldConfigDefaultsPopupOption[];
}

/**
 * A GTC popup which allows the user to change the default values of TOLD (takeoff/landing) performance calculation
 * configuration options.
 */
export class GtcToldConfigDefaultsPopup extends GtcView<GtcToldConfigDefaultsPopupProps> {
  private static readonly FACTOR_FORMATTER = (value: number): string => (value / 100).toFixed(2);

  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Defaults');
  }

  /**
   * Opens a dialog chain to select the default value of a factor option.
   * @param option A description of the option for which to select the default value.
   */
  private async selectFactor(option: GtcToldConfigDefaultsPopupFactorOption): Promise<void> {
    const initialValue = MathUtils.clamp(option.setting.value, 1, 999);

    const result = await this.props.gtcService.openPopup<GtcToldFactorDialog>(GtcViewKeys.ToldFactorDialog, 'normal', 'hide')
      .ref.request({
        title: option.name,
        initialValue
      });

    if (!result.wasCancelled) {
      option.setting.value = result.payload;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-config-defaults-popup'>
        {this.props.options.map(option => 'values' in option ? this.renderEnumOption(option) : this.renderFactorOption(option))}
      </div>
    );
  }

  /**
   * Renders a button for selecting the default value of an option of enumerated values.
   * @param option A description of the option for which to render the button.
   * @returns A button for selecting the default value of the specified option of enumerated values, as a VNode.
   */
  private renderEnumOption(option: GtcToldConfigDefaultsPopupEnumOption<any>): VNode {
    return (
      <GtcListSelectTouchButton
        gtcService={this.props.gtcService}
        listDialogKey={GtcViewKeys.ListDialog1}
        label={option.name}
        state={option.setting}
        renderValue={option.renderValue}
        listParams={state => {
          return {
            title: option.name,
            inputData: option.values.map(value => {
              return {
                value,
                labelRenderer: () => option.renderValue(value)
              };
            }),
            selectedValue: state
          };
        }}
        class='told-config-defaults-popup-button'
      />
    );
  }

  /**
   * Renders a button for selecting the default value of a factor option.
   * @param option A description of the option for which to render the button.
   * @returns A button for selecting the default value of the specified factor option, as a VNode.
   */
  private renderFactorOption(option: GtcToldConfigDefaultsPopupFactorOption): VNode {
    return (
      <GtcValueTouchButton
        state={option.setting}
        label={option.name}
        renderValue={GtcToldConfigDefaultsPopup.FACTOR_FORMATTER}
        onPressed={this.selectFactor.bind(this, option)}
        class='told-config-defaults-popup-button'
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}