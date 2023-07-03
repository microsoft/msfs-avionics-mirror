/// <reference types="@microsoft/msfs-types/js/simvar" />

import { EventBus, IndexedEventType } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * An interface that describes the base Weight and Balance events.
 */
export interface BaseWeightBalanceEvents {
  /** A total weight value for the aircraft, in pounds. */
  total_weight: number;
  /** The weight value of a payload station with the given index */
  payload_station_weight: number;
}

/** Indexed topics. */
type IndexedTopics = 'payload_station_weight';

/**
 * Indexed events related to Weight and Balance.
 */
type WeightBalanceIndexedEvents = {
  [P in keyof Pick<BaseWeightBalanceEvents, IndexedTopics> as IndexedEventType<P>]: BaseWeightBalanceEvents[P];
}

/**
 * Events related to Weight and Balance.
 */
export interface WeightBalanceEvents extends BaseWeightBalanceEvents, WeightBalanceIndexedEvents {
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
  public constructor(bus: EventBus, pacer?: PublishPacer<WeightBalanceEvents>) {

    const simvars = new Map<keyof WeightBalanceEvents, SimVarPublisherEntry<any>>([
      ['total_weight', { name: 'TOTAL WEIGHT', type: SimVarValueType.Pounds }],
      ['payload_station_weight', { name: 'PAYLOAD STATION WEIGHT:#index#', type: SimVarValueType.Pounds, indexed: true }],
    ]);

    super(simvars, bus, pacer);

  }

  /** @inheritdoc */
  public onUpdate(): void {
    super.onUpdate();
  }
}
