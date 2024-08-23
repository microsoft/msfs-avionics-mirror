import {
  DisplayField, FacilitySearchType, FacilityType, FmcPageLifecyclePolicy, FmcRenderTemplate, Formatter, ICAO, PageLinkField, Subject, TextInputField
} from '@microsoft/msfs-sdk';

import { FmcCmuCommons, WxRequestStatusFormat } from '../Datalink/FmcCmuCommons';
import { FmcWeatherRequestSystem, WeatherRequestState } from '../Datalink/FmcWeatherRequestSystem';
import { StringInputFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/** A formatter for the SEND label. */
class SendLabelFormat implements Formatter<boolean> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: boolean): string {
    return value ? 'CANCEL' : 'SEND';
  }
}

/**
 * The Terminal Weather Request page.
 */
export class WeatherRequestTermWxPage extends WT21FmcPage {
  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  private readonly dlLink = PageLinkField.createLink(this, '<RETURN', '/dl-weather');
  private readonly wxSystem = new FmcWeatherRequestSystem(this.fms.facLoader);
  private readonly wxIdents: Subject<string | null>[] = [
    Subject.create<string | null>(null), Subject.create<string | null>(null), Subject.create<string | null>(null),
    Subject.create<string | null>(null), Subject.create<string | null>(null), Subject.create<string | null>(null)];
  private readonly identFields: TextInputField<string | null>[] = [];
  private readonly statusFields: DisplayField<WeatherRequestState>[] = [];

  private readonly sendField = new DisplayField<boolean>(this, {
    formatter: new SendLabelFormat,
    onSelected: (): Promise<boolean> => this.sendWxRequests(),
    style: '[s-text blue]',
    suffix: ' ',
  }).bind(this.wxSystem.getIsRequestActive());

  private readonly vhfProgField = FmcCmuCommons.createVhfProgField(this);
  private readonly clockField = FmcCmuCommons.createClockField(this, this.bus);
  private readonly termWxLink = FmcCmuCommons.createTermWxLink(this);


  /** @inheritDoc */
  onInit(): void {
    const wxRequests = this.wxSystem.getRequests();
    for (let i = 0; i < 6; i++) {
      const req = wxRequests[i];
      if (req.airport) {
        this.wxIdents[i].set(ICAO.getIdent(req.airport.icao));
      }
      this.identFields.push(this.createIdentField(i));
      this.statusFields.push(this.createStatusField(i));
      this.statusFields[i].bind(req.dataState);
    }
  }

  /**
   * Creates status display fields for an airport's weather request.
   * @param index The wx request index for this item.
   * @returns A configured status display field.
   */
  private createStatusField(index: number): DisplayField<WeatherRequestState> {
    const field = new DisplayField(this, {
      formatter: new WxRequestStatusFormat(),
      style: '[green]',
    });
    if (index % 2 === 0) {
      field.getOptions().prefix = ' ';
    } else {
      field.getOptions().suffix = ' ';
    }
    return field;
  }

  /**
   * Creates input fields for an ident for weather request.
   * @param index The wx request index for this item.
   * @returns A configured text input field.
   */
  private createIdentField(index: number): TextInputField<string | null> {
    const field = new TextInputField<string | null>(this, {
      formatter: new StringInputFormat({
        maxLength: 4,
        nullValueString: '----',
      }),
      onSelected: async (value: string): Promise<boolean | string> => {
        if (!value) { return ''; }

        const airportIcao = (await this.fms.facLoader.searchByIdent(FacilitySearchType.Airport, value, 1))[0];
        if (airportIcao && (ICAO.getIdent(airportIcao) === value)) {
          const airportFac = await this.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);
          this.wxIdents[index].set(ICAO.getIdent(airportFac.icao));
          this.wxSystem.addRequest(airportFac, index);
          this.identFields[index].getOptions().style = '[d-text]';
          this.sendField.getOptions().style = '[d-text blue]';
          return '';
        }

        return Promise.reject('FACILITY NOT FOUND');
      },
      deleteAllowed: false,
    });
    if (index % 2 === 0) {
      field.getOptions().prefix = ' ';
    } else {
      field.getOptions().suffix = ' ';
    }
    field.bind(this.wxIdents[index]);
    return field;
  }

  /**
   * Sends weather requests
   * @returns Returns whether the operation was successful.
   */
  private async sendWxRequests(): Promise<boolean> {
    if (!this.wxSystem.getIsRequestActive().get()) {
      for (let i = 0; i < this.identFields.length; i++) {
        const field = this.identFields[i];
        if (this.wxIdents[i].get() !== null) {
          field.getOptions().style = '[s-text]';
          this.wxSystem.requestMetar();
        }
      }
      this.sendField.getOptions().style = '[s-text blue]';
      this.screen.navigateTo('/dl-weather');
    } else {
      FmcWeatherRequestSystem.cancelRequest();
    }
    return true;
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['DL[blue]', 'REQ TERMINAL WX   [blue]'],
        [this.statusFields[0], this.statusFields[1]],
        [this.identFields[0], this.identFields[1]],
        [this.statusFields[2], this.statusFields[3]],
        [this.identFields[2], this.identFields[3]],
        [this.statusFields[4], this.statusFields[5]],
        [this.identFields[4], this.identFields[5]],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', this.sendField],
        ['', '', this.vhfProgField],
        [this.dlLink, this.termWxLink, this.clockField],
      ],
    ];
  }
}
