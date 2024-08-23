import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Events published by the FMC system on the bus.
 */
export interface FmcSimVarEvents {
  /** FMC Exec State. */
  fmcExecActive: number
}

/**
 * FMC Simvar Definitions.
 */
export enum FmcSimVars {
  /** FMC Exec State. */
  FmcExecActive = 'L:FMC_EXEC_ACTIVE'
}

/** A publisher to poll and publish FMC simvars. */
export class FmcSimVarPublisher extends SimVarPublisher<FmcSimVarEvents> {
  private static simvars = new Map<keyof FmcSimVarEvents, SimVarDefinition>([
    ['fmcExecActive', { name: FmcSimVars.FmcExecActive, type: SimVarValueType.Number }]
  ]);

  /**
   * Create a FmcSimVarPublisher
   * @param bus The EventBus to publish to
   */
  public constructor(bus: EventBus) {
    super(FmcSimVarPublisher.simvars, bus);
  }
}