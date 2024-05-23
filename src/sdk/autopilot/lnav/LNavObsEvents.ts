import { EventBus } from '../../data/EventBus';
import { SimVarValueType } from '../../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from '../../instruments/BasePublishers';
import { ArrayUtils } from '../../utils/datastructures/ArrayUtils';

/**
 * SimVar names for LNAV OBS data.
 */
export enum LNavObsVars {
  /** The current desired track, in degrees true. */
  Active = 'L:WTAP_LNav_Obs_Active',

  /**
   * The current crosstrack error. Negative values indicate deviation to the left, as viewed when facing in the
   * direction of the track. Positive values indicate deviation to the right.
   */
  Course = 'L:WTAP_LNav_Obs_Course',
}

/**
 * Events derived from LNAV OBS SimVars keyed by base topic names.
 */
export interface BaseLNavObsSimVarEvents {
  /** Whether OBS is active. */
  lnav_obs_active: boolean;

  /** The selected magnetic OBS course, in degrees. */
  lnav_obs_course: number;
}

/**
 * Events derived from LNAV OBS SimVars keyed by indexed topic names.
 */
export type IndexedLNavObsSimVarEvents<Index extends number = number> = {
  [P in keyof BaseLNavObsSimVarEvents as `${P}_${Index}`]: BaseLNavObsSimVarEvents[P];
};

/**
 * LNAV OBS events that are derived from SimVars.
 */
export interface LNavObsSimVarEvents extends BaseLNavObsSimVarEvents, IndexedLNavObsSimVarEvents {
}

/**
 * All LNAV OBS events.
 */
export type LNavObsEvents = LNavObsSimVarEvents;

/**
 * A publisher for LNAV OBS events derived from SimVars.
 */
export class LNavObsSimVarPublisher extends SimVarPublisher<LNavObsSimVarEvents> {
  /**
   * Creates a new instance of LNavObsSimVarPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    const defs = ArrayUtils.flatMap(
      [
        ['lnav_obs_active', { name: LNavObsVars.Active, type: SimVarValueType.Bool }],
        ['lnav_obs_course', { name: LNavObsVars.Course, type: SimVarValueType.Degree }],
      ] as ([keyof BaseLNavObsSimVarEvents, SimVarPublisherEntry<any>])[],
      pair => {
        const [topic, entry] = pair;

        const indexedEntry: SimVarPublisherEntry<any> = {
          name: `${entry.name}:#index#`,
          type: entry.type,
          indexed: true,
          defaultIndex: null
        };

        return [
          pair,
          [topic, indexedEntry]
        ] as const;
      }
    );

    super(defs, bus);
  }
}