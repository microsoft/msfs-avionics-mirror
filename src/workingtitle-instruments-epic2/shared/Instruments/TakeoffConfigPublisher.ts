import {
  ConsumerSubject, EventBus, Instrument, MappedSubject, MappedSubscribable, Subscribable, Subscription, VirtualThrottleLeverEvents
} from '@microsoft/msfs-sdk';

import { Epic2Fadec } from '../Autothrottle';
import { AirGroundDataProvider } from './AirGroundDataProvider';
import { FlapWarningDataProvider } from './FlapWarningDataProvider';

/** Bus events published by the takeoff config system */
export interface TakeoffConfigPublisherEvents {
  /**
   * Whether the "no takeoff" warning is active.
   * It is active when takeoff thrust is set and an invalid config is detected.
   */
  takeoff_config_no_takeoff: boolean;

  /**
   * Whether the "no takeoff" warning is active due to flap config.
   * It is active when takeoff thrust is set and an invalid flap config is detected.
   */
  takeoff_config_no_takeoff_flaps: boolean;
}

/** The default Epic2 takeoff config system publisher. */
export class TakeoffConfigPublisher implements Instrument {
  protected static readonly MIN_TAKEOFF_THROTTLE_POS = 0.7;

  protected readonly throttlePositions: Subscribable<number>[] = [];
  protected readonly isAnyEngTakeoffThrust: Subscribable<boolean>;

  protected readonly noTakeoff: MappedSubscribable<boolean>;
  protected readonly noTakeoffFlaps: MappedSubscribable<boolean>;

  protected readonly noTakeoffPubSub: Subscription;
  protected readonly noTakeoffFlapsPubSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param flapWarningDataProvider The flap warning data provider to use.
   * @param airGroundDataProvider The air ground data provider to use.
   * @param fadec The fadec to use.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly flapWarningDataProvider: FlapWarningDataProvider,
    protected readonly airGroundDataProvider: AirGroundDataProvider,
    protected readonly fadec: Epic2Fadec,
  ) {

    for (let engIndex = 1; engIndex <= fadec.numberOfEngines; engIndex++) {
      this.throttlePositions.push(ConsumerSubject.create(this.bus.getSubscriber<VirtualThrottleLeverEvents>().on(`v_throttle_lever_pos_${engIndex}`), 0));
    }

    this.isAnyEngTakeoffThrust = MappedSubject.create((modes) => modes.some((t) => t >= TakeoffConfigPublisher.MIN_TAKEOFF_THROTTLE_POS), ...this.throttlePositions);

    this.noTakeoffFlaps = MappedSubject.create(
      ([isOnGround, isInTakeoffPosition, thrustModeTO]) => isOnGround && !isInTakeoffPosition && thrustModeTO,
      this.airGroundDataProvider.isOnGround,
      this.flapWarningDataProvider.isTakeoffPosition,
      this.isAnyEngTakeoffThrust,
    ).pause();

    // Just a copy here. Aircraft plugins can replace this publisher with their own in the backplane that considers trim etc.
    this.noTakeoff = this.noTakeoffFlaps;

    this.noTakeoffFlapsPubSub = this.noTakeoffFlaps.sub((v) => this.bus.getPublisher<TakeoffConfigPublisherEvents>().pub('takeoff_config_no_takeoff_flaps', v, true, true), true, true);
    this.noTakeoffPubSub = this.noTakeoff.sub((v) => this.bus.getPublisher<TakeoffConfigPublisherEvents>().pub('takeoff_config_no_takeoff', v, true, true), true, true);
  }

  /** Pause the data outputs. */
  public pause(): void {
    this.noTakeoffFlapsPubSub.pause();
    this.noTakeoffPubSub.pause();
    this.noTakeoffFlaps.pause();
    this.noTakeoff.pause();
  }

  /** Resume the data outputs. */
  public resume(): void {
    this.noTakeoffFlaps.resume();
    this.noTakeoff.resume();
    this.noTakeoffPubSub.resume(true);
    this.noTakeoffFlapsPubSub.resume(true);
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
