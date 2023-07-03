import { AvionicsPlugin, EventBus } from '@microsoft/msfs-sdk';

import { SoftKeyMenuSystem } from './UI/Menus/SoftKeyMenuSystem';
import { ViewService } from './UI/ViewService';
import { PageSelectMenuSystem } from '../MFD';

/**
 * A plugin binder for G1000 plugins.
 */
export interface G1000PluginBinder {
  /** The softkey menu system. */
  menuSystem: SoftKeyMenuSystem;

  /** The page and popup view service. */
  viewService: ViewService;

  /** The system-wide event bus. */
  bus: EventBus;

  /** The FMS knob menu system (only needed on the MFD, as it does not move to the PFD in reversionary mode). */
  pageSelectMenuSystem?: PageSelectMenuSystem;
}

/**
 * An avionics plugin for the G1000 NXi.
 */
export abstract class G1000AvionicsPlugin extends AvionicsPlugin<G1000PluginBinder> {

  /**
   * A lifecycle callback called when the G1000 softkey menu system has been initialized.
   */
  public abstract onMenuSystemInitialized(): void;

  /**
   * A lifecycle callback called when the G1000 page view service has been initialized.
   */
  public abstract onViewServiceInitialized(): void;

  /**
   * A lifecycle callback called when the G1000 rotary menu system has been initialized.
   */
  public abstract onPageSelectMenuSystemInitialized(): void;
}