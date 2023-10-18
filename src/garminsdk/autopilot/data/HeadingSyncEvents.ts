/**
 * Events related to Garmin autopilot heading sync.
 */
export interface HeadingSyncEvents {
  /** Whether automatic adjustment of selected heading during a turn is active. */
  hdg_sync_turn_adjust_active: boolean;

  /** Whether HDG sync mode is active. */
  hdg_sync_mode_active: boolean;

  /** The selected heading was changed manually. */
  hdg_sync_manual_select: void;
}