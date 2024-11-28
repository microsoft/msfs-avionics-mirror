/**
 * SimVar names for Garmin external GPS steering command data.
 */
export enum APExternalGpsSteerCommandSimVars {
  IsValid = 'L:1:WT_Garmin_External_GPS_Steer_Command_Is_Valid',
  IsHeading = 'L:1:WT_Garmin_External_GPS_Steer_Command_Is_Heading',
  CourseToSteer = 'L:1:WT_Garmin_External_GPS_Steer_Command_Course_To_Steer',
  TrackRadius = 'L:1:WT_Garmin_External_GPS_Steer_Command_Track_Radius',
  Dtk = 'L:1:WT_Garmin_External_GPS_Steer_Command_Dtk',
  Xtk = 'L:1:WT_Garmin_External_GPS_Steer_Command_Xtk',
  Tae = 'L:1:WT_Garmin_External_GPS_Steer_Command_Tae'
}

/**
 * SimVar names for Garmin external VNAV guidance data.
 */
export enum APExternalVNavGuidanceSimVars {
  State = 'L:1:WT_Garmin_External_VNav_State',
  IsActive = 'L:1:WT_Garmin_External_VNav_Is_Active',
  PathMode = 'L:1:WT_Garmin_External_VNav_Path_Mode',
  ArmedClimbMode = 'L:1:WT_Garmin_External_VNav_Armed_Climb_Mode',
  ShouldActivateClimbMode = 'L:1:WT_Garmin_External_VNav_Should_Activate_Climb_Mode',
  AltitudeCaptureType = 'L:1:WT_Garmin_External_VNav_Alt_Capture_Type',
  ShouldCaptureAltitude = 'L:1:WT_Garmin_External_VNav_Should_Capture_Alt',
  AltitudeToCapture = 'L:1:WT_Garmin_External_VNav_Alt_To_Capture',
}

/**
 * SimVar names for Garmin external vertical path guidance data.
 */
export enum APExternalVerticalPathGuidanceSimVars {
  IsValid = 'L:1:WT_Garmin_External_Vertical_Path_Is_Valid',
  Fpa = 'L:1:WT_Garmin_External_Vertical_Path_Fpa',
  Deviation = 'L:1:WT_Garmin_External_Vertical_Path_Deviation',
}

/**
 * SimVar names for Garmin external glidepath guidance data.
 */
export enum APExternalGlidepathGuidanceSimVars {
  ApproachHasGp = 'L:1:WT_Garmin_External_Glidepath_Approach_Has_Gp',
  IsValid = 'L:1:WT_Garmin_External_Glidepath_Is_Valid',
  CanCapture = 'L:1:WT_Garmin_External_Glidepath_Can_Capture',
  Fpa = 'L:1:WT_Garmin_External_VNav_Path_Fpa',
  Deviation = 'L:1:WT_Garmin_External_VNav_Path_Deviation',
}
