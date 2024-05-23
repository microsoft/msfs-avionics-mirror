import { UiInteractionEvent } from './UiInteraction';

/**
 * A mapper of H events to {@link UiInteractionEvent|UiInteractionEvents}.
 */
export class UiInteractionMapper {
  private static readonly MAP: Partial<Record<string, UiInteractionEvent>> = {
    'NRST_Push': UiInteractionEvent.NrstPress,
    'DirectTo_Push': UiInteractionEvent.DirectToPress,
    'Menu_Push': UiInteractionEvent.MenuPress,
    'Back_Push': UiInteractionEvent.BackPress,
    'Knob_Outer_L_INC': UiInteractionEvent.LeftKnobOuterInc,
    'Knob_Outer_L_DEC': UiInteractionEvent.LeftKnobOuterDec,
    'Knob_Inner_L_INC': UiInteractionEvent.LeftKnobInnerInc,
    'Knob_Inner_L_DEC': UiInteractionEvent.LeftKnobInnerDec,
    'Knob_Inner_L_PUSH': UiInteractionEvent.LeftKnobPress,
    'Knob_Inner_L_PUSH_LONG': UiInteractionEvent.LeftKnobPressLong,
    'Knob_Outer_R_INC': UiInteractionEvent.RightKnobOuterInc,
    'Knob_Outer_R_DEC': UiInteractionEvent.RightKnobOuterDec,
    'Knob_Inner_R_INC': UiInteractionEvent.RightKnobInnerInc,
    'Knob_Inner_R_DEC': UiInteractionEvent.RightKnobInnerDec,
    'Knob_Inner_R_PUSH': UiInteractionEvent.RightKnobPress,
    'Knob_Inner_R_PUSH_LONG': UiInteractionEvent.RightKnobPressLong,
  };

  private readonly hEventPrefix: string;

  /**
   * Creates a new instance of UiInteractionMapper.
   * @param instrumentIndex The index of the instrument for which this mapper maps events.
   */
  public constructor(private readonly instrumentIndex: number) {
    if (instrumentIndex <= 0 || !Number.isInteger(instrumentIndex)) {
      throw new Error(`UiInteractionMapper: invalid instrument index: ${instrumentIndex}`);
    }

    this.hEventPrefix = `AS3X_Touch_${instrumentIndex}_`;
  }

  /**
   * Maps an H event to its corresponding {@link UiInteractionEvent}.
   * @param hEvent The H event to map.
   * @returns The {@link UiInteractionEvent} corresponding to the specified H event, or `undefined` if the H event
   * could not be mapped.
   */
  public mapEvent(hEvent: string): UiInteractionEvent | undefined {
    if (!hEvent.startsWith(this.hEventPrefix)) {
      return undefined;
    }

    return UiInteractionMapper.MAP[hEvent.substring(this.hEventPrefix.length)];
  }
}