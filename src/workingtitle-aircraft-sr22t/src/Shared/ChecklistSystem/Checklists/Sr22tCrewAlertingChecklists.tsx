/* eslint-disable max-len */
import { FSComponent } from '@microsoft/msfs-sdk';

import { Sr22tChecklist } from '../Sr22tChecklist';

export enum Sr22tCrewAlertingChecklistNames {
  NONE = 'None'
  // CasDescription = 'CAS Description',
  // OilPressWarning = 'OIL PRESS Warning',
  // OilTempWarning = 'OIL TEMP Warning',
  // ChtCautionAndWarning = 'CHT Caution and Warning',
  // ManPressureWarning = 'MAN PRESSURE Warning',
  // TitWarning = 'TIT Warning',
  // RpmWarning = 'RPM Warning',
  // FuelQtyWarning = 'FUEL QTY Warning',
  // FuelImbalanceWarning = 'Fuel Imbalance Warning',
  // MBus1Warning = 'M BUS 1 Warning',
  // MBus2Warning = 'M BUS 2 Warning',
  // EssBusWarning = 'ESS BUS Warning',
  // CoLvlHighWarning = 'CO LVL HIGH Warning',
  // OxygenFaultWarning = 'OXYGEN FAULT Warning',
  // OxygenQtyWarning = 'OXYGEN QTY Warning',
  // BrakeTempWarning = 'BRAKE TEMP Warning',
  // StarterEngagedWarning = 'STARTER ENGAGED Warning',
  // AutoDescentWarning = 'AUTO DESCENT Warning',
  // UnderspeedProtectActiveWarning = 'UNDERSPEED PROTECT ACTIVE Warning',
  // AntiIceFloWarning = 'ANTI ICE FLO Warning',
  // AntiIceCtlWarning = 'ANTI ICE CTL Warning',
  // AntiIceQtyCautionAndWarning = 'ANTI ICE QTY Caution and Warning',
  // AoaOverheatCautionAndWarning = 'AOA OVERHEAT Caution and Warning',
  // OilPressCaution = 'OIL PRESS Caution',
  // ManPressureCaution = 'MAN PRESSURE Caution',
  // StarterEngagedCaution = 'STARTER ENGAGED Caution',
  // AltAirOpenCaution = 'ALT AIR OPEN Caution',
  // FuelQtyCaution = 'FUEL QTY Caution',
  // FuelImbalanceCaution = 'FUEL IMBALANCE Caution',
  // MBus1Caution = 'M BUS 1 Caution',
  // MBus2Caution = 'M BUS 2 Caution',
  // Batt1Caution = 'BATT 1 Caution',
  // Alt1Caution = 'ALT 1 Caution',
  // Alt2Caution = 'ALT 2 Caution',
  // AvionicsOffCaution = 'AVIONICS OFF Caution',
  // PitotHeatFailCaution = 'PITOT HEAT FAIL Caution',
  // PitotHeatRequiredCaution = 'PITOT HEAT REQUIRED Caution',
  // FlapsCaution = 'FLAPS Caution',
  // BrakeTempCaution = 'BRAKE TEMP Caution',
  // OxygenQtyCaution = 'OXYGEN QTY Caution',
  // OxygenRqdCaution = 'OXYGEN RQD Caution',
  // ParkBrakeCaution = 'PARK BRAKE Caution',
  // AntiIcePsiCaution = 'ANTI ICE PSI Caution',
  // AntiIceSpdCaution = 'ANTI ICE SPD Caution',
  // AntiIceLvlCaution = 'ANTI ICE LVL Caution',
  // AntiIceHtrCaution = 'ANTI ICE HTR Caution',
  // AoaFailAdvisory = 'AOA FAIL Advisory',
  // AltMiscompCaution = 'ALT MISCOMP Caution',
  // IasMiscompCaution = 'IAS MISCOMP Caution',
  // HdgMiscompCaution = 'HDG MISCOMP Caution',
  // PitMiscompCaution = 'PIT MISCOMP Caution',
  // RollMiscompCaution = 'ROLL MISCOMP Caution',
  // ApMiscompCaution = 'AP MISCOMP Caution',
  // ApPfdAhrsCaution = 'AP/PFD AHRS Caution',
  // NoAdcModesCaution = 'NO ADC MODES Caution',
  // NoVertModesCaution = 'NO VERT MODES Caution',
  // HypoxiaAlertCaution = 'HYPOXIA ALERT Caution',
}

/** A utility class to generate crew alerting checklist data. */
export class Sr22tCrewAlertingChecklists {
  /**
   * Generates the crew alerting checklist data.
   * @returns An array of crew alerting checklists.
   **/
  public static getChecklists(): Sr22tChecklist[] {
    return [
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.CasDescription,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   [
      //     {
      //       type: Sr22tChecklistItemType.Text,
      //       text: () => (
      //         <div class="sr22t-checklist-text">
      //           Aircraft annunciations and alerts are displayed in the Crew Alerting System (CAS) window located to the right of the altimeter and VSI. Aircraft annunciations are
      //           grouped by criticality and sorted by order of appearance with the most recent message on top. The color of the message text is based on its urgency and required
      //           action:
      //         </div>
      //       )
      //     },
      //   ],
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OilPressWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OilTempWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ChtCautionAndWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ManPressureWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.TitWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.RpmWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.FuelQtyWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.FuelImbalanceWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.MBus1Warning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.MBus2Warning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.EssBusWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.CoLvlHighWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OxygenFaultWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OxygenQtyWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.BrakeTempWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.StarterEngagedWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AutoDescentWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.UnderspeedProtectActiveWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceFloWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceCtlWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceQtyCautionAndWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AoaOverheatCautionAndWarning,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OilPressCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ManPressureCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.StarterEngagedCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AltAirOpenCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.FuelQtyCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.FuelImbalanceCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.MBus1Caution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.MBus2Caution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.Batt1Caution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.Alt1Caution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.Alt2Caution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AvionicsOffCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.PitotHeatFailCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.PitotHeatRequiredCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.FlapsCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.BrakeTempCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OxygenQtyCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.OxygenRqdCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ParkBrakeCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIcePsiCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceSpdCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceLvlCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AntiIceHtrCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AoaFailAdvisory,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.AltMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.IasMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.HdgMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.PitMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.RollMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ApMiscompCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.ApPfdAhrsCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.NoAdcModesCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.NoVertModesCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   []
      // ),
      // new Sr22tChecklist(
      //   Sr22tCrewAlertingChecklistNames.HypoxiaAlertCaution,
      //   Sr22tChecklistCategory.CrewAlerting,
      //   [],
      //   true
      // ),
    ];
  }
}
