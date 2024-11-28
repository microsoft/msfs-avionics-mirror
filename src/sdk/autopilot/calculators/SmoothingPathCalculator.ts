import { EventBus } from '../../data/EventBus';
import {
  FlightPlan, FlightPlanCalculatedEvent, FlightPlanLegEvent, FlightPlanner, FlightPlanSegment, FlightPlanSegmentEvent,
  FlightPlanSegmentType, LegDefinition, LegDefinitionFlags, VerticalFlightPhase
} from '../../flightplan';
import { GeoPoint } from '../../geo/GeoPoint';
import { BitFlags } from '../../math/BitFlags';
import { MathUtils } from '../../math/MathUtils';
import { UnitType } from '../../math/NumberUnit';
import { AltitudeRestrictionType, LegType } from '../../navigation';
import { ReadonlySubEvent, SubEvent } from '../../sub';
import { AltitudeConstraintDetails, VerticalFlightPlan, VNavConstraint } from '../VerticalNavigation';
import { VNavControlEvents } from '../vnav/VNavControlEvents';
import { VNavUtils } from '../vnav/VNavUtils';
import { VNavPathCalculator } from './VNavPathCalculator';

/**
 * Options for a SmoothingPathCalculator.
 */
export type SmoothingPathCalculatorOptions = {
  /**
   * The VNAV index to assign to the path calculator. The VNAV index determines the index of the control events used
   * to control the calculator. Defaults to `0`.
   */
  index?: number;

  /**
   * The default flight path angle, in degrees, for descent paths. Increasingly positive values indicate steeper
   * descents. Defaults to 3 degrees.
   */
  defaultFpa?: number;

  /**
   * The minimum allowed flight path angle, in degrees, for descent paths. Increasingly positive values indicate
   * steeper descents. Paths that require angles less than the minimum value will be assigned the default flight path
   * angle instead to create a step-down descent. Vertical direct-to paths are exempt from the minimum FPA requirement.
   * Defaults to 1.5 degrees.
   */
  minFpa?: number;

  /**
   * The maximum allowed flight path angle, in degrees, for descent paths. Increasingly positive values indicate
   * steeper descents. Paths that require angles greater than the maximum value will have their FPAs clamped to the
   * maximum value, even if this would create a discontinuity in the vertical profile. Defaults to 6 degrees.
   */
  maxFpa?: number;

  /** Whether to force the first constraint in the approach to an AT constraint. Defaults to `false`. */
  forceFirstApproachAtConstraint?: boolean;

  /** The index offset of a lateral direct-to leg from its direct-to target leg. Defaults to `3`. */
  directToLegOffset?: number;

  /**
   * A function which checks whether a lateral flight plan leg is eligible for VNAV. VNAV descent paths will not be
   * calculated through VNAV-ineligible legs. If not defined, a leg will be considered eligible if and only if it
   * does not contain a discontinuity.
   */
  isLegEligible?: (lateralLeg: LegDefinition) => boolean;

  /**
   * A function which checks whether an altitude constraint defined for a lateral flight plan leg should be used for
   * VNAV. If not defined, all constraints will be used.
   * @param lateralPlan The lateral flight plan that hosts the altitude constraint.
   * @param lateralLeg The lateral flight plan leg that hosts the altitude constraint.
   * @param globalLegIndex The global index of the lateral flight plan leg that hosts the altitude constraint.
   * @param segment The lateral flight plan segment containing the flight plan leg that hosts the altitude constraint.
   * @param segmentLegIndex The index of the lateral flight plan leg that hosts the altitude constraint in its
   * containing segment.
   * @returns Whether the altitude constraint defined for the specified lateral flight plan leg should be used for
   * VNAV.
   */
  shouldUseConstraint?: (lateralPlan: FlightPlan, lateralLeg: LegDefinition, globalLegIndex: number, segment: FlightPlanSegment, segmentLegIndex: number) => boolean;

  /**
   * A function which checks whether a climb constraint should be invalidated. Invalidated constraints will not appear
   * in the vertical flight plan. If not defined, no climb constraints will be invalidated.
   * @param constraint A descent constraint.
   * @param index The index of the constraint to check.
   * @param constraints The array of VNAV constraints currently in the vertical flight plan.
   * @param firstDescentConstraintIndex The index of the first descent constraint in the vertical flight plan, if one
   * exists.
   * @param priorMinAltitude The most recent minimum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * constraints of the same category (climb or missed approach) are included.
   * @param priorMaxAltitude The most recent maximum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * constraints of the same category (climb or missed approach) are included.
   * @returns Whether the specified climb constraint should be invalidated.
   */
  invalidateClimbConstraint?: (
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    firstDescentConstraintIndex: number,
    priorMinAltitude: number,
    priorMaxAltitude: number
  ) => boolean;

  /**
   * A function which checks whether a descent constraint should be invalidated. Invalidated constraints will not
   * appear in the vertical flight plan. If not defined, no descent constraints will be invalidated.
   * @param constraint A descent constraint.
   * @param index The index of the constraint to check.
   * @param constraints The array of VNAV constraints currently in the vertical flight plan.
   * @param priorMinAltitude The most recent minimum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param priorMaxAltitude The most recent maximum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param requiredFpa The minimum flight path angle, in degrees, required to meet the maximum altitude of the
   * constraint to check, assuming a descent starting from the constraint defining the most recent prior minimum
   * altitude. Positive values indicate a descending path. If there is no required FPA because there is no defined
   * prior minimum altitude or maximum altitude for the constraint to check, or if the constraint to check is higher
   * than the prior minimum altitude, then this value will equal zero.
   * @param maxFpa The maximum allowed flight path angle, in degrees. Positive values indicate a descending path.
   * @returns Whether the specified descent constraint should be invalidated.
   */
  invalidateDescentConstraint?: (
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    priorMinAltitude: number,
    priorMaxAltitude: number,
    requiredFpa: number,
    maxFpa: number
  ) => boolean;
};

/**
 * Handles the calculation of the VNAV flight path for Path Smoothing VNAV Implementations.
 */
export class SmoothingPathCalculator implements VNavPathCalculator {
  protected static readonly DEFAULT_DEFAULT_FPA = 3;
  protected static readonly DEFAULT_MIN_FPA = 1.5;
  protected static readonly DEFAULT_MAX_FPA = 6;

  protected static readonly DEFAULT_DIRECT_TO_LEG_OFFSET = 3;

  /** The Vertical Flight Plans managed by this Path Calculator */
  protected readonly verticalFlightPlans: (VerticalFlightPlan | undefined)[] = [];

  /** This calculator's VNAV index. */
  public readonly index: number;

  /** The default flight path angle, in degrees, for descent paths. Increasingly positive values indicate steeper descents. */
  public flightPathAngle: number;

  /**
   * The minimum allowed flight path angle, in degrees, for descent paths. Increasingly positive values indicate
   * steeper descents. Paths that require angles less than the minimum value will be assigned the default flight path
   * angle instead to create a step-down descent. Vertical direct-to paths are exempt from the minimum FPA requirement.
   */
  public minFlightPathAngle: number;

  /**
   * The maximum allowed flight path angle, in degrees, for descent paths. Increasingly positive values indicate
   * steeper descents. Paths that require angles greater than the maximum value will have their FPAs clamped to the
   * maximum value, even if this would create a discontinuity in the vertical profile.
   */
  public maxFlightPathAngle: number;

  /** @inheritdoc */
  public readonly planBuilt: ReadonlySubEvent<this, number> = new SubEvent<this, number>();

  /** @inheritdoc */
  public readonly vnavCalculated: ReadonlySubEvent<this, number> = new SubEvent<this, number>();

  protected readonly forceFirstApproachAtConstraint: boolean;

  protected readonly directToLegOffset: number;

  protected isLegEligibleFunc: (lateralLeg: LegDefinition) => boolean;

  protected shouldUseConstraintFunc: (lateralPlan: FlightPlan, lateralLeg: LegDefinition, globalLegIndex: number, segment: FlightPlanSegment, segmentLegIndex: number) => boolean;

  protected invalidateClimbConstraintFunc: (
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    firstDescentConstraintIndex: number,
    priorMinAltitude: number,
    priorMaxAltitude: number,
  ) => boolean;

  protected invalidateDescentConstraintFunc: (
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    priorMinAltitude: number,
    priorMaxAltitude: number,
    requiredFpa: number,
    maxFpa: number
  ) => boolean;

  protected readonly legAltitudes: [number, number] = [0, 0];
  protected readonly applyPathValuesResult: [number | undefined, number] = [undefined, 0];

  /**
   * Creates an instance of SmoothingPathCalculator.
   * @param bus The EventBus to use with this instance.
   * @param flightPlanner The flight planner to use with this instance.
   * @param primaryPlanIndex The primary flight plan index to use to calculate a path from.
   * @param options Options for the calculator.
   */
  constructor(
    protected readonly bus: EventBus,
    protected readonly flightPlanner: FlightPlanner,
    protected readonly primaryPlanIndex: number,
    options?: SmoothingPathCalculatorOptions
  ) {
    this.index = options?.index ?? 0;

    this.flightPathAngle = options?.defaultFpa ?? SmoothingPathCalculator.DEFAULT_DEFAULT_FPA;
    this.minFlightPathAngle = options?.minFpa ?? SmoothingPathCalculator.DEFAULT_MIN_FPA;
    this.maxFlightPathAngle = options?.maxFpa ?? SmoothingPathCalculator.DEFAULT_MAX_FPA;
    this.forceFirstApproachAtConstraint = options?.forceFirstApproachAtConstraint ?? false;
    this.directToLegOffset = options?.directToLegOffset ?? SmoothingPathCalculator.DEFAULT_DIRECT_TO_LEG_OFFSET;
    this.isLegEligibleFunc = options?.isLegEligible ?? SmoothingPathCalculator.isLegVnavEligible;
    this.shouldUseConstraintFunc = options?.shouldUseConstraint ?? (() => true);
    this.invalidateClimbConstraintFunc = options?.invalidateClimbConstraint ?? SmoothingPathCalculator.invalidateClimbConstraint;
    this.invalidateDescentConstraintFunc = options?.invalidateDescentConstraint ?? SmoothingPathCalculator.invalidateDescentConstraint;

    this.flightPlanner.onEvent('fplCreated').handle(e => this.createVerticalPlan(e.planIndex));

    this.flightPlanner.onEvent('fplCopied').handle(e => this.onPlanChanged(e.targetPlanIndex));
    this.flightPlanner.onEvent('fplLoaded').handle(e => this.onPlanChanged(e.planIndex));

    this.flightPlanner.onEvent('fplLegChange').handle(e => this.onPlanChanged(e.planIndex, e));

    this.flightPlanner.onEvent('fplSegmentChange').handle(e => this.onPlanChanged(e.planIndex, undefined, e));

    this.flightPlanner.onEvent('fplIndexChanged').handle(e => this.onPlanChanged(e.planIndex));

    this.flightPlanner.onEvent('fplCalculated').handle(e => this.onPlanCalculated(e));

    const vnavTopicSuffix = VNavUtils.getEventBusTopicSuffix(this.index);

    const sub = bus.getSubscriber<VNavControlEvents>();

    sub.on(`vnav_set_default_fpa${vnavTopicSuffix}`).handle(this.setDefaultFpa.bind(this));

    sub.on(`vnav_set_vnav_direct_to${vnavTopicSuffix}`).handle(data => {
      if (data.globalLegIndex < 0) {
        this.cancelVerticalDirect(data.planIndex);
      } else {
        this.activateVerticalDirect(data.planIndex, data.globalLegIndex, data.fpa);
      }
    });
  }

  /** @inheritdoc */
  public getVerticalFlightPlan(planIndex: number): VerticalFlightPlan {
    return this.verticalFlightPlans[planIndex] ??= this.createVerticalPlan(planIndex);
  }

  /** @inheritdoc */
  public createVerticalPlan(planIndex: number): VerticalFlightPlan {
    const verticalFlightPlan: VerticalFlightPlan = {
      planIndex,
      length: 0,
      constraints: [],
      segments: [],
      destLegIndex: undefined,
      fafLegIndex: undefined,
      firstDescentConstraintLegIndex: undefined,
      lastDescentConstraintLegIndex: undefined,
      missedApproachStartIndex: undefined,
      currentAlongLegDistance: undefined,
      verticalDirectIndex: undefined,
      verticalDirectFpa: undefined,
      planChanged: true
    };

    this.verticalFlightPlans[planIndex] = verticalFlightPlan;

    return verticalFlightPlan;
  }

  /** @inheritdoc */
  public requestPathCompute(planIndex: number): boolean {
    if (this.flightPlanner.hasFlightPlan(planIndex) && this.verticalFlightPlans[planIndex] !== undefined) {
      const lateralPlan = this.flightPlanner.getFlightPlan(planIndex);
      const verticalPlan = this.getVerticalFlightPlan(planIndex);

      this.computePathAndNotify(lateralPlan, verticalPlan);

      return true;
    }
    return false;
  }

  /**
   * Gets the index of the VNAV constraint defining the target VNAV altitude for a flight plan leg.
   * @param planIndex The flight plan index.
   * @param globalLegIndex The global index of the flight plan leg.
   * @returns The index of the VNAV constraint defining the target VNAV altitude for a flight plan leg, or `-1` if one
   * could not be found.
   */
  public getTargetConstraintIndex(planIndex: number, globalLegIndex: number): number {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    if (this.getFlightPhase(planIndex) === VerticalFlightPhase.Descent) {
      const currentConstraint = VNavUtils.getPriorConstraintFromLegIndex(verticalPlan, globalLegIndex);
      if (currentConstraint && currentConstraint.nextVnavEligibleLegIndex !== undefined && globalLegIndex < currentConstraint.nextVnavEligibleLegIndex) {
        const priorConstraintIndex = VNavUtils.getPriorConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
        const priorConstraint = verticalPlan.constraints[priorConstraintIndex];
        if (priorConstraint && priorConstraint.type !== 'climb' && priorConstraint.type !== 'missed') {
          return priorConstraintIndex;
        } else {
          return -1;
        }
      }

      let i = verticalPlan.constraints.length - 1;
      while (i >= 0) {
        const constraint = verticalPlan.constraints[i];
        if (globalLegIndex <= constraint.index && constraint.isTarget && constraint.type !== 'climb' && constraint.type !== 'missed') {
          return i;
        }

        i--;
      }
    } else {
      const currentConstraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
      if (currentConstraintIndex >= 0) {
        const currentConstraint = verticalPlan.constraints[currentConstraintIndex];
        const isMissed = currentConstraint.type === 'missed';

        for (let i = currentConstraintIndex; i >= 0; i--) {
          const constraint = verticalPlan.constraints[i];
          if (constraint.type === 'climb' || (isMissed && constraint.type === 'missed')) {
            if (constraint.maxAltitude < Number.POSITIVE_INFINITY) {
              return i;
            }
          } else {
            return -1;
          }
        }
      }
    }

    return -1;
  }

  /**
   * Gets the VNAV constraint defining the target VNAV altitude for a flight plan leg.
   * @param planIndex The flight plan index.
   * @param globalLegIndex The global index of the flight plan leg.
   * @returns The VNAV constraint defining the target VNAV altitude for a flight plan leg, or `undefined` if one could
   * not be found.
   */
  public getTargetConstraint(planIndex: number, globalLegIndex: number): VNavConstraint | undefined {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);
    return verticalPlan.constraints[this.getTargetConstraintIndex(planIndex, globalLegIndex)];
  }

  /** @inheritdoc */
  public getTargetAltitude(planIndex: number, globalLegIndex: number): number | undefined {
    if (this.getFlightPhase(planIndex) === VerticalFlightPhase.Descent) {
      return this.getTargetConstraint(planIndex, globalLegIndex)?.targetAltitude;
    } else {
      return this.getTargetConstraint(planIndex, globalLegIndex)?.maxAltitude;
    }
  }

  /** @inheritdoc */
  public getFlightPhase(planIndex: number): VerticalFlightPhase {
    if (this.flightPlanner.hasFlightPlan(planIndex)) {
      const lateralPlan = this.flightPlanner.getFlightPlan(planIndex);
      const verticalPlan = this.getVerticalFlightPlan(planIndex);
      const globalLegIndex = VNavUtils.getConstraintLegIndexFromLegIndex(verticalPlan, lateralPlan.activeLateralLeg);
      if (globalLegIndex > -1) {
        const constraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);
        switch (constraint?.type) {
          case 'climb':
          case 'missed':
            return VerticalFlightPhase.Climb;
        }
      }
    }
    return VerticalFlightPhase.Descent;
  }

  /** @inheritdoc */
  public getCurrentConstraintAltitude(planIndex: number, globalLegIndex: number): number | undefined {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);

    if (currentConstraint === undefined) {
      return undefined;
    }

    const priorConstraint = VNavUtils.getPriorConstraintFromLegIndex(verticalPlan, globalLegIndex);

    if (
      currentConstraint.type !== 'climb' && currentConstraint.type !== 'missed'
      && currentConstraint.nextVnavEligibleLegIndex !== undefined
      && globalLegIndex < currentConstraint.nextVnavEligibleLegIndex
    ) {
      return priorConstraint?.targetAltitude;
    } else {
      return currentConstraint.targetAltitude;
    }
  }

  /** @inheritdoc */
  public getCurrentConstraintDetails(planIndex: number, globalLegIndex: number): AltitudeConstraintDetails {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);

    if (currentConstraint === undefined) {
      return { type: AltitudeRestrictionType.Unused, altitude: 0 };
    }

    const priorConstraint = VNavUtils.getPriorConstraintFromLegIndex(verticalPlan, globalLegIndex);

    if (
      currentConstraint.type !== 'climb' && currentConstraint.type !== 'missed'
      && currentConstraint.nextVnavEligibleLegIndex !== undefined
      && globalLegIndex < currentConstraint.nextVnavEligibleLegIndex
    ) {
      if (priorConstraint) {
        return VNavUtils.getConstraintDetails(priorConstraint, { type: AltitudeRestrictionType.Unused, altitude: 0 });
      } else {
        return { type: AltitudeRestrictionType.Unused, altitude: 0 };
      }
    } else {
      return VNavUtils.getConstraintDetails(currentConstraint, { type: AltitudeRestrictionType.Unused, altitude: 0 });
    }
  }

  /** @inheritdoc */
  public getNextConstraintAltitude(planIndex: number, globalLegIndex: number): number | undefined {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, globalLegIndex);
    // added check for climb or descent for smoothing path calc

    if (currentConstraint !== undefined) {

      if (this.getFlightPhase(planIndex) === VerticalFlightPhase.Climb) {
        if (currentConstraint.maxAltitude < Number.POSITIVE_INFINITY) {
          return currentConstraint.maxAltitude;
        } else {
          return currentConstraint.minAltitude;
        }
      } else {
        if (currentConstraint.minAltitude > Number.NEGATIVE_INFINITY) {
          return currentConstraint.minAltitude;
        } else {
          return currentConstraint.maxAltitude;
        }
      }
    }
    return undefined;
  }

  /** @inheritdoc */
  public getNextRestrictionForFlightPhase(planIndex: number, activeLateralLeg: number): VNavConstraint | undefined {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    const currentConstraint = VNavUtils.getConstraintFromLegIndex(verticalPlan, activeLateralLeg);
    if (currentConstraint) {
      const currentConstraintIndex = verticalPlan.constraints.indexOf(currentConstraint);

      if (currentConstraintIndex > -1) {

        if (this.getFlightPhase(planIndex) === VerticalFlightPhase.Climb) {
          for (let i = currentConstraintIndex; i >= 0; i--) {
            const constraint = verticalPlan.constraints[i];
            if (constraint.type === 'climb' || constraint.type === 'missed') {
              if (constraint.minAltitude > Number.NEGATIVE_INFINITY) {
                return constraint;
              }
            } else {
              return undefined;
            }
          }
        } else {
          for (let i = currentConstraintIndex; i >= 0; i--) {
            const constraint = verticalPlan.constraints[i];
            if (constraint.type === 'descent' || constraint.type === 'direct' || constraint.type === 'manual') {
              if (constraint.maxAltitude < Number.POSITIVE_INFINITY) {
                return constraint;
              }
            } else {
              return undefined;
            }
          }
        }
      }
    }

    return undefined;
  }

  /** @inheritdoc */
  public activateVerticalDirect(planIndex: number, constraintGlobalLegIndex: number, fpa?: number): void {
    if (constraintGlobalLegIndex < 0) {
      return;
    }

    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    verticalPlan.verticalDirectIndex = constraintGlobalLegIndex;
    verticalPlan.verticalDirectFpa = fpa ?? this.flightPathAngle;
    const lateralPlan = this.flightPlanner.getFlightPlan(planIndex);
    this.buildVerticalFlightPlanAndNotify(lateralPlan, verticalPlan);
    this.computePathAndNotify(lateralPlan, verticalPlan);
  }

  /**
   * Cancels the existing VNAV direct-to for a vertical flight plan.
   * @param planIndex The index of the vertical flight plan for which to cancel the VNAV direct-to.
   */
  public cancelVerticalDirect(planIndex: number): void {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    if (verticalPlan.verticalDirectIndex === undefined) {
      return;
    }

    verticalPlan.verticalDirectIndex = undefined;
    verticalPlan.verticalDirectFpa = undefined;
    const lateralPlan = this.flightPlanner.getFlightPlan(planIndex);
    this.buildVerticalFlightPlanAndNotify(lateralPlan, verticalPlan);
    this.computePathAndNotify(lateralPlan, verticalPlan);
  }

  /**
   * Sets this calculator's default flight path angle.
   * @param fpa The new default flight path angle, in degrees. Increasingly positive values indicate steeper descents.
   */
  protected setDefaultFpa(fpa: number): void {
    const newFpa = Math.max(0, fpa);

    if (newFpa !== this.flightPathAngle) {
      this.flightPathAngle = newFpa;

      for (let i = 0; i < this.verticalFlightPlans.length; i++) {
        const lateralPlan = this.flightPlanner.hasFlightPlan(i) ? this.flightPlanner.getFlightPlan(i) : undefined;
        const verticalPlan = this.verticalFlightPlans[i];
        if (lateralPlan && verticalPlan) {
          this.computePathAndNotify(lateralPlan, verticalPlan);
        }
      }
    }
  }

  /**
   * Sets planChanged to true to flag that a plan change has been received over the bus.
   * @param planIndex The Plan Index that changed.
   * @param legChangeEvent The FlightPlanLegEvent, if any.
   * @param segmentChangeEvent The FlightPlanSegmentEvent, if any.
   */
  protected onPlanChanged(planIndex: number, legChangeEvent?: FlightPlanLegEvent, segmentChangeEvent?: FlightPlanSegmentEvent): void {

    const plan = this.flightPlanner.getFlightPlan(planIndex);
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    if (verticalPlan.verticalDirectIndex !== undefined) {
      if (legChangeEvent !== undefined) {
        const globalIndex = plan.getSegment(legChangeEvent.segmentIndex).offset + legChangeEvent.legIndex;
        if (globalIndex <= verticalPlan.verticalDirectIndex) {
          verticalPlan.verticalDirectIndex = undefined;
        }
      } else if (segmentChangeEvent !== undefined) {
        const verticalDirectSegmentIndex = plan.getSegmentIndex(verticalPlan.verticalDirectIndex);
        if (segmentChangeEvent.segmentIndex <= verticalDirectSegmentIndex) {
          verticalPlan.verticalDirectIndex = undefined;
        }
      }
    }

    verticalPlan.planChanged = true;
    verticalPlan.currentAlongLegDistance = undefined;
  }

  /**
   * Method fired on a flight plan change event to rebuild the vertical path.
   * @param event The Flight Plan Calculated Event
   */
  protected onPlanCalculated(event: FlightPlanCalculatedEvent): void {
    this.buildVerticalFlightPlanAndComputeAndNotify(event.planIndex);
  }

  /**
   * Builds a vertical flight plan if its corresponding lateral flight plan has been changed since the last rebuild,
   * then computes the vertical path sends events notifying subscribers that the plan was built and calculated.
   * @param planIndex The index of the plan to build and compute.
   */
  protected buildVerticalFlightPlanAndComputeAndNotify(planIndex: number): void {
    const lateralPlan = this.flightPlanner.getFlightPlan(planIndex);
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    if (verticalPlan.planChanged) {
      this.buildVerticalFlightPlanAndNotify(lateralPlan, verticalPlan);
    }

    this.computePathAndNotify(lateralPlan, verticalPlan);
  }

  /**
   * Sends an event notifying subscribers that a vertical flight plan was built or rebuilt.
   * @param planIndex The index of the plan that was built.
   */
  protected notifyBuilt(planIndex: number): void {
    (this.planBuilt as SubEvent<this, number>).notify(this, planIndex);
  }

  /**
   * Sends an event notifying subscribers that a vertical flight plan was calculated.
   * @param planIndex The index of the plan that was calculated.
   */
  protected notifyCalculated(planIndex: number): void {
    (this.vnavCalculated as SubEvent<this, number>).notify(this, planIndex);
  }

  /**
   * Builds a vertical flight plan from a lateral flight plan and sends an event notifying subscribers that the plan
   * was built.
   * @param lateralPlan The lateral flight plan.
   * @param verticalPlan The vertical flight plan to build.
   */
  protected buildVerticalFlightPlanAndNotify(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {
    this.buildVerticalFlightPlan(lateralPlan, verticalPlan);
    this.notifyBuilt(verticalPlan.planIndex);
  }

  /**
   * Builds a vertical flight plan from a lateral flight plan.
   * @param lateralPlan The lateral flight plan.
   * @param verticalPlan The vertical flight plan to build.
   */
  protected buildVerticalFlightPlan(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {
    this.buildVerticalLegsAndConstraints(lateralPlan, verticalPlan);
    SmoothingPathCalculator.handleDirectToLegInVerticalPlan(lateralPlan, verticalPlan, this.directToLegOffset);
    verticalPlan.planChanged = false;
  }

  /**
   * Resets the Vertical Flight Plan, populates the vertical segments and legs, finds and builds the vertical constraints.
   * @param lateralPlan The Lateral Flight Plan.
   * @param verticalPlan The Vertical Flight Plan.
   */
  protected buildVerticalLegsAndConstraints(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {

    // Reset the constraints array.
    verticalPlan.constraints.length = 0;
    // Reset the segments array.
    verticalPlan.segments.length = 0;
    verticalPlan.destLegIndex = undefined;
    verticalPlan.firstDescentConstraintLegIndex = undefined;
    verticalPlan.lastDescentConstraintLegIndex = undefined;
    verticalPlan.missedApproachStartIndex = undefined;

    // Find the FAF in the lateral plan, if any.
    verticalPlan.fafLegIndex = VNavUtils.getFafIndex(lateralPlan);

    const directToTargetLegIndex = SmoothingPathCalculator.getDirectToTargetLegIndex(lateralPlan);

    let firstApproachGlobalLegIndex;

    // Iterate forward through the lateral plan to build the constraints
    for (const segment of lateralPlan.segments()) {
      // Add the plan segments to the VNav Path Calculator Segments
      verticalPlan.segments[segment.segmentIndex] = {
        offset: segment.offset,
        legs: []
      };

      if (segment.segmentType === FlightPlanSegmentType.Approach && firstApproachGlobalLegIndex === undefined) {
        firstApproachGlobalLegIndex = segment.offset;
      }

      for (let segmentLegIndex = 0; segmentLegIndex < segment.legs.length; segmentLegIndex++) {
        const globalLegIndex = segment.offset + segmentLegIndex;
        const lateralLeg = segment.legs[segmentLegIndex];
        const verticalLeg = VNavUtils.createLeg(segment.segmentIndex, segmentLegIndex, lateralLeg.name ?? '', lateralLeg.calculated?.distanceWithTransitions ?? undefined);

        // Check if the leg is part of the missed approach, and set the missed approach start index.
        if (
          verticalPlan.missedApproachStartIndex === undefined
          && segment.segmentType === FlightPlanSegmentType.Approach
          && BitFlags.isAll(lateralLeg.flags, LegDefinitionFlags.MissedApproach)
        ) {
          verticalPlan.missedApproachStartIndex = globalLegIndex;
        }

        // Check if the leg contains a constraint
        const constraintAltitudes = SmoothingPathCalculator.getConstraintAltitudes(lateralLeg, this.legAltitudes);

        verticalLeg.isEligible = this.isLegEligibleFunc(lateralLeg);

        verticalLeg.distance = lateralLeg.calculated?.distanceWithTransitions ?? 0;

        // Check if the leg precedes a defined vertical direct for this vertical flight plan.
        const legPrecedesVerticalDirectIndex = verticalPlan.verticalDirectIndex !== undefined && globalLegIndex < verticalPlan.verticalDirectIndex;

        const legPrecedesDirectTo = directToTargetLegIndex !== undefined && globalLegIndex < directToTargetLegIndex + this.directToLegOffset;

        if (
          constraintAltitudes !== undefined
          && !legPrecedesVerticalDirectIndex
          && !legPrecedesDirectTo
          && this.shouldUseConstraintFunc(lateralPlan, lateralLeg, globalLegIndex, segment, segmentLegIndex)
        ) {
          verticalLeg.isUserDefined = VNavUtils.isUserConstraint(lateralLeg);

          const verticalConstraint = this.buildConstraint(verticalPlan, globalLegIndex, lateralLeg, constraintAltitudes, verticalLeg.name);

          // Add the new vertical constraint to the array of constraints in reverse order.
          verticalPlan.constraints.unshift(verticalConstraint);
        }

        // Add the new vertical leg to the vertical flight plan
        verticalPlan.segments[segment.segmentIndex].legs.push(verticalLeg);
      }
    }

    verticalPlan.length = lateralPlan.length;

    if (this.forceFirstApproachAtConstraint && firstApproachGlobalLegIndex !== undefined) {
      const firstApproachConstraint = VNavUtils.getConstraintFromLegIndex(
        verticalPlan,
        directToTargetLegIndex === firstApproachGlobalLegIndex ? directToTargetLegIndex + 3 : firstApproachGlobalLegIndex
      );

      if (firstApproachConstraint && firstApproachConstraint.type !== 'climb' && firstApproachConstraint.type !== 'missed') {
        SmoothingPathCalculator.forceAtConstraint(firstApproachConstraint);
      }
    }

    verticalPlan.firstDescentConstraintLegIndex = verticalPlan.constraints[VNavUtils.getFirstDescentConstraintIndex(verticalPlan)]?.index;
    verticalPlan.lastDescentConstraintLegIndex = verticalPlan.constraints[VNavUtils.getLastDescentConstraintIndex(verticalPlan)]?.index;
  }

  /**
   * Builds a VNAV constraint for a lateral flight plan leg.
   * @param verticalPlan The vertical flight plan.
   * @param globalLegIndex The global index of the lateral flight plan leg for which to build the constraint.
   * @param lateralLeg The lateral flight plan leg for which to build the constraint.
   * @param constraintAltitudes The constraint altitudes, as `[minimum_altitude, maximum_altitude]`.
   * @param name The name of the new constraint.
   * @returns A new VNAV constraint for the specified lateral flight plan leg.
   */
  protected buildConstraint(
    verticalPlan: VerticalFlightPlan,
    globalLegIndex: number,
    lateralLeg: LegDefinition,
    constraintAltitudes: [number, number],
    name: string
  ): VNavConstraint {
    const constraint = VNavUtils.createConstraint(
      globalLegIndex,
      constraintAltitudes[0],
      constraintAltitudes[1],
      name,
      BitFlags.isAll(lateralLeg.flags, LegDefinitionFlags.MissedApproach) ? 'missed' : lateralLeg.verticalData.phase === VerticalFlightPhase.Descent ? 'descent' : 'climb'
    );

    constraint.isBeyondFaf = verticalPlan.fafLegIndex === undefined ? false : globalLegIndex > verticalPlan.fafLegIndex;

    // Check if this constraint is a vertical direct.
    if (verticalPlan.verticalDirectIndex === globalLegIndex) {
      constraint.fpa = verticalPlan.verticalDirectFpa ?? this.flightPathAngle;
      constraint.type = 'direct';
    }

    const userFpa = lateralLeg.verticalData.fpa;

    if (userFpa !== undefined && constraint.type !== 'climb' && constraint.type !== 'missed') {
      constraint.fpa = userFpa;
      constraint.type = 'manual';
    }

    return constraint;
  }

  /**
   * Computes the vertical path for a flight plan and sends an event notifying subscribers that the plan was
   * calculated.
   * @param lateralPlan The lateral flight plan for which to compute a path.
   * @param verticalPlan The vertical flight plan for which to compute a path.
   */
  protected computePathAndNotify(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {
    this.computePath(lateralPlan, verticalPlan);
    this.notifyCalculated(lateralPlan.planIndex);
  }

  /**
   * Computes the vertical path for a flight plan.
   * @param lateralPlan The lateral flight plan for which to compute a path.
   * @param verticalPlan The vertical flight plan for which to compute a path.
   */
  protected computePath(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {
    this.computeDescentPath(lateralPlan, verticalPlan);
  }

  /**
   * Computes the descent path for a flight plan.
   * @param lateralPlan The lateral flight plan for which to compute a path.
   * @param verticalPlan The vertical flight plan for which to compute a path.
   */
  protected computeDescentPath(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {

    this.fillLegDistances(lateralPlan, verticalPlan);

    // Updated leg distances could cause some invalidated constraints to become valid, so we will re-insert all
    // invalidated constraints and filter them again.
    this.reinsertInvalidConstraints(verticalPlan, lateralPlan);
    this.findAndRemoveInvalidConstraints(verticalPlan);

    if (verticalPlan.constraints.length < 1) {
      return;
    }

    this.populateConstraints(verticalPlan);

    if (this.computeFlightPathAngles(verticalPlan)) {
      for (let constraintIndex = 0; constraintIndex < verticalPlan.constraints.length; constraintIndex++) {
        const constraint = verticalPlan.constraints[constraintIndex];

        if (constraint.type === 'descent' || constraint.type === 'direct' || constraint.type === 'manual') {
          let altitude = constraint.targetAltitude;

          let constraintIsBod = true;

          // Check to see if the current constraint is not considered a BOD constraint. A constraint is not BOD if and
          // only if there is a following constraint (in flight plan order) that is not a climb constraint and is
          // path-eligible, and one of the following is true:
          // - the following constraint is not flat (has FPA > 0) and the computed vertical path to the following
          // constraint is not above the path ending at the current constraint at the location of the current
          // constraint (with a 25-meter margin).
          // - the current constraint is flat (has FPA = 0).
          if (constraintIndex > 0) {
            const followingConstraint = verticalPlan.constraints[constraintIndex - 1];
            if (
              followingConstraint.type !== 'climb'
              && followingConstraint.type !== 'missed'
              && followingConstraint.nextVnavEligibleLegIndex === undefined
            ) {
              const constraintAltForDist = followingConstraint.targetAltitude + VNavUtils.altitudeForDistance(followingConstraint.fpa, followingConstraint.distance);
              if ((followingConstraint.fpa > 0 && constraintAltForDist <= constraint.targetAltitude + 25) || constraint.fpa === 0) {
                constraintIsBod = false;
              }
            }
          }

          if (constraint.index === verticalPlan.lastDescentConstraintLegIndex) {
            constraint.isPathEnd = true;
            constraint.isTarget = true;
            constraintIsBod = true;
          }

          for (let legIndex = 0; legIndex < constraint.legs.length; legIndex++) {
            const leg = constraint.legs[legIndex];
            leg.fpa = constraint.fpa;
            leg.altitude = altitude;

            altitude += VNavUtils.altitudeForDistance(leg.fpa, leg.distance);

            if (legIndex === 0) {
              leg.isAdvisory = false;
            } else {
              leg.isAdvisory = true;
            }

            if (legIndex === 0 && constraint.isTarget && constraintIsBod) {
              leg.isBod = true;
            } else {
              leg.isBod = false;
            }
          }
        }
      }
    }
  }

  /**
   * Fills the VNAV plan leg and constraint segment distances.
   * @param lateralPlan The Lateral Flight Plan.
   * @param verticalPlan The Vertical Flight Plan.
   */
  protected fillLegDistances(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan): void {

    if (lateralPlan.length > 0) {
      for (const segment of lateralPlan.segments()) {
        if (segment) {
          const vnavSegment = verticalPlan.segments[segment.segmentIndex];
          for (let l = 0; l < segment.legs.length; l++) {
            const leg = segment.legs[l];
            if (leg && leg.calculated && leg.calculated.distanceWithTransitions) {
              vnavSegment.legs[l].distance = leg.calculated.distanceWithTransitions;
            } else if (leg && leg.calculated && leg.calculated.endLat !== undefined && leg.calculated.endLon !== undefined) {
              let prevLeg;
              for (const checkLeg of lateralPlan.legs(true, segment.offset + l - 1)) {
                if (checkLeg.calculated?.endLat !== undefined && checkLeg.calculated?.endLon !== undefined) {
                  prevLeg = checkLeg;
                  break;
                }
              }
              if (prevLeg?.calculated?.endLat && prevLeg.calculated.endLon) {
                vnavSegment.legs[l].distance = UnitType.GA_RADIAN.convertTo(
                  GeoPoint.distance(leg.calculated.endLat, leg.calculated.endLon, prevLeg.calculated.endLat, prevLeg.calculated.endLon),
                  UnitType.METER);
              }
            } else {
              vnavSegment.legs[l].distance = 0;
            }
          }
        }
      }
    }
  }

  /**
   * Finds and removes invalid constraints from the vertical plan.
   * @param verticalPlan The Vertical Flight Plan.
   */
  protected findAndRemoveInvalidConstraints(verticalPlan: VerticalFlightPlan): void {
    let firstDescentConstraintIndex = verticalPlan.firstDescentConstraintLegIndex === undefined
      ? -1
      : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, verticalPlan.firstDescentConstraintLegIndex);

    // If there is a vertical direct-to active (and it has not been invalidated), skip all constraints prior to the
    // direct-to.
    const startIndex = verticalPlan.constraints[firstDescentConstraintIndex]?.type === 'direct'
      ? firstDescentConstraintIndex
      : verticalPlan.constraints.length - 1;

    let phase: 'climb' | 'descent' | 'missed' = 'climb';
    let priorMinAltitude = -Infinity;
    let priorMaxAltitude = Infinity;
    let distanceFromPriorMinAltitude = 0;
    let requiredFpa = 0;

    for (let i = startIndex; i >= 0; i--) {
      const currentConstraint = verticalPlan.constraints[i];
      const currentConstraintDistance = VNavUtils.getConstraintDistanceFromLegs(currentConstraint, verticalPlan.constraints[i + 1], verticalPlan);

      let currentPhase: 'climb' | 'descent' | 'missed';
      switch (currentConstraint.type) {
        case 'climb':
        case 'missed':
          currentPhase = currentConstraint.type;
          break;
        default:
          currentPhase = 'descent';
      }

      if (currentPhase !== phase) {
        // Reset prior altitudes when switching phases.
        phase = currentPhase;
        priorMinAltitude = -Infinity;
        priorMaxAltitude = Infinity;
        distanceFromPriorMinAltitude = currentConstraintDistance;
      } else {
        distanceFromPriorMinAltitude += currentConstraintDistance;
      }

      let isDescentConstraint: boolean;
      let shouldInvalidate: boolean;
      switch (phase) {
        case 'climb':
        case 'missed':
          isDescentConstraint = false;
          shouldInvalidate = this.invalidateClimbConstraintFunc(
            currentConstraint,
            i,
            verticalPlan.constraints,
            firstDescentConstraintIndex,
            priorMinAltitude,
            priorMaxAltitude
          );
          break;
        default:
          isDescentConstraint = true;

          if (isFinite(priorMinAltitude) && isFinite(currentConstraint.maxAltitude)) {
            requiredFpa = Math.max(0, -VNavUtils.getFpa(distanceFromPriorMinAltitude, currentConstraint.maxAltitude - priorMinAltitude));
          } else {
            requiredFpa = 0;
          }

          shouldInvalidate = this.invalidateDescentConstraintFunc(
            currentConstraint,
            i,
            verticalPlan.constraints,
            priorMinAltitude,
            priorMaxAltitude,
            requiredFpa,
            this.maxFlightPathAngle
          );
      }

      const constraintLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, currentConstraint.index);

      if (shouldInvalidate) {
        constraintLeg.invalidConstraintAltitude = currentConstraint.minAltitude !== Number.NEGATIVE_INFINITY ? currentConstraint.minAltitude : currentConstraint.maxAltitude;
        verticalPlan.constraints.splice(i, 1);
        // Need to subtract current constraint distance because it will get added again at the beginning of the next iteration.
        // (The next constraint inherits the legs that belonged to the current constraint after it is removed.)
        distanceFromPriorMinAltitude -= currentConstraintDistance;

        // If we invalidated the first descent constraint, we need to find the new one.
        if (isDescentConstraint && i === firstDescentConstraintIndex) {
          firstDescentConstraintIndex = VNavUtils.getFirstDescentConstraintIndex(verticalPlan);
          verticalPlan.firstDescentConstraintLegIndex = verticalPlan.constraints[firstDescentConstraintIndex]?.index;
        }
      } else {
        constraintLeg.invalidConstraintAltitude = undefined;

        if (isFinite(currentConstraint.minAltitude)) {
          priorMinAltitude = currentConstraint.minAltitude;
          distanceFromPriorMinAltitude = 0;
        }

        if (isFinite(currentConstraint.maxAltitude)) {
          priorMaxAltitude = currentConstraint.maxAltitude;
        }
      }
    }

    // Update last descent leg in case we invalidated some descent constraints
    verticalPlan.lastDescentConstraintLegIndex = verticalPlan.constraints[VNavUtils.getLastDescentConstraintIndex(verticalPlan)]?.index;
  }

  /**
   * Finds previously invalidated constraints and re-inserts them into the vertical flight plan.
   * @param verticalPlan The Vertical Flight Plan.
   * @param lateralPlan The Lateral Flight Plan.
   */
  protected reinsertInvalidConstraints(verticalPlan: VerticalFlightPlan, lateralPlan: FlightPlan): void {

    const firstDescentConstraintIndex = verticalPlan.firstDescentConstraintLegIndex === undefined
      ? -1
      : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, verticalPlan.firstDescentConstraintLegIndex);

    // If there is a vertical direct-to active (and it has not been invalidated), skip all legs prior to and including
    // the direct-to.
    const startIndex = verticalPlan.constraints[firstDescentConstraintIndex]?.type === 'direct'
      ? (verticalPlan.firstDescentConstraintLegIndex as number + 1)
      : 0;

    let globalLegIndex = startIndex;
    for (const lateralLeg of lateralPlan.legs(false, startIndex)) {
      const verticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, globalLegIndex);

      if (verticalLeg.invalidConstraintAltitude !== undefined) {
        const constraintIndex = VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, globalLegIndex);
        const constraintAltitudes = SmoothingPathCalculator.getConstraintAltitudes(lateralLeg, this.legAltitudes);
        if (constraintAltitudes !== undefined) {
          const proposedConstraint = this.buildConstraint(verticalPlan, globalLegIndex, lateralLeg, constraintAltitudes, verticalLeg.name);
          verticalPlan.constraints.splice(constraintIndex + 1, 0, proposedConstraint);

          // If we re-validated a descent constraint, we need to update the first/last descent constraint when appropriate.
          if (
            proposedConstraint.type === 'descent'
            || proposedConstraint.type === 'manual'
            || proposedConstraint.type === 'direct'
            || proposedConstraint.type === 'dest'
          ) {
            if (verticalPlan.firstDescentConstraintLegIndex === undefined || globalLegIndex < verticalPlan.firstDescentConstraintLegIndex) {
              verticalPlan.firstDescentConstraintLegIndex = globalLegIndex;
            }
            if (verticalPlan.lastDescentConstraintLegIndex === undefined || globalLegIndex > verticalPlan.lastDescentConstraintLegIndex) {
              verticalPlan.lastDescentConstraintLegIndex = globalLegIndex;
            }
          }
        }
      }

      globalLegIndex++;
    }
  }

  /**
   * Populates a vertical flight plan's constraints with legs and updates the constraint distances and VNAV path
   * eligibility data.
   * @param verticalPlan The vertical flight plan for which to populate constraints.
   */
  protected populateConstraints(verticalPlan: VerticalFlightPlan): void {
    for (let constraintIndex = 0; constraintIndex < verticalPlan.constraints.length; constraintIndex++) {
      const constraint = verticalPlan.constraints[constraintIndex];
      const previousConstraint = verticalPlan.constraints[constraintIndex + 1];

      constraint.legs.length = 0;

      constraint.distance = VNavUtils.getConstraintDistanceFromLegs(constraint, previousConstraint, verticalPlan);

      let eligibleLegIndex = constraint.index + 1;
      let ineligibleLegIndex: number | undefined;

      for (let globalLegIndex = constraint.index; globalLegIndex > (previousConstraint !== undefined ? previousConstraint.index : -1); globalLegIndex--) {
        const verticalLeg = VNavUtils.getVerticalLegFromPlan(verticalPlan, globalLegIndex);
        constraint.legs.push(verticalLeg);

        if (ineligibleLegIndex === undefined && verticalLeg.isEligible) {
          eligibleLegIndex = globalLegIndex;
        }

        if (ineligibleLegIndex === undefined && !verticalLeg.isEligible) {
          ineligibleLegIndex = globalLegIndex;
        }
      }

      if (ineligibleLegIndex !== undefined) {
        constraint.nextVnavEligibleLegIndex = eligibleLegIndex;
      }
    }
  }

  /**
   * Computes the flight path angles for each constraint segment.
   * @param verticalPlan The Vertical Flight Plan.
   * @returns Whether the flight path angles were computed.
   */
  protected computeFlightPathAngles(verticalPlan: VerticalFlightPlan): boolean {

    // Iterate through all descent constraints in reverse flight plan order and attempt to assign one as a "target"
    // constraint, which is a constraint that anchors a constant FPA path connecting it to one or more prior
    // constraints.

    // Once a target constraint is found, the iteration continues as we attempt to build a constant FPA path backwards
    // from the target constraint that meets all the iterated constraints. Once we reach a constraint that cannot be
    // met with a constant FPA path from the target constraint that also meets all intermediate constraints, we assign
    // a new target constraint at the point where the FPA must change. Certain constraints must also be designated as
    // target constraints regardless of whether a constant FPA path through them is possible. In any case, once we
    // designate a new target constraint, the process is repeated until we run out of descent constraints.

    let currentTargetConstraint: VNavConstraint | undefined;
    let currentPathSegmentDistance = 0;
    let currentPathSegmentMinFpa = this.minFlightPathAngle;
    let currentPathSegmentMaxFpa = this.maxFlightPathAngle;
    let currentTargetConstraintHasFixedFpa = false;

    const firstDescentConstraintIndex = verticalPlan.firstDescentConstraintLegIndex === undefined
      ? -1
      : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, verticalPlan.firstDescentConstraintLegIndex);
    const lastDescentConstraintIndex = verticalPlan.lastDescentConstraintLegIndex === undefined
      ? -1
      : VNavUtils.getConstraintIndexFromLegIndex(verticalPlan, verticalPlan.lastDescentConstraintLegIndex);

    if (firstDescentConstraintIndex < 0 || lastDescentConstraintIndex < 0) {
      // There are no descent constraints, so no FPAs to be calculated
      return false;
    }

    for (let targetConstraintIndex = lastDescentConstraintIndex; targetConstraintIndex <= firstDescentConstraintIndex; targetConstraintIndex++) {
      const constraint = verticalPlan.constraints[targetConstraintIndex];

      // If the current constraint is climb or missed, skip it.
      if (constraint.type === 'climb' || constraint.type === 'missed') {
        continue;
      }

      // If we haven't found a target constraint yet, attempt to make the current constraint the target constraint,
      // if it defines either a minimum or maximum altitude. The target altitude is preferentially set to the minimum
      // altitude, if it exists. If the current constraint has neither a minimum nor maximum altitude (which should
      // technically never happen), skip it.
      if (!currentTargetConstraint) {

        if (constraint.minAltitude > Number.NEGATIVE_INFINITY || constraint.maxAltitude < Number.POSITIVE_INFINITY) {
          currentTargetConstraint = constraint;
          currentTargetConstraint.targetAltitude = constraint.minAltitude > Number.NEGATIVE_INFINITY ? constraint.minAltitude : constraint.maxAltitude;
          currentTargetConstraint.isTarget = true;
        } else { continue; }
      }

      // Reset the method variables
      currentPathSegmentMinFpa = this.minFlightPathAngle;
      currentPathSegmentMaxFpa = this.maxFlightPathAngle;
      currentPathSegmentDistance = currentTargetConstraint.distance;

      const currentTargetConstraintIsFirstDescentConstraint = targetConstraintIndex === firstDescentConstraintIndex;

      if (currentTargetConstraintIsFirstDescentConstraint) {

        if (currentTargetConstraint.type === 'descent') {
          // If this is the first descent constraint and it is not a direct or manual, set the FPA to the default value.
          currentTargetConstraint.fpa = this.flightPathAngle;
        }

        // If currentTargetConstraintIsFirstDescentConstraint is true, then after this logic, we're done with this method.
        return true;
      }

      // If the current target constraint is a manual or direct type, then honor the FPA by not allowing any other FPAs.
      if (currentTargetConstraint.type === 'manual') {
        currentPathSegmentMinFpa = currentTargetConstraint.fpa;
        currentPathSegmentMaxFpa = currentTargetConstraint.fpa;
        currentTargetConstraintHasFixedFpa = true;
      } else {
        currentTargetConstraintHasFixedFpa = false;
      }

      let pathSegmentIsFlat = false;
      let ineligibleFollowingConstraint = currentTargetConstraint.nextVnavEligibleLegIndex !== undefined
        ? currentTargetConstraint
        : undefined;

      for (let currentConstraintIndex = targetConstraintIndex + 1; currentConstraintIndex <= firstDescentConstraintIndex; currentConstraintIndex++) {

        const currentConstraint = verticalPlan.constraints[currentConstraintIndex];
        const isCurrentConstraintFirstDescent = currentConstraintIndex === firstDescentConstraintIndex;
        const isCurrentConstraintFaf = currentConstraint.index === verticalPlan.fafLegIndex;
        const isCurrentConstraintClimb = currentConstraint.type === 'climb' || currentConstraint.type === 'missed';
        const isCurrentConstraintManual = currentConstraint.type === 'manual';
        const isCurrentConstraintDirect = currentConstraint.type === 'direct';

        if (isCurrentConstraintClimb) {
          // We have reached a climb constraint.

          if (currentConstraintIndex - 1 > targetConstraintIndex) {
            // There is at least one constraint between the existing target constraint and the current climb
            // constraint. Attempt to extend the constant-FPA path through the constraint immediately following the
            // current climb constraint (which is guaranteed to be a descent constraint).

            currentTargetConstraint.fpa = MathUtils.clamp(this.flightPathAngle, currentPathSegmentMinFpa, currentPathSegmentMaxFpa);

            const maxAltitude = pathSegmentIsFlat ? currentTargetConstraint.targetAltitude : verticalPlan.constraints[currentConstraintIndex - 1].maxAltitude;
            const terminatedIndex = this.terminateSmoothedPath(
              verticalPlan,
              targetConstraintIndex,
              currentConstraintIndex,
              maxAltitude,
              false
            );

            if (terminatedIndex < currentConstraintIndex) {
              // The path was terminated early, which means there is a new target constraint.

              targetConstraintIndex = terminatedIndex - 1; // reduce the targetConstraintIndex by 1 because the for loop will +1 it.
              currentTargetConstraint = verticalPlan.constraints[terminatedIndex];
              break;
            }
          } else {
            // The existing target constraint immediately follows the current climb constraint. Treat the target
            // constraint as if it were the first descent constraint and apply the default FPA. Note that we are
            // guaranteed the target constraint is not a direct constraint.

            currentTargetConstraint.fpa = this.flightPathAngle;
          }

          // Do not designate a new target constraint in order to allow the outer loop to find the new one.

          targetConstraintIndex = currentConstraintIndex;
          currentTargetConstraint = undefined;

          break;
        }

        if (ineligibleFollowingConstraint) {
          // The constraint following the current one (in flight plan order) is path-ineligible. In this case, we will
          // attempt to make the current constraint the new target constraint since we cannot compute a valid path from
          // the current constraint to the target constraint.

          // Because the following constraint is path-ineligible, the FPA of the target constraint does not have to be
          // restricted by the current constraint, since the path between the two is undefined.
          currentTargetConstraint.fpa = MathUtils.clamp(this.flightPathAngle, currentPathSegmentMinFpa, currentPathSegmentMaxFpa);

          // Attempt to set the maximum altitude of the path from the current constraint to the current target
          // constraint to the minimum altitude of the current constraint, if it exists, or to the maximum altitude
          // otherwise. We will then clamp this from below using the current target constraint's target altitude. Since
          // we didn't restrict the current target constraint's FPA based on the current constraint, this ensures we
          // don't have to climb when traveling from the current constraint to the current target constraint. We will
          // also clamp from above using the prior (in flight plan order) maximum altitude constraint. This ensures we
          // don't have to descend when traveling to the current constraint.
          const currentConstraintTargetAltitude = currentConstraint.minAltitude > Number.NEGATIVE_INFINITY
            ? currentConstraint.minAltitude
            : currentConstraint.maxAltitude;
          const priorMaxAltitude = SmoothingPathCalculator.findPriorMaxAltitude(verticalPlan, currentConstraintIndex, firstDescentConstraintIndex);
          const maxAltitude = Math.min(Math.max(currentConstraintTargetAltitude, currentTargetConstraint.targetAltitude), priorMaxAltitude);

          const terminatedIndex = this.terminateSmoothedPath(
            verticalPlan,
            targetConstraintIndex,
            currentConstraintIndex,
            maxAltitude,
            true
          );

          if (terminatedIndex < currentConstraintIndex) {
            // The path was terminated early, which means there is a new target constraint.

            targetConstraintIndex = terminatedIndex - 1; // reduce the targetConstraintIndex by 1 because the for loop will +1 it.
            currentTargetConstraint = verticalPlan.constraints[terminatedIndex];
            break;
          } else {
            targetConstraintIndex = currentConstraintIndex - 1; // reduce the targetConstraintIndex by 1 because the for loop will +1 it.
            currentTargetConstraint = currentConstraint;
          }

          break;
        }

        const minAltitude = currentConstraint.minAltitude;
        const maxAltitude = currentConstraint.maxAltitude;

        if (pathSegmentIsFlat && maxAltitude - currentTargetConstraint.targetAltitude > 0) {
          // We are in a flat segment (all constraints with FPA = 0) and the current constraint would allow a
          // non-zero FPA to the constraint immediately following it. Therefore, we set the new target constraint
          // to the constraint immediately following the current one (because it is at the end of that constraint
          // where the FPA can potentially change from non-zero to zero). Note that we are guaranteed that the
          // new target constraint lies prior to the existing target constraint.

          const flatSegmentAltitude = currentTargetConstraint.targetAltitude;
          const newTargetConstraintIndex = currentConstraintIndex - 1;

          SmoothingPathCalculator.applyPathValuesToSmoothedConstraints(
            verticalPlan,
            targetConstraintIndex,
            newTargetConstraintIndex,
            // Maximum altitude is not needed because we are guaranteed that the target altitudes of all smoothed
            // constraints are equal to the flat segment altitude.
            Infinity,
            this.applyPathValuesResult
          );

          // reduce the targetConstraintIndex by 1 because the for loop will +1 it.
          targetConstraintIndex = newTargetConstraintIndex - 1;
          currentTargetConstraint = verticalPlan.constraints[newTargetConstraintIndex];
          currentTargetConstraint.targetAltitude = flatSegmentAltitude;
          currentTargetConstraint.isTarget = true;

          break;
        } else if (!currentTargetConstraintHasFixedFpa && maxAltitude - currentTargetConstraint.targetAltitude <= 0) {
          // The current constraint does not allow a non-zero FPA to the target constraint, and the target constraint
          // does not have a fixed FPA. We will mark the current segment as flat and set the target constraint FPA to 0.

          pathSegmentIsFlat = true;
          currentTargetConstraint.fpa = 0;

          if (isCurrentConstraintFirstDescent) {
            // If the current constraint is the first descent constraint, then we need to make it the new target
            // constraint because the first descent constraint is never flat.

            const flatSegmentAltitude = currentTargetConstraint.targetAltitude;

            SmoothingPathCalculator.applyPathValuesToSmoothedConstraints(
              verticalPlan,
              targetConstraintIndex,
              currentConstraintIndex,
              // Maximum altitude is not needed because we are guaranteed that the target altitudes of all smoothed
              // constraints are equal to the flat segment altitude.
              Infinity,
              this.applyPathValuesResult
            );

            // reduce the targetConstraintIndex by 1 because the for loop will +1 it.
            targetConstraintIndex = currentConstraintIndex - 1;
            currentTargetConstraint = verticalPlan.constraints[currentConstraintIndex];
            currentTargetConstraint.targetAltitude = flatSegmentAltitude;
            currentTargetConstraint.isTarget = true;

            break;
          }

          continue;
        }

        // Get the min and max FPA from the current target constraint to the current constraint.
        const minFpa = VNavUtils.getFpa(currentPathSegmentDistance, minAltitude - currentTargetConstraint.targetAltitude);
        const maxFpa = VNavUtils.getFpa(currentPathSegmentDistance, maxAltitude - currentTargetConstraint.targetAltitude);

        const isFpaOutOfBounds = minFpa > currentPathSegmentMaxFpa || maxFpa < currentPathSegmentMinFpa;

        // A new target constraint needs to be created under the following conditions:
        // - The current constraint cannot be met with a constant FPA path from the current target constraint within
        //   this calculator's FPA limits.
        // - The current constraint is the final approach fix.
        // - The current constraint is a vertical direct constraint.
        // - The current constraint is a manual constraint.
        if (isFpaOutOfBounds || isCurrentConstraintFaf || isCurrentConstraintManual || isCurrentConstraintDirect) {

          // We need to choose a FPA for the constant-FPA smoothed path.

          if (isFpaOutOfBounds) {
            // If we are creating a new target constraint because the current constraint can't be met with a
            // constant-FPA path, then we set the FPA of the smoothed path to the value that brings the new
            // target constraint's target altitude as close to meeting the current constraint as possible.
            if (minFpa > currentPathSegmentMaxFpa) {
              currentTargetConstraint.fpa = currentPathSegmentMaxFpa;
            } else {
              currentTargetConstraint.fpa = currentPathSegmentMinFpa;
            }
          } else {
            // If the new target constraint can be met with a constant-FPA path, then we choose a valid FPA that is
            // as close to the calculator's default FPA as possible.

            currentPathSegmentMinFpa = Math.max(minFpa, currentPathSegmentMinFpa);
            currentPathSegmentMaxFpa = Math.min(maxFpa, currentPathSegmentMaxFpa);

            currentTargetConstraint.fpa = MathUtils.clamp(this.flightPathAngle, currentPathSegmentMinFpa, currentPathSegmentMaxFpa);
          }

          // Set the maximum altitude of the path from the current constraint to the current target constraint to the
          // prior (in flight plan order) maximum altitude constraint. This ensures we don't have to descend when
          // traveling to the current constraint.
          const priorMaxAltitude = SmoothingPathCalculator.findPriorMaxAltitude(verticalPlan, currentConstraintIndex, firstDescentConstraintIndex);

          // Attempt to extend a constant-FPA path from the existing target constraint to the current constraint and
          // make the current constraint the new target constraint.

          const terminatedIndex = this.terminateSmoothedPath(
            verticalPlan,
            targetConstraintIndex,
            currentConstraintIndex,
            priorMaxAltitude,
            true
          );

          targetConstraintIndex = terminatedIndex - 1; // reduce the nextTargetConstraintIndex by 1 because the for loop will +1 it.
          currentTargetConstraint = verticalPlan.constraints[terminatedIndex];

          break;
        } else if (isCurrentConstraintFirstDescent) {
          // We have reached the first descent constraint without needing to create a new target constraint, so
          // attempt to extend the constant-FPA path from the existing target constraint through the first descent
          // constraint.

          currentPathSegmentMinFpa = Math.max(minFpa, currentPathSegmentMinFpa);
          currentPathSegmentMaxFpa = Math.min(maxFpa, currentPathSegmentMaxFpa);

          currentTargetConstraint.fpa = MathUtils.clamp(this.flightPathAngle, currentPathSegmentMinFpa, currentPathSegmentMaxFpa);

          const terminatedIndex = this.terminateSmoothedPath(
            verticalPlan,
            targetConstraintIndex,
            currentConstraintIndex + 1,
            currentConstraint.maxAltitude,
            false
          );

          if (terminatedIndex < currentConstraintIndex + 1) {
            // The path was terminated early, which means there is a new target constraint.

            targetConstraintIndex = terminatedIndex - 1; // reduce the nextTargetConstraintIndex by 1 because the for loop will +1 it.
            currentTargetConstraint = verticalPlan.constraints[terminatedIndex];
            break;
          } else {
            // The path was not terminated early, so we are done.
            return true;
          }
        } else {

          // Extend the current constant-FPA path and update the FPA limits
          currentPathSegmentMinFpa = Math.max(minFpa, currentPathSegmentMinFpa);
          currentPathSegmentMaxFpa = Math.min(maxFpa, currentPathSegmentMaxFpa);
          currentPathSegmentDistance += currentConstraint.distance;
        }

        ineligibleFollowingConstraint = currentConstraint.nextVnavEligibleLegIndex !== undefined
          ? currentConstraint
          : undefined;
      }
    }

    return true;
  }

  /**
   * Attempts to extend and terminate a constant-FPA path from an existing target constraint at another constraint,
   * applying flight path angles and target altitudes to each constraint along the path. The target constraint defines
   * the FPA of the path.
   *
   * If the target altitude of one of the constraints in the sequence, as prescribed by the path, violates a maximum
   * altitude, the path will be terminated at the constraint immediately following (in flight plan order) the violating
   * constraint, and FPA and target altitudes will not be written to the terminating constraint or any prior
   * constraints.
   * @param verticalPlan The vertical flight plan.
   * @param targetConstraintIndex The index of the target constraint.
   * @param terminatingConstraintIndex The index of the constraint at which to terminate the path.
   * @param maxAltitude The maximum allowable target altitude, in meters.
   * @param terminatingConstraintIsTarget Whether to designate the terminating constraint as a target constraint if the
   * path is not terminated early. If the path is terminated early, this argument is ignored and the constraint at
   * which the path was terminated early is always designated as a target constraint.
   * @returns The index of the constraint at which the constant-FPA path was actually terminated.
   */
  protected terminateSmoothedPath(
    verticalPlan: VerticalFlightPlan,
    targetConstraintIndex: number,
    terminatingConstraintIndex: number,
    maxAltitude: number,
    terminatingConstraintIsTarget: boolean
  ): number {
    const [maxAltitudeViolatedIndex, smoothedSegmentDistance] = SmoothingPathCalculator.applyPathValuesToSmoothedConstraints(
      verticalPlan,
      targetConstraintIndex,
      terminatingConstraintIndex,
      maxAltitude,
      this.applyPathValuesResult
    );

    if (terminatingConstraintIsTarget || maxAltitudeViolatedIndex !== undefined) {
      // A constant-FPA path was not able to be extended from the existing target constraint to the first descent
      // constraint, so we need to designate a new target constraint where the path terminated.

      const currentTargetConstraint = verticalPlan.constraints[targetConstraintIndex];

      // Establish the proposed next target constraint target altitude
      const proposedNewTargetConstraintAltitude =
        currentTargetConstraint.targetAltitude + VNavUtils.altitudeForDistance(currentTargetConstraint.fpa, smoothedSegmentDistance);

      const newTargetConstraintIndex = maxAltitudeViolatedIndex ?? terminatingConstraintIndex;

      // Set the new target constraint values
      const newTargetConstraint = verticalPlan.constraints[newTargetConstraintIndex];
      newTargetConstraint.isTarget = true;

      newTargetConstraint.targetAltitude = MathUtils.clamp(
        proposedNewTargetConstraintAltitude,
        newTargetConstraint.minAltitude,
        Math.min(newTargetConstraint.maxAltitude, maxAltitude)
      );
    }

    return maxAltitudeViolatedIndex ?? terminatingConstraintIndex;
  }


  /** @inheritdoc */
  public getFirstDescentConstraintAltitude(planIndex: number): number | undefined {
    const verticalPlan = this.getVerticalFlightPlan(planIndex);

    if (verticalPlan.constraints.length > 0) {
      for (let i = verticalPlan.constraints.length - 1; i >= 0; i--) {
        const constraint = verticalPlan.constraints[i];
        if (constraint.type !== 'climb') {
          return constraint.targetAltitude;
        }
      }
    }
    return undefined;
  }

  // Start of buildVerticalFlightPlan helper methods

  /**
   * Gets the constraint altitudes for a lateral flight plan leg.
   * @param leg A lateral flight plan leg.
   * @param out The tuple to which to write the altitudes, as `[minimum_altitude, maximum_altitude]`.
   * @returns The constraint altitudes, in meters, for the specified flight plan leg, as
   * `[minimum_altitude, maximum_altitude]`, or `undefined` if the leg does not define any altitude constraints.
   */
  protected static getConstraintAltitudes(leg: LegDefinition, out: [number, number]): [number, number] | undefined {
    if (leg.verticalData !== undefined) {
      switch (leg.verticalData.altDesc) {
        case AltitudeRestrictionType.At:
          out[0] = leg.verticalData.altitude1;
          out[1] = leg.verticalData.altitude1;
          return out;
        case AltitudeRestrictionType.AtOrAbove:
          out[0] = leg.verticalData.altitude1;
          out[1] = Number.POSITIVE_INFINITY;
          return out;
        case AltitudeRestrictionType.AtOrBelow:
          out[0] = Number.NEGATIVE_INFINITY;
          out[1] = leg.verticalData.altitude1;
          return out;
        case AltitudeRestrictionType.Between:
          out[0] = leg.verticalData.altitude2;
          out[1] = leg.verticalData.altitude1;
          return out;
      }
    }
    return undefined;
  }

  /**
   * Forces a constraint to an AT constraint.
   * @param constraint The constraint to force to an AT constraint.
   */
  protected static forceAtConstraint(constraint: VNavConstraint): void {
    if (constraint.minAltitude !== constraint.maxAltitude) {
      if (constraint.minAltitude > Number.NEGATIVE_INFINITY) {
        constraint.maxAltitude = constraint.minAltitude;
      } else {
        constraint.minAltitude = constraint.maxAltitude;
      }
    }
  }

  /**
   * Gets the global index of a flight plan's lateral direct-to target leg.
   * @param lateralPlan A flight plan.
   * @returns The global index of the flight plan's lateral direct-to target leg, or `undefined` if the plan does not
   * have an existing lateral direct-to.
   */
  protected static getDirectToTargetLegIndex(lateralPlan: FlightPlan): number | undefined {

    const directToData = lateralPlan.directToData;
    if (lateralPlan.length > 0 && directToData.segmentIndex > -1 && directToData.segmentLegIndex > -1) {
      const segment = lateralPlan.tryGetSegment(directToData.segmentIndex);

      if (segment !== null) {
        return segment.offset + directToData.segmentLegIndex;
      }
    }

    return undefined;
  }

  /**
   * Checks if there is a lateral direct-to leg in the flight plan and if so, flags the corresponding vertical flight
   * plan leg as such and marks the first descent constraint
   * @param lateralPlan The Lateral Flight Plan.
   * @param verticalPlan The Vertical Flight Plan.
   * @param directToLegOffset The offset of the lateral direct-to leg from the direct-to target leg.
   */
  protected static handleDirectToLegInVerticalPlan(lateralPlan: FlightPlan, verticalPlan: VerticalFlightPlan, directToLegOffset: number): void {

    // Check for a direct to in the lateral plan
    if (lateralPlan.directToData.segmentIndex > -1 && lateralPlan.directToData.segmentLegIndex > -1) {
      const directLateralLeg = lateralPlan.getLeg(lateralPlan.directToData.segmentIndex, lateralPlan.directToData.segmentLegIndex + directToLegOffset);

      if (BitFlags.isAll(directLateralLeg.flags, LegDefinitionFlags.DirectTo)) {
        const directVerticalLeg = VNavUtils.getVerticalLegFromSegmentInPlan(
          verticalPlan,
          lateralPlan.directToData.segmentIndex,
          lateralPlan.directToData.segmentLegIndex + directToLegOffset
        );

        directVerticalLeg.isDirectToTarget = true;
        const segment = verticalPlan.segments[lateralPlan.directToData.segmentIndex];
        if (segment !== undefined) {
          const globalLegIndex = segment.offset + lateralPlan.directToData.segmentLegIndex + directToLegOffset;
          for (let i = verticalPlan.constraints.length - 1; i >= 0; i--) {
            const constraint = verticalPlan.constraints[i];
            if (constraint.type !== 'climb' && constraint.type !== 'missed' && constraint.index >= globalLegIndex) {
              verticalPlan.firstDescentConstraintLegIndex = constraint.index;
              return;
            }
          }

          verticalPlan.firstDescentConstraintLegIndex = undefined;
        }
      }
    }
  }

  /**
   * Checks whether a leg constraint is part of the missed approach.
   * @param lateralSegment The lateral flight plan segment to which the constraint's leg belongs.
   * @param lateralLeg The lateral flight plan leg to which the constraint belongs.
   * @returns Whether the leg constraint is part of the missed approach.
   */
  protected static isConstraintInMissedApproach(lateralSegment: FlightPlanSegment, lateralLeg: LegDefinition): boolean {

    if (lateralSegment.segmentType === FlightPlanSegmentType.Approach && BitFlags.isAny(lateralLeg.flags, LegDefinitionFlags.MissedApproach)) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether a leg constriant is a descent constraint and is higher than the prior descent leg constraint.
   * @param previousConstrant The previous VNav Constraint.
   * @param currentConstraint The current VNav Constraint.
   * @returns Whether the current constraint is higher than the previous constraint.
   */
  protected static isConstraintHigherThanPriorConstraint(previousConstrant: VNavConstraint, currentConstraint: VNavConstraint): boolean {
    const currentMinWithPrecision = Math.round(currentConstraint.minAltitude * 10) / 10;
    const priorMaxWithPrecision = Math.round(previousConstrant.maxAltitude * 10) / 10;

    if (currentMinWithPrecision > priorMaxWithPrecision) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether a leg constraint requires an FPA greater than the max allowed value.
   * @param previousConstrant The previous VNavConstraint.
   * @param currentConstraint The VNavConstraint being evaluated.
   * @param verticalPlan The vertical flight plan.
   * @param maxFpa The maximum FPA allowed.
   * @returns Whether this constraint requires an invalid FPA.
   */
  protected static doesConstraintRequireInvalidFpa(
    previousConstrant: VNavConstraint,
    currentConstraint: VNavConstraint,
    verticalPlan: VerticalFlightPlan,
    maxFpa: number
  ): boolean {

    if (currentConstraint.maxAltitude < Number.POSITIVE_INFINITY && previousConstrant.minAltitude >= 0) {
      const constraintDistance = VNavUtils.getConstraintDistanceFromLegs(currentConstraint, previousConstrant, verticalPlan);
      const minFpaTempValue = VNavUtils.getFpa(constraintDistance, Math.abs(currentConstraint.maxAltitude - previousConstrant.minAltitude));

      if (minFpaTempValue > maxFpa) {
        return true;
      }
    }
    return false;
  }

  /**
   * The default function which checks whether a lateral flight plan leg is eligible for VNAV.
   * @param lateralLeg A lateral flight plan leg.
   * @returns Whether the specified leg is eligible for VNAV.
   */
  public static isLegVnavEligible(lateralLeg: LegDefinition): boolean {
    switch (lateralLeg.leg.type) {
      case LegType.VM:
      case LegType.FM:
      case LegType.Discontinuity:
      case LegType.ThruDiscontinuity:
        return false;
      default:
        return true;
    }
  }

  /**
   * The default function which checks whether a climb constraint should be invalidated. This function always returns
   * `false`.
   * @returns Whether the specified climb constraint should be invalidated (always `false`).
   */
  public static invalidateClimbConstraint(): boolean {
    return false;
  }

  /**
   * The default function which checks whether a descent constraint should be invalidated.
   * @param constraint A descent constraint.
   * @param index The index of the constraint to check.
   * @param constraints The array of VNAV constraints currently in the vertical flight plan.
   * @param priorMinAltitude The most recent minimum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param priorMaxAltitude The most recent maximum altitude, in meters, defined by a VNAV constraint prior to the
   * constraint to check. Only prior constraints connected to the constraint to check by a contiguous sequence of
   * descent constraints are included.
   * @param requiredFpa The minimum flight path angle, in degrees, required to meet the maximum altitude of the
   * constraint to check, assuming a descent starting from the constraint defining the most recent prior minimum
   * altitude. Positive values indicate a descending path. If there is no required FPA because there is no defined
   * prior minimum altitude or maximum altitude for the constraint to check, or if the constraint to check is higher
   * than the prior minimum altitude, then this value will equal zero.
   * @param maxFpa The maximum allowed flight path angle, in degrees. Positive values indicate a descending path.
   * @returns Whether the specified descent constraint should be invalidated.
   */
  public static invalidateDescentConstraint(
    constraint: VNavConstraint,
    index: number,
    constraints: readonly VNavConstraint[],
    priorMinAltitude: number,
    priorMaxAltitude: number,
    requiredFpa: number,
    maxFpa: number
  ): boolean {
    return (isFinite(constraint.minAltitude) && MathUtils.round(constraint.minAltitude, 10) > MathUtils.round(priorMaxAltitude, 10)) || requiredFpa > maxFpa;
  }

  // Start of computeFlightPathAngles helper methods

  /**
   * Finds the maximum altitude, in meters, of the constraint that defines a maximum altitude and is closest to a
   * given constraint, among all constraints prior to and including (in flight plan order) the given constraint. If a
   * vertical direct constraint is among the candidates, its minimum altitude is used if it does not define a maximum
   * altitude.
   * @param verticalPlan The vertical flight plan.
   * @param constraintIndex The index of the constraint for which to find the closest prior maximum altitude.
   * @param firstDescentConstraintIndex The index of the first descent constraint.
   * @returns The maximum altitude, in meters, of the constraint that defines a maximum altitude and is closest to the
   * specified constraint, among all constraints prior to and including (in flight plan order) the specified
   * constraint, or `Infinity` if there is no such altitude.
   */
  protected static findPriorMaxAltitude(
    verticalPlan: VerticalFlightPlan,
    constraintIndex: number,
    firstDescentConstraintIndex: number
  ): number {

    for (let i = constraintIndex; i <= firstDescentConstraintIndex; i++) {
      const constraint = verticalPlan.constraints[i];

      if (constraint.maxAltitude < Infinity) {
        return constraint.maxAltitude;
      }

      if (i === firstDescentConstraintIndex && constraint.type === 'direct') {
        if (constraint.minAltitude > -Infinity) {
          return constraint.minAltitude;
        }
      }
    }

    return Infinity;
  }

  /**
   * Applies flight path angle and target altitude values to a sequence of constraints connected to a target constraint
   * by a constant-FPA path extending backwards from the target constraint. The target constraint defines the FPA of
   * the path.
   *
   * If the target altitude of one of the constraints in the sequence, as prescribed by the path, violates a maximum
   * altitude, the path will be terminated at the constraint immediately following (in flight plan order) the violating
   * constraint, and FPA and target altitudes will not be written to the terminating constraint or any prior
   * constraints.
   * @param verticalPlan The vertical flight plan.
   * @param targetConstraintIndex The index of the target constraint.
   * @param endConstraintIndex The index of the constraint at which the constant-FPA path ends, exclusive.
   * @param maxAltitude The maximum allowable target altitude, in meters.
   * @param out The tuple to which to write the result of the operation.
   * @returns `[index, distance]`, where `index` is the index of the constraint at which the path was terminated due to
   * violation of the maximum target altitude, or `undefined` if no constraint violated the maximum altitude, and
   * `distance` is the total distance of the path, in meters.
   */
  protected static applyPathValuesToSmoothedConstraints(
    verticalPlan: VerticalFlightPlan,
    targetConstraintIndex: number,
    endConstraintIndex: number,
    maxAltitude: number,
    out: [number | undefined, number]
  ): [number | undefined, number] {

    const currentTargetConstraint = verticalPlan.constraints[targetConstraintIndex];

    let distance = currentTargetConstraint.distance;

    for (let i = targetConstraintIndex + 1; i < endConstraintIndex; i++) {
      const smoothedConstraint = verticalPlan.constraints[i];
      const targetAltitude = currentTargetConstraint.targetAltitude + VNavUtils.altitudeForDistance(currentTargetConstraint.fpa, distance);

      // The path can continue past the current constraint if the target altitude at the current constraint is less
      // than the maximum altitude.
      if (targetAltitude < maxAltitude) {
        smoothedConstraint.fpa = currentTargetConstraint.fpa;
        smoothedConstraint.targetAltitude = targetAltitude;

        distance += smoothedConstraint.distance;
      } else {
        out[0] = i;
        out[1] = distance;
        return out;
      }
    }

    out[0] = undefined;
    out[1] = distance;
    return out;
  }
}