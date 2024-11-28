import {
  BitFlags, FacilityUtils, FixTypeFlags, FlightPlan, FlightPlanLeg, FlightPlanUtils, ICAO, IcaoValue, LegTurnDirection,
  LegType, NavMath, UnitType
} from '@microsoft/msfs-sdk';

import { Fms } from '@microsoft/msfs-garminsdk';

import { HoldCourseDirection, HoldInfo, HoldLegMode, HoldStore } from './HoldStore';

/** A controller for the GtcHoldPage. */
export class HoldController {
  /**
   * Creates an instance of a HoldController.
   * @param store The hold store to use with this instance.
   * @param fms The FMS to use with this instance.
   */
  constructor(private readonly store: HoldStore, private readonly fms: Fms) {
    store.input.sub(async input => {
      if (!input) { return; }

      try {
        const plan = this.fms.hasFlightPlan(input.planIndex) && this.fms.getFlightPlan(input.planIndex);

        const existingHoldLeg = input.existingHoldLeg;
        if (plan && existingHoldLeg) {
          this.store.isExistingHold.set(true);
          this.store.isCancelButtonEnabled.set(true);
          this.store.holdLeg.set(existingHoldLeg);
          this.store.isEditableHold.set(
            input.forceAllowEdit === true
            || (
              existingHoldLeg.leg.type === LegType.HM
              && !BitFlags.isAny(plan.tryGetLeg(plan.getLegIndexFromLeg(existingHoldLeg) - 1)?.leg.fixTypeFlags ?? 0, FixTypeFlags.MAHP)
            )
          );

          const isTime = existingHoldLeg.leg.distanceMinutes;

          this.store.holdCourseDirection.set(HoldCourseDirection.Inbound);
          this.store.turnDirection.set(existingHoldLeg.leg.turnDirection === LegTurnDirection.Left ? LegTurnDirection.Left : LegTurnDirection.Right);
          const magVar = FacilityUtils.getMagVar(input.facility);
          this.store.course.set(existingHoldLeg.leg.course, magVar);
          this.store.legMode.set(isTime ? HoldLegMode.Time : HoldLegMode.Distance);
          if (isTime) {
            this.store.legTime.set(existingHoldLeg.leg.distance, UnitType.MINUTE);
          } else {
            this.store.legDistance.set(existingHoldLeg.leg.distance, UnitType.METER);
          }
        } else {
          this.store.isExistingHold.set(false);
          this.store.holdLeg.set(null);
          this.store.isEditableHold.set(true);

          this.store.holdCourseDirection.set(HoldCourseDirection.Inbound);

          const magVar = FacilityUtils.getMagVar(input.facility);
          this.store.course.set(input.courseMagnetic, magVar);
        }

        // If holdInfo was passed in, load it into the store.
        if (input.holdInfo) {
          this.store.isCancelButtonEnabled.set(true);
          this.store.holdCourseDirection.set(input.holdInfo.holdCourseDirection);
          this.store.course.set(input.holdInfo.course);
          this.store.legDistance.set(input.holdInfo.legDistance.isNaN() ? UnitType.NMILE.createNumber(4) : input.holdInfo.legDistance);
          this.store.legTime.set(input.holdInfo.legTime.isNaN() ? UnitType.SECOND.createNumber(90) : input.holdInfo.legTime);
          this.store.legMode.set(input.holdInfo.legMode);
          this.store.turnDirection.set(input.holdInfo.turnDirection);
        }
      } catch {
        // noop
      }
    }, true);
  }

  /** Resets the hold dialog data. */
  public reset(): void {
    this.store.input.set(undefined);
    this.store.legDistance.set(4, UnitType.NMILE);
    this.store.legTime.set(90);
    this.store.holdCourseDirection.set(HoldCourseDirection.Inbound);
    this.store.legMode.set(HoldLegMode.Time);
    this.store.turnDirection.set(LegTurnDirection.Right);
    this.store.isExistingHold.set(false);
    this.store.holdLeg.set(null);
    this.store.isEditableHold.set(false);
    this.store.isCancelButtonEnabled.set(false);
  }

  /**
   * Creates and inserts a hold leg into a flight plan. If the leg is inserted at an index containing an existing hold
   * leg with the same hold fix, the existing hold leg will be removed and the new hold leg will take on the hold type,
   * altitude restriction, and speed restriction of the existing hold. Otherwise, the new hold leg will be of the HM
   * type and have no altitude or speed restrictions.
   * @param fms The FMS.
   * @param planIndex The index of the flight plan into which to insert the hold.
   * @param holdInfo Information describing the hold to insert.
   * @param fixIcao The ICAO for the hold fix.
   * @param segmentIndex The index of the flight plan segment in which to insert the hold leg.
   * @param segmentLegIndex The index in the flight plan segment at which to insert the hold leg.
   * @returns Whether a hold leg was successfully inserted into the flight plan.
   */
  public static createAndInsertHold(
    fms: Fms,
    planIndex: number,
    holdInfo: HoldInfo,
    fixIcao: IcaoValue,
    segmentIndex: number,
    segmentLegIndex: number
  ): boolean {
    if (!fms.hasFlightPlan(planIndex)) {
      return false;
    }

    const plan = fms.getFlightPlan(planIndex);
    const segment = plan.tryGetSegment(segmentIndex);

    if (!segment) {
      return false;
    }

    const nextLeg = segment.legs[segmentLegIndex + 1];

    let existingLeg: FlightPlanLeg | undefined = undefined;

    // Check if we are editing an existing hold.
    if (nextLeg && FlightPlanUtils.isHoldLeg(nextLeg.leg.type) && ICAO.valueEquals(nextLeg.leg.fixIcaoStruct, fixIcao)) {
      existingLeg = nextLeg.leg;
    }

    const legMode = holdInfo.legMode;
    const leg = FlightPlan.createLeg(existingLeg ?? { type: LegType.HM });
    leg.turnDirection = holdInfo.turnDirection;
    leg.course = holdInfo.holdCourseDirection === HoldCourseDirection.Outbound
      ? NavMath.normalizeHeading(holdInfo.course.number + 180)
      : holdInfo.course.number;
    leg.distance = legMode === HoldLegMode.Time
      ? holdInfo.legTime.asUnit(UnitType.MINUTE)
      : holdInfo.legDistance.asUnit(UnitType.METER);
    leg.distanceMinutes = legMode === HoldLegMode.Time;
    FlightPlanUtils.setLegIcao(leg, 'fixIcaoStruct', fixIcao);

    if (existingLeg) {
      return fms.editHold(planIndex, segmentIndex, segmentLegIndex + 1, leg) !== undefined;
    } else {
      return fms.insertHold(planIndex, segmentIndex, segmentLegIndex, leg) !== undefined;
    }
  }
}