import {
  EventBus, FacilityType, FlightPlan, FlightPlanPredictorUtils, ICAO, MappedSubject, UnitType, VNavDataEvents,
  VNavEvents, VNavUtils,
} from '@microsoft/msfs-sdk';

import { Fms, ObsSuspModes } from '@microsoft/msfs-garminsdk';

import { GnsVnavEvents, GnsVnavStatusType } from './GnsVnavEvents';
import { GnsVnavRefMode, GnsVnavSettingsManager, GnsVnavTargetAltitudeMode } from './GnsVnavSettings';
import { GnsVnavStore } from './GnsVnavStore';
import { GnsVnavUtils } from './GnsVnavUtils';
import { AlertMessageEvents } from '../../UI/Pages/Dialogs/AlertsSubject';

const GNS_VNAV_MIN_GS = 35;
const GNS_VNAV_MAX_ABS_VSR = 9_999;
const GNS_VNAV_MIN_ABS_VSR = 100;
const GNS_VNAV_MAX_VS_FOR_LEVEL_FLIGHT = 100;
const GNS_VNAV_ALTITUDE_MIN_VS_FOR_DESCENT = 250;

/**
 * Controller for GNS VNAV
 */
export class GnsVnavController {
  private readonly cachedIcaoElevations = new Map<string, number | undefined>();

  private readonly gnsVnavSettings = GnsVnavSettingsManager.getManager(this.bus);

  private readonly store = new GnsVnavStore(this.bus, this.fms.lnavIndex);

  private readonly publisher = this.bus.getPublisher<GnsVnavEvents & VNavEvents & VNavDataEvents>();

  private readonly targetAltitudeSetting = this.gnsVnavSettings.getSetting('target_altitude');
  private readonly targetAltitudeModeSetting = this.gnsVnavSettings.getSetting('target_altitude_mode');
  private readonly refDistanceSetting = this.gnsVnavSettings.getSetting('ref_distance');
  private readonly refModeSetting = this.gnsVnavSettings.getSetting('ref_mode');
  private readonly refLegIndexSetting = this.gnsVnavSettings.getSetting('ref_leg_index');
  private readonly profileVSSetting = this.gnsVnavSettings.getSetting('profile_vs');
  private readonly messagesEnabledSetting = this.gnsVnavSettings.getSetting('messages_on');

  /**
   * Ctor
   * @param bus the event bus
   * @param fms the fms
   */
  constructor(
    private readonly bus: EventBus,
    private readonly fms: Fms,
  ) {
    fms.flightPlanner.onEvent('fplCopied').handle((evt) => {
      if (evt.targetPlanIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    fms.flightPlanner.onEvent('fplLegChange').handle((evt) => {
      if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    fms.flightPlanner.onEvent('fplActiveLegChange').handle((evt) => {
      if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    fms.flightPlanner.onEvent('fplLoaded').handle((evt) => {
      if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    fms.flightPlanner.onEvent('fplCreated').handle((evt) => {
      if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    fms.flightPlanner.onEvent('fplDeleted').handle((evt) => {
      if (evt.planIndex === Fms.PRIMARY_PLAN_INDEX) {
        this.publishAvailableRefLegs();
      }
    });

    // Disable message inhibit when any settings are changed
    MappedSubject.create(
      this.targetAltitudeSetting,
      this.targetAltitudeModeSetting,
      this.refDistanceSetting,
      this.refModeSetting,
      this.refLegIndexSetting,
      this.profileVSSetting,
    ).sub(() => {
      this.store.approachingProfileMessageInhibited.set(false);
      this.store.approachingTargetAltitudeMessageInhibited.set(false);
    });
  }

  /**
   * Publishes the currently available ref legs
   */
  private publishAvailableRefLegs(): void {
    const availableRefLegs = GnsVnavUtils.getAvailableRefLegs(this.refFlightPlan);

    this.publisher.pub('gnsvnav_available_ref_legs', availableRefLegs);
  }

  /**
   * Get the primary flight plan
   *
   * @returns a flight plan
   */
  private get refFlightPlan(): FlightPlan {
    return this.fms.getPrimaryFlightPlan();
  }

  /**
   * Update loop
   */
  public async update(): Promise<void> {
    // Check if all our input data is valid

    const canCalculate = this.isDataValidForCalculation();

    if (!canCalculate) {
      this.publishDataInvalid();
      return;
    }

    this.publisher.pub('gnsvnav_has_input_data', true);

    const refLegIndex = this.refLegIndexSetting.get();
    let targetAltitudeMode = this.targetAltitudeModeSetting.get();
    const targetAltitude = this.targetAltitudeSetting.get();
    let refMode = this.refModeSetting.get();

    const targetLegValid = GnsVnavUtils.isLegValidAsVnavTarget(
      refLegIndex,
      targetAltitudeMode,
      this.refFlightPlan,
    );

    if (!targetLegValid) {
      this.publishDataInvalid();
      return;
    }

    // Check if the selected leg supports AGL, and if not, reset setting to MSL

    const targetLegSupportsAgl = targetLegValid && GnsVnavUtils.isLegFixAirport(refLegIndex, this.refFlightPlan);

    if (targetLegSupportsAgl) {
      this.publisher.pub('gnsvnav_agl_available', true);
    } else {
      this.publisher.pub('gnsvnav_agl_available', false);

      if (targetAltitudeMode === GnsVnavTargetAltitudeMode.Agl) {
        targetAltitudeMode = GnsVnavTargetAltitudeMode.Msl;

        this.targetAltitudeModeSetting.set(GnsVnavTargetAltitudeMode.Msl);
      }
    }

    // Check what ref modes we support for this leg, and if the current setting conflicts, set it correctly

    const targetLegMandatoryRefMode = GnsVnavUtils.getLegRefModeConstraint(refLegIndex, this.refFlightPlan);

    if (targetLegMandatoryRefMode !== null) {
      this.publisher.pub('gnsvnav_forced_ref_mode', targetLegMandatoryRefMode);

      if (targetLegMandatoryRefMode !== refMode) {
        this.refModeSetting.set(targetLegMandatoryRefMode);

        refMode = targetLegMandatoryRefMode;
      }
    } else {
      this.publisher.pub('gnsvnav_forced_ref_mode', null);
    }

    // Check if we are in a correct state for VNAV to be calculated

    const conditionsMet = this.areConditionsMeantForVnav();

    if (!conditionsMet) {
      this.publishConditionsNotMet();
      return;
    }

    // Get the final distance from the ref waypoint, considering the ref distance and mode
    const distance = this.getDistanceFromRefInfo(this.refDistanceSetting.get(), refMode, refLegIndex);

    if (distance <= 0) {
      this.publishDataInvalid();
      return;
    }

    const finalTargetAltitudeFeet = await this.getFinalTargetAltitude(targetAltitude, targetAltitudeMode, refLegIndex);

    let currentAltitude = this.store.currentAltitude.get();
    const currentAltitudeRaw = currentAltitude;

    // To avoid large and quick jumps in VSR/time-to-descent, we round the current altitude - to the nearest 10 feet if level,
    // and to the nearest 100 feet otherwise.
    if (this.isLevel()) {
      currentAltitude = Math.round(currentAltitude / 10) * 10;
    } else {
      currentAltitude = Math.round(currentAltitude / 100) * 100;
    }

    let groundSpeed = Math.max(GNS_VNAV_MIN_GS, this.store.groundSpeed.get());
    groundSpeed = Math.round(groundSpeed / 2) * 2;

    // Compute VSR
    const vsr = VNavUtils.getRequiredVs(distance, finalTargetAltitudeFeet, currentAltitude, groundSpeed);

    if (Number.isFinite(vsr)) {
      const absVsr = Math.abs(vsr);

      if (absVsr >= GNS_VNAV_MIN_ABS_VSR && absVsr <= GNS_VNAV_MAX_ABS_VSR) {
        this.publisher.pub('vnav_path_display', true);
        this.publisher.pub('gnsvnav_vsr', vsr);
        this.publisher.pub('vnav_required_vs', vsr);
      } else {
        this.publishConditionsNotMet();
        return;
      }
    } else {
      // Garbage VSR computed
      this.publishDataInvalid();
    }

    // Compute VNAV predictions

    const profileVsSettingValue = this.profileVSSetting.get();
    const profileVs = profileVsSettingValue > 0 ? -profileVsSettingValue : profileVsSettingValue;

    const altitudeChange = targetAltitude - currentAltitude;
    const altitudeChangeRaw = targetAltitude - currentAltitudeRaw;

    const feetRemainingToDescend = altitudeChangeRaw < 0 ? -altitudeChangeRaw : 0;

    // Publish "Approaching Target Altitude" message if needed
    if (this.isDescending() && feetRemainingToDescend > 460 && feetRemainingToDescend < 500) {
      this.publishApproachingTargetAlt();
    }

    const fpa = VNavUtils.getFpaFromVerticalSpeed(profileVs, groundSpeed);
    const distanceToDescendFT = VNavUtils.distanceForAltitude(fpa, altitudeChange);
    const distanceToDescendNM = UnitType.NMILE.convertFrom(distanceToDescendFT, UnitType.FOOT);
    const distanceUntilStartDescending = Math.max(0, distance - distanceToDescendNM);
    const time = FlightPlanPredictorUtils.predictTime(groundSpeed, distanceUntilStartDescending);

    if (Number.isFinite(time)) {
      if (time > 0 && altitudeChange < 0) { // The GNS VNAV never predicts a climb
        // The "Descend to Target" message is shown at exactly one minute from the scheduled descent
        if (time > 60) {
          this.publishDescendIn(time);
        } else {
          this.publishDescendToTarget();
        }
      } else {
        this.publishNullStatus();
      }
    } else {
      // Garbage TTD computed
      this.publishNullStatus();
    }
  }

  /**
   * Publish events to signal that VNAV cannot be computed (requirements not met)
   */
  private publishConditionsNotMet(): void {
    this.publisher.pub('gnsvnav_has_input_data', true);
    this.publisher.pub('vnav_path_display', false);
    this.publisher.pub('gnsvnav_vsr', Number.MAX_SAFE_INTEGER);
    this.publisher.pub('vnav_required_vs', 0);
    this.publisher.pub('gnsvnav_status', [GnsVnavStatusType.None, -1]);
    return;
  }

  /**
   * Publish events to signal that VNAV was not computed (no FPLN, too big VSR, negative distance, invalid values)
   */
  private publishDataInvalid(): void {
    this.publisher.pub('gnsvnav_has_input_data', false);
    this.publisher.pub('vnav_path_display', false);
    this.publisher.pub('gnsvnav_vsr', Number.MAX_SAFE_INTEGER);
    this.publisher.pub('vnav_required_vs', 0);
    this.publisher.pub('gnsvnav_status', [GnsVnavStatusType.None, -1]);
    return;
  }

  /**
   * Publish events to signal approaching the target altitude
   */
  private publishApproachingTargetAlt(): void {
    const messagesEnabled = this.messagesEnabledSetting.get();
    const messageInhibited = this.store.approachingTargetAltitudeMessageInhibited.get();

    if (messagesEnabled && !messageInhibited) {
      this.bus.getPublisher<AlertMessageEvents>().pub('alerts_push', {
        key: 'vnav-approaching-target-alt',
        message: 'Approaching Target Altitude',
      });

      this.store.approachingTargetAltitudeMessageInhibited.set(true);
    }
  }

  /**
   * Publish events to signal a descent to target in some time
   * @param time the time value
   */
  private publishDescendIn(time: number): void {
    this.publisher.pub('gnsvnav_status', [GnsVnavStatusType.BeginDescentIn, time]);
  }

  /**
   * Publish events to signal a descent to target
   */
  private publishDescendToTarget(): void {
    this.publisher.pub('gnsvnav_status', [GnsVnavStatusType.DescendToTarget, -1]);

    const messagesEnabled = this.messagesEnabledSetting.get();
    const messageInhibited = this.store.approachingProfileMessageInhibited.get();

    if (messagesEnabled && !messageInhibited) {
      this.bus.getPublisher<AlertMessageEvents>().pub('alerts_push', {
        key: 'vnav-approaching-profile',
        message: 'Approaching VNAV Profile'
      });

      this.store.approachingProfileMessageInhibited.set(true);
    }
  }

  /**
   * Publish events to signal a null VNAV status
   */
  private publishNullStatus(): void {
    this.publisher.pub('gnsvnav_status', [GnsVnavStatusType.None, -1]);
  }

  /**
   * Returns the current vertical speed to use
   *
   * @returns a number
   */
  private getVerticalSpeed(): number {
    return this.store.currentVerticalSpeed.get();
  }

  /**
   * Return whether the plane is currently considered to be descending
   *
   * @returns a boolean
   */
  private isDescending(): boolean {
    return this.getVerticalSpeed() < -GNS_VNAV_ALTITUDE_MIN_VS_FOR_DESCENT;
  }

  /**
   * Return whether the plane is currently considered to be in level flight
   *
   * @returns a boolean
   */
  private isLevel(): boolean {
    return Math.abs(this.getVerticalSpeed()) < GNS_VNAV_MAX_VS_FOR_LEVEL_FLIGHT;
  }

  /**
   * Determines whether VNAV calculations can take place
   *
   * @returns a boolean
   */
  private isDataValidForCalculation(): boolean {
    const targetAltitude = this.targetAltitudeSetting.get();

    if (targetAltitude < 0) {
      return false;
    }

    const refDistance = this.refDistanceSetting.get();

    if (refDistance < 0) {
      return false;
    }

    const refLegIndex = this.refLegIndexSetting.get();

    if (refLegIndex < 0) {
      return false;
    }

    const hasPrimaryFlightPlan = this.fms.hasPrimaryFlightPlan();

    if (!hasPrimaryFlightPlan) {
      return false;
    }

    const refPlanLegCount = this.refFlightPlan.length;

    if (refLegIndex >= refPlanLegCount) {
      return false;
    }

    const refPlanLegDef = this.refFlightPlan.tryGetLeg(refLegIndex);

    if (!refPlanLegDef || !refPlanLegDef.calculated) {
      return false;
    }

    return true;
  }

  /**
   * Determines whether VNAV can be used
   *
   * @returns a boolean
   */
  private areConditionsMeantForVnav(): boolean {
    const groundSpeed = this.store.groundSpeed.get();

    if (groundSpeed <= GNS_VNAV_MIN_GS) {
      return false;
    }

    const suspModeActive = this.store.obsSuspMode.get() === ObsSuspModes.SUSP;

    if (suspModeActive) {
      return false;
    }

    return true;
  }

  /**
   * Computes the final target altitude at the VNAV target
   *
   * @param targetAltitude     the target altitude
   * @param targetAltitudeMode the target altitude mode
   * @param refLegIndex        the leg index the reference waypoint is at
   * @returns the final target altitude, in feet
   */
  private async getFinalTargetAltitude(
    targetAltitude: number,
    targetAltitudeMode: GnsVnavTargetAltitudeMode,
    refLegIndex: number
  ): Promise<number> {
    let finalTargetAltitudeFeet;
    switch (targetAltitudeMode) {
      case GnsVnavTargetAltitudeMode.Msl:
        finalTargetAltitudeFeet = targetAltitude;
        break;
      case GnsVnavTargetAltitudeMode.Agl: {
        const elevation = await this.getAirportLegWaypointAltitude(refLegIndex);

        finalTargetAltitudeFeet = elevation + targetAltitude;
      }
    }

    return finalTargetAltitudeFeet;
  }

  /**
   * Computes distance from present position to VNAV target
   *
   * @param refDistance     the reference distance entry, in metres
   * @param refDistanceMode the reference mode (before or after)
   * @param refLegIndex     the leg index the reference waypoint is at
   *
   * @returns the distance from PPOS
   */
  private getDistanceFromRefInfo(
    refDistance: number,
    refDistanceMode: GnsVnavRefMode,
    refLegIndex: number,
  ): number {
    const refFlightPlan = this.refFlightPlan;

    let distanceToWaypoint;
    if (refLegIndex > refFlightPlan.activeLateralLeg) {
      // Ref leg is a next leg

      const activeLegCumulativeDistance = GnsVnavUtils.getLegWaypointCumulativeDistance(refFlightPlan.activeLateralLeg, refFlightPlan);
      const refLegCumulativeDistance = GnsVnavUtils.getLegWaypointCumulativeDistance(refLegIndex, refFlightPlan);

      const distanceBetweenLegsMetres = refLegCumulativeDistance - activeLegCumulativeDistance;
      const distanceBetweenLegsNM = UnitType.NMILE.convertFrom(distanceBetweenLegsMetres, UnitType.METER);

      const distanceAlongActiveLeg = this.store.distanceAlongActiveLeg.get();

      const activeLegLengthMetres = GnsVnavUtils.getLegWaypointDistance(refFlightPlan.activeLateralLeg, refFlightPlan);
      const activeLegLengthNM = UnitType.NMILE.convertFrom(activeLegLengthMetres, UnitType.METER);

      distanceToWaypoint = distanceBetweenLegsNM + (activeLegLengthNM - distanceAlongActiveLeg);
    } else if (refLegIndex === refFlightPlan.activeLateralLeg) {
      // Ref leg is TO leg

      const activeLegLengthMetres = GnsVnavUtils.getLegWaypointDistance(refFlightPlan.activeLateralLeg, refFlightPlan);
      const activeLegLengthNM = UnitType.NMILE.convertFrom(activeLegLengthMetres, UnitType.METER);

      const distanceAlongActiveLeg = this.store.distanceAlongActiveLeg.get();

      distanceToWaypoint = activeLegLengthNM - distanceAlongActiveLeg;
    } else if (refLegIndex === refFlightPlan.activeLateralLeg - 1) {
      // Ref leg is FROM leg

      const distanceAlongActiveLeg = this.store.distanceAlongActiveLeg.get();

      distanceToWaypoint = -distanceAlongActiveLeg;
    } else {
      // Ref leg is a previous leg

      if (refFlightPlan.activeLateralLeg > 0) {
        const fromLegCumulativeDistance = GnsVnavUtils.getLegWaypointCumulativeDistance(refFlightPlan.activeLateralLeg - 1, refFlightPlan);
        const refLegCumulativeDistance = GnsVnavUtils.getLegWaypointCumulativeDistance(refLegIndex, refFlightPlan);

        const distanceBetweenLegsMetres = fromLegCumulativeDistance - refLegCumulativeDistance;
        const distanceBetweenLegsNM = UnitType.NMILE.convertFrom(distanceBetweenLegsMetres, UnitType.METER);

        const distanceAlongActiveLeg = this.store.distanceAlongActiveLeg.get();

        distanceToWaypoint = -distanceAlongActiveLeg - distanceBetweenLegsNM;
      } else {
        return 0;
      }
    }

    const finalDistance = distanceToWaypoint + (refDistanceMode === GnsVnavRefMode.Before ? -refDistance : refDistance);

    return Math.max(0, finalDistance);
  }

  /**
   * Gets the elevation of a leg (whose `fixIcao` is of an airport) along a flight plan at a leg index
   *
   * @param legIndex the leg index
   *
   * @returns the elevation (0 if it cannot be found), in feet
   */
  private async getAirportLegWaypointAltitude(legIndex: number): Promise<number> {
    const leg = this.refFlightPlan.getLeg(legIndex);

    const legFixIcao = leg.leg.fixIcao;

    if (this.cachedIcaoElevations.has(legFixIcao)) {
      return this.cachedIcaoElevations.get(legFixIcao) ?? 0;
    }

    const legFixFacilityType = ICAO.getFacilityType(legFixIcao);
    const legFixIsAirport = legFixFacilityType === FacilityType.Airport;

    if (!legFixIsAirport) {
      throw new Error('GNS VNAV: Can only get altitude on an airport');
    }

    const airportFacility = await this.fms.facLoader.getFacility(legFixFacilityType, legFixIcao);

    const elevationFeet = UnitType.FOOT.convertFrom(airportFacility.altitude, UnitType.METER);

    this.cachedIcaoElevations.set(legFixIcao, elevationFeet);

    return elevationFeet;
  }

}
