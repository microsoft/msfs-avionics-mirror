import { AbstractTcasIntruder, Subscribable, TcasAlertLevel, TrafficContact } from '@microsoft/msfs-sdk';

/**
 * An intruder tracked by Garmin traffic systems.
 */
export class GarminTcasIntruder extends AbstractTcasIntruder {
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

  /**
   * Constructor.
   * @param contact The traffic contact associated with this intruder.
   * @param simTime A subscribable which provides the current sim time, as a UNIX timestamp in milliseconds.
   */
  constructor(contact: TrafficContact, private readonly simTime: Subscribable<number>) {
    super(contact);

    this.alertLevel.sub(this.onAlertLevelChanged.bind(this));
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