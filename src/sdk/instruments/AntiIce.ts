import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Non-indexed events related to the anti-ice systems.
 */
export interface AntiIceNonIndexedEvents {
  /** Whether the structural anti-ice switch is in the on position. */
  anti_ice_structural_switch_on: boolean;

  /** Whether the windshield anti-ice switch is in the on position. */
  anti_ice_windshield_switch_on: boolean;

  /** The amount of ice on the airplane structure, from 0 (no ice) to 100 (fully iced). */
  anti_ice_structural_ice_pct: number;
}

/**
 * Anti-ice topics indexed by engine.
 */
export interface AntiIceEngineIndexedTopics {
  /** Whether an engine anti-ice switch is in the on position. */
  anti_ice_engine_switch_on: boolean;

  /** Whether a propeller anti-ice switch is in the on position. */
  anti_ice_prop_switch_on: boolean;
}

/**
 * Engine-indexed events related to the anti-ice systems.
 */
export type AntiIceEngineIndexedEvents = {
  [P in keyof AntiIceEngineIndexedTopics as IndexedEventType<P>]: AntiIceEngineIndexedTopics[P];
};

/**
 * Events related to the anti-ice systems.
 */
export type AntiIceEvents = AntiIceNonIndexedEvents & AntiIceEngineIndexedEvents;

/**
 * A publisher for anti-ice system information.
 */
export class AntiIcePublisher extends SimVarPublisher<AntiIceEvents> {
  private static readonly nonIndexedSimVars = [
    ['anti_ice_structural_switch_on', { name: 'STRUCTURAL DEICE SWITCH', type: SimVarValueType.Bool }],
    ['anti_ice_windshield_switch_on', { name: 'WINDSHIELD DEICE SWITCH', type: SimVarValueType.Bool }],
    ['anti_ice_structural_ice_pct', { name: 'STRUCTURAL ICE PCT', type: SimVarValueType.Percent }]
  ] as const;

  /**
   * Creates an instance of an AntiIcePublisher.
   * @param bus The event bus to use with this instance.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  constructor(bus: EventBus, pacer?: PublishPacer<AntiIceEvents>) {
    const engineIndexedSimVars: [keyof AntiIceEngineIndexedTopics, SimVarPublisherEntry<any>][] = [
      ['anti_ice_engine_switch_on', { name: 'ENG ANTI ICE', type: SimVarValueType.Bool }],
      ['anti_ice_prop_switch_on', { name: 'PROP DEICE SWITCH', type: SimVarValueType.Bool }]
    ];

    const simvars = new Map<keyof AntiIceEvents, SimVarPublisherEntry<any>>(AntiIcePublisher.nonIndexedSimVars);

    // add engine-indexed simvars
    const engineCount = SimVar.GetSimVarValue('NUMBER OF ENGINES', SimVarValueType.Number);
    for (const [topic, simvar] of engineIndexedSimVars) {
      for (let i = 1; i <= engineCount; i++) {
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