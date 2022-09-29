import { AdcEvents, AltitudeSelectEvents, APEvents, APLockType, ApproachGuidanceMode, EventBus, Subject, VNavEvents, VNavPathMode } from 'msfssdk';

import { G1000ControlEvents } from '../../../Shared/G1000Events';

/** The state of the altitude alerter. */
export enum AltAlertState {
  /** Disabled Mode */
  DISABLED,
  /** Armed Mode. */
  ARMED,
  /** Within 1000 feet of preselected altitude. */
  WITHIN_1000,
  /** Within 200 feet of preselected altitude. */
  WITHIN_200,
  /** Captured the preselected altitude. */
  CAPTURED,
  /**Outside of the 200ft deviation zone */
  DEVIATION_200
}


/** Class to manage the altitude alerter on the PFD Altimeter */
export class AltitudeAlertController {
  public isOnGround = false;
  public alerterState = Subject.create(AltAlertState.DISABLED);
  public approachActive = false;
  public altitudeLocked = false;
  public altitude = 0;
  public selectedAltitude = NaN;
  public targetAltitude = 0;

  /**
   * Instantiates an instance of the AltitudeAlertController
   * @param bus is the event bus
   */
  constructor(private bus: EventBus) {
    const sub = this.bus.getSubscriber<AdcEvents & APEvents & VNavEvents & AltitudeSelectEvents & G1000ControlEvents>();

    sub.on('on_ground').handle((g) => { this.isOnGround = g; });

    sub.on('gp_approach_mode').whenChanged().handle((mode) => {
      switch (mode) {
        case ApproachGuidanceMode.GSActive:
        case ApproachGuidanceMode.GPActive:
          this.altitudeLocked = false;
          this.approachActive = true;
          break;
        default:
          this.approachActive = false;
      }
    });

    sub.on('vnav_path_mode').whenChanged().handle((mode) => {
      if (mode === VNavPathMode.PathActive) {
        this.altitudeLocked = false;
        this.approachActive = false;
      }
    });

    // vnav.on('vnavAltCaptureType').whenChanged().handle(type => this.onVNavUpdate(this.vnavPathMode, type, this.approachMode));

    sub.on('ap_lock_set').whenChanged().handle((lock) => {
      switch (lock) {
        case APLockType.Alt:
          this.altitudeLocked = true;
          this.approachActive = false;
          break;
        case APLockType.Flc:
        case APLockType.Vs:
        case APLockType.Glideslope:
        case APLockType.Pitch:
          this.altitudeLocked = false;
          this.approachActive = false;
          break;
      }
    });

    sub.on('ap_altitude_selected').whenChanged().handle(() => {
      this.alerterState.set(AltAlertState.ARMED);
    });

    sub.on('alt_alert_cancel').handle((d) => {
      if (d) {
        this.alerterState.set(AltAlertState.DISABLED);
      }
    });

    sub.on('alt_select_is_initialized').whenChanged().handle(isSet => {
      if (!isSet) {
        this.alerterState.set(AltAlertState.DISABLED);
      }
    });
  }

  /**
   * A method called to update the altitude alerter
   */
  public updateAltitudeAlerter(): void {
    if (this.isOnGround || this.approachActive || isNaN(this.selectedAltitude)) {
      this.alerterState.set(AltAlertState.DISABLED);
      return;
    }

    const state = this.alerterState.get();

    if (state === AltAlertState.ARMED) {
      this.targetAltitude = this.selectedAltitude;
    }

    const deltaAlt = Math.abs(this.targetAltitude - this.altitude);

    switch (state) {
      case AltAlertState.ARMED:
        if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        } else if (deltaAlt < 1010) {
          this.alerterState.set(AltAlertState.WITHIN_1000);
        }
        break;
      case AltAlertState.WITHIN_1000:
        if (this.targetAltitude != this.selectedAltitude) {
          this.alerterState.set(AltAlertState.ARMED);
        } else if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        }
        break;
      case AltAlertState.WITHIN_200:
        if (this.targetAltitude !== this.selectedAltitude) {
          this.alerterState.set(AltAlertState.ARMED);
        } else if (deltaAlt < 100) {
          this.alerterState.set(AltAlertState.CAPTURED);
        }
        break;
      case AltAlertState.CAPTURED:
        if (this.targetAltitude != this.selectedAltitude && !this.altitudeLocked) {
          this.alerterState.set(AltAlertState.ARMED);
        } else if (deltaAlt > 210 && this.altitudeLocked) {
          this.alerterState.set(AltAlertState.DEVIATION_200);
        }
        break;
      case AltAlertState.DEVIATION_200:
        if (this.targetAltitude != this.selectedAltitude && !this.altitudeLocked) {
          this.alerterState.set(AltAlertState.ARMED);
        } else if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        }
        break;
    }
  }
}