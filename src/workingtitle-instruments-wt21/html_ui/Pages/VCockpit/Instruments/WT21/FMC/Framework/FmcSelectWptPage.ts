import { DmsFormatter, Facility, FacilityType, ICAO, Subject, VorClass, VorFacility, VorType } from '@microsoft/msfs-sdk';

import { FmcSelectKeysEvent } from '../FmcEvent';
import { Binding } from './FmcDataBinding';
import { FmcPage, FmcPageLifecyclePolicy } from './FmcPage';
import { FmcRenderTemplate, FmcRenderTemplateRow } from './FmcRenderer';

/**
 * SELECT WPT page
 */
export class FmcSelectWptPopup extends FmcPage {

  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  facilities = Subject.create<Facility[]>([]);

  facilityType = 'WPT';

  selectedFacility = Subject.create<Facility | null>(null);

  /** @inheritDoc */
  onInit(): void {
    this.addBinding(new Binding(
      this.facilities,
      this.invalidate.bind(this),
    ));
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    const numPages = Math.max(1, Math.ceil(this.facilities.get().length / 2));

    const pages: FmcRenderTemplate[] = [];

    for (let i = 0; i < numPages; i++) {
      pages.push(this.renderFacilitiesPage(i));
    }

    return pages;
  }

  private dmsFormatter = new DmsFormatter();

  /**
   * Renders a facilities page
   *
   * @param pageIndex the current subpage index
   *
   * @returns template
   */
  private renderFacilitiesPage(pageIndex: number): FmcRenderTemplate {
    return [
      ['', this.PagingIndicator, `SELECT ${this.facilityType}[blue]`],
      [''],
      [''],
      [''],
      ...this.renderFacilities(pageIndex),
    ];
  }

  /**
   * Renders the rows for facilities
   *
   * @param pageIndex the current subpage index
   *
   * @returns template rows
   * **/
  private renderFacilities(pageIndex: number): FmcRenderTemplateRow[] {
    const render = [];

    const startIndex = pageIndex * 2;

    for (const facility of this.facilities.get().slice(startIndex, startIndex + 2)) {
      const latString = this.dmsFormatter.getLatDmsStr(facility.lat, false).slice(0, -1);
      const lonString = this.dmsFormatter.getLonDmsStr(facility.lon).slice(0, -1);
      const name = facility.name === '' ? ICAO.getIdent(facility.icao) : Utils.Translate(facility.name);

      let facilitySuffix = '';
      const facType = ICAO.getFacilityType(facility.icao);
      let infostring = '';
      // TODO RWY type
      // TODO Pilot waypoints
      switch (facType) {
        case FacilityType.Airport:
          facilitySuffix = 'AIRPORT';
          break;
        case FacilityType.NDB:
          facilitySuffix = 'NDB';
          break;
        case FacilityType.VOR: {
          const vorFac = facility as VorFacility;
          const vorType = vorFac.type as VorType;
          const vorClass = vorFac.vorClass as VorClass;
          if (vorClass === VorClass.ILS) {
            facilitySuffix = `ILS  ${vorFac.freqMHz.toFixed(2)}`;
            infostring = ICAO.getAssociatedAirportIdent(facility.icao);
          } else {
            if (vorType === VorType.VORDME || vorType === VorType.TACAN || vorType === VorType.VORTAC) {
              facilitySuffix = `V/D  ${vorFac.freqMHz.toFixed(2)}`;
            } else if (vorType === VorType.DME) {
              facilitySuffix = 'DME';
            } else {
              facilitySuffix = 'VOR';
            }
          }
          break;
        }
        case FacilityType.Intersection: {
          const apt = ICAO.getAssociatedAirportIdent(facility.icao);
          facilitySuffix = apt === '' ? 'EN RTE WPT' : apt;
          break;
        }
      }

      if (infostring === '') {
        infostring = `${latString} ${lonString}`;
      }

      render.push([`${name}  ${facilitySuffix}`, facility.region]);
      render.push([` ${infostring}[d-text]`]);
      render.push([''], ['']);
    }

    return render;
  }

  /** @inheritDoc */
  async handleSelectKey(event: FmcSelectKeysEvent): Promise<boolean | string> {
    const row = parseInt(event[4]) * 2;

    if (row % 4 !== 0 || row > 8) {
      return false;
    }

    const pageStartIndex = (this.router.currentSubpageIndex.get() - 1) * 2;

    const index = pageStartIndex + row / 4 - 1;

    this.selectedFacility.set(this.facilities.get()[index]);

    return true;
  }

}
