import {
  ArraySubject, EventBus, Facility, GeoPoint, GNSSEvents, Instrument, NearestContext, SubscribableArrayEventType, UnitType, VorFacility, VorType
} from '@microsoft/msfs-sdk';

/**
 * Interface responsible for handling the selection of DME and VOR facilities
 */
export class UnsRadioNavaidManager implements Instrument {
  private static MAX_DME_TRACKING = 15;
  private static MAX_DME_RANGE = UnitType.GA_RADIAN.convertFrom(300, UnitType.NMILE);
  private static MAX_VOR_TRACKING = 49;
  private static MAX_VOR_RANGE = UnitType.GA_RADIAN.convertFrom(180, UnitType.NMILE);

  private nearestContext: NearestContext | undefined;
  private position = new GeoPoint(0,0);
  private internalVors = ArraySubject.create([] as VorFacility[]);
  private internalDmes = ArraySubject.create([] as VorFacility[]);
  public vors = ArraySubject.create([] as VorFacility[]);
  public dmes = ArraySubject.create([] as VorFacility[]);
  public nearestVor: VorFacility | undefined;

  /** @inheritdoc */
  constructor(private bus: EventBus) {}

  /** @inheritdoc */
  init(): void {
    this.bus.getSubscriber<GNSSEvents>().on('gps-position').handle(pos => this.position.set(pos.lat, pos.long));
    this.handleNearestFacilities();
  }

  /** @inheritdoc */
  onUpdate(): void {
    // throw new Error('Method not implemented.');
  }

  /**
   * Checks if the facility is a valid VOR
   * @param facility Facility to check
   * @returns If facility is a VOR
   */
  private isFacilityVor(facility: VorFacility): boolean {
    switch (facility.type) {
      case VorType.VOR:
      case VorType.VORDME:
      case VorType.VORTAC:
        return true;
      default:
        return false;
    }
  }

   /**
    * Checks if the facility is a valid DME
    * @param facility Facility to check
    * @returns If facility is a DME
    */
   private isFacilityDme(facility: VorFacility): boolean {
    switch (facility.type) {
      case VorType.DME:
      case VorType.VORDME:
        return true;
      default:
        return false;
    }
  }

  /**
   * Sorts the facilities from closest to furthest
   * @param a Facility A
   * @param b Facility B
   * @returns Number for sort function
   */
  private orderByDistance(a: Facility, b: Facility): number {
    const aDist = this.position.distance(a.lat, a.lon);
    const bDist = this.position.distance(b.lat, b.lon);

    if (aDist < bDist) {
    return -1;
    }

    if (aDist > bDist) {
    return 1;
    }

    return 0;
  }

  /**
   * Filters internal DMEs to only those that are within the allowed limits.
   * Supposed to be called before use of the DME list to ensure it is populated
   */
  public filterDMEs(): void {
    if (this.position && this.position.distance) {
      const sortedDmes = [...this.internalDmes.getArray()].sort((a, b) => this.orderByDistance(a,b)).filter((dme, index) => {
        return index < UnsRadioNavaidManager.MAX_DME_TRACKING && this.position.distance(dme.lat, dme.lon) < UnsRadioNavaidManager.MAX_DME_RANGE;
      });
      this.dmes.set(sortedDmes);
    }
  }

  /**
   * Filters internal VORs to only those that are within the allowed limits.
   * Supposed to be called before use of the VOR list to ensure it is populated
   */
  public filterVORs(): void {
    if (this.position && this.position.distance) {

      const sortedVors = [...this.internalVors.getArray()].sort((a, b) => this.orderByDistance(a,b)).filter((vor, index) => {
        return index < UnsRadioNavaidManager.MAX_VOR_TRACKING && this.position.distance(vor.lat, vor.lon) < UnsRadioNavaidManager.MAX_VOR_RANGE;
      });
      this.vors.set(sortedVors);
    }
  }

  /**
   * Searches for and handles the selection of the nearest facilities
   */
  private handleNearestFacilities(): void {
    NearestContext.onInitialized((instance) => {
      this.nearestContext = instance;
      instance.vorRadius = UnitType.GA_RADIAN.convertTo(Math.max(UnsRadioNavaidManager.MAX_DME_RANGE, UnsRadioNavaidManager.MAX_VOR_RANGE), UnitType.NMILE);

      instance.vors.sub((_index, type, item) => {
        const validItem = item as VorFacility;
        let itemIndex;
        if (this.isFacilityDme(validItem)) {
          switch (type) {
            case SubscribableArrayEventType.Added:
              this.internalDmes.insert(validItem);
              break;
            case SubscribableArrayEventType.Removed:
              itemIndex = this.internalDmes.getArray().findIndex((findItem) => findItem.icao == validItem.icao);
              this.internalDmes.removeAt(itemIndex);
              break;
            case SubscribableArrayEventType.Cleared:
              this.internalDmes.clear();
              break;
          }
        }
        if (this.isFacilityVor(validItem)) {
          switch (type) {
            case SubscribableArrayEventType.Added:
              this.internalVors.insert(validItem);
              break;
            case SubscribableArrayEventType.Removed:
              itemIndex = this.internalVors.getArray().findIndex((findItem) => findItem.icao == validItem.icao);
              this.internalVors.removeAt(itemIndex);
              break;
            case SubscribableArrayEventType.Cleared:
              this.internalVors.clear();
              break;
          }
        }
      });
    });
  }
}
