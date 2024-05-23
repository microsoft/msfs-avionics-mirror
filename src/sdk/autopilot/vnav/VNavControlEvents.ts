import { EventBus } from '../../data';
import { BasePublisher } from '../../instruments';

/**
 * Data describing how to set a VNAV direct-to.
 */
export interface SetVnavDirectToData {
  /** The index of the flight plan for which to set the VNAV direct-to. */
  planIndex: number;

  /**
   * The global index of the flight plan leg containing the VNAV direct-to target constraint. Using a negative index
   * will cancel any existing VNAV direct-to.
   */
  globalLegIndex: number;

  /**
   * The flight path angle, in degrees, of the VNAV direct-to. If not defined, the default VNAV FPA will be applied.
   * Ignored if `globalLegIndex` is negative.
   */
  fpa?: number;
}

/**
 * Events used to control VNAV keyed by base topic names.
 */
export interface BaseVNavControlEvents {
  /**
   * Sets the default FPA of VNAV descent paths, in degrees. Increasingly positive values indicate increasingly steep
   * descent paths.
   */
  vnav_set_default_fpa: number;

  /** Event to set the FPA of the current VNAV path segment. */
  vnav_set_current_fpa: number;

  /** Event to set the vnav direct to leg. */
  vnav_set_vnav_direct_to: SetVnavDirectToData;

  /** Sets whether VNAV is enabled. */
  vnav_set_state: boolean;
}

/**
 * Events used to control VNAV keyed by indexed topic names.
 */
export type IndexedVNavControlEvents<Index extends number = number> = {
  [P in keyof BaseVNavControlEvents as `${P}_${Index}`]: BaseVNavControlEvents[P];
};

/**
 * Events used to control VNAV.
 */
export interface VNavControlEvents extends BaseVNavControlEvents, IndexedVNavControlEvents {
}

/**
 * A publisher for events used to control VNAV.
 */
export class VNavControlEventPublisher extends BasePublisher<VNavControlEvents> {
  /**
   * Creates a new instance of VNavControlEventPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(bus);
  }

  /**
   * Publish a VNav Control event.
   * @param event The event from ControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof VNavControlEvents>(event: K, value: VNavControlEvents[K]): void {
    this.publish(event, value, true);
  }
}