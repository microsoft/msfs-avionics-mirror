import { EventBus, UserSettingManager } from '@microsoft/msfs-sdk';

import {
  EngineIndicationDisplayMode, MapSettingsMfdAliased, MapUserSettings, MemButtonState, MfdDisplayMode, MFDSettingsAliased, MFDUpperWindowState
} from '@microsoft/msfs-wt21-shared';

import { CcpControlEvents } from './CcpControlEvents';
import { CcpEvent } from './CcpEvent';
import { CcpEventPublisherType } from './CcpEventPublisher';

/** Cursor Control Panel Controller. */
export class CcpController {
  private sysState: CcpControlEvents['ccp_sys_state'] = 'off';

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(
    private readonly bus: EventBus,
    private readonly mapSettingsManager: UserSettingManager<MapSettingsMfdAliased>,
    private readonly mfdSettingManager: UserSettingManager<MFDSettingsAliased>,
    private readonly ccpControlEventsPublisher = bus.getPublisher<CcpControlEvents>(),
  ) {
    const ccpEvents = this.bus.getSubscriber<CcpEventPublisherType>();

    ccpEvents.on('ccpEvent')
      .handle((event: CcpEvent): void => {
        switch (event) {
          case CcpEvent.CCP_ENG: this.handleEngButtonPress(); break;
          case CcpEvent.CCP_TFC: this.handleTfcButtonPress(); break;
          case CcpEvent.CCP_SYS: this.handleSysButtonPress(); break;
          case CcpEvent.CCP_TERR_WX: this.handleTerrWxButtonPress(); break;
          case CcpEvent.CCP_MEM_1: this.handleMemButtonShortPress(1); break;
          case CcpEvent.CCP_MEM_2: this.handleMemButtonShortPress(2); break;
          case CcpEvent.CCP_MEM_3: this.handleMemButtonShortPress(3); break;
          case CcpEvent.CCP_MEM_1_LONG: this.handleMemButtonLongPress(1); break;
          case CcpEvent.CCP_MEM_2_LONG: this.handleMemButtonLongPress(2); break;
          case CcpEvent.CCP_MEM_3_LONG: this.handleMemButtonLongPress(3); break;
        }
      });

    this.mfdSettingManager.whenSettingChanged('mfdUpperWindowState').handle(state => {
      if (this.mfdSettingManager.getSetting('mfdEisState').value === EngineIndicationDisplayMode.Expanded) {
        // If ENG is expanded and the UPR MENU has selected something other than OFF
        if (state !== MFDUpperWindowState.Off) {
          // Then change it to compressed
          this.handleEngButtonPress();
        }
      }
    });

    this.mfdSettingManager.whenSettingChanged('mfdEisState').handle(state => {
      this.ccpControlEventsPublisher.pub('ccp_eng_state', state);
    });
  }

  /**
   * Sets the dispatch mode displays.
   * @param isDispatch whether mfd is now in dispatch mode
   */
  public setDispatchMode(isDispatch: boolean): void {
    this.ccpControlEventsPublisher.pub('ccp_sys_state', isDispatch ? '1' : 'off');
    this.ccpControlEventsPublisher.pub('ccp_eng_state', isDispatch ? EngineIndicationDisplayMode.Expanded : this.mfdSettingManager.getSetting('mfdEisState').value);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleEngButtonPress(): void {
    const eisSetting = this.mfdSettingManager.getSetting('mfdEisState');
    const nextState = eisSetting.value == EngineIndicationDisplayMode.Compressed
      ? EngineIndicationDisplayMode.Expanded
      : EngineIndicationDisplayMode.Compressed;
    eisSetting.set(nextState);

    if (nextState === EngineIndicationDisplayMode.Expanded) {
      this.mfdSettingManager.getSetting('mfdDisplayMode').set(MfdDisplayMode.Map);
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleTfcButtonPress(): void {
    const tfcEnabledMFD = this.mapSettingsManager.getSetting('tfcEnabled');
    tfcEnabledMFD.value = !tfcEnabledMFD.value;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleSysButtonPress(): void {
    this.sysState = this.getNextSysState();
    this.ccpControlEventsPublisher.pub('ccp_sys_state', this.sysState);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private getNextSysState(): CcpControlEvents['ccp_sys_state'] {
    switch (this.sysState) {
      case 'off': return '1';
      case '1': return '2';
      case '2': return 'off';
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleTerrWxButtonPress(): void {
    const terrWxMFDSetting = this.mapSettingsManager.getSetting('terrWxState');
    const currentState = terrWxMFDSetting.value;
    const currentIndex = MapUserSettings.terrWxStates.indexOf(currentState);
    const newIndex = (currentIndex + 1) % MapUserSettings.terrWxStates.length;
    const newFormat = MapUserSettings.terrWxStates[newIndex];

    terrWxMFDSetting.value = newFormat;
  }

  /**
   * Handles short (<3 sec) presses of the memory buttons by recalling states from a preset
   * @param btnIndex The number of the memory button pressed, 1-3 (not 0-2)
   */
  private handleMemButtonShortPress(btnIndex: number): void {
    const presetString = this.mfdSettingManager
      .getSetting(`memButton${btnIndex}` as keyof MFDSettingsAliased)
      .value as string;
    const memPreset: MemButtonState = JSON.parse(presetString);

    // this.ccpControlEventsPublisher.pub('ccp_eng_state', memPreset.engineState);
    this.mfdSettingManager.getSetting('mfdUpperWindowState').value = memPreset.upperFormat;
    this.mfdSettingManager.getSetting('mfdEisState').value = memPreset.engineState;
    this.mapSettingsManager.getSetting('hsiFormat').value = memPreset.lowerFormat;
    this.mapSettingsManager.getSetting('terrWxState').value = memPreset.terrWxState;
    this.mapSettingsManager.getSetting('tfcEnabled').value = memPreset.tfcEnabled;
  }

  /**
   * Handles long (>3 sec) presses of the memory buttons by storing the current states into a setting
   * @param btnIndex The number of the memory button pressed, 1-3 (not 0-2)
   */
  private handleMemButtonLongPress(btnIndex: number): void {
    const newState: MemButtonState = {
      engineState: this.mfdSettingManager.getSetting('mfdEisState').value,
      upperFormat: this.mfdSettingManager.getSetting('mfdUpperWindowState').value,
      lowerFormat: this.mapSettingsManager.getSetting('hsiFormat').value,
      terrWxState: this.mapSettingsManager.getSetting('terrWxState').value,
      tfcEnabled: this.mapSettingsManager.getSetting('tfcEnabled').value,
    };

    this.mfdSettingManager
      .getSetting(`memButton${btnIndex}` as keyof MFDSettingsAliased)
      .value = JSON.stringify(newState);
  }
}
