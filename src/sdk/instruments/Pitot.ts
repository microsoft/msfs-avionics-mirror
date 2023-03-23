import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Non-indexed events related to pitot tubes.
 */
export interface PitotNonIndexedEvents {
  /** Whether pitot heat is active. */
  pitot_heat_on: boolean;

  /** The icing state of the pitot tube, in percent. */
  pitot_icing_pct: number;
}

/**
 * Topics related to pitot tubes that are indexed by pitot tube.
 */
export interface PitotIndexedTopics {
  /** Whether a pitot heat switch is in the on position. */
  pitot_heat_switch_on: boolean;
}

/**
 * Indexed events related to pitot tubes.
 */
export type PitotIndexedEvents = {
  [P in keyof PitotIndexedTopics as IndexedEventType<P>]: PitotIndexedTopics[P];
};

/**
 * Events related to pitot tubes.
 */
export type PitotEvents = PitotNonIndexedEvents & PitotIndexedEvents;

/**
 * A publisher for pitot tube information.
 */
export class PitotPublisher extends SimVarPublisher<PitotEvents> {
  private static readonly nonIndexedSimVars = [
    ['pitot_heat_on', { name: 'PITOT HEAT', type: SimVarValueType.Bool }],
    ['pitot_icing_pct', { name: 'PITOT ICE PCT', type: SimVarValueType.Percent }]
  ] as const;

  /**
   * Creates an instance of an PitotPublisher.
   * @param bus The event bus to use with this instance.
   * @param pitotCount The number of pitot tubes to support.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  constructor(bus: EventBus, pitotCount: number, pacer?: PublishPacer<PitotEvents>) {
    const indexedSimVars: [keyof PitotIndexedTopics, SimVarPublisherEntry<any>][] = [
      ['pitot_heat_switch_on', { name: 'PITOT HEAT SWITCH', type: SimVarValueType.Bool }]
    ];

    const simvars = new Map<keyof PitotEvents, SimVarPublisherEntry<any>>(PitotPublisher.nonIndexedSimVars);

    // add pitot-indexed simvars
    for (const [topic, simvar] of indexedSimVars) {
      for (let i = 1; i <= pitotCount; i++) {
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