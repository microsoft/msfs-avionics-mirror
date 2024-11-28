/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  AltitudeRestrictionType, BasicNavAngleSubject, BasicNavAngleUnit, BitFlags, FacilityType, FixTypeFlags, FlightPathUtils, FlightPlan, FlightPlanSegment,
  FlightPlanSegmentType, FlightPlanUtils, GeoPoint, GeoPointSubject, ICAO, LegDefinition, LegDefinitionFlags, LegType, MagVar, MappedSubject,
  MappedSubscribable, NumberUnitSubject, PerformancePlanRepository, SpeedRestrictionType, SpeedUnit, Subject, Subscribable, SubscribableUtils, Subscription,
  UnitType, UserSettingManager, VerticalFlightPhase, Wait
} from '@microsoft/msfs-sdk';

import { Epic2ExtraLegDefinitionFlags, Epic2FlightPlans, Epic2FmsUtils, Epic2UserDataKeys } from '../Fms';
import { Epic2PerformancePlan, Epic2SpeedPredictions } from '../Performance';
import { MfdAliasedUserSettingTypes } from '../Settings';
import { UnitsUserSettingManager } from '../Settings/UnitsUserSettings';
import { FlightPlanBaseData, FlightPlanBaseListData } from './FlightPlanDataTypes';
import { FlightPlanSegmentData, FlightPlanSegmentListData } from './FlightPlanSegmentListData';
import { FlightPlanStore } from './FlightPlanStore';

const airwayRegex = new RegExp(/\..*/);

/**
 * Represents a flight plan leg in a list.
 * Wraps a {@link FlightPlanLegData} object.
 * Contains fields specific to flight plan lists.
 */
export class FlightPlanLegListData implements FlightPlanBaseListData {
  /** @inheritdoc */
  public readonly type = 'leg';

  private readonly _isVisible = Subject.create(true);
  /** @inheritdoc */
  public readonly isVisible = this._isVisible as Subscribable<boolean>;

  /** If this leg is in the process of being removed */
  public readonly isBeingRemoved = Subject.create(false);

  /** If this waypoint is new, only relevant to the pending plan */
  public readonly isNew = Subject.create(false);

  /** Whether this leg is the first visible leg in a segment. */
  public readonly isFirstVisibleLegInSegment = Subject.create(false);

  /** Whether there are hidden airway legs before this one, should only apply to last leg in collapsed airway. */
  public readonly hasHiddenAirwayLegsBefore = Subject.create(false);

  /** Airway exit text. */
  public readonly airwayExitText = MappedSubject.create(([hasHiddenLegsBefore, airway]) => {
    if (!hasHiddenLegsBefore || airway === undefined) {
      return '';
    }

    return `${this.legData.leg.name} exit Airway ${airway.replace(airwayRegex, '')}`;
  }, this.hasHiddenAirwayLegsBefore, this.legData.segmentData?.airway ?? Subject.create(undefined));

  private readonly _isFullyCollapsedAirwayExit = this.segmentListData
    ? MappedSubject.create(
      ([isInAirwaySegment, isInCollapsedAirway, segmentIndex, isLastLegInSegment, activeLegSegmentIndex]) => {
        return isInAirwaySegment && isInCollapsedAirway && isLastLegInSegment && activeLegSegmentIndex !== segmentIndex;
      },
      this.legData.isInAirwaySegment,
      this.segmentListData.isCollapsed,
      this.segmentListData.segmentData.segmentIndex,
      this.legData.isLastLegInSegment,
      this.store.activeLegSegmentIndex
    )
    : Subject.create(false);
  public readonly isFullyCollapsedAirwayExit = this._isFullyCollapsedAirwayExit as Subscribable<boolean>;

  /** The leg DTK for displaying in certain places like the flight plan page.
   * Changes when this is the active leg and stuff like that. */
  public readonly displayDtk = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));
  private readonly displayDtkSubs = [] as Subscription[];


  /** The leg distance, but meant for display in a list. Can change when active leg, and more.
   * Shows segment distance for collapsed airway exit. */
  public readonly displayDistance = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));
  private readonly displayDistanceSubs = [] as Subscription[];

  /** Estimated time Enroute of the leg, in seconds duration. How long it will take to fly the leg.
   * Shows the segment ETE for collapsed airway exit. */
  public readonly displayEte = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly eteSubs = [] as Subscription[];

  private readonly subs = [] as Subscription[];

  /**
   * FlightPlanLegListData constructor.
   * @param legData The flight plan leg data to wrap.
   * @param segmentListData The segment list data that this leg belong's to. Not required for random direct to leg.
   * @param store The flight plan store this belongs to.
   * @param unitsSettingManager The units setting manager.
   */
  public constructor(
    public readonly legData: FlightPlanLegData,
    public readonly segmentListData: FlightPlanSegmentListData | undefined,
    private readonly store: FlightPlanStore,
    private readonly unitsSettingManager: UnitsUserSettingManager
  ) {
    if (this.segmentListData) {
      this.subs.push(this.segmentListData.isCollapsed.sub(() => this.updateVisibility()));
    }
    this.subs.push(this.legData.isActiveLeg.sub(() => this.updateVisibility()));
    this.subs.push(this.legData.isBehindActiveLeg.sub(() => this.updateVisibility()));
    this.subs.push(this.store.fromLeg.sub(() => this.updateVisibility()));
    this.subs.push(this.store.activeLeg.sub(() => this.updateVisibility()));
    this.subs.push(this.legData.globalLegIndex.sub(() => this.updateVisibility()));
    this.subs.push(this.store.activeLegGlobalIndex.sub(() => this.updateVisibility()));
    this.subs.push(this.legData.isLastLegInSegment.sub(() => this.updateVisibility()));
    this.subs.push(this.store.directToData.sub(() => this.updateVisibility()));
    this.subs.push(this.isBeingRemoved.sub(() => this.updateVisibility()));
    this.subs.push(this.store.isInHold.sub(() => this.updateVisibility()));
    // this.subs.push(this.store.fms.dtoWasCreatedInModPlan.sub(() => this.updateVisibility()));
    this.updateVisibility();

    this.isFullyCollapsedAirwayExit.sub(this.updateDisplayDtkSubs.bind(this));
    this.subs.push(this.unitsSettingManager.navAngleUnits.sub(this.updateDisplayDtkSubs.bind(this)));
    this.subs.push(legData.isActiveLeg.sub(this.updateDisplayDtkSubs.bind(this)));
    this.subs.push(legData.isBehindActiveLeg.sub(this.updateDisplayDtkSubs.bind(this)));
    this.updateDisplayDtkSubs();

    this.isFullyCollapsedAirwayExit.sub(this.updateDistanceSubs);
    this.subs.push(legData.isActiveLeg.sub(this.updateDistanceSubs));
    this.subs.push(legData.isBehindActiveLeg.sub(this.updateDistanceSubs));
    this.updateDistanceSubs();

    this.isFullyCollapsedAirwayExit.sub(this.updateEteSubs);
    this.updateEteSubs();

    this.subs.push(this.store.legAdded.on(() => this.updateHoldStatus()));
    this.subs.push(this.store.legRemoved.on(() => this.updateHoldStatus()));
    this.updateHoldStatus();
  }

  /**
   * Updates this leg's hold status
   */
  private updateHoldStatus(): void {
    const plan = this.store.fms.getFlightPlan(this.store.planIndex);
    const nextLeg = plan.getNextLeg(this.legData.segment.segmentIndex, this.legData.segmentLegIndex.get());

    this.legData.isHoldLeg.set(Epic2FmsUtils.isHoldAtLeg(nextLeg?.leg.type ?? 0) || Epic2FmsUtils.isHoldAtLeg(this.legData.leg.leg.type));
  }

  /** Updates the leg's visibility. */
  private updateVisibility(): void {
    this._isVisible.set(this.getVisibility());
  }

  /**
   * Checks whether the leg is being removed by the current direct to
   * @returns a boolean
   */
  public checkIfDtoRemovingLeg(): boolean {
    const plan = this.legData.plan;
    const isDtoPendingActive = this.legData.planIndex === Epic2FlightPlans.Pending && this.store.fms.dtoWasCreatedInModPlan.get();
    const dtoOriginalLeg = plan.getUserData<number>(Epic2UserDataKeys.USER_DATA_KEY_DIRECT_TO_ORIGIN);
    const behindActive = this.legData.isBehindActiveLeg.get();
    const behindDto = this.legData.globalLegIndex.get() < (dtoOriginalLeg ?? -1);
    const dtoSourceLegIndex = dtoOriginalLeg && plan.directToData.segmentIndex !== -1 && plan.directToData.segmentLegIndex !== -1
        && Epic2FmsUtils.getGlobalLegIndex(plan, plan.directToData.segmentIndex, plan.directToData.segmentLegIndex);
    const isPartOfDto = BitFlags.isAny(this.legData.leg.flags, LegDefinitionFlags.DirectTo) || dtoSourceLegIndex === this.legData.globalLegIndex.get();

    // If there is no active DTO, or there is but the plan is pending, then we hide any legs before the active leg
    return ((!isDtoPendingActive && behindActive)
    // If there is an active DTO and the plan is not pending, then we hide legs that are behind both the active leg
    // and the leg which the DTO originates from, or behind the active leg and that are flagged as part of the DTO
    || (isDtoPendingActive && behindActive && (behindDto || isPartOfDto)));
  }

  /**
   * Checks if the leg has been displaced by the creation of a dto
   * @returns boolean
   */
  private checkLegIsDisplacedByDto(): boolean {
    const plan = this.store.fms.getFlightPlan(this.legData.planIndex);
    if (plan.directToData.segmentIndex !== -1) {
      const dtoSegment = plan.tryGetSegment(plan.directToData.segmentIndex);

      if (dtoSegment) {
        for (const dtoLeg of dtoSegment.legs) {
          if (this.legData.leg.leg.fixIcao == dtoLeg.leg.fixIcao /*&& !BitFlags.isAny(leg.legData.leg.flags, LegDefinitionFlags.DirectTo)*/) {
            return true;
          }
        }
      }
    }

    return false;
  }


  /**
   * Updates the leg's visibility.
   * @returns Whether the leg should be visible or not. */
  private getVisibility(): boolean {
    // If this is false, the leg should never be visible
    if (!this.legData.isVisibleLegType) {
      return false;
    }
    if (Epic2FmsUtils.isHoldAtLeg(this.legData.leg.leg.type) && !this.legData.isActiveLeg.get()) {
      return false;
    }
    if (this.checkIfDtoRemovingLeg()) {
      return false;
    }
    if (this.store.isInHold.get() && this.legData.isFromLeg.get()) { return false; }
    if (!this.segmentListData) { return true; }

    if (BitFlags.isAny(this.legData.leg.flags, Epic2ExtraLegDefinitionFlags.DirectToOrigin)) { return false; }

    if (this.isBeingRemoved.get() && (BitFlags.isAny(this.legData.leg.flags, LegDefinitionFlags.DirectTo) || this.checkLegIsDisplacedByDto())) { return false; }

    const isInCollapsedAirway = this.segmentListData.isCollapsed.get();

    if (isInCollapsedAirway) {
      const isActiveLeg = this.legData.isActiveLeg.get();
      const isFromLeg = this.store.fromLeg.get() === this.legData.leg;
      const activeLeg = this.store.activeLeg.get();
      const isActiveLegInSameAirway = activeLeg && this.legData.segment.legs.includes(activeLeg);
      const isLegAfterActiveLeg = isActiveLegInSameAirway && this.legData.globalLegIndex.get() === ((this.store.activeLegGlobalIndex.get() ?? -1) + 1);
      const isLastLegInAirway = this.legData.isLastLegInSegment.get();
      return isActiveLeg || isFromLeg || isLegAfterActiveLeg || isLastLegInAirway;
    }

    return true;
  }

  /** Updates the data source for the display dtk. */
  private updateDisplayDtkSubs(): void {
    const { legData } = this;

    this.displayDtkSubs.forEach(sub => sub.destroy());

    const isActiveLeg = legData.isActiveLeg.get();
    const isBehindActiveLeg = legData.isBehindActiveLeg.get();
    const shouldInhibitDtk = this.isFullyCollapsedAirwayExit.get();
    const navAngleUnits = this.unitsSettingManager.navAngleUnits.get();

    if (isBehindActiveLeg) {
      this.displayDtk.set(NaN);
    } else if (legData.isHeadingLeg) {
      this.displayDtk.set(NaN);
    } else if (isActiveLeg) {
      if (navAngleUnits.isMagnetic()) {
        this.displayDtkSubs.push(this.store.activeLegDtkMag.sub(x => this.displayDtk.set(x.number, legData.initialDtk.get().unit.magVar), true));
        this.displayDtkSubs.push(legData.initialDtk.sub(x => this.displayDtk.set(this.displayDtk.get().number, x.unit.magVar), true));
      } else {
        this.displayDtkSubs.push(this.store.activeLegDtkTrue.sub(x => this.displayDtk.set(x), true));
      }
    } else if (shouldInhibitDtk) {
      this.displayDtk.set(NaN);
    } else {
      this.displayDtkSubs.push(legData.initialDtk.pipe(this.displayDtk));
    }

    // Calculate if considered a large turn
    if (legData.globalLegIndex.get() > 0) {
      const priorLeg = legData.plan.getLeg(legData.globalLegIndex.get() - 1);
      if (priorLeg.calculated && legData.leg.calculated && legData.leg.calculated.endLat && legData.leg.calculated.endLon) {
        const priorFinalTrueCourse = FlightPathUtils.getLegFinalCourse(priorLeg.calculated);
        const priorFinalCourse = priorFinalTrueCourse && MagVar.trueToMagnetic(priorFinalTrueCourse, legData.leg.calculated.endLat, legData.leg.calculated.endLon);
        const currentInitialCourse = legData.leg.calculated.initialDtk;

        if (priorFinalCourse && currentInitialCourse) {
          let turnAngle = Math.abs(currentInitialCourse - priorFinalCourse);
          if (turnAngle > 180) {
            turnAngle = 360 - turnAngle;
          }
          legData.isLargeTurn.set(turnAngle > 125);
        }
      }
    }
  }

  private readonly updateDistanceSubs = (): void => {
    const { legData } = this;

    this.displayDistanceSubs.forEach(sub => sub.destroy());

    const isActiveLeg = legData.isActiveLeg.get();
    const isBehindActiveLeg = legData.isBehindActiveLeg.get();
    const shouldShowSegmentDistance = this.isFullyCollapsedAirwayExit.get();

    if (isBehindActiveLeg) {
      this.displayDistance.set(NaN);
    } else if (legData.isHoldLeg.get()) {
      this.displayDistance.set(NaN);
    } else if (isActiveLeg) {
      this.displayDistanceSubs.push(this.store.activeLegDistance.pipe(this.displayDistance));
    } else if (shouldShowSegmentDistance) {
      this.displayDistanceSubs.push(legData.segmentData!.distance.pipe(this.displayDistance));
    } else {
      this.displayDistanceSubs.push(legData.distance.pipe(this.displayDistance));
    }
  };

  private readonly updateEteSubs = (): void => {
    const { legData } = this;

    this.eteSubs.forEach(sub => sub.destroy());

    const shouldShowSegmentDistance = this.isFullyCollapsedAirwayExit.get();

    if (shouldShowSegmentDistance) {
      this.eteSubs.push(legData.segmentData!.estimatedTimeEnroute.pipe(this.displayEte));
    } else {
      this.eteSubs.push(legData.estimatedTimeEnroute.pipe(this.displayEte));
    }
  };

  /** Call when this leg is removed from the list. */
  public destroy(): void {
    this.subs.forEach(x => x.destroy());
    this.displayDtkSubs.forEach(sub => sub.destroy());
    this.displayDistanceSubs.forEach(sub => sub.destroy());
    this.eteSubs.forEach(sub => sub.destroy());

    if ('destroy' in this._isFullyCollapsedAirwayExit) {
      this._isFullyCollapsedAirwayExit.destroy();
    }
  }
}

/**
 * Represents a flight plan leg data object.
 * It stores lots of useful info about the leg in handy dandy subscribables.
 */
export class FlightPlanLegData implements FlightPlanBaseData {
  /** @inheritdoc */
  public readonly type = 'leg';

  /** Whether this leg's flags and leg type allow for the leg to be visible. */
  public readonly isVisibleLegType: boolean = !(
    (BitFlags.isAny(this.leg.flags, LegDefinitionFlags.DirectTo) && !BitFlags.isAny(this.leg.flags, Epic2ExtraLegDefinitionFlags.DirectToTarget))
  );

  /** The global index of this leg. */
  public readonly globalLegIndex = Subject.create(-1);

  /** The index of this leg in its segment. */
  public readonly segmentLegIndex = Subject.create(-1);

  /** Whether this leg is the first leg in its segment. */
  public readonly isFirstLegInSegment = this.segmentLegIndex.map(x => x === 0);

  private readonly _isLastLegInSegment = Subject.create(false);
  /** Whether this leg is the first leg in its segment. */
  public readonly isLastLegInSegment = this._isLastLegInSegment as Subscribable<boolean>;

  /** Whether this leg is in the departure segment. */
  public readonly isInDepartureSegment = this.segment.segmentType === FlightPlanSegmentType.Departure;

  /** Whether this leg is in the arrival segment. */
  public readonly isInArrivalSegment = this.segment.segmentType === FlightPlanSegmentType.Arrival;

  /** Whether this leg is in the approach segment. */
  public readonly isInApproachSegment = this.segment.segmentType === FlightPlanSegmentType.Approach;

  /** Whether this leg is in the missed approach. */
  public readonly isInMissedApproach = BitFlags.isAll(this.leg.flags, LegDefinitionFlags.MissedApproach);

  /** Whether this leg is a runway. */
  public readonly isRunway = ICAO.isFacility(this.leg.leg.fixIcao, FacilityType.RWY);

  /** Whether this leg is an airport. */
  public readonly isAirport = ICAO.isFacility(this.leg.leg.fixIcao, FacilityType.Airport);

  /** Whether this leg is the origin */
  public readonly isOrigin = this.isAirport && (this.segment.segmentType === FlightPlanSegmentType.Departure || this.segment.segmentType === FlightPlanSegmentType.Origin);

  /** Whether this leg is the destination */
  public readonly isDestination = this.isAirport && (this.segment.segmentType === FlightPlanSegmentType.Arrival || this.segment.segmentType === FlightPlanSegmentType.Destination);

  /** Whether this leg is the MAP leg. */
  public readonly isMissedApproachPoint = BitFlags.isAll(this.leg.leg.fixTypeFlags, FixTypeFlags.MAP);

  /** Whether this leg is a runway in the approach segment. */
  public readonly isApproachRunwayLeg = this.isInApproachSegment && this.isRunway;

  /** Whether this leg is in an airway segment. */
  public readonly isInAirwaySegment = this.segmentData?.isAirway ?? Subject.create(false) as Subscribable<boolean>;

  /** Whether this is currently the first leg in the plan. */
  public readonly isFirstLegInPlan = Subject.create(false);

  /** Whether this is the active leg in the flight plan. */
  public readonly isActiveLeg = Subject.create(false);

  /** Whether this is the FROM leg in the flight plan. */
  public readonly isFromLeg = Subject.create(false);

  /** Whether this leg is before the active leg. */
  public readonly isBehindActiveLeg = Subject.create(false);

  /** Whether this is a direct to leg. */
  public readonly isDtoLeg = this.store.directToExistingLeg.map(x => x === this.leg);

  /** Whether this leg is before the active DTO leg */
  public readonly isPriorToDtoLeg = Subject.create(false);

  // Leg type info

  public readonly isHoldLeg = Subject.create<boolean>(FlightPlanUtils.isHoldLeg(this.leg.leg.type));

  public readonly isHeadingLeg = FlightPlanUtils.isHeadingToLeg(this.leg.leg.type);

  public readonly isArcLeg = Epic2FmsUtils.isArcLeg(this.leg.leg.type);

  public readonly isProcedureTurn = this.leg.leg.type === LegType.PI;

  public readonly isFlyover = this.leg.leg.flyOver === true;

  // Altitude constraint

  /** The altitude restriction type to use for the altitude constraint. */
  public readonly altDesc = Subject.create(AltitudeRestrictionType.Unused);

  /** The altitude 1 to use for the altitude constraint. */
  public readonly altitude1 = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** The altitude 2 to use for the altitude constraint. */
  public readonly altitude2 = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** Whether the altitude constraint is designated or not. */
  public readonly isAltitudeDesignated = Subject.create(false);

  /** Whether this leg's altitude constraint is different from the published constraint. */
  public readonly isAltitudeEdited = Subject.create(false);

  /** Whether this leg's altitude constraint is invalid or not. */
  public readonly isAltitudeInvalid = Subject.create(false);

  /** Whether this leg's altitude constraint is editable. */
  public readonly isAltitudeEditable = Subject.create(false);

  /** Whether this leg's altitude constraint is visible. */
  public readonly isAltitudeVisible = Subject.create(false);

  /** The altitude 1 to use for the altitude constraint, but for display in a list. */
  public readonly altitude1Display = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** The altitude 2 to use for the altitude constraint, but for display in a list. */
  public readonly altitude2Display = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** Whether this leg's altitude should be display in cyan or not. */
  public readonly isAltitudeCyan = MappedSubject.create(([isDesignated, altitude1, isBehindActiveLeg, isAltitudeEditable]) => {
    if (isBehindActiveLeg) { return true; }
    if (altitude1.isNaN()) { return true; }
    if (isDesignated === true && isAltitudeEditable === true) { return true; }
    return false;
  }, this.isAltitudeDesignated, this.altitude1, this.isBehindActiveLeg, this.isAltitudeEditable);

  /** The alt desc, but for display in a list. */
  public readonly altDescDisplay = MappedSubject.create(([altDesc, isBehindActiveLeg]) => {
    if (isBehindActiveLeg) {
      return AltitudeRestrictionType.Unused;
    } else {
      return altDesc;
    }
  }, this.altDesc, this.isBehindActiveLeg);

  /** Whether the altitude is edited, but for display in a list. */
  public readonly isAltitudeEditedDisplay = MappedSubject.create(([isAltitudeEdited, isBehindActiveLeg]) => {
    if (isBehindActiveLeg) {
      return false;
    } else {
      return isAltitudeEdited;
    }
  }, this.isAltitudeEdited, this.isBehindActiveLeg);

  /** Whether the altitude is invalid, but for display in a list. */
  public readonly isAltitudeInvalidDisplay = MappedSubject.create(([isAltitudeInvalid, isBehindActiveLeg]) => {
    if (isBehindActiveLeg) {
      return false;
    } else {
      return isAltitudeInvalid;
    }
  }, this.isAltitudeInvalid, this.isBehindActiveLeg);

  /** Whether the altitude is editable, but for display in a list. */
  public readonly isEditableDisplay = MappedSubject.create(([isAltitudeConstraintEditable, isBehindActiveLeg]) => {
    if (isBehindActiveLeg) {
      return false;
    } else {
      return isAltitudeConstraintEditable;
    }
  }, this.isAltitudeEditable, this.isBehindActiveLeg);

  private readonly _isAltitudeTempCompensated = Subject.create<boolean>(false);
  public readonly isAltitudeTempCompensated = this._isAltitudeTempCompensated as Subscribable<boolean>;

  // Speed constraint

  /** The master speed prediction mapping */
  private _speed?: MappedSubscribable<number>;

  /** This leg's speed constraint speed. */
  public readonly speed = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  /** This leg's speed constraint units. */
  public readonly speedUnit = Subject.create(SpeedUnit.IAS);

  /** This leg's speed constraint type. */
  public readonly speedDesc = Subject.create(SpeedRestrictionType.Unused);

  /** Whether this leg's speed constraint is different from the published speed. */
  public readonly isSpeedEdited = Subject.create(false);

  /** Whether this leg's speed constraint is invalid or not. */
  public readonly isSpeedInvalid = Subject.create(false);

  // Flight path angle

  /**
   * This leg's flight path angle, in degrees, or `NaN` if there is no defined flight path angle. Positive values
   * indicate a descending path.
   */
  public readonly fpa = Subject.create(NaN, SubscribableUtils.NUMERIC_NAN_EQUALITY);

  /** Whether this leg's fpa has been set by the user. */
  public readonly isFpaEdited = Subject.create(false);

  /** Whether this leg's fpa and speed constraint are editable. */
  public readonly isFpaSpeedEditable = Subject.create(this.isApproachRunwayLeg === false);

  // Other

  /** The vertical flight phase. */
  public readonly vnavPhase = Subject.create(VerticalFlightPhase.Descent);

  /** Whether to show CLIMB for the fpa. */
  public readonly showClimbFpa = MappedSubject.create(
    ([phase, isAltitudeDesignated, isAltitudeEditable]) => {
      return phase === VerticalFlightPhase.Climb && isAltitudeDesignated && isAltitudeEditable;
    },
    this.vnavPhase,
    this.isAltitudeDesignated,
    this.isAltitudeEditable
  );

  /** The initial DTK of the leg. Magnetic. */
  public readonly initialDtk = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  /** Whether there is a 90 degree or more turn between this leg and the leg immediately prior */
  public readonly isLargeTurn = Subject.create(false);

  /** The leg course, rounded, and with 0 as 360. */
  public readonly courseRounded = Math.round(this.leg.leg.course) === 0 ? 360 : Math.round(this.leg.leg.course);

  /** The leg's total distance, not cut short by ingress/egress turn radii. Changes when active leg. */
  public readonly distance = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** The cumulative distance up to the end of this leg. */
  public readonly distanceCumulative = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  /** The estimated fuel remaining at the end of the leg. */
  public readonly fuelRemaining = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN));

  private readonly _grossWeight = MappedSubject.create(
    ([bow, fuel, paxNum, paxWeight, cargo]): number =>
      bow + fuel.asUnit(UnitType.POUND) + ((paxNum ?? 0) * paxWeight) + (cargo ?? 0),
    this.perfPlanRepository.getActivePlan().basicOperatingWeight,
    this.fuelRemaining,
    this.perfPlanRepository.getActivePlan().paxNumber,
    this.settings.getSetting('passengerWeightLbs'),
    this.perfPlanRepository.getActivePlan().cargoWeight,
  );

  public readonly grossWeight = NumberUnitSubject.create(UnitType.POUND.createNumber(NaN));

  /** Estimated time Enroute of the leg, in seconds duration. How long it will take to fly the leg. */
  public readonly estimatedTimeEnroute = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  /** Cumulative ETE. How long it would take from the current position to the end of this leg. */
  public readonly estimatedTimeEnrouteCumulative = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  /** Estimated Time of Arrival of the leg, in UTC milliseconds from midnight. */
  public readonly estimatedTimeOfArrival = Subject.create(NaN);

  /** TODO: This leg's wind speed. */
  public readonly wind = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  /** TODO: This leg's temperature */
  public readonly temperature = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));

  /** TODO: This leg's international standard atmosphere */
  public readonly isa = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(NaN));

  public readonly latLon: GeoPointSubject;

  private readonly subs = [] as Subscription[];

  /**
   * Creates a new leg data object.
   * @param leg The leg definition.
   * @param segment The containing segment.
   * @param segmentData The containing segment data. Not needed for random direct to.
   * @param planIndex The index of the flight plan that this leg belongs to.
   * @param store The flight plan store.
   * @param plan The flight plan that this leg exists in.
   * @param globalLegIndex The global leg index.
   * @param perfPlanRepository The performance plan repository.
   * @param settings The settings manager.
   * @param speedPredictions The active flight plan speed predictions
   * @param isDirectToRandom Whether this leg is for a direct to random.
   */
  public constructor(
    public readonly leg: LegDefinition,
    public readonly segment: FlightPlanSegment,
    public readonly segmentData: FlightPlanSegmentData | undefined,
    public readonly planIndex: number,
    private readonly store: FlightPlanStore,
    public readonly plan: FlightPlan,
    globalLegIndex: number,
    public readonly perfPlanRepository: PerformancePlanRepository<Epic2PerformancePlan>,
    public readonly settings: UserSettingManager<MfdAliasedUserSettingTypes>,
    private readonly speedPredictions?: Epic2SpeedPredictions,
    public readonly isDirectToRandom = false,
  ) {
    this.subs.push(this.isDtoLeg.sub(() => this.updateAltitudeVisibility()));

    this.updateLegPosition(globalLegIndex);
    this.handleLegChanged(this.leg);

    this.subs.push(this.isBehindActiveLeg.sub(this.updateAltitudes));
    this.subs.push(this.altitude1.sub(this.updateAltitudes));
    this.subs.push(this.altitude2.sub(this.updateAltitudes, true));

    this.latLon = GeoPointSubject.create(new GeoPoint(
      leg.leg.lat ?? leg.calculated?.endLat ?? NaN,
      leg.leg.lon ?? leg.calculated?.endLon ?? NaN,
    ));

    this._grossWeight.pipe(this.grossWeight);
  }

  /**
   * Update leg based on it's global leg index.
   * We avoid storing indexes to avoid stale indexes.
   * @param globalLegIndex The global leg index of the leg.
   */
  public updateLegPosition(globalLegIndex: number): void {
    this.globalLegIndex.set(globalLegIndex);
    this.segmentLegIndex.set(this.segment.legs.indexOf(this.leg));
    this.isFirstLegInPlan.set(globalLegIndex === 0);
    this.updateAltitudeVisibility(globalLegIndex);
    this._isLastLegInSegment.set(this.segmentLegIndex.get() === this.segment.legs.length - 1);
    this.handleSpeedData();
  }

  /** Handles the leg speed data */
  private handleSpeedData(): void {
    if (this.speedPredictions) {
      const index = this.globalLegIndex.get();
      Wait.awaitCondition(() => this.leg.leg === this.speedPredictions?.records[index]?.leg.leg).then(() => {
        const record = this.speedPredictions?.records[index];
        if (record) {
          if (this._speed) {
            this._speed.destroy();
          }

          this._speed = MappedSubject.create(([predictedSpeed, constrainedSpeed, isConstraint]) => {
            if (isConstraint) {
              return constrainedSpeed ?? 0;
            } else {
              return predictedSpeed ?? 0;
            }
          }, record.predictedSpeed, record.constrainedSpeed, record.isConstraint);

          this._speed.sub((spd) => this.speed.set(spd), true);
        }
      });
    } else {
      this.speed.set(this.leg.verticalData.speedDesc === SpeedRestrictionType.Unused && this.leg.verticalData.speed <= 0 ? NaN : this.leg.verticalData.speed);
    }
  }

  /**
   * Updates the altitude visibility and editability.
   * @param globalLegIndex The global leg index of the leg.
   */
  private updateAltitudeVisibility(globalLegIndex?: number): void {
    globalLegIndex ??= this.plan.getLegIndexFromLeg(this.leg);

    if (globalLegIndex < 0) {
      return;
    }

    // TODO
    // this.isAltitudeEditable.set(Epic2FmsUtils.isAltitudeEditable(this.plan, this.leg, this.isAdvancedVnav));
    // this.isAltitudeVisible.set(Epic2FmsUtils.isAltitudeVisible(this.plan, this.leg, this.isAdvancedVnav, this.isAltitudeEditable.get()));
  }

  /** Updates the altitude display subjects. */
  private readonly updateAltitudes = (): void => {
    if (this.isBehindActiveLeg.get()) {
      this.altitude1Display.set(NaN);
      this.altitude2Display.set(NaN);
    } else {
      this.altitude1Display.set(this.altitude1.get());
      this.altitude2Display.set(this.altitude2.get());
    }
  };

  /**
   * Handles the leg changed event. Effectively when the vertical data object on the leg was modified.
   * @param leg The leg definition.
   */
  public handleLegChanged(leg: LegDefinition): void {
    this.vnavPhase.set(leg.verticalData.phase);

    // Altitude constraint
    this.updateLegListDataAltitudeStuffFromVerticalData();

    // Speed constraint
    // const publishedSpeedUnit = SpeedUnit.IAS;
    // const publishedSpeed = leg.leg.speedRestriction <= 0 ? NaN : leg.leg.speedRestriction;
    // const publishedSpeedDesc = Epic2FmsUtils.getPublishedSpeedDescBasedOnSegment(publishedSpeed, this.segment.segmentType);
    // const isSpeedEdited = leg.verticalData.speedUnit !== publishedSpeedUnit
    //   || leg.verticalData.speedDesc !== publishedSpeedDesc
    //   || (leg.verticalData.speed !== publishedSpeed && !isNaN(leg.verticalData.speed) && !isNaN(publishedSpeed));

    this.speedDesc.set(leg.verticalData.speedDesc);
    // this.speed.set()
    // this.speed.set(leg.verticalData.speed <= 0 ? NaN : leg.verticalData.speed);
    // this.speedUnit.set(leg.verticalData.speedUnit);
    // this.isSpeedEdited.set(leg.verticalData.speedDesc !== SpeedRestrictionType.Unused && isSpeedEdited);

    // FPA
    this.fpa.set(leg.verticalData.fpa ?? NaN);
    this.isFpaEdited.set(leg.verticalData.fpa !== undefined);
  }

  /**
   * Updates a leg list data item's altitude info from the leg's vertical data object.
   */
  public updateLegListDataAltitudeStuffFromVerticalData(): void {
    const leg = this.leg;

    if (!this.leg.verticalData) {
      return;
    }

    // Altitude constraint
    const isDesignatedAltitudeConstraint = leg.verticalData.altDesc !== AltitudeRestrictionType.Unused;

    this.isAltitudeDesignated.set(isDesignatedAltitudeConstraint);

    if (isDesignatedAltitudeConstraint) {
      this.altDesc.set(leg.verticalData.altDesc);
      this.altitude1.set(leg.verticalData.altitude1, UnitType.METER);
      this.altitude2.set(leg.verticalData.altitude2, UnitType.METER);
      this.isAltitudeEdited.set(this.isAltitudeConstraintEdited());
    } else {
      this.altDesc.set(AltitudeRestrictionType.Unused);
      this.altitude1.set(NaN, UnitType.METER);
      this.altitude2.set(NaN, UnitType.METER);
      this.isAltitudeEdited.set(false);
    }

    this._isAltitudeTempCompensated.set(leg.verticalData.isAltitude1TempCompensated || leg.verticalData.isAltitude2TempCompensated);
  }

  /**
   * Determines if the altitude constraint should be considered edited.
   * @returns Whether the constraint should be considered edited.
   */
  private isAltitudeConstraintEdited(): boolean {
    const leg = this.leg;
    const publishedAltDesc = leg.leg.altDesc;
    const constraintAltDesc = leg.verticalData.altDesc;
    const altitude1Feet = Math.round(UnitType.METER.convertTo(leg.verticalData.altitude1, UnitType.FOOT));
    const altitude2Feet = Math.round(UnitType.METER.convertTo(leg.verticalData.altitude2, UnitType.FOOT));
    const altitude1FeetPublished = Math.round(UnitType.METER.convertTo(leg.leg.altitude1, UnitType.FOOT));
    const altitude2FeetPublished = Math.round(UnitType.METER.convertTo(leg.leg.altitude2, UnitType.FOOT));

    return constraintAltDesc !== publishedAltDesc
      || altitude1Feet !== altitude1FeetPublished
      || altitude2Feet !== altitude2FeetPublished;
  }

  /** Call when this leg is removed from the plan. */
  public destroy(): void {
    this.isDtoLeg.destroy();
    this.isFirstLegInSegment.destroy();
    this.subs.forEach(x => x.destroy());
  }
}
