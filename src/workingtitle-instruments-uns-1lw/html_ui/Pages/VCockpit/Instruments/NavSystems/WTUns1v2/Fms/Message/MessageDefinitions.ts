/** Type alias for message definitions */
type MessageText = string;

/**
 * Enumeration of message levels
 * Higher numbers are higher priority
 */
export enum UnsMessageColor {
  White = 'white', // white
  Amber = 'amber' // amber
}

/** UNS Message */
class Message {
  /**
   * Constructs a new UNS Message
   * @param lines An array of strings which represent message lines
   * @param color The message colour
   * @param exitOnView Whether the message should be removed once it has been viewed
   */
  constructor(public lines: MessageText[], public color: UnsMessageColor, public exitOnView: boolean = false) {
  }
}

/** Enumeration for UNS1 Messages */
export enum UnsMessageID {
  ABEAM_WPT_ALERT,
  ALT_INVALID_FOR_VNAV,
  APPR_IN_USE,
  BARO_ALT_NOT_AVAIL,
  CANCELLED_LOC_STEERING,
  CFG_DATA_LOAD_MODIFIED,
  CROSSFILL_FAIL_FPL_CHANGE,
  CURRENT_LEG_EXTENDED,
  DATABASE_EXPIRED,
  DEAD_RECKONING_MODE,
  FMS_LOC_DIFF_WARN,
  FPL_CAPACITY_EXCEEDED,
  FUEL_FLOW_FAIL,
  FUEL_NOT_CONFIRMED,
  GLONASS_DEPENDENT_NAV,
  GNSS_1_DESELECT,
  GNSS_2_DESELECT,
  GNSS_3_DESELECT,
  GNSS_DIFFERENCE,
  GPS_ONLY_NAV,
  HIGH_ARC_GROUNDPSEED,
  HIGH_HOLD_GROUNDSPEED,
  IRS_1_DIFFERENCE,
  IRS_2_DIFFERENCE,
  IRS_3_DIFFERENCE,
  LATLONG_CROSSING_WPT,
  LOC_STEERING_ACTIVE,
  LPV_NOT_AVAIL,
  LNAV_VNAV_NOT_AVAIL,
  LOW_ALTITUDE_ALERT,
  NAV_RADIO_DESELECT,
  NEXT_LEG_UNDEFINED,
  NEXT_VNAV_LEG_INVALID,
  NO_INTERCEPT,
  POINT_NO_RETURN_ALERT,
  POSITION_UNCERTAIN,
  RUNWAY_IN_USE,
  SATELLITE_POS_ALARM,
  SPEED_TOO_FAST_FOR_TURN,
  TOP_OF_DESCENT,
}

/** Array containing all UNS message definitions */
export const UnsMessageDefinitions = new Map([
  [UnsMessageID.ABEAM_WPT_ALERT, new Message(['ABEAM WAYPOINT ALERT'], UnsMessageColor.Amber, true)],
  [UnsMessageID.ALT_INVALID_FOR_VNAV, new Message(['ALT INVALID FOR VNAV'], UnsMessageColor.Amber)],
  [UnsMessageID.APPR_IN_USE, new Message(['APPROACH IN USE'], UnsMessageColor.White, true)],
  [UnsMessageID.BARO_ALT_NOT_AVAIL, new Message(['BARO ALT NOT AVAILABLE'], UnsMessageColor.White, true)],
  [UnsMessageID.CANCELLED_LOC_STEERING, new Message(['CANCELLED LOC STEERING'], UnsMessageColor.Amber)],
  [UnsMessageID.CFG_DATA_LOAD_MODIFIED, new Message(['CFG DATA LOAD MODIFIED'], UnsMessageColor.Amber, true)],
  [UnsMessageID.CROSSFILL_FAIL_FPL_CHANGE, new Message(['CROSSFILL FAIL: FPL CHGD'], UnsMessageColor.White, true)],
  [UnsMessageID.CURRENT_LEG_EXTENDED, new Message(['CURRENT LEG EXTENDED'], UnsMessageColor.White)],
  [UnsMessageID.DATABASE_EXPIRED, new Message(['DATABASE EXPIRED'], UnsMessageColor.White, true)],
  [UnsMessageID.DEAD_RECKONING_MODE, new Message(['DEAD RECKONING MODE'], UnsMessageColor.White)],
  [UnsMessageID.FMS_LOC_DIFF_WARN, new Message(['FMS-FLOC DIFF WARN'], UnsMessageColor.Amber)],
  [UnsMessageID.FPL_CAPACITY_EXCEEDED, new Message(['FPL CAPACITY EXCEEDED'], UnsMessageColor.White)],
  [UnsMessageID.FUEL_FLOW_FAIL, new Message(['FUELFLOW FAIL'], UnsMessageColor.Amber)],
  [UnsMessageID.FUEL_NOT_CONFIRMED, new Message(['FUEL NOT CONFIRMED'], UnsMessageColor.White)],
  [UnsMessageID.GLONASS_DEPENDENT_NAV, new Message(['GLONASS DEPENDENT NAV'], UnsMessageColor.White)],
  [UnsMessageID.GNSS_1_DESELECT, new Message(['GNSS 1 DESELECT'], UnsMessageColor.White, true)],
  [UnsMessageID.GNSS_2_DESELECT, new Message(['GNSS 2 DESELECT'], UnsMessageColor.White, true)],
  [UnsMessageID.GNSS_3_DESELECT, new Message(['GNSS 3 DESELECT'], UnsMessageColor.White, true)],
  [UnsMessageID.GPS_ONLY_NAV, new Message(['GNSS 3 DESELECT'], UnsMessageColor.White)],
  [UnsMessageID.HIGH_ARC_GROUNDPSEED, new Message(['HIGH GROUNDSPEED FOR ARC'], UnsMessageColor.Amber)],
  [UnsMessageID.HIGH_HOLD_GROUNDSPEED, new Message(['HIGH GNDSPD FOR HOLDING'], UnsMessageColor.Amber)],
  [UnsMessageID.IRS_1_DIFFERENCE, new Message(['IRS 1 DIFFERENCE WARNING'], UnsMessageColor.White, true)],
  [UnsMessageID.IRS_2_DIFFERENCE, new Message(['IRS 2 DIFFERENCE WARNING'], UnsMessageColor.White, true)],
  [UnsMessageID.IRS_3_DIFFERENCE, new Message(['IRS 3 DIFFERENCE WARNING'], UnsMessageColor.White, true)],
  [UnsMessageID.LATLONG_CROSSING_WPT, new Message(['LAT/LONG XING WPT ALERT'], UnsMessageColor.White, true)],
  [UnsMessageID.LOC_STEERING_ACTIVE, new Message(['LOC STEERING ACTIVE'], UnsMessageColor.White)],
  [UnsMessageID.LPV_NOT_AVAIL, new Message(['LPV NOT AVAILABLE'], UnsMessageColor.Amber)],
  [UnsMessageID.LNAV_VNAV_NOT_AVAIL, new Message(['LNAV/VNAV NOT AVAILABLE'], UnsMessageColor.Amber)],
  [UnsMessageID.LOW_ALTITUDE_ALERT, new Message(['LOW ALTITUDE ALERT'], UnsMessageColor.White)],
  [UnsMessageID.NAV_RADIO_DESELECT, new Message(['NAV RADIO DESELECT'], UnsMessageColor.White)],
  [UnsMessageID.NEXT_LEG_UNDEFINED, new Message(['NEXT LEG UNDEFINED'], UnsMessageColor.White)],
  [UnsMessageID.NEXT_VNAV_LEG_INVALID, new Message(['NEXT VNAV LEG INVALID'], UnsMessageColor.White)],
  [UnsMessageID.NO_INTERCEPT, new Message(['NO INTERCEPT'], UnsMessageColor.White)],
  [UnsMessageID.POINT_NO_RETURN_ALERT, new Message(['PNR ALERT'], UnsMessageColor.White, true)],
  [UnsMessageID.POSITION_UNCERTAIN, new Message(['POSITION UNCERTAIN'], UnsMessageColor.White, true)],
  [UnsMessageID.RUNWAY_IN_USE, new Message(['RUNWAY IN USE'], UnsMessageColor.White, true)],
  [UnsMessageID.SATELLITE_POS_ALARM, new Message(['SATELLITE POS ALARM'], UnsMessageColor.White, true)],
  [UnsMessageID.SPEED_TOO_FAST_FOR_TURN, new Message(['SPEED TOO FAST FOR TURN'], UnsMessageColor.White, true)],
  [UnsMessageID.TOP_OF_DESCENT, new Message(['TOP OF DESCENT'], UnsMessageColor.White, true)],
]);
