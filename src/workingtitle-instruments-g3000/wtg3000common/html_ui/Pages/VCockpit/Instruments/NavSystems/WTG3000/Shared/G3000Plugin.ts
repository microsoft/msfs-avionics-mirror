import { AvionicsPlugin, EventBus, FacilityLoader, FlightPathCalculator, InstrumentBackplane } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { G3000FlightPlannerId } from './CommonTypes';
import { FmsSpeedUserSettingManager } from './Settings/FmsSpeedUserSettings';
import { IauUserSettingManager } from './Settings/IauUserSettings';
import { VSpeedUserSettingManager } from './Settings/VSpeedUserSettings';

/**
 * A plugin binder for G3000 plugins.
 */
export interface G3000PluginBinder {
  /** The event bus. */
  bus: EventBus;

  /** The backplane instance. */
  backplane: InstrumentBackplane;

  /** The avionics configuration. */
  config: AvionicsConfig;

  /** The facility loader. */
  facLoader: FacilityLoader;

  /** The lateral flight plan path calculator. */
  flightPathCalculator: FlightPathCalculator;

  /** The FMS instance. */
  fms: Fms<G3000FlightPlannerId>;

  /** A manager for IAU user settings. */
  iauSettingManager: IauUserSettingManager;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** A manager for FMS speed user settings. */
  fmsSpeedsSettingManager?: FmsSpeedUserSettingManager;
}

/**
 * A G3000 plugin.
 */
export interface G3000Plugin<Binder extends G3000PluginBinder = G3000PluginBinder> extends AvionicsPlugin<Binder> {
  /**
   * Lifecycle method called during instrument initialization.
   */
  onInit(): void;
}