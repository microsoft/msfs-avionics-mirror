import { EventBus, SimVarDefinition, SimVarPublisher, SimVarValueType } from '@microsoft/msfs-sdk';

/**
 * Events published by the FADEC SimVar publisher.
 */
interface CJ4FadecEvents {
  /** A FADEC target N1 for engine 1, in percentage in hundreds. */
  'fadec_tgt_n1_1': number;

  /** A FADEC target N1 for engine 2, in percentage in hundreds. */
  'fadec_tgt_n1_2': number;
}

/**
 * A publisher that publishes FADEC simvar events.
 */
export class CJ4FadecPublisher extends SimVarPublisher<CJ4FadecEvents> {
  private static simvars = new Map<keyof CJ4FadecEvents, SimVarDefinition>([
    ['fadec_tgt_n1_1', { name: 'L:FADEC_TGT_N1_1', type: SimVarValueType.Percent }],
    ['fadec_tgt_n1_2', { name: 'L:FADEC_TGT_N1_2', type: SimVarValueType.Percent }]
  ]);

  /**
   * Creates an instance of the CJ4FadecPublisher.
   * @param bus The event bus to use with this instance.
   */
  constructor(bus: EventBus) {
    super(CJ4FadecPublisher.simvars, bus);
  }
}