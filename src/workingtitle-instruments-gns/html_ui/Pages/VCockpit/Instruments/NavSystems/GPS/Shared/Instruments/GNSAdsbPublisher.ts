import { EventBus, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Events published by the GNSAdsbInstrument.
 */
export interface GNSAdsbPublisherEvents {
  /** Whether or not the ADS-B hardware is set to operational. */
  'gns_adsb_oper': boolean;
}

/**
 * SimVars for the GNS ADS-B mode interface.
 */
export enum GNSAdsbSimVars {
  WTGNS_ADSB_OPER = 'L:WTGNS_ADSB_OPER'
}

/**
 * An instrument that tracks the state of the ADS-B system.
 */
export class GNSAdsbPublisher extends SimVarPublisher<GNSAdsbPublisherEvents> {

  /**
   * Creates an instance of the GNSAdsbInstrument.
   * @param bus The bus to use with this instrument.
   */
  constructor(bus: EventBus) {
    super(new Map([
      ['gns_adsb_oper', { name: GNSAdsbSimVars.WTGNS_ADSB_OPER, type: SimVarValueType.Bool }]
    ]), bus);
  }
}