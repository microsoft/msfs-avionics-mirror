
/** Fms Message Fragment to be displayed on the INAV window. */
export interface FmsMessageFragment {
  /** The text style of the fragment */
  style: 'small' | 'large',

  /** The text of the fragment */
  text: string,

  /** The fragment will not be forced to start on a new line if true (it may still wrap) */
  inline?: boolean,
}

/** Fms Message to be displayed on the INAV window. */
export class FmsMessage {
  /**
   * Ctor
   *
   * @param onlyOnside whether this message is only sent to the onside CDU
   * @param title the title of the message
   * @param body the body of the message, containing text fragments
   */
  constructor(
    readonly onlyOnside: boolean,
    readonly title: string,
    readonly body: FmsMessageFragment[],
  ) {
  }
}
