import { EventBus } from '@microsoft/msfs-sdk';

import { Fms, GarminPrematureDescentModule, GarminTawsAlert, GarminTawsInhibit, TerrainSystemModule } from '@microsoft/msfs-garminsdk';

import { G3000FlightPlannerId } from '../CommonTypes';
import { G3000TerrainSystemType } from './G3000TerrainSystemTypes';
import { TerrainSystemModuleConfig, TerrainSystemModuleInhibitFlagDef, TerrainSystemModulePrimaryInhibitFlagDef } from './TerrainSystemModuleConfig';

/**
 * A configuration object which defines options related to premature descent (PDA) alerts.
 */
export class PrematureDescentConfig implements TerrainSystemModuleConfig {
  /** @inheritDoc */
  public readonly isResolvableConfig = true;

  /** @inheritDoc */
  public readonly primaryInhibitFlagDefs: Readonly<TerrainSystemModulePrimaryInhibitFlagDef>[] = [{
    alerts: [GarminTawsAlert.PdaCaution],
    inhibitFlag: GarminTawsInhibit.FltaPda,
    settingsPageUid: GarminTawsInhibit.FltaPda,
    settingsPageLabelText: 'TAWS\nInhibit',
    settingsPagePriority: 0,
    onlyToggleWhenTriggered: false,
    alertPopupLabel: 'Inhibit TAWS'
  }];

  /** @inheritDoc */
  public readonly secondaryInhibitFlagDefs: Readonly<TerrainSystemModuleInhibitFlagDef>[] = [];

  /**
   * Creates a new PrematureDescentConfig.
   * @param type The terrain system type for which to create the configuration object.
   * @param element A configuration document element from which to parse options. If not defined, then default options
   * based on the terrain system type will be used.
   */
  public constructor(type: G3000TerrainSystemType, element?: Element) {
    if (element) {
      if (element.tagName !== 'Pda') {
        throw new Error(`Invalid PrematureDescentConfig definition: expected tag name 'Pda' but was '${element.tagName}'`);
      }
    }
  }

  /** @inheritDoc */
  public resolve(): (bus: EventBus, fms: Fms<G3000FlightPlannerId>) => TerrainSystemModule {
    return (): TerrainSystemModule => {
      return new GarminPrematureDescentModule({
        inhibitFlags: [GarminTawsInhibit.FltaPda]
      });
    };
  }
}
