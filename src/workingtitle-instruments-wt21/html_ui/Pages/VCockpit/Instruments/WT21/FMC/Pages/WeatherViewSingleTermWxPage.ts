import { ICAO } from '@microsoft/msfs-sdk';
import { FmcCmuCommons } from '../Datalink/FmcCmuCommons';
import { FmcWeatherRequestSystem } from '../Datalink/FmcWeatherRequestSystem';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { RawFormatter } from '../Framework/FmcFormats';
import { FmcPage, FmcPageLifecyclePolicy } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';
/**
 * The Terminal Weather View Page.
 */
export class WeatherViewSingleTermWxPage extends FmcPage {
  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;

  private readonly dlLink = PageLinkField.createLink(this, '<RETURN', '/dl-terminalwx-view');
  private readonly wxSystem = new FmcWeatherRequestSystem(this.fms.facLoader);

  private readonly vhfProgField = FmcCmuCommons.createVhfProgField(this);
  private readonly clockField = FmcCmuCommons.createClockField(this, this.eventBus);

  private readonly titleField = new DisplayField(this, {
    formatter: RawFormatter,
    style: '[blue]'
  });

  private readonly lineArr: DisplayField<string>[] = [];

  /** @inheritDoc */
  onInit(): void {
    // this is nasty but whatever
    for (let i = 0; i < 9; i++) {
      const field = new DisplayField<string>(this, {
        formatter: RawFormatter,
        style: '[d-text]'
      });
      this.lineArr.push(field);
    }

    const idx = this.router.params['index'] as number;
    const wxRequest = this.wxSystem.getRequests()[idx];
    if (wxRequest.airport !== undefined) {
      this.titleField.takeValue(`${ICAO.getIdent(wxRequest.airport?.icao)} WX`);
      FmcWeatherRequestSystem.setViewed(idx);
      const metarStr = wxRequest.metar?.metarString;
      if (metarStr !== undefined) {
        this.splitMetarIntoLines(metarStr);
      } else {
        this.lineArr[1].takeValue('NOT AVAILABLE');
      }
    }
  }

  /**
   * Cuts up a METAR string and inserts it into the lines.
   * @param metarStr The METAR string to process.
   */
  private splitMetarIntoLines(metarStr: string): void {
    const lineLength = 24;

    // Split the text into an array of words
    const words = metarStr.split(' ');

    let currentLine = '';
    let i = 0;

    for (const word of words) {
      if (currentLine.length + word.length <= lineLength) {
        currentLine += `${word} `;
      } else {
        this.lineArr[i].takeValue(currentLine);
        currentLine = `${word} `;
        i++;
        if (i === 9) {
          break;
        }
      }
    }

    if (currentLine !== '') {
      this.lineArr[i].takeValue(currentLine);
    }
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['DL[blue]', '', this.titleField],
        ['METAR', ''],
        [this.lineArr[0]],
        [this.lineArr[1]],
        [this.lineArr[2]],
        [this.lineArr[3]],
        [this.lineArr[4]],
        [this.lineArr[5]],
        [this.lineArr[6]],
        [this.lineArr[7]],
        [this.lineArr[8]],
        ['', '', this.vhfProgField],
        [this.dlLink, '', this.clockField]
      ]
    ];
  }
}
