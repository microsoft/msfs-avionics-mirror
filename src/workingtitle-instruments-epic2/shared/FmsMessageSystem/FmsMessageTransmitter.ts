import { EventBus } from '@microsoft/msfs-sdk';

import { FmsMessage } from './FmsMessage';
import { FmsMessageControlEvents } from './FmsMessageControlEvents';
import { DefinedFmsMessages } from './FmsMessageDefinitions';
import { FmsMessageKey } from './FmsMessageKeys';

/**
 * An interface for sending and clearing messages between the SDK and the plane specific messaging system.
 */
export class FmsMessageTransmitter {

  private publisher = this.bus.getPublisher<FmsMessageControlEvents>();

  /**
   * Create an instance of the FmsMessageTransmitter
   * @param bus The Event Bus.
   */
  constructor(private readonly bus: EventBus) { }

  /**
   * Send a message topic to the aircraft specific messaging system.
   * @param messageTopic The Message Topic to send.
   */
  public sendMessage(messageTopic: FmsMessageKey): void {
    const message = messageTopic !== FmsMessageKey.Generic ? this.getMessage(messageTopic) : undefined;

    if (message !== undefined) {
      this.publisher.pub(
        'post_message',
        { key: messageTopic, message },
        true,
      );
    }
  }

  /**
   * Clear a message topic in the aircraft specific messaging system.
   * @param messageTopic The Message Topic to clear, or undefined to clear top message.
   */
  public clearMessage(messageTopic?: FmsMessageKey): void {
    this.publisher.pub(
      'clear_message',
      messageTopic,
      true,
    );
  }

  /**
   * Gets the FmsMessage from a topic for the B787.
   * @param messageTopic The message topic.
   * @returns The Help Window Message
   */
  private getMessage(messageTopic: Exclude<FmsMessageKey, FmsMessageKey.Generic>): FmsMessage | undefined {
    return DefinedFmsMessages[messageTopic];
  }
}
