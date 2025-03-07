/**
 * A utility class containing information about the current G3000 software version.
 */
export class G3000Version {
  /** The current version string. */
  public static readonly VERSION = 'WT2.0.6';

  /** The release date of the current version, as a UNIX timestamp in milliseconds. */
  public static readonly VERSION_DATE = Date.parse('2025-01-22');
}