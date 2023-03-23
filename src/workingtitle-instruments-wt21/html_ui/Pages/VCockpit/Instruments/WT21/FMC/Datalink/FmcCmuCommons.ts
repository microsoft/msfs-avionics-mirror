import { ClockEvents, ConsumerSubject, EventBus } from '@microsoft/msfs-sdk';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { Formatter, TimeFormatter } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcWeatherRequestSystem, WeatherRequestState } from './FmcWeatherRequestSystem';

/** A formatter for the VHF label. */
class VhfLabelFormat implements Formatter<boolean> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: boolean): string {
    return value ? 'VHF IN PROG' : '';
  }
}

/** A formatter for wx request status */
export class WxRequestStatusFormat implements Formatter<WeatherRequestState> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: WeatherRequestState): string {
    return value === WeatherRequestState.NONE ? '' : value === WeatherRequestState.SENT ? 'REQ' : 'RCVD';
  }
}

/**
 * A class containing common FMC elements for the CMU pages.
 */
export class FmcCmuCommons {

  /**
   * Creates the clockfield.
   * @param page The fmc page.
   * @param bus The event bus.
   * @returns A configured DisplayField.
   */
  public static createClockField(page: FmcPage, bus: EventBus): DisplayField<Date> {
    const simTimeConsumer = ConsumerSubject.create<number>(
      bus
        .getSubscriber<ClockEvents>()
        .on('simTime')
        .atFrequency(1 / 5, true),
      Date.now()
    ).map<Date>((value) => new Date(value));

    return new DisplayField(page, {
      formatter: TimeFormatter,
      style: '[s-text blue]',
      suffix: '  '
    }).bind(simTimeConsumer);
  }

  /**
   * Creates the VHF prog field.
   * @param page The fmc page.
   * @returns A configured DisplayField.
   */
  public static createVhfProgField(page: FmcPage): DisplayField<boolean> {
    return new DisplayField(page, {
      formatter: new VhfLabelFormat(),
      style: '[s-text green]'
    }).bind(FmcWeatherRequestSystem.vhfIsSending);
  }

  /**
   * Creates the TERM WX link when a message was received..
   * @param page The fmc page.
   * @returns A configured PageLinkField.
   */
  public static createTermWxLink(page: FmcPage): PageLinkField {
    const pageLink = PageLinkField.createLink(page, '', '/dl-terminalwx-view');
    const unreadSub = FmcWeatherRequestSystem.hasUnread.sub((v) => {
      pageLink.getOptions().disabled = !v;
      pageLink.takeValue(v ? 'TERM WX>' : '');
      page.invalidate();
    }, true);
    page.addBinding(unreadSub);
    return pageLink;
  }
}