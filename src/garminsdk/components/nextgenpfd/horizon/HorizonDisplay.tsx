import {
  AdcEvents, AhrsEvents, AvionicsSystemState, AvionicsSystemStateEvent, BitFlags, ClockEvents, ComponentProps, ConsumerSubject, DisplayComponent, EventBus,
  FSComponent, GeoPoint, GNSSEvents, HorizonComponent, HorizonProjection, HorizonProjectionChangeType, MappedSubject, ReadonlyFloat64Array, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, Subscription, UserSettingManager, VecNMath, VecNSubject, VNode
} from 'msfssdk';

import { SynVisUserSettingTypes } from '../../../settings/SynVisUserSettings';
import { AhrsSystemEvents } from '../../../system/AhrsSystem';
import { ArtificialHorizon } from './ArtificialHorizon';
import { AttitudeAircraftSymbol } from './AttitudeAircraftSymbol';
import { AttitudeIndicator, AttitudeIndicatorProps, PitchLadderStyles } from './AttitudeIndicator';
import { FlightDirector, FlightDirectorProps } from './FlightDirector';
import { FlightPathMarker, FlightPathMarkerProps } from './FlightPathMarker';
import { SyntheticVision, SyntheticVisionProps } from './SyntheticVision';

/**
 * Options for the attitude indicator.
 */
export type AttitudeIndicatorOptions = Pick<AttitudeIndicatorProps, 'slipSkidOptions'>;

/**
 * Options for the flight director.
 */
export type FlightDirectorOptions = Pick<FlightDirectorProps, 'maxPitch'>;

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

  /** The size, as `[width, height]` in pixels, of the horizon display. */
  projectedSize: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The projected offset of the center of the projection, as `[x, y]` in pixels. */
  projectedOffset?: ReadonlyFloat64Array | Subscribable<ReadonlyFloat64Array>;

  /** The update frequency, in hertz, of the horizon display. */
  updateFreq: number | Subscribable<number>;

  /** The string ID to assign to the synthetic vision layer's bound Bing instance. */
  bingId: string;

  /** Whether to use an extended field of view when synthetic vision is disabled. */
  useExtendedFov: boolean;

  /** Options for the attitude indicator. */
  attitudeIndicatorOptions: AttitudeIndicatorOptions;

  /** Options for the flight director. */
  flightDirectorOptions: FlightDirectorOptions;

  /** Options for the synthetic vision display. */
  svtOptions: SyntheticVisionOptions;

  /** A manager for synthetic vision settings. */
  svtSettingManager: UserSettingManager<SynVisUserSettingTypes>;

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

  private readonly horizonRef = FSComponent.createRef<HorizonComponent>();

  private readonly projectionParams = {
    position: new GeoPoint(0, 0),
    altitude: 0,
    heading: 0,
    pitch: 0,
    roll: 0
  };

  private readonly ahrsIndex = SubscribableUtils.toSubscribable(this.props.ahrsIndex, true);

  private ahrsIndexSub?: Subscription;

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

  private readonly ahrsState = ConsumerSubject.create(null, { previous: undefined, current: AvionicsSystemState.On } as AvionicsSystemStateEvent);

  private readonly isAhrsOn = Subject.create(true);

  private readonly isSvtEnabled = MappedSubject.create(
    ([isAhrsOn, svtEnabledSetting]): boolean => isAhrsOn && svtEnabledSetting,
    this.isAhrsOn,
    this.props.svtSettingManager.getSetting('svtEnabled')
  );

  private readonly normalFov = this.props.normalFov ?? HorizonDisplay.DEFAULT_NORMAL_FOV;
  private readonly extendedFov = this.props.extendedFov ?? HorizonDisplay.DEFAULT_EXTENDED_FOV;

  private readonly fov = this.props.useExtendedFov
    ? this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.extendedFov)
    : this.isSvtEnabled.map(isEnabled => isEnabled ? HorizonDisplay.BING_FOV : this.normalFov);

  private readonly nonSvtFovEndpoints = VecNMath.create(4, 0.5, 0, 0.5, 1);
  private readonly svtFovEndpoints = VecNSubject.createFromVector(VecNMath.create(4, 0.5, 0, 0.5, 1));
  private readonly fovEndpoints = VecNSubject.createFromVector(VecNMath.create(4, 0.5, 0, 0.5, 1));

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

    const sub = this.props.bus.getSubscriber<AdcEvents & AhrsEvents & GNSSEvents & AhrsSystemEvents>();

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

    this.ahrsState.sub(this.onAhrsStateChanged.bind(this), true);

    this.isAhrsOn.sub(value => {
      if (value) {
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

    this.position.setConsumer(sub.on('gps-position'));

    this.ahrsIndexSub = this.ahrsIndex.sub(index => {
      this.heading.setConsumer(sub.on(`ahrs_hdg_deg_true_${index}`));
      this.pitch.setConsumer(sub.on(`ahrs_pitch_deg_${index}`));
      this.roll.setConsumer(sub.on(`ahrs_roll_deg_${index}`));

      this.ahrsState.setConsumer(sub.on(`ahrs_state_${index}`));
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
   * Responds to AHRS system state events.
   * @param state An AHRS system state event.
   */
  private onAhrsStateChanged(state: AvionicsSystemStateEvent): void {
    if (state.previous === undefined && state.current !== AvionicsSystemState.Off) {
      this.isAhrsOn.set(true);
    } else {
      this.isAhrsOn.set(state.current === AvionicsSystemState.On);
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
            ([isAhrsOn, isSvtEnabled]): boolean => isAhrsOn && !isSvtEnabled,
            this.isAhrsOn,
            this.isSvtEnabled
          )}
        />
        <SyntheticVision
          projection={projection}
          bingId={this.props.bingId}
          isEnabled={this.isSvtEnabled}
          showHeadingLabels={this.props.svtSettingManager.getSetting('svtHeadingLabelShow')}
          {...this.props.svtOptions}
        />
        <AttitudeIndicator
          projection={projection}
          bus={this.props.bus}
          ahrsIndex={this.ahrsIndex}
          isSVTEnabled={this.isSvtEnabled}
          pitchLadderOptions={{
            svtDisabledStyles: this.props.useExtendedFov ? HorizonDisplay.getExtendedFovPitchLadderStyles() : HorizonDisplay.getNormalFovPitchLadderStyles(),
            svtEnabledStyles: HorizonDisplay.getNormalFovPitchLadderStyles()
          }}
          {...this.props.attitudeIndicatorOptions}
        />
        <FlightPathMarker
          projection={projection}
          bus={this.props.bus}
          show={this.isSvtEnabled}
        />
        <FlightDirector
          projection={projection}
          bus={this.props.bus}
          show={this.isAhrsOn}
          {...this.props.flightDirectorOptions}
        />
        <AttitudeAircraftSymbol projection={projection} show={Subject.create(true)} />
      </HorizonComponent>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.isAlive = false;

    this.isSvtEnabled.destroy();
    this.paramSubjects.forEach(subject => { subject.destroy(); });
    this.ahrsState.destroy();

    this.updateFreqSub?.destroy();
    this.updateCycleSub?.destroy();
    this.ahrsIndexSub?.destroy();

    this.horizonRef.getOrDefault()?.destroy();
  }

  /**
   * Gets pitch ladder styling options for a normal field of view.
   * @returns Pitch ladder styling options for a normal field of view.
   */
  private static getNormalFovPitchLadderStyles(): PitchLadderStyles {
    return {
      minorLineIncrement: 2.5,
      mediumLineFactor: 2,
      majorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineShowNumber: false,
      mediumLineShowNumber: true,
      majorLineShowNumber: true,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100
    };
  }

  /**
   * Gets pitch ladder styling options for an extended field of view.
   * @returns Pitch ladder styling options for an extended field of view.
   */
  private static getExtendedFovPitchLadderStyles(): PitchLadderStyles {
    return {
      minorLineIncrement: 2.5,
      mediumLineFactor: 2,
      majorLineFactor: 2,
      minorLineMaxPitch: 20,
      mediumLineMaxPitch: 30,
      minorLineShowNumber: false,
      mediumLineShowNumber: false,
      majorLineShowNumber: true,
      minorLineLength: 25,
      mediumLineLength: 50,
      majorLineLength: 100
    };
  }
}