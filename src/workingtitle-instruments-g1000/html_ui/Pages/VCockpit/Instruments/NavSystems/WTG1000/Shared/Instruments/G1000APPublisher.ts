import { EventBus, PublishPacer, SimVarValueType, SimVarPublisher, SimVarPublisherEntry } from '@microsoft/msfs-sdk';

/** Data related to autopilot */
export interface G1000APSimVarEvents {
  /** Whether the WT KAP140 autopilot is installed. */
  kap_140_installed: boolean;
  //TODO: Remove this after SU10 RTM
  /** Whether the WT KAP140 autopilot is installed (old simvar). */
  kap_140_installed_old: boolean;
}

/**
 * A publisher for AP information for the Nxi.
 */
export class G1000APPublisher extends SimVarPublisher<G1000APSimVarEvents> {
  private static readonly SIMVARS: [keyof G1000APSimVarEvents, SimVarPublisherEntry<any>][] = [
    ['kap_140_installed', { name: 'L:AP_KAP140_INSTALLED', type: SimVarValueType.Bool }],
    ['kap_140_installed_old', { name: 'L:WT1000_AP_KAP140_INSTALLED', type: SimVarValueType.Bool }]
  ];

  /**
   * Creates an AhrsPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<G1000APSimVarEvents>) {
    super(new Map(G1000APPublisher.SIMVARS), bus, pacer);
  }
}