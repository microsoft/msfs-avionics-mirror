import { Subscribable } from '@microsoft/msfs-sdk';

/**
 * G3X Touch bezel rotary knob groups.
 */
export enum UiKnobGroup {
  Single = 'Single',
  Left = 'Left',
  Right = 'Right'
}

/**
 * IDs for G3X Touch bezel rotary knobs.
 */
export enum UiKnobId {
  SingleOuter = 'SingleOuter',
  SingleInner = 'SingleInner',
  SingleInnerPush = 'SingleInnerPush',
  LeftOuter = 'LeftOuter',
  LeftInner = 'LeftInner',
  LeftInnerPush = 'LeftInnerPush',
  RightOuter = 'RightOuter',
  RightInner = 'RightInner',
  RightInnerPush = 'RightInnerPush'
}

/**
 * Mappings from G3X Touch bezel rotary knob IDs to the groups to which they belong.
 */
export type UiKnobIdGroupMap = {
  /** Single outer knob. */
  [UiKnobId.SingleOuter]: UiKnobGroup.Single;

  /** Single inner knob. */
  [UiKnobId.SingleInner]: UiKnobGroup.Single;

  /** Single inner push knob. */
  [UiKnobId.SingleInnerPush]: UiKnobGroup.Single;

  /** Left inner knob. */
  [UiKnobId.LeftOuter]: UiKnobGroup.Left;

  /** Left outer knob. */
  [UiKnobId.LeftInner]: UiKnobGroup.Left;

  /** Left inner push knob. */
  [UiKnobId.LeftInnerPush]: UiKnobGroup.Left;

  /** Right outer knob. */
  [UiKnobId.RightOuter]: UiKnobGroup.Right;

  /** Right inner knob. */
  [UiKnobId.RightInner]: UiKnobGroup.Right;

  /** Right inner push knob. */
  [UiKnobId.RightInnerPush]: UiKnobGroup.Right;
};

/**
 * IDs for outer G3X Touch bezel rotary knobs.
 */
export type UiOuterKnobId = UiKnobId.SingleOuter | UiKnobId.LeftOuter | UiKnobId.RightOuter;

/**
 * IDs for inner G3X Touch bezel rotary knobs.
 */
export type UiInnerKnobId = UiKnobId.SingleInner | UiKnobId.LeftInner | UiKnobId.RightInner
  | UiKnobId.SingleInnerPush | UiKnobId.LeftInnerPush | UiKnobId.RightInnerPush;

/**
 * IDs for G3X Touch bezel rotary knobs that can be turned.
 */
export type UiTurnKnobId = UiKnobId.SingleOuter | UiKnobId.SingleInner
  | UiKnobId.LeftOuter | UiKnobId.LeftInner
  | UiKnobId.RightOuter | UiKnobId.RightInner;

/**
 * IDs for G3X Touch bezel rotary knobs that can be pushed.
 */
export type UiPushKnobId = UiKnobId.SingleInnerPush | UiKnobId.LeftInnerPush | UiKnobId.RightInnerPush;

/**
 * Bitflags that represent the side(s) for which control of bezel rotary knob behavior is available.
 */
export enum UiKnobControlSide {
  None = 0,
  Left = 1 << 0,
  Right = 1 << 1,
  Both = Left + Right
}

/**
 * Requested label states for the bezel rotary knobs.
 */
export type UiKnobRequestedLabelState = ReadonlyMap<UiKnobId, string>;

/**
 * Label states for the bezel rotary knobs.
 */
export type UiKnobLabelState = Readonly<Record<UiKnobId, Subscribable<string>>>;