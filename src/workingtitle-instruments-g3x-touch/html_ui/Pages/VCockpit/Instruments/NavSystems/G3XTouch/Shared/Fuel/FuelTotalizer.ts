import { EventBus, Instrument, SimVarValueType } from '@microsoft/msfs-sdk';

import { FuelTotalizerSimVars } from './FuelTotalizerEvents';
import { FuelTotalizerControlEvents } from './FuelTotalizerControlEvents';

/** An instrument that tracks fuel state for use by the G3X. */
export class FuelTotalizer implements Instrument {
  private fuelRemaining = 0;
  private fuelBurned = 0;
  private priorRawQty = NaN;

  /**
   * Constructor.
   * @param bus The event bus to publish / listen to.
   */
  constructor(bus: EventBus) {
    bus.getSubscriber<FuelTotalizerControlEvents>().on('fuel_totalizer_set_remaining').handle(amount => {
      this.fuelRemaining = amount;
      this.fuelBurned = 0;
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Burned, SimVarValueType.GAL, this.fuelBurned);
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Remaining, SimVarValueType.GAL, this.fuelRemaining);
    });

    bus.getSubscriber<FuelTotalizerControlEvents>().on('fuel_totalizer_set_burned').handle(amount => {
      this.fuelBurned = amount;
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Burned, SimVarValueType.GAL, this.fuelBurned);
    });
  }

  /** Initialize the instrument. */
  public init(): void {
    // noop
  }

  /** Perform events for the update loop. */
  public onUpdate(): void {
    const currentRawQty = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', SimVarValueType.GAL);
    const burned = this.priorRawQty - currentRawQty;
    this.priorRawQty = currentRawQty;

    if (!isNaN(burned) && burned > 0) {
      this.fuelBurned += burned;
      this.fuelRemaining -= burned;
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Burned, SimVarValueType.GAL, this.fuelBurned);
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Remaining, SimVarValueType.GAL, this.fuelRemaining);
    }
  }
}