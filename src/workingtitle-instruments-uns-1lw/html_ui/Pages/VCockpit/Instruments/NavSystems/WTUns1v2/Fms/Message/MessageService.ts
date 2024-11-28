import { EventBus, Publisher, Subject } from '@microsoft/msfs-sdk';

import { Message } from './Message';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UnsMessageDefinitions, UnsMessageID } from './MessageDefinitions';

// eslint-disable-next-line jsdoc/require-jsdoc
export interface MessageEvents {
  // eslint-disable-next-line jsdoc/require-jsdoc
  new_message: Message;
  // eslint-disable-next-line jsdoc/require-jsdoc
  clear_message: UnsMessageID;
}

/** MessageService, copied from CJ4 mod, with modifications. */
export class MessageService {
  private activeMsgs: Map<UnsMessageID, () => boolean> = new Map<UnsMessageID, () => boolean>();
  public readonly messageAlert = Subject.create(false);
  private publisher: Publisher<MessageEvents>;

  /** @inheritdoc */
  constructor(private readonly bus: EventBus) {
    this.publisher = this.bus.getPublisher<MessageEvents>();
  }

  /**
   * Posts a message
   * @param messageId The message identifier
   * @param exitHandler An optional function that returns true when the msg should not be shown anymore.
   * If it is not passed in, you must clear the message manually by calling the clear function.
   */
  public post(messageId: UnsMessageID, exitHandler?: () => boolean): void {
    if (UnsMessageDefinitions.has(messageId) && !this.activeMsgs.has(messageId)) {
      const message = UnsMessageDefinitions.get(messageId)!;
      for (const line of message.lines) {
        const newMessage = new Message(line, message.color, message.exitOnView, messageId);
        this.publisher.pub('new_message', newMessage, true);
      }
      this.activeMsgs.set(messageId, exitHandler || (() => false));
      this.messageAlert.set(true);
    }
  }

  /**
   * Clears a message from all targets
   * @param messageId The message identifier
   */
  public clear(messageId: UnsMessageID): void {
    if (this.activeMsgs.has(messageId)) {
      this._clear(messageId);
    }
  }

  /** Update function which calls the exitHandler function and clears messages that have to go */
  public update(): void {
    for (const [messageId, exitHandler] of this.activeMsgs) {
      if (exitHandler() == true) {
        this._clear(messageId);
      }
    }
  }

  /** Tells receivers that a message has been cleared.
   * @param messageId The message id to clear. */
  private _clear(messageId: UnsMessageID): void {
    this.activeMsgs.delete(messageId);
    this.publisher.pub('clear_message', messageId);

    if (this.activeMsgs.size == 0 ) {
      this.messageAlert.set(false);
    }
  }
}
