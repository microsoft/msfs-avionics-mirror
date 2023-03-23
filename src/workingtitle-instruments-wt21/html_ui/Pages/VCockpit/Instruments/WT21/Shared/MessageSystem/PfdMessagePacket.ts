import { PfdMessagePresentationInfo } from './PfdMessage';

/** A poco to send messages via localstorage to the PFD */
export interface PfdMessagePacket {
  /** Message on top line above nav source data fields. */
  readonly top?: PfdMessagePresentationInfo;
  /** Message on bottom line above nav source data fields. */
  readonly bot?: PfdMessagePresentationInfo;
  /** Message on the HSI map. */
  readonly map?: PfdMessagePresentationInfo;
  /** Message on the MFD on top right of HSI. */
  readonly mfd?: PfdMessagePresentationInfo;
}