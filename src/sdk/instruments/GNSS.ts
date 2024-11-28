import { EventBus, EventBusMetaEvents } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { MagVar } from '../geo/MagVar';
import { NavMath } from '../geo/NavMath';
import { BitFlags } from '../math/BitFlags';
import { Vec3Math } from '../math/VecMath';
import { BasePublisher, SimVarPublisher } from './BasePublishers';

/**
 * Events related to global positioning and inertial data.
 */
export interface GNSSEvents {

  /** A GNSS location change event. */
  ['gps-position']: LatLongAlt;

  /** The current zulu time change event. */
  zulu_time: number;

  /** The current time of day change event. */
  time_of_day: number;

  /**
   * The airplane's ground track, in degrees relative to true north. This value defaults to the last known valid ground
   * track value if the current value cannot be computed due to low ground speed (less than or equal to 0.1 knots). If
   * there is no last known valid ground track value, then the airplane's heading is used as the default instead.
   */
  track_deg_true: number;

  /**
   * The airplane's ground track, in degrees relative to magnetic north. This value defaults to the last known valid
   * ground track value if the current value cannot be computed due to low ground speed (less than or equal to 0.1
   * knots). If there is no last known valid ground track value, then the airplane's heading is used as the default
   * instead.
   */
  track_deg_magnetic: number;

  /**
   * The airplane's raw ground track, in degrees relative to true north. This value defaults to `NaN` when the
   * airplane's ground speed is equal to zero.
   */
  raw_track_deg_true: number;

  /**
   * The airplane's raw ground track, in degrees relative to magnetic north. This value defaults to `NaN` when the
   * airplane's ground speed is equal to zero.
   */
  raw_track_deg_magnetic: number;

  /** The airplane's ground speed, in knots. */
  ground_speed: number;

  /**
   * The current magnetic variation (declination) at the airplane's position, in degrees. Positive values represent
   * eastward declination (i.e. magnetic north points east of true north).
   */
  magvar: number;

  /** The altitude (elevation) of the ground directly below the airplane, in feet. */
  ground_altitude: number;

  /** The plane's height above the ground, in feet. */
  above_ground_height: number;

  /** The airplane's inertial speed, in meters per second. */
  inertial_speed: number;

  /**
   * The airplane's inertial vertical speed, in feet per minute. This is the component of the airplane's inertial
   * velocity parallel to the vector directed from the earth's center to the airplane.
   */
  inertial_vertical_speed: number;

  /** The airplane's inertial acceleration, in meters per second per second. */
  inertial_acceleration: number;

  /**
   * The component of the airplane's inertial acceleration parallel to the airplane's inertial velocity, in meters per
   * second per second.
   */
  inertial_track_acceleration: number;
}

/**
 * Bit flags describing ground track topics published by {@link GNSSPublisher}.
 */
enum TrackPublishFlag {
  None = 0,
  Gated = 1 << 0,
  Raw = 1 << 1,
  True = 1 << 2,
  Magnetic = 1 << 3,
}

/**
 * A publisher for global positioning and inertial data.
 */
export class GNSSPublisher extends BasePublisher<GNSSEvents> {

  private readonly vec3Cache = [Vec3Math.create(), Vec3Math.create()];

  private readonly simVarPublisher = new SimVarPublisher<GNSSEvents>(
    new Map([
      ['zulu_time', { name: 'E:ZULU TIME', type: SimVarValueType.Seconds }],
      ['time_of_day', { name: 'E:TIME OF DAY', type: SimVarValueType.Number }],
      ['ground_speed', { name: 'GROUND VELOCITY', type: SimVarValueType.Knots }],
      ['ground_altitude', { name: 'GROUND ALTITUDE', type: SimVarValueType.Feet }],
      ['above_ground_height', { name: 'PLANE ALT ABOVE GROUND', type: SimVarValueType.Feet }],
      ['inertial_vertical_speed', { name: 'VELOCITY WORLD Y', type: SimVarValueType.FPM }]
    ]),
    this.bus,
    this.pacer
  );

  private readonly registeredSimVarIds = {
    latitude: SimVar.GetRegisteredId('PLANE LATITUDE', SimVarValueType.Degree, ''),
    longitude: SimVar.GetRegisteredId('PLANE LONGITUDE', SimVarValueType.Degree, ''),
    altitude: SimVar.GetRegisteredId('PLANE ALTITUDE', SimVarValueType.Meters, ''),

    magVar: SimVar.GetRegisteredId('MAGVAR', SimVarValueType.Degree, ''),

    heading: SimVar.GetRegisteredId('PLANE HEADING DEGREES TRUE', SimVarValueType.Degree, ''),

    velocityWorldX: SimVar.GetRegisteredId('VELOCITY WORLD X', SimVarValueType.Knots, ''),
    velocityWorldZ: SimVar.GetRegisteredId('VELOCITY WORLD Z', SimVarValueType.Knots, ''),

    velocityBodyX: SimVar.GetRegisteredId('VELOCITY BODY X', SimVarValueType.MetersPerSecond, ''),
    velocityBodyY: SimVar.GetRegisteredId('VELOCITY BODY Y', SimVarValueType.MetersPerSecond, ''),
    velocityBodyZ: SimVar.GetRegisteredId('VELOCITY BODY Z', SimVarValueType.MetersPerSecond, ''),

    accelerationBodyX: SimVar.GetRegisteredId('ACCELERATION BODY X', SimVarValueType.MetersPerSecond, ''),
    accelerationBodyY: SimVar.GetRegisteredId('ACCELERATION BODY Y', SimVarValueType.MetersPerSecond, ''),
    accelerationBodyZ: SimVar.GetRegisteredId('ACCELERATION BODY Z', SimVarValueType.MetersPerSecond, ''),
  };

  private readonly needPublish = {
    'gps-position': false,
    'magvar': false,
    'inertial_speed': false,
    'inertial_acceleration': false,
    'inertial_track_acceleration': false
  } as const;

  private readonly trackTopicToPublishFlagsMap: Partial<Record<string, number>> = {
    'track_deg_true': TrackPublishFlag.Gated | TrackPublishFlag.True,
    'track_deg_magnetic': TrackPublishFlag.Gated | TrackPublishFlag.Magnetic,
    'raw_track_deg_true': TrackPublishFlag.Raw | TrackPublishFlag.True,
    'raw_track_deg_magnetic': TrackPublishFlag.Raw | TrackPublishFlag.Magnetic
  };
  private trackPublishFlags = TrackPublishFlag.None;

  private prevGatedTrueTrack: number | undefined = undefined;
  private prevGatedMagneticTrack: number | undefined = undefined;

  /**
   * Create an GNSSPublisher
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<GNSSEvents> | undefined = undefined) {
    super(bus, pacer);

    for (const topic in this.needPublish) {
      (this.needPublish as any)[topic] = bus.getTopicSubscriberCount(topic) > 0;
    }

    for (const topic in this.trackTopicToPublishFlagsMap) {
      if (bus.getTopicSubscriberCount(topic) > 0) {
        this.trackPublishFlags |= (this.trackTopicToPublishFlagsMap as any)[topic];
      }
    }

    bus.getSubscriber<EventBusMetaEvents>().on('event_bus_topic_first_sub').handle(this.onTopicSubscribed.bind(this));
  }

  /**
   * Responds to when a topic is first subscribed to on the event bus.
   * @param topic The subscribed topic.
   */
  private onTopicSubscribed(topic: string): void {
    if (topic in this.needPublish) {
      (this.needPublish as any)[topic] = true;

      if (this.publishActive) {
        switch (topic) {
          case 'gps-position':
            this.publishPosition();
            break;
          case 'magvar':
            this.publishTrack(TrackPublishFlag.None, true);
            break;
          case 'inertial_speed':
            this.publishInertialData(true, false, false);
            break;
          case 'inertial_acceleration':
            this.publishInertialData(false, true, false);
            break;
          case 'inertial_track_acceleration':
            this.publishInertialData(false, false, true);
            break;
        }
      }
    } else if (topic in this.trackTopicToPublishFlagsMap) {
      const topicTrackPublishFlags = this.trackTopicToPublishFlagsMap[topic] as number;
      this.trackPublishFlags |= topicTrackPublishFlags;

      if (this.publishActive) {
        this.publishTrack(topicTrackPublishFlags, false);
      }
    }
  }

  /** @inheritdoc */
  public startPublish(): void {
    super.startPublish();

    this.simVarPublisher.startPublish();
  }

  /** @inheritdoc */
  public stopPublish(): void {
    super.stopPublish();

    this.simVarPublisher.stopPublish();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    this.needPublish['gps-position'] && this.publishPosition();

    this.publishTrack(this.trackPublishFlags, this.needPublish['magvar']);

    this.publishInertialData(
      this.needPublish['inertial_speed'],
      this.needPublish['inertial_acceleration'],
      this.needPublish['inertial_track_acceleration']
    );

    this.simVarPublisher.onUpdate();
  }

  /**
   * Publishes the gps-position event.
   */
  private publishPosition(): void {
    const lat = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.latitude);
    const lon = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.longitude);
    const alt = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.altitude);

    this.publish('gps-position', new LatLongAlt(lat, lon, alt));
  }

  /**
   * Publishes the `track_deg_true`, `raw_track_deg_true`, `track_deg_magnetic`, `raw_track_deg_magnetic`, and `magvar`
   * topics.
   * @param trackFlags Bit flags describing which of the track topics to publish.
   * @param publishMagvar Whether to publish the `magvar` topic.
   */
  private publishTrack(trackFlags: number, publishMagvar: boolean): void {
    const velocityEW = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.velocityWorldX);
    const velocityNS = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.velocityWorldZ);

    let trueTrackRaw = 0;

    if (velocityEW === 0 && velocityNS === 0) {
      trueTrackRaw = NaN;
    } else {
      trueTrackRaw = NavMath.normalizeHeading(Math.atan2(velocityEW, velocityNS) * Avionics.Utils.RAD2DEG);
    }

    const magVar = SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.magVar);

    if (velocityEW * velocityEW + velocityNS * velocityNS > 0.01) {
      this.prevGatedTrueTrack = trueTrackRaw;
    } else {
      this.prevGatedTrueTrack ??= SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.heading) as number;
    }

    this.prevGatedMagneticTrack = MagVar.trueToMagnetic(this.prevGatedTrueTrack, magVar);

    if (trackFlags === TrackPublishFlag.None) {
      return;
    }

    const publishGated = BitFlags.isAll(trackFlags, TrackPublishFlag.Gated);
    const publishRaw = BitFlags.isAll(trackFlags, TrackPublishFlag.Raw);
    const publishTrue = BitFlags.isAll(trackFlags, TrackPublishFlag.True);
    const publishMagnetic = BitFlags.isAll(trackFlags, TrackPublishFlag.Magnetic);

    if (publishRaw) {
      publishTrue && this.publish('raw_track_deg_true', trueTrackRaw);
      publishMagnetic && this.publish('raw_track_deg_magnetic', MagVar.trueToMagnetic(trueTrackRaw, magVar));
    }
    if (publishGated) {
      publishTrue && this.publish('track_deg_true', this.prevGatedTrueTrack);
      publishMagnetic && this.publish('track_deg_magnetic', this.prevGatedMagneticTrack);
    }
    publishMagvar && this.publish('magvar', magVar);
  }

  /**
   * Publishes the `inertial_speed`, `inertial_acceleration`, and `inertial_track_acceleration` topics.
   * @param publishSpeed Whether to publish the `inertial_speed` topic.
   * @param publishAcceleration Whether to publish the `inertial_acceleration` topic.
   * @param publishTrackAcceleration Whether to publish the `inertial_track_acceleration` topic.
   */
  private publishInertialData(publishSpeed: boolean, publishAcceleration: boolean, publishTrackAcceleration: boolean): void {
    const velocityVec = this.vec3Cache[0];
    const accelerationVec = this.vec3Cache[1];

    let speed = 0;
    let acceleration = 0;

    if (publishSpeed || publishTrackAcceleration) {
      Vec3Math.set(
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.velocityBodyX),
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.velocityBodyY),
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.velocityBodyZ),
        velocityVec
      );

      speed = Vec3Math.abs(velocityVec);
    }

    if (publishAcceleration || publishTrackAcceleration) {
      Vec3Math.set(
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.accelerationBodyX),
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.accelerationBodyY),
        SimVar.GetSimVarValueFastReg(this.registeredSimVarIds.accelerationBodyZ),
        accelerationVec
      );

      acceleration = Vec3Math.abs(accelerationVec);
    }

    publishSpeed && this.publish('inertial_speed', speed);
    publishAcceleration && this.publish('inertial_acceleration', acceleration);
    publishTrackAcceleration && this.publish('inertial_track_acceleration', speed === 0 ? acceleration : Vec3Math.dot(accelerationVec, velocityVec) / speed);
  }

  /**
   * Gets the airplane's instantaneous true ground track, in degrees.
   * @param defaultTrack The default value to return if the airplane's ground speed is less than the threshold. If not
   * defined, then the airplane's true heading (obtained from the `PLANE HEADING DEGREES TRUE` SimVar) will be used as
   * the default value.
   * @param groundSpeedThreshold The ground speed, in knots, at or below which the default value is returned instead of
   * the ground track.
   * @returns The airplane's instantaneous true ground track, in degrees, or the default value if the airplane's ground
   * speed is less than or equal to the specified threshold.
   */
  public static getInstantaneousTrack(
    defaultTrack?: number,
    groundSpeedThreshold = 0
  ): number {
    const velocityEW = SimVar.GetSimVarValue('VELOCITY WORLD X', SimVarValueType.Knots);
    const velocityNS = SimVar.GetSimVarValue('VELOCITY WORLD Z', SimVarValueType.Knots);

    if (velocityEW * velocityEW + velocityNS * velocityNS > Math.max(groundSpeedThreshold * groundSpeedThreshold, 0)) {
      return NavMath.normalizeHeading(Math.atan2(velocityEW, velocityNS) * Avionics.Utils.RAD2DEG);
    } else {
      return defaultTrack ?? SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', SimVarValueType.Degree);
    }
  }
}
