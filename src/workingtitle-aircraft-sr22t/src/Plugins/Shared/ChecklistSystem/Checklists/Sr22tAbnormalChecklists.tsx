import { FSComponent } from '@microsoft/msfs-sdk';
import { Sr22tChecklist, Sr22tChecklistCategory, Sr22tChecklistItemType } from '../Sr22tChecklist';

export enum Sr22tAbnormalChecklistNames {
  InadvertentImcEncounter = 'Inadvertent IMC Encounter',
  // DoorOpenInFlight = 'Door Open In Flight',
  // LandingWithFailedBrakes = 'Landing With Failed Brakes',
  // LandingWithFlatTire = 'Landing With Flat Tire',
  FlightDisplaysTooDim = 'Flight Displays Too Dim',
  // PitotStaticMalfunction = 'Pitot Static Malfunction',
  // ElectricTrimAPFailure = 'Electric Trim/Autopilot Failure',
  // BrakeFailureDuringTaxi = 'Brake Failure During Taxi',
  // WindshieldDeiceSystemMalfunction = 'Windshield De-Ice System Malfunction',
  AbortedTakeoff = 'Aborted Takeoff',
  // CommunicationsFailure = 'Communications Failure',
  // HeatedLiftTransducerMalfunction = 'Heated Lift Transducer Malfunction',
  // ErroneousOrLossOfAntiIceFluidDisplay = 'Erroneous or Loss of Anti-Ice Fluid Display',
}

/** A utility class to generate abnormal checklist data. */
export class Sr22tAbnormalChecklists {
  /**
   * Generates the abnormal checklist data.
   * @returns An array of abnormal checklists.
   **/
  public static getChecklists(): Sr22tChecklist[] {
    return [
      new Sr22tChecklist(
        Sr22tAbnormalChecklistNames.InadvertentImcEncounter,
        Sr22tChecklistCategory.Abnormal,
        [
          { type: Sr22tChecklistItemType.Checkbox, title: '1. Airplane Control', action: 'ESTABLISH STRAIGHT AND LEVEL\nFLIGHT' },
          { type: Sr22tChecklistItemType.Checkbox, title: '2. Autopilot', action: 'ENGAGE TO HOLD HEADING AND\nALTITUDE' },
          { type: Sr22tChecklistItemType.Checkbox, title: '3. Heading', action: 'RESET TO INITIATE 180 DEGREE\nTURN' },
        ],
      ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.DoorOpenInFlight,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.LandingWithFailedBrakes,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.LandingWithFlatTire,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      new Sr22tChecklist(
        Sr22tAbnormalChecklistNames.FlightDisplaysTooDim,
        Sr22tChecklistCategory.Abnormal,
        [
          { type: Sr22tChecklistItemType.Checkbox, level: 1, title: '1. INSTRUMENT dimmer knob', action: 'OFF (FULL COUNTERCLOCKWISE)' },
          {
            type: Sr22tChecklistItemType.Text,
            text: () => (
              <div class="sr22t-checklist-text single-indent" >
                If flight displays do not provide sufficient brightness:
              </div>
            )
          },
          { type: Sr22tChecklistItemType.Checkbox, level: 1, title: '2. Revert to standby instruments.', action: null },
        ]
      ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.PitotStaticMalfunction,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.ElectricTrimAPFailure,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.BrakeFailureDuringTaxi,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.WindshieldDeiceSystemMalfunction,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      new Sr22tChecklist(
        Sr22tAbnormalChecklistNames.AbortedTakeoff,
        Sr22tChecklistCategory.Abnormal,
        [
          { type: Sr22tChecklistItemType.Checkbox, level: 1, title: '1. Power Lever', action: 'IDLE' },
          { type: Sr22tChecklistItemType.Checkbox, level: 1, title: '2. Barkes', action: 'AS REQUIRED' },
        ]
      ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.CommunicationsFailure,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.HeatedLiftTransducerMalfunction,
      //   Sr22tChecklistCategory.Abnormal,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tAbnormalChecklistNames.ErroneousOrLossOfAntiIceFluidDisplay,
      //   Sr22tChecklistCategory.Abnormal,
      //   [],
      //   true
      // ),
    ];
  }
}

