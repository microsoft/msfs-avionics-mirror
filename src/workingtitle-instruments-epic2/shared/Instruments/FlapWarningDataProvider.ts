import {
  ConsumerSubject, EventBus, GameStateProvider, Instrument, MappedSubject, SimVarValueType, Subject, Subscribable, SubscribableUtils, Subscription, Wait
} from '@microsoft/msfs-sdk';

import { FlapWarningSystemEvents } from '../Systems/FlapWarningSystem';

/** A stall warning system data provider, providing data from the stall warning system selected for an instrument. */
export interface FlapWarningDataProvider {
  /** The left flap angle in degrees, or null if invalid. */
  leftFlapAngle: Subscribable<number | null>;

  /** The right flap angle in degrees, or null if invalid. */
  rightFlapAngle: Subscribable<number | null>;

  /** The flap angle of the most extended flap in degrees, or null if invalid. */
  highestFlapAngle: Subscribable<number | null>;

  /** The angle commanded by the current flap handle position in degrees, or null if invalid. */
  handleAngle: Subscribable<number | null>;

  /** Whether the flaps are at the desired handle angle. Defaults to false when data invalid. */
  isAtHandleAngle: Subscribable<boolean>;

  /** Whether a flap assymetry condition is detected. Defaults to false when data invalid. */
  isFlapAsymmetry: Subscribable<boolean>;

  /** Whether the flaps are in a valid takeoff position. Defaults to false when data invalid. */
  isTakeoffPosition: Subscribable<boolean>;

  /** Whether the flap data is valid. */
  isFlapDataValid: Subscribable<boolean>;
}

/** A stall warning system data provider implementation. */
export class DefaultFlapWarningDataProvider implements FlapWarningDataProvider, Instrument {
  protected static readonly TARGET_TOLERANCE = 2;
  protected static readonly ASYMMETRY_TOLERANCE = 2;

  protected readonly maxFlapHandleIndex = Subject.create<number | null>(null);

  protected readonly rawFlapHandleIndex = ConsumerSubject.create<number>(null, 0);
  protected readonly rawFlapLeftAngle = ConsumerSubject.create<number>(null, 0);
  protected readonly rawFlapRightAngle = ConsumerSubject.create<number>(null, 0);
  protected readonly rawFlapInTakeoffPosition = ConsumerSubject.create<boolean>(null, false);
  protected readonly rawFlapDataIsValid = ConsumerSubject.create<boolean>(null, false);

  protected readonly _flapHandleIndex = Subject.create<number | null>(null);
  public readonly flapHandleIndex = this._flapHandleIndex as Subscribable<number | null>;

  protected readonly _leftFlapAngle = Subject.create<number | null>(null);
  public readonly leftFlapAngle = this._leftFlapAngle as Subscribable<number | null>;

  protected readonly _rightFlapAngle = Subject.create<number | null>(null);
  public readonly rightFlapAngle = this._rightFlapAngle as Subscribable<number | null>;

  protected readonly _isTakeoffPosition = Subject.create(false);
  public readonly isTakeoffPosition = this._isTakeoffPosition as Subscribable<boolean>;

  protected readonly _isFlapDataValid = Subject.create(false);
  public readonly isFlapDataValid = this._isFlapDataValid as Subscribable<boolean>;

  // these mapped subjects depend on out other output subjects, so they are effectively set to invalid values and "paused"
  // in a sense when the input subjects are paused and set invalid
  protected readonly _handleAngle = this._flapHandleIndex.map((v) => v !== null ? this.flapAngles.get(v) ?? null : null);
  public readonly handleAngle = this._handleAngle as Subscribable<number | null>;

  protected readonly _highestFlapAngle = MappedSubject.create(
    (inputs) => inputs.some((v) => v === null) ? null : Math.max(...(inputs as readonly number[])),
    this._leftFlapAngle,
    this._rightFlapAngle,
  );
  public readonly highestFlapAngle = this._highestFlapAngle as Subscribable<number | null>;

  protected readonly _isAtHandleAngle = MappedSubject.create(
    ([handleAngle, leftAngle, rightAngle]) => {
      if (handleAngle !== null && leftAngle !== null && rightAngle !== null) {
        return Math.abs(handleAngle - leftAngle) < DefaultFlapWarningDataProvider.TARGET_TOLERANCE
          && Math.abs(handleAngle - rightAngle) < DefaultFlapWarningDataProvider.TARGET_TOLERANCE;
      }
      return false;
    },
    this._handleAngle,
    this._leftFlapAngle,
    this._rightFlapAngle,
  );
  public readonly isAtHandleAngle = this._isAtHandleAngle as Subscribable<boolean>;

  protected readonly _isFlapAsymmetry = MappedSubject.create(
    ([leftAngle, rightAngle]) => {
      if (leftAngle !== null && rightAngle !== null) {
        return Math.abs(leftAngle - rightAngle) > DefaultFlapWarningDataProvider.ASYMMETRY_TOLERANCE;
      }
      return false;
    },
    this._leftFlapAngle,
    this._rightFlapAngle,
  );
  public readonly isFlapAsymmetry = this._isFlapAsymmetry as Subscribable<boolean>;

  protected readonly flapHandleIndexPipe = this.rawFlapHandleIndex.pipe(this._flapHandleIndex, true);
  protected readonly leftFlapAnglePipe = this.rawFlapLeftAngle.pipe(this._leftFlapAngle, true);
  protected readonly rightFlapAnglePipe = this.rawFlapRightAngle.pipe(this._rightFlapAngle, true);
  protected readonly isTakeoffPositionPipe = this.rawFlapInTakeoffPosition.pipe(this._isTakeoffPosition, true);
  protected readonly isFlapDataValidPipe = this.rawFlapDataIsValid.pipe(this._isFlapDataValid, true);

  protected readonly flapAngles = new Map<number, number>();

  protected readonly flapIndex: Subscribable<number>;

  protected readonly flapIndexSub: Subscription;
  protected readonly flapValidSub: Subscription;

  protected flapDataPipes = [
    this.flapHandleIndexPipe,
    this.leftFlapAnglePipe,
    this.rightFlapAnglePipe,
    this.isTakeoffPositionPipe,
    this.isFlapDataValidPipe,
  ] as const;

  protected flapOutputSubs = [
    this._flapHandleIndex,
    this._leftFlapAngle,
    this._rightFlapAngle,
  ] as const;

  private isReady = false;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param flapWarningIndex The selected flap warning system.
   */
  constructor(
    protected readonly bus: EventBus,
    flapWarningIndex: number | Subscribable<number>,
  ) {
    this.flapIndex = SubscribableUtils.toSubscribable(flapWarningIndex, true);

    const sub = this.bus.getSubscriber<FlapWarningSystemEvents>();

    this.flapValidSub = MappedSubject.create(this.flapIndex, this.rawFlapDataIsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        this.resumeFlapData();
      } else {
        this.pauseAndSetFlapDataInvalid();
      }
    }, true, true);

    this.flapIndexSub = this.flapIndex.sub((index) => {
      if (index > 0) {
        this.rawFlapHandleIndex.setConsumer(sub.on(`flap_warn_flaps_handle_index_${index}`));
        this.rawFlapLeftAngle.setConsumer(sub.on(`flap_warn_flaps_left_angle_${index}`));
        this.rawFlapRightAngle.setConsumer(sub.on(`flap_warn_flaps_right_angle_${index}`));
        this.rawFlapInTakeoffPosition.setConsumer(sub.on(`flap_warn_in_takeoff_position_${index}`));
        this.rawFlapDataIsValid.setConsumer(sub.on(`flap_warn_valid_${index}`));
      } else {
        this.rawFlapHandleIndex.setConsumer(null);
        this.rawFlapLeftAngle.setConsumer(null);
        this.rawFlapRightAngle.setConsumer(null);
        this.rawFlapInTakeoffPosition.setConsumer(null);
        this.rawFlapDataIsValid.setConsumer(null);
      }
    }, true, true);

    Wait.awaitSubscribable(GameStateProvider.get(), s => s === GameState.ingame, true).then(() => {
      // this number does not include handle index 0
      const maxFlapHandleIndex = SimVar.GetSimVarValue('FLAPS NUM HANDLE POSITIONS', SimVarValueType.Number);

      for (let i = 1; i <= maxFlapHandleIndex; i++) {
        const angle = Math.round(SimVar.GetGameVarValue('AIRCRAFT_FLAPS_HANDLE_ANGLE', 'degree', i));
        this.flapAngles.set(i, angle);
      }

      this.maxFlapHandleIndex.set(maxFlapHandleIndex);

      this.isReady = true;
    });
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Resume the flap system data subjects. */
  protected resumeFlapData(): void {
    for (const pipe of this.flapDataPipes) {
      pipe.resume(true);
    }
  }

  /** Pause the flap system data subjects and set the outputs invalid (null). */
  protected pauseAndSetFlapDataInvalid(): void {
    for (const pipe of this.flapDataPipes) {
      pipe.pause();
    }
    for (const sub of this.flapOutputSubs) {
      sub.set(null);
    }
    this._isTakeoffPosition.set(false);
    this._isFlapDataValid.set(false);
  }

  /** Pause the data outputs. */
  public pause(): void {
    this.flapIndexSub.pause();
    this.flapValidSub.pause();
    this.pauseAndSetFlapDataInvalid();
  }

  /** Resume the data outputs. */
  public resume(): void {
    if (this.isReady) {
      this.resumeSubs();
    } else {
      Wait.awaitCondition(() => this.isReady).then(this.resumeSubs.bind(this));
    }
  }

  /** Resumes the data output for this provider. */
  private resumeSubs(): void {
    this.flapIndexSub.resume(true);
    this.flapValidSub.resume(true);
  }
}
