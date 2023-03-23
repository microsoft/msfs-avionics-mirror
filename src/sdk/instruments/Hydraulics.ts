import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

// /**
//  * Base events related to hydraulics.
//  */
// interface BaseHydraulicsTopics {
//   // noop
// }

/**
 * Topics indexed by hydraulic pump.
 */
interface HydraulicsIndexedTopics {
  /** The switch state of the hydraulic pump.  */
  hyd_pump_switch_state: boolean;
  /** The reservoir quantity in percent. */
  hyd_reservoir_perc: number;
  /** The hydraulic pressure of this pump */
  hyd_pressure: number;
}

/**
 * Indexed events related to the hydraulics.
 */
type HydraulicsIndexedEvents = {
  [P in keyof HydraulicsIndexedTopics as IndexedEventType<P>]: HydraulicsIndexedTopics[P];
};

/**
 * Events related to the planes hydraulics.
 */
export type HydraulicsEvents = HydraulicsIndexedEvents; // & BaseHydraulicsTopics

/**
 * A publisher for control surfaces information.
 */
export class HydraulicsPublisher extends SimVarPublisher<HydraulicsEvents> {

  /**
   * Create an HydraulicsPublisher.
   * @param bus The EventBus to publish to.
   * @param pumpsCount The number of hydraulic pumps.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pumpsCount: number, pacer?: PublishPacer<HydraulicsEvents>) {
    const hydIndexedSimVars: [keyof HydraulicsIndexedTopics, SimVarPublisherEntry<any>][] = [
      ['hyd_pump_switch_state', { name: 'HYDRAULIC SWITCH', type: SimVarValueType.Bool }],
      ['hyd_pressure', { name: 'HYDRAULIC PRESSURE', type: SimVarValueType.PSI }],
      ['hyd_reservoir_perc', { name: 'HYDRAULIC RESERVOIR PERCENT', type: SimVarValueType.Percent }]
    ];

    const simvars = new Map<keyof HydraulicsEvents, SimVarPublisherEntry<any>>();

    // add hydraulic-indexed simvars
    for (const [topic, simvar] of [...hydIndexedSimVars]) {
      // describe the indexed hydraulic topics
      for (let i = 1; i <= pumpsCount; i++) {
        simvars.set(
          `${topic}_${i}`,
          {
            name: `${simvar.name}:${i}`,
            type: simvar.type,
            map: simvar.map
          }
        );
      }
    }

    super(simvars, bus, pacer);
  }
}