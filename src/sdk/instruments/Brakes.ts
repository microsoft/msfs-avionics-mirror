/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarDefinition, SimVarValueType } from '../data/SimVars';
import { SimVarPublisher } from './BasePublishers';

/**
 * An interface that describes the possible Brake events.
 */
export interface BrakeEvents {
  /** Brake position on the left side, in percentage */
  brake_position_left: number;
  /** Brake position on the right side, in percentage */
  brake_position_right: number;
  /** Raw Brake position on the left side, in percentage - excluding parking brake effects */
  brake_position_left_raw: number;
  /** Raw Brake position on the right side, in percentage - excluding parking brake effects */
  brake_position_right_raw: number;
  /** Left wheel rpm */
  left_wheel_rpm: number;
  /** Right wheel rpm */
  right_wheel_rpm: number;
  /** Whether parking brake is set */
  parking_brake_set: boolean;
}

/**
 * A publisher for Brake information.
 */
export class BrakeSimvarPublisher extends SimVarPublisher<BrakeEvents> {

  /**
   * Create a BrakePublisher.
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<BrakeEvents> | undefined = undefined) {

    const simvars = new Map<keyof BrakeEvents, SimVarDefinition>([
      ['brake_position_left', { name: 'BRAKE LEFT POSITION', type: SimVarValueType.Percent }],
      ['brake_position_right', { name: 'BRAKE RIGHT POSITION', type: SimVarValueType.Percent }],
      ['brake_position_left_raw', { name: 'BRAKE LEFT POSITION EX1', type: SimVarValueType.Percent }],
      ['brake_position_right_raw', { name: 'BRAKE RIGHT POSITION EX1', type: SimVarValueType.Percent }],
      ['left_wheel_rpm', { name: 'LEFT WHEEL RPM', type: SimVarValueType.RPM }],
      ['right_wheel_rpm', { name: 'RIGHT WHEEL RPM', type: SimVarValueType.RPM }],
      ['parking_brake_set', { name: 'BRAKE PARKING POSITION', type: SimVarValueType.Bool }],
    ]);

    super(simvars, bus, pacer);

  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}