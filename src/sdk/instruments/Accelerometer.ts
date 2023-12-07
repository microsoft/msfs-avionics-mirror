import { PublishPacer, SimVarValueType } from '../data';
import { EventBus } from '../data/EventBus';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Events related to acceleration of the airplane.
 */
export interface AccelerometerEvents {
  /** The current value from the G-Meter */
  g_force: number
  /** Maximum G force attained */
  max_g_force: number
  /** Minimum G force attained */
  min_g_force: number
}

/**
 * A publisher for Accelerometer information.
 */
export class AccelerometerPublisher extends SimVarPublisher<AccelerometerEvents> {
  /**
   * Creates an AccelerometerPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AccelerometerEvents>) {
    const simvars = new Map<keyof AccelerometerEvents, SimVarPublisherEntry<any>>([
      ['g_force', { name: 'G FORCE', type: SimVarValueType.Number }],
      ['max_g_force', { name: 'MAX G FORCE', type: SimVarValueType.Number }],
      ['min_g_force', { name: 'MIN G FORCE', type: SimVarValueType.Number }],
    ]);

    super(simvars, bus, pacer);
  }
}