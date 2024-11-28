import { DisplayComponent, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { TrafficSystemType, TrafficUserSettings, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { G3000MapUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { GtcMapRangeSettingSelectButton } from '../../Components/TouchButton/GtcMapRangeSettingSelectButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { TouchButton } from '../../Components/TouchButton/TouchButton';
import { TrafficSettingsDisplay } from '../../Components/TrafficSettings/TrafficSettingsDisplay';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcMapTrafficSettingsPopup.css';

/**
 * GTC view keys for popups owned by the map traffic settings popup.
 */
enum GtcMapTrafficSettingsPopupKeys {
  MapTrafficSettingsMapSettings = 'MapTrafficSettingsMapSettings'
}

/**
 * Component props for GtcMapTrafficSettingsPopup.
 */
export interface GtcMapTrafficSettingsPopupProps extends GtcViewProps {
  /** The type of traffic system installed in the airplane. */
  trafficSystemType: TrafficSystemType;

  /** Whether the installed traffic system supports ADS-B in. */
  adsb: boolean;

  /** A manager for map user settings used to retrieve the popup's displayed setting values. */
  mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;

  /**
   * A function which writes selected setting values. If not defined, selected values will be written to settings
   * retrieved from `mapReadSettingManager`.
   */
  writeToSetting?: <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>) => void;
}

/**
 * A GTC map detail settings popup.
 */
export class GtcMapTrafficSettingsPopup extends GtcView<GtcMapTrafficSettingsPopupProps> {
  private thisNode?: VNode;

  private readonly trafficSettingManager = TrafficUserSettings.getManager(this.bus);
  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.bus);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Traffic Settings');

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcMapTrafficSettingsPopupKeys.MapTrafficSettingsMapSettings,
      this.props.controlMode,
      this.renderMapSettingsPopup.bind(this),
      this.props.displayPaneIndex
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    const mapSettingsButtonPos = this.props.trafficSystemType !== TrafficSystemType.Tis && !this.props.adsb
      ? 'map-settings-button-pos-right'
      : 'map-settings-button-pos-center';

    return (
      <div class='map-traffic-settings-popup'>
        <TrafficSettingsDisplay
          gtcService={this.props.gtcService}
          trafficSystemType={this.props.trafficSystemType}
          adsb={this.props.adsb}
          trafficSettingManager={this.trafficSettingManager}
        />
        <TouchButton
          label={'Map<br>Settings'}
          onPressed={(): void => { this.props.gtcService.openPopup(GtcMapTrafficSettingsPopupKeys.MapTrafficSettingsMapSettings); }}
          class={`map-traffic-settings-popup-map-settings-button ${mapSettingsButtonPos}`}
        />
      </div>
    );
  }

  /**
   * Renders this popup's map settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @returns This popup's map settings popup, as a VNode.
   */
  private renderMapSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode): VNode {
    const buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        title='Traffic Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-traffic-settings-map-settings'>
          <div /> {/* Empty div to get the buttons in the correct grid cells. */}
          <GtcMapRangeSettingSelectButton
            ref={buttonRefs[0]}
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            unitsSettingManager={this.unitsSettingManager}
            mapReadSettingManager={this.props.mapReadSettingManager}
            settingName={'mapTrafficRangeIndex'}
            // 1 nm to 1000 nm
            startIndex={9}
            endIndex={27}
            writeToSetting={this.props.writeToSetting}
            label={'Symbols'}
            title={'Map Traffic Symbol Range'}
            class='map-traffic-settings-map-settings-button'
          />
          <ToggleTouchButton
            ref={buttonRefs[1]}
            state={this.props.mapReadSettingManager.getSetting('mapTrafficLabelShow')}
            label={'Labels'}
            onPressed={(button, state): void => {
              if (this.props.writeToSetting === undefined) {
                state.value = !state.value;
              } else {
                this.props.writeToSetting('mapTrafficLabelShow', !state.value);
              }
            }}
            class='map-traffic-settings-map-settings-button'
          />
          <GtcMapRangeSettingSelectButton
            ref={buttonRefs[2]}
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            unitsSettingManager={this.unitsSettingManager}
            mapReadSettingManager={this.props.mapReadSettingManager}
            settingName={'mapTrafficLabelRangeIndex'}
            // 1 nm to 1000 nm
            startIndex={9}
            endIndex={27}
            writeToSetting={this.props.writeToSetting}
            label={'Labels'}
            title={'Map Traffic Label Range'}
            class='map-traffic-settings-map-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}