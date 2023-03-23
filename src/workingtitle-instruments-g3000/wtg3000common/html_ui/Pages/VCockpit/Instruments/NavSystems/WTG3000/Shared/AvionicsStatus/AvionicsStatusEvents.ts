import { AvionicsStatus } from './AvionicsStatusTypes';

/**
 * An event describing a change in the avionics global power state. The global power state is off (`false`) if all
 * avionics units have a status equal to {@link AvionicsStatus.Off}, and on (`true`) otherwise.
 */
export type AvionicsStatusGlobalPowerEvent = {
  /**
   * The previous global power state. A value of `undefined` indicates a power state could not be derived because no
   * avionics unit had yet reported its status.
   */
  previous: boolean | undefined;

  /**
   * The current global power state. A value of `undefined` indicates a power state could not be derived because no
   * avionics unit has yet reported its status.
   */
  current: boolean | undefined;
};

/**
 * An event describing a change in avionics unit status.
 */
export type AvionicsStatusChangeEvent = {
  /** The previous status of the avionics unit. */
  previous: AvionicsStatus | undefined;

  /** The current status of the avionics unit. */
  current: AvionicsStatus;
};

/**
 * Events related to the status of G3000 avionics units (GDUs or GTCs).
 */
export interface AvionicsStatusEvents {
  /** The avionics global power state has changed. */
  avionics_global_power: Readonly<AvionicsStatusGlobalPowerEvent>;

  /**
   * The status of an avionics unit has changed. The suffix of the topic is the UID of the avionics unit, in the form
   * `'[type]_[index]'`, where `type` is the type of the unit (PFD, MFD, or GTC), and `index` is the index of the unit
   * among all units of its type.
   */
  [avionics_status: `avionics_status_${string}`]: Readonly<AvionicsStatusChangeEvent>;
}