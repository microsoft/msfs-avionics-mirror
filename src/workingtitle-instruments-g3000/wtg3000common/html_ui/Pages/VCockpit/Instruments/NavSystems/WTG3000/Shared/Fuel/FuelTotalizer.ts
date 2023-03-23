import { EventBus, Instrument, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/** Events with which to control the {@link FuelTotalizer}. */
export interface FuelTotalizerControlEvents {
  /** Commands the fuel computer to set a new amount. */
  fuel_totalizer_set_remaining: number;
}

/** Simvars to publish. */
enum FuelTotalizerSimVars {
  Burned = 'L:WT3000_Fuel_Burned',
  Remaining = 'L:WT3000_Fuel_Remaining',
}

/**
 * Events related to the fuel totalizer.
 */
export interface FuelTotalizerEvents {
  /** The amount of fuel burned, in gallons. */
  fuel_totalizer_burned: number;

  /** The amount of fuel remaining, in gallons. */
  fuel_totalizer_remaining: number;
}

/**
 * A publisher for fuel totalizer events.
 */
export class FuelTotalizerSimVarPublisher extends SimVarPublisher<FuelTotalizerEvents> {
  private static simvars = new Map<keyof FuelTotalizerEvents, SimVarDefinition>([
    ['fuel_totalizer_burned', { name: FuelTotalizerSimVars.Burned, type: SimVarValueType.GAL }],
    ['fuel_totalizer_remaining', { name: FuelTotalizerSimVars.Remaining, type: SimVarValueType.GAL }],
  ]);

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(bus: EventBus) {
    super(FuelTotalizerSimVarPublisher.simvars, bus);
  }
}

/** An instrument that tracks fuel state for use by the G3000. */
export class FuelTotalizer implements Instrument {
  private fuelRemaining = 0;
  private fuelBurned = 0;
  private priorRawQty = 0;

  // eslint-disable-next-line jsdoc/require-jsdoc
  constructor(bus: EventBus) {
    bus.getSubscriber<FuelTotalizerControlEvents>().on('fuel_totalizer_set_remaining').handle(amount => {
      this.fuelRemaining = amount;
      this.fuelBurned = 0;
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Burned, SimVarValueType.GAL, this.fuelBurned);
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Remaining, SimVarValueType.GAL, this.fuelRemaining);
    });
  }

  /** Initialize the instrument. */
  public init(): void {/**/ }

  /** Perform events for the update loop. */
  public onUpdate(): void {
    const currentRawQty = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', SimVarValueType.GAL);
    if (currentRawQty < this.priorRawQty) {
      const burned: number = this.priorRawQty - currentRawQty;
      this.fuelBurned += burned;
      this.fuelRemaining -= burned;
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Burned, SimVarValueType.GAL, this.fuelBurned);
      SimVar.SetSimVarValue(FuelTotalizerSimVars.Remaining, SimVarValueType.GAL, this.fuelRemaining);
    }
    this.priorRawQty = currentRawQty;
  }
}