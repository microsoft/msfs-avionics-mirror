import { Message } from './Message';
import { MESSAGE_LEVEL } from './MessageDefinition';

/** WT21_PFD_Message */
export class PfdMessage extends Message {
  public blinkCheckHandler!: () => boolean;
  public presentationInfo!: PfdMessagePresentationInfo;
}

/** PfdMessagePresentationInfo */
export interface PfdMessagePresentationInfo {
  // eslint-disable-next-line jsdoc/require-jsdoc
  content: string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  level: MESSAGE_LEVEL;
  // eslint-disable-next-line jsdoc/require-jsdoc
  isBlinking: boolean;
}
