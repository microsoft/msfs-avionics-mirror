/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * An interface that describes the possible aircraft inertial motion events.
 */
export interface AircraftInertialEvents {
  /**
   * The airplane's linear acceleration, in meters per second per second, along the airplane's lateral (left-right)
   * axis. Positive values indicate acceleration toward the right of the airplane.
   */
  acceleration_body_x: number;

  /**
   * The airplane's linear acceleration, in meters per second per second, along the airplane's vertical (bottom-top)
   * axis. Positive values indicate acceleration toward the top of the airplane.
   */
  acceleration_body_y: number;

  /**
   * The airplane's linear acceleration, in meters per second per second, along the airplane's longitudinal
   * (rear-front) axis. Positive values indicate acceleration toward the front of the airplane.
   */
  acceleration_body_z: number;

  /**
   * The airplane's rotational velocity, in degrees per second, about its lateral (left-right) axis (i.e. the rate of
   * change of its pitch angle). Positive values indicate the airplane is pitching down.
   */
  rotation_velocity_body_x: number;

  /**
   * The airplane's rotational velocity, in degrees per second, about its vertical (bottom-top) axis (i.e. the rate of
   * change of its yaw angle). Positive values indicate the airplane is yawing to the right.
   */
  rotation_velocity_body_y: number;

  /**
   * The airplane's rotational velocity, in degrees per second, about its longitudinal (rear-front) axis (i.e. the rate
   * of change of its roll/bank angle). Positive values indicate the airplane is rolling to the left.
   */
  rotation_velocity_body_z: number;

  /** The airplane's load factor. */
  load_factor: number;

  /** The rate of change of the airplane's load factor per second. */
  load_factor_rate: number;
}

/**
 * A publisher for Aircraft information.
 */
export class AircraftInertialPublisher extends SimVarPublisher<AircraftInertialEvents> {

  /**
   * Create a AircraftSimvarPublisher.
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<AircraftInertialEvents> | undefined = undefined) {

    const simvars = new Map<keyof AircraftInertialEvents, SimVarPublisherEntry<any>>([
      ['acceleration_body_x', { name: 'ACCELERATION BODY X', type: SimVarValueType.MetersPerSecondSquared }],
      ['acceleration_body_y', { name: 'ACCELERATION BODY Y', type: SimVarValueType.MetersPerSecondSquared }],
      ['acceleration_body_z', { name: 'ACCELERATION BODY Z', type: SimVarValueType.MetersPerSecondSquared }],
      ['rotation_velocity_body_x', { name: 'ROTATION VELOCITY BODY X', type: SimVarValueType.DegreesPerSecond }],
      ['rotation_velocity_body_y', { name: 'ROTATION VELOCITY BODY Y', type: SimVarValueType.DegreesPerSecond }],
      ['rotation_velocity_body_z', { name: 'ROTATION VELOCITY BODY Z', type: SimVarValueType.DegreesPerSecond }],
      ['load_factor', { name: 'SEMIBODY LOADFACTOR Y', type: SimVarValueType.Number }],
      ['load_factor_rate', { name: 'SEMIBODY LOADFACTOR YDOT', type: SimVarValueType.PerSecond }],
    ]);

    super(simvars, bus, pacer);

  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
