import { UnsMessageColor, UnsMessageID } from './MessageDefinitions';

/** Message for the message system. */
export class Message {
  /** Default to true, becomes false once viewed on the messages FMC page. */
  public isNew = true;
  /** @returns Gets the unix timestamp for when the message was created */
  public readonly timestamp: number = new Date().valueOf();

  /**
   * Constructs a new instance of Message
   * @param content The message text
   * @param color The {@link MessageColor} of this message
   * @param closeOnView Whether to close the message after it is first viewed
   * @param id The message ID
   */
  constructor(
    /** The text content of this message. */
    public readonly content: string,
    /** The {@link UnsMessageColor} of the message. */
    public readonly color: UnsMessageColor,
    /** Whether to close the message after it is first viewed */
    public readonly closeOnView = false,
    /** Gets the ID of the message definition */
    public readonly id: UnsMessageID,
  ) { }
}
