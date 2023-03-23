import { AdditionalApproachType, BitFlags, GPSSystemState, RnavTypeFlags, Subscribable } from '@microsoft/msfs-sdk';

import { ApproachDetails } from '../flightplan/Fms';
import { GlidepathServiceLevel } from './GarminVerticalNavigation';

/**
 * A calculator for providing the glidepath service level.
 */
export class GlidepathServiceLevelCalculator {

  /**
   * Creates an instance of the GlidepathServiceLevelCalculator.
   * @param allowPlusVWithoutSbas Whether to allow +V approach service levels when no SBAS is present.
   * @param allowApproachBaroVNav Whether to allow approach service levels requiring baro VNAV.
   * @param allowRnpAr Whether to allow RNP (AR) approach service levels.
   * @param gpsSystemState The current GPS system state.
   * @param approachDetails The currently selected approach details.
   */
  constructor(
    private readonly allowPlusVWithoutSbas: boolean,
    private readonly allowApproachBaroVNav: boolean,
    private readonly allowRnpAr: boolean,
    private readonly gpsSystemState: Subscribable<GPSSystemState>,
    private readonly approachDetails: Subscribable<ApproachDetails>
  ) { }

  /**
   * Gets the current glidepath service level from the calculator.
   * @returns The current glidepath service level.
   */
  public getServiceLevel(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.Searching || this.gpsSystemState.get() === GPSSystemState.Acquiring) {
      return GlidepathServiceLevel.None;
    }

    const approachDetails = this.approachDetails.get();

    if (approachDetails.type === AdditionalApproachType.APPROACH_TYPE_VISUAL) {
      return this.handleVisual();
    }

    if (approachDetails.isRnpAr && this.allowRnpAr) {
      return this.handleRnp();
    } else {
      switch (approachDetails.bestRnavType) {
        case RnavTypeFlags.LPV:
          return this.handleLpv();
        case RnavTypeFlags.LP:
          return this.handleLp();
        case RnavTypeFlags.LNAVVNAV:
          return this.handleLnavVnav();
        case RnavTypeFlags.LNAV:
          return this.handleLnav();
        default:
          return GlidepathServiceLevel.None;
      }
    }
  }

  /**
   * Checks a service level to see if baro guidance is required.
   * @param serviceLevel The service level to check.
   * @returns True if baro guidance is required, false otherwise.
   */
  public isBaroServiceLevel(serviceLevel: GlidepathServiceLevel): boolean {
    switch (serviceLevel) {
      case GlidepathServiceLevel.LNavPlusVBaro:
      case GlidepathServiceLevel.LNavVNavBaro:
      case GlidepathServiceLevel.VisualBaro:
      case GlidepathServiceLevel.RnpBaro:
        return true;
      default:
        return false;
    }
  }

  /**
   * Handles when the best RNAV service level type is RNP (AR).
   * @returns The calculated result glidepath service level.
   */
  private handleRnp(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.Rnp;
    } else if (this.gpsSystemState.get() === GPSSystemState.SolutionAcquired) {
      if (this.allowApproachBaroVNav) {
        return GlidepathServiceLevel.RnpBaro;
      }
    }

    return GlidepathServiceLevel.None;
  }

  /**
   * Handles when the best RNAV service level type is LPV.
   * @returns The calculated result glidepath service level.
   */
  private handleLpv(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.Lpv;
    } else if (this.gpsSystemState.get() === GPSSystemState.SolutionAcquired) {
      if (BitFlags.isAny(this.approachDetails.get().rnavTypeFlags, RnavTypeFlags.LNAVVNAV) && this.allowApproachBaroVNav) {
        return GlidepathServiceLevel.LNavVNavBaro;
      }
    }

    return GlidepathServiceLevel.None;
  }

  /**
   * Handles when the best RNAV service level type is LP.
   * @returns The calculated result glidepath service level.
   */
  private handleLp(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.LpPlusV;
    }

    return GlidepathServiceLevel.None;
  }

  /**
   * Handles when the best RNAV service level type is LNAV/VNAV.
   * @returns The calculated result glidepath service level.
   */
  private handleLnavVnav(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.LNavVNav;
    } else if (this.gpsSystemState.get() === GPSSystemState.SolutionAcquired && this.allowApproachBaroVNav) {
      return GlidepathServiceLevel.LNavVNavBaro;
    }

    return GlidepathServiceLevel.None;
  }

  /**
   * Handles when the best RNAV service level type is LNAV.
   * @returns The calculated result glidepath service level.
   */
  private handleLnav(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.LNavPlusV;
    } else if (this.gpsSystemState.get() === GPSSystemState.SolutionAcquired) {
      if (this.allowPlusVWithoutSbas) {
        return GlidepathServiceLevel.LNavPlusV;
      }

      if (this.allowApproachBaroVNav) {
        return GlidepathServiceLevel.LNavPlusVBaro;
      }
    }

    return GlidepathServiceLevel.None;
  }

  /**
   * Handles when the best RNAV service level type is Visual.
   * @returns The calculated result glidepath service level.
   */
  private handleVisual(): GlidepathServiceLevel {
    if (this.gpsSystemState.get() === GPSSystemState.DiffSolutionAcquired) {
      return GlidepathServiceLevel.Visual;
    } else if (this.gpsSystemState.get() === GPSSystemState.SolutionAcquired) {
      if (this.allowPlusVWithoutSbas) {
        return GlidepathServiceLevel.Visual;
      }

      if (this.allowApproachBaroVNav) {
        return GlidepathServiceLevel.VisualBaro;
      }
    }

    return GlidepathServiceLevel.None;
  }
}