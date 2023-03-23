import { EventBus, Facility, FacilityLoader, FacilityRepository, ICAO, Subject } from '@microsoft/msfs-sdk';

/**
 * A module which defines an icao to select.
 */
export class MapFacilitySelectModule {
  /** The ICAO of the facility to select. */
  public readonly facilityIcao = Subject.create<string | null>(null);

  public readonly facility = Subject.create<Facility | null>(null);

  private readonly facLoader;

  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.facLoader = new FacilityLoader(FacilityRepository.getRepository(bus));
    this.facilityIcao.sub(async (v) => {
      if (v) {
        const facility = await this.facLoader.getFacility(ICAO.getFacilityType(v), v);
        this.facility.set(facility);
      } else {
        this.facility.set(null);
      }
    }, false);
  }

}