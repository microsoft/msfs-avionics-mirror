import { ApproachPerformanceResults } from '../FMC/PerformanceCalculators/AppraochPerformance/ApproachPerformanceManager';
import { TakeoffPerformanceCalculatorResults } from '../FMC/PerformanceCalculators/TakeoffPerformance/TakeoffPerformanceCalculator';

/**
 * Outputs of TO perf to MFD
 */
export interface WT21MfdToPerfOutputs {
  /** Takeoff weight */
  tow: number | null;

  /** Gross weight */
  gw: number | null;

  /** Takeoff performance calculations */
  calculations: TakeoffPerformanceCalculatorResults | null;
}

/**
 * Outputs of APPR perf to MFD
 */
export interface WT21MfdApprPerfOutputs {
  /** Landing weight */
  lw: number | null;

  /** Gross weight */
  gw: number | null;

  /** Approach performance calculations */
  calculations: ApproachPerformanceResults | null;
}

/**
 * Events on the bus that control the WT21 MFD text pages
 */
export interface WT21MfdTextPageEvents {
  /**
   * Goes to the previous MFD TEXT page, with the data indicating the display unit index
   */
  wt21mfd_text_page_prev: number;

  /**
   * Goes to the next MFD TEXT page, with the data indicating the display unit index.
   */
  wt21mfd_text_page_next: number;

  /**
   * Sets the MFD TEXT page, with the data indicating the display unit index and the page index.
   */
  wt21mfd_text_page_set: [number, WT21MfdTextPage];

  /**
   * Send the takeoff performance output data to the MFD
   */
  wt21mfd_to_perf_outputs: WT21MfdToPerfOutputs;

  /** Send the approach performance output data to the MFD */
  wt21mfd_appr_perf_outputs: WT21MfdApprPerfOutputs;
}

/**
 * Enum containing all possible MFD text pages
 */
export enum WT21MfdTextPage {
  TakeoffRef,
  ApproachRef,
  Progress,
  NavStatus,
  PosSummary,
  PosReport,
  VorStatus,
  GnssStatus,
}