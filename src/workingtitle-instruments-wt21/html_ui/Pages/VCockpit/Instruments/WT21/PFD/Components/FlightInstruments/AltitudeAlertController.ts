import { AdcEvents, APEvents, APLockType, ApproachGuidanceMode, EventBus, SoundServerControlEvents, Subject, VNavEvents, VNavPathMode } from '@microsoft/msfs-sdk';

import { WT21ControlEvents } from '../../../Shared/WT21ControlEvents';

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
  DEVIATION_200,
  /**Outside of the 1000ft deviation zone */
  DEVIATION_1000
}


/** Class to manage the altitude alerter on the PFD Altimeter */
export class AltitudeAlertController {
  public isOnGround = true;
  public alerterState = Subject.create<AltAlertState>(AltAlertState.DISABLED);
  public approachActive = false;
  public altitudeLocked = false;
  public altitude = 0;
  public targetAltitude = NaN;
  private readonly ctrlPub = this.bus.getPublisher<WT21ControlEvents>();

  /**
   * Instantiates an instance of the AltitudeAlertController
   * @param bus is the event bus
   */
  constructor(private bus: EventBus) {
    const adc = this.bus.getSubscriber<AdcEvents>();
    const ap = this.bus.getSubscriber<APEvents>();
    const vnav = this.bus.getSubscriber<VNavEvents>();

    adc.on('on_ground').handle((g) => {
      this.isOnGround = g;
      if (this.isOnGround) {
        this.alerterState.set(AltAlertState.DISABLED);
        this.updateAltitudeAlerter();
      }
    });

    adc.on('indicated_alt').whenChangedBy(1).handle(() => {
      this.updateAltitudeAlerter();
    });

    vnav.on('gp_approach_mode').whenChanged().handle((mode) => {
      switch (mode) {
        case ApproachGuidanceMode.GSActive:
        case ApproachGuidanceMode.GPActive:
          this.altitudeLocked = false;
          this.approachActive = true;
          break;
        default:
          this.approachActive = false;
      }

      this.alerterState.set(AltAlertState.DISABLED);
    });

    vnav.on('vnav_path_mode').whenChanged().handle((mode) => {
      if (mode === VNavPathMode.PathActive) {
        this.altitudeLocked = false;
        this.approachActive = false;
      }
    });

    ap.on('ap_lock_set').whenChanged().handle((lock) => {
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

    ap.on('ap_altitude_selected').whenChanged().handle((v: number) => {
      this.targetAltitude = Math.round(v);
      this.alerterState.set(AltAlertState.DISABLED);
      this.updateAltitudeAlerter();
    });

    this.alerterState.sub((v: AltAlertState): void => {
      this.ctrlPub.pub('altitude_alert', v);
      if (v === AltAlertState.DISABLED) {
        const armFn = (timeout: number): void => {
          setTimeout(() => {
            if (this.canArm()) {
              this.alerterState.set(AltAlertState.ARMED);
              this.updateAltitudeAlerter();
            } else {
              armFn(1000);
            }
          }, timeout);
        };

        armFn(3000);
      }
    }, true);
  }

  /**
   * A method called to update the altitude alerter
   */
  public updateAltitudeAlerter(): void {
    const state = this.alerterState.get();
    const deltaAlt = Math.abs(this.targetAltitude - this.altitude);

    switch (state) {
      case AltAlertState.DISABLED:

        break;
      case AltAlertState.ARMED:
        if (deltaAlt < 100 && this.altitudeLocked) {
          this.alerterState.set(AltAlertState.CAPTURED);
        } else if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        } else if (deltaAlt < 1010) {
          this.alerterState.set(AltAlertState.WITHIN_1000);
          this.bus.getPublisher<SoundServerControlEvents>().pub('sound_server_play_sound', 'WT_altitude_alerter', true, false);
        }
        break;
      case AltAlertState.WITHIN_1000:
        if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        } else if (deltaAlt > 1020) {
          this.alerterState.set(AltAlertState.DEVIATION_1000);
        }
        break;
      case AltAlertState.WITHIN_200:
        if (deltaAlt < 100) {
          this.alerterState.set(AltAlertState.CAPTURED);
        }
        break;
      case AltAlertState.CAPTURED:
        if (deltaAlt > 210 && this.altitudeLocked) {
          this.alerterState.set(AltAlertState.DEVIATION_200);
        }
        break;
      case AltAlertState.DEVIATION_200:
        if (deltaAlt < 210) {
          this.alerterState.set(AltAlertState.WITHIN_200);
        }
        break;
      case AltAlertState.DEVIATION_1000:
        if (deltaAlt < 1000) {
          this.alerterState.set(AltAlertState.WITHIN_1000);
        }
        break;
    }
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * A method called to determine if we can arm the alerter
   */
  private canArm(): boolean {
    return (!this.isOnGround && !this.approachActive) && !isNaN(this.targetAltitude);
  }
}