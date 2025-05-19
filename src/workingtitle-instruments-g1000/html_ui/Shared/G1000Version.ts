/**
 * A utility class containing information about the current G1000 software version.
 */
export class G1000Version {
  /** The current version string. */
  public static readonly VERSION = 'WT2.0.12';

  /** The release date of the current version, as a UNIX timestamp in milliseconds. */
  public static readonly VERSION_DATE = Date.parse('2025-03-27');
}
