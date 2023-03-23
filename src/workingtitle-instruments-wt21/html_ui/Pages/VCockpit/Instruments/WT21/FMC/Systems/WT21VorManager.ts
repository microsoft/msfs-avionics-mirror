import { AdcEvents, ControlEvents, DebounceTimer, EventBus, Facility, FacilityLoader, GeoPoint, GNSSEvents, NavSourceType, NearestVorSubscription, UnitType, VorClass, VorFacility } from '@microsoft/msfs-sdk';
import { FgpUserSettings, VorTuningMode } from '../../Shared/Profiles/FgpUserSettings';

/**
 * A class managing VOR auto tuning in the WT21.
 */
export class WT21VorManager {
  private readonly fgpSettings = FgpUserSettings.getManager(this.bus);
  private nav1VorTuningMode = this.fgpSettings.getSetting('nav1VorTuningMode');
  private nav2VorTuningMode = this.fgpSettings.getSetting('nav2VorTuningMode');
  private navSrc = NavSourceType.Gps;
  public readonly nearestVors: NearestVorSubscription;
  private readonly position = new GeoPoint(0, 0);
  private planeAltitude = 0;
  private horizonDistance = 10;
  private readonly autoTuningTimer = new DebounceTimer();

  /**
   * Ctor
   * @param bus The event bus.
   * @param facilityLoader The facility loader.
   */
  constructor(private readonly bus: EventBus, private readonly facilityLoader: FacilityLoader) {
    this.nearestVors = new NearestVorSubscription(facilityLoader);

    this.bus.getSubscriber<GNSSEvents>().on('gps-position')
      .handle(pos => this.position.set(pos.lat, pos.long));

    this.bus.getSubscriber<AdcEvents>().on('indicated_alt').whenChangedBy(10).handle((z) => {
      this.planeAltitude = z;
      const earthRadius = UnitType.GA_RADIAN.convertTo(1, UnitType.NMILE);
      const planeAltNm = Math.max(0, UnitType.FOOT.convertTo(this.planeAltitude, UnitType.NMILE));
      this.horizonDistance = Math.sqrt(planeAltNm * (2 * earthRadius + planeAltNm));
    });

    this.nearestVors.start();

    this.nav1VorTuningMode.sub((v) => {
      if (v === VorTuningMode.Auto) {
        this.autoTuningTimer.schedule(() => this.updateVors(), 3000);
      }
    }, true);

    this.nav2VorTuningMode.sub((v) => {
      if (v === VorTuningMode.Auto) {
        this.autoTuningTimer.schedule(() => this.updateVors(), 3000);
      }
    }, true);

    this.bus.getSubscriber<ControlEvents>().on('cdi_src_set').handle((src) => {
      this.navSrc = src.type ?? NavSourceType.Gps;
      this.autoTuningTimer.schedule(() => this.updateVors(), 3000);
    });
  }

  /**
   * Searches for the nearest VORs and tunes the radios to them.
   */
  public async updateVors(): Promise<void> {
    if (this.navSrc === NavSourceType.Gps && (this.nav1VorTuningMode.get() === VorTuningMode.Auto || this.nav2VorTuningMode.get() === VorTuningMode.Auto)) {
      // Do facility search to find nearest VORs
      await this.nearestVors.update(this.position.lat, this.position.lon, UnitType.NMILE.convertTo(150, UnitType.METER), 20);

      let listOfVors = this.nearestVors.getArray();

      if (listOfVors.length > 0) {
        if (this.nav1VorTuningMode.get() === VorTuningMode.Auto) {
          const nearestVor1 = this.findNearest(listOfVors) as VorFacility;
          SimVar.SetSimVarValue('K:NAV1_RADIO_SET_HZ', 'number', nearestVor1.freqMHz * 1_000_000);
          listOfVors = listOfVors.filter(fac => fac !== nearestVor1);
        }
        if (this.nav2VorTuningMode.get() === VorTuningMode.Auto) {
          const nearestVor2 = this.findNearest(listOfVors) as VorFacility | undefined;
          if (nearestVor2 !== undefined) {
            SimVar.SetSimVarValue('K:NAV2_RADIO_SET_HZ', 'number', nearestVor2.freqMHz * 1_000_000);
          }
        }
      }

      // search every 5 minutes
      this.autoTuningTimer.schedule(() => this.updateVors(), 5 * 1000 * 60);
    }
  }

  /**
   * Finds the nearest facility in an array.
   * @param array A non-empty array of facilities.
   * @returns The nearest facility in the specified array.
   */
  private findNearest(array: readonly Facility[]): Facility | undefined {
    let nearest: Facility | undefined = undefined;
    let nearestDistance = Infinity;

    for (let i = 0; i < array.length; i++) {
      const fac = array[i];
      const distance = this.position.distance(fac);

      if (distance < nearestDistance && this.isInRange(fac as VorFacility)) {
        nearest = fac;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Check if a VOR facility is within a suitable range for VOR autotuning
   * @param facility The VOR facility to check
   * @param checkConeOfConfusion Whether to check the cone of confusion criteria
   * @returns true if the facility is within range
   */
  private isInRange(facility: VorFacility, checkConeOfConfusion = true): boolean {
    if (this.planeAltitude > 18000 && (facility.vorClass === VorClass.LowAlt || facility.vorClass === VorClass.Terminal)) {
      return false;
    }

    if (this.planeAltitude > 12000 && facility.vorClass === VorClass.Terminal) {
      return false;
    }

    const dist = UnitType.GA_RADIAN.convertTo(this.position.distance(facility.lat, facility.lon), UnitType.NMILE);
    switch (facility.vorClass) {
      case VorClass.HighAlt:
        // unfortunately MSFS db doesn't have FoM to determine range of 130 or 250
        if (dist > 130) {
          return false;
        }
        break;
      case VorClass.LowAlt:
        if (dist > 70) {
          return false;
        }
        break;
      default:
        if (dist > 40) {
          return false;
        }
    }

    // Check we can see the navaid over the horizon, with a conservative adjustment for refraction
    // Note: the real thing also considers the navaid elevation, but that information is not available to us from the facility
    if (dist > Math.max(10, (7 / 6 * this.horizonDistance))) {
      return false;
    }

    if (!checkConeOfConfusion) {
      return true;
    }

    // cone of confusion is 30° up to infinite altitude
    const coneOfConfusionDist = UnitType.NMILE.convertFrom(this.planeAltitude, UnitType.FOOT) * Math.tan(Math.PI / 6);

    return dist > coneOfConfusionDist;
  }
}