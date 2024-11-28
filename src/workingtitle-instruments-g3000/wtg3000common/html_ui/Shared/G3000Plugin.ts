import { AvionicsPlugin, EventBus, FacilityLoader, FlightPathCalculator, InstrumentBackplane, VNode } from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { AvionicsConfig } from './AvionicsConfig/AvionicsConfig';
import { G3000ChecklistSetDef } from './Checklist/G3000ChecklistDefinition';
import { G3000ChecklistStateProvider } from './Checklist/G3000ChecklistStateProvider';
import { G3000FlightPlannerId } from './CommonTypes';
import { FmsSpeedUserSettingManager } from './Settings/FmsSpeedUserSettings';
import { PfdSensorsUserSettingManager } from './Settings/PfdSensorsUserSettings';
import { VSpeedUserSettingManager } from './Settings/VSpeedUserSettings';
import { WeightBalanceUserSettingManager } from './Settings/WeightBalanceUserSettings';
import { DisplayOverlayController } from './DisplayOverlay/DisplayOverlayController';

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

  /** A controller for the overlay layer on the plugin's parent display. */
  displayOverlayController: DisplayOverlayController;

  /** A manager for PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** A manager for reference V-speed user settings. */
  vSpeedSettingManager: VSpeedUserSettingManager;

  /** A manager for FMS speed user settings. */
  fmsSpeedsSettingManager?: FmsSpeedUserSettingManager;

  /** A manager for weight and balance user settings. */
  weightBalanceSettingManager?: WeightBalanceUserSettingManager;
}

/**
 * A G3000 plugin.
 */
export interface G3000Plugin<Binder extends G3000PluginBinder = G3000PluginBinder> extends AvionicsPlugin<Binder> {
  /**
   * Lifecycle method called during instrument initialization.
   */
  onInit(): void;

  /**
   * Renders components to the display overlay.
   * @returns A VNode to render to the display overlay, or `null` to render nothing.
   */
  renderToDisplayOverlay?(): VNode | null;

  /**
   * Gets a checklist definition to be used by the electronic checklist system.
   * @returns A checklist definition, or `undefined` if checklists are not to be supported.
   */
  getChecklistDef?(): G3000ChecklistSetDef | undefined;

  /**
   * Lifecycle method called when the electronic checklist system is initialized.
   * @param checklistDef The checklist definition used by the checklist system, or `undefined` if checklists are not
   * supported.
   * @param checklistStateProvider A provider of checklist state, or `undefined` if checklists are not supported.
   */
  onChecklistInit?(checklistDef: G3000ChecklistSetDef | undefined, checklistStateProvider?: G3000ChecklistStateProvider): void;
}
