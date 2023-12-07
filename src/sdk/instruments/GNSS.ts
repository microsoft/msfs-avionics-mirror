/// <reference types="@microsoft/msfs-types/js/simplane" />

import { EventBus, EventBusMetaEvents } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { NavMath } from '../geo';
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

  /** The airplane's ground track, in degrees true north. */
  track_deg_true: number;

  /** The airplane's ground track, in degrees magnetic north. */
  track_deg_magnetic: number;

  /** The airplane's ground speed, in knots. */
  ground_speed: number;

  /**
   * The current magnetic variation (declination) at the airplane's position, in degrees. Positive values represent
   * eastward declination (i.e. magnetic north points east of true north).
   */
  magvar: number;

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
 * A publisher for global positioning and inertial data.
 */
export class GNSSPublisher extends BasePublisher<GNSSEvents> {

  private readonly vec3Cache = [Vec3Math.create(), Vec3Math.create()];

  private readonly simVarPublisher = new SimVarPublisher<GNSSEvents>(
    new Map([
      ['zulu_time', { name: 'E:ZULU TIME', type: SimVarValueType.Seconds }],
      ['time_of_day', { name: 'E:TIME OF DAY', type: SimVarValueType.Number }],
      ['ground_speed', { name: 'GROUND VELOCITY', type: SimVarValueType.Knots }],
      ['above_ground_height', { name: 'PLANE ALT ABOVE GROUND', type: SimVarValueType.Feet }],
      ['inertial_vertical_speed', { name: 'VELOCITY WORLD Y', type: SimVarValueType.FPM }]
    ]),
    this.bus,
    this.pacer
  );

  private readonly needPublish = {
    'gps-position': false,
    'track_deg_true': false,
    'track_deg_magnetic': false,
    'magvar': false,
    'inertial_speed': false,
    'inertial_acceleration': false,
    'inertial_track_acceleration': false
  } as const;

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
          case 'track_deg_true':
            this.publishTrack(true, false, false);
            break;
          case 'track_deg_magnetic':
            this.publishTrack(false, true, false);
            break;
          case 'magvar':
            this.publishTrack(false, false, true);
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

    this.publishTrack(
      this.needPublish['track_deg_true'],
      this.needPublish['track_deg_magnetic'],
      this.needPublish['magvar']
    );

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
    const lat = SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree);
    const lon = SimVar.GetSimVarValue('PLANE LONGITUDE', SimVarValueType.Degree);
    const alt = SimVar.GetSimVarValue('PLANE ALTITUDE', SimVarValueType.Meters);

    this.publish('gps-position', new LatLongAlt(lat, lon, alt));
  }

  /**
   * Publishes the `track_deg_true`, `track_deg_magnetic`, and `magvar` topics.
   * @param publishTrue Whether to publish the `track_deg_true` topic.
   * @param publishMagnetic Whether to publish the `track_deg_magnetic` topic.
   * @param publishMagvar Whether to publish the `magvar` topic.
   */
  private publishTrack(publishTrue: boolean, publishMagnetic: boolean, publishMagvar: boolean): void {
    let trueTrack = 0;
    let magneticTrack = 0;
    let magvar = 0;

    if (publishTrue || publishMagnetic) {
      const headingTrue = SimVar.GetSimVarValue('PLANE HEADING DEGREES TRUE', SimVarValueType.Degree);
      trueTrack = GNSSPublisher.getInstantaneousTrack(headingTrue);
    }

    if (publishMagvar || publishMagnetic) {
      magvar = SimVar.GetSimVarValue('MAGVAR', SimVarValueType.Degree);

      if (publishMagnetic) {
        magneticTrack = NavMath.normalizeHeading(trueTrack - magvar);
      }
    }

    publishTrue && this.publish('track_deg_true', trueTrack);
    publishMagnetic && this.publish('track_deg_magnetic', magneticTrack);
    publishMagvar && this.publish('magvar', magvar);
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
        SimVar.GetSimVarValue('VELOCITY BODY X', SimVarValueType.MetersPerSecond),
        SimVar.GetSimVarValue('VELOCITY BODY Y', SimVarValueType.MetersPerSecond),
        SimVar.GetSimVarValue('VELOCITY BODY Z', SimVarValueType.MetersPerSecond),
        velocityVec
      );

      speed = Vec3Math.abs(velocityVec);
    }

    if (publishAcceleration || publishTrackAcceleration) {
      Vec3Math.set(
        SimVar.GetSimVarValue('ACCELERATION BODY X', SimVarValueType.MetersPerSecond),
        SimVar.GetSimVarValue('ACCELERATION BODY Y', SimVarValueType.MetersPerSecond),
        SimVar.GetSimVarValue('ACCELERATION BODY Z', SimVarValueType.MetersPerSecond),
        accelerationVec
      );

      acceleration = Vec3Math.abs(accelerationVec);
    }

    publishSpeed && this.publish('inertial_speed', speed);
    publishAcceleration && this.publish('inertial_acceleration', acceleration);
    publishTrackAcceleration && this.publish('inertial_track_acceleration', speed === 0 ? acceleration : Vec3Math.dot(accelerationVec, velocityVec) / speed);
  }

  /**
   * Gets the instantaneous true track.
   * @param headingTrue The true heading, in degrees.
   * @returns The true track, in degrees.
   */
  public static getInstantaneousTrack(headingTrue = 0): number {
    const velocityEW = SimVar.GetSimVarValue('VELOCITY WORLD X', SimVarValueType.Knots);
    const velocityNS = SimVar.GetSimVarValue('VELOCITY WORLD Z', SimVarValueType.Knots);

    let track = headingTrue;
    if (velocityEW !== 0 || velocityNS !== 0) {
      track = NavMath.normalizeHeading(Math.atan2(velocityEW, velocityNS) * Avionics.Utils.RAD2DEG);
    }
    return track;
  }
}
