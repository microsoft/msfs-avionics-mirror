/**
 * Events for broadcasting the index of the locally running MFD instrument.
 */
export interface MfdIndexEvents {
  /** The index of the MFD instrument. 1 = left, 2 = right. */
  mfd_index: 1 | 2;
}