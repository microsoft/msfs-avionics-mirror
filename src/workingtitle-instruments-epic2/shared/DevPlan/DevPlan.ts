import { SimVarValueType, Wait } from '@microsoft/msfs-sdk';

import { Epic2Fms } from '../Fms';
import { DevPlanUtils } from './DevPlanUtils';

/**
 * A testing class for creating dev flight plans.
 */
export class DevPlan {
  /**
   * Temp code to setup a dev flight plan for testing.
   * @param fms The fms instance to use.
   */
  public static async setupDevPlan(fms: Epic2Fms): Promise<void> {
    const latitude = SimVar.GetSimVarValue('PLANE LATITUDE', SimVarValueType.Degree);

    if (latitude < 0) {
      return DevPlan.setupNzchNznv(fms);
    }

    return DevPlan.setupKdenKcos(fms);
  }

  /**
   * Setup a Denver to Colorado dev plan.
   * @param fms The fms instance to use.
   */
  protected static async setupKdenKcos(fms: Epic2Fms): Promise<void> {
    await Wait.awaitDelay(1000);

    const origin = await DevPlanUtils.setOrigin(fms, 'KDEN');

    await Wait.awaitDelay(1000);

    const destination = await DevPlanUtils.setDestination(fms, 'KCOS');

    // await Wait.awaitDelay(1000);

    // fms.activate(1);

    // await Wait.awaitDelay(1000);

    // fms.execute();

    await Wait.awaitDelay(1000);

    await DevPlanUtils.setOriginRunway(fms, origin, '34L');

    await Wait.awaitDelay(1000);

    await DevPlanUtils.loadDeparture(fms, origin, 'BAYLR6', '34L', 'HBU');

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.insertWaypoint(fms, 'ALADN', 1);

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.insertWaypoint(fms, 'GENIE', 1);

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.insertWaypoint(fms, 'JAFAR', 1);

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.insertWaypoint(fms, 'ALADN', 1, 1);

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.insertAirway(fms, 'V159', 'ALADN', 'MAMBO', 1, 1);

    // await Wait.awaitDelay(1000);

    // fms.activateLeg(0, 1);

    // await Wait.awaitDelay(1000);

    // fms.activateLeg(0, 2);

    await Wait.awaitDelay(1000);

    await DevPlanUtils.loadArrival(fms, destination, 'DBRY5', 'ALS');

    await Wait.awaitDelay(1000);

    await DevPlanUtils.loadApproach(fms, destination, 'ILS 17L', 'ADANE');

    // await Wait.awaitDelay(1000);

    // fms.execute();

    // await Wait.awaitDelay(1000);

    // await DevPlanUtils.removeOrigin(fms);

    // await Wait.awaitDelay(1000);

    // Direct to AWONE
    // fms.createDirectToExisting(3, 2);

    // await Wait.awaitDelay(1000);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // console.log(fms.getPrimaryFlightPlan().planSegments);

    await Wait.awaitDelay(1000);

    fms.activatePlan();
  }

  /**
   * Setup a Christchurch RW20 to Invercargill RW22 dev plan.
   * ATSAT1Q IDARA CHNV3 DUKOP DUKOP6B
   * @param fms The fms instance to use.
   */
  protected static async setupNzchNznv(fms: Epic2Fms): Promise<void> {
    await Wait.awaitDelay(1000);

    const origin = await DevPlanUtils.setOrigin(fms, 'NZCH');

    await Wait.awaitDelay(1000);

    const destination = await DevPlanUtils.setDestination(fms, 'NZNV');

    await Wait.awaitDelay(1000);

    DevPlanUtils.setOriginRunway(fms, origin, '20');

    await Wait.awaitDelay(1000);

    DevPlanUtils.loadDeparture(fms, origin, 'ATSA1Q', '20', 'IDARA');

    await Wait.awaitDelay(1000);

    await DevPlanUtils.insertAirway(fms, 'Y676', 'IDARA', 'DUKOP', 1, 1);

    await Wait.awaitDelay(1000);

    DevPlanUtils.loadArrival(fms, destination, 'DUKO6B');

    await Wait.awaitDelay(1000);

    await DevPlanUtils.loadApproach(fms, destination, 'RNAV 22');

    await Wait.awaitDelay(1000);

    fms.activatePlan();
  }
}
