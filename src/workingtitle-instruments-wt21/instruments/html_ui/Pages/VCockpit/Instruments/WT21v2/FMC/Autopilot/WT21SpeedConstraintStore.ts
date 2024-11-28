import {
  BitFlags, EventBus, FlightPlanCalculatedEvent, FlightPlanIndicationEvent, FlightPlanLegIterator, FlightPlanner, FlightPlannerEvents, FlightPlanSegmentType,
  IteratorCursor, LegDefinitionFlags, SpeedConstraint, SpeedRestrictionType, VerticalFlightPhase
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '@microsoft/msfs-wt21-shared';

/**
 * A item containing a speed constraint from a flight plan and associated metadata.
 */
export type SpeedConstraintListItem = {
  /** This item's speed constraint. */
  speedConstraint: Readonly<SpeedConstraint>;

  /** The global index of the flight plan leg associated with this item's speed constraint. */
  globalLegIndex: number;

  /** The vertical flight phase of this item's speed constraint. */
  flightPhase: VerticalFlightPhase;

  /** Whether this item's speed constraint is part of a missed approach procedure. */
  isMissedApproach: boolean;
}

/**
 * A store which keeps track of the speed constraints in the active flight plan.
 */
export class WT21SpeedConstraintStore {

  private readonly speedConstraints: SpeedConstraintListItem[] = [];
  private activePlanIndex = 0;
  private planChanged = false;

  private readonly iterator = new FlightPlanLegIterator();

  /**
   * Creates the store.
   * @param bus The Event Bus.
   * @param flightPlanner The Flight Planner.
   */
  constructor(private bus: EventBus, private flightPlanner: FlightPlanner) {
    const fpl = this.bus.getSubscriber<FlightPlannerEvents>();

    fpl.on('fplCopied').handle(e => this.onPlanChanged(e.targetPlanIndex));
    fpl.on('fplLoaded').handle(e => this.onPlanChanged(e.planIndex));
    fpl.on('fplLegChange').handle(e => this.onPlanChanged(e.planIndex));
    fpl.on('fplSegmentChange').handle(e => this.onPlanChanged(e.planIndex));
    fpl.on('fplIndexChanged').handle(this.onPlanIndexChanged);
    fpl.on('fplCalculated').handle(this.onPlanCalculated);
  }

  /**
   * Sets the planChanged flag if the plan change is for the active plan index.
   * @param planIndex The plan index from the event.
   */
  private onPlanChanged(planIndex: number): void {
    if (planIndex === this.activePlanIndex) {
      this.planChanged = true;
    }
  }

  private onPlanIndexChanged = (e: FlightPlanIndicationEvent): void => {
    this.activePlanIndex = e.planIndex;
    this.planChanged = true;
  };

  private onPlanCalculated = (e: FlightPlanCalculatedEvent): void => {
    if (e.planIndex === this.activePlanIndex && this.planChanged) {
      const lateralPlan = this.flightPlanner.getActiveFlightPlan();
      this.speedConstraints.length = 0;

      this.iterator.iterateForward(lateralPlan,
        (cursor: IteratorCursor) => {
          const isDirectToLeg = BitFlags.isAny(cursor.legDefinition.flags, LegDefinitionFlags.DirectTo)
            && lateralPlan.directToData.segmentIndex === cursor.segment.segmentIndex
            && lateralPlan.directToData.segmentLegIndex === cursor.legIndex - WT21FmsUtils.DTO_LEG_OFFSET;

          // If the leg is a direct-to leg with an associated direct-to target leg, skip it since its constraint is
          // duplicated from that of the target leg.

          if (cursor.legDefinition.verticalData.speedDesc !== SpeedRestrictionType.Unused && !isDirectToLeg) {
            const isMissedApproach = BitFlags.isAny(cursor.legDefinition.flags, LegDefinitionFlags.MissedApproach);
            const isCursorDepartureOrMissedApproach = cursor.segment.segmentType === FlightPlanSegmentType.Departure || isMissedApproach;

            // If the constraint leg is a direct-to target, shift the leg index to that of the direct-to leg.
            const isDirectToTarget = lateralPlan.directToData.segmentIndex === cursor.segment.segmentIndex
              && lateralPlan.directToData.segmentLegIndex === cursor.legIndex;

            const constraint: SpeedConstraintListItem = {
              globalLegIndex: cursor.index + (isDirectToTarget ? WT21FmsUtils.DTO_LEG_OFFSET : 0),
              flightPhase: isCursorDepartureOrMissedApproach ? VerticalFlightPhase.Climb : VerticalFlightPhase.Descent,
              speedConstraint: {
                speedDesc: cursor.legDefinition.verticalData.speedDesc,
                speed: cursor.legDefinition.verticalData.speed,
                speedUnit: cursor.legDefinition.verticalData.speedUnit
              },
              isMissedApproach
            };
            this.speedConstraints.push(constraint);
          }
        }
      );

      this.planChanged = false;
    }
  };

  /**
   * Gets the speed constraint in effect for a given flight plan leg and vertical flight phase.
   * @param globalLegIndex The global index of the flight plan leg for which to get the speed constraint in effect.
   * @param flightPhase The vertical flight phase for which to get the speed constraint in effect.
   * @returns The speed constraint in effect for the specified flight plan leg and vertical flight phase, or
   * `undefined` if there is no speed constraint in effect.
   */
  public getCurrentSpeedConstraint(globalLegIndex: number, flightPhase: VerticalFlightPhase): Readonly<SpeedConstraintListItem> | undefined {
    return this.speedConstraints[this.getCurrentSpeedConstraintIndex(globalLegIndex, flightPhase)];
  }

  /**
   * Gets the next speed constraint to take effect for a given flight plan leg and vertical flight phase.
   * @param globalLegIndex The global index of the flight plan leg for which to get the speed constraint in effect.
   * @param flightPhase The vertical flight phase for which to get the speed constraint in effect.
   * @returns The next speed constraint to take effect for the specified flight plan leg and vertical flight phase,
   * or `undefined` if there is no speed constraint in effect.
   */
  public getNextSpeedConstraint(globalLegIndex: number, flightPhase: VerticalFlightPhase): Readonly<SpeedConstraintListItem> | undefined {
    const currentIndex = this.getCurrentSpeedConstraintIndex(globalLegIndex, flightPhase);

    if (currentIndex < 0) {
      if (flightPhase === VerticalFlightPhase.Climb) {
        // If there is no current constraint in effect during climb, there can be no next climb constraint because
        // either we have sequenced all climb constraints or there is at least one non-climb constraint to sequence
        // before the next climb constraint.
        return undefined;
      } else {
        // If there is no current constraint in effect during descent, it is still possible that the next upcoming
        // constraint to be sequenced is the next descent constraint. This constraint, if it exists, is located at the
        // index where the current constraint would be located if it existed, so we need to check if the constraint at
        // that index is a descent constraint and has yet to be sequenced.
        const constraint = this.speedConstraints[-currentIndex - 1];
        if (constraint !== undefined && flightPhase === constraint.flightPhase && constraint.globalLegIndex >= globalLegIndex) {
          return constraint;
        }
      }
    }

    const constraint = this.speedConstraints[currentIndex + 1];
    if (constraint !== undefined && flightPhase === constraint.flightPhase) {
      return constraint;
    }

    return undefined;
  }

  /**
   * Gets the index of the speed constraint in this store in effect for a given flight plan leg and vertical flight
   * phase.
   * @param globalLegIndex The global index of the flight plan leg for which to get the speed constraint in effect.
   * @param flightPhase The vertical flight phase for which to get the speed constraint in effect.
   * @returns The index of the speed constraint in this store in effect for the specified flight plan leg and vertical
   * flight phase. If there is no speed constraint in effect, `-(i + 1)` is returned instead, where `i` is the index
   * at which the constraint would be located if it existed.
   */
  private getCurrentSpeedConstraintIndex(globalLegIndex: number, flightPhase: VerticalFlightPhase): number {
    if (flightPhase === VerticalFlightPhase.Climb) {
      const inMissedApproach = this.flightPlanner.hasActiveFlightPlan()
        && BitFlags.isAll(this.flightPlanner.getActiveFlightPlan().tryGetLeg(globalLegIndex)?.flags ?? 0, LegDefinitionFlags.MissedApproach);

      // During climb, the next upcoming climb speed constraint to be sequenced is in effect.
      for (let i = 0; i < this.speedConstraints.length; i++) {
        const constraint = this.speedConstraints[i];

        // Speed constraints in the missed approach are not active until we are in the missed approach.
        if (constraint.isMissedApproach && !inMissedApproach) {
          return -(i + 1);
        }

        if (constraint.globalLegIndex >= globalLegIndex) {
          return flightPhase === constraint.flightPhase ? i : -(i + 1);
        }
      }

      return -(this.speedConstraints.length + 1);
    } else {
      // During descent, the last sequenced descent speed constraint is in effect.
      for (let i = this.speedConstraints.length - 1; i >= 0; i--) {
        const constraint = this.speedConstraints[i];

        if (constraint.globalLegIndex < globalLegIndex) {
          return flightPhase === constraint.flightPhase ? i : -(i + 2);
        }
      }

      return -1;
    }
  }
}
