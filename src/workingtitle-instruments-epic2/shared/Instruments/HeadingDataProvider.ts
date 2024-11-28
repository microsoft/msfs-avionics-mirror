import {
    ConsumerSubject, EventBus, Instrument, MappedSubject, Subject, Subscribable, SubscribableUtils,
    Subscription
} from '@microsoft/msfs-sdk';

import { DisplayUnitIndices } from '../InstrumentIndices';
import { AdahrsSystemEvents } from '../Systems/AdahrsSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../Systems/FmsPositionSystem';

/** A heading data provider, providing data from the ADAHRS and FMS Pos System selected for an instrument. */
export interface HeadingDataProvider {
  /** The current true heading in degrees, or null when invalid. */
  trueHeading: Subscribable<number | null>,

  /** The current magnetic heading in degrees, or true heading when magnetic data not available, or null when invalid. */
  magneticHeading: Subscribable<number | null>,

  /** Whether magnetic data is available, or null when invalid. */
  magneticDataAvailable: Subscribable<boolean | null>,

  /** The current true track in degrees, or null when invalid.*/
  trueTrack: Subscribable<number | null>,

  /** The current magnetic track in degrees, or true track when magnetic data not available, or null when invalid.*/
  magneticTrack: Subscribable<number | null>,

  /** The current turn rate in degrees per second, or null when invalid. */
  deltaHeadingRate: Subscribable<number | null>,
}

/** An altitude air data provider implementation. */
export class DefaultHeadingDataProvider implements HeadingDataProvider, Instrument {
  private readonly adahrsIndex: Subscribable<number>;
  private readonly fmsPosIndex: Subscribable<number>;

  private readonly ownSide: 'left' | 'right';
  private readonly oppositeSide: 'left' | 'right';

  private readonly adahrsValid = ConsumerSubject.create(null, false);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  // source subjects
  private readonly adahrsMagHeading = ConsumerSubject.create(null, 0);
  private readonly adahrsTrueHeading = ConsumerSubject.create(null, 0);
  private readonly adahrsMagAvailable = ConsumerSubject.create(null, false);
  private readonly adahrsDeltaHeading = ConsumerSubject.create(null, 0);

  private readonly fmsPosMagTrack = ConsumerSubject.create(null, 0);
  private readonly fmsPosTrueTrack = ConsumerSubject.create(null, 0);
  private readonly fmsPosGroundSpeed = ConsumerSubject.create(null, 0);

  // outputs
  private readonly _magneticHeading = Subject.create<number | null>(null);
  public readonly magneticHeading = this._magneticHeading as Subscribable<number | null>;

  private readonly _trueHeading = Subject.create<number | null>(null);
  public readonly trueHeading = this._trueHeading as Subscribable<number | null>;

  private readonly _magneticDataAvailable = Subject.create<boolean | null>(null);
  public readonly magneticDataAvailable = this._magneticDataAvailable as Subscribable<boolean | null>;

  private readonly _magneticTrack = Subject.create<number | null>(null);
  public readonly magneticTrack = this._magneticTrack as Subscribable<number | null>;

  private readonly _trueTrack = Subject.create<number | null>(null);
  public readonly trueTrack = this._trueTrack as Subscribable<number | null>;

  private readonly _deltaHeadingRate = Subject.create<number | null>(null);
  public readonly deltaHeadingRate = this._deltaHeadingRate as Subscribable<number | null>;

  private readonly _groundSpeed = Subject.create<number | null>(null);

  private readonly isTrackAvailable = this._groundSpeed.map((v) => v !== null && v > 9);

  private magHeadingPipe = this.adahrsMagHeading.pipe(this._magneticHeading, true);
  private trueHeadingPipe = this.adahrsTrueHeading.pipe(this._trueHeading, true);
  private magAvailablePipe = this.adahrsMagAvailable.pipe(this._magneticDataAvailable, true);
  private deltaHeadingRatePipe = this.adahrsDeltaHeading.pipe(this._deltaHeadingRate, true);

  /** Pipe to send heading into the track subject below 9 knots. */
  private readonly headingToMagTrackPipe = this.adahrsMagHeading.pipe(this._magneticTrack, true);
  /** Pipe to send heading into the track subject below 9 knots. */
  private readonly headingToTrueTrackPipe = this.adahrsTrueHeading.pipe(this._trueTrack, true);

  private magTrackPipe = this.fmsPosMagTrack.pipe(this._magneticTrack, true);
  private trueTrackPipe = this.fmsPosTrueTrack.pipe(this._trueTrack, true);
  private groundSpeedPipe = this.fmsPosGroundSpeed.pipe(this._groundSpeed, true);

  private adahrsDataPipes = [
    this.magHeadingPipe,
    this.trueHeadingPipe,
    this.magAvailablePipe,
    this.deltaHeadingRatePipe,
  ] as const;

  private fmsPosDataPipes = [
    this.groundSpeedPipe,
  ];

  private adahrsOutputSubjects = [
    this._magneticHeading,
    this._trueHeading,
    this._magneticDataAvailable,
    this._deltaHeadingRate,
  ] as const;

  private fmsPosOutputSubjects = [
    this._magneticTrack,
    this._trueTrack,
    this._groundSpeed,
  ];

  private readonly adahrsIndexSub: Subscription;
  private readonly adahrsValidSub: Subscription;
  private readonly fmsPosIndexSub: Subscription;
  private readonly fmsPosValidSub: Subscription;

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param fmsPosIndex The fms pos to use.
   * @param adahrsIndex The ADAHRS index to use.
   * @param displayUnitIndex The index of this display unit.
   */
  constructor(
    private readonly bus: EventBus,
    fmsPosIndex: number | Subscribable<number>,
    adahrsIndex: number | Subscribable<number>,
    displayUnitIndex: DisplayUnitIndices,
  ) {
    this.fmsPosIndex = SubscribableUtils.toSubscribable(fmsPosIndex, true);
    this.adahrsIndex = SubscribableUtils.toSubscribable(adahrsIndex, true);

    this.ownSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'right' : 'left';
    this.oppositeSide = displayUnitIndex === DisplayUnitIndices.PfdRight ? 'left' : 'right';

    const sub = this.bus.getSubscriber<AdahrsSystemEvents & FmsPositionSystemEvents>();

    this.adahrsValidSub = MappedSubject.create(this.adahrsIndex, this.adahrsValid).sub(([index, valid]) => {
      if (index > 0 && valid) {
        for (const pipe of this.adahrsDataPipes) {
          pipe.resume(true);
        }
      } else {
        this.pauseAndSetAdahrsDataInvalid();
      }
    }, true, true);

    this.adahrsIndexSub = this.adahrsIndex.sub((index) => {
      if (index > 0) {
        this.adahrsMagHeading.setConsumer(sub.on(`adahrs_actual_hdg_deg_${index}`));
        this.adahrsTrueHeading.setConsumer(sub.on(`adahrs_actual_hdg_deg_true_${index}`));
        this.adahrsMagAvailable.setConsumer(sub.on(`adahrs_mag_data_available_${index}`));
        this.adahrsDeltaHeading.setConsumer(sub.on(`adahrs_delta_heading_rate_${index}`));
        this.adahrsValid.setConsumer(sub.on(`adahrs_heading_data_valid_${index}`));
      } else {
        this.adahrsValid.setConsumer(null);
        this.adahrsMagHeading.setConsumer(null);
        this.adahrsTrueHeading.setConsumer(null);
        this.adahrsMagAvailable.setConsumer(null);
        this.adahrsDeltaHeading.setConsumer(null);
      }
    }, true, true);

    this.fmsPosValidSub = MappedSubject.create(this.fmsPosIndex, this.fmsPosMode).sub(([index, mode]) => {
      if (index > 0 && (mode === FmsPositionMode.Gps || mode === FmsPositionMode.GpsSbas)) {
        this.resumeFmsPosData();
      } else {
        this.pauseAndSetFmsPosDataInvalid();
      }
    }, true, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub((index) => {
      if (index > 0) {
        this.fmsPosMagTrack.setConsumer(sub.on(`fms_pos_track_deg_magnetic_${index}`));
        this.fmsPosTrueTrack.setConsumer(sub.on(`fms_pos_track_deg_true_${index}`));
        this.fmsPosGroundSpeed.setConsumer(sub.on(`fms_pos_ground_speed_${index}`));
        this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
      } else {
        this.fmsPosMode.setConsumer(null);
        this.fmsPosMagTrack.setConsumer(null);
        this.fmsPosTrueTrack.setConsumer(null);
        this.fmsPosGroundSpeed.setConsumer(null);
      }
    }, true, true);

    this.isTrackAvailable.sub(() => {
      if (!this.adahrsValidSub.isPaused || !this.fmsPosValidSub.isPaused) {
        this.resumeTrackPipes();
      }
    }, true);
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the ADAHRS data subjects and set the outputs invalid (null). */
  private pauseAndSetAdahrsDataInvalid(): void {
    for (const pipe of this.adahrsDataPipes) {
      pipe.pause();
    }
    for (const output of this.adahrsOutputSubjects) {
      output.set(null);
    }
  }

  /** Pause the FMS Pos data subjects and set the outputs invalid (null). */
  private pauseAndSetFmsPosDataInvalid(): void {
    for (const pipe of this.fmsPosDataPipes) {
      pipe.pause();
    }

    this.magTrackPipe.pause();
    this.trueTrackPipe.pause();
    this.headingToMagTrackPipe.pause();
    this.headingToTrueTrackPipe.pause();

    for (const output of this.fmsPosOutputSubjects) {
      output.set(null);
    }
  }

  /** Resumes FMS POS pipes. */
  private resumeFmsPosData(): void {
    for (const pipe of this.fmsPosDataPipes) {
      pipe.resume(true);
    }
    this.resumeTrackPipes();
  }

  /** Selects and resumes the correct pair of track pipes. */
  private resumeTrackPipes(): void {
    if (!this.isTrackAvailable.get()) {
      this.magTrackPipe.pause();
      this.trueTrackPipe.pause();
      this.headingToMagTrackPipe.resume(true);
      this.headingToTrueTrackPipe.resume(true);
    } else {
      this.headingToMagTrackPipe.pause();
      this.headingToTrueTrackPipe.pause();
      this.magTrackPipe.resume(true);
      this.trueTrackPipe.resume(true);
    }
  }

  /** Pause the data output. */
  public pause(): void {
    this.adahrsIndexSub.pause();
    this.adahrsValidSub.pause();
    this.pauseAndSetAdahrsDataInvalid();

    this.fmsPosIndexSub.pause();
    this.fmsPosValidSub.pause();
    this.pauseAndSetFmsPosDataInvalid();
  }

  /** Resume the data output. */
  public resume(): void {
    this.adahrsIndexSub.resume(true);
    this.adahrsValidSub.resume(true);

    this.fmsPosIndexSub.resume(true);
    this.fmsPosValidSub.resume(true);
  }
}
