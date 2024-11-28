/** Events related to Epic 2 TSC keyboard events */
export type Epic2TscKeyboardEvents = {
  /** The input from the physical keyboard meant to send to TSC pop-up keyboard scratchpad. */
  input_field_input: string;
  /** The current cursor position inside the currently active `InputField`. */
  input_field_cursor_pos: number | null;
  /** Move the cursor focus from the currently active `InputField` to the next. */
  tsc_keyboard_next: undefined;
  /** The unique ID of the currently active `InputBox` element. */
  tsc_keyboard_active_input_id: string | undefined;
  /** The keyboard header string.*/
  tsc_keyboard_header: string;
  /** Forces the currently active `InputBox` to blur. */
  tsc_keyboard_force_blur: undefined;
  /** The maximum number of characters allowed by the TSC keyboard to be entered in an `InputBox`. */
  tsc_keyboard_max_chars: number;
}

/** Events related to misc Epic 2 cockpit events */
export type Epic2CockpitMiscEvents = {
  /** If the DTO random entry should be shown in the MFD waypoint list */
  epic2_mfd_direct_to_entry_shown: undefined;
  /** Is an input field capturing text currently? */
  input_field_capturing: boolean;
}

/** Events related to misc Epic 2 cockpit events */
export type Epic2CockpitEvents = Epic2TscKeyboardEvents & Epic2CockpitMiscEvents;
