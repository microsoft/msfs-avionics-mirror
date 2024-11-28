import { FmsMessage } from './FmsMessage';
import { FmsMessageKey } from './FmsMessageKeys';

/** `post_message` event packet. */
export interface FmsMessageWidnowPostMessagePacket {
  /** The Boeing FMC error key */
  key: FmsMessageKey,

  /** The message object */
  message: FmsMessage,
}

/** Events for controlling the help window. */
export interface FmsMessageControlEvents {
  /** Posts a message to the help window. Discarded if key is not None and message with same key already present */
  post_message: FmsMessageWidnowPostMessagePacket,

  /** Clears any message with the provided key in the help window */
  clear_message: FmsMessageKey | undefined,
}

/** Fms message status events. */
export interface FmsMessageEvents {
  /** The current count of fms messages. */
  fms_message_count: number,
}
