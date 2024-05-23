/**
 * SimVar names for Garmin external GPS steering command data.
 */
export enum APExternalGpsSteerCommandSimVars {
  IsValid = 'L:WT_Garmin_External_GPS_Steer_Command_Is_Valid',
  BankAngle = 'L:WT_Garmin_External_GPS_Steer_Command_Bank_Angle',
  Dtk = 'L:WT_Garmin_External_GPS_Steer_Command_Dtk',
  Xtk = 'L:WT_Garmin_External_GPS_Steer_Command_Xtk',
  Tae = 'L:WT_Garmin_External_GPS_Steer_Command_Tae'
}

/**
 * SimVar names for Garmin external VNAV guidance data.
 */
export enum APExternalVNavGuidanceSimVars {
  State = 'L:WT_Garmin_External_VNav_State',
  IsActive = 'L:WT_Garmin_External_VNav_Is_Active',
  PathMode = 'L:WT_Garmin_External_VNav_Path_Mode',
  ArmedClimbMode = 'L:WT_Garmin_External_VNav_Armed_Climb_Mode',
  ShouldActivateClimbMode = 'L:WT_Garmin_External_VNav_Should_Activate_Climb_Mode',
  AltitudeCaptureType = 'L:WT_Garmin_External_VNav_Alt_Capture_Type',
  ShouldCaptureAltitude = 'L:WT_Garmin_External_VNav_Should_Capture_Alt',
  AltitudeToCapture = 'L:WT_Garmin_External_VNav_Alt_To_Capture',
}

/**
 * SimVar names for Garmin external vertical path guidance data.
 */
export enum APExternalVerticalPathGuidanceSimVars {
  IsValid = 'L:WT_Garmin_External_Vertical_Path_Is_Valid',
  Fpa = 'L:WT_Garmin_External_Vertical_Path_Fpa',
  Deviation = 'L:WT_Garmin_External_Vertical_Path_Deviation',
}

/**
 * SimVar names for Garmin external glidepath guidance data.
 */
export enum APExternalGlidepathGuidanceSimVars {
  ApproachHasGp = 'L:WT_Garmin_External_Glidepath_Approach_Has_Gp',
  IsValid = 'L:WT_Garmin_External_Glidepath_Is_Valid',
  CanCapture = 'L:WT_Garmin_External_Glidepath_Can_Capture',
  Fpa = 'L:WT_Garmin_External_VNav_Path_Fpa',
  Deviation = 'L:WT_Garmin_External_VNav_Path_Deviation',
}
