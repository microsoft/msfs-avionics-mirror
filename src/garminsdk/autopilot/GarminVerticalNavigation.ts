import { TodBodDetails } from '@microsoft/msfs-sdk';

/**
 * Glidepath service levels.
 */
export enum GlidepathServiceLevel {
  /** No glidepath. */
  None,

  /** Visual. */
  Visual,

  /** Visual with baro-VNAV. */
  VisualBaro,

  /** LNAV+V. */
  LNavPlusV,

  /** LNAV+V with baro-VNAV. */
  LNavPlusVBaro,

  /** LNAV/VNAV. */
  LNavVNav,

  /** LNAV/VNAV with baro-VNAV. */
  LNavVNavBaro,

  /** LP+V. */
  LpPlusV,

  /** LPV. */
  Lpv,

  /** RNP. */
  Rnp,

  /** RNP with baro-VNAV. */
  RnpBaro,
}

/**
 * Details about the next TOD and BOD for Garmin VNAV.
 */
export interface GarminTodBodDetails extends Omit<TodBodDetails, 'currentConstraintLegIndex'> {
  /** The index of the VNAV constraint defining the BOD altitude, or `-1` if there is no BOD. */
  bodConstraintIndex: number;

  /** The index of the VNAV constraint defining the descent path along which the TOD lies, or `-1` if there is no TOD. */
  todConstraintIndex: number;
}