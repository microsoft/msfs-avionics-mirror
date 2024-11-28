/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus } from '@microsoft/msfs-sdk';

import { FmcMsgLine } from '../Framework/Components/FmcMsgLine';
import { FmcMessageEvents } from './FmcMessageReceiver';
import { FMS_MESSAGE_ID, Message, MESSAGE_LEVEL } from '@microsoft/msfs-wt21-shared';

/** The receiver for messages shown in the FMC */
export class FmcMsgInfo {
  public static instance: FmcMsgInfo;
  public onActiveMsgsUpdated = new Set<() => void>();
  private messages = new Map<FMS_MESSAGE_ID, Message>();
  public isOnMessagesPage = false;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(bus: EventBus, private readonly fmcMsgLine: FmcMsgLine) {
    FmcMsgInfo.instance = this;

    bus.getSubscriber<FmcMessageEvents>().on('fmc_new_message').handle(message => {
      this.messages.set(message.id, message);
      this.onActiveMsgsUpdated.forEach(x => x());
      this.updateMsgLine();
    });
    bus.getSubscriber<FmcMessageEvents>().on('fmc_clear_message').handle(id => {
      this.messages.delete(id);
      this.onActiveMsgsUpdated.forEach(x => x());
      this.updateMsgLine();
    });
  }

  /** Updates what message is displayed on the bottom left of the FMC. */
  public updateMsgLine(): void {
    this.fmcMsgLine.msg.set(this.getMsgText());
  }

  /**
   * Gets the active messages.
   * @returns Returns a readonly array of active messages
   */
  public getActiveMsgs(): readonly Message[] {
    return Array.from(this.messages.values());
  }

  /**
   * Gets the message text.
   * @returns Returns the message text.
   */
  private getMsgText(): string {
    if (!this.hasMsg()) {
      // TODO Use bus instead?
      SimVar.SetSimVarValue('L:WT21_DISPLAY_MSG', 'number', -1);
      return '';
    }

    if (this.isOnMessagesPage) {
      return 'MSG';
    }

    // find highest priority message
    let msgToShow: Message | undefined;
    const messages = this.getActiveMsgs();
    messages.filter(x => x.isNew).forEach(v => {
      if (!msgToShow) {
        msgToShow = v;
        return;
      }
      if ((v.level > msgToShow.level) || (v.level === msgToShow.level && v.weight > msgToShow.weight)) {
        msgToShow = v;
      }
    });

    const isYellow = messages.some(x => x.level === MESSAGE_LEVEL.Yellow);
    // TODO Use bus instead?
    SimVar.SetSimVarValue('L:WT21_DISPLAY_MSG', 'number', isYellow ? MESSAGE_LEVEL.Yellow : MESSAGE_LEVEL.White);

    if (msgToShow?.content) {
      return msgToShow.content + '[' + (msgToShow.level == MESSAGE_LEVEL.Yellow ? 'yellow' : 'white') + ']';
    } else {
      return 'MSG';
    }
  }


  /**
   * Checks if there are any messages.
   * @returns Returns true if there are any messages, false otherwise.
   */
  private hasMsg(): boolean {
    return this.messages.size > 0;
  }
}
