import { UiInteractionEvent, UiKnobInteractionEvent, UiKnobTurnInteractionEvent } from './UiInteraction';
import { UiKnobId } from './UiKnobTypes';

/**
 * A utility class for working with UI interaction events.
 */
export class UiInteractionUtils {
  public static readonly KNOB_EVENT_TO_KNOB_ID = {
    [UiInteractionEvent.SingleKnobOuterInc]: UiKnobId.SingleOuter,
    [UiInteractionEvent.SingleKnobOuterDec]: UiKnobId.SingleOuter,

    [UiInteractionEvent.SingleKnobInnerInc]: UiKnobId.SingleInner,
    [UiInteractionEvent.SingleKnobInnerDec]: UiKnobId.SingleInner,

    [UiInteractionEvent.SingleKnobPress]: UiKnobId.SingleInnerPush,
    [UiInteractionEvent.SingleKnobPressLong]: UiKnobId.SingleInnerPush,

    [UiInteractionEvent.LeftKnobOuterInc]: UiKnobId.LeftOuter,
    [UiInteractionEvent.LeftKnobOuterDec]: UiKnobId.LeftOuter,

    [UiInteractionEvent.LeftKnobInnerInc]: UiKnobId.LeftInner,
    [UiInteractionEvent.LeftKnobInnerDec]: UiKnobId.LeftInner,

    [UiInteractionEvent.LeftKnobPress]: UiKnobId.LeftInnerPush,
    [UiInteractionEvent.LeftKnobPressLong]: UiKnobId.LeftInnerPush,

    [UiInteractionEvent.RightKnobOuterInc]: UiKnobId.RightOuter,
    [UiInteractionEvent.RightKnobOuterDec]: UiKnobId.RightOuter,

    [UiInteractionEvent.RightKnobInnerInc]: UiKnobId.RightInner,
    [UiInteractionEvent.RightKnobInnerDec]: UiKnobId.RightInner,

    [UiInteractionEvent.RightKnobPress]: UiKnobId.RightInnerPush,
    [UiInteractionEvent.RightKnobPressLong]: UiKnobId.RightInnerPush,
  } as const;

  /**
   * Checks if an interaction event originated from a bezel rotary knob.
   * @param event The event to check.
   * @returns Whether the specified event originated from a bezel rotary knob.
   */
  public static isKnobEvent(event: UiInteractionEvent): event is UiKnobInteractionEvent {
    return (UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID as Partial<Record<UiInteractionEvent, UiKnobId>>)[event] !== undefined;
  }

  /**
   * Gets the turn direction for a bezel rotary knob turn event.
   * @param event The event for which to get the turn direction.
   * @returns The turn direction for the specified bezel rotary knob turn event.
   */
  public static getKnobTurnDirection(event: UiKnobTurnInteractionEvent): 1 | -1 {
    switch (event) {
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobOuterInc:
      case UiInteractionEvent.RightKnobInnerInc:
        return 1;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobOuterDec:
      case UiInteractionEvent.RightKnobInnerDec:
        return -1;
    }
  }
}