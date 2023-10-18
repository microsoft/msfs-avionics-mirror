/**
 * A utility class containing information about the current G3000 software version.
 */
export class G3000Version {
  /** The current version string. */
  public static readonly VERSION = 'WT1.1.10';

  /** The release date of the current version, as a UNIX timestamp in milliseconds. */
  public static readonly VERSION_DATE = Date.parse('2023-08-14');
}