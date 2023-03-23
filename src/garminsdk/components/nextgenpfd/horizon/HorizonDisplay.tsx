import {
  AdcEvents, AhrsEvents, BitFlags, ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus,
  FSComponent, GeoPoint, GNSSEvents, HorizonComponent, HorizonProjection, HorizonProjectionChangeType, MappedSubject,
  ReadonlyFloat64Array, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, UserSettingManager,
  VecNMath, VecNSubject, VNode
} from '@microsoft/msfs-sdk';

import { SynVisUserSettingTypes } from '../../../settings/SynVisUserSettings';
import { AhrsSystemEvents } from '../../../system/AhrsSystem';
import { FmsPositionMode, FmsPositionSystemEvents } from '../../../system/FmsPositionSystem';
import { ArtificalHorizonProps, ArtificialHorizon } from './ArtificialHorizon';
import { AttitudeAircraftSymbol, AttitudeAircraftSymbolProps } from './AttitudeAircraftSymbol';
import { AttitudeIndicator, AttitudeIndicatorProps, PitchLadderStyles } from './AttitudeIndicator';
import { FlightDirector, FlightDirectorProps } from './FlightDirector';
import { FlightPathMarker, FlightPathMarkerProps } from './FlightPathMarker';
import { SyntheticVision, SyntheticVisionProps } from './SyntheticVision';

/**
 * Options for the symbolic aircraft.
 */
export type AircraftSymbolOptions = Pick<AttitudeAircraftSymbolProps, 'color'>;

/**
 * Options for the attitude indicator.
 */
export type AttitudeIndicatorOptions = Pick<AttitudeIndicatorProps, 'rollScaleOptions' | 'slipSkidOptions'>;

/**
 * Options for the flight director.
 */
export type FlightDirectorOptions = Pick<FlightDirectorProps, 'maxPitch'>;

/**
 * Options for the artificial horizon.
 */
export type ArtificialHorizonOptions = Pick<ArtificalHorizonProps, 'horizonLineOptions' | 'options'>;

/**
 * Options for synthetic vision.
 */
export type SyntheticVisionOptions = Pick<SyntheticVisionProps, 'horizonLineOptions'>;

/**
 * Options for the flight path marker.
 */
export type FlightPathMarkerOptions = Pick<FlightPathMarkerProps, 'minGroundSpeed' | 'lookahead'>;

/**
 * Component props for HorizonDisplay.
 */
export interface HorizonDisplayProps extends ComponentProps {
  /** Event bus. */
  bus: EventBus;

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

  /** Options for the symbolic aircraft. */
  aircraftSymbolOptions: AircraftSymbolOptions;

  /** Options for the attitude indicator. */
  attitudeIndicatorOptions: AttitudeIndicatorOptions;

  /** Options for the flight director. */
  flightDirectorOptions: FlightDirectorOptions;

  /** Options for the artificial horizon. */
  artificialHorizonOptions: ArtificialHorizonOptions;

  /** Options for the synthetic vision display. */
  svtOptions: SyntheticVisionOptions;

  /**
   * Whether to support advanced SVT features. Advanced SVT features include:
   * * The ability to display horizon heading labels when SVT is disabled.
   * * The ability to display the flight path marker when SVT is disabled.
   */
  supportAdvancedSvt: boolean;

  /** Whether to show magnetic heading information instead of true heading. */
  useMagneticHeading: Subscribable<boolean>;

  /** A manager for synthetic vision settings. */
  svtSettingManager: UserSettingManager<SynVisUserSettingTypes>;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;

  /** Normal field of view, in degrees. Defaults to 55 degrees. */
  normalFov?: number;

  /** Extended field of view, in degrees. Defaults to 110 degrees. */
  extendedFov?: number;

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

  private readonly ahrsIndex = SubscribableUtils.toSubscribable(this.props.ahrsIndex, true);
  private readonly fmsPosIndex = SubscribableUtils.toSubscribable(this.props.fmsPosIndex, true);

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

  private readonly isHeadingDataValid = ConsumerSubject.create(null, true);
  private readonly isAttitudeDataValid = ConsumerSubject.create(null, true);

  private readonly fmsPosMode = ConsumerSubject.create(null, FmsPositionMode.None);

  private readonly isSvtEnabled = MappedSubject.create(
    ([isHeadingDataValid, isAttitudeDataValid, fmsPosMode, svtEnabledSetting]): boolean => {
      return svtEnabledSetting && isHeadingDataValid && isAttitudeDataValid && HorizonDisplay.SVT_SUPPORTED_FMS_POS_MODES.includes(fmsPosMode);
    },
    this.isHeadingDataValid,
    this.isAttitudeDataValid,
    this.fmsPosMode,
    this.props.svtSettingManager.getSetting('svtEnabled')
  );

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
    ([declutter, isAttitudeDataValid]): boolean => !declutter && isAttitudeDataValid,
    this.props.declutter,
    this.isAttitudeDataValid
  );

  private readonly normalFov = this.props.normalFov ?? HorizonDisplay.DEFAULT_NORMAL_FOV;
  private readonly extendedFov = this.props.extendedFov ?? HorizonDisplay.DEFAULT_EXTENDED_FOV;

  private readonly fov = this.props.supportAdvancedSvt
    ? this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.normalFov)
    : this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.extendedFov);

  private readonly nonSvtFovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
  private readonly svtFovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly fovEndpoints = VecNSubject.create(VecNMath.create(4, 0.5, 0, 0.5, 1));

  private isAlive = true;
  private isAwake = true;

  private readonly updateFreq = SubscribableUtils.toSubscribable(this.props.updateFreq, true);

  private updateFreqSub?: Subscription;
  private updateCycleSub?: Subscription;

  private readonly updateCycleHandler = this.onUpdated.bind(this);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.horizonRef.instance.projection.onChange(this.onProjectionChanged.bind(this));

    if (!this.isAwake) {
      this.horizonRef.instance.sleep();
    }

    const sub = this.props.bus.getSubscriber<AdcEvents & AhrsEvents & GNSSEvents & AhrsSystemEvents & FmsPositionSystemEvents>();

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

    this.fmsPosIndexSub = this.fmsPosIndex.sub(index => {
      this.position.setConsumer(sub.on(`fms_pos_gps-position_${index}`));
      this.fmsPosMode.setConsumer(sub.on(`fms_pos_mode_${index}`));
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

    this.paramSubjects.forEach(subject => { subject.resume(); });

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

    this.paramSubjects.forEach(subject => { subject.pause(); });

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
        <ArtificialHorizon
          projection={projection}
          bus={this.props.bus}
          show={MappedSubject.create(
            ([isAttitudeDataValid, isSvtEnabled]): boolean => isAttitudeDataValid && !isSvtEnabled,
            this.isAttitudeDataValid,
            this.isSvtEnabled
          )}
          showHeadingLabels={this.props.supportAdvancedSvt ? this.props.svtSettingManager.getSetting('svtHeadingLabelShow') : false}
          useMagneticHeading={this.props.useMagneticHeading}
          {...this.props.artificialHorizonOptions}
        />
        <SyntheticVision
          projection={projection}
          bingId={this.props.bingId}
          bingDelay={this.props.bingDelay}
          isEnabled={this.isSvtEnabled}
          showHeadingLabels={this.props.svtSettingManager.getSetting('svtHeadingLabelShow')}
          useMagneticHeading={this.props.useMagneticHeading}
          {...this.props.svtOptions}
        />
        <AttitudeIndicator
          projection={projection}
          bus={this.props.bus}
          ahrsIndex={this.ahrsIndex}
          isSVTEnabled={this.isSvtEnabled}
          pitchLadderOptions={{
            svtDisabledStyles: this.props.supportAdvancedSvt ? HorizonDisplay.getNormalFovPitchLadderStyles() : HorizonDisplay.getExtendedFovPitchLadderStyles(),
            svtEnabledStyles: HorizonDisplay.getNormalFovPitchLadderStyles()
          }}
          {...this.props.attitudeIndicatorOptions}
        />
        <FlightPathMarker
          projection={projection}
          bus={this.props.bus}
          show={this.showFpm ?? this.isSvtEnabled}
        />
        <FlightDirector
          projection={projection}
          bus={this.props.bus}
          show={this.showFlightDirector}
          {...this.props.flightDirectorOptions}
        />
        <AttitudeAircraftSymbol projection={projection} show={Subject.create(true)} color={this.props.aircraftSymbolOptions.color} />
      </HorizonComponent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.paramSubjects.forEach(subject => { subject.destroy(); });

    this.isHeadingDataValid.destroy();
    this.isAttitudeDataValid.destroy();
    this.fmsPosMode.destroy();
    this.isSvtEnabled.destroy();
    this.showFpm?.destroy();
    this.showFlightDirector.destroy();

    this.updateFreqSub?.destroy();
    this.updateCycleSub?.destroy();
    this.ahrsIndexSub?.destroy();
    this.fmsPosIndexSub?.destroy();

    this.horizonRef.getOrDefault()?.destroy();

    super.destroy();
  }

  /**
   * Gets pitch ladder styling options for a normal field of view.
   * @returns Pitch ladder styling options for a normal field of view.
   */
  private static getNormalFovPitchLadderStyles(): PitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineShowNumber: false,
      mediumLineShowNumber: true,
      majorLineShowNumber: true,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30
    };
  }

  /**
   * Gets pitch ladder styling options for an extended field of view.
   * @returns Pitch ladder styling options for an extended field of view.
   */
  private static getExtendedFovPitchLadderStyles(): PitchLadderStyles {
    return {
      majorLineIncrement: 10,
      mediumLineFactor: 2,
      minorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineShowNumber: false,
      mediumLineShowNumber: false,
      majorLineShowNumber: true,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100,
      chevronThresholdPositive: 50,
      chevronThresholdNegative: 30
    };
  }
}