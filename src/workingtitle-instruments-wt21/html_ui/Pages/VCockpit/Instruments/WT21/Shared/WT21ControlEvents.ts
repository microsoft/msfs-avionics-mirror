import { APAltitudeModes, APLateralModes, APVerticalModes, BasePublisher, EventBus } from '@microsoft/msfs-sdk';

import { AltAlertState } from '../PFD/Components/FlightInstruments/AltitudeAlertController';
import { ApproachDetails } from './FlightPlan/WT21Fms';

/**
 * A WT21 FMA data object.
 */
export interface FmaData {
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
  apApproachModeOn: boolean
}

/** Extension of generic ControlEvents to handle G1000-specific events. */
export interface WT21ControlEvents {

  /** FMA Event for Autopilot Modes. */
  fma_modes: FmaData;

  /** Approach Details Set. */
  approach_details_set: ApproachDetails;

  /** Event indicating an active minimums alert */
  minimums_alert: boolean;

  /** Event for updating the altitude alert state */
  altitude_alert: AltAlertState;

  /** Event for showing the FLT LOG page */
  show_flt_log: void;

  /** Event for when a new flight plan was created (origin changed) */
  new_flight_plan_created: void;
}

/** A control publisher that handles WT21 events too. */
export class WT21ControlPublisher extends BasePublisher<WT21ControlEvents> {
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
  public publishEvent<K extends keyof WT21ControlEvents>(event: K, value: WT21ControlEvents[K]): void {
    this.publish(event, value, true);
  }
}
