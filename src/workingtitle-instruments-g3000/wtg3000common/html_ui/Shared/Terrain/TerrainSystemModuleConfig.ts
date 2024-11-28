import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, TerrainSystemModule } from '@microsoft/msfs-garminsdk';

import { ResolvableConfig } from '../Config/Config';
import { G3000FlightPlannerId } from '../CommonTypes';

/**
 * A definition for an inhibit flag used by a terrain alerting system module.
 */
export type TerrainSystemModuleInhibitFlagDef = {
  /** The alerts associated with the inhibit flag. */
  alerts: readonly string[];

  /** The inhibit flag. */
  inhibitFlag: string;

  /** The unique ID of the GTC Terrain Settings page inhibit toggle that controls the inhibit flag. */
  settingsPageUid: string;

  /** The displayed label text for the inhibit's toggle button in the GTC Terrain Settings page. */
  settingsPageLabelText: string;

  /**
   * The priority to use when determining the order in which the inhibit's toggle button should be placed in the GTC
   * Terrain Settings page. Buttons for higher priority inhibits are placed before buttons for lower priority inhibits.
   */
  settingsPagePriority: number;

  /** Whether the inhibit is only allowed to be toggled when the inhibit flag's associated alert(s) is (are) triggered. */
  onlyToggleWhenTriggered: boolean;
};

/**
 * A definition for an inhibit flag used by a terrain alerting system module.
 */
export type TerrainSystemModulePrimaryInhibitFlagDef = TerrainSystemModuleInhibitFlagDef & {
  /** The displayed label for the button to activate the inhibit flag in the GTC terrain system alert popup. */
  alertPopupLabel: string;
};

/**
 * A configuration object that defines a terrain alerting system module.
 */
export interface TerrainSystemModuleConfig extends ResolvableConfig<(bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule> {
  /** Definitions for the primary inhibit flags used by this configuration object's module. */
  readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[];

  /** Definitions for the secondary inhibit flags used by this configuration object's module. */
  readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[];
}
