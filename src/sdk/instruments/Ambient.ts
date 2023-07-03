import { EventBus } from '../data/EventBus';
import { PublishPacer } from '../data/EventBusPacer';
import { SimVarValueType } from '../data/SimVars';
import { SimVarPublisher, SimVarPublisherEntry } from './BasePublishers';

/**
 * Ambient precipitation states.
 */
export enum AmbientPrecipState {
  None = 1 << 1,
  Rain = 1 << 2,
  Snow = 1 << 3
}

/**
 * Events related to air data computer information.
 */
export interface AmbientEvents {
  /** The ambient precipitation state. */
  ambient_precip_state: number;

  /** The ambient precipitation rate, in millimeters per hour. */
  ambient_precip_rate: number;

  /** The ambient particle visibility, in meters. */
  ambient_visibility: number;

  /** Whether the airplane is in a cloud. */
  ambient_in_cloud: boolean;

  /**
   * The QNH (barometric pressure setting required for an altimeter at ground elevation to read true ground elevation)
   * at the airplane's current position, in inches of mercury.
   */
  ambient_qnh_inhg: number;

  /**
   * The QNH (barometric pressure setting required for an altimeter at ground elevation to read true ground elevation)
   * at the airplane's current position, in millibars.
   */
  ambient_qnh_mb: number;
}

/**
 * A publisher for ambient environment information.
 */
export class AmbientPublisher extends SimVarPublisher<AmbientEvents> {
  /**
   * Creates an AmbientPublisher.
   * @param bus The event bus to which to publish.
   * @param pacer An optional pacer to use to control the rate of publishing.
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<AmbientEvents>) {
    const simvars = new Map<keyof AmbientEvents, SimVarPublisherEntry<any>>([
      ['ambient_precip_state', { name: 'AMBIENT PRECIP STATE', type: SimVarValueType.Number }],
      ['ambient_precip_rate', { name: 'AMBIENT PRECIP RATE', type: SimVarValueType.MillimetersWater }],
      ['ambient_visibility', { name: 'AMBIENT VISIBILITY', type: SimVarValueType.Meters }],
      ['ambient_in_cloud', { name: 'AMBIENT IN CLOUD', type: SimVarValueType.Bool }],
      ['ambient_qnh_inhg', { name: 'SEA LEVEL PRESSURE', type: SimVarValueType.InHG }],
      ['ambient_qnh_mb', { name: 'SEA LEVEL PRESSURE', type: SimVarValueType.MB }],
    ]);

    super(simvars, bus, pacer);
  }
}
