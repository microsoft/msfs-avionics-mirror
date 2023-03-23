import { EventBus } from '../../data';
import { BasePublisher } from '../../instruments';

/** The data needed to set a VNAV direct-to. */
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
 * VNav Control Events.
 */
export interface VNavControlEvents {
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


/** A publisher for VNav Control Events */
export class VNavControlEventPublisher extends BasePublisher<VNavControlEvents> {
  /**
   * Create a publisher for VNAV-related data.
   * @param bus The EventBus to publish to.
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