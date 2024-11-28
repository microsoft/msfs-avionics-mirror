import {
  Accessible, AccessibleUtils, AdcEvents, AhrsEvents, APEvents, ArraySubject, AvionicsSystemState,
  AvionicsSystemStateEvent, BitFlags, ClockEvents, ComponentProps, ConsumerSubject, ConsumerValue, DisplayComponent,
  EventBus, ExpSmoother, FSComponent, GeoPoint, GNSSEvents, HorizonComponent, HorizonProjection,
  HorizonProjectionChangeType, HorizonSharedCanvasLayer, MappedSubject, MathUtils, MutableSubscribable,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableArray, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, UserSettingManager, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { SynVisUserSettingTypes } from '../../../settings/SynVisUserSettings';
import { AdcSystemEvents } from '../../../system/AdcSystem';
import { AhrsSystemEvents } from '../../../system/AhrsSystem';
import { AoaSystemEvents } from '../../../system/AoaSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../../../system/FmsPositionSystem';
import { TcasRaCommandDataProvider } from '../../../traffic/TcasRaCommandDataProvider';
import { FailureBox } from '../../common/FailureBox';
import { ArtificialHorizon, ArtificialHorizonOptions } from './ArtificialHorizon';
import { AttitudeAircraftSymbol, AttitudeAircraftSymbolFormat, AttitudeAircraftSymbolProps } from './AttitudeAircraftSymbol';
import { DefaultFlightDirectorDataProvider } from './FlightDirectorDataProvider';
import { FlightDirectorDualCue, FlightDirectorDualCueProps } from './FlightDirectorDualCue';
import { FlightDirectorFormat } from './FlightDirectorFormat';
import { FlightDirectorSingleCue, FlightDirectorSingleCueProps } from './FlightDirectorSingleCue';
import { FlightPathMarker, FlightPathMarkerProps } from './FlightPathMarker';
import { HorizonLine, HorizonLineOptions } from './HorizonLine';
import { HorizonOcclusionArea } from './HorizonOcclusionArea';
import { PitchLadder, PitchLadderProps } from './PitchLadder';
import { PitchLimitIndicator, PitchLimitIndicatorFormat } from './PitchLimitIndicator';
import { RollIndicator, RollIndicatorOptions, RollIndicatorScaleComponentFactory } from './RollIndicator';
import { RollLimitIndicators } from './RollLimitIndicators';
import { SyntheticVision } from './SyntheticVision';
import { TcasRaPitchCueLayer, TcasRaPitchCueLayerProps } from './TcasRaPitchCueLayer';

/**
 * Options for the pitch ladder.
 */
export type HorizonPitchLadderOptions = Pick<PitchLadderProps, 'clipBounds' | 'options'>;

/**
 * Options for the symbolic aircraft.
 */
export type AircraftSymbolOptions = Pick<AttitudeAircraftSymbolProps, 'color'>;

/**
 * Options for the flight director.
 */
export type FlightDirectorOptions = {
  /** The time constant used to smooth flight director pitch commands, in milliseconds. */
  pitchSmoothingTau?: number;

  /** The time constant used to smooth flight director bank commands, in milliseconds. */
  bankSmoothingTau?: number;
};

/**
 * Options for the single-cue flight director.
 */
export type FlightDirectorSingleCueOptions = Pick<FlightDirectorSingleCueProps, 'conformalBounds' | 'conformalBankLimit'>;

/**
 * Options for the dual-cue flight director.
 */
export type FlightDirectorDualCueOptions = Pick<FlightDirectorDualCueProps, 'conformalBounds' | 'pitchErrorFactor' | 'bankErrorFactor' | 'bankErrorConstant'>;

/**
 * Options for the flight path marker.
 */
export type FlightPathMarkerOptions = Pick<FlightPathMarkerProps, 'minGroundSpeed' | 'lookahead'>;

/**
 * Options for the roll limit indicators.
 */
export type HorizonRollLimitIndicatorsOptions = {
  /**
   * The roll angle magnitude at which to place the left limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  leftRollLimit: number | Accessible<number>;

  /**
   * The roll angle magnitude at which to place the right limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  rightRollLimit: number | Accessible<number>;

  /**
   * The duration of the indicators' easing animation, in milliseconds. The easing animation is used to smoothly
   * transition the indicators from one roll angle to another when the roll limits change. Defaults to `1000`.
   */
  easeDuration?: number;
};

/**
 * Options for the pitch limit indicator.
 */
export type HorizonPitchLimitIndicatorOptions = {
  /**
   * The pitch angle, in degrees, at which to position the indicator. A non-finite value or `NaN` will cause the
   * indicator to not be displayed.
   */
  pitchLimit?: number | Accessible<number>;

  /**
   * The angle of attack value, in degrees, at which to position the indicator. A non-finite value or `NaN` will cause
   * the indicator to not be displayed. Ignored if `pitchLimit` is defined.
   */
  aoaLimit?: number | Accessible<number>;

  /**
   * The normalized angle of attack value, at which to position the indicator. A non-finite value or `NaN` will cause
   * the indicator to not be displayed. Ignored if `pitchLimit` or `aoaLimit` is defined.
   */
  normAoaLimit?: number | Accessible<number>;

  /**
   * The time constant, in milliseconds, to apply to angle of attack smoothing when converting angle of attack limits
   * to pitch limits. A value less than or equal to zero is equivalent to no smoothing. Ignored if `pitchLimit` is
   * defined. Defaults to `0`.
   */
  aoaSmoothingTau?: number;

  /**
   * The offset of the airplane's pitch from the indicated pitch limit, in degrees, at which to show the indicator. For
   * example, a value of `-5` will cause the indicator to be shown once the airplane's pitch is greater than or equal
   * to the pitch limit minus 5 degrees.
   */
  showPitchOffsetThreshold: number | Accessible<number>;

  /**
   * The offset of the airplane's pitch from the indicated pitch limit, in degrees, at which to hide the indicator. For
   * example, a value of `-5` will cause the indicator to be hidden once the airplane's pitch is less than the pitch
   * limit minus 5 degrees. This value will be clamped to be less than or equal to `showPitchOffsetThreshold`.
   */
  hidePitchOffsetThreshold: number | Accessible<number>;
};

/**
 * Options for the TCAS resolution advisory pitch cue layer.
 */
export type TcasRaPitchCueLayerOptions = Pick<TcasRaPitchCueLayerProps, 'clipBounds' | 'conformalBounds' | 'tasSmoothingTau' | 'pitchSmoothingTau'>;

/**
 * Component props for HorizonDisplay.
 */
export interface HorizonDisplayProps extends ComponentProps {
  /** Event bus. */
  bus: EventBus;

  /** The index of the ADC that is the source of the horizon display's data. */
  adcIndex: number | Subscribable<number>;

  /** The index of the AHRS that is the source of the horizon display's data. */
  ahrsIndex: number | Subscribable<number>;

  /** The index of the FMS positioning system that is the source of the horizon display's data. */
  fmsPosIndex: number | Subscribable<number>;

  /**
   * The index of the angle of attack computer system that is the source of the horizon display's data. If not defined,
   * then the display will not have access to angle of attack data.
   */
  aoaIndex?: number | Subscribable<number>;

  /** The size, as `[width, height]` in pixels, of the horizon display. */
  projectedSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The projected offset of the center of the projection, as `[x, y]` in pixels. */
  projectedOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The update frequency, in hertz, of the horizon display. */
  updateFreq: number | Subscribable<number>;

  /** The string ID to assign to the synthetic vision layer's bound Bing instance. */
  bingId: string;

  /** The amount of time, in milliseconds, to delay binding the synthetic vision layer's Bing instance. Defaults to 0. */
  bingDelay?: number;

  /** Options for the artificial horizon. */
  artificialHorizonOptions: Readonly<ArtificialHorizonOptions>;

  /** Options for the horizon line. */
  horizonLineOptions: Readonly<HorizonLineOptions>;

  /** Options for the pitch ladder. */
  pitchLadderOptions: HorizonPitchLadderOptions;

  /** Options for the roll indicator. */
  rollIndicatorOptions: RollIndicatorOptions;

  /** Options for the symbolic aircraft. */
  aircraftSymbolOptions: AircraftSymbolOptions;

  /** Options for the flight director. */
  flightDirectorOptions?: Readonly<FlightDirectorOptions>;

  /** Options for the single-cue flight director. Required to display the single-cue director. */
  flightDirectorSingleCueOptions?: Readonly<FlightDirectorSingleCueOptions>;

  /** Options for the dual-cue flight director. Required to display the dual-cue director. */
  flightDirectorDualCueOptions?: Readonly<FlightDirectorDualCueOptions>;

  /** Options for the roll limit indicators. Required to display the roll limit indicators. */
  rollLimitIndicatorsOptions?: Readonly<HorizonRollLimitIndicatorsOptions>;

  /** Options for the pitch limit indicator. Required to display the pitch limit indicator. */
  pitchLimitIndicatorOptions?: Readonly<HorizonPitchLimitIndicatorOptions>;

  /** Options for the TCAS resolution advisory pitch cue layer. Required to display the TCAS RA pitch cue layer. */
  tcasRaPitchCueLayerOptions?: Readonly<TcasRaPitchCueLayerOptions>;

  /**
   * A provider of TCAS-II resolution advisory vertical speed command data. Required to display the TCAS RA pitch cue
   * layer.
   */
  tcasRaCommandDataProvider?: TcasRaCommandDataProvider;

  /**
   * Whether to support advanced SVT features. Advanced SVT features include:
   * * The ability to display horizon heading labels when SVT is disabled.
   * * The ability to display the flight path marker when SVT is disabled.
   */
  supportAdvancedSvt: boolean;

  /** Whether to show magnetic heading information instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** The flight director format to display. */
  flightDirectorFormat: FlightDirectorFormat | Subscribable<FlightDirectorFormat>;

  /** The set of occlusion areas to apply to certain horizon elements. If not defined, no occlusion will be applied. */
  occlusions?: SubscribableArray<HorizonOcclusionArea>;

  /** A manager for synthetic vision settings. */
  svtSettingManager: UserSettingManager<SynVisUserSettingTypes>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Normal field of view, in degrees. Defaults to 55 degrees. */
  normalFov?: number;

  /** Extended field of view, in degrees. Defaults to 110 degrees. */
  extendedFov?: number;

  /** A mutable subscribable to which to write whether SVT is enabled. */
  isSvtEnabled?: MutableSubscribable<any, boolean>;

  /** CSS class(es) to apply to the root of the horizon display. */
  class?: string | SubscribableSet<string>;
}

/**
 * Resolved options for the roll limit indicators.
 */
type RollLimitIndicatorsResolvedOptions = {
  /**
   * The roll angle magnitude at which to place the left limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  leftRollLimit: Accessible<number>;

  /**
   * The roll angle magnitude at which to place the right limit indicator, in degrees. A non-finite value or `NaN` will
   * cause the indicator to not be displayed.
   */
  rightRollLimit: Accessible<number>;

  /**
   * The duration of the indicators' easing animation, in milliseconds. The easing animation is used to smoothly
   * transition the indicators from one roll angle to another when the roll limits change.
   */
  easeDuration: number;
};

/**
 * Resolved base options for the pitch limit indicator.
 */
type PitchLimitIndicatorResolvedBaseOptions = {
  /**
   * The offset of the airplane's pitch from the indicated pitch limit, in degrees, at which to show the indicator. For
   * example, a value of `-5` will cause the indicator to be shown once the airplane's pitch is greater than or equal
   * to the pitch limit minus 5 degrees.
   */
  showPitchOffsetThreshold: Accessible<number>;

  /**
   * The offset of the airplane's pitch from the indicated pitch limit, in degrees, at which to hide the indicator. For
   * example, a value of `-5` will cause the indicator to be hidden once the airplane's pitch is less than the pitch
   * limit minus 5 degrees. This value will be clamped to be less than or equal to `showPitchOffsetThreshold`.
   */
  hidePitchOffsetThreshold: Accessible<number>;
};

/**
 * Resolved pitch limit options for the pitch limit indicator.
 */
type PitchLimitIndicatorResolvedPitchOptions = PitchLimitIndicatorResolvedBaseOptions & {
  /** The type of limit to use. */
  type: 'pitch';

  /** The pitch angle, in degrees, at which to position the indicator. */
  pitchLimit: Accessible<number>;
};

/**
 * Resolved angle of attack limit options for the pitch limit indicator.
 */
type PitchLimitIndicatorResolvedAoaOptions = PitchLimitIndicatorResolvedBaseOptions & {
  /** The type of limit to use. */
  type: 'aoa';

  /** The angle of attack value, in degrees, at which to position the indicator. */
  aoaLimit: Accessible<number>;

  /** The smoother to use to smooth angle of attack values. */
  aoaSmoother: ExpSmoother;
};

/**
 * Resolved normalized angle of attack limit options for the pitch limit indicator.
 */
type PitchLimitIndicatorResolvedNormAoaOptions = PitchLimitIndicatorResolvedBaseOptions & {
  /** The type of limit to use. */
  type: 'normAoa';

  /** The normalized angle of attack value, at which to position the indicator. */
  normAoaLimit: Accessible<number>;

  /** The smoother to use to smooth angle of attack values. */
  aoaSmoother: ExpSmoother;
};

/**
 * Resolved options for the pitch limit indicator.
 */
type PitchLimitIndicatorResolvedOptions
  = PitchLimitIndicatorResolvedPitchOptions
  | PitchLimitIndicatorResolvedAoaOptions
  | PitchLimitIndicatorResolvedNormAoaOptions;

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD horizon display. Includes an artificial horizon, attitude indicator,
 * aircraft symbol, flight director, and synthetic vision technology (SVT) display.
 */
export class HorizonDisplay extends DisplayComponent<HorizonDisplayProps> {
  private static readonly BING_FOV = 50; // degrees

  private static readonly DEFAULT_NORMAL_FOV = 55; // degrees
  private static readonly DEFAULT_EXTENDED_FOV = 110; // degrees

  private static readonly SVT_SUPPORTED_FMS_POS_MODES = [
    FmsPositionMode.Gps,
    FmsPositionMode.Hns,
    FmsPositionMode.Dme
  ];

  private readonly horizonRef = FSComponent.createRef<HorizonComponent>();

  private readonly projectionParams = {
    position: new GeoPoint(0, 0),
    altitude: 0,
    heading: 0,
    pitch: 0,
    roll: 0
  };

  private readonly adcIndex = SubscribableUtils.toSubscribable(this.props.adcIndex, true);
  private readonly ahrsIndex = SubscribableUtils.toSubscribable(this.props.ahrsIndex, true);
  private readonly fmsPosIndex = SubscribableUtils.toSubscribable(this.props.fmsPosIndex, true);
  private readonly aoaIndex = this.props.aoaIndex !== undefined ? SubscribableUtils.toSubscribable(this.props.aoaIndex, true) : undefined;

  private adcIndexSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;
  private aoaIndexSub?: Subscription;

  private readonly position = ConsumerSubject.create(null, new LatLongAlt(0, 0, 0));
  private readonly heading = ConsumerSubject.create(null, 0);
  private readonly pitch = ConsumerSubject.create(null, 0);
  private readonly roll = ConsumerSubject.create(null, 0);

  private readonly paramSubjects = [
    this.position,
    this.heading,
    this.pitch,
    this.roll
  ];

  private headingSub?: Subscription;
  private pitchSub?: Subscription;
  private rollSub?: Subscription;

  private readonly simRate = ConsumerSubject.create(null, 1);

  private readonly isOnGround = ConsumerValue.create(null, false);

  private readonly isAltitudeDataValid = ConsumerSubject.create(null, false);
  private readonly isAirspeedDataValid = ConsumerSubject.create(null, false);
  private readonly isTemperatureDataValid = ConsumerSubject.create(null, false);
  private readonly verticalSpeed = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? ConsumerSubject.create(null, 0)
    : undefined;
  private readonly tas = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? ConsumerSubject.create(null, 0)
    : undefined;

  private readonly ahrsState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly isHeadingDataValid = ConsumerSubject.create(null, true);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);
  private readonly turnCoordinatorBall = ConsumerSubject.create(null, 0);

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private readonly isAoaDataValid = ConsumerValue.create(null, false);
  private readonly aoa = ConsumerValue.create(null, 0);
  private readonly zeroLiftAoa = ConsumerValue.create(null, 0);
  private readonly stallAoa = ConsumerValue.create(null, 0);

  private readonly fdDataProvider = new DefaultFlightDirectorDataProvider(
    this.props.bus,
    this.props.flightDirectorOptions?.pitchSmoothingTau ?? 500 / Math.LN2,
    this.props.flightDirectorOptions?.bankSmoothingTau ?? 500 / Math.LN2
  );

  private readonly isSvtEnabled = MappedSubject.create(
    ([isHeadingDataValid, isAttitudeDataValid, fmsPosMode, svtEnabledSetting]): boolean => {
      return svtEnabledSetting && isHeadingDataValid && isAttitudeDataValid && HorizonDisplay.SVT_SUPPORTED_FMS_POS_MODES.includes(fmsPosMode);
    },
    this.isHeadingDataValid,
    this.isAttitudeDataValid,
    this.fmsPosMode,
    this.props.svtSettingManager.getSetting('svtEnabled')
  );

  private readonly horizonLineShowHeadingLabels = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isHeadingDataValid,
    this.props.svtSettingManager.getSetting('svtHeadingLabelShow'),
    this.props.supportAdvancedSvt ? Subject.create(true) : this.isSvtEnabled,
  );

  private readonly apMaxBankId = ConsumerSubject.create(null, 0);
  private readonly showLowBankArc = this.apMaxBankId.map(id => id === 1);

  private readonly rollLimitIndicatorsOptions = this.resolveRollLimitIndicatorsOptions();

  private readonly pitchLimitIndicatorOptions = this.resolvePitchLimitIndicatorOptions();
  private readonly showPitchLimitIndicator = this.pitchLimitIndicatorOptions ? Subject.create(false) : undefined;
  private readonly pitchLimit = this.pitchLimitIndicatorOptions ? Subject.create(0) : undefined;
  private readonly pitchLimitIndicatorFormat = this.pitchLimitIndicatorOptions
    ? SubscribableUtils.isSubscribable(this.props.flightDirectorFormat)
      ? this.props.flightDirectorFormat.map(format => format === FlightDirectorFormat.DualCue ? PitchLimitIndicatorFormat.DualCue : PitchLimitIndicatorFormat.SingleCue)
      : this.props.flightDirectorFormat === FlightDirectorFormat.DualCue ? PitchLimitIndicatorFormat.DualCue : PitchLimitIndicatorFormat.SingleCue
    : undefined;

  private readonly showTcasRaPitchCueLayer = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? MappedSubject.create(
      SubscribableMapFunctions.and(),
      this.isAttitudeDataValid,
      this.isAltitudeDataValid,
      this.isAirspeedDataValid,
      this.isTemperatureDataValid
    )
    : undefined;

  private readonly showFpm = this.props.supportAdvancedSvt
    ? MappedSubject.create(
      ([isHeadingDataValid, isAttitudeDataValid, isSvtEnabled, svtDisabledFpmShowSetting]): boolean => {
        return isHeadingDataValid && isAttitudeDataValid && (isSvtEnabled || svtDisabledFpmShowSetting);
      },
      this.isHeadingDataValid,
      this.isAttitudeDataValid,
      this.isSvtEnabled,
      this.props.svtSettingManager.getSetting('svtDisabledFpmShow')
    )
    : undefined;

  private readonly showFlightDirector = MappedSubject.create(
    ([declutter, isAttitudeDataValid, isFdActive]): boolean => !declutter && isAttitudeDataValid && isFdActive,
    this.props.declutter,
    this.isAttitudeDataValid,
    this.fdDataProvider.isFdActive
  );

  private readonly showFlightDirectorSingleCue = SubscribableUtils.isSubscribable(this.props.flightDirectorFormat)
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorFormat.SingleCue,
      this.showFlightDirector,
      this.props.flightDirectorFormat
    )
    : this.props.flightDirectorFormat === FlightDirectorFormat.SingleCue;

  private readonly showFlightDirectorDualCue = SubscribableUtils.isSubscribable(this.props.flightDirectorFormat)
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorFormat.DualCue,
      this.showFlightDirector,
      this.props.flightDirectorFormat
    )
    : this.props.flightDirectorFormat === FlightDirectorFormat.DualCue;

  private readonly aircraftSymbolFormat = SubscribableUtils.isSubscribable(this.props.flightDirectorFormat)
    ? this.props.flightDirectorFormat.map(format => format === FlightDirectorFormat.DualCue ? AttitudeAircraftSymbolFormat.DualCue : AttitudeAircraftSymbolFormat.SingleCue)
    : this.props.flightDirectorFormat === FlightDirectorFormat.DualCue ? AttitudeAircraftSymbolFormat.DualCue : AttitudeAircraftSymbolFormat.SingleCue;

  private readonly normalFov = this.props.normalFov ?? HorizonDisplay.DEFAULT_NORMAL_FOV;
  private readonly extendedFov = this.props.extendedFov ?? HorizonDisplay.DEFAULT_EXTENDED_FOV;

  private readonly fov = this.props.supportAdvancedSvt
    ? this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.normalFov)
    : this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.extendedFov);

  private readonly nonSvtFovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
  private readonly svtFovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly fovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));

  private readonly occlusions = this.props.occlusions ?? ArraySubject.create();

  private readonly ahrsAlignState = MappedSubject.create(
    ([ahrsState, isAttitudeDataValid]) => {
      const isAhrsOk = ahrsState === undefined || ahrsState.current === undefined || ahrsState.current === AvionicsSystemState.On;

      if (isAhrsOk) {
        return isAttitudeDataValid ? 'ok' : 'failed';
      } else {
        return ahrsState.current === AvionicsSystemState.Initializing ? 'aligning' : 'failed';
      }
    },
    this.ahrsState,
    this.isAttitudeDataValid
  );
  private readonly ahrsAlignDisplay = this.ahrsAlignState.map(state => state === 'aligning' ? '' : 'none');
  private readonly showFailureBox = this.ahrsAlignState.map(state => state === 'failed');

  private isAlive = true;
  private isAwake = false;

  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);
  private lastUpdateTime: number | undefined;

  private updateFreqSub?: Subscription;
  private updateCycleSub?: Subscription;
  private isSvtEnabledPipe?: Subscription;

  private readonly updateCycleHandler = this.onUpdated.bind(this);

  /**
   * Resolves pitch limit indicator options passed to this display.
   * @returns Resolved pitch limit indicator options, or `undefined` if the indicator should not be displayed.
   */
  private resolvePitchLimitIndicatorOptions(): PitchLimitIndicatorResolvedOptions | undefined {
    const options = this.props.pitchLimitIndicatorOptions;

    if (options) {
      if (options.pitchLimit !== undefined) {
        return {
          type: 'pitch',
          pitchLimit: AccessibleUtils.toAccessible(options.pitchLimit, true),
          showPitchOffsetThreshold: AccessibleUtils.toAccessible(options.showPitchOffsetThreshold, true),
          hidePitchOffsetThreshold: AccessibleUtils.toAccessible(options.hidePitchOffsetThreshold, true),
        };
      } else if (this.aoaIndex !== undefined) {
        if (options.aoaLimit !== undefined) {
          return {
            type: 'aoa',
            aoaLimit: AccessibleUtils.toAccessible(options.aoaLimit, true),
            aoaSmoother: new ExpSmoother(options.aoaSmoothingTau ?? 0),
            showPitchOffsetThreshold: AccessibleUtils.toAccessible(options.showPitchOffsetThreshold, true),
            hidePitchOffsetThreshold: AccessibleUtils.toAccessible(options.hidePitchOffsetThreshold, true),
          };
        } else if (options.normAoaLimit !== undefined) {
          return {
            type: 'normAoa',
            normAoaLimit: AccessibleUtils.toAccessible(options.normAoaLimit, true),
            aoaSmoother: new ExpSmoother(options.aoaSmoothingTau ?? 0),
            showPitchOffsetThreshold: AccessibleUtils.toAccessible(options.showPitchOffsetThreshold, true),
            hidePitchOffsetThreshold: AccessibleUtils.toAccessible(options.hidePitchOffsetThreshold, true),
          };
        }
      }
    }

    return undefined;
  }

  /**
   * Resolves roll limit indicators options passed to this display.
   * @returns Resolved roll limit indicators options, or `undefined` if the indicators should not be displayed.
   */
  private resolveRollLimitIndicatorsOptions(): RollLimitIndicatorsResolvedOptions | undefined {
    const options = this.props.rollLimitIndicatorsOptions;

    if (options) {
      return {
        leftRollLimit: AccessibleUtils.toAccessible(options.leftRollLimit, true),
        rightRollLimit: AccessibleUtils.toAccessible(options.rightRollLimit, true),
        easeDuration: options.easeDuration ?? 1000
      };
    }

    return undefined;
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.horizonRef.instance.projection.onChange(this.onProjectionChanged.bind(this));

    if (!this.isAwake) {
      this.horizonRef.instance.sleep();
    }

    const sub = this.props.bus.getSubscriber<ClockEvents & AdcEvents & AhrsEvents & GNSSEvents & APEvents>();

    this.simRate.setConsumer(sub.on('simRate'));

    this.position.sub(pos => {
      this.projectionParams.position.set(pos.lat, pos.long);
      this.projectionParams.altitude = pos.alt;
    }, true);

    this.headingSub = this.heading.sub(heading => {
      this.projectionParams.heading = heading;
    }, true);

    this.pitchSub = this.pitch.sub(pitch => {
      this.projectionParams.pitch = -pitch;
    }, true);

    this.rollSub = this.roll.sub(roll => {
      this.projectionParams.roll = -roll;
    }, true);

    this.isAttitudeDataValid.sub(isValid => {
      if (isValid) {
        this.headingSub?.resume(true);
        this.pitchSub?.resume(true);
        this.rollSub?.resume(true);
      } else {
        this.headingSub?.pause();
        this.pitchSub?.pause();
        this.rollSub?.pause();

        this.projectionParams.heading = 0;
        this.projectionParams.pitch = 0;
        this.projectionParams.roll = 0;
      }
    }, true);

    this.isOnGround.setConsumer(sub.on('on_ground'));

    this.adcIndexSub = this.adcIndex.sub(this.onAdcIndexChanged.bind(this), true);
    this.ahrsIndexSub = this.ahrsIndex.sub(this.onAhrsIndexChanged.bind(this), true);
    this.fmsPosIndexSub = this.fmsPosIndex.sub(this.onFmsPosIndexChanged.bind(this), true);
    this.aoaIndexSub = this.aoaIndex?.sub(this.onAoaIndexChanged.bind(this), true);

    this.apMaxBankId.setConsumer(sub.on('ap_max_bank_id'));

    const svtEndpointsPipe = this.svtFovEndpoints.pipe(this.fovEndpoints, true);

    this.isSvtEnabled.sub(isEnabled => {
      if (isEnabled) {
        svtEndpointsPipe.resume(true);
      } else {
        svtEndpointsPipe.pause();
        this.fovEndpoints.set(this.nonSvtFovEndpoints);
      }
    }, true);

    this.fdDataProvider.init(!this.isAwake);

    if (this.props.isSvtEnabled) {
      this.isSvtEnabledPipe = this.isSvtEnabled.pipe(this.props.isSvtEnabled);
    }

    this.recomputeSvtFovEndpoints(this.horizonRef.instance.projection);

    this.updateFreqSub = this.updateFreq?.sub(freq => {
      this.updateCycleSub?.destroy();

      this.updateCycleSub = this.props.bus.getSubscriber<ClockEvents>()
        .on('realTime')
        .atFrequency(freq)
        .handle(this.updateCycleHandler, !this.isAwake);
    }, true);
  }

  /**
   * Responds to when the index of the ADC from which this display sources data changes.
   * @param index The new index of the ADC from which this display sources data.
   */
  private onAdcIndexChanged(index: number): void {
    if (index < 1) {
      this.verticalSpeed?.reset(0);
      this.tas?.reset(0);
      this.isAltitudeDataValid.reset(false);
      this.isAirspeedDataValid.reset(false);
      this.isTemperatureDataValid.reset(false);
    } else {
      const sub = this.props.bus.getSubscriber<AdcSystemEvents>();
      this.verticalSpeed?.setConsumerWithDefault(sub.on(`adc_vertical_speed_${index}`), 0);
      this.tas?.setConsumerWithDefault(sub.on(`adc_tas_${index}`), 0);
      this.isAltitudeDataValid.setConsumerWithDefault(sub.on(`adc_altitude_data_valid_${index}`), false);
      this.isAirspeedDataValid.setConsumerWithDefault(sub.on(`adc_airspeed_data_valid_${index}`), false);
      this.isTemperatureDataValid.setConsumerWithDefault(sub.on(`adc_temperature_data_valid_${index}`), false);
    }
  }

  /**
   * Responds to when the index of the AHRS from which this display sources data changes.
   * @param index The new index of the AHRS from which this display sources data.
   */
  private onAhrsIndexChanged(index: number): void {
    if (index < 1) {
      this.heading.reset(0);
      this.pitch.reset(0);
      this.roll.reset(0);

      this.turnCoordinatorBall.reset(0);

      this.ahrsState.reset(undefined);
      this.isHeadingDataValid.reset(false);
      this.isAttitudeDataValid.reset(false);
    } else {
      const sub = this.props.bus.getSubscriber<AhrsSystemEvents>();

      this.heading.setConsumerWithDefault(sub.on(`ahrs_hdg_deg_true_${index}`), 0);
      this.pitch.setConsumerWithDefault(sub.on(`ahrs_pitch_deg_${index}`), 0);
      this.roll.setConsumerWithDefault(sub.on(`ahrs_roll_deg_${index}`), 0);

      this.turnCoordinatorBall.setConsumerWithDefault(sub.on(`ahrs_turn_coordinator_ball_${index}`), 0);

      this.ahrsState.setConsumerWithDefault(sub.on(`ahrs_state_${index}`), undefined);
      this.isHeadingDataValid.setConsumerWithDefault(sub.on(`ahrs_heading_data_valid_${index}`), false);
      this.isAttitudeDataValid.setConsumerWithDefault(sub.on(`ahrs_attitude_data_valid_${index}`), false);
    }
  }

  /**
   * Responds to when the index of the FMS positioning system from which this display sources data changes.
   * @param index The new index of the FMS positioning system from which this display sources data.
   */
  private onFmsPosIndexChanged(index: number): void {
    if (index < 1) {
      this.position.setConsumer(null);
      this.fmsPosMode.reset(FmsPositionMode.None);
    } else {
      const sub = this.props.bus.getSubscriber<FmsPositionSystemEvents>();
      this.position.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
      this.fmsPosMode.setConsumerWithDefault(sub.on(`fms_pos_mode_${index}`), FmsPositionMode.None);
    }
  }

  /**
   * Responds to when the index of the angle of attack computer system from which this display sources data changes.
   * @param index The new index of the angle of attack computer system from which this display sources data.
   */
  private onAoaIndexChanged(index: number): void {
    if (index < 1) {
      this.isAoaDataValid.reset(false);
      this.aoa.reset(0);
      this.zeroLiftAoa.reset(0);
      this.stallAoa.reset(0);
    } else {
      const sub = this.props.bus.getSubscriber<AoaSystemEvents>();
      this.isAoaDataValid.setConsumerWithDefault(sub.on(`aoa_data_valid_${index}`), false);
      this.aoa.setConsumerWithDefault(sub.on(`aoa_aoa_${index}`), 0);
      this.zeroLiftAoa.setConsumerWithDefault(sub.on(`aoa_zero_lift_aoa_${index}`), 0);
      this.stallAoa.setConsumerWithDefault(sub.on(`aoa_stall_aoa_${index}`), 0);
    }
  }

  /**
   * Wakes this horizon display. While awake, this display will be updated.
   * @throws Error if this horizon display is dead.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('HorizonDisplay: cannot wake a dead display');
    }

    if (this.isAwake) {
      return;
    }

    this.isAwake = true;

    for (const subject of this.paramSubjects) {
      subject.resume();
    }

    this.fdDataProvider.resume();

    this.horizonRef.getOrDefault()?.wake();
    this.updateCycleSub?.resume(true);
  }

  /**
   * Puts this horizon display to sleep. While asleep, this display will not be updated.
   * @throws Error if this horizon display is dead.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('HorizonDisplay: cannot sleep a dead display');
    }

    if (!this.isAwake) {
      return;
    }

    this.isAwake = false;

    for (const subject of this.paramSubjects) {
      subject.pause();
    }

    this.fdDataProvider.pause();

    this.horizonRef.getOrDefault()?.sleep();
    this.updateCycleSub?.pause();
    this.lastUpdateTime = undefined;
  }

  /**
   * Responds to changes in this horizon display's projection.
   * @param projection This display's horizon projection.
   * @param changeFlags The types of changes made to the projection.
   */
  private onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
    if (BitFlags.isAny(
      changeFlags,
      HorizonProjectionChangeType.ProjectedOffset
      | HorizonProjectionChangeType.ProjectedSize
    )) {
      this.recomputeSvtFovEndpoints(projection);
    }
  }

  /**
   * Recomputes the endpoints at which the field of view of this display's projection is measured when synthetic
   * vision is enabled.
   * @param projection This display's horizon projection.
   */
  private recomputeSvtFovEndpoints(projection: HorizonProjection): void {
    const projectedSize = projection.getProjectedSize();
    const projectedOffset = projection.getProjectedOffset();
    const offsetCenterProjected = projection.getOffsetCenterProjected();

    // If there is a projected offset, then the Bing texture for synthetic vision needs to be overdrawn. This reduces
    // the effective FOV of the Bing texture if it is overdrawn vertically. In order to match this reduced FOV with the
    // horizon projection, we need to adjust the FOV endpoints so that they span the height of the entire Bing texture.

    const yOverdraw = Math.abs(projectedOffset[1]);
    const bingHeight = projectedSize[1] + yOverdraw * 2;

    const top = offsetCenterProjected[1] - bingHeight / 2;
    const bottom = top + bingHeight;

    this.svtFovEndpoints.set(
      0.5, top / projectedSize[1],
      0.5, bottom / projectedSize[1]
    );
  }

  /**
   * This method is called every update cycle.
   * @param time The current time, as a UNIX timestamp in milliseconds.
   */
  private onUpdated(time: number): void {
    const dt = this.lastUpdateTime === undefined
      ? 0
      : MathUtils.clamp(time - this.lastUpdateTime, 0, 2000) * this.simRate.get();

    this.fdDataProvider.update(time);

    this.horizonRef.instance.projection.set(this.projectionParams);

    this.updatePitchLimitIndicatorParams(dt);

    this.horizonRef.instance.update(time);

    this.lastUpdateTime = time;
  }

  /**
   * Updates the parameters for this display's pitch limit indicator.
   * @param dt The elapsed time since the last update, in milliseconds.
   */
  private updatePitchLimitIndicatorParams(dt: number): void {
    if (!this.pitchLimitIndicatorOptions) {
      return;
    }

    const options = this.pitchLimitIndicatorOptions;

    if (!this.isAttitudeDataValid.get() || this.isOnGround.get()) {
      if (options.type !== 'pitch') {
        options.aoaSmoother.reset();
      }
      this.showPitchLimitIndicator!.set(false);
      return;
    }

    const pitch = this.horizonRef.instance.projection.getPitch();

    let pitchLimit = NaN;
    if (options.type === 'pitch') {
      pitchLimit = options.pitchLimit.get();
    } else {
      if (this.isAoaDataValid.get()) {
        const aoa = options.aoaSmoother.next(this.aoa.get(), dt);

        let aoaLimit: number;
        if (options.type === 'normAoa') {
          aoaLimit = MathUtils.lerp(options.normAoaLimit.get(), 0, 1, this.zeroLiftAoa.get(), this.stallAoa.get());
        } else {
          aoaLimit = options.aoaLimit.get();
        }

        pitchLimit = pitch + aoaLimit - aoa;
      } else {
        options.aoaSmoother.reset();
      }
    }

    const isVisible = this.showPitchLimitIndicator!.get();
    const showThreshold = options.hidePitchOffsetThreshold.get();
    const hideThreshold = Math.min(options.hidePitchOffsetThreshold.get(), showThreshold);

    const show = isFinite(pitchLimit)
      && pitch >= pitchLimit + (isVisible ? hideThreshold : showThreshold);

    this.showPitchLimitIndicator!.set(show);
    if (show) {
      this.pitchLimit!.set(pitchLimit);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    const projection = new HorizonProjection(100, 100, 60);

    return (
      <HorizonComponent
        ref={this.horizonRef}
        projection={projection}
        projectedSize={this.props.projectedSize}
        fov={this.fov}
        fovEndpoints={this.fovEndpoints}
        projectedOffset={this.props.projectedOffset}
        class={this.props.class}
      >
        <SyntheticVision
          projection={projection}
          bingId={this.props.bingId}
          bingDelay={this.props.bingDelay}
          isEnabled={this.isSvtEnabled}
        />
        <HorizonSharedCanvasLayer projection={projection}>
          <ArtificialHorizon
            show={MappedSubject.create(
              ([isAttitudeDataValid, isSvtEnabled]): boolean => isAttitudeDataValid && !isSvtEnabled,
              this.isAttitudeDataValid,
              this.isSvtEnabled
            )}
            options={this.props.artificialHorizonOptions}
          />
          <HorizonLine
            show={this.isAttitudeDataValid}
            showHeadingLabels={this.horizonLineShowHeadingLabels}
            useMagneticHeading={this.props.useMagneticHeading}
            approximate={this.isSvtEnabled.map(SubscribableMapFunctions.not())}
            occlusions={this.occlusions}
            options={this.props.horizonLineOptions}
          />
        </HorizonSharedCanvasLayer>
        <PitchLadder
          projection={projection}
          show={this.isAttitudeDataValid}
          isSVTEnabled={this.isSvtEnabled}
          clipBounds={this.props.pitchLadderOptions.clipBounds}
          options={this.props.pitchLadderOptions.options}
        />
        <div class='ahrs-align-msg' style={{ 'display': this.ahrsAlignDisplay }}>AHRS ALIGN: Keep Wings Level</div>
        {this.props.tcasRaPitchCueLayerOptions !== undefined && this.props.tcasRaCommandDataProvider !== undefined && (
          <TcasRaPitchCueLayer
            projection={projection}
            show={this.showTcasRaPitchCueLayer!}
            dataProvider={this.props.tcasRaCommandDataProvider}
            verticalSpeed={this.verticalSpeed!}
            tas={this.tas!}
            simRate={this.simRate}
            {...this.props.tcasRaPitchCueLayerOptions}
          />
        )}
        <RollIndicator
          projection={projection}
          show={Subject.create(true)}
          showSlipSkid={this.isAttitudeDataValid}
          showLowBankArc={this.showLowBankArc}
          turnCoordinatorBall={this.turnCoordinatorBall}
          options={this.props.rollIndicatorOptions}
          scaleComponents={this.createRollScaleComponentFactories()}
        />
        <FlightPathMarker
          projection={projection}
          bus={this.props.bus}
          show={this.showFpm ?? this.isSvtEnabled}
        />
        {
          this.showFlightDirectorSingleCue !== false && this.props.flightDirectorSingleCueOptions !== undefined && (
            <FlightDirectorSingleCue
              projection={projection}
              show={this.showFlightDirectorSingleCue === true ? this.showFlightDirector : this.showFlightDirectorSingleCue}
              fdPitch={this.fdDataProvider.fdPitch}
              fdBank={this.fdDataProvider.fdBank}
              {...this.props.flightDirectorSingleCueOptions}
            />
          )
        }
        <AttitudeAircraftSymbol
          projection={projection}
          show={Subject.create(true)}
          format={this.aircraftSymbolFormat}
          color={this.props.aircraftSymbolOptions.color}
        />
        {
          this.showFlightDirectorDualCue !== false && this.props.flightDirectorDualCueOptions !== undefined && (
            <FlightDirectorDualCue
              projection={projection}
              show={this.showFlightDirectorDualCue === true ? this.showFlightDirector : this.showFlightDirectorDualCue}
              fdPitch={this.fdDataProvider.fdPitch}
              fdBank={this.fdDataProvider.fdBank}
              {...this.props.flightDirectorDualCueOptions}
            />
          )
        }
        {this.pitchLimitIndicatorOptions !== undefined && (
          <PitchLimitIndicator
            projection={projection}
            show={this.showPitchLimitIndicator!}
            format={this.pitchLimitIndicatorFormat!}
            pitchLimit={this.pitchLimit!}
            clipBounds={this.props.pitchLadderOptions.clipBounds}
          />
        )}
        <FailureBox show={this.showFailureBox} class='attitude-failure-box' />
      </HorizonComponent>
    );
  }

  /**
   * Creates roll scale component factories for this display's roll indicator.
   * @returns An array containing the roll scale component factories for this display's roll indicator.
   */
  private createRollScaleComponentFactories(): RollIndicatorScaleComponentFactory[] {
    const factories: RollIndicatorScaleComponentFactory[] = [];

    if (this.rollLimitIndicatorsOptions) {
      factories.push((projection, scaleParams) => {
        return (
          <RollLimitIndicators
            projection={projection}
            scaleParams={scaleParams}
            show={this.isAttitudeDataValid}
            leftRollLimit={this.rollLimitIndicatorsOptions!.leftRollLimit}
            rightRollLimit={this.rollLimitIndicatorsOptions!.rightRollLimit}
            easeDuration={this.rollLimitIndicatorsOptions!.easeDuration}
          />
        );
      });
    }

    return factories;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    for (const subject of this.paramSubjects) {
      subject.destroy();
    }

    this.fdDataProvider.destroy();

    this.isAltitudeDataValid.destroy();
    this.isAirspeedDataValid.destroy();
    this.isTemperatureDataValid.destroy();
    this.verticalSpeed?.destroy();
    this.tas?.destroy();
    this.ahrsState.destroy();
    this.isHeadingDataValid.destroy();
    this.isAttitudeDataValid.destroy();
    this.turnCoordinatorBall.destroy();
    this.fmsPosMode.destroy();
    this.isAoaDataValid.destroy();
    this.aoa.destroy();
    this.zeroLiftAoa.destroy();
    this.stallAoa.destroy();
    this.isSvtEnabled.destroy();
    this.apMaxBankId.destroy();
    this.horizonLineShowHeadingLabels.destroy();
    this.showFpm?.destroy();
    this.showFlightDirector.destroy();

    if (SubscribableUtils.isSubscribable(this.pitchLimitIndicatorFormat)) {
      this.pitchLimitIndicatorFormat.destroy();
    }

    if (SubscribableUtils.isSubscribable(this.aircraftSymbolFormat)) {
      this.aircraftSymbolFormat.destroy();
    }

    if (SubscribableUtils.isSubscribable(this.showFlightDirectorSingleCue)) {
      this.showFlightDirectorSingleCue.destroy();
    }

    if (SubscribableUtils.isSubscribable(this.showFlightDirectorDualCue)) {
      this.showFlightDirectorDualCue.destroy();
    }

    this.updateFreqSub?.destroy();
    this.updateCycleSub?.destroy();
    this.adcIndexSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();
    this.aoaIndexSub?.destroy();
    this.isSvtEnabledPipe?.destroy();

    this.horizonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
