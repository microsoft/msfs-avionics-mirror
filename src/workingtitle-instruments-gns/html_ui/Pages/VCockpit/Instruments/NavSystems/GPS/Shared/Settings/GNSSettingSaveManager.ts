import { EventBus, UserSettingSaveManager } from '@microsoft/msfs-sdk';
import { ArcMapFieldsSettingsProvider } from './ArcMapFieldsSettingsProvider';

import { GeneralUserSettingsManager } from './GeneralSettingsProvider';
import { GpsSettingsProvider } from './GpsSettingsProvider';
import { MapSettingsProvider } from './MapSettingsProvider';
import { StandardNavMapDataFieldsSettingsProvider } from './StandardNavMapFieldsSettingsProvider';
import { WT430NavInfoFieldsSettingsProvider } from './WT430NavInfoFieldsSettingsProvider';
/**
 * A manager for GNS settings.
 */
export class GNSSettingSaveManager extends UserSettingSaveManager {
  /**
   * Constructor.
   * @param bus The event bus
   */
  constructor(bus: EventBus) {
    const generalSettingsManager = GeneralUserSettingsManager.getManager(bus);


    const settings = [
      ...new ArcMapFieldsSettingsProvider(bus).getAllSettings(),
      ...generalSettingsManager.getAllSettings(),
      ...new GpsSettingsProvider(bus).getAllSettings(),
      ...new MapSettingsProvider(bus).getAllSettings(),
      ...new StandardNavMapDataFieldsSettingsProvider(bus).getAllSettings(),
      ...new WT430NavInfoFieldsSettingsProvider(bus).getAllSettings()
    ];

    super(settings, bus);
  }
}