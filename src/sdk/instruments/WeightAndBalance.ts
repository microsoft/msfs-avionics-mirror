/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarDefinition, SimVarValueType } from '../data/SimVars';
import { SimVarPublisher } from './BasePublishers';

/**
 * An interface that describes the possible Weight and Balance events.
 */
export interface WeightBalanceEvents {
  /** A total weight value for the aircraft, in pounds. */
  total_weight: number;
}

/**
 * A publisher for Engine information.
 */
export class WeightBalanceSimvarPublisher extends SimVarPublisher<WeightBalanceEvents> {

  /**
   * Create a WeightAndBalancePublisher.
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer: PublishPacer<WeightBalanceEvents> | undefined = undefined) {

    const simvars = new Map<keyof WeightBalanceEvents, SimVarDefinition>([
      ['total_weight', { name: 'TOTAL WEIGHT', type: SimVarValueType.Pounds }],
    ]);

    super(simvars, bus, pacer);

  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
