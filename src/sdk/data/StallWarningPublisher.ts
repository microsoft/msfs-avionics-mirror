import { AdcEvents } from '../instruments/Adc';
import { BasePublisher } from '../instruments/BasePublishers';
import { Subscribable } from '../sub/Subscribable';
import { ConsumerSubject } from './ConsumerSubject';
import { ConsumerValue } from './ConsumerValue';
import { EventBus } from './EventBus';
import { SimVarValueType } from './SimVars';

/**
 * Events published by the StallWarningPublisher.
 */
export interface StallWarningEvents {
  /** Whether or not the stall warning is on. */
  'stall_warning_on': boolean;
}

/**
 * A publisher than handles publishing a debounced stall warning event based on an input AoA.
 */
export class StallWarningPublisher extends BasePublisher<StallWarningEvents> {
  private readonly aoa: Subscribable<number>;
  private readonly onGround: ConsumerValue<boolean>;
  private readonly stallAoA = SimVar.GetSimVarValue('STALL ALPHA', SimVarValueType.Degree);

  private stallWarningOn = false;
  private debounceTimeRemaining: number;
  private previousTime = -1;

  /**
   * Creates an instance of the StallWarningPublisher. Requires the `aoa` (if not provided) and `on_ground` events from `AdcEvents``.
   * @param bus The event bus to use with this instance.
   * @param aoaThreshold The AoA stall warning threshold, where 1 is 100% of stall AoA.
   * @param debounceMs The amount of time, in milliseconds, to debounce the stall warning. Defaults to 500 ms.
   * @param aoa An optional subscribable that provides the AoA value, in degrees.
   */
  constructor(bus: EventBus, private readonly aoaThreshold: number, private readonly debounceMs = 500, aoa?: Subscribable<number>) {
    super(bus);

    this.aoa = aoa ?? ConsumerSubject.create(bus.getSubscriber<AdcEvents>().on('aoa'), 0);
    this.onGround = ConsumerValue.create(bus.getSubscriber<AdcEvents>().on('on_ground'), true);

    this.debounceTimeRemaining = debounceMs;
  }

  /** @inheritdoc */
  public onUpdate(): void {
    if (this.isPublishing()) {
      const time = Date.now();
      if (this.previousTime === -1) {
        this.previousTime = time;
      }

      const deltaTime = time - this.previousTime;

      if (this.aoa.get() >= (this.aoaThreshold * this.stallAoA) && !this.onGround.get()) {
        this.debounceTimeRemaining = Math.max(this.debounceTimeRemaining - deltaTime, 0);
        if (this.debounceTimeRemaining === 0) {
          this.setStallWarningOn(true);
        } else {
          this.setStallWarningOn(false);
        }
      } else {
        this.debounceTimeRemaining = this.debounceMs;
        this.setStallWarningOn(false);
      }

      this.previousTime = time;
    } else {
      this.previousTime = -1;
    }
  }

  /**
   * Sets whether the stall warning is on or not.
   * @param isOn Whether the stall warning is on.
   */
  private setStallWarningOn(isOn: boolean): void {
    if (this.stallWarningOn !== isOn) {
      this.publish('stall_warning_on', isOn, true, true);
      this.stallWarningOn = isOn;
    }
  }
}