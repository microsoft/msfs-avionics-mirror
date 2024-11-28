import { DisplayComponent, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { TerrainSystemStateDataProvider, TerrainSystemType, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { ControllableDisplayPaneIndex, G3000MapUserSettingTypes, TerrainSystemConfig } from '@microsoft/msfs-wtg3000-common';

import { TerrainSettingsDisplay } from '../../Components/Terrain/TerrainSettingsDisplay';
import { GtcMapRangeSettingSelectButton } from '../../Components/TouchButton/GtcMapRangeSettingSelectButton';
import { GtcToggleTouchButton } from '../../Components/TouchButton/GtcToggleTouchButton';
import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcGenericView } from '../../GtcService/GtcGenericView';
import { GtcControlMode, GtcService, GtcViewLifecyclePolicy } from '../../GtcService/GtcService';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';

import './GtcMapTerrainSettingsPopup.css';

/**
 * GTC view keys for popups owned by the map terrain settings popup.
 */
enum GtcMapTerrainSettingsPopupKeys {
  MapTerrainSettingsMapSettings = 'MapTerrainSettingsMapSettings'
}

/**
 * Component props for {@link GtcMapTerrainSettingsPopup}.
 */
export interface GtcMapTerrainSettingsPopupProps extends GtcViewProps {
  /** A terrain system config object. */
  terrainConfig: TerrainSystemConfig;

  /** A provider of terrain system state data. */
  terrainSystemStateDataProvider: TerrainSystemStateDataProvider;

  /** A manager for map user settings used to retrieve the popup's displayed setting values. */
  mapReadSettingManager: UserSettingManager<G3000MapUserSettingTypes>;

  /**
   * A function which writes selected setting values. If not defined, selected values will be written to settings
   * retrieved from `mapReadSettingManager`.
   */
  writeToSetting?: <K extends keyof G3000MapUserSettingTypes & string>(settingName: K, value: NonNullable<G3000MapUserSettingTypes[K]>) => void;
}

/**
 * A GTC map terrain settings popup.
 */
export class GtcMapTerrainSettingsPopup extends GtcView<GtcMapTerrainSettingsPopupProps> {
  private readonly settingsDisplay = FSComponent.createRef<TerrainSettingsDisplay>();
  private readonly mapSettingsButton = FSComponent.createRef<GtcTouchButton>();

  /** @inheritDoc */
  public onAfterRender(): void {
    let titlePrefix: string;
    switch (this.props.terrainConfig.type) {
      case TerrainSystemType.TawsA:
      case TerrainSystemType.TawsB:
        titlePrefix = 'TAWS';
        break;
      default:
        titlePrefix = 'Terrain';
    }

    this._title.set(`${titlePrefix} Settings`);

    this.props.gtcService.registerView(
      GtcViewLifecyclePolicy.Transient,
      GtcMapTerrainSettingsPopupKeys.MapTerrainSettingsMapSettings,
      this.props.controlMode,
      this.renderMapSettingsPopup.bind(this),
      this.props.displayPaneIndex
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='map-terrain-settings-popup gtc-popup-panel'>
        {this.props.terrainConfig.type !== null && (
          <TerrainSettingsDisplay
            ref={this.settingsDisplay}
            gtcService={this.props.gtcService}
            terrainConfig={this.props.terrainConfig}
            terrainSystemStateDataProvider={this.props.terrainSystemStateDataProvider}
          />
        )}

        <GtcTouchButton
          ref={this.mapSettingsButton}
          label={'Map<br>Settings'}
          onPressed={(): void => { this.props.gtcService.openPopup(GtcMapTerrainSettingsPopupKeys.MapTerrainSettingsMapSettings); }}
          class='map-terrain-settings-popup-map-settings-button'
        />
      </div>
    );
  }

  /**
   * Renders the terrain settings popup.
   * @param gtcService The GTC service.
   * @param controlMode The control mode to which the popup belongs.
   * @param displayPaneIndex The index of the display pane associated with the popup.
   * @returns The terrain settings popup, as a VNode.
   */
  private renderMapSettingsPopup(gtcService: GtcService, controlMode: GtcControlMode, displayPaneIndex?: ControllableDisplayPaneIndex): VNode {
    const buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

    return (
      <GtcGenericView
        gtcService={gtcService}
        controlMode={controlMode}
        displayPaneIndex={displayPaneIndex}
        title='Terrain Settings'
        onDestroy={(): void => {
          buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });
        }}
      >
        <div class='map-settings-popup map-terrain-settings-map-settings'>
          <GtcMapRangeSettingSelectButton
            ref={buttonRefs[0]}
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            unitsSettingManager={UnitsUserSettings.getManager(this.bus)}
            mapReadSettingManager={this.props.mapReadSettingManager}
            settingName={'mapTerrainRangeIndex'}
            // 1 nm to 1000 nm
            startIndex={9}
            endIndex={27}
            writeToSetting={this.props.writeToSetting}
            label={'Terrain'}
            title={'Map Terrain Range'}
            class='map-terrain-settings-map-settings-button'
          />
          <GtcToggleTouchButton
            ref={buttonRefs[1]}
            state={this.props.mapReadSettingManager.getSetting('mapTerrainScaleShow')}
            label={'Absolute Terrain\nScale'}
            onPressed={(button, state): void => {
              if (this.props.writeToSetting === undefined) {
                state.value = !state.value;
              } else {
                this.props.writeToSetting('mapTerrainScaleShow', !state.value);
              }
            }}
            class='map-terrain-settings-map-settings-button'
          />
        </div>
      </GtcGenericView>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.settingsDisplay.getOrDefault()?.destroy();
    this.mapSettingsButton.getOrDefault()?.destroy();

    super.destroy();
  }
}
