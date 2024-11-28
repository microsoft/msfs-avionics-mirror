/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  APEvents, ArraySubject, BitFlags, ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, GeoPoint, HorizonComponent,
  HorizonProjection, HorizonProjectionChangeType, HorizonSharedCanvasLayer, MappedSubject, MathUtils, MutableSubscribable, Subject, Subscribable,
  SubscribableArray, SubscribableMapFunctions, SubscribableSet, SubscribableUtils, Subscription, UserSettingManager, Vec2Math, Vec2Subject, VecNMath,
  VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import {
  AirspeedDataProvider, AltitudeDataProvider, AttitudeDataProvider, AutopilotDataProvider, Epic2MaxBankIndex, FlightDirectorMode, HeadingDataProvider,
  InertialDataProvider, NavigationSourceDataProvider, PfdAliasedUserSettingTypes, RadioAltimeterDataProvider, StallWarningDataProvider,
  TcasRaCommandDataProvider
} from '@microsoft/msfs-epic2-shared';

// import { TcasRaCommandDataProvider } from '../../../traffic/TcasRaCommandDataProvider';
import { ArtificialHorizon, ArtificialHorizonOptions } from './ArtificialHorizon';
import { AttitudeAircraftSymbol, AttitudeAircraftSymbolFormat, AttitudeAircraftSymbolProps } from './AttitudeAircraftSymbol';
import { AttitudeFailureFlag } from './AttitudeFailureFlag';
import { ExpandedLocalizerDisplay } from './ExpandedLocalizerDisplay';
import { DefaultFlightDirectorDataProvider } from './FlightDirectorDataProvider';
import { FlightDirectorDualCue, FlightDirectorDualCueProps } from './FlightDirectorDualCue';
import { FlightDirectorFltPathCue, FlightDirectorFltPathCueProps } from './FlightDirectorFltPathCue';
import { FlightDirectorSingleCue, FlightDirectorSingleCueProps } from './FlightDirectorSingleCue';
import { FlightPathMarker, FlightPathMarkerProps } from './FlightPathMarker';
import { HorizonLine, HorizonLineOptions } from './HorizonLine';
import { HorizonOcclusionArea } from './HorizonOcclusionArea';
import { PitchLadder, PitchLadderProps } from './PitchLadder';
import { RadioAltitudeDisplay } from './RadioAltitudeDisplay';
import { RollIndicator, RollIndicatorOptions } from './RollIndicator';
import { StallAnnunciator } from './StallAnnunciator';
import { SyntheticVision } from './SyntheticVision';
import { TcasRaPitchCueLayer, TcasRaPitchCueLayerProps } from './TcasRaPitchCueLayer';
import { TurnRateIndicator } from './TurnRateIndicator';

import './HorizonDisplay.css';

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
 * Options for the flt-pth flight director.
 */
export type FlightDirectorFltPathCueOptions = Pick<FlightDirectorFltPathCueProps, 'bounds' | 'pitchErrorFactor' | 'bankErrorFactor'>;

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

  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;

  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;

  /** The attitude data provider to use. */
  attitudeDataProvider: AttitudeDataProvider;

  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;

  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;

  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;

  /** The inertial data provider to use. */
  inertialDataProvider: InertialDataProvider;

  /** The radio altimeter data provider to use. */
  radioAltimeterDataProvider: RadioAltimeterDataProvider;

  /** The stall warning data provider to use. */
  stallWarningDataProvider: StallWarningDataProvider;

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

  /** Options for the dual-cue flight director. Required to display the dual-cue director. */
  flightDirectorFltPthCueOptions?: Readonly<FlightDirectorFltPathCueOptions>;

  /** Options for the TCAS resolution advisory pitch cue layer. Required to display the TCAS RA pitch cue layer. */
  tcasRaPitchCueLayerOptions?: Readonly<TcasRaPitchCueLayerOptions>;

  /**
   * A provider of TCAS-II resolution advisory vertical speed command data. Required to display the TCAS RA pitch cue
   * layer.
   */
  tcasRaCommandDataProvider: TcasRaCommandDataProvider;

  // TODO obsolete... the heading source decides this
  /** Whether to show magnetic heading information instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** The flight director format to display. */
  flightDirectorMode: FlightDirectorMode | Subscribable<FlightDirectorMode>;

  /** The set of occlusion areas to apply to certain horizon elements. If not defined, no occlusion will be applied. */
  occlusions?: SubscribableArray<HorizonOcclusionArea>;

  /** A manager for PFD settings. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** Normal field of view, in degrees. Defaults to 55 degrees. */
  normalFov?: number;

  /** Extended field of view, in degrees. Defaults to 110 degrees. */
  extendedFov?: number;

  /** A mutable subscribable to which to write whether SVS is enabled. */
  isSvsEnabled?: MutableSubscribable<any, boolean>;

  /** CSS class(es) to apply to the root of the horizon display. */
  class?: string | SubscribableSet<string>;
}

/**
 * An EPIC 2.0 PFD horizon display. Includes an artificial horizon, attitude indicator,
 * aircraft symbol, flight director, and synthetic vision system (SVS) display.
 */
export class HorizonDisplay extends DisplayComponent<HorizonDisplayProps> {
  private static readonly BING_FOV = 45; // degrees

  private static readonly DEFAULT_NORMAL_FOV = 45; // degrees

  private readonly horizonRef = FSComponent.createRef<HorizonComponent>();

  private readonly projectionParams = {
    position: new GeoPoint(0, 0),
    altitude: 0,
    heading: 0,
    pitch: 0,
    roll: 0
  };

  private trackSub?: Subscription;
  private pitchSub?: Subscription;
  private rollSub?: Subscription;
  private positionSub?: Subscription;

  private readonly paramSubscriptions = [
    this.positionSub,
    this.trackSub,
    this.pitchSub,
    this.rollSub,
  ];

  private readonly simRate = ConsumerSubject.create(null, 1);

  // TODO
  private readonly onGround = Subject.create(false);

  private readonly fdDataProvider = new DefaultFlightDirectorDataProvider(
    this.props.bus,
    this.props.flightDirectorOptions?.pitchSmoothingTau ?? 500 / Math.LN2,
    this.props.flightDirectorOptions?.bankSmoothingTau ?? 500 / Math.LN2
  );

  private readonly isSvsEnabled = MappedSubject.create(
    ([trueTrack, isAttitudeDataValid, position, svsEnabledSetting]): boolean => {
      return svsEnabledSetting && trueTrack !== null && isAttitudeDataValid && position !== null;
    },
    this.props.headingDataProvider.trueTrack,
    this.props.attitudeDataProvider.dataValid,
    this.props.inertialDataProvider.position,
    this.props.pfdSettingsManager.getSetting('syntheticVisionEnabled')
  );

  private readonly apMaxBankId = ConsumerSubject.create(null, Epic2MaxBankIndex.FULL_BANK);
  private readonly showLowBankArc = this.apMaxBankId.map(mode => mode === Epic2MaxBankIndex.HALF_BANK);

  private readonly showTcasRaPitchCueLayer = this.props.tcasRaPitchCueLayerOptions && this.props.tcasRaCommandDataProvider
    ? MappedSubject.create(
      ([isAttitudeDataValid, tas, vs]) => isAttitudeDataValid && tas !== null && vs !== null,
      this.props.attitudeDataProvider.dataValid,
      this.props.airspeedDataProvider.tas,
      this.props.altitudeDataProvider.verticalSpeed,
    )
    : undefined;

  private readonly showFpm = MappedSubject.create(
    ([groundTrack, isAttitudeDataValid, fpsEnabled, fdMode]): boolean => {
      return groundTrack !== null && isAttitudeDataValid && (fpsEnabled || fdMode === FlightDirectorMode.FltPath);
    },
    this.props.inertialDataProvider.groundTrack,
    this.props.attitudeDataProvider.dataValid,
    this.props.pfdSettingsManager.getSetting('fpsEnabled'),
    this.props.pfdSettingsManager.getSetting('flightDirectorMode'),
  );

  private readonly showFlightDirector = MappedSubject.create(
    ([declutter, isAttitudeDataValid, isFdActive]): boolean => !declutter && isAttitudeDataValid && isFdActive,
    this.props.attitudeDataProvider.excessiveAttitude,
    this.props.attitudeDataProvider.dataValid,
    this.fdDataProvider.isFdActive
  );

  // FIXME also FPV/FPD

  private readonly showFlightDirectorSingleCue = SubscribableUtils.isSubscribable(this.props.flightDirectorMode)
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorMode.SCue,
      this.showFlightDirector,
      this.props.flightDirectorMode
    )
    : this.props.flightDirectorMode === FlightDirectorMode.SCue;

  private readonly showFlightDirectorDualCue = SubscribableUtils.isSubscribable(this.props.flightDirectorMode)
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorMode.XPtr,
      this.showFlightDirector,
      this.props.flightDirectorMode
    )
    : this.props.flightDirectorMode === FlightDirectorMode.XPtr;

  private readonly showFlightDirectorFltPth = SubscribableUtils.isSubscribable(this.props.flightDirectorMode)
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorMode.FltPath,
      this.showFlightDirector,
      this.props.flightDirectorMode
    )
    : this.props.flightDirectorMode === FlightDirectorMode.FltPath;

  private readonly aircraftSymbolFormat = SubscribableUtils.isSubscribable(this.props.flightDirectorMode)
    ? this.props.flightDirectorMode.map(this.getAircraftSymbolFormat.bind(this))
    : this.getAircraftSymbolFormat(this.props.flightDirectorMode);

  private readonly normalFov = this.props.normalFov ?? HorizonDisplay.DEFAULT_NORMAL_FOV;

  private readonly fov = this.isSvsEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.normalFov);

  private readonly nonSvsFovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
  private readonly svsFovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly fovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));

  private readonly horizonSize = Vec2Subject.create(Vec2Math.create(676, 768));
  private readonly horizonOffset = Vec2Subject.create(Vec2Math.create(-28, -128));

  private readonly occlusions = this.props.occlusions ?? ArraySubject.create();

  private readonly headingPointerSize = this.props.radioAltimeterDataProvider.radioAltitude.map(
    (v) => MathUtils.round(1 - (MathUtils.clamp(v ? v : 0, 600, 800) - 600) / 200, 0.05)
  );

  private readonly showFailureBox = this.props.attitudeDataProvider.dataValid.map((v) => !v);

  private readonly fpvDisplayedPosition = Vec2Subject.create(Vec2Math.create(NaN, NaN));

  private readonly raShouldMoveWithFpv = SubscribableUtils.isSubscribable(this.props.flightDirectorMode)
    ? this.props.flightDirectorMode.map((v) => v === FlightDirectorMode.FltPath)
    : this.props.flightDirectorMode === FlightDirectorMode.FltPath;

  private isAlive = true;
  private isAwake = true;

  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);

  private updateFreqSub?: Subscription;
  private updateCycleSub?: Subscription;
  private isSvsEnabledPipe?: Subscription;

  private readonly updateCycleHandler = this.onUpdated.bind(this);


  /** @inheritdoc */
  public onAfterRender(): void {

    this.horizonRef.instance.projection.onChange(this.onProjectionChanged.bind(this));

    if (!this.isAwake) {
      this.horizonRef.instance.sleep();
    }

    const sub = this.props.bus.getSubscriber<APEvents & ClockEvents>();

    this.simRate.setConsumer(sub.on('simRate'));

    this.positionSub = this.props.inertialDataProvider.position.sub(pos => {
      if (pos !== null) {
        this.projectionParams.position.set(pos.lat, pos.long);
        this.projectionParams.altitude = pos.alt;
      } else {
        this.projectionParams.position.set(0, 0);
        this.projectionParams.altitude = 0;
      }
    }, true);

    // The projection is track oriented rather than heading oriented
    this.trackSub = this.props.headingDataProvider.trueTrack.sub(track => {
      this.projectionParams.heading = track !== null ? track : 0;
    }, true);

    this.pitchSub = this.props.attitudeDataProvider.pitch.sub(pitch => {
      // horizon goes all blue when the attitude data is invalid
      this.projectionParams.pitch = pitch !== null ? -pitch : -90;
    }, true);

    this.rollSub = this.props.attitudeDataProvider.roll.sub(roll => {
      this.projectionParams.roll = roll !== null ? -roll : 0;
    }, true);

    this.apMaxBankId.setConsumer(sub.on('ap_max_bank_id'));

    const svsEndpointsPipe = this.svsFovEndpoints.pipe(this.fovEndpoints, true);

    this.isSvsEnabled.sub(isEnabled => {
      if (isEnabled) {
        svsEndpointsPipe.resume(true);
      } else {
        svsEndpointsPipe.pause();
        this.fovEndpoints.set(this.nonSvsFovEndpoints);
      }
    }, true);

    this.fdDataProvider.init(!this.isAwake);

    if (this.props.isSvsEnabled) {
      this.isSvsEnabledPipe = this.isSvsEnabled.pipe(this.props.isSvsEnabled);
    }

    this.recomputeSvsFovEndpoints(this.horizonRef.instance.projection);

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


    this.isAwake = true;

    for (const subscription of this.paramSubscriptions) {
      subscription?.resume();
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

    for (const subscription of this.paramSubscriptions) {
      subscription?.pause();
    }

    this.fdDataProvider.pause();

    this.horizonRef.getOrDefault()?.sleep();
    this.updateCycleSub?.pause();
  }

  /**
   * Get the aircraft symbol format for a given FD mode.
   * @param flightDirectorMode The FD mode.
   * @returns The applicable aircraft symbol format.
   */
  private getAircraftSymbolFormat(flightDirectorMode: FlightDirectorMode): AttitudeAircraftSymbolFormat {
    switch (flightDirectorMode) {
      case FlightDirectorMode.FltPath:
        return AttitudeAircraftSymbolFormat.FltPath;
      case FlightDirectorMode.XPtr:
        return AttitudeAircraftSymbolFormat.DualCue;
      case FlightDirectorMode.SCue:
      default:
        return AttitudeAircraftSymbolFormat.SingleCue;
    }
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
      this.recomputeSvsFovEndpoints(projection);
    }
  }

  /**
   * Recomputes the endpoints at which the field of view of this display's projection is measured when synthetic
   * vision is enabled.
   * @param projection This display's horizon projection.
   */
  private recomputeSvsFovEndpoints(projection: HorizonProjection): void {
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

    this.svsFovEndpoints.set(
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
    const projection = new HorizonProjection(684, 768, 40);

    // TODO adjust values
    const fdSingleCueSvtEnabledBounds = Vec2Math.create(-140, 95);
    const flightDirectorSingleCueOptions: FlightDirectorSingleCueOptions = {
      conformalBounds: fdSingleCueSvtEnabledBounds,
      conformalBankLimit: 20
    };

    // TODO adjust values
    const fdDualCueSvtDisabledBounds = VecNMath.create(4, -182, -125, 182, 85);
    const flightDirectorDualCueOptions: FlightDirectorDualCueOptions = {
      conformalBounds: fdDualCueSvtDisabledBounds,
      pitchErrorFactor: 1,
      bankErrorConstant: 5
    };

    const flightDirectorFltPthCueOptions: FlightDirectorFltPathCueOptions = this.props.flightDirectorFltPthCueOptions ?? {
      bounds: this.props.pitchLadderOptions.clipBounds,
      bankErrorFactor: 1,
      pitchErrorFactor: 10,
    };

    return (
      <HorizonComponent
        ref={this.horizonRef}
        projection={projection}
        projectedSize={this.horizonSize}
        fov={this.fov}
        fovEndpoints={this.fovEndpoints}
        projectedOffset={this.horizonOffset}
        class={this.props.class}
      >
        <SyntheticVision
          projection={projection}
          bingId={this.props.bingId}
          bingDelay={this.props.bingDelay}
          isEnabled={this.isSvsEnabled}
        />
        <HorizonSharedCanvasLayer projection={projection}>
          <ArtificialHorizon
            show={this.isSvsEnabled.map(SubscribableMapFunctions.not())}
            isAttitudeValid={this.props.attitudeDataProvider.dataValid}
            options={this.props.artificialHorizonOptions}
          />
          <HorizonLine
            show={this.props.attitudeDataProvider.dataValid}
            useMagneticHeading={this.props.useMagneticHeading}
            approximate={this.isSvsEnabled.map(SubscribableMapFunctions.not())}
            occlusions={this.occlusions}
            trueHeading={this.props.headingDataProvider.trueHeading}
            headingPointerSize={this.headingPointerSize}
            options={this.props.horizonLineOptions}
            declutter={this.props.attitudeDataProvider.excessiveAttitude}
          />
        </HorizonSharedCanvasLayer>

        <StallAnnunciator stallWarningDataProvider={this.props.stallWarningDataProvider} />
        <ExpandedLocalizerDisplay
          bus={this.props.bus}
          autopilotDataProvider={this.props.autopilotDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          declutter={this.props.attitudeDataProvider.excessiveAttitude}
        />

        <TurnRateIndicator
          headingDataProvider={this.props.headingDataProvider}
          navigationSourceDataProvider={this.props.navigationSourceDataProvider}
          declutter={this.props.attitudeDataProvider.excessiveAttitude}
        />

        <PitchLadder
          projection={projection}
          show={this.props.attitudeDataProvider.dataValid}
          isSvsEnabled={this.isSvsEnabled}
          clipBounds={this.props.pitchLadderOptions.clipBounds}
          options={this.props.pitchLadderOptions.options}
        />
        {this.props.tcasRaPitchCueLayerOptions !== undefined && (
          <TcasRaPitchCueLayer
            projection={projection}
            show={this.showTcasRaPitchCueLayer!}
            dataProvider={this.props.tcasRaCommandDataProvider}
            verticalSpeed={this.props.altitudeDataProvider.verticalSpeed}
            tas={this.props.airspeedDataProvider.tas}
            simRate={this.simRate}
            {...this.props.tcasRaPitchCueLayerOptions}
          />
        )}
        <RollIndicator
          projection={projection}
          show={Subject.create(true)}
          showSlipSkid={this.props.attitudeDataProvider.dataValid}
          showLowBankArc={this.showLowBankArc}
          sideSlip={this.props.inertialDataProvider.sideSlip}
          options={this.props.rollIndicatorOptions}
        />
        {
          this.showFlightDirectorFltPth !== false && flightDirectorFltPthCueOptions !== undefined && (
            <FlightDirectorFltPathCue
              projection={projection}
              show={this.showFlightDirectorFltPth === true ? this.showFlightDirector : this.showFlightDirectorFltPth}
              fdPitch={this.fdDataProvider.fdPitch}
              fdBank={this.fdDataProvider.fdBank}
              fpvPosition={this.fpvDisplayedPosition}
              {...flightDirectorFltPthCueOptions}
            />
          )
        }
        <FlightPathMarker
          projection={projection}
          bus={this.props.bus}
          airspeedDataProvider={this.props.airspeedDataProvider}
          show={this.showFpm ?? this.isSvsEnabled}
          showPrimary={this.props.pfdSettingsManager.getSetting('flightDirectorMode').map((v) => v === FlightDirectorMode.FltPath)}
          hideCentreDot={this.props.autopilotDataProvider.fdEngaged}
          displayedPosition={this.fpvDisplayedPosition}
          declutter={this.props.attitudeDataProvider.excessiveAttitude}
        />
        {
          this.showFlightDirectorSingleCue !== false && flightDirectorSingleCueOptions !== undefined && (
            <FlightDirectorSingleCue
              projection={projection}
              show={this.showFlightDirectorSingleCue === true ? this.showFlightDirector : this.showFlightDirectorSingleCue}
              fdPitch={this.fdDataProvider.fdPitch}
              fdBank={this.fdDataProvider.fdBank}
              {...flightDirectorSingleCueOptions}
            />
          )
        }
        <AttitudeAircraftSymbol
          projection={projection}
          show={Subject.create(true)}
          format={this.aircraftSymbolFormat}
          color={this.props.aircraftSymbolOptions.color}
        />
        <RadioAltitudeDisplay
          fpvOffset={Vec2Math.create(-10, 6)}
          fpvPosition={this.fpvDisplayedPosition}
          shouldMoveWithFpv={this.raShouldMoveWithFpv}
          staticPosition={Vec2Math.create(316, 294)}
          radioAltimeterDataProvider={this.props.radioAltimeterDataProvider}
          declutter={this.props.attitudeDataProvider.excessiveAttitude}
        />
        {
          this.showFlightDirectorDualCue !== false && flightDirectorDualCueOptions !== undefined && (
            <FlightDirectorDualCue
              projection={projection}
              show={this.showFlightDirectorDualCue === true ? this.showFlightDirector : this.showFlightDirectorDualCue}
              fdPitch={this.fdDataProvider.fdPitch}
              fdBank={this.fdDataProvider.fdBank}
              {...flightDirectorDualCueOptions}
            />
          )
        }
        <AttitudeFailureFlag show={this.showFailureBox} />
      </HorizonComponent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    for (const subscription of this.paramSubscriptions) {
      subscription?.destroy();
    }

    this.fdDataProvider.destroy();

    this.isSvsEnabled.destroy();
    this.apMaxBankId.destroy();
    //this.horizonLineShowHeadingLabels.destroy();
    //this.showFpm?.destroy();
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
    this.isSvsEnabledPipe?.destroy();

    this.horizonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
