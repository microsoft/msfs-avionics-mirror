/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * An interface that describes the possible aircraft inertial motion events.
 */
export interface AircraftInertialEvents {
  /** Lateral acceleration relative to aircraft X axis, in east/west direction in metres/sec^2, +ve to the right. */
  acceleration_body_x: number,
  /** Vertical acceleration relative to aircraft Y axis, in vertical direction in metres/sec^2, +ve upwards. */
  acceleration_body_y: number,
  /** Longitudinal acceleration relative to aircraft Z axis, in fore/aft direction in metres/sec^2, +ve forwards. */
  acceleration_body_z: number,
  /** Pitch rotation velocity relative to aircraft X axis in °/sec, +ve downwards. */
  rotation_velocity_body_x: number,
  /** Yaw rotation velocity relative to aircraft Y axis in °/sec, +ve right. */
  rotation_velocity_body_y: number,
  /** Roll rotation velocity relative to aircraft Z axis in °/sec +ve to the left. */
  rotation_velocity_body_z: number,
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
    ]);

    super(simvars, bus, pacer);

  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
