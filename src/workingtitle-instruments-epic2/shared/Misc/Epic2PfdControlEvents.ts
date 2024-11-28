// Note: these events only exist on the PFDs, but they need to be in shared
// so shared systems can use them.

export enum PfdControlState {
  Inactive,
  Onside,
  Offside,
}

/** PFD control events (top half of controller) from the PFD controller controlling this PFD. */
export interface Epic2PfdControlPfdEvents {
  /** Event emitted when the baro knob is rotated anti-clockwise on the PFD controller controlling this PFD. */
  pfd_control_baro_decrement: unknown;
  /** Event emitted when the baro knob is rotated clockwise on the PFD controller controlling this PFD. */
  pfd_control_baro_increment: unknown;
  /** Event emitted when the baro knob is pushed on the PFD controller controlling this PFD. */
  pfd_control_baro_push: unknown;
  /** Event emitted when the nav select button is pushed on the PFD controller controlling this PFD. */
  pfd_control_nav_select_push: unknown;
  /** Event emitted when the nav preview button is pushed on the PFD controller controlling this PFD. */
  pfd_control_nav_preview_push: unknown;
  /** Event emitted when the bearing pointer 1 button is pushed on the PFD controller controlling this PFD. */
  pfd_control_pointer_1_push: unknown;
  /** Event emitted when the bearing pointer 2 button is pushed on the PFD controller controlling this PFD. */
  pfd_control_pointer_2_push: unknown;
  /** Event emitted when the HSI button is pushed on the PFD controller controlling this PFD. */
  pfd_control_hsi_push: unknown;
  /** Event emitted when the elapsed timer button is pushed on the PFD controller controlling this PFD. */
  pfd_control_timer_push: unknown;
  /** Event emitted when the range knob is rotated anti-clockwise on the PFD controller controlling this PFD. */
  pfd_control_range_decrement: unknown;
  /** Event emitted when the range knob is rotated clockwise on the PFD controller controlling this PFD. */
  pfd_control_range_increment: unknown;
  /** Event emitted when the course knob is rotated anti-clockwise on the PFD controller controlling this PFD. */
  pfd_control_course_decrement: unknown;
  /** Event emitted when the course knob is rotated clockwise on the PFD controller controlling this PFD. */
  pfd_control_course_increment: unknown;
  /** Event emitted when the course knob is pushed on the PFD controller controlling this PFD. */
  pfd_control_course_push: unknown;
  /** Event emitted when the ADAHRS button is pushed on the PFD controller controlling this PFD. */
  pfd_control_adahrs_push: unknown;
}

/** Radio control events (bottom half of controller) from the PFD controller controlling this PFD. */
export interface Epic2PfdControlRadioEvents {
  /** Radio panel IDENT button. */
  pfd_control_ident_push: unknown;
  /** Radio panel VFR button. */
  pfd_control_vfr_push: unknown;
  /** Radio panel DME button. */
  pfd_control_dme_push: unknown;
  /** Radio panel DETAIL button. */
  pfd_control_detail_push: unknown;
  /** Radio panel VOL knob increment. */
  pfd_control_volume_increment: unknown;
  /** Radio panel VOL knob decrement. */
  pfd_control_volume_decrement: unknown;
  /** Radio panel VOL knob push. */
  pfd_control_volume_push: unknown;
  /** Radio panel SEL outer knob decrement. */
  pfd_control_sel_coarse_decrement: unknown;
  /** Radio panel SEL outer knob increment. */
  pfd_control_sel_coarse_increment: unknown;
  /** Radio panel SEL inner knob increment. */
  pfd_control_sel_fine_increment: unknown;
  /** Radio panel SEL inner knob decrement. */
  pfd_control_sel_fine_decrement: unknown;
  /** Radio panel SEL knob push. */
  pfd_control_sel_push: unknown;
}

/** PFD controller events from the PFD controller actively controlling this PFD. */
export type Epic2PfdControlEvents = Epic2PfdControlPfdEvents & Epic2PfdControlRadioEvents & {
  /** The control state of this PFD. */
  pfd_control_state: PfdControlState;
  /** Emitted when any of the PFD events are emitted with the key as data. */
  pfd_control_pfd_event: keyof Epic2PfdControlPfdEvents;
  /** Emitted when any of the radio events are emitted with the key as data. */
  pfd_control_radio_event: keyof Epic2PfdControlRadioEvents;
};
