import { AvionicsPlugin, EventBus } from 'msfssdk';

import { MenuSystem } from './UI/Menus/MenuSystem';
import { ViewService } from './UI/ViewService';

/**
 * A plugin binder for G1000 plugins.
 */
export interface G1000PluginBinder {
  /** The softkey menu system. */
  menuSystem: MenuSystem;

  /** The page and popup view service. */
  viewService: ViewService;

  /** The system-wide event bus. */
  bus: EventBus;
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
}