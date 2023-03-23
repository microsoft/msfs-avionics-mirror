import { FlightPlan, ICAO, StringUtils } from '@microsoft/msfs-sdk';

// TODO Maybe move to garminSDK, since this was copied from the NXI with minimal changes?

/**
 * Utility methods for working with the flight plan display in the G3000.
 */
export class G3000FPLUtils {
  /**
   * Gets the displayed name of a flight plan.
   * @param plan A flight plan.
   * @returns The flight plan's displayed name.
   */
  public static getFlightPlanDisplayName(plan: FlightPlan): string;
  /**
   * Gets the displayed name of a flight plan with a given origin, destination, and saved name.
   * @param name The saved name of the flight plan, if any.
   * @param originIdent The ident of the flight plan's origin airport, if any.
   * @param destIdent The ident of the flight plan's destination airport, if any.
   * @returns The flight plan's displayed name.
   */
  public static getFlightPlanDisplayName(name: string | undefined, originIdent: string | undefined, destIdent: string | undefined): string;
  // eslint-disable-next-line jsdoc/require-jsdoc
  public static getFlightPlanDisplayName(arg1: FlightPlan | string | undefined, arg2?: string, arg3?: string): string {
    let name: string | undefined, originIdent: string | undefined, destIdent: string | undefined;

    if (typeof arg1 === 'object') {
      name = arg1.getUserData<string>('name');
      originIdent = arg1.originAirport ? ICAO.getIdent(arg1.originAirport) : undefined;
      destIdent = arg1.destinationAirport ? ICAO.getIdent(arg1.destinationAirport) : undefined;
    } else {
      name = arg1;
      originIdent = arg2 as string;
      destIdent = arg3 as string;
    }

    return name ?? `${originIdent ? StringUtils.useZeroSlash(originIdent) : '______'} / ${destIdent ? StringUtils.useZeroSlash(destIdent) : '______'}`;
  }
}