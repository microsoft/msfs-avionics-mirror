import { EventBus, UserSettingManager } from '@microsoft/msfs-sdk';
import { DateTimeUserSettings, DateTimeUserSettingTypes, TrafficUserSettings, TrafficUserSettingTypes, UnitsUserSettingManager, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { GeneralSettings, GeneralUserSettingsManager } from './GeneralSettingsProvider';
import { MapSettingsProvider } from './MapSettingsProvider';
import { ArcMapFieldsSettingsProvider } from './ArcMapFieldsSettingsProvider';
import { StandardNavMapDataFieldsSettingsProvider } from './StandardNavMapFieldsSettingsProvider';
import { WT430NavInfoFieldsSettingsProvider } from './WT430NavInfoFieldsSettingsProvider';
import { GnsVnavSettingsManager } from '../Navigation/Vnav/GnsVnavSettings';
import { GpsSettingsProvider } from './GpsSettingsProvider';

/**
 * A settings provider that provides access to all settings for the GNS units.
 */
export class GNSSettingsProvider {

  /**
   * General settings manager
   */
  public readonly generalSettings: UserSettingManager<GeneralSettings>;

  /**
   * A provider for map settings.
   */
  public readonly map: MapSettingsProvider;

  public readonly units: UnitsUserSettingManager;

  public readonly time: UserSettingManager<DateTimeUserSettingTypes>;

  public readonly arcMapFields: ArcMapFieldsSettingsProvider;

  public readonly standardNavMapFields: StandardNavMapDataFieldsSettingsProvider;

  public readonly wt430navInfoFields: WT430NavInfoFieldsSettingsProvider;

  public readonly traffic: UserSettingManager<TrafficUserSettingTypes>;

  public readonly gps: GpsSettingsProvider;

  public readonly vnav: GnsVnavSettingsManager;

  /**
   * Creates an instance of the GNSSettingsProvider.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    this.generalSettings = GeneralUserSettingsManager.getManager(bus);
    this.map = new MapSettingsProvider(bus);
    this.units = UnitsUserSettings.getManager(bus);
    this.time = DateTimeUserSettings.getManager(bus);
    this.arcMapFields = new ArcMapFieldsSettingsProvider(bus);
    this.standardNavMapFields = new StandardNavMapDataFieldsSettingsProvider(bus);
    this.wt430navInfoFields = new WT430NavInfoFieldsSettingsProvider(bus);
    this.traffic = TrafficUserSettings.getManager(bus);
    this.gps = new GpsSettingsProvider(bus);
    this.vnav = GnsVnavSettingsManager.getManager(bus);
  }
}