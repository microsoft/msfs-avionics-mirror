import { EventBus, Publisher } from '@microsoft/msfs-sdk';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IMessageReceiver } from './IMessageReceiver';
import { Message } from './Message';
import { MESSAGE_LEVEL, MESSAGE_TARGET } from './MessageDefinition';
import { FMS_MESSAGE_ID } from './MessageDefinitions';

// eslint-disable-next-line jsdoc/require-jsdoc
export interface FmcMessageEvents {
  // eslint-disable-next-line jsdoc/require-jsdoc
  fmc_new_message: Message;
  // eslint-disable-next-line jsdoc/require-jsdoc
  fmc_clear_message: FMS_MESSAGE_ID;
}

/** The receiver for messages shown in the FMC */
export class FmcMessageReceiver implements IMessageReceiver {
  public static instance: FmcMessageReceiver;
  private activeMsgs: Map<FMS_MESSAGE_ID, Message> = new Map<FMS_MESSAGE_ID, Message>();
  private publisher: Publisher<FmcMessageEvents>;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public constructor(bus: EventBus) {
    FmcMessageReceiver.instance = this;
    this.publisher = bus.getPublisher<FmcMessageEvents>();
  }

  /** @inheritdoc */
  public process(id: FMS_MESSAGE_ID, text: string, level: MESSAGE_LEVEL, weight: number, target: MESSAGE_TARGET): void {
    if (!this.activeMsgs.has(id)) {
      const newMessage = new Message(text, level, weight, target, id);
      this.activeMsgs.set(id, newMessage);
      this.publisher.pub('fmc_new_message', newMessage, true);
    }
  }

  /** @inheritdoc */
  public clear(id: FMS_MESSAGE_ID): void {
    this.activeMsgs.delete(id);
    this.publisher.pub('fmc_clear_message', id, true);
  }
}