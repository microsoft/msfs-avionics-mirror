import { DisplayComponent, FSComponent, UserSetting, UserSettingManager, UserSettingValueFilter, VNode } from '@microsoft/msfs-sdk';

import { MapUtils, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { G3000MapUserSettingTypes, MapRangeSettingDisplay } from '@microsoft/msfs-wtg3000-common';

import { ListDialogItemDefinition } from '../../Dialog/GtcListDialog';
import { GtcService } from '../../GtcService/GtcService';
import { GtcListSelectTouchButton, GtcListSelectTouchButtonProps } from './GtcListSelectTouchButton';

/**
 * Component props for GtcMapRangeSelectButton.
 */
export interface GtcMapRangeSettingSelectButtonProps
  extends Omit<GtcListSelectTouchButtonProps<UserSetting<number>>, 'state' | 'listParams'> {

  /** The GTC service. */
  gtcService: GtcService;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A manager for map user settings used to retrieve the displayed setting value. */
  mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;

  /** The name of the bound setting. */
  settingName: keyof UserSettingValueFilter<G3000MapUserSettingTypes, number>;

  /** The index of the smallest selectable map range, inclusive. */
  startIndex: number;

  /** The index of the largest selectable map range, inclusive. */
  endIndex: number;

  /**
   * A function which writes the selected value to the setting. If not defined, selected values will be written to
   * the setting retrieved from `mapReadSettingManager`.
   */
  writeToSetting?: <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>) => void;

  /** The title of the selection list dialog. */
  title?: string;

  /** CSS class(es) to apply to the selection list dialog when opened. */
  dialogCssClass?: string;
}

/**
 * A touchscreen button which displays the value of a map range setting and when pressed, opens a selection list dialog
 * to set the value of the setting.
 */
export class GtcMapRangeSettingSelectButton extends DisplayComponent<GtcMapRangeSettingSelectButtonProps> {
  private readonly buttonRef = FSComponent.createRef<GtcListSelectTouchButton<UserSetting<number>>>();

  private readonly writeToSetting = this.props.writeToSetting ?? (
    <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>): void => {
      this.props.mapReadSettingManager.getSetting(settingName).value = value;
    }
  );

  private readonly mapRangeArray = this.props.unitsSettingManager.getSetting('unitsDistance').map(mode => MapUtils.nextGenMapRanges(mode));

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GtcListSelectTouchButton
        ref={this.buttonRef}
        gtcService={this.props.gtcService}
        listDialogKey={this.props.listDialogKey}
        state={this.props.mapReadSettingManager.getSetting(this.props.settingName)}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        renderValue={
          <MapRangeSettingDisplay
            rangeIndex={this.props.mapReadSettingManager.getSetting(this.props.settingName)}
            rangeArray={this.mapRangeArray}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          />
        }
        listParams={{
          title: this.props.title,
          inputData: Array.from({ length: this.props.endIndex - this.props.startIndex + 1 }, (v, index): ListDialogItemDefinition<number> => {
            const value = index + this.props.startIndex;

            return {
              value,
              labelRenderer: (): VNode => {
                return (
                  <MapRangeSettingDisplay
                    rangeIndex={value}
                    rangeArray={this.mapRangeArray}
                    displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                  />
                );
              }
            };
          }),
          selectedValue: this.props.mapReadSettingManager.getSetting(this.props.settingName),
          class: this.props.dialogCssClass
        }}
        onSelected={(value): void => {
          this.writeToSetting(this.props.settingName, value);
        }}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.mapRangeArray.destroy();

    super.destroy();
  }
}