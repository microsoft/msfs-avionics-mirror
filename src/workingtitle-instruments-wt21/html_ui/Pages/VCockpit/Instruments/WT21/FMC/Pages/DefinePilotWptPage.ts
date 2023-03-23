import { ICAO, LatLongInterface, MappedSubject, Subject, UserFacilityUtils } from '@microsoft/msfs-sdk';
import { TextInputField } from '../Framework/Components/TextInputField';
import { DisplayField } from '../Framework/Components/DisplayField';
import {
  LatLongTextFormat, PlaceBearingDistanceInputFormat,
  PlaceBearingPlaceBearingInputFormat, StringInputFormat,
} from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { WT21PilotWaypointUtils, PlaceBearingDistanceInput, PlaceBearingPlaceBearingInput } from '../Navigation/WT21PilotWaypointUtils';

/**
 * Fix Info page
 */
export class DefinePilotWptPage extends FmcPage {
  private readonly identSub = Subject.create<string | null>(null);

  private readonly latLongSub = Subject.create<LatLongInterface | null>(null);

  private readonly pbdSub = Subject.create<PlaceBearingDistanceInput | null>(null);

  private readonly pbpbSub = Subject.create<PlaceBearingPlaceBearingInput | null>(null);

  private readonly IdentField = new TextInputField<string, string>(this, {
    formatter: new StringInputFormat({ nullValueString: '□□□□□', maxLength: 5 })
  }).bind(this.identSub);

  private readonly CoordinatesField = new TextInputField<LatLongInterface, LatLongInterface>(this, {
    formatter: new LatLongTextFormat({ spacesBetweenLatLong: 2, acceptShortFormInput: false }),
    onModified: async (value) => {
      this.latLongSub.set(value);
      this.pbdSub.set(null);
      this.pbpbSub.set(null);

      this.clearScratchpad();

      return true;
    }
  }).bind(this.latLongSub);

  private PlaceBearingDistanceField = new TextInputField<PlaceBearingDistanceInput, PlaceBearingDistanceInput>(this, {
    formatter: new PlaceBearingDistanceInputFormat(),
    onModified: async (value: PlaceBearingDistanceInput) => {
      const facility = await this.pageManager.selectWptFromIdent(value.placeIdent, this.fms.ppos);

      if (facility) {
        const pos = WT21PilotWaypointUtils.createPlaceBearingDistance(facility, value.bearing, false, value.distance);

        this.latLongSub.set({ lat: pos.lat, long: pos.lon });
      } else {
        return Promise.reject('NOT IN DATA BASE');
      }

      this.pbdSub.set(value);
      this.pbpbSub.set(null);

      this.clearScratchpad();

      return true;
    },
  }).bind(this.pbdSub);

  private PlaceBearingPlaceBearingInputField = new TextInputField<PlaceBearingPlaceBearingInput, PlaceBearingPlaceBearingInput>(this, {
    formatter: new PlaceBearingPlaceBearingInputFormat(),
    onModified: async (value: PlaceBearingPlaceBearingInput) => {
      const facilityA = await this.pageManager.selectWptFromIdent(value.placeAIdent, this.fms.ppos);
      const facilityB = await this.pageManager.selectWptFromIdent(value.placeBIdent, this.fms.ppos);

      if (facilityA && facilityB) {
        const pos = WT21PilotWaypointUtils.createPlaceBearingPlaceBearing(
          facilityA, value.bearingA, facilityB, value.bearingB,
        );

        if (pos) {
          this.latLongSub.set({ lat: pos.lat, long: pos.lon });
        } else {
          return Promise.reject('NO INTERSECTION');
        }
      } else {
        return Promise.reject('NOT IN DATA BASE');
      }

      this.pbdSub.set(null);
      this.pbpbSub.set(value);
      this.clearScratchpad();

      return true;
    },
  }).bind(this.pbpbSub);

  private readonly StoreWptField = new DisplayField(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: readonly [string | null, LatLongInterface | null]): string {

        if (value[0] === null || value[1] === null) {
          return '';
        }

        return '<STORE WPT';
      }
    },
    onSelected: async () => {
      const ident = this.identSub.get();
      const lla = this.latLongSub.get();

      if (ident !== null && lla !== null) {
        const icao = `U      ${ident.substring(0, 5)}`;

        const userFacilities = this.fms.getUserFacilities();

        if (userFacilities.length >= 100) {
          return Promise.reject('PILOT WPT LIST FULL');
        }

        const existing = userFacilities.some((it) => ICAO.getIdent(it.icao) === ICAO.getIdent(icao));

        if (existing) {
          return Promise.reject('');
        } else {
          this.fms.addUserFacility(UserFacilityUtils.createFromLatLon(icao, lla.lat, lla.long));

          this.identSub.set(null);
          this.latLongSub.set(null);
          this.pbdSub.set(null);
          this.pbpbSub.set(null);

          this.setActiveRoute('/pilot-wpt-list');

          return true;
        }
      }

      return false;
    },
  }).bind(MappedSubject.create(this.identSub, this.latLongSub));

  private readonly ReturnLink = PageLinkField.createLink(this, 'RETURN>', '/database');

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'DEFINE PILOT WPT[blue]'],
        [' IDENT[blue]', ''],
        [this.IdentField, ''],
        [''],
        [''],
        ['LATITUDE[blue]   LONGITUDE[blue]'],
        [this.CoordinatesField],
        ['PLACE BRG  /DIST[blue]'],
        [this.PlaceBearingDistanceField],
        ['PLACE BRG  /PLACE BRG[blue]'],
        [this.PlaceBearingPlaceBearingInputField],
        ['', '', '------------------------[blue]'],
        [this.StoreWptField, this.ReturnLink],
      ]
    ];
  }
}
