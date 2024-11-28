import { FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { G3000MapUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { GtcMapRangeSettingSelectButton } from '../../Components/TouchButton/GtcMapRangeSettingSelectButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { ValueTouchButton } from '../../Components/TouchButton/ValueTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcMapNexradSettingsPopup.css';

/**
 * Component props for GtcMapNexradSettingsPopup.
 */
export interface GtcMapNexradSettingsPopupProps extends GtcViewProps {
  /** A manager for map user settings used to retrieve the popup's displayed setting values. */
  mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;

  /**
   * A function which writes selected setting values. If not defined, selected values will be written to settings
   * retrieved from `mapReadSettingManager`.
   */
  writeToSetting?: <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>) => void;
}

/**
 * A GTC map NEXRAD settings popup.
 */
export class GtcMapNexradSettingsPopup extends GtcView<GtcMapNexradSettingsPopupProps> {
  private thisNode?: VNode;

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('NEXRAD Settings');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-settings-popup map-nexrad-settings'>
        <GtcMapRangeSettingSelectButton
          gtcService={this.props.gtcService}
          listDialogKey={GtcViewKeys.ListDialog1}
          unitsSettingManager={this.unitsSettingManager}
          mapReadSettingManager={this.props.mapReadSettingManager}
          settingName={'mapNexradRangeIndex'}
          // 5 nm to 1000 nm
          startIndex={13}
          endIndex={27}
          writeToSetting={this.props.writeToSetting}
          label={'NEXRAD Data'}
          title={'Map NEXRAD Range'}
          class='map-nexrad-settings-button'
        />
        <ValueTouchButton
          state={Subject.create('USA')}
          label={'NEXRAD Data'}
          isEnabled={false}
          class='map-nexrad-settings-button'
        />
        <ToggleTouchButton
          state={Subject.create(false)}
          label={'Storm Cell\nMovement'}
          isEnabled={false}
          class='map-nexrad-settings-button'
        />
        <ToggleTouchButton
          state={Subject.create(false)}
          label={'NEXRAD\nAnimation'}
          isEnabled={false}
          class='map-nexrad-settings-button'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}