import { MESSAGE_LEVEL, MESSAGE_TARGET, MessageDefinition } from './MessageDefinition';
import { OperatingMessage } from './OperatingMessage';

/** Enumeration for WT21 FMS Messages */
export enum FMS_MESSAGE_ID {
  RESET_INITIAL_POS,
  INITIALIZE_POSITION,
  NO_FLIGHT_PLAN,
  FPLN_DISCONTINUITY,
  DISCONTINUITY,
  CHECK_SPEED,
  CHK_ALT_SEL,
  HOLD,
  TOD,
  OCEANIC,
  TERM,
  LV_TERM,
  LPV_TERM,
  APPR,
  GPS_APPR,
  LV_APPR,
  LPV_APPR,
  SEQ_INHB,
  LOC_WILL_BE_TUNED,
  CHECK_LOC_TUNING,
  PATH_BELOW_AC,
  NO_VPATH_VECTORS,
  NO_VPATH_CONDITION,
  NO_VPATH_PILOT_CMD,
  NO_VPATH_TAE,
  NO_VPATH_XTK,
  NO_VPATH_THIS_LEG,
  CHECK_FPLN_ALT,
  DECELERATE,
  UNABLE_NEXT_ALT,
  KBINPUTACTIVE,
  DLFPLNLOADED,
  DLFPLNFAIL,
}

/** A class that contains the WT21 message definitions */
export class MessageDefinitions {
  private static _definitions: Map<FMS_MESSAGE_ID, OperatingMessage> = new Map([
    [FMS_MESSAGE_ID.RESET_INITIAL_POS, new OperatingMessage(
      [new MessageDefinition('RESET INITIAL POS', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.Yellow, 60)],
    [FMS_MESSAGE_ID.INITIALIZE_POSITION, new OperatingMessage(
      [new MessageDefinition('INITIALIZE POSITION', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.Yellow, 50)],
    [FMS_MESSAGE_ID.NO_FLIGHT_PLAN, new OperatingMessage(
      [new MessageDefinition('NO FLIGHT PLAN', MESSAGE_TARGET.FMC),
      new MessageDefinition('NO FLIGHT PLAN', MESSAGE_TARGET.MAP_MID)], MESSAGE_LEVEL.White, 20)],
    [FMS_MESSAGE_ID.FPLN_DISCONTINUITY, new OperatingMessage(
      [new MessageDefinition('FPLN DISCONTINUITY', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.Yellow, 90)],
    [FMS_MESSAGE_ID.DISCONTINUITY, new OperatingMessage(
      [new MessageDefinition('DISCONTINUITY', MESSAGE_TARGET.MAP_MID)], MESSAGE_LEVEL.White, 90)],
    [FMS_MESSAGE_ID.CHECK_SPEED, new OperatingMessage(
      [new MessageDefinition('CHECK SPEED', MESSAGE_TARGET.FMC),
      new MessageDefinition('SPD', MESSAGE_TARGET.PFD_BOT)], MESSAGE_LEVEL.Yellow, 80)],
    [FMS_MESSAGE_ID.CHK_ALT_SEL, new OperatingMessage(
      [new MessageDefinition('CHECK ALT SEL', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 70)],
    [FMS_MESSAGE_ID.HOLD, new OperatingMessage(
      [new MessageDefinition('HOLD', MESSAGE_TARGET.PFD_BOT)], MESSAGE_LEVEL.White, 70)],
    [FMS_MESSAGE_ID.TOD, new OperatingMessage(
      [new MessageDefinition('TOD', MESSAGE_TARGET.PFD_BOT)], MESSAGE_LEVEL.White, 50)],
    [FMS_MESSAGE_ID.OCEANIC, new OperatingMessage(
      [new MessageDefinition('OCEANIC', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 49)],
    [FMS_MESSAGE_ID.TERM, new OperatingMessage(
      [new MessageDefinition('TERM', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 50)],
    [FMS_MESSAGE_ID.LV_TERM, new OperatingMessage(
      [new MessageDefinition('L/V TERM', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 51)],
    [FMS_MESSAGE_ID.LPV_TERM, new OperatingMessage(
      [new MessageDefinition('LPV TERM', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 52)],
    [FMS_MESSAGE_ID.APPR, new OperatingMessage(
      [new MessageDefinition('APPR', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 53)],
    [FMS_MESSAGE_ID.GPS_APPR, new OperatingMessage(
      [new MessageDefinition('GPS APPR', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 54)],
    [FMS_MESSAGE_ID.LV_APPR, new OperatingMessage(
      [new MessageDefinition('L/V APPR', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 55)],
    [FMS_MESSAGE_ID.LPV_APPR, new OperatingMessage(
      [new MessageDefinition('LPV APPR', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 56)],
    [FMS_MESSAGE_ID.SEQ_INHB, new OperatingMessage(
      [new MessageDefinition('SEQ INHB', MESSAGE_TARGET.PFD_TOP)], MESSAGE_LEVEL.White, 60)],
    [FMS_MESSAGE_ID.LOC_WILL_BE_TUNED, new OperatingMessage(
      [new MessageDefinition('LOC WILL BE TUNED', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 50)],
    [FMS_MESSAGE_ID.CHECK_LOC_TUNING, new OperatingMessage(
      [new MessageDefinition('CHECK LOC TUNING', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 75)],
    [FMS_MESSAGE_ID.PATH_BELOW_AC, new OperatingMessage(
      [new MessageDefinition('PATH BELOW A/C', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 61)],
    [FMS_MESSAGE_ID.NO_VPATH_VECTORS, new OperatingMessage(
      [new MessageDefinition('NO VPATH-VECTORS', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 62)],
    [FMS_MESSAGE_ID.NO_VPATH_CONDITION, new OperatingMessage(
      [new MessageDefinition('NO VPATH CONDITION', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 63)],
    [FMS_MESSAGE_ID.NO_VPATH_PILOT_CMD, new OperatingMessage(
      [new MessageDefinition('NO VPATH-PILOT CMD', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 64)],
    [FMS_MESSAGE_ID.NO_VPATH_TAE, new OperatingMessage(
      [new MessageDefinition('NO VPATH-TAE', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 65)],
    [FMS_MESSAGE_ID.NO_VPATH_XTK, new OperatingMessage(
      [new MessageDefinition('NO VPATH-XTK', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 66)],
    [FMS_MESSAGE_ID.NO_VPATH_THIS_LEG, new OperatingMessage(
      [new MessageDefinition('NO VPATH THIS LEG', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 67)],
    [FMS_MESSAGE_ID.CHECK_FPLN_ALT, new OperatingMessage(
      [new MessageDefinition('CHECK FPLN ALT', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 68)],
    [FMS_MESSAGE_ID.DECELERATE, new OperatingMessage(
      [new MessageDefinition('DECELERATE', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 69)],
    [FMS_MESSAGE_ID.UNABLE_NEXT_ALT, new OperatingMessage(
      [new MessageDefinition('UNABLE NEXT ALT', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.Yellow, 70)],
    [FMS_MESSAGE_ID.KBINPUTACTIVE, new OperatingMessage(
      [new MessageDefinition('KB INPUT ACTIVE', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 999)],
    [FMS_MESSAGE_ID.DLFPLNLOADED, new OperatingMessage(
      [new MessageDefinition('DL FPLN LOADED', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.White, 999)],
    [FMS_MESSAGE_ID.DLFPLNFAIL, new OperatingMessage(
      [new MessageDefinition('DL FPLN FAILED', MESSAGE_TARGET.FMC)], MESSAGE_LEVEL.Yellow, 999)],
  ]);


  /**
   * Gets the message definitions.
   * @returns Returns the message definitions.
   */
  public static get definitions(): Map<FMS_MESSAGE_ID, OperatingMessage> {
    return this._definitions;
  }
}
