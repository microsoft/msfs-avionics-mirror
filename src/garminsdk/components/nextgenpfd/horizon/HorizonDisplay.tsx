/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  AdcEvents, AhrsEvents, APEvents, ArraySubject, AvionicsSystemState, AvionicsSystemStateEvent, BitFlags, ClockEvents,
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, GeoPoint, GNSSEvents, HorizonComponent,
  HorizonProjection, HorizonProjectionChangeType, HorizonSharedCanvasLayer, MappedSubject, MutableSubscribable,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableArray, SubscribableMapFunctions, SubscribableSet,
  SubscribableUtils, Subscription, UserSettingManager, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { SynVisUserSettingTypes } from '../../../settings/SynVisUserSettings';
import { AdcSystemEvents } from '../../../system/AdcSystem';
import { AhrsSystemEvents } from '../../../system/AhrsSystem';
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
import { RollIndicator, RollIndicatorOptions } from './RollIndicator';
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
  artificialHorizonOptions: ArtificialHorizonOptions;

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

  private adcIndexSub?: Subscription;
  private ahrsIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;

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

  private readonly adcState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);

  private readonly ahrsState = ConsumerSubject.create<AvionicsSystemStateEvent | undefined>(null, undefined);
  private readonly isHeadingDataValid = ConsumerSubject.create(null, true);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private readonly verticalSpeed = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? ConsumerSubject.create(null, 0)
    : undefined;
  private readonly tas = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? ConsumerSubject.create(null, 0)
    : undefined;

  private readonly turnCoordinatorBall = ConsumerSubject.create(null, 0);

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

  private readonly showTcasRaPitchCueLayer = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? MappedSubject.create(
      ([isAttitudeDataValid, adcState]) => isAttitudeDataValid && adcState !== undefined && (adcState.current === undefined || adcState.current === AvionicsSystemState.On),
      this.isAttitudeDataValid,
      this.adcState,
    )
    : undefined;

  private readonly showFpm = this.props.supportAdvancedSvt
    ? MappedSubject.create(
      ([isHeadingDataValid, isAttitudeDataValid, svtEnabledSetting, svtDisabledFpmShowSetting]): boolean => {
        return isHeadingDataValid && isAttitudeDataValid && (svtEnabledSetting || svtDisabledFpmShowSetting);
      },
      this.isHeadingDataValid,
      this.isAttitudeDataValid,
      this.props.svtSettingManager.getSetting('svtEnabled'),
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
  private isAwake = true;

  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);

  private updateFreqSub?: Subscription;
  private updateCycleSub?: Subscription;
  private isSvtEnabledPipe?: Subscription;

  private readonly updateCycleHandler = this.onUpdated.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.horizonRef.instance.projection.onChange(this.onProjectionChanged.bind(this));

    if (!this.isAwake) {
      this.horizonRef.instance.sleep();
    }

    const sub = this.props.bus.getSubscriber<
      ClockEvents & AdcEvents & AhrsEvents & GNSSEvents & AdcSystemEvents & AhrsSystemEvents & FmsPositionSystemEvents
      & APEvents
    >();

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

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.verticalSpeed?.setConsumer(sub.on(`adc_vertical_speed_${index}`));
      this.tas?.setConsumer(sub.on(`adc_tas_${index}`));

      this.adcState.setConsumer(sub.on(`adc_state_${index}`));
    }, true);

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.heading.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
      this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
      this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));

      this.turnCoordinatorBall.setConsumer(sub.on(`ahrs_turn_coordinator_ball_${index}`));

      this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
      this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
    }, true);

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.position.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

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
  }

  /**
   * Responds to changes in this horizon display's projection.
   * @param projection This display's horizon projection.
   * @param changeFlags The types of changes made to the projection.
   */
  public onProjectionChanged(projection: HorizonProjection, changeFlags: number): void {
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
    this.fdDataProvider.update(time);

    this.horizonRef.instance.projection.set(this.projectionParams);
    this.horizonRef.instance.update(time);
  }

  /** @inheritdoc */
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
        <FailureBox show={this.showFailureBox} class='attitude-failure-box' />
      </HorizonComponent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    for (const subject of this.paramSubjects) {
      subject.destroy();
    }

    this.fdDataProvider.destroy();

    this.adcState.destroy();
    this.ahrsState.destroy();
    this.isHeadingDataValid.destroy();
    this.isAttitudeDataValid.destroy();
    this.fmsPosMode.destroy();
    this.isSvtEnabled.destroy();
    this.apMaxBankId.destroy();
    this.horizonLineShowHeadingLabels.destroy();
    this.showFpm?.destroy();
    this.showFlightDirector.destroy();

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
    this.isSvtEnabledPipe?.destroy();

    this.horizonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}