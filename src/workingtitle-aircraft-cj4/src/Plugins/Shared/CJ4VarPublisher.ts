import { EventBus, IndexedEvents, SimVarPublisher, SimVarPublisherEntry, SimVarValueType } from '@microsoft/msfs-sdk';

export enum Cj4TransferDirection {
  RightToLeft = -1,
  None = 0,
  LeftToRight = 1
}

/**
 * Events related to CJ4 fuel lvars
 */
export interface CJ4IndexedFuelVarEvents {
  /** If the CJ4 boost pump switch is in manual on mode */
  cj4_boost_pump_manual: boolean;
}

/**
 * Events related to CJ4 fuel lvars
 */
export interface CJ4FuelVarEvents {
  /** The fuel crossfeed direction */
  cj4_fuel_transfer_direction: Cj4TransferDirection
}

/**
 * Root events related to general CJ4 lvars
 */
type Cj4VarEventsRoot = CJ4FuelVarEvents & CJ4IndexedFuelVarEvents

/**
 * Events related to general CJ4 lvars
 */
export type CJ4VarEvents = IndexedEvents<CJ4IndexedFuelVarEvents, 1 | 2> & CJ4FuelVarEvents

/**
 * A publisher of CJ4 lvar events.
 */
export class CJ4VarPublisher extends SimVarPublisher<CJ4VarEvents, Cj4VarEventsRoot> {
  /** @inheritdoc  */
  public constructor(bus: EventBus) {
    super(new Map<keyof (CJ4VarEvents & Cj4VarEventsRoot), SimVarPublisherEntry<any>>([
      ['cj4_boost_pump_manual', { name: 'L:WT_CJ4_Manual_Pump_Enabled_#index#', type: SimVarValueType.Bool, indexed: [1, 2], defaultIndex: null }],
      ['cj4_fuel_transfer_direction', { name: 'L:WT_CJ4_FUEL_TRANSFER_DIRECTION', type: SimVarValueType.Enum }],
    ]), bus);
  }
}
