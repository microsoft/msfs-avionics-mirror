/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import { FmcUserSettings } from '../../FMC/FmcUserSettings';
import { MFDUserSettings } from '../../MFD/MFDUserSettings';
import { PFDUserSettings } from '../../PFD/PFDUserSettings';
import { MapUserSettings } from '../Map/MapUserSettings';
import { VSpeedType } from '../ReferenceSpeeds';
import { TrafficUserSettings } from '../Traffic/TrafficUserSettings';
import { DefaultsUserSettings } from './DefaultsUserSettings';
import { FgpUserSettings } from './FgpUserSettings';
import { RefsUserSettings } from './RefsUserSettings';
import { VSpeedUserSettings } from './VSpeedUserSettings';
import { CJ4UserSettings } from './CJ4UserSettings';

/** A manager for WT21 settings which are saved to pilot profiles. */
export class WT21SettingSaveManager extends UserSettingSaveManager {
  private static readonly ignoredMfdSettings = [
    'mfdSelectedTextPage_1',
    'mfdSelectedTextPage_2',
    'mfdDisplayMode_1',
    'mfdDisplayMode_2',
  ];

  /** @inheritdoc */
  constructor(bus: EventBus) {
    const PFDSettingManager = PFDUserSettings.getManager(bus);
    const MFDSettingManager = MFDUserSettings.getMasterManager(bus);
    const mapSettingManager = MapUserSettings.getMasterManager(bus);
    const fmcSettingManager = FmcUserSettings.getManager(bus);
    const defaultsSettingManager = DefaultsUserSettings.getManager(bus);
    const fgpSettingManager = FgpUserSettings.getManager(bus);
    const refsSettingManager = RefsUserSettings.getManager(bus);
    const vspeedSettingManager = new VSpeedUserSettings(bus);
    const trafficSettingManager = TrafficUserSettings.getManager(bus);
    const cj4UserSettingsManager = CJ4UserSettings.getManager(bus);

    const vspeedValueSettings = [
      vspeedSettingManager.getSettings(VSpeedType.V1).get('value')!,
      vspeedSettingManager.getSettings(VSpeedType.V2).get('value')!,
      vspeedSettingManager.getSettings(VSpeedType.Vapp).get('value')!,
      vspeedSettingManager.getSettings(VSpeedType.Venr).get('value')!,
      vspeedSettingManager.getSettings(VSpeedType.Vr).get('value')!,
      vspeedSettingManager.getSettings(VSpeedType.Vref).get('value')!,
    ];

    const settings = [
      ...PFDSettingManager.getAllSettings(),
      ...MFDSettingManager.getAllSettings().filter(setting => !WT21SettingSaveManager.ignoredMfdSettings.includes(setting.definition.name)),
      ...mapSettingManager.getAllSettings().filter(setting => setting.definition.name !== 'mapExtended'),
      ...fmcSettingManager.getAllSettings().filter(setting => setting.definition.name !== 'flightNumber'),
      ...defaultsSettingManager.getAllSettings(),
      ...fgpSettingManager.getAllSettings().filter(setting => !setting.definition.name.includes('VorTuningMode')),
      ...refsSettingManager.getAllSettings().filter(setting => setting.definition.name !== 'minsmode'),
      ...vspeedValueSettings,
      ...trafficSettingManager.getAllSettings().filter(setting => setting.definition.name !== 'trafficOperatingMode'),
      ...cj4UserSettingsManager.getAllSettings()
    ];

    super(settings, bus);
  }
}