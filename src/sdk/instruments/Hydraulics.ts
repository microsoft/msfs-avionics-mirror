import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events hydraulics system
 */
interface BaseHydraulicsSystemEvents {
  /** The switch state of the hydraulic pump.  */
  hyd_pump_switch_state: boolean;
  /** The reservoir quantity in percent. */
  hyd_reservoir_perc: number;
  /** The hydraulic pressure of this pump */
  hyd_pressure: number;
}

/** Indexed topics. */
type IndexedTopics = 'hyd_pump_switch_state' | 'hyd_reservoir_perc' | 'hyd_pressure';

/**
 * Indexed events related to the hydraulics.
 */
type HydraulicsIndexedEvents = {
  [P in keyof Pick<BaseHydraulicsSystemEvents, IndexedTopics> as IndexedEventType<P>]: BaseHydraulicsSystemEvents[P];
};

/**
 * Events related to the planes hydraulics.
 */
export type HydraulicsEvents = BaseHydraulicsSystemEvents & HydraulicsIndexedEvents

/**
 * A publisher for control surfaces information.
 */
export class HydraulicsPublisher extends SimVarPublisher<HydraulicsEvents> {

  /**
   * Create an HydraulicsPublisher.
   * @param bus The EventBus to publish to.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<HydraulicsEvents>) {
    const simvars = new Map<keyof HydraulicsEvents, SimVarPublisherEntry<any>>([
      ['hyd_pump_switch_state', { name: 'HYDRAULIC SWITCH:#index#', type: SimVarValueType.Bool, indexed: true }],
      ['hyd_pressure', { name: 'HYDRAULIC PRESSURE:#index#', type: SimVarValueType.PSI, indexed: true }],
      ['hyd_reservoir_perc', { name: 'HYDRAULIC RESERVOIR PERCENT:#index#', type: SimVarValueType.Percent, indexed: true }]
    ]);

    super(simvars, bus, pacer);
  }
}