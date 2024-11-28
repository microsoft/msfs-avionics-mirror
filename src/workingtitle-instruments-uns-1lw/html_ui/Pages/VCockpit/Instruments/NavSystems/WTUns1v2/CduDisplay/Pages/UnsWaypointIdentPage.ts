import {
  DisplayField, DmsFormatter, Facility, FacilityType, FacilityUtils, FmcPagingEvents, FmcRenderTemplate, ICAO, Subject, Subscribable, UnitType, VorClass, VorType,
} from '@microsoft/msfs-sdk';

import { UnsFmcDialogPage } from '../UnsFmcPage';
import { UnsFmsUtils } from '../../Fms';
import { UnsChars } from '../UnsCduDisplay';

const FACILITY_TEXT: Record<FacilityType, string> = {
  [FacilityType.Airport]: 'ARPT',
  [FacilityType.Intersection]: 'ENR',
  [FacilityType.VOR]: '',
  [FacilityType.NDB]: 'NDB',
  [FacilityType.USR]: 'PLT',
  [FacilityType.RWY]: '',
  [FacilityType.VIS]: '',
};

const VOR_TYPE_TEXT: Record<VorType, string> = {
  [VorType.VOR]: 'VOR',
  [VorType.DME]: 'DME',
  [VorType.VORDME]: 'VOR-DME',
  [VorType.TACAN]: 'TACAN',
  [VorType.VORTAC]: 'VORTAC',
  [VorType.ILS]: 'ILS',
  [VorType.VOT]: 'VOT',
  [VorType.Unknown]: 'UNKNOWN',
};

const VOR_CLASS_TEXT: Record<VorClass, string> = {
  [VorClass.Unknown]: '',
  [VorClass.Terminal]: 'TERM',
  [VorClass.LowAlt]: 'LOW',
  [VorClass.HighAlt]: 'HIGH',
  [VorClass.ILS]: 'ILS',
  [VorClass.VOT]: 'VOT',
};

/** A UnsWaypointIdentPage store */
class UnsWaypointIdentPageStore {
  private readonly dmsFormatter = new DmsFormatter();

  private facilities: Facility[] = [];
  private readonly _numberOfFacilities = Subject.create(0);
  public readonly numberOfFacilities: Subscribable<number> = this._numberOfFacilities;
  private readonly _selectedFacilityIndex = Subject.create(0);
  public readonly selectedFacilityIndex: Subscribable<number> = this._selectedFacilityIndex;

  private readonly _ident = Subject.create('');
  public readonly ident: Subscribable<string> = this._ident;
  private readonly _name = Subject.create('');
  public readonly name: Subscribable<string> = this._name;
  private readonly _latText = Subject.create('');
  public readonly latText: Subscribable<string> = this._latText;
  private readonly _lonText = Subject.create('');
  public readonly lonText: Subscribable<string> = this._lonText;

  private readonly _vorText = Subject.create('');
  public readonly vorData: Subscribable<string> = this._vorText;
  private readonly _freqText = Subject.create('');
  public readonly freqText: Subscribable<string> = this._freqText;
  private readonly _elevText = Subject.create('');
  public readonly elevText: Subscribable<string> = this._elevText;
  private readonly _magVarText = Subject.create('');
  public readonly magVarText: Subscribable<string> = this._magVarText;

  /**
   * Set the list of facilities, and optionally the selected facility.
   * @param facilities The list of facilities.
   * @param selectedIndex The index of the facility to initialize as the selected facility, defaults to 0.
   * */
  public setFacilities(facilities: Facility[], selectedIndex = 0): void {
    if (!facilities.length) {
      return;
    }

    this.facilities = facilities;
    this._numberOfFacilities.set(facilities.length);
    this.setIndex(selectedIndex);
  }

  /**
   * Set the index of the selected facility.
   * @param selectedIndex The index of the facility to initialize as the selected facility, defaults to 0.
   * */
  public setIndex(selectedIndex: number): void {
    this._selectedFacilityIndex.set(selectedIndex);
    this.update();
  }

  /**
   * Gets the currently selected facility.
   * @returns A facility.
   * */
  public get selectedFacility(): Facility {
    return this.facilities[this.selectedFacilityIndex.get()];
  }

  /** Update the facility store. */
  private update(): void {
    const facility: Facility = this.selectedFacility;

    const name: string = (facility.name.startsWith('TT') ? Utils.Translate(facility.name) : facility.name).toUpperCase();
    this._name.set(name);
    this._ident.set(ICAO.getIdent(facility.icao));
    this._latText.set(`NAV  ${UnsFmsUtils.coordinateFormatter(facility.lat, 'lat', this.dmsFormatter)}`);
    this._lonText.set(FACILITY_TEXT[ICAO.getFacilityType(facility.icao)].padEnd(5, ' ') +
      UnsFmsUtils.coordinateFormatter(facility.lon, 'lon', this.dmsFormatter));

    this._vorText.set('');
    this._freqText.set('');
    this._elevText.set('');
    this._magVarText.set('');

    let magVarNum: number = FacilityUtils.getMagVar(facility);
    if (magVarNum <= -180) {
      magVarNum += 360;
    }
    const magVarStr: string = Math.abs(magVarNum).toFixed(1).padStart(4, '0');

    if (FacilityUtils.isFacilityType(facility, FacilityType.Airport)) {
      const elevation: string = UnitType.FOOT.convertFrom(facility.altitude, UnitType.METER).toFixed();
      this._elevText.set(`ELEV[s-text]${elevation.padStart(11, ' ')}[d-text]`);
      this._magVarText.set(`MAG VAR[s-text] ${magVarNum < 0 ? 'W' : 'E'} ${magVarStr}[d-text]`);
    } else if (FacilityUtils.isFacilityType(facility, FacilityType.Intersection)) {
      // NONE
    } else if (FacilityUtils.isFacilityType(facility, FacilityType.VOR)) {
      this._vorText.set(`${VOR_TYPE_TEXT[facility.type].padEnd(8, ' ')}${VOR_CLASS_TEXT[facility.vorClass].padStart(7, ' ')}`);
      this._freqText.set(`FREQ[s-text]     ${facility.freqMHz.toFixed(2)}`);
      // ELEV
      this._magVarText.set(`DECL[s-text]    ${magVarNum < 0 ? 'W' : 'E'} ${magVarStr}[d-text]`);
    } else if (FacilityUtils.isFacilityType(facility, FacilityType.NDB)) {
      this._freqText.set(`FREQ[s-text]     ${facility.freqMHz.toFixed(1)}`);
      // ELEV
      this._magVarText.set(`MAG VAR[s-text] ${magVarNum < 0 ? 'W' : 'E'} ${magVarStr}[d-text]`);
    } else if (FacilityUtils.isFacilityType(facility, FacilityType.USR)) {
      // NONE
    } else if (FacilityUtils.isFacilityType(facility, FacilityType.RWY)) {
      // NONE
    }
  }
}

/** A UNS Waypoint Identification page */
export class UnsWaypointIdentPage extends UnsFmcDialogPage<string, Facility> {
  private readonly store = new UnsWaypointIdentPageStore();

  /** @inheritDoc */
  protected onInit(): void {
    this.displayedSubPagePadding = 3;

    this.addBinding(
      this.store.ident.sub(ident => this.pageTitle = ` ${ident.padEnd(5, ' ')}[white d-text]`)
    );
  }

  /** @inheritDoc */
  protected onResume(): void {
    const facilities = this.params.get('facilities') as Facility[] | undefined;
    facilities && this.store.setFacilities(facilities);
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    const index: number = this.store.selectedFacilityIndex.get();
    const numberOfFacilities: number = this.store.numberOfFacilities.get();
    const increment: number = event === 'pageLeft' ? -1 : 1;

    this.store.setIndex((index + numberOfFacilities + increment) % numberOfFacilities);

    return super.onHandleScrolling(event);
  }

  /** @inheritDoc */
  protected async onHandleEnterPressed(): Promise<boolean> {
    if (this.resolve) {
      this.resolve({
        wasCancelled: false,
        payload: this.store.selectedFacility,
      });
    }
    return true;
  }

  private readonly FacilityNameField = new DisplayField<string>(this, {
    formatter: name => name,
  }).bind(this.store.name);

  private readonly LatitudeField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
  }).bind(this.store.latText);

  private readonly LongitudeField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
    style: '[d-text]',
  }).bind(this.store.lonText);

  private readonly VorField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
    style: '[d-text]',
  }).bind(this.store.vorData);

  private readonly FrequencyField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
  }).bind(this.store.freqText);

  private readonly ElevationField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
  }).bind(this.store.elevText);

  private readonly MagVarField = new DisplayField<string>(this, {
    prefix: ' ',
    formatter: text => text,
  }).bind(this.store.magVarText);

  private readonly AcceptPrompt = new DisplayField(this, {
    formatter: isDialog => isDialog ? `${UnsChars.ArrowLeft}ACCEPT[r-white]` : '',
    onSelected: async () => {
      if (this.resolve) {
        this.resolve({
          wasCancelled: false,
          payload: this.store.selectedFacility,
        });
      }
      return true;
    },
  }).bind(this.isActingAsDialog);

  private readonly ReturnPrompt = new DisplayField(this, {
    formatter: () => `RETURN${UnsChars.ArrowRight}`,
    onSelected: async () => {
      this.screen.navigateBackShallow();
      return true;
    },
  });

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['', '', this.FacilityNameField],
        [this.LatitudeField, ''],
        [this.LongitudeField, ''],
        [''],
        [this.VorField],
        [this.FrequencyField],
        [this.ElevationField],
        [this.MagVarField],
        [''],
        [this.AcceptPrompt, this.ReturnPrompt],
      ],
    ];
  }
}
