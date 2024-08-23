import { EventBus, UserSettingSaveManager } from '@microsoft/msfs-sdk';

import { MapUserSettings } from '../Map/MapUserSettings';
import { WT21NavigationUserSettings } from '../Navigation/WT21NavigationUserSettings';
import { VSpeedType } from '../ReferenceSpeeds';
import { TrafficUserSettings } from '../Traffic/TrafficUserSettings';
import { WT21UserSettings } from './WT21UserSettings';
import { DefaultsUserSettings } from './DefaultsUserSettings';
import { FgpUserSettings } from './FgpUserSettings';
import { RefsUserSettings } from './RefsUserSettings';
import { VSpeedUserSettings } from './VSpeedUserSettings';
import { PFDUserSettings } from './PFDUserSettings';
import { MFDUserSettings } from './MFDUserSettings';
import { FmcUserSettings } from './FmcUserSettings';

/** A manager for WT21 settings which are saved to pilot profiles. */
export class WT21SettingSaveManager extends UserSettingSaveManager {
  private static readonly ignoredMfdSettings = [
    'mfdSelectedTextPage_1',
    'mfdSelectedTextPage_2',
    'mfdSoftkeyFormatChangeActive_1',
    'mfdSoftkeyFormatChangeActive_2',
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
    const userSettingsManager = WT21UserSettings.getManager(bus);
    const navigationUserSettings = WT21NavigationUserSettings.getManager(bus);

    const vspeedValueSettings = [
      vspeedSettingManager.getSettings(VSpeedType.V1).value,
      vspeedSettingManager.getSettings(VSpeedType.V2).value,
      vspeedSettingManager.getSettings(VSpeedType.Vapp).value,
      vspeedSettingManager.getSettings(VSpeedType.Venr).value,
      vspeedSettingManager.getSettings(VSpeedType.Vr).value,
      vspeedSettingManager.getSettings(VSpeedType.Vref).value,
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
      ...userSettingsManager.getAllSettings(),
      ...navigationUserSettings.getAllSettings(),
    ];

    super(settings, bus);
  }
}
