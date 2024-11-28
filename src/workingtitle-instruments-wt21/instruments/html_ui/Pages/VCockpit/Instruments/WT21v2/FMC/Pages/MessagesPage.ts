import { FmcPagingEvents, FmcRenderTemplate } from '@microsoft/msfs-sdk';

import { Message, MESSAGE_LEVEL } from '@microsoft/msfs-wt21-shared';

import { FmcMsgInfo } from '../Data/FmcMsgInfo';
import { WT21FmcPage } from '../WT21FmcPage';

const messagesPerPage = 6;

/** Messages Page */
export class MessagesPage extends WT21FmcPage {
  private currentPageIndex = 0;

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    const messages = FmcMsgInfo.instance.getActiveMsgs();
    const pageCount = this.getPageCount();
    const maxPageIndex = pageCount - 1;
    if (this.currentPageIndex > maxPageIndex) {
      this.currentPageIndex = 0;
    }
    const startIndex = this.currentPageIndex * 6;
    const endIndex = startIndex + 6;
    const messagesOnThisPage = messages.slice(startIndex, endIndex).sort(compareMessageAge);

    const rows = [] as string[][];
    let hasAddedFirstNewMessage = false;
    let hasAddedFirstOldMessage = false;

    for (let i = 0; i < messagesOnThisPage.length; i++) {
      const message = messagesOnThisPage[i];
      if (message.isNew && !hasAddedFirstNewMessage) {
        rows.push(['', '', '-----NEW MESSAGES------[blue]']);
        hasAddedFirstNewMessage = true;
      } else if (!message.isNew && !hasAddedFirstOldMessage) {
        rows.push(['', '', '-----OLD MESSAGES------[blue]']);
        hasAddedFirstOldMessage = true;
      } else {
        rows.push(['', '']);
      }
      rows.push([(message?.content || '') + (message?.level === MESSAGE_LEVEL.Yellow ? '[yellow]' : ''), '']);
    }

    return [
      [
        ['', `${this.currentPageIndex + 1}/${pageCount}[blue] `, 'MESSAGES[blue]'],
        ...rows,
      ],
    ];
  }

  /** @inheritDoc */
  public onResume(): void {
    FmcMsgInfo.instance.onActiveMsgsUpdated.add(this.handleMsgsUpdated);
    FmcMsgInfo.instance.isOnMessagesPage = true;
    FmcMsgInfo.instance.updateMsgLine();
  }

  /** @inheritDoc */
  public onPause(): void {
    FmcMsgInfo.instance.isOnMessagesPage = false;
    if (FmcMsgInfo.instance.getActiveMsgs().some(x => x.isNew)) {
      FmcMsgInfo.instance.getActiveMsgs().forEach(x => x.isNew = false);
    }
    FmcMsgInfo.instance.updateMsgLine();
    FmcMsgInfo.instance.onActiveMsgsUpdated.delete(this.handleMsgsUpdated);
  }

  private readonly handleMsgsUpdated = (): void => {
    this.invalidate();
  };

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    if (event === 'pageRight') {
      this.handleNextButton();
      return true;
    } else if (event === 'pageLeft') {
      this.handlePrevButton();
      return true;
    }

    return false;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handleNextButton(): void {
    const maxPageIndex = this.getPageCount() - 1;
    if (this.currentPageIndex < maxPageIndex) {
      this.currentPageIndex++;
      this.invalidate();
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private handlePrevButton(): void {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.invalidate();
    }
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private getPageCount(): number {
    const messages = FmcMsgInfo.instance.getActiveMsgs();
    const messageCount = messages.length;
    const pageCount = Math.max(1, Math.ceil(messageCount / messagesPerPage));
    return pageCount;
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
function compareMessageAge(a: Message, b: Message): number {
  return a.isNew && !b.isNew
    ? -1
    : !a.isNew && b.isNew
      ? 1
      : 0;
}
