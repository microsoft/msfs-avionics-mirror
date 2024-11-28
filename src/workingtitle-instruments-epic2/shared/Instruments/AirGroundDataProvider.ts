import { EventBus, Instrument, MappedSubject, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import { AirspeedDataProvider } from './AirspeedDataProvider';
import { LandingGearDataProvider } from './LandingGearDataProvider';
import { RadioAltimeterDataProvider } from './RadioAltimeterDataProvider';

/** Bus events published by the air/ground system data provider */
export interface AirGroundDataProviderEvents {
  /** Whether the aircraft is on the ground; defaults to air when the sensors fail. */
  air_ground_is_on_ground: boolean;
}

/** Air/Ground System Data Provider. */
export interface AirGroundDataProvider extends Instrument {
  /** Whether the aircraft is on the ground; defaults to air when the sensors fail. */
  isOnGround: Subscribable<boolean>;
  /** Whether the air/ground state is valid/not failed. */
  isValid: Subscribable<boolean>;
}

/** The default Epic2 air/ground system data provider. */
export class DefaultAirGroundDataProvider implements AirGroundDataProvider {
  protected readonly _isOnGround = MappedSubject.create(
    ([leftOnGround, rightOnGround, gearValid, cas, ra]) => gearValid ? (leftOnGround || rightOnGround) : (ra !== null ? ra <= 0 : (cas !== null ? cas < 30 : false)),
    this.landingGearDataProvider.leftGearOnGround,
    this.landingGearDataProvider.rightGearOnGround,
    this.landingGearDataProvider.isGearDataValid,
    this.airspeedDataProvider.cas,
    this.radioAltimeterDataProvider.radioAltitude,
  ).pause();
  public readonly isOnGround = this._isOnGround as Subscribable<boolean>;

  protected readonly _isValid = MappedSubject.create(
    ([gearValid, cas, ra]) => gearValid || cas !== null || ra !== null,
    this.landingGearDataProvider.isGearDataValid,
    this.airspeedDataProvider.cas,
    this.radioAltimeterDataProvider.radioAltitude,
  ).pause();
  public readonly isValid = this._isValid as Subscribable<boolean>;

  protected readonly onGroundPubSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param airspeedDataProvider The airspeed data provider to use.
   * @param landingGearDataProvider  The landing gear data provider to use.
   * @param radioAltimeterDataProvider  The radio altimeter data provider to use.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly airspeedDataProvider: AirspeedDataProvider,
    protected readonly landingGearDataProvider: LandingGearDataProvider,
    protected readonly radioAltimeterDataProvider: RadioAltimeterDataProvider,
  ) {
    this.onGroundPubSub = this._isOnGround.sub((v) => this.bus.getPublisher<AirGroundDataProviderEvents>().pub('air_ground_is_on_ground', v), true, true);
  }

  /** Pause the data outputs. */
  public pause(): void {
    this.onGroundPubSub.pause();
    this._isOnGround.pause();
    this._isValid.pause();
  }

  /** Resume the data outputs. */
  public resume(): void {
    this._isOnGround.resume();
    this._isValid.resume();
    this.onGroundPubSub.resume(true);
  }

  /** @inheritdoc */
  init(): void {
    this.resume();
  }

  /** @inheritdoc */
  onUpdate(): void {
    // noop
  }
}
