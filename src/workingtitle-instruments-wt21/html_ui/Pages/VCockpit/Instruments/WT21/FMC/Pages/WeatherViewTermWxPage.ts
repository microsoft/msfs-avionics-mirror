import { ICAO, Subject } from '@microsoft/msfs-sdk';
import { FmcCmuCommons, WxRequestStatusFormat } from '../Datalink/FmcCmuCommons';
import { FmcWeatherRequestSystem, WeatherRequestState } from '../Datalink/FmcWeatherRequestSystem';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { SimpleStringFormat } from '../Framework/FmcFormats';
import { FmcPage, FmcPageLifecyclePolicy } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * The Terminal Weather Overview page.
 */
export class WeatherViewTermWxPage extends FmcPage {
  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  private readonly dlLink = PageLinkField.createLink(this, '<RETURN', '/dl-weather');
  private readonly wxSystem = new FmcWeatherRequestSystem(this.fms.facLoader);
  private readonly wxIdents: Subject<string | null>[] = [
    Subject.create<string | null>(null), Subject.create<string | null>(null), Subject.create<string | null>(null),
    Subject.create<string | null>(null), Subject.create<string | null>(null), Subject.create<string | null>(null)];
  private readonly identFields: DisplayField<string | null>[] = [];
  private readonly statusFields: DisplayField<WeatherRequestState>[] = [];

  private readonly vhfProgField = FmcCmuCommons.createVhfProgField(this);
  private readonly clockField = FmcCmuCommons.createClockField(this, this.eventBus);

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
      style: '[green]'
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
  private createIdentField(index: number): DisplayField<string | null> {
    const field = new DisplayField<string | null>(this, {
      formatter: new SimpleStringFormat('----'),
      onSelected: async (): Promise<boolean | string> => {
        if (this.wxSystem.getRequests()[index].airport !== undefined) {
          this.router.navigateTo('/dl-terminalwx-single-view', { index: index });
        }
        return true;
      },
    });
    if (index % 2 === 0) {
      field.getOptions().prefix = '<';
    } else {
      field.getOptions().suffix = '>';
    }
    field.bind(this.wxIdents[index]);
    return field;
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['DL[blue]', 'VIEW TERMINAL WX  [blue]'],
        [this.statusFields[0], this.statusFields[1]],
        [this.identFields[0], this.identFields[1]],
        [this.statusFields[2], this.statusFields[3]],
        [this.identFields[2], this.identFields[3]],
        [this.statusFields[4], this.statusFields[5]],
        [this.identFields[4], this.identFields[5]],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', this.vhfProgField],
        [this.dlLink, '', this.clockField]
      ]
    ];
  }
}
