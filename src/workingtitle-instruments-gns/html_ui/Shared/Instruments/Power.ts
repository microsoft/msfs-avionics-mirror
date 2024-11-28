
/**
 * A set of states for the power of the GNS.
 */
export enum PowerState {
  Off = 'Off',
  Booting = 'Booting',
  SelfTest = 'SelfTest',
  On = 'On',
  OnSkipInit = 'OnSkipInit'
}

/**
 * Events relating to instrument power.
 */
export interface PowerEvents {
  /** An event fired when the power state of the instrument changes. */
  'instrument_powered': PowerState;
}