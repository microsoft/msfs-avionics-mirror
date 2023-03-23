import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Base events related to control surfaces.
 */
export interface BaseControlSurfacesEvents {

  /** The handle index for flaps. */
  flaps_handle_index: number;

  /** The extension angle of the left trailing edge flaps, in degrees. */
  flaps_left_angle: number;

  /** The extension angle of the right trailing edge flaps, in degrees. */
  flaps_right_angle: number;

  /** The left trailing edge flaps, in percent. */
  flaps_left_percent: number;

  /** The right trailing edge flaps, in percent. */
  flaps_right_percent: number;

  /** The extension angle of the left slats, in degrees. */
  slats_left_angle: number;

  /** The extension angle of the right slats, in degrees. */
  slats_right_angle: number;

  /** The left slats, in percent. */
  slats_left_percent: number;

  /** The right slats, in percent. */
  slats_right_percent: number;

  /** The left spoilers angle, in percent. */
  spoilers_left_percent: number;

  /** The right spoilers angle, in percent. */
  spoilers_right_percent: number;

  /** The left spoilers but without the spoilerons angle, in percent */
  spoilers_without_spoilerons_left_percent: number;

  /** The elevator trim angle, in degrees. Positive values indicate nose-up trim. */
  elevator_trim_angle: number;

  /** The percent of applied elevator trim. */
  elevator_trim_pct: number;

  /** The neutral position in percent of the elevator trim. */
  elevator_trim_neutral_pct: number;

  /** The aileron trim angle, in degrees. Positive values indicate rightward trim. */
  aileron_trim_angle: number;

  /** The percent of applied aileron trim. */
  aileron_trim_pct: number;

  /** The rudder trim angle, in degrees. Positive values indicate rightward trim. */
  rudder_trim_angle: number;

  /** The percent of applied rudder trim. */
  rudder_trim_pct: number;

  /** The percent of left aileron deflection */
  aileron_left_percent: number;

  /** The percent of right aileron deflection */
  aileron_right_percent: number;

  /** The percent of elevator deflection */
  elevator_percent: number;

  /** The percent of rudder deflection */
  rudder_percent: number;

  /** Landing gear position. A value of `0` indicates fully retracted, and a value of `1` indicates fully extended. */
  gear_position: number;

  /** Whether landing gear is on the ground. */
  gear_is_on_ground: boolean;
}

/**
 * Topics indexed by landing gear.
 */
type LandingGearIndexedTopics = 'gear_position' | 'gear_is_on_ground';

/**
 * Topics related to control surfaces that are indexed.
 */
type ControlSurfacesIndexedTopics = LandingGearIndexedTopics;

/**
 * Indexed events related to control surfaces.
 */
type ControlSurfacesIndexedEvents = {
  [P in keyof Pick<BaseControlSurfacesEvents, ControlSurfacesIndexedTopics> as IndexedEventType<P>]: BaseControlSurfacesEvents[P];
};

/**
 * Events related to control surfaces.
 */
export interface ControlSurfacesEvents extends BaseControlSurfacesEvents, ControlSurfacesIndexedEvents {
}

/**
 * A publisher for control surfaces information.
 */
export class ControlSurfacesPublisher extends SimVarPublisher<ControlSurfacesEvents> {

  /**
   * Create an ControlSurfacesPublisher.
   * @param bus The EventBus to publish to.
   * @param gearCount The number of landing gear to support.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, gearCount: number, pacer?: PublishPacer<ControlSurfacesEvents>) {
    const nonIndexedSimVars: [Exclude<keyof BaseControlSurfacesEvents, ControlSurfacesIndexedTopics>, SimVarPublisherEntry<any>][] = [
      ['flaps_handle_index', { name: 'FLAPS HANDLE INDEX', type: SimVarValueType.Number }],
      ['flaps_left_angle', { name: 'TRAILING EDGE FLAPS LEFT ANGLE', type: SimVarValueType.Degree }],
      ['flaps_right_angle', { name: 'TRAILING EDGE FLAPS RIGHT ANGLE', type: SimVarValueType.Degree }],
      ['flaps_left_percent', { name: 'TRAILING EDGE FLAPS LEFT PERCENT', type: SimVarValueType.Percent }],
      ['flaps_right_percent', { name: 'TRAILING EDGE FLAPS RIGHT PERCENT', type: SimVarValueType.Percent }],
      ['slats_left_angle', { name: 'LEADING EDGE FLAPS LEFT ANGLE', type: SimVarValueType.Degree }],
      ['slats_right_angle', { name: 'LEADING EDGE FLAPS RIGHT ANGLE', type: SimVarValueType.Degree }],
      ['slats_left_percent', { name: 'LEADING EDGE FLAPS LEFT PERCENT', type: SimVarValueType.Percent }],
      ['slats_right_percent', { name: 'LEADING EDGE FLAPS RIGHT PERCENT', type: SimVarValueType.Percent }],
      ['spoilers_left_percent', { name: 'SPOILERS LEFT POSITION', type: SimVarValueType.Percent }],
      ['spoilers_right_percent', { name: 'SPOILERS RIGHT POSITION', type: SimVarValueType.Percent }],
      ['spoilers_without_spoilerons_left_percent', { name: 'SPOILERS WITHOUT SPOILERONS LEFT POSITION', type: SimVarValueType.Percent }],
      ['elevator_trim_angle', { name: 'ELEVATOR TRIM POSITION', type: SimVarValueType.Degree }],
      ['elevator_trim_pct', { name: 'ELEVATOR TRIM PCT', type: SimVarValueType.Percent }],
      ['elevator_trim_neutral_pct', { name: 'AIRCRAFT ELEVATOR TRIM NEUTRAL', type: SimVarValueType.Percent }],
      ['aileron_trim_angle', { name: 'AILERON TRIM', type: SimVarValueType.Degree }],
      ['aileron_trim_pct', { name: 'AILERON TRIM PCT', type: SimVarValueType.Percent }],
      ['rudder_trim_angle', { name: 'RUDDER TRIM', type: SimVarValueType.Degree }],
      ['rudder_trim_pct', { name: 'RUDDER TRIM PCT', type: SimVarValueType.Percent }],
      ['aileron_left_percent', { name: 'AILERON LEFT DEFLECTION PCT', type: SimVarValueType.Percent }],
      ['aileron_right_percent', { name: 'AILERON RIGHT DEFLECTION PCT', type: SimVarValueType.Percent }],
      ['elevator_percent', { name: 'ELEVATOR DEFLECTION PCT', type: SimVarValueType.Percent }],
      ['rudder_percent', { name: 'RUDDER DEFLECTION PCT', type: SimVarValueType.Percent }]
    ];

    const gearIndexedSimVars: [Extract<keyof BaseControlSurfacesEvents, LandingGearIndexedTopics>, SimVarPublisherEntry<any>][] = [
      ['gear_position', { name: 'GEAR POSITION', type: SimVarValueType.Number }],
      ['gear_is_on_ground', { name: 'GEAR IS ON GROUND', type: SimVarValueType.Bool }]
    ];

    const simvars = new Map<keyof ControlSurfacesEvents, SimVarPublisherEntry<any>>(nonIndexedSimVars);

    // set un-indexed simvar topics to pull from index 0
    for (const [topic, simvar] of [...gearIndexedSimVars]) {
      simvars.set(
        `${topic}`,
        {
          name: `${simvar.name}:0`,
          type: simvar.type,
          map: simvar.map
        }
      );
    }

    // add landing gear indexed simvar topics
    // HINT: for some reason index 0 is nose. not 1-based.
    gearCount = Math.max(gearCount, 1);
    for (let i = 0; i < gearCount; i++) {
      for (const [topic, simvar] of gearIndexedSimVars) {
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