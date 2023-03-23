/**
 * Interaction events available on the GNS430/530 bezel.
 */
export enum InteractionEvent {
  LeftKnobPush = 'LeftKnobPush',
  LeftInnerDec = 'LeftInnerDec',
  LeftInnerInc = 'LeftInnerInc',
  LeftOuterDec = 'LeftOuterDec',
  LeftOuterInc = 'LeftOuterInc',
  RightKnobPush = 'RightKnobPush',
  RightInnerDec = 'RightInnerDec',
  RightInnerInc = 'RightInnerInc',
  RightOuterDec = 'RightOuterDec',
  RightOuterInc = 'RightOuterInc',
  CLRLong = 'ClrLong',
  CLR = 'Clr',
  ENT = 'Ent',
  MENU = 'Menu',
  DirectTo = 'DirectTo',
  RangeDecrease = 'RangeDecrease',
  RangeIncrease = 'RangeIncrease',
  PROC = 'Proc',
  VNAV = 'Vnav',
  FPL = 'Fpl',
  MSG = 'Msg',
  OBS = 'Obs',
  NavSwap = 'NavSwap',
  ComSwap = 'ComSwap',
  CDI = 'Cdi'
}

/**
 * A map of interaction event strings to the event enumeration.
 */
export const InteractionEventMap = new Map<string, InteractionEvent>([
  ['LeftSmallKnob_Push', InteractionEvent.LeftKnobPush],
  ['LeftSmallKnob_Left', InteractionEvent.LeftInnerDec],
  ['LeftSmallKnob_Right', InteractionEvent.LeftInnerInc],
  ['LeftLargeKnob_Left', InteractionEvent.LeftOuterDec],
  ['LeftLargeKnob_Right', InteractionEvent.LeftOuterInc],
  ['RightSmallKnob_Push', InteractionEvent.RightKnobPush],
  ['RightSmallKnob_Left', InteractionEvent.RightInnerDec],
  ['RightSmallKnob_Right', InteractionEvent.RightInnerInc],
  ['RightLargeKnob_Left', InteractionEvent.RightOuterDec],
  ['RightLargeKnob_Right', InteractionEvent.RightOuterInc],
  ['CLR_Push_Long', InteractionEvent.CLRLong],
  ['CLR_Push', InteractionEvent.CLR],
  ['ENT_Push', InteractionEvent.ENT],
  ['MENU_Push', InteractionEvent.MENU],
  ['DirectTo_Push', InteractionEvent.DirectTo],
  ['RNG_Zoom', InteractionEvent.RangeDecrease],
  ['RNG_Dezoom', InteractionEvent.RangeIncrease],
  ['PROC_Push', InteractionEvent.PROC],
  ['VNAV_Push', InteractionEvent.VNAV],
  ['FPL_Push', InteractionEvent.FPL],
  ['MSG_Push', InteractionEvent.MSG],
  ['OBS_Push', InteractionEvent.OBS],
  ['NAVSWAP_Push', InteractionEvent.NavSwap],
  ['COMSWAP_Push', InteractionEvent.ComSwap],
  ['CDI_Push', InteractionEvent.CDI]
]);