import { EventBus, Facility, FacilityLoader, FacilityRepository, ICAO, Subject, UserFacility } from '@microsoft/msfs-sdk';

/**
 * A module which defines an icao to select.
 */
export class MapFacilitySelectModule {
  /** The ICAO of the facility to select. */
  public readonly facilityIcao = Subject.create<string | null>(null);

  public readonly facility = Subject.create<Facility | null>(null);

  public readonly userFacility = Subject.create<UserFacility | null>(null);

  private readonly facLoader;

  /**
   * Ctor
   * @param bus The event bus.
   */
  constructor(bus: EventBus) {
    this.facLoader = new FacilityLoader(FacilityRepository.getRepository(bus));
    this.facilityIcao.sub(this.updateFacility.bind(this), false);
    this.userFacility.sub(this.updateFacility.bind(this), false);
  }

  /** Updates the facility. */
  private async updateFacility(): Promise<void> {
    const facilityIcao = this.facilityIcao.get();
    const userFacility = this.userFacility.get();

    if (facilityIcao) {
      if (facilityIcao === userFacility?.icao) {
        this.facility.set(userFacility);
      } else {
        const facility = await this.facLoader.getFacility(ICAO.getFacilityType(facilityIcao), facilityIcao);
        this.facility.set(facility);
      }
    } else {
      this.facility.set(null);
    }
  }
}
