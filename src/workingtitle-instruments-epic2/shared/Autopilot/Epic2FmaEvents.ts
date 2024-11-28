import { APAltitudeModes, APLateralModes, APVerticalModes, BasePublisher, EventBus } from '@microsoft/msfs-sdk';

/**
 * Epic 2 FMA data object.
 */
export interface Epic2FmaData {
  /** The Active Vertical Mode */
  verticalActive: APVerticalModes,
  /** The Armed Vertical Mode */
  verticalArmed: APVerticalModes,
  /** The Armed Vertical Approach Mode */
  verticalApproachArmed: APVerticalModes,
  /** The Armed Altitude Type */
  verticalAltitudeArmed: APAltitudeModes,
  /** The Altitude Capture Armed State */
  altitideCaptureArmed: boolean,
  /** The Altitude Capture Value */
  altitideCaptureValue: number,
  /** The Active Lateral Mode */
  lateralActive: APLateralModes,
  /** The Armed Lateral Mode */
  lateralArmed: APLateralModes,
  /** Lateral Mode Failed */
  lateralModeFailed: boolean,
  /** Path Armed Error */
  pathArmedError: boolean,
  /** Approach Mode Active */
  apApproachModeOn: boolean,
  /** Is overspeed protection active? */
  isOverspeedProtectionActive: boolean,
  /** Is the abnormal disengage warning active? */
  isAbnormalDisengageActive: boolean,
}

/** Epic 2 FMA Events. */
export interface Epic2FmaEvents {

  /** FMA Event for Autopilot Modes. */
  epic2_fma_data: Epic2FmaData;
}

/** A publisher that handles Epic 2 Fma Events. */
export class Epic2FmaPublisher extends BasePublisher<Epic2FmaEvents> {
  /**
   * Create a ControlPublisher.
   * @param bus The EventBus to publish to.
   */
  public constructor(bus: EventBus) {
    super(bus);
  }

  /**
   * Publish a control event.
   * @param event The event from ControlEvents.
   * @param value The value of the event.
   */
  public publishEvent<K extends keyof Epic2FmaEvents>(event: K, value: Epic2FmaEvents[K]): void {
    this.publish(event, value, true);
  }
}
