import {
  APLateralModes, APVerticalModes, ConsumerSubject, EventBus, EventSubscriber, ExtendedApproachType, Instrument, MappedSubject, MathUtils, RnavTypeFlags,
  Subject, Subscribable, SubscribableMapFunctions, Subscription, VNavDataEvents, VNavEvents, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { Epic2FmaEvents } from '../Autopilot';
import { Epic2FmsEvents, RnavMinima } from '../Fms';
import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2LNavDataEvents, Epic2NavIndicators } from '../Navigation';
import { DefaultAutopilotDataProvider, Epic2ApVerticalMode } from './AutopilotDataProvider';

export enum Epic2VerticalDeviationMode {
  /**
   * Disarmed represents the ghost for the approach pointer as well as
   * vnav not active or armed for the pre-approach pointer and is displayed white.
   **/
  Disarmed,
  /**
   * GPGhostWithPreApproachActive is only valid for the VNAV approach pointer and represents
   * an armed ghost preview when the pre-approach pointer is active. This is displayed as cyan ghost pointer.
   **/
  GPGhostWithPreApproachActive,
  /** Armed represents armed GS or GP for the approach pointer and the VALT mode on the pre-approach pointer, displayed as cyan filled. */
  Armed,
  /** Active represents the active mode on either the approach or pre-approach pointer, displayed as magenta. */
  Active
}

export enum Epic2VerticalDeviationLabel {
  None = '',
  VNAV = 'VNAV',
  LPV = 'LPV',
  GS = 'GS',
}

/** A vertical deviation data provider. */
export interface VerticalDeviationDataProvider {

  // Pre-Approach Pointer
  // The pre-approach pointer is displayed on the left
  // side of the vertical deviation scale as a truncated
  // triangle. The pre-approach pointer is not labeled as
  // it always represents the barometric VNAV pointer
  // driven by the FMS and it is always on the left of the
  // vertical scale.
  // The pointer is displayed in magenta when the vertical
  // FD mode is VPTH and is displayed in cyan when the
  // vertical FD is VALT.

  /** If the pre-approach pointer should be displayed. */
  preApproachPointerActive: Subscribable<boolean>;

  /** The mode of the pre-approach pointer. */
  preApproachPointerMode: Subscribable<Epic2VerticalDeviationMode>;

  /** The deviation value of the pre-approach pointer (from -1 to +1 indicating full scale deflection), or null when invalid. */
  preApproachPointerDeviation: Subscribable<number | null>;


  // Approach Pointer - LOC/GS

  /** If the gs approach pointer should be displayed. */
  gsApproachPointerActive: Subscribable<boolean>;

  /** The mode of the gs approach pointer. */
  gsApproachPointerMode: Subscribable<Epic2VerticalDeviationMode>;

  /** The deviation value of the gs approach pointer (from -1 to +1 indicating full scale deflection), or null when invalid. */
  gsApproachPointerDeviation: Subscribable<number | null>;

  // Approach Pointer - FMS/VNAV or LPV (GP)

  /** If the gp approach pointer should be displayed. */
  gpApproachPointerActive: Subscribable<boolean>;

  /** The mode of the gp approach pointer. */
  gpApproachPointerMode: Subscribable<Epic2VerticalDeviationMode>;

  /** The deviation value of the gp approach pointer (from -1 to +1 indicating full scale deflection), or null when invalid. */
  gpApproachPointerDeviation: Subscribable<number | null>;

  // Vertical Deviation Pointer Source Label only applies to the Approach Pointer
  // NAV Source / Vertical Mode / Label
  // FMS / VGP / VNAV
  // GPS / VGP / LPV
  // ILS / Glideslope / GS

  /** Vertical Deviation Pointer Source Label */
  approachPointerLabel: Subscribable<Epic2VerticalDeviationLabel>;

  // When the glideslope deviation for ILS approaches
  // meets the excessive deviation condition, the vertical
  // deviation scale flashes in amber for 5 seconds, then
  // displays steady in amber as long as the excessive
  // deviation conditions are met.
  // The excessive deviation condition occurs when the
  // vertical deviation exceeds 0.090 DDM, the radar
  // altimeter is less than 500 feet, and the vertical
  // deviation pointer is magenta.

  /** Whether vertical deviation exceeds normal range */
  excessiveVerticalDeviation: Subscribable<boolean>;

  /** Whether the vertical track alert is active */
  verticalTrackAlerting: Subscribable<boolean>

  /** Whether the vertical deviation indicator is inactive */
  verticalDeviationIndicatorInactive: Subscribable<boolean>
}

/** An implementation of the autopilot data provider. */
export class DefaultVerticalDeviationDataProvider implements VerticalDeviationDataProvider, Instrument {

  private readonly fmaSub: Subscription;
  private readonly approachDetailsSub: Subscription;

  private readonly rawLateralActive = Subject.create(APLateralModes.NONE);
  private readonly rawLateralArmed = Subject.create(APLateralModes.NONE);
  private readonly rawVerticalActive = Subject.create(APVerticalModes.NONE);
  private readonly rawVerticalArmed = Subject.create(APVerticalModes.NONE);
  private readonly rawVerticalApproachArmed = Subject.create(APVerticalModes.NONE);

  private readonly approachIsActive = Subject.create<boolean>(false);
  private readonly approachType = Subject.create<ExtendedApproachType>(ApproachType.APPROACH_TYPE_UNKNOWN);
  private readonly approachRnavType = Subject.create<RnavTypeFlags>(RnavTypeFlags.None);
  private readonly approachIsCircling = Subject.create<boolean>(false);
  private readonly approachSupportsGp = ConsumerSubject.create<boolean>(null, false);
  private readonly _approachSelectedRnavType = Subject.create<RnavMinima>(RnavMinima.None);
  public readonly approachSelectedRnavType = this._approachSelectedRnavType as Subscribable<RnavMinima>;

  private readonly vnavPathMode = ConsumerSubject.create<VNavPathMode>(null, VNavPathMode.None).pause();
  private readonly vnavState = ConsumerSubject.create<VNavState>(null, VNavState.Disabled).pause();
  private readonly vnavPathAvailable = ConsumerSubject.create<boolean>(null, false).pause();
  private readonly gpDistance = Subject.create<number | null>(null);
  private readonly courseNeedleHasGlideslope = Subject.create<boolean>(false);
  private readonly ghostNeedleHasGlideslope = Subject.create<boolean>(false);
  private readonly courseNeedleGlideslopeDeviation = Subject.create<number | null>(null);
  private readonly ghostNeedleGlideslopeDeviation = Subject.create<number | null>(null);
  private readonly _verticalTrackAlerting = ConsumerSubject.create<boolean>(null, false);
  public readonly verticalTrackAlerting = this._verticalTrackAlerting as Subscribable<boolean>;

  private readonly pausable: Subscription[] = [
    this.vnavPathMode,
    this.vnavState,
    this.vnavPathAvailable,
  ];

  private readonly _gpApproachPointerDeviation = Subject.create<number | null>(null);
  public readonly gpApproachPointerDeviation = this._gpApproachPointerDeviation as Subscribable<number | null>;

  private readonly _gpApproachPointerActive = MappedSubject.create(([approachActive, distance, deviation, approachSupportsGp]) => {
    if (approachSupportsGp && approachActive === true && distance !== null && deviation !== null) {
      return true;
    }
    return false;
  },
    this.approachIsActive,
    this.gpDistance,
    this._gpApproachPointerDeviation,
    this.approachSupportsGp
  );
  public readonly gpApproachPointerActive = this._gpApproachPointerActive as Subscribable<boolean>;

  private readonly _gpApproachPointerMode = MappedSubject.create(([verticalActive, verticalApproachArmed, vnavMode]) => {
    if (verticalActive === Epic2ApVerticalMode.VnavGlidePath) {
      return Epic2VerticalDeviationMode.Active;
    }
    if (verticalApproachArmed === APVerticalModes.GP) {
      if (vnavMode === VNavPathMode.PathActive) {
        // TODO: This may not be exactly the right criteria for Cyan Ghost
        return Epic2VerticalDeviationMode.GPGhostWithPreApproachActive;
      } else {
        return Epic2VerticalDeviationMode.Armed;
      }
    }
    return Epic2VerticalDeviationMode.Disarmed;
  },
    this.apDataProvider.verticalActive,
    this.apDataProvider.rawVerticalApproachArmed,
    this.vnavPathMode
  );
  public readonly gpApproachPointerMode = this._gpApproachPointerMode as Subscribable<Epic2VerticalDeviationMode>;

  private readonly _preApproachPointerDeviation = Subject.create<number | null>(null);
  public readonly preApproachPointerDeviation = this._preApproachPointerDeviation as Subscribable<number | null>;

  private readonly _preApproachPointerActive = MappedSubject.create(([pathAvailable, deviation, vdevActive]) => {
    if (pathAvailable && deviation !== null && vdevActive !== Epic2ApVerticalMode.VnavGlidePath) {
      return true;
    }
    return false;
  },
    this.vnavPathAvailable,
    this._preApproachPointerDeviation,
    this.apDataProvider.verticalActive
  );
  public readonly preApproachPointerActive = this._preApproachPointerActive as Subscribable<boolean>;

  private readonly _preApproachPointerMode = MappedSubject.create(([verticalActive]) => {
    switch (verticalActive) {
      case Epic2ApVerticalMode.VnavAltitudeHold:
        return Epic2VerticalDeviationMode.Armed;
      case Epic2ApVerticalMode.VnavPath:
        return Epic2VerticalDeviationMode.Active;
      default:
        return Epic2VerticalDeviationMode.Disarmed;
    }
  },
    this.apDataProvider.verticalActive
  );
  public readonly preApproachPointerMode = this._preApproachPointerMode as Subscribable<Epic2VerticalDeviationMode>;

  private readonly _gsApproachPointerActive = MappedSubject.create(([approachActive, approachType, courseNeedleHasGs, ghostNeedleHasGs]) => {
    const approachTypeIsGs =
      approachType === ApproachType.APPROACH_TYPE_ILS ||
      approachType === ApproachType.APPROACH_TYPE_LDA ||
      approachType === ApproachType.APPROACH_TYPE_SDF;

    if ((approachTypeIsGs && approachActive === true && ghostNeedleHasGs) || courseNeedleHasGs || ghostNeedleHasGs) {
      return true;
    }
    return false;
  },
    this.approachIsActive,
    this.approachType,
    this.courseNeedleHasGlideslope,
    this.ghostNeedleHasGlideslope
  );
  public readonly gsApproachPointerActive = this._gsApproachPointerActive as Subscribable<boolean>;

  private readonly _gsApproachPointerMode = MappedSubject.create(([verticalActive, verticalApproachArmed]) => {
    if (verticalActive === Epic2ApVerticalMode.GlideSlope) {
      return Epic2VerticalDeviationMode.Active;
    }
    if (verticalApproachArmed === APVerticalModes.GS) {
      return Epic2VerticalDeviationMode.Armed;
    }
    return Epic2VerticalDeviationMode.Disarmed;
  },
    this.apDataProvider.verticalActive,
    this.apDataProvider.rawVerticalApproachArmed
  );
  public readonly gsApproachPointerMode = this._gsApproachPointerMode as Subscribable<Epic2VerticalDeviationMode>;

  private readonly _gsApproachPointerDeviation = MappedSubject.create(([courseNeedleHasGs, ghostNeedleHasGs, courseNeedleDeviation, ghostNeedleDeviation]) => {
    if (courseNeedleHasGs) {
      return courseNeedleDeviation;
    }
    if (ghostNeedleHasGs) {
      return ghostNeedleDeviation;
    }
    return null;
  },
    this.courseNeedleHasGlideslope,
    this.ghostNeedleHasGlideslope,
    this.courseNeedleGlideslopeDeviation,
    this.ghostNeedleGlideslopeDeviation
  );
  public readonly gsApproachPointerDeviation = this._gsApproachPointerDeviation as Subscribable<number | null>;

  private readonly _approachPointerLabel = MappedSubject.create(([gsActive, gpActive, approachSelectedRnavType]) => {
    if (gsActive) {
      return Epic2VerticalDeviationLabel.GS;
    }
    if (gpActive) {
      if (approachSelectedRnavType === RnavMinima.LPV) {
        return Epic2VerticalDeviationLabel.LPV;
      }
      return Epic2VerticalDeviationLabel.VNAV;
    }
    return Epic2VerticalDeviationLabel.None;
  },
    this._gsApproachPointerActive,
    this._gpApproachPointerActive,
    this.approachSelectedRnavType
  );
  public readonly approachPointerLabel = this._approachPointerLabel as Subscribable<Epic2VerticalDeviationLabel>;

  private readonly _excessiveVerticalDeviation = Subject.create<boolean>(false);
  public readonly excessiveVerticalDeviation = this._excessiveVerticalDeviation as Subscribable<boolean>;

  private readonly _verticalDeviationIndicatorInactive = MappedSubject.create(
    SubscribableMapFunctions.nor(),
    this._preApproachPointerActive,
    this._gsApproachPointerActive,
    this._gpApproachPointerActive
  );
  public readonly verticalDeviationIndicatorInactive = this._verticalDeviationIndicatorInactive as Subscribable<boolean>;


  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param displayUnitIndex The index of this display unit.
   * @param navIndicators An instance of the nav indicators.
   * @param apDataProvider An instance of the AP Data Provider.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly displayUnitIndex: DisplayUnitIndices,
    private readonly navIndicators: Epic2NavIndicators,
    private readonly apDataProvider: DefaultAutopilotDataProvider
  ) {
    const sub = this.bus.getSubscriber<Epic2FmaEvents & VNavEvents & VNavDataEvents & Epic2LNavDataEvents & Epic2FmsEvents>();

    this.fmaSub = sub.on('epic2_fma_data').handle((fma) => {
      this.rawLateralActive.set(fma.lateralActive);
      this.rawLateralArmed.set(fma.lateralArmed);
      this.rawVerticalActive.set(fma.verticalActive);
      this.rawVerticalArmed.set(fma.verticalArmed);
      this.rawVerticalApproachArmed.set(fma.verticalApproachArmed);
    }, true);
    this.pausable.push(this.fmaSub);

    this.approachDetailsSub = sub.on('epic2_fms_approach_details_set').handle(details => {
      this.approachType.set(details.approachType);
      this.approachRnavType.set(details.approachRnavType);
      this.approachIsActive.set(details.approachIsActive);
      this.approachIsCircling.set(details.approachIsCircling);
      this._approachSelectedRnavType.set(details.selectedRnavMinima);
    }, true);
    this.pausable.push(this.approachDetailsSub);

    this.vnavPathMode.setConsumer(sub.on('vnav_path_mode'));
    this.vnavState.setConsumer(sub.on('vnav_state'));
    this.vnavPathAvailable.setConsumer(sub.on('vnav_path_available'));
    this._verticalTrackAlerting.setConsumer(sub.on('epic2_fms_vertical_track_alert'));
    this.approachSupportsGp.setConsumer(sub.on('approach_supports_gp'));

    const courseNeedle = this.navIndicators.get('courseNeedle');
    const ghostNeedle = this.navIndicators.get('ghostNeedle');

    courseNeedle.hasGlideSlope.pipe(this.courseNeedleHasGlideslope);
    courseNeedle.verticalDeviation.pipe(this.courseNeedleGlideslopeDeviation);
    ghostNeedle.hasGlideSlope.pipe(this.ghostNeedleHasGlideslope);
    ghostNeedle.verticalDeviation.pipe(this.ghostNeedleGlideslopeDeviation);

    this.monitor(sub);
  }

  /**
   * Method to monitor events and publish values.
   * @param sub Event Subscriptions
   */
  private monitor(sub: EventSubscriber<Epic2FmaEvents & VNavEvents & Epic2LNavDataEvents & Epic2FmsEvents>): void {
    sub.on('vnav_vertical_deviation').whenChangedBy(1).handle(v => {
      // console.log('actual deviation: ' + v);
      this._preApproachPointerDeviation.set(v >= Number.MAX_SAFE_INTEGER ? null : MathUtils.clamp(-v, -500, 500) / 500);
    });

    sub.on('gp_vertical_deviation').whenChangedBy(1).handle(v => {
      this._gpApproachPointerDeviation.set(v < -1000 ? null : MathUtils.clamp(-v, -500, 500) / 500);
    });

    sub.on('gp_distance').atFrequency(2).handle(v => {
      this.gpDistance.set(v < 0 ? null : v);
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

  /** Pause the data provider. */
  public pause(): void {
    for (const sub of this.pausable) {
      sub.pause();
    }
  }

  /** Resume the data provider. */
  public resume(): void {
    for (const sub of this.pausable) {
      sub.resume(true);
    }
  }
}
