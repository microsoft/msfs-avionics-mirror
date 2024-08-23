import { DisplayField, FmcRenderTemplate, Formatter, PageLinkField, RawFormatter, Subject } from '@microsoft/msfs-sdk';

import { FMS_MESSAGE_ID, MessageManagerControlEvents } from '@microsoft/msfs-wt21-shared';

import { FmcFplnRequestSystem } from '../Datalink/FmcFplnRequestSystem';
import { WT21FmcPage } from '../WT21FmcPage';

/** A formatter for wx request status */
class FplnRequestStatusFormat implements Formatter<boolean> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: boolean): string {
    return !value ? '' : 'REQ PENDING';
  }
}

/**
 * Route Menu page
 */
export class RouteMenuPage extends WT21FmcPage {
  public readonly isRequestPending = Subject.create(false);

  private readonly indexLink = PageLinkField.createLink(this, '<INDEX', '/index');
  private readonly pltRteListLink = PageLinkField.createLink(this, '<PILOT ROUTE LIST', '/index', true);
  private readonly diskRteListLink = PageLinkField.createLink(this, '<DISK ROUTE LIST', '/index', true);
  private readonly fplnRecallField = new DisplayField(this, {
    formatter: RawFormatter,
    onSelected: (): Promise<boolean> => this.fplnRecallPressed(),

  });
  private readonly fplnWindLink = PageLinkField.createLink(this, '<FPLN WIND', '/index', true);
  private readonly fmcFplnRequestSystem = new FmcFplnRequestSystem(this.fms);
  private readonly fplnRequestStatusField = new DisplayField(this, {
    formatter: new FplnRequestStatusFormat(),
    style: '[green]',
  }).bind(this.isRequestPending);
  private readonly fplnLink = PageLinkField.createLink(this, 'FPLN>', '/route');

  /** @inheritDoc */
  protected onInit(): void {
    // noop
    this.fplnRecallField.takeValue('<FPLN RECALL');
  }

  /**
   * Called when the FPLN RECALL field is pressed.
   * @returns Returns whether the operation was successful.
   */
  private async fplnRecallPressed(): Promise<boolean> {
    if (this.isRequestPending.get() === false) {
      this.fplnRecallField.getOptions().disabled = true;
      this.isRequestPending.set(true);
      const success = await this.fmcFplnRequestSystem.requestFlightplan();
      this.fplnRecallField.getOptions().disabled = false;
      this.isRequestPending.set(false);
      if (success) {
        this.bus.getPublisher<MessageManagerControlEvents>().pub('post_message', FMS_MESSAGE_ID.DLFPLNLOADED, true);
        this.screen.navigateTo('/route');
      } else {
        this.bus.getPublisher<MessageManagerControlEvents>().pub('post_message', FMS_MESSAGE_ID.DLFPLNFAIL, true);
        this.fms.cancelMod();
      }
      setTimeout(() => {
        this.bus.getPublisher<MessageManagerControlEvents>().pub('clear_message', FMS_MESSAGE_ID.DLFPLNLOADED, true);
        this.bus.getPublisher<MessageManagerControlEvents>().pub('clear_message', FMS_MESSAGE_ID.DLFPLNFAIL, true);
      }, 5000);
    }
    return true;
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'ROUTE MENU[blue]'],
        ['', ''],
        [this.pltRteListLink, ''],
        ['', ''],
        [this.diskRteListLink, ''],
        [this.fplnRequestStatusField, ''],
        [this.fplnRecallField, ''],
        ['', ''],
        [this.fplnWindLink, ''],
        ['', ''],
        ['', ''],
        ['', ''],
        [this.indexLink, this.fplnLink],
      ],
    ];
  }
}


