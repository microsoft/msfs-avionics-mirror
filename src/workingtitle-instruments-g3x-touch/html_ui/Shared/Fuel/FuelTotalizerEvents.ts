import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * SimVars related to fuel totalizer data.
 */
export enum FuelTotalizerSimVars {
  Burned = 'L:G3X_Fuel_Burned',
  Remaining = 'L:G3X_Fuel_Remaining',
}

/**
 * Events related to fuel totalizer data.
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
