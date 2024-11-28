/** DME state events. */
export interface Epic2DmeStateEvents {
  /** The DME associated with NAV1, or null if none (i.e. in a single DME install with DME paired to NAV2). */
  epic2_nav1_dme_association: 1 | 2 | null,
  /** The DME associated with NAV2, or null if none (i.e. in a single DME install with DME paired to NAV1). */
  epic2_nav2_dme_association: 1 | 2 | null,

  /** Whether DME hold is on for the DME associated with NAV1. */
  epic2_nav1_dme_hold: boolean,
  /** Whether DME hold is on for the DME associated with NAV2. */
  epic2_nav2_dme_hold: boolean,
}
