import { MESSAGE_LEVEL, MESSAGE_TARGET } from './MessageDefinition';
import { FMS_MESSAGE_ID } from './MessageDefinitions';

/** Message for the message system. */
export class Message {
  /** Default to true, becomes false once viewed on the messages FMC page. */
  public isNew = true;
  /** @returns Gets the unix timestamp for when the message was created */
  public readonly timestamp: number = new Date().valueOf();

  /**
   * Constructs a new instance of Message
   * @param content The message text
   * @param level The {@link MessageLevel} of this message
   * @param weight The message weight (priority)
   * @param target The message target display
   * @param id The message ID
   */
  constructor(
    /** The text content of this message. */
    public readonly content: string,
    /** The {@link MESSAGE_LEVEL} of severity of the message. */
    public readonly level: MESSAGE_LEVEL,
    /** The message weight (priority). */
    public readonly weight: number,
    /** The message target display. */
    public readonly target: MESSAGE_TARGET,
    /** @returns Gets the ID of the message definition */
    public readonly id: FMS_MESSAGE_ID,
  ) { }
}