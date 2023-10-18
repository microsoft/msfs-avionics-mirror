import { Subject } from '@microsoft/msfs-sdk';
import { FMS_MESSAGE_ID } from '../../Shared/MessageSystem/MessageDefinitions';
import { FmcFplnRequestSystem } from '../Datalink/FmcFplnRequestSystem';
import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { Formatter, RawFormatter } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/** A formatter for wx request status */
class FplnRequestStatusFormat implements Formatter<boolean> {
  nullValueString = '';

  /** @inheritDoc */
  format(value: boolean): string {
    return value === false ? '' : 'REQ PENDING';
  }
}

/**
 * Route Menu page
 */
export class RouteMenuPage extends FmcPage {
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
    style: '[green]'
  }).bind(this.isRequestPending);
  private readonly fplnLink = PageLinkField.createLink(this, 'FPLN>', '/route');

  /** @inheritDoc */
  protected onInit(): void {
    // noop
    this.fplnRecallField.takeValue('<FPLN RECALL');
  }

  /**
   * Called when the FPLN RECALL field is pressed.
   */
  private async fplnRecallPressed(): Promise<boolean> {
    if (this.isRequestPending.get() === false) {
      this.fplnRecallField.getOptions().disabled = true;
      this.isRequestPending.set(true);
      const success = await this.fmcFplnRequestSystem.requestFlightplan();
      this.fplnRecallField.getOptions().disabled = false;
      this.isRequestPending.set(false);
      if (success) {
        this.fms.messageService.post(FMS_MESSAGE_ID.DLFPLNLOADED);
        this.router.navigateTo('/route');
      } else {
        this.fms.messageService.post(FMS_MESSAGE_ID.DLFPLNFAIL);
        this.fms.cancelMod();
      }
      setTimeout(() => {
        this.fms.messageService.clear(FMS_MESSAGE_ID.DLFPLNLOADED);
        this.fms.messageService.clear(FMS_MESSAGE_ID.DLFPLNFAIL);
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
        [this.indexLink, this.fplnLink]
      ]
    ];
  }
}


