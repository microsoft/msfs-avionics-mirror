import {
  AdcEvents, AhrsEvents, APEvents, ArraySubject, BitFlags, ClockEvents, ComponentProps, ConsumerSubject,
  DisplayComponent, EventBus, FSComponent, GeoPoint, GNSSEvents, HorizonComponent, HorizonProjection,
  HorizonProjectionChangeType, HorizonSharedCanvasLayer, MappedSubject, MutableSubscribable, ReadonlyFloat64Array,
  Subject, Subscribable, SubscribableArray, SubscribableMapFunctions, SubscribableUtils, Subscription,
  UserSettingManager, VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import {
  AdcSystemEvents, AhrsSystemEvents, ArtificialHorizon, ArtificialHorizonOptions, AttitudeAircraftSymbolFormat, DefaultFlightDirectorDataProvider,
  FlightDirectorDualCueOptions, FlightDirectorFormat, FlightDirectorOptions, FlightDirectorSingleCueOptions, FlightPathMarker,
  FmsPositionMode, FmsPositionSystemEvents, HorizonLine, HorizonLineOptions, HorizonOcclusionArea, SyntheticVision
} from '@microsoft/msfs-garminsdk';

import { GduFormat } from '../../../Shared/CommonTypes';
import { FlightDirectorFormatSettingMode, PfdUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';
import { G3XAttitudeAircraftSymbol, G3XAttitudeAircraftSymbolProps } from './AttitudeAircraftSymbol/G3XAttitudeAircraftSymbol';
import { G3XFlightDirectorDualCue } from './FlightDirectorDualCue/G3XFlightDirectorDualCue';
import { G3XFlightDirectorSingleCue } from './FlightDirectorSingleCue/G3XFlightDirectorSingleCue';
import { G3XPitchLadder, G3XPitchLadderProps } from './PitchLadder/G3XPitchLadder';
import { RollIndicator, RollIndicatorOptions } from './RollIndicator/RollIndicator';

import './FlightPathMarker.css';

/**
 * Options for the G3X horizon display's pitch ladder.
 */
export type G3XHorizonPitchLadderOptions = Pick<G3XPitchLadderProps, 'clipBounds' | 'options'>;

/**
 * Options for the G3X horizon display's aircraft symbol.
 */
export type G3XHorizonAircraftSymbolOptions = Pick<G3XAttitudeAircraftSymbolProps, 'color' | 'singleCueBarSpan'>;

/**
 * Component props for {@link G3XHorizonDisplay}.
 */
export interface G3XHorizonDisplayProps extends ComponentProps {

  /** The event bus. */
  bus: EventBus;

  /** The format of the horizon display's parent GDU. */
  gduFormat: GduFormat;

  /** The index of the ADC that is the source of the horizon display's data. */
  adcIndex: number | Subscribable<number>;

  /** The index of the AHRS that is the source of the horizon display's data. */
  ahrsIndex: number | Subscribable<number>;

  /** The index of the FMS positioning system that is the source of the horizon display's data. */
  fmsPosIndex: number | Subscribable<number>;

  /** The update frequency, in hertz, of the horizon display. */
  updateFreq: number | Subscribable<number>;

  /**
   * The string ID to assign to the synthetic vision layer's bound Bing instance. If not defined, then the synthetic
   * vision layer will be disabled.
   */
  bingId?: string;

  /** The amount of time, in milliseconds, to delay binding the synthetic vision layer's Bing instance. Defaults to 0. */
  bingDelay?: number;

  /** The size, as `[width, height]` in pixels, of the horizon display. */
  projectedSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The projected offset of the center of the projection, as `[x, y]` in pixels. */
  projectedOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** Options for the artificial horizon. */
  artificialHorizonOptions: Readonly<ArtificialHorizonOptions>;

  /** Options for the horizon line. */
  horizonLineOptions: Readonly<HorizonLineOptions>;

  /** Options for the pitch ladder. */
  pitchLadderOptions: G3XHorizonPitchLadderOptions;

  /** Options for the roll indicator. */
  rollIndicatorOptions: RollIndicatorOptions;

  /** Options for the symbolic aircraft. */
  aircraftSymbolOptions: Readonly<G3XHorizonAircraftSymbolOptions>;

  /** Whether to include the flight director display. */
  includeFlightDirector: boolean;

  /** Options for the flight director. Ignored if `includeFlightDirector` is `false`. */
  flightDirectorOptions?: Readonly<FlightDirectorOptions>;

  /**
   * Options for the single-cue flight director. Required to display the single-cue flight director. Ignored if
   * `includeFlightDirector` is `false`.
   */
  flightDirectorSingleCueOptions?: Readonly<FlightDirectorSingleCueOptions>;

  /**
   * Options for the dual-cue flight director. Required to display the dual-cue flight director. Ignored if
   * `includeFlightDirector` is `false`.
   */
  flightDirectorDualCueOptions?: Readonly<FlightDirectorDualCueOptions>;

  /** Default field of view, in degrees. Defaults to 110 degrees. */
  defaultFov?: number;

  /** Whether to include the display of unusual attitude warning chevrons on the pitch ladder. */
  includeUnusualAttitudeChevrons: boolean;

  /** Whether to show magnetic heading information instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** The set of occlusion areas to apply to certain horizon elements. If not defined, no occlusion will be applied. */
  occlusions?: SubscribableArray<HorizonOcclusionArea>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;

  /** A mutable subscribable to which to write whether SVT is enabled. */
  isSvtEnabled?: MutableSubscribable<any, boolean>;
}

/**
 * A G3X Touch Garmin PFD horizon display. Includes an artificial horizon, attitude indicator,
 * aircraft symbol, flight director, and synthetic vision technology (SVT) display.
 */
export class G3XHorizonDisplay extends DisplayComponent<G3XHorizonDisplayProps> {
  private static readonly BING_FOV = 50; // degrees
  private static readonly DEFAULT_FOV = 110; // degrees

  private static readonly SVT_SUPPORTED_FMS_POS_MODES = [
    FmsPositionMode.Gps,
    FmsPositionMode.Dme
  ];

  private readonly ahrsIndex = SubscribableUtils.toSubscribable(this.props.ahrsIndex, true);
  private readonly isHeadingDataValid = ConsumerSubject.create(null, true);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);

  private readonly fmsPosIndex = SubscribableUtils.toSubscribable(this.props.fmsPosIndex, true);
  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private readonly adcIndex = SubscribableUtils.toSubscribable(this.props.adcIndex, true);
  private readonly isAdcAirspeedDataValid = ConsumerSubject.create(null, false);
  private readonly isAdcTemperatureDataValid = ConsumerSubject.create(null, false);
  private readonly tas = ConsumerSubject.create(null, 0);
  private readonly isTasDataValid = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isAdcAirspeedDataValid,
    this.isAdcTemperatureDataValid
  );

  private readonly nonSvtFovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
  private readonly svtFovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly fovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly defaultFov = this.props.defaultFov ?? G3XHorizonDisplay.DEFAULT_FOV;

  private readonly occlusions = this.props.occlusions ?? ArraySubject.create();

  private readonly isSvtEnabled = this.props.bingId === undefined
    ? Subject.create(false)
    : MappedSubject.create(
      ([isHeadingDataValid, isAttitudeDataValid, fmsPosMode, svtEnabledSetting]): boolean => {
        return svtEnabledSetting && isHeadingDataValid && isAttitudeDataValid && G3XHorizonDisplay.SVT_SUPPORTED_FMS_POS_MODES.includes(fmsPosMode);
      },
      this.isHeadingDataValid,
      this.isAttitudeDataValid,
      this.fmsPosMode,
      this.props.pfdSettingManager.getSetting('svtEnabled')
    );

  private readonly showFpm = MappedSubject.create(
    ([isHeadingDataValid, isAttitudeDataValid, isSvtEnabled, fpmShowSetting]): boolean => {
      return isHeadingDataValid && isAttitudeDataValid && isSvtEnabled && fpmShowSetting;
    },
    this.isHeadingDataValid,
    this.isAttitudeDataValid,
    this.isSvtEnabled,
    this.props.pfdSettingManager.getSetting('svtFpmShow')
  );

  private readonly horizonRef = FSComponent.createRef<HorizonComponent>();

  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);

  private readonly fov = this.isSvtEnabled.map(isEnabled => isEnabled ? G3XHorizonDisplay.BING_FOV : this.defaultFov);

  private readonly projectionParams = {
    position: new GeoPoint(0, 0),
    altitude: 0,
    heading: 0,
    pitch: 0,
    roll: 0
  };
  private headingSub?: Subscription;
  private pitchSub?: Subscription;
  private rollSub?: Subscription;
  private readonly position = ConsumerSubject.create(null, new LatLongAlt(0, 0, 0));
  private readonly heading = ConsumerSubject.create(null, 0);
  private readonly pitch = ConsumerSubject.create(null, 0);
  private readonly roll = ConsumerSubject.create(null, 0);
  private readonly apEngaged = ConsumerSubject.create(null, false);
  private readonly paramSubjects = [
    this.position,
    this.heading,
    this.pitch,
    this.roll
  ];

  private readonly flightDirectorFormat = this.props.pfdSettingManager.getSetting('flightDirectorFormat').map(format => {
    return format === FlightDirectorFormatSettingMode.Dual ? FlightDirectorFormat.DualCue : FlightDirectorFormat.SingleCue;
  });

  private readonly fdDataProvider = this.props.includeFlightDirector
    ? new DefaultFlightDirectorDataProvider(
      this.props.bus,
      this.props.flightDirectorOptions?.pitchSmoothingTau ?? 500 / Math.LN2,
      this.props.flightDirectorOptions?.bankSmoothingTau ?? 500 / Math.LN2
    )
    : undefined;

  private readonly showFlightDirector = this.fdDataProvider
    ? MappedSubject.create(
      ([declutter, isAttitudeDataValid, isFdActive]): boolean => {
        return !declutter && isAttitudeDataValid && isFdActive;
      },
      this.props.declutter,
      this.isAttitudeDataValid,
      this.fdDataProvider.isFdActive
    )
    : undefined;

  private readonly showFlightDirectorSingleCue = this.showFlightDirector
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorFormat.SingleCue,
      this.showFlightDirector,
      this.flightDirectorFormat
    )
    : undefined;

  private readonly showFlightDirectorDualCue = this.showFlightDirector
    ? MappedSubject.create(
      ([show, format]) => show && format === FlightDirectorFormat.DualCue,
      this.showFlightDirector,
      this.flightDirectorFormat
    )
    : undefined;

  private readonly aircraftSymbolFormat = this.flightDirectorFormat.map(format => {
    return format === FlightDirectorFormat.DualCue ? AttitudeAircraftSymbolFormat.DualCue : AttitudeAircraftSymbolFormat.SingleCue;
  });

  private isAlive = true;
  private isAwake = true;

  private ahrsIndexSub?: Subscription;
  private fmsPosIndexSub?: Subscription;
  private adcIndexSub?: Subscription;
  private updateCycleSub?: Subscription;
  private updateFreqSub?: Subscription;
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

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.heading.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
      this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
      this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
      this.isAttitudeDataValid.setConsumer(sub.on(`ahrs_attitude_data_valid_${index}`));
    }, true);

    this.apEngaged.setConsumer(sub.on('ap_master_status'));

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.position.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
    }, true);

    this.adcIndexSub = this.adcIndex.sub(index => {
      this.tas.setConsumer(sub.on(`adc_tas_${index}`));
      this.isAdcAirspeedDataValid.setConsumer(sub.on(`adc_airspeed_data_valid_${index}`));
      this.isAdcTemperatureDataValid.setConsumer(sub.on(`adc_temperature_data_valid_${index}`));
    }, true);

    const svtEndpointsPipe = this.svtFovEndpoints.pipe(this.fovEndpoints, true);

    this.isSvtEnabled.sub(isEnabled => {
      if (isEnabled) {
        svtEndpointsPipe.resume(true);
      } else {
        svtEndpointsPipe.pause();
        this.fovEndpoints.set(this.nonSvtFovEndpoints);
      }
    }, true);

    this.fdDataProvider?.init(!this.isAwake);

    if (this.props.isSvtEnabled) {
      this.isSvtEnabledPipe = this.isSvtEnabled.pipe(this.props.isSvtEnabled);
    }

    this.updateFreqSub = this.updateFreq?.sub(freq => {
      this.updateCycleSub?.destroy();

      this.updateCycleSub = this.props.bus.getSubscriber<ClockEvents>()
        .on('realTime')
        .atFrequency(freq)
        .handle(this.updateCycleHandler, !this.isAwake);
    }, true);

    this.recomputeSvtFovEndpoints(this.horizonRef.instance.projection);
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

    this.isAdcAirspeedDataValid.resume();
    this.isAdcTemperatureDataValid.resume();
    this.tas.resume();

    this.fdDataProvider?.resume();

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

    this.isAdcAirspeedDataValid.pause();
    this.isAdcTemperatureDataValid.pause();
    this.tas.pause();

    this.fdDataProvider?.pause();

    this.horizonRef.getOrDefault()?.sleep();
    this.updateCycleSub?.pause();
  }

  /**
   * This method is called every update cycle.
   * @param time The current time, as a UNIX timestamp in milliseconds.
   */
  private onUpdated(time: number): void {
    this.fdDataProvider?.update(time);

    this.horizonRef.instance.projection.set(this.projectionParams);
    this.horizonRef.instance.update(time);
  }

  /**
   * @inheritdoc
   */
  public render(): VNode {
    if (this.props.gduFormat !== '460') {
      return <div>{this.props.gduFormat} is not supported</div>;
    }

    const projection = new HorizonProjection(100, 100, 60);

    return (
      <HorizonComponent
        ref={this.horizonRef}
        projection={projection}
        projectedSize={this.props.projectedSize}
        fov={this.fov}
        fovEndpoints={this.fovEndpoints}
        projectedOffset={this.props.projectedOffset}
        class='horizon-display'
      >
        {this.props.bingId !== undefined && (
          <SyntheticVision
            projection={projection}
            bingId={this.props.bingId}
            bingDelay={this.props.bingDelay}
            isEnabled={this.isSvtEnabled}
          />
        )}
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
            showHeadingLabels={false}
            useMagneticHeading={this.props.useMagneticHeading}
            approximate={this.isSvtEnabled.map(SubscribableMapFunctions.not())}
            occlusions={this.occlusions}
            options={this.props.horizonLineOptions}
          />
        </HorizonSharedCanvasLayer>
        <G3XPitchLadder
          projection={projection}
          show={this.isAttitudeDataValid}
          isSVTEnabled={this.isSvtEnabled}
          clipBounds={this.props.pitchLadderOptions.clipBounds}
          options={this.props.pitchLadderOptions.options}
          includeUnusualAttitudeChevrons={this.props.includeUnusualAttitudeChevrons}
        />
        <RollIndicator
          projection={projection}
          showStandardRateTurnPointer={this.props.pfdSettingManager.getSetting('pfdStandardRateTurnPointerShow')}
          tas={this.tas}
          isTasDataValid={this.isTasDataValid}
          options={this.props.rollIndicatorOptions}
        />
        <FlightPathMarker
          projection={projection}
          bus={this.props.bus}
          show={this.showFpm}
        />
        {this.fdDataProvider !== undefined && this.showFlightDirectorSingleCue !== undefined && this.props.flightDirectorSingleCueOptions && (
          <G3XFlightDirectorSingleCue
            projection={projection}
            show={this.showFlightDirectorSingleCue}
            fdPitch={this.fdDataProvider.fdPitch}
            fdBank={this.fdDataProvider.fdBank}
            apEngaged={this.apEngaged}
            {...this.props.flightDirectorSingleCueOptions}
          />
        )}
        <G3XAttitudeAircraftSymbol
          projection={projection}
          show={Subject.create(true)}
          format={this.aircraftSymbolFormat}
          {...this.props.aircraftSymbolOptions}
        />
        {this.fdDataProvider !== undefined && this.showFlightDirectorDualCue !== undefined && this.props.flightDirectorDualCueOptions && (
          <G3XFlightDirectorDualCue
            projection={projection}
            show={this.showFlightDirectorDualCue}
            fdPitch={this.fdDataProvider.fdPitch}
            fdBank={this.fdDataProvider.fdBank}
            {...this.props.flightDirectorDualCueOptions}
          />
        )}
      </HorizonComponent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    for (const subject of this.paramSubjects) {
      subject.destroy();
    }

    this.isHeadingDataValid.destroy();
    this.isAttitudeDataValid.destroy();

    this.fmsPosMode.destroy();

    this.isAdcAirspeedDataValid.destroy();
    this.isAdcTemperatureDataValid.destroy();
    this.tas.destroy();

    this.flightDirectorFormat.destroy();
    this.fdDataProvider?.destroy();
    this.showFlightDirector?.destroy();
    this.showFlightDirectorSingleCue?.destroy();
    this.showFlightDirectorDualCue?.destroy();
    this.aircraftSymbolFormat.destroy();

    'destroy' in this.isSvtEnabled && this.isSvtEnabled.destroy();
    this.showFpm.destroy();
    this.apEngaged.destroy();

    this.updateFreqSub?.destroy();
    this.updateCycleSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.adcIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();
    this.isSvtEnabledPipe?.destroy();

    this.horizonRef.getOrDefault()?.destroy();

    super.destroy();
  }
}