/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import { FsBaseInstrument } from '@microsoft/msfs-sdk';

import { WTUns1FsInstrument } from './WTUns1FsInstrument';

/**
 * UNS-1B Base instrument
 */
export class WTUns1 extends FsBaseInstrument<WTUns1FsInstrument> {
  private _isUnsPowered = false;
  private _isUnsOn = true;
  private powerFailureTimestamp?: number;

  /** @inheritDoc */
  get templateID(): string {
    return 'WTUns1';
  }

  /** @inheritDoc */
  constructInstrument(): WTUns1FsInstrument {
    return new WTUns1FsInstrument(this);
  }

  /**
   * Powers off this instrument
   */
  public powerOff(): void {
    this.electricity.classList.toggle('hidden', true);
    this._isUnsOn = false;
    this.setInstrumentVisible();
  }

  /**
   * Powers on this instrument
   */
  public powerOn(): void {
    this.electricity.classList.toggle('hidden', true);
    this._isUnsOn = true;
    this.setInstrumentVisible();
  }

  /** @inheritdoc */
  public onPowerOn(): void {
    super.onPowerOn();
    this._isUnsPowered = true;
    this.setInstrumentVisible();

    if (this.powerFailureTimestamp) {
      const timeElapsed = (Date.now() - this.powerFailureTimestamp) / 1000;
      // When the time between power failure and power restoration is less than 7 seconds, the same page will display
      // When the time between power failure and restoration is more than 7 seconds but less than 7 minutes, a power fail page will display
      // When the time between power failure and restoration is more than 7 minutes, the system will completely reboot from new
      if (timeElapsed >= 7) {
        this.fsInstrument.onPowerFail(timeElapsed);
      }

      this.powerFailureTimestamp = undefined;
    }
  }

  /** @inheritdoc */
  public onShutDown(): void {
    super.onShutDown();
    this._isUnsPowered = false;
    this.setInstrumentVisible();

    this.powerFailureTimestamp = Date.now();
  }

  /**
   * Sets the electricity visibility depending on whether it should be powered.
   * If the UNS1 is receiving power, and is turned on, then it will be visible.
   * Otherwise, it will not be visible.
   */
  private setInstrumentVisible(): void {
    if (this._isUnsPowered && this._isUnsOn) {
      this.electricity.classList.toggle('hidden', false);
    } else {
      this.electricity.classList.toggle('hidden', true);
    }
  }
}

registerInstrument('wt-uns-1', WTUns1);
