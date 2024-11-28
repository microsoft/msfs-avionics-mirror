import {
  BasicNavAngleSubject, BasicNavAngleUnit, Facility, LegDefinition, LegTurnDirection,
  NavAngleUnit, NumberUnitInterface,
  NumberUnitSubject, SimpleUnit, Subject, UnitFamily, UnitType,
} from '@microsoft/msfs-sdk';

/** The course direction for the hold. */
export enum HoldCourseDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
}

/** The leg mode for the hold. */
export enum HoldLegMode {
  Distance = 'Distance',
  Time = 'Time',
}

/**
 * Input data describing initialization options for defining a hold.
 */
export type HoldInput = {
  /** The selected plan index for the hold. */
  planIndex: number;

  /** The leg name. */
  legName: string;

  /** The magnetic hold inbound course, in degrees. */
  courseMagnetic: number;

  /** The fix facility to hold at. */
  facility: Facility;

  /** The existing hold leg if editing a hold. */
  existingHoldLeg?: LegDefinition;

  /** A HoldInfo object to use if info is available. */
  holdInfo?: HoldInfo,

  /**
   * Whether to allow editing for hold types that normally are not editable (HF and HA). Ignored if not editing an
   * existing hold. Defaults to `false`.
   */
  forceAllowEdit?: boolean;
}

/** {@link LegTurnDirection}, but only Left or Right. */
export type LeftOrRight = LegTurnDirection.Left | LegTurnDirection.Right;

/** A store for the GtcHoldPage. */
export class HoldStore {
  /** The input for the hold page. */
  public readonly input = Subject.create<HoldInput | undefined>(undefined);

  /** The course for the hold. */
  public readonly course = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  /** Whether or not the course is inbound or outbound. */
  public readonly holdCourseDirection = Subject.create(HoldCourseDirection.Inbound);

  /** Whether or not the hold is based on time or distance. */
  public readonly legMode = Subject.create(HoldLegMode.Time);

  /** The time that the hold legs should be. */
  public readonly legTime = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  /** The distance of the hold legs. */
  public readonly legDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  /** The direction of the hold. */
  public readonly turnDirection = Subject.create<LeftOrRight>(LegTurnDirection.Right);

  /** Whether this leg hold is editable. */
  public readonly isEditableHold = Subject.create(false);

  /** Whether this hold is existing and we are editing it. */
  public readonly isExistingHold = Subject.create(false);

  /** Whether the cancel button should be enabled. */
  public readonly isCancelButtonEnabled = Subject.create(false);

  /** The hold leg, or null if we are not editing a hold. */
  public readonly holdLeg = Subject.create<LegDefinition | null>(null);
}

/** The data needed to create a hold. */
export interface HoldInfo {
  /** The course direction. */
  readonly holdCourseDirection: HoldCourseDirection;
  /** The leg mode. */
  readonly legMode: HoldLegMode;
  /** The leg hold time. */
  readonly legTime: NumberUnitInterface<UnitFamily.Duration, SimpleUnit<UnitFamily.Duration>>;
  /** The leg hold distance. */
  readonly legDistance: NumberUnitInterface<UnitFamily.Distance, SimpleUnit<UnitFamily.Distance>>;
  /** The turn direction. */
  readonly turnDirection: LeftOrRight;
  /** The hold course. */
  readonly course: NumberUnitInterface<'navangle', NavAngleUnit>;
  /** The existing hold leg, if exists. */
  readonly existingHoldLeg?: LegDefinition;
}