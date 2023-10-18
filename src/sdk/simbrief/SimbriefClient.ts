import { SimbriefOfp } from './SimbriefTypes';

const SIMBRIEF_URL = 'https://www.simbrief.com/api/xml.fetcher.php';

/**
 * Simbrief HTTP client
 */
export class SimbriefClient {
  /**
   * Returns a simbrief userid from a username
   *
   * @param username the username
   *
   * @returns the userid
   */
  public static async getSimbriefUserIDFromUsername(username: string): Promise<number> {
    const result = await fetch(`${SIMBRIEF_URL}?json=1&username=${username}`);

    const ofp = await result.json() as SimbriefOfp;

    if (ofp.fetch.status.includes('Unknown UserID')) {
      throw new Error('Invalid SimBrief username');
    }

    return parseInt(ofp.fetch.userid);
  }

  /**
   * Returns the current simbrief ofp
   *
   * @param userId the simbrief userid
   */
  public static async getOfp(userId: number): Promise<SimbriefOfp> {
    const result = await fetch(`${SIMBRIEF_URL}?json=1&userid=${userId}`);

    const ofp = await result.json() as SimbriefOfp;

    if (ofp.fetch.status !== 'Success') {
      throw `Error fetching OFP: ${ofp.fetch.status}`;
    }

    return ofp;
  }
}
