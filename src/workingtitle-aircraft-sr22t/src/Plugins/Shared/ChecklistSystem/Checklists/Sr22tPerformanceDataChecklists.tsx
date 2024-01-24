import { FSComponent } from '@microsoft/msfs-sdk';

import { Sr22tChecklist } from '../Sr22tChecklist';

export enum Sr22tPerformanceDataChecklistNames {
  NONE = 'None'
  // TakeoffDistance3600Lb = 'Takeoff Distance - 3600 LB',
  // TakeoffDistance2900Lb = 'Takeoff Distance - 2900 LB',
  // CruisePerformance = 'Cruise Performance',
  // CruisePerformanceWith45MinuteIceAccumulation = 'Cruise Performance with 45 Minute Ice Accumulation',
  // LandingDistance3600LbFlaps100 = 'Landing Distance - 3600 LB - Flaps 100%',
  // LandingDistance3600LbFlaps50 = 'Landing Distance - 3600 LB - Flaps 50%',
  // LandingDistance3600LbFlaps0 = 'Landing Distance - 3600 LB - Flaps 0%',
  // LandingDistanceWithIceAccumulation = 'Landing Distance - with Ice Accumulation',
}

/** A utility class to generate emergency checklist data. */
export class Sr22tPerformanceDataChecklists {
  /**
   * Generates the emergency checklist data.
   * @returns An array of emergency checklists.
   **/
  public static getChecklists(): Sr22tChecklist[] {
    return [
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.TakeoffDistance3600Lb,
      //   Sr22tChecklistCategory.PerformanceData,
      //   [
      //     {
      //       type: Sr22tChecklistItemType.Text,
      //       text: () => (
      //         <div>
      //           Todo
      //         </div>
      //       )
      //     },
      //   ],
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.TakeoffDistance2900Lb,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.CruisePerformance,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.CruisePerformanceWith45MinuteIceAccumulation,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.LandingDistance3600LbFlaps100,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.LandingDistance3600LbFlaps50,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.LandingDistance3600LbFlaps0,
      //   Sr22tChecklistCategory.PerformanceData,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tPerformanceDataChecklistNames.LandingDistanceWithIceAccumulation,
      //   Sr22tChecklistCategory.PerformanceData,
      //   [],
      //   true
      // ),
    ];
  }
}
