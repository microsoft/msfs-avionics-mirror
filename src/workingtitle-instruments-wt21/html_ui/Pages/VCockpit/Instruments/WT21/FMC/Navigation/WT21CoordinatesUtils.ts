import { LatLongInterface } from '@microsoft/msfs-sdk';

export const SHORT_END_LLA_FORMAT_REGEX = /^([NS])(\d{2})(\d{2})([WE])(?:\/(\w{1,5}))?$/;
export const SHORT_MID_LLA_FORMAT_REGEX = /^([NS])(\d{2})([WE])(\d{2})(?:\/(\w{1,5}))?$/;
export const LONG_LLA_FORMAT_REGEX = /^([NS])(\d{2}(?:\d{1,2}(?:\.\d{1,2})?)?)\s*([WE])(\d{3}(?:\d{1,2}(?:\.\d{1,2})?)?)(?:\/(\w{1,5}))?$/;

/**
 * Input/output data for a coordinates entry
 */
export interface CoordinatesInput {
  /**
   * LLA object
   */
  lla: LatLongInterface,

  /**
   * Ident to give to the new facility
   */
  ident: string,
}

/**
 * Utilities for parsing coordinates in the WT21 supported formats
 */
export class WT21CoordinatesUtils {
  /**
   * Parses a string according to the LAT LONG format
   *
   * @param str             the string to parse
   * @param acceptShortForm whether to accept the short (XYYZUU/XYYUUZ) formats
   *
   * @returns a {@link LatLongInterface} object if a valid PBPB definition and `null` otherwise
   */
  public static parseLatLong(str: string, acceptShortForm = true): CoordinatesInput | null {
    if (acceptShortForm) {
      const shortEndMatch = SHORT_END_LLA_FORMAT_REGEX.exec(str);

      if (shortEndMatch) {
        const latDir = shortEndMatch[1];
        const latNum = shortEndMatch[2];
        const lonNum = shortEndMatch[3];
        const lonDir = shortEndMatch[4];

        const parsedLat = this.parseLatitude(latDir, latNum);
        const parsedLon = this.parseLongitude(lonDir, lonNum);

        if (!parsedLat || !parsedLon) {
          return null;
        }

        const lla = { lat: parsedLat, long: parsedLon };

        let ident = shortEndMatch[5];
        if (!ident) {
          ident = `${latDir}${latNum}${lonNum}${lonDir}`;
        }

        return { lla, ident };
      }

      const shortMidMatch = SHORT_MID_LLA_FORMAT_REGEX.exec(str);

      if (shortMidMatch) {
        const latDir = shortMidMatch[1];
        const latNum = shortMidMatch[2];
        const lonDir = shortMidMatch[3];
        const lonNum = shortMidMatch[4];

        const parsedLat = this.parseLatitude(latDir, latNum);
        const parsedLon = this.parseLongitude(lonDir, `1${lonNum}`);

        if (!parsedLat || !parsedLon) {
          return null;
        }

        const lla = { lat: parsedLat, long: parsedLon };

        let ident = shortMidMatch[5];
        if (!ident) {
          ident = `${latDir}${latNum}${lonDir}${lonNum}`;
        }

        return { lla, ident };
      }
    }

    const fullMatch = LONG_LLA_FORMAT_REGEX.exec(str);

    if (!fullMatch) {
      return null;
    }

    const latDir = fullMatch[1];
    const latNum = fullMatch[2];
    const lonDir = fullMatch[3];
    const lonNum = fullMatch[4];

    const parsedLat = this.parseLatitude(latDir, latNum);
    const parsedLon = this.parseLongitude(lonDir, lonNum);

    if (!parsedLat || !parsedLon) {
      return null;
    }

    const lla = { lat: parsedLat, long: parsedLon };

    const ident = fullMatch[5];

    return {
      lla,
      ident: ident ?? undefined,
    };
  }

  /**
   * Parses a latitude string
   *
   * @param dirStr the N or S string part
   * @param numStr the numerical string part
   *
   * @returns the latitude in degrees
   */
  private static parseLatitude(dirStr: string, numStr: string): number | null {
    let lat;

    const splitLatNum = numStr.split('.');

    const latLeft = splitLatNum[0];
    const latRight = splitLatNum[1];

    // Parse latitude degrees + minutes
    if (latLeft.length > 2) {
      const deg = parseInt(latLeft.substring(0, 2));
      const min = parseInt(latLeft.substring(2));

      if (min >= 60) {
        return null;
      }

      const minDecimal = min / 60;

      lat = deg + (Number.isFinite(minDecimal) ? minDecimal : 0);
    } else {
      lat = parseInt(latLeft);
    }

    // If we have digits after a decimal, we consider them as decimals of a minute
    if (latRight) {
      const secs = parseFloat(`0.${latRight}`);

      const add = secs / 60;

      lat += add;
    }

    // If direction is S, negate latitude
    if (dirStr === 'S') {
      lat *= -1;
    }

    if (Math.abs(lat) > 90) {
      return null;
    }

    return lat;
  }

  /**
   * Parses a longitude string
   *
   * @param dirStr the W or E string part
   * @param numStr the numerical string part
   *
   * @returns the longitude in degrees
   */
  private static parseLongitude(dirStr: string, numStr: string): number | null {
    let lon;

    const splitLonNum = numStr.split('.');

    const lonLeft = splitLonNum[0];
    const lonRight = splitLonNum[1];

    // Parse longitude degrees + minutes
    if (lonLeft.length > 3) {
      const deg = parseInt(lonLeft.substring(0, 3));
      const min = parseInt(lonLeft.substring(3));

      if (min >= 60) {
        return null;
      }

      const minDecimal = min / 60;

      lon = deg + (Number.isFinite(minDecimal) ? minDecimal : 0);
    } else {
      lon = parseInt(lonLeft);
    }

    // If we have digits after a decimal, we consider them as decimals of a minute
    if (lonRight) {
      const secs = parseFloat(`0.${lonRight}`);

      const add = secs / 60;

      lon += add;
    }

    // If direction is W, negate longitude
    if (dirStr === 'W') {
      lon *= -1;
    }

    if (Math.abs(lon) > 180) {
      return null;
    }

    return lon;
  }
}