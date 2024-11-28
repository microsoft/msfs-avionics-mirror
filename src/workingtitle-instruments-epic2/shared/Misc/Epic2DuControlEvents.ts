import { DisplayUnitIndices } from '../InstrumentIndices';

/** TSC Keyboard HEvents enum. */
export enum Epic2KeyboardCharHEvents {
  KEY_A = 'EPIC2_KEYBOARD_KEY_A',
  KEY_B = 'EPIC2_KEYBOARD_KEY_B',
  KEY_C = 'EPIC2_KEYBOARD_KEY_C',
  KEY_D = 'EPIC2_KEYBOARD_KEY_D',
  KEY_E = 'EPIC2_KEYBOARD_KEY_E',
  KEY_F = 'EPIC2_KEYBOARD_KEY_F',
  KEY_G = 'EPIC2_KEYBOARD_KEY_G',
  KEY_H = 'EPIC2_KEYBOARD_KEY_H',
  KEY_I = 'EPIC2_KEYBOARD_KEY_I',
  KEY_J = 'EPIC2_KEYBOARD_KEY_J',
  KEY_K = 'EPIC2_KEYBOARD_KEY_K',
  KEY_L = 'EPIC2_KEYBOARD_KEY_L',
  KEY_M = 'EPIC2_KEYBOARD_KEY_M',
  KEY_N = 'EPIC2_KEYBOARD_KEY_N',
  KEY_O = 'EPIC2_KEYBOARD_KEY_O',
  KEY_P = 'EPIC2_KEYBOARD_KEY_P',
  KEY_Q = 'EPIC2_KEYBOARD_KEY_Q',
  KEY_R = 'EPIC2_KEYBOARD_KEY_R',
  KEY_S = 'EPIC2_KEYBOARD_KEY_S',
  KEY_T = 'EPIC2_KEYBOARD_KEY_T',
  KEY_U = 'EPIC2_KEYBOARD_KEY_U',
  KEY_V = 'EPIC2_KEYBOARD_KEY_V',
  KEY_W = 'EPIC2_KEYBOARD_KEY_W',
  KEY_X = 'EPIC2_KEYBOARD_KEY_X',
  KEY_Y = 'EPIC2_KEYBOARD_KEY_Y',
  KEY_Z = 'EPIC2_KEYBOARD_KEY_Z',
  KEY_0 = 'EPIC2_KEYBOARD_KEY_0',
  KEY_1 = 'EPIC2_KEYBOARD_KEY_1',
  KEY_2 = 'EPIC2_KEYBOARD_KEY_2',
  KEY_3 = 'EPIC2_KEYBOARD_KEY_3',
  KEY_4 = 'EPIC2_KEYBOARD_KEY_4',
  KEY_5 = 'EPIC2_KEYBOARD_KEY_5',
  KEY_6 = 'EPIC2_KEYBOARD_KEY_6',
  KEY_7 = 'EPIC2_KEYBOARD_KEY_7',
  KEY_8 = 'EPIC2_KEYBOARD_KEY_8',
  KEY_9 = 'EPIC2_KEYBOARD_KEY_9',
  KEY_HASH = 'EPIC2_KEYBOARD_KEY_HASH',
  KEY_MINUS = 'EPIC2_KEYBOARD_KEY_MINUS',
  KEY_SLASH = 'EPIC2_KEYBOARD_KEY_SLASH',
  KEY_SPACE = 'EPIC2_KEYBOARD_KEY_SPACE',
  KEY_PERIOD = 'EPIC2_KEYBOARD_KEY_PERIOD',
  KEY_PLUS = 'EPIC2_KEYBOARD_KEY_PLUS',
}

export const Epic2KeyboardHEventToCharMap: Record<Epic2KeyboardCharHEvents, string> = {
  [Epic2KeyboardCharHEvents.KEY_0]: '0',
  [Epic2KeyboardCharHEvents.KEY_1]: '1',
  [Epic2KeyboardCharHEvents.KEY_2]: '2',
  [Epic2KeyboardCharHEvents.KEY_3]: '3',
  [Epic2KeyboardCharHEvents.KEY_4]: '4',
  [Epic2KeyboardCharHEvents.KEY_5]: '5',
  [Epic2KeyboardCharHEvents.KEY_6]: '6',
  [Epic2KeyboardCharHEvents.KEY_7]: '7',
  [Epic2KeyboardCharHEvents.KEY_8]: '8',
  [Epic2KeyboardCharHEvents.KEY_9]: '9',
  [Epic2KeyboardCharHEvents.KEY_A]: 'A',
  [Epic2KeyboardCharHEvents.KEY_B]: 'B',
  [Epic2KeyboardCharHEvents.KEY_C]: 'C',
  [Epic2KeyboardCharHEvents.KEY_D]: 'D',
  [Epic2KeyboardCharHEvents.KEY_E]: 'E',
  [Epic2KeyboardCharHEvents.KEY_F]: 'F',
  [Epic2KeyboardCharHEvents.KEY_G]: 'G',
  [Epic2KeyboardCharHEvents.KEY_H]: 'H',
  [Epic2KeyboardCharHEvents.KEY_I]: 'I',
  [Epic2KeyboardCharHEvents.KEY_J]: 'J',
  [Epic2KeyboardCharHEvents.KEY_K]: 'K',
  [Epic2KeyboardCharHEvents.KEY_L]: 'L',
  [Epic2KeyboardCharHEvents.KEY_M]: 'M',
  [Epic2KeyboardCharHEvents.KEY_N]: 'N',
  [Epic2KeyboardCharHEvents.KEY_O]: 'O',
  [Epic2KeyboardCharHEvents.KEY_P]: 'P',
  [Epic2KeyboardCharHEvents.KEY_Q]: 'Q',
  [Epic2KeyboardCharHEvents.KEY_R]: 'R',
  [Epic2KeyboardCharHEvents.KEY_S]: 'S',
  [Epic2KeyboardCharHEvents.KEY_T]: 'T',
  [Epic2KeyboardCharHEvents.KEY_U]: 'U',
  [Epic2KeyboardCharHEvents.KEY_V]: 'V',
  [Epic2KeyboardCharHEvents.KEY_W]: 'W',
  [Epic2KeyboardCharHEvents.KEY_X]: 'X',
  [Epic2KeyboardCharHEvents.KEY_Y]: 'Y',
  [Epic2KeyboardCharHEvents.KEY_Z]: 'Z',
  [Epic2KeyboardCharHEvents.KEY_HASH]: '#',
  [Epic2KeyboardCharHEvents.KEY_MINUS]: '-',
  [Epic2KeyboardCharHEvents.KEY_PERIOD]: '.',
  [Epic2KeyboardCharHEvents.KEY_PLUS]: '+',
  [Epic2KeyboardCharHEvents.KEY_SLASH]: '/',
  [Epic2KeyboardCharHEvents.KEY_SPACE]: ' ',
};

export enum Epic2KeyboardControlHEvents {
  Clear = 'EPIC2_KEYBOARD_CLEAR',
  CursorLeft = 'EPIC2_KEYBOARD_CURSOR_LEFT',
  CursorRight = 'EPIC2_KEYBOARD_CURSOR_RIGHT',
  // synonym = backspace
  Delete = 'EPIC2_KEYBOARD_DELETE',
  // can also be separate from the keyboard, but same handling
  Enter = 'EPIC2_KEYBOARD_ENTER',
  PlusMinus = 'EPIC2_KEYBOARD_PLUSMINUS',
}

/** Non-ASCII Keyboard events. */
export interface Epic2KeyboardEvents {
  /** Clear the selected field entirely. */
  epic2_keyboard_clear: unknown,
  /** Move the cursor left 1 char. */
  epic2_keyboard_cursor_left: unknown,
  /** Move the cursor right 1 char. */
  epic2_keyboard_cursor_right: unknown,
  /** Delete the last entered character (like backspace on a normal keyboard). */
  epic2_keyboard_delete: unknown,
  /** Confirm the input. */
  epic2_keyboard_enter: unknown,
  /** Toggle the sign of the input. */
  epic2_keyboard_plusminus: unknown,
  /** A key press event. The value is the key the character that was entered. */
  epic2_keyboard_char: typeof Epic2KeyboardHEventToCharMap[Epic2KeyboardCharHEvents],
}

/** Non-keypad Button Events. */
export interface Epic2DuControlButtonEvents {
  /** CHART/VIDEO button pressed. */
  epic2_du_chart_video_button: unknown,
  /** Checklist button pressed. */
  epic2_du_checklist_button: unknown,
  /** COM button pressed. */
  epic2_du_com_button: unknown,
  /** Detail button pressed. */
  epic2_du_detail_button: unknown,
  /** DIR TO button pressed. */
  epic2_du_dirto_button: unknown,
  /** Event button pressed. */
  epic2_du_event_button: unknown,
  /** Flap override button pressed. */
  epic2_du_flap_override_button: unknown,
  /** Frequency swap button pressed. */
  epic2_du_frequency_swap_button: unknown,
  /** Glideslope Inhibit button pressed. */
  epic2_du_glideslope_inhibit_button: unknown,
  /** Info button pressed. */
  epic2_du_info_button: unknown,
  /** NAV button pressed. */
  epic2_du_nav_button: unknown,
  /** The TSC or MF controller PAGE button. */
  epic2_du_page_button: unknown,
  /** Terrain inhibit button pressed. */
  epic2_du_terrain_inhibit_button: unknown,
  /** XPDR button pressed. */
  epic2_du_xpdr_button: unknown,
}

/** H events sent by the TSC or MF controller to the selected display unit. */
export enum Epic2DuControlHEvents {
  ChartVideo = 'EPIC2_DU_BUTTON_CHART_VIDEO',
  Checklist = 'EPIC2_DU_BUTTON_CHECKLIST',
  Com = 'EPIC2_DU_BUTTON_COM',
  Detail = 'EPIC2_DU_BUTTON_DETAIL',
  DirTo = 'EPIC2_DU_BUTTON_DIRTO',
  Event = 'EPIC2_DU_BUTTON_EVENT',
  FlapOverride = 'EPIC2_DU_BUTTON_FLAP_OVRD',
  FrequencySwap = 'EPIC2_DU_BUTTON_FREQ_SWAP',
  GlideslopeInhibit = 'EPIC2_DU_BUTTON_GS_INHIB',
  Info = 'EPIC2_DU_BUTTON_INFO',
  Nav = 'EPIC2_DU_BUTTON_NAV',
  Page = 'EPIC2_DU_BUTTON_PAGE',
  TerrainInhibit = 'EPIC2_DU_BUTTON_TERR_INHIB',
  Xpdr = 'EPIC2_DU_BUTTON_XPDR',
}

/** DU control HTML events. */
export type Epic2DuHEvents = Epic2KeyboardCharHEvents | Epic2KeyboardControlHEvents | Epic2DuControlHEvents;

export enum Epic2DuControlLocalVars {
  // This LVAR needs to match src\workingtitle-instruments-epic2\instruments\html_ui\Pages\VCockpit\Systems\Systems_Epic2.ts
  MfdSwap = 'L:WT_Epic2_MFD_Swap',
  SelectedDisplayUnit = 'L:WT_EPIC2_SELECTED_DISPLAY_UNIT',
}

/** DU control local var events. */
export interface Epic2DuControlLocalVarEvents {
  /** The DU selected to receive TSC or MF controller events. */
  epic2_selected_display_unit: DisplayUnitIndices,
  /** Whether the MFDs should swap positions. */
  epic2_mfd_swap: boolean;
  /** Is the DU hosting this instrument selected. */
  epic2_host_display_unit_selected: boolean;
}

/** All DU control events. */
export type Epic2DuControlEvents = Epic2DuControlLocalVarEvents & Epic2KeyboardEvents & Epic2DuControlButtonEvents;
