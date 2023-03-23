import {
  ApproachGuidanceMode, ConsumerSubject, EventBus, MappedSubject, NavMath, NavSourceType, Subject, Subscribable, SubscribableUtils, Subscription,
  VNavDataEvents, VNavEvents, VNavPathMode
} from '@microsoft/msfs-sdk';

import { AhrsSystemEvents, CDIScaleLabel, FmsEvents, FmsFlightPhase, FmsUtils, GlidepathServiceLevel, VNavDataProvider } from '@microsoft/msfs-garminsdk';
import { G3000NavIndicator } from '@microsoft/msfs-wtg3000-common';

/**
 * A data provider for a vertical deviation indicator.
 */
export interface VdiDataProvider {
  /** Whether a glideslope is available. */
  readonly hasGs: Subscribable<boolean>;

  /** The current glideslope deviation. */
  readonly gsDeviation: Subscribable<number | null>;

  /** Whether the current glideslope deviation is a preview. */
  readonly gsDeviationIsPreview: Subscribable<boolean>;

  /** Whether a glidepath is available. */
  readonly hasGp: Subscribable<boolean>;

  /** The current glidepath service level. */
  readonly gpServiceLevel: Subscribable<GlidepathServiceLevel>;

  /** The current glidepath deviation. */
  readonly gpDeviation: Subscribable<number | null>;

  /** Whether the current glidepath deviation is a preview. */
  readonly gpDeviationIsPreview: Subscribable<boolean>;

  /** The current glidepath deviation scale, in feet. */
  readonly gpDeviationScale: Subscribable<number | null>;

  /** Whether a VNAV path is available. */
  readonly hasVNav: Subscribable<boolean>;

  /** The current VNAV vertical deviation. */
  readonly vnavDeviation: Subscribable<number | null>;

  /** Whether the active leg is past the final approach fix. */
  readonly isPastFaf: Subscribable<boolean>;
}

/**
 * A default implementation of {@link VdiDataProvider}.
 */
export class DefaultVdiDataProvider implements VdiDataProvider {

  private readonly _hasGs = Subject.create(false);
  /** @inheritdoc */
  public readonly hasGs = this._hasGs as Subscribable<boolean>;

  private readonly _gsDeviation = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly gsDeviation = this._gsDeviation as Subscribable<number | null>;

  private readonly _gsDeviationIsPreview = Subject.create<boolean>(false);
  /** @inheritdoc */
  public readonly gsDeviationIsPreview = this._gsDeviationIsPreview as Subscribable<boolean>;

  private readonly _hasGp = Subject.create(false);
  /** @inheritdoc */
  public readonly hasGp = this._hasGp as Subscribable<boolean>;

  private readonly _gpServiceLevel = Subject.create(GlidepathServiceLevel.None);
  /** @inheritdoc */
  public readonly gpServiceLevel = this._gpServiceLevel as Subscribable<GlidepathServiceLevel>;

  private readonly _gpDeviation = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly gpDeviation = this._gpDeviation as Subscribable<number | null>;

  private readonly _gpDeviationIsPreview = Subject.create<boolean>(false);
  /** @inheritdoc */
  public readonly gpDeviationIsPreview = this._gpDeviationIsPreview as Subscribable<boolean>;

  private readonly _gpDeviationScale = Subject.create<number | null>(null);
  /** @inheritdoc */
  public readonly gpDeviationScale = this._gpDeviationScale as Subscribable<number | null>;

  private readonly _hasVNav = this.vnavDataProvider.verticalDeviation.map(deviation => deviation !== null);
  /** @inheritdoc */
  public readonly hasVNav = this._hasVNav as Subscribable<boolean>;

  private readonly _vnavDeviation = this.vnavDataProvider.verticalDeviation.map(deviation => deviation === null ? null : -deviation / 1000);
  /** @inheritdoc */
  public readonly vnavDeviation = this._vnavDeviation as Subscribable<number | null>;

  private readonly flightPhase = ConsumerSubject.create<FmsFlightPhase>(
    null,
    {
      isApproachActive: false,
      isPastFaf: false,
      isInMissedApproach: false
    },
    FmsUtils.flightPhaseEquals
  );
  private readonly _isPastFaf = this.flightPhase.map(phase => phase.isPastFaf);
  /** @inheritdoc */
  public readonly isPastFaf = this._isPastFaf as Subscribable<boolean>;

  private readonly gpServiceLevelSource = ConsumerSubject.create(null, GlidepathServiceLevel.None);
  private readonly gpApproachGuidanceMode = ConsumerSubject.create(null, ApproachGuidanceMode.None);

  private readonly ahrsIndex: Subscribable<number>;
  private readonly isHeadingDataValid = ConsumerSubject.create(null, true);
  private readonly headingMagSource = ConsumerSubject.create(null, 0);
  private readonly headingMag = MappedSubject.create(
    ([isHeadingDataValid, headingMagSource]): number | null => {
      return isHeadingDataValid ? headingMagSource : null;
    },
    this.isHeadingDataValid,
    this.headingMagSource
  );

  private readonly isCourseInRange = MappedSubject.create(
    ([headingMag, course]): boolean => {
      return course !== null && (headingMag === null || Math.abs(NavMath.diffAngle(headingMag, course)) <= 107);
    },
    this.headingMag,
    this.activeNavIndicator.course
  ).pause();

  private readonly activeNavHasGp = MappedSubject.create(
    ([source, gpApproachGuidanceMode, gpServiceLevel]): boolean => {
      return source?.getType() === NavSourceType.Gps
        && (
          gpApproachGuidanceMode === ApproachGuidanceMode.GPActive
          || gpServiceLevel !== GlidepathServiceLevel.None
        );
    },
    this.activeNavIndicator.source,
    this.gpApproachGuidanceMode,
    this.gpServiceLevelSource
  ).pause();

  private readonly gpIsPreview = MappedSubject.create(
    ([vnavPathMode, gpApproachGuidanceMode, cdiScaleMode]): boolean => {
      if (vnavPathMode === VNavPathMode.PathActive) {
        return true;
      }

      if (gpApproachGuidanceMode === ApproachGuidanceMode.GPActive) {
        return false;
      }

      switch (cdiScaleMode) {
        // These CDI scale modes are active if and only if the active leg is to the FAF and the RNAV approach type
        // supports a glidepath
        case CDIScaleLabel.LNavPlusV:
        case CDIScaleLabel.LNavVNav:
        case CDIScaleLabel.LPPlusV:
        case CDIScaleLabel.LPV:
        case CDIScaleLabel.Visual:
          return false;
        default:
          return true;
      }
    },
    this.vnavDataProvider.pathMode,
    this.gpApproachGuidanceMode,
    this.activeNavIndicator.lateralDeviationScalingMode
  ).pause();

  private readonly activeNavHasGs = MappedSubject.create(
    ([source, isLoc]): boolean => {
      return source?.getType() === NavSourceType.Nav && isLoc === true;
    },
    this.activeNavIndicator.source,
    this.activeNavIndicator.isLocalizer
  ).pause();

  private isInit = false;
  private isAlive = true;
  private isPaused = false;

  private ahrsIndexSub?: Subscription;
  private gpDeviationPipe?: Subscription;
  private gpIsPreviewSub?: Subscription;
  private gpServiceLevelPipe?: Subscription;
  private gpDeviationScalePipe?: Subscription;
  private gsDeviationPipe?: Subscription;
  private gsPreviewDeviationPipe?: Subscription;
  private activeNavHasGpSub?: Subscription;
  private activeNavIsGpsSub?: Subscription;
  private activeNavHasGsSub?: Subscription;
  private gsPreviewHasGsSub?: Subscription;
  private isGpCourseInRangeSub?: Subscription;
  private isGsCourseInRangeSub?: Subscription;

  /**
   * Constructor.
   * @param bus The event bus.
   * @param ahrsIndex The index of the AHRS that is the source of this provider's heading data.
   * @param vnavDataProvider A provider of VNAV data.
   * @param activeNavIndicator The nav indicator for the active nav source.
   * @param gsPreviewNavIndicator The nav indicator for the glideslope preview.
   */
  constructor(
    private readonly bus: EventBus,
    ahrsIndex: number | Subscribable<number>,
    private readonly vnavDataProvider: VNavDataProvider,
    private readonly activeNavIndicator: G3000NavIndicator,
    private readonly gsPreviewNavIndicator: G3000NavIndicator
  ) {
    this.ahrsIndex = SubscribableUtils.toSubscribable(ahrsIndex, true);
  }

  /**
   * Initializes this data provider. Once initialized, this data provider will continuously update its data until
   * paused or destroyed.
   * @param paused Whether to initialize this data provider as paused. If `true`, this data provider will provide an
   * initial set of data but will not update the provided data until it is resumed. Defaults to `false`.
   * @throws Error if this data provider is dead.
   */
  public init(paused = false): void {
    if (!this.isAlive) {
      throw new Error('DefaultVdiDataProvider: cannot initialize a dead provider');
    }

    if (this.isInit) {
      return;
    }

    this.isInit = true;
    this.isPaused = paused;

    const sub = this.bus.getSubscriber<VNavEvents & VNavDataEvents & AhrsSystemEvents & FmsEvents>();

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
      this.headingMagSource.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));
    }, true);

    this.flightPhase.setConsumer(sub.on('fms_flight_phase'));

    this.isCourseInRange.resume();

    // Glidepath indicator -> data valid when active nav source is GPS, and an RNAV approach with glidepath is active.
    // Preview is active when VNAV path is active or when the active leg is before the FAF.

    this.gpServiceLevelSource.setConsumer(sub.on('gp_service_level'));
    this.gpApproachGuidanceMode.setConsumer(sub.on('gp_approach_mode'));

    const gpServiceLevelPipe = this.gpServiceLevelPipe = this.gpServiceLevel.pipe(this._gpServiceLevel, true);
    const gpDeviationPipe = this.gpDeviationPipe = this.activeNavIndicator.verticalDeviation.pipe(this._gpDeviation, true);
    const gpDeviationScalePipe = this.gpDeviationScalePipe = this.activeNavIndicator.verticalDeviationScale.pipe(this._gpDeviationScale);

    const gpCourseinRangeSub = this.isGpCourseInRangeSub = this.isCourseInRange.sub(isInRange => {
      if (isInRange) {
        gpServiceLevelPipe.resume(true);
        gpDeviationScalePipe.resume(true);
        gpDeviationPipe.resume(true);
        this._hasGp.set(true);
      } else {
        gpServiceLevelPipe.pause();
        gpDeviationScalePipe.pause();
        gpDeviationPipe.pause();

        this._hasGp.set(false);
        this._gpServiceLevel.set(GlidepathServiceLevel.None);
        this._gpDeviation.set(null);
        this._gpDeviationScale.set(null);
      }
    }, false, true);

    const gpIsPreviewSub = this.gpIsPreviewSub = this.gpIsPreview.sub(isPreview => {
      if (isPreview) {
        gpCourseinRangeSub.pause();
        this._gpDeviationIsPreview.set(true);
        gpServiceLevelPipe.resume(true);
        gpDeviationScalePipe.resume(true);
        gpDeviationPipe.resume(true);
        this._hasGp.set(true);
      } else {
        this._gpDeviationIsPreview.set(false);
        gpCourseinRangeSub.resume(true);
      }
    }, false, true);

    this.activeNavHasGp.resume();

    this.activeNavHasGpSub = this.activeNavHasGp.sub(hasGp => {
      if (hasGp) {
        this.gpIsPreview.resume();
        gpIsPreviewSub.resume(true);
      } else {
        this.gpIsPreview.pause();
        gpIsPreviewSub.pause();
        gpCourseinRangeSub.pause();
        gpServiceLevelPipe.pause();
        gpDeviationPipe.pause();
        gpDeviationScalePipe.pause();

        this._hasGp.set(false);
        this._gpServiceLevel.set(GlidepathServiceLevel.None);
        this._gpDeviation.set(null);
        this._gpDeviationScale.set(null);
        this._gpDeviationIsPreview.set(false);
      }
    }, true);

    // Glideslope indicator -> data valid when active nav source is a NAV radio tuned to an ILS/LOC frequency and
    // airplane heading is within 107 degrees of the selected course.

    const gsDeviationPipe = this.gsDeviationPipe = this.activeNavIndicator.verticalDeviation.pipe(this._gsDeviation, true);

    const gsCourseinRangeSub = this.isGsCourseInRangeSub = this.isCourseInRange.sub(isInRange => {
      if (isInRange) {
        gsDeviationPipe.resume(true);
        this._hasGs.set(true);
      } else {
        gsDeviationPipe.pause();

        this._hasGs.set(false);
        this._gsDeviation.set(null);
      }
    }, false, true);

    this.activeNavHasGs.resume();

    const activeNavHasGsSub = this.activeNavHasGsSub = this.activeNavHasGs.sub(hasGs => {
      if (hasGs) {
        gsCourseinRangeSub.resume(true);
      } else {
        gsCourseinRangeSub.pause();
        gsDeviationPipe.pause();

        this._hasGs.set(false);
        this._gsDeviation.set(null);
      }
    }, false, true);

    const gsPreviewDeviationPipe = this.gsPreviewDeviationPipe = this.gsPreviewNavIndicator.verticalDeviation.pipe(this._gsDeviation, true);

    const gsPreviewHasGsSub = this.gsPreviewHasGsSub = this.gsPreviewNavIndicator.hasGlideSlope.sub(hasGs => {
      if (hasGs) {
        gsPreviewDeviationPipe.resume(true);
        this._gsDeviationIsPreview.set(true);
        this._hasGs.set(true);
      } else {
        gsPreviewDeviationPipe.pause();

        this._hasGs.set(false);
        this._gsDeviationIsPreview.set(false);
        this._gsDeviation.set(null);
      }
    }, false, true);

    this.activeNavIsGpsSub = this.activeNavIndicator.source.sub(source => {
      if (source?.getType() === NavSourceType.Gps) {
        activeNavHasGsSub.pause();
        gsCourseinRangeSub.pause();
        gsDeviationPipe.pause();

        gsPreviewHasGsSub.resume(true);
      } else {
        gsPreviewHasGsSub.pause();
        gsPreviewDeviationPipe.pause();
        this._gsDeviationIsPreview.set(false);

        activeNavHasGsSub.resume(true);
      }
    }, true);

    if (paused) {
      this.pause();
    }
  }

  /**
   * Resumes this data provider. Once resumed, this data provider will continuously update its data until paused or
   * destroyed.
   * @throws Error if this data provider is dead.
   */
  public resume(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVdiDataProvider: cannot resume a dead provider');
    }

    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this._hasVNav.resume();
    this._vnavDeviation.resume();

    this.isHeadingDataValid.resume();
    this.headingMagSource.resume();

    this.flightPhase.resume();

    this.gpServiceLevelSource.resume();
    this.gpApproachGuidanceMode.resume();

    this.activeNavHasGpSub?.resume(true);
    this.activeNavIsGpsSub?.resume(true);
  }

  /**
   * Pauses this data provider. Once paused, this data provider will not update its data until it is resumed.
   * @throws Error if this data provider is dead.
   */
  public pause(): void {
    if (!this.isAlive) {
      throw new Error('DefaultVdiDataProvider: cannot pause a dead provider');
    }

    if (this.isPaused) {
      return;
    }

    this._hasVNav.pause();
    this._vnavDeviation.pause();

    this.isHeadingDataValid.pause();
    this.headingMagSource.pause();

    this.flightPhase.pause();

    this.gpServiceLevelSource.pause();
    this.gpApproachGuidanceMode.pause();
    this.gpIsPreview.pause();

    this.activeNavHasGpSub?.pause();
    this.gpIsPreviewSub?.pause();
    this.isGpCourseInRangeSub?.pause();
    this.gpServiceLevelPipe?.pause();
    this.gpDeviationPipe?.pause();
    this.gpDeviationScalePipe?.pause();

    this.activeNavIsGpsSub?.pause();
    this.activeNavHasGsSub?.pause();
    this.gsPreviewHasGsSub?.pause();
    this.isGsCourseInRangeSub?.pause();
    this.gsDeviationPipe?.pause();
    this.gsPreviewDeviationPipe?.pause();

    this.isPaused = true;
  }

  /**
   * Destroys this data provider. Once destroyed, this data provider will no longer update its provided data, and can
   * no longer be paused or resumed.
   */
  public destroy(): void {
    this.isAlive = false;

    this._hasVNav.destroy();
    this._vnavDeviation.destroy();

    this.isHeadingDataValid.destroy();
    this.headingMagSource.destroy();

    this.flightPhase.destroy();

    this.gpServiceLevelSource.destroy();
    this.gpApproachGuidanceMode.destroy();
    this.activeNavHasGp.destroy();
    this.gpIsPreview.destroy();

    this.activeNavHasGs.destroy();
    this.isCourseInRange.destroy();

    this.ahrsIndexSub?.destroy();
    this.activeNavIsGpsSub?.destroy();
    this.gsPreviewHasGsSub?.destroy();
    this.gpDeviationPipe?.destroy();
    this.gpDeviationScalePipe?.destroy();
    this.gsDeviationPipe?.destroy();
    this.gsPreviewDeviationPipe?.destroy();
  }
}