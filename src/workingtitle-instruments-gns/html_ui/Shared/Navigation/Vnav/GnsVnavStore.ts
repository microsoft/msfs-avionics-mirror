import { AdcEvents, ConsumerSubject, EventBus, GNSSEvents, LNavEvents, LNavUtils, Subject } from '@microsoft/msfs-sdk';
import { GnsObsEvents } from '../GnsObsEvents';
import { ObsSuspModes } from '@microsoft/msfs-garminsdk';

/**
 * Store for GNS VNAV
 */
export class GnsVnavStore {
  /**
   * Ctor
   * @param bus the event bus
   * @param lnavIndex The index of the LNAV from which to source data.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly lnavIndex: number
  ) {
  }

  public readonly ppos = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('gps-position'), new LatLongAlt(0, 0));

  public readonly groundSpeed = ConsumerSubject.create(this.bus.getSubscriber<GNSSEvents>().on('ground_speed'), 0);

  public readonly currentAltitude = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('pressure_alt'), 0);

  public readonly currentVerticalSpeed = ConsumerSubject.create(this.bus.getSubscriber<AdcEvents>().on('vertical_speed'), 0);

  public readonly distanceAlongActiveLeg = ConsumerSubject.create(this.bus.getSubscriber<LNavEvents>().on(`lnav_leg_distance_along${LNavUtils.getEventBusTopicSuffix(this.lnavIndex)}`), 0);

  public readonly obsSuspMode = ConsumerSubject.create(this.bus.getSubscriber<GnsObsEvents>().on('obs_susp_mode'), ObsSuspModes.NONE);

  public readonly approachingProfileMessageInhibited = Subject.create(false);

  public readonly approachingTargetAltitudeMessageInhibited = Subject.create(false);
}