import {
  ConsumerSubject, DebounceTimer, EventBus, Instrument, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils, Subscription
} from '@microsoft/msfs-sdk';

import { LandingGearSystemEvents } from '../Systems/LandingGearSystem';

export enum LandingGearState {
  /** The landing gear state cannot be determined. */
  Undetermined,
  /** The landing gear is up. */
  Up,
  /** The landing gear is down and locked. */
  DownLocked,
  /** The landing gear is in transit. */
  InTransit,
  /** The landing gear is in transit for too long. */
  InTransitWarning,
}

/** A landing gear indication system data provider. */
export interface LandingGearDataProvider {
  /** The nose landing gear state. */
  noseGearState: Subscribable<LandingGearState>;
  /** The left main landing gear state. */
  leftGearState: Subscribable<LandingGearState>;
  /** The right main landing gear state. */
  rightGearState: Subscribable<LandingGearState>;

  /** Whether the left main gear is on the ground by the weight on wheels sensor. */
  leftGearOnGround: Subscribable<boolean>;
  /** Whether the right main gear is on the ground by the weight on wheels sensor. */
  rightGearOnGround: Subscribable<boolean>;

  /** Whether all landing gears are in the up position. */
  isAllGearUp: Subscribable<boolean>;
  /** Whether all landing gears are in the down and locked position. */
  isAllGearDownLocked: Subscribable<boolean>;
  /** Whether any of the landing gears are in transit. */
  isAnyGearInTransit: Subscribable<boolean>;
  /** Whether any landing gear state is undetermined. */
  isAnyGearStateUndetermined: Subscribable<boolean>;

  /** Whether the gear handle is up. */
  isGearHandleUp: Subscribable<boolean>;

  /** Whether the gear data is invalid (when invalid the data subjects take their default state). */
  isGearDataValid: Subscribable<boolean>;
}

/** The default Epic2 landing gear system data provider (aircraft plugins may override). */
export class DefaultLandingGearDataProvider implements LandingGearDataProvider, Instrument {
  protected static readonly MAX_TRANSIT_TIME = 30_000;

  // transit timers
  protected readonly noseGearTransitTimeout = Subject.create(false);
  protected readonly noseGearTransitTimer = new DebounceTimer();
  protected readonly leftGearTransitTimeout = Subject.create(false);
  protected readonly leftGearTransitTimer = new DebounceTimer();
  protected readonly rightGearTransitTimeout = Subject.create(false);
  protected readonly rightGearTransitTimer = new DebounceTimer();

  // source data
  protected readonly ldgGearHandlePosition = ConsumerSubject.create(null, 0);
  protected readonly isLdgDataValid = ConsumerSubject.create(null, false);
  protected readonly ldgNoseGearPosition = ConsumerSubject.create(null, 0);
  protected readonly ldgLeftGearPosition = ConsumerSubject.create(null, 0);
  protected readonly ldgRightGearPosition = ConsumerSubject.create(null, 0);
  protected readonly ldgLeftGearOnGround = ConsumerSubject.create(null, false);
  protected readonly ldgRightGearOnGround = ConsumerSubject.create(null, false);

  // output data
  protected readonly _noseGearState = MappedSubject.create(
    DefaultLandingGearDataProvider.determineGearState,
    this.isLdgDataValid,
    this.ldgNoseGearPosition,
    this.noseGearTransitTimeout,
  );
  public readonly noseGearState = this._noseGearState as Subscribable<LandingGearState>;

  protected readonly _leftGearState = MappedSubject.create(
    DefaultLandingGearDataProvider.determineGearState,
    this.isLdgDataValid,
    this.ldgLeftGearPosition,
    this.leftGearTransitTimeout,
  );
  public readonly leftGearState = this._leftGearState as Subscribable<LandingGearState>;

  protected readonly _rightGearState = MappedSubject.create(
    DefaultLandingGearDataProvider.determineGearState,
    this.isLdgDataValid,
    this.ldgRightGearPosition,
    this.rightGearTransitTimeout,
  );
  public readonly rightGearState = this._rightGearState as Subscribable<LandingGearState>;

  protected readonly _leftGearOnGround = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isLdgDataValid,
    this.ldgLeftGearOnGround,
    this._leftGearState.map((v) => v === LandingGearState.DownLocked),
  );
  public readonly leftGearOnGround = this._leftGearOnGround as Subscribable<boolean>;

  protected readonly _rightGearOnGround = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isLdgDataValid,
    this.ldgRightGearOnGround,
    this._rightGearState.map((v) => v === LandingGearState.DownLocked),
  );
  public readonly rightGearOnGround = this._rightGearOnGround as Subscribable<boolean>;

  protected readonly _isAllGearUp = MappedSubject.create(
    (inputs) => inputs.every((v) => v === LandingGearState.Up),
    this.noseGearState,
    this.leftGearState,
    this.rightGearState,
  );
  public readonly isAllGearUp = this._isAllGearUp as Subscribable<boolean>;

  protected readonly _isAllGearDownLocked = MappedSubject.create(
    (inputs) => inputs.every((v) => v === LandingGearState.DownLocked),
    this.noseGearState,
    this.leftGearState,
    this.rightGearState,
  );
  public readonly isAllGearDownLocked = this._isAllGearDownLocked as Subscribable<boolean>;

  protected readonly _isAnyGearInTransit = MappedSubject.create(
    (inputs) => inputs.every((v) => v === LandingGearState.InTransit || v === LandingGearState.InTransitWarning),
    this.noseGearState,
    this.leftGearState,
    this.rightGearState,
  );
  public readonly isAnyGearInTransit = this._isAnyGearInTransit as Subscribable<boolean>;

  protected readonly _isAnyGearStateUndetermined = MappedSubject.create(
    (inputs) => inputs.some((v) => v === LandingGearState.Undetermined),
    this.noseGearState,
    this.leftGearState,
    this.rightGearState,
  );
  public readonly isAnyGearStateUndetermined = this._isAnyGearStateUndetermined as Subscribable<boolean>;

  protected readonly _isGearHandleUp = MappedSubject.create(([position, valid]) => valid && position < Number.EPSILON, this.ldgGearHandlePosition, this.isLdgDataValid);
  public readonly isGearHandleUp = this._isGearHandleUp as Subscribable<boolean>;

  protected readonly _isGearDataValid = Subject.create(false);
  public readonly isGearDataValid = this._isGearDataValid as Subscribable<boolean>;

  // misc members
  protected readonly ldgIndex: Subscribable<number>;

  protected ldgValidSub: Subscription;
  protected ldgIndexSub: Subscription;

  protected ldgDataSubs: readonly Subscription[] = [
    this._isGearHandleUp,
  ] as const;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param ldgIndex The selected landing gear indication system.
   */
  constructor(
    private readonly bus: EventBus,
    ldgIndex: number | Subscribable<number>,
  ) {
    this.ldgIndex = SubscribableUtils.toSubscribable(ldgIndex, true);

    const sub = this.bus.getSubscriber<LandingGearSystemEvents>();

    this.ldgValidSub = MappedSubject.create(this.ldgIndex, this.isLdgDataValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        this.resumeLdgData();
        this._isGearDataValid.set(true);
      } else {
        this._isGearDataValid.set(false);
        this.pauseAndSetLdgDataInvalid();
      }
    }, true, true);

    this.ldgIndexSub = this.ldgIndex.sub((index) => {
      if (index > 0) {
        this.ldgGearHandlePosition.setConsumer(sub.on(`ldg_indication_gear_handle_position_${index}`));
        this.ldgNoseGearPosition.setConsumer(sub.on(`ldg_indication_gear_position_0_${index}`));
        this.ldgLeftGearPosition.setConsumer(sub.on(`ldg_indication_gear_position_1_${index}`));
        this.ldgRightGearPosition.setConsumer(sub.on(`ldg_indication_gear_position_2_${index}`));
        this.ldgLeftGearOnGround.setConsumer(sub.on(`ldg_indication_gear_is_on_ground_1_${index}`));
        this.ldgRightGearOnGround.setConsumer(sub.on(`ldg_indication_gear_is_on_ground_2_${index}`));
        this.isLdgDataValid.setConsumer(sub.on(`ldg_indication_valid_${index}`));
      } else {
        this.isLdgDataValid.setConsumer(null);
        this.ldgGearHandlePosition.setConsumer(null);
        this.ldgNoseGearPosition.setConsumer(null);
        this.ldgLeftGearPosition.setConsumer(null);
        this.ldgRightGearPosition.setConsumer(null);
        this.ldgLeftGearOnGround.setConsumer(null);
        this.ldgRightGearOnGround.setConsumer(null);
      }
    }, true, true);

    this._noseGearState.sub((v) => {
      if (v === LandingGearState.InTransit) {
        this.noseGearTransitTimer.schedule(() => this.noseGearTransitTimeout.set(true), DefaultLandingGearDataProvider.MAX_TRANSIT_TIME);
      } else if (v !== LandingGearState.InTransitWarning) {
        this.noseGearTransitTimer.clear();
        this.noseGearTransitTimeout.set(false);
      }
    });
    this._leftGearState.sub((v) => {
      if (v === LandingGearState.InTransit) {
        this.leftGearTransitTimer.schedule(() => this.leftGearTransitTimeout.set(true), DefaultLandingGearDataProvider.MAX_TRANSIT_TIME);
      } else if (v !== LandingGearState.InTransitWarning) {
        this.leftGearTransitTimer.clear();
        this.leftGearTransitTimeout.set(false);
      }
    });
    this._rightGearState.sub((v) => {
      if (v === LandingGearState.InTransit) {
        this.rightGearTransitTimer.schedule(() => this.rightGearTransitTimeout.set(true), DefaultLandingGearDataProvider.MAX_TRANSIT_TIME);
      } else if (v !== LandingGearState.InTransitWarning) {
        this.rightGearTransitTimer.clear();
        this.rightGearTransitTimeout.set(false);
      }
    });
  }

  /** Resume the landing gear indication system data subjects. */
  protected resumeLdgData(): void {
    for (const pipe of this.ldgDataSubs) {
      pipe.resume(true);
    }
  }

  /** Pause the landing gear indication system data subjects and set the outputs invalid (null). */
  protected pauseAndSetLdgDataInvalid(): void {
    for (const pipe of this.ldgDataSubs) {
      pipe.pause();
    }
  }

  /** Pause the data outputs. */
  public pause(): void {
    this.ldgIndexSub.pause();
    this.ldgValidSub.pause();
  }

  /** Resume the data outputs. */
  public resume(): void {
    this.ldgIndexSub.resume(true);
    this.ldgValidSub.resume(true);
  }

  /** @inheritdoc */
  init(): void {
    this.resume();
  }

  /** @inheritdoc */
  onUpdate(): void {
    // noop
  }

  /**
   * Determines the current state of a landing gear.
   * @param root0 Inputs
   * @param root0."0" Whether the landing gear indication system data is valid.
   * @param root0."1" The position of the gear.
   * @param root0."2" Whether the gear transit has timed out.
   * @returns The current state.
   */
  protected static determineGearState([valid, position, timeout]: readonly [boolean, number, boolean]): LandingGearState {
    if (!valid) {
      return LandingGearState.Undetermined;
    }
    if (Math.abs(position) < 0.02) {
      return LandingGearState.Up;
    }
    if (Math.abs(position) > 0.98) {
      return LandingGearState.DownLocked;
    }
    if (timeout) {
      return LandingGearState.InTransitWarning;
    }
    return LandingGearState.InTransit;
  }
}
