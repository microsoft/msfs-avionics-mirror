/**
 * Interaction events used by the UI system.
 */
export enum UiInteractionEvent {
  SingleKnobOuterInc = 'SingleKnobOuterInc',
  SingleKnobOuterDec = 'SingleKnobOuterDec',
  SingleKnobInnerInc = 'SingleKnobInnerInc',
  SingleKnobInnerDec = 'SingleKnobInnerDec',
  SingleKnobPress = 'SingleKnobPress',
  SingleKnobPressLong = 'SingleKnobPressLong',
  LeftKnobOuterInc = 'LeftKnobOuterInc',
  LeftKnobOuterDec = 'LeftKnobOuterDec',
  LeftKnobInnerInc = 'LeftKnobInnerInc',
  LeftKnobInnerDec = 'LeftKnobInnerDec',
  LeftKnobPress = 'LeftKnobPress',
  LeftKnobPressLong = 'LeftKnobPressLong',
  RightKnobOuterInc = 'RightKnobOuterInc',
  RightKnobOuterDec = 'RightKnobOuterDec',
  RightKnobInnerInc = 'RightKnobInnerInc',
  RightKnobInnerDec = 'RightKnobInnerDec',
  RightKnobPress = 'RightKnobPress',
  RightKnobPressLong = 'RightKnobPressLong',
  NrstPress = 'NrstPress',
  DirectToPress = 'DirectToPress',
  MenuPress = 'MenuPress',
  BackPress = 'BackPress',
  BackPressLong = 'BackPressLong'
}

/**
 * Interaction events originating from the bezel rotary knobs.
 */
export type UiKnobInteractionEvent
  = UiInteractionEvent.SingleKnobOuterInc
  | UiInteractionEvent.SingleKnobOuterDec
  | UiInteractionEvent.SingleKnobInnerInc
  | UiInteractionEvent.SingleKnobInnerDec
  | UiInteractionEvent.SingleKnobPress
  | UiInteractionEvent.SingleKnobPressLong
  | UiInteractionEvent.LeftKnobOuterInc
  | UiInteractionEvent.LeftKnobOuterDec
  | UiInteractionEvent.LeftKnobInnerInc
  | UiInteractionEvent.LeftKnobInnerDec
  | UiInteractionEvent.LeftKnobPress
  | UiInteractionEvent.LeftKnobPressLong
  | UiInteractionEvent.RightKnobOuterInc
  | UiInteractionEvent.RightKnobOuterDec
  | UiInteractionEvent.RightKnobInnerInc
  | UiInteractionEvent.RightKnobInnerDec
  | UiInteractionEvent.RightKnobPress
  | UiInteractionEvent.RightKnobPressLong;

/**
 * Bezel rotary knob turn interaction events.
 */
export type UiKnobTurnInteractionEvent
  = UiInteractionEvent.SingleKnobOuterInc
  | UiInteractionEvent.SingleKnobOuterDec
  | UiInteractionEvent.SingleKnobInnerInc
  | UiInteractionEvent.SingleKnobInnerDec
  | UiInteractionEvent.LeftKnobOuterInc
  | UiInteractionEvent.LeftKnobOuterDec
  | UiInteractionEvent.LeftKnobInnerInc
  | UiInteractionEvent.LeftKnobInnerDec
  | UiInteractionEvent.RightKnobOuterInc
  | UiInteractionEvent.RightKnobOuterDec
  | UiInteractionEvent.RightKnobInnerInc
  | UiInteractionEvent.RightKnobInnerDec;

/**
 * Bezel rotary knob push interaction events.
 */
export type UiKnobPushInteractionEvent
  = UiInteractionEvent.SingleKnobPress
  | UiInteractionEvent.SingleKnobPressLong
  | UiInteractionEvent.LeftKnobPress
  | UiInteractionEvent.LeftKnobPressLong
  | UiInteractionEvent.RightKnobPress
  | UiInteractionEvent.RightKnobPressLong;

/**
 * A handler which can respond to and optionally handle instances of {@link UiInteractionEvent}.
 */
export interface UiInteractionHandler {
  /**
   * Handles a {@link UiInteractionEvent}.
   * @param event The event to handle.
   * @returns Whether the event was handled.
   */
  onUiInteractionEvent(event: UiInteractionEvent): boolean
}