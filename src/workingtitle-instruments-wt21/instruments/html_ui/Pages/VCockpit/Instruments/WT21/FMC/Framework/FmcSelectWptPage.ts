import {
  DmsFormatter, Facility, FacilityType, FmcPageLifecyclePolicy, FmcRenderTemplate, FmcRenderTemplateRow, ICAO, LineSelectKeyEvent, Subject, VorClass,
  VorFacility, VorType
} from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';

/**
 * SELECT WPT page
 */
export class FmcSelectWptPopup extends WT21FmcPage {

  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  facilities = Subject.create<Facility[]>([]);

  facilityType = 'WPT';

  selectedFacility = Subject.create<Facility | null>(null);

  /** @inheritDoc */
  onInit(): void {
    this.addBinding(this.facilities.sub(() => this.invalidate()));
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
  async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    const row = event.row;

    if (row % 4 !== 0 || row > 8) {
      return false;
    }

    const pageStartIndex = (this.screen.currentSubpageIndex.get() - 1) * 2;

    const index = pageStartIndex + row / 4 - 1;

    this.selectedFacility.set(this.facilities.get()[index]);

    return true;
  }

}
