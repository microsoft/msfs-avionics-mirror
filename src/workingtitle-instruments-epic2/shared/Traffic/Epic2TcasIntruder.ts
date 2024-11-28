import { AbstractTcasIntruder, Accessible, Subscribable, TcasAlertLevel, TrafficContact } from '@microsoft/msfs-sdk';

/**
 * An intruder tracked by Epic2 traffic systems.
 */
export class Epic2TcasIntruder extends AbstractTcasIntruder {
  private _taOnTime = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The sim time, as a UNIX timestamp in milliseconds, at which this intruder's alert level was most recently switched
   * to Traffic Advisory from another alert level.
   */
  public get taOnTime(): number {
    return this._taOnTime;
  }

  private _taOffTime = 0;
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * The sim time, as a UNIX timestamp in milliseconds, at which this intruder's alert level was most recently switched
   * from Traffic Advisory to another alert level.
   */
  public get taOffTime(): number {
    return this._taOffTime;
  }

  private lastAlertLevel = this.alertLevel.get();

  private maxBearingAngle = 70;
  private minBearingAngle = -10;
  private adsBEnabled = false;

  public elevationAngle = 0;
  public isBearingDisplayDataValid = false;

  /**
   * Constructor.
   * @param contact The traffic contact associated with this intruder.
   * @param simTime A subscribable which provides the current sim time, as a UNIX timestamp in milliseconds.
   * @param ownAirplanePitch An accessible which provides the pitch of the own airplane in degrees.
   */
  constructor(contact: TrafficContact, private readonly simTime: Subscribable<number>, private readonly ownAirplanePitch: Accessible<number>) {
    super(contact);

    this.alertLevel.sub(this.onAlertLevelChanged.bind(this));
  }

  /**
   * Updates information regarding bearing display capabilities
   * @param adsbEnabled Whether ADS-B is enabled
   * @param minBearingAngle The minimum angle of elevation where TCAS can display a bearing
   * @param maxBearingAngle The maximum angle of elevation where TCAS can display a bearing
   */
  public updateBearingDisplayCapabilities(adsbEnabled: boolean, minBearingAngle: number, maxBearingAngle: number): void {
    this.adsBEnabled = adsbEnabled;
    this.minBearingAngle = minBearingAngle;
    this.maxBearingAngle = maxBearingAngle;

    this.updateBearingDataValidity();
  }

  /**
   * Updates the bearing display data validity
   */
  private updateBearingDataValidity(): void {
    this.isBearingDisplayDataValid = this.adsBEnabled || (this.elevationAngle >= this.minBearingAngle && this.elevationAngle <= this.maxBearingAngle);
  }

  /**
   * Calculates the angle of elevation of this intruder relative to the angle of elevation of the current aircraft
   */
  public updateRelativeElevation(): void {
    const absX = Math.abs(this.relativePositionVec[0]);
    const absY = Math.abs(this.relativePositionVec[1]);
    const horizDist = Math.sqrt(Math.pow(absX, 2) + Math.pow(absY, 2));
    const absElevation = Math.atan2(this.relativePositionVec[2], horizDist) * Avionics.Utils.RAD2DEG;

    this.elevationAngle = absElevation + this.ownAirplanePitch.get();

    this.updateBearingDataValidity();
  }

  /**
   * Responds to changes in this intruder's alert level.
   * @param alertLevel The new alert level.
   */
  private onAlertLevelChanged(alertLevel: TcasAlertLevel): void {
    if (alertLevel === TcasAlertLevel.TrafficAdvisory) {
      this._taOnTime = this.simTime.get();
    } else if (this.lastAlertLevel === TcasAlertLevel.TrafficAdvisory) {
      this._taOffTime = this.simTime.get();
    }

    this.lastAlertLevel = alertLevel;
  }
}
