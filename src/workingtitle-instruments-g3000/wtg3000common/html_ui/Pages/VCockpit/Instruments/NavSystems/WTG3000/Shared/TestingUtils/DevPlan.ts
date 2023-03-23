import { Fms } from '@microsoft/msfs-garminsdk';
import { Wait } from '@microsoft/msfs-sdk';
import { TestingUtils } from './TestingUtils';

/**
 * A testing class for creating dev flight plans.
 */
export class DevPlan {
  /**
   * Temp code to setup a dev flight plan for testing.
   * @param fms The fms instance to use.
   */
  public static async setupDevPlan(fms: Fms): Promise<void> {
    // await Wait.awaitDelay(2000);

    // const origin = await TestingUtils.setOrigin(fms, 'KDEN');

    // await Wait.awaitDelay(2000);

    // await TestingUtils.setOriginRunway(fms, origin, '34L');

    // await Wait.awaitDelay(2000);

    // await TestingUtils.loadDeparture(fms, origin, 'BAYLR6', '34L', 'HBU');

    // await Wait.awaitDelay(2000);

    // await TestingUtils.insertWaypoint(fms, 'ALADN', 1);

    // await Wait.awaitDelay(2000);

    // await TestingUtils.insertWaypoint(fms, 'GENIE', 1);

    // await Wait.awaitDelay(2000);

    // await TestingUtils.insertWaypoint(fms, 'JAFAR', 1);

    // await Wait.awaitDelay(2000);

    // await TestingUtils.insertWaypoint(fms, 'ALADN', 1, 1);

    // await Wait.awaitDelay(2000);

    // await TestingUtils.insertAirway(fms, 'V159', 'ALADN', 'MAMBO', 1, 1);

    await Wait.awaitDelay(2000);

    const destination = await TestingUtils.setDestination(fms, 'KCOS');

    // await Wait.awaitDelay(2000);

    // fms.activateLeg(0, 1);

    // await Wait.awaitDelay(2000);

    // fms.activateLeg(0, 2);

    // await Wait.awaitDelay(2000);

    // await TestingUtils.loadArrival(fms, destination, 'DBRY4', 'ALS');

    await Wait.awaitDelay(2000);

    await TestingUtils.loadApproach(fms, destination, 'ILS 17L', 'ADANE');

    // await Wait.awaitDelay(2000);

    // await TestingUtils.removeOrigin(fms);

    // await Wait.awaitDelay(2000);

    // Direct to AWONE
    // fms.createDirectToExisting(3, 2);

    // await Wait.awaitDelay(2000);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // console.log(fms.getPrimaryFlightPlan().planSegments);
  }
}