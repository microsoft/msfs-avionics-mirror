import { registerPlugin } from '@microsoft/msfs-sdk';

import { G1000AvionicsPlugin } from '@microsoft/msfs-wtg1000';

import { Sr22tElectricalSystem } from './Sr22tElectricalSystem';
import { Sr22tEngineComputer } from './Sr22tEngineComputer';
import { Sr22tLightsSystem } from './Sr22tLightsSystem';
import { Sr22tYawDamperSystem } from './Sr22tYawDamperSystem';

/**
 * A plugin which configures the SR22T's System Pages plugin.
 */
export class Sr22tEcuPlugin extends G1000AvionicsPlugin {

  private readonly ecu = new Sr22tEngineComputer(this.binder.bus);
  private readonly electrical = new Sr22tElectricalSystem(this.binder.bus);
  private readonly yawDamperSystem = new Sr22tYawDamperSystem(this.binder.bus);
  private readonly haloLightsSystem = new Sr22tLightsSystem(this.binder.bus);

  /** @inheritDoc */
  public onInstalled(): void {
    //NOOP
  }
}

registerPlugin(Sr22tEcuPlugin);
