/**
 * Events used to control the G3000 initialization process.
 */
export interface InitializationControlEvents {
  /** Resets the initialization process. */
  g3000_init_reset: void;

  /** Accepts the initialization. */
  g3000_init_accept: void;
}
