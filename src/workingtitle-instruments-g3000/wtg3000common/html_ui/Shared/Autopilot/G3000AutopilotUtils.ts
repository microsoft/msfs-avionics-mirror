import { APLateralModes, APVerticalModes } from '@microsoft/msfs-sdk';

/**
 * A utility class for working with the G3000 autopilot.
 */
export class G3000AutopilotUtils {
  public static readonly RESTRICTED_LATERAL_MODES = [
    APLateralModes.NONE,
    APLateralModes.ROLL,
    APLateralModes.LEVEL,
    APLateralModes.HEADING,
    APLateralModes.TRACK,
    APLateralModes.GPSS,
    APLateralModes.VOR,
    APLateralModes.LOC,
    APLateralModes.BC,
    APLateralModes.TO,
    APLateralModes.GA,
  ];

  public static readonly RESTRICTED_VERTICAL_MODES = [
    APVerticalModes.NONE,
    APVerticalModes.PITCH,
    APVerticalModes.LEVEL,
    APVerticalModes.VS,
    APVerticalModes.FLC,
    APVerticalModes.ALT,
    APVerticalModes.CAP,
    APVerticalModes.PATH,
    APVerticalModes.GP,
    APVerticalModes.GS,
    APVerticalModes.TO,
    APVerticalModes.GA,
  ];
}
