import { AvionicsPlugin, EventBus, InstrumentBackplane, VNode } from '@microsoft/msfs-sdk';

import { SoftKeyMenuSystem } from './UI/Menus/SoftKeyMenuSystem';
import { ViewService } from './UI/ViewService';
import { PageSelectMenuSystem } from '../MFD';
import { Fms, NavIndicatorController } from '@microsoft/msfs-garminsdk';

/** A plugin binder for G1000 plugins. */
export interface G1000PluginBinder {
  /** The softkey menu system. */
  menuSystem: SoftKeyMenuSystem;

  /** The page and popup view service. */
  viewService: ViewService;

  /** The system-wide event bus. */
  bus: EventBus;

  /** The backplane instance. */
  backplane: InstrumentBackplane;

  /** The flight management system. */
  fms: Fms;

  /** The FMS knob menu system (only needed on the MFD, as it does not move to the PFD in reversionary mode). */
  pageSelectMenuSystem?: PageSelectMenuSystem;
}

/** A plugin binder for G1000 PFD plugin. */
export interface G1000PfdPluginBinder extends G1000PluginBinder {
  /** The flight management system. */
  fms: Fms;

  /** An instance of the nav indicator controller. */
  navIndicatorController: NavIndicatorController;
}

/** A plugin binder for G1000 MFD plugin. */
export interface G1000MfdPluginBinder extends G1000PluginBinder {
  /** The flight management system. */
  fms: Fms;
}

/**
 * An avionics plugin for the G1000 NXi.
 */
export abstract class G1000AvionicsPlugin<B extends G1000PluginBinder = G1000PluginBinder> extends AvionicsPlugin<B> {

  /**
   * A lifecycle callback called when the G1000 softkey menu system has been initialized.
   */
  public onMenuSystemInitialized?(): void {
    return;
  }

  /**
   * A lifecycle callback called when the G1000 page view service has been initialized.
   */
  public onViewServiceInitialized?(): void {
    return;
  }

  /**
   * A lifecycle callback called when the G1000 rotary menu system has been initialized.
   */
  public onPageSelectMenuSystemInitialized?(): void {
    return;
  }


  /**
   * Function to be overridden by plugins to render the EIS.
   * @returns null. Callback for rendering the EIS from a plugin.
   */
  public renderEIS?(): VNode | null {
    return null;
  }
}
