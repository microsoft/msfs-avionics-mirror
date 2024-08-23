import { EventBus, LNavEvents } from '@microsoft/msfs-sdk';

import { FMS_MESSAGE_ID } from './MessageDefinitions';
import { MessageService } from './MessageService';

/**
 * Control events for {@link MessageManager}
 */
export interface MessageManagerControlEvents {
  /** Posts a message to the message service */
  post_message: FMS_MESSAGE_ID,

  /** Clears a message on the message service */
  clear_message: FMS_MESSAGE_ID,
}

/**
 * A place to handle posting and clearing of messages using the message service,
 * if there isn't a better place to do it.
 */
export class MessageManager {
  /** MessageManager constructor.
   * @param eventBus The event bus.
   * @param messageService The message service.
   */
  public constructor(private readonly eventBus: EventBus, private readonly messageService: MessageService) {
    this.eventBus.getSubscriber<MessageManagerControlEvents>().on('post_message').handle((key) => {
      this.messageService.post(key);
    });

    this.eventBus.getSubscriber<MessageManagerControlEvents>().on('clear_message').handle((key) => {
      this.messageService.clear(key);
    });

    this.eventBus.getSubscriber<LNavEvents>().on('lnav_is_suspended').whenChanged().handle(isSuspended => {
      // TODO If reasonable to do, this should only show when on the FROM portion of the current TO waypoint
      // TODO and it does not seem to show when at a DISCO, unless maybe TERM is higher priority
      if (isSuspended) {
        this.messageService.post(FMS_MESSAGE_ID.SEQ_INHB);
      } else {
        this.messageService.clear(FMS_MESSAGE_ID.SEQ_INHB);
      }
    });
  }
}
