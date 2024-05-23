import { EventBus } from '../../data';
import { BasePublisher } from '../../instruments';

/**
 * VNAV-related data events keyed by base topic names.
 */
export interface BaseVNavDataEvents {
  /** Whether or not a loaded and active GPS Approach can support vertical guidance (GP). */
  approach_supports_gp: boolean;

  /** Whether VNAV path details should be displayed. */
  vnav_path_display: boolean;

  /** The active leg vnav calculated target altitude in meters. */
  vnav_active_leg_alt: number;

  /** Whether or not vertical guidance (GP) is currently available for display and guidance. */
  gp_available: boolean;

  /** The full scale deflection of the vertical GSI due to GPS glidepath deviation, in feet. */
  gp_gsi_scaling: number;
}

/**
 * VNAV-related data events keyed by indexed topic names.
 */
export type IndexedVNavDataEvents<Index extends number = number> = {
  [P in keyof BaseVNavDataEvents as `${P}_${Index}`]: BaseVNavDataEvents[P];
};

/**
 * Events related to VNAV data.
 */
export interface VNavDataEvents extends BaseVNavDataEvents, IndexedVNavDataEvents {
}

/**
 * A publisher for VNAV-related data events.
 */
export class VNavDataEventPublisher extends BasePublisher<VNavDataEvents> {
  /**
   * Creates a new instance of VNavDataEventPublisher.
   * @param bus The event bus to which to publish.
   */
  public constructor(bus: EventBus) {
    super(bus);
  }

  /**
   * Publish a control event.
   * @param event The event from ControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof VNavDataEvents>(event: K, value: VNavDataEvents[K]): void {
    this.publish(event, value, true);
  }
}