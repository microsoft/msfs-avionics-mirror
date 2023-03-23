import { ClockEvents, Subject } from '@microsoft/msfs-sdk';
import { FmcCmuCommons, WxRequestStatusFormat } from '../Datalink/FmcCmuCommons';
import { FmcWeatherRequestSystem, WeatherRequestState } from '../Datalink/FmcWeatherRequestSystem';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { FmcPage, FmcPageLifecyclePolicy } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * The Datalink Weather Page
 */
export class WeatherPage extends FmcPage {
  public static override lifecyclePolicy = FmcPageLifecyclePolicy.Transient;
  private readonly dlLink = PageLinkField.createLink(this, '<RETURN', '/datalink-menu');
  private readonly termReqLink = PageLinkField.createLink(this, '<REQ', '/dl-terminalwx-req');
  private readonly termViewLink = PageLinkField.createLink(this, 'VIEW>', '/dl-terminalwx-view');
  private readonly vhfProgField = FmcCmuCommons.createVhfProgField(this);
  private readonly termWxLink = FmcCmuCommons.createTermWxLink(this);
  private readonly clockField = FmcCmuCommons.createClockField(this, this.eventBus);
  private readonly wxSystem = new FmcWeatherRequestSystem(this.fms.facLoader);
  private readonly wxRequestStatus = Subject.create(WeatherRequestState.NONE);
  private readonly wxRequestStatusField = new DisplayField(this, {
    formatter: new WxRequestStatusFormat(),
    style: '[green]'
  }).bind(this.wxRequestStatus);

  /** @inheritdoc */
  onInit(): void {
    // lets do a periodic check for this
    const simTimeConsumer = this.eventBus.getSubscriber<ClockEvents>()
      .on('simTime')
      .atFrequency(1, true)
      .handle(() => {
        const reqs = this.wxSystem.getRequests();
        const sentIndex = reqs.findIndex(r => r.dataState.get() === WeatherRequestState.SENT);
        if (sentIndex > -1) {
          this.wxRequestStatus.set(WeatherRequestState.SENT);
        } else {
          const rcvdIndex = reqs.findIndex(r => r.dataState.get() === WeatherRequestState.RCVD);
          this.wxRequestStatus.set(rcvdIndex > -1 ? WeatherRequestState.RCVD : WeatherRequestState.NONE);
        }
      });
    this.addBinding(simTimeConsumer);
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['DL    WEATHER[blue]', '', ''],
        ['', ''],
        ['<REQ[disabled]', 'VIEW>[disabled]', 'SIGMETS[disabled]'],
        [this.wxRequestStatusField, ''],
        [this.termReqLink, this.termViewLink, 'TERMINAL WX'],
        ['', ''],
        ['<REQ[disabled]', 'VIEW>[disabled]', 'WINDS ALOFT[disabled]'],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', ''],
        ['', '', this.vhfProgField],
        [this.dlLink, this.termWxLink, this.clockField]
      ]
    ];
  }
}
